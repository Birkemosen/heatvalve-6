#include "heatvalve_dashboard.h"
#include "dashboard_html.h"
#include "esphome/components/climate/climate_mode.h"
#include "esphome/core/log.h"
#include "esphome/core/application.h"
#include <algorithm>
#include <cmath>
#include <cstring>
#include <cstdio>
#include <ctime>

namespace esphome {
namespace heatvalve_dashboard {

static const char *const TAG = "heatvalve_dashboard";

void HeatvalveDashboard::setup() {
  ESP_LOGI(TAG, "Setting up HeatValve-6 Dashboard on /dashboard");
  base_->init();
  base_->add_handler(this);
}

void HeatvalveDashboard::loop() {
  uint32_t now = millis();

  if (now - last_history_time_ >= 60000 || last_history_time_ == 0) {
    last_history_time_ = now;
    record_history_();
  }

  if (now - last_snapshot_time_ >= 1000 || last_snapshot_time_ == 0) {
    last_snapshot_time_ = now;
    update_snapshot_();
  }

  std::vector<DashboardAction> todo;
  {
    std::lock_guard<std::mutex> lock(action_lock_);
    if (action_queue_.empty()) return;
    todo = action_queue_;
    action_queue_.clear();
  }

  for (const auto &act : todo) {
    dispatch_set_(act.key, act.s_value, act.f_value, act.is_string);
  }
}

bool HeatvalveDashboard::canHandle(AsyncWebServerRequest *request) const {
  const auto &url = request->url();
  return (url == "/dashboard" || url == "/dashboard/" ||
          url == "/dashboard/state" || url == "/dashboard/set" ||
          url == "/dashboard/history" || url == "/dashboard/solver_history");
}

void HeatvalveDashboard::handleRequest(AsyncWebServerRequest *request) {
  const auto &url = request->url();
  if (url == "/dashboard" || url == "/dashboard/")
    handle_root_(request);
  else if (url == "/dashboard/state")
    handle_state_(request);
  else if (url == "/dashboard/set")
    handle_set_(request);
  else if (url == "/dashboard/history")
    handle_history_(request);
  else if (url == "/dashboard/solver_history")
    handle_solver_history_(request);
  else
    request->send(404, "text/plain", "Not found");
}

void HeatvalveDashboard::send_chunked_(AsyncWebServerRequest *request,
                                       const char *content_type,
                                       const uint8_t *data, size_t length,
                                       const char *cache_control) {
  httpd_req_t *req = *request;
  httpd_resp_set_status(req, "200 OK");
  httpd_resp_set_type(req, content_type);
  httpd_resp_set_hdr(req, "Content-Encoding", "gzip");
  if (cache_control != nullptr) {
    httpd_resp_set_hdr(req, "Cache-Control", cache_control);
  }

  size_t index = 0;
  size_t remaining = length;
  const size_t chunk_size = 2048;
  while (remaining > 0) {
    size_t to_send = (remaining < chunk_size) ? remaining : chunk_size;
    httpd_resp_send_chunk(req, (const char *)(data + index), to_send);
    index += to_send;
    remaining -= to_send;
  }
  httpd_resp_send_chunk(req, nullptr, 0);
}

void HeatvalveDashboard::handle_root_(AsyncWebServerRequest *request) {
  send_chunked_(request, "text/html", DASHBOARD_HTML_GZ, DASHBOARD_HTML_GZ_LEN, "no-cache");
}

void HeatvalveDashboard::handle_set_(AsyncWebServerRequest *request) {
  if (request->method() != HTTP_POST) {
    request->send(405, "text/plain", "Method Not Allowed");
    return;
  }

  httpd_req_t *req = *request;
  size_t content_len = req->content_len;
  if (content_len == 0 || content_len > 512) {
    request->send(400, "text/plain", "Bad Request");
    return;
  }

  char body[513] = {0};
  int received = httpd_req_recv(req, body, content_len);
  if (received <= 0) {
    request->send(400, "text/plain", "Read failed");
    return;
  }
  body[received] = '\0';

  ESP_LOGD(TAG, "POST body: %s", body);

  char key[64] = {0};
  const char *kp = strstr(body, "\"key\":");
  if (kp) {
    kp += 6;
    while (*kp == ' ' || *kp == '"') kp++;
    int i = 0;
    while (*kp && *kp != '"' && i < 63) key[i++] = *kp++;
  }
  if (strlen(key) == 0) {
    request->send(400, "text/plain", "Missing key");
    return;
  }

  char strval[128] = {0};
  float fval = 0.0f;
  bool is_string = false;

  const char *vp = strstr(body, "\"value\":");
  if (vp) {
    vp += 8;
    while (*vp == ' ') vp++;
    if (*vp == '"') {
      is_string = true;
      vp++;
      int i = 0;
      while (*vp && *vp != '"' && i < 127) strval[i++] = *vp++;
    } else {
      fval = static_cast<float>(atof(vp));
    }
  }

  ESP_LOGI(TAG, "Set: key=%s value=%s/%.2f", key,
           is_string ? strval : "-", is_string ? 0.0f : fval);

  {
    std::lock_guard<std::mutex> lock(action_lock_);
    action_queue_.push_back({std::string(key), std::string(strval), fval, is_string});
  }

  request->send(200, "application/json", "{\"ok\":true}");
}

void HeatvalveDashboard::dispatch_set_(const std::string &key,
                                       const std::string &sval, float fval,
                                       bool is_string) {
  // Climate setpoint: z1_setpoint .. z6_setpoint
  for (int i = 0; i < NUM_ZONES; i++) {
    char buf[16];
    snprintf(buf, sizeof(buf), "z%d_setpoint", i + 1);
    if (key == buf && climates_[i]) {
      auto call = climates_[i]->make_call();
      call.set_target_temperature(fval);
      call.perform();
      ESP_LOGI(TAG, "Zone %d setpoint: %.1f", i + 1, fval);
      return;
    }
  }

  // Climate preset: z1_preset .. z6_preset
  for (int i = 0; i < NUM_ZONES; i++) {
    char buf[16];
    snprintf(buf, sizeof(buf), "z%d_preset", i + 1);
    if (key == buf && climates_[i] && is_string) {
      auto call = climates_[i]->make_call();
      call.set_preset(sval);
      call.perform();
      ESP_LOGI(TAG, "Zone %d preset: %s", i + 1, sval.c_str());
      return;
    }
  }

  // Climate mode: z1_mode .. z6_mode
  for (int i = 0; i < NUM_ZONES; i++) {
    char buf[16];
    snprintf(buf, sizeof(buf), "z%d_mode", i + 1);
    if (key == buf && climates_[i] && is_string) {
      auto call = climates_[i]->make_call();
      if (sval == "heat")
        call.set_mode(climate::CLIMATE_MODE_HEAT);
      else if (sval == "off")
        call.set_mode(climate::CLIMATE_MODE_OFF);
      else if (sval == "auto")
        call.set_mode(climate::CLIMATE_MODE_AUTO);
      call.perform();
      ESP_LOGI(TAG, "Zone %d mode: %s", i + 1, sval.c_str());
      return;
    }
  }

  // Zone valve position: z1_position .. z6_position (0.0-1.0, or 0-100%)
  for (int i = 0; i < NUM_ZONES; i++) {
    char buf[16];
    snprintf(buf, sizeof(buf), "z%d_position", i + 1);
    if (key == buf && covers_[i]) {
      // Handle both percentage (0-100) and fraction (0-1) input
      float pos = fval;
      if (pos > 1.0f) pos = pos / 100.0f;  // Convert 0-100% to 0-1
      if (pos < 0.0f) pos = 0.0f;
      if (pos > 1.0f) pos = 1.0f;
      
      auto call = covers_[i]->make_call();
      call.set_position(pos);
      call.perform();
      ESP_LOGI(TAG, "Zone %d valve position: %.1f%%", i + 1, pos * 100.0f);
      return;
    }
  }

  // Zone area: z1_area .. z6_area
  for (int i = 0; i < NUM_ZONES; i++) {
    char buf[16];
    snprintf(buf, sizeof(buf), "z%d_area", i + 1);
    if (key == buf && zone_areas_[i]) {
      auto call = zone_areas_[i]->make_call();
      call.set_value(fval);
      call.perform();
      return;
    }
  }

  // Zone max opening: z1_max_opening .. z6_max_opening
  for (int i = 0; i < NUM_ZONES; i++) {
    char buf[24];
    snprintf(buf, sizeof(buf), "z%d_max_opening", i + 1);
    if (key == buf && zone_max_openings_[i]) {
      auto call = zone_max_openings_[i]->make_call();
      call.set_value(fval);
      call.perform();
      return;
    }
  }

  // Zone pipe type: z1_pipe_type .. z6_pipe_type
  for (int i = 0; i < NUM_ZONES; i++) {
    char buf[24];
    snprintf(buf, sizeof(buf), "z%d_pipe_type", i + 1);
    if (key == buf && zone_pipe_types_[i]) {
      auto call = zone_pipe_types_[i]->make_call();
      if (is_string) call.set_option(sval); else call.set_index((size_t) fval);
      call.perform();
      return;
    }
  }

  // Zone floor type: z1_floor_type .. z6_floor_type
  for (int i = 0; i < NUM_ZONES; i++) {
    char buf[24];
    snprintf(buf, sizeof(buf), "z%d_floor_type", i + 1);
    if (key == buf && zone_floor_types_[i]) {
      auto call = zone_floor_types_[i]->make_call();
      if (is_string) call.set_option(sval); else call.set_index((size_t) fval);
      call.perform();
      return;
    }
  }

  // Zone pipe spacing: z1_pipe_spacing .. z6_pipe_spacing
  for (int i = 0; i < NUM_ZONES; i++) {
    char buf[24];
    snprintf(buf, sizeof(buf), "z%d_pipe_spacing", i + 1);
    if (key == buf && zone_pipe_spacings_[i]) {
      auto call = zone_pipe_spacings_[i]->make_call();
      call.set_value(fval);
      call.perform();
      return;
    }
  }

  // Zone floor cover thickness: z1_floor_cover_thickness .. z6_floor_cover_thickness
  for (int i = 0; i < NUM_ZONES; i++) {
    char buf[32];
    snprintf(buf, sizeof(buf), "z%d_floor_cover_thickness", i + 1);
    if (key == buf && zone_floor_cover_thicknesses_[i]) {
      auto call = zone_floor_cover_thicknesses_[i]->make_call();
      call.set_value(fval);
      call.perform();
      return;
    }
  }

  // Zone temperature source: z1_source .. z6_source
  for (int i = 0; i < NUM_ZONES; i++) {
    char buf[16];
    snprintf(buf, sizeof(buf), "z%d_source", i + 1);
    if (key == buf && zone_sources_[i]) {
      auto call = zone_sources_[i]->make_call();
      if (is_string)
        call.set_option(sval);
      else
        call.set_index((size_t) fval);
      call.perform();
      ESP_LOGI(TAG, "Zone %d source: %s", i + 1, is_string ? sval.c_str() : "-");
      return;
    }
  }

  // Zone control profile: z1_profile .. z6_profile (adaptive control)
  for (int i = 0; i < NUM_ZONES; i++) {
    char buf[16];
    snprintf(buf, sizeof(buf), "z%d_profile", i + 1);
    if (key == buf && zone_profiles_[i]) {
      auto call = zone_profiles_[i]->make_call();
      if (is_string) call.set_option(sval); else call.set_index((size_t)fval);
      call.perform();
      ESP_LOGI(TAG, "Zone %d profile: %s", i + 1, is_string ? sval.c_str() : "-");
      return;
    }
  }

  // Zone BLE MAC assignment: z1_ble_mac .. z6_ble_mac
  for (int i = 0; i < NUM_ZONES; i++) {
    char buf[16];
    snprintf(buf, sizeof(buf), "z%d_ble_mac", i + 1);
    if (key == buf && zone_ble_macs_[i] && is_string) {
      auto call = zone_ble_macs_[i]->make_call();
      call.set_value(sval);
      call.perform();
      ESP_LOGI(TAG, "Zone %d BLE MAC: %s", i + 1, sval.c_str());
      return;
    }
  }

  // Zone link group: z1_link_group .. z6_link_group
  for (int i = 0; i < NUM_ZONES; i++) {
    char buf[24];
    snprintf(buf, sizeof(buf), "z%d_link_group", i + 1);
    if (key == buf && zone_link_groups_[i]) {
      auto call = zone_link_groups_[i]->make_call();
      if (is_string) call.set_option(sval); else call.set_index((size_t) fval);
      call.perform();
      return;
    }
  }

  // Switches
  auto doSwitch = [&](const char *name, switch_::Switch *sw) -> bool {
    if (key == name && sw) {
      fval > 0.5f ? sw->turn_on() : sw->turn_off();
      return true;
    }
    return false;
  };
  if (doSwitch("balancing_enabled", sw_balancing_)) return;
  if (doSwitch("standalone_mode", sw_standalone_)) return;
  if (doSwitch("display_enabled", sw_display_)) return;
  if (doSwitch("ecodan_coordinator", sw_ecodan_coordinator_)) return;

  // Zone enable switches: z1_enabled .. z6_enabled
  for (int i = 0; i < NUM_ZONES; i++) {
    char buf[16];
    snprintf(buf, sizeof(buf), "z%d_enabled", i + 1);
    if (doSwitch(buf, zone_enables_[i])) return;
  }

  // Numbers (settings)
  auto doNumber = [&](const char *name, number::Number *n) -> bool {
    if (key == name && n) {
      auto call = n->make_call();
      call.set_value(fval);
      call.perform();
      return true;
    }
    return false;
  };
  if (doNumber("min_valve_opening", num_min_valve_opening_)) return;
  if (doNumber("comfort_band", num_comfort_band_)) return;
  if (doNumber("maintenance_base", num_maintenance_base_)) return;
  if (doNumber("demand_boost", num_demand_boost_)) return;
  if (doNumber("boost_factor", num_boost_factor_)) return;
  if (doNumber("min_movement", num_min_movement_)) return;
  if (doNumber("asgard_reference_setpoint", num_asgard_reference_setpoint_)) return;

  // Text entities
  if (key == "asgard_host" && text_asgard_host_ && is_string) {
    auto call = text_asgard_host_->make_call();
    call.set_value(sval);
    call.perform();
    ESP_LOGI(TAG, "Asgard host: %s", sval.c_str());
    return;
  }

  ESP_LOGW(TAG, "Unknown key: %s", key.c_str());
}

void HeatvalveDashboard::update_snapshot_() {
  std::lock_guard<std::mutex> lock(snapshot_mutex_);

  auto get_f = [](sensor::Sensor *s) -> float {
    return (s && s->has_state()) ? s->state : NAN;
  };
  auto get_sw = [](switch_::Switch *s) -> bool { return s ? s->state : false; };
  auto get_n = [](number::Number *n, NumData &d) {
    if (n) {
      // Some template numbers may report has_state=false briefly after boot/reflash
      // even though state already carries the restored/initial value.
      d.val = n->state;
      d.min = n->traits.get_min_value();
      d.max = n->traits.get_max_value();
      d.step = n->traits.get_step();
    }
  };
  auto fill_sel = [](select::Select *s, int &idx, char opts[][24], int &count) {
    idx = -1;
    count = 0;
    if (s == nullptr)
      return;
    if (s->active_index().has_value())
      idx = static_cast<int>(s->active_index().value());
    const auto &values = s->traits.get_options();
    count = std::min(static_cast<int>(values.size()), 12);
    for (int i = 0; i < count; i++) {
      const char *opt = values[i];
      strncpy(opts[i], opt ? opt : "", 23);
      opts[i][23] = '\0';
    }
  };
  auto safe_copy = [](char *dst, size_t sz, text_sensor::TextSensor *t) {
    if (t && t->has_state()) {
      strncpy(dst, t->state.c_str(), sz - 1);
      dst[sz - 1] = '\0';
    } else {
      dst[0] = '\0';
    }
  };

  // Zones
  for (int i = 0; i < NUM_ZONES; i++) {
    auto &z = current_snapshot_.zones[i];
    z.current_temp = get_f(zone_temps_[i]);
    if (climates_[i]) {
      // Thermostat in heat-only mode uses target_temperature_low
      z.target_temp = climates_[i]->target_temperature;
      if (std::isnan(z.target_temp)) z.target_temp = climates_[i]->target_temperature_low;
      z.climate_action = (int) climates_[i]->action;
      z.climate_mode = (int) climates_[i]->mode;
      if (climates_[i]->has_custom_preset()) {
        auto sr = climates_[i]->get_custom_preset();
        strncpy(z.preset, sr.c_str(), sizeof(z.preset) - 1);
        z.preset[sizeof(z.preset) - 1] = '\0';
      } else if (climates_[i]->preset.has_value()) {
        switch (climates_[i]->preset.value()) {
          case climate::CLIMATE_PRESET_HOME:
            strncpy(z.preset, "HOME", sizeof(z.preset) - 1);
            break;
          case climate::CLIMATE_PRESET_AWAY:
            strncpy(z.preset, "AWAY", sizeof(z.preset) - 1);
            break;
          case climate::CLIMATE_PRESET_BOOST:
            strncpy(z.preset, "BOOST", sizeof(z.preset) - 1);
            break;
          case climate::CLIMATE_PRESET_COMFORT:
            strncpy(z.preset, "COMFORT", sizeof(z.preset) - 1);
            break;
          case climate::CLIMATE_PRESET_ECO:
            strncpy(z.preset, "ECO", sizeof(z.preset) - 1);
            break;
          case climate::CLIMATE_PRESET_SLEEP:
            strncpy(z.preset, "SLEEP", sizeof(z.preset) - 1);
            break;
          case climate::CLIMATE_PRESET_ACTIVITY:
            strncpy(z.preset, "ACTIVITY", sizeof(z.preset) - 1);
            break;
          default:
            z.preset[0] = '\0';
            break;
        }
        z.preset[sizeof(z.preset) - 1] = '\0';
      } else {
        z.preset[0] = '\0';
      }
    }
    if (covers_[i]) {
      z.valve_position = covers_[i]->position;
    }
    get_n(zone_areas_[i], z.area);
    get_n(zone_max_openings_[i], z.max_opening);
    z.pipe_type_idx = (zone_pipe_types_[i] && zone_pipe_types_[i]->active_index().has_value())
                          ? static_cast<int>(zone_pipe_types_[i]->active_index().value()) : -1;
    z.floor_type_idx = (zone_floor_types_[i] && zone_floor_types_[i]->active_index().has_value())
                           ? static_cast<int>(zone_floor_types_[i]->active_index().value()) : -1;
    get_n(zone_pipe_spacings_[i], z.pipe_spacing);
    get_n(zone_floor_cover_thicknesses_[i], z.floor_cover_thickness);
    z.source_idx = (zone_sources_[i] && zone_sources_[i]->active_index().has_value())
               ? static_cast<int>(zone_sources_[i]->active_index().value()) : -1;
    // Control profile (adaptive)
    z.profile_idx = (zone_profiles_[i] && zone_profiles_[i]->active_index().has_value())
                        ? static_cast<int>(zone_profiles_[i]->active_index().value()) : -1;
    // BLE MAC
    if (zone_ble_macs_[i] && !zone_ble_macs_[i]->state.empty()) {
      strncpy(z.ble_mac, zone_ble_macs_[i]->state.c_str(), sizeof(z.ble_mac) - 1);
      z.ble_mac[sizeof(z.ble_mac) - 1] = '\0';
    } else {
      z.ble_mac[0] = '\0';
    }
    // Link group
    z.link_group_idx = (zone_link_groups_[i] && zone_link_groups_[i]->active_index().has_value())
                           ? static_cast<int>(zone_link_groups_[i]->active_index().value()) : -1;
    // Map: 0=None -> -1, 1=A -> 0, 2=B -> 1, 3=C -> 2, 4=D -> 3
    if (z.link_group_idx == 0) z.link_group_idx = -1;
    else if (z.link_group_idx > 0) z.link_group_idx -= 1;
  }

  // Heating circuit
  current_snapshot_.input_temp = get_f(input_temp_);
  current_snapshot_.output_temp = get_f(output_temp_);
  current_snapshot_.extra_temp = get_f(extra_temp_);

  // Status
  current_snapshot_.avg_valve_position = get_f(avg_valve_position_);
  current_snapshot_.active_zones = get_f(active_zones_);
  current_snapshot_.wifi_signal = get_f(wifi_signal_);

  // Switches
  current_snapshot_.sw_balancing = get_sw(sw_balancing_);
  current_snapshot_.sw_standalone = get_sw(sw_standalone_);
  current_snapshot_.sw_ecodan_coordinator = get_sw(sw_ecodan_coordinator_);
  current_snapshot_.display_enabled = get_sw(sw_display_);

  // Zone enable switches
  for (int i = 0; i < NUM_ZONES; i++) {
    current_snapshot_.zone_enabled[i] = zone_enables_[i] ? zone_enables_[i]->state : true;
  }

  // Numbers
  get_n(num_min_valve_opening_, current_snapshot_.num_min_valve_opening);
  get_n(num_comfort_band_, current_snapshot_.num_comfort_band);
  get_n(num_maintenance_base_, current_snapshot_.num_maintenance_base);
  get_n(num_demand_boost_, current_snapshot_.num_demand_boost);
  get_n(num_boost_factor_, current_snapshot_.num_boost_factor);
  get_n(num_min_movement_, current_snapshot_.num_min_movement);
  get_n(num_asgard_reference_setpoint_, current_snapshot_.num_asgard_reference_setpoint);

  // Asgard host text
  if (text_asgard_host_ && !text_asgard_host_->state.empty()) {
    strncpy(current_snapshot_.asgard_host, text_asgard_host_->state.c_str(),
            sizeof(current_snapshot_.asgard_host) - 1);
    current_snapshot_.asgard_host[sizeof(current_snapshot_.asgard_host) - 1] = '\0';
  } else {
    current_snapshot_.asgard_host[0] = '\0';
  }

  // Text sensors
  safe_copy(current_snapshot_.controller_mode, sizeof(current_snapshot_.controller_mode), controller_mode_);
  safe_copy(current_snapshot_.system_status, sizeof(current_snapshot_.system_status), system_status_);
  safe_copy(current_snapshot_.uptime, sizeof(current_snapshot_.uptime), uptime_);

  // BLE scan results
  if (ble_scan_results_ && ble_scan_results_->has_state()) {
    strncpy(current_snapshot_.ble_scan_results, ble_scan_results_->state.c_str(),
            sizeof(current_snapshot_.ble_scan_results) - 1);
    current_snapshot_.ble_scan_results[sizeof(current_snapshot_.ble_scan_results) - 1] = '\0';
  } else {
    current_snapshot_.ble_scan_results[0] = '\0';
  }
}

void HeatvalveDashboard::handle_state_(AsyncWebServerRequest *request) {
  std::lock_guard<std::mutex> lock(snapshot_mutex_);
  const DashboardSnapshot &snap = current_snapshot_;

  AsyncResponseStream *response = request->beginResponseStream("application/json");
  if (response == nullptr) {
    request->send(500, "text/plain", "Stream allocation failed");
    return;
  }

  response->addHeader("Access-Control-Allow-Origin", "*");
  response->addHeader("Cache-Control", "no-cache");

  auto p_f = [&](const char *k, float v) {
    if (!std::isnan(v))
      response->printf("\"%s\":%.2f,", k, v);
    else
      response->printf("\"%s\":null,", k);
  };
  auto p_f1 = [&](const char *k, float v) {
    if (!std::isnan(v))
      response->printf("\"%s\":%.1f,", k, v);
    else
      response->printf("\"%s\":null,", k);
  };
  auto p_b = [&](const char *k, bool v) {
    response->printf("\"%s\":%s,", k, v ? "true" : "false");
  };
  auto p_u = [&](const char *k, uint32_t v) {
    response->printf("\"%s\":%u,", k, v);
  };
  auto p_i = [&](const char *k, int v) {
    response->printf("\"%s\":%d,", k, v);
  };
  auto p_n = [&](const char *k, const NumData &d) {
    float val = d.val;
    if (std::isnan(val)) {
      if (!std::isnan(d.min)) val = d.min;
      else val = 0.0f;
    }
    float min = std::isnan(d.min) ? 0.0f : d.min;
    float max = std::isnan(d.max) ? min : d.max;
    float step = std::isnan(d.step) ? 1.0f : d.step;
    response->printf("\"%s\":{\"val\":%.1f,\"min\":%.1f,\"max\":%.1f,\"step\":%.2f},", k, val, min, max, step);
  };
  auto p_str = [&](const char *k, const char *v) {
    response->printf("\"%s\":\"", k);
    for (const char *c = v; *c != '\0'; ++c) {
      if (*c == '"')
        response->print("\\\"");
      else if (*c == '\\')
        response->print("\\\\");
      else
        response->printf("%c", *c);
    }
    response->print("\",");
  };
  auto p_act = [&](const char *k, int a) {
    if (a == climate::CLIMATE_ACTION_HEATING)
      response->printf("\"%s\":\"heating\",", k);
    else if (a == climate::CLIMATE_ACTION_IDLE)
      response->printf("\"%s\":\"idle\",", k);
    else if (a == climate::CLIMATE_ACTION_OFF)
      response->printf("\"%s\":\"off\",", k);
    else
      response->printf("\"%s\":\"off\",", k);
  };
  auto p_mode = [&](const char *k, int m) {
    if (m == climate::CLIMATE_MODE_HEAT)
      response->printf("\"%s\":\"heat\",", k);
    else if (m == climate::CLIMATE_MODE_OFF)
      response->printf("\"%s\":\"off\",", k);
    else if (m == climate::CLIMATE_MODE_AUTO)
      response->printf("\"%s\":\"auto\",", k);
    else
      response->printf("\"%s\":\"off\",", k);
  };

  // Pipe type select: include options from snapshot
  auto p_sel = [&](const char *k, int idx, const char opts[][24], int opts_count) {
    if (idx >= 0 && opts_count > 0) {
      response->printf("\"%s\":{\"idx\":%d,\"opts\":[", k, idx);
      for (int i = 0; i < opts_count; i++) {
        if (i > 0) response->print(",");
        response->printf("\"%s\"", opts[i]);
      }
      response->print("]},");
    } else {
      response->printf("\"%s\":null,", k);
    }
  };

  response->print("{");

  // Zones array
  response->print("\"zones\":[");
  for (int i = 0; i < NUM_ZONES; i++) {
    if (i > 0) response->print(",");
    const auto &z = snap.zones[i];
    response->print("{");
    char buf[32];
    snprintf(buf, sizeof(buf), "z%d_temp", i + 1);
    p_f1(buf, z.current_temp);
    snprintf(buf, sizeof(buf), "z%d_setpoint", i + 1);
    p_f1(buf, z.target_temp);
    snprintf(buf, sizeof(buf), "z%d_valve", i + 1);
    p_f(buf, z.valve_position);
    snprintf(buf, sizeof(buf), "z%d_action", i + 1);
    p_act(buf, z.climate_action);
    snprintf(buf, sizeof(buf), "z%d_mode", i + 1);
    p_mode(buf, z.climate_mode);
    snprintf(buf, sizeof(buf), "z%d_preset", i + 1);
    p_str(buf, z.preset);
    snprintf(buf, sizeof(buf), "z%d_area", i + 1);
    p_n(buf, z.area);
    snprintf(buf, sizeof(buf), "z%d_max_opening", i + 1);
    p_n(buf, z.max_opening);
    snprintf(buf, sizeof(buf), "z%d_pipe_type_idx", i + 1);
    p_i(buf, z.pipe_type_idx);
    snprintf(buf, sizeof(buf), "z%d_floor_type_idx", i + 1);
    p_i(buf, z.floor_type_idx);
    snprintf(buf, sizeof(buf), "z%d_pipe_spacing", i + 1);
    p_n(buf, z.pipe_spacing);
    snprintf(buf, sizeof(buf), "z%d_floor_cover_thickness", i + 1);
    p_n(buf, z.floor_cover_thickness);
    snprintf(buf, sizeof(buf), "z%d_source_idx", i + 1);
    p_i(buf, z.source_idx);
    // Control profile (-1 if not using adaptive control)
    snprintf(buf, sizeof(buf), "z%d_profile_idx", i + 1);
    p_i(buf, z.profile_idx);
    // BLE MAC
    snprintf(buf, sizeof(buf), "z%d_ble_mac", i + 1);
    p_str(buf, z.ble_mac);
    // Link group (-1 = None, 0=A, 1=B, 2=C, 3=D)
    snprintf(buf, sizeof(buf), "z%d_link_group", i + 1);
    p_i(buf, z.link_group_idx);
    // Remove trailing comma by adding a dummy last field
    response->printf("\"_z\":%d}", i + 1);
  }
  response->print("],");

  // Heating circuit
  p_f1("input_temp", snap.input_temp);
  p_f1("output_temp", snap.output_temp);
  p_f1("extra_temp", snap.extra_temp);

  // Status
  p_f1("avg_valve_position", snap.avg_valve_position);
  p_f("active_zones", snap.active_zones);
  p_f1("wifi_signal", snap.wifi_signal);

  // Switches
  p_b("balancing_enabled", snap.sw_balancing);
  p_b("standalone_mode", snap.sw_standalone);
  p_b("ecodan_coordinator", snap.sw_ecodan_coordinator);
  p_b("display_enabled", snap.display_enabled);

  // Zone enable switches
  for (int i = 0; i < NUM_ZONES; i++) {
    char buf[16];
    snprintf(buf, sizeof(buf), "z%d_enabled", i + 1);
    p_b(buf, snap.zone_enabled[i]);
  }

  // Numbers
  p_n("min_valve_opening", snap.num_min_valve_opening);
  p_n("comfort_band", snap.num_comfort_band);
  p_n("maintenance_base", snap.num_maintenance_base);
  p_n("demand_boost", snap.num_demand_boost);
  p_n("boost_factor", snap.num_boost_factor);
  p_n("min_movement", snap.num_min_movement);
  p_n("asgard_reference_setpoint", snap.num_asgard_reference_setpoint);
  p_str("asgard_host", snap.asgard_host);

  // Text sensors
  p_str("controller_mode", snap.controller_mode);
  p_str("system_status", snap.system_status);
  p_str("uptime", snap.uptime);

  // BLE scan results (raw JSON array, pass through without quoting)
  if (snap.ble_scan_results[0] != '\0') {
    response->printf("\"ble_scan_results\":%s,", snap.ble_scan_results);
  } else {
    response->print("\"ble_scan_results\":[],");
  }

  response->printf("\"_uptime_ms\":%u}", millis());
  request->send(response);
}

int16_t HeatvalveDashboard::pack_temp_(float val) {
  if (std::isnan(val)) return -32768;
  return static_cast<int16_t>(val * 10.0f);
}

void HeatvalveDashboard::record_history_() {
  HistoryRecord rec;
  rec.timestamp = time(nullptr);

  auto get_sensor = [](sensor::Sensor *s) -> float {
    return (s && s->has_state()) ? s->state : NAN;
  };

  for (int i = 0; i < NUM_ZONES; i++) {
    float temp = NAN;
    if (climates_[i]) temp = climates_[i]->current_temperature;
    else temp = get_sensor(zone_temps_[i]);
    rec.zone_temps[i] = pack_temp_(temp);

    float pos = 0;
    if (covers_[i]) pos = covers_[i]->position;
    rec.zone_valves[i] = static_cast<uint8_t>(pos * 200.0f);
  }

  rec.input_temp = pack_temp_(get_sensor(input_temp_));
  rec.output_temp = pack_temp_(get_sensor(output_temp_));

  history_buffer_[history_head_] = rec;
  history_head_ = (history_head_ + 1) % MAX_HISTORY;
  if (history_count_ < MAX_HISTORY) history_count_++;
}

void HeatvalveDashboard::handle_history_(AsyncWebServerRequest *request) {
  httpd_req_t *req = *request;
  httpd_resp_set_status(req, "200 OK");
  httpd_resp_set_type(req, "application/json");
  httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");
  httpd_resp_set_hdr(req, "Cache-Control", "no-cache");

  size_t current_count = history_count_;
  size_t current_head = history_head_;

  if (current_count == 0) {
    httpd_resp_send_chunk(req, "[]", 2);
    httpd_resp_send_chunk(req, nullptr, 0);
    return;
  }

  size_t start_idx = (current_count == MAX_HISTORY) ? current_head : 0;
  size_t step = (current_count > 360) ? (current_count / 360) : 1;
  if (step < 1) step = 1;

  httpd_resp_send_chunk(req, "[", 1);

  bool first = true;
  for (size_t i = 0; i < current_count; i += step) {
    size_t idx = (start_idx + i) % MAX_HISTORY;
    HistoryRecord rec = history_buffer_[idx];

    if (!first) httpd_resp_send_chunk(req, ",", 1);
    first = false;

    // [timestamp, z1t,z2t,...z6t, z1v,...z6v, in, out]
    char item[192];
    int len = snprintf(item, sizeof(item),
                       "[%u,%d,%d,%d,%d,%d,%d,%u,%u,%u,%u,%u,%u,%d,%d]",
                       rec.timestamp,
                       rec.zone_temps[0], rec.zone_temps[1], rec.zone_temps[2],
                       rec.zone_temps[3], rec.zone_temps[4], rec.zone_temps[5],
                       rec.zone_valves[0], rec.zone_valves[1], rec.zone_valves[2],
                       rec.zone_valves[3], rec.zone_valves[4], rec.zone_valves[5],
                       rec.input_temp, rec.output_temp);
    httpd_resp_send_chunk(req, item, len);
  }

  httpd_resp_send_chunk(req, "]", 1);
  httpd_resp_send_chunk(req, nullptr, 0);
}

void HeatvalveDashboard::handle_solver_history_(AsyncWebServerRequest *request) {
  AsyncResponseStream *response = request->beginResponseStream("application/json");
  if (response == nullptr) {
    request->send(500, "text/plain", "Stream allocation failed");
    return;
  }

  response->addHeader("Access-Control-Allow-Origin", "*");
  response->addHeader("Cache-Control", "no-cache");
  response->print("[]");
  request->send(response);
}

}  // namespace heatvalve_dashboard
}  // namespace esphome
