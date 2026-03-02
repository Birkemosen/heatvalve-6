#pragma once
#include <mutex>
#include <vector>

#include "esphome/core/component.h"
#include "esphome/components/web_server_base/web_server_base.h"
#include "esphome/components/sensor/sensor.h"
#include "esphome/components/text_sensor/text_sensor.h"
#include "esphome/components/climate/climate.h"
#include "esphome/components/number/number.h"
#include "esphome/components/switch/switch.h"
#include "esphome/components/select/select.h"
#include "esphome/components/cover/cover.h"

namespace esphome {
namespace heatvalve_dashboard {

static const int NUM_ZONES = 6;

struct DashboardAction {
  std::string key;
  std::string s_value;
  float f_value;
  bool is_string;
};

struct NumData {
  float val{NAN};
  float min{NAN};
  float max{NAN};
  float step{NAN};
};

struct ZoneSnapshot {
  float current_temp{NAN};
  float target_temp{NAN};
  float valve_position{NAN};
  int climate_action{-1};
  int climate_mode{-1};
  char preset[16]{0};
  NumData area;
  NumData max_opening;
};

struct DashboardSnapshot {
  ZoneSnapshot zones[NUM_ZONES];

  float input_temp{NAN};
  float output_temp{NAN};
  float extra_temp{NAN};
  float avg_valve_position{NAN};
  float active_zones{NAN};
  float wifi_signal{NAN};

  bool sw_balancing{false};
  bool sw_standalone{false};

  int sel_pipe_type{-1};
  char sel_pipe_type_opts[6][16]{{0}};
  int sel_pipe_type_opts_count{0};

  NumData num_min_valve_opening;
  NumData num_comfort_band;
  NumData num_maintenance_base;
  NumData num_demand_boost;
  NumData num_boost_factor;
  NumData num_min_movement;
  NumData num_pipe_spacing;

  char controller_mode[32]{0};
  char system_status[64]{0};
  char uptime[32]{0};
};

// 20 bytes per record: 6 zones * 2 (temp) + 6 * 1 (valve packed) + timestamp + flags
struct HistoryRecord {
  uint32_t timestamp;
  int16_t zone_temps[NUM_ZONES];
  uint8_t zone_valves[NUM_ZONES];  // 0-200 = 0-100% in 0.5% steps
  int16_t input_temp;
  int16_t output_temp;
};

class HeatvalveDashboard : public Component, public AsyncWebHandler {
 public:
  void setup() override;
  void loop() override;
  float get_setup_priority() const override { return setup_priority::WIFI - 1.0f; }

  void set_web_server_base(web_server_base::WebServerBase *b) { base_ = b; }

  // Zone climates
  void set_climate_z1(climate::Climate *c) { climates_[0] = c; }
  void set_climate_z2(climate::Climate *c) { climates_[1] = c; }
  void set_climate_z3(climate::Climate *c) { climates_[2] = c; }
  void set_climate_z4(climate::Climate *c) { climates_[3] = c; }
  void set_climate_z5(climate::Climate *c) { climates_[4] = c; }
  void set_climate_z6(climate::Climate *c) { climates_[5] = c; }

  // Zone covers
  void set_cover_z1(cover::Cover *c) { covers_[0] = c; }
  void set_cover_z2(cover::Cover *c) { covers_[1] = c; }
  void set_cover_z3(cover::Cover *c) { covers_[2] = c; }
  void set_cover_z4(cover::Cover *c) { covers_[3] = c; }
  void set_cover_z5(cover::Cover *c) { covers_[4] = c; }
  void set_cover_z6(cover::Cover *c) { covers_[5] = c; }

  // Zone temperature sensors
  void set_temp_z1(sensor::Sensor *s) { zone_temps_[0] = s; }
  void set_temp_z2(sensor::Sensor *s) { zone_temps_[1] = s; }
  void set_temp_z3(sensor::Sensor *s) { zone_temps_[2] = s; }
  void set_temp_z4(sensor::Sensor *s) { zone_temps_[3] = s; }
  void set_temp_z5(sensor::Sensor *s) { zone_temps_[4] = s; }
  void set_temp_z6(sensor::Sensor *s) { zone_temps_[5] = s; }

  // Heating circuit
  void set_input_temp(sensor::Sensor *s) { input_temp_ = s; }
  void set_output_temp(sensor::Sensor *s) { output_temp_ = s; }
  void set_extra_temp(sensor::Sensor *s) { extra_temp_ = s; }

  // Status
  void set_avg_valve_position(sensor::Sensor *s) { avg_valve_position_ = s; }
  void set_active_zones(sensor::Sensor *s) { active_zones_ = s; }
  void set_wifi_signal(sensor::Sensor *s) { wifi_signal_ = s; }

  // Text sensors
  void set_controller_mode(text_sensor::TextSensor *t) { controller_mode_ = t; }
  void set_system_status(text_sensor::TextSensor *t) { system_status_ = t; }
  void set_uptime(text_sensor::TextSensor *t) { uptime_ = t; }

  // Switches
  void set_sw_balancing(switch_::Switch *s) { sw_balancing_ = s; }
  void set_sw_standalone(switch_::Switch *s) { sw_standalone_ = s; }

  // Select
  void set_sel_pipe_type(select::Select *s) { sel_pipe_type_ = s; }

  // Numbers (settings)
  void set_num_min_valve_opening(number::Number *n) { num_min_valve_opening_ = n; }
  void set_num_comfort_band(number::Number *n) { num_comfort_band_ = n; }
  void set_num_maintenance_base(number::Number *n) { num_maintenance_base_ = n; }
  void set_num_demand_boost(number::Number *n) { num_demand_boost_ = n; }
  void set_num_boost_factor(number::Number *n) { num_boost_factor_ = n; }
  void set_num_min_movement(number::Number *n) { num_min_movement_ = n; }
  void set_num_pipe_spacing(number::Number *n) { num_pipe_spacing_ = n; }

  // Zone numbers
  void set_num_zone_1_area(number::Number *n) { zone_areas_[0] = n; }
  void set_num_zone_2_area(number::Number *n) { zone_areas_[1] = n; }
  void set_num_zone_3_area(number::Number *n) { zone_areas_[2] = n; }
  void set_num_zone_4_area(number::Number *n) { zone_areas_[3] = n; }
  void set_num_zone_5_area(number::Number *n) { zone_areas_[4] = n; }
  void set_num_zone_6_area(number::Number *n) { zone_areas_[5] = n; }
  void set_num_zone_1_max_opening(number::Number *n) { zone_max_openings_[0] = n; }
  void set_num_zone_2_max_opening(number::Number *n) { zone_max_openings_[1] = n; }
  void set_num_zone_3_max_opening(number::Number *n) { zone_max_openings_[2] = n; }
  void set_num_zone_4_max_opening(number::Number *n) { zone_max_openings_[3] = n; }
  void set_num_zone_5_max_opening(number::Number *n) { zone_max_openings_[4] = n; }
  void set_num_zone_6_max_opening(number::Number *n) { zone_max_openings_[5] = n; }

  // AsyncWebHandler
  bool canHandle(AsyncWebServerRequest *request) const override;
  void handleRequest(AsyncWebServerRequest *request) override;
  bool isRequestHandlerTrivial() const override { return false; }

 protected:
  void handle_root_(AsyncWebServerRequest *request);
  void handle_state_(AsyncWebServerRequest *request);
  void handle_set_(AsyncWebServerRequest *request);
  void handle_history_(AsyncWebServerRequest *request);
  void dispatch_set_(const std::string &key, const std::string &sval, float fval, bool is_string);
  void update_snapshot_();
  void record_history_();
  void send_chunked_(AsyncWebServerRequest *request, const char *content_type,
                     const uint8_t *data, size_t length, const char *cache_control);

  static int16_t pack_temp_(float val);

  std::vector<DashboardAction> action_queue_;
  std::mutex action_lock_;

  web_server_base::WebServerBase *base_{nullptr};

  // Zone entity arrays
  climate::Climate *climates_[NUM_ZONES]{};
  cover::Cover *covers_[NUM_ZONES]{};
  sensor::Sensor *zone_temps_[NUM_ZONES]{};
  number::Number *zone_areas_[NUM_ZONES]{};
  number::Number *zone_max_openings_[NUM_ZONES]{};

  // Heating circuit
  sensor::Sensor *input_temp_{nullptr};
  sensor::Sensor *output_temp_{nullptr};
  sensor::Sensor *extra_temp_{nullptr};

  // Status
  sensor::Sensor *avg_valve_position_{nullptr};
  sensor::Sensor *active_zones_{nullptr};
  sensor::Sensor *wifi_signal_{nullptr};

  // Text sensors
  text_sensor::TextSensor *controller_mode_{nullptr};
  text_sensor::TextSensor *system_status_{nullptr};
  text_sensor::TextSensor *uptime_{nullptr};

  // Switches
  switch_::Switch *sw_balancing_{nullptr};
  switch_::Switch *sw_standalone_{nullptr};

  // Select
  select::Select *sel_pipe_type_{nullptr};

  // Numbers
  number::Number *num_min_valve_opening_{nullptr};
  number::Number *num_comfort_band_{nullptr};
  number::Number *num_maintenance_base_{nullptr};
  number::Number *num_demand_boost_{nullptr};
  number::Number *num_boost_factor_{nullptr};
  number::Number *num_min_movement_{nullptr};
  number::Number *num_pipe_spacing_{nullptr};

 private:
  static const size_t MAX_HISTORY = 1440;  // 24h at 1min intervals
  HistoryRecord history_buffer_[MAX_HISTORY];
  size_t history_head_{0};
  size_t history_count_{0};
  uint32_t last_history_time_{0};

  DashboardSnapshot current_snapshot_;
  std::mutex snapshot_mutex_;
  uint32_t last_snapshot_time_{0};
};

}  // namespace heatvalve_dashboard
}  // namespace esphome
