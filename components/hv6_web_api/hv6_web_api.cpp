// =============================================================================
// HV6 Web API — ESPHome Component Implementation
// =============================================================================
// Scaffold only: wiring verification and lifecycle visibility.
// =============================================================================

#include "hv6_web_api.h"
#include "esphome/core/log.h"
#include <inttypes.h>
#include <cstdio>
#include <cmath>
#include <cstring>
#include <cstdlib>
#include <strings.h>
#include <string>

namespace hv6 {

static const char *const TAG = "hv6.web_api";
static constexpr uint32_t HMIP_VDMOT_SAFE_RUNTIME_S = 40;
static constexpr uint32_t GENERIC_SAFE_RUNTIME_DEFAULT_S = 45;

static float safe_json_float_(float v) {
  return std::isfinite(v) ? v : 0.0f;
}

static void set_json_headers_(httpd_req_t *req) {
  httpd_resp_set_type(req, "application/json");
  httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");
  httpd_resp_set_hdr(req, "Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  httpd_resp_set_hdr(req, "Access-Control-Allow-Headers", "Content-Type");
}

static bool parse_zone_from_uri_(const char *uri, const char *suffix, uint8_t *zone_out) {
  static const char *const prefix = "/api/hv6/v1/zones/";
  const size_t prefix_len = strlen(prefix);
  if (strncmp(uri, prefix, prefix_len) != 0)
    return false;

  const char *zone_start = uri + prefix_len;
  char *zone_end = nullptr;
  const long zone_val = strtol(zone_start, &zone_end, 10);
  if (zone_end == zone_start)
    return false;
  if (zone_val < 1 || zone_val > NUM_ZONES)
    return false;
  // Match suffix, allowing a trailing '?' (query string) or end-of-string
  const size_t suf_len = strlen(suffix);
  if (strncmp(zone_end, suffix, suf_len) != 0)
    return false;
  if (zone_end[suf_len] != '\0' && zone_end[suf_len] != '?')
    return false;

  *zone_out = static_cast<uint8_t>(zone_val);
  return true;
}

static bool parse_motor_from_uri_(const char *uri, const char *suffix, uint8_t *zone_out) {
  static const char *const prefix = "/api/hv6/v1/motors/";
  const size_t prefix_len = strlen(prefix);
  if (strncmp(uri, prefix, prefix_len) != 0)
    return false;

  const char *zone_start = uri + prefix_len;
  char *zone_end = nullptr;
  const long zone_val = strtol(zone_start, &zone_end, 10);
  if (zone_end == zone_start)
    return false;
  if (zone_val < 1 || zone_val > NUM_ZONES)
    return false;
  // Match suffix, allowing a trailing '?' (query string) or end-of-string
  const size_t suf_len = strlen(suffix);
  if (strncmp(zone_end, suffix, suf_len) != 0)
    return false;
  if (zone_end[suf_len] != '\0' && zone_end[suf_len] != '?')
    return false;

  *zone_out = static_cast<uint8_t>(zone_val);
  return true;
}

static bool parse_bool_(const char *raw, bool *out) {
  if (raw == nullptr || out == nullptr)
    return false;
  if (strcmp(raw, "1") == 0 || strcasecmp(raw, "true") == 0 || strcasecmp(raw, "on") == 0) {
    *out = true;
    return true;
  }
  if (strcmp(raw, "0") == 0 || strcasecmp(raw, "false") == 0 || strcasecmp(raw, "off") == 0) {
    *out = false;
    return true;
  }
  return false;
}

static bool parse_probe_option_(const char *raw, int8_t *probe_out) {
  if (raw == nullptr || probe_out == nullptr)
    return false;
  int n = 0;
  if (sscanf(raw, "Probe %d", &n) == 1 && n >= 1 && n <= MAX_PROBES) {
    *probe_out = static_cast<int8_t>(n - 1);
    return true;
  }
  return false;
}

static bool parse_temp_source_(const char *raw, TempSource *out) {
  if (raw == nullptr || out == nullptr)
    return false;
  if (strcasecmp(raw, "Local Probe") == 0) {
    *out = TempSource::LOCAL_PROBE;
    return true;
  }
  if (strcasecmp(raw, "MQTT Sensor") == 0) {
    *out = TempSource::MQTT_EXTERNAL;
    return true;
  }
  if (strcasecmp(raw, "BLE Sensor") == 0) {
    *out = TempSource::BLE_SENSOR;
    return true;
  }
  return false;
}

static bool parse_pipe_type_(const char *raw, PipeType *out) {
  if (raw == nullptr || out == nullptr)
    return false;
  if (strcasecmp(raw, "PEX 12mm") == 0 || strcasecmp(raw, "PEX 12x2") == 0) { *out = PipeType::PEX_12X2; return true; }
  if (strcasecmp(raw, "PEX 14mm") == 0 || strcasecmp(raw, "PEX 14x2") == 0) { *out = PipeType::PEX_14X2; return true; }
  if (strcasecmp(raw, "PEX 16mm") == 0 || strcasecmp(raw, "PEX 16x2") == 0) { *out = PipeType::PEX_16X2; return true; }
  if (strcasecmp(raw, "PEX 17mm") == 0 || strcasecmp(raw, "PEX 17x2") == 0) { *out = PipeType::PEX_17X2; return true; }
  if (strcasecmp(raw, "PEX 18mm") == 0 || strcasecmp(raw, "PEX 18x2") == 0) { *out = PipeType::PEX_18X2; return true; }
  if (strcasecmp(raw, "PEX 20mm") == 0 || strcasecmp(raw, "PEX 20x2") == 0) { *out = PipeType::PEX_20X2; return true; }
  if (strcasecmp(raw, "ALUPEX 16mm") == 0 || strcasecmp(raw, "ALUPEX 16x2") == 0) { *out = PipeType::ALUPEX_16X2; return true; }
  if (strcasecmp(raw, "ALUPEX 20mm") == 0 || strcasecmp(raw, "ALUPEX 20x2") == 0) { *out = PipeType::ALUPEX_20X2; return true; }
  return false;
}

static bool parse_motor_profile_(const char *raw, MotorProfile *out) {
  if (raw == nullptr || out == nullptr)
    return false;
  if (strcasecmp(raw, "Inherit") == 0) { *out = MotorProfile::INHERIT; return true; }
  if (strcasecmp(raw, "Generic") == 0) { *out = MotorProfile::GENERIC; return true; }
  if (strcasecmp(raw, "HmIP VdMot") == 0 || strcasecmp(raw, "HMIP_VDMOT") == 0) { *out = MotorProfile::HMIP_VDMOT; return true; }
  return false;
}

static uint8_t parse_exterior_walls_(const char *raw) {
  if (raw == nullptr)
    return ExteriorWall::NONE;
  if (strcasecmp(raw, "None") == 0)
    return ExteriorWall::NONE;
  uint8_t walls = ExteriorWall::NONE;
  for (const char *p = raw; *p != '\0'; p++) {
    if (*p == 'N' || *p == 'n') walls |= ExteriorWall::NORTH;
    if (*p == 'E' || *p == 'e') walls |= ExteriorWall::EAST;
    if (*p == 'S' || *p == 's') walls |= ExteriorWall::SOUTH;
    if (*p == 'W' || *p == 'w') walls |= ExteriorWall::WEST;
  }
  return walls;
}

static bool get_query_value_(httpd_req_t *req, const char *key, char *out, size_t out_len) {
  const size_t q_len = httpd_req_get_url_query_len(req);
  if (q_len == 0 || q_len >= 256)
    return false;

  char query[256] = {0};
  if (httpd_req_get_url_query_str(req, query, sizeof(query)) != ESP_OK)
    return false;

  return httpd_query_key_value(query, key, out, out_len) == ESP_OK;
}

esp_err_t Hv6WebApi::options_handler_(httpd_req_t *req) {
  set_json_headers_(req);
  httpd_resp_set_status(req, "204 No Content");
  httpd_resp_send(req, nullptr, 0);
  return ESP_OK;
}

  #ifdef HV6_HAS_DASHBOARD
  static const char DASHBOARD_HTML[] =
      "<!DOCTYPE html><html><head>"
      "<meta charset=UTF-8>"
      "<meta name=viewport content=\"width=device-width,initial-scale=1\">"
      "<link rel=icon href=data:>"
      "<link rel=stylesheet href=/dashboard.css>"
      "<title>HeatValve-6</title>"
      "</head><body>"
      "<script src=/dashboard.js></script>"
      "</body></html>";

  esp_err_t Hv6WebApi::dashboard_handler_(httpd_req_t *req) {
    httpd_resp_set_type(req, "text/html; charset=utf-8");
    httpd_resp_set_hdr(req, "Cache-Control", "no-cache");
    httpd_resp_send(req, DASHBOARD_HTML, HTTPD_RESP_USE_STRLEN);
    return ESP_OK;
  }

  esp_err_t Hv6WebApi::dashboard_js_handler_(httpd_req_t *req) {
    httpd_resp_set_type(req, "application/javascript; charset=utf-8");
    httpd_resp_set_hdr(req, "Content-Encoding", "gzip");
    httpd_resp_set_hdr(req, "Cache-Control", "max-age=60");
    httpd_resp_send(req, reinterpret_cast<const char *>(HV6_DASHBOARD_JS_DATA), static_cast<ssize_t>(HV6_DASHBOARD_JS_SIZE));
    return ESP_OK;
  }

  esp_err_t Hv6WebApi::dashboard_css_handler_(httpd_req_t *req) {
    httpd_resp_set_type(req, "text/css; charset=utf-8");
    httpd_resp_set_hdr(req, "Content-Encoding", "gzip");
    httpd_resp_set_hdr(req, "Cache-Control", "max-age=60");
    httpd_resp_send(req, reinterpret_cast<const char *>(HV6_DASHBOARD_CSS_DATA), static_cast<ssize_t>(HV6_DASHBOARD_CSS_SIZE));
    return ESP_OK;
  }
  #endif

esp_err_t Hv6WebApi::overview_handler_(httpd_req_t *req) {
  auto *self = static_cast<Hv6WebApi *>(req->user_ctx);
  if (self == nullptr || self->zone_controller_ == nullptr) {
    httpd_resp_set_status(req, "500 Internal Server Error");
    set_json_headers_(req);
    httpd_resp_sendstr(req, "{\"ok\":false,\"version\":\"v1\",\"error\":{\"code\":\"zone_controller_unavailable\",\"message\":\"Zone controller unavailable\"}}");
    return ESP_OK;
  }

  const auto sys = self->zone_controller_->get_system_snapshot();
  const bool drivers_enabled = (self->valve_controller_ != nullptr) ? self->valve_controller_->are_drivers_enabled() : false;
  const bool motor_fault = (self->valve_controller_ != nullptr) ? (self->valve_controller_->get_last_fault() != FaultCode::NONE) : false;

  char payload[1024];
  const int n = snprintf(
      payload, sizeof(payload),
      "{\"ok\":true,\"version\":\"v1\",\"data\":{"
      "\"controller_state\":\"%s\"," 
      "\"active_zones\":%u,"
      "\"avg_valve_pct\":%.2f,"
      "\"manifold\":{\"flow_c\":%.2f,\"return_c\":%.2f},"
      "\"motor\":{\"drivers_enabled\":%s,\"fault\":%s},"
      "\"uptime_s\":%" PRIu32 ","
      "\"free_heap\":%" PRIu32 ","
      "\"cycle_count\":%" PRIu32
      "}}",
      controller_state_to_string(sys.controller_state),
      sys.active_zones,
      safe_json_float_(sys.avg_valve_pct),
      safe_json_float_(sys.manifold_flow_temp_c),
      safe_json_float_(sys.manifold_return_temp_c),
      drivers_enabled ? "true" : "false",
      motor_fault ? "true" : "false",
      sys.uptime_s,
      sys.free_heap,
      sys.cycle_count);

  if (n <= 0 || n >= static_cast<int>(sizeof(payload))) {
    httpd_resp_set_status(req, "500 Internal Server Error");
    set_json_headers_(req);
    httpd_resp_sendstr(req, "{\"ok\":false,\"version\":\"v1\",\"error\":{\"code\":\"encode_failed\",\"message\":\"Response encoding failed\"}}");
    return ESP_OK;
  }

  set_json_headers_(req);
  httpd_resp_send(req, payload, HTTPD_RESP_USE_STRLEN);
  return ESP_OK;
}

esp_err_t Hv6WebApi::zones_handler_(httpd_req_t *req) {
  auto *self = static_cast<Hv6WebApi *>(req->user_ctx);
  if (self == nullptr || self->zone_controller_ == nullptr) {
    httpd_resp_set_status(req, "500 Internal Server Error");
    set_json_headers_(req);
    httpd_resp_sendstr(req, "{\"ok\":false,\"version\":\"v1\",\"error\":{\"code\":\"zone_controller_unavailable\",\"message\":\"Zone controller unavailable\"}}");
    return ESP_OK;
  }

  const auto sys = self->zone_controller_->get_system_snapshot();

  std::string out;
  out.reserve(2048);
  out += "{\"ok\":true,\"version\":\"v1\",\"data\":{\"count\":";
  out += std::to_string(NUM_ZONES);
  out += ",\"zones\":[";

  for (uint8_t i = 0; i < NUM_ZONES; i++) {
    const auto &z = sys.zones[i];
    bool enabled = false;
    if (self->config_store_ != nullptr) {
      enabled = self->config_store_->get_config().zones[i].enabled;
    }

    char row[256];
    const int n = snprintf(
        row, sizeof(row),
        "%s{\"zone\":%u,\"enabled\":%s,\"state\":\"%s\",\"display_state\":\"%s\",\"temperature_c\":%.2f,\"setpoint_c\":%.2f,\"valve_pct\":%.2f}",
        i == 0 ? "" : ",",
        static_cast<unsigned>(i + 1),
        enabled ? "true" : "false",
        zone_state_to_string(z.state),
        zone_display_state_to_string(z.display_state),
        safe_json_float_(z.temperature_c),
        safe_json_float_(z.setpoint_c),
        safe_json_float_(z.valve_position_pct));

    if (n <= 0 || n >= static_cast<int>(sizeof(row))) {
      httpd_resp_set_status(req, "500 Internal Server Error");
      set_json_headers_(req);
      httpd_resp_sendstr(req, "{\"ok\":false,\"version\":\"v1\",\"error\":{\"code\":\"encode_failed\",\"message\":\"Response encoding failed\"}}");
      return ESP_OK;
    }

    out += row;
  }

  out += "]}}";

  set_json_headers_(req);
  httpd_resp_send(req, out.c_str(), out.size());
  return ESP_OK;
}

esp_err_t Hv6WebApi::zone_setpoint_handler_(httpd_req_t *req) {
  auto *self = static_cast<Hv6WebApi *>(req->user_ctx);
  if (self == nullptr || self->zone_controller_ == nullptr) {
    httpd_resp_set_status(req, "500 Internal Server Error");
    set_json_headers_(req);
    httpd_resp_sendstr(req, "{\"ok\":false,\"version\":\"v1\",\"error\":{\"code\":\"zone_controller_unavailable\",\"message\":\"Zone controller unavailable\"}}");
    return ESP_OK;
  }

  uint8_t zone = 0;
  if (!parse_zone_from_uri_(req->uri, "/setpoint", &zone)) {
    httpd_resp_set_status(req, "400 Bad Request");
    set_json_headers_(req);
    httpd_resp_sendstr(req, "{\"ok\":false,\"version\":\"v1\",\"error\":{\"code\":\"invalid_zone\",\"message\":\"Zone must be in range 1..6\"}}");
    return ESP_OK;
  }

  char value_buf[32] = {0};
  if (!get_query_value_(req, "setpoint_c", value_buf, sizeof(value_buf))) {
    httpd_resp_set_status(req, "400 Bad Request");
    set_json_headers_(req);
    httpd_resp_sendstr(req, "{\"ok\":false,\"version\":\"v1\",\"error\":{\"code\":\"missing_setpoint\",\"message\":\"setpoint_c query parameter is required\"}}");
    return ESP_OK;
  }

  const float setpoint_c = strtof(value_buf, nullptr);
  if (!std::isfinite(setpoint_c)) {
    httpd_resp_set_status(req, "400 Bad Request");
    set_json_headers_(req);
    httpd_resp_sendstr(req, "{\"ok\":false,\"version\":\"v1\",\"error\":{\"code\":\"invalid_setpoint\",\"message\":\"setpoint_c must be numeric\"}}");
    return ESP_OK;
  }

  self->zone_controller_->set_zone_setpoint(static_cast<uint8_t>(zone - 1), setpoint_c);

  char payload[192];
  snprintf(payload, sizeof(payload),
           "{\"ok\":true,\"version\":\"v1\",\"data\":{\"zone\":%u,\"setpoint_c\":%.2f}}",
           static_cast<unsigned>(zone), setpoint_c);

  set_json_headers_(req);
  httpd_resp_send(req, payload, HTTPD_RESP_USE_STRLEN);
  return ESP_OK;
}

esp_err_t Hv6WebApi::zone_enabled_handler_(httpd_req_t *req) {
  auto *self = static_cast<Hv6WebApi *>(req->user_ctx);
  if (self == nullptr || self->zone_controller_ == nullptr) {
    httpd_resp_set_status(req, "500 Internal Server Error");
    set_json_headers_(req);
    httpd_resp_sendstr(req, "{\"ok\":false,\"version\":\"v1\",\"error\":{\"code\":\"zone_controller_unavailable\",\"message\":\"Zone controller unavailable\"}}");
    return ESP_OK;
  }

  uint8_t zone = 0;
  if (!parse_zone_from_uri_(req->uri, "/enabled", &zone)) {
    httpd_resp_set_status(req, "400 Bad Request");
    set_json_headers_(req);
    httpd_resp_sendstr(req, "{\"ok\":false,\"version\":\"v1\",\"error\":{\"code\":\"invalid_zone\",\"message\":\"Zone must be in range 1..6\"}}");
    return ESP_OK;
  }

  char enabled_buf[16] = {0};
  if (!get_query_value_(req, "enabled", enabled_buf, sizeof(enabled_buf))) {
    httpd_resp_set_status(req, "400 Bad Request");
    set_json_headers_(req);
    httpd_resp_sendstr(req, "{\"ok\":false,\"version\":\"v1\",\"error\":{\"code\":\"missing_enabled\",\"message\":\"enabled query parameter is required\"}}");
    return ESP_OK;
  }

  bool enabled = false;
  if (strcmp(enabled_buf, "1") == 0 || strcasecmp(enabled_buf, "true") == 0 || strcasecmp(enabled_buf, "on") == 0) {
    enabled = true;
  } else if (strcmp(enabled_buf, "0") == 0 || strcasecmp(enabled_buf, "false") == 0 || strcasecmp(enabled_buf, "off") == 0) {
    enabled = false;
  } else {
    httpd_resp_set_status(req, "400 Bad Request");
    set_json_headers_(req);
    httpd_resp_sendstr(req, "{\"ok\":false,\"version\":\"v1\",\"error\":{\"code\":\"invalid_enabled\",\"message\":\"enabled must be true/false or 1/0\"}}");
    return ESP_OK;
  }

  self->zone_controller_->set_zone_enabled(static_cast<uint8_t>(zone - 1), enabled);

  char payload[192];
  snprintf(payload, sizeof(payload),
           "{\"ok\":true,\"version\":\"v1\",\"data\":{\"zone\":%u,\"enabled\":%s}}",
           static_cast<unsigned>(zone), enabled ? "true" : "false");

  set_json_headers_(req);
  httpd_resp_send(req, payload, HTTPD_RESP_USE_STRLEN);
  return ESP_OK;
}

esp_err_t Hv6WebApi::commands_handler_(httpd_req_t *req) {
  auto *self = static_cast<Hv6WebApi *>(req->user_ctx);
  if (self == nullptr || self->valve_controller_ == nullptr) {
    httpd_resp_set_status(req, "500 Internal Server Error");
    set_json_headers_(req);
    httpd_resp_sendstr(req, "{\"ok\":false,\"version\":\"v1\",\"error\":{\"code\":\"valve_controller_unavailable\",\"message\":\"Valve controller unavailable\"}}");
    return ESP_OK;
  }

  char command_buf[64] = {0};
  if (!get_query_value_(req, "command", command_buf, sizeof(command_buf))) {
    httpd_resp_set_status(req, "400 Bad Request");
    set_json_headers_(req);
    httpd_resp_sendstr(req, "{\"ok\":false,\"version\":\"v1\",\"error\":{\"code\":\"missing_command\",\"message\":\"command query parameter is required\"}}");
    return ESP_OK;
  }

  int zone_index = -1;
  char zone_buf[8] = {0};
  if (get_query_value_(req, "zone", zone_buf, sizeof(zone_buf))) {
    const int zone_num = atoi(zone_buf);
    if (zone_num < 1 || zone_num > NUM_ZONES) {
      httpd_resp_set_status(req, "400 Bad Request");
      set_json_headers_(req);
      httpd_resp_sendstr(req, "{\"ok\":false,\"version\":\"v1\",\"error\":{\"code\":\"invalid_zone\",\"message\":\"zone must be in range 1..6\"}}");
      return ESP_OK;
    }
    zone_index = zone_num - 1;
  }

  bool accepted = true;
  const char *result = "accepted";

  if (strcasecmp(command_buf, "calibrate_all_motors") == 0) {
    self->valve_controller_->request_calibration_all();
  } else if (strcasecmp(command_buf, "i2c_scan") == 0) {
    self->valve_controller_->log_i2c_scan();
  } else if (strcasecmp(command_buf, "motor_reset_fault") == 0) {
    if (zone_index < 0) {
      httpd_resp_set_status(req, "400 Bad Request");
      set_json_headers_(req);
      httpd_resp_sendstr(req, "{\"ok\":false,\"version\":\"v1\",\"error\":{\"code\":\"missing_zone\",\"message\":\"zone is required for motor_reset_fault\"}}");
      return ESP_OK;
    }
    accepted = self->valve_controller_->reset_fault(static_cast<uint8_t>(zone_index));
    result = accepted ? "accepted" : "rejected_busy";
  } else if (strcasecmp(command_buf, "motor_reset_and_relearn") == 0) {
    if (zone_index < 0) {
      httpd_resp_set_status(req, "400 Bad Request");
      set_json_headers_(req);
      httpd_resp_sendstr(req, "{\"ok\":false,\"version\":\"v1\",\"error\":{\"code\":\"missing_zone\",\"message\":\"zone is required for motor_reset_and_relearn\"}}");
      return ESP_OK;
    }
    accepted = self->valve_controller_->reset_and_relearn(static_cast<uint8_t>(zone_index));
    result = accepted ? "accepted" : "rejected_busy";
  } else if (strcasecmp(command_buf, "motor_reset_learned_factors") == 0) {
    if (zone_index < 0) {
      httpd_resp_set_status(req, "400 Bad Request");
      set_json_headers_(req);
      httpd_resp_sendstr(req, "{\"ok\":false,\"version\":\"v1\",\"error\":{\"code\":\"missing_zone\",\"message\":\"zone is required for motor_reset_learned_factors\"}}");
      return ESP_OK;
    }
    accepted = self->valve_controller_->reset_learned_factors(static_cast<uint8_t>(zone_index));
    result = accepted ? "accepted" : "rejected_busy";
  } else {
    httpd_resp_set_status(req, "400 Bad Request");
    set_json_headers_(req);
    httpd_resp_sendstr(req, "{\"ok\":false,\"version\":\"v1\",\"error\":{\"code\":\"unknown_command\",\"message\":\"Unsupported command\"}}");
    return ESP_OK;
  }

  if (!accepted) {
    httpd_resp_set_status(req, "409 Conflict");
  }

  char payload[256];
  if (zone_index >= 0) {
    snprintf(payload, sizeof(payload),
             "{\"ok\":%s,\"version\":\"v1\",\"data\":{\"command\":\"%s\",\"zone\":%d,\"result\":\"%s\"}}",
             accepted ? "true" : "false",
             command_buf,
             zone_index + 1,
             result);
  } else {
    snprintf(payload, sizeof(payload),
             "{\"ok\":%s,\"version\":\"v1\",\"data\":{\"command\":\"%s\",\"result\":\"%s\"}}",
             accepted ? "true" : "false",
             command_buf,
             result);
  }

  set_json_headers_(req);
  httpd_resp_send(req, payload, HTTPD_RESP_USE_STRLEN);
  return ESP_OK;
}

esp_err_t Hv6WebApi::motor_target_handler_(httpd_req_t *req) {
  auto *self = static_cast<Hv6WebApi *>(req->user_ctx);
  if (self == nullptr || self->valve_controller_ == nullptr) {
    httpd_resp_set_status(req, "500 Internal Server Error");
    set_json_headers_(req);
    httpd_resp_sendstr(req, "{\"ok\":false,\"version\":\"v1\",\"error\":{\"code\":\"valve_controller_unavailable\",\"message\":\"Valve controller unavailable\"}}");
    return ESP_OK;
  }

  uint8_t zone = 0;
  if (!parse_motor_from_uri_(req->uri, "/target", &zone)) {
    httpd_resp_set_status(req, "400 Bad Request");
    set_json_headers_(req);
    httpd_resp_sendstr(req, "{\"ok\":false,\"version\":\"v1\",\"error\":{\"code\":\"invalid_zone\",\"message\":\"Zone must be in range 1..6\"}}");
    return ESP_OK;
  }

  char value_buf[24] = {0};
  if (!get_query_value_(req, "value", value_buf, sizeof(value_buf))) {
    httpd_resp_set_status(req, "400 Bad Request");
    set_json_headers_(req);
    httpd_resp_sendstr(req, "{\"ok\":false,\"version\":\"v1\",\"error\":{\"code\":\"missing_value\",\"message\":\"value query parameter is required\"}}");
    return ESP_OK;
  }

  float target = strtof(value_buf, nullptr);
  if (!std::isfinite(target)) {
    httpd_resp_set_status(req, "400 Bad Request");
    set_json_headers_(req);
    httpd_resp_sendstr(req, "{\"ok\":false,\"version\":\"v1\",\"error\":{\"code\":\"invalid_value\",\"message\":\"value must be numeric\"}}");
    return ESP_OK;
  }
  if (target < 0.0f) target = 0.0f;
  if (target > 100.0f) target = 100.0f;

  const bool ok = self->valve_controller_->request_position(static_cast<uint8_t>(zone - 1), target);
  if (!ok)
    httpd_resp_set_status(req, "409 Conflict");

  char payload[192];
  snprintf(payload, sizeof(payload),
           "{\"ok\":%s,\"version\":\"v1\",\"data\":{\"zone\":%u,\"target_pct\":%.1f}}",
           ok ? "true" : "false", static_cast<unsigned>(zone), target);
  set_json_headers_(req);
  httpd_resp_send(req, payload, HTTPD_RESP_USE_STRLEN);
  return ESP_OK;
}

esp_err_t Hv6WebApi::motor_open_handler_(httpd_req_t *req) {
  auto *self = static_cast<Hv6WebApi *>(req->user_ctx);
  if (self == nullptr || self->valve_controller_ == nullptr) {
    httpd_resp_set_status(req, "500 Internal Server Error");
    set_json_headers_(req);
    httpd_resp_sendstr(req, "{\"ok\":false,\"version\":\"v1\",\"error\":{\"code\":\"valve_controller_unavailable\",\"message\":\"Valve controller unavailable\"}}");
    return ESP_OK;
  }
  uint8_t zone = 0;
  if (!parse_motor_from_uri_(req->uri, "/open", &zone)) {
    httpd_resp_set_status(req, "400 Bad Request");
    set_json_headers_(req);
    httpd_resp_sendstr(req, "{\"ok\":false,\"version\":\"v1\",\"error\":{\"code\":\"invalid_zone\",\"message\":\"Zone must be in range 1..6\"}}");
    return ESP_OK;
  }
  const bool ok = self->valve_controller_->request_position(static_cast<uint8_t>(zone - 1), 100.0f);
  if (!ok)
    httpd_resp_set_status(req, "409 Conflict");
  char payload[160];
  snprintf(payload, sizeof(payload), "{\"ok\":%s,\"version\":\"v1\",\"data\":{\"zone\":%u,\"action\":\"open\"}}",
           ok ? "true" : "false", static_cast<unsigned>(zone));
  set_json_headers_(req);
  httpd_resp_send(req, payload, HTTPD_RESP_USE_STRLEN);
  return ESP_OK;
}

esp_err_t Hv6WebApi::motor_open_timed_handler_(httpd_req_t *req) {
  auto *self = static_cast<Hv6WebApi *>(req->user_ctx);
  if (self == nullptr || self->valve_controller_ == nullptr) {
    httpd_resp_set_status(req, "500 Internal Server Error");
    set_json_headers_(req);
    httpd_resp_sendstr(req, "{\"ok\":false,\"version\":\"v1\",\"error\":{\"code\":\"valve_controller_unavailable\",\"message\":\"Valve controller unavailable\"}}");
    return ESP_OK;
  }
  uint8_t zone = 0;
  if (!parse_motor_from_uri_(req->uri, "/open_timed", &zone)) {
    httpd_resp_set_status(req, "400 Bad Request");
    set_json_headers_(req);
    httpd_resp_sendstr(req, "{\"ok\":false,\"version\":\"v1\",\"error\":{\"code\":\"invalid_zone\",\"message\":\"Zone must be in range 1..6\"}}");
    return ESP_OK;
  }
  uint16_t duration_ms = 10000;
  char dur_buf[16] = {0};
  if (get_query_value_(req, "duration_ms", dur_buf, sizeof(dur_buf))) {
    const long d = strtol(dur_buf, nullptr, 10);
    if (d > 0 && d <= 60000)
      duration_ms = static_cast<uint16_t>(d);
  }
  const bool ok = self->valve_controller_->request_timed_open(static_cast<uint8_t>(zone - 1), duration_ms);
  if (!ok)
    httpd_resp_set_status(req, "409 Conflict");
  char payload[200];
  snprintf(payload, sizeof(payload), "{\"ok\":%s,\"version\":\"v1\",\"data\":{\"zone\":%u,\"action\":\"open_timed\",\"duration_ms\":%u}}",
           ok ? "true" : "false", static_cast<unsigned>(zone), static_cast<unsigned>(duration_ms));
  set_json_headers_(req);
  httpd_resp_send(req, payload, HTTPD_RESP_USE_STRLEN);
  return ESP_OK;
}

esp_err_t Hv6WebApi::motor_close_handler_(httpd_req_t *req) {
  auto *self = static_cast<Hv6WebApi *>(req->user_ctx);
  if (self == nullptr || self->valve_controller_ == nullptr) {
    httpd_resp_set_status(req, "500 Internal Server Error");
    set_json_headers_(req);
    httpd_resp_sendstr(req, "{\"ok\":false,\"version\":\"v1\",\"error\":{\"code\":\"valve_controller_unavailable\",\"message\":\"Valve controller unavailable\"}}");
    return ESP_OK;
  }
  uint8_t zone = 0;
  if (!parse_motor_from_uri_(req->uri, "/close", &zone)) {
    httpd_resp_set_status(req, "400 Bad Request");
    set_json_headers_(req);
    httpd_resp_sendstr(req, "{\"ok\":false,\"version\":\"v1\",\"error\":{\"code\":\"invalid_zone\",\"message\":\"Zone must be in range 1..6\"}}");
    return ESP_OK;
  }
  const bool ok = self->valve_controller_->request_position(static_cast<uint8_t>(zone - 1), 0.0f);
  if (!ok)
    httpd_resp_set_status(req, "409 Conflict");
  char payload[160];
  snprintf(payload, sizeof(payload), "{\"ok\":%s,\"version\":\"v1\",\"data\":{\"zone\":%u,\"action\":\"close\"}}",
           ok ? "true" : "false", static_cast<unsigned>(zone));
  set_json_headers_(req);
  httpd_resp_send(req, payload, HTTPD_RESP_USE_STRLEN);
  return ESP_OK;
}

esp_err_t Hv6WebApi::motor_close_timed_handler_(httpd_req_t *req) {
  auto *self = static_cast<Hv6WebApi *>(req->user_ctx);
  if (self == nullptr || self->valve_controller_ == nullptr) {
    httpd_resp_set_status(req, "500 Internal Server Error");
    set_json_headers_(req);
    httpd_resp_sendstr(req, "{\"ok\":false,\"version\":\"v1\",\"error\":{\"code\":\"valve_controller_unavailable\",\"message\":\"Valve controller unavailable\"}}");
    return ESP_OK;
  }
  uint8_t zone = 0;
  if (!parse_motor_from_uri_(req->uri, "/close_timed", &zone)) {
    httpd_resp_set_status(req, "400 Bad Request");
    set_json_headers_(req);
    httpd_resp_sendstr(req, "{\"ok\":false,\"version\":\"v1\",\"error\":{\"code\":\"invalid_zone\",\"message\":\"Zone must be in range 1..6\"}}");
    return ESP_OK;
  }
  uint16_t duration_ms = 10000;
  char dur_buf[16] = {0};
  if (get_query_value_(req, "duration_ms", dur_buf, sizeof(dur_buf))) {
    const long d = strtol(dur_buf, nullptr, 10);
    if (d > 0 && d <= 60000)
      duration_ms = static_cast<uint16_t>(d);
  }
  const bool ok = self->valve_controller_->request_timed_close(static_cast<uint8_t>(zone - 1), duration_ms);
  if (!ok)
    httpd_resp_set_status(req, "409 Conflict");
  char payload[202];
  snprintf(payload, sizeof(payload), "{\"ok\":%s,\"version\":\"v1\",\"data\":{\"zone\":%u,\"action\":\"close_timed\",\"duration_ms\":%u}}",
           ok ? "true" : "false", static_cast<unsigned>(zone), static_cast<unsigned>(duration_ms));
  set_json_headers_(req);
  httpd_resp_send(req, payload, HTTPD_RESP_USE_STRLEN);
  return ESP_OK;
}

esp_err_t Hv6WebApi::motor_stop_handler_(httpd_req_t *req) {
  auto *self = static_cast<Hv6WebApi *>(req->user_ctx);
  if (self == nullptr || self->valve_controller_ == nullptr) {
    httpd_resp_set_status(req, "500 Internal Server Error");
    set_json_headers_(req);
    httpd_resp_sendstr(req, "{\"ok\":false,\"version\":\"v1\",\"error\":{\"code\":\"valve_controller_unavailable\",\"message\":\"Valve controller unavailable\"}}");
    return ESP_OK;
  }
  uint8_t zone = 0;
  if (!parse_motor_from_uri_(req->uri, "/stop", &zone)) {
    httpd_resp_set_status(req, "400 Bad Request");
    set_json_headers_(req);
    httpd_resp_sendstr(req, "{\"ok\":false,\"version\":\"v1\",\"error\":{\"code\":\"invalid_zone\",\"message\":\"Zone must be in range 1..6\"}}");
    return ESP_OK;
  }
  const bool ok = self->valve_controller_->request_stop(static_cast<uint8_t>(zone - 1));
  if (!ok)
    httpd_resp_set_status(req, "409 Conflict");
  char payload[160];
  snprintf(payload, sizeof(payload), "{\"ok\":%s,\"version\":\"v1\",\"data\":{\"zone\":%u,\"action\":\"stop\"}}",
           ok ? "true" : "false", static_cast<unsigned>(zone));
  set_json_headers_(req);
  httpd_resp_send(req, payload, HTTPD_RESP_USE_STRLEN);
  return ESP_OK;
}

esp_err_t Hv6WebApi::drivers_enabled_handler_(httpd_req_t *req) {
  auto *self = static_cast<Hv6WebApi *>(req->user_ctx);
  if (self == nullptr || self->valve_controller_ == nullptr) {
    httpd_resp_set_status(req, "500 Internal Server Error");
    set_json_headers_(req);
    httpd_resp_sendstr(req, "{\"ok\":false,\"version\":\"v1\",\"error\":{\"code\":\"valve_controller_unavailable\",\"message\":\"Valve controller unavailable\"}}");
    return ESP_OK;
  }
  char enabled_buf[16] = {0};
  if (!get_query_value_(req, "enabled", enabled_buf, sizeof(enabled_buf))) {
    httpd_resp_set_status(req, "400 Bad Request");
    set_json_headers_(req);
    httpd_resp_sendstr(req, "{\"ok\":false,\"version\":\"v1\",\"error\":{\"code\":\"missing_enabled\",\"message\":\"enabled query parameter is required\"}}");
    return ESP_OK;
  }
  bool enabled = false;
  if (!parse_bool_(enabled_buf, &enabled)) {
    httpd_resp_set_status(req, "400 Bad Request");
    set_json_headers_(req);
    httpd_resp_sendstr(req, "{\"ok\":false,\"version\":\"v1\",\"error\":{\"code\":\"invalid_enabled\",\"message\":\"enabled must be true/false or 1/0\"}}");
    return ESP_OK;
  }
  self->valve_controller_->set_drivers_enabled(enabled);
  char payload[160];
  snprintf(payload, sizeof(payload), "{\"ok\":true,\"version\":\"v1\",\"data\":{\"drivers_enabled\":%s}}", enabled ? "true" : "false");
  set_json_headers_(req);
  httpd_resp_send(req, payload, HTTPD_RESP_USE_STRLEN);
  return ESP_OK;
}

esp_err_t Hv6WebApi::auto_learn_handler_(httpd_req_t *req) {
  auto *self = static_cast<Hv6WebApi *>(req->user_ctx);
  if (self == nullptr || self->valve_controller_ == nullptr || self->config_store_ == nullptr) {
    httpd_resp_set_status(req, "500 Internal Server Error");
    set_json_headers_(req);
    httpd_resp_sendstr(req, "{\"ok\":false,\"version\":\"v1\",\"error\":{\"code\":\"dependencies_unavailable\",\"message\":\"Config/valve controller unavailable\"}}");
    return ESP_OK;
  }
  char enabled_buf[16] = {0};
  if (!get_query_value_(req, "enabled", enabled_buf, sizeof(enabled_buf))) {
    httpd_resp_set_status(req, "400 Bad Request");
    set_json_headers_(req);
    httpd_resp_sendstr(req, "{\"ok\":false,\"version\":\"v1\",\"error\":{\"code\":\"missing_enabled\",\"message\":\"enabled query parameter is required\"}}");
    return ESP_OK;
  }
  bool enabled = false;
  if (!parse_bool_(enabled_buf, &enabled)) {
    httpd_resp_set_status(req, "400 Bad Request");
    set_json_headers_(req);
    httpd_resp_sendstr(req, "{\"ok\":false,\"version\":\"v1\",\"error\":{\"code\":\"invalid_enabled\",\"message\":\"enabled must be true/false or 1/0\"}}");
    return ESP_OK;
  }

  auto cfg = self->config_store_->get_config();
  cfg.motor.auto_apply_learned_factors = enabled;
  self->config_store_->update_motor(cfg.motor);
  self->valve_controller_->reload_motor_config();

  char payload[176];
  snprintf(payload, sizeof(payload), "{\"ok\":true,\"version\":\"v1\",\"data\":{\"auto_apply_learned_factors\":%s}}", enabled ? "true" : "false");
  set_json_headers_(req);
  httpd_resp_send(req, payload, HTTPD_RESP_USE_STRLEN);
  return ESP_OK;
}

esp_err_t Hv6WebApi::settings_select_handler_(httpd_req_t *req) {
  auto *self = static_cast<Hv6WebApi *>(req->user_ctx);
  if (self == nullptr || self->zone_controller_ == nullptr || self->config_store_ == nullptr || self->valve_controller_ == nullptr) {
    httpd_resp_set_status(req, "500 Internal Server Error");
    set_json_headers_(req);
    httpd_resp_sendstr(req, "{\"ok\":false,\"version\":\"v1\",\"error\":{\"code\":\"dependencies_unavailable\",\"message\":\"Dependencies unavailable\"}}");
    return ESP_OK;
  }

  char key[64] = {0};
  char value[96] = {0};
  if (!get_query_value_(req, "key", key, sizeof(key)) || !get_query_value_(req, "value", value, sizeof(value))) {
    httpd_resp_set_status(req, "400 Bad Request");
    set_json_headers_(req);
    httpd_resp_sendstr(req, "{\"ok\":false,\"version\":\"v1\",\"error\":{\"code\":\"missing_params\",\"message\":\"key and value are required\"}}");
    return ESP_OK;
  }

  int zone = -1;
  char zone_buf[8] = {0};
  if (get_query_value_(req, "zone", zone_buf, sizeof(zone_buf))) {
    zone = atoi(zone_buf);
  }

  bool ok = true;
  if (strcasecmp(key, "zone_probe") == 0) {
    int8_t probe = -1;
    ok = (zone >= 1 && zone <= NUM_ZONES) && parse_probe_option_(value, &probe);
    if (ok) self->zone_controller_->set_zone_probe(static_cast<uint8_t>(zone - 1), probe);
  } else if (strcasecmp(key, "manifold_flow_probe") == 0) {
    int8_t probe = -1;
    ok = parse_probe_option_(value, &probe);
    if (ok) self->zone_controller_->set_manifold_flow_probe(probe);
  } else if (strcasecmp(key, "manifold_return_probe") == 0) {
    int8_t probe = -1;
    ok = parse_probe_option_(value, &probe);
    if (ok) self->zone_controller_->set_manifold_return_probe(probe);
  } else if (strcasecmp(key, "zone_temp_source") == 0) {
    TempSource source = TempSource::LOCAL_PROBE;
    ok = (zone >= 1 && zone <= NUM_ZONES) && parse_temp_source_(value, &source);
    if (ok) self->zone_controller_->set_zone_temp_source(static_cast<uint8_t>(zone - 1), source);
  } else if (strcasecmp(key, "zone_sync_to") == 0) {
    ok = (zone >= 1 && zone <= NUM_ZONES);
    if (ok) {
      int8_t sync_to = -1;
      if (strcasecmp(value, "None") == 0) {
        sync_to = -1;
      } else {
        int target = 0;
        if (sscanf(value, "Zone %d", &target) == 1 && target >= 1 && target <= NUM_ZONES) {
          sync_to = static_cast<int8_t>(target - 1);
        } else {
          ok = false;
        }
      }
      if (ok) self->zone_controller_->set_zone_sync(static_cast<uint8_t>(zone - 1), sync_to);
    }
  } else if (strcasecmp(key, "zone_pipe_type") == 0) {
    PipeType type = PipeType::PEX_16X2;
    ok = (zone >= 1 && zone <= NUM_ZONES) && parse_pipe_type_(value, &type);
    if (ok) self->zone_controller_->set_zone_pipe_type(static_cast<uint8_t>(zone - 1), type);
  } else if (strcasecmp(key, "zone_motor_profile") == 0) {
    MotorProfile profile = MotorProfile::INHERIT;
    ok = (zone >= 1 && zone <= NUM_ZONES) && parse_motor_profile_(value, &profile);
    if (ok) {
      auto cfg = self->config_store_->get_config();
      cfg.zones[zone - 1].motor_profile_override = profile;
      self->config_store_->update_zone(static_cast<uint8_t>(zone - 1), cfg.zones[zone - 1]);
      self->valve_controller_->reload_motor_config();
    }
  } else if (strcasecmp(key, "motor_profile_default") == 0) {
    MotorProfile profile = MotorProfile::HMIP_VDMOT;
    ok = parse_motor_profile_(value, &profile);
    if (ok) {
      auto cfg = self->config_store_->get_config();
      cfg.motor.default_profile = profile;
      if (profile == MotorProfile::HMIP_VDMOT) {
        cfg.motor.hmip_vdmot_runtime_limit_s = HMIP_VDMOT_SAFE_RUNTIME_S;
      } else if (profile == MotorProfile::GENERIC) {
        if (cfg.motor.generic_profile_runtime_limit_s == 0) {
          cfg.motor.generic_profile_runtime_limit_s = GENERIC_SAFE_RUNTIME_DEFAULT_S;
        }
      }
      self->config_store_->update_motor(cfg.motor);
      self->valve_controller_->reload_motor_config();
    }
  } else if (strcasecmp(key, "manifold_type") == 0) {
    ManifoldType type = ManifoldType::NC;
    if (strncasecmp(value, "NC", 2) == 0)
      type = ManifoldType::NC;
    else if (strncasecmp(value, "NO", 2) == 0)
      type = ManifoldType::NO;
    else
      ok = false;
    if (ok) self->valve_controller_->set_manifold_type(type);
  } else {
    ok = false;
  }

  if (!ok) {
    httpd_resp_set_status(req, "400 Bad Request");
    set_json_headers_(req);
    httpd_resp_sendstr(req, "{\"ok\":false,\"version\":\"v1\",\"error\":{\"code\":\"unsupported_or_invalid\",\"message\":\"Unsupported key or invalid value\"}}");
    return ESP_OK;
  }

  set_json_headers_(req);
  httpd_resp_sendstr(req, "{\"ok\":true,\"version\":\"v1\"}");
  return ESP_OK;
}

esp_err_t Hv6WebApi::settings_number_handler_(httpd_req_t *req) {
  auto *self = static_cast<Hv6WebApi *>(req->user_ctx);
  if (self == nullptr || self->zone_controller_ == nullptr || self->config_store_ == nullptr || self->valve_controller_ == nullptr) {
    httpd_resp_set_status(req, "500 Internal Server Error");
    set_json_headers_(req);
    httpd_resp_sendstr(req, "{\"ok\":false,\"version\":\"v1\",\"error\":{\"code\":\"dependencies_unavailable\",\"message\":\"Dependencies unavailable\"}}");
    return ESP_OK;
  }

  char key[64] = {0};
  char value[64] = {0};
  if (!get_query_value_(req, "key", key, sizeof(key)) || !get_query_value_(req, "value", value, sizeof(value))) {
    httpd_resp_set_status(req, "400 Bad Request");
    set_json_headers_(req);
    httpd_resp_sendstr(req, "{\"ok\":false,\"version\":\"v1\",\"error\":{\"code\":\"missing_params\",\"message\":\"key and value are required\"}}");
    return ESP_OK;
  }
  float v = strtof(value, nullptr);
  if (!std::isfinite(v)) {
    httpd_resp_set_status(req, "400 Bad Request");
    set_json_headers_(req);
    httpd_resp_sendstr(req, "{\"ok\":false,\"version\":\"v1\",\"error\":{\"code\":\"invalid_value\",\"message\":\"value must be numeric\"}}");
    return ESP_OK;
  }

  int zone = -1;
  char zone_buf[8] = {0};
  if (get_query_value_(req, "zone", zone_buf, sizeof(zone_buf))) {
    zone = atoi(zone_buf);
  }

  bool ok = true;
  if (strcasecmp(key, "zone_area_m2") == 0) {
    ok = zone >= 1 && zone <= NUM_ZONES;
    if (ok) self->zone_controller_->set_zone_area_m2(static_cast<uint8_t>(zone - 1), v);
  } else if (strcasecmp(key, "zone_pipe_spacing_mm") == 0) {
    ok = zone >= 1 && zone <= NUM_ZONES;
    if (ok) self->zone_controller_->set_zone_pipe_spacing_mm(static_cast<uint8_t>(zone - 1), v);
  } else if (strcasecmp(key, "selected_zone") == 0) {
    ok = true;
  } else {
    auto cfg = self->config_store_->get_config();
    if (strcasecmp(key, "close_threshold_multiplier") == 0) cfg.motor.close_current_factor = v;
    else if (strcasecmp(key, "close_slope_threshold") == 0) cfg.motor.close_slope_threshold_ma_per_s = v;
    else if (strcasecmp(key, "close_slope_current_factor") == 0) cfg.motor.close_slope_current_factor = v;
    else if (strcasecmp(key, "open_threshold_multiplier") == 0) cfg.motor.open_current_factor = v;
    else if (strcasecmp(key, "open_slope_threshold") == 0) cfg.motor.open_slope_threshold_ma_per_s = v;
    else if (strcasecmp(key, "open_slope_current_factor") == 0) cfg.motor.open_slope_current_factor = v;
    else if (strcasecmp(key, "open_ripple_limit_factor") == 0) cfg.motor.open_ripple_limit_factor = v;
    else if (strcasecmp(key, "pin_engage_step") == 0) cfg.motor.pin_engage_step_ma = v;
    else if (strcasecmp(key, "pin_engage_margin") == 0) cfg.motor.pin_engage_margin_ripples = static_cast<uint16_t>(v);
    else if (strcasecmp(key, "generic_runtime_limit_seconds") == 0) {
      const uint32_t value_u32 = static_cast<uint32_t>(v);
      cfg.motor.generic_profile_runtime_limit_s = value_u32 > 0 ? value_u32 : GENERIC_SAFE_RUNTIME_DEFAULT_S;
    }
    else if (strcasecmp(key, "hmip_runtime_limit_seconds") == 0) {
      cfg.motor.hmip_vdmot_runtime_limit_s = HMIP_VDMOT_SAFE_RUNTIME_S;
    }
    else if (strcasecmp(key, "learned_factor_min_samples") == 0) cfg.motor.learned_factor_min_samples = static_cast<uint8_t>(v);
    else if (strcasecmp(key, "learned_factor_max_deviation_pct") == 0) cfg.motor.learned_factor_max_deviation_pct = v / 100.0f;
    else ok = false;

    if (ok) {
      self->config_store_->update_motor(cfg.motor);
      self->valve_controller_->reload_motor_config();
    }
  }

  if (!ok) {
    httpd_resp_set_status(req, "400 Bad Request");
    set_json_headers_(req);
    httpd_resp_sendstr(req, "{\"ok\":false,\"version\":\"v1\",\"error\":{\"code\":\"unsupported_or_invalid\",\"message\":\"Unsupported key or invalid value\"}}");
    return ESP_OK;
  }

  set_json_headers_(req);
  httpd_resp_sendstr(req, "{\"ok\":true,\"version\":\"v1\"}");
  return ESP_OK;
}

esp_err_t Hv6WebApi::settings_text_handler_(httpd_req_t *req) {
  auto *self = static_cast<Hv6WebApi *>(req->user_ctx);
  if (self == nullptr || self->zone_controller_ == nullptr) {
    httpd_resp_set_status(req, "500 Internal Server Error");
    set_json_headers_(req);
    httpd_resp_sendstr(req, "{\"ok\":false,\"version\":\"v1\",\"error\":{\"code\":\"dependencies_unavailable\",\"message\":\"Dependencies unavailable\"}}");
    return ESP_OK;
  }

  char key[64] = {0};
  char value[128] = {0};
  if (!get_query_value_(req, "key", key, sizeof(key)) || !get_query_value_(req, "value", value, sizeof(value))) {
    httpd_resp_set_status(req, "400 Bad Request");
    set_json_headers_(req);
    httpd_resp_sendstr(req, "{\"ok\":false,\"version\":\"v1\",\"error\":{\"code\":\"missing_params\",\"message\":\"key and value are required\"}}");
    return ESP_OK;
  }

  int zone = -1;
  char zone_buf[8] = {0};
  if (get_query_value_(req, "zone", zone_buf, sizeof(zone_buf))) {
    zone = atoi(zone_buf);
  }

  bool ok = true;
  if (strcasecmp(key, "zone_zigbee_device") == 0) {
    ok = zone >= 1 && zone <= NUM_ZONES;
    if (ok) self->zone_controller_->set_zone_mqtt_device(static_cast<uint8_t>(zone - 1), std::string(value));
  } else if (strcasecmp(key, "zone_ble_mac") == 0) {
    ok = zone >= 1 && zone <= NUM_ZONES;
    if (ok) self->zone_controller_->set_zone_ble_mac(static_cast<uint8_t>(zone - 1), std::string(value));
  } else if (strcasecmp(key, "zone_exterior_walls") == 0) {
    ok = zone >= 1 && zone <= NUM_ZONES;
    if (ok) self->zone_controller_->set_zone_exterior_walls(static_cast<uint8_t>(zone - 1), parse_exterior_walls_(value));
  } else if (strcasecmp(key, "mqtt_broker_host") == 0) {
    self->zone_controller_->set_mqtt_broker(std::string(value));
  } else if (strcasecmp(key, "mqtt_broker_port") == 0) {
    int port = atoi(value);
    ok = port > 0 && port <= 65535;
    if (ok) self->zone_controller_->set_mqtt_port(static_cast<uint16_t>(port));
  } else if (strcasecmp(key, "mqtt_broker_username") == 0) {
    self->zone_controller_->set_mqtt_username(std::string(value));
  } else if (strcasecmp(key, "mqtt_broker_password") == 0) {
    self->zone_controller_->set_mqtt_password(std::string(value));
  } else {
    ok = false;
  }

  if (!ok) {
    httpd_resp_set_status(req, "400 Bad Request");
    set_json_headers_(req);
    httpd_resp_sendstr(req, "{\"ok\":false,\"version\":\"v1\",\"error\":{\"code\":\"unsupported_or_invalid\",\"message\":\"Unsupported key or invalid value\"}}");
    return ESP_OK;
  }

  set_json_headers_(req);
  httpd_resp_sendstr(req, "{\"ok\":true,\"version\":\"v1\"}");
  return ESP_OK;
}

esp_err_t Hv6WebApi::manual_mode_handler_(httpd_req_t *req) {
  auto *self = static_cast<Hv6WebApi *>(req->user_ctx);
  if (self == nullptr || self->zone_controller_ == nullptr) {
    httpd_resp_set_status(req, "500 Internal Server Error");
    set_json_headers_(req);
    httpd_resp_sendstr(req, "{\"ok\":false,\"version\":\"v1\",\"error\":{\"code\":\"zone_controller_unavailable\",\"message\":\"Zone controller unavailable\"}}");
    return ESP_OK;
  }
  char enabled_buf[16] = {0};
  if (!get_query_value_(req, "enabled", enabled_buf, sizeof(enabled_buf))) {
    httpd_resp_set_status(req, "400 Bad Request");
    set_json_headers_(req);
    httpd_resp_sendstr(req, "{\"ok\":false,\"version\":\"v1\",\"error\":{\"code\":\"missing_enabled\",\"message\":\"enabled query parameter is required\"}}");
    return ESP_OK;
  }
  bool enabled = false;
  if (!parse_bool_(enabled_buf, &enabled)) {
    httpd_resp_set_status(req, "400 Bad Request");
    set_json_headers_(req);
    httpd_resp_sendstr(req, "{\"ok\":false,\"version\":\"v1\",\"error\":{\"code\":\"invalid_enabled\",\"message\":\"enabled must be true/false or 1/0\"}}");
    return ESP_OK;
  }
  self->zone_controller_->set_manual_mode(enabled);
  char payload[144];
  snprintf(payload, sizeof(payload), "{\"ok\":true,\"version\":\"v1\",\"data\":{\"manual_mode\":%s}}", enabled ? "true" : "false");
  set_json_headers_(req);
  httpd_resp_send(req, payload, HTTPD_RESP_USE_STRLEN);
  return ESP_OK;
}

bool Hv6WebApi::canHandle(AsyncWebServerRequest *request) const {
  if (request == nullptr)
    return false;
  char url_buf[AsyncWebServerRequest::URL_BUF_SIZE];
  const auto url = request->url_to(url_buf);

  // Dashboard assets
  if (url == "/dashboard" || url == "/dashboard/") {
    ESP_LOGV(TAG, "canHandle: /dashboard route matched");
    return true;
  }
  #ifdef HV6_HAS_DASHBOARD
  if (url == "/dashboard.js" || url == "/dashboard.css") {
    ESP_LOGV(TAG, "canHandle: /dashboard.{js,css} route matched");
    return true;
  }
  #endif

  // All API routes
  static const char kApiPrefix[] = "/api/hv6/v1/";
  const bool is_api = strncmp(url_buf, kApiPrefix, sizeof(kApiPrefix) - 1) == 0;
  if (is_api) {
    ESP_LOGV(TAG, "canHandle: /api/hv6/v1 route matched: %s", url_buf);
  }
  return is_api;
}

void Hv6WebApi::handleRequest(AsyncWebServerRequest *request) {
  if (request == nullptr) return;
  
  char url_buf[AsyncWebServerRequest::URL_BUF_SIZE];
  const auto url = request->url_to(url_buf);
  const int method = request->method();

  // ── Dashboard ──────────────────────────────────────────────────────────────
  if ((url == "/dashboard" || url == "/dashboard/") && method == HTTP_GET) {
    #ifdef HV6_HAS_DASHBOARD
    request->send(200, "text/html", DASHBOARD_HTML);
    #else
    request->send(404, "text/plain", "Dashboard not built");
    #endif
    return;
  }
  #ifdef HV6_HAS_DASHBOARD
  if (method == HTTP_GET && url == "/dashboard.js") {
    AsyncWebServerResponse *response = request->beginResponse(200, "application/javascript; charset=utf-8", (const uint8_t *)HV6_DASHBOARD_JS_DATA, HV6_DASHBOARD_JS_SIZE);
    response->addHeader("Content-Encoding", "gzip");
    request->send(response);
    return;
  }
  if (method == HTTP_GET && url == "/dashboard.css") {
    AsyncWebServerResponse *response = request->beginResponse(200, "text/css; charset=utf-8", (const uint8_t *)HV6_DASHBOARD_CSS_DATA, HV6_DASHBOARD_CSS_SIZE);
    response->addHeader("Content-Encoding", "gzip");
    request->send(response);
    return;
  }
  #endif


  // ── API routes ─────────────────────────────────────────────────────────────
  // Add CORS header for API routes
  if (url == "/api/hv6/v1/zones") {
    AsyncWebServerResponse *response = request->beginResponse(200, "application/json", "{\"ok\":true,\"version\":\"v1\",\"placeholder\":true}");
    response->addHeader("Access-Control-Allow-Origin", "*");
    response->addHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    request->send(response);
    return;
  }

  if (url == "/api/hv6/v1/settings/number" && method == HTTP_POST) {
    AsyncWebServerResponse *response = request->beginResponse(200, "application/json", "{\"ok\":true,\"msg\":\"Number setting updated (stub)\"}");
    response->addHeader("Access-Control-Allow-Origin", "*");
    response->addHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    request->send(response);
    return;
  }

  // Not found
  request->send(404, "text/plain", "Not found");
}

void Hv6WebApi::setup() {
  ESP_LOGI(TAG, "Initializing HV6 Web API on ESPHome web server (port 80)");

  auto *base = esphome::web_server_base::global_web_server_base;
  if (base == nullptr) {
    ESP_LOGE(TAG, "web_server_base unavailable — HV6 API will not start");
    return;
  }

  // base is already initialized by web_server_base component; just register our handler
  base->add_handler(this);
  ESP_LOGI(TAG, "HV6 API + dashboard registered on port 80");

  if (this->config_store_ == nullptr)  ESP_LOGW(TAG, "config_store_id is not wired");
  if (this->valve_controller_ == nullptr) ESP_LOGW(TAG, "valve_controller_id is not wired");
  if (this->zone_controller_ == nullptr)  ESP_LOGW(TAG, "zone_controller_id is not wired");
}

void Hv6WebApi::dump_config() {
  ESP_LOGCONFIG(TAG, "HV6 Web API:");
  ESP_LOGCONFIG(TAG, "  Port: 80 (ESPHome web server)");
  ESP_LOGCONFIG(TAG, "  Config store linked: %s", this->config_store_ != nullptr ? "yes" : "no");
  ESP_LOGCONFIG(TAG, "  Valve controller linked: %s", this->valve_controller_ != nullptr ? "yes" : "no");
  ESP_LOGCONFIG(TAG, "  Zone controller linked: %s", this->zone_controller_ != nullptr ? "yes" : "no");
}

}  // namespace hv6
