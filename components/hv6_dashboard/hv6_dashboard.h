#pragma once

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

class HV6Dashboard : public Component, public AsyncWebHandler {
 public:
  void setup() override;
  void loop() override;
  float get_setup_priority() const override { return setup_priority::WIFI - 1.0f; }

  void set_web_server_base(web_server_base::WebServerBase *b) { this->base_ = b; }
  void set_zone_controller(hv6::Hv6ZoneController *controller) { this->zone_controller_ = controller; }
  void set_valve_controller(hv6::Hv6ValveController *ctrl) { this->valve_controller_ = ctrl; }
  void set_config_store(hv6::Hv6ConfigStore *store) { this->config_store_ = store; }
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
  void handle_set_(AsyncWebServerRequest *request);
  void dispatch_set_(const DashboardAction &act);

  web_server_base::WebServerBase *base_{nullptr};
  hv6::Hv6ZoneController *zone_controller_{nullptr};
  hv6::Hv6ValveController *valve_controller_{nullptr};
  hv6::Hv6ConfigStore *config_store_{nullptr};
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
};

}  // namespace hv6_dashboard
}  // namespace esphome