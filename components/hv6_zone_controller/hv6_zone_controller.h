// =============================================================================
// HV6 Zone Controller — ESPHome Component Header
// =============================================================================
// Zone state machine with control algorithms, hydraulic balancing, and failsafe.
// Reads temperatures from ESPHome sensors, drives valves via Hv6ValveController.
// Runs as a FreeRTOS task (10s cycle) alongside ESPHome's main loop.
// =============================================================================

#pragma once

#include "esphome/core/component.h"
#include "esphome/components/sensor/sensor.h"
#include "../hv6_config_store/hv6_config_store.h"
#include "../hv6_config_store/hv6_types.h"
#include "../hv6_valve_controller/hv6_valve_controller.h"
#include "control_algorithms.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/semphr.h"
#include "freertos/queue.h"
#include <array>
#include <atomic>

namespace hv6 {

struct SetpointAdjustment {
  uint8_t zone;
  float offset_c;
};

class Hv6ZoneController : public esphome::Component {
 public:
  float get_setup_priority() const override { return esphome::setup_priority::DATA; }
  void setup() override;
  void dump_config() override;

  // Configuration setters (from Python codegen)
  void set_config_store(Hv6ConfigStore *store) { config_store_ = store; }
  void set_valve_controller(Hv6ValveController *ctrl) { valve_controller_ = ctrl; }
  void set_cycle_interval_ms(uint32_t ms) { cycle_interval_ms_ = ms; }
  void set_probe_sensor(uint8_t probe, esphome::sensor::Sensor *sensor) {
    if (probe < MAX_PROBES)
      probe_sensors_[probe] = sensor;
  }

  // Thread-safe public API (callable from lambdas, MQTT handlers, etc.)
  ZoneSnapshot get_zone_snapshot(uint8_t zone) const;
  SystemSnapshot get_system_snapshot() const;

  float get_zone_temperature(uint8_t zone) const;
  float get_valve_position(uint8_t zone) const;
  float get_manifold_flow_temperature() const;
  float get_manifold_return_temperature() const;

  void set_zone_setpoint(uint8_t zone, float setpoint_c);
  bool apply_setpoint_adjustment(uint8_t zone, float offset_c);

  /// Enable or disable a zone. Disabled zones close their valve and persist to NVS.
  void set_zone_enabled(uint8_t zone, bool enabled);
  bool is_zone_enabled(uint8_t zone) const;
  void set_zone_probe(uint8_t zone, int8_t probe);
  int8_t get_zone_probe(uint8_t zone) const;
  void set_manifold_flow_probe(int8_t probe);
  int8_t get_manifold_flow_probe() const;
  void set_manifold_return_probe(int8_t probe);
  int8_t get_manifold_return_probe() const;

  bool is_connected() const { return true; }  // WiFi managed by ESPHome

  uint32_t get_cycle_count() const { return cycle_count_; }

 protected:
  static constexpr uint32_t STACK_SIZE = 8192;
  static constexpr UBaseType_t PRIORITY = 6;
  static constexpr BaseType_t CORE = 0;
  static constexpr uint8_t ADJ_QUEUE_LEN = 12;

  static constexpr uint32_t TEMP_FAILSAFE_MS = 5 * 60 * 1000;
  static constexpr uint32_t MQTT_STALE_MS = 5 * 60 * 1000;
  static constexpr uint32_t MQTT_FALLBACK_MS = 30 * 60 * 1000;
  static constexpr float FALLBACK_SETPOINT_C = 20.0f;

  // Component references
  Hv6ConfigStore *config_store_ = nullptr;
  Hv6ValveController *valve_controller_ = nullptr;

  // ESPHome sensor references
  std::array<esphome::sensor::Sensor *, MAX_PROBES> probe_sensors_{};

  // Control algorithms (one per zone)
  std::array<AdaptiveControl, NUM_ZONES> algorithms_;

  // Snapshots (mutex-protected)
  mutable SemaphoreHandle_t snapshot_mutex_ = nullptr;
  std::array<ZoneSnapshot, NUM_ZONES> snapshots_;

  // Hydraulic balance
  std::array<float, NUM_ZONES> balance_factors_;
  bool balance_dirty_ = true;

  // Setpoint adjustments
  QueueHandle_t adj_queue_ = nullptr;
  std::array<float, NUM_ZONES> requested_setpoints_{};
  std::array<float, NUM_ZONES> setpoint_offsets_;

  // Failsafe tracking
  std::array<uint32_t, NUM_ZONES> last_valid_temp_ms_;
  uint32_t last_mqtt_adjustment_ms_ = 0;

  uint32_t cycle_count_ = 0;
  uint32_t cycle_interval_ms_ = 10000;

  TaskHandle_t task_handle_ = nullptr;

  // FreeRTOS task
  static void task_func_(void *arg);
  void run_();
  void run_cycle_();
  void check_failsafes_();

  // Helpers
  float read_zone_temperature_(uint8_t zone) const;
  float read_manifold_flow_() const;
  float read_manifold_return_() const;

  ZoneState classify_zone_(float temp, float setpoint, float comfort_band) const;
  float compute_raw_position_(uint8_t zone, float temp, float setpoint);

  // Hydraulic balancing
  void recalculate_balance_factors_();
  float apply_hydraulic_balance_(uint8_t zone, float raw_position);
  void enforce_minimum_total_opening_(std::array<float, NUM_ZONES> &positions);
  void calculate_hydraulic_outputs_();

  static float calculate_pipe_length_m_(float area_m2, float spacing_mm, float supply_pipe_m);
  static float pipe_correction_factor_(PipeType type);
  static float floor_correction_factor_(FloorType type, float cover_thickness_mm);
};

}  // namespace hv6
