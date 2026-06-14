#include "forecast_model.h"

#include <cmath>

namespace hv6fc {

static constexpr float DEG_TO_RAD = 3.14159265358979f / 180.0f;
static constexpr float WIND_REF_MS = 10.0f;     // stiff breeze
static constexpr float COLD_REF_K = 10.0f;      // ΔT giving cold term 1.0
static constexpr float SOLAR_REF_WM2 = 800.0f;  // clear-sky midday irradiance

// <algorithm> is avoided so the file compiles with the host toolchain too.
static inline float fmaxf_(float a, float b) { return a > b ? a : b; }
static inline float fminf_(float a, float b) { return a < b ? a : b; }
static inline size_t min_size_(size_t a, size_t b) { return a < b ? a : b; }

float wind_alignment(uint8_t exterior_walls, float wind_dir_deg) {
  struct Wall {
    uint8_t bit;
    float normal_deg;
  };
  static constexpr Wall WALLS[] = {
      {WALL_NORTH, 0.0f}, {WALL_EAST, 90.0f}, {WALL_SOUTH, 180.0f}, {WALL_WEST, 270.0f}};

  float best = 0.0f;
  for (const Wall &wall : WALLS) {
    if (!(exterior_walls & wall.bit))
      continue;
    const float delta = (wind_dir_deg - wall.normal_deg) * DEG_TO_RAD;
    best = fmaxf_(best, std::cos(delta));
  }
  return fmaxf_(0.0f, best);
}

float zone_hour_load(const ForecastHour &hour, const ZoneExposure &exposure, float indoor_ref_c) {
  const float align = wind_alignment(exposure.exterior_walls, hour.wind_dir_deg);
  const float wind_term = exposure.wind_exposure * align * (hour.wind_speed_ms / WIND_REF_MS);
  const float cold_term = fmaxf_(0.0f, indoor_ref_c - hour.temp_c) / COLD_REF_K;
  const float solar_relief = exposure.solar_gain * (fmaxf_(0.0f, hour.shortwave_wm2) / SOLAR_REF_WM2);
  return fmaxf_(0.0f, wind_term * cold_term - solar_relief);
}

PreloadDecision compute_zone_preload(const ForecastHour *hours, size_t count, size_t now_index,
                                     const ZoneExposure &exposure, const PreloadParams &params) {
  PreloadDecision decision;
  if (hours == nullptr || count == 0 || now_index >= count)
    return decision;

  const size_t last = min_size_(count - 1, now_index + static_cast<size_t>(exposure.thermal_lead_h));
  for (size_t i = now_index; i <= last; i++) {
    const float load = zone_hour_load(hours[i], exposure, params.indoor_ref_c);
    if (load > decision.peak_load) {
      decision.peak_load = load;
      decision.peak_in_h = static_cast<int8_t>(i - now_index);
    }
  }
  if (decision.peak_in_h < 0)
    decision.peak_in_h = 0;

  const float above = decision.peak_load - params.load_threshold;
  if (above > 0.0f)
    decision.offset_c = fminf_(params.max_offset_c, above * params.gain_c_per_load);
  return decision;
}

}  // namespace hv6fc
