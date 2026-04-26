// =============================================================================
// HV6 Config Store — ESPHome Component Implementation
// =============================================================================

#include "hv6_config_store.h"
#include "esphome/core/log.h"
#include <cinttypes>
#include <cctype>
#include <cstring>
#include <algorithm>
#include <vector>
#include "esp_system.h"

#ifdef USE_MQTT
#include "esphome/components/mqtt/mqtt_client.h"
#endif

namespace hv6 {

static const char *const TAG = "hv6_config_store";

namespace {

bool is_blank_or_whitespace(const char *s) {
  if (s == nullptr)
    return true;
  for (size_t i = 0; s[i] != '\0'; i++) {
    if (!std::isspace(static_cast<unsigned char>(s[i])))
      return false;
  }
  return true;
}

void trim_copy(char *dst, size_t dst_len, const char *src) {
  if (dst == nullptr || dst_len == 0) {
    return;
  }
  dst[0] = '\0';
  if (src == nullptr)
    return;

  size_t start = 0;
  size_t len = std::strlen(src);
  while (start < len && std::isspace(static_cast<unsigned char>(src[start])))
    start++;
  while (len > start && std::isspace(static_cast<unsigned char>(src[len - 1])))
    len--;

  size_t out_len = std::min(dst_len - 1, len - start);
  if (out_len > 0) {
    std::memcpy(dst, src + start, out_len);
  }
  dst[out_len] = '\0';
}

struct LegacyZoneConfigV8 {
  bool enabled;
  float area_m2;
  float max_opening_pct;
  PipeType pipe_type;
  FloorType floor_type;
  float pipe_spacing_mm;
  float floor_cover_thickness_mm;
  float setpoint_c;
  ControlAlgorithm algorithm;
  float heat_loss_w_m2;
  float supply_pipe_length_m;
  float cooling_delta_c;
  float concrete_thickness_mm;
  char name[16];
  uint8_t exterior_walls;
  ProbeRole probe_role;
  int8_t sync_to_zone;
  float motor_close_current_factor_override;
  float motor_open_current_factor_override;
};

struct LegacyMotorConfigV8 {
  uint32_t pwm_boost_ms;
  uint8_t pwm_hold_duty_pct;
  uint32_t pwm_period_ms;
  uint32_t max_runtime_s;
  uint32_t calibration_timeout_s;
  float close_current_factor;
  float close_slope_threshold_ma_per_s;
  float close_slope_current_factor;
  float open_current_factor;
  float open_slope_threshold_ma_per_s;
  float open_slope_current_factor;
  float open_ripple_limit_factor;
  float pin_engage_step_ma;
  uint16_t pin_engage_margin_ripples;
  float low_current_threshold_ma;
  uint32_t low_current_window_ms;
  uint32_t calibration_min_travel_ms;
  uint8_t calibration_max_retries;
  uint32_t relearn_after_movements;
  uint32_t relearn_after_hours;
  float drift_relearn_threshold_pct;
  uint32_t presence_test_duration_ms;
};

struct LegacyControlConfigV9 {
  float comfort_band_c;
  float min_valve_opening_pct;
  float maintenance_base_pct;
  float demand_boost_pct;
  float boost_factor;
  float min_movement_pct;
  float tanh_steepness;
};

// Frozen snapshot of ZoneConfig before v11 added helios offset/abs limit fields.
struct LegacyZoneConfigV10 {
  bool enabled;
  float area_m2;
  float max_opening_pct;
  PipeType pipe_type;
  FloorType floor_type;
  float pipe_spacing_mm;
  float floor_cover_thickness_mm;
  float setpoint_c;
  ControlAlgorithm algorithm;
  float heat_loss_w_m2;
  float supply_pipe_length_m;
  float cooling_delta_c;
  float concrete_thickness_mm;
  char name[16];
  uint8_t exterior_walls;
  ProbeRole probe_role;
  int8_t sync_to_zone;
  MotorProfile motor_profile_override;
  float motor_close_current_factor_override;
  float motor_open_current_factor_override;
};

struct LegacyDeviceConfigV9 {
  uint32_t config_version;
  SystemConfig system;
  LegacyZoneConfigV10 zones[NUM_ZONES];
  LegacyControlConfigV9 control;
  ProbeConfig probes;
  PIDParams pid;
  MotorConfig motor;
  ManifoldType manifold_type;
  MqttTempConfig mqtt_temp;
  BalancingConfig balancing;
  MqttBrokerConfig mqtt_broker;
};

struct LegacyDeviceConfigV10 {
  uint32_t config_version;
  SystemConfig system;
  LegacyZoneConfigV10 zones[NUM_ZONES];
  ControlConfig control;  ///< Includes simple_preheat_enabled (added in v10)
  ProbeConfig probes;
  PIDParams pid;
  MotorConfig motor;
  ManifoldType manifold_type;
  MqttTempConfig mqtt_temp;
  BalancingConfig balancing;
  MqttBrokerConfig mqtt_broker;
  // No helios field — that was added in v11
};

struct LegacyHeliosConfigV11 {
  bool enabled;
  char host[HELIOS_HOST_LEN];
  uint16_t port;
  char controller_id[HELIOS_CONTROLLER_ID_LEN];
  uint16_t poll_interval_s;
  uint16_t stale_after_s;
};

struct LegacyDeviceConfigV11 {
  uint32_t config_version;
  SystemConfig system;
  ZoneConfig zones[NUM_ZONES];
  ControlConfig control;
  ProbeConfig probes;
  PIDParams pid;
  MotorConfig motor;
  ManifoldType manifold_type;
  MqttTempConfig mqtt_temp;
  BalancingConfig balancing;
  MqttBrokerConfig mqtt_broker;
  LegacyHeliosConfigV11 helios;
};

struct LegacyHeliosConfigV12 {
  bool enabled;
  char host[HELIOS_HOST_LEN];
  uint16_t port;
  char controller_id[HELIOS_CONTROLLER_ID_LEN];
  uint16_t poll_interval_s;
  uint16_t stale_after_s;
  bool auto_discover;
  char mdns_host[HELIOS_HOST_LEN];
  uint16_t mdns_resolve_interval_s;
};

struct LegacyDeviceConfigV12 {
  uint32_t config_version;
  SystemConfig system;
  ZoneConfig zones[NUM_ZONES];
  ControlConfig control;
  ProbeConfig probes;
  PIDParams pid;
  MotorConfig motor;
  ManifoldType manifold_type;
  MqttTempConfig mqtt_temp;
  BalancingConfig balancing;
  MqttBrokerConfig mqtt_broker;
  LegacyHeliosConfigV12 helios;
};

struct LegacyDeviceConfigV8 {
  uint32_t config_version;
  SystemConfig system;
  LegacyZoneConfigV8 zones[NUM_ZONES];
  ControlConfig control;
  ProbeConfig probes;
  PIDParams pid;
  LegacyMotorConfigV8 motor;
  ManifoldType manifold_type;
  MqttTempConfig mqtt_temp;
  BalancingConfig balancing;
  MqttBrokerConfig mqtt_broker;
};

struct LegacyMotorTelemetryV8 {
  uint32_t movement_count;
  uint32_t open_count;
  uint32_t close_count;
  uint32_t last_open_endstop_ms;
  uint32_t last_close_endstop_ms;
  uint32_t learned_open_ms;
  uint32_t learned_close_ms;
  uint32_t learned_open_ripples;
  uint32_t learned_close_ripples;
  int32_t deadzone_ms;
  float drift_percent;
  uint32_t movements_since_learn;
  uint32_t last_learn_ms;
  uint8_t calibration_retries;
  bool blocked;
  bool present;
  bool presence_known;
  float mean_current_ma;
  float current_position_pct;
  uint32_t pin_engage_close_ripples;
};

DeviceConfig migrate_v8_config(const LegacyDeviceConfigV8 &legacy) {
  DeviceConfig cfg;
  cfg.config_version = CONFIG_VERSION;
  cfg.system = legacy.system;
  cfg.control = legacy.control;
  cfg.probes = legacy.probes;
  cfg.pid = legacy.pid;
  cfg.manifold_type = legacy.manifold_type;
  cfg.mqtt_temp = legacy.mqtt_temp;
  cfg.balancing = legacy.balancing;
  cfg.mqtt_broker = legacy.mqtt_broker;

  for (uint8_t i = 0; i < NUM_ZONES; i++) {
    cfg.zones[i].enabled = legacy.zones[i].enabled;
    cfg.zones[i].area_m2 = legacy.zones[i].area_m2;
    cfg.zones[i].max_opening_pct = legacy.zones[i].max_opening_pct;
    cfg.zones[i].pipe_type = legacy.zones[i].pipe_type;
    cfg.zones[i].floor_type = legacy.zones[i].floor_type;
    cfg.zones[i].pipe_spacing_mm = legacy.zones[i].pipe_spacing_mm;
    cfg.zones[i].floor_cover_thickness_mm = legacy.zones[i].floor_cover_thickness_mm;
    cfg.zones[i].setpoint_c = legacy.zones[i].setpoint_c;
    cfg.zones[i].algorithm = legacy.zones[i].algorithm;
    cfg.zones[i].heat_loss_w_m2 = legacy.zones[i].heat_loss_w_m2;
    cfg.zones[i].supply_pipe_length_m = legacy.zones[i].supply_pipe_length_m;
    cfg.zones[i].cooling_delta_c = legacy.zones[i].cooling_delta_c;
    cfg.zones[i].concrete_thickness_mm = legacy.zones[i].concrete_thickness_mm;
    memcpy(cfg.zones[i].name, legacy.zones[i].name, sizeof(cfg.zones[i].name));
    cfg.zones[i].exterior_walls = legacy.zones[i].exterior_walls;
    cfg.zones[i].probe_role = legacy.zones[i].probe_role;
    cfg.zones[i].sync_to_zone = legacy.zones[i].sync_to_zone;
    cfg.zones[i].motor_close_current_factor_override = legacy.zones[i].motor_close_current_factor_override;
    cfg.zones[i].motor_open_current_factor_override = legacy.zones[i].motor_open_current_factor_override;
    cfg.zones[i].motor_profile_override = MotorProfile::INHERIT;
  }

  cfg.motor.pwm_boost_ms = legacy.motor.pwm_boost_ms;
  cfg.motor.pwm_hold_duty_pct = legacy.motor.pwm_hold_duty_pct;
  cfg.motor.pwm_period_ms = legacy.motor.pwm_period_ms;
  cfg.motor.max_runtime_s = legacy.motor.max_runtime_s;
  cfg.motor.calibration_timeout_s = legacy.motor.calibration_timeout_s;
  cfg.motor.close_current_factor = legacy.motor.close_current_factor;
  cfg.motor.close_slope_threshold_ma_per_s = legacy.motor.close_slope_threshold_ma_per_s;
  cfg.motor.close_slope_current_factor = legacy.motor.close_slope_current_factor;
  cfg.motor.open_current_factor = legacy.motor.open_current_factor;
  cfg.motor.open_slope_threshold_ma_per_s = legacy.motor.open_slope_threshold_ma_per_s;
  cfg.motor.open_slope_current_factor = legacy.motor.open_slope_current_factor;
  cfg.motor.open_ripple_limit_factor = legacy.motor.open_ripple_limit_factor;
  cfg.motor.pin_engage_step_ma = legacy.motor.pin_engage_step_ma;
  cfg.motor.pin_engage_margin_ripples = legacy.motor.pin_engage_margin_ripples;
  cfg.motor.low_current_threshold_ma = legacy.motor.low_current_threshold_ma;
  cfg.motor.low_current_window_ms = legacy.motor.low_current_window_ms;
  cfg.motor.calibration_min_travel_ms = legacy.motor.calibration_min_travel_ms;
  cfg.motor.calibration_max_retries = legacy.motor.calibration_max_retries;
  cfg.motor.relearn_after_movements = legacy.motor.relearn_after_movements;
  cfg.motor.relearn_after_hours = legacy.motor.relearn_after_hours;
  cfg.motor.drift_relearn_threshold_pct = legacy.motor.drift_relearn_threshold_pct;
  cfg.motor.presence_test_duration_ms = legacy.motor.presence_test_duration_ms;
  cfg.motor.default_profile = MotorProfile::HMIP_VDMOT;
  cfg.motor.generic_profile_runtime_limit_s = 45;
  cfg.motor.hmip_vdmot_runtime_limit_s = 40;
  cfg.motor.auto_apply_learned_factors = true;
  cfg.motor.learned_factor_min_samples = 3;
  cfg.motor.learned_factor_max_deviation_pct = 0.12f;
  return cfg;
}

DeviceConfig migrate_v9_config(const LegacyDeviceConfigV9 &legacy) {
  DeviceConfig cfg;
  cfg.config_version = CONFIG_VERSION;
  cfg.system = legacy.system;
  for (uint8_t i = 0; i < NUM_ZONES; i++) {
    cfg.zones[i].enabled = legacy.zones[i].enabled;
    cfg.zones[i].area_m2 = legacy.zones[i].area_m2;
    cfg.zones[i].max_opening_pct = legacy.zones[i].max_opening_pct;
    cfg.zones[i].pipe_type = legacy.zones[i].pipe_type;
    cfg.zones[i].floor_type = legacy.zones[i].floor_type;
    cfg.zones[i].pipe_spacing_mm = legacy.zones[i].pipe_spacing_mm;
    cfg.zones[i].floor_cover_thickness_mm = legacy.zones[i].floor_cover_thickness_mm;
    cfg.zones[i].setpoint_c = legacy.zones[i].setpoint_c;
    cfg.zones[i].algorithm = legacy.zones[i].algorithm;
    cfg.zones[i].heat_loss_w_m2 = legacy.zones[i].heat_loss_w_m2;
    cfg.zones[i].supply_pipe_length_m = legacy.zones[i].supply_pipe_length_m;
    cfg.zones[i].cooling_delta_c = legacy.zones[i].cooling_delta_c;
    cfg.zones[i].concrete_thickness_mm = legacy.zones[i].concrete_thickness_mm;
    memcpy(cfg.zones[i].name, legacy.zones[i].name, sizeof(cfg.zones[i].name));
    cfg.zones[i].exterior_walls = legacy.zones[i].exterior_walls;
    cfg.zones[i].probe_role = legacy.zones[i].probe_role;
    cfg.zones[i].sync_to_zone = legacy.zones[i].sync_to_zone;
    cfg.zones[i].motor_profile_override = legacy.zones[i].motor_profile_override;
    cfg.zones[i].motor_close_current_factor_override = legacy.zones[i].motor_close_current_factor_override;
    cfg.zones[i].motor_open_current_factor_override = legacy.zones[i].motor_open_current_factor_override;
    // New v11 helios fields use C++ defaults: min_offset=-2, max_offset=2, abs_min=5, abs_max=30
  }

  cfg.control.comfort_band_c = legacy.control.comfort_band_c;
  cfg.control.min_valve_opening_pct = legacy.control.min_valve_opening_pct;
  cfg.control.maintenance_base_pct = legacy.control.maintenance_base_pct;
  cfg.control.demand_boost_pct = legacy.control.demand_boost_pct;
  cfg.control.boost_factor = legacy.control.boost_factor;
  cfg.control.min_movement_pct = legacy.control.min_movement_pct;
  cfg.control.tanh_steepness = legacy.control.tanh_steepness;
  cfg.control.simple_preheat_enabled = true;

  cfg.probes = legacy.probes;
  cfg.pid = legacy.pid;
  cfg.motor = legacy.motor;
  cfg.manifold_type = legacy.manifold_type;
  cfg.mqtt_temp = legacy.mqtt_temp;
  cfg.balancing = legacy.balancing;
  cfg.mqtt_broker = legacy.mqtt_broker;
  return cfg;
}

DeviceConfig migrate_v10_config(const LegacyDeviceConfigV10 &legacy) {
  DeviceConfig cfg;
  cfg.config_version = CONFIG_VERSION;
  cfg.system = legacy.system;
  for (uint8_t i = 0; i < NUM_ZONES; i++) {
    cfg.zones[i].enabled = legacy.zones[i].enabled;
    cfg.zones[i].area_m2 = legacy.zones[i].area_m2;
    cfg.zones[i].max_opening_pct = legacy.zones[i].max_opening_pct;
    cfg.zones[i].pipe_type = legacy.zones[i].pipe_type;
    cfg.zones[i].floor_type = legacy.zones[i].floor_type;
    cfg.zones[i].pipe_spacing_mm = legacy.zones[i].pipe_spacing_mm;
    cfg.zones[i].floor_cover_thickness_mm = legacy.zones[i].floor_cover_thickness_mm;
    cfg.zones[i].setpoint_c = legacy.zones[i].setpoint_c;
    cfg.zones[i].algorithm = legacy.zones[i].algorithm;
    cfg.zones[i].heat_loss_w_m2 = legacy.zones[i].heat_loss_w_m2;
    cfg.zones[i].supply_pipe_length_m = legacy.zones[i].supply_pipe_length_m;
    cfg.zones[i].cooling_delta_c = legacy.zones[i].cooling_delta_c;
    cfg.zones[i].concrete_thickness_mm = legacy.zones[i].concrete_thickness_mm;
    memcpy(cfg.zones[i].name, legacy.zones[i].name, sizeof(cfg.zones[i].name));
    cfg.zones[i].exterior_walls = legacy.zones[i].exterior_walls;
    cfg.zones[i].probe_role = legacy.zones[i].probe_role;
    cfg.zones[i].sync_to_zone = legacy.zones[i].sync_to_zone;
    cfg.zones[i].motor_profile_override = legacy.zones[i].motor_profile_override;
    cfg.zones[i].motor_close_current_factor_override = legacy.zones[i].motor_close_current_factor_override;
    cfg.zones[i].motor_open_current_factor_override = legacy.zones[i].motor_open_current_factor_override;
    // New v11 helios fields use C++ defaults: min_offset=-2, max_offset=2, abs_min=5, abs_max=30
  }
  cfg.control = legacy.control;
  cfg.probes = legacy.probes;
  cfg.pid = legacy.pid;
  cfg.motor = legacy.motor;
  cfg.manifold_type = legacy.manifold_type;
  cfg.mqtt_temp = legacy.mqtt_temp;
  cfg.balancing = legacy.balancing;
  cfg.mqtt_broker = legacy.mqtt_broker;
  // cfg.helios uses C++ defaults (enabled=false, host="", port=8080, etc.)
  return cfg;
}

DeviceConfig migrate_v11_config(const LegacyDeviceConfigV11 &legacy) {
  DeviceConfig cfg;
  cfg.config_version = CONFIG_VERSION;
  cfg.system = legacy.system;
  for (uint8_t i = 0; i < NUM_ZONES; i++)
    cfg.zones[i] = legacy.zones[i];
  cfg.control = legacy.control;
  cfg.probes = legacy.probes;
  cfg.pid = legacy.pid;
  cfg.motor = legacy.motor;
  cfg.manifold_type = legacy.manifold_type;
  cfg.mqtt_temp = legacy.mqtt_temp;
  cfg.balancing = legacy.balancing;
  cfg.mqtt_broker = legacy.mqtt_broker;

  cfg.helios.enabled = legacy.helios.enabled;
  memcpy(cfg.helios.host, legacy.helios.host, sizeof(cfg.helios.host));
  cfg.helios.port = legacy.helios.port;
  memcpy(cfg.helios.controller_id, legacy.helios.controller_id, sizeof(cfg.helios.controller_id));
  cfg.helios.poll_interval_s = legacy.helios.poll_interval_s;
  cfg.helios.stale_after_s = legacy.helios.stale_after_s;
  // New v12 fields keep safe defaults: auto_discover=false, mdns_host="helios.local", mdns_resolve_interval_s=60
  return cfg;
}

DeviceConfig migrate_v12_config(const LegacyDeviceConfigV12 &legacy) {
  DeviceConfig cfg;
  cfg.config_version = CONFIG_VERSION;
  cfg.system = legacy.system;
  for (uint8_t i = 0; i < NUM_ZONES; i++)
    cfg.zones[i] = legacy.zones[i];
  cfg.control = legacy.control;
  cfg.probes = legacy.probes;
  cfg.pid = legacy.pid;
  cfg.motor = legacy.motor;
  cfg.manifold_type = legacy.manifold_type;
  cfg.mqtt_temp = legacy.mqtt_temp;
  cfg.balancing = legacy.balancing;
  cfg.mqtt_broker = legacy.mqtt_broker;

  cfg.helios.enabled = legacy.helios.enabled;
  memcpy(cfg.helios.host, legacy.helios.host, sizeof(cfg.helios.host));
  cfg.helios.port = legacy.helios.port;
  memcpy(cfg.helios.controller_id, legacy.helios.controller_id, sizeof(cfg.helios.controller_id));
  cfg.helios.poll_interval_s = legacy.helios.poll_interval_s;
  cfg.helios.stale_after_s = legacy.helios.stale_after_s;
  memcpy(cfg.helios.mdns_host, legacy.helios.mdns_host, sizeof(cfg.helios.mdns_host));
  cfg.helios.mdns_resolve_interval_s = legacy.helios.mdns_resolve_interval_s;

  // v13 safety: only keep auto_discover if a manual host is also configured.
  // This avoids unexpected background probing on previously unconfigured devices.
  cfg.helios.auto_discover = legacy.helios.auto_discover && legacy.helios.host[0] != '\0';
  return cfg;
}

MotorTelemetry migrate_v8_telemetry(const LegacyMotorTelemetryV8 &legacy) {
  MotorTelemetry t;
  t.movement_count = legacy.movement_count;
  t.open_count = legacy.open_count;
  t.close_count = legacy.close_count;
  t.last_open_endstop_ms = legacy.last_open_endstop_ms;
  t.last_close_endstop_ms = legacy.last_close_endstop_ms;
  t.learned_open_ms = legacy.learned_open_ms;
  t.learned_close_ms = legacy.learned_close_ms;
  t.learned_open_ripples = legacy.learned_open_ripples;
  t.learned_close_ripples = legacy.learned_close_ripples;
  t.deadzone_ms = legacy.deadzone_ms;
  t.drift_percent = legacy.drift_percent;
  t.movements_since_learn = legacy.movements_since_learn;
  t.last_learn_ms = legacy.last_learn_ms;
  t.calibration_retries = legacy.calibration_retries;
  t.blocked = legacy.blocked;
  t.present = legacy.present;
  t.presence_known = legacy.presence_known;
  t.mean_current_ma = legacy.mean_current_ma;
  t.current_position_pct = legacy.current_position_pct;
  t.pin_engage_close_ripples = legacy.pin_engage_close_ripples;
  t.last_fault_code = FaultCode::NONE;
  return t;
}

}  // namespace

void Hv6ConfigStore::setup() {
  mutex_ = xSemaphoreCreateMutex();
  if (mutex_ == nullptr) {
    ESP_LOGE(TAG, "Failed to create mutex");
    this->mark_failed();
    return;
  }

  // Create deferred-save timer
  esp_timer_create_args_t timer_args = {};
  timer_args.callback = &Hv6ConfigStore::dirty_timer_cb_;
  timer_args.arg = this;
  timer_args.name = "cfg_save";
  if (esp_timer_create(&timer_args, &dirty_timer_) != ESP_OK) {
    ESP_LOGE(TAG, "Failed to create dirty timer");
    this->mark_failed();
    return;
  }

  // Binary semaphore + dedicated NVS task. The timer callback gives the
  // semaphore; the task wakes, takes a config snapshot, and performs the
  // NVS commit (which can block 50\u2013500 ms) without ever stalling the main
  // loop, the lwIP task, or the IDF httpd. Pinned to Core 1 at the lowest
  // useful priority so it yields to networking immediately when needed.
  save_sem_ = xSemaphoreCreateBinary();
  if (save_sem_ == nullptr) {
    ESP_LOGE(TAG, "Failed to create save semaphore");
    this->mark_failed();
    return;
  }
  BaseType_t task_ok = xTaskCreatePinnedToCore(
      &Hv6ConfigStore::nvs_task_entry_, "hv6_nvs", NVS_TASK_STACK, this,
      NVS_TASK_PRIO, &nvs_task_, NVS_TASK_CORE);
  if (task_ok != pdPASS) {
    ESP_LOGE(TAG, "Failed to create NVS persistence task");
    this->mark_failed();
    return;
  }

  initialized_ = true;
  load_config_();

  // Apply NVS MQTT broker settings before MQTT component connects.
  // Config store runs at HARDWARE priority (800), MQTT at AFTER_WIFI (250),
  // so these overrides are in place before mqtt_client::setup().
#ifdef USE_MQTT
  if (esphome::mqtt::global_mqtt_client != nullptr) {
    const auto &mb = config_.mqtt_broker;
    if (!is_blank_or_whitespace(mb.broker)) {
      char broker_sanitized[MQTT_BROKER_LEN] = {};
      trim_copy(broker_sanitized, sizeof(broker_sanitized), mb.broker);
      if (broker_sanitized[0] != '\0') {
        esphome::mqtt::global_mqtt_client->set_broker_address(std::string(broker_sanitized));
        ESP_LOGI(TAG, "MQTT broker overridden from NVS: %s", broker_sanitized);
      }
    } else {
      ESP_LOGI(TAG, "MQTT broker using YAML default");
    }
    if (mb.port > 0) {
      esphome::mqtt::global_mqtt_client->set_broker_port(mb.port);
      ESP_LOGI(TAG, "MQTT port overridden from NVS: %" PRIu16, mb.port);
    } else {
      ESP_LOGI(TAG, "MQTT port using YAML default");
    }
    if (!is_blank_or_whitespace(mb.username)) {
      char username_sanitized[MQTT_CRED_LEN] = {};
      trim_copy(username_sanitized, sizeof(username_sanitized), mb.username);
      esphome::mqtt::global_mqtt_client->set_username(std::string(username_sanitized));
      ESP_LOGI(TAG, "MQTT username overridden from NVS");
    } else {
      ESP_LOGI(TAG, "MQTT username using YAML default");
    }
    if (!is_blank_or_whitespace(mb.password)) {
      char password_sanitized[MQTT_CRED_LEN] = {};
      trim_copy(password_sanitized, sizeof(password_sanitized), mb.password);
      esphome::mqtt::global_mqtt_client->set_password(std::string(password_sanitized));
      ESP_LOGI(TAG, "MQTT password overridden from NVS");
    } else {
      ESP_LOGI(TAG, "MQTT password using YAML default");
    }
  }
#endif

  ESP_LOGI(TAG, "Config store initialized");
}

void Hv6ConfigStore::loop() {
  // Persistence runs on the dedicated nvs_task_; loop() is intentionally
  // empty so the main loop task is never blocked by an NVS commit.
}

void Hv6ConfigStore::dump_config() {
  ESP_LOGCONFIG(TAG, "HV6 Config Store:");
  ESP_LOGCONFIG(TAG, "  Controller ID: %s", config_.system.controller_id);
  ESP_LOGCONFIG(TAG, "  Supply temp: %.1f°C", config_.system.supply_temp_c);
  ESP_LOGCONFIG(TAG, "  Manifold type: %s", config_.manifold_type == ManifoldType::NC ? "NC" : "NO");
  for (uint8_t i = 0; i < NUM_ZONES; i++) {
    ESP_LOGCONFIG(TAG, "  Zone %d: %s, setpoint=%.1f°C, max=%.0f%%",
                  i + 1, config_.zones[i].enabled ? "enabled" : "disabled",
                  config_.zones[i].setpoint_c, config_.zones[i].max_opening_pct);
  }
}

DeviceConfig Hv6ConfigStore::get_config() const {
  if (mutex_ == nullptr)
    return config_;
  xSemaphoreTake(mutex_, portMAX_DELAY);
  DeviceConfig copy = config_;
  xSemaphoreGive(mutex_);
  return copy;
}

MotorConfig Hv6ConfigStore::get_motor_config() const {
  if (mutex_ == nullptr)
    return config_.motor;
  xSemaphoreTake(mutex_, portMAX_DELAY);
  MotorConfig copy = config_.motor;
  xSemaphoreGive(mutex_);
  return copy;
}

ZoneConfig Hv6ConfigStore::get_zone_config(uint8_t zone) const {
  if (zone >= NUM_ZONES)
    return {};
  if (mutex_ == nullptr)
    return config_.zones[zone];
  xSemaphoreTake(mutex_, portMAX_DELAY);
  ZoneConfig copy = config_.zones[zone];
  xSemaphoreGive(mutex_);
  return copy;
}

bool Hv6ConfigStore::get_simple_preheat_enabled() const {
  if (mutex_ == nullptr)
    return config_.control.simple_preheat_enabled;
  xSemaphoreTake(mutex_, portMAX_DELAY);
  bool val = config_.control.simple_preheat_enabled;
  xSemaphoreGive(mutex_);
  return val;
}

ManifoldType Hv6ConfigStore::get_manifold_type() const {
  if (mutex_ == nullptr)
    return config_.manifold_type;
  xSemaphoreTake(mutex_, portMAX_DELAY);
  ManifoldType val = config_.manifold_type;
  xSemaphoreGive(mutex_);
  return val;
}

ProbeConfig Hv6ConfigStore::get_probe_config() const {
  if (mutex_ == nullptr)
    return config_.probes;
  xSemaphoreTake(mutex_, portMAX_DELAY);
  ProbeConfig copy = config_.probes;
  xSemaphoreGive(mutex_);
  return copy;
}

TempSource Hv6ConfigStore::get_zone_temp_source(uint8_t zone) const {
  if (zone >= NUM_ZONES)
    return TempSource::LOCAL_PROBE;
  if (mutex_ == nullptr)
    return config_.mqtt_temp.zone_temp_source[zone];
  xSemaphoreTake(mutex_, portMAX_DELAY);
  TempSource val = config_.mqtt_temp.zone_temp_source[zone];
  xSemaphoreGive(mutex_);
  return val;
}

void Hv6ConfigStore::get_zone_mqtt_strings(uint8_t zone, char *device, size_t dev_len, char *ble, size_t ble_len) const {
  if (zone >= NUM_ZONES) {
    if (device && dev_len) device[0] = '\0';
    if (ble && ble_len) ble[0] = '\0';
    return;
  }
  if (mutex_ == nullptr) {
    if (device && dev_len) { strncpy(device, config_.mqtt_temp.zone_mqtt_device[zone], dev_len - 1); device[dev_len - 1] = '\0'; }
    if (ble && ble_len)    { strncpy(ble,    config_.mqtt_temp.zone_ble_mac[zone],        ble_len - 1); ble[ble_len - 1] = '\0'; }
    return;
  }
  xSemaphoreTake(mutex_, portMAX_DELAY);
  if (device && dev_len) { strncpy(device, config_.mqtt_temp.zone_mqtt_device[zone], dev_len - 1); device[dev_len - 1] = '\0'; }
  if (ble && ble_len)    { strncpy(ble,    config_.mqtt_temp.zone_ble_mac[zone],        ble_len - 1); ble[ble_len - 1] = '\0'; }
  xSemaphoreGive(mutex_);
}

void Hv6ConfigStore::set_config(const DeviceConfig &config) {
  if (mutex_ == nullptr) {
    config_ = config;
    mark_dirty();
    return;
  }
  xSemaphoreTake(mutex_, portMAX_DELAY);
  config_ = config;
  xSemaphoreGive(mutex_);
  mark_dirty();
}

void Hv6ConfigStore::mark_dirty() {
  if (!initialized_ || !dirty_timer_)
    return;
  esp_timer_stop(dirty_timer_);
  esp_timer_start_once(dirty_timer_, DIRTY_DELAY_US);
}

void Hv6ConfigStore::update_zone(uint8_t zone, const ZoneConfig &zone_cfg) {
  if (zone >= NUM_ZONES)
    return;
  if (mutex_ == nullptr) {
    config_.zones[zone] = zone_cfg;
    mark_dirty();
    return;
  }
  xSemaphoreTake(mutex_, portMAX_DELAY);
  config_.zones[zone] = zone_cfg;
  xSemaphoreGive(mutex_);
  mark_dirty();
}

void Hv6ConfigStore::update_control(const ControlConfig &ctrl) {
  if (mutex_ == nullptr) {
    config_.control = ctrl;
    mark_dirty();
    return;
  }
  xSemaphoreTake(mutex_, portMAX_DELAY);
  config_.control = ctrl;
  xSemaphoreGive(mutex_);
  mark_dirty();
}

void Hv6ConfigStore::update_probes(const ProbeConfig &probes) {
  if (mutex_ == nullptr) {
    config_.probes = probes;
    mark_dirty();
    return;
  }
  xSemaphoreTake(mutex_, portMAX_DELAY);
  config_.probes = probes;
  xSemaphoreGive(mutex_);
  mark_dirty();
}

void Hv6ConfigStore::update_pid(const PIDParams &pid) {
  if (mutex_ == nullptr) {
    config_.pid = pid;
    mark_dirty();
    return;
  }
  xSemaphoreTake(mutex_, portMAX_DELAY);
  config_.pid = pid;
  xSemaphoreGive(mutex_);
  mark_dirty();
}

void Hv6ConfigStore::update_motor(const MotorConfig &motor) {
  if (mutex_ == nullptr) {
    config_.motor = motor;
    mark_dirty();
    return;
  }
  xSemaphoreTake(mutex_, portMAX_DELAY);
  config_.motor = motor;
  xSemaphoreGive(mutex_);
  mark_dirty();
}

void Hv6ConfigStore::update_mqtt_temp(const MqttTempConfig &mqtt_temp) {
  if (mutex_ == nullptr) {
    config_.mqtt_temp = mqtt_temp;
    mark_dirty();
    return;
  }
  xSemaphoreTake(mutex_, portMAX_DELAY);
  config_.mqtt_temp = mqtt_temp;
  xSemaphoreGive(mutex_);
  mark_dirty();
}

void Hv6ConfigStore::update_balancing(const BalancingConfig &balancing) {
  if (mutex_ == nullptr) {
    config_.balancing = balancing;
    mark_dirty();
    return;
  }
  xSemaphoreTake(mutex_, portMAX_DELAY);
  config_.balancing = balancing;
  xSemaphoreGive(mutex_);
  mark_dirty();
}

void Hv6ConfigStore::update_mqtt_broker(const MqttBrokerConfig &mqtt_broker) {
  MqttBrokerConfig sanitized{};
  sanitized.port = mqtt_broker.port;
  trim_copy(sanitized.broker, sizeof(sanitized.broker), mqtt_broker.broker);
  trim_copy(sanitized.username, sizeof(sanitized.username), mqtt_broker.username);
  trim_copy(sanitized.password, sizeof(sanitized.password), mqtt_broker.password);

  if (mutex_ == nullptr) {
    config_.mqtt_broker = sanitized;
    mark_dirty();
    return;
  }
  xSemaphoreTake(mutex_, portMAX_DELAY);
  config_.mqtt_broker = sanitized;
  xSemaphoreGive(mutex_);
  mark_dirty();
}

HeliosConfig Hv6ConfigStore::get_helios_config() const {
  if (mutex_ == nullptr)
    return config_.helios;
  xSemaphoreTake(mutex_, portMAX_DELAY);
  HeliosConfig copy = config_.helios;
  xSemaphoreGive(mutex_);
  return copy;
}

void Hv6ConfigStore::update_helios(const HeliosConfig &helios) {
  HeliosConfig sanitized = helios;
  trim_copy(sanitized.host, sizeof(sanitized.host), helios.host);
  trim_copy(sanitized.controller_id, sizeof(sanitized.controller_id), helios.controller_id);
  trim_copy(sanitized.mdns_host, sizeof(sanitized.mdns_host), helios.mdns_host);
  if (sanitized.port == 0)
    sanitized.port = 8080;
  sanitized.poll_interval_s = std::max<uint16_t>(5, sanitized.poll_interval_s);
  sanitized.stale_after_s = std::max<uint16_t>(10, sanitized.stale_after_s);
  sanitized.mdns_resolve_interval_s = std::max<uint16_t>(15, sanitized.mdns_resolve_interval_s);

  if (mutex_ == nullptr) {
    config_.helios = sanitized;
    mark_dirty();
    return;
  }
  xSemaphoreTake(mutex_, portMAX_DELAY);
  config_.helios = sanitized;
  xSemaphoreGive(mutex_);
  mark_dirty();
}

void Hv6ConfigStore::save_motor_telemetry(uint8_t motor, const MotorTelemetry &telemetry) {
  if (motor >= NUM_ZONES)
    return;

  nvs_handle_t handle;
  if (nvs_open(NVS_NAMESPACE, NVS_READWRITE, &handle) != ESP_OK)
    return;

  char key[8];
  snprintf(key, sizeof(key), "%s%d", KEY_MOTOR_PFX, motor);
  nvs_set_blob(handle, key, &telemetry, sizeof(MotorTelemetry));
  nvs_commit(handle);
  nvs_close(handle);
}

bool Hv6ConfigStore::load_motor_telemetry(uint8_t motor, MotorTelemetry &telemetry) {
  if (motor >= NUM_ZONES)
    return false;

  nvs_handle_t handle;
  if (nvs_open(NVS_NAMESPACE, NVS_READONLY, &handle) != ESP_OK)
    return false;

  char key[8];
  snprintf(key, sizeof(key), "%s%d", KEY_MOTOR_PFX, motor);
  size_t size = 0;
  esp_err_t err = nvs_get_blob(handle, key, nullptr, &size);
  if (err != ESP_OK) {
    nvs_close(handle);
    return false;
  }

  if (size == sizeof(MotorTelemetry)) {
    size_t read_size = sizeof(MotorTelemetry);
    err = nvs_get_blob(handle, key, &telemetry, &read_size);
  } else if (size == sizeof(LegacyMotorTelemetryV8)) {
    LegacyMotorTelemetryV8 legacy{};
    size_t read_size = sizeof(LegacyMotorTelemetryV8);
    err = nvs_get_blob(handle, key, &legacy, &read_size);
    if (err == ESP_OK)
      telemetry = migrate_v8_telemetry(legacy);
  } else {
    err = ESP_ERR_NVS_INVALID_LENGTH;
  }
  nvs_close(handle);
  return err == ESP_OK;
}

bool Hv6ConfigStore::erase_namespace() {
  if (!initialized_)
    return false;

  // Prevent a deferred write from racing with the erase operation.
  if (dirty_timer_)
    esp_timer_stop(dirty_timer_);

  nvs_handle_t handle;
  esp_err_t err = nvs_open(NVS_NAMESPACE, NVS_READWRITE, &handle);
  if (err != ESP_OK) {
    ESP_LOGE(TAG, "NVS open for erase failed: %s", esp_err_to_name(err));
    return false;
  }

  err = nvs_erase_all(handle);
  if (err != ESP_OK) {
    ESP_LOGE(TAG, "NVS erase failed: %s", esp_err_to_name(err));
    nvs_close(handle);
    return false;
  }

  err = nvs_commit(handle);
  nvs_close(handle);
  if (err != ESP_OK) {
    ESP_LOGE(TAG, "NVS commit after erase failed: %s", esp_err_to_name(err));
    return false;
  }

  ESP_LOGW(TAG, "Erased NVS namespace '%s'", NVS_NAMESPACE);
  return true;
}

bool Hv6ConfigStore::erase_namespace_and_restart() {
  if (!erase_namespace())
    return false;

  ESP_LOGW(TAG, "Restarting after NVS erase");
  esp_restart();
  return true;
}

// =============================================================================
// Private
// =============================================================================

void Hv6ConfigStore::load_config_() {
  nvs_handle_t handle;
  esp_err_t err = nvs_open(NVS_NAMESPACE, NVS_READONLY, &handle);
  if (err == ESP_ERR_NVS_NOT_FOUND) {
    ESP_LOGI(TAG, "No saved config, using defaults");
    return;
  }
  if (err != ESP_OK) {
    ESP_LOGW(TAG, "NVS open failed: %s", esp_err_to_name(err));
    return;
  }

  size_t stored_size = 0;
  err = nvs_get_blob(handle, KEY_CONFIG, nullptr, &stored_size);
  if (err == ESP_OK && stored_size > 0) {
    std::vector<uint8_t> raw(stored_size);
    size_t read_size = stored_size;
    err = nvs_get_blob(handle, KEY_CONFIG, raw.data(), &read_size);
    if (err == ESP_OK) {
      // Check config version before applying — if the stored blob has an
      // incompatible version (or no version field at all), discard it and
      // keep the fresh C++ defaults.
      uint32_t stored_version = 0;
      if (read_size >= sizeof(uint32_t))
        memcpy(&stored_version, raw.data(), sizeof(uint32_t));

      if (stored_version == CONFIG_VERSION && read_size == sizeof(DeviceConfig)) {
        xSemaphoreTake(mutex_, portMAX_DELAY);
        memcpy(&config_, raw.data(), sizeof(DeviceConfig));
        xSemaphoreGive(mutex_);
        ESP_LOGI(TAG, "Config loaded (%u bytes, version %" PRIu32 ")", (unsigned) read_size, stored_version);
      } else if (stored_version == 8 && read_size == sizeof(LegacyDeviceConfigV8)) {
        // Legacy binary migration proved fragile across ABI/layout changes.
        // Keep safe defaults and persist fresh config for current version instead.
        ESP_LOGW(TAG, "Legacy v8 config detected; using safe defaults for v%" PRIu32, CONFIG_VERSION);
        mark_dirty();
      } else if (stored_version == 9 && read_size == sizeof(LegacyDeviceConfigV9)) {
        LegacyDeviceConfigV9 legacy{};
        memcpy(&legacy, raw.data(), sizeof(legacy));
        DeviceConfig migrated = migrate_v9_config(legacy);
        xSemaphoreTake(mutex_, portMAX_DELAY);
        config_ = migrated;
        xSemaphoreGive(mutex_);
        ESP_LOGW(TAG, "Migrated config v9 -> v%" PRIu32, CONFIG_VERSION);
        mark_dirty();
      } else if (stored_version == 10 && read_size == sizeof(LegacyDeviceConfigV10)) {
        LegacyDeviceConfigV10 legacy{};
        memcpy(&legacy, raw.data(), sizeof(legacy));
        DeviceConfig migrated = migrate_v10_config(legacy);
        xSemaphoreTake(mutex_, portMAX_DELAY);
        config_ = migrated;
        xSemaphoreGive(mutex_);
        ESP_LOGW(TAG, "Migrated config v10 -> v%" PRIu32, CONFIG_VERSION);
        mark_dirty();
      } else if (stored_version == 11 && read_size == sizeof(LegacyDeviceConfigV11)) {
        LegacyDeviceConfigV11 legacy{};
        memcpy(&legacy, raw.data(), sizeof(legacy));
        DeviceConfig migrated = migrate_v11_config(legacy);
        xSemaphoreTake(mutex_, portMAX_DELAY);
        config_ = migrated;
        xSemaphoreGive(mutex_);
        ESP_LOGW(TAG, "Migrated config v11 -> v%" PRIu32, CONFIG_VERSION);
        mark_dirty();
      } else if (stored_version == 12 && read_size == sizeof(LegacyDeviceConfigV12)) {
        LegacyDeviceConfigV12 legacy{};
        memcpy(&legacy, raw.data(), sizeof(legacy));
        DeviceConfig migrated = migrate_v12_config(legacy);
        xSemaphoreTake(mutex_, portMAX_DELAY);
        config_ = migrated;
        xSemaphoreGive(mutex_);
        ESP_LOGW(TAG, "Migrated config v12 -> v%" PRIu32, CONFIG_VERSION);
        mark_dirty();
      } else if (read_size != sizeof(DeviceConfig)) {
        ESP_LOGW(TAG,
                 "Config size mismatch for version %" PRIu32 " (stored %u vs expected %u), using defaults",
                 stored_version, static_cast<unsigned>(read_size),
                 static_cast<unsigned>(sizeof(DeviceConfig)));
      } else {
        ESP_LOGW(TAG, "Config version mismatch (stored %" PRIu32 " vs expected %" PRIu32 "), using defaults",
                 stored_version, CONFIG_VERSION);
      }
    }
  }

  nvs_close(handle);
}

void Hv6ConfigStore::save_config_() {
  if (mutex_ == nullptr)
    return;

  DeviceConfig snapshot;
  xSemaphoreTake(mutex_, portMAX_DELAY);
  snapshot = config_;
  xSemaphoreGive(mutex_);

  nvs_handle_t handle;
  if (nvs_open(NVS_NAMESPACE, NVS_READWRITE, &handle) != ESP_OK)
    return;

  nvs_set_blob(handle, KEY_CONFIG, &snapshot, sizeof(DeviceConfig));

  nvs_commit(handle);
  nvs_close(handle);
  ESP_LOGI(TAG, "Config saved to NVS");
}

void Hv6ConfigStore::dirty_timer_cb_(void *arg) {
  auto *store = static_cast<Hv6ConfigStore *>(arg);
  if (store == nullptr)
    return;
  // Mark dirty (legacy flag preserved for diagnostics) and wake the NVS
  // task. xSemaphoreGive coalesces \u2014 if the task is already running, the
  // pending give is harmless and the next iteration will pick up the
  // newest snapshot.
  store->save_pending_ = true;
  if (store->save_sem_ != nullptr)
    xSemaphoreGive(store->save_sem_);
}

void Hv6ConfigStore::nvs_task_entry_(void *arg) {
  auto *store = static_cast<Hv6ConfigStore *>(arg);
  if (store != nullptr)
    store->nvs_task_loop_();
  vTaskDelete(nullptr);
}

void Hv6ConfigStore::nvs_task_loop_() {
  ESP_LOGI(TAG, "NVS persistence task started (core %d, prio %u, stack %u)",
           (int) NVS_TASK_CORE, (unsigned) NVS_TASK_PRIO, (unsigned) NVS_TASK_STACK);
  for (;;) {
    if (xSemaphoreTake(save_sem_, portMAX_DELAY) != pdTRUE)
      continue;
    // Coalesce bursts: drain any additional gives so we don't write twice
    // for a back-to-back batch of dirty marks.
    while (xSemaphoreTake(save_sem_, 0) == pdTRUE) {
    }
    save_pending_ = false;
    save_config_();
  }
}

}  // namespace hv6
