// =============================================================================
// HV6 Config Store — ESPHome Component Header
// =============================================================================
// NVS persistence for device configuration, zone settings, and motor telemetry.
// Ported from lib/config_store/ with ESPHome Component lifecycle.
// =============================================================================

#pragma once

#include "esphome/core/component.h"
#include "hv6_types.h"
#include "nvs.h"
#include "nvs_flash.h"
#include "esp_timer.h"

namespace hv6 {

class Hv6ConfigStore : public esphome::Component {
 public:
  float get_setup_priority() const override { return esphome::setup_priority::HARDWARE; }
  void setup() override;
  void loop() override;
  void dump_config() override;

  // Thread-safe config access
  DeviceConfig get_config() const;
  MotorConfig get_motor_config() const;
  ZoneConfig get_zone_config(uint8_t zone) const;
  bool get_simple_preheat_enabled() const;
  ManifoldType get_manifold_type() const;
  ProbeConfig get_probe_config() const;
  TempSource get_zone_temp_source(uint8_t zone) const;
  void get_zone_mqtt_strings(uint8_t zone, char *device, size_t dev_len, char *ble, size_t ble_len) const;
  void set_config(const DeviceConfig &config);
  void mark_dirty();

  // Individual section updates
  void update_zone(uint8_t zone, const ZoneConfig &zone_cfg);
  void update_control(const ControlConfig &ctrl);
  void update_probes(const ProbeConfig &probes);
  void update_pid(const PIDParams &pid);
  void update_motor(const MotorConfig &motor);
  void update_mqtt_temp(const MqttTempConfig &mqtt_temp);
  void update_balancing(const BalancingConfig &balancing);
  void update_mqtt_broker(const MqttBrokerConfig &mqtt_broker);

  // Motor telemetry persistence (calibration data)
  void save_motor_telemetry(uint8_t motor, const MotorTelemetry &telemetry);
  bool load_motor_telemetry(uint8_t motor, MotorTelemetry &telemetry);

  // Maintenance helpers
  bool erase_namespace();
  bool erase_namespace_and_restart();

 protected:
  static constexpr const char *NVS_NAMESPACE = "hv6";
  static constexpr const char *KEY_CONFIG = "config";
  static constexpr const char *KEY_MOTOR_PFX = "mot";
  static constexpr uint64_t DIRTY_DELAY_US = 1000000ULL;  // 1 second

  void load_config_();
  void save_config_();

  static void dirty_timer_cb_(void *arg);

  DeviceConfig config_{};
  SemaphoreHandle_t mutex_ = nullptr;
  esp_timer_handle_t dirty_timer_ = nullptr;
  volatile bool save_pending_ = false;
  bool initialized_ = false;
};

}  // namespace hv6
