// =============================================================================
// HV6 Forecast Model — pure C++, host-testable (no ESP-IDF / ESPHome deps)
// =============================================================================
// Wind-direction-aware per-zone preload model. Each forecast hour is reduced
// to a dimensionless "weather load" per zone: wind hitting the zone's exterior
// walls, scaled by how cold it is, minus passive solar relief. When the peak
// load inside the zone's thermal lead window exceeds a threshold, a setpoint
// preload offset is issued so the slab is charged before the weather arrives.
// Tested by test/forecast/test_forecast_model.cpp (make test-forecast).
// =============================================================================

#pragma once

#include <cstdint>
#include <cstddef>

namespace hv6fc {

static constexpr size_t FORECAST_HOURS = 48;

// Matches hv6::ExteriorWall bitmask values (hv6_types.h).
static constexpr uint8_t WALL_NORTH = 1 << 0;
static constexpr uint8_t WALL_EAST = 1 << 1;
static constexpr uint8_t WALL_SOUTH = 1 << 2;
static constexpr uint8_t WALL_WEST = 1 << 3;

struct ForecastHour {
  float temp_c = 0.0f;
  float wind_speed_ms = 0.0f;
  float wind_dir_deg = 0.0f;   ///< Meteorological: direction the wind comes FROM
  float shortwave_wm2 = 0.0f;  ///< Global horizontal irradiance
};

struct ZoneExposure {
  uint8_t exterior_walls = 0;  ///< N|E|S|W bitmask (reuses ZoneConfig.exterior_walls)
  float wind_exposure = 0.5f;  ///< 0..1 — how exposed the facade is (shelter, terrain)
  float solar_gain = 0.3f;     ///< 0..1 — passive solar relief through glazing
  uint8_t thermal_lead_h = 4;  ///< How long before a load peak charging must start
};

struct PreloadParams {
  float indoor_ref_c = 21.0f;     ///< Reference indoor temp for the cold term
  float load_threshold = 1.0f;    ///< Load units before preload kicks in
  float gain_c_per_load = 0.5f;   ///< °C offset per load unit above threshold
  float max_offset_c = 1.5f;      ///< Model cap (per-zone firmware clamps still apply)
};

struct PreloadDecision {
  float offset_c = 0.0f;   ///< Setpoint offset to apply now (0 = none)
  float peak_load = 0.0f;  ///< Max load found inside the lead window
  int8_t peak_in_h = -1;   ///< Hours until that peak (-1 = no data)
};

/// Max over the zone's exterior walls of cos(angle between the wind source
/// direction and the wall's outward normal), floored at 0. A zone with no
/// exterior walls returns 0 (interior room — no direct wind load).
float wind_alignment(uint8_t exterior_walls, float wind_dir_deg);

/// Dimensionless weather load on a zone for one forecast hour.
/// wind term (10 m/s reference) × cold term (10 K ΔT reference) − solar relief
/// (800 W/m² reference), floored at 0.
float zone_hour_load(const ForecastHour &hour, const ZoneExposure &exposure, float indoor_ref_c);

/// Scan `exposure.thermal_lead_h` hours ahead from `now_index` and decide the
/// preload offset for this zone. `count` = number of valid entries in `hours`.
PreloadDecision compute_zone_preload(const ForecastHour *hours, size_t count, size_t now_index,
                                     const ZoneExposure &exposure, const PreloadParams &params);

}  // namespace hv6fc
