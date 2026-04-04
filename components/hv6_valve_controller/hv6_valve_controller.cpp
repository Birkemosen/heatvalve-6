// =============================================================================
// HV6 Valve Controller — ESPHome Component Implementation
// =============================================================================
// Ported from lib/valve_controller/src/valve_controller.cpp
// Key change: uses ESPHome I2C bus and sensor abstractions instead of raw
// ESP-IDF drivers. The FreeRTOS motor task is preserved because the 10ms
// tick motor FSM cannot run in ESPHome's main loop (too slow, non-deterministic).
// =============================================================================

#include "hv6_valve_controller.h"
#include "esphome/core/log.h"
#include "esp_timer.h"
#include "esp_adc/adc_oneshot.h"
#include "esp_adc/adc_cali.h"
#include "esp_adc/adc_cali_scheme.h"
#include <algorithm>
#include <cmath>
#include <inttypes.h>

namespace hv6 {

static const char *const TAG = "hv6_valve_ctrl";

// =============================================================================
// ESPHome Lifecycle
// =============================================================================

void Hv6ValveController::setup() {
  mean_currents_.fill(INITIAL_MEAN_CURRENT_MA);

  telemetry_mutex_ = xSemaphoreCreateMutex();
  if (telemetry_mutex_ == nullptr) {
    ESP_LOGE(TAG, "Failed to create telemetry mutex");
    this->mark_failed();
    return;
  }

  cmd_queue_ = xQueueCreate(CMD_QUEUE_LEN, sizeof(ValveCommand));
  if (cmd_queue_ == nullptr) {
    ESP_LOGE(TAG, "Failed to create command queue");
    this->mark_failed();
    return;
  }

  // Load motor config from config store
  if (config_store_) {
    motor_cfg_ = config_store_->get_config().motor;
  }

  // Configure nSLEEP (output, default LOW = sleep)
  gpio_config_t nsleep_cfg = {};
  nsleep_cfg.pin_bit_mask = 1ULL << nsleep_pin_;
  nsleep_cfg.mode = GPIO_MODE_OUTPUT;
  nsleep_cfg.pull_up_en = GPIO_PULLUP_DISABLE;
  nsleep_cfg.pull_down_en = GPIO_PULLDOWN_DISABLE;
  gpio_config(&nsleep_cfg);
  set_nsleep_(false);

  // Configure nFAULT (input, active-low, wired-OR)
  gpio_config_t nfault_cfg = {};
  nfault_cfg.pin_bit_mask = 1ULL << nfault_pin_;
  nfault_cfg.mode = GPIO_MODE_INPUT;
  nfault_cfg.pull_up_en = GPIO_PULLUP_ENABLE;
  nfault_cfg.pull_down_en = GPIO_PULLDOWN_DISABLE;
  gpio_config(&nfault_cfg);

  // Initialize direct ADC for IPROPI (fast 1ms sampling for ripple counting)
  adc_unit_t adc_unit;
  adc_channel_t adc_chan;
  esp_err_t adc_err = adc_oneshot_io_to_channel(static_cast<int>(ipropi_pin_),
                                                 &adc_unit, &adc_chan);
  if (adc_err == ESP_OK) {
    ipropi_channel_ = static_cast<int>(adc_chan);
    adc_oneshot_unit_init_cfg_t unit_cfg = {};
    unit_cfg.unit_id = adc_unit;
    unit_cfg.ulp_mode = ADC_ULP_MODE_DISABLE;
    adc_oneshot_unit_handle_t adc_h = nullptr;
    adc_err = adc_oneshot_new_unit(&unit_cfg, &adc_h);
    adc_handle_ = adc_h;
  }
  if (adc_err == ESP_OK) {
    adc_oneshot_chan_cfg_t chan_cfg = {};
    chan_cfg.atten = ADC_ATTEN_DB_12;
    chan_cfg.bitwidth = ADC_BITWIDTH_12;
    adc_err = adc_oneshot_config_channel(
        static_cast<adc_oneshot_unit_handle_t>(adc_handle_),
        static_cast<adc_channel_t>(ipropi_channel_), &chan_cfg);
  }
  if (adc_err == ESP_OK) {
    adc_cali_curve_fitting_config_t cali_cfg = {};
    cali_cfg.unit_id = adc_unit;
    cali_cfg.chan = static_cast<adc_channel_t>(ipropi_channel_);
    cali_cfg.atten = ADC_ATTEN_DB_12;
    cali_cfg.bitwidth = ADC_BITWIDTH_12;
    adc_cali_handle_t cali_h = nullptr;
    adc_err = adc_cali_create_scheme_curve_fitting(&cali_cfg, &cali_h);
    if (adc_err != ESP_OK) {
      ESP_LOGW(TAG, "ADC calibration init failed, using uncalibrated");
      cali_h = nullptr;
    }
    adc_cali_handle_ = cali_h;
    ripple_enabled_ = true;
    ESP_LOGI(TAG, "IPROPI ADC initialized (GPIO%d), ripple counting enabled", ipropi_pin_);
  } else {
    ESP_LOGW(TAG, "IPROPI ADC init failed (err=%d), ripple counting disabled", adc_err);
    ripple_enabled_ = false;
  }

  // Wake DRV8215 chips
  set_nsleep_(true);
  drivers_enabled_ = true;
  vTaskDelay(pdMS_TO_TICKS(5));

  // Create DRV8215 instances
  for (uint8_t i = 0; i < NUM_ZONES; i++) {
    drivers_[i] = new DRV8215(i2c_bus_, motor_addresses_[i], i + 1);
    if (!drivers_[i]->init()) {
      ESP_LOGW(TAG, "Motor %d init failed (addr 0x%02X)", i + 1, motor_addresses_[i]);
      telemetry_[i].present = false;
      telemetry_[i].presence_known = true;
    } else {
      telemetry_[i].present = true;
      telemetry_[i].presence_known = true;
    }
  }

  // Load persisted calibration data
  if (config_store_) {
    for (uint8_t i = 0; i < NUM_ZONES; i++) {
      MotorTelemetry saved;
      if (config_store_->load_motor_telemetry(i, saved)) {
        xSemaphoreTake(telemetry_mutex_, portMAX_DELAY);
        telemetry_[i].learned_open_ms = saved.learned_open_ms;
        telemetry_[i].learned_close_ms = saved.learned_close_ms;
        telemetry_[i].deadzone_ms = saved.deadzone_ms;
        telemetry_[i].mean_current_ma = saved.mean_current_ma;
        telemetry_[i].movement_count = saved.movement_count;
        telemetry_[i].movements_since_learn = saved.movements_since_learn;
        telemetry_[i].last_learn_ms = saved.last_learn_ms;
        mean_currents_[i] = saved.mean_current_ma;
        xSemaphoreGive(telemetry_mutex_);
      }
    }
  }

  // Start motor FSM task on Core 1
  BaseType_t ok = xTaskCreatePinnedToCore(
      task_func_, "hv6_valve", STACK_SIZE, this, PRIORITY, &task_handle_, CORE);
  if (ok != pdPASS) {
    ESP_LOGE(TAG, "Failed to create valve task");
    this->mark_failed();
    return;
  }

  ESP_LOGI(TAG, "Valve controller initialized (%d motors)", NUM_ZONES);
}

void Hv6ValveController::dump_config() {
  ESP_LOGCONFIG(TAG, "HV6 Valve Controller:");
  ESP_LOGCONFIG(TAG, "  nSLEEP pin: GPIO%d", nsleep_pin_);
  ESP_LOGCONFIG(TAG, "  nFAULT pin: GPIO%d", nfault_pin_);
  ESP_LOGCONFIG(TAG, "  IPROPI pin: GPIO%d  ripple=%s", ipropi_pin_,
                ripple_enabled_ ? "yes" : "no");
  for (uint8_t i = 0; i < NUM_ZONES; i++) {
    ESP_LOGCONFIG(TAG, "  Motor %d: addr=0x%02X present=%s", i + 1,
                  motor_addresses_[i], telemetry_[i].present ? "yes" : "no");
  }
}

void Hv6ValveController::loop() {
  // Publish latest current to ESPHome sensor only while a motor is running
  if (!motor_turning_ || !current_sensor_)
    return;
  uint32_t now = esphome::millis();
  if (now - last_publish_ms_ >= 500) {
    last_publish_ms_ = now;
    current_sensor_->publish_state(latest_current_ma_);
  }
}

// =============================================================================
// Public API (thread-safe)
// =============================================================================

void Hv6ValveController::set_drivers_enabled(bool enabled) {
  if (enabled == drivers_enabled_)
    return;

  if (!enabled && motor_turning_) {
    stop_motor_(false);
    ESP_LOGW(TAG, "Motor stopped due to driver disable");
  }

  set_nsleep_(enabled);
  drivers_enabled_ = enabled;

  if (enabled) {
    vTaskDelay(pdMS_TO_TICKS(5));
    for (uint8_t i = 0; i < NUM_ZONES; i++) {
      if (drivers_[i])
        drivers_[i]->init();
    }
  }

  ESP_LOGI(TAG, "Motor drivers %s", enabled ? "ENABLED" : "DISABLED");
}

bool Hv6ValveController::request_position(uint8_t zone, float target_pct) {
  if (zone >= NUM_ZONES)
    return false;
  if (!drivers_enabled_) {
    ESP_LOGW(TAG, "Drivers disabled, rejecting position request");
    return false;
  }
  ValveCommand cmd = {zone, std::clamp(target_pct, 0.0f, 100.0f)};
  return xQueueSend(cmd_queue_, &cmd, pdMS_TO_TICKS(100)) == pdTRUE;
}

float Hv6ValveController::get_position(uint8_t zone) const {
  if (zone >= NUM_ZONES)
    return 0.0f;
  xSemaphoreTake(telemetry_mutex_, portMAX_DELAY);
  float pos = telemetry_[zone].current_position_pct;
  xSemaphoreGive(telemetry_mutex_);
  return pos;
}

MotorTelemetry Hv6ValveController::get_telemetry(uint8_t zone) const {
  if (zone >= NUM_ZONES)
    return {};
  xSemaphoreTake(telemetry_mutex_, portMAX_DELAY);
  MotorTelemetry copy = telemetry_[zone];
  xSemaphoreGive(telemetry_mutex_);
  return copy;
}

void Hv6ValveController::request_calibration(uint8_t zone) {
  if (zone < NUM_ZONES && drivers_enabled_)
    calibration_request_ = static_cast<int8_t>(zone);
}

// =============================================================================
// FreeRTOS Task (10ms tick, Core 1)
// =============================================================================

void Hv6ValveController::task_func_(void *arg) {
  static_cast<Hv6ValveController *>(arg)->run_();
}

void Hv6ValveController::run_() {
  TickType_t last_wake = xTaskGetTickCount();

  while (true) {
    if (!drivers_enabled_) {
      vTaskDelayUntil(&last_wake, pdMS_TO_TICKS(TICK_MS));
      continue;
    }

    if (motor_turning_) {
      // Fast 1ms loop: ADC + ripple each tick, FSM every 10th tick
      motor_loop_();
      vTaskDelayUntil(&last_wake, pdMS_TO_TICKS(FAST_TICK_MS));
    } else {
      fsm_tick_count_ = 0;

      if (calibration_request_ >= 0) {
        uint8_t zone = static_cast<uint8_t>(calibration_request_);
        calibration_request_ = -1;
        run_calibration_(zone);
      }

      process_command_queue_();
      vTaskDelayUntil(&last_wake, pdMS_TO_TICKS(TICK_MS));
    }
  }
}

void Hv6ValveController::process_command_queue_() {
  ValveCommand cmd;
  if (xQueueReceive(cmd_queue_, &cmd, 0) == pdTRUE) {
    execute_move_(cmd.zone, cmd.target_pct);
  }
}

void Hv6ValveController::execute_move_(uint8_t zone, float target_pct) {
  if (zone >= NUM_ZONES || !telemetry_[zone].present || !drivers_enabled_)
    return;
  if (telemetry_[zone].blocked) {
    ESP_LOGW(TAG, "Zone %d blocked, skipping move", zone + 1);
    return;
  }

  float current_pct = telemetry_[zone].current_position_pct;
  float diff = target_pct - current_pct;
  float min_move = 5.0f;
  if (config_store_)
    min_move = config_store_->get_config().control.min_movement_pct;

  if (std::fabs(diff) < min_move)
    return;

  MotorDirection dir = (diff > 0) ? MotorDirection::OPEN : MotorDirection::CLOSE;
  float diff_pct = std::fabs(diff);

  // Compute ripple target (if calibrated)
  uint32_t target_ripples = 0;
  uint32_t learned_ripples = 0;
  xSemaphoreTake(telemetry_mutex_, portMAX_DELAY);
  learned_ripples = (dir == MotorDirection::OPEN)
      ? telemetry_[zone].learned_open_ripples
      : telemetry_[zone].learned_close_ripples;
  xSemaphoreGive(telemetry_mutex_);

  if (ripple_enabled_ && learned_ripples > 0)
    target_ripples = static_cast<uint32_t>((diff_pct / 100.0f) * learned_ripples);

  // Time estimate (always computed — used as primary or timeout)
  float travel_time_ms = estimate_travel_time_ms_(zone, current_pct, target_pct);
  if (travel_time_ms < 100.0f)
    return;
  uint32_t timeout_ms = (target_ripples > 0)
      ? static_cast<uint32_t>(travel_time_ms * 1.5f)
      : static_cast<uint32_t>(travel_time_ms);

  if (!start_motor_(zone, dir))
    return;

  while (motor_turning_) {
    motor_loop_();
    vTaskDelay(pdMS_TO_TICKS(FAST_TICK_MS));

    // Ripple-based stop (precise)
    if (target_ripples > 0 && ripple_.count >= target_ripples)
      break;
    // Time-based stop (fallback when no ripple data)
    if (target_ripples == 0 && motor_run_time_ms_ >= timeout_ms)
      break;
    // Safety timeout (always)
    if (target_ripples > 0 && motor_run_time_ms_ >= timeout_ms)
      break;
  }

  if (motor_turning_)
    stop_motor_(true);

  // Update position
  xSemaphoreTake(telemetry_mutex_, portMAX_DELAY);
  if (current_fault_code_ == FaultCode::NONE) {
    if (target_ripples > 0 && learned_ripples > 0 && ripple_.count > 0) {
      // Precise position from actual ripple count
      float actual_pct = (static_cast<float>(ripple_.count) /
                          static_cast<float>(learned_ripples)) * 100.0f;
      float new_pos = (dir == MotorDirection::OPEN)
          ? current_pct + actual_pct
          : current_pct - actual_pct;
      telemetry_[zone].current_position_pct = std::clamp(new_pos, 0.0f, 100.0f);
    } else {
      telemetry_[zone].current_position_pct = target_pct;
    }
  }
  xSemaphoreGive(telemetry_mutex_);
}

float Hv6ValveController::estimate_travel_time_ms_(uint8_t zone, float from_pct, float to_pct) {
  xSemaphoreTake(telemetry_mutex_, portMAX_DELAY);
  uint32_t learned_open = telemetry_[zone].learned_open_ms;
  uint32_t learned_close = telemetry_[zone].learned_close_ms;
  xSemaphoreGive(telemetry_mutex_);

  float diff_pct = std::fabs(to_pct - from_pct);

  if (to_pct > from_pct && learned_open > 0) {
    return (diff_pct / 100.0f) * static_cast<float>(learned_open);
  } else if (to_pct < from_pct && learned_close > 0) {
    return (diff_pct / 100.0f) * static_cast<float>(learned_close);
  }
  return (diff_pct / 100.0f) * 60000.0f;
}

// =============================================================================
// Motor Control
// =============================================================================

bool Hv6ValveController::start_motor_(uint8_t zone, MotorDirection dir) {
  if (motor_turning_ || !drivers_enabled_)
    return false;

  DRV8215 *driver = drivers_[zone];
  if (!driver)
    return false;

  driver->clear_fault();

  current_zone_ = zone;
  current_dir_ = dir;
  motor_run_time_ms_ = 0;
  drive_phase_elapsed_ms_ = 0;
  drive_output_enabled_ = false;
  current_filtered_ma_ = 0.0f;
  current_raw_ma_ = 0.0f;
  current_sum_ = 0.0f;
  current_count_ = 0;
  debounce_count_ = 0;
  low_current_count_ = 0;
  current_fault_code_ = FaultCode::NONE;
  fsm_state_ = MotorFsmState::BOOST;
  motor_turning_ = true;

  // Reset ripple counter
  ripple_ = {};
  live_ripple_count_ = 0;
  fsm_tick_count_ = 0;

  if (dir == MotorDirection::OPEN)
    driver->forward();
  else
    driver->reverse();
  drive_output_enabled_ = true;

  ESP_LOGI(TAG, "Motor %d started %s", zone + 1,
           dir == MotorDirection::OPEN ? "OPEN" : "CLOSE");
  return true;
}

void Hv6ValveController::stop_motor_(bool record_event) {
  if (!motor_turning_)
    return;

  DRV8215 *driver = drivers_[current_zone_];
  if (driver)
    driver->coast();

  if (record_event) {
    xSemaphoreTake(telemetry_mutex_, portMAX_DELAY);
    auto &t = telemetry_[current_zone_];
    t.movement_count++;
    t.movements_since_learn++;
    if (current_dir_ == MotorDirection::OPEN)
      t.open_count++;
    else
      t.close_count++;

    if (current_count_ > 0) {
      float avg = current_sum_ / static_cast<float>(current_count_);
      mean_currents_[current_zone_] = mean_currents_[current_zone_] * 0.9f + avg * 0.1f;
      t.mean_current_ma = mean_currents_[current_zone_];
    }
    xSemaphoreGive(telemetry_mutex_);

    if (telemetry_[current_zone_].movement_count % 50 == 0)
      save_telemetry_(current_zone_);
  }

  motor_turning_ = false;
  fsm_state_ = MotorFsmState::IDLE;
  ESP_LOGI(TAG, "Motor %d stopped (%" PRIu32 "ms)", current_zone_ + 1, motor_run_time_ms_);
}

// =============================================================================
// FSM Tick (10ms)
// =============================================================================

void Hv6ValveController::process_tick_() {
  if (!motor_turning_)
    return;

  motor_run_time_ms_ += TICK_MS;
  drive_phase_elapsed_ms_ += TICK_MS;

  apply_drive_output_();

  // Check nFAULT — only react to thermal and overcurrent, not stall
  // (DRV8215 stall threshold ~500mA is too high for these valve motors)
  if (!read_nfault_()) {
    DRV8215 *driver = drivers_[current_zone_];
    if (driver) {
      auto fault = driver->read_fault();
      if (fault.tsd)
        trigger_fault_(FaultCode::THERMAL, "thermal shutdown");
      else if (fault.ocp)
        trigger_fault_(FaultCode::OVERCURRENT, "overcurrent");
      else if (!fault.stall)
        trigger_fault_(FaultCode::UNKNOWN_FAULT, "nFAULT asserted");
      // stall flag is ignored — endstop detection is done via current sensing
    }
    return;
  }

  // Runtime timeout
  float max_runtime_ms = static_cast<float>(motor_cfg_.max_runtime_s) * 1000.0f;
  xSemaphoreTake(telemetry_mutex_, portMAX_DELAY);
  uint32_t lo = telemetry_[current_zone_].learned_open_ms;
  uint32_t lc = telemetry_[current_zone_].learned_close_ms;
  xSemaphoreGive(telemetry_mutex_);

  if (lo > 0 && lc > 0) {
    uint32_t learned_max = std::max(lo, lc);
    uint32_t adaptive_cap = learned_max + 5000;
    if (adaptive_cap > 1000 && static_cast<float>(adaptive_cap) < max_runtime_ms)
      max_runtime_ms = static_cast<float>(adaptive_cap);
  }

  if (motor_run_time_ms_ >= static_cast<uint32_t>(max_runtime_ms)) {
    trigger_fault_(FaultCode::TIMEOUT, "runtime timeout");
    return;
  }

  // Read current from ESPHome ADC sensor
  float raw_ma = read_current_ma_();
  current_raw_ma_ = raw_ma;
  current_filtered_ma_ = current_filtered_ma_ * (1.0f - CURRENT_FILTER_ALPHA) +
                          raw_ma * CURRENT_FILTER_ALPHA;

  current_sum_ += current_filtered_ma_;
  current_count_++;
  if (debounce_count_ < 255)
    debounce_count_++;

  if (debounce_count_ < DEBOUNCE_TICKS)
    return;

  detect_endstop_();
  detect_open_circuit_();
}

void Hv6ValveController::apply_drive_output_() {
  DRV8215 *driver = drivers_[current_zone_];
  if (!driver)
    return;

  if (fsm_state_ == MotorFsmState::BOOST) {
    if (!drive_output_enabled_) {
      if (current_dir_ == MotorDirection::OPEN)
        driver->forward();
      else
        driver->reverse();
      drive_output_enabled_ = true;
    }
    if (motor_run_time_ms_ >= motor_cfg_.pwm_boost_ms) {
      fsm_state_ = MotorFsmState::HOLD;
      drive_phase_elapsed_ms_ = 0;
    }
  } else if (fsm_state_ == MotorFsmState::HOLD) {
    uint32_t period = motor_cfg_.pwm_period_ms;
    if (period == 0)
      period = 40;
    uint32_t on_time = (period * motor_cfg_.pwm_hold_duty_pct) / 100;
    uint32_t phase_pos = drive_phase_elapsed_ms_ % period;

    if (phase_pos < on_time) {
      if (!drive_output_enabled_) {
        if (current_dir_ == MotorDirection::OPEN)
          driver->forward();
        else
          driver->reverse();
        drive_output_enabled_ = true;
      }
    } else {
      if (drive_output_enabled_) {
        driver->coast();
        drive_output_enabled_ = false;
      }
    }
  }
}

void Hv6ValveController::detect_endstop_() {
  float mean = mean_currents_[current_zone_];
  float threshold = mean * motor_cfg_.current_factor_high;

  if (current_filtered_ma_ > threshold || current_filtered_ma_ > 150.0f) {
    ESP_LOGI(TAG, "Motor %d endstop (%.1f mA > %.1f mA)",
             current_zone_ + 1, current_filtered_ma_, threshold);

    xSemaphoreTake(telemetry_mutex_, portMAX_DELAY);
    auto &t = telemetry_[current_zone_];
    if (current_dir_ == MotorDirection::OPEN) {
      t.last_open_endstop_ms = motor_run_time_ms_;
      t.current_position_pct = 100.0f;
    } else {
      t.last_close_endstop_ms = motor_run_time_ms_;
      t.current_position_pct = 0.0f;
    }
    xSemaphoreGive(telemetry_mutex_);

    stop_motor_(true);
  }
}

void Hv6ValveController::detect_open_circuit_() {
  if (motor_cfg_.low_current_threshold_ma <= 0.0f)
    return;

  if (current_filtered_ma_ < motor_cfg_.low_current_threshold_ma) {
    low_current_count_++;
    uint32_t window_ticks = motor_cfg_.low_current_window_ms / TICK_MS;
    if (static_cast<uint32_t>(low_current_count_) >= window_ticks) {
      ESP_LOGW(TAG, "Motor %d open circuit: %.1f mA < %.1f mA for %" PRIu32 "ms",
               current_zone_ + 1, current_filtered_ma_,
               motor_cfg_.low_current_threshold_ma, motor_cfg_.low_current_window_ms);
      xSemaphoreTake(telemetry_mutex_, portMAX_DELAY);
      telemetry_[current_zone_].present = false;
      telemetry_[current_zone_].presence_known = true;
      xSemaphoreGive(telemetry_mutex_);
      trigger_fault_(FaultCode::OPEN_CIRCUIT, "no current — valve not connected");
    }
  } else {
    low_current_count_ = 0;
  }
}

void Hv6ValveController::trigger_fault_(FaultCode code, const char *reason) {
  ESP_LOGE(TAG, "Motor %d FAULT: %s (%s)", current_zone_ + 1,
           fault_code_to_string(code), reason);
  current_fault_code_ = code;

  if (code == FaultCode::BLOCKED || code == FaultCode::OPEN_CIRCUIT) {
    xSemaphoreTake(telemetry_mutex_, portMAX_DELAY);
    telemetry_[current_zone_].blocked = true;
    xSemaphoreGive(telemetry_mutex_);
  }

  stop_motor_(false);
}

// =============================================================================
// Fast Motor Loop (1ms) — ADC sampling + ripple detection
// =============================================================================

void Hv6ValveController::motor_loop_() {
  if (!motor_turning_)
    return;

  // 1ms: sample ADC + ripple detection
  sample_ripple_();

  // 10ms: run full FSM tick (endstop, fault detection, PWM cycling)
  fsm_tick_count_++;
  if (fsm_tick_count_ >= TICKS_PER_FSM) {
    fsm_tick_count_ = 0;
    process_tick_();
  }
}

void Hv6ValveController::sample_ripple_() {
  if (!ripple_enabled_ || !adc_handle_)
    return;

  // Gate: don't sample during PWM off-phase (IPROPI is zero when coasting)
  if (!drive_output_enabled_) {
    ripple_.pwm_was_on = false;
    return;
  }

  // Debounce after PWM on-transition (inrush transient)
  if (!ripple_.pwm_was_on) {
    ripple_.pwm_was_on = true;
    ripple_.pwm_debounce = RIPPLE_PWM_DEBOUNCE_TICKS;
  }
  if (ripple_.pwm_debounce > 0) {
    ripple_.pwm_debounce--;
    // Still read ADC to initialize DC estimate, with slower filter
    int raw = read_adc_raw_();
    if (raw >= 0) {
      if (ripple_.dc_estimate < 1.0f)
        ripple_.dc_estimate = static_cast<float>(raw);
      else
        ripple_.dc_estimate += RIPPLE_DC_ALPHA_SLOW * (static_cast<float>(raw) - ripple_.dc_estimate);
    }
    return;
  }

  int raw = read_adc_raw_();
  if (raw < 0)
    return;

  float sample = static_cast<float>(raw);

  // Update DC estimate (slow lowpass, tau ~100ms at 1kHz)
  if (ripple_.dc_estimate < 1.0f)
    ripple_.dc_estimate = sample;
  else
    ripple_.dc_estimate += RIPPLE_DC_ALPHA * (sample - ripple_.dc_estimate);

  // Update current reading for publishing
  latest_current_ma_ = adc_raw_to_ma_(raw);

  // Hysteresis band: % of DC estimate
  float hyst = ripple_.dc_estimate * RIPPLE_HYSTERESIS_PCT;
  if (hyst < 5.0f)
    hyst = 5.0f;  // minimum hysteresis to avoid noise

  // Zero-crossing detector with hysteresis — count on rising edge
  if (ripple_.above_dc) {
    if (sample < ripple_.dc_estimate - hyst)
      ripple_.above_dc = false;
  } else {
    if (sample > ripple_.dc_estimate + hyst) {
      ripple_.above_dc = true;
      ripple_.count++;
      live_ripple_count_ = ripple_.count;
    }
  }
}

int Hv6ValveController::read_adc_raw_() {
  if (!adc_handle_)
    return -1;
  int raw = 0;
  auto h = static_cast<adc_oneshot_unit_handle_t>(adc_handle_);
  auto ch = static_cast<adc_channel_t>(ipropi_channel_);
  if (adc_oneshot_read(h, ch, &raw) != ESP_OK)
    return -1;
  return raw;
}

float Hv6ValveController::adc_raw_to_ma_(int raw) {
  if (adc_cali_handle_) {
    int voltage_mv = 0;
    auto ch = static_cast<adc_cali_handle_t>(adc_cali_handle_);
    if (adc_cali_raw_to_voltage(ch, raw, &voltage_mv) == ESP_OK)
      return static_cast<float>(voltage_mv) / 1000.0f / IPROPI_DIVISOR;
  }
  // Fallback: uncalibrated linear approximation (12-bit, 0-3.1V)
  float voltage = (static_cast<float>(raw) / 4095.0f) * 3.1f;
  return voltage / IPROPI_DIVISOR;
}

// =============================================================================
// Hardware Helpers
// =============================================================================

float Hv6ValveController::read_current_ma_() {
  // Prefer direct ADC read (fast, from motor task)
  if (ripple_enabled_ && adc_handle_) {
    int raw = read_adc_raw_();
    if (raw >= 0) {
      float ma = adc_raw_to_ma_(raw);
      latest_current_ma_ = ma;
      return ma;
    }
  }
  // Fallback: ESPHome sensor (slower, updated from main loop)
  if (current_sensor_ && current_sensor_->has_state()) {
    float voltage = current_sensor_->state;
    return voltage / IPROPI_DIVISOR;
  }
  return 0.0f;
}

void Hv6ValveController::set_nsleep_(bool enabled) {
  gpio_set_level(nsleep_pin_, enabled ? 1 : 0);
}

bool Hv6ValveController::read_nfault_() {
  return gpio_get_level(nfault_pin_) == 1;
}

void Hv6ValveController::save_telemetry_(uint8_t zone) {
  if (zone >= NUM_ZONES || !config_store_)
    return;
  xSemaphoreTake(telemetry_mutex_, portMAX_DELAY);
  MotorTelemetry copy = telemetry_[zone];
  xSemaphoreGive(telemetry_mutex_);
  config_store_->save_motor_telemetry(zone, copy);
}

// =============================================================================
// Calibration — double-pass (close→open→close) like VdMot
// =============================================================================

uint32_t Hv6ValveController::calibration_pass_(uint8_t zone, MotorDirection dir) {
  if (!start_motor_(zone, dir))
    return 0;

  while (motor_turning_) {
    motor_loop_();
    vTaskDelay(pdMS_TO_TICKS(FAST_TICK_MS));
  }

  uint32_t elapsed = motor_run_time_ms_;

  // If a fault occurred (open circuit, timeout, etc.) return 0 to signal failure
  if (current_fault_code_ != FaultCode::NONE) {
    ESP_LOGW(TAG, "Calibration pass %s zone %d fault: %s",
             dir == MotorDirection::CLOSE ? "CLOSE" : "OPEN",
             zone + 1, fault_code_to_string(current_fault_code_));
    return 0;
  }

  // Update mean current from this pass
  if (current_count_ > 0) {
    float avg = current_sum_ / static_cast<float>(current_count_);
    mean_currents_[zone] = (mean_currents_[zone] + avg) / 2.0f;
  }

  ESP_LOGI(TAG, "Calibration pass %s zone %d: %" PRIu32 "ms, %" PRIu32 " ripples",
           dir == MotorDirection::CLOSE ? "CLOSE" : "OPEN",
           zone + 1, elapsed, ripple_.count);

  vTaskDelay(pdMS_TO_TICKS(500));
  return elapsed;
}

void Hv6ValveController::run_calibration_(uint8_t zone) {
  if (zone >= NUM_ZONES || motor_turning_ || !drivers_enabled_)
    return;

  calibrating_ = true;

  ESP_LOGI(TAG, "Calibrating zone %d (double-pass, ripple=%s)", zone + 1,
           ripple_enabled_ ? "yes" : "no");

  uint8_t max_retries = motor_cfg_.calibration_max_retries;
  uint32_t min_travel = motor_cfg_.calibration_min_travel_ms;

  for (uint8_t attempt = 0; attempt <= max_retries; attempt++) {
    // Pass 1: close fully (reach known start position)
    uint32_t close1_ms = calibration_pass_(zone, MotorDirection::CLOSE);
    if (close1_ms == 0) {
      ESP_LOGW(TAG, "Calibration zone %d: initial close failed", zone + 1);
      break;
    }

    // Pass 2: open fully (measure opening travel)
    uint32_t open_ms = calibration_pass_(zone, MotorDirection::OPEN);
    uint32_t open_ripples = ripple_.count;
    if (open_ms == 0) {
      ESP_LOGW(TAG, "Calibration zone %d: open pass failed", zone + 1);
      break;
    }

    // Pass 3: close fully again (measure closing travel + compute deadzone)
    uint32_t close2_ms = calibration_pass_(zone, MotorDirection::CLOSE);
    uint32_t close2_ripples = ripple_.count;
    if (close2_ms == 0) {
      ESP_LOGW(TAG, "Calibration zone %d: second close failed", zone + 1);
      break;
    }

    ESP_LOGI(TAG, "Calibration zone %d: close1=%" PRIu32 "ms open=%" PRIu32 "ms/%" PRIu32 "r close2=%" PRIu32 "ms/%" PRIu32 "r",
             zone + 1, close1_ms, open_ms, open_ripples, close2_ms, close2_ripples);

    if (open_ms >= min_travel && close2_ms >= min_travel) {
      int32_t deadzone = static_cast<int32_t>(close2_ms) - static_cast<int32_t>(open_ms);

      xSemaphoreTake(telemetry_mutex_, portMAX_DELAY);
      auto &t = telemetry_[zone];
      t.learned_open_ms = open_ms;
      t.learned_close_ms = close2_ms;
      t.learned_open_ripples = open_ripples;
      t.learned_close_ripples = close2_ripples;
      t.deadzone_ms = deadzone;
      t.mean_current_ma = mean_currents_[zone];
      t.drift_percent = 0.0f;
      t.movements_since_learn = 0;
      t.last_learn_ms = static_cast<uint32_t>(esp_timer_get_time() / 1000);
      t.calibration_retries = attempt;
      t.blocked = false;
      t.current_position_pct = 0.0f;  // valve is closed after double-pass
      xSemaphoreGive(telemetry_mutex_);

      save_telemetry_(zone);
      ESP_LOGI(TAG, "Calibration zone %d OK: open=%" PRIu32 "ms/%" PRIu32 "r close=%" PRIu32 "ms/%" PRIu32 "r dz=%" PRId32 "ms",
               zone + 1, open_ms, open_ripples, close2_ms, close2_ripples, deadzone);
      calibrating_ = false;
      return;
    }

    ESP_LOGW(TAG, "Calibration zone %d attempt %d: travel too short (open=%" PRIu32 "ms close=%" PRIu32 "ms min=%" PRIu32 "ms)",
             zone + 1, attempt + 1, open_ms, close2_ms, min_travel);
  }

  xSemaphoreTake(telemetry_mutex_, portMAX_DELAY);
  telemetry_[zone].blocked = true;
  xSemaphoreGive(telemetry_mutex_);
  ESP_LOGE(TAG, "Calibration zone %d FAILED after %d attempts", zone + 1, max_retries + 1);
  calibrating_ = false;
}

}  // namespace hv6
