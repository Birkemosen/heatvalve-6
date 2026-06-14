// =============================================================================
// Forecast preload model — Host-runnable unit tests
// =============================================================================
// Build + run (from repo root):
//   clang++ -std=c++17 -O2 -Wall -Wextra \
//     -I components/hv6_forecast \
//     components/hv6_forecast/forecast_model.cpp \
//     test/forecast/test_forecast_model.cpp -o /tmp/test_forecast -lm \
//   && /tmp/test_forecast
// =============================================================================

#include "forecast_model.h"
#include <cmath>
#include <cstdio>
#include <cstdlib>

using namespace hv6fc;

static int g_failures = 0;

static void expect(bool cond, const char *what) {
  if (cond) {
    printf("PASS  %s\n", what);
  } else {
    printf("FAIL  %s\n", what);
    g_failures++;
  }
}

static bool near(float a, float b, float eps = 0.01f) { return std::fabs(a - b) < eps; }

// ---------------------------------------------------------------------------
// wind_alignment
// ---------------------------------------------------------------------------
static void test_wind_alignment() {
  // North wall, wind from north → full alignment
  expect(near(wind_alignment(WALL_NORTH, 0.0f), 1.0f), "alignment: N wall, N wind = 1.0");
  // North wall, wind from south → no load
  expect(near(wind_alignment(WALL_NORTH, 180.0f), 0.0f), "alignment: N wall, S wind = 0.0");
  // North wall, wind from NE (45°) → cos(45°)
  expect(near(wind_alignment(WALL_NORTH, 45.0f), 0.7071f), "alignment: N wall, NE wind = cos45");
  // E+W walls, wind from west → max over walls = 1
  expect(near(wind_alignment(WALL_EAST | WALL_WEST, 270.0f), 1.0f), "alignment: E+W walls, W wind = 1.0");
  // Interior room (no exterior walls) → 0
  expect(near(wind_alignment(0, 270.0f), 0.0f), "alignment: interior room = 0.0");
  // Wraparound: W wall (normal 270°), wind from 350° → cos(80°) ≈ 0.17
  expect(near(wind_alignment(WALL_WEST, 350.0f), 0.1736f), "alignment: W wall, 350° wind wraps");
}

// ---------------------------------------------------------------------------
// zone_hour_load
// ---------------------------------------------------------------------------
static void test_zone_hour_load() {
  ZoneExposure exposed{};
  exposed.exterior_walls = WALL_WEST;
  exposed.wind_exposure = 0.8f;
  exposed.solar_gain = 0.3f;

  // Storm from west at -4 °C: wind term 0.8×1×1.5 = 1.2, cold term 2.5 → 3.0
  ForecastHour storm{-4.0f, 15.0f, 270.0f, 0.0f};
  expect(near(zone_hour_load(storm, exposed, 21.0f), 3.0f), "load: west storm at -4°C = 3.0");

  // Same wind, mild 11 °C: cold term 1.0 → 1.2
  ForecastHour mild_storm{11.0f, 15.0f, 270.0f, 0.0f};
  expect(near(zone_hour_load(mild_storm, exposed, 21.0f), 1.2f), "load: west storm at 11°C = 1.2");

  // Calm cold day: no wind → no wind-driven load
  ForecastHour calm{-10.0f, 0.0f, 0.0f, 0.0f};
  expect(near(zone_hour_load(calm, exposed, 21.0f), 0.0f), "load: calm cold = 0.0");

  // Wind from the sheltered side (east) → 0
  ForecastHour east_wind{-4.0f, 15.0f, 90.0f, 0.0f};
  expect(near(zone_hour_load(east_wind, exposed, 21.0f), 0.0f), "load: wind on sheltered side = 0.0");

  // Sunny windy day: solar relief subtracts (0.3 × 800/800 = 0.3)
  ForecastHour sunny_storm{-4.0f, 15.0f, 270.0f, 800.0f};
  expect(near(zone_hour_load(sunny_storm, exposed, 21.0f), 2.7f), "load: solar relief subtracts");

  // Interior room ignores the storm entirely
  ZoneExposure interior{};
  interior.exterior_walls = 0;
  expect(near(zone_hour_load(storm, interior, 21.0f), 0.0f), "load: interior room = 0.0");
}

// ---------------------------------------------------------------------------
// compute_zone_preload
// ---------------------------------------------------------------------------
static void fill_calm(ForecastHour *hours, size_t count) {
  for (size_t i = 0; i < count; i++)
    hours[i] = ForecastHour{8.0f, 2.0f, 0.0f, 0.0f};
}

static void test_preload_decision() {
  ForecastHour hours[FORECAST_HOURS];
  PreloadParams params{};  // threshold 1.0, gain 0.5, max 1.5

  ZoneExposure zone{};
  zone.exterior_walls = WALL_WEST;
  zone.wind_exposure = 0.8f;
  zone.solar_gain = 0.0f;
  zone.thermal_lead_h = 12;

  // Storm (load 3.0) arriving at hour 10, lead 12 → inside window.
  // offset = min(1.5, (3.0 - 1.0) × 0.5) = 1.0
  fill_calm(hours, FORECAST_HOURS);
  hours[10] = ForecastHour{-4.0f, 15.0f, 270.0f, 0.0f};
  PreloadDecision d = compute_zone_preload(hours, FORECAST_HOURS, 0, zone, params);
  expect(near(d.offset_c, 1.0f), "preload: storm in 10h, lead 12h → offset 1.0");
  expect(d.peak_in_h == 10, "preload: peak reported at +10h");

  // Same storm, short lead (4 h) → outside window, no preload yet.
  zone.thermal_lead_h = 4;
  d = compute_zone_preload(hours, FORECAST_HOURS, 0, zone, params);
  expect(near(d.offset_c, 0.0f), "preload: storm in 10h, lead 4h → no offset yet");

  // Advance time to 3 h before the storm (now_index 7) → inside the 4 h window.
  d = compute_zone_preload(hours, FORECAST_HOURS, 7, zone, params);
  expect(near(d.offset_c, 1.0f), "preload: lead 4h activates 3h before storm");

  // Violent storm caps at max_offset_c.
  zone.thermal_lead_h = 12;
  hours[10] = ForecastHour{-15.0f, 25.0f, 270.0f, 0.0f};  // load = 0.8×2.5×3.6 = 7.2
  d = compute_zone_preload(hours, FORECAST_HOURS, 0, zone, params);
  expect(near(d.offset_c, 1.5f), "preload: violent storm capped at max_offset");

  // Calm forecast stays below threshold → no offset.
  fill_calm(hours, FORECAST_HOURS);
  d = compute_zone_preload(hours, FORECAST_HOURS, 0, zone, params);
  expect(near(d.offset_c, 0.0f), "preload: calm forecast → no offset");

  // Degenerate inputs are safe.
  d = compute_zone_preload(nullptr, 0, 0, zone, params);
  expect(near(d.offset_c, 0.0f) && d.peak_in_h == -1, "preload: null input → empty decision");
  d = compute_zone_preload(hours, FORECAST_HOURS, FORECAST_HOURS + 5, zone, params);
  expect(near(d.offset_c, 0.0f), "preload: now_index out of range → empty decision");

  // Window clamps at the end of the forecast without reading past it.
  hours[FORECAST_HOURS - 1] = ForecastHour{-4.0f, 15.0f, 270.0f, 0.0f};
  d = compute_zone_preload(hours, FORECAST_HOURS, FORECAST_HOURS - 2, zone, params);
  expect(near(d.offset_c, 1.0f), "preload: window clamped at forecast end");
}

int main() {
  test_wind_alignment();
  test_zone_hour_load();
  test_preload_decision();

  if (g_failures > 0) {
    printf("%d test(s) FAILED.\n", g_failures);
    return EXIT_FAILURE;
  }
  printf("All tests passed.\n");
  return EXIT_SUCCESS;
}
