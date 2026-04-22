#include "hv6_dashboard.h"

#include "esphome/core/log.h"
#include <cmath>
#include <cstdio>
#include <cstring>
#include <cstdarg>
#include <esp_http_server.h>

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
  if (strcasecmp(raw, "MQTT Sensor") == 0 || strcasecmp(raw, "Zigbee MQTT") == 0) { *out = hv6::TempSource::MQTT_EXTERNAL; return true; }
  if (strcasecmp(raw, "BLE Sensor") == 0) { *out = hv6::TempSource::BLE_SENSOR; return true; }
  return false;
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

  if (this->config_store_) {
    s.probes                 = this->config_store_->get_probe_config();
    s.motor                  = this->config_store_->get_motor_config();
    s.manifold_type          = this->config_store_->get_manifold_type();
    s.simple_preheat_enabled = this->config_store_->get_simple_preheat_enabled();
    for (uint8_t i = 0; i < hv6::NUM_ZONES; i++) {
      s.zones[i]            = this->config_store_->get_zone_config(i);
      s.zone_temp_source[i] = this->config_store_->get_zone_temp_source(i);
      this->config_store_->get_zone_mqtt_strings(
          i, s.zone_mqtt_dev[i], sizeof(s.zone_mqtt_dev[i]),
          s.zone_ble_mac[i],     sizeof(s.zone_ble_mac[i]));
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

  // Prime snapshot so the first GET doesn't return 503.
  this->update_snapshot_();
  this->snapshot_last_ms_ = millis();

  this->base_->init();
  this->base_->add_handler(this);
  ESP_LOGI(TAG, "Dashboard endpoints registered: /dashboard, /dashboard.js");
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
  if ((int32_t)(now - snapshot_last_ms_) >= (int32_t)SNAPSHOT_INTERVAL_MS) {
    snapshot_last_ms_ = now;
    update_snapshot_();
  }
}

bool HV6Dashboard::canHandle(AsyncWebServerRequest *request) const {
  char url_buf[AsyncWebServerRequest::URL_BUF_SIZE];
  auto url = request->url_to(url_buf);
  return url == "/dashboard" || url == "/dashboard/" || url == "/dashboard.js" || url == "/dashboard/state" ||
         url == "/dashboard/set";
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
  if (url == "/dashboard/state") {
    this->handle_state_(request);
    return;
  }
  if (url == "/dashboard/set") {
    this->handle_set_(request);
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
  // Take a local snapshot copy under a brief lock — no ESPHome API calls from httpd task.
  auto *snap = static_cast<DashboardSnapshot *>(malloc(sizeof(DashboardSnapshot)));
  if (!snap) {
    httpd_req_t *req_err = *request;
    httpd_resp_set_status(req_err, "503 Service Unavailable");
    httpd_resp_set_type(req_err, "text/plain");
    httpd_resp_send(req_err, "Out of memory", HTTPD_RESP_USE_STRLEN);
    return;
  }
  if (snapshot_lock_ == nullptr || !snapshot_ready_ ||
      xSemaphoreTake(snapshot_lock_, pdMS_TO_TICKS(50)) != pdTRUE) {
    free(snap);
    httpd_req_t *req_err = *request;
    httpd_resp_set_status(req_err, "503 Service Unavailable");
    httpd_resp_set_type(req_err, "text/plain");
    httpd_resp_send(req_err, "Snapshot not ready", HTTPD_RESP_USE_STRLEN);
    return;
  }
  memcpy(snap, &this->snapshot_, sizeof(*snap));
  xSemaphoreGive(snapshot_lock_);

  httpd_req_t *req = *request;
  httpd_resp_set_status(req, "200 OK");
  httpd_resp_set_type(req, "application/json");
  httpd_resp_set_hdr(req, "Cache-Control", "no-cache");
  httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");

  // Heap-allocate a 2 KB chunk buffer; flush to client progressively.
  constexpr size_t BUF_SIZE = 2048;
  char *buf = static_cast<char *>(malloc(BUF_SIZE));
  if (!buf) {
    free(snap);
    httpd_resp_set_status(req, "503 Service Unavailable");
    httpd_resp_set_type(req, "text/plain");
    httpd_resp_send(req, "Out of memory", HTTPD_RESP_USE_STRLEN);
    return;
  }
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
  if (!flush()) { free(buf); free(snap); return; }

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
  if (!flush()) { free(buf); free(snap); return; }

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
  if (!flush()) { free(buf); free(snap); return; }

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
  if (!flush()) { free(buf); free(snap); return; }

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

  for (uint8_t i = 0; i < 6; i++) {
    appendf(buf, BUF_SIZE, offset, "\"%s\":{\"state\":\"%s\"},", ZONE_STATE_KEYS[i], snap->zone_state[i]);
  }
  for (uint8_t i = 0; i < 6; i++) {
    appendf(buf, BUF_SIZE, offset, "\"%s\":{\"state\":\"%s\"},", MOTOR_FAULT_KEYS[i], snap->motor_fault[i]);
  }

  // flush before config section; each zone config (~550 bytes) would overflow combined
  if (!flush()) { free(buf); free(snap); return; }

  // ---- config (read entirely from snapshot — no config_store_ calls) ----
  static const char *const PIPE_TYPE_STR[] = {
    "PEX 12mm", "PEX 14mm", "PEX 16mm", "PEX 17mm",
    "PEX 18mm", "PEX 20mm", "ALUPEX 16mm", "ALUPEX 20mm"
  };
  static const char *const TEMP_SOURCE_STR[] = {
    "Local Probe", "Zigbee MQTT", "BLE Sensor"
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

    const uint8_t src_idx = static_cast<uint8_t>(snap->zone_temp_source[i]);
    const char *src_str = (src_idx < 3) ? TEMP_SOURCE_STR[src_idx] : "Local Probe";
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
        "\"text-zone_%u_zigbee_device\":{\"state\":\"%s\"},", zn, snap->zone_mqtt_dev[i]);
    appendf(buf, BUF_SIZE, offset,
        "\"text-zone_%u_ble_mac\":{\"state\":\"%s\"},", zn, snap->zone_ble_mac[i]);

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
    if (!flush()) { free(buf); free(snap); return; }
  }

  // --- global config ---
  appendf(buf, BUF_SIZE, offset,
      "\"switch-motor_drivers_enabled\":{\"state\":\"%s\"},",
      snap->drivers_enabled ? "on" : "off");

  appendf(buf, BUF_SIZE, offset,
      "\"switch-simple_preheat_enabled\":{\"state\":\"%s\"},",
      snap->simple_preheat_enabled ? "on" : "off");

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

  // Sentinel field closes the JSON object and absorbs any trailing comma.
  appendf(buf, BUF_SIZE, offset, "\"_\":{}}");
  flush();
  httpd_resp_send_chunk(req, nullptr, 0);
  free(buf);
  free(snap);
}

void HV6Dashboard::handle_set_(AsyncWebServerRequest *request) {
  if (request->method() != HTTP_POST) {
    request->send(405, "text/plain", "Method Not Allowed");
    return;
  }

  {
    httpd_req_t *req = *request;
    const size_t content_len = req->content_len;
    if (content_len == 0 || content_len > 512) {
      request->send(400, "text/plain", "Bad Request");
      return;
    }
  }

  const std::string key_str = request->arg("key");
  if (key_str.empty()) {
    request->send(400, "application/json", "{\"ok\":false,\"error\":\"missing_key\"}");
    return;
  }

  const std::string zone_str = request->arg("zone");
  float zone_f = 0.0f;
  const bool has_zone_field = !zone_str.empty();
  if (has_zone_field) {
    char *endptr = nullptr;
    zone_f = strtof(zone_str.c_str(), &endptr);
  }
  const int zone = has_zone_field ? static_cast<int>(zone_f) : 0;

  const std::string value_str = request->arg("value");
  float num_val = 0.0f;
  bool has_num = false;
  if (!value_str.empty()) {
    char *endptr = nullptr;
    num_val = strtof(value_str.c_str(), &endptr);
    has_num = (endptr != nullptr && endptr != value_str.c_str() && *endptr == '\0');
  }

  DashboardAction act;
  act.key = key_str;
  act.value_str = value_str;
  act.num_val = num_val;
  act.zone = zone;
  act.has_num = has_num;
  act.has_str = !value_str.empty();
  act.zone_valid = zone >= 1 && zone <= 6;
  act.zi = act.zone_valid ? static_cast<uint8_t>(zone - 1) : 0;

  if (action_lock_ != nullptr && xSemaphoreTake(action_lock_, pdMS_TO_TICKS(100)) == pdTRUE) {
    action_queue_.push_back(act);
    xSemaphoreGive(action_lock_);
    request->send(200, "application/json", "{\"ok\":true}");
  } else {
    request->send(503, "text/plain", "System busy, try again");
  }
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

  // ---- zone_zigbee_device ----
  } else if (strcmp(key, "zone_zigbee_device") == 0 && has_str && zone_valid && this->zone_controller_) {
    this->zone_controller_->set_zone_mqtt_device(zi, std::string(str_val));

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

}  // namespace hv6_dashboard
}  // namespace esphome