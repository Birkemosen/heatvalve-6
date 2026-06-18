// =============================================================================
// Adaptive balancing step math — Host-runnable unit tests
// =============================================================================
// Build + run (from repo root):
//   clang++ -std=c++17 -O2 -Wall -Wextra \
//     -I components/hv6_zone_controller \
//     test/adaptive_balance/test_adaptive_balance.cpp -o /tmp/test_balance -lm \
//   && /tmp/test_balance
// (Also wired up as `make test-balance`.)
// =============================================================================

#include "adaptive_balance.h"
#include <cmath>
#include <cstdio>

using namespace hv6ab;

static int g_failures = 0;

static void expect(bool cond, const char *what) {
  if (cond) {
    printf("PASS  %s\n", what);
  } else {
    printf("FAIL  %s\n", what);
    g_failures++;
  }
}

static bool near(float a, float b, float eps = 1e-4f) { return std::fabs(a - b) < eps; }

// ---------------------------------------------------------------------------
// Common-mode rejection: when a zone's error equals the manifold mean, the
// learned multiplier must not move (balancing only redistributes residuals).
// ---------------------------------------------------------------------------
static void test_common_mode() {
  AdaptParams p{0.02f, 0.5f, 1.5f};
  expect(near(next_adapt(1.0f, 0.0f, 0.0f, p), 1.0f), "common-mode: equal zero error → no move");
  expect(near(next_adapt(1.2f, 1.5f, 1.5f, p), 1.2f), "common-mode: whole house cold equally → no move");
  expect(near(next_adapt(0.8f, -0.3f, -0.3f, p), 0.8f), "common-mode: whole house warm equally → no move");
}

// ---------------------------------------------------------------------------
// A zone colder than its peers (e_i > e_mean) is flow-starved → factor rises.
// One warmer (e_i < e_mean) is over-served → factor falls. Move is proportional
// to (e_i − e_mean) while inside the per-step bound.
// ---------------------------------------------------------------------------
static void test_direction() {
  AdaptParams p{0.02f, 0.5f, 1.5f};
  // starved by 0.5 °C relative → +0.02·0.5 = +0.01
  expect(near(next_adapt(1.0f, 0.7f, 0.2f, p), 1.01f), "starved zone: factor rises");
  // over-served by 0.5 °C relative → −0.01
  expect(near(next_adapt(1.0f, -0.3f, 0.2f, p), 0.99f), "over-served zone: factor falls");
}

// ---------------------------------------------------------------------------
// The per-update move is bounded by k regardless of how large the relative
// error is (anti-windup by construction).
// ---------------------------------------------------------------------------
static void test_step_bounded() {
  AdaptParams p{0.02f, 0.5f, 1.5f};
  // huge positive relative error → move capped at +k
  expect(near(next_adapt(1.0f, 10.0f, 0.0f, p), 1.02f), "step bound: large +error → +k only");
  // huge negative relative error → move capped at −k
  expect(near(next_adapt(1.0f, -10.0f, 0.0f, p), 0.98f), "step bound: large −error → −k only");
  // exactly at the boundary (relative error = 1.0 °C, k = 0.02) → +k
  expect(near(next_adapt(1.0f, 1.0f, 0.0f, p), 1.02f), "step bound: relative error 1.0 → +k");
}

// ---------------------------------------------------------------------------
// The learned multiplier saturates at [adapt_min, adapt_max].
// ---------------------------------------------------------------------------
static void test_clamps() {
  AdaptParams p{0.02f, 0.5f, 1.5f};
  expect(near(next_adapt(1.5f, 10.0f, 0.0f, p), 1.5f), "clamp: at adapt_max stays at max");
  expect(near(next_adapt(1.49f, 10.0f, 0.0f, p), 1.5f), "clamp: step into max is clamped");
  expect(near(next_adapt(0.5f, -10.0f, 0.0f, p), 0.5f), "clamp: at adapt_min stays at min");
  expect(near(next_adapt(0.51f, -10.0f, 0.0f, p), 0.5f), "clamp: step into min is clamped");
}

// ---------------------------------------------------------------------------
// Self-normalizing: over a 2-zone manifold the sum of corrections trends to
// zero (one rises by the same amount the other falls), so total flow is held.
// ---------------------------------------------------------------------------
static void test_self_normalizing() {
  AdaptParams p{0.02f, 0.5f, 1.5f};
  float e_cold = 0.6f, e_warm = -0.6f;
  float mean = (e_cold + e_warm) / 2.0f;  // = 0
  float up = next_adapt(1.0f, e_cold, mean, p) - 1.0f;
  float down = next_adapt(1.0f, e_warm, mean, p) - 1.0f;
  expect(near(up + down, 0.0f), "self-normalizing: corrections sum to zero");
}

int main() {
  printf("=== Adaptive balancing step math tests ===\n");
  test_common_mode();
  test_direction();
  test_step_bounded();
  test_clamps();
  test_self_normalizing();
  if (g_failures == 0) {
    printf("\nAll tests passed.\n");
    return 0;
  }
  printf("\n%d test(s) FAILED.\n", g_failures);
  return 1;
}
