// =============================================================================
// HV6 Valve Controller — ESPHome Component Header
// =============================================================================
// Motor supervisor FSM: 6x DRV8215, sequential execution, current-sense
// endstop detection, calibration, and position tracking.
// Runs as a FreeRTOS task (10ms tick, Core 1) alongside ESPHome's main loop.
// =============================================================================

#pragma once

#include "esphome/core/component.h"
#include "esphome/components/i2c/i2c.h"
#include "esphome/components/sensor/sensor.h"
#include "esphome/components/text_sensor/text_sensor.h"
#include "../hv6_config_store/hv6_config_store.h"
#include "../hv6_config_store/hv6_types.h"
#include "drv8215.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/queue.h"
#include "freertos/semphr.h"
#include "driver/gpio.h"
#include <array>
#include <string>

namespace hv6 {

struct ValveCommand {
  uint8_t zone;
  float target_pct;
  uint16_t timed_duration_ms = 0;  // 0 = position-based, >0 = timed duration
  bool override_drivers = false;    // Bypass drivers_enabled check (manual mode)
  MotorDirection timed_direction = MotorDirection::OPEN;  // Direction for timed moves
};

/// Software ripple counter state — reset each motor start.
/// Detects commutator current ripples from IPROPI ADC for position tracking.
struct RippleDetector {
  float dc_estimate = 0.0f;   ///< Lowpass DC component (raw ADC units)
  bool above_dc = false;       ///< Currently above DC mean
  uint32_t count = 0;          ///< Cumulative ripple count this movement
  uint8_t pwm_debounce = 0;    ///< Debounce counter after PWM on-transition
  bool pwm_was_on = false;     ///< Previous drive_output_enabled_ state
};

struct MotorTraceSample {
  uint32_t t_ms = 0;
  uint32_t ripple_count = 0;
  int16_t current_ma_x10 = 0;
  uint16_t adc_raw = 0xFFFF;
  uint8_t drive_on = 0;
};

class Hv6ValveController : public esphome::Component {
 public:
  float get_setup_priority() const override { return esphome::setup_priority::HARDWARE - 1.0f; }
  void setup() override;
  void loop() override;
  void dump_config() override;

  // Configuration setters (called from Python codegen)
  void set_config_store(Hv6ConfigStore *store) { config_store_ = store; }
  void set_i2c_bus(esphome::i2c::I2CBus *bus) { i2c_bus_ = bus; }
  void set_nsleep_pin(int pin) { nsleep_pin_ = static_cast<gpio_num_t>(pin); }
  void set_nfault_pin(int pin) { nfault_pin_ = static_cast<gpio_num_t>(pin); }
  void set_ipropi_pin(int pin) { ipropi_pin_ = static_cast<gpio_num_t>(pin); }
  void set_current_sensor(esphome::sensor::Sensor *sensor) { current_sensor_ = sensor; }
  void set_trace_text_sensor(esphome::text_sensor::TextSensor *sensor) { trace_text_sensor_ = sensor; }
  void set_motor_address(uint8_t index, uint8_t address) {
    if (index < NUM_ZONES)
      motor_addresses_[index] = address;
  }

  // Thread-safe public API
  bool request_position(uint8_t zone, float target_pct);
  bool request_timed_open(uint8_t zone, uint16_t duration_ms, bool override_drivers = false);
  bool request_timed_close(uint8_t zone, uint16_t duration_ms, bool override_drivers = false);
  bool request_stop(uint8_t zone);
  float get_position(uint8_t zone) const;
  MotorTelemetry get_telemetry(uint8_t zone) const;
  FaultCode get_last_fault() const { return current_fault_code_; }
  bool is_motor_busy() const { return motor_turning_; }
  bool is_calibrating() const { return calibrating_; }
  uint32_t get_live_ripple_count() const { return live_ripple_count_; }
  void request_calibration(uint8_t zone);
  void request_calibration_all();
  void log_i2c_scan();
  void set_manifold_type(ManifoldType type);
  ManifoldType get_manifold_type() const;
  uint16_t get_motor_trace_sample_count() const;
  void clear_motor_trace();

  /// Enable or disable all motor drivers (nSLEEP control).
  /// When disabled, all motors are put to sleep and commands are rejected.
  void set_drivers_enabled(bool enabled);
  bool are_drivers_enabled() const { return drivers_enabled_; }

  /// Reload motor config from config store (call after UI changes).
  void reload_motor_config();

 protected:
  static constexpr uint32_t TICK_MS = 10;
  static constexpr uint32_t FAST_TICK_MS = 1;
  static constexpr uint8_t TICKS_PER_FSM = TICK_MS / FAST_TICK_MS;
  static constexpr uint32_t STACK_SIZE = 8192;
  static constexpr UBaseType_t PRIORITY = 7;
  static constexpr BaseType_t CORE = 1;
  static constexpr uint8_t CMD_QUEUE_LEN = 12;
  static constexpr float CURRENT_FILTER_ALPHA = 0.05f;
  static constexpr uint8_t DEBOUNCE_TICKS = 50;
  static constexpr float INITIAL_MEAN_CURRENT_MA = 20.0f;
  static constexpr uint32_t ENDSTOP_MIN_RUNTIME_MS = 1200;
  static constexpr uint8_t ENDSTOP_HIGH_TICKS = 6;
  static constexpr float ENDSTOP_HARD_CAP_MA = 100.0f;          ///< Safety cap: immediate endstop above this
  static constexpr uint32_t SLOPE_WINDOW_TICKS = 50;             ///< 500ms window for dI/dt estimation
  static constexpr float ENDSTOP_SLOPE_MA_PER_S = 0.4f;         ///< Slope threshold (mA/s) for ramp detection
  static constexpr float ENDSTOP_SLOPE_CURRENT_FACTOR = 1.3f;   ///< Current must exceed mean×1.3 for slope trigger
  static constexpr uint8_t ENDSTOP_SLOPE_WINDOWS = 2;           ///< Consecutive windows with rising slope required
  static constexpr uint32_t RELEARN_CHECK_INTERVAL_MS = 10000;  ///< Check relearn triggers every 10s
  static constexpr uint32_t CALIBRATION_REQUEST_GUARD_MS = 15000;  ///< Ignore calibration requests briefly after boot
  static constexpr uint32_t AUTO_START_DELAY_MS = 10000;  ///< Delay after boot before auto-enable + full calibration
  static constexpr bool DEVELOPMENT_KEEP_NSLEEP_AWAKE = true;   ///< Avoid nSLEEP toggling while debugging brownout/resets
  static constexpr uint16_t TRACE_MAX_SAMPLES = 2000;
  static constexpr uint32_t TRACE_SAMPLE_PERIOD_US = 2000;
  static constexpr uint32_t TRACE_MQTT_PUBLISH_INTERVAL_MS = 500;  // Publish every 500ms

  // Ripple detection constants
  static constexpr float RIPPLE_DC_ALPHA = 0.01f;
  static constexpr float RIPPLE_DC_ALPHA_SLOW = 0.005f;
  static constexpr float RIPPLE_HYSTERESIS_PCT = 0.12f;
  static constexpr uint8_t RIPPLE_PWM_DEBOUNCE_TICKS = 5;
  static constexpr uint8_t PIN_ENGAGE_DEBOUNCE_TICKS = 20;     ///< 200ms sustained current step for detection

  // FreeRTOS task
  static void task_func_(void *arg);
  void run_();

  // Core FSM
  void process_tick_();
  void process_command_queue_();
  void execute_move_(uint8_t zone, float target_pct);
  void execute_timed_move_(uint8_t zone, uint16_t duration_ms, MotorDirection dir, bool override_drivers);

  // Motor start/stop
  bool start_motor_(uint8_t zone, MotorDirection dir, bool override_drivers = false);
  void stop_motor_(bool record_event);
  void apply_drive_output_();

  // Current sensing
  float read_current_ma_();
  void detect_endstop_();
  void detect_open_circuit_();
  void detect_pin_engagement_();
  void check_relearn_triggers_();

  // Ripple counting
  void motor_loop_();
  void sample_ripple_();
  int read_adc_raw_();
  float adc_raw_to_ma_(int raw);

  // Fault handling
  void trigger_fault_(FaultCode code, const char *reason);

  // Calibration
  void run_calibration_(uint8_t zone);

  /// Run a single close-to-endstop or open-to-endstop pass.
  /// Returns the run time in ms, or 0 on fault.
  uint32_t calibration_pass_(uint8_t zone, MotorDirection dir);

  // Position estimation
  float estimate_travel_time_ms_(uint8_t zone, float from_pct, float to_pct);

  // Hardware helpers
  void set_nsleep_(bool enabled);
  bool read_nfault_();
  void save_telemetry_(uint8_t zone);
  void log_startup_self_test_();
  bool manifold_is_nc_() const;
  float logical_to_actuator_pct_(float logical_pct) const;
  float actuator_to_logical_pct_(float actuator_pct) const;
  float flow_to_physical_pct_(uint8_t zone, float flow_pct);
  void trace_reset_();
  void trace_sample_(int raw_adc, float current_ma);
  void trace_publish_to_mqtt_();

  // Component references
  Hv6ConfigStore *config_store_ = nullptr;
  esphome::i2c::I2CBus *i2c_bus_ = nullptr;
  esphome::sensor::Sensor *current_sensor_ = nullptr;
  esphome::text_sensor::TextSensor *trace_text_sensor_ = nullptr;

  // Pin configuration
  gpio_num_t nsleep_pin_ = GPIO_NUM_6;
  gpio_num_t nfault_pin_ = GPIO_NUM_4;
  gpio_num_t ipropi_pin_ = GPIO_NUM_7;
  std::array<uint8_t, NUM_ZONES> motor_addresses_{};

  // DRV8215 driver instances
  std::array<DRV8215 *, NUM_ZONES> drivers_{};

  // Motor FSM state
  volatile bool motor_turning_ = false;
  bool drivers_enabled_ = false;
  uint8_t current_zone_ = 0;
  MotorDirection current_dir_ = MotorDirection::OPEN;
  MotorFsmState fsm_state_ = MotorFsmState::IDLE;
  uint32_t motor_run_time_ms_ = 0;
  uint32_t drive_phase_elapsed_ms_ = 0;
  bool drive_output_enabled_ = false;
  
  // Timed movement state
  bool timed_mode_active_ = false;
  uint32_t timed_move_start_ms_ = 0;
  uint16_t timed_move_duration_ms_ = 0;
  bool nsleep_overridden_ = false;  // nSLEEP raised temporarily for override move

  // Current sensing
  float current_raw_ma_ = 0.0f;
  float current_filtered_ma_ = 0.0f;
  float current_sum_ = 0.0f;
  int current_count_ = 0;
  int debounce_count_ = 0;
  uint8_t endstop_high_count_ = 0;
  int low_current_count_ = 0;

  // Slope-based endstop detection state
  float slope_prev_current_ma_ = 0.0f;
  uint32_t slope_tick_count_ = 0;
  float current_slope_ma_per_s_ = 0.0f;
  bool slope_initialized_ = false;
  uint8_t slope_endstop_windows_ = 0;

  // Pin engagement detection (calibration close passes)
  bool pin_detect_enabled_ = false;
  float pin_detect_baseline_ma_ = 0.0f;
  bool pin_detect_baseline_set_ = false;
  bool pin_detected_ = false;
  uint32_t pin_detected_ripples_ = 0;
  uint8_t pin_detect_sustained_ = 0;

  // Relearn scheduling
  uint32_t last_relearn_check_ms_ = 0;

  // Fault
  FaultCode current_fault_code_ = FaultCode::NONE;

  // Telemetry
  mutable SemaphoreHandle_t telemetry_mutex_ = nullptr;
  std::array<MotorTelemetry, NUM_ZONES> telemetry_{};
  std::array<float, NUM_ZONES> mean_currents_;

  // Command queue + task
  QueueHandle_t cmd_queue_ = nullptr;
  TaskHandle_t task_handle_ = nullptr;

  // Calibration request
  volatile int8_t calibration_request_ = -1;
  volatile uint8_t calibration_pending_mask_ = 0;
  volatile bool calibrating_ = false;

  // Motor config cache
  MotorConfig motor_cfg_;

  // Direct ADC for IPROPI (fast 1ms sampling for ripple counting)
  // Opaque ESP-IDF handles (cast to adc_oneshot_unit_handle_t / adc_cali_handle_t in .cpp)
  void *adc_handle_ = nullptr;
  void *adc_cali_handle_ = nullptr;
  int ipropi_channel_ = 0;
  bool ripple_enabled_ = false;

  // Ripple counter state
  RippleDetector ripple_{};
  volatile uint32_t live_ripple_count_ = 0;
  uint8_t fsm_tick_count_ = 0;
  float latest_current_ma_ = 0.0f;
  uint32_t last_publish_ms_ = 0;
  uint32_t boot_time_ms_ = 0;  // Set after setup() completes; guards MQTT retained replay
  bool auto_start_done_ = false;  // Set once auto-enable + calibration runs on boot

  // High-rate motor trace buffer (streamed to HA via MQTT)
  mutable SemaphoreHandle_t trace_mutex_ = nullptr;
  std::array<MotorTraceSample, TRACE_MAX_SAMPLES> trace_samples_{};
  uint16_t trace_write_index_ = 0;
  bool trace_wrapped_ = false;
  uint32_t trace_start_us_ = 0;
  uint32_t trace_last_sample_us_ = 0;
  uint16_t trace_last_mqtt_index_ = 0;  // Track published samples
  uint32_t trace_last_mqtt_publish_ms_ = 0;
};

}  // namespace hv6
