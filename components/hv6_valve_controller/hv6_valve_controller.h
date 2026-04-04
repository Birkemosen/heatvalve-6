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
#include "../hv6_config_store/hv6_config_store.h"
#include "../hv6_config_store/hv6_types.h"
#include "drv8215.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/queue.h"
#include "freertos/semphr.h"
#include "driver/gpio.h"
#include <array>

namespace hv6 {

struct ValveCommand {
  uint8_t zone;
  float target_pct;
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
  void set_motor_address(uint8_t index, uint8_t address) {
    if (index < NUM_ZONES)
      motor_addresses_[index] = address;
  }

  // Thread-safe public API
  bool request_position(uint8_t zone, float target_pct);
  float get_position(uint8_t zone) const;
  MotorTelemetry get_telemetry(uint8_t zone) const;
  FaultCode get_last_fault() const { return current_fault_code_; }
  bool is_motor_busy() const { return motor_turning_; }
  bool is_calibrating() const { return calibrating_; }
  uint32_t get_live_ripple_count() const { return live_ripple_count_; }
  void request_calibration(uint8_t zone);

  /// Enable or disable all motor drivers (nSLEEP control).
  /// When disabled, all motors are put to sleep and commands are rejected.
  void set_drivers_enabled(bool enabled);
  bool are_drivers_enabled() const { return drivers_enabled_; }

 protected:
  static constexpr uint32_t TICK_MS = 10;
  static constexpr uint32_t FAST_TICK_MS = 1;
  static constexpr uint8_t TICKS_PER_FSM = TICK_MS / FAST_TICK_MS;
  static constexpr uint32_t STACK_SIZE = 4096;
  static constexpr UBaseType_t PRIORITY = 7;
  static constexpr BaseType_t CORE = 1;
  static constexpr uint8_t CMD_QUEUE_LEN = 12;
  static constexpr float CURRENT_FILTER_ALPHA = 0.05f;
  static constexpr uint8_t DEBOUNCE_TICKS = 50;
  static constexpr float INITIAL_MEAN_CURRENT_MA = 20.0f;

  // Ripple detection constants
  static constexpr float RIPPLE_DC_ALPHA = 0.01f;
  static constexpr float RIPPLE_DC_ALPHA_SLOW = 0.005f;
  static constexpr float RIPPLE_HYSTERESIS_PCT = 0.12f;
  static constexpr uint8_t RIPPLE_PWM_DEBOUNCE_TICKS = 5;

  // FreeRTOS task
  static void task_func_(void *arg);
  void run_();

  // Core FSM
  void process_tick_();
  void process_command_queue_();
  void execute_move_(uint8_t zone, float target_pct);

  // Motor start/stop
  bool start_motor_(uint8_t zone, MotorDirection dir);
  void stop_motor_(bool record_event);
  void apply_drive_output_();

  // Current sensing
  float read_current_ma_();
  void detect_endstop_();
  void detect_open_circuit_();

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

  // Component references
  Hv6ConfigStore *config_store_ = nullptr;
  esphome::i2c::I2CBus *i2c_bus_ = nullptr;
  esphome::sensor::Sensor *current_sensor_ = nullptr;

  // Pin configuration
  gpio_num_t nsleep_pin_ = GPIO_NUM_2;
  gpio_num_t nfault_pin_ = GPIO_NUM_7;
  gpio_num_t ipropi_pin_ = GPIO_NUM_1;
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

  // Current sensing
  float current_raw_ma_ = 0.0f;
  float current_filtered_ma_ = 0.0f;
  float current_sum_ = 0.0f;
  int current_count_ = 0;
  int debounce_count_ = 0;
  int low_current_count_ = 0;

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
};

}  // namespace hv6
