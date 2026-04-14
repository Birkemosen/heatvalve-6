// =============================================================================
// HV6 Config Store — ESPHome Component Implementation
// =============================================================================

#include "hv6_config_store.h"
#include "esphome/core/log.h"
#include <cinttypes>
#include <cstring>
#include <algorithm>
#include <vector>
#include "esp_system.h"

#ifdef USE_MQTT
#include "esphome/components/mqtt/mqtt_client.h"
#endif

namespace hv6 {

static const char *const TAG = "hv6_config_store";

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

  initialized_ = true;
  load_config_();

  // Apply NVS MQTT broker settings before MQTT component connects.
  // Config store runs at HARDWARE priority (800), MQTT at AFTER_WIFI (250),
  // so these overrides are in place before mqtt_client::setup().
#ifdef USE_MQTT
  if (esphome::mqtt::global_mqtt_client != nullptr) {
    const auto &mb = config_.mqtt_broker;
    if (mb.broker[0] != '\0') {
      esphome::mqtt::global_mqtt_client->set_broker_address(std::string(mb.broker));
      ESP_LOGI(TAG, "MQTT broker overridden from NVS: %s", mb.broker);
    }
    if (mb.port > 0) {
      esphome::mqtt::global_mqtt_client->set_broker_port(mb.port);
      ESP_LOGI(TAG, "MQTT port overridden from NVS: %" PRIu16, mb.port);
    }
    if (mb.username[0] != '\0') {
      esphome::mqtt::global_mqtt_client->set_username(std::string(mb.username));
      ESP_LOGI(TAG, "MQTT username overridden from NVS");
    }
    if (mb.password[0] != '\0') {
      esphome::mqtt::global_mqtt_client->set_password(std::string(mb.password));
    }
  }
#endif

  ESP_LOGI(TAG, "Config store initialized");
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
  xSemaphoreTake(mutex_, portMAX_DELAY);
  DeviceConfig copy = config_;
  xSemaphoreGive(mutex_);
  return copy;
}

void Hv6ConfigStore::set_config(const DeviceConfig &config) {
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
  xSemaphoreTake(mutex_, portMAX_DELAY);
  config_.zones[zone] = zone_cfg;
  xSemaphoreGive(mutex_);
  mark_dirty();
}

void Hv6ConfigStore::update_control(const ControlConfig &ctrl) {
  xSemaphoreTake(mutex_, portMAX_DELAY);
  config_.control = ctrl;
  xSemaphoreGive(mutex_);
  mark_dirty();
}

void Hv6ConfigStore::update_probes(const ProbeConfig &probes) {
  xSemaphoreTake(mutex_, portMAX_DELAY);
  config_.probes = probes;
  xSemaphoreGive(mutex_);
  mark_dirty();
}

void Hv6ConfigStore::update_pid(const PIDParams &pid) {
  xSemaphoreTake(mutex_, portMAX_DELAY);
  config_.pid = pid;
  xSemaphoreGive(mutex_);
  mark_dirty();
}

void Hv6ConfigStore::update_motor(const MotorConfig &motor) {
  xSemaphoreTake(mutex_, portMAX_DELAY);
  config_.motor = motor;
  xSemaphoreGive(mutex_);
  mark_dirty();
}

void Hv6ConfigStore::update_mqtt_temp(const MqttTempConfig &mqtt_temp) {
  xSemaphoreTake(mutex_, portMAX_DELAY);
  config_.mqtt_temp = mqtt_temp;
  xSemaphoreGive(mutex_);
  mark_dirty();
}

void Hv6ConfigStore::update_balancing(const BalancingConfig &balancing) {
  xSemaphoreTake(mutex_, portMAX_DELAY);
  config_.balancing = balancing;
  xSemaphoreGive(mutex_);
  mark_dirty();
}

void Hv6ConfigStore::update_mqtt_broker(const MqttBrokerConfig &mqtt_broker) {
  xSemaphoreTake(mutex_, portMAX_DELAY);
  config_.mqtt_broker = mqtt_broker;
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
  size_t size = sizeof(MotorTelemetry);
  esp_err_t err = nvs_get_blob(handle, key, &telemetry, &size);
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

      if (stored_version != CONFIG_VERSION) {
        ESP_LOGW(TAG, "Config version mismatch (stored %" PRIu32 " vs expected %" PRIu32 "), using defaults",
                 stored_version, CONFIG_VERSION);
      } else if (read_size != sizeof(DeviceConfig)) {
        ESP_LOGW(TAG,
                 "Config size mismatch for version %" PRIu32 " (stored %u vs expected %u), using defaults",
                 stored_version, static_cast<unsigned>(read_size),
                 static_cast<unsigned>(sizeof(DeviceConfig)));
      } else {
        xSemaphoreTake(mutex_, portMAX_DELAY);
        memcpy(&config_, raw.data(), sizeof(DeviceConfig));
        xSemaphoreGive(mutex_);
        ESP_LOGI(TAG, "Config loaded (%u bytes, version %" PRIu32 ")", (unsigned) read_size, stored_version);
      }
    }
  }

  nvs_close(handle);
}

void Hv6ConfigStore::save_config_() {
  nvs_handle_t handle;
  if (nvs_open(NVS_NAMESPACE, NVS_READWRITE, &handle) != ESP_OK)
    return;

  xSemaphoreTake(mutex_, portMAX_DELAY);
  nvs_set_blob(handle, KEY_CONFIG, &config_, sizeof(DeviceConfig));
  xSemaphoreGive(mutex_);

  nvs_commit(handle);
  nvs_close(handle);
  ESP_LOGI(TAG, "Config saved to NVS");
}

void Hv6ConfigStore::dirty_timer_cb_(void *arg) {
  auto *store = static_cast<Hv6ConfigStore *>(arg);
  store->save_config_();
}

}  // namespace hv6
