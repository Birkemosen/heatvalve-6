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

#ifdef USE_MQTT
#include "esphome/components/mqtt/mqtt_client.h"
#include "esphome/components/json/json_util.h"
#endif

namespace hv6 {

static const char *const TAG = "hv6_zone_ctrl";
static constexpr float ALPHA_TOP = 10.8f;  // W/(m²·K) convective+radiative at floor
static constexpr uint32_t MQTT_STARTUP_QUERY_DELAY_MS = 10000;
static constexpr uint32_t MQTT_STARTUP_QUERY_TICK_MS = 1000;
static constexpr uint32_t MQTT_STARTUP_QUERY_BACKOFF_BASE_MS = 30000;
static constexpr uint8_t MQTT_STARTUP_QUERY_MAX_RETRIES = 5;

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
  mqtt_temp_last_ms_.fill(0);
  preheat_advance_c_.fill(0.0f);
  preheat_episode_active_.fill(false);
  preheat_episode_min_temp_c_.fill(NAN);
  preheat_episode_max_temp_c_.fill(NAN);
  preheat_episode_setpoint_c_.fill(0.0f);
  for (uint8_t i = 0; i < NUM_ZONES; i++) {
    mqtt_temperatures_[i] = NAN;
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

  setup_mqtt_subscription_();

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

bool Hv6ZoneController::try_get_system_snapshot(SystemSnapshot *out, uint32_t timeout_ms) const {
  if (out == nullptr || snapshot_mutex_ == nullptr)
    return false;

  if (xSemaphoreTake(snapshot_mutex_, pdMS_TO_TICKS(timeout_ms)) != pdTRUE)
    return false;

  SystemSnapshot sys = {};
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

  // Flow temperature modulation requests (only relevant with modulating heat source)
  if (config_store_) {
    auto cfg = config_store_->get_config();
    if (cfg.balancing.modulating_heat_source) {
      sys.flow_temp_increase_requested = (sys.avg_valve_pct >= cfg.balancing.flow_increase_threshold_pct);
      sys.flow_temp_decrease_requested = (sys.avg_valve_pct <= cfg.balancing.flow_decrease_threshold_pct);
    }
  }

  sys.manifold_flow_temp_c = read_manifold_flow_();
  sys.manifold_return_temp_c = read_manifold_return_();
  sys.uptime_s = static_cast<uint32_t>(esp_timer_get_time() / 1000000);
  sys.free_heap = esp_get_free_heap_size();
  sys.cycle_count = cycle_count_;
  sys.controller_state = controller_state_;
  sys.system_condition_state = system_condition_state_;
  sys.wifi_connected = true;  // ESPHome manages WiFi

  *out = sys;
  return true;
}

SystemSnapshot Hv6ZoneController::get_system_snapshot() const {
  SystemSnapshot sys = {};

  if (try_get_system_snapshot(&sys))
    return sys;

  ESP_LOGW(TAG, "System snapshot skipped: snapshot mutex busy");
  sys.manifold_flow_temp_c = read_manifold_flow_();
  sys.manifold_return_temp_c = read_manifold_return_();
  sys.uptime_s = static_cast<uint32_t>(esp_timer_get_time() / 1000000);
  sys.free_heap = esp_get_free_heap_size();
  sys.cycle_count = cycle_count_;
  sys.controller_state = controller_state_;
  sys.system_condition_state = system_condition_state_;
  sys.wifi_connected = true;

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

float Hv6ZoneController::get_zone_preheat_advance(uint8_t zone) const {
  if (zone >= NUM_ZONES)
    return 0.0f;
  return std::clamp(preheat_advance_c_[zone], 0.0f, SIMPLE_PREHEAT_MAX_ADVANCE_C);
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

  if (config_store_) {
    auto zone_cfg = config_store_->get_zone_config(zone);
    if (std::fabs(zone_cfg.setpoint_c - setpoint_c) > 0.01f) {
      zone_cfg.setpoint_c = setpoint_c;
      config_store_->update_zone(zone, zone_cfg);
    }
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

void Hv6ZoneController::set_control_algorithm(ControlAlgorithm algorithm) {
  if (!config_store_)
    return;

  auto cfg = config_store_->get_config();
  bool changed = false;
  for (uint8_t zone = 0; zone < NUM_ZONES; zone++) {
    if (cfg.zones[zone].algorithm == algorithm)
      continue;
    cfg.zones[zone].algorithm = algorithm;
    config_store_->update_zone(zone, cfg.zones[zone]);
    algorithms_[zone].set_algorithm(algorithm);
    changed = true;
  }
  if (!changed)
    return;

  const char *algo_name = "Tanh";
  switch (algorithm) {
    case ControlAlgorithm::LINEAR:
      algo_name = "Linear";
      break;
    case ControlAlgorithm::PID:
      algo_name = "PID";
      break;
    case ControlAlgorithm::ADAPTIVE:
      algo_name = "Adaptive";
      break;
    case ControlAlgorithm::TANH:
    default:
      algo_name = "Tanh";
      break;
  }

  ESP_LOGI(TAG, "Control algorithm set to %s for all zones", algo_name);
}

void Hv6ZoneController::set_simple_preheat_enabled(bool enabled) {
  if (!config_store_)
    return;
  auto cfg = config_store_->get_config();
  if (cfg.control.simple_preheat_enabled == enabled)
    return;
  cfg.control.simple_preheat_enabled = enabled;
  config_store_->update_control(cfg.control);

  if (!enabled) {
    for (uint8_t i = 0; i < NUM_ZONES; i++)
      reset_simple_preheat_(i);
  }

  ESP_LOGI(TAG, "Simple preheat: %s", enabled ? "ON" : "OFF");
}

bool Hv6ZoneController::is_simple_preheat_enabled() const {
  if (!config_store_)
    return true;
  return config_store_->get_config().control.simple_preheat_enabled;
}

ControlAlgorithm Hv6ZoneController::get_control_algorithm() const {
  if (!config_store_)
    return ControlAlgorithm::TANH;
  return config_store_->get_config().zones[0].algorithm;
}

void Hv6ZoneController::set_zone_probe(uint8_t zone, int8_t probe) {
  if (zone >= NUM_ZONES || !config_store_)
    return;
  if (probe != PROBE_UNASSIGNED && (probe < 0 || probe >= MAX_PROBES))
    return;

  auto cfg = config_store_->get_config();
  if (cfg.probes.zone_return_probe[zone] == probe)
    return;
  cfg.probes.zone_return_probe[zone] = probe;
  config_store_->update_probes(cfg.probes);
  if (probe == PROBE_UNASSIGNED) {
    ESP_LOGI(TAG, "Zone %d return probe disabled (None)", zone + 1);
  } else {
    ESP_LOGI(TAG, "Zone %d now uses probe %d", zone + 1, probe + 1);
  }
}

int8_t Hv6ZoneController::get_zone_probe(uint8_t zone) const {
  if (zone >= NUM_ZONES || !config_store_)
    return PROBE_UNASSIGNED;
  int8_t probe = config_store_->get_config().probes.zone_return_probe[zone];
  return (probe >= 0 && probe < MAX_PROBES) ? probe : PROBE_UNASSIGNED;
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
  int8_t probe = config_store_->get_config().probes.manifold_flow_probe;
  return (probe >= 0 && probe < MAX_PROBES) ? probe : 0;
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
  int8_t probe = config_store_->get_config().probes.manifold_return_probe;
  return (probe >= 0 && probe < MAX_PROBES) ? probe : 0;
}

// =============================================================================
// MQTT External Temperature
// =============================================================================

void Hv6ZoneController::set_zone_mqtt_temperature(uint8_t zone, float temp_c) {
  if (zone >= NUM_ZONES)
    return;
  mqtt_temperatures_[zone] = temp_c;
  mqtt_temp_last_ms_[zone] = static_cast<uint32_t>(esp_timer_get_time() / 1000);
  ESP_LOGD(TAG, "Zone %d MQTT temp: %.1f°C", zone + 1, temp_c);
}

float Hv6ZoneController::get_zone_mqtt_temperature(uint8_t zone) const {
  if (zone >= NUM_ZONES)
    return NAN;
  // Stale check: 60 minutes
  uint32_t now_ms = static_cast<uint32_t>(esp_timer_get_time() / 1000);
  if (mqtt_temp_last_ms_[zone] > 0 && (now_ms - mqtt_temp_last_ms_[zone]) > MQTT_STALE_MS)
    return NAN;
  return mqtt_temperatures_[zone];
}

void Hv6ZoneController::set_zone_temp_source(uint8_t zone, TempSource source) {
  if (zone >= NUM_ZONES || !config_store_)
    return;
  auto cfg = config_store_->get_config();
  if (cfg.mqtt_temp.zone_temp_source[zone] == source)
    return;
  cfg.mqtt_temp.zone_temp_source[zone] = source;
  config_store_->update_mqtt_temp(cfg.mqtt_temp);
  ESP_LOGI(TAG, "Zone %d temp source: %s", zone + 1,
           source == TempSource::MQTT_EXTERNAL ? "MQTT" :
           source == TempSource::BLE_SENSOR ? "BLE" : "Local Probe");
}

TempSource Hv6ZoneController::get_zone_temp_source(uint8_t zone) const {
  if (zone >= NUM_ZONES || !config_store_)
    return TempSource::LOCAL_PROBE;
  return config_store_->get_config().mqtt_temp.zone_temp_source[zone];
}

void Hv6ZoneController::set_zone_mqtt_device(uint8_t zone, const std::string &name) {
  if (zone >= NUM_ZONES || !config_store_)
    return;
  auto cfg = config_store_->get_config();
  strncpy(cfg.mqtt_temp.zone_mqtt_device[zone], name.c_str(), MQTT_DEVICE_NAME_LEN - 1);
  cfg.mqtt_temp.zone_mqtt_device[zone][MQTT_DEVICE_NAME_LEN - 1] = '\0';
  config_store_->update_mqtt_temp(cfg.mqtt_temp);
  ESP_LOGI(TAG, "Zone %d MQTT device: '%s'", zone + 1, cfg.mqtt_temp.zone_mqtt_device[zone]);

  // Request current temperature from the newly configured device
  if (!name.empty()) {
    request_zigbee_temperature_(name);
  }
}

std::string Hv6ZoneController::get_zone_mqtt_device(uint8_t zone) const {
  if (zone >= NUM_ZONES || !config_store_)
    return "";
  return std::string(config_store_->get_config().mqtt_temp.zone_mqtt_device[zone]);
}

void Hv6ZoneController::set_zone_ble_mac(uint8_t zone, const std::string &mac) {
  if (zone >= NUM_ZONES || !config_store_)
    return;
  auto cfg = config_store_->get_config();
  strncpy(cfg.mqtt_temp.zone_ble_mac[zone], mac.c_str(), BLE_MAC_LEN - 1);
  cfg.mqtt_temp.zone_ble_mac[zone][BLE_MAC_LEN - 1] = '\0';
  config_store_->update_mqtt_temp(cfg.mqtt_temp);
  ESP_LOGI(TAG, "Zone %d BLE MAC: '%s'", zone + 1, cfg.mqtt_temp.zone_ble_mac[zone]);
}

std::string Hv6ZoneController::get_zone_ble_mac(uint8_t zone) const {
  if (zone >= NUM_ZONES || !config_store_)
    return "";
  return std::string(config_store_->get_config().mqtt_temp.zone_ble_mac[zone]);
}

void Hv6ZoneController::set_zone_area_m2(uint8_t zone, float area_m2) {
  if (zone >= NUM_ZONES || !config_store_)
    return;
  area_m2 = std::clamp(area_m2, 1.0f, 120.0f);
  auto cfg = config_store_->get_config();
  if (std::fabs(cfg.zones[zone].area_m2 - area_m2) < 0.01f)
    return;
  cfg.zones[zone].area_m2 = area_m2;
  config_store_->update_zone(zone, cfg.zones[zone]);
  balance_dirty_ = true;
  ESP_LOGI(TAG, "Zone %d area: %.1f m2", zone + 1, area_m2);
}

float Hv6ZoneController::get_zone_area_m2(uint8_t zone) const {
  if (zone >= NUM_ZONES || !config_store_)
    return 0.0f;
  return config_store_->get_config().zones[zone].area_m2;
}

void Hv6ZoneController::set_zone_pipe_spacing_mm(uint8_t zone, float spacing_mm) {
  if (zone >= NUM_ZONES || !config_store_)
    return;
  spacing_mm = std::clamp(spacing_mm, 50.0f, 500.0f);
  auto cfg = config_store_->get_config();
  if (std::fabs(cfg.zones[zone].pipe_spacing_mm - spacing_mm) < 0.01f)
    return;
  cfg.zones[zone].pipe_spacing_mm = spacing_mm;
  config_store_->update_zone(zone, cfg.zones[zone]);
  balance_dirty_ = true;
  ESP_LOGI(TAG, "Zone %d pipe spacing: %.0f mm", zone + 1, spacing_mm);
}

float Hv6ZoneController::get_zone_pipe_spacing_mm(uint8_t zone) const {
  if (zone >= NUM_ZONES || !config_store_)
    return 0.0f;
  return config_store_->get_config().zones[zone].pipe_spacing_mm;
}

void Hv6ZoneController::set_zone_pipe_type(uint8_t zone, PipeType type) {
  if (zone >= NUM_ZONES || !config_store_)
    return;
  auto cfg = config_store_->get_config();
  if (cfg.zones[zone].pipe_type == type)
    return;
  cfg.zones[zone].pipe_type = type;
  config_store_->update_zone(zone, cfg.zones[zone]);
  balance_dirty_ = true;
  ESP_LOGI(TAG, "Zone %d pipe type updated", zone + 1);
}

PipeType Hv6ZoneController::get_zone_pipe_type(uint8_t zone) const {
  if (zone >= NUM_ZONES || !config_store_)
    return PipeType::PEX_16X2;
  return config_store_->get_config().zones[zone].pipe_type;
}

void Hv6ZoneController::set_zone_exterior_walls(uint8_t zone, uint8_t walls) {
  if (zone >= NUM_ZONES || !config_store_)
    return;
  auto cfg = config_store_->get_config();
  cfg.zones[zone].exterior_walls = walls & 0x0F;  // Only lower 4 bits valid
  config_store_->update_zone(zone, cfg.zones[zone]);
  ESP_LOGI(TAG, "Zone %d exterior walls: 0x%02X", zone + 1, cfg.zones[zone].exterior_walls);
}

uint8_t Hv6ZoneController::get_zone_exterior_walls(uint8_t zone) const {
  if (zone >= NUM_ZONES || !config_store_)
    return 0;
  return config_store_->get_config().zones[zone].exterior_walls;
}

// =============================================================================
// Probe Role
// =============================================================================

void Hv6ZoneController::set_zone_probe_role(uint8_t zone, ProbeRole role) {
  if (zone >= NUM_ZONES || !config_store_)
    return;
  auto cfg = config_store_->get_config();
  if (cfg.zones[zone].probe_role == role)
    return;
  cfg.zones[zone].probe_role = role;
  config_store_->update_zone(zone, cfg.zones[zone]);
  balance_dirty_ = true;
  ESP_LOGI(TAG, "Zone %d probe role: %s", zone + 1,
           role == ProbeRole::RETURN_WATER ? "return water" : "room temperature");
}

ProbeRole Hv6ZoneController::get_zone_probe_role(uint8_t zone) const {
  if (zone >= NUM_ZONES || !config_store_)
    return ProbeRole::ROOM_TEMPERATURE;
  return config_store_->get_config().zones[zone].probe_role;
}

// =============================================================================
// Zone Sync
// =============================================================================

void Hv6ZoneController::set_zone_sync(uint8_t zone, int8_t target_zone) {
  if (zone >= NUM_ZONES || !config_store_)
    return;
  if (target_zone >= static_cast<int8_t>(NUM_ZONES))
    return;
  // Prevent self-sync
  if (target_zone == static_cast<int8_t>(zone))
    target_zone = -1;
  // Prevent circular sync (if target is already synced to this zone)
  if (target_zone >= 0) {
    auto cfg = config_store_->get_config();
    if (cfg.zones[target_zone].sync_to_zone == static_cast<int8_t>(zone)) {
      ESP_LOGW(TAG, "Zone %d sync rejected: Zone %d already syncs to Zone %d",
               zone + 1, target_zone + 1, zone + 1);
      return;
    }
  }
  auto cfg = config_store_->get_config();
  if (cfg.zones[zone].sync_to_zone == target_zone)
    return;
  cfg.zones[zone].sync_to_zone = target_zone;
  config_store_->update_zone(zone, cfg.zones[zone]);
  ESP_LOGI(TAG, "Zone %d sync: %s", zone + 1,
           target_zone >= 0 ? ("Zone " + std::to_string(target_zone + 1)).c_str() : "None");
}

int8_t Hv6ZoneController::get_zone_sync(uint8_t zone) const {
  if (zone >= NUM_ZONES || !config_store_)
    return -1;
  return config_store_->get_config().zones[zone].sync_to_zone;
}

// =============================================================================
// Balancing Configuration
// =============================================================================

void Hv6ZoneController::set_dynamic_balancing_enabled(bool enabled) {
  if (!config_store_)
    return;
  auto cfg = config_store_->get_config();
  if (cfg.balancing.dynamic_balancing_enabled == enabled)
    return;
  cfg.balancing.dynamic_balancing_enabled = enabled;
  config_store_->update_balancing(cfg.balancing);
  balance_dirty_ = true;
  ESP_LOGI(TAG, "Dynamic balancing: %s", enabled ? "ON" : "OFF");
}

bool Hv6ZoneController::is_dynamic_balancing_enabled() const {
  if (!config_store_)
    return false;
  return config_store_->get_config().balancing.dynamic_balancing_enabled;
}

void Hv6ZoneController::set_modulating_heat_source(bool enabled) {
  if (!config_store_)
    return;
  auto cfg = config_store_->get_config();
  if (cfg.balancing.modulating_heat_source == enabled)
    return;
  cfg.balancing.modulating_heat_source = enabled;
  config_store_->update_balancing(cfg.balancing);
  ESP_LOGI(TAG, "Modulating heat source: %s", enabled ? "YES" : "NO");
}

bool Hv6ZoneController::has_modulating_heat_source() const {
  if (!config_store_)
    return false;
  return config_store_->get_config().balancing.modulating_heat_source;
}

void Hv6ZoneController::set_minimum_flow_pct(float pct) {
  if (!config_store_)
    return;
  pct = std::clamp(pct, 0.0f, 50.0f);
  auto cfg = config_store_->get_config();
  cfg.balancing.minimum_flow_pct = pct;
  config_store_->update_balancing(cfg.balancing);
  ESP_LOGI(TAG, "Minimum flow: %.0f%%", pct);
}

float Hv6ZoneController::get_minimum_flow_pct() const {
  if (!config_store_)
    return 15.0f;
  return config_store_->get_config().balancing.minimum_flow_pct;
}

void Hv6ZoneController::set_flow_increase_threshold(float pct) {
  if (!config_store_)
    return;
  pct = std::clamp(pct, 20.0f, 100.0f);
  auto cfg = config_store_->get_config();
  cfg.balancing.flow_increase_threshold_pct = pct;
  config_store_->update_balancing(cfg.balancing);
  ESP_LOGI(TAG, "Flow increase threshold: %.0f%%", pct);
}

float Hv6ZoneController::get_flow_increase_threshold() const {
  if (!config_store_)
    return 80.0f;
  return config_store_->get_config().balancing.flow_increase_threshold_pct;
}

void Hv6ZoneController::set_flow_decrease_threshold(float pct) {
  if (!config_store_)
    return;
  pct = std::clamp(pct, 5.0f, 80.0f);
  auto cfg = config_store_->get_config();
  cfg.balancing.flow_decrease_threshold_pct = pct;
  config_store_->update_balancing(cfg.balancing);
  ESP_LOGI(TAG, "Flow decrease threshold: %.0f%%", pct);
}

float Hv6ZoneController::get_flow_decrease_threshold() const {
  if (!config_store_)
    return 30.0f;
  return config_store_->get_config().balancing.flow_decrease_threshold_pct;
}

void Hv6ZoneController::set_target_delta_t(float delta_c) {
  if (!config_store_)
    return;
  delta_c = std::clamp(delta_c, 1.0f, 15.0f);
  auto cfg = config_store_->get_config();
  cfg.balancing.target_delta_t_c = delta_c;
  config_store_->update_balancing(cfg.balancing);
  balance_dirty_ = true;
  ESP_LOGI(TAG, "Target ΔT: %.1f°C", delta_c);
}

float Hv6ZoneController::get_target_delta_t() const {
  if (!config_store_)
    return 5.0f;
  return config_store_->get_config().balancing.target_delta_t_c;
}

// -----------------------------------------------------------------------------
// MQTT Broker Configuration (NVS-persisted overrides)
// -----------------------------------------------------------------------------

void Hv6ZoneController::set_mqtt_broker(const std::string &broker) {
  if (!config_store_)
    return;
  auto cfg = config_store_->get_config();
  strncpy(cfg.mqtt_broker.broker, broker.c_str(), MQTT_BROKER_LEN - 1);
  cfg.mqtt_broker.broker[MQTT_BROKER_LEN - 1] = '\0';
  config_store_->update_mqtt_broker(cfg.mqtt_broker);
  ESP_LOGI(TAG, "MQTT broker set: '%s' (reboot to apply)", cfg.mqtt_broker.broker);
}

std::string Hv6ZoneController::get_mqtt_broker() const {
  if (!config_store_)
    return "";
  return std::string(config_store_->get_config().mqtt_broker.broker);
}

void Hv6ZoneController::set_mqtt_port(uint16_t port) {
  if (!config_store_)
    return;
  auto cfg = config_store_->get_config();
  cfg.mqtt_broker.port = port;
  config_store_->update_mqtt_broker(cfg.mqtt_broker);
  ESP_LOGI(TAG, "MQTT port set: %u (reboot to apply)", port);
}

uint16_t Hv6ZoneController::get_mqtt_port() const {
  if (!config_store_)
    return 0;
  return config_store_->get_config().mqtt_broker.port;
}

void Hv6ZoneController::set_mqtt_username(const std::string &username) {
  if (!config_store_)
    return;
  auto cfg = config_store_->get_config();
  strncpy(cfg.mqtt_broker.username, username.c_str(), MQTT_CRED_LEN - 1);
  cfg.mqtt_broker.username[MQTT_CRED_LEN - 1] = '\0';
  config_store_->update_mqtt_broker(cfg.mqtt_broker);
  ESP_LOGI(TAG, "MQTT username set (reboot to apply)");
}

std::string Hv6ZoneController::get_mqtt_username() const {
  if (!config_store_)
    return "";
  return std::string(config_store_->get_config().mqtt_broker.username);
}

void Hv6ZoneController::set_mqtt_password(const std::string &password) {
  if (!config_store_)
    return;
  auto cfg = config_store_->get_config();
  strncpy(cfg.mqtt_broker.password, password.c_str(), MQTT_CRED_LEN - 1);
  cfg.mqtt_broker.password[MQTT_CRED_LEN - 1] = '\0';
  config_store_->update_mqtt_broker(cfg.mqtt_broker);
  ESP_LOGI(TAG, "MQTT password set (reboot to apply)");
}

std::string Hv6ZoneController::get_mqtt_password() const {
  if (!config_store_)
    return "";
  return std::string(config_store_->get_config().mqtt_broker.password);
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
    update_controller_state_();
    update_zone_display_states_();
    update_system_condition_state_();
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

  // Manual mode: skip automatic valve positioning entirely.
  // Manual commands (open/close/calibrate via UI buttons) still work
  // because they call valve_controller_->request_position() directly.
  if (manual_mode_ || DEVELOPMENT_MANUAL_ONLY)
    return;

  // If drivers are disabled, keep computing snapshots but don't enqueue
  // movement commands that will be rejected by the valve controller.
  bool drivers_enabled = valve_controller_->are_drivers_enabled();

  const auto cfg = config_store_->get_config();

  if (balance_dirty_ || cfg.balancing.dynamic_balancing_enabled) {
    recalculate_balance_factors_();
    balance_dirty_ = false;
  }

  std::array<float, NUM_ZONES> target_positions;
  target_positions.fill(0.0f);

  // Read raw temperatures and setpoints for all zones first
  std::array<float, NUM_ZONES> zone_temps;
  std::array<float, NUM_ZONES> zone_setpoints;
  uint32_t now_ms = static_cast<uint32_t>(esp_timer_get_time() / 1000);
  for (uint8_t i = 0; i < NUM_ZONES; i++) {
    zone_temps[i] = read_zone_temperature_(i);
    if (!std::isnan(zone_temps[i]))
      last_valid_temp_ms_[i] = now_ms;
    zone_setpoints[i] = requested_setpoints_[i] + setpoint_offsets_[i];
  }

  // Apply zone sync: synced zones share the primary zone's setpoint
  // and use the averaged temperature from both sensors
  for (uint8_t i = 0; i < NUM_ZONES; i++) {
    int8_t primary = cfg.zones[i].sync_to_zone;
    if (primary < 0 || primary >= static_cast<int8_t>(NUM_ZONES))
      continue;
    if (!cfg.zones[i].enabled || !cfg.zones[primary].enabled)
      continue;

    // Use primary zone's setpoint for the synced zone
    zone_setpoints[i] = zone_setpoints[primary];

    // Average both temperatures (if both are valid)
    float t_primary = zone_temps[primary];
    float t_synced = zone_temps[i];
    if (!std::isnan(t_primary) && !std::isnan(t_synced)) {
      float avg = (t_primary + t_synced) / 2.0f;
      zone_temps[i] = avg;
      zone_temps[primary] = avg;
    } else if (!std::isnan(t_primary)) {
      zone_temps[i] = t_primary;
    } else if (!std::isnan(t_synced)) {
      zone_temps[primary] = t_synced;
    }
  }

  for (uint8_t i = 0; i < NUM_ZONES; i++) {
    if (!cfg.zones[i].enabled) {
      target_positions[i] = 0.0f;
      xSemaphoreTake(snapshot_mutex_, portMAX_DELAY);
      snapshots_[i].state = ZoneState::UNKNOWN;
      snapshots_[i].valve_position_pct = 0.0f;
      xSemaphoreGive(snapshot_mutex_);
      continue;
    }

    float temp = zone_temps[i];
    float setpoint = zone_setpoints[i];

    algorithms_[i].set_algorithm(cfg.zones[i].algorithm);

    float preheat_advance = cfg.control.simple_preheat_enabled ? preheat_advance_c_[i] : 0.0f;
    ZoneState state = classify_zone_(temp, setpoint, cfg.control.comfort_band_c, preheat_advance);

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
    snapshots_[i].preheat_advance_c = preheat_advance;
    snapshots_[i].state = state;
    snapshots_[i].hydraulic_factor = balance_factors_[i];
    snapshots_[i].was_overheated = was_overheated;
    xSemaphoreGive(snapshot_mutex_);

    if (cfg.control.simple_preheat_enabled) {
      update_simple_preheat_(i, temp, setpoint, cfg.control.comfort_band_c, state);
    } else {
      reset_simple_preheat_(i);
    }
  }

  enforce_minimum_total_opening_(target_positions);
  apply_minimum_flow_(target_positions);

  for (uint8_t i = 0; i < NUM_ZONES; i++) {
    if (!drivers_enabled)
      continue;
    if (!cfg.zones[i].enabled)
      continue;

    // Skip zones that haven't been calibrated yet — position estimates
    // would be unreliable without learned travel data.
    auto telem = valve_controller_->get_telemetry(i);
    if (telem.learned_open_ms == 0 || telem.learned_close_ms == 0)
      continue;

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

  if (DEVELOPMENT_MANUAL_ONLY)
    return;

  if (!valve_controller_->are_drivers_enabled())
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

  auto cfg = config_store_->get_config();

  // Check if zone uses MQTT external temperature source
  if (cfg.mqtt_temp.zone_temp_source[zone] == TempSource::MQTT_EXTERNAL ||
      cfg.mqtt_temp.zone_temp_source[zone] == TempSource::BLE_SENSOR) {
    return get_zone_mqtt_temperature(zone);
  }

  // Default: local probe (only if role is ROOM_TEMPERATURE; if RETURN_WATER, room temp
  // must come from MQTT/BLE — return NAN to trigger failsafe/maintenance positioning)
  if (cfg.zones[zone].probe_role == ProbeRole::RETURN_WATER) {
    // Probe is measuring return water, not room temp — no local room temperature available
    return NAN;
  }

  int8_t probe = cfg.probes.zone_return_probe[zone];
  if (probe < 0 || probe >= MAX_PROBES || probe_sensors_[probe] == nullptr)
    return NAN;
  if (!probe_sensors_[probe]->has_state())
    return NAN;
  return probe_sensors_[probe]->state;
}

/// Read the return water temperature for a zone (only when probe_role == RETURN_WATER).
float Hv6ZoneController::read_zone_return_temperature_(uint8_t zone) const {
  if (zone >= NUM_ZONES || !config_store_)
    return NAN;

  auto cfg = config_store_->get_config();
  if (cfg.zones[zone].probe_role != ProbeRole::RETURN_WATER)
    return NAN;

  int8_t probe = cfg.probes.zone_return_probe[zone];
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

ZoneState Hv6ZoneController::classify_zone_(float temp, float setpoint, float comfort_band, float preheat_advance_c) const {
  if (std::isnan(temp))
    return ZoneState::UNKNOWN;

  preheat_advance_c = std::clamp(preheat_advance_c, 0.0f, SIMPLE_PREHEAT_MAX_ADVANCE_C);
  float demand_threshold_c = setpoint - comfort_band + preheat_advance_c;

  if (temp > setpoint + comfort_band)
    return ZoneState::OVERHEATED;
  if (temp >= demand_threshold_c)
    return ZoneState::SATISFIED;
  return ZoneState::DEMAND;
}

float Hv6ZoneController::compute_raw_position_(uint8_t zone, float temp, float setpoint) {
  if (!config_store_)
    return 0.0f;
  const auto cfg = config_store_->get_config();
  return algorithms_[zone].calculate(temp, setpoint, cfg.control, cfg.zones[zone]);
}

void Hv6ZoneController::update_simple_preheat_(uint8_t zone, float temp, float setpoint,
                                               float comfort_band, ZoneState state) {
  if (zone >= NUM_ZONES || std::isnan(temp)) {
    return;
  }

  // Start or continue a demand episode and track min/max room temperatures.
  if (state == ZoneState::DEMAND) {
    if (!preheat_episode_active_[zone]) {
      preheat_episode_active_[zone] = true;
      preheat_episode_setpoint_c_[zone] = setpoint;
      preheat_episode_min_temp_c_[zone] = temp;
      preheat_episode_max_temp_c_[zone] = temp;
    } else {
      preheat_episode_min_temp_c_[zone] = std::min(preheat_episode_min_temp_c_[zone], temp);
      preheat_episode_max_temp_c_[zone] = std::max(preheat_episode_max_temp_c_[zone], temp);
    }
  } else if (preheat_episode_active_[zone]) {
    float episode_min = preheat_episode_min_temp_c_[zone];
    float episode_max = std::max(preheat_episode_max_temp_c_[zone], temp);
    float episode_setpoint = preheat_episode_setpoint_c_[zone];

    float low_band = episode_setpoint - comfort_band;
    float high_band = episode_setpoint + comfort_band;
    float undershoot_c = std::max(0.0f, low_band - episode_min);
    float overshoot_c = std::max(0.0f, episode_max - high_band);

    float advance = preheat_advance_c_[zone];
    advance += undershoot_c * SIMPLE_PREHEAT_LEARN_UP_GAIN;
    advance -= overshoot_c * SIMPLE_PREHEAT_LEARN_DOWN_GAIN;
    preheat_advance_c_[zone] = std::clamp(advance, 0.0f, SIMPLE_PREHEAT_MAX_ADVANCE_C);

    ESP_LOGD(TAG,
             "Zone %d simple preheat: undershoot=%.2fC overshoot=%.2fC advance=%.2fC",
             zone + 1, undershoot_c, overshoot_c, preheat_advance_c_[zone]);

    preheat_episode_active_[zone] = false;
  }

  // Continuous small decay while overheated to back off early-start aggressiveness.
  if (state == ZoneState::OVERHEATED && preheat_advance_c_[zone] > 0.0f) {
    preheat_advance_c_[zone] = std::max(0.0f, preheat_advance_c_[zone] - SIMPLE_PREHEAT_OVERSHOOT_DECAY_C);
  }

}

void Hv6ZoneController::reset_simple_preheat_(uint8_t zone) {
  if (zone >= NUM_ZONES)
    return;
  preheat_advance_c_[zone] = 0.0f;
  preheat_episode_active_[zone] = false;
  preheat_episode_min_temp_c_[zone] = NAN;
  preheat_episode_max_temp_c_[zone] = NAN;
  preheat_episode_setpoint_c_[zone] = 0.0f;
}

// =============================================================================
// Hydraulic Balancing
// =============================================================================

void Hv6ZoneController::recalculate_balance_factors_() {
  if (!config_store_)
    return;
  const auto cfg = config_store_->get_config();

  // Try dynamic balancing first (uses measured return temperatures)
  if (cfg.balancing.dynamic_balancing_enabled) {
    recalculate_dynamic_balance_factors_();
    return;
  }

  // Fallback: static model based on configured zone parameters
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

  ESP_LOGI(TAG, "Static balance: [%.2f, %.2f, %.2f, %.2f, %.2f, %.2f]",
           balance_factors_[0], balance_factors_[1], balance_factors_[2],
           balance_factors_[3], balance_factors_[4], balance_factors_[5]);
}

void Hv6ZoneController::recalculate_dynamic_balance_factors_() {
  if (!config_store_)
    return;
  const auto cfg = config_store_->get_config();

  float flow_temp = read_manifold_flow_();
  if (std::isnan(flow_temp)) {
    ESP_LOGW(TAG, "Dynamic balance: no flow temp, falling back to static");
    calculate_hydraulic_outputs_();
    return;
  }

  float target_dt = cfg.balancing.target_delta_t_c;
  float alpha = cfg.balancing.damping_factor;
  bool any_valid = false;

  for (uint8_t i = 0; i < NUM_ZONES; i++) {
    if (!cfg.zones[i].enabled) {
      balance_factors_[i] = 0.0f;
      continue;
    }

    float return_temp = read_zone_return_temperature_(i);

    xSemaphoreTake(snapshot_mutex_, portMAX_DELAY);
    snapshots_[i].return_temp_c = return_temp;
    xSemaphoreGive(snapshot_mutex_);

    if (std::isnan(return_temp)) {
      // No return temp sensor for this zone — keep existing factor
      continue;
    }

    float measured_dt = flow_temp - return_temp;

    xSemaphoreTake(snapshot_mutex_, portMAX_DELAY);
    snapshots_[i].measured_delta_t_c = measured_dt;
    xSemaphoreGive(snapshot_mutex_);

    // If measured ΔT > target: zone is getting too much heat → reduce factor
    // If measured ΔT < target: zone needs more flow → increase factor
    // Factor = target_ΔT / measured_ΔT, clamped to reasonable range
    float new_factor = 1.0f;
    if (measured_dt > 0.5f) {
      new_factor = target_dt / measured_dt;
      new_factor = std::clamp(new_factor, 0.3f, 1.5f);
    }

    // EMA smoothing to avoid oscillation
    float old_factor = balance_factors_[i];
    if (old_factor <= 0.0f || std::isnan(old_factor))
      old_factor = 1.0f;
    balance_factors_[i] = alpha * new_factor + (1.0f - alpha) * old_factor;

    any_valid = true;
  }

  if (!any_valid) {
    ESP_LOGW(TAG, "Dynamic balance: no valid return temps, keeping existing factors");
  } else {
    ESP_LOGI(TAG, "Dynamic balance: [%.2f, %.2f, %.2f, %.2f, %.2f, %.2f]",
             balance_factors_[0], balance_factors_[1], balance_factors_[2],
             balance_factors_[3], balance_factors_[4], balance_factors_[5]);
  }
}

float Hv6ZoneController::apply_hydraulic_balance_(uint8_t zone, float raw_position) {
  if (balance_factors_[zone] <= 0.0f)
    return 0.0f;
  return raw_position * balance_factors_[zone];
}

/// Enforce per-zone minimum flow when a modulating heat source is present (Helios-6/Ecodan).
/// This ensures the heat pump always has sufficient flow through the manifold.
void Hv6ZoneController::apply_minimum_flow_(std::array<float, NUM_ZONES> &positions) {
  if (!config_store_)
    return;
  const auto cfg = config_store_->get_config();

  if (!cfg.balancing.modulating_heat_source)
    return;

  float min_pct = cfg.balancing.minimum_flow_pct;
  for (uint8_t i = 0; i < NUM_ZONES; i++) {
    if (!cfg.zones[i].enabled)
      continue;
    if (positions[i] < min_pct)
      positions[i] = min_pct;
  }
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

// =============================================================================
// MQTT Zigbee2MQTT Subscription
// =============================================================================

void Hv6ZoneController::setup_mqtt_subscription_() {
#ifdef USE_MQTT
  if (esphome::mqtt::global_mqtt_client == nullptr) {
    ESP_LOGW(TAG, "MQTT client not available, zigbee temp disabled");
    return;
  }
  esphome::mqtt::global_mqtt_client->subscribe(
      "zigbee2mqtt/+",
      [this](const std::string &topic, const std::string &payload) {
        this->handle_zigbee_mqtt_(topic, payload);
      },
      0);
  ESP_LOGI(TAG, "Subscribed to zigbee2mqtt/+ for external temperatures");

  // Request current temperature from configured Zigbee devices with startup delay
  // and exponential backoff. Stop after max retries and wait for natural reports.
  mqtt_startup_query_retry_count_ = 0;
  mqtt_startup_query_next_retry_ms_ = MQTT_STARTUP_QUERY_DELAY_MS;
  mqtt_startup_query_next_zone_ = 0;
  mqtt_startup_query_round_active_ = false;
  mqtt_startup_query_round_remaining_ = 0;
  this->set_interval("mqtt_startup_query", MQTT_STARTUP_QUERY_TICK_MS, [this]() {
    if (!esphome::mqtt::global_mqtt_client->is_connected())
      return;

    uint32_t uptime_ms = static_cast<uint32_t>(esp_timer_get_time() / 1000);
    if (uptime_ms < mqtt_startup_query_next_retry_ms_)
      return;

    if (!config_store_)
      return;

    auto cfg = config_store_->get_config();

    uint8_t pending_count = 0;
    for (uint8_t z = 0; z < NUM_ZONES; z++) {
      if (cfg.mqtt_temp.zone_temp_source[z] == TempSource::MQTT_EXTERNAL &&
          cfg.mqtt_temp.zone_mqtt_device[z][0] != '\0' &&
          mqtt_temp_last_ms_[z] == 0) {
        pending_count++;
      }
    }

    if (pending_count == 0) {
      ESP_LOGI(TAG, "Startup MQTT temperature query completed (all configured zones updated)");
      this->cancel_interval("mqtt_startup_query");
      return;
    }

    // Start a new round only after the retry delay has elapsed.
    if (!mqtt_startup_query_round_active_) {
      if (mqtt_startup_query_retry_count_ >= MQTT_STARTUP_QUERY_MAX_RETRIES) {
        ESP_LOGW(TAG, "Startup MQTT temperature query reached max retries (%u); waiting for natural updates",
                 MQTT_STARTUP_QUERY_MAX_RETRIES);
        this->cancel_interval("mqtt_startup_query");
        return;
      }
      mqtt_startup_query_round_active_ = true;
      mqtt_startup_query_round_remaining_ = pending_count;
    }

    // One-at-a-time query to avoid burst traffic on startup.
    bool requested = false;
    for (uint8_t i = 0; i < NUM_ZONES; i++) {
      uint8_t z = static_cast<uint8_t>((mqtt_startup_query_next_zone_ + i) % NUM_ZONES);
      if (cfg.mqtt_temp.zone_temp_source[z] == TempSource::MQTT_EXTERNAL &&
          cfg.mqtt_temp.zone_mqtt_device[z][0] != '\0' &&
          mqtt_temp_last_ms_[z] == 0) {
        request_zigbee_temperature_(std::string(cfg.mqtt_temp.zone_mqtt_device[z]));
        mqtt_startup_query_next_zone_ = static_cast<uint8_t>((z + 1) % NUM_ZONES);
        requested = true;
        break;
      }
    }

    if (!requested) {
      mqtt_startup_query_round_active_ = false;
      mqtt_startup_query_round_remaining_ = 0;
      return;
    }

    if (mqtt_startup_query_round_remaining_ > 0)
      mqtt_startup_query_round_remaining_--;

    if (mqtt_startup_query_round_remaining_ > 0)
      return;

    // Round completed: schedule the next round with exponential backoff.
    mqtt_startup_query_round_active_ = false;
    mqtt_startup_query_retry_count_++;

    if (mqtt_startup_query_retry_count_ >= MQTT_STARTUP_QUERY_MAX_RETRIES) {
      ESP_LOGW(TAG, "Startup MQTT temperature query reached max retries (%u); waiting for natural updates",
               MQTT_STARTUP_QUERY_MAX_RETRIES);
      this->cancel_interval("mqtt_startup_query");
      return;
    }

    uint8_t exp = mqtt_startup_query_retry_count_ - 1;
    uint32_t backoff_ms = MQTT_STARTUP_QUERY_BACKOFF_BASE_MS;
    if (exp > 0)
      backoff_ms <<= exp;
    mqtt_startup_query_next_retry_ms_ = uptime_ms + backoff_ms;
    ESP_LOGI(TAG, "Startup MQTT temperature query retry %u/%u in %" PRIu32 "ms",
             mqtt_startup_query_retry_count_, MQTT_STARTUP_QUERY_MAX_RETRIES, backoff_ms);
  });
#else
  ESP_LOGD(TAG, "MQTT not enabled, zigbee temp subscription skipped");
#endif
}

void Hv6ZoneController::handle_zigbee_mqtt_(const std::string &topic, const std::string &payload) {
  // Extract device name from topic: "zigbee2mqtt/<device_name>"
  size_t last_slash = topic.rfind('/');
  if (last_slash == std::string::npos)
    return;
  std::string device_name = topic.substr(last_slash + 1);
  if (device_name.empty() || device_name == "bridge")
    return;

  // Parse JSON payload for "temperature" field
  float temperature = NAN;
#ifdef USE_MQTT
  esphome::json::parse_json(payload, [&temperature](JsonObject root) -> bool {
    if (root["temperature"].is<float>()) {
      temperature = root["temperature"].as<float>();
      return true;
    }
    return false;
  });
#endif

  if (std::isnan(temperature)) {
    return;
  }

  ESP_LOGD(TAG, "MQTT temp from '%s': %.2f°C", device_name.c_str(), temperature);

  // Match device name against configured zones
  if (!config_store_)
    return;
  auto cfg = config_store_->get_config();
  bool matched = false;
  for (uint8_t z = 0; z < NUM_ZONES; z++) {
    if (cfg.mqtt_temp.zone_mqtt_device[z][0] == '\0')
      continue;
    if (device_name == cfg.mqtt_temp.zone_mqtt_device[z]) {
      set_zone_mqtt_temperature(z, temperature);
      matched = true;
    }
  }
  if (!matched) {
    ESP_LOGD(TAG, "MQTT device '%s' not assigned to any zone", device_name.c_str());
  }
}

void Hv6ZoneController::request_zigbee_temperature_(const std::string &device_name) {
#ifdef USE_MQTT
  if (esphome::mqtt::global_mqtt_client == nullptr || device_name.empty())
    return;
  std::string topic = "zigbee2mqtt/" + device_name + "/get";
  std::string payload = "{\"temperature\":\"\"}";
  esphome::mqtt::global_mqtt_client->publish(topic, payload, 0, false);
  ESP_LOGI(TAG, "Requested temperature from '%s'", device_name.c_str());
#endif
}

// =============================================================================
// State Machine Updates
// =============================================================================

void Hv6ZoneController::update_controller_state_() {
  if (!config_store_ || !valve_controller_)
    return;

  ControllerState new_state = ControllerState::UNKNOWN;

  // Determine primary action state
  if (manual_mode_) {
    new_state = ControllerState::MANUAL;
  } else if (DEVELOPMENT_MANUAL_ONLY) {
    new_state = ControllerState::MANUAL;
  } else if (!valve_controller_->are_drivers_enabled()) {
    new_state = ControllerState::OFF;
  } else {
    // Check if any zone is calibrating
    bool any_calibrating = false;
    const auto cfg = config_store_->get_config();
    for (uint8_t i = 0; i < NUM_ZONES; i++) {
      if (!cfg.zones[i].enabled)
        continue;
      auto telem = valve_controller_->get_telemetry(i);
      if (telem.learned_open_ms == 0 || telem.learned_close_ms == 0) {
        any_calibrating = true;
        break;
      }
    }

    if (any_calibrating) {
      new_state = ControllerState::CALIBRATING;
    } else {
      // Count active zones and their demand states
      uint8_t active_count = 0;
      uint8_t heating_count = 0;

      xSemaphoreTake(snapshot_mutex_, portMAX_DELAY);
      for (uint8_t i = 0; i < NUM_ZONES; i++) {
        if (!cfg.zones[i].enabled)
          continue;
        if (snapshots_[i].state == ZoneState::UNKNOWN)
          continue;

        active_count++;
        if (snapshots_[i].state == ZoneState::DEMAND)
          heating_count++;
      }
      xSemaphoreGive(snapshot_mutex_);

      // Determine state based on zone activity
      if (active_count == 0) {
        new_state = ControllerState::WAITING_INPUT;
      } else if (heating_count > 0) {
        if (heating_count == active_count) {
          new_state = ControllerState::HEATING;
        } else {
          new_state = ControllerState::MIXED;
        }
      } else {
        new_state = ControllerState::IDLE;
      }
    }
  }

  if (new_state != controller_state_) {
    controller_state_ = new_state;
    ESP_LOGI(TAG, "Controller state: %d", static_cast<int>(new_state));
  }
}

void Hv6ZoneController::update_system_condition_state_() {
  if (!config_store_)
    return;

  SystemConditionState new_state = SystemConditionState::UNKNOWN;

  const auto cfg = config_store_->get_config();
  uint8_t active_zones = 0;
  uint8_t overheated_count = 0;
  uint8_t above_target_count = 0;

  xSemaphoreTake(snapshot_mutex_, portMAX_DELAY);
  for (uint8_t i = 0; i < NUM_ZONES; i++) {
    if (!cfg.zones[i].enabled)
      continue;
    if (snapshots_[i].state == ZoneState::UNKNOWN)
      continue;

    active_zones++;

    // Derive system condition directly from control state.
    if (snapshots_[i].state == ZoneState::OVERHEATED) {
      overheated_count++;
    } else if (snapshots_[i].state == ZoneState::SATISFIED) {
      above_target_count++;
    }
  }
  xSemaphoreGive(snapshot_mutex_);

  // Determine system-level condition
  if (active_zones == 0) {
    new_state = SystemConditionState::UNKNOWN;
  } else if (overheated_count > 0) {
    new_state = SystemConditionState::OVERHEATED;
  } else if (above_target_count == active_zones) {
    // All active zones are above setpoint
    new_state = SystemConditionState::ABOVE_SETPOINT;
  } else {
    new_state = SystemConditionState::NORMAL;
  }

  if (new_state != system_condition_state_) {
    system_condition_state_ = new_state;
    ESP_LOGD(TAG, "System condition: %d", static_cast<int>(new_state));
  }
}

void Hv6ZoneController::update_zone_display_states_() {
  if (!config_store_ || !valve_controller_)
    return;

  const auto cfg = config_store_->get_config();
  const bool drivers_enabled = valve_controller_->are_drivers_enabled();
  const bool manual = manual_mode_ || DEVELOPMENT_MANUAL_ONLY;

  xSemaphoreTake(snapshot_mutex_, portMAX_DELAY);
  for (uint8_t i = 0; i < NUM_ZONES; i++) {
    if (!cfg.zones[i].enabled) {
      snapshots_[i].display_state = ZoneDisplayState::OFF;
      continue;
    }

    if (manual) {
      snapshots_[i].display_state = ZoneDisplayState::MANUAL;
      continue;
    }

    if (!drivers_enabled) {
      snapshots_[i].display_state = ZoneDisplayState::OFF;
      continue;
    }

    auto telem = valve_controller_->get_telemetry(i);
    if (telem.learned_open_ms == 0 || telem.learned_close_ms == 0) {
      snapshots_[i].display_state = ZoneDisplayState::CALIBRATING;
      continue;
    }

    if (std::isnan(snapshots_[i].temperature_c)) {
      snapshots_[i].display_state = ZoneDisplayState::WAITING_ROOM_TEMP;
      continue;
    }

    switch (snapshots_[i].state) {
      case ZoneState::DEMAND:
        snapshots_[i].display_state = ZoneDisplayState::HEATING;
        break;
      case ZoneState::SATISFIED:
      case ZoneState::OVERHEATED:
        snapshots_[i].display_state = ZoneDisplayState::IDLE;
        break;
      case ZoneState::UNKNOWN:
      default:
        snapshots_[i].display_state = ZoneDisplayState::WAITING_ROOM_TEMP;
        break;
    }
  }
  xSemaphoreGive(snapshot_mutex_);
}

}  // namespace hv6
