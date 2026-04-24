#pragma once

#include "esphome/components/hv6_config_store/hv6_config_store.h"
#include "esphome/components/hv6_zone_controller/hv6_zone_controller.h"
#include "esphome/components/sensor/sensor.h"
#include "esphome/components/text_sensor/text_sensor.h"
#include "esphome/components/web_server_base/web_server_base.h"
#include "esphome/core/component.h"
#include "esphome/core/progmem.h"
#include <freertos/FreeRTOS.h>
#include <freertos/semphr.h>
#include <string>
#include <vector>

#ifdef HV6_HAS_DASHBOARD_JS
extern const uint8_t HV6_DASHBOARD_JS_DATA[] PROGMEM;
extern const size_t HV6_DASHBOARD_JS_SIZE;
#endif

namespace esphome {
namespace hv6_dashboard {

static constexpr size_t SNAPSHOT_TEXT_LEN = 64;

struct DashboardSnapshot {
  // --- scalar sensors ---
  uint32_t uptime_s;
  float    wifi_dbm;
  float    manifold_flow_c;
  float    manifold_return_c;
  float    zone_temp_c[6];
  float    zone_valve_pct[6];
  float    zone_preheat_c[6];
  float    motor_open_ripple[6];
  float    motor_close_ripple[6];
  float    motor_open_factor[6];
  float    motor_close_factor[6];
  float    probe_temp_c[8];

  // --- text sensors: fixed-size char arrays, null-terminated, pre-sanitized ---
  char firmware_version[SNAPSHOT_TEXT_LEN];
  char ip_address[SNAPSHOT_TEXT_LEN];
  char connected_ssid[SNAPSHOT_TEXT_LEN];
  char mac_address[SNAPSHOT_TEXT_LEN];
  char zone_state[6][SNAPSHOT_TEXT_LEN];
  char motor_fault[6][SNAPSHOT_TEXT_LEN];

  // --- live runtime flags ---
  bool drivers_enabled;

  // --- full config copies (POD structs, safe to memcpy) ---
  hv6::ZoneConfig   zones[hv6::NUM_ZONES];
  hv6::TempSource   zone_temp_source[hv6::NUM_ZONES];
  char              zone_mqtt_dev[hv6::NUM_ZONES][hv6::MQTT_DEVICE_NAME_LEN];
  char              zone_ble_mac[hv6::NUM_ZONES][hv6::BLE_MAC_LEN];
  hv6::ProbeConfig  probes;
  hv6::MotorConfig  motor;
  hv6::ManifoldType manifold_type;
  bool              simple_preheat_enabled;
  hv6::HeliosConfig helios;             // current helios config
  char              helios_status[16];  // "active"|"degraded"|"offline"
  char              helios_device_id[33]; // system.controller_id fallback
};

struct DashboardAction {
  std::string key;
  std::string value_str;
  float num_val;
  int zone;
  bool has_num;
  bool has_str;
  bool zone_valid;
  uint8_t zi;
};

// -----------------------------------------------------------------------
// Zone-state history ring buffer
// Samples every HISTORY_INTERVAL_MS, keeps HISTORY_SLOTS entries (24 h).
// Each entry: uptime_s + one uint8_t per zone (ZoneDisplayState, 0xFF=unknown).
// Total RAM: HISTORY_SLOTS * (4 + NUM_ZONES) bytes = 288 * 10 = 2880 bytes.
// -----------------------------------------------------------------------
static constexpr uint16_t HISTORY_SLOTS         = 288;       // 24 h at 5 min
static constexpr uint32_t HISTORY_INTERVAL_MS   = 5 * 60 * 1000UL;
static constexpr uint8_t  HISTORY_STATE_UNKNOWN = 0xFF;

struct HistoryEntry {
  uint32_t uptime_s;
  uint8_t  zone_state[hv6::NUM_ZONES];
};

class HV6Dashboard : public Component, public AsyncWebHandler {
 public:
  void setup() override;
  void loop() override;
  float get_setup_priority() const override { return setup_priority::WIFI - 1.0f; }

  void set_web_server_base(web_server_base::WebServerBase *b) { this->base_ = b; }
  void set_zone_controller(hv6::Hv6ZoneController *controller) { this->zone_controller_ = controller; }
  void set_valve_controller(hv6::Hv6ValveController *ctrl) { this->valve_controller_ = ctrl; }
  void set_config_store(hv6::Hv6ConfigStore *store) { this->config_store_ = store; }
  void set_helios_client(esphome::Component *client) { this->helios_client_ = client; }
  void set_wifi_signal_sensor(sensor::Sensor *sensor) { this->wifi_signal_sensor_ = sensor; }
  void set_manifold_flow_sensor(sensor::Sensor *s) { this->manifold_flow_sensor_ = s; }
  void set_manifold_return_sensor(sensor::Sensor *s) { this->manifold_return_sensor_ = s; }
  void set_zone_temp_sensor(uint8_t index, sensor::Sensor *s) {
    if (index < 6) this->zone_temp_sensors_[index] = s;
  }
  void set_zone_valve_sensor(uint8_t index, sensor::Sensor *s) {
    if (index < 6) this->zone_valve_sensors_[index] = s;
  }
  void set_zone_preheat_sensor(uint8_t index, sensor::Sensor *s) {
    if (index < 6) this->zone_preheat_sensors_[index] = s;
  }
  void set_motor_open_ripple_sensor(uint8_t index, sensor::Sensor *s) {
    if (index < 6) this->motor_open_ripple_sensors_[index] = s;
  }
  void set_motor_close_ripple_sensor(uint8_t index, sensor::Sensor *s) {
    if (index < 6) this->motor_close_ripple_sensors_[index] = s;
  }
  void set_motor_open_factor_sensor(uint8_t index, sensor::Sensor *s) {
    if (index < 6) this->motor_open_factor_sensors_[index] = s;
  }
  void set_motor_close_factor_sensor(uint8_t index, sensor::Sensor *s) {
    if (index < 6) this->motor_close_factor_sensors_[index] = s;
  }
  void set_probe_temp_sensor(uint8_t index, sensor::Sensor *s) {
    if (index < 8) this->probe_temp_sensors_[index] = s;
  }
  void set_firmware_version_text(text_sensor::TextSensor *text) { this->firmware_version_text_ = text; }
  void set_ip_address_text(text_sensor::TextSensor *text) { this->ip_address_text_ = text; }
  void set_connected_ssid_text(text_sensor::TextSensor *text) { this->connected_ssid_text_ = text; }
  void set_mac_address_text(text_sensor::TextSensor *text) { this->mac_address_text_ = text; }
  void set_zone_state_sensor(uint8_t index, text_sensor::TextSensor *s) {
    if (index < 6) this->zone_state_sensors_[index] = s;
  }
  void set_motor_fault_sensor(uint8_t index, text_sensor::TextSensor *s) {
    if (index < 6) this->motor_fault_sensors_[index] = s;
  }

  bool canHandle(AsyncWebServerRequest *request) const override;
  void handleRequest(AsyncWebServerRequest *request) override;
  bool isRequestHandlerTrivial() const override { return false; }

 protected:
  void handle_root_(AsyncWebServerRequest *request);
  void handle_js_(AsyncWebServerRequest *request);
  void handle_state_(AsyncWebServerRequest *request);
  void handle_history_(AsyncWebServerRequest *request);
  void handle_set_(AsyncWebServerRequest *request);
  void dispatch_set_(const DashboardAction &act);
  void sample_history_();

  web_server_base::WebServerBase *base_{nullptr};
  hv6::Hv6ZoneController *zone_controller_{nullptr};
  hv6::Hv6ValveController *valve_controller_{nullptr};
  hv6::Hv6ConfigStore *config_store_{nullptr};
  esphome::Component *helios_client_{nullptr};
  sensor::Sensor *wifi_signal_sensor_{nullptr};
  sensor::Sensor *manifold_flow_sensor_{nullptr};
  sensor::Sensor *manifold_return_sensor_{nullptr};
  sensor::Sensor *zone_temp_sensors_[6]{};
  sensor::Sensor *zone_valve_sensors_[6]{};
  sensor::Sensor *zone_preheat_sensors_[6]{};
  sensor::Sensor *motor_open_ripple_sensors_[6]{};
  sensor::Sensor *motor_close_ripple_sensors_[6]{};
  sensor::Sensor *motor_open_factor_sensors_[6]{};
  sensor::Sensor *motor_close_factor_sensors_[6]{};
  sensor::Sensor *probe_temp_sensors_[8]{};
  text_sensor::TextSensor *firmware_version_text_{nullptr};
  text_sensor::TextSensor *ip_address_text_{nullptr};
  text_sensor::TextSensor *connected_ssid_text_{nullptr};
  text_sensor::TextSensor *mac_address_text_{nullptr};
  text_sensor::TextSensor *zone_state_sensors_[6]{};
  text_sensor::TextSensor *motor_fault_sensors_[6]{};

  SemaphoreHandle_t action_lock_{nullptr};
  std::vector<DashboardAction> action_queue_;

  SemaphoreHandle_t snapshot_lock_{nullptr};
  DashboardSnapshot snapshot_{};
  uint32_t snapshot_last_ms_{0};
  bool snapshot_ready_{false};
  static constexpr uint32_t SNAPSHOT_INTERVAL_MS = 1000;
  void update_snapshot_();

  // History ring buffer (protected by history_lock_)
  SemaphoreHandle_t history_lock_{nullptr};
  HistoryEntry history_ring_[HISTORY_SLOTS]{};
  uint16_t history_head_{0};
  uint16_t history_count_{0};
  uint32_t history_last_sample_ms_{0};
};

}  // namespace hv6_dashboard
}  // namespace esphome