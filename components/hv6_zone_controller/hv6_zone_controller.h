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
#include <string>

namespace hv6 {

struct SetpointAdjustment {
  uint8_t zone;
  float offset_c;
};

/// Command received from Helios-3 optimizer for a single zone.
/// All temporal validation (valid_until, preheat windows) is performed by the
/// Helios client before writing here; the zone controller only applies the values.
struct HeliosZoneCommand {
  float setpoint_offset_c = 0.0f;  ///< Setpoint offset; zone controller clamps to [min_offset_c, max_offset_c]
  float preheat_floor_c = 0.0f;    ///< If > 0, effective setpoint will be at least this value
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
  bool try_get_system_snapshot(SystemSnapshot *out, uint32_t timeout_ms = 25) const;
  SystemSnapshot get_system_snapshot() const;

  float get_zone_temperature(uint8_t zone) const;
  float get_valve_position(uint8_t zone) const;
  float get_manifold_flow_temperature() const;
  float get_manifold_return_temperature() const;

  void set_zone_setpoint(uint8_t zone, float setpoint_c);
  bool apply_setpoint_adjustment(uint8_t zone, float offset_c);

  // Helios-3 optimizer commands (applied on top of user setpoint + MQTT offset)
  void apply_helios_command(uint8_t zone, const HeliosZoneCommand &cmd);
  void clear_all_helios_commands();

  /// Enable or disable a zone. Disabled zones close their valve and persist to NVS.
  void set_zone_enabled(uint8_t zone, bool enabled);
  bool is_zone_enabled(uint8_t zone) const;
  void set_control_algorithm(ControlAlgorithm algorithm);
  ControlAlgorithm get_control_algorithm() const;

  /// Manual mode: suppresses automatic valve positioning.
  /// Manual commands (open/close/calibrate via UI) still work.
  void set_manual_mode(bool enabled) { manual_mode_.store(enabled, std::memory_order_release); }
  bool is_manual_mode() const { return manual_mode_.load(std::memory_order_acquire); }

  // State machine accessors (for dashboard/diagnostics)
  ControllerState get_controller_state() const { return controller_state_.load(std::memory_order_acquire); }
  SystemConditionState get_system_condition_state() const { return system_condition_state_.load(std::memory_order_acquire); }

  void set_zone_probe(uint8_t zone, int8_t probe);
  int8_t get_zone_probe(uint8_t zone) const;
  void set_manifold_flow_probe(int8_t probe);
  int8_t get_manifold_flow_probe() const;
  void set_manifold_return_probe(int8_t probe);
  int8_t get_manifold_return_probe() const;

  // MQTT external temperature source (zigbee2mqtt etc.)
  void set_zone_mqtt_temperature(uint8_t zone, float temp_c);
  float get_zone_mqtt_temperature(uint8_t zone) const;
  void set_zone_temp_source(uint8_t zone, TempSource source);
  TempSource get_zone_temp_source(uint8_t zone) const;
  void set_zone_mqtt_device(uint8_t zone, const std::string &name);
  std::string get_zone_mqtt_device(uint8_t zone) const;

  // BLE sensor (Shelly BLU H&T, BTHome, etc.)
  void set_zone_ble_mac(uint8_t zone, const std::string &mac);
  std::string get_zone_ble_mac(uint8_t zone) const;

  // Zone physical properties
  void set_zone_area_m2(uint8_t zone, float area_m2);
  float get_zone_area_m2(uint8_t zone) const;
  void set_zone_pipe_spacing_mm(uint8_t zone, float spacing_mm);
  float get_zone_pipe_spacing_mm(uint8_t zone) const;
  void set_zone_pipe_type(uint8_t zone, PipeType type);
  PipeType get_zone_pipe_type(uint8_t zone) const;
  void set_zone_exterior_walls(uint8_t zone, uint8_t walls);
  uint8_t get_zone_exterior_walls(uint8_t zone) const;

  // Probe role (room temperature vs return water)
  void set_zone_probe_role(uint8_t zone, ProbeRole role);
  ProbeRole get_zone_probe_role(uint8_t zone) const;

  // Zone sync (two zones in one room share setpoint + averaged temperature)
  void set_zone_sync(uint8_t zone, int8_t target_zone);
  int8_t get_zone_sync(uint8_t zone) const;

  // Balancing configuration
  void set_dynamic_balancing_enabled(bool enabled);
  bool is_dynamic_balancing_enabled() const;
  void set_modulating_heat_source(bool enabled);
  bool has_modulating_heat_source() const;
  void set_minimum_flow_pct(float pct);
  float get_minimum_flow_pct() const;
  void set_flow_increase_threshold(float pct);
  float get_flow_increase_threshold() const;
  void set_flow_decrease_threshold(float pct);
  float get_flow_decrease_threshold() const;
  void set_target_delta_t(float delta_c);
  float get_target_delta_t() const;

  void set_simple_preheat_enabled(bool enabled);
  bool is_simple_preheat_enabled() const;
  float get_zone_preheat_advance(uint8_t zone) const;

  bool is_connected() const { return true; }  // WiFi managed by ESPHome

  // MQTT broker configuration (NVS-persisted overrides)
  void set_mqtt_broker(const std::string &broker);
  std::string get_mqtt_broker() const;
  void set_mqtt_port(uint16_t port);
  uint16_t get_mqtt_port() const;
  void set_mqtt_username(const std::string &username);
  std::string get_mqtt_username() const;
  void set_mqtt_password(const std::string &password);
  std::string get_mqtt_password() const;

  uint32_t get_cycle_count() const { return cycle_count_.load(std::memory_order_relaxed); }

 protected:
  static constexpr uint32_t STACK_SIZE = 8192;
  static constexpr UBaseType_t PRIORITY = 6;
  static constexpr BaseType_t CORE = 0;
  static constexpr uint8_t ADJ_QUEUE_LEN = 12;

  static constexpr uint32_t TEMP_FAILSAFE_MS = 60 * 60 * 1000;
  static constexpr uint32_t MQTT_STALE_MS = 60 * 60 * 1000;
  static constexpr uint32_t MQTT_FALLBACK_MS = 30 * 60 * 1000;
  static constexpr float FALLBACK_SETPOINT_C = 20.0f;
  static constexpr bool DEVELOPMENT_MANUAL_ONLY = false;
  static constexpr float SIMPLE_PREHEAT_MAX_ADVANCE_C = 0.8f;
  static constexpr float SIMPLE_PREHEAT_LEARN_UP_GAIN = 0.35f;
  static constexpr float SIMPLE_PREHEAT_LEARN_DOWN_GAIN = 0.50f;
  static constexpr float SIMPLE_PREHEAT_OVERSHOOT_DECAY_C = 0.02f;

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

  // Helios-3 optimizer commands (protected by helios_mutex_)
  mutable SemaphoreHandle_t helios_mutex_ = nullptr;
  std::array<HeliosZoneCommand, NUM_ZONES> helios_cmds_;

  // Simple response-based preheat (runtime only; not persisted)
  std::array<float, NUM_ZONES> preheat_advance_c_;
  std::array<bool, NUM_ZONES> preheat_episode_active_;
  std::array<float, NUM_ZONES> preheat_episode_min_temp_c_;
  std::array<float, NUM_ZONES> preheat_episode_max_temp_c_;
  std::array<float, NUM_ZONES> preheat_episode_setpoint_c_;

  // Failsafe tracking
  std::array<uint32_t, NUM_ZONES> last_valid_temp_ms_;
  uint32_t last_mqtt_adjustment_ms_ = 0;

  // MQTT external temperatures
  std::array<float, NUM_ZONES> mqtt_temperatures_;
  std::array<uint32_t, NUM_ZONES> mqtt_temp_last_ms_;
  uint8_t mqtt_startup_query_retry_count_ = 0;
  uint32_t mqtt_startup_query_next_retry_ms_ = 0;
  uint8_t mqtt_startup_query_next_zone_ = 0;
  bool mqtt_startup_query_round_active_ = false;
  uint8_t mqtt_startup_query_round_remaining_ = 0;

  std::atomic<uint32_t> cycle_count_{0};
  uint32_t cycle_interval_ms_ = 10000;
  std::atomic<bool> manual_mode_{false};

  // State machine tracking (atomic for cross-thread reads)
  std::atomic<ControllerState> controller_state_{ControllerState::UNKNOWN};
  std::atomic<SystemConditionState> system_condition_state_{SystemConditionState::UNKNOWN};

  TaskHandle_t task_handle_ = nullptr;

  // FreeRTOS task
  static void task_func_(void *arg);
  void run_();
  void run_cycle_();
  void check_failsafes_();

  // State machine updates (called during run_cycle_)
  void update_controller_state_();
  void update_system_condition_state_();
  void update_zone_display_states_();

  // Helpers
  float read_zone_temperature_(uint8_t zone) const;
  float read_zone_return_temperature_(uint8_t zone) const;
  float read_manifold_flow_() const;
  float read_manifold_return_() const;
  void setup_mqtt_subscription_();
  void handle_zigbee_mqtt_(const std::string &topic, const std::string &payload);
  void request_zigbee_temperature_(const std::string &device_name);

  ZoneState classify_zone_(float temp, float setpoint, float comfort_band, float preheat_advance_c) const;
  float compute_raw_position_(uint8_t zone, float temp, float setpoint);
  void update_simple_preheat_(uint8_t zone, float temp, float setpoint, float comfort_band, ZoneState state);
  void reset_simple_preheat_(uint8_t zone);

  // Hydraulic balancing
  void recalculate_balance_factors_();
  void recalculate_dynamic_balance_factors_();
  float apply_hydraulic_balance_(uint8_t zone, float raw_position);
  void apply_minimum_flow_(std::array<float, NUM_ZONES> &positions);
  void enforce_minimum_total_opening_(std::array<float, NUM_ZONES> &positions);
  void calculate_hydraulic_outputs_();

  static float calculate_pipe_length_m_(float area_m2, float spacing_mm, float supply_pipe_m);
  static float pipe_correction_factor_(PipeType type);
  static float floor_correction_factor_(FloorType type, float cover_thickness_mm);
};

}  // namespace hv6
