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
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/semphr.h"

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
  void get_zone_ble_mac_str(uint8_t zone, char *ble, size_t ble_len) const;
  void set_config(const DeviceConfig &config);
  void mark_dirty();

  // Individual section updates
  void update_zone(uint8_t zone, const ZoneConfig &zone_cfg);
  void update_control(const ControlConfig &ctrl);
  void update_probes(const ProbeConfig &probes);
  void update_pid(const PIDParams &pid);
  void update_motor(const MotorConfig &motor);
  void update_sensor_config(const SensorConfig &sensor_config);
  void update_balancing(const BalancingConfig &balancing);
  HeliosConfig get_helios_config() const;  // forecast quiesce gate (.enabled)
  void update_asgard(const AsgardConfig &asgard);
  AsgardConfig get_asgard_config() const;
  void update_forecast(const ForecastConfig &forecast);
  ForecastConfig get_forecast_config() const;

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
  static constexpr const char *KEY_SENSORS = "sensors";  // BLE pairing, survives main-blob resets
  static constexpr const char *KEY_ZONES = "zones";      // Zone config, survives main-blob resets
  // Remaining global-settings sections, each mirrored to its own durable key so
  // user settings (preheat, forecast, asgard, balancing, …) survive a
  // legacy main-config reset just like zones/sensors do.
  static constexpr const char *KEY_SYSTEM = "system";
  static constexpr const char *KEY_CONTROL = "control";
  static constexpr const char *KEY_PROBES = "probes";
  static constexpr const char *KEY_PID = "pid";
  static constexpr const char *KEY_MOTOR_CFG = "motorcfg";  // distinct from per-motor telemetry mot0..5
  static constexpr const char *KEY_MANIFOLD = "manifold";
  static constexpr const char *KEY_BALANCING = "balancing";
  static constexpr const char *KEY_ASGARD = "asgard";
  static constexpr const char *KEY_FORECAST = "forecast";
  static constexpr uint64_t DIRTY_DELAY_US = 1000000ULL;  // 1 second
  // Dedicated NVS persistence task — keeps flash commits off the main loop
  // task so loopTask isn't blocked for the 50–500 ms a commit can take.
  // Pinned to Core 1, low priority, modest stack. Triggered by save_sem_.
  static constexpr uint32_t NVS_TASK_STACK = 8192;
  static constexpr UBaseType_t NVS_TASK_PRIO = 1;
  static constexpr BaseType_t NVS_TASK_CORE = 1;

  void load_config_();
  void save_config_();

  /// Persist/restore the sensor pairing (BLE MAC + temp source) under KEY_SENSORS,
  /// independent of the main config blob's version gate. Called from save_config_/
  /// load_config_ with an already-open NVS handle.
  void save_sensor_config_(nvs_handle_t handle, const SensorConfig &sensor);
  /// Returns true if a valid durable sensor blob was found and applied.
  bool load_sensor_config_(nvs_handle_t handle);

  /// Persist/restore the zone configuration array under KEY_ZONES, independent of
  /// the main config blob's version gate (same rationale as the sensor pairing —
  /// keeps area/pipe/wall settings across legacy main-config resets). Called from
  /// save_config_/load_config_ with an already-open NVS handle.
  void save_zone_config_(nvs_handle_t handle, const ZoneConfig (&zones)[NUM_ZONES]);
  /// Returns true if a valid durable zone blob was found and applied.
  bool load_zone_config_(nvs_handle_t handle);

  static void dirty_timer_cb_(void *arg);
  static void nvs_task_entry_(void *arg);
  void nvs_task_loop_();

  DeviceConfig config_{};
  SemaphoreHandle_t mutex_ = nullptr;
  SemaphoreHandle_t save_sem_ = nullptr;
  TaskHandle_t nvs_task_ = nullptr;
  esp_timer_handle_t dirty_timer_ = nullptr;
  volatile bool save_pending_ = false;
  bool initialized_ = false;
};

}  // namespace hv6
