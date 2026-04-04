// =============================================================================
// HV6 Zone Controller — ESPHome Component Implementation
// =============================================================================
// Ported from lib/zone_controller/src/zone_controller.cpp
// Key changes:
//   - Reads temperatures from ESPHome sensor entities (not SensorManager)
//   - No WiFi/MQTT connectivity tracking (ESPHome handles that)
//   - Control algorithms and hydraulic balancing preserved 1:1
// =============================================================================

#include "hv6_zone_controller.h"
#include "esphome/core/log.h"
#include "esp_timer.h"
#include <algorithm>
#include <cmath>
#include <numeric>
#include <inttypes.h>

namespace hv6 {

static const char *const TAG = "hv6_zone_ctrl";
static constexpr float ALPHA_TOP = 10.8f;  // W/(m²·K) convective+radiative at floor

// =============================================================================
// ESPHome Lifecycle
// =============================================================================

void Hv6ZoneController::setup() {
  snapshot_mutex_ = xSemaphoreCreateMutex();
  if (snapshot_mutex_ == nullptr) {
    ESP_LOGE(TAG, "Failed to create snapshot mutex");
    this->mark_failed();
    return;
  }

  adj_queue_ = xQueueCreate(ADJ_QUEUE_LEN, sizeof(SetpointAdjustment));
  if (adj_queue_ == nullptr) {
    ESP_LOGE(TAG, "Failed to create adjustment queue");
    this->mark_failed();
    return;
  }

  setpoint_offsets_.fill(0.0f);
  balance_factors_.fill(1.0f);
  last_valid_temp_ms_.fill(0);
  for (uint8_t i = 0; i < NUM_ZONES; i++) {
    if (requested_setpoints_[i] < 5.0f || requested_setpoints_[i] > 35.0f)
      requested_setpoints_[i] = FALLBACK_SETPOINT_C;
  }

  // Initialize algorithms
  if (config_store_) {
    const auto &cfg = config_store_->get_config();
    for (uint8_t i = 0; i < NUM_ZONES; i++) {
      algorithms_[i].set_algorithm(cfg.zones[i].algorithm);
      algorithms_[i].set_pid_params(cfg.pid);
      if (requested_setpoints_[i] < 5.0f || requested_setpoints_[i] > 35.0f)
        requested_setpoints_[i] = cfg.zones[i].setpoint_c;
    }
  }

  recalculate_balance_factors_();

  // Start zone control task
  BaseType_t ok = xTaskCreatePinnedToCore(
      task_func_, "hv6_zone", STACK_SIZE, this, PRIORITY, &task_handle_, CORE);
  if (ok != pdPASS) {
    ESP_LOGE(TAG, "Failed to create zone task");
    this->mark_failed();
    return;
  }

  ESP_LOGI(TAG, "Zone controller initialized (%" PRIu32 "ms cycle)", cycle_interval_ms_);
}

void Hv6ZoneController::dump_config() {
  ESP_LOGCONFIG(TAG, "HV6 Zone Controller:");
  ESP_LOGCONFIG(TAG, "  Cycle interval: %" PRIu32 "ms", cycle_interval_ms_);
  if (config_store_) {
    auto cfg = config_store_->get_config();
    ESP_LOGCONFIG(TAG, "  Flow probe: %d", cfg.probes.manifold_flow_probe + 1);
    ESP_LOGCONFIG(TAG, "  Return probe: %d", cfg.probes.manifold_return_probe + 1);
    for (uint8_t i = 0; i < NUM_ZONES; i++) {
      ESP_LOGCONFIG(TAG, "  Zone %d probe: %d", i + 1, cfg.probes.zone_return_probe[i] + 1);
    }
  }
  for (uint8_t i = 0; i < MAX_PROBES; i++) {
    ESP_LOGCONFIG(TAG, "  Probe %d: %s", i + 1, probe_sensors_[i] ? "sensor assigned" : "no sensor");
  }
}

// =============================================================================
// Public API (thread-safe)
// =============================================================================

ZoneSnapshot Hv6ZoneController::get_zone_snapshot(uint8_t zone) const {
  if (zone >= NUM_ZONES)
    return {};
  if (snapshot_mutex_ == nullptr)
    return snapshots_[zone];
  xSemaphoreTake(snapshot_mutex_, portMAX_DELAY);
  ZoneSnapshot copy = snapshots_[zone];
  xSemaphoreGive(snapshot_mutex_);
  return copy;
}

SystemSnapshot Hv6ZoneController::get_system_snapshot() const {
  SystemSnapshot sys = {};

  if (snapshot_mutex_ == nullptr)
    return sys;

  xSemaphoreTake(snapshot_mutex_, portMAX_DELAY);
  float sum_valve = 0.0f;
  for (uint8_t i = 0; i < NUM_ZONES; i++) {
    sys.zones[i] = snapshots_[i];
    sum_valve += snapshots_[i].valve_position_pct;
    if (config_store_) {
      auto cfg = config_store_->get_config();
      if (cfg.zones[i].enabled && snapshots_[i].state != ZoneState::UNKNOWN)
        sys.active_zones++;
    }
  }
  xSemaphoreGive(snapshot_mutex_);

  if (sys.active_zones > 0)
    sys.avg_valve_pct = sum_valve / static_cast<float>(sys.active_zones);

  sys.manifold_flow_temp_c = read_manifold_flow_();
  sys.manifold_return_temp_c = read_manifold_return_();
  sys.uptime_s = static_cast<uint32_t>(esp_timer_get_time() / 1000000);
  sys.free_heap = esp_get_free_heap_size();
  sys.cycle_count = cycle_count_;
  sys.wifi_connected = true;  // ESPHome manages WiFi

  return sys;
}

float Hv6ZoneController::get_zone_temperature(uint8_t zone) const {
  return read_zone_temperature_(zone);
}

float Hv6ZoneController::get_manifold_flow_temperature() const {
  return read_manifold_flow_();
}

float Hv6ZoneController::get_manifold_return_temperature() const {
  return read_manifold_return_();
}

float Hv6ZoneController::get_valve_position(uint8_t zone) const {
  if (zone >= NUM_ZONES)
    return 0.0f;
  if (snapshot_mutex_ == nullptr)
    return snapshots_[zone].valve_position_pct;
  xSemaphoreTake(snapshot_mutex_, portMAX_DELAY);
  float pos = snapshots_[zone].valve_position_pct;
  xSemaphoreGive(snapshot_mutex_);
  return pos;
}

void Hv6ZoneController::set_zone_setpoint(uint8_t zone, float setpoint_c) {
  if (zone >= NUM_ZONES)
    return;
  setpoint_c = std::clamp(setpoint_c, 5.0f, 35.0f);

  requested_setpoints_[zone] = setpoint_c;

  if (snapshot_mutex_ != nullptr && xSemaphoreTake(snapshot_mutex_, pdMS_TO_TICKS(50)) == pdTRUE) {
    snapshots_[zone].setpoint_c = setpoint_c;
    xSemaphoreGive(snapshot_mutex_);
  }
}

bool Hv6ZoneController::apply_setpoint_adjustment(uint8_t zone, float offset_c) {
  if (zone >= NUM_ZONES)
    return false;
  if (adj_queue_ == nullptr)
    return false;
  last_mqtt_adjustment_ms_ = static_cast<uint32_t>(esp_timer_get_time() / 1000);
  SetpointAdjustment adj = {zone, offset_c};
  return xQueueSend(adj_queue_, &adj, pdMS_TO_TICKS(50)) == pdTRUE;
}

void Hv6ZoneController::set_zone_enabled(uint8_t zone, bool enabled) {
  if (zone >= NUM_ZONES || !config_store_)
    return;

  auto cfg = config_store_->get_config();
  if (cfg.zones[zone].enabled == enabled)
    return;

  cfg.zones[zone].enabled = enabled;
  config_store_->update_zone(zone, cfg.zones[zone]);

  ESP_LOGI(TAG, "Zone %d %s", zone + 1, enabled ? "enabled" : "disabled");

  if (!enabled && valve_controller_) {
    // Actively close the valve when disabling a zone
    valve_controller_->request_position(zone, 0.0f);
  }

  balance_dirty_ = true;
}

bool Hv6ZoneController::is_zone_enabled(uint8_t zone) const {
  if (zone >= NUM_ZONES || !config_store_)
    return false;
  return config_store_->get_config().zones[zone].enabled;
}

void Hv6ZoneController::set_zone_probe(uint8_t zone, int8_t probe) {
  if (zone >= NUM_ZONES || !config_store_)
    return;
  if (probe < 0 || probe >= MAX_PROBES)
    return;

  auto cfg = config_store_->get_config();
  if (cfg.probes.zone_return_probe[zone] == probe)
    return;
  cfg.probes.zone_return_probe[zone] = probe;
  config_store_->update_probes(cfg.probes);
  ESP_LOGI(TAG, "Zone %d now uses probe %d", zone + 1, probe + 1);
}

int8_t Hv6ZoneController::get_zone_probe(uint8_t zone) const {
  if (zone >= NUM_ZONES || !config_store_)
    return PROBE_UNASSIGNED;
  return config_store_->get_config().probes.zone_return_probe[zone];
}

void Hv6ZoneController::set_manifold_flow_probe(int8_t probe) {
  if (!config_store_)
    return;
  if (probe < 0 || probe >= MAX_PROBES)
    return;

  auto cfg = config_store_->get_config();
  if (cfg.probes.manifold_flow_probe == probe)
    return;
  cfg.probes.manifold_flow_probe = probe;
  config_store_->update_probes(cfg.probes);
  ESP_LOGI(TAG, "Manifold flow now uses probe %d", probe + 1);
}

int8_t Hv6ZoneController::get_manifold_flow_probe() const {
  if (!config_store_)
    return PROBE_UNASSIGNED;
  return config_store_->get_config().probes.manifold_flow_probe;
}

void Hv6ZoneController::set_manifold_return_probe(int8_t probe) {
  if (!config_store_)
    return;
  if (probe < 0 || probe >= MAX_PROBES)
    return;

  auto cfg = config_store_->get_config();
  if (cfg.probes.manifold_return_probe == probe)
    return;
  cfg.probes.manifold_return_probe = probe;
  config_store_->update_probes(cfg.probes);
  ESP_LOGI(TAG, "Manifold return now uses probe %d", probe + 1);
}

int8_t Hv6ZoneController::get_manifold_return_probe() const {
  if (!config_store_)
    return PROBE_UNASSIGNED;
  return config_store_->get_config().probes.manifold_return_probe;
}

// =============================================================================
// FreeRTOS Task
// =============================================================================

void Hv6ZoneController::task_func_(void *arg) {
  static_cast<Hv6ZoneController *>(arg)->run_();
}

void Hv6ZoneController::run_() {
  TickType_t last_wake = xTaskGetTickCount();

  while (true) {
    SetpointAdjustment adj;
    while (xQueueReceive(adj_queue_, &adj, 0) == pdTRUE) {
      if (adj.zone < NUM_ZONES) {
        setpoint_offsets_[adj.zone] = adj.offset_c;
        ESP_LOGI(TAG, "Zone %d offset: %.2f°C", adj.zone + 1, adj.offset_c);
      }
    }

    check_failsafes_();
    run_cycle_();
    cycle_count_++;

    vTaskDelayUntil(&last_wake, pdMS_TO_TICKS(cycle_interval_ms_));
  }
}

// =============================================================================
// Core Control Cycle
// =============================================================================

void Hv6ZoneController::run_cycle_() {
  if (!config_store_ || !valve_controller_)
    return;

  const auto cfg = config_store_->get_config();

  if (balance_dirty_) {
    recalculate_balance_factors_();
    balance_dirty_ = false;
  }

  std::array<float, NUM_ZONES> target_positions;
  target_positions.fill(0.0f);

  for (uint8_t i = 0; i < NUM_ZONES; i++) {
    if (!cfg.zones[i].enabled) {
      target_positions[i] = 0.0f;
      xSemaphoreTake(snapshot_mutex_, portMAX_DELAY);
      snapshots_[i].state = ZoneState::UNKNOWN;
      snapshots_[i].valve_position_pct = 0.0f;
      xSemaphoreGive(snapshot_mutex_);
      continue;
    }

    float temp = read_zone_temperature_(i);
    uint32_t now_ms = static_cast<uint32_t>(esp_timer_get_time() / 1000);

    if (!std::isnan(temp))
      last_valid_temp_ms_[i] = now_ms;

    float setpoint = requested_setpoints_[i] + setpoint_offsets_[i];

    algorithms_[i].set_algorithm(cfg.zones[i].algorithm);

    ZoneState state = classify_zone_(temp, setpoint, cfg.control.comfort_band_c);

    float position = 0.0f;
    bool was_overheated = false;

    switch (state) {
      case ZoneState::OVERHEATED:
        position = 0.0f;
        was_overheated = true;
        break;
      case ZoneState::SATISFIED:
        position = cfg.control.maintenance_base_pct;
        break;
      case ZoneState::DEMAND:
        position = compute_raw_position_(i, temp, setpoint);
        position += cfg.control.demand_boost_pct;
        position = std::clamp(position, 0.0f, cfg.zones[i].max_opening_pct);
        break;
      case ZoneState::UNKNOWN:
        position = cfg.control.maintenance_base_pct;
        break;
    }

    position = apply_hydraulic_balance_(i, position);
    target_positions[i] = position;

    xSemaphoreTake(snapshot_mutex_, portMAX_DELAY);
    snapshots_[i].temperature_c = temp;
    snapshots_[i].setpoint_c = setpoint;
    snapshots_[i].valve_position_pct = position;
    snapshots_[i].state = state;
    snapshots_[i].hydraulic_factor = balance_factors_[i];
    snapshots_[i].was_overheated = was_overheated;
    xSemaphoreGive(snapshot_mutex_);
  }

  enforce_minimum_total_opening_(target_positions);

  for (uint8_t i = 0; i < NUM_ZONES; i++) {
    float current_pos = valve_controller_->get_position(i);
    float diff = std::fabs(target_positions[i] - current_pos);

    if (diff >= cfg.control.min_movement_pct)
      valve_controller_->request_position(i, target_positions[i]);
  }
}

// =============================================================================
// Failsafe Logic
// =============================================================================

void Hv6ZoneController::check_failsafes_() {
  if (!config_store_ || !valve_controller_)
    return;

  uint32_t now_ms = static_cast<uint32_t>(esp_timer_get_time() / 1000);

  // MQTT failsafe
  if (last_mqtt_adjustment_ms_ > 0) {
    uint32_t elapsed = now_ms - last_mqtt_adjustment_ms_;
    if (elapsed > MQTT_FALLBACK_MS) {
      bool any_reset = false;
      for (uint8_t i = 0; i < NUM_ZONES; i++) {
        if (setpoint_offsets_[i] != 0.0f) {
          setpoint_offsets_[i] = 0.0f;
          any_reset = true;
        }
      }
      if (any_reset)
        ESP_LOGW(TAG, "MQTT failsafe: clearing offsets (no data 30min)");
    }
  }

  // Temperature sensor failsafe
  const auto cfg = config_store_->get_config();
  for (uint8_t i = 0; i < NUM_ZONES; i++) {
    if (!cfg.zones[i].enabled)
      continue;
    if (last_valid_temp_ms_[i] == 0)
      continue;

    uint32_t elapsed = now_ms - last_valid_temp_ms_[i];
    if (elapsed > TEMP_FAILSAFE_MS) {
      float temp = read_zone_temperature_(i);
      if (std::isnan(temp)) {
        valve_controller_->request_position(i, cfg.control.maintenance_base_pct);
        ESP_LOGW(TAG, "Zone %d temp failsafe (%" PRIu32 "s)", i + 1, elapsed / 1000);
      }
    }
  }
}

// =============================================================================
// Sensor Reading
// =============================================================================

float Hv6ZoneController::read_zone_temperature_(uint8_t zone) const {
  if (zone >= NUM_ZONES || !config_store_)
    return NAN;

  int8_t probe = config_store_->get_config().probes.zone_return_probe[zone];
  if (probe < 0 || probe >= MAX_PROBES || probe_sensors_[probe] == nullptr)
    return NAN;
  if (!probe_sensors_[probe]->has_state())
    return NAN;
  return probe_sensors_[probe]->state;
}

float Hv6ZoneController::read_manifold_flow_() const {
  if (!config_store_)
    return NAN;

  int8_t probe = config_store_->get_config().probes.manifold_flow_probe;
  if (probe >= 0 && probe < MAX_PROBES && probe_sensors_[probe] && probe_sensors_[probe]->has_state())
    return probe_sensors_[probe]->state;
  return NAN;
}

float Hv6ZoneController::read_manifold_return_() const {
  if (!config_store_)
    return NAN;

  int8_t probe = config_store_->get_config().probes.manifold_return_probe;
  if (probe >= 0 && probe < MAX_PROBES && probe_sensors_[probe] && probe_sensors_[probe]->has_state())
    return probe_sensors_[probe]->state;
  return NAN;
}

// =============================================================================
// Zone Classification + Control
// =============================================================================

ZoneState Hv6ZoneController::classify_zone_(float temp, float setpoint, float comfort_band) const {
  if (std::isnan(temp))
    return ZoneState::UNKNOWN;
  if (temp > setpoint + comfort_band)
    return ZoneState::OVERHEATED;
  if (temp >= setpoint - comfort_band)
    return ZoneState::SATISFIED;
  return ZoneState::DEMAND;
}

float Hv6ZoneController::compute_raw_position_(uint8_t zone, float temp, float setpoint) {
  if (!config_store_)
    return 0.0f;
  const auto cfg = config_store_->get_config();
  return algorithms_[zone].calculate(temp, setpoint, cfg.control, cfg.zones[zone]);
}

// =============================================================================
// Hydraulic Balancing
// =============================================================================

void Hv6ZoneController::recalculate_balance_factors_() {
  if (!config_store_)
    return;
  const auto cfg = config_store_->get_config();

  calculate_hydraulic_outputs_();

  float max_flow = 0.0f;
  std::array<float, NUM_ZONES> flows;
  flows.fill(0.0f);

  xSemaphoreTake(snapshot_mutex_, portMAX_DELAY);
  for (uint8_t i = 0; i < NUM_ZONES; i++) {
    if (!cfg.zones[i].enabled) {
      balance_factors_[i] = 0.0f;
      continue;
    }
    flows[i] = snapshots_[i].flow_lh;
    if (flows[i] > max_flow)
      max_flow = flows[i];
  }
  xSemaphoreGive(snapshot_mutex_);

  if (max_flow > 0.0f) {
    for (uint8_t i = 0; i < NUM_ZONES; i++) {
      if (!cfg.zones[i].enabled)
        continue;
      balance_factors_[i] = flows[i] / max_flow;
    }
  }

  ESP_LOGI(TAG, "Hydraulic factors: [%.2f, %.2f, %.2f, %.2f, %.2f, %.2f]",
           balance_factors_[0], balance_factors_[1], balance_factors_[2],
           balance_factors_[3], balance_factors_[4], balance_factors_[5]);
}

float Hv6ZoneController::apply_hydraulic_balance_(uint8_t zone, float raw_position) {
  if (balance_factors_[zone] <= 0.0f)
    return 0.0f;
  return raw_position * balance_factors_[zone];
}

void Hv6ZoneController::enforce_minimum_total_opening_(std::array<float, NUM_ZONES> &positions) {
  if (!config_store_)
    return;
  const auto cfg = config_store_->get_config();
  float min_total = cfg.control.min_valve_opening_pct;

  uint8_t enabled_count = 0;
  float total = 0.0f;
  for (uint8_t i = 0; i < NUM_ZONES; i++) {
    if (cfg.zones[i].enabled) {
      total += positions[i];
      enabled_count++;
    }
  }
  if (enabled_count == 0)
    return;

  if (total < min_total) {
    float deficit = min_total - total;
    float per_zone = deficit / static_cast<float>(enabled_count);
    for (uint8_t i = 0; i < NUM_ZONES; i++) {
      if (cfg.zones[i].enabled)
        positions[i] += per_zone;
    }
    ESP_LOGD(TAG, "Min opening enforced: +%.1f%% per zone", per_zone);
  }
}

// =============================================================================
// Hydraulic Model (Danfoss)
// =============================================================================

void Hv6ZoneController::calculate_hydraulic_outputs_() {
  if (!config_store_)
    return;
  const auto cfg = config_store_->get_config();

  xSemaphoreTake(snapshot_mutex_, portMAX_DELAY);
  for (uint8_t i = 0; i < NUM_ZONES; i++) {
    if (!cfg.zones[i].enabled) {
      snapshots_[i].heat_output_w = 0.0f;
      snapshots_[i].pipe_length_m = 0.0f;
      snapshots_[i].flow_lh = 0.0f;
      snapshots_[i].floor_surface_temp_c = 0.0f;
      snapshots_[i].pipe_length_warning = false;
      continue;
    }

    const auto &zc = cfg.zones[i];

    float Q = zc.area_m2 * zc.heat_loss_w_m2;
    snapshots_[i].heat_output_w = Q;

    float L = calculate_pipe_length_m_(zc.area_m2, zc.pipe_spacing_mm, zc.supply_pipe_length_m);
    snapshots_[i].pipe_length_m = L;
    snapshots_[i].pipe_length_warning = (L > pipe_max_length_m(zc.pipe_type));

    float delta = zc.cooling_delta_c;
    if (delta < 1.0f)
      delta = 5.0f;
    float V = Q / (delta * 1.163f);
    snapshots_[i].flow_lh = V;

    float lambda;
    switch (zc.floor_type) {
      case FloorType::TILE: lambda = 1.30f; break;
      case FloorType::PARQUET: lambda = 0.13f; break;
      case FloorType::OAK: lambda = 0.18f; break;
      case FloorType::CARPET: lambda = 0.09f; break;
      default: lambda = 1.30f; break;
    }
    if (lambda < 0.01f)
      lambda = 0.01f;
    float R_cover = (zc.floor_cover_thickness_mm / 1000.0f) / lambda;
    float theta_room = zc.setpoint_c;
    float theta_floor = theta_room + zc.heat_loss_w_m2 * (R_cover + 1.0f / ALPHA_TOP);
    snapshots_[i].floor_surface_temp_c = theta_floor;
  }
  xSemaphoreGive(snapshot_mutex_);
}

float Hv6ZoneController::calculate_pipe_length_m_(float area_m2, float spacing_mm, float supply_pipe_m) {
  float spacing_m = spacing_mm / 1000.0f;
  if (spacing_m <= 0.0f)
    spacing_m = 0.15f;
  float zone_pipe = area_m2 / spacing_m;
  return zone_pipe + 2.0f * supply_pipe_m + 2.0f;
}

float Hv6ZoneController::pipe_correction_factor_(PipeType type) {
  float inner_d = pipe_inner_diameter_mm(type);
  float baseline = 12.0f;
  float factor = std::sqrt(baseline / inner_d);
  return std::clamp(factor, 0.85f, 1.35f);
}

float Hv6ZoneController::floor_correction_factor_(FloorType type, float cover_thickness_mm) {
  float lambda;
  switch (type) {
    case FloorType::TILE: lambda = 1.30f; break;
    case FloorType::PARQUET: lambda = 0.13f; break;
    case FloorType::OAK: lambda = 0.18f; break;
    case FloorType::CARPET: lambda = 0.09f; break;
    default: lambda = 1.30f; break;
  }
  float thickness_m = cover_thickness_mm / 1000.0f;
  if (thickness_m <= 0.0f)
    thickness_m = 0.015f;
  float resistance = thickness_m / lambda;
  float baseline_r = 0.015f / 1.30f;
  float factor = 1.0f + (resistance - baseline_r) * 5.0f;
  return std::clamp(factor, 0.7f, 1.5f);
}

}  // namespace hv6
