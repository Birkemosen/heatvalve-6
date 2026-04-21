#include "hv6_dashboard.h"

#include "esphome/core/log.h"
#include <cmath>
#include <cstdio>
#include <cstring>
#include <cstdarg>

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

void format_sensor_token(char *buffer, size_t capacity, esphome::sensor::Sensor *sensor, int decimals = 1) {
  if (sensor == nullptr || !sensor->has_state()) {
    snprintf(buffer, capacity, "null");
    return;
  }
  format_float_token(buffer, capacity, sensor->state, decimals);
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

void format_text_state(char *buffer, size_t capacity, esphome::text_sensor::TextSensor *text) {
  if (text == nullptr || !text->has_state()) {
    buffer[0] = '\0';
    return;
  }
  sanitize_text(text->state, buffer, capacity);
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

void HV6Dashboard::setup() {
  if (this->base_ == nullptr) {
    ESP_LOGE(TAG, "web_server_base is null; dashboard handler not registered");
    return;
  }

  this->action_lock_ = xSemaphoreCreateMutex();

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
  static char payload[10240];
  size_t offset = 0;

  const uint32_t uptime_s = millis() / 1000UL;

  char wifi_buf[24] = "null";
  if (this->wifi_signal_sensor_ != nullptr && this->wifi_signal_sensor_->has_state()) {
    const float wifi_dbm = this->wifi_signal_sensor_->state;
    if (std::isfinite(wifi_dbm)) {
      snprintf(wifi_buf, sizeof(wifi_buf), "%ld", static_cast<long>(std::lround(wifi_dbm)));
    }
  }

  char num_buf[24];
  char text_buf[64];

  appendf(payload, sizeof(payload), offset, "{");

  // --- uptime & wifi ---
  appendf(payload, sizeof(payload), offset,
      "\"sensor-uptime\":{\"value\":%lu},"
      "\"sensor-wifi_signal\":{\"value\":%s},",
      static_cast<unsigned long>(uptime_s), wifi_buf);

  // --- manifold temps ---
  format_sensor_token(num_buf, sizeof(num_buf), this->manifold_flow_sensor_);
  appendf(payload, sizeof(payload), offset, "\"sensor-manifold_flow_temperature\":{\"value\":%s},", num_buf);
  format_sensor_token(num_buf, sizeof(num_buf), this->manifold_return_sensor_);
  appendf(payload, sizeof(payload), offset, "\"sensor-manifold_return_temperature\":{\"value\":%s},", num_buf);

  // --- zone temperatures ---
  static const char *const ZONE_TEMP_KEYS[6] = {
    "sensor-zone_1_temperature", "sensor-zone_2_temperature", "sensor-zone_3_temperature",
    "sensor-zone_4_temperature", "sensor-zone_5_temperature", "sensor-zone_6_temperature",
  };
  for (uint8_t i = 0; i < 6; i++) {
    format_sensor_token(num_buf, sizeof(num_buf), this->zone_temp_sensors_[i]);
    appendf(payload, sizeof(payload), offset, "\"%s\":{\"value\":%s},", ZONE_TEMP_KEYS[i], num_buf);
  }

  // --- zone valve positions (0 decimals) ---
  static const char *const ZONE_VALVE_KEYS[6] = {
    "sensor-zone_1_valve_pct", "sensor-zone_2_valve_pct", "sensor-zone_3_valve_pct",
    "sensor-zone_4_valve_pct", "sensor-zone_5_valve_pct", "sensor-zone_6_valve_pct",
  };
  for (uint8_t i = 0; i < 6; i++) {
    format_sensor_token(num_buf, sizeof(num_buf), this->zone_valve_sensors_[i], 0);
    appendf(payload, sizeof(payload), offset, "\"%s\":{\"value\":%s},", ZONE_VALVE_KEYS[i], num_buf);
  }

  // --- preheat advance ---
  static const char *const PREHEAT_KEYS[6] = {
    "sensor-zone_1_preheat_advance_c", "sensor-zone_2_preheat_advance_c", "sensor-zone_3_preheat_advance_c",
    "sensor-zone_4_preheat_advance_c", "sensor-zone_5_preheat_advance_c", "sensor-zone_6_preheat_advance_c",
  };
  for (uint8_t i = 0; i < 6; i++) {
    format_sensor_token(num_buf, sizeof(num_buf), this->zone_preheat_sensors_[i]);
    appendf(payload, sizeof(payload), offset, "\"%s\":{\"value\":%s},", PREHEAT_KEYS[i], num_buf);
  }

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
    format_sensor_token(num_buf, sizeof(num_buf), this->motor_open_ripple_sensors_[i], 0);
    appendf(payload, sizeof(payload), offset, "\"%s\":{\"value\":%s},", OPEN_RIPPLE_KEYS[i], num_buf);
    format_sensor_token(num_buf, sizeof(num_buf), this->motor_close_ripple_sensors_[i], 0);
    appendf(payload, sizeof(payload), offset, "\"%s\":{\"value\":%s},", CLOSE_RIPPLE_KEYS[i], num_buf);
  }

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
    format_sensor_token(num_buf, sizeof(num_buf), this->motor_open_factor_sensors_[i], 2);
    appendf(payload, sizeof(payload), offset, "\"%s\":{\"value\":%s},", OPEN_FACTOR_KEYS[i], num_buf);
    format_sensor_token(num_buf, sizeof(num_buf), this->motor_close_factor_sensors_[i], 2);
    appendf(payload, sizeof(payload), offset, "\"%s\":{\"value\":%s},", CLOSE_FACTOR_KEYS[i], num_buf);
  }

  // --- probe temperatures ---
  static const char *const PROBE_TEMP_KEYS[8] = {
    "sensor-probe_1_temperature", "sensor-probe_2_temperature", "sensor-probe_3_temperature",
    "sensor-probe_4_temperature", "sensor-probe_5_temperature", "sensor-probe_6_temperature",
    "sensor-probe_7_temperature", "sensor-probe_8_temperature",
  };
  for (uint8_t i = 0; i < 8; i++) {
    format_sensor_token(num_buf, sizeof(num_buf), this->probe_temp_sensors_[i]);
    appendf(payload, sizeof(payload), offset, "\"%s\":{\"value\":%s},", PROBE_TEMP_KEYS[i], num_buf);
  }

  // --- text sensors ---
  static const char *const ZONE_STATE_KEYS[6] = {
    "text_sensor-zone_1_state", "text_sensor-zone_2_state", "text_sensor-zone_3_state",
    "text_sensor-zone_4_state", "text_sensor-zone_5_state", "text_sensor-zone_6_state",
  };
  static const char *const MOTOR_FAULT_KEYS[6] = {
    "text_sensor-motor_1_last_fault", "text_sensor-motor_2_last_fault", "text_sensor-motor_3_last_fault",
    "text_sensor-motor_4_last_fault", "text_sensor-motor_5_last_fault", "text_sensor-motor_6_last_fault",
  };

  format_text_state(text_buf, sizeof(text_buf), this->firmware_version_text_);
  appendf(payload, sizeof(payload), offset, "\"text_sensor-firmware_version\":{\"state\":\"%s\"},", text_buf);

  format_text_state(text_buf, sizeof(text_buf), this->ip_address_text_);
  appendf(payload, sizeof(payload), offset, "\"text_sensor-ip_address\":{\"state\":\"%s\"},", text_buf);

  format_text_state(text_buf, sizeof(text_buf), this->connected_ssid_text_);
  appendf(payload, sizeof(payload), offset, "\"text_sensor-connected_ssid\":{\"state\":\"%s\"},", text_buf);

  format_text_state(text_buf, sizeof(text_buf), this->mac_address_text_);
  appendf(payload, sizeof(payload), offset, "\"text_sensor-mac_address\":{\"state\":\"%s\"},", text_buf);

  for (uint8_t i = 0; i < 6; i++) {
    format_text_state(text_buf, sizeof(text_buf), this->zone_state_sensors_[i]);
    appendf(payload, sizeof(payload), offset, "\"%s\":{\"state\":\"%s\"},", ZONE_STATE_KEYS[i], text_buf);
  }

  for (uint8_t i = 0; i < 6; i++) {
    format_text_state(text_buf, sizeof(text_buf), this->motor_fault_sensors_[i]);
    appendf(payload, sizeof(payload), offset, "\"%s\":{\"state\":\"%s\"},", MOTOR_FAULT_KEYS[i], text_buf);
  }

  // ---- config snapshot ----
  if (this->config_store_) {
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

    const hv6::ProbeConfig probes = this->config_store_->get_probe_config();
    const hv6::MotorConfig motor = this->config_store_->get_motor_config();

    // --- zone configs ---
    for (uint8_t i = 0; i < hv6::NUM_ZONES; i++) {
      const hv6::ZoneConfig z = this->config_store_->get_zone_config(i);
      const hv6::TempSource src = this->config_store_->get_zone_temp_source(i);
      char mqtt_dev[hv6::MQTT_DEVICE_NAME_LEN];
      char ble_mac[hv6::BLE_MAC_LEN];
      this->config_store_->get_zone_mqtt_strings(i, mqtt_dev, sizeof(mqtt_dev), ble_mac, sizeof(ble_mac));
      const uint8_t zn = i + 1;

      appendf(payload, sizeof(payload), offset,
          "\"switch-zone_%u_enabled\":{\"state\":\"%s\"},"
          "\"number-zone_%u_setpoint\":{\"value\":",
          zn, z.enabled ? "on" : "off", zn);
      format_float_token(num_buf, sizeof(num_buf), z.setpoint_c, 1);
      appendf(payload, sizeof(payload), offset, "%s},", num_buf);

      format_float_token(num_buf, sizeof(num_buf), z.area_m2, 1);
      appendf(payload, sizeof(payload), offset,
          "\"number-zone_%u_area_m2\":{\"value\":%s},", zn, num_buf);

      format_float_token(num_buf, sizeof(num_buf), z.pipe_spacing_mm, 0);
      appendf(payload, sizeof(payload), offset,
          "\"number-zone_%u_pipe_spacing_mm\":{\"value\":%s},", zn, num_buf);

      const int8_t probe_idx = probes.zone_return_probe[i];
      if (probe_idx >= 0 && probe_idx < static_cast<int8_t>(hv6::MAX_PROBES)) {
        appendf(payload, sizeof(payload), offset,
            "\"select-zone_%u_probe\":{\"state\":\"Probe %d\"},",
            zn, static_cast<int>(probe_idx) + 1);
      } else {
        appendf(payload, sizeof(payload), offset,
            "\"select-zone_%u_probe\":{\"state\":\"None\"},", zn);
      }

      const uint8_t src_idx = static_cast<uint8_t>(src);
      const char *src_str = (src_idx < 3) ? TEMP_SOURCE_STR[src_idx] : "Local Probe";
      appendf(payload, sizeof(payload), offset,
          "\"select-zone_%u_temp_source\":{\"state\":\"%s\"},", zn, src_str);

      if (z.sync_to_zone >= 0 && z.sync_to_zone < static_cast<int8_t>(hv6::NUM_ZONES)) {
        appendf(payload, sizeof(payload), offset,
            "\"select-zone_%u_sync_to\":{\"state\":\"Zone %d\"},",
            zn, static_cast<int>(z.sync_to_zone) + 1);
      } else {
        appendf(payload, sizeof(payload), offset,
            "\"select-zone_%u_sync_to\":{\"state\":\"None\"},", zn);
      }

      const uint8_t pt_idx = static_cast<uint8_t>(z.pipe_type);
      const char *pt_str = (pt_idx < 8) ? PIPE_TYPE_STR[pt_idx] : "Unknown";
      appendf(payload, sizeof(payload), offset,
          "\"select-zone_%u_pipe_type\":{\"state\":\"%s\"},", zn, pt_str);

      sanitize_text(std::string(mqtt_dev), text_buf, sizeof(text_buf));
      appendf(payload, sizeof(payload), offset,
          "\"text-zone_%u_zigbee_device\":{\"state\":\"%s\"},", zn, text_buf);

      sanitize_text(std::string(ble_mac), text_buf, sizeof(text_buf));
      appendf(payload, sizeof(payload), offset,
          "\"text-zone_%u_ble_mac\":{\"state\":\"%s\"},", zn, text_buf);

      const uint8_t walls = z.exterior_walls;
      if (walls == hv6::ExteriorWall::NONE) {
        appendf(payload, sizeof(payload), offset,
            "\"text-zone_%u_exterior_walls\":{\"state\":\"None\"},", zn);
      } else {
        char wall_buf[12] = {};
        size_t woff = 0;
        if (walls & hv6::ExteriorWall::NORTH) { if (woff) wall_buf[woff++] = ','; wall_buf[woff++] = 'N'; }
        if (walls & hv6::ExteriorWall::SOUTH) { if (woff) wall_buf[woff++] = ','; wall_buf[woff++] = 'S'; }
        if (walls & hv6::ExteriorWall::EAST)  { if (woff) wall_buf[woff++] = ','; wall_buf[woff++] = 'E'; }
        if (walls & hv6::ExteriorWall::WEST)  { if (woff) wall_buf[woff++] = ','; wall_buf[woff++] = 'W'; }
        wall_buf[woff] = '\0';
        appendf(payload, sizeof(payload), offset,
            "\"text-zone_%u_exterior_walls\":{\"state\":\"%s\"},", zn, wall_buf);
      }
    }

    // --- global config ---
    if (this->valve_controller_) {
      appendf(payload, sizeof(payload), offset,
          "\"switch-motor_drivers_enabled\":{\"state\":\"%s\"},",
          this->valve_controller_->are_drivers_enabled() ? "on" : "off");
    }

    const bool preheat_en = this->config_store_->get_simple_preheat_enabled();
    appendf(payload, sizeof(payload), offset,
        "\"select-simple_preheat_enabled\":{\"state\":\"%s\"},",
        preheat_en ? "on" : "off");

    const hv6::ManifoldType mtype = this->config_store_->get_manifold_type();
    appendf(payload, sizeof(payload), offset,
        "\"select-manifold_type\":{\"state\":\"%s\"},"
        "\"select-manifold_flow_probe\":{\"state\":\"Probe %d\"},"
        "\"select-manifold_return_probe\":{\"state\":\"Probe %d\"},",
        mtype == hv6::ManifoldType::NC ? "NC (Normally Closed)" : "NO (Normally Open)",
        static_cast<int>(probes.manifold_flow_probe) + 1,
        static_cast<int>(probes.manifold_return_probe) + 1);

    const uint8_t mp_idx = static_cast<uint8_t>(motor.default_profile);
    const char *mp_str = (mp_idx < 3) ? MOTOR_PROFILE_STR[mp_idx] : "Generic";
    appendf(payload, sizeof(payload), offset,
        "\"select-motor_profile_default\":{\"state\":\"%s\"},", mp_str);

    format_float_token(num_buf, sizeof(num_buf), motor.close_current_factor, 2);
    appendf(payload, sizeof(payload), offset, "\"number-close_threshold_multiplier\":{\"value\":%s},", num_buf);
    format_float_token(num_buf, sizeof(num_buf), motor.close_slope_threshold_ma_per_s, 2);
    appendf(payload, sizeof(payload), offset, "\"number-close_slope_threshold\":{\"value\":%s},", num_buf);
    format_float_token(num_buf, sizeof(num_buf), motor.close_slope_current_factor, 2);
    appendf(payload, sizeof(payload), offset, "\"number-close_slope_current_factor\":{\"value\":%s},", num_buf);
    format_float_token(num_buf, sizeof(num_buf), motor.open_current_factor, 2);
    appendf(payload, sizeof(payload), offset, "\"number-open_threshold_multiplier\":{\"value\":%s},", num_buf);
    format_float_token(num_buf, sizeof(num_buf), motor.open_slope_threshold_ma_per_s, 2);
    appendf(payload, sizeof(payload), offset, "\"number-open_slope_threshold\":{\"value\":%s},", num_buf);
    format_float_token(num_buf, sizeof(num_buf), motor.open_slope_current_factor, 2);
    appendf(payload, sizeof(payload), offset, "\"number-open_slope_current_factor\":{\"value\":%s},", num_buf);
    format_float_token(num_buf, sizeof(num_buf), motor.open_ripple_limit_factor, 2);
    appendf(payload, sizeof(payload), offset, "\"number-open_ripple_limit_factor\":{\"value\":%s},", num_buf);
    appendf(payload, sizeof(payload), offset,
        "\"number-generic_runtime_limit_seconds\":{\"value\":%lu},"
        "\"number-hmip_runtime_limit_seconds\":{\"value\":%lu},"
        "\"number-relearn_after_movements\":{\"value\":%lu},"
        "\"number-relearn_after_hours\":{\"value\":%lu},"
        "\"number-learned_factor_min_samples\":{\"value\":%u},",
        static_cast<unsigned long>(motor.generic_profile_runtime_limit_s),
        static_cast<unsigned long>(motor.hmip_vdmot_runtime_limit_s),
        static_cast<unsigned long>(motor.relearn_after_movements),
        static_cast<unsigned long>(motor.relearn_after_hours),
        static_cast<unsigned>(motor.learned_factor_min_samples));
    format_float_token(num_buf, sizeof(num_buf), motor.learned_factor_max_deviation_pct * 100.0f, 2);
    appendf(payload, sizeof(payload), offset,
        "\"number-learned_factor_max_deviation_pct\":{\"value\":%s}", num_buf);
  } else {
    // trim trailing comma left by motor fault loop when config_store_ is null
    if (offset > 0 && payload[offset - 1] == ',')
      offset--;
  }

  appendf(payload, sizeof(payload), offset, "}");

  if (offset >= sizeof(payload)) {
    request->send(500, "application/json", "{\"ok\":false,\"error\":\"encode_failed\"}");
    return;
  }

  request->send(200, "application/json", payload);
}

void HV6Dashboard::handle_set_(AsyncWebServerRequest *request) {
  if (request->method() != HTTP_POST) {
    request->send(405, "text/plain", "Method Not Allowed");
    return;
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