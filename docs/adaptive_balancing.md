# Adaptive Hydraulic Balancing (room-temperature feedback, no return probes)

## Goal

Replace return-temperature-based balancing with a **self-learning balance** that uses
only signals the board already has reliably:

- the **static hydraulic model** (per-zone area, pipe spacing/type, heat loss → design flow)
  as the starting estimate, and
- **room-temperature control performance** (how well each zone holds its setpoint) as the
  slow correction term.

This is the way the Homematic IP **Falmot-C12** balances: continuous (0–100 %) motorized
valves modulated so that loops reach setpoint together, with per-channel openings adapted
from observed room behaviour — **no flow meters, no return-temperature sensors**. HV6
already has the continuous valves and the room sensors; this change adds the adaptive outer
loop.

Return probes are deliberately **out of scope** here. The manifold supply/return pair (and
any per-loop return probes) remain available for diagnostics only and are not an input to
this controller.

## Why room-temperature feedback is sufficient (and ΔT is not)

At UFH temperatures the per-loop ΔT is ~3–7 °C, so a ±0.5 °C probe is 10–20 % of the whole
signal — too noisy to balance on. The **room sensor**, by contrast, is the quantity we
actually care about and is already used for control. If two comparable rooms need very
different valve openings to hold setpoint — or one chronically lags while wide open — that
*is* the hydraulic imbalance, observed directly at the output instead of inferred from a
marginal ΔT.

## Current code (what this builds on)

Per control cycle (`Hv6ZoneController::control_cycle_`, ~10 s) the inner loop computes, per
zone *i*:

```
raw_i      = compute_raw_position_(i, temp_i, setpoint_i)   // TANH/LINEAR/PID
target_i   = apply_hydraulic_balance_(i, raw_i)             // raw_i * balance_factors_[i]
```

`balance_factors_[i]` is produced by `recalculate_balance_factors_()`
([hv6_zone_controller.cpp](../components/hv6_zone_controller/hv6_zone_controller.cpp)):

- **Static path** — `calculate_hydraulic_outputs_()` derives a design flow
  `V_i = (area_i · heat_loss_i) / (ΔT · 1.163)` and the normalized factor
  `balance_factors_[i] = V_i / max_j V_j` (≤ 1, the highest-flow loop is the reference).
  Note `pipe_correction_factor_()` / `floor_correction_factor_()` are defined
  ([:1498](../components/hv6_zone_controller/hv6_zone_controller.cpp#L1498),
  [:1505](../components/hv6_zone_controller/hv6_zone_controller.cpp#L1505)) but **not used**
  in this path — pipe length only drives the over-length warning. §1a wires them in.
- **Dynamic path** (`dynamic_balancing_enabled`) — overwrites the factor from measured
  flow−return ΔT. **This path is what we are replacing.**

The change makes the static model resistance-aware (the *prior*) and adds a learned
room-temp correction on top.

## Design

### 1. Factor decomposition

Split the per-zone factor into a static prior and a learned correction:

```
balance_factors_[i] = clamp( static_factor_i × adapt_i , 0 , 1 )
```

- `static_factor_i` — recomputed fresh from config (§1a). It carries the *engineering
  estimate* from the numbers the user can supply and reacts immediately to config edits.
- `adapt_i` — the **learned** multiplier, starts at `1.0`, drifts slowly from room-temp
  feedback, clamped to `[adapt_min, adapt_max]` (default `0.5 … 1.5`).

Only `adapt_i` is learned/persisted; `static_factor_i` is always derived fresh from config,
so a pipe/area edit is never overwritten by stale learning — it just re-seeds the prior the
correction rides on.

**Cold start = the static prior.** On a fresh board (or after a balancing reset)
`adapt_i = 1.0`, so `balance_factors_[i] = static_factor_i` from cycle one. The valves do
**not** open equally — they open *unequally*, scaled by each loop's modelled flow need and
resistance (normalized so the most-demanding loop = 1.0 and the rest are throttled below it).
Equal openings only occur if every zone is genuinely identical. The adaptive loop then only
corrects the *residual* the static model couldn't see (actual installed pipe, screed
coverage, furniture, manifold port differences) — it is a refinement, never the only line of
defence.

### 1a. Static prior — resistance-aware, from the numbers a user can find

Today's static factor is **demand-only**: `flow_i = area_i · heat_loss_i / (ΔT · 1.163)`,
then `static_factor_i = flow_i / max_j flow_j` ([:1294](../components/hv6_zone_controller/hv6_zone_controller.cpp#L1294)).
It gives each loop the flow its *heat demand* needs but ignores hydraulic *resistance* — a
long, thin loop flows less than a short one at the same opening — even though
`pipe_correction_factor_()` and `floor_correction_factor_()` are already implemented but
**unused** in the balance path. We wire them in so a hydraulically unbalanced manifold is
handled from the first cycle, not only after the room-temp loop converges:

```
static_factor_i = normalize_i( demand_i × floor_factor_i × resistance_factor_i )

  demand_i          = area_i · heat_loss_i                 // design heat → flow need
  floor_factor_i    = floor_correction_factor_(floor_type_i, cover_mm_i)
                      //  high-R covering (carpet/wood) needs more flow to emit the same heat
  resistance_factor_i = length_term(L_i) · pipe_correction_factor_(pipe_type_i)
      L_i           = calculate_pipe_length_m_(area_i, spacing_i, supply_pipe_i)
      length_term   = L_i / L_ref     // longer loop ⇒ more opening for equal flow
```

`normalize_i(·)` divides by the manifold maximum so the result stays in `(0, 1]`. Each factor
is **multiplicatively neutral (1.0) when its input is unknown**, so the model degrades
gracefully to the demand-only prior and the adaptive loop absorbs the rest.

The exact exponents (how strongly length/diameter weigh) are tunable and don't need to be
exact — the static prior only has to get the *ordering* roughly right; `adapt_i` corrects
magnitude. Keep the existing `[0.85, 1.35]` clamp on `pipe_correction_factor_` and add a
matching clamp on `length_term` so one mis-entered number can't dominate.

### 1b. Inputs the user provides

The principle: **ask only for what a homeowner can realistically find, give everything else a
safe default, and let the adaptive loop cover the uncertainty.**

| Input | Status | If missing |
|-------|--------|-----------|
| **Area (m²)** | **Required** — everyone knows room size | n/a (already required) |
| **Pipe type** (e.g. PEX 16 mm) | **Required** — printed on the pipe / install docs | n/a |
| **Floor type** (tile / wood / carpet) | **Required** — visible | n/a |
| Pipe spacing (mm) | **Optional** — hard to know without plans | default **200 mm** (standard); `length_term` still computed from area |
| Heat loss (W/m²) | Optional | sensible default (or derive from `exterior_walls`) |
| Floor cover thickness | Optional | floor-type default |
| Supply-pipe run to manifold | Optional | existing default (`supply_pipe_length_m = 2.0`) |

So the *minimum* a user must enter for a meaningful prior is **area + pipe type + floor
type** — three things anyone can determine by looking. Spacing is the one genuinely hard
number, so it is optional with a **200 mm** default; getting it wrong only shifts the
`length_term`, which the adaptive loop then trims out. The dashboard should mark the three
required fields and visually de-emphasise the optional ones (with their defaults shown).

**Why 200 mm, not 150 mm.** Pipe length per m² = `area / spacing`, so the default directly
scales the modelled loop length and resistance:

| Spacing | Pipe per m² | 15 m² room | Use |
|---------|-------------|-----------|-----|
| 300 mm  | 3.3 m/m²    | ~50 m     | low demand / well-insulated |
| **200 mm** | **5.0 m/m²** | **~75 m** | **standard living space (default)** |
| 150 mm  | 6.7 m/m²    | ~100 m    | high output (bathrooms, edge zones) |

150 mm is a *high-output* spacing — defaulting to it overestimates loop length by ~33 % vs
200 mm (and ~2× vs 300 mm), which both inflates the resistance term and pushes normal-size
rooms past the over-length warning threshold (≈100 m for 16 mm PEX). 200 mm is the
representative middle and matches the existing `ZoneConfig::pipe_spacing_mm = 200` default.
**Note:** the current `calculate_pipe_length_m_()` fallback for an empty spacing is `0.15 m`
([:1493](../components/hv6_zone_controller/hv6_zone_controller.cpp#L1493)) — inconsistent
with the 200 mm config default; change it to `0.20 m` as part of this work.

### 2. The adaptation signal — relative setpoint error

Define each zone's **control error** while it is actively, validly heating:

```
e_i = setpoint_i − temp_i        // °C, positive = room too cold
```

Accumulate a long-window average `ē_i` (see sampling gates below). The manifold common-mode
is the mean over the zones contributing this cycle:

```
ē = mean_i( ē_i )   over eligible zones
```

Balancing is **redistribution of a shared flow**, so we adapt on the *relative* error:

```
adapt_i ← adapt_i + k · (ē_i − ē)
adapt_i ← clamp(adapt_i, adapt_min, adapt_max)
```

- A zone chronically colder than its peers (`ē_i > ē`) is flow-starved → `adapt_i` rises →
  it gets a larger share.
- A zone satisfied more easily than its peers (`ē_i < ē`) is over-served → `adapt_i` falls.

Using `(ē_i − ē)` cancels the **common mode**: if the whole house is cold because the supply
temperature is too low, every `e_i` rises together, `(ē_i − ē) ≈ 0`, and balancing does
**not** react (that is the heat source's / thermostat's job, not balancing's). The controller
only ever moves flow *between* loops, never demands more total heat — so it cannot fight the
Asgard/Ecodan loop or the room thermostats.

`k` is small (e.g. `adapt_step` ≈ 0.02 per update) and updates run on a slow cadence
(`adapt_interval_s`, default 1 h), so full convergence takes days — appropriate for a slab
with hours of thermal lag. This is a set-and-forget process.

### 3. Sampling validity gates

`e_i` is only accumulated into `ē_i` when the sample reflects a *balancing* condition, not a
heat-availability or transient condition. Skip the cycle for zone *i* unless **all** hold:

- zone enabled and calibrated (`learned_open_ms` & `learned_close_ms` > 0);
- zone state is `DEMAND` or `SATISFIED` (not `OVERHEATED`/`UNKNOWN`/failsafe);
- **heat is available** — manifold flow temp valid and above room temp by a margin
  (`read_manifold_flow_()`), i.e. the heat source is actually delivering; otherwise a cold
  room is a no-heat artefact, not an imbalance;
- not inside a **preheat-absorb** episode (`preheat_absorb_active_`) and no active
  **forecast preload** offset on the zone — both create artificial openings that would bias
  the error;
- the manifold is **not** in the `apply_minimum_flow_` / `enforce_minimum_total_opening_`
  override (those force openings unrelated to demand).

Accumulate as a time- or sample-weighted EMA so a few cycles don't swing the average:

```
ē_i ← β · e_i + (1−β) · ē_i        // β from adapt_error_window_s
n_i += 1                            // require n_i ≥ adapt_min_samples before first update
```

A zone with too few valid samples this interval keeps its current `adapt_i` (no update).

### 4. Update cadence and convergence

- Inner loop (10 s): accumulate `ē_i`, `n_i` for eligible zones.
- Outer loop (`adapt_interval_s`, ~1 h): if `≥ adapt_min_samples` eligible zones contributed,
  compute `ē`, step every contributing zone's `adapt_i` toward balance, clamp, then rebuild
  `balance_factors_[i] = clamp(static_factor_i × adapt_i, 0, 1)` and reset accumulators.

Per-update step is bounded by `k`, so the worst-case excursion per hour is small (anti-windup
by construction). Convergence over ~days is expected and desirable.

### 5. Merged zones

For zones merged via `sync_to_zone` (see "Merge Zones"), the room is shared: compute the
error on the **merged** temperature once, and apply the **primary's** `adapt_i` to both
channels (they already open equally). Secondary merged zones do not run their own adaptation.

### 6. Interaction with existing floors/caps

`adapt_i` only reshapes the *relative* split. The absolute guarantees are unchanged and
applied after balancing as today:

- `max_opening_pct` per zone clamps the result;
- `global_min_valve_opening` / `apply_minimum_flow_` still floor a modulating heat source's
  minimum flow;
- `enforce_minimum_total_opening_` still guarantees total manifold flow.

## Configuration

Add to `BalancingConfig`
([hv6_types.h](../components/hv6_config_store/hv6_types.h)):

```cpp
enum class BalanceMode : uint8_t { STATIC = 0, RETURN_TEMP = 1, ADAPTIVE = 2 };

struct BalancingConfig {
  // ... existing fields ...
  BalanceMode mode = BalanceMode::STATIC;   // supersedes dynamic_balancing_enabled
  uint32_t adapt_interval_s   = 3600;       // outer-loop period
  float    adapt_step         = 0.02f;      // k: max factor move per update
  float    adapt_min          = 0.5f;       // clamp on the learned multiplier
  float    adapt_max          = 1.5f;
  float    adapt_error_window_s = 1800.0f;  // β = dt / window for the error EMA
  uint16_t adapt_min_samples  = 30;         // eligible cycles before first update
  float    adapt_heat_margin_c = 2.0f;      // flow_temp must exceed room by this to sample
};
```

Per-zone learned state in `ZoneConfig` (persisted, see versioning):

```cpp
float balance_adapt = 1.0f;   // learned correction multiplier (adapt_i)
```

Keep `dynamic_balancing_enabled` as a back-compat alias that maps to
`mode = RETURN_TEMP`; `mode = ADAPTIVE` is the new recommended default for boards with no
return probes. `RETURN_TEMP` can be retired once `ADAPTIVE` is validated.

### Persistence / versioning

- `BalancingConfig` gains fields → bump `CONFIG_VERSION`
  ([hv6_types.h](../components/hv6_config_store/hv6_types.h)).
- `balance_adapt` lives in `ZoneConfig`, which is mirrored to the durable `zones` NVS blob —
  bump `ZONE_CONFIG_VERSION` so the learned correction survives a `CONFIG_VERSION` reset like
  the rest of the per-room setup (see CLAUDE.md → NVS Config Store).
- `adapt_i` changes slowly: persist it **on the outer-loop update only when it moved by a
  meaningful delta** (e.g. ≥ 0.01), not every cycle — this respects the no-flash-wear
  constraint (NVS writes ≈ a few per day, not per 10 s).

## Code changes (summary)

1. `BalancingConfig` / `ZoneConfig` / version bumps as above.
2. `calculate_hydraulic_outputs_()` — make the design flow resistance-aware (§1a): multiply
   `demand_i` by `floor_correction_factor_(floor_type, cover_mm)` and
   `length_term(L_i) · pipe_correction_factor_(pipe_type)`. Each term defaults to 1.0 when its
   input is unset; `spacing` falls back to **200 mm** inside `calculate_pipe_length_m_()`
   (change the current `0.15 m` fallback at
   [:1493](../components/hv6_zone_controller/hv6_zone_controller.cpp#L1493) to `0.20 m` to
   match `ZoneConfig`'s 200 mm default — see §1b). Clamp `length_term` like the existing
   pipe-correction clamp.
3. `recalculate_balance_factors_()` — add a `BalanceMode::ADAPTIVE` branch:
   `static_factor_i` (now resistance-aware) × `zone.balance_adapt`, clamped.
4. New `update_adaptive_balance_()` (outer loop), called from `control_cycle_` on the
   `adapt_interval_s` cadence; new RAM accumulators `adapt_err_ema_[]`, `adapt_samples_[]`,
   `last_adapt_ms_`.
5. New `accumulate_balance_error_(i, e_i)` called per cycle for eligible zones (gates in §3).
6. Mirror to `snapshots_[i]`: `static_factor`, `balance_adapt`, effective `hydraulic_factor`,
   and `adapt_err_ema` so the dashboard can show *why* a loop is being throttled/boosted.
7. Reset/relearn: a command to set all `balance_adapt = 1.0` and clear accumulators (extend
   the existing relearn/reset action surface).
8. Extract the pure step math — `next_adapt(adapt, e_i, e_mean, cfg)` returning the clamped
   new multiplier — into a free function with no ESP deps, **host-testable** like
   `forecast_model` (`make test`).

## Dashboard

Settings → balancing card: replace the return-temp toggle/ΔT with a **mode selector**
(Static / Adaptive) and the adaptive knobs (interval, step, min/max). Per-zone, surface
`static × adapt = effective` and the long-term error so the user can see the controller
converging, plus a **Reset balancing** action. (Frontend uses the staged `cardForm()` model
like the other config cards.)

## Test plan

1. `make test` — a new host test for `next_adapt()`: common-mode rejection (equal errors →
   no move), starved zone (`e_i > ē` → factor up, clamped), over-served zone (down), step
   bounded by `k`, clamps at `adapt_min/max`.
2. On device: enable `ADAPTIVE`, log `static/adapt/effective` per zone hourly; verify a known
   under-heating room's `adapt_i` rises over days and its steady-state error shrinks toward
   the manifold mean, while total flow (heat demand) is unchanged.
3. Confirm gates: adaptation freezes with no heat available, during preheat-absorb, during
   forecast preload, and in min-flow override.
4. Reboot mid-learn: `balance_adapt` reloads from the durable `zones` blob; no reset.

## Risks / mitigations

- **Runaway / oscillation** — bounded by small `k`, `[adapt_min, adapt_max]` clamp, long EMA,
  and slow cadence. Relative-error formulation is self-normalizing (sum of corrections trends
  to zero).
- **Confounding demand differences** — handled by the static prior (design heat loss) doing
  the coarse split; adaptation only corrects the residual the model missed (actual installed
  pipe, emission, covering).
- **Sensor dropout** — a zone with no valid temp simply doesn't contribute samples and holds
  its current `adapt_i`.
- **Fighting the heat source** — impossible by construction: common-mode cancellation means
  the controller only redistributes proportion, never raises total demand.
