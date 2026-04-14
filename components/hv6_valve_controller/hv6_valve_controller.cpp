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
#include <cstdio>
#include <cmath>
#include <cstdarg>
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

  trace_mutex_ = xSemaphoreCreateMutex();
  if (trace_mutex_ == nullptr) {
    ESP_LOGE(TAG, "Failed to create trace mutex");
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

  // Wake DRV8215 chips for initial probe/setup only.
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

  log_startup_self_test_();

  // Boot default: keep motor drivers enabled.
  // In development mode we keep nSLEEP high to avoid brownout/reset when toggling it.
  if (!DEVELOPMENT_KEEP_NSLEEP_AWAKE)
    set_nsleep_(true);
  drivers_enabled_ = true;
  ESP_LOGI(TAG, "Motors start enabled; auto-calibration will run in %" PRIu32 "s",
           AUTO_START_DELAY_MS / 1000);
  if (DEVELOPMENT_KEEP_NSLEEP_AWAKE)
    ESP_LOGW(TAG, "Development mode: nSLEEP kept HIGH to avoid enable-time reboot");

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

  boot_time_ms_ = static_cast<uint32_t>(esp_timer_get_time() / 1000);
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

void Hv6ValveController::log_startup_self_test_() {
  ESP_LOGI(TAG, "Startup self-test:");

  int nfault_level = gpio_get_level(nfault_pin_);
  ESP_LOGI(TAG, "  nFAULT GPIO%d level=%d (%s)", nfault_pin_, nfault_level,
           nfault_level ? "HIGH" : "LOW (asserted)");

  char discovered[256];
  int off = 0;
  auto append_discovered = [&](const char *fmt, ...) {
    if (off < 0 || off >= static_cast<int>(sizeof(discovered)))
      return;
    va_list args;
    va_start(args, fmt);
    int n = std::vsnprintf(discovered + off, sizeof(discovered) - off, fmt, args);
    va_end(args);
    if (n > 0)
      off += n;
  };
  append_discovered("  I2C ACK addresses:");
  bool found_any = false;

  for (uint8_t addr = 0x03; addr <= 0x77; addr++) {
    esphome::i2c::I2CDevice dev;
    dev.set_i2c_bus(i2c_bus_);
    dev.set_i2c_address(addr);
    auto err = dev.write(nullptr, 0);
    if (err == esphome::i2c::ERROR_OK) {
      found_any = true;
      append_discovered(" 0x%02X", addr);
      if (off >= static_cast<int>(sizeof(discovered)) - 6)
        break;
    }
  }

  if (!found_any) {
    std::snprintf(discovered, sizeof(discovered), "  I2C ACK addresses: none");
  }
  ESP_LOGI(TAG, "%s", discovered);

  for (uint8_t i = 0; i < NUM_ZONES; i++) {
    ESP_LOGI(TAG, "  Motor %d addr=0x%02X present=%s", i + 1, motor_addresses_[i],
             telemetry_[i].present ? "yes" : "no");
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

  // Trace MQTT streaming is disabled by default to avoid heap corruption from
  // repeated ~4KB JSON allocations triggering web_server SSE serialization.
  // Use trace_publish_to_mqtt_() on-demand via the Python capture tool instead.
}

// =============================================================================
// Public API (thread-safe)
// =============================================================================

void Hv6ValveController::set_drivers_enabled(bool enabled) {
  if (enabled == drivers_enabled_)
    return;

  // Ignore disable commands briefly after boot to reduce sensitivity to
  // retained MQTT state replay. Always allow disable while a motor is turning
  // so STOP actions remain responsive during startup.
  if (!enabled && !motor_turning_ && boot_time_ms_ > 0) {
    uint32_t uptime_ms = static_cast<uint32_t>(esp_timer_get_time() / 1000) - boot_time_ms_;
    if (uptime_ms < 5000) {
      ESP_LOGW(TAG, "Driver disable ignored during startup window (%" PRIu32 "ms)", uptime_ms);
      return;
    }
  }

  if (!enabled && motor_turning_) {
    stop_motor_(false);
    ESP_LOGW(TAG, "Motor stopped due to driver disable");
  }

  if (!DEVELOPMENT_KEEP_NSLEEP_AWAKE)
    set_nsleep_(enabled);
  drivers_enabled_ = enabled;

  if (enabled) {
    // Explicitly coast all drivers to prevent unwanted movement
    for (uint8_t i = 0; i < NUM_ZONES; i++) {
      if (drivers_[i])
        drivers_[i]->coast();
    }
    vTaskDelay(pdMS_TO_TICKS(5));
  } else {
    // Logical disable in development mode: force all drivers to coast.
    for (uint8_t i = 0; i < NUM_ZONES; i++) {
      if (drivers_[i])
        drivers_[i]->coast();
    }
  }

  ESP_LOGI(TAG, "Motor drivers %s", enabled ? "ENABLED" : "DISABLED");
}

void Hv6ValveController::reload_motor_config() {
  if (config_store_)
    motor_cfg_ = config_store_->get_config().motor;
  ESP_LOGI(TAG, "Motor config: close(%.2fx, slope %.2f mA/s, floor %.2fx) "
           "open(%.2fx, slope %.2f mA/s, floor %.2fx, ripple_lim %.2f) "
           "pin(step %.1f mA, margin %" PRIu16 ")",
           motor_cfg_.close_current_factor, motor_cfg_.close_slope_threshold_ma_per_s,
           motor_cfg_.close_slope_current_factor,
           motor_cfg_.open_current_factor, motor_cfg_.open_slope_threshold_ma_per_s,
           motor_cfg_.open_slope_current_factor, motor_cfg_.open_ripple_limit_factor,
           motor_cfg_.pin_engage_step_ma, motor_cfg_.pin_engage_margin_ripples);
}

bool Hv6ValveController::request_position(uint8_t zone, float target_pct) {
  if (zone >= NUM_ZONES)
    return false;
  if (!drivers_enabled_) {
    ESP_LOGW(TAG, "Drivers disabled, rejecting position request");
    return false;
  }
  if (calibrating_ || calibration_request_ >= 0) {
    ESP_LOGW(TAG, "Calibration active/pending, rejecting position request for zone %d", zone + 1);
    return false;
  }
  ValveCommand cmd = {zone, logical_to_actuator_pct_(target_pct)};
  return xQueueSend(cmd_queue_, &cmd, pdMS_TO_TICKS(100)) == pdTRUE;
}

bool Hv6ValveController::request_timed_open(uint8_t zone, uint16_t duration_ms, bool override_drivers) {
  if (zone >= NUM_ZONES)
    return false;
  if (!override_drivers && !drivers_enabled_) {
    ESP_LOGW(TAG, "Drivers disabled, rejecting timed open for zone %d", zone + 1);
    return false;
  }
  if (calibrating_ || calibration_request_ >= 0 || calibration_pending_mask_ != 0) {
    ESP_LOGW(TAG, "Calibration active/pending, rejecting timed open for zone %d", zone + 1);
    return false;
  }
  ValveCommand cmd = {zone, 0.0f, duration_ms, override_drivers, MotorDirection::OPEN};
  return xQueueSend(cmd_queue_, &cmd, pdMS_TO_TICKS(100)) == pdTRUE;
}

bool Hv6ValveController::request_timed_close(uint8_t zone, uint16_t duration_ms, bool override_drivers) {
  if (zone >= NUM_ZONES)
    return false;
  if (!override_drivers && !drivers_enabled_) {
    ESP_LOGW(TAG, "Drivers disabled, rejecting timed close for zone %d", zone + 1);
    return false;
  }
  if (calibrating_ || calibration_request_ >= 0 || calibration_pending_mask_ != 0) {
    ESP_LOGW(TAG, "Calibration active/pending, rejecting timed close for zone %d", zone + 1);
    return false;
  }
  ValveCommand cmd = {zone, 0.0f, duration_ms, override_drivers, MotorDirection::CLOSE};
  return xQueueSend(cmd_queue_, &cmd, pdMS_TO_TICKS(100)) == pdTRUE;
}

bool Hv6ValveController::request_stop(uint8_t zone) {
  if (zone >= NUM_ZONES)
    return false;
  if (motor_turning_ && current_zone_ == zone)
    stop_motor_(true);
  return true;
}

void Hv6ValveController::log_i2c_scan() {
  if (!i2c_bus_) {
    ESP_LOGW(TAG, "I2C_SCAN: i2c_bus not configured");
    return;
  }

  char discovered[256];
  int off = 0;
  auto append_discovered = [&](const char *fmt, ...) {
    if (off < 0 || off >= static_cast<int>(sizeof(discovered)))
      return;
    va_list args;
    va_start(args, fmt);
    int n = std::vsnprintf(discovered + off, sizeof(discovered) - off, fmt, args);
    va_end(args);
    if (n > 0)
      off += n;
  };
  append_discovered("I2C_SCAN: ACK");
  bool found_any = false;

  for (uint8_t addr = 0x03; addr <= 0x77; addr++) {
    esphome::i2c::I2CDevice dev;
    dev.set_i2c_bus(i2c_bus_);
    dev.set_i2c_address(addr);
    auto err = dev.write(nullptr, 0);
    if (err == esphome::i2c::ERROR_OK) {
      found_any = true;
      append_discovered(" 0x%02X", addr);
      if (off >= static_cast<int>(sizeof(discovered)) - 6)
        break;
    }
  }

  if (!found_any)
    std::snprintf(discovered, sizeof(discovered), "I2C_SCAN: ACK none");

  ESP_LOGW(TAG, "I2C_SCAN: ----- begin -----");
  ESP_LOGW(TAG, "%s", discovered);

  char motor_line[256];
  off = 0;
  auto append_motor_line = [&](const char *fmt, ...) {
    if (off < 0 || off >= static_cast<int>(sizeof(motor_line)))
      return;
    va_list args;
    va_start(args, fmt);
    int n = std::vsnprintf(motor_line + off, sizeof(motor_line) - off, fmt, args);
    va_end(args);
    if (n > 0)
      off += n;
  };
  append_motor_line("I2C_SCAN: Motors");
  for (uint8_t i = 0; i < NUM_ZONES; i++) {
    esphome::i2c::I2CDevice dev;
    dev.set_i2c_bus(i2c_bus_);
    dev.set_i2c_address(motor_addresses_[i]);
    bool ack = (dev.write(nullptr, 0) == esphome::i2c::ERROR_OK);
    append_motor_line(" M%d:0x%02X=%s", i + 1, motor_addresses_[i], ack ? "OK" : "MISS");
    if (off >= static_cast<int>(sizeof(motor_line)) - 16)
      break;
  }
  ESP_LOGW(TAG, "%s", motor_line);
  ESP_LOGW(TAG, "I2C_SCAN: nFAULT GPIO%d=%d", nfault_pin_, gpio_get_level(nfault_pin_));
  ESP_LOGW(TAG, "I2C_SCAN: ----- end -----");
}

float Hv6ValveController::get_position(uint8_t zone) const {
  if (zone >= NUM_ZONES)
    return 0.0f;
  xSemaphoreTake(telemetry_mutex_, portMAX_DELAY);
  float pos = telemetry_[zone].current_position_pct;
  xSemaphoreGive(telemetry_mutex_);
  return actuator_to_logical_pct_(pos);
}

void Hv6ValveController::set_manifold_type(ManifoldType type) {
  if (!config_store_)
    return;
  if (motor_turning_) {
    ESP_LOGW(TAG, "Ignoring manifold type change while motor is running");
    return;
  }

  auto cfg = config_store_->get_config();
  if (cfg.manifold_type == type)
    return;

  cfg.manifold_type = type;
  config_store_->set_config(cfg);
  ESP_LOGI(TAG, "Manifold type set to %s", type == ManifoldType::NC ? "NC" : "NO");
}

ManifoldType Hv6ValveController::get_manifold_type() const {
  if (!config_store_)
    return ManifoldType::NC;
  return config_store_->get_config().manifold_type;
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
  if (zone >= NUM_ZONES || !drivers_enabled_)
    return;

  // Guard against retained/replayed commands immediately after reboot.
  if (boot_time_ms_ > 0) {
    uint32_t uptime_ms = static_cast<uint32_t>(esp_timer_get_time() / 1000) - boot_time_ms_;
    if (uptime_ms < CALIBRATION_REQUEST_GUARD_MS) {
      ESP_LOGW(TAG, "Calibration request ignored during startup guard (%" PRIu32 "ms)", uptime_ms);
      return;
    }
  }

  calibration_request_ = static_cast<int8_t>(zone);
}

void Hv6ValveController::request_calibration_all() {
  if (!drivers_enabled_)
    return;

  // Guard against startup replay
  if (boot_time_ms_ > 0) {
    uint32_t uptime_ms = static_cast<uint32_t>(esp_timer_get_time() / 1000) - boot_time_ms_;
    if (uptime_ms < CALIBRATION_REQUEST_GUARD_MS) {
      ESP_LOGW(TAG, "Calibration all request ignored during startup guard (%" PRIu32 "ms)", uptime_ms);
      return;
    }
  }

  uint8_t mask = 0;
  for (uint8_t z = 0; z < NUM_ZONES; z++) {
    bool enabled = true;
    if (config_store_) {
      const auto &cfg = config_store_->get_config();
      enabled = cfg.zones[z].enabled;
    }
    if (enabled)
      mask |= (1u << z);
  }
  if (mask == 0) {
    ESP_LOGW(TAG, "request_calibration_all: no enabled zones");
    return;
  }
  calibration_pending_mask_ = mask;
  // Prime calibration_request_ with the first pending zone
  for (uint8_t z = 0; z < NUM_ZONES; z++) {
    if (calibration_pending_mask_ & (1u << z)) {
      calibration_pending_mask_ &= ~(1u << z);
      calibration_request_ = static_cast<int8_t>(z);
      break;
    }
  }
  ESP_LOGI(TAG, "request_calibration_all: queued zones mask=0x%02X", mask);
}

bool Hv6ValveController::manifold_is_nc_() const {
  return get_manifold_type() == ManifoldType::NC;
}

float Hv6ValveController::logical_to_actuator_pct_(float logical_pct) const {
  logical_pct = std::clamp(logical_pct, 0.0f, 100.0f);
  return manifold_is_nc_() ? 100.0f - logical_pct : logical_pct;
}

float Hv6ValveController::actuator_to_logical_pct_(float actuator_pct) const {
  actuator_pct = std::clamp(actuator_pct, 0.0f, 100.0f);
  return manifold_is_nc_() ? 100.0f - actuator_pct : actuator_pct;
}

float Hv6ValveController::flow_to_physical_pct_(uint8_t zone, float flow_pct) {
  flow_pct = std::clamp(flow_pct, 0.0f, 100.0f);

  // 0% flow always maps to 0% physical (closed endstop)
  if (flow_pct <= 0.01f)
    return 0.0f;

  // Need pin engagement data from calibration
  xSemaphoreTake(telemetry_mutex_, portMAX_DELAY);
  uint32_t pin_ripples = telemetry_[zone].pin_engage_close_ripples;
  uint32_t close_ripples = telemetry_[zone].learned_close_ripples;
  xSemaphoreGive(telemetry_mutex_);

  if (pin_ripples == 0 || close_ripples == 0)
    return flow_pct;

  // Effective engagement point with margin offset toward open.
  // Subtracting margin means 100% flow maps to a position where the pin is
  // fully disengaged from the valve body, ensuring unobstructed flow.
  uint32_t margin = motor_cfg_.pin_engage_margin_ripples;
  uint32_t effective = (pin_ripples > margin) ? (pin_ripples - margin) : 0;

  // Max flow position in physical %.
  // pin_engage is 'effective' ripples from the open end during closing.
  // The physical position beyond this point is dead zone (no flow change).
  float max_flow_pct = (1.0f - static_cast<float>(effective) /
                        static_cast<float>(close_ripples)) * 100.0f;
  max_flow_pct = std::clamp(max_flow_pct, 10.0f, 100.0f);

  // Remap: flow 0–100% → physical 0% to max_flow_pct
  return std::clamp(flow_pct * max_flow_pct / 100.0f, 0.0f, 100.0f);
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
    // Auto-start: enable drivers and calibrate all zones once after boot delay
    if (!auto_start_done_ && boot_time_ms_ > 0) {
      uint32_t uptime_ms = static_cast<uint32_t>(esp_timer_get_time() / 1000) - boot_time_ms_;
      if (uptime_ms >= AUTO_START_DELAY_MS) {
        auto_start_done_ = true;
        ESP_LOGI(TAG, "Auto-start: enabling motor drivers and calibrating enabled zones");
        set_drivers_enabled(true);
        for (uint8_t z = 0; z < NUM_ZONES; z++) {
          bool enabled = true;
          if (config_store_) {
            const auto &cfg = config_store_->get_config();
            enabled = cfg.zones[z].enabled;
          }
          if (enabled)
          run_calibration_(z);
          else
            ESP_LOGI(TAG, "Auto-start: zone %d disabled, skipping calibration", z + 1);
        }
        last_wake = xTaskGetTickCount();  // Resync tick after long calibration run
      }
    }

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
        // Advance to next pending zone in the queue
        if (calibration_pending_mask_ != 0) {
          for (uint8_t z = 0; z < NUM_ZONES; z++) {
            if (calibration_pending_mask_ & (1u << z)) {
              calibration_pending_mask_ &= ~(1u << z);
              calibration_request_ = static_cast<int8_t>(z);
              break;
            }
          }
        }
      }

      process_command_queue_();
      check_relearn_triggers_();
      vTaskDelayUntil(&last_wake, pdMS_TO_TICKS(TICK_MS));
    }
  }
}

void Hv6ValveController::process_command_queue_() {
  ValveCommand cmd;
  if (xQueueReceive(cmd_queue_, &cmd, 0) == pdTRUE) {
    if (cmd.timed_duration_ms > 0) {
      execute_timed_move_(cmd.zone, cmd.timed_duration_ms, cmd.timed_direction, cmd.override_drivers);
          } else {
      execute_move_(cmd.zone, cmd.target_pct);
    }
  }
}

void Hv6ValveController::execute_timed_move_(uint8_t zone, uint16_t duration_ms, MotorDirection dir, bool override_drivers) {
  if (zone >= NUM_ZONES)
    return;
  if (!override_drivers) {
    if (!telemetry_[zone].present || !drivers_enabled_)
      return;
  }
  if (!start_motor_(zone, dir, override_drivers))
    return;

  ESP_LOGI(TAG, "Motor %d timed %s %" PRIu16 "ms (override=%d)",
           zone + 1, dir == MotorDirection::OPEN ? "OPEN" : "CLOSE",
           duration_ms, override_drivers);

  uint32_t elapsed = 0;
  while (motor_turning_ && elapsed < static_cast<uint32_t>(duration_ms)) {
    motor_loop_();
    vTaskDelay(pdMS_TO_TICKS(FAST_TICK_MS));
    elapsed += FAST_TICK_MS;
  }

  if (motor_turning_)
    stop_motor_(true);
}

void Hv6ValveController::execute_move_(uint8_t zone, float target_pct) {
  if (zone >= NUM_ZONES || !telemetry_[zone].present || !drivers_enabled_)
    return;
  if (telemetry_[zone].blocked) {
    ESP_LOGW(TAG, "Zone %d blocked, skipping move", zone + 1);
    return;
  }

  float current_pct = telemetry_[zone].current_position_pct;

  // Remap flow % → physical % based on pin engagement data
  float physical_target = flow_to_physical_pct_(zone, target_pct);
  if (std::fabs(physical_target - target_pct) > 0.1f) {
    ESP_LOGD(TAG, "Motor %d flow %.1f%% → physical %.1f%%",
             zone + 1, target_pct, physical_target);
  }
  target_pct = physical_target;

  float diff = target_pct - current_pct;
  float min_move = 5.0f;
  if (config_store_)
    min_move = config_store_->get_config().control.min_movement_pct;

  if (std::fabs(diff) < min_move)
    return;

  MotorDirection dir = (diff > 0) ? MotorDirection::OPEN : MotorDirection::CLOSE;
  float diff_pct = std::fabs(diff);

  // Drive-to-endstop mode: for full open (100%) or full close (0%) targets,
  // run the motor until endstop detection fires instead of using time/ripple
  // estimates. This guarantees the valve is physically at the mechanical limit.
  bool drive_to_endstop = (target_pct <= 0.01f || target_pct >= 99.99f);

  // Compute ripple target (if calibrated and not driving to endstop)
  uint32_t target_ripples = 0;
  uint32_t learned_ripples = 0;
  if (!drive_to_endstop) {
    xSemaphoreTake(telemetry_mutex_, portMAX_DELAY);
    learned_ripples = (dir == MotorDirection::OPEN)
        ? telemetry_[zone].learned_open_ripples
        : telemetry_[zone].learned_close_ripples;
    xSemaphoreGive(telemetry_mutex_);

    if (ripple_enabled_ && learned_ripples > 0)
      target_ripples = static_cast<uint32_t>((diff_pct / 100.0f) * learned_ripples);
  }

  // Time estimate (always computed — used as primary, timeout, or safety cap for endstop mode)
  float travel_time_ms = estimate_travel_time_ms_(zone, current_pct, target_pct);
  if (travel_time_ms < 100.0f && !drive_to_endstop)
    return;

  uint32_t timeout_ms;
  if (drive_to_endstop) {
    // Safety timeout: max_runtime_s (endstop detection should fire well before this)
    timeout_ms = motor_cfg_.max_runtime_s * 1000;
  } else if (target_ripples > 0) {
    timeout_ms = static_cast<uint32_t>(travel_time_ms * 1.5f);
  } else {
    timeout_ms = static_cast<uint32_t>(travel_time_ms);
  }

  if (!start_motor_(zone, dir))
    return;

  // Ripple safety limit for opening: stop if we exceed learned open stroke × factor
  uint32_t open_ripple_limit = 0;
  if (drive_to_endstop && dir == MotorDirection::OPEN
      && motor_cfg_.open_ripple_limit_factor > 0.0f) {
    xSemaphoreTake(telemetry_mutex_, portMAX_DELAY);
    uint32_t open_ripples = telemetry_[zone].learned_open_ripples;
    xSemaphoreGive(telemetry_mutex_);
    if (ripple_enabled_ && open_ripples > 0) {
      open_ripple_limit = static_cast<uint32_t>(
          open_ripples * motor_cfg_.open_ripple_limit_factor);
    }
  }

  if (drive_to_endstop) {
    ESP_LOGI(TAG, "Motor %d drive-to-endstop %s (safety timeout %" PRIu32 "ms, ripple_lim=%" PRIu32 ")",
             zone + 1, dir == MotorDirection::OPEN ? "OPEN" : "CLOSE",
             timeout_ms, open_ripple_limit);
  }

  while (motor_turning_) {
    motor_loop_();
    vTaskDelay(pdMS_TO_TICKS(FAST_TICK_MS));

    if (drive_to_endstop) {
      // In drive-to-endstop mode, the motor runs until endstop detection
      // in process_tick_() calls stop_motor_(), or safety timeout fires.
      if (motor_run_time_ms_ >= timeout_ms)
        break;
      // Ripple safety: stop if we've exceeded the learned stroke length × factor
      if (open_ripple_limit > 0 && ripple_.count >= open_ripple_limit) {
        ESP_LOGI(TAG, "Motor %d open ripple limit (%" PRIu32 "/%" PRIu32 ")",
                 zone + 1, ripple_.count, open_ripple_limit);
        break;
      }
    } else {
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
  }

  if (motor_turning_)
    stop_motor_(true);

  // Update position
  xSemaphoreTake(telemetry_mutex_, portMAX_DELAY);
  if (current_fault_code_ == FaultCode::NONE) {
    if (drive_to_endstop) {
      // Endstop reached — position is definitively at the limit
      telemetry_[zone].current_position_pct = target_pct;
    } else if (target_ripples > 0 && learned_ripples > 0 && ripple_.count > 0) {
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

bool Hv6ValveController::start_motor_(uint8_t zone, MotorDirection dir, bool override_drivers) {
  if (motor_turning_ || (!drivers_enabled_ && !override_drivers))
    return false;

  DRV8215 *driver = drivers_[zone];
  if (!driver)
    return false;

  // If drivers are physically asleep and we're overriding, temporarily wake nSLEEP
  nsleep_overridden_ = false;
  if (override_drivers && !drivers_enabled_ && !DEVELOPMENT_KEEP_NSLEEP_AWAKE) {
    set_nsleep_(true);
    vTaskDelay(pdMS_TO_TICKS(5));  // DRV8215 wakeup time
    nsleep_overridden_ = true;
  }

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
  endstop_high_count_ = 0;
  low_current_count_ = 0;
  slope_prev_current_ma_ = 0.0f;
  slope_tick_count_ = 0;
  current_slope_ma_per_s_ = 0.0f;
  slope_initialized_ = false;
  slope_endstop_windows_ = 0;
  pin_detect_baseline_set_ = false;
  pin_detected_ = false;
  pin_detected_ripples_ = 0;
  pin_detect_sustained_ = 0;
  current_fault_code_ = FaultCode::NONE;
  fsm_state_ = MotorFsmState::BOOST;
  motor_turning_ = true;

  // Reset ripple counter
  ripple_ = {};
  live_ripple_count_ = 0;
  fsm_tick_count_ = 0;
  trace_reset_();
  trace_last_mqtt_index_ = 0;
  trace_last_mqtt_publish_ms_ = 0;

  if (dir == MotorDirection::OPEN)
    driver->reverse();
  else
    driver->forward();
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
  timed_mode_active_ = false;
  timed_move_duration_ms_ = 0;
  // If nSLEEP was raised for an override move, restore it to sleep
  if (nsleep_overridden_ && !DEVELOPMENT_KEEP_NSLEEP_AWAKE) {
    set_nsleep_(false);
    nsleep_overridden_ = false;
  }
  ESP_LOGI(TAG, "Motor %d stopped (%" PRIu32 "ms)", current_zone_ + 1, motor_run_time_ms_);
}

// =============================================================================
// FSM Tick (10ms)
// =============================================================================

void Hv6ValveController::process_tick_() {
  if (!motor_turning_)
    return;

  // Check if timed move duration has elapsed
  if (timed_mode_active_) {
    uint32_t now_ms = esp_timer_get_time() / 1000;
    uint32_t elapsed_ms = now_ms - timed_move_start_ms_;
    if (elapsed_ms >= timed_move_duration_ms_) {
      ESP_LOGI(TAG, "Zone %d timed move completed (%u ms)",
               current_zone_ + 1, elapsed_ms);
      stop_motor_(true);
      timed_mode_active_ = false;
      return;
    }
  }

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
  float base_runtime_ms = static_cast<float>(motor_cfg_.max_runtime_s) * 1000.0f;
  float max_runtime_ms = base_runtime_ms;
  xSemaphoreTake(telemetry_mutex_, portMAX_DELAY);
  uint32_t lo = telemetry_[current_zone_].learned_open_ms;
  uint32_t lc = telemetry_[current_zone_].learned_close_ms;
  xSemaphoreGive(telemetry_mutex_);

  uint32_t adaptive_cap = 0;
  bool adaptive_applied = false;
  // During calibration passes, always use the full runtime safety window.
  // Adaptive caps based on previous learned times can be too tight and cause
  // false TIMEOUTs while relearning a drifting or slow valve.
  if (!calibrating_ && lo > 0 && lc > 0) {
    uint32_t learned_max = std::max(lo, lc);
    adaptive_cap = learned_max + 5000;
    if (adaptive_cap > 1000 && static_cast<float>(adaptive_cap) < max_runtime_ms) {
      max_runtime_ms = static_cast<float>(adaptive_cap);
      adaptive_applied = true;
    }
  }

  if (motor_run_time_ms_ >= static_cast<uint32_t>(max_runtime_ms)) {
    ESP_LOGW(TAG,
             "Motor %d timeout context: run=%" PRIu32 "ms limit=%.0fms base=%.0fms adaptive_cap=%" PRIu32 "ms adaptive=%s learned_open=%" PRIu32 "ms learned_close=%" PRIu32 "ms",
             current_zone_ + 1, motor_run_time_ms_, max_runtime_ms, base_runtime_ms,
             adaptive_cap, adaptive_applied ? "applied" : "not_applied", lo, lc);
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
  detect_pin_engagement_();
}

void Hv6ValveController::apply_drive_output_() {
  DRV8215 *driver = drivers_[current_zone_];
  if (!driver)
    return;

  if (fsm_state_ == MotorFsmState::BOOST) {
    if (!drive_output_enabled_) {
      if (current_dir_ == MotorDirection::OPEN)
        driver->reverse();
      else
        driver->forward();
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
          driver->reverse();
        else
          driver->forward();
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
  // Ignore endstop detection during startup to avoid reacting to inrush/current transients.
  if (motor_run_time_ms_ < ENDSTOP_MIN_RUNTIME_MS)
    return;

  // Select per-direction parameters
  bool is_opening = (current_dir_ == MotorDirection::OPEN);
  float cfg_current_factor = is_opening ? motor_cfg_.open_current_factor
                                        : motor_cfg_.close_current_factor;
  float cfg_slope_thr      = is_opening ? motor_cfg_.open_slope_threshold_ma_per_s
                                        : motor_cfg_.close_slope_threshold_ma_per_s;
  float cfg_slope_cur_fac  = is_opening ? motor_cfg_.open_slope_current_factor
                                        : motor_cfg_.close_slope_current_factor;

  // --- Slope tracking (dI/dt) ---
  // Initialize on first call after startup guard so slope_prev starts from
  // a settled current reading, not zero.
  if (!slope_initialized_) {
    slope_prev_current_ma_ = current_filtered_ma_;
    slope_tick_count_ = 0;
    current_slope_ma_per_s_ = 0.0f;
    slope_endstop_windows_ = 0;
    slope_initialized_ = true;
  }

  // Update slope estimate every SLOPE_WINDOW_TICKS (500ms).
  // The VdMot current graphs show endstop as a gradual ramp over the last ~25%
  // of travel (e.g. 19→35 mA closing, 15→25 mA opening).  Unlike VdMot which
  // has a dedicated hardware tacho circuit (AC-coupled opamp from motor voltage),
  // HV6 derives both ripple and current from the single IPROPI pin.  Slope
  // detection on the current signal is therefore the best secondary indicator.
  slope_tick_count_++;
  if (slope_tick_count_ >= SLOPE_WINDOW_TICKS) {
    float dt_s = static_cast<float>(SLOPE_WINDOW_TICKS * TICK_MS) / 1000.0f;
    current_slope_ma_per_s_ = (current_filtered_ma_ - slope_prev_current_ma_) / dt_s;
    slope_prev_current_ma_ = current_filtered_ma_;
    slope_tick_count_ = 0;

    // Check if this window shows endstop-like slope: current rising AND above
    // mean×slope_current_factor (avoids false trigger on the mid-travel step when pin engages).
    float mean = mean_currents_[current_zone_];
    bool window_rising = current_slope_ma_per_s_ > cfg_slope_thr
                         && current_filtered_ma_ > mean * cfg_slope_cur_fac;
    if (window_rising) {
      if (slope_endstop_windows_ < 255)
        slope_endstop_windows_++;
    } else {
      slope_endstop_windows_ = 0;
    }
  }

  // --- Primary path: absolute threshold with sustained debounce ---
  float mean = mean_currents_[current_zone_];
  float threshold = mean * cfg_current_factor;
  bool above_threshold = current_filtered_ma_ > threshold;

  if (above_threshold) {
    if (endstop_high_count_ < 255)
      endstop_high_count_++;
  } else {
    endstop_high_count_ = 0;
  }

  // --- Hard safety cap: instant stop if current far exceeds normal range ---
  bool hard_cap_endstop = current_filtered_ma_ > ENDSTOP_HARD_CAP_MA;

  // --- Evaluate all detection paths ---
  bool threshold_endstop = endstop_high_count_ >= ENDSTOP_HIGH_TICKS;
  bool slope_endstop = slope_endstop_windows_ >= ENDSTOP_SLOPE_WINDOWS;

  if (!threshold_endstop && !slope_endstop && !hard_cap_endstop)
    return;

  const char *trigger = hard_cap_endstop ? "hard_cap" : threshold_endstop ? "threshold" : "slope";
  ESP_LOGI(TAG, "Motor %d endstop (%s: %.1f mA, mean=%.1f, thr=%.1f, slope=%.2f mA/s)",
           current_zone_ + 1, trigger,
           current_filtered_ma_, mean, threshold, current_slope_ma_per_s_);

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

void Hv6ValveController::detect_pin_engagement_() {
  if (!pin_detect_enabled_ || pin_detected_)
    return;

  // Only detect during close direction
  if (current_dir_ != MotorDirection::CLOSE)
    return;

  // Wait for current to settle after boost
  if (motor_run_time_ms_ < ENDSTOP_MIN_RUNTIME_MS)
    return;

  // Set baseline from first settled reading
  if (!pin_detect_baseline_set_) {
    pin_detect_baseline_ma_ = current_filtered_ma_;
    pin_detect_baseline_set_ = true;
    return;
  }

  // Look for sustained current increase above baseline
  if (current_filtered_ma_ > pin_detect_baseline_ma_ + motor_cfg_.pin_engage_step_ma) {
    if (pin_detect_sustained_ < 255)
      pin_detect_sustained_++;
  } else {
    pin_detect_sustained_ = 0;
  }

  if (pin_detect_sustained_ >= PIN_ENGAGE_DEBOUNCE_TICKS) {
    pin_detected_ = true;
    pin_detected_ripples_ = ripple_.count;
    ESP_LOGI(TAG, "Motor %d pin engagement at ripple %" PRIu32
             " (baseline=%.1f mA, current=%.1f mA)",
             current_zone_ + 1, pin_detected_ripples_,
             pin_detect_baseline_ma_, current_filtered_ma_);
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
// Relearn Trigger — periodic check for recalibration need
// =============================================================================

void Hv6ValveController::check_relearn_triggers_() {
  if (!config_store_)
    return;

  uint32_t now_ms = static_cast<uint32_t>(esp_timer_get_time() / 1000);
  if (now_ms - last_relearn_check_ms_ < RELEARN_CHECK_INTERVAL_MS)
    return;
  last_relearn_check_ms_ = now_ms;

  // Don't queue relearn if a calibration is already pending or running
  if (calibration_request_ >= 0 || calibrating_)
    return;

  const auto cfg = config_store_->get_config();

  for (uint8_t z = 0; z < NUM_ZONES; z++) {
    if (!cfg.zones[z].enabled)
      continue;

    xSemaphoreTake(telemetry_mutex_, portMAX_DELAY);
    const auto &t = telemetry_[z];

    // Skip zones that haven't been learned, are blocked, or not present
    if (t.learned_open_ms == 0 || t.blocked || !t.present) {
      xSemaphoreGive(telemetry_mutex_);
      continue;
    }

    bool needs_relearn = false;
    const char *reason = "";

    // Movement count trigger
    if (motor_cfg_.relearn_after_movements > 0 &&
        t.movements_since_learn >= motor_cfg_.relearn_after_movements) {
      needs_relearn = true;
      reason = "movement count";
    }

    // Time-based trigger (hours since last learn)
    if (!needs_relearn && motor_cfg_.relearn_after_hours > 0 && t.last_learn_ms > 0) {
      uint32_t elapsed_ms = now_ms - t.last_learn_ms;
      uint32_t limit_ms = motor_cfg_.relearn_after_hours * 3600000UL;
      if (elapsed_ms >= limit_ms) {
        needs_relearn = true;
        reason = "time elapsed";
      }
    }

    uint32_t moves = t.movements_since_learn;
    uint32_t last_ms = t.last_learn_ms;
    xSemaphoreGive(telemetry_mutex_);

    if (needs_relearn) {
      uint32_t hours_since = (t.last_learn_ms > 0) ? (now_ms - last_ms) / 3600000UL : 0;
      ESP_LOGI(TAG, "Zone %d relearn triggered (%s: %" PRIu32 " moves, %" PRIu32 "h since last)",
               z + 1, reason, moves, hours_since);
      calibration_request_ = static_cast<int8_t>(z);
      return;  // one at a time
    }
  }
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

  // Record sample to trace buffer (for CSV export)
  trace_sample_(raw, latest_current_ma_);

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
  // Enable pin engagement detection during close passes
  pin_detect_enabled_ = (dir == MotorDirection::CLOSE);

  if (!start_motor_(zone, dir))
    return 0;

  while (motor_turning_) {
    motor_loop_();
    vTaskDelay(pdMS_TO_TICKS(FAST_TICK_MS));
  }

  pin_detect_enabled_ = false;

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

  xSemaphoreTake(telemetry_mutex_, portMAX_DELAY);
  bool present = telemetry_[zone].present;
  xSemaphoreGive(telemetry_mutex_);

  // If cached as not-present, do a live re-probe before skipping — startup
  // I2C scans can miss a motor transiently during driver wakeup.
  if (!present && i2c_bus_ != nullptr) {
    esphome::i2c::I2CDevice dev;
    dev.set_i2c_bus(i2c_bus_);
    dev.set_i2c_address(motor_addresses_[zone]);
    if (dev.write(nullptr, 0) == esphome::i2c::ERROR_OK) {
      xSemaphoreTake(telemetry_mutex_, portMAX_DELAY);
      telemetry_[zone].present = true;
      telemetry_[zone].presence_known = true;
      xSemaphoreGive(telemetry_mutex_);
      present = true;
      ESP_LOGI(TAG, "Calibration zone %d: motor presence recovered on I2C (addr 0x%02X)",
               zone + 1, motor_addresses_[zone]);
    }
  }

  if (!present) {
    ESP_LOGW(TAG, "Calibration zone %d skipped: motor not present on I2C (addr 0x%02X)",
             zone + 1, motor_addresses_[zone]);
    return;
  }

  // Drop stale queued movement commands so calibration runs in a strictly
  // controlled sequence and doesn't execute delayed UI commands afterward.
  uint32_t dropped_cmds = 0;
  if (cmd_queue_) {
    ValveCommand stale_cmd;
    while (xQueueReceive(cmd_queue_, &stale_cmd, 0) == pdTRUE)
      dropped_cmds++;
  }
  if (dropped_cmds > 0) {
    ESP_LOGW(TAG, "Calibration zone %d: dropped %" PRIu32 " queued move command(s)",
             zone + 1, dropped_cmds);
  }

  // Calibration can run for tens of seconds; temporarily boost this task's
  // priority so it preempts non-critical app work on the same core.
  UBaseType_t original_prio = uxTaskPriorityGet(nullptr);
  UBaseType_t boosted_prio = original_prio;
  UBaseType_t max_safe_prio = (configMAX_PRIORITIES > 2) ? (configMAX_PRIORITIES - 2) : original_prio;
  if (max_safe_prio > boosted_prio)
    boosted_prio = max_safe_prio;
  if (boosted_prio != original_prio)
    vTaskPrioritySet(nullptr, boosted_prio);

  calibrating_ = true;

  ESP_LOGI(TAG, "Calibrating zone %d (double-pass, ripple=%s, prio=%u->%u)",
           zone + 1, ripple_enabled_ ? "yes" : "no",
           static_cast<unsigned>(original_prio), static_cast<unsigned>(boosted_prio));

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
      // Store pin engagement from close2 pass (if detected)
      if (pin_detected_ && pin_detected_ripples_ > 0) {
        t.pin_engage_close_ripples = pin_detected_ripples_;
      }
      xSemaphoreGive(telemetry_mutex_);

      save_telemetry_(zone);
      ESP_LOGI(TAG, "Calibration zone %d OK: open=%" PRIu32 "ms/%" PRIu32 "r close=%" PRIu32 "ms/%" PRIu32 "r dz=%" PRId32 "ms",
               zone + 1, open_ms, open_ripples, close2_ms, close2_ripples, deadzone);
      if (pin_detected_ && pin_detected_ripples_ > 0) {
        ESP_LOGI(TAG, "  Pin engagement at ripple %" PRIu32 " from open end (margin=%" PRIu16 " ensures full disengage at 100%% flow)",
                 pin_detected_ripples_, motor_cfg_.pin_engage_margin_ripples);
      } else {
        ESP_LOGW(TAG, "  Pin engagement not detected (step threshold %.1f mA)",
                 motor_cfg_.pin_engage_step_ma);
      }
      calibrating_ = false;
      if (boosted_prio != original_prio)
        vTaskPrioritySet(nullptr, original_prio);
      return;
    }

    ESP_LOGW(TAG, "Calibration zone %d attempt %d: travel too short (open=%" PRIu32 "ms close=%" PRIu32 "ms min=%" PRIu32 "ms)",
             zone + 1, attempt + 1, open_ms, close2_ms, min_travel);
  }

  bool has_previous_learning = false;
  xSemaphoreTake(telemetry_mutex_, portMAX_DELAY);
  has_previous_learning = telemetry_[zone].learned_open_ms > 0 && telemetry_[zone].learned_close_ms > 0;
  // Keep previously working zones operational if relearn fails.
  // Only hard-block when we have no learned fallback for this valve.
  telemetry_[zone].blocked = !has_previous_learning;
  xSemaphoreGive(telemetry_mutex_);

  if (has_previous_learning) {
    ESP_LOGW(TAG, "Calibration zone %d FAILED after %d attempts; keeping previous learned profile and leaving zone unblocked",
             zone + 1, max_retries + 1);
  } else {
    ESP_LOGE(TAG, "Calibration zone %d FAILED after %d attempts", zone + 1, max_retries + 1);
  }
  calibrating_ = false;
  if (boosted_prio != original_prio)
    vTaskPrioritySet(nullptr, original_prio);
}

// =============================================================================
// Motor Trace Buffer — High-rate CSV export for diagnostics
// =============================================================================

void Hv6ValveController::trace_reset_() {
  if (trace_mutex_ == nullptr)
    return;

  xSemaphoreTake(trace_mutex_, portMAX_DELAY);
  trace_write_index_ = 0;
  trace_wrapped_ = false;
  trace_start_us_ = esp_timer_get_time();
  trace_last_sample_us_ = trace_start_us_;
  xSemaphoreGive(trace_mutex_);
}

void Hv6ValveController::trace_sample_(int raw_adc, float current_ma) {
  if (trace_mutex_ == nullptr)
    return;

  uint32_t now_us = esp_timer_get_time();
  if (now_us - trace_last_sample_us_ < TRACE_SAMPLE_PERIOD_US)
    return;  // Not enough time elapsed for next sample

  trace_last_sample_us_ = now_us;

  xSemaphoreTake(trace_mutex_, portMAX_DELAY);

  MotorTraceSample &sample = trace_samples_[trace_write_index_];
  sample.t_ms = static_cast<uint32_t>((now_us - trace_start_us_) / 1000);
  sample.ripple_count = ripple_.count;
  sample.current_ma_x10 = static_cast<int16_t>(current_ma * 10.0f);
  sample.adc_raw = static_cast<uint16_t>(raw_adc & 0xFFF);
  sample.drive_on = drive_output_enabled_ ? 1 : 0;

  trace_write_index_++;
  if (trace_write_index_ >= TRACE_MAX_SAMPLES) {
    trace_write_index_ = 0;
    trace_wrapped_ = true;
  }

  xSemaphoreGive(trace_mutex_);
}

uint16_t Hv6ValveController::get_motor_trace_sample_count() const {
  if (trace_mutex_ == nullptr)
    return 0;

  xSemaphoreTake(trace_mutex_, portMAX_DELAY);
  uint16_t count = trace_wrapped_ ? TRACE_MAX_SAMPLES : trace_write_index_;
  xSemaphoreGive(trace_mutex_);
  return count;
}

void Hv6ValveController::trace_publish_to_mqtt_() {
  if (trace_mutex_ == nullptr)
    return;

  xSemaphoreTake(trace_mutex_, portMAX_DELAY);

  // Determine how many new samples to send (since last publish)
  uint16_t current_write_idx = trace_write_index_;
  uint16_t samples_to_publish = 0;
  uint16_t new_samples_start = 0;

  if (trace_last_mqtt_index_ <= current_write_idx) {
    // No wrap since last publish
    samples_to_publish = current_write_idx - trace_last_mqtt_index_;
    new_samples_start = trace_last_mqtt_index_;
  } else if (trace_wrapped_) {
    // Wrapped: publish from last_index to end, then 0 to current
    samples_to_publish = (TRACE_MAX_SAMPLES - trace_last_mqtt_index_) + current_write_idx;
    new_samples_start = trace_last_mqtt_index_;
  } else {
    samples_to_publish = 0;
  }

  if (samples_to_publish == 0) {
    xSemaphoreGive(trace_mutex_);
    return;
  }

  // Limit batch size to keep JSON safely under ESPHome's 5120-byte JSON buffer
  const uint16_t MAX_BATCH = 70;  // 70 * ~65 bytes = ~4.5KB
  if (samples_to_publish > MAX_BATCH)
    samples_to_publish = MAX_BATCH;

  // Build JSON array
  std::string json;
  json.reserve(samples_to_publish * 60);  // Pre-allocate to avoid reallocations
  json = "[";

  for (uint16_t i = 0; i < samples_to_publish; i++) {
    uint16_t idx = (new_samples_start + i) % TRACE_MAX_SAMPLES;
    const MotorTraceSample &s = trace_samples_[idx];

    if (i > 0)
      json += ",";
    
    char buf[80];
    std::snprintf(buf, sizeof(buf),
                  "{\"t\":%" PRIu32 ",\"r\":%" PRIu32 ",\"i\":%.1f,\"a\":%" PRIu16 ",\"p\":%u}",
                  s.t_ms, s.ripple_count, s.current_ma_x10 / 10.0f, s.adc_raw, s.drive_on);
    json += buf;
  }
  json += "]";

  // Update last published index
  trace_last_mqtt_index_ = (new_samples_start + samples_to_publish) % TRACE_MAX_SAMPLES;

  xSemaphoreGive(trace_mutex_);

  // Publish to text sensor (ESPHome will forward to MQTT)
  // Only publish if sensor is configured
  if (trace_text_sensor_)
    trace_text_sensor_->publish_state(json);
}

void Hv6ValveController::clear_motor_trace() {
  if (trace_mutex_ == nullptr)
    return;

  xSemaphoreTake(trace_mutex_, portMAX_DELAY);
  trace_write_index_ = 0;
  trace_wrapped_ = false;
  trace_samples_.fill({});
  xSemaphoreGive(trace_mutex_);
}

}  // namespace hv6
