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
#include "ripple_counter.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/queue.h"
#include "freertos/semphr.h"
#include "driver/gpio.h"
#include <array>
#include <atomic>
#include <string>

namespace hv6 {

struct ValveCommand {
  uint8_t zone;
  float target_pct;
  uint16_t timed_duration_ms = 0;  // 0 = position-based, >0 = timed duration
  bool override_drivers = false;    // Bypass drivers_enabled check (manual mode)
  MotorDirection timed_direction = MotorDirection::OPEN;  // Direction for timed moves
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
  FaultCode get_last_fault() const { return current_fault_code_.load(std::memory_order_acquire); }
  bool is_motor_busy() const { return motor_turning_.load(std::memory_order_acquire); }
  bool is_calibrating() const { return calibrating_.load(std::memory_order_acquire); }
  uint32_t get_live_ripple_count() const { return live_ripple_count_.load(std::memory_order_relaxed); }
  void request_calibration(uint8_t zone);
  void request_calibration_all();
  bool reset_fault(uint8_t zone);
  bool reset_and_relearn(uint8_t zone);
  bool reset_learned_factors(uint8_t zone);
  void log_i2c_scan();
  void set_manifold_type(ManifoldType type);
  ManifoldType get_manifold_type() const;
  uint16_t get_motor_trace_sample_count() const;
  void clear_motor_trace();

  /// Enable or disable all motor drivers (nSLEEP control).
  /// When disabled, all motors are put to sleep and commands are rejected.
  void set_drivers_enabled(bool enabled);
  bool are_drivers_enabled() const { return drivers_enabled_.load(std::memory_order_acquire); }

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
  static constexpr uint32_t ENDSTOP_MIN_RUNTIME_MS = 1200;      ///< Conservative blind window (calibration)
  static constexpr uint32_t ENDSTOP_SETTLE_MS = 300;            ///< Post-boost settle before threshold/slope detection
  static constexpr uint8_t ENDSTOP_HIGH_TICKS = 6;
  static constexpr float ENDSTOP_HARD_CAP_MA = 100.0f;          ///< Safety cap: immediate endstop above this
  static constexpr uint8_t HARD_CAP_TICKS = 2;                  ///< Consecutive raw-current ticks above cap to stop
  // Fast open hard-stop cap: the open retract stop is a sharp ~47-52 mA raw bite, but the
  // slope path only updates once per 500 ms window, so the gears grind for up to ~500 ms
  // (1-3 ticks) before it reacts. A raw-current trip catches it in ~30 ms. To dodge the
  // ~45 mA open BREAKAWAY current (which false-fired a naive open cap at ~600 ms), arm
  // only AFTER the current has settled back below the free-travel band — then only the
  // end-stop bite can trip it. No travel estimate needed; degrades to slope if never armed.
  static constexpr float OPEN_FAST_CAP_MA = 40.0f;             ///< Raw-current fast trip for the open hard stop
  static constexpr float OPEN_FAST_CAP_ARM_BELOW_MA = 28.0f;   ///< Arm only after post-breakaway settle below this
  static constexpr uint8_t OPEN_FAST_CAP_TICKS = 3;            ///< ~30 ms raw debounce
  static constexpr uint32_t SLOPE_WINDOW_TICKS = 50;             ///< 500ms window for dI/dt estimation
  static constexpr float ENDSTOP_SLOPE_MA_PER_S = 0.4f;         ///< Slope threshold (mA/s) for ramp detection
  static constexpr float ENDSTOP_SLOPE_CURRENT_FACTOR = 1.3f;   ///< Current must exceed mean×1.3 for slope trigger
  static constexpr uint8_t ENDSTOP_SLOPE_WINDOWS = 2;           ///< Consecutive windows with rising slope required (close)
  static constexpr uint8_t ENDSTOP_SLOPE_WINDOWS_OPEN = 1;      ///< Open ramp is gentle/slow — halve slope latency to ~500ms
  static constexpr uint32_t RIPPLE_STALL_MS = 750;             ///< Ripple-plateau (rotation stall) endstop: no commutation this long = stalled
  static constexpr uint32_t RIPPLE_STALL_MIN_COUNT = 20;      ///< Require real rotation first, so a never-started motor isn't called "stalled"
  static constexpr uint32_t ALREADY_AT_STOP_MS = 100;         ///< After boost, zero ripples + current present = valve already against the commanded stop (fast, pop-off-safe)
  static constexpr uint32_t EARLY_STALL_MS = 250;             ///< Evaluated DURING boost (before the current debounce): 0 ripples by here = never moved = already at the stop; stop before boost force pops an already-closed actuator
  static constexpr uint8_t CALIBRATION_DUTY_PCT = 100;        ///< Calibration drives at full duty (no 70% hold, no coast): full torque + undiluted IPROPI so the endstop stall current is strong and detectable
  static constexpr uint32_t RELEARN_CHECK_INTERVAL_MS = 10000;  ///< Check relearn triggers every 10s
  static constexpr uint32_t CALIBRATION_REQUEST_GUARD_MS = 15000;  ///< Ignore calibration requests briefly after boot
  static constexpr uint32_t AUTO_START_DELAY_MS = 10000;  ///< Delay after boot before auto-enable + full calibration
  static constexpr uint32_t CALIBRATION_NO_RIPPLE_ABORT_MS = 3000;  ///< Abort a calibration pass if no commutation ripples seen (no motor wired)
  static constexpr UBaseType_t CALIBRATION_BOOST_PRIORITY = PRIORITY + 3;  ///< Modest boost during calibration; stays below ESP-IDF system tasks
  static constexpr bool DEVELOPMENT_KEEP_NSLEEP_AWAKE = false;  ///< Set true only when debugging brownout/resets
  static constexpr uint16_t TRACE_MAX_SAMPLES = 2000;
  static constexpr uint32_t TRACE_SAMPLE_PERIOD_US = 2000;

  // Ripple detection constants (DMA continuous mode @ 15 kHz)
  static constexpr uint32_t RIPPLE_SAMPLE_RATE_HZ      = 15000;
  static constexpr uint32_t RIPPLE_DMA_FRAME_BYTES     = 1024;  ///< ~256 samples × 4 B = ~17 ms per frame
  static constexpr uint32_t RIPPLE_DMA_STORE_BYTES     = 4096;  ///< 4 frames of internal DMA ring buffer
  static constexpr uint32_t RIPPLE_DMA_DEBOUNCE_SAMPLES = 75;   ///< 5 ms inrush blanking at 15 kHz
  static constexpr RippleCounter::Config kRippleConfig = {
    .sampleRate       = 15000.0f,
    .lpAlpha          = 0.002f,
    .hpAlpha          = 0.90f,
    .threshold        = 3.0f,
    .hysteresis       = 0.5f,
    .ripplesPerRev    = 24,
    .minPeriodSamples = 75,   ///< floor(15000 / 200 Hz) — gate above 200 Hz
  };
  static constexpr uint8_t PIN_ENGAGE_DEBOUNCE_TICKS = 20;      ///< 200ms sustained current step for detection

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
  uint8_t effective_hold_duty_();  ///< PWM hold duty for this tick (reduced during soft-approach)

  // Current sensing
  float read_current_ma_();
  void detect_endstop_();
  void detect_open_circuit_();
  void detect_pin_engagement_();
  void check_relearn_triggers_();
  MotorProfile effective_motor_profile_(uint8_t zone) const;
  uint32_t effective_runtime_limit_s_(uint8_t zone) const;
  float effective_current_factor_(uint8_t zone, MotorDirection dir) const;
  void update_learned_factor_(uint8_t zone, MotorDirection dir, float average_ma, float peak_ma, bool sample_valid);

  // Ripple counting (DMA continuous processor task)
  void motor_loop_();
  void run_ripple_task_();
  static void ripple_task_func_(void *arg);
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

  // Component references
  Hv6ConfigStore *config_store_ = nullptr;
  esphome::i2c::I2CBus *i2c_bus_ = nullptr;
  esphome::sensor::Sensor *current_sensor_ = nullptr;

  // Pin configuration
  gpio_num_t nsleep_pin_ = GPIO_NUM_6;
  gpio_num_t nfault_pin_ = GPIO_NUM_4;
  gpio_num_t ipropi_pin_ = GPIO_NUM_7;
  std::array<uint8_t, NUM_ZONES> motor_addresses_{};

  // DRV8215 driver instances
  std::array<DRV8215 *, NUM_ZONES> drivers_{};

  // Motor FSM state (atomic for cross-thread access)
  std::atomic<bool> motor_turning_{false};
  std::atomic<bool> drivers_enabled_{false};
  uint8_t current_zone_ = 0;
  MotorDirection current_dir_ = MotorDirection::OPEN;
  MotorFsmState fsm_state_ = MotorFsmState::IDLE;
  uint32_t motor_run_time_ms_ = 0;
  uint32_t drive_phase_elapsed_ms_ = 0;
  std::atomic<bool> drive_output_enabled_{false};
  
  // Timed movement state
  bool timed_mode_active_ = false;
  uint32_t timed_move_start_ms_ = 0;
  uint16_t timed_move_duration_ms_ = 0;
  bool nsleep_overridden_ = false;  // nSLEEP raised temporarily for override move

  // Current sensing
  float current_raw_ma_ = 0.0f;
  float current_filtered_ma_ = 0.0f;
  float current_peak_ma_ = 0.0f;
  float current_sum_ = 0.0f;
  int current_count_ = 0;
  int debounce_count_ = 0;
  uint8_t endstop_high_count_ = 0;
  uint8_t hard_cap_high_count_ = 0;  ///< Consecutive raw-current ticks above the hard cap
  bool open_fast_cap_armed_ = false;  ///< Open fast cap arms only after post-breakaway current settle
  uint8_t open_fast_cap_count_ = 0;   ///< Consecutive raw-current ticks above the fast open cap
  int low_current_count_ = 0;
  uint32_t oc_last_ripple_count_ = 0;  ///< Ripple count at last open-circuit check (rotation = connected)
  uint32_t stall_last_ripple_count_ = 0;  ///< Highest ripple count seen this move (rotation-stall endstop)
  uint32_t stall_last_advance_ms_ = 0;     ///< Runtime at last ripple advance (plateau = at the stop)
  bool stall_initialized_ = false;         ///< Baseline the stall window from the guard, not motor start
  // Calibration detection is self-referential: the running-current baseline is measured
  // fresh each pass (never the stored mean), so a corrupted prior value can't break a
  // re-learn. Endstop = current rising above this fresh baseline.
  float cal_baseline_ma_ = 0.0f;
  bool cal_baseline_set_ = false;

  // Per-move context for soft-approach + adaptive endstop guard (set at move start)
  bool drive_to_endstop_active_ = false;  ///< Current move targets a mechanical limit
  bool soft_approach_active_ = false;     ///< Reduced drive duty engaged this tick
  uint32_t endstop_guard_ms_ = ENDSTOP_MIN_RUNTIME_MS;  ///< Blind window before threshold/slope detection
  uint32_t approach_stroke_ripples_ = 0;  ///< Estimated ripples for this move (0 = unknown)
  uint32_t approach_stroke_ms_ = 0;       ///< Estimated travel time for this move (0 = unknown)

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

  // Fault (atomic for cross-thread reads)
  std::atomic<FaultCode> current_fault_code_{FaultCode::NONE};

  // Telemetry
  mutable SemaphoreHandle_t telemetry_mutex_ = nullptr;
  std::array<MotorTelemetry, NUM_ZONES> telemetry_{};
  // Endstop threshold base, tracked per direction: closing draws materially more
  // current than opening, so a single blended mean inflates the open threshold and
  // lets the motor grind past the open stop. Indexed via mean_current_().
  std::array<float, NUM_ZONES> mean_open_currents_;
  std::array<float, NUM_ZONES> mean_close_currents_;
  float &mean_current_(uint8_t zone, MotorDirection dir) {
    return dir == MotorDirection::OPEN ? mean_open_currents_[zone] : mean_close_currents_[zone];
  }

  // Command queue + task
  QueueHandle_t cmd_queue_ = nullptr;
  TaskHandle_t task_handle_ = nullptr;

  // Calibration request (atomic for cross-thread access)
  std::atomic<int8_t> calibration_request_{-1};
  std::atomic<uint8_t> calibration_pending_mask_{0};
  std::atomic<bool> calibrating_{false};

  // Motor config cache
  MotorConfig motor_cfg_;

  // ADC continuous (DMA) for IPROPI @ 15 kHz
  // adc_continuous_handle_t and adc_cali_handle_t are kept as void* to avoid
  // pulling ESP-IDF headers into this header file.
  void *adc_continuous_handle_ = nullptr;
  void *adc_cali_handle_ = nullptr;
  int ipropi_channel_ = 0;
  bool ripple_enabled_ = false;

  // Ripple counter (written by ripple task, count read via live_ripple_count_)
  RippleCounter ripple_counter_{kRippleConfig};
  std::atomic<uint32_t> live_ripple_count_{0};

  // DMA task state
  TaskHandle_t ripple_task_handle_ = nullptr;
  uint32_t dma_debounce_remaining_ = 0;
  bool ripple_drive_was_on_ = false;
  alignas(32) uint8_t adc_frame_buf_[RIPPLE_DMA_FRAME_BYTES];
  uint8_t fsm_tick_count_ = 0;
  float latest_current_ma_ = 0.0f;
  uint32_t last_publish_ms_ = 0;
  uint32_t boot_time_ms_ = 0;  // Set after setup() completes; guards replayed startup commands
  bool auto_start_done_ = false;  // Set once auto-enable + calibration runs on boot

  // High-rate motor trace buffer — PSRAM-allocated in setup() to save ~31 KB of internal heap
  mutable SemaphoreHandle_t trace_mutex_ = nullptr;
  MotorTraceSample *trace_samples_{nullptr};
  uint16_t trace_write_index_ = 0;
  bool trace_wrapped_ = false;
  uint32_t trace_start_us_ = 0;
  uint32_t trace_last_sample_us_ = 0;
};

}  // namespace hv6
