#include "hv6_dashboard.h"

#include "esphome/core/log.h"
#ifdef USE_LOGGER
#include "esphome/components/logger/logger.h"
#endif
#ifdef USE_HV6_ASGARD_BRIDGE
#include "../hv6_asgard_bridge/hv6_asgard_bridge.h"
#endif
#ifdef USE_HV6_FORECAST
#include "../hv6_forecast/hv6_forecast.h"
#endif
#include <cmath>
#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <cstdarg>
#include <ctime>
#include <esp_http_server.h>
#include <esp_heap_caps.h>
#include <esp_system.h>

namespace esphome {
namespace hv6_dashboard {

static const char *const TAG = "hv6_dashboard";

namespace {

bool appendf(char *buffer, size_t capacity, size_t &offset, const char *fmt, ...) {
  if (offset >= capacity)
    return false;

  va_list args;
  va_start(args, fmt);
  const int written = vsnprintf(buffer + offset, capacity - offset, fmt, args);
  va_end(args);

  if (written < 0)
    return false;
  if (static_cast<size_t>(written) >= capacity - offset) {
    offset = capacity;
    return false;
  }

  offset += static_cast<size_t>(written);
  return true;
}

// Append `s` as the body of a JSON string (without surrounding quotes),
// escaping the characters JSON requires. Control chars become spaces.
void append_json_escaped(char *buffer, size_t capacity, size_t &offset, const char *s) {
  for (const char *p = s; p != nullptr && *p != '\0'; ++p) {
    if (offset + 2 >= capacity)
      return;
    const unsigned char c = static_cast<unsigned char>(*p);
    if (c == '"' || c == '\\') {
      buffer[offset++] = '\\';
      buffer[offset++] = static_cast<char>(c);
    } else if (c < 0x20) {
      buffer[offset++] = ' ';
    } else {
      buffer[offset++] = static_cast<char>(c);
    }
  }
}

void format_float_token(char *buffer, size_t capacity, float value, int decimals = 1) {
  if (!std::isfinite(value)) {
    snprintf(buffer, capacity, "null");
    return;
  }

  long scale = 1;
  for (int i = 0; i < decimals; i++)
    scale *= 10;

  const long scaled = lroundf(value * static_cast<float>(scale));
  const long whole = scaled / scale;
  const long fraction = std::labs(scaled % scale);

  if (decimals <= 0) {
    snprintf(buffer, capacity, "%ld", whole);
    return;
  }

  char frac_fmt[8];
  snprintf(frac_fmt, sizeof(frac_fmt), "%%0%dld", decimals);
  char frac_buf[16];
  snprintf(frac_buf, sizeof(frac_buf), frac_fmt, fraction);
  snprintf(buffer, capacity, "%ld.%s", whole, frac_buf);
}

void sanitize_text(const std::string &src, char *buffer, size_t capacity) {
  if (capacity == 0)
    return;

  size_t out = 0;
  for (size_t i = 0; i < src.size() && out + 1 < capacity; i++) {
    const char c = src[i];
    buffer[out++] = (c == '"' || c == '\\') ? '_' : c;
  }
  buffer[out] = '\0';
}

// --- minimal JSON field extractors for POST body ---

static bool json_get_str(const char *body, const char *field, char *out, size_t out_len) {
  char pat[48];
  snprintf(pat, sizeof(pat), "\"%s\":\"", field);
  const char *p = strstr(body, pat);
  if (!p) return false;
  p += strlen(pat);
  const char *end = strchr(p, '"');
  if (!end) return false;
  const size_t len = std::min(static_cast<size_t>(end - p), out_len - 1);
  memcpy(out, p, len);
  out[len] = '\0';
  return true;
}

static bool json_get_num(const char *body, const char *field, float *out) {
  char pat[48];
  snprintf(pat, sizeof(pat), "\"%s\":", field);
  const char *p = strstr(body, pat);
  if (!p) return false;
  p += strlen(pat);
  while (*p == ' ') p++;
  if (*p == '"' || *p == '{' || *p == '[') return false;
  char *end;
  const float v = strtof(p, &end);
  if (end == p) return false;
  *out = v;
  return true;
}

// --- string → enum parsers ---

static bool parse_probe_option(const char *raw, int8_t *out) {
  if (strcasecmp(raw, "None") == 0) { *out = hv6::PROBE_UNASSIGNED; return true; }
  int n = 0;
  if (sscanf(raw, "Probe %d", &n) == 1 && n >= 1 && n <= static_cast<int>(hv6::MAX_PROBES)) {
    *out = static_cast<int8_t>(n - 1);
    return true;
  }
  return false;
}

static bool parse_temp_source(const char *raw, hv6::TempSource *out) {
  if (strcasecmp(raw, "Local Probe") == 0) { *out = hv6::TempSource::LOCAL_PROBE; return true; }
  if (strcasecmp(raw, "BLE") == 0 || strcasecmp(raw, "BLE Sensor") == 0) {
    *out = hv6::TempSource::BLE_SENSOR;
    return true;
  }
  return false;
}

static const char *dashboard_variant_str() {
  return "ble";
}

static const char *temp_source_to_dashboard_str(hv6::TempSource src) {
  switch (src) {
    case hv6::TempSource::LOCAL_PROBE:
      return "Local Probe";
    case hv6::TempSource::BLE_SENSOR:
      return "BLE";
    default:
      return "Local Probe";
  }
}

static bool parse_pipe_type(const char *raw, hv6::PipeType *out) {
  struct { const char *s; hv6::PipeType v; } map[] = {
    {"PEX 12mm", hv6::PipeType::PEX_12X2}, {"PEX 12x2", hv6::PipeType::PEX_12X2},
    {"PEX 14mm", hv6::PipeType::PEX_14X2}, {"PEX 14x2", hv6::PipeType::PEX_14X2},
    {"PEX 16mm", hv6::PipeType::PEX_16X2}, {"PEX 16x2", hv6::PipeType::PEX_16X2},
    {"PEX 17mm", hv6::PipeType::PEX_17X2}, {"PEX 17x2", hv6::PipeType::PEX_17X2},
    {"PEX 18mm", hv6::PipeType::PEX_18X2}, {"PEX 18x2", hv6::PipeType::PEX_18X2},
    {"PEX 20mm", hv6::PipeType::PEX_20X2}, {"PEX 20x2", hv6::PipeType::PEX_20X2},
    {"ALUPEX 16mm", hv6::PipeType::ALUPEX_16X2}, {"ALUPEX 16x2", hv6::PipeType::ALUPEX_16X2},
    {"ALUPEX 20mm", hv6::PipeType::ALUPEX_20X2}, {"ALUPEX 20x2", hv6::PipeType::ALUPEX_20X2},
  };
  for (const auto &e : map) {
    if (strcasecmp(raw, e.s) == 0) { *out = e.v; return true; }
  }
  return false;
}

static bool parse_motor_profile(const char *raw, hv6::MotorProfile *out) {
  if (strcasecmp(raw, "Inherit") == 0) { *out = hv6::MotorProfile::INHERIT; return true; }
  if (strcasecmp(raw, "Generic") == 0) { *out = hv6::MotorProfile::GENERIC; return true; }
  if (strcasecmp(raw, "HmIP VdMot") == 0 || strcasecmp(raw, "HMIP_VDMOT") == 0) { *out = hv6::MotorProfile::HMIP_VDMOT; return true; }
  return false;
}

static uint8_t parse_exterior_walls(const char *raw) {
  if (strcasecmp(raw, "None") == 0) return hv6::ExteriorWall::NONE;
  uint8_t walls = hv6::ExteriorWall::NONE;
  for (const char *p = raw; *p; p++) {
    if (*p == 'N' || *p == 'n') walls |= hv6::ExteriorWall::NORTH;
    if (*p == 'E' || *p == 'e') walls |= hv6::ExteriorWall::EAST;
    if (*p == 'S' || *p == 's') walls |= hv6::ExteriorWall::SOUTH;
    if (*p == 'W' || *p == 'w') walls |= hv6::ExteriorWall::WEST;
  }
  return walls;
}

}  // namespace

static const char DASHBOARD_HTML[] =
    "<!doctype html><html><head>"
    "<meta charset=\"utf-8\">"
    "<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">"
    "<title>HeatValve-6</title>"
    "</head><body>"
    "<div id=\"app\">Loading dashboard...</div>"
    "<script src=\"/dashboard.js\"></script>"
    "</body></html>";

void HV6Dashboard::update_snapshot_() {
  DashboardSnapshot s{};

  s.uptime_s = millis() / 1000UL;
  // System diagnostics — per-core CPU load (sampled in loop()) + live heap.
  s.cpu0_pct = cpu0_pct_;
  s.cpu1_pct = cpu1_pct_;
  s.free_internal_kb = heap_caps_get_free_size(MALLOC_CAP_INTERNAL) / 1024;
  s.free_psram_kb = heap_caps_get_free_size(MALLOC_CAP_SPIRAM) / 1024;

  auto snap_float = [](sensor::Sensor *sns) -> float {
    return (sns && sns->has_state()) ? sns->state : NAN;
  };

  s.wifi_dbm          = snap_float(this->wifi_signal_sensor_);
  s.manifold_flow_c   = snap_float(this->manifold_flow_sensor_);
  s.manifold_return_c = snap_float(this->manifold_return_sensor_);
  for (uint8_t i = 0; i < 6; i++) {
    s.zone_temp_c[i]        = snap_float(this->zone_temp_sensors_[i]);
    s.zone_valve_pct[i]     = snap_float(this->zone_valve_sensors_[i]);
    s.zone_preheat_c[i]     = snap_float(this->zone_preheat_sensors_[i]);
    s.motor_open_ripple[i]  = snap_float(this->motor_open_ripple_sensors_[i]);
    s.motor_close_ripple[i] = snap_float(this->motor_close_ripple_sensors_[i]);
    s.motor_open_factor[i]  = snap_float(this->motor_open_factor_sensors_[i]);
    s.motor_close_factor[i] = snap_float(this->motor_close_factor_sensors_[i]);
  }
  for (uint8_t i = 0; i < 8; i++)
    s.probe_temp_c[i] = snap_float(this->probe_temp_sensors_[i]);

  auto snap_text = [](text_sensor::TextSensor *ts, char *out, size_t len) {
    if (ts && ts->has_state()) {
      sanitize_text(ts->state, out, len);
    } else {
      out[0] = '\0';
    }
  };
  snap_text(this->firmware_version_text_, s.firmware_version, sizeof(s.firmware_version));
  snap_text(this->ip_address_text_,       s.ip_address,       sizeof(s.ip_address));
  snap_text(this->connected_ssid_text_,   s.connected_ssid,   sizeof(s.connected_ssid));
  snap_text(this->mac_address_text_,      s.mac_address,      sizeof(s.mac_address));
  for (uint8_t i = 0; i < 6; i++) {
    snap_text(this->zone_state_sensors_[i],  s.zone_state[i],  sizeof(s.zone_state[i]));
    snap_text(this->motor_fault_sensors_[i], s.motor_fault[i], sizeof(s.motor_fault[i]));
  }

  s.drivers_enabled = this->valve_controller_ && this->valve_controller_->are_drivers_enabled();

  // Asgard bridge status
#ifdef USE_HV6_ASGARD_BRIDGE
  if (this->asgard_bridge_ != nullptr) {
    auto *ab = static_cast<hv6_asgard_bridge::Hv6AsgardBridge *>(this->asgard_bridge_);
    strncpy(s.asgard_role, ab->get_role_str(), sizeof(s.asgard_role) - 1);
    strncpy(s.asgard_peer_status, ab->get_peer_status_str(), sizeof(s.asgard_peer_status) - 1);
    strncpy(s.asgard_last_error, ab->get_last_error(), sizeof(s.asgard_last_error) - 1);
    s.asgard_last_push_c      = ab->get_last_push_value();
    s.asgard_setpoint_c       = ab->get_recommended_setpoint_c();
    s.asgard_last_push_age_s  = ab->get_last_push_age_s();
    s.asgard_push_fail_streak = ab->get_push_fail_streak();
    s.asgard_local_zones      = ab->get_local_zones_used();
    s.asgard_peer_zones       = ab->get_peer_zones_used();
  } else {
    strncpy(s.asgard_role, "slave", sizeof(s.asgard_role) - 1);
    strncpy(s.asgard_peer_status, "n/a", sizeof(s.asgard_peer_status) - 1);
  }
#else
  strncpy(s.asgard_role, "slave", sizeof(s.asgard_role) - 1);
  strncpy(s.asgard_peer_status, "n/a", sizeof(s.asgard_peer_status) - 1);
#endif
  s.asgard_role[sizeof(s.asgard_role) - 1] = '\0';
  s.asgard_peer_status[sizeof(s.asgard_peer_status) - 1] = '\0';
  s.asgard_last_error[sizeof(s.asgard_last_error) - 1] = '\0';

  // Forecast preload status
#ifdef USE_HV6_FORECAST
  if (this->forecast_ != nullptr) {
    auto *fc = static_cast<hv6_forecast::Hv6Forecast *>(this->forecast_);
    strncpy(s.forecast_status, fc->get_status_str(), sizeof(s.forecast_status) - 1);
    strncpy(s.forecast_last_error, fc->get_last_error(), sizeof(s.forecast_last_error) - 1);
    s.forecast_age_s = fc->get_fetch_age_s();  // "fetched X ago", not the hour offset
    s.forecast_fetch_epoch = fc->get_last_fetch_epoch();
    s.forecast_fail_streak = fc->get_fetch_fail_streak();
    for (uint8_t i = 0; i < hv6::NUM_ZONES; i++) {
      s.forecast_zone_offset_c[i] = fc->get_zone_offset(i);
      s.forecast_zone_peak_in_h[i] = fc->get_zone_peak_in_h(i);
    }
  } else {
    strncpy(s.forecast_status, "disabled", sizeof(s.forecast_status) - 1);
  }
#else
  strncpy(s.forecast_status, "disabled", sizeof(s.forecast_status) - 1);
#endif
  s.forecast_status[sizeof(s.forecast_status) - 1] = '\0';
  s.forecast_last_error[sizeof(s.forecast_last_error) - 1] = '\0';

  if (this->config_store_) {
    s.probes                 = this->config_store_->get_probe_config();
    s.motor                  = this->config_store_->get_motor_config();
    s.manifold_type          = this->config_store_->get_manifold_type();
    s.simple_preheat_enabled = this->config_store_->get_simple_preheat_enabled();
    const auto ctrl_cfg = this->config_store_->get_config().control;
    s.preheat_absorb_enabled = ctrl_cfg.preheat_absorb_enabled;
    s.preheat_absorb_band_c  = ctrl_cfg.preheat_absorb_band_c;
    s.preheat_detect_delta_c = ctrl_cfg.preheat_detect_delta_c;
    s.preheat_absorbing = this->zone_controller_ && this->zone_controller_->is_preheat_absorbing();
    s.asgard                 = this->config_store_->get_asgard_config();
    s.balancing              = this->config_store_->get_config().balancing;
    s.min_zone_flow_pct      = s.balancing.minimum_flow_pct;
    s.minimum_flow_always    = s.balancing.modulating_heat_source;
    s.forecast               = this->config_store_->get_forecast_config();
    for (uint8_t i = 0; i < hv6::NUM_ZONES; i++) {
      s.zones[i]            = this->config_store_->get_zone_config(i);
      s.zone_temp_source[i] = this->config_store_->get_zone_temp_source(i);
      this->config_store_->get_zone_ble_mac_str(i, s.zone_ble_mac[i], sizeof(s.zone_ble_mac[i]));
    }
  }

  // Per-zone balancing telemetry (static prior, learned multiplier, effective
  // factor, long-window error) — surfaces why a loop is throttled/boosted.
  if (this->zone_controller_) {
    for (uint8_t i = 0; i < hv6::NUM_ZONES; i++) {
      hv6::ZoneSnapshot zs = this->zone_controller_->get_zone_snapshot(i);
      s.zone_static_factor[i]  = zs.static_factor;
      s.zone_balance_factor[i] = zs.hydraulic_factor;
      s.zone_balance_adapt[i]  = zs.balance_adapt;
      s.zone_adapt_err[i]      = zs.adapt_err_ema;
    }
  }

  if (xSemaphoreTake(snapshot_lock_, pdMS_TO_TICKS(5)) == pdTRUE) {
    memcpy(&this->snapshot_, &s, sizeof(s));
    this->snapshot_ready_ = true;
    xSemaphoreGive(snapshot_lock_);
  }
}

void HV6Dashboard::setup() {
  if (this->base_ == nullptr) {
    ESP_LOGE(TAG, "web_server_base is null; dashboard handler not registered");
    return;
  }

  this->action_lock_ = xSemaphoreCreateMutex();
  this->snapshot_lock_ = xSemaphoreCreateMutex();
  this->history_lock_ = xSemaphoreCreateMutex();
  this->log_lock_ = xSemaphoreCreateMutex();

#ifdef USE_LOGGER
  // Tap the ESPHome logger so the dashboard Logs view can stream device logs.
  // The callback runs on arbitrary tasks; it must stay non-blocking (see on_log_).
  if (logger::global_logger != nullptr)
    logger::global_logger->add_log_callback(this, &HV6Dashboard::on_log_static_);
#endif

  // Prime snapshot so the first GET doesn't return 503.
  this->update_snapshot_();
  this->snapshot_last_ms_ = millis();

  this->base_->init();
  this->base_->add_handler(this);
  ESP_LOGI(TAG, "Dashboard endpoints registered: /dashboard, /dashboard.js");
}

// =============================================================================
// FreeRTOS runtime diagnostics (CONFIG_FREERTOS_GENERATE_RUN_TIME_STATS)
// =============================================================================

void HV6Dashboard::sample_cpu_load_() {
  UBaseType_t count = uxTaskGetNumberOfTasks();
  if (count == 0)
    return;
  task_status_buf_.resize(count + 4);  // headroom for tasks spawned mid-call
  uint32_t total_runtime = 0;
  UBaseType_t got = uxTaskGetSystemState(task_status_buf_.data(),
                                         (UBaseType_t) task_status_buf_.size(), &total_runtime);
  if (got == 0)
    return;

  uint32_t idle0 = 0, idle1 = 0;
  for (UBaseType_t i = 0; i < got; i++) {
    const char *name = task_status_buf_[i].pcTaskName;
    if (name == nullptr)
      continue;
    if (strcmp(name, "IDLE0") == 0 || strcmp(name, "IDLE") == 0)
      idle0 = task_status_buf_[i].ulRunTimeCounter;
    else if (strcmp(name, "IDLE1") == 0)
      idle1 = task_status_buf_[i].ulRunTimeCounter;
  }

  // Need a previous sample, and skip the cycle when the run-time counter wrapped.
  if (cpu_last_total_ > 0 && total_runtime > cpu_last_total_) {
    float dt = (float) (total_runtime - cpu_last_total_);
    float c0 = 100.0f - (float) (idle0 - cpu_last_idle0_) / dt * 100.0f;
    float c1 = 100.0f - (float) (idle1 - cpu_last_idle1_) / dt * 100.0f;
    cpu0_pct_ = std::max(0.0f, std::min(100.0f, c0));
    cpu1_pct_ = std::max(0.0f, std::min(100.0f, c1));
  }
  cpu_last_total_ = total_runtime;
  cpu_last_idle0_ = idle0;
  cpu_last_idle1_ = idle1;
}

void HV6Dashboard::dump_task_stats_() {
  UBaseType_t count = uxTaskGetNumberOfTasks();
  if (count == 0)
    return;
  task_status_buf_.resize(count + 4);
  uint32_t total_runtime = 0;
  UBaseType_t got = uxTaskGetSystemState(task_status_buf_.data(),
                                         (UBaseType_t) task_status_buf_.size(), &total_runtime);
  if (got == 0 || total_runtime == 0)
    return;

  ESP_LOGI(TAG, "--- task stats: %u tasks | core0=%.0f%% core1=%.0f%% | heap int=%uKB psram=%uKB ---",
           (unsigned) got, cpu0_pct_, cpu1_pct_,
           (unsigned) (heap_caps_get_free_size(MALLOC_CAP_INTERNAL) / 1024),
           (unsigned) (heap_caps_get_free_size(MALLOC_CAP_SPIRAM) / 1024));
  // ulRunTimeCounter is the lifetime counter, so cpu% here is the since-boot
  // average per task (the live per-core figures above cover "now"). stack_free
  // is the lifetime minimum free stack — a small value flags near-overflow.
  for (UBaseType_t i = 0; i < got; i++) {
    const TaskStatus_t &t = task_status_buf_[i];
    float pct = (float) t.ulRunTimeCounter / (float) total_runtime * 100.0f;
    ESP_LOGI(TAG, "  %-16s pri=%2u cpu=%5.1f%% stack_free=%uB",
             t.pcTaskName ? t.pcTaskName : "?", (unsigned) t.uxCurrentPriority, pct,
             (unsigned) (t.usStackHighWaterMark * sizeof(StackType_t)));
  }
}

void HV6Dashboard::loop() {
  if (action_lock_ == nullptr)
    return;

  std::vector<DashboardAction> todo;
  if (xSemaphoreTake(action_lock_, pdMS_TO_TICKS(10)) == pdTRUE) {
    if (!action_queue_.empty()) {
      todo = action_queue_;
      action_queue_.clear();
    }
    xSemaphoreGive(action_lock_);
  }
  for (const auto &act : todo) {
    dispatch_set_(act);
  }

  // Update snapshot at 1 Hz (int32_t cast for millis() rollover safety).
  const uint32_t now = millis();
  // Sample per-core CPU load every 2 s (needs two samples before it reports).
  if ((int32_t)(now - cpu_last_sample_ms_) >= (int32_t)CPU_SAMPLE_INTERVAL_MS) {
    cpu_last_sample_ms_ = now;
    sample_cpu_load_();
  }
  if ((int32_t)(now - snapshot_last_ms_) >= (int32_t)SNAPSHOT_INTERVAL_MS) {
    snapshot_last_ms_ = now;
    update_snapshot_();
  }

  // Sample zone-state history every 5 minutes.
  if ((int32_t)(now - history_last_sample_ms_) >= (int32_t)HISTORY_INTERVAL_MS) {
    history_last_sample_ms_ = now;
    sample_history_();
  }
}

static constexpr const char V1_PREFIX[] = "/api/hv6/v1";
static constexpr size_t V1_PREFIX_LEN = sizeof(V1_PREFIX) - 1;

bool HV6Dashboard::canHandle(AsyncWebServerRequest *request) const {
  char url_buf[AsyncWebServerRequest::URL_BUF_SIZE];
  auto url = request->url_to(url_buf);
  if (url == "/dashboard" || url == "/dashboard/" || url == "/dashboard.js")
    return true;
  return strncmp(url.c_str(), V1_PREFIX, V1_PREFIX_LEN) == 0 && url.c_str()[V1_PREFIX_LEN] == '/';
}

void HV6Dashboard::handleRequest(AsyncWebServerRequest *request) {
  char url_buf[AsyncWebServerRequest::URL_BUF_SIZE];
  auto url = request->url_to(url_buf);

  if (url == "/dashboard" || url == "/dashboard/") {
    this->handle_root_(request);
    return;
  }
  if (url == "/dashboard.js") {
    this->handle_js_(request);
    return;
  }
  if (strncmp(url.c_str(), V1_PREFIX, V1_PREFIX_LEN) == 0 && url.c_str()[V1_PREFIX_LEN] == '/') {
    this->handle_v1_(request, url.c_str() + V1_PREFIX_LEN);
    return;
  }

  request->send(404, "text/plain", "Not found");
}

void HV6Dashboard::handle_root_(AsyncWebServerRequest *request) { request->send(200, "text/html; charset=utf-8", DASHBOARD_HTML); }

void HV6Dashboard::handle_js_(AsyncWebServerRequest *request) {
#ifdef HV6_HAS_DASHBOARD_JS
  AsyncWebServerResponse *response = request->beginResponse(
      200, "application/javascript; charset=utf-8", (const uint8_t *) HV6_DASHBOARD_JS_DATA, HV6_DASHBOARD_JS_SIZE);
  response->addHeader("Content-Encoding", "gzip");
  response->addHeader("Cache-Control", "max-age=60");
  request->send(response);
#else
  request->send(404, "text/plain", "dashboard.js not configured. Add dashboard_js: web/dashboard.js to hv6_dashboard.");
#endif
}

void HV6Dashboard::handle_state_(AsyncWebServerRequest *request) {
  if (snapshot_lock_ == nullptr || !snapshot_ready_ ||
      xSemaphoreTake(snapshot_lock_, pdMS_TO_TICKS(50)) != pdTRUE) {
    httpd_req_t *req_err = *request;
    httpd_resp_set_status(req_err, "503 Service Unavailable");
    httpd_resp_set_type(req_err, "text/plain");
    httpd_resp_send(req_err, "Snapshot not ready", HTTPD_RESP_USE_STRLEN);
    return;
  }
  memcpy(&this->state_snap_buf_, &this->snapshot_, sizeof(this->state_snap_buf_));
  xSemaphoreGive(snapshot_lock_);

  DashboardSnapshot *snap = &this->state_snap_buf_;

  httpd_req_t *req = *request;
  httpd_resp_set_status(req, "200 OK");
  httpd_resp_set_type(req, "application/json");
  httpd_resp_set_hdr(req, "Cache-Control", "no-cache");
  httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");

  constexpr size_t BUF_SIZE = 2048;
  char *buf = this->json_buf_;
  size_t offset = 0;

  auto flush = [&]() -> bool {
    if (offset == 0) return true;
    bool ok = (httpd_resp_send_chunk(req, buf, offset) == ESP_OK);
    offset = 0;
    return ok;
  };

  char num_buf[24];

  appendf(buf, BUF_SIZE, offset, "{");

  // --- uptime & wifi ---
  char wifi_buf[24] = "null";
  if (std::isfinite(snap->wifi_dbm)) {
    snprintf(wifi_buf, sizeof(wifi_buf), "%ld", static_cast<long>(std::lround(snap->wifi_dbm)));
  }
  appendf(buf, BUF_SIZE, offset,
      "\"sensor-uptime\":{\"value\":%lu},"
      "\"sensor-wifi_signal\":{\"value\":%s},",
      static_cast<unsigned long>(snap->uptime_s), wifi_buf);

  // --- system diagnostics: per-core CPU load + free heap ---
  format_float_token(num_buf, sizeof(num_buf), snap->cpu0_pct, 1);
  appendf(buf, BUF_SIZE, offset, "\"sensor-cpu_load_core0\":{\"value\":%s},", num_buf);
  format_float_token(num_buf, sizeof(num_buf), snap->cpu1_pct, 1);
  appendf(buf, BUF_SIZE, offset,
      "\"sensor-cpu_load_core1\":{\"value\":%s},"
      "\"sensor-free_internal_kb\":{\"value\":%lu},"
      "\"sensor-free_psram_kb\":{\"value\":%lu},",
      num_buf,
      static_cast<unsigned long>(snap->free_internal_kb),
      static_cast<unsigned long>(snap->free_psram_kb));

  // --- manifold temps ---
  format_float_token(num_buf, sizeof(num_buf), snap->manifold_flow_c);
  appendf(buf, BUF_SIZE, offset, "\"sensor-manifold_flow_temperature\":{\"value\":%s},", num_buf);
  format_float_token(num_buf, sizeof(num_buf), snap->manifold_return_c);
  appendf(buf, BUF_SIZE, offset, "\"sensor-manifold_return_temperature\":{\"value\":%s},", num_buf);

  // --- zone temperatures ---
  static const char *const ZONE_TEMP_KEYS[6] = {
    "sensor-zone_1_temperature", "sensor-zone_2_temperature", "sensor-zone_3_temperature",
    "sensor-zone_4_temperature", "sensor-zone_5_temperature", "sensor-zone_6_temperature",
  };
  for (uint8_t i = 0; i < 6; i++) {
    format_float_token(num_buf, sizeof(num_buf), snap->zone_temp_c[i]);
    appendf(buf, BUF_SIZE, offset, "\"%s\":{\"value\":%s},", ZONE_TEMP_KEYS[i], num_buf);
  }

  // --- zone valve positions (0 decimals) ---
  static const char *const ZONE_VALVE_KEYS[6] = {
    "sensor-zone_1_valve_pct", "sensor-zone_2_valve_pct", "sensor-zone_3_valve_pct",
    "sensor-zone_4_valve_pct", "sensor-zone_5_valve_pct", "sensor-zone_6_valve_pct",
  };
  for (uint8_t i = 0; i < 6; i++) {
    format_float_token(num_buf, sizeof(num_buf), snap->zone_valve_pct[i], 0);
    appendf(buf, BUF_SIZE, offset, "\"%s\":{\"value\":%s},", ZONE_VALVE_KEYS[i], num_buf);
  }

  // --- preheat advance ---
  static const char *const PREHEAT_KEYS[6] = {
    "sensor-zone_1_preheat_advance_c", "sensor-zone_2_preheat_advance_c", "sensor-zone_3_preheat_advance_c",
    "sensor-zone_4_preheat_advance_c", "sensor-zone_5_preheat_advance_c", "sensor-zone_6_preheat_advance_c",
  };
  for (uint8_t i = 0; i < 6; i++) {
    format_float_token(num_buf, sizeof(num_buf), snap->zone_preheat_c[i]);
    appendf(buf, BUF_SIZE, offset, "\"%s\":{\"value\":%s},", PREHEAT_KEYS[i], num_buf);
  }

  // flush: cumulative ~1330 bytes; motor ripples (~840) would overflow
  if (!flush()) return;

  // --- motor learned ripples (0 decimals) ---
  static const char *const OPEN_RIPPLE_KEYS[6] = {
    "sensor-motor_1_learned_open_ripples", "sensor-motor_2_learned_open_ripples", "sensor-motor_3_learned_open_ripples",
    "sensor-motor_4_learned_open_ripples", "sensor-motor_5_learned_open_ripples", "sensor-motor_6_learned_open_ripples",
  };
  static const char *const CLOSE_RIPPLE_KEYS[6] = {
    "sensor-motor_1_learned_close_ripples", "sensor-motor_2_learned_close_ripples", "sensor-motor_3_learned_close_ripples",
    "sensor-motor_4_learned_close_ripples", "sensor-motor_5_learned_close_ripples", "sensor-motor_6_learned_close_ripples",
  };
  for (uint8_t i = 0; i < 6; i++) {
    format_float_token(num_buf, sizeof(num_buf), snap->motor_open_ripple[i], 0);
    appendf(buf, BUF_SIZE, offset, "\"%s\":{\"value\":%s},", OPEN_RIPPLE_KEYS[i], num_buf);
    format_float_token(num_buf, sizeof(num_buf), snap->motor_close_ripple[i], 0);
    appendf(buf, BUF_SIZE, offset, "\"%s\":{\"value\":%s},", CLOSE_RIPPLE_KEYS[i], num_buf);
  }

  // flush: motor factors (~900) would overflow
  if (!flush()) return;

  // --- motor learned factors (2 decimals) ---
  static const char *const OPEN_FACTOR_KEYS[6] = {
    "sensor-motor_1_learned_open_factor", "sensor-motor_2_learned_open_factor", "sensor-motor_3_learned_open_factor",
    "sensor-motor_4_learned_open_factor", "sensor-motor_5_learned_open_factor", "sensor-motor_6_learned_open_factor",
  };
  static const char *const CLOSE_FACTOR_KEYS[6] = {
    "sensor-motor_1_learned_close_factor", "sensor-motor_2_learned_close_factor", "sensor-motor_3_learned_close_factor",
    "sensor-motor_4_learned_close_factor", "sensor-motor_5_learned_close_factor", "sensor-motor_6_learned_close_factor",
  };
  for (uint8_t i = 0; i < 6; i++) {
    format_float_token(num_buf, sizeof(num_buf), snap->motor_open_factor[i], 2);
    appendf(buf, BUF_SIZE, offset, "\"%s\":{\"value\":%s},", OPEN_FACTOR_KEYS[i], num_buf);
    format_float_token(num_buf, sizeof(num_buf), snap->motor_close_factor[i], 2);
    appendf(buf, BUF_SIZE, offset, "\"%s\":{\"value\":%s},", CLOSE_FACTOR_KEYS[i], num_buf);
  }

  // flush: probe temps + text sensors would overflow combined
  if (!flush()) return;

  // --- probe temperatures ---
  static const char *const PROBE_TEMP_KEYS[8] = {
    "sensor-probe_1_temperature", "sensor-probe_2_temperature", "sensor-probe_3_temperature",
    "sensor-probe_4_temperature", "sensor-probe_5_temperature", "sensor-probe_6_temperature",
    "sensor-probe_7_temperature", "sensor-probe_8_temperature",
  };
  for (uint8_t i = 0; i < 8; i++) {
    format_float_token(num_buf, sizeof(num_buf), snap->probe_temp_c[i]);
    appendf(buf, BUF_SIZE, offset, "\"%s\":{\"value\":%s},", PROBE_TEMP_KEYS[i], num_buf);
  }

  // flush: text sensors (~1200) would overflow combined with probe temps (~460)
  if (!flush()) return;

  // --- text sensors (pre-sanitized in snapshot) ---
  static const char *const ZONE_STATE_KEYS[6] = {
    "text_sensor-zone_1_state", "text_sensor-zone_2_state", "text_sensor-zone_3_state",
    "text_sensor-zone_4_state", "text_sensor-zone_5_state", "text_sensor-zone_6_state",
  };
  static const char *const MOTOR_FAULT_KEYS[6] = {
    "text_sensor-motor_1_last_fault", "text_sensor-motor_2_last_fault", "text_sensor-motor_3_last_fault",
    "text_sensor-motor_4_last_fault", "text_sensor-motor_5_last_fault", "text_sensor-motor_6_last_fault",
  };

  appendf(buf, BUF_SIZE, offset, "\"text_sensor-firmware_version\":{\"state\":\"%s\"},", snap->firmware_version);
  appendf(buf, BUF_SIZE, offset, "\"text_sensor-ip_address\":{\"state\":\"%s\"},", snap->ip_address);
  appendf(buf, BUF_SIZE, offset, "\"text_sensor-connected_ssid\":{\"state\":\"%s\"},", snap->connected_ssid);
  appendf(buf, BUF_SIZE, offset, "\"text_sensor-mac_address\":{\"state\":\"%s\"},", snap->mac_address);
  appendf(buf, BUF_SIZE, offset, "\"text-device_variant\":{\"state\":\"%s\"},", dashboard_variant_str());

  for (uint8_t i = 0; i < 6; i++) {
    appendf(buf, BUF_SIZE, offset, "\"%s\":{\"state\":\"%s\"},", ZONE_STATE_KEYS[i], snap->zone_state[i]);
  }
  for (uint8_t i = 0; i < 6; i++) {
    appendf(buf, BUF_SIZE, offset, "\"%s\":{\"state\":\"%s\"},", MOTOR_FAULT_KEYS[i], snap->motor_fault[i]);
  }

  // flush before config section; each zone config (~550 bytes) would overflow combined
  if (!flush()) return;

  // ---- config (read entirely from snapshot — no config_store_ calls) ----
  static const char *const PIPE_TYPE_STR[] = {
    "PEX 12mm", "PEX 14mm", "PEX 16mm", "PEX 17mm",
    "PEX 18mm", "PEX 20mm", "ALUPEX 16mm", "ALUPEX 20mm"
  };
  static const char *const MOTOR_PROFILE_STR[] = {
    "Inherit", "Generic", "HmIP VdMot"
  };

  // --- zone configs: flush after each to stay within buffer ---
  for (uint8_t i = 0; i < hv6::NUM_ZONES; i++) {
    const hv6::ZoneConfig &z = snap->zones[i];
    const uint8_t zn = i + 1;

    appendf(buf, BUF_SIZE, offset,
        "\"switch-zone_%u_enabled\":{\"state\":\"%s\"},"
        "\"number-zone_%u_setpoint\":{\"value\":",
        zn, z.enabled ? "on" : "off", zn);
    format_float_token(num_buf, sizeof(num_buf), z.setpoint_c, 1);
    appendf(buf, BUF_SIZE, offset, "%s},", num_buf);

    format_float_token(num_buf, sizeof(num_buf), z.area_m2, 1);
    appendf(buf, BUF_SIZE, offset, "\"number-zone_%u_area_m2\":{\"value\":%s},", zn, num_buf);

    format_float_token(num_buf, sizeof(num_buf), z.pipe_spacing_mm, 0);
    appendf(buf, BUF_SIZE, offset, "\"number-zone_%u_pipe_spacing_mm\":{\"value\":%s},", zn, num_buf);

    const int8_t probe_idx = snap->probes.zone_return_probe[i];
    if (probe_idx >= 0 && probe_idx < static_cast<int8_t>(hv6::MAX_PROBES)) {
      appendf(buf, BUF_SIZE, offset,
          "\"select-zone_%u_probe\":{\"state\":\"Probe %d\"},",
          zn, static_cast<int>(probe_idx) + 1);
    } else {
      appendf(buf, BUF_SIZE, offset, "\"select-zone_%u_probe\":{\"state\":\"None\"},", zn);
    }

    const char *src_str = temp_source_to_dashboard_str(snap->zone_temp_source[i]);
    appendf(buf, BUF_SIZE, offset,
        "\"select-zone_%u_temp_source\":{\"state\":\"%s\"},", zn, src_str);

    if (z.sync_to_zone >= 0 && z.sync_to_zone < static_cast<int8_t>(hv6::NUM_ZONES)) {
      appendf(buf, BUF_SIZE, offset,
          "\"select-zone_%u_sync_to\":{\"state\":\"Zone %d\"},",
          zn, static_cast<int>(z.sync_to_zone) + 1);
    } else {
      appendf(buf, BUF_SIZE, offset, "\"select-zone_%u_sync_to\":{\"state\":\"None\"},", zn);
    }

    const uint8_t pt_idx = static_cast<uint8_t>(z.pipe_type);
    const char *pt_str = (pt_idx < 8) ? PIPE_TYPE_STR[pt_idx] : "Unknown";
    appendf(buf, BUF_SIZE, offset, "\"select-zone_%u_pipe_type\":{\"state\":\"%s\"},", zn, pt_str);

    appendf(buf, BUF_SIZE, offset,
        "\"text-zone_%u_ble_mac\":{\"state\":\"%s\"},", zn, snap->zone_ble_mac[i]);

    // Friendly zone name — JSON-escape quotes/backslashes/control chars.
    char name_esc[2 * sizeof(z.name)];
    size_t nesc = 0;
    for (size_t j = 0; z.name[j] != '\0' && nesc < sizeof(name_esc) - 2; j++) {
      char c = z.name[j];
      if (c == '"' || c == '\\') name_esc[nesc++] = '\\';
      name_esc[nesc++] = (c >= 0x20) ? c : ' ';
    }
    name_esc[nesc] = '\0';
    appendf(buf, BUF_SIZE, offset,
        "\"text-zone_%u_name\":{\"state\":\"%s\"},", zn, name_esc);

    const uint8_t walls = z.exterior_walls;
    if (walls == hv6::ExteriorWall::NONE) {
      appendf(buf, BUF_SIZE, offset,
          "\"text-zone_%u_exterior_walls\":{\"state\":\"None\"},", zn);
    } else {
      char wall_buf[12] = {};
      size_t woff = 0;
      if (walls & hv6::ExteriorWall::NORTH) { if (woff) wall_buf[woff++] = ','; wall_buf[woff++] = 'N'; }
      if (walls & hv6::ExteriorWall::SOUTH) { if (woff) wall_buf[woff++] = ','; wall_buf[woff++] = 'S'; }
      if (walls & hv6::ExteriorWall::EAST)  { if (woff) wall_buf[woff++] = ','; wall_buf[woff++] = 'E'; }
      if (walls & hv6::ExteriorWall::WEST)  { if (woff) wall_buf[woff++] = ','; wall_buf[woff++] = 'W'; }
      wall_buf[woff] = '\0';
      appendf(buf, BUF_SIZE, offset,
          "\"text-zone_%u_exterior_walls\":{\"state\":\"%s\"},", zn, wall_buf);
    }

    // flush after each zone to stay within buffer
    if (!flush()) return;
  }

  // --- global config ---
  appendf(buf, BUF_SIZE, offset,
      "\"switch-motor_drivers_enabled\":{\"state\":\"%s\"},",
      snap->drivers_enabled ? "on" : "off");

  appendf(buf, BUF_SIZE, offset,
      "\"switch-simple_preheat_enabled\":{\"state\":\"%s\"},",
      snap->simple_preheat_enabled ? "on" : "off");

  format_float_token(num_buf, sizeof(num_buf), snap->preheat_absorb_band_c, 1);
  appendf(buf, BUF_SIZE, offset,
      "\"switch-preheat_absorb_enabled\":{\"state\":\"%s\"},"
      "\"text-preheat_absorbing\":{\"state\":\"%s\"},"
      "\"number-preheat_absorb_band_c\":{\"value\":%s},",
      snap->preheat_absorb_enabled ? "on" : "off",
      snap->preheat_absorbing ? "active" : "idle",
      num_buf);
  format_float_token(num_buf, sizeof(num_buf), snap->preheat_detect_delta_c, 1);
  appendf(buf, BUF_SIZE, offset, "\"number-preheat_detect_delta_c\":{\"value\":%s},", num_buf);

  appendf(buf, BUF_SIZE, offset,
      "\"select-manifold_type\":{\"state\":\"%s\"},"
      "\"select-manifold_flow_probe\":{\"state\":\"Probe %d\"},"
      "\"select-manifold_return_probe\":{\"state\":\"Probe %d\"},",
      snap->manifold_type == hv6::ManifoldType::NC ? "NC (Normally Closed)" : "NO (Normally Open)",
      static_cast<int>(snap->probes.manifold_flow_probe) + 1,
      static_cast<int>(snap->probes.manifold_return_probe) + 1);

  const uint8_t mp_idx = static_cast<uint8_t>(snap->motor.default_profile);
  const char *mp_str = (mp_idx < 3) ? MOTOR_PROFILE_STR[mp_idx] : "Generic";
  appendf(buf, BUF_SIZE, offset, "\"select-motor_profile_default\":{\"state\":\"%s\"},", mp_str);

  format_float_token(num_buf, sizeof(num_buf), snap->motor.close_current_factor, 2);
  appendf(buf, BUF_SIZE, offset, "\"number-close_threshold_multiplier\":{\"value\":%s},", num_buf);
  format_float_token(num_buf, sizeof(num_buf), snap->motor.close_slope_threshold_ma_per_s, 2);
  appendf(buf, BUF_SIZE, offset, "\"number-close_slope_threshold\":{\"value\":%s},", num_buf);
  format_float_token(num_buf, sizeof(num_buf), snap->motor.close_slope_current_factor, 2);
  appendf(buf, BUF_SIZE, offset, "\"number-close_slope_current_factor\":{\"value\":%s},", num_buf);
  format_float_token(num_buf, sizeof(num_buf), snap->motor.open_current_factor, 2);
  appendf(buf, BUF_SIZE, offset, "\"number-open_threshold_multiplier\":{\"value\":%s},", num_buf);
  format_float_token(num_buf, sizeof(num_buf), snap->motor.open_slope_threshold_ma_per_s, 2);
  appendf(buf, BUF_SIZE, offset, "\"number-open_slope_threshold\":{\"value\":%s},", num_buf);
  format_float_token(num_buf, sizeof(num_buf), snap->motor.open_slope_current_factor, 2);
  appendf(buf, BUF_SIZE, offset, "\"number-open_slope_current_factor\":{\"value\":%s},", num_buf);
  format_float_token(num_buf, sizeof(num_buf), snap->motor.open_ripple_limit_factor, 2);
  appendf(buf, BUF_SIZE, offset, "\"number-open_ripple_limit_factor\":{\"value\":%s},", num_buf);
  appendf(buf, BUF_SIZE, offset,
      "\"number-generic_runtime_limit_seconds\":{\"value\":%lu},"
      "\"number-hmip_runtime_limit_seconds\":{\"value\":%lu},"
      "\"number-relearn_after_movements\":{\"value\":%lu},"
      "\"number-relearn_after_hours\":{\"value\":%lu},"
      "\"number-learned_factor_min_samples\":{\"value\":%u},",
      static_cast<unsigned long>(snap->motor.generic_profile_runtime_limit_s),
      static_cast<unsigned long>(snap->motor.hmip_vdmot_runtime_limit_s),
      static_cast<unsigned long>(snap->motor.relearn_after_movements),
      static_cast<unsigned long>(snap->motor.relearn_after_hours),
      static_cast<unsigned>(snap->motor.learned_factor_min_samples));
  format_float_token(num_buf, sizeof(num_buf), snap->motor.learned_factor_max_deviation_pct * 100.0f, 2);
  appendf(buf, BUF_SIZE, offset,
      "\"number-learned_factor_max_deviation_pct\":{\"value\":%s},", num_buf);

  // flush before asgard section
  if (!flush()) return;

  // --- asgard config + status ---
  appendf(buf, BUF_SIZE, offset,
      "\"switch-asgard_enabled\":{\"state\":\"%s\"},"
      "\"switch-asgard_coordinator\":{\"state\":\"%s\"},"
      "\"text-asgard_host\":{\"state\":\"%s\"},"
      "\"text-asgard_entity_name\":{\"state\":\"%s\"},"
      "\"text-asgard_peer_host\":{\"state\":\"%s\"},",
      snap->asgard.enabled ? "on" : "off",
      snap->asgard.coordinator ? "on" : "off",
      snap->asgard.host,
      snap->asgard.entity_name,
      snap->asgard.peer_host);
  appendf(buf, BUF_SIZE, offset,
      "\"number-asgard_port\":{\"value\":%u},"
      "\"number-asgard_peer_port\":{\"value\":%u},"
      "\"number-asgard_push_interval_s\":{\"value\":%u},"
      "\"number-asgard_peer_stale_after_s\":{\"value\":%u},",
      static_cast<unsigned>(snap->asgard.port),
      static_cast<unsigned>(snap->asgard.peer_port),
      static_cast<unsigned>(snap->asgard.push_interval_s),
      static_cast<unsigned>(snap->asgard.peer_stale_after_s));
  format_float_token(num_buf, sizeof(num_buf), snap->min_zone_flow_pct, 1);
  appendf(buf, BUF_SIZE, offset,
      "\"switch-minimum_flow_always\":{\"state\":\"%s\"},"
      "\"number-min_zone_flow_pct\":{\"value\":%s},",
      snap->minimum_flow_always ? "on" : "off",
      num_buf);
  format_float_token(num_buf, sizeof(num_buf), snap->asgard_last_push_c, 2);
  char sp_buf[16];
  format_float_token(sp_buf, sizeof(sp_buf), snap->asgard_setpoint_c, 1);
  appendf(buf, BUF_SIZE, offset,
      "\"text-asgard_role\":{\"state\":\"%s\"},"
      "\"text-asgard_peer_status\":{\"state\":\"%s\"},"
      "\"text-asgard_last_error\":{\"state\":\"%s\"},"
      "\"sensor-asgard_last_push_c\":{\"value\":%s},"
      "\"sensor-asgard_setpoint_c\":{\"value\":%s},"
      "\"sensor-asgard_last_push_age_s\":{\"state\":%lu},"
      "\"sensor-asgard_push_fail_streak\":{\"state\":%lu},"
      "\"sensor-asgard_local_zones\":{\"state\":%u},"
      "\"sensor-asgard_peer_zones\":{\"state\":%u},",
      snap->asgard_role,
      snap->asgard_peer_status,
      snap->asgard_last_error,
      num_buf,
      sp_buf,
      static_cast<unsigned long>(snap->asgard_last_push_age_s),
      static_cast<unsigned long>(snap->asgard_push_fail_streak),
      static_cast<unsigned>(snap->asgard_local_zones),
      static_cast<unsigned>(snap->asgard_peer_zones));

  // flush before forecast section
  if (!flush()) return;

  // --- forecast config + status ---
  appendf(buf, BUF_SIZE, offset,
      "\"switch-forecast_enabled\":{\"state\":\"%s\"},"
      "\"text-forecast_status\":{\"state\":\"%s\"},"
      "\"text-forecast_last_error\":{\"state\":\"%s\"},"
      "\"sensor-forecast_age_s\":{\"state\":%lu},"
      "\"sensor-forecast_fetch_epoch\":{\"state\":%lu},"
      "\"sensor-forecast_fail_streak\":{\"state\":%lu},",
      snap->forecast.enabled ? "on" : "off",
      snap->forecast_status,
      snap->forecast_last_error,
      static_cast<unsigned long>(snap->forecast_age_s),
      static_cast<unsigned long>(snap->forecast_fetch_epoch),
      static_cast<unsigned long>(snap->forecast_fail_streak));
  format_float_token(num_buf, sizeof(num_buf), snap->forecast.latitude, 4);
  appendf(buf, BUF_SIZE, offset, "\"number-forecast_latitude\":{\"value\":%s},", num_buf);
  format_float_token(num_buf, sizeof(num_buf), snap->forecast.longitude, 4);
  appendf(buf, BUF_SIZE, offset, "\"number-forecast_longitude\":{\"value\":%s},", num_buf);
  format_float_token(num_buf, sizeof(num_buf), snap->forecast.load_threshold, 2);
  appendf(buf, BUF_SIZE, offset, "\"number-forecast_load_threshold\":{\"value\":%s},", num_buf);
  format_float_token(num_buf, sizeof(num_buf), snap->forecast.max_offset_c, 2);
  appendf(buf, BUF_SIZE, offset, "\"number-forecast_max_offset_c\":{\"value\":%s},", num_buf);

  if (!flush()) return;

  // Per-zone active preload offset + hours-to-peak (read-only status).
  for (uint8_t i = 0; i < hv6::NUM_ZONES; i++) {
    const uint8_t zn = i + 1;
    format_float_token(num_buf, sizeof(num_buf), snap->forecast_zone_offset_c[i], 2);
    appendf(buf, BUF_SIZE, offset,
        "\"sensor-zone_%u_forecast_offset_c\":{\"value\":%s},"
        "\"sensor-zone_%u_forecast_peak_h\":{\"state\":%d},",
        zn, num_buf, zn, static_cast<int>(snap->forecast_zone_peak_in_h[i]));
  }
  if (!flush()) return;

  // Per-zone exposure config
  for (uint8_t i = 0; i < hv6::NUM_ZONES; i++) {
    const uint8_t zn = i + 1;
    const hv6::ZoneConfig &z = snap->zones[i];
    format_float_token(num_buf, sizeof(num_buf), z.wind_exposure, 2);
    appendf(buf, BUF_SIZE, offset, "\"number-zone_%u_wind_exposure\":{\"value\":%s},", zn, num_buf);
    format_float_token(num_buf, sizeof(num_buf), z.solar_gain_factor, 2);
    appendf(buf, BUF_SIZE, offset, "\"number-zone_%u_solar_gain\":{\"value\":%s},", zn, num_buf);
    appendf(buf, BUF_SIZE, offset,
        "\"number-zone_%u_thermal_lead_h\":{\"value\":%u},", zn, static_cast<unsigned>(z.thermal_lead_h));
    if (!flush()) return;
  }

  // --- hydraulic balancing: mode + adaptive knobs (global) ---
  {
    const hv6::BalanceMode bmode = hv6::effective_balance_mode(snap->balancing);
    const char *mode_str = (bmode == hv6::BalanceMode::ADAPTIVE)    ? "Adaptive"
                         : (bmode == hv6::BalanceMode::RETURN_TEMP) ? "Return Temp"
                                                                    : "Static";
    appendf(buf, BUF_SIZE, offset,
        "\"select-balance_mode\":{\"state\":\"%s\"},"
        "\"number-adapt_interval_s\":{\"value\":%lu},",
        mode_str, static_cast<unsigned long>(snap->balancing.adapt_interval_s));
    format_float_token(num_buf, sizeof(num_buf), snap->balancing.adapt_step, 3);
    appendf(buf, BUF_SIZE, offset, "\"number-adapt_step\":{\"value\":%s},", num_buf);
    format_float_token(num_buf, sizeof(num_buf), snap->balancing.adapt_min, 2);
    appendf(buf, BUF_SIZE, offset, "\"number-adapt_min\":{\"value\":%s},", num_buf);
    format_float_token(num_buf, sizeof(num_buf), snap->balancing.adapt_max, 2);
    appendf(buf, BUF_SIZE, offset, "\"number-adapt_max\":{\"value\":%s},", num_buf);
    if (!flush()) return;
  }

  // --- per-zone balancing telemetry (read-only): static × adapt = effective ---
  for (uint8_t i = 0; i < hv6::NUM_ZONES; i++) {
    const uint8_t zn = i + 1;
    format_float_token(num_buf, sizeof(num_buf), snap->zone_static_factor[i], 3);
    appendf(buf, BUF_SIZE, offset, "\"sensor-zone_%u_static_factor\":{\"value\":%s},", zn, num_buf);
    format_float_token(num_buf, sizeof(num_buf), snap->zone_balance_factor[i], 3);
    appendf(buf, BUF_SIZE, offset, "\"sensor-zone_%u_balance_factor\":{\"value\":%s},", zn, num_buf);
    format_float_token(num_buf, sizeof(num_buf), snap->zone_balance_adapt[i], 3);
    appendf(buf, BUF_SIZE, offset, "\"sensor-zone_%u_balance_adapt\":{\"value\":%s},", zn, num_buf);
    format_float_token(num_buf, sizeof(num_buf), snap->zone_adapt_err[i], 2);
    appendf(buf, BUF_SIZE, offset, "\"sensor-zone_%u_adapt_err\":{\"value\":%s},", zn, num_buf);
    if (!flush()) return;
  }

  // Sentinel field closes the JSON object and absorbs any trailing comma.
  appendf(buf, BUF_SIZE, offset, "\"_\":{}}");
  flush();
  httpd_resp_send_chunk(req, nullptr, 0);
}

// =============================================================================
// /api/hv6/v1 — request routing (contract: docs/hv6_api_v1.md)
// =============================================================================

namespace {

/// Matches "<prefix>/{zone}/<action>". Returns the zone (1..NUM_ZONES),
/// 0 if the route shape matched but the zone is out of range, or -1 if the
/// path does not match this route at all.
int match_zone_route(const char *path, const char *prefix, const char *action) {
  const size_t plen = strlen(prefix);
  if (strncmp(path, prefix, plen) != 0 || path[plen] != '/')
    return -1;
  char *end = nullptr;
  const long zone = strtol(path + plen + 1, &end, 10);
  if (end == path + plen + 1 || *end != '/' || strcmp(end + 1, action) != 0)
    return -1;
  if (zone < 1 || zone > static_cast<long>(hv6::NUM_ZONES))
    return 0;
  return static_cast<int>(zone);
}

bool parse_num_arg(AsyncWebServerRequest *request, const char *name, float *out) {
  const std::string val = request->arg(name);
  if (val.empty())
    return false;
  char *end = nullptr;
  const float parsed = strtof(val.c_str(), &end);
  if (end == val.c_str() || *end != '\0')
    return false;
  *out = parsed;
  return true;
}

bool parse_bool_arg(AsyncWebServerRequest *request, const char *name, bool *out) {
  const std::string val = request->arg(name);
  if (val.empty())
    return false;
  *out = strcasecmp(val.c_str(), "true") == 0 || val == "1" || strcasecmp(val.c_str(), "on") == 0;
  return true;
}

void apply_zone(DashboardAction &act, int zone) {
  act.zone = zone;
  act.zone_valid = zone >= 1 && zone <= static_cast<int>(hv6::NUM_ZONES);
  act.zi = act.zone_valid ? static_cast<uint8_t>(zone - 1) : 0;
}

}  // namespace

void HV6Dashboard::send_v1_(AsyncWebServerRequest *request, int code, const char *err_code,
                            const char *err_message) {
  char buf[224];
  const long long ts_ms = static_cast<long long>(::time(nullptr)) * 1000LL;
  if (err_code == nullptr) {
    snprintf(buf, sizeof(buf), "{\"ok\":true,\"version\":\"v1\",\"ts_ms\":%lld}", ts_ms);
  } else {
    snprintf(buf, sizeof(buf),
             "{\"ok\":false,\"version\":\"v1\",\"ts_ms\":%lld,\"error\":{\"code\":\"%s\",\"message\":\"%s\"}}",
             ts_ms, err_code, err_message != nullptr ? err_message : "");
  }
  request->send(code, "application/json", buf);
}

bool HV6Dashboard::enqueue_action_(const DashboardAction &act) {
  if (action_lock_ == nullptr || xSemaphoreTake(action_lock_, pdMS_TO_TICKS(100)) != pdTRUE)
    return false;
  action_queue_.push_back(act);
  xSemaphoreGive(action_lock_);
  return true;
}

void HV6Dashboard::handle_v1_(AsyncWebServerRequest *request, const char *path) {
  // ---- read endpoints ----
  if (strcmp(path, "/state") == 0) {
    this->handle_state_(request);
    return;
  }
  if (strcmp(path, "/history") == 0) {
    this->handle_history_(request);
    return;
  }
  if (strcmp(path, "/logs") == 0) {
    this->handle_logs_(request);
    return;
  }
  if (strcmp(path, "/forecast") == 0) {
    this->handle_forecast_(request);
    return;
  }
  if (strcmp(path, "/ble-scan") == 0) {
    this->handle_ble_scan_(request);
    return;
  }
  if (strcmp(path, "/peer") == 0) {
    this->handle_peer_(request);
    return;
  }

  // ---- write endpoints ----
  if (request->method() != HTTP_POST) {
    this->send_v1_(request, 405, "method_not_allowed", "Use POST for write endpoints");
    return;
  }

  DashboardAction act{};
  float num = 0.0f;
  bool flag = false;
  int zone;

  if ((zone = match_zone_route(path, "/zones", "setpoint")) != -1) {
    if (zone == 0) {
      this->send_v1_(request, 400, "invalid_zone", "Zone must be in range 1..6");
      return;
    }
    if (!parse_num_arg(request, "setpoint_c", &num)) {
      this->send_v1_(request, 400, "missing_param", "setpoint_c is required");
      return;
    }
    act.key = "zone_setpoint";
    act.num_val = num;
    act.has_num = true;
    apply_zone(act, zone);

  } else if ((zone = match_zone_route(path, "/zones", "enabled")) != -1) {
    if (zone == 0) {
      this->send_v1_(request, 400, "invalid_zone", "Zone must be in range 1..6");
      return;
    }
    if (!parse_bool_arg(request, "enabled", &flag)) {
      this->send_v1_(request, 400, "missing_param", "enabled is required");
      return;
    }
    act.key = "zone_enabled";
    act.num_val = flag ? 1.0f : 0.0f;
    act.has_num = true;
    apply_zone(act, zone);

  } else if (strcmp(path, "/drivers/enabled") == 0 || strcmp(path, "/manual_mode") == 0) {
    if (!parse_bool_arg(request, "enabled", &flag)) {
      this->send_v1_(request, 400, "missing_param", "enabled is required");
      return;
    }
    act.key = (path[1] == 'd') ? "drivers_enabled" : "manual_mode";
    act.num_val = flag ? 1.0f : 0.0f;
    act.has_num = true;

  } else if ((zone = match_zone_route(path, "/motors", "target")) != -1) {
    if (zone == 0) {
      this->send_v1_(request, 400, "invalid_zone", "Zone must be in range 1..6");
      return;
    }
    if (!parse_num_arg(request, "value", &num)) {
      this->send_v1_(request, 400, "missing_param", "value is required");
      return;
    }
    act.key = "motor_target";
    act.num_val = num;
    act.has_num = true;
    apply_zone(act, zone);

  } else if ((zone = match_zone_route(path, "/motors", "open_timed")) != -1 ||
             (zone = match_zone_route(path, "/motors", "close_timed")) != -1 ||
             (zone = match_zone_route(path, "/motors", "stop")) != -1) {
    if (zone == 0) {
      this->send_v1_(request, 400, "invalid_zone", "Zone must be in range 1..6");
      return;
    }
    act.key = "command";
    if (match_zone_route(path, "/motors", "open_timed") > 0)
      act.value_str = "open_motor_timed";
    else if (match_zone_route(path, "/motors", "close_timed") > 0)
      act.value_str = "close_motor_timed";
    else
      act.value_str = "stop_motor";
    act.has_str = true;
    apply_zone(act, zone);

  } else if (strcmp(path, "/commands") == 0) {
    const std::string cmd = request->arg("command");
    if (cmd.empty()) {
      this->send_v1_(request, 400, "missing_param", "command is required");
      return;
    }
    act.key = "command";
    act.value_str = cmd;
    act.has_str = true;
    if (!parse_num_arg(request, "zone", &num))
      num = 0.0f;
    apply_zone(act, static_cast<int>(num));

  } else if (strncmp(path, "/settings/", 10) == 0) {
    const char *kind = path + 10;
    const bool is_number = strcmp(kind, "number") == 0;
    if (!is_number && strcmp(kind, "select") != 0 && strcmp(kind, "text") != 0) {
      this->send_v1_(request, 404, "unknown_route", "Unknown settings type");
      return;
    }
    act.key = request->arg("key");
    if (act.key.empty()) {
      this->send_v1_(request, 400, "missing_param", "key is required");
      return;
    }
    act.value_str = request->arg("value");
    act.has_str = !act.value_str.empty();
    if (is_number) {
      // Reject mixed/locale decimal separators before parsing. strtof() is "C"-locale
      // and stops at a comma, so "55,7" or "12.345,6" would otherwise be silently
      // truncated (e.g. "55,7" → 55.0) — a wrong forecast coordinate. Require '.' only.
      if (act.value_str.find(',') != std::string::npos) {
        this->send_v1_(request, 400, "invalid_value",
                       "use '.' as the decimal separator (no ',')");
        return;
      }
      if (!parse_num_arg(request, "value", &num) || !std::isfinite(num)) {
        this->send_v1_(request, 400, "invalid_value", "value must be a finite number");
        return;
      }
      // Geographic range guard for the forecast location, so a bad coordinate can't be
      // stored or sent to Open-Meteo.
      if (act.key == "forecast_latitude" && (num < -90.0f || num > 90.0f)) {
        this->send_v1_(request, 400, "invalid_value", "latitude must be between -90 and 90");
        return;
      }
      if (act.key == "forecast_longitude" && (num < -180.0f || num > 180.0f)) {
        this->send_v1_(request, 400, "invalid_value", "longitude must be between -180 and 180");
        return;
      }
      act.num_val = num;
      act.has_num = true;
    }
    if (!parse_num_arg(request, "zone", &num))
      num = 0.0f;
    apply_zone(act, static_cast<int>(num));

  } else {
    this->send_v1_(request, 404, "unknown_route", "Unknown route");
    return;
  }

  if (!this->enqueue_action_(act)) {
    this->send_v1_(request, 503, "busy", "System busy, try again");
    return;
  }
  this->send_v1_(request, 200);
}

void HV6Dashboard::dispatch_set_(const DashboardAction &act) {
  const char *key = act.key.c_str();
  char str_val[64] = {};
  strncpy(str_val, act.value_str.c_str(), sizeof(str_val) - 1);
  const float num_val = act.num_val;
  const bool has_num = act.has_num;
  const bool has_str = act.has_str;
  const bool zone_valid = act.zone_valid;
  const uint8_t zi = act.zi;

  // ---- zone_setpoint ----
  if (strcmp(key, "zone_setpoint") == 0) {
    if (zone_valid && has_num && this->zone_controller_)
      this->zone_controller_->set_zone_setpoint(zi, num_val);

  // ---- zone_enabled ----
  } else if (strcmp(key, "zone_enabled") == 0) {
    if (zone_valid && has_num && this->zone_controller_)
      this->zone_controller_->set_zone_enabled(zi, num_val != 0.0f);

  // ---- drivers_enabled ----
  } else if (strcmp(key, "drivers_enabled") == 0) {
    if (has_num && this->valve_controller_)
      this->valve_controller_->set_drivers_enabled(num_val != 0.0f);

  // ---- manual_mode ----
  } else if (strcmp(key, "manual_mode") == 0) {
    if (has_num && this->zone_controller_)
      this->zone_controller_->set_manual_mode(num_val != 0.0f);

  // ---- motor_target ----
  } else if (strcmp(key, "motor_target") == 0) {
    if (zone_valid && has_num && this->valve_controller_) {
      const float clamped = std::max(0.0f, std::min(100.0f, num_val));
      this->valve_controller_->request_position(zi, clamped);
    }

  // ---- command ----
  } else if (strcmp(key, "command") == 0 && has_str) {
    if (strcmp(str_val, "i2c_scan") == 0) {
      if (this->valve_controller_) this->valve_controller_->log_i2c_scan();
    } else if (strcmp(str_val, "open_motor_timed") == 0 && zone_valid && this->valve_controller_) {
      this->valve_controller_->request_timed_open(zi, 10000, true);
    } else if (strcmp(str_val, "close_motor_timed") == 0 && zone_valid && this->valve_controller_) {
      this->valve_controller_->request_timed_close(zi, 10000, true);
    } else if (strcmp(str_val, "stop_motor") == 0 && zone_valid && this->valve_controller_) {
      this->valve_controller_->request_stop(zi);
    } else if (strcmp(str_val, "motor_reset_fault") == 0 && zone_valid && this->valve_controller_) {
      this->valve_controller_->reset_fault(zi);
    } else if (strcmp(str_val, "motor_reset_learned_factors") == 0 && zone_valid && this->valve_controller_) {
      this->valve_controller_->reset_learned_factors(zi);
    } else if (strcmp(str_val, "motor_reset_and_relearn") == 0 && zone_valid && this->valve_controller_) {
      this->valve_controller_->reset_and_relearn(zi);
    } else if (strcmp(str_val, "reset_balancing") == 0 && this->zone_controller_) {
      this->zone_controller_->reset_balancing();
    } else if (strcmp(str_val, "dump_task_stats") == 0) {
      this->dump_task_stats_();
    } else if (strcmp(str_val, "restart") == 0) {
      ESP_LOGW(TAG, "Restarting device on dashboard request");
      esp_restart();
#ifdef USE_HV6_FORECAST
    } else if (strcmp(str_val, "trigger_forecast_fetch") == 0 && this->forecast_) {
      static_cast<hv6_forecast::Hv6Forecast *>(this->forecast_)->trigger_fetch();
#endif
    }
    // Unknown commands are silently accepted

  // ---- zone_probe ----
  } else if (strcmp(key, "zone_probe") == 0 && has_str && zone_valid && this->zone_controller_) {
    int8_t probe = hv6::PROBE_UNASSIGNED;
    parse_probe_option(str_val, &probe);
    this->zone_controller_->set_zone_probe(zi, probe);

  // ---- zone_temp_source ----
  } else if (strcmp(key, "zone_temp_source") == 0 && has_str && zone_valid && this->zone_controller_) {
    hv6::TempSource src = hv6::TempSource::LOCAL_PROBE;
    if (parse_temp_source(str_val, &src))
      this->zone_controller_->set_zone_temp_source(zi, src);

  // ---- zone_sync_to ----
  } else if (strcmp(key, "zone_sync_to") == 0 && has_str && zone_valid && this->zone_controller_) {
    int8_t target = -1;
    if (strcasecmp(str_val, "None") != 0) {
      int n = 0;
      if (sscanf(str_val, "Zone %d", &n) == 1 && n >= 1 && n <= 6)
        target = static_cast<int8_t>(n - 1);
    }
    this->zone_controller_->set_zone_sync(zi, target);

  // ---- zone_pipe_type ----
  } else if (strcmp(key, "zone_pipe_type") == 0 && has_str && zone_valid && this->zone_controller_) {
    hv6::PipeType pt;
    if (parse_pipe_type(str_val, &pt))
      this->zone_controller_->set_zone_pipe_type(zi, pt);

  // ---- zone_name (friendly name, persisted device-side in ZoneConfig) ----
  } else if (strcmp(key, "zone_name") == 0 && has_str && zone_valid && this->zone_controller_) {
    this->zone_controller_->set_zone_name(zi, std::string(str_val));

  // ---- zone_ble_mac ----
  } else if (strcmp(key, "zone_ble_mac") == 0 && has_str && zone_valid && this->zone_controller_) {
    this->zone_controller_->set_zone_ble_mac(zi, std::string(str_val));

  // ---- zone_exterior_walls ----
  } else if (strcmp(key, "zone_exterior_walls") == 0 && has_str && zone_valid && this->zone_controller_) {
    this->zone_controller_->set_zone_exterior_walls(zi, parse_exterior_walls(str_val));

  // ---- zone_area_m2 ----
  } else if (strcmp(key, "zone_area_m2") == 0 && has_num && zone_valid && this->zone_controller_) {
    this->zone_controller_->set_zone_area_m2(zi, num_val);

  // ---- zone_pipe_spacing_mm ----
  } else if (strcmp(key, "zone_pipe_spacing_mm") == 0 && has_num && zone_valid && this->zone_controller_) {
    this->zone_controller_->set_zone_pipe_spacing_mm(zi, num_val);

  // ---- manifold_flow_probe ----
  } else if (strcmp(key, "manifold_flow_probe") == 0 && has_str && this->zone_controller_) {
    int8_t probe = hv6::PROBE_UNASSIGNED;
    if (parse_probe_option(str_val, &probe))
      this->zone_controller_->set_manifold_flow_probe(probe);

  // ---- manifold_return_probe ----
  } else if (strcmp(key, "manifold_return_probe") == 0 && has_str && this->zone_controller_) {
    int8_t probe = hv6::PROBE_UNASSIGNED;
    if (parse_probe_option(str_val, &probe))
      this->zone_controller_->set_manifold_return_probe(probe);

  // ---- manifold_type ----
  } else if (strcmp(key, "manifold_type") == 0 && has_str && this->valve_controller_) {
    hv6::ManifoldType mt = hv6::ManifoldType::NC;
    if (strcasecmp(str_val, "NO (Normally Open)") == 0 || strcasecmp(str_val, "NO") == 0)
      mt = hv6::ManifoldType::NO;
    this->valve_controller_->set_manifold_type(mt);

  // ---- preheat_absorb_enabled ----
  } else if (strcmp(key, "preheat_absorb_enabled") == 0 && has_str && this->config_store_) {
    auto ctrl = this->config_store_->get_config().control;
    ctrl.preheat_absorb_enabled = (strcasecmp(str_val, "on") == 0 || strcmp(str_val, "1") == 0);
    this->config_store_->update_control(ctrl);

  // ---- preheat_absorb_band_c ----
  } else if (strcmp(key, "preheat_absorb_band_c") == 0 && has_num && this->config_store_) {
    auto ctrl = this->config_store_->get_config().control;
    ctrl.preheat_absorb_band_c = std::max(0.0f, std::min(5.0f, num_val));
    this->config_store_->update_control(ctrl);

  // ---- preheat_detect_delta_c ----
  } else if (strcmp(key, "preheat_detect_delta_c") == 0 && has_num && this->config_store_) {
    auto ctrl = this->config_store_->get_config().control;
    ctrl.preheat_detect_delta_c = std::max(2.0f, std::min(25.0f, num_val));
    this->config_store_->update_control(ctrl);

  // ---- simple_preheat_enabled ----
  } else if (strcmp(key, "simple_preheat_enabled") == 0 && has_str && this->zone_controller_) {
    const bool en = strcasecmp(str_val, "on") == 0 || strcasecmp(str_val, "true") == 0 || strcmp(str_val, "1") == 0;
    this->zone_controller_->set_simple_preheat_enabled(en);

  // ---- motor_profile_default ----
  } else if (strcmp(key, "motor_profile_default") == 0 && has_str && this->config_store_ && this->valve_controller_) {
    hv6::MotorProfile mp;
    if (parse_motor_profile(str_val, &mp)) {
      auto motor_cfg = this->config_store_->get_motor_config();
      motor_cfg.default_profile = mp;
      this->config_store_->update_motor(motor_cfg);
      this->valve_controller_->reload_motor_config();
    }

  // ---- asgard_enabled ----
  } else if (strcmp(key, "asgard_enabled") == 0 && has_str && this->config_store_) {
    auto asgard_cfg = this->config_store_->get_asgard_config();
    asgard_cfg.enabled = (strcasecmp(str_val, "on") == 0 || strcmp(str_val, "1") == 0);
    this->config_store_->update_asgard(asgard_cfg);

  // ---- asgard_coordinator ----
  } else if (strcmp(key, "asgard_coordinator") == 0 && has_str && this->config_store_) {
    auto asgard_cfg = this->config_store_->get_asgard_config();
    asgard_cfg.coordinator = (strcasecmp(str_val, "on") == 0 || strcmp(str_val, "1") == 0);
    this->config_store_->update_asgard(asgard_cfg);

  // ---- asgard_host ----
  } else if (strcmp(key, "asgard_host") == 0 && this->config_store_) {
    auto asgard_cfg = this->config_store_->get_asgard_config();
    strncpy(asgard_cfg.host, str_val, sizeof(asgard_cfg.host) - 1);
    asgard_cfg.host[sizeof(asgard_cfg.host) - 1] = '\0';
    this->config_store_->update_asgard(asgard_cfg);

  // ---- asgard_entity_name ----
  } else if (strcmp(key, "asgard_entity_name") == 0 && has_str && this->config_store_) {
    auto asgard_cfg = this->config_store_->get_asgard_config();
    strncpy(asgard_cfg.entity_name, str_val, sizeof(asgard_cfg.entity_name) - 1);
    asgard_cfg.entity_name[sizeof(asgard_cfg.entity_name) - 1] = '\0';
    this->config_store_->update_asgard(asgard_cfg);

  // ---- asgard_peer_host ----
  } else if (strcmp(key, "asgard_peer_host") == 0 && this->config_store_) {
    auto asgard_cfg = this->config_store_->get_asgard_config();
    strncpy(asgard_cfg.peer_host, str_val, sizeof(asgard_cfg.peer_host) - 1);
    asgard_cfg.peer_host[sizeof(asgard_cfg.peer_host) - 1] = '\0';
    this->config_store_->update_asgard(asgard_cfg);

  // ---- asgard_port ----
  } else if (strcmp(key, "asgard_port") == 0 && has_num && this->config_store_) {
    auto asgard_cfg = this->config_store_->get_asgard_config();
    asgard_cfg.port = static_cast<uint16_t>(std::max(1.0f, std::min(65535.0f, num_val)));
    this->config_store_->update_asgard(asgard_cfg);

  // ---- asgard_peer_port ----
  } else if (strcmp(key, "asgard_peer_port") == 0 && has_num && this->config_store_) {
    auto asgard_cfg = this->config_store_->get_asgard_config();
    asgard_cfg.peer_port = static_cast<uint16_t>(std::max(1.0f, std::min(65535.0f, num_val)));
    this->config_store_->update_asgard(asgard_cfg);

  // ---- asgard_push_interval_s ----
  } else if (strcmp(key, "asgard_push_interval_s") == 0 && has_num && this->config_store_) {
    auto asgard_cfg = this->config_store_->get_asgard_config();
    asgard_cfg.push_interval_s = static_cast<uint16_t>(std::max(5.0f, std::min(3600.0f, num_val)));
    this->config_store_->update_asgard(asgard_cfg);

  // ---- asgard_peer_stale_after_s ----
  } else if (strcmp(key, "asgard_peer_stale_after_s") == 0 && has_num && this->config_store_) {
    auto asgard_cfg = this->config_store_->get_asgard_config();
    asgard_cfg.peer_stale_after_s = static_cast<uint16_t>(std::max(30.0f, std::min(3600.0f, num_val)));
    this->config_store_->update_asgard(asgard_cfg);

  // ---- min_zone_flow_pct (active with bridge or minimum_flow_always) ----
  } else if (strcmp(key, "min_zone_flow_pct") == 0 && has_num && this->config_store_) {
    auto bal = this->config_store_->get_config().balancing;
    bal.minimum_flow_pct = std::max(0.0f, std::min(50.0f, num_val));
    this->config_store_->update_balancing(bal);

  // ---- minimum_flow_always (modulating source exists independently of Asgard) ----
  } else if (strcmp(key, "minimum_flow_always") == 0 && has_str && this->zone_controller_) {
    const bool enabled = (strcasecmp(str_val, "on") == 0 || strcmp(str_val, "1") == 0);
    this->zone_controller_->set_modulating_heat_source(enabled);

  // ---- balance_mode (Static / Adaptive / Return Temp) ----
  } else if (strcmp(key, "balance_mode") == 0 && has_str && this->zone_controller_) {
    hv6::BalanceMode m = hv6::BalanceMode::STATIC;
    if (strcasecmp(str_val, "Adaptive") == 0)
      m = hv6::BalanceMode::ADAPTIVE;
    else if (strcasecmp(str_val, "Return Temp") == 0 || strcasecmp(str_val, "Return") == 0)
      m = hv6::BalanceMode::RETURN_TEMP;
    this->zone_controller_->set_balance_mode(m);

  // ---- adaptive balancing knobs ----
  } else if (strcmp(key, "adapt_interval_s") == 0 && has_num && this->config_store_) {
    auto bal = this->config_store_->get_config().balancing;
    bal.adapt_interval_s = static_cast<uint32_t>(std::max(60.0f, std::min(86400.0f, num_val)));
    this->config_store_->update_balancing(bal);
  } else if (strcmp(key, "adapt_step") == 0 && has_num && this->config_store_) {
    auto bal = this->config_store_->get_config().balancing;
    bal.adapt_step = std::max(0.001f, std::min(0.2f, num_val));
    this->config_store_->update_balancing(bal);
  } else if (strcmp(key, "adapt_min") == 0 && has_num && this->config_store_) {
    auto bal = this->config_store_->get_config().balancing;
    bal.adapt_min = std::max(0.1f, std::min(1.0f, num_val));
    this->config_store_->update_balancing(bal);
  } else if (strcmp(key, "adapt_max") == 0 && has_num && this->config_store_) {
    auto bal = this->config_store_->get_config().balancing;
    bal.adapt_max = std::max(1.0f, std::min(3.0f, num_val));
    this->config_store_->update_balancing(bal);

  // ---- forecast_enabled ----
  } else if (strcmp(key, "forecast_enabled") == 0 && has_str && this->config_store_) {
    auto fc = this->config_store_->get_forecast_config();
    fc.enabled = (strcasecmp(str_val, "on") == 0 || strcmp(str_val, "1") == 0);
    this->config_store_->update_forecast(fc);

  // ---- forecast_latitude ----
  } else if (strcmp(key, "forecast_latitude") == 0 && has_num && this->config_store_) {
    auto fc = this->config_store_->get_forecast_config();
    fc.latitude = num_val;
    this->config_store_->update_forecast(fc);

  // ---- forecast_longitude ----
  } else if (strcmp(key, "forecast_longitude") == 0 && has_num && this->config_store_) {
    auto fc = this->config_store_->get_forecast_config();
    fc.longitude = num_val;
    this->config_store_->update_forecast(fc);

  // ---- forecast_load_threshold ----
  } else if (strcmp(key, "forecast_load_threshold") == 0 && has_num && this->config_store_) {
    auto fc = this->config_store_->get_forecast_config();
    fc.load_threshold = num_val;
    this->config_store_->update_forecast(fc);

  // ---- forecast_max_offset_c ----
  } else if (strcmp(key, "forecast_max_offset_c") == 0 && has_num && this->config_store_) {
    auto fc = this->config_store_->get_forecast_config();
    fc.max_offset_c = num_val;
    this->config_store_->update_forecast(fc);

  // ---- per-zone exposure ----
  } else if (strcmp(key, "zone_wind_exposure") == 0 && has_num && zone_valid && this->zone_controller_) {
    this->zone_controller_->set_zone_wind_exposure(zi, num_val);
  } else if (strcmp(key, "zone_solar_gain") == 0 && has_num && zone_valid && this->zone_controller_) {
    this->zone_controller_->set_zone_solar_gain(zi, num_val);
  } else if (strcmp(key, "zone_thermal_lead_h") == 0 && has_num && zone_valid && this->zone_controller_) {
    this->zone_controller_->set_zone_thermal_lead_h(zi, static_cast<uint8_t>(std::max(0.0f, std::min(48.0f, num_val))));

  // ---- motor config numeric setters ----
  } else if (has_num && this->config_store_ && this->valve_controller_) {
    auto motor_cfg = this->config_store_->get_motor_config();
    bool dirty = true;
    if (strcmp(key, "close_threshold_multiplier") == 0)
      motor_cfg.close_current_factor = num_val;
    else if (strcmp(key, "close_slope_threshold") == 0)
      motor_cfg.close_slope_threshold_ma_per_s = num_val;
    else if (strcmp(key, "close_slope_current_factor") == 0)
      motor_cfg.close_slope_current_factor = num_val;
    else if (strcmp(key, "open_threshold_multiplier") == 0)
      motor_cfg.open_current_factor = num_val;
    else if (strcmp(key, "open_slope_threshold") == 0)
      motor_cfg.open_slope_threshold_ma_per_s = num_val;
    else if (strcmp(key, "open_slope_current_factor") == 0)
      motor_cfg.open_slope_current_factor = num_val;
    else if (strcmp(key, "open_ripple_limit_factor") == 0)
      motor_cfg.open_ripple_limit_factor = num_val;
    else if (strcmp(key, "generic_runtime_limit_seconds") == 0)
      motor_cfg.generic_profile_runtime_limit_s = static_cast<uint32_t>(num_val);
    else if (strcmp(key, "hmip_runtime_limit_seconds") == 0)
      motor_cfg.hmip_vdmot_runtime_limit_s = static_cast<uint32_t>(num_val);
    else if (strcmp(key, "relearn_after_movements") == 0)
      motor_cfg.relearn_after_movements = static_cast<uint32_t>(num_val);
    else if (strcmp(key, "relearn_after_hours") == 0)
      motor_cfg.relearn_after_hours = static_cast<uint32_t>(num_val);
    else if (strcmp(key, "learned_factor_min_samples") == 0)
      motor_cfg.learned_factor_min_samples = static_cast<uint8_t>(num_val);
    else if (strcmp(key, "learned_factor_max_deviation_pct") == 0)
      motor_cfg.learned_factor_max_deviation_pct = num_val / 100.0f;
    else
      dirty = false;

    if (dirty) {
      this->config_store_->update_motor(motor_cfg);
      this->valve_controller_->reload_motor_config();
    }
  }
}

// =============================================================================
// Zone-state history
// =============================================================================

// Map a ZoneDisplayState string (from snapshot) to a compact uint8_t code.
// Returns HISTORY_STATE_UNKNOWN (0xFF) for empty / unrecognised strings.
static uint8_t parse_zone_display_state_code(const char *s) {
  if (!s || !s[0]) return HISTORY_STATE_UNKNOWN;
  if (strcasecmp(s, "OFF") == 0)                  return 0;
  if (strcasecmp(s, "MANUAL") == 0)               return 1;
  if (strcasecmp(s, "CALIBRATING") == 0)          return 2;
  if (strcasecmp(s, "WAITING_CALIBRATION") == 0)  return 3;
  if (strcasecmp(s, "WAITING_ROOM_TEMP") == 0)    return 4;
  if (strcasecmp(s, "HEATING") == 0)              return 5;
  if (strcasecmp(s, "IDLE") == 0)                 return 6;
  if (strcasecmp(s, "OVERHEATED") == 0)           return 7;
  return HISTORY_STATE_UNKNOWN;
}

void HV6Dashboard::sample_history_() {
  if (history_lock_ == nullptr) return;

  // Read current zone states from the live snapshot (brief lock).
  HistoryEntry entry{};
  entry.uptime_s = millis() / 1000UL;
  for (uint8_t i = 0; i < hv6::NUM_ZONES; i++)
    entry.zone_state[i] = HISTORY_STATE_UNKNOWN;
  entry.absorbing = (this->zone_controller_ != nullptr &&
                     this->zone_controller_->is_preheat_absorbing()) ? 1 : 0;
  entry.flow_dc = HISTORY_TEMP_NONE;
  entry.return_dc = HISTORY_TEMP_NONE;
  entry.demand_pct = HISTORY_DEMAND_NONE;

  if (snapshot_lock_ != nullptr && snapshot_ready_ &&
      xSemaphoreTake(snapshot_lock_, pdMS_TO_TICKS(10)) == pdTRUE) {
    for (uint8_t i = 0; i < hv6::NUM_ZONES; i++)
      entry.zone_state[i] = parse_zone_display_state_code(snapshot_.zone_state[i]);
    if (!std::isnan(snapshot_.manifold_flow_c))
      entry.flow_dc = static_cast<int16_t>(lroundf(snapshot_.manifold_flow_c * 10.0f));
    if (!std::isnan(snapshot_.manifold_return_c))
      entry.return_dc = static_cast<int16_t>(lroundf(snapshot_.manifold_return_c * 10.0f));
    // Mean open-valve % over zones that report a position (matches the dashboard's
    // client-side demand index, but persisted server-side for the 24 h window).
    float demand_sum = 0.0f;
    uint8_t demand_n = 0;
    for (uint8_t i = 0; i < hv6::NUM_ZONES; i++) {
      if (!std::isnan(snapshot_.zone_valve_pct[i])) {
        demand_sum += snapshot_.zone_valve_pct[i];
        demand_n++;
      }
    }
    if (demand_n > 0) {
      long d = lroundf(demand_sum / demand_n);
      entry.demand_pct = static_cast<uint8_t>(d < 0 ? 0 : (d > 100 ? 100 : d));
    } else {
      entry.demand_pct = 0;
    }
    xSemaphoreGive(snapshot_lock_);
  }

  if (xSemaphoreTake(history_lock_, pdMS_TO_TICKS(10)) == pdTRUE) {
    history_ring_[history_head_] = entry;
    history_head_ = static_cast<uint16_t>((history_head_ + 1) % HISTORY_SLOTS);
    if (history_count_ < HISTORY_SLOTS) history_count_++;
    xSemaphoreGive(history_lock_);
  }
}

void HV6Dashboard::handle_history_(AsyncWebServerRequest *request) {
  // Copy history data under lock.
  auto *ring_copy = static_cast<HistoryEntry *>(malloc(sizeof(HistoryEntry) * HISTORY_SLOTS));
  if (!ring_copy) {
    httpd_req_t *req_err = *request;
    httpd_resp_set_status(req_err, "503 Service Unavailable");
    httpd_resp_set_type(req_err, "text/plain");
    httpd_resp_send(req_err, "Out of memory", HTTPD_RESP_USE_STRLEN);
    return;
  }

  uint16_t count = 0;
  uint16_t head  = 0;
  if (history_lock_ != nullptr &&
      xSemaphoreTake(history_lock_, pdMS_TO_TICKS(50)) == pdTRUE) {
    memcpy(ring_copy, history_ring_, sizeof(HistoryEntry) * HISTORY_SLOTS);
    count = history_count_;
    head  = history_head_;
    xSemaphoreGive(history_lock_);
  }

  httpd_req_t *req = *request;
  httpd_resp_set_status(req, "200 OK");
  httpd_resp_set_type(req, "application/json");
  httpd_resp_set_hdr(req, "Cache-Control", "no-cache");
  httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");

  constexpr size_t BUF_SIZE = 2048;
  char *buf = this->json_buf_;
  size_t offset = 0;

  auto flush = [&]() -> bool {
    if (offset == 0) return true;
    bool ok = (httpd_resp_send_chunk(req, buf, offset) == ESP_OK);
    offset = 0;
    return ok;
  };

  const uint32_t current_uptime = millis() / 1000UL;
  appendf(buf, BUF_SIZE, offset,
      "{\"interval_s\":%lu,\"uptime_s\":%lu,\"count\":%u,\"entries\":[",
      static_cast<unsigned long>(HISTORY_INTERVAL_MS / 1000UL),
      static_cast<unsigned long>(current_uptime),
      static_cast<unsigned>(count));

  // Iterate from oldest to newest entry.
  // oldest_index = (head - count + HISTORY_SLOTS) % HISTORY_SLOTS when buffer is full,
  // or simply 0..count-1 when not yet full (head == count in that case).
  const uint16_t oldest = static_cast<uint16_t>(count < HISTORY_SLOTS
      ? 0
      : head);

  bool first_entry = true;
  for (uint16_t idx = 0; idx < count; idx++) {
    const uint16_t slot = static_cast<uint16_t>((oldest + idx) % HISTORY_SLOTS);
    const HistoryEntry &e = ring_copy[slot];

    // Flush before entries that might overflow the 2 KB buffer.
    // Each entry is at most ~62 bytes:
    // "[4294967295,7,7,7,7,7,7,1,72.5,68.1,100]," → ~41 chars.
    if (offset + 72 >= BUF_SIZE) {
      if (!flush()) { free(ring_copy); return; }
    }

    if (!first_entry) {
      buf[offset++] = ',';
    }
    first_entry = false;

    // flow/return as 1-decimal °C (or null), demand as int % (or null).
    char flow_s[12], return_s[12], demand_s[8];
    if (e.flow_dc == HISTORY_TEMP_NONE) { strcpy(flow_s, "null"); }
    else { snprintf(flow_s, sizeof flow_s, "%.1f", e.flow_dc / 10.0f); }
    if (e.return_dc == HISTORY_TEMP_NONE) { strcpy(return_s, "null"); }
    else { snprintf(return_s, sizeof return_s, "%.1f", e.return_dc / 10.0f); }
    if (e.demand_pct == HISTORY_DEMAND_NONE) { strcpy(demand_s, "null"); }
    else { snprintf(demand_s, sizeof demand_s, "%u", static_cast<unsigned>(e.demand_pct)); }

    // Fields after the absorption flag (index 7) are flow, return, demand —
    // appended so the zone-state timeline's index-based parser is unaffected.
    offset += static_cast<size_t>(snprintf(buf + offset, BUF_SIZE - offset,
        "[%lu,%u,%u,%u,%u,%u,%u,%u,%s,%s,%s]",
        static_cast<unsigned long>(e.uptime_s),
        static_cast<unsigned>(e.zone_state[0]),
        static_cast<unsigned>(e.zone_state[1]),
        static_cast<unsigned>(e.zone_state[2]),
        static_cast<unsigned>(e.zone_state[3]),
        static_cast<unsigned>(e.zone_state[4]),
        static_cast<unsigned>(e.zone_state[5]),
        static_cast<unsigned>(e.absorbing ? 1u : 0u),
        flow_s, return_s, demand_s));
  }

  appendf(buf, BUF_SIZE, offset, "]}");
  flush();
  httpd_resp_send_chunk(req, nullptr, 0);
  free(ring_copy);
}

// =============================================================================
// Live device-log stream
// =============================================================================

void HV6Dashboard::on_log_static_(void *self, uint8_t level, const char *tag,
                                  const char *message, size_t message_len) {
  static_cast<HV6Dashboard *>(self)->on_log_(level, tag, message, message_len);
}

void HV6Dashboard::on_log_(uint8_t level, const char *tag, const char *message,
                           size_t /*message_len*/) {
  if (log_lock_ == nullptr || message == nullptr)
    return;
  // Never stall the logging path: skip ISR context and drop on contention.
  if (xPortInIsrContext())
    return;
  if (xSemaphoreTake(log_lock_, 0) != pdTRUE)
    return;

  LogLine &slot = log_ring_[log_head_];
  slot.seq = log_next_seq_++;
  slot.level = level;

  if (tag != nullptr) {
    strncpy(slot.tag, tag, LOG_TAG_LEN - 1);
    slot.tag[LOG_TAG_LEN - 1] = '\0';
  } else {
    slot.tag[0] = '\0';
  }

  // Copy the message, stripping ANSI color escapes (\x1b[ ... m) and flattening
  // whitespace so each ring entry is a single clean line.
  size_t o = 0;
  for (const char *p = message; *p != '\0' && o < LOG_MSG_LEN - 1; ++p) {
    if (*p == '\x1b') {
      while (*p != '\0' && *p != 'm')
        ++p;
      if (*p == '\0')
        break;
      continue;  // also skip the terminating 'm'
    }
    char c = *p;
    if (c == '\n' || c == '\r' || c == '\t')
      c = ' ';
    slot.msg[o++] = c;
  }
  slot.msg[o] = '\0';

  log_head_ = static_cast<uint16_t>((log_head_ + 1) % LOG_SLOTS);
  xSemaphoreGive(log_lock_);
}

// GET /api/hv6/v1/logs?since=<seq> — returns log lines newer than <seq>.
void HV6Dashboard::handle_logs_(AsyncWebServerRequest *request) {
  uint32_t since = 0;
  const std::string since_arg = request->arg("since");
  if (!since_arg.empty())
    since = static_cast<uint32_t>(strtoul(since_arg.c_str(), nullptr, 10));

  // The ring copy is ~12.8 KB; take it from PSRAM so a busy /logs poll never
  // spikes the (scarce) internal heap. Fall back to internal heap on no-PSRAM
  // boards. free() routes back to the correct heap for either allocation.
  auto *ring_copy = static_cast<LogLine *>(
      heap_caps_malloc(sizeof(LogLine) * LOG_SLOTS, MALLOC_CAP_SPIRAM));
  if (!ring_copy)
    ring_copy = static_cast<LogLine *>(malloc(sizeof(LogLine) * LOG_SLOTS));
  if (!ring_copy) {
    httpd_req_t *req_err = *request;
    httpd_resp_set_status(req_err, "503 Service Unavailable");
    httpd_resp_set_type(req_err, "text/plain");
    httpd_resp_send(req_err, "Out of memory", HTTPD_RESP_USE_STRLEN);
    return;
  }

  uint16_t head = 0;
  uint32_t next_seq = 1;
  if (log_lock_ != nullptr &&
      xSemaphoreTake(log_lock_, pdMS_TO_TICKS(50)) == pdTRUE) {
    memcpy(ring_copy, log_ring_, sizeof(LogLine) * LOG_SLOTS);
    head = log_head_;
    next_seq = log_next_seq_;
    xSemaphoreGive(log_lock_);
  } else {
    memset(ring_copy, 0, sizeof(LogLine) * LOG_SLOTS);
  }

  httpd_req_t *req = *request;
  httpd_resp_set_status(req, "200 OK");
  httpd_resp_set_type(req, "application/json");
  httpd_resp_set_hdr(req, "Cache-Control", "no-cache");
  httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");

  constexpr size_t BUF_SIZE = 2048;
  char *buf = this->json_buf_;
  size_t offset = 0;
  auto flush = [&]() -> bool {
    if (offset == 0) return true;
    bool ok = (httpd_resp_send_chunk(req, buf, offset) == ESP_OK);
    offset = 0;
    return ok;
  };

  appendf(buf, BUF_SIZE, offset, "{\"next_seq\":%lu,\"lines\":[",
          static_cast<unsigned long>(next_seq));

  bool first = true;
  // Oldest-to-newest: chronological order is (head + i) around the ring.
  for (uint16_t i = 0; i < LOG_SLOTS; i++) {
    const LogLine &l = ring_copy[(head + i) % LOG_SLOTS];
    if (l.seq == 0 || l.seq <= since)
      continue;

    // A full entry can approach LOG_TAG_LEN + LOG_MSG_LEN plus escaping; flush
    // whenever the remaining buffer can't safely hold one.
    if (offset + (LOG_TAG_LEN + LOG_MSG_LEN) * 2 + 32 >= BUF_SIZE) {
      if (!flush()) { free(ring_copy); return; }
    }

    if (!first)
      buf[offset++] = ',';
    first = false;

    appendf(buf, BUF_SIZE, offset, "[%lu,%u,\"",
            static_cast<unsigned long>(l.seq), static_cast<unsigned>(l.level));
    append_json_escaped(buf, BUF_SIZE, offset, l.tag);
    appendf(buf, BUF_SIZE, offset, "\",\"");
    append_json_escaped(buf, BUF_SIZE, offset, l.msg);
    appendf(buf, BUF_SIZE, offset, "\"]");
  }

  appendf(buf, BUF_SIZE, offset, "]}");
  flush();
  httpd_resp_send_chunk(req, nullptr, 0);
  free(ring_copy);
}

// GET /api/hv6/v1/forecast — the raw fetched hourly forecast, so the dashboard
// can prove Open-Meteo data is actually available.
void HV6Dashboard::handle_forecast_(AsyncWebServerRequest *request) {
  httpd_req_t *req = *request;
  httpd_resp_set_status(req, "200 OK");
  httpd_resp_set_type(req, "application/json");
  httpd_resp_set_hdr(req, "Cache-Control", "no-cache");
  httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");

  constexpr size_t BUF_SIZE = 2048;
  char *buf = this->json_buf_;
  size_t offset = 0;
  char num_buf[24];
  auto flush = [&]() -> bool {
    if (offset == 0) return true;
    bool ok = (httpd_resp_send_chunk(req, buf, offset) == ESP_OK);
    offset = 0;
    return ok;
  };

  uint8_t count = 0;
  uint32_t base_epoch = 0;
  uint32_t age_s = 0;
  uint32_t fetch_epoch = 0;

#ifdef USE_HV6_FORECAST
  static hv6_forecast::ForecastHour hours[hv6_forecast::FORECAST_HOURS];
  if (this->forecast_ != nullptr) {
    auto *fc = static_cast<hv6_forecast::Hv6Forecast *>(this->forecast_);
    count = fc->copy_hours(hours, hv6_forecast::FORECAST_HOURS, &base_epoch, &age_s);
    fetch_epoch = fc->get_last_fetch_epoch();
  }
#else
  hv6_forecast::ForecastHour *hours = nullptr;
  (void) hours;
#endif

  appendf(buf, BUF_SIZE, offset,
          "{\"base_epoch\":%lu,\"age_s\":%lu,\"fetch_epoch\":%lu,\"count\":%u,\"hours\":[",
          static_cast<unsigned long>(base_epoch),
          static_cast<unsigned long>(age_s),
          static_cast<unsigned long>(fetch_epoch),
          static_cast<unsigned>(count));

#ifdef USE_HV6_FORECAST
  for (uint8_t i = 0; i < count; i++) {
    if (offset + 80 >= BUF_SIZE) {
      if (!flush()) return;
    }
    if (i != 0)
      buf[offset++] = ',';
    format_float_token(num_buf, sizeof(num_buf), hours[i].temp_c, 1);
    appendf(buf, BUF_SIZE, offset, "[%s,", num_buf);
    format_float_token(num_buf, sizeof(num_buf), hours[i].wind_speed_ms, 1);
    appendf(buf, BUF_SIZE, offset, "%s,", num_buf);
    format_float_token(num_buf, sizeof(num_buf), hours[i].wind_dir_deg, 0);
    appendf(buf, BUF_SIZE, offset, "%s,", num_buf);
    format_float_token(num_buf, sizeof(num_buf), hours[i].shortwave_wm2, 0);
    appendf(buf, BUF_SIZE, offset, "%s]", num_buf);
  }
#else
  (void) num_buf;
#endif

  appendf(buf, BUF_SIZE, offset, "]}");
  flush();
  httpd_resp_send_chunk(req, nullptr, 0);
}

// Compact board-to-board snapshot consumed by the peer board's Asgard bridge
// (coordinator). Payload stays small (~250 bytes) so the ESP32 peer can parse
// it with a fixed-size JSON document. Contract: docs/ecodan_integration.md
void HV6Dashboard::handle_peer_(AsyncWebServerRequest *request) {
  if (snapshot_lock_ == nullptr || !snapshot_ready_ ||
      xSemaphoreTake(snapshot_lock_, pdMS_TO_TICKS(50)) != pdTRUE) {
    request->send(503, "application/json", "{\"ok\":false,\"error\":\"snapshot not ready\"}");
    return;
  }
  float temps[hv6::NUM_ZONES];
  float setpoints[hv6::NUM_ZONES];
  float areas[hv6::NUM_ZONES];
  bool enabled[hv6::NUM_ZONES];
  for (uint8_t i = 0; i < hv6::NUM_ZONES; i++) {
    temps[i] = this->snapshot_.zone_temp_c[i];
    setpoints[i] = this->snapshot_.zones[i].setpoint_c;
    areas[i] = this->snapshot_.zones[i].area_m2;
    enabled[i] = this->snapshot_.zones[i].enabled;
  }
  xSemaphoreGive(snapshot_lock_);

  // Static (not stack): the httpd worker thread stack is ~4 KB and the lwip
  // send path is deep. Single-threaded httpd makes this safe.
  static char buf[640];
  size_t off = 0;
  off += static_cast<size_t>(snprintf(buf + off, sizeof(buf) - off, "{\"ok\":true,\"zones\":["));
  for (uint8_t i = 0; i < hv6::NUM_ZONES && off < sizeof(buf) - 80; i++) {
    char temp_buf[16];
    if (std::isfinite(temps[i]))
      snprintf(temp_buf, sizeof(temp_buf), "%.2f", temps[i]);
    else
      snprintf(temp_buf, sizeof(temp_buf), "null");
    char sp_buf[16];
    if (std::isfinite(setpoints[i]))
      snprintf(sp_buf, sizeof(sp_buf), "%.2f", setpoints[i]);
    else
      snprintf(sp_buf, sizeof(sp_buf), "null");
    off += static_cast<size_t>(snprintf(buf + off, sizeof(buf) - off,
        "%s{\"t\":%s,\"sp\":%s,\"area\":%.1f,\"en\":%s}",
        (i > 0) ? "," : "", temp_buf, sp_buf, areas[i], enabled[i] ? "true" : "false"));
  }
  if (off < sizeof(buf) - 3)
    off += static_cast<size_t>(snprintf(buf + off, sizeof(buf) - off, "]}"));

  httpd_req_t *req = *request;
  httpd_resp_set_status(req, "200 OK");
  httpd_resp_set_type(req, "application/json");
  httpd_resp_set_hdr(req, "Cache-Control", "no-cache");
  httpd_resp_send(req, buf, static_cast<ssize_t>(off));
}

void HV6Dashboard::handle_ble_scan_(AsyncWebServerRequest *request) {
  if (zone_controller_ == nullptr) {
    request->send(503, "application/json", "{\"ok\":false,\"error\":\"no zone controller\"}");
    return;
  }

  // Kept static (not on the stack): the httpd worker thread has only a ~4 KB
  // stack and the lwip send path below is deep, so large stack locals here
  // overflow it. The httpd server is single-threaded, so static is safe.
  static hv6::Hv6ZoneController::BleSensorSeen sensors[hv6::Hv6ZoneController::BLE_SEEN_SLOTS];
  uint8_t count = zone_controller_->get_ble_discovered(sensors, hv6::Hv6ZoneController::BLE_SEEN_SLOTS);

  httpd_req_t *req = *request;
  httpd_resp_set_status(req, "200 OK");
  httpd_resp_set_type(req, "application/json");
  httpd_resp_set_hdr(req, "Cache-Control", "no-cache");
  httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");

  static char buf[2048];
  size_t off = 0;

  uint32_t now = millis();
  off += static_cast<size_t>(snprintf(buf + off, sizeof(buf) - off,
      "{\"ok\":true,\"count\":%u,\"sensors\":[", static_cast<unsigned>(count)));

  for (uint8_t i = 0; i < count && off < sizeof(buf) - 128; i++) {
    const auto &s = sensors[i];
    uint32_t age_s = (now - s.last_ms) / 1000;

    // 1-based zone, or -1 if unassigned. match_ble_mac copies only the MAC
    // fields (never the whole DeviceConfig).
    int8_t mz = zone_controller_->match_ble_mac(s.mac);
    int8_t assigned_zone = (mz >= 0) ? static_cast<int8_t>(mz + 1) : -1;

    char temp_buf[12];
    if (std::isfinite(s.temp_c))
      snprintf(temp_buf, sizeof(temp_buf), "%.1f", s.temp_c);
    else
      snprintf(temp_buf, sizeof(temp_buf), "null");

    // JSON-escape the advertised name (quotes/backslashes/control chars).
    char name_esc[2 * sizeof(s.name)];
    size_t ne = 0;
    for (size_t j = 0; s.name[j] != '\0' && ne < sizeof(name_esc) - 2; j++) {
      char c = s.name[j];
      if (c == '"' || c == '\\') {
        name_esc[ne++] = '\\';
        name_esc[ne++] = c;
      } else if (static_cast<unsigned char>(c) >= 0x20) {
        name_esc[ne++] = c;
      }
    }
    name_esc[ne] = '\0';

    off += static_cast<size_t>(snprintf(buf + off, sizeof(buf) - off,
        "%s{\"mac\":\"%s\",\"name\":\"%s\",\"temp_c\":%s,\"rssi\":%d,\"age_s\":%lu,\"zone\":%d}",
        (i > 0) ? "," : "",
        s.mac, name_esc, temp_buf, static_cast<int>(s.rssi),
        static_cast<unsigned long>(age_s),
        static_cast<int>(assigned_zone)));
  }

  if (off < sizeof(buf) - 2)
    off += static_cast<size_t>(snprintf(buf + off, sizeof(buf) - off, "]}"));

  httpd_resp_send(req, buf, static_cast<ssize_t>(off));
}

}  // namespace hv6_dashboard
}  // namespace esphome
