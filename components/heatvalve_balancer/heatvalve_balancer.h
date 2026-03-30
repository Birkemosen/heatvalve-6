// HeatValve-6 Hydraulic Balancer
// Copyright (c) 2026 Birkemosen. All rights reserved.
//
// Free hydraulic balancing for underfloor heating zones.
// Computes per-zone hydraulic factors based on pipe length ratios,
// pipe type correction, and floor cover correction, then writes
// them to per-zone globals for the zone control scripts to apply.
//
// Zone classification (same as adaptive control):
//   OVERHEATED (0): temp > setpoint + comfort_band -> factor = 0
//   SATISFIED  (1): temp within comfort_band -> factor = maintenance level
//   DEMAND     (2): temp < setpoint - comfort_band -> factor = boosted level

#pragma once

#include <string>

#include "esphome/core/component.h"
#include "esphome/core/application.h"
#include "esphome/components/climate/climate.h"
#include "esphome/components/number/number.h"
#include "esphome/components/select/select.h"
#include "esphome/components/globals/globals_component.h"

#ifdef USE_MQTT
#include "esphome/components/mqtt/mqtt_client.h"
#endif

namespace heatvalve_balancer {

static const uint8_t MAX_ZONES = 6;

enum class HeatingProfile : uint8_t {
  BOILER = 0,
  HEAT_PUMP = 1,
  DISTRICT_HEATING = 2,
};

class HeatvalveBalancer : public esphome::PollingComponent {
 public:
  void setup() override;
  void update() override;
  void dump_config() override;
  float get_setup_priority() const override { return esphome::setup_priority::AFTER_WIFI; }

  // Zone climate setters
  void set_climate_z1(esphome::climate::Climate *c) { climates_[0] = c; }
  void set_climate_z2(esphome::climate::Climate *c) { climates_[1] = c; }
  void set_climate_z3(esphome::climate::Climate *c) { climates_[2] = c; }
  void set_climate_z4(esphome::climate::Climate *c) { climates_[3] = c; }
  void set_climate_z5(esphome::climate::Climate *c) { climates_[4] = c; }
  void set_climate_z6(esphome::climate::Climate *c) { climates_[5] = c; }

  // Settings
  void set_comfort_band(esphome::number::Number *n) { comfort_band_ = n; }
  void set_maintenance_base(esphome::number::Number *n) { maintenance_base_ = n; }
  void set_heating_profile(HeatingProfile p) { heating_profile_ = p; }

  // Per-zone area numbers
  void set_zone_1_area(esphome::number::Number *n) { zone_areas_[0] = n; }
  void set_zone_2_area(esphome::number::Number *n) { zone_areas_[1] = n; }
  void set_zone_3_area(esphome::number::Number *n) { zone_areas_[2] = n; }
  void set_zone_4_area(esphome::number::Number *n) { zone_areas_[3] = n; }
  void set_zone_5_area(esphome::number::Number *n) { zone_areas_[4] = n; }
  void set_zone_6_area(esphome::number::Number *n) { zone_areas_[5] = n; }

  // Per-zone pipe spacing numbers
  void set_zone_1_pipe_spacing(esphome::number::Number *n) { zone_pipe_spacings_[0] = n; }
  void set_zone_2_pipe_spacing(esphome::number::Number *n) { zone_pipe_spacings_[1] = n; }
  void set_zone_3_pipe_spacing(esphome::number::Number *n) { zone_pipe_spacings_[2] = n; }
  void set_zone_4_pipe_spacing(esphome::number::Number *n) { zone_pipe_spacings_[3] = n; }
  void set_zone_5_pipe_spacing(esphome::number::Number *n) { zone_pipe_spacings_[4] = n; }
  void set_zone_6_pipe_spacing(esphome::number::Number *n) { zone_pipe_spacings_[5] = n; }

  // Per-zone pipe type selects
  void set_zone_1_pipe_type(esphome::select::Select *s) { zone_pipe_types_[0] = s; }
  void set_zone_2_pipe_type(esphome::select::Select *s) { zone_pipe_types_[1] = s; }
  void set_zone_3_pipe_type(esphome::select::Select *s) { zone_pipe_types_[2] = s; }
  void set_zone_4_pipe_type(esphome::select::Select *s) { zone_pipe_types_[3] = s; }
  void set_zone_5_pipe_type(esphome::select::Select *s) { zone_pipe_types_[4] = s; }
  void set_zone_6_pipe_type(esphome::select::Select *s) { zone_pipe_types_[5] = s; }

  // Per-zone floor type selects
  void set_zone_1_floor_type(esphome::select::Select *s) { zone_floor_types_[0] = s; }
  void set_zone_2_floor_type(esphome::select::Select *s) { zone_floor_types_[1] = s; }
  void set_zone_3_floor_type(esphome::select::Select *s) { zone_floor_types_[2] = s; }
  void set_zone_4_floor_type(esphome::select::Select *s) { zone_floor_types_[3] = s; }
  void set_zone_5_floor_type(esphome::select::Select *s) { zone_floor_types_[4] = s; }
  void set_zone_6_floor_type(esphome::select::Select *s) { zone_floor_types_[5] = s; }

  // Per-zone floor cover thickness numbers
  void set_zone_1_floor_cover_thickness(esphome::number::Number *n) { zone_floor_cover_thicknesses_[0] = n; }
  void set_zone_2_floor_cover_thickness(esphome::number::Number *n) { zone_floor_cover_thicknesses_[1] = n; }
  void set_zone_3_floor_cover_thickness(esphome::number::Number *n) { zone_floor_cover_thicknesses_[2] = n; }
  void set_zone_4_floor_cover_thickness(esphome::number::Number *n) { zone_floor_cover_thicknesses_[3] = n; }
  void set_zone_5_floor_cover_thickness(esphome::number::Number *n) { zone_floor_cover_thicknesses_[4] = n; }
  void set_zone_6_floor_cover_thickness(esphome::number::Number *n) { zone_floor_cover_thicknesses_[5] = n; }

  // Per-zone hydraulic factor output globals
  void set_hyd_factor_z1_global(esphome::globals::GlobalsComponent<float> *g) { hyd_factor_globals_[0] = g; }
  void set_hyd_factor_z2_global(esphome::globals::GlobalsComponent<float> *g) { hyd_factor_globals_[1] = g; }
  void set_hyd_factor_z3_global(esphome::globals::GlobalsComponent<float> *g) { hyd_factor_globals_[2] = g; }
  void set_hyd_factor_z4_global(esphome::globals::GlobalsComponent<float> *g) { hyd_factor_globals_[3] = g; }
  void set_hyd_factor_z5_global(esphome::globals::GlobalsComponent<float> *g) { hyd_factor_globals_[4] = g; }
  void set_hyd_factor_z6_global(esphome::globals::GlobalsComponent<float> *g) { hyd_factor_globals_[5] = g; }

  // Public query API
  uint32_t get_cycle_count() const { return cycle_count_; }
  int get_reference_zone() const { return reference_zone_; }
  float get_reference_pipe_length() const { return reference_pipe_length_; }
  float get_setpoint_adjustment(uint8_t zone) const {
    return (zone < MAX_ZONES) ? setpoint_adjustments_[zone] : 0.0f;
  }

 protected:
  // Zone climate references
  esphome::climate::Climate *climates_[MAX_ZONES]{};

  // Settings
  esphome::number::Number *comfort_band_{nullptr};
  esphome::number::Number *maintenance_base_{nullptr};
  HeatingProfile heating_profile_{HeatingProfile::BOILER};

  // Per-zone settings
  esphome::number::Number *zone_areas_[MAX_ZONES]{};
  esphome::number::Number *zone_pipe_spacings_[MAX_ZONES]{};
  esphome::select::Select *zone_pipe_types_[MAX_ZONES]{};
  esphome::select::Select *zone_floor_types_[MAX_ZONES]{};
  esphome::number::Number *zone_floor_cover_thicknesses_[MAX_ZONES]{};

  // Output globals
  esphome::globals::GlobalsComponent<float> *hyd_factor_globals_[MAX_ZONES]{};

  // Internal zone state
  struct ZoneData {
    int8_t state{-1};  // -1=unknown, 0=overheated, 1=satisfied, 2=demand
    bool was_overheated{false};
    float pipe_length{0.0f};
    float hydraulic_factor{0.0f};
  };
  ZoneData zones_[MAX_ZONES];

  // Reference zone tracking
  int reference_zone_{-1};
  float reference_pipe_length_{100.0f};
  uint32_t cycle_count_{0};

  // Setpoint adjustments received from Helios-6
  float setpoint_adjustments_[MAX_ZONES]{};

  // Internal methods
  void classify_zones_();
  void find_reference_zone_();
  void compute_hydraulic_factors_();
  void publish_factors_();
  uint8_t count_configured_zones_() const;
  float calculate_pipe_length_(uint8_t zone) const;
  static std::string normalize_option_(const std::string &input);
  float get_pipe_inner_diameter_mm_(uint8_t zone) const;
  float get_floor_conductivity_w_mk_(uint8_t zone) const;
  float get_pipe_correction_factor_(uint8_t zone) const;
  float get_floor_correction_factor_(uint8_t zone) const;

#ifdef USE_MQTT
  void mqtt_publish_zone_states_();
  void mqtt_subscribe_adjustments_();
#endif
};

}  // namespace heatvalve_balancer
