# Endstop Detection Algorithms

## Hardware Context

HeatValve-6 uses DRV8215 H-bridge drivers with the built-in IPROPI current mirror
output as the **only analog feedback signal**. All 6 IPROPI outputs are wire-ORed to a
single 5.1 kΩ sense resistor read by the ESP32-S3 ADC (GPIO7). Only one motor runs at
a time (firmware invariant), so the active motor's current appears cleanly on the bus.

### Signal Characteristics

| Signal  | HV6 Hardware                        |
|---------|-------------------------------------|
| Tacho   | Derived from IPROPI current modulation via ADC zero-crossing detection |
| Current | Same IPROPI signal, EMA-filtered (α = 0.05) at 10 ms FSM tick rate |

Key implications of the single-signal design:

- **PWM dead zones**: During PWM hold-phase off-time, IPROPI = 0 (coast mode). Both
  ripple counting and current sensing are blind during these intervals.
- **Ripple SNR**: Current ripple from commutator switching has lower amplitude than
  voltage back-EMF ripple. The hysteresis-based zero-crossing detector (12% band,
  5-tick PWM debounce) works, but is noisy.
- **No independent stall signal**: HV6 cannot cleanly separate high current and ripple
  cessation, since both come from IPROPI.

## Detection Overview

Four independent detection mechanisms work together. The first three run in the 10ms
tick loop; the fourth operates at the move-execution level. **Any single mechanism
triggering stops the motor.**

The current-based tick-loop paths (1–2) are gated by a **startup guard** — `pwm_boost_ms
+ ENDSTOP_SETTLE_MS` (~650 ms), shrunk further for near-stop normal moves — to ignore the
initial current transient from PWM boost and motor inrush. The rotation paths (5–6) use
their own ripple-based timing instead and can fire sooner.

Because closing and opening have fundamentally different current profiles (see
[Current Profiles](#current-profile-reference)), all threshold and slope parameters
are **per-direction** — separately configurable for close and open.

```
                        ┌─────────────────────────────────────┐
     Motor Running      │         10ms Tick Loop              │
     ─────────────►     │                                     │
                        │  ┌─── Path 1: Threshold ──────┐    │
                        │  │  current > mean × factor    │    │
                        │  │  sustained 6 ticks (60ms)   │────┤
                        │  └─────────────────────────────┘    │
                        │                                     │
                        │  ┌─── Path 2: Slope (dI/dt) ──┐    │     ┌──────────┐
                        │  │  slope > threshold AND      │    │     │          │
                        │  │  current > mean × floor     │────┼────►│  STOP    │
                        │  │  2 consecutive 500ms windows│    │     │  MOTOR   │
                        │  └─────────────────────────────┘    │     │          │
                        │                                     │     └──────────┘
                        │  ┌─── Path 3: Hard Cap ────────┐    │         ▲
                        │  │  current > 100 mA (instant) │────┤         │
                        │  └─────────────────────────────┘    │         │
                        └─────────────────────────────────────┘         │
                                                                        │
                        ┌─────────────────────────────────────┐         │
     Drive-to-Endstop   │  Path 4: Ripple Safety Limit       │         │
     (open only)        │  ripples > learned × factor         │─────────┘
                        └─────────────────────────────────────┘
```

## Detection Paths

### Path 1: Adaptive Threshold (Primary)

Detects when filtered current exceeds the running mean by a configurable factor,
sustained for multiple consecutive ticks.

```
condition:  current_filtered > mean_current[dir] × current_factor
debounce:   6 consecutive 10 ms FSM ticks (60 ms sustained)
```

| Parameter | Close Default | Open Default | Config Field |
|-----------|--------------|-------------|--------------|
| Current factor | 1.7× | 1.7× | `close_current_factor` / `open_current_factor` |
| Debounce | 6 ticks (60ms) | 6 ticks (60ms) | `ENDSTOP_HIGH_TICKS` (compile-time) |

The threshold references a **per-direction** running mean (`mean_open_currents_[]` /
`mean_close_currents_[]`), each updated after a move in that direction. This matters
because closing draws materially more current than opening (see profile below): a
single blended mean is biased upward by the close direction, inflating the open
threshold above the gentle open stall so the threshold path never trips and the motor
grinds past the open stop. With a direction-specific mean the open threshold tracks
the open running current. The debounce counter resets to zero on any below-threshold
reading, so the overcurrent must be genuinely sustained.

**Close direction:** With 1.7× factor and ~19 mA close mean → threshold ≈ 32 mA. The
close endstop ramps to 35–50 mA and triggers cleanly.

**Open direction:** With 1.7× factor and ~15 mA open mean → threshold ≈ 26 mA. The
open endstop reaches 23–27 mA, so with the per-direction mean this path now triggers
near the top of the open ramp (previously, a blended ~20 mA mean put the threshold at
~34 mA — unreachable — and detection fell back to the slow slope path).

### Path 2: Slope Detection (Secondary)

Detects a sustained positive rate-of-change (dI/dt) in the current signal, combined
with a floor check to avoid false triggers during mid-travel steps.

```
condition:  dI/dt > slope_threshold  AND
            current_filtered > mean_current × slope_current_factor
debounce:   2 consecutive 500 ms windows (1 s of rising current)
```

| Parameter | Close Default | Open Default | Config Field |
|-----------|--------------|-------------|--------------|
| Slope threshold | 0.6 mA/s | 0.15 mA/s | `close_slope_threshold_ma_per_s` / `open_slope_threshold_ma_per_s` |
| Slope floor factor | 1.3× | 1.3× | `close_slope_current_factor` / `open_slope_current_factor` |
| Window size | 500ms | 500ms | `SLOPE_WINDOW_TICKS` (compile-time) |
| Required windows | 2 (1 s) | 1 (~500 ms) | `ENDSTOP_SLOPE_WINDOWS` / `ENDSTOP_SLOPE_WINDOWS_OPEN` |

Every 500 ms, the slope is computed as:

```
dI/dt = (current_now - current_prev) / 0.5 s
```

A window is marked "rising" only if BOTH conditions hold:
1. Slope exceeds the direction-specific threshold
2. Current is above `mean × slope_floor_factor`

The floor condition prevents false triggers on the mid-travel current step (~14 → 19 mA
during closing) where current rises briefly but at low absolute level.

Closing requires 2 consecutive qualifying windows (1 s of sustained rising current);
opening requires only 1 (~500 ms), because the open ramp is gentle and slow and a full
second of grinding past the stop is what produces the audible clicking. A single
non-qualifying window resets the counter.

**Close direction:** The steep ramp (19 → 50 mA) easily produces slopes >0.6 mA/s,
but Path 1 usually fires first due to the high peak.

**Open direction:** The gentle ramp (15 → 25 mA) produces slopes of ~0.15–0.3 mA/s.
With the lower 0.15 mA/s threshold, slope detection is often the **first** trigger
for the open endstop.

### Path 3: Hard Safety Cap (Fast, low-latency)

A fast stop evaluated on the **raw** per-frame current (~17 ms latency) rather than the
~200 ms-lagged EMA, with a tiny 2-tick debounce, against a **fixed** ceiling:

```
raw_current > 100 mA      (ENDSTOP_HARD_CAP_MA)
debounce: 2 consecutive raw frames (HARD_CAP_TICKS)
```

This is a pure catastrophic-fault guard (shorted winding, hard stall). A lower,
direction-aware *open* cap (`mean_open × factor`, floored) was tried and reverted: the
open **breakaway/early-travel** current (~45 mA measured) sits well above the gentle open
stall, so a low open cap fired ~600 ms into the open pass and killed it ("travel too
short"). The open endstop is handled by Path 1/2 (threshold/slope) and the
magnitude-independent Path 5 rotation-stall instead, so the hard cap stays a safety net.

### Path 4: Ripple Safety Limit (Open Direction Only)

An additional mechanism at the move-execution level (outside the tick loop). During
**drive-to-endstop OPEN** moves, it enforces a maximum ripple count derived from the
learned full-stroke count.

```
condition:  ripple_count ≥ learned_open_ripples × ripple_limit_factor
```

| Parameter | Default | Config Field |
|-----------|---------|--------------|
| Ripple limit factor | 1.10× | `open_ripple_limit_factor` (0 = disabled) |

**Why only opening:** The open direction has a gentler current profile that makes
threshold/slope detection less reliable. The ripple limit provides belt-and-suspenders
safety — if the motor has counted 10% more ripples than a full stroke without endstop
detection firing, something is wrong. Set to 0 to disable.

### Path 5: Rotation Stall (Ripple Plateau)

A **magnitude-independent** path: a motor pressed against the mechanical stop can no
longer commutate, so its ripple count stops advancing. This is the backstop for
low-current motors whose stall never reaches the current-referenced thresholds — most
importantly on a **fresh calibration**, before a real `mean_open` is learned, when the
default 20 mA mean puts every current path (threshold, hard cap, slope floor) above the
motor's actual open stall. Without it those motors miss the open endstop entirely and
grind to the runtime-safety cap (`MECHANICAL_OVERRUN`).

```
condition:  ripple_count has not advanced for RIPPLE_STALL_MS (750 ms)
arming:     after the inrush guard AND "connected" — either ripple_count ≥
            RIPPLE_STALL_MIN_COUNT (20, observed rotation) OR current present
            (≥ low_current_threshold_ma, motor energized and pressed on the stop)
```

| Parameter | Default | Config Field |
|-----------|---------|--------------|
| Stall window | 750 ms | `RIPPLE_STALL_MS` (compile-time) |
| Min rotation to arm | 20 ripples | `RIPPLE_STALL_MIN_COUNT` (compile-time) |

This is HV6's analogue of the BEMF stall sensing used by current-less ESPHome valve
controllers (e.g. nliaudat's 8-ch shield, where a BEMF binary sensor *is* the endstop):
commutation-ripple frequency tracks RPM, so a ripple plateau means the rotor stopped.

**Already at the endstop.** The arming deliberately accepts *current present* as proof
of connection, not only rotation. A valve that resets/powers up already at the stop it's
being driven toward (e.g. homing open a valve that defaults to 100% open) never turns —
no ripples — but it *does* draw current pressed against the stop. That reads as
endstop-reached, exactly like a current-based controller, instead of a false
`OPEN_CIRCUIT`. Only a truly disconnected motor — **no current AND no ripples** — is left
to the open-circuit / no-ripple paths. The window is baselined from the guard (not motor
start) so a slow breakaway gets a full `RIPPLE_STALL_MS` to show its first ripple. Limits
grinding to ~750 ms versus the full ~45 s runtime cap. Gated to calibration /
drive-to-endstop moves so a motor blocked *mid-travel* on a normal move isn't recorded as
being at a limit.

### Path 6: Already-at-Endstop (Fast)

A fast special case of Path 5 for "the valve was already on the stop it is being driven
toward" — closing an already-closed valve, or driving open a valve that reset fully open.

```
EARLY (during boost, before the current-filter debounce):
    motor_run_time ≥ EARLY_STALL_MS (250 ms)  AND
    ripple_count == 0  AND  raw current present
LATE  (after the guard, backstop):
    motor_run_time ≥ pwm_boost_ms + ALREADY_AT_STOP_MS  AND  ripple_count == 0  AND  current present
gated to:   calibration or drive-to-endstop moves
```

The motor commutates *during* the boost phase, so a moving valve already has ripples by a
few tens of ms in; **zero** ripples by `EARLY_STALL_MS` means it never moved — it is
pressed against the stop. The **early** variant runs *before* the current debounce
specifically so it fires mid-boost (~250 ms), capping the full-force time on an
already-closed valve to roughly VdMot's 250 ms and preventing the actuator pop-off — the
350 ms boost would otherwise drive an already-closed valve into its stop at full force.
Current presence is required so a disconnected motor (no current, no ripples) is left to
the open-circuit path instead. A moving motor (any ripple) is exempt, so it does not cut
breakaway short. This is why VdMot-style close-first needs no separate homing pass.

> Trade-off: `EARLY_STALL_MS` must exceed the worst-case breakaway time under full boost.
> If a genuinely slow valve produces its first ripple after it, the pass stops short and
> calibration fails ("travel too short") — which is recoverable, unlike a pop-off — so the
> value is biased toward hardware safety.

## Signal Processing

### Current Filtering

Raw ADC readings are smoothed with an exponential moving average (EMA):

```
filtered = filtered × (1 - α) + raw × α
α = 0.05  (slow filter — ~200ms time constant at 10ms ticks)
```

The slow filter constant smooths out PWM ripple while preserving the endstop current
rise, which develops over seconds.

### Mean Current Tracking

Each motor zone maintains **two** running mean currents — one per direction
(`mean_open_currents_[]` / `mean_close_currents_[]`), both initialized to 20 mA. They
adapt to individual motor characteristics and aging. The threshold, slope-floor, and
open hard-cap paths reference the mean for the **active** direction, making detection
self-adjusting and immune to the close/open current asymmetry. Both are persisted to
NVS (`mean_open_current_ma` / `mean_close_current_ma`) and reloaded on boot.

## Current Profile Reference

Measured with HmIP VDMOT actuator + Danfoss RA-N valve body (Normally Open manifold):

| Phase       | Steady-state | Endstop peak | Ripple count |
|-------------|-------------|-------------|--------------|
| Closing     | 14–19 mA    | 33–50 mA   | ~659         |
| Opening     | 14–15 mA    | 23–27 mA   | ~1048        |

Notable features:
- **Mid-travel step** at ~2500 counts (closing): current jumps from ~14 to ~19 mA
  when the actuator pin contacts the valve pin. Not an endstop.
- **Opening inrush**: Brief spike to ~30–40 mA in the first ~100 ms as the spring
  releases. Handled by the startup guard.
- **Asymmetric endstop**: Closing endstop current (~35–50 mA) is significantly higher
  than opening (~25 mA) because closing compresses the return spring.

## Timing Sequence

```
Motor Start
    │
    ├── 0 ms:     BOOST phase (100% duty)
    │               Current inrush — current detection DISABLED
    │
    ├── 250 ms:   Path 6 EARLY already-at-stop: 0 ripples + current → STOP
    │               (during boost; pre-empts pop-off on an already-closed valve)
    │
    ├── 350 ms:   HOLD phase (70% duty, 40ms PWM period)
    │               Current settles to steady-state
    │
    ├── 650 ms:   startup guard (boost + settle) reached
    │               ✓ Paths 1–2 (threshold/slope) ENABLED; Path 5 plateau armed
    │
    ├── 650+ ms:  Slope tracking begins (500ms windows)
    │               Each window: compute dI/dt
    │
    ├── Endstop approach:
    │   ├── Current rises as motor stalls
    │   ├── Path 1 (threshold): 6 ticks above mean[dir]×factor → STOP
    │   ├── Path 2 (slope): close 2 windows / open 1 window, dI/dt > threshold → STOP
    │   ├── Path 3 (hard cap): raw > 100 mA (close) / mean_open×1.7 (open) → STOP
    │   ├── Path 4 (ripple, open only): ripples > learned×1.10 → STOP
    │   ├── Path 5 (rotation stall): no ripple advance for 750 ms → STOP
    │   └── Path 6 (already-at-stop): 0 ripples after boost + current → STOP
    │
    └── Motor stopped, position updated to 0% or 100%
```

## Per-Direction Parameter Summary

| Parameter | Close | Open | Rationale |
|-----------|-------|------|-----------|
| Threshold mean | `mean_close` | `mean_open` | Per-direction; close runs hotter than open |
| Threshold factor | 1.7× (tolerant) | 1.7× (tolerant) | Close has high peak; open barely rises |
| Slope threshold | 0.6 mA/s | 0.15 mA/s | Close ramps steeply; open ramps gently |
| Slope floor | 1.3× | 1.3× | Same mid-travel step protection both ways |
| Slope windows | 2 (1 s) | 1 (~500 ms) | Open ramp is slow; long grind = clicking |
| Hard cap | 100 mA (fixed) | 100 mA (fixed) | Catastrophic guard only; open uses Path 5 stall, not current |
| Ripple limit | N/A | 1.10× | Extra safety for harder-to-detect open endstop |

## Pin Engagement Detection

### Problem

The VdMot actuator has a physical dead zone at the open end of travel. When the
actuator pin lifts off the valve body, further opening has no effect on flow. This
means a portion of the full mechanical stroke is wasted — the motor moves through the
dead zone without changing flow.

### The Current Step

During closing (from open endstop to closed endstop), a distinctive current step
occurs at approximately 30% of travel from the open end:

```
Closing direction (from open → closed):

Current (mA)
  20 ┤                                     ╱╱╱ endstop
     │                                    ╱
  19 ┤──────────────────────────────────╱──
     │            pin engaged ▲        ╱
  18 ┤                        │       ╱
     │           ↑ step ~5 mA │
  14 ┤───────────┘            │
     │  dead zone  │  active flow zone  │
     └──────────────────────────────────── Ripples
     0          ~200                    659
     (open end)                    (closed end)
```

The step from ~14 mA to ~19 mA occurs when the actuator pin physically contacts the
valve pin in the valve body. Before this point, the actuator moves freely with no load
from the valve spring.

### Detection Algorithm

Pin engagement is detected **during calibration close passes** only (not during normal
operation):

```
condition:  current_filtered > baseline + pin_engage_step_ma
debounce:   20 consecutive 10ms ticks (200ms sustained)
```

| Parameter | Default | Config Field |
|-----------|---------|--------------|
| Step threshold | 3.0 mA | `pin_engage_step_ma` |
| Margin offset | 50 ripples | `pin_engage_margin_ripples` |
| Debounce | 20 ticks (200ms) | `PIN_ENGAGE_DEBOUNCE_TICKS` (compile-time) |

1. After the startup guard (1200ms), the filtered current is sampled as the baseline
2. Each tick, if `current > baseline + step_threshold` is sustained for 200ms, the
   ripple count is recorded as `pin_engage_close_ripples`
3. The margin offset moves the effective point further toward open, past the
   detection point, ensuring the pin is fully disengaged at 100% flow

### Flow Range Remapping

When pin engagement data exists (from calibration), position targets are remapped
from flow % to physical %:

```
flow 0%   → physical 0%   (closed endstop, no flow)
flow 100% → physical P%   (pin fully disengaged + margin clearance)

where P = (1 - (pin_engage_ripples - margin) / total_close_ripples) × 100
```

**Example** with pin engagement at 200 ripples, margin 50, total close 659:
- Effective engagement: 200 - 50 = 150 ripples from open end
- Max flow physical: (1 - 150/659) × 100 = 77.2%
- At physical 77.2%, the pin is 50 ripples past disengagement — fully lifted
- Flow 50% → physical 38.6%
- Flow 100% → physical 77.2%

This remapping only affects normal moves via `execute_move_()`. Calibration passes
use the full physical stroke and are unaffected.

### Limitations

- **EMA filter latency**: The α=0.05 filter smears the step over ~500ms, so the
  recorded ripple count is slightly delayed from the true engagement point. The
  margin parameter compensates — it adds clearance past the detected point so that
  100% flow guarantees the pin is fully disengaged.
- **Per-valve variation**: Different valve bodies and actuator wear may shift the
  engagement point. It is learned per-zone during calibration.
- **Opening direction**: Detection runs only during close passes because the current
  drop when the pin disengages during opening is harder to detect reliably.

## ESPHome Configuration Entities

All per-direction parameters are exposed as number entities (UI mode: box) under
`entity_category: config`, taking effect on the next motor run. Values are persisted
to NVS.

| Entity Name | Range | Default | Step |
|-------------|-------|---------|------|
| Motor N Close Endstop Threshold | 1.1× – 3.0× | 1.7× | 0.1 |
| Motor N Close Endstop Slope | 0.1 – 5.0 mA/s | 0.6 | 0.05 |
| Motor N Close Endstop Slope Floor | 1.0× – 2.5× | 1.3× | 0.1 |
| Motor N Open Endstop Threshold | 1.1× – 3.0× | 1.7× | 0.1 |
| Motor N Open Endstop Slope | 0.05 – 5.0 mA/s | 0.15 | 0.05 |
| Motor N Open Endstop Slope Floor | 1.0× – 2.5× | 1.3× | 0.1 |
| Motor N Open Endstop Ripple Limit | 0.0× – 2.0× | 1.2× | 0.1 |
| Pin Engage Step | 1.0 – 10.0 mA | 3.0 | 0.5 |
| Pin Engage Margin | 0 – 200 ripples | 50 | 10 |

## Calibration (Learning)

Each attempt runs **close → open → close** (VdMot order), measuring per-pass:
- Run time (ms)
- Ripple count (commutator zero-crossings)

**Close-first** leans on the reliable endstop: closing compresses the return spring and
draws high current (33–50 mA), so its stop is far easier to detect than the gentle open
stop. It also ends the routine closed (0 %), the position the control layer expects.

Calibration runs at **full hold duty** the whole way — no soft-approach. Soft-approach
drops to ~40 % duty near the stop, which these low-torque motors cannot push through, so a
pass would stall short and run to the runtime cap (`MECHANICAL_OVERRUN`); it also engaged
off stale learned strokes. The endstop is eased by the rotation paths, not reduced duty.

**Pop-off safety without homing.** The historical failure was driving an *already-closed*
valve into its stop at full force, popping the actuator socket off the pin. The
**early already-at-stop** path (Path 6) catches this mid-boost (~250 ms, before the
current debounce) when the valve produces zero ripples — magnitude-independent, no current
tuning, capping full-force time to roughly VdMot's 250 ms. This is also why no separate
"home" pass is needed: a close into an already-closed valve self-terminates fast instead
of over-driving. The blind window for the *current*-based paths is `pwm_boost_ms +
ENDSTOP_SETTLE_MS` (~650 ms).

Validation: each pass must exceed `calibration_min_travel_ms = 3000 ms`.
Up to `calibration_max_retries = 2` retry attempts. On failure, zone is marked blocked.

After successful calibration, the learned values (open_ms, close_ms, open_ripples,
close_ripples, deadzone_ms, mean_open_current, mean_close_current) are persisted to NVS.

## Automatic Relearn

Recalibration is triggered automatically when either condition is met:

| Trigger         | Default          | Config field                |
|-----------------|------------------|-----------------------------|
| Movement count  | 2000 movements   | `relearn_after_movements`   |
| Time elapsed    | 168 hours (1 wk) | `relearn_after_hours`       |

Checked every 10 seconds when idle. Only one zone relearns at a time. Zones that are
blocked, not present, or never learned are skipped.

## Compile-Time Constants

| Constant                      | Value    | Unit    | Purpose                                   |
|-------------------------------|----------|---------|-------------------------------------------|
| `TICK_MS`                     | 10       | ms      | Motor FSM tick interval                   |
| `ENDSTOP_SETTLE_MS`          | 300      | ms      | Post-boost settle; guard = boost + this (~650 ms) |
| `ENDSTOP_MIN_RUNTIME_MS`     | 1200     | ms      | Pin-engagement baseline settle (not the endstop guard) |
| `ALREADY_AT_STOP_MS`         | 100      | ms      | Post-boost margin for already-at-stop (fires ~450 ms) |
| `RIPPLE_STALL_MS`            | 750      | ms      | Rotation-stall plateau window             |
| `ENDSTOP_HIGH_TICKS`         | 6        | ticks   | Sustained threshold debounce (60 ms)      |
| `ENDSTOP_HARD_CAP_MA`        | 100.0    | mA      | Emergency safety cap                      |
| `SLOPE_WINDOW_TICKS`         | 50       | ticks   | Slope evaluation window (500 ms)          |
| `ENDSTOP_SLOPE_WINDOWS`      | 2        | windows | Consecutive rising windows required       |
| `CURRENT_FILTER_ALPHA`       | 0.05     | —       | EMA filter coefficient for current        |
| `DEBOUNCE_TICKS`             | 50       | ticks   | Initial debounce after motor start (500 ms) |
| `INITIAL_MEAN_CURRENT_MA`    | 20.0     | mA      | Bootstrap mean before first calibration   |
