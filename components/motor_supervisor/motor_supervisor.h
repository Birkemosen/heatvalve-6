#pragma once

#include <array>
#include <cstdint>

#include "esphome/components/binary_sensor/binary_sensor.h"
#include "esphome/components/number/number.h"
#include "esphome/components/sensor/sensor.h"
#include "esphome/core/component.h"
#include "esphome/core/preferences.h"

namespace esphome {
namespace drv8215 {
struct Drv8215FaultStatus;
class Drv8215;
}

namespace motor_supervisor {

enum class FaultCode : uint8_t {
  FAULT_NONE = 0,
  FAULT_OPEN_CIRCUIT = 1,
  FAULT_BLOCKED = 2,
  FAULT_TIMEOUT = 3,
  FAULT_OVERCURRENT = 4,
  FAULT_THERMAL = 5,
  FAULT_STALL = 6,
  FAULT_UNKNOWN = 7,
};

class MotorSupervisor : public Component {
 public:
  void setup() override;
  void loop() override;
  void dump_config() override;
  float get_setup_priority() const override { return setup_priority::DATA; }

  void set_motor_1(drv8215::Drv8215 *driver) { this->drivers_[0] = driver; }
  void set_motor_2(drv8215::Drv8215 *driver) { this->drivers_[1] = driver; }
  void set_motor_3(drv8215::Drv8215 *driver) { this->drivers_[2] = driver; }
  void set_motor_4(drv8215::Drv8215 *driver) { this->drivers_[3] = driver; }
  void set_motor_5(drv8215::Drv8215 *driver) { this->drivers_[4] = driver; }
  void set_motor_6(drv8215::Drv8215 *driver) { this->drivers_[5] = driver; }

  void set_ipropi_voltage_sensor(sensor::Sensor *sensor) { this->ipropi_voltage_sensor_ = sensor; }
  void set_nfault_sensor(binary_sensor::BinarySensor *sensor) { this->nfault_sensor_ = sensor; }

  void set_current_factor_high_number(number::Number *num) { this->current_factor_high_ = num; }
  void set_low_current_threshold_number(number::Number *num) { this->low_current_threshold_ma_ = num; }
  void set_low_current_window_ms_number(number::Number *num) { this->low_current_window_ms_ = num; }
  void set_max_runtime_seconds_number(number::Number *num) { this->max_runtime_seconds_ = num; }
  void set_pwm_boost_ms_number(number::Number *num) { this->pwm_boost_ms_ = num; }
  void set_pwm_hold_duty_percent_number(number::Number *num) { this->pwm_hold_duty_percent_ = num; }
  void set_pwm_period_ms_number(number::Number *num) { this->pwm_period_ms_ = num; }
  void set_calibration_min_travel_ms_number(number::Number *num) { this->calibration_min_travel_ms_ = num; }
  void set_calibration_max_retries_number(number::Number *num) { this->calibration_max_retries_ = num; }
  void set_relearn_after_movements_number(number::Number *num) { this->relearn_after_movements_ = num; }
  void set_relearn_after_hours_number(number::Number *num) { this->relearn_after_hours_ = num; }
  void set_drift_relearn_threshold_percent_number(number::Number *num) { this->drift_relearn_threshold_percent_ = num; }
  void set_presence_test_duration_ms_number(number::Number *num) { this->presence_test_duration_ms_ = num; }

  bool start_motor(int motor_num, int direction);
  void stop_motor(int motor_num);
  void stop_all();

  bool start_presence_test(int motor_num, int direction);
  bool is_presence_test_active() const { return this->presence_test_active_; }

  void begin_calibration_session(int motor_num);
  void begin_calibration_attempt(int motor_num);
  bool finalize_calibration_attempt(int motor_num);
  void end_calibration_session(int motor_num);

  bool should_auto_relearn(int motor_num) const;
  bool is_motor_blocked(int motor_num) const;
  bool is_motor_present(int motor_num) const;

  uint32_t get_open_count(int motor_num) const;
  uint32_t get_close_count(int motor_num) const;
  uint32_t get_movement_count(int motor_num) const;
  int32_t get_deadzone_ms(int motor_num) const;
  float get_drift_percent(int motor_num) const;
  uint32_t get_learned_open_ms(int motor_num) const;
  uint32_t get_learned_close_ms(int motor_num) const;
  uint32_t get_calibration_retries(int motor_num) const;

  void acknowledge_fault_latch();
  bool has_fault_latch() const { return this->fault_latched_; }
  int get_current_fault_code() const { return static_cast<int>(this->current_fault_code_); }
  int get_current_fault_raw() const { return static_cast<int>(this->current_fault_raw_); }
  const char *get_current_fault_name() const { return this->fault_code_to_string_(this->current_fault_code_); }
  int get_latched_fault_code() const { return static_cast<int>(this->latched_fault_code_); }
  int get_latched_fault_motor() const { return this->latched_fault_motor_; }
  int get_latched_fault_raw() const { return static_cast<int>(this->latched_fault_raw_); }
  const char *get_latched_fault_name() const;

  bool is_motor_turning() const { return this->motor_turning_; }
  bool is_motor_busy() const { return this->motor_turning_; }
  int get_current_motor() const { return this->current_motor_; }
  int get_motor_direction() const { return this->motor_direction_; }

  bool endstop_event() const { return this->motor_endstop_event_; }
  bool stop_event() const { return this->motor_stop_event_; }
  bool fault_event() const { return this->motor_fault_event_; }

  float get_current_filtered() const { return this->motor_current_filtered_; }
  float get_current_raw() const { return this->motor_current_raw_; }
  float get_current_motor_mean_current() const;
  float get_mean_current(int motor_num) const;
  uint32_t get_run_time_ms() const { return this->motor_run_time_ms_; }

 protected:
  struct MeanCurrentPersist {
    float values[6];
  };

  struct MotorTelemetry {
    uint32_t movement_count{0};
    uint32_t open_count{0};
    uint32_t close_count{0};
    uint32_t last_open_endstop_ms{0};
    uint32_t last_close_endstop_ms{0};
    uint32_t learned_open_ms{0};
    uint32_t learned_close_ms{0};
    int32_t deadzone_ms{0};
    float drift_percent{0.0f};
    uint32_t movements_since_learn{0};
    uint32_t last_learn_ms{0};
    uint8_t calibration_retries{0};
    bool blocked{false};
    bool present{false};
    bool presence_known{false};
    bool relearn_requested{false};
    uint8_t last_fault_raw{0};
  };

  struct CalibrationSession {
    bool active{false};
    int motor_num{0};
    bool attempt_active{false};
    bool saw_open_endstop{false};
    bool saw_close_endstop{false};
    uint32_t open_travel_ms{0};
    uint32_t close_travel_ms{0};
  };

  std::array<drv8215::Drv8215 *, 6> drivers_{{nullptr, nullptr, nullptr, nullptr, nullptr, nullptr}};
  std::array<MotorTelemetry, 6> telemetry_{};

  sensor::Sensor *ipropi_voltage_sensor_{nullptr};
  binary_sensor::BinarySensor *nfault_sensor_{nullptr};

  number::Number *current_factor_high_{nullptr};
  number::Number *low_current_threshold_ma_{nullptr};
  number::Number *low_current_window_ms_{nullptr};
  number::Number *max_runtime_seconds_{nullptr};
  number::Number *pwm_boost_ms_{nullptr};
  number::Number *pwm_hold_duty_percent_{nullptr};
  number::Number *pwm_period_ms_{nullptr};
  number::Number *calibration_min_travel_ms_{nullptr};
  number::Number *calibration_max_retries_{nullptr};
  number::Number *relearn_after_movements_{nullptr};
  number::Number *relearn_after_hours_{nullptr};
  number::Number *drift_relearn_threshold_percent_{nullptr};
  number::Number *presence_test_duration_ms_{nullptr};

  drv8215::Drv8215 *active_driver_{nullptr};

  std::array<float, 6> mean_currents_{{40.0f, 40.0f, 40.0f, 40.0f, 40.0f, 40.0f}};

  bool motor_turning_{false};
  int current_motor_{0};
  int motor_direction_{0};

  bool motor_endstop_event_{false};
  bool motor_stop_event_{false};
  bool motor_fault_event_{false};

  float motor_current_raw_{0.0f};
  float motor_current_filtered_{0.0f};

  float motor_current_sum_{0.0f};
  int motor_current_count_{0};
  int motor_debounce_count_{0};
  int motor_low_current_count_{0};
  uint32_t motor_run_time_ms_{0};

  uint32_t drive_phase_elapsed_ms_{0};
  bool drive_output_enabled_{false};
  bool drive_output_initialized_{false};

  uint32_t last_tick_ms_{0};
  bool tick_initialized_{false};

  bool presence_test_active_{false};
  int presence_test_motor_{0};
  uint32_t presence_test_duration_ms_runtime_{0};

  CalibrationSession calibration_{};

  FaultCode current_fault_code_{FaultCode::FAULT_NONE};
  uint8_t current_fault_raw_{0};

  bool fault_latched_{false};
  FaultCode latched_fault_code_{FaultCode::FAULT_NONE};
  int latched_fault_motor_{0};
  uint8_t latched_fault_raw_{0};

  ESPPreferenceObject mean_currents_pref_;
  uint32_t last_pref_save_ms_{0};

  void process_tick_();
  void apply_drive_output_();
  void apply_drive_state_(bool enabled);

  void trigger_endstop_stop_(const char *reason, uint8_t fault_raw = 0);
  void trigger_fault_stop_(FaultCode code, const char *reason, uint8_t fault_raw = 0);
  void evaluate_nfault_stop_();
  void evaluate_overcurrent_or_endstop_();

  void stop_internal_(bool update_mean_current);
  void reset_run_state_();
  void clear_events_();

  FaultCode classify_fault_code_(const drv8215::Drv8215FaultStatus &status,
                                 FaultCode fallback,
                                 bool overcurrent_hint = false) const;
  const char *fault_code_to_string_(FaultCode code) const;
  void latch_fault_(int motor_num, FaultCode code, uint8_t raw, const char *reason);

  void update_telemetry_on_stop_(int motor_num,
                                 int direction,
                                 uint32_t run_time_ms,
                                 bool reached_endstop,
                                 FaultCode code,
                                 uint8_t raw_fault);
  void update_drift_for_motor_(int index);
  void update_adaptive_relearn_flag_(int index);

  float read_number_or_default_(number::Number *num, float fallback) const;
  void load_mean_currents_();
  void save_mean_currents_(bool force);

  int motor_to_index_(int motor_num) const;
};

}  // namespace motor_supervisor
}  // namespace esphome
