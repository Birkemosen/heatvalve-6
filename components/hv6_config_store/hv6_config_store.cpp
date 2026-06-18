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

// Persist/restore an arbitrary POD config section under its own NVS key with an
// independent version tag, so it survives the version-based discard of the main
// `config` blob on a CONFIG_VERSION bump (same rationale as the zone/sensor
// blobs). Bump the matching *_CONFIG_VERSION only when that struct's layout
// changes — that resets just that section, not the whole configuration.
template<typename T>
void save_section(nvs_handle_t handle, const char *key, uint32_t version, const T &obj) {
  uint8_t blob[sizeof(uint32_t) + sizeof(T)];
  std::memcpy(blob, &version, sizeof(uint32_t));
  std::memcpy(blob + sizeof(uint32_t), &obj, sizeof(T));
  nvs_set_blob(handle, key, blob, sizeof(blob));
}

/// Overlays `out` and returns true iff a matching-size, matching-version blob exists.
template<typename T>
bool load_section(nvs_handle_t handle, const char *key, uint32_t version, T &out) {
  size_t size = 0;
  if (nvs_get_blob(handle, key, nullptr, &size) != ESP_OK)
    return false;  // no durable copy yet (first boot, or pre-upgrade firmware)
  if (size != sizeof(uint32_t) + sizeof(T))
    return false;  // layout changed — keep whatever the main blob/defaults gave
  uint8_t blob[sizeof(uint32_t) + sizeof(T)];
  size_t read_size = size;
  if (nvs_get_blob(handle, key, blob, &read_size) != ESP_OK)
    return false;
  uint32_t v = 0;
  std::memcpy(&v, blob, sizeof(uint32_t));
  if (v != version)
    return false;
  std::memcpy(&out, blob + sizeof(uint32_t), sizeof(T));
  return true;
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
    return config_.sensor_config.zone_temp_source[zone];
  xSemaphoreTake(mutex_, portMAX_DELAY);
  TempSource val = config_.sensor_config.zone_temp_source[zone];
  xSemaphoreGive(mutex_);
  return val;
}

void Hv6ConfigStore::get_zone_ble_mac_str(uint8_t zone, char *ble, size_t ble_len) const {
  if (zone >= NUM_ZONES) {
    if (ble && ble_len) ble[0] = '\0';
    return;
  }
  if (mutex_ == nullptr) {
    if (ble && ble_len) { strncpy(ble, config_.sensor_config.zone_ble_mac[zone], ble_len - 1); ble[ble_len - 1] = '\0'; }
    return;
  }
  xSemaphoreTake(mutex_, portMAX_DELAY);
  if (ble && ble_len) { strncpy(ble, config_.sensor_config.zone_ble_mac[zone], ble_len - 1); ble[ble_len - 1] = '\0'; }
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

void Hv6ConfigStore::update_sensor_config(const SensorConfig &sensor_config) {
  if (mutex_ == nullptr) {
    config_.sensor_config = sensor_config;
    mark_dirty();
    return;
  }
  xSemaphoreTake(mutex_, portMAX_DELAY);
  config_.sensor_config = sensor_config;
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

HeliosConfig Hv6ConfigStore::get_helios_config() const {
  if (mutex_ == nullptr)
    return config_.helios;
  xSemaphoreTake(mutex_, portMAX_DELAY);
  HeliosConfig copy = config_.helios;
  xSemaphoreGive(mutex_);
  return copy;
}

AsgardConfig Hv6ConfigStore::get_asgard_config() const {
  if (mutex_ == nullptr)
    return config_.asgard;
  xSemaphoreTake(mutex_, portMAX_DELAY);
  AsgardConfig copy = config_.asgard;
  xSemaphoreGive(mutex_);
  return copy;
}

void Hv6ConfigStore::update_asgard(const AsgardConfig &asgard) {
  AsgardConfig sanitized = asgard;
  trim_copy(sanitized.host, sizeof(sanitized.host), asgard.host);
  trim_copy(sanitized.entity_name, sizeof(sanitized.entity_name), asgard.entity_name);
  trim_copy(sanitized.peer_host, sizeof(sanitized.peer_host), asgard.peer_host);
  if (sanitized.port == 0)
    sanitized.port = 80;
  if (sanitized.peer_port == 0)
    sanitized.peer_port = 80;
  if (sanitized.entity_name[0] == '\0')
    strncpy(sanitized.entity_name, "virtual_thermostat_input_z1", sizeof(sanitized.entity_name) - 1);
  sanitized.push_interval_s = std::max<uint16_t>(5, sanitized.push_interval_s);
  sanitized.peer_stale_after_s = std::max<uint16_t>(30, sanitized.peer_stale_after_s);

  if (mutex_ == nullptr) {
    config_.asgard = sanitized;
    mark_dirty();
    return;
  }
  xSemaphoreTake(mutex_, portMAX_DELAY);
  config_.asgard = sanitized;
  xSemaphoreGive(mutex_);
  mark_dirty();
}

ForecastConfig Hv6ConfigStore::get_forecast_config() const {
  if (mutex_ == nullptr)
    return config_.forecast;
  xSemaphoreTake(mutex_, portMAX_DELAY);
  ForecastConfig copy = config_.forecast;
  xSemaphoreGive(mutex_);
  return copy;
}

void Hv6ConfigStore::update_forecast(const ForecastConfig &forecast) {
  ForecastConfig sanitized = forecast;
  sanitized.latitude = std::max(-90.0f, std::min(90.0f, sanitized.latitude));
  sanitized.longitude = std::max(-180.0f, std::min(180.0f, sanitized.longitude));
  sanitized.fetch_interval_s = std::max<uint16_t>(900, sanitized.fetch_interval_s);
  sanitized.recompute_interval_s = std::max<uint16_t>(60, sanitized.recompute_interval_s);
  sanitized.load_threshold = std::max(0.1f, std::min(10.0f, sanitized.load_threshold));
  sanitized.gain_c_per_load = std::max(0.0f, std::min(2.0f, sanitized.gain_c_per_load));
  sanitized.max_offset_c = std::max(0.0f, std::min(3.0f, sanitized.max_offset_c));
  sanitized.indoor_ref_c = std::max(10.0f, std::min(28.0f, sanitized.indoor_ref_c));

  if (mutex_ == nullptr) {
    config_.forecast = sanitized;
    mark_dirty();
    return;
  }
  xSemaphoreTake(mutex_, portMAX_DELAY);
  config_.forecast = sanitized;
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
  } else {
    err = ESP_ERR_NVS_INVALID_LENGTH;
  }
  nvs_close(handle);
  return err == ESP_OK;
}

// -----------------------------------------------------------------------------
// Sensor pairing (BLE MAC + temp source) — persisted under its own key so it
// survives the version-based discard of the main config blob on firmware update.
// Blob format: [uint32 version][SensorConfig].
// -----------------------------------------------------------------------------

void Hv6ConfigStore::save_sensor_config_(nvs_handle_t handle, const SensorConfig &sensor) {
  uint8_t blob[sizeof(uint32_t) + sizeof(SensorConfig)];
  uint32_t version = SENSOR_CONFIG_VERSION;
  memcpy(blob, &version, sizeof(uint32_t));
  memcpy(blob + sizeof(uint32_t), &sensor, sizeof(SensorConfig));
  nvs_set_blob(handle, KEY_SENSORS, blob, sizeof(blob));
}

bool Hv6ConfigStore::load_sensor_config_(nvs_handle_t handle) {
  size_t size = 0;
  if (nvs_get_blob(handle, KEY_SENSORS, nullptr, &size) != ESP_OK)
    return false;  // no durable copy yet (first boot, or pre-upgrade firmware)
  if (size != sizeof(uint32_t) + sizeof(SensorConfig))
    return false;  // layout changed — fall back to whatever the main blob/defaults gave

  uint8_t blob[sizeof(uint32_t) + sizeof(SensorConfig)];
  size_t read_size = size;
  if (nvs_get_blob(handle, KEY_SENSORS, blob, &read_size) != ESP_OK)
    return false;

  uint32_t version = 0;
  memcpy(&version, blob, sizeof(uint32_t));
  if (version != SENSOR_CONFIG_VERSION)
    return false;

  xSemaphoreTake(mutex_, portMAX_DELAY);
  memcpy(&config_.sensor_config, blob + sizeof(uint32_t), sizeof(SensorConfig));
  xSemaphoreGive(mutex_);
  ESP_LOGI(TAG, "Sensor pairing restored from durable key");
  return true;
}

// -----------------------------------------------------------------------------
// Zone configuration — persisted under its own key so the user's area / pipe /
// exterior-wall settings survive the version-based discard of the main config
// blob on firmware update. Blob format: [uint32 version][ZoneConfig x NUM_ZONES].
// -----------------------------------------------------------------------------

void Hv6ConfigStore::save_zone_config_(nvs_handle_t handle, const ZoneConfig (&zones)[NUM_ZONES]) {
  uint8_t blob[sizeof(uint32_t) + sizeof(ZoneConfig) * NUM_ZONES];
  uint32_t version = ZONE_CONFIG_VERSION;
  memcpy(blob, &version, sizeof(uint32_t));
  memcpy(blob + sizeof(uint32_t), zones, sizeof(ZoneConfig) * NUM_ZONES);
  nvs_set_blob(handle, KEY_ZONES, blob, sizeof(blob));
}

bool Hv6ConfigStore::load_zone_config_(nvs_handle_t handle) {
  size_t size = 0;
  if (nvs_get_blob(handle, KEY_ZONES, nullptr, &size) != ESP_OK)
    return false;  // no durable copy yet (first boot, or pre-upgrade firmware)
  if (size != sizeof(uint32_t) + sizeof(ZoneConfig) * NUM_ZONES)
    return false;  // layout changed — fall back to whatever the main blob/defaults gave

  uint8_t blob[sizeof(uint32_t) + sizeof(ZoneConfig) * NUM_ZONES];
  size_t read_size = size;
  if (nvs_get_blob(handle, KEY_ZONES, blob, &read_size) != ESP_OK)
    return false;

  uint32_t version = 0;
  memcpy(&version, blob, sizeof(uint32_t));
  if (version != ZONE_CONFIG_VERSION)
    return false;

  xSemaphoreTake(mutex_, portMAX_DELAY);
  memcpy(config_.zones, blob + sizeof(uint32_t), sizeof(ZoneConfig) * NUM_ZONES);
  xSemaphoreGive(mutex_);
  ESP_LOGI(TAG, "Zone config restored from durable key");
  return true;
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
      } else {
        ESP_LOGW(TAG, "Config version/size mismatch (stored v%" PRIu32 " %u bytes, expected v%" PRIu32 " %u bytes), using defaults",
                 stored_version, static_cast<unsigned>(read_size),
                 CONFIG_VERSION, static_cast<unsigned>(sizeof(DeviceConfig)));
      }
    }
  }

  // Overlay the durable sensor pairing and zone config on top of whatever the
  // main blob loaded (or the defaults, when the main blob was version-discarded
  // above).
  bool had_durable_sensors = load_sensor_config_(handle);
  bool had_durable_zones = load_zone_config_(handle);

  // Overlay the remaining durable global-settings sections (each independent of
  // CONFIG_VERSION). Done under the mutex; the section loaders are plain memcpys
  // (they don't take the mutex themselves, so no re-entrancy).
  bool had_all_sections = true;
  xSemaphoreTake(mutex_, portMAX_DELAY);
  had_all_sections &= load_section(handle, KEY_SYSTEM, SYSTEM_CONFIG_VERSION, config_.system);
  had_all_sections &= load_section(handle, KEY_CONTROL, CONTROL_CONFIG_VERSION, config_.control);
  had_all_sections &= load_section(handle, KEY_PROBES, PROBE_CONFIG_VERSION, config_.probes);
  had_all_sections &= load_section(handle, KEY_PID, PID_CONFIG_VERSION, config_.pid);
  had_all_sections &= load_section(handle, KEY_MOTOR_CFG, MOTOR_CONFIG_VERSION, config_.motor);
  had_all_sections &= load_section(handle, KEY_MANIFOLD, MANIFOLD_CONFIG_VERSION, config_.manifold_type);
  had_all_sections &= load_section(handle, KEY_BALANCING, BALANCING_CONFIG_VERSION, config_.balancing);
  had_all_sections &= load_section(handle, KEY_ASGARD, ASGARD_CONFIG_VERSION, config_.asgard);
  had_all_sections &= load_section(handle, KEY_FORECAST, FORECAST_CONFIG_VERSION, config_.forecast);
  xSemaphoreGive(mutex_);
  if (had_all_sections)
    ESP_LOGI(TAG, "Global settings restored from durable keys");

  nvs_close(handle);

  // Migration: a returning device whose settings only lived in the main blob has
  // no durable copies yet. Seed them now (deferred commit) while the data is
  // still present, so they survive the next CONFIG_VERSION bump.
  if (!had_durable_sensors || !had_durable_zones || !had_all_sections)
    mark_dirty();
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

  // Mirror the sensor pairing and zone config to their own keys so they outlive
  // a CONFIG_VERSION bump.
  save_sensor_config_(handle, snapshot.sensor_config);
  save_zone_config_(handle, snapshot.zones);

  // Mirror the remaining global-settings sections likewise — each under its own
  // versioned key so a CONFIG_VERSION bump no longer wipes the user's settings.
  save_section(handle, KEY_SYSTEM, SYSTEM_CONFIG_VERSION, snapshot.system);
  save_section(handle, KEY_CONTROL, CONTROL_CONFIG_VERSION, snapshot.control);
  save_section(handle, KEY_PROBES, PROBE_CONFIG_VERSION, snapshot.probes);
  save_section(handle, KEY_PID, PID_CONFIG_VERSION, snapshot.pid);
  save_section(handle, KEY_MOTOR_CFG, MOTOR_CONFIG_VERSION, snapshot.motor);
  save_section(handle, KEY_MANIFOLD, MANIFOLD_CONFIG_VERSION, snapshot.manifold_type);
  save_section(handle, KEY_BALANCING, BALANCING_CONFIG_VERSION, snapshot.balancing);
  save_section(handle, KEY_ASGARD, ASGARD_CONFIG_VERSION, snapshot.asgard);
  save_section(handle, KEY_FORECAST, FORECAST_CONFIG_VERSION, snapshot.forecast);

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
