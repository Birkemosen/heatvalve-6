#include "motor_supervisor.h"

#include <algorithm>
#include <cmath>

#include <cstdint>

#include "esphome/components/drv8215/drv8215.h"
#include "esphome/core/hal.h"
#include "esphome/core/helpers.h"
#include "esphome/core/log.h"

namespace esphome {
namespace motor_supervisor {

static const char *const TAG = "motor_supervisor";

static constexpr uint32_t CONTROL_TICK_MS = 10;
static constexpr float IPROPI_CURRENT_DIVISOR = 0.027132f;

int MotorSupervisor::motor_to_index_(int motor_num) const {
  if (motor_num < 1 || motor_num > 6) {
    return -1;
  }
  return motor_num - 1;
}

void MotorSupervisor::setup() {
  this->load_mean_currents_();
  this->last_tick_ms_ = millis();
  this->tick_initialized_ = true;
  ESP_LOGI(TAG, "Motor supervisor initialized");
}

void MotorSupervisor::dump_config() {
  ESP_LOGCONFIG(TAG, "Motor Supervisor:");
  ESP_LOGCONFIG(TAG, "  Control tick: %ums", CONTROL_TICK_MS);
  ESP_LOGCONFIG(TAG, "  Drivers configured: %u", static_cast<unsigned>(std::count_if(
                                           this->drivers_.begin(), this->drivers_.end(),
                                           [](const drv8215::Drv8215 *d) { return d != nullptr; })));
  ESP_LOGCONFIG(TAG, "  Fault latched: %s", this->fault_latched_ ? this->fault_code_to_string_(this->latched_fault_code_) : "NONE");
}

void MotorSupervisor::loop() {
  const uint32_t now = millis();
  if (!this->tick_initialized_) {
    this->last_tick_ms_ = now;
    this->tick_initialized_ = true;
    return;
  }

  while (static_cast<int32_t>(now - this->last_tick_ms_) >= static_cast<int32_t>(CONTROL_TICK_MS)) {
    this->last_tick_ms_ += CONTROL_TICK_MS;
    this->process_tick_();
  }
}

bool MotorSupervisor::start_motor(int motor_num, int direction) {
  if (this->motor_turning_) {
    ESP_LOGW(TAG, "Cannot start motor %d: motor %d already running", motor_num, this->current_motor_);
    return false;
  }

  if (motor_num < 1 || motor_num > 6) {
    ESP_LOGW(TAG, "Cannot start motor %d: invalid motor index", motor_num);
    return false;
  }

  if (direction != 0 && direction != 1) {
    ESP_LOGW(TAG, "Cannot start motor %d: invalid direction %d", motor_num, direction);
    return false;
  }

  auto *driver = this->drivers_[motor_num - 1];
  if (driver == nullptr) {
    ESP_LOGW(TAG, "Cannot start motor %d: driver not configured", motor_num);
    return false;
  }

  const int motor_index = this->motor_to_index_(motor_num);
  if (motor_index >= 0 && this->telemetry_[motor_index].blocked &&
      !(this->calibration_.active && this->calibration_.motor_num == motor_num)) {
    ESP_LOGW(TAG, "Cannot start motor %d: motor is marked BLOCKED", motor_num);
    return false;
  }

  this->clear_events_();
  this->reset_run_state_();
  this->current_fault_code_ = FaultCode::FAULT_NONE;
  this->current_fault_raw_ = 0;

  this->current_motor_ = motor_num;
  this->motor_direction_ = direction;
  this->active_driver_ = driver;
  this->motor_turning_ = true;

  this->active_driver_->clear_fault();
  this->apply_drive_state_(true);

  ESP_LOGI(TAG, "Starting motor %d direction=%s", motor_num, direction == 1 ? "OPEN" : "CLOSE");
  return true;
}

void MotorSupervisor::stop_motor(int motor_num) {
  if (!this->motor_turning_) {
    return;
  }

  if (motor_num >= 1 && this->current_motor_ != motor_num) {
    ESP_LOGW(TAG, "Stop request for motor %d ignored (current motor=%d)", motor_num, this->current_motor_);
    return;
  }

  ESP_LOGI(TAG, "Stopping motor %d", this->current_motor_);
  this->stop_internal_(true);
}

void MotorSupervisor::stop_all() {
  this->presence_test_active_ = false;

  if (this->motor_turning_) {
    ESP_LOGI(TAG, "Stopping all motors (current=%d)", this->current_motor_);
    this->stop_internal_(true);
  }

  for (auto *driver : this->drivers_) {
    if (driver != nullptr) {
      driver->motor_coast();
    }
  }

  this->clear_events_();
  this->reset_run_state_();
  this->motor_turning_ = false;
  this->current_motor_ = 0;
  this->motor_direction_ = 0;
  this->active_driver_ = nullptr;
}

bool MotorSupervisor::start_presence_test(int motor_num, int direction) {
  if (this->presence_test_active_) {
    ESP_LOGW(TAG, "Presence test already active for motor %d", this->presence_test_motor_);
    return false;
  }

  if (this->calibration_.active) {
    ESP_LOGW(TAG, "Cannot start presence test while calibration session is active");
    return false;
  }

  const uint32_t duration_ms = static_cast<uint32_t>(
      std::max(200.0f, this->read_number_or_default_(this->presence_test_duration_ms_, 800.0f)));

  if (!this->start_motor(motor_num, direction)) {
    return false;
  }

  this->presence_test_active_ = true;
  this->presence_test_motor_ = motor_num;
  this->presence_test_duration_ms_runtime_ = duration_ms;
  ESP_LOGI(TAG, "Presence test started for motor %d (%ums)", motor_num, duration_ms);
  return true;
}

void MotorSupervisor::begin_calibration_session(int motor_num) {
  const int index = this->motor_to_index_(motor_num);
  if (index < 0) {
    return;
  }

  this->calibration_.active = true;
  this->calibration_.motor_num = motor_num;
  this->calibration_.attempt_active = false;
  this->calibration_.saw_open_endstop = false;
  this->calibration_.saw_close_endstop = false;
  this->calibration_.open_travel_ms = 0;
  this->calibration_.close_travel_ms = 0;

  this->telemetry_[index].relearn_requested = false;
  this->telemetry_[index].calibration_retries = 0;
}

void MotorSupervisor::begin_calibration_attempt(int motor_num) {
  if (!this->calibration_.active || this->calibration_.motor_num != motor_num) {
    return;
  }

  this->calibration_.attempt_active = true;
  this->calibration_.saw_open_endstop = false;
  this->calibration_.saw_close_endstop = false;
  this->calibration_.open_travel_ms = 0;
  this->calibration_.close_travel_ms = 0;
}

bool MotorSupervisor::finalize_calibration_attempt(int motor_num) {
  if (!this->calibration_.active || this->calibration_.motor_num != motor_num) {
    return false;
  }

  const int index = this->motor_to_index_(motor_num);
  if (index < 0) {
    return false;
  }

  auto &telemetry = this->telemetry_[index];
  const uint32_t min_travel_ms = static_cast<uint32_t>(
      std::max(500.0f, this->read_number_or_default_(this->calibration_min_travel_ms_, 3000.0f)));

  bool valid_cycle = this->calibration_.attempt_active &&
                     this->calibration_.saw_open_endstop &&
                     this->calibration_.saw_close_endstop &&
                     this->calibration_.open_travel_ms >= min_travel_ms &&
                     this->calibration_.close_travel_ms >= min_travel_ms;

  this->calibration_.attempt_active = false;

  if (valid_cycle) {
    telemetry.learned_open_ms = this->calibration_.open_travel_ms;
    telemetry.learned_close_ms = this->calibration_.close_travel_ms;
    telemetry.deadzone_ms = static_cast<int32_t>(telemetry.learned_close_ms) -
                            static_cast<int32_t>(telemetry.learned_open_ms);
    telemetry.drift_percent = 0.0f;
    telemetry.movements_since_learn = 0;
    telemetry.last_learn_ms = millis();
    telemetry.calibration_retries = 0;
    telemetry.blocked = false;
    telemetry.relearn_requested = false;
    telemetry.present = true;
    telemetry.presence_known = true;
    return true;
  }

  if (telemetry.calibration_retries < 255) {
    telemetry.calibration_retries++;
  }

  const int max_retries = static_cast<int>(
      std::max(0.0f, this->read_number_or_default_(this->calibration_max_retries_, 2.0f)));
  if (static_cast<int>(telemetry.calibration_retries) > max_retries) {
    telemetry.blocked = true;
    this->latch_fault_(motor_num, FaultCode::FAULT_BLOCKED, telemetry.last_fault_raw,
                       "calibration travel too short");
  }

  return false;
}

void MotorSupervisor::end_calibration_session(int motor_num) {
  if (!this->calibration_.active || this->calibration_.motor_num != motor_num) {
    return;
  }

  this->calibration_.active = false;
  this->calibration_.attempt_active = false;
  this->calibration_.motor_num = 0;
  this->calibration_.saw_open_endstop = false;
  this->calibration_.saw_close_endstop = false;
  this->calibration_.open_travel_ms = 0;
  this->calibration_.close_travel_ms = 0;
}

bool MotorSupervisor::should_auto_relearn(int motor_num) const {
  const int index = this->motor_to_index_(motor_num);
  if (index < 0) {
    return false;
  }

  const auto &telemetry = this->telemetry_[index];
  if (telemetry.blocked) {
    return false;
  }

  if (this->motor_turning_ || this->presence_test_active_) {
    return false;
  }

  if (this->calibration_.active) {
    return false;
  }

  if (telemetry.relearn_requested) {
    return true;
  }

  const float movement_threshold = this->read_number_or_default_(this->relearn_after_movements_, 2000.0f);
  if (movement_threshold > 0.0f && telemetry.movements_since_learn >= static_cast<uint32_t>(movement_threshold)) {
    return true;
  }

  const float hours_threshold = this->read_number_or_default_(this->relearn_after_hours_, 168.0f);
  if (hours_threshold > 0.0f && telemetry.last_learn_ms > 0) {
    const uint32_t elapsed_ms = millis() - telemetry.last_learn_ms;
    const uint32_t threshold_ms = static_cast<uint32_t>(hours_threshold * 3600.0f * 1000.0f);
    if (elapsed_ms >= threshold_ms) {
      return true;
    }
  }

  return false;
}

bool MotorSupervisor::is_motor_blocked(int motor_num) const {
  const int index = this->motor_to_index_(motor_num);
  if (index < 0) {
    return false;
  }
  return this->telemetry_[index].blocked;
}

bool MotorSupervisor::is_motor_present(int motor_num) const {
  const int index = this->motor_to_index_(motor_num);
  if (index < 0) {
    return false;
  }
  if (!this->telemetry_[index].presence_known) {
    return true;
  }
  return this->telemetry_[index].present;
}

uint32_t MotorSupervisor::get_open_count(int motor_num) const {
  const int index = this->motor_to_index_(motor_num);
  return index >= 0 ? this->telemetry_[index].open_count : 0;
}

uint32_t MotorSupervisor::get_close_count(int motor_num) const {
  const int index = this->motor_to_index_(motor_num);
  return index >= 0 ? this->telemetry_[index].close_count : 0;
}

uint32_t MotorSupervisor::get_movement_count(int motor_num) const {
  const int index = this->motor_to_index_(motor_num);
  return index >= 0 ? this->telemetry_[index].movement_count : 0;
}

int32_t MotorSupervisor::get_deadzone_ms(int motor_num) const {
  const int index = this->motor_to_index_(motor_num);
  return index >= 0 ? this->telemetry_[index].deadzone_ms : 0;
}

float MotorSupervisor::get_drift_percent(int motor_num) const {
  const int index = this->motor_to_index_(motor_num);
  return index >= 0 ? this->telemetry_[index].drift_percent : 0.0f;
}

uint32_t MotorSupervisor::get_learned_open_ms(int motor_num) const {
  const int index = this->motor_to_index_(motor_num);
  return index >= 0 ? this->telemetry_[index].learned_open_ms : 0;
}

uint32_t MotorSupervisor::get_learned_close_ms(int motor_num) const {
  const int index = this->motor_to_index_(motor_num);
  return index >= 0 ? this->telemetry_[index].learned_close_ms : 0;
}

uint32_t MotorSupervisor::get_calibration_retries(int motor_num) const {
  const int index = this->motor_to_index_(motor_num);
  return index >= 0 ? this->telemetry_[index].calibration_retries : 0;
}

void MotorSupervisor::acknowledge_fault_latch() {
  this->fault_latched_ = false;
  this->latched_fault_code_ = FaultCode::FAULT_NONE;
  this->latched_fault_motor_ = 0;
  this->latched_fault_raw_ = 0;
}

const char *MotorSupervisor::get_latched_fault_name() const {
  if (!this->fault_latched_) {
    return "NONE";
  }
  return this->fault_code_to_string_(this->latched_fault_code_);
}

float MotorSupervisor::get_current_motor_mean_current() const {
  return this->get_mean_current(this->current_motor_);
}

float MotorSupervisor::get_mean_current(int motor_num) const {
  if (motor_num < 1 || motor_num > 6) {
    return 0.0f;
  }
  return this->mean_currents_[motor_num - 1];
}

void MotorSupervisor::process_tick_() {
  if (!this->motor_turning_ || this->active_driver_ == nullptr) {
    return;
  }

  this->motor_run_time_ms_ += CONTROL_TICK_MS;
  this->drive_phase_elapsed_ms_ += CONTROL_TICK_MS;

  this->apply_drive_output_();

  if (this->nfault_sensor_ != nullptr && this->nfault_sensor_->state) {
    this->evaluate_nfault_stop_();
    return;
  }

  float max_runtime_ms = this->read_number_or_default_(this->max_runtime_seconds_, 65.0f) * 1000.0f;
  const int index = this->motor_to_index_(this->current_motor_);
  if (index >= 0 && this->telemetry_[index].learned_open_ms > 0 && this->telemetry_[index].learned_close_ms > 0) {
    const uint32_t learned_max = std::max(this->telemetry_[index].learned_open_ms,
                                          this->telemetry_[index].learned_close_ms);
    const uint32_t deadzone_abs = this->telemetry_[index].deadzone_ms >= 0
                                      ? static_cast<uint32_t>(this->telemetry_[index].deadzone_ms)
                                      : static_cast<uint32_t>(-this->telemetry_[index].deadzone_ms);
    const uint32_t adaptive_cap_ms = learned_max + deadzone_abs + 5000;
    if (adaptive_cap_ms > 1000 && adaptive_cap_ms < static_cast<uint32_t>(max_runtime_ms)) {
      max_runtime_ms = static_cast<float>(adaptive_cap_ms);
    }
  }

  if (max_runtime_ms > 0.0f && this->motor_run_time_ms_ >= static_cast<uint32_t>(max_runtime_ms)) {
    this->trigger_fault_stop_(FaultCode::FAULT_TIMEOUT, "runtime timeout");
    return;
  }

  float voltage = 0.0f;
  if (this->ipropi_voltage_sensor_ != nullptr && this->ipropi_voltage_sensor_->has_state()) {
    voltage = this->ipropi_voltage_sensor_->state;
  }
  if (!std::isfinite(voltage)) {
    voltage = 0.0f;
  }

  this->motor_current_raw_ = voltage / IPROPI_CURRENT_DIVISOR;
  this->motor_current_filtered_ = this->motor_current_filtered_ * 0.95f + this->motor_current_raw_ * 0.05f;

  if (this->motor_debounce_count_ < 255) {
    this->motor_debounce_count_++;
  }

  if (this->motor_debounce_count_ < 50) {
    return;
  }

  const float mean_current = this->get_mean_current(this->current_motor_);
  const float factor_high = this->read_number_or_default_(this->current_factor_high_, 1.7f);
  const float threshold_high = mean_current * factor_high;

  if (this->motor_current_filtered_ > threshold_high || this->motor_current_filtered_ > 150.0f) {
    this->evaluate_overcurrent_or_endstop_();
    return;
  }

  const float low_current_threshold = this->read_number_or_default_(this->low_current_threshold_ma_, 5.0f);
  if (low_current_threshold > 0.0f) {
    if (this->motor_current_filtered_ < low_current_threshold) {
      if (this->motor_low_current_count_ < 10000) {
        this->motor_low_current_count_++;
      }
    } else {
      this->motor_low_current_count_ = 0;
    }

    int low_current_window_count =
        static_cast<int>(this->read_number_or_default_(this->low_current_window_ms_, 1200.0f) /
                         static_cast<float>(CONTROL_TICK_MS));
    if (low_current_window_count < 1) {
      low_current_window_count = 1;
    }

    if (this->motor_low_current_count_ >= low_current_window_count) {
      this->trigger_fault_stop_(FaultCode::FAULT_OPEN_CIRCUIT, "low current window");
      return;
    }
  }

  if (this->motor_current_filtered_ > 5.0f) {
    this->motor_current_sum_ += this->motor_current_filtered_;
    this->motor_current_count_++;
  }

  if (this->presence_test_active_ && this->current_motor_ == this->presence_test_motor_ &&
      this->motor_run_time_ms_ >= this->presence_test_duration_ms_runtime_) {
    const float low_current_threshold = this->read_number_or_default_(this->low_current_threshold_ma_, 5.0f);
    const bool present = this->motor_current_filtered_ >= std::max(3.0f, low_current_threshold * 0.8f);

    const int presence_index = this->motor_to_index_(this->presence_test_motor_);
    if (presence_index >= 0) {
      this->telemetry_[presence_index].presence_known = true;
      this->telemetry_[presence_index].present = present;
    }

    this->presence_test_active_ = false;
    if (present) {
      this->motor_stop_event_ = true;
      this->stop_internal_(false);
    } else {
      this->trigger_fault_stop_(FaultCode::FAULT_OPEN_CIRCUIT, "presence test no-load");
    }
  }
}

void MotorSupervisor::apply_drive_output_() {
  if (!this->motor_turning_ || this->active_driver_ == nullptr) {
    return;
  }

  const uint32_t boost_ms =
      static_cast<uint32_t>(std::max(0.0f, this->read_number_or_default_(this->pwm_boost_ms_, 350.0f)));
  const float duty_percent = std::clamp(this->read_number_or_default_(this->pwm_hold_duty_percent_, 70.0f), 0.0f, 100.0f);
  uint32_t period_ms =
      static_cast<uint32_t>(std::max(10.0f, this->read_number_or_default_(this->pwm_period_ms_, 40.0f)));

  bool drive_on = true;

  if (this->drive_phase_elapsed_ms_ > boost_ms) {
    if (duty_percent <= 0.0f) {
      drive_on = false;
    } else if (duty_percent >= 100.0f) {
      drive_on = true;
    } else {
      const uint32_t hold_elapsed = this->drive_phase_elapsed_ms_ - boost_ms;
      const uint32_t in_period = hold_elapsed % period_ms;
      uint32_t on_ms = static_cast<uint32_t>((static_cast<float>(period_ms) * duty_percent) / 100.0f);
      if (on_ms < 1) {
        on_ms = 1;
      }
      drive_on = in_period < on_ms;
    }
  }

  this->apply_drive_state_(drive_on);
}

void MotorSupervisor::apply_drive_state_(bool enabled) {
  if (!this->motor_turning_ || this->active_driver_ == nullptr) {
    return;
  }

  if (this->drive_output_initialized_ && this->drive_output_enabled_ == enabled) {
    return;
  }

  if (enabled) {
    if (this->motor_direction_ == 1) {
      this->active_driver_->motor_forward();
    } else {
      this->active_driver_->motor_reverse();
    }
  } else {
    this->active_driver_->motor_coast();
  }

  this->drive_output_enabled_ = enabled;
  this->drive_output_initialized_ = true;
}

void MotorSupervisor::evaluate_nfault_stop_() {
  if (this->active_driver_ == nullptr) {
    this->trigger_fault_stop_(FaultCode::FAULT_UNKNOWN, "nFAULT without active driver");
    return;
  }

  const auto fault_status = this->active_driver_->read_fault_status();
  FaultCode code = this->classify_fault_code_(fault_status, FaultCode::FAULT_STALL);

  if (code == FaultCode::FAULT_THERMAL || code == FaultCode::FAULT_OVERCURRENT) {
    this->trigger_fault_stop_(code, "nFAULT hardware fault", fault_status.raw);
    return;
  }

  if (code == FaultCode::FAULT_STALL) {
    const float min_travel_ms = this->read_number_or_default_(this->calibration_min_travel_ms_, 3000.0f);
    if (this->calibration_.active && this->calibration_.motor_num == this->current_motor_ &&
        this->motor_run_time_ms_ < static_cast<uint32_t>(std::max(500.0f, min_travel_ms * 0.5f))) {
      this->trigger_fault_stop_(FaultCode::FAULT_BLOCKED, "stall too early", fault_status.raw);
      return;
    }

    this->trigger_endstop_stop_("nFAULT stall", fault_status.raw);
    return;
  }

  this->trigger_fault_stop_(FaultCode::FAULT_UNKNOWN, "nFAULT unknown", fault_status.raw);
}

void MotorSupervisor::evaluate_overcurrent_or_endstop_() {
  if (this->active_driver_ == nullptr) {
    this->trigger_endstop_stop_("overcurrent threshold");
    return;
  }

  const auto fault_status = this->active_driver_->read_fault_status();
  FaultCode code = this->classify_fault_code_(fault_status, FaultCode::FAULT_NONE, true);

  if (code == FaultCode::FAULT_THERMAL || code == FaultCode::FAULT_OVERCURRENT) {
    this->trigger_fault_stop_(code, "overcurrent threshold", fault_status.raw);
    return;
  }

  if (code == FaultCode::FAULT_STALL || code == FaultCode::FAULT_NONE) {
    this->trigger_endstop_stop_("overcurrent endstop", fault_status.raw);
    return;
  }

  this->trigger_fault_stop_(code, "overcurrent classified fault", fault_status.raw);
}

void MotorSupervisor::trigger_endstop_stop_(const char *reason, uint8_t fault_raw) {
  ESP_LOGI(TAG, "Motor %d stop: %s (filt=%.1fmA)", this->current_motor_, reason, this->motor_current_filtered_);
  this->current_fault_code_ = FaultCode::FAULT_NONE;
  this->current_fault_raw_ = fault_raw;
  this->motor_endstop_event_ = true;
  this->motor_stop_event_ = true;
  this->stop_internal_(true);
}

void MotorSupervisor::trigger_fault_stop_(FaultCode code, const char *reason, uint8_t fault_raw) {
  ESP_LOGW(TAG, "Motor %d safety stop: %s (filt=%.1fmA runtime=%ums)", this->current_motor_, reason,
           this->motor_current_filtered_, this->motor_run_time_ms_);

  this->current_fault_code_ = code;
  this->current_fault_raw_ = fault_raw;
  this->motor_fault_event_ = true;
  this->motor_stop_event_ = true;

  const int index = this->motor_to_index_(this->current_motor_);
  if (index >= 0) {
    if (code == FaultCode::FAULT_OPEN_CIRCUIT) {
      this->telemetry_[index].presence_known = true;
      this->telemetry_[index].present = false;
    }
    if (code == FaultCode::FAULT_BLOCKED) {
      this->telemetry_[index].blocked = true;
    }
  }

  this->latch_fault_(this->current_motor_, code, fault_raw, reason);
  this->presence_test_active_ = false;
  this->stop_internal_(true);
}

void MotorSupervisor::stop_internal_(bool update_mean_current) {
  if (!this->motor_turning_) {
    return;
  }

  const int motor_num = this->current_motor_;
  const int direction = this->motor_direction_;
  const uint32_t run_time_ms = this->motor_run_time_ms_;
  const bool reached_endstop = this->motor_endstop_event_;
  const FaultCode stop_code = this->current_fault_code_;
  const uint8_t raw_fault = this->current_fault_raw_;

  if (update_mean_current && motor_num >= 1 && motor_num <= 6 && this->motor_current_count_ > 20) {
    const float new_mean = this->motor_current_sum_ / static_cast<float>(this->motor_current_count_);
    if (std::isfinite(new_mean) && new_mean > 5.0f) {
      float &mean_ref = this->mean_currents_[motor_num - 1];
      mean_ref = mean_ref * 0.8f + new_mean * 0.2f;
      ESP_LOGI(TAG, "Motor %d mean current updated: %.1f mA", motor_num, mean_ref);
      this->save_mean_currents_(false);
    }
  }

  if (this->active_driver_ != nullptr) {
    this->active_driver_->motor_coast();
  }

  this->motor_turning_ = false;
  this->current_motor_ = 0;
  this->motor_direction_ = 0;
  this->active_driver_ = nullptr;

  this->update_telemetry_on_stop_(motor_num, direction, run_time_ms, reached_endstop, stop_code, raw_fault);

  this->reset_run_state_();
}

void MotorSupervisor::reset_run_state_() {
  this->motor_current_raw_ = 0.0f;
  this->motor_current_filtered_ = 0.0f;
  this->motor_current_sum_ = 0.0f;
  this->motor_current_count_ = 0;
  this->motor_debounce_count_ = 0;
  this->motor_low_current_count_ = 0;
  this->motor_run_time_ms_ = 0;
  this->drive_phase_elapsed_ms_ = 0;
  this->drive_output_enabled_ = false;
  this->drive_output_initialized_ = false;
}

void MotorSupervisor::clear_events_() {
  this->motor_endstop_event_ = false;
  this->motor_stop_event_ = false;
  this->motor_fault_event_ = false;
  this->current_fault_code_ = FaultCode::FAULT_NONE;
  this->current_fault_raw_ = 0;
}

FaultCode MotorSupervisor::classify_fault_code_(const drv8215::Drv8215FaultStatus &status,
                                                FaultCode fallback,
                                                bool overcurrent_hint) const {
  if (status.tsd) {
    return FaultCode::FAULT_THERMAL;
  }
  if (status.ocp) {
    return FaultCode::FAULT_OVERCURRENT;
  }
  if (status.stall) {
    return FaultCode::FAULT_STALL;
  }

  if (fallback != FaultCode::FAULT_NONE) {
    return fallback;
  }

  if (overcurrent_hint) {
    return FaultCode::FAULT_OVERCURRENT;
  }

  return FaultCode::FAULT_UNKNOWN;
}

const char *MotorSupervisor::fault_code_to_string_(FaultCode code) const {
  switch (code) {
    case FaultCode::FAULT_NONE:
      return "NONE";
    case FaultCode::FAULT_OPEN_CIRCUIT:
      return "OPEN_CIRCUIT";
    case FaultCode::FAULT_BLOCKED:
      return "BLOCKED";
    case FaultCode::FAULT_TIMEOUT:
      return "TIMEOUT";
    case FaultCode::FAULT_OVERCURRENT:
      return "OVERCURRENT";
    case FaultCode::FAULT_THERMAL:
      return "THERMAL";
    case FaultCode::FAULT_STALL:
      return "STALL";
    case FaultCode::FAULT_UNKNOWN:
    default:
      return "UNKNOWN";
  }
}

void MotorSupervisor::latch_fault_(int motor_num, FaultCode code, uint8_t raw, const char *reason) {
  if (code == FaultCode::FAULT_NONE) {
    return;
  }

  this->fault_latched_ = true;
  this->latched_fault_code_ = code;
  this->latched_fault_motor_ = motor_num;
  this->latched_fault_raw_ = raw;

  ESP_LOGW(TAG, "Latched fault motor %d: %s (%s, raw=0x%02X)", motor_num,
           this->fault_code_to_string_(code), reason, raw);
}

void MotorSupervisor::update_telemetry_on_stop_(int motor_num,
                                                int direction,
                                                uint32_t run_time_ms,
                                                bool reached_endstop,
                                                FaultCode code,
                                                uint8_t raw_fault) {
  const int index = this->motor_to_index_(motor_num);
  if (index < 0) {
    return;
  }

  auto &telemetry = this->telemetry_[index];
  telemetry.movement_count++;
  telemetry.movements_since_learn++;
  telemetry.last_fault_raw = raw_fault;

  if (direction == 1) {
    telemetry.open_count++;
  } else {
    telemetry.close_count++;
  }

  if (code == FaultCode::FAULT_OPEN_CIRCUIT) {
    telemetry.presence_known = true;
    telemetry.present = false;
  } else if (code == FaultCode::FAULT_NONE || code == FaultCode::FAULT_STALL) {
    telemetry.presence_known = true;
    telemetry.present = true;
  }

  if (code == FaultCode::FAULT_BLOCKED) {
    telemetry.blocked = true;
  }

  if (reached_endstop) {
    if (direction == 1) {
      telemetry.last_open_endstop_ms = run_time_ms;
    } else {
      telemetry.last_close_endstop_ms = run_time_ms;
    }

    if (telemetry.last_open_endstop_ms > 0 && telemetry.last_close_endstop_ms > 0) {
      telemetry.deadzone_ms = static_cast<int32_t>(telemetry.last_close_endstop_ms) -
                              static_cast<int32_t>(telemetry.last_open_endstop_ms);
      this->update_drift_for_motor_(index);
      this->update_adaptive_relearn_flag_(index);
    }

    if (this->calibration_.active && this->calibration_.motor_num == motor_num && this->calibration_.attempt_active) {
      if (direction == 1) {
        this->calibration_.saw_open_endstop = true;
        this->calibration_.open_travel_ms = run_time_ms;
      } else {
        this->calibration_.saw_close_endstop = true;
        this->calibration_.close_travel_ms = run_time_ms;
      }
    }
  }
}

void MotorSupervisor::update_drift_for_motor_(int index) {
  auto &telemetry = this->telemetry_[index];
  if (telemetry.learned_open_ms == 0 || telemetry.learned_close_ms == 0) {
    telemetry.drift_percent = 0.0f;
    return;
  }

  if (telemetry.last_open_endstop_ms == 0 || telemetry.last_close_endstop_ms == 0) {
    return;
  }

  const float baseline = (static_cast<float>(telemetry.learned_open_ms) +
                          static_cast<float>(telemetry.learned_close_ms)) /
                         2.0f;
  const float latest = (static_cast<float>(telemetry.last_open_endstop_ms) +
                        static_cast<float>(telemetry.last_close_endstop_ms)) /
                       2.0f;

  if (baseline <= 0.0f) {
    telemetry.drift_percent = 0.0f;
    return;
  }

  telemetry.drift_percent = std::abs(latest - baseline) * 100.0f / baseline;
}

void MotorSupervisor::update_adaptive_relearn_flag_(int index) {
  auto &telemetry = this->telemetry_[index];
  const float drift_threshold = this->read_number_or_default_(this->drift_relearn_threshold_percent_, 15.0f);
  if (drift_threshold > 0.0f && telemetry.drift_percent >= drift_threshold) {
    telemetry.relearn_requested = true;
  }
}

float MotorSupervisor::read_number_or_default_(number::Number *num, float fallback) const {
  if (num == nullptr) {
    return fallback;
  }
  if (!std::isfinite(num->state)) {
    return fallback;
  }
  return num->state;
}

void MotorSupervisor::load_mean_currents_() {
  this->mean_currents_ = {{40.0f, 40.0f, 40.0f, 40.0f, 40.0f, 40.0f}};

  if (global_preferences == nullptr) {
    return;
  }

  this->mean_currents_pref_ =
      global_preferences->make_preference<MeanCurrentPersist>(fnv1_hash("hv6_motor_mean_currents_v1"), true);

  MeanCurrentPersist persisted{};
  if (!this->mean_currents_pref_.load(&persisted)) {
    return;
  }

  for (size_t i = 0; i < this->mean_currents_.size(); i++) {
    float value = persisted.values[i];
    if (!std::isfinite(value)) {
      continue;
    }
    if (value < 5.0f || value > 300.0f) {
      continue;
    }
    this->mean_currents_[i] = value;
  }
}

void MotorSupervisor::save_mean_currents_(bool force) {
  if (global_preferences == nullptr) {
    return;
  }

  const uint32_t now = millis();
  if (!force && (now - this->last_pref_save_ms_ < 5000)) {
    return;
  }

  MeanCurrentPersist persisted{};
  for (size_t i = 0; i < this->mean_currents_.size(); i++) {
    persisted.values[i] = this->mean_currents_[i];
  }

  this->mean_currents_pref_.save(&persisted);
  global_preferences->sync();
  this->last_pref_save_ms_ = now;
}

}  // namespace motor_supervisor
}  // namespace esphome
