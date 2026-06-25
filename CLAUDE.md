# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ESPHome firmware for the HeatValve-6 — an ESP32-S3 board controlling 6 DRV8215 I2C H-bridge motor drivers for underfloor heating (UFH) valves. Custom C++ components run as FreeRTOS tasks alongside the ESPHome main loop.

## Commands

```bash
# Validate YAML only
make config

# Build firmware (also rebuilds the dashboard JS)
make build

# Versioning
# Update version.yaml manually before build/release when the firmware version changes.

# Deploy — auto-detects USB port, falls back to mDNS discovery or HOST
make deploy
make deploy PORT=/dev/cu.usbmodemXXXX  # explicit USB
make ota HOST=heatvalve-6-XXXXXX.local  # explicit OTA

# Logs
make logs
make logs HOST=heatvalve-6-XXXXXX.local

# Host unit tests (clang++, no ESP-IDF required)
make test           # all tests
make test-ripple    # ripple counter only
make test-forecast  # forecast preload model only

# Erase NVS (clears calibration + config from flash)
make erase-nvs PORT=/dev/cu.usbmodemXXXX

# Dashboard development
make dashboard-watch   # rebuild web/dashboard.js on source change (requires fswatch)
make dashboard-build   # one-shot bundle
```

The Makefile resolves `esphome` and `platformio` from `.venv313/bin/` → `.venv/bin/` → PATH. The active config is `configurations/heatvalve-6-ble.yaml`.

## Repository Layout

```
heatvalve-6.yaml          ← Shared base config (included by all variants)
configurations/
  heatvalve-6-ble.yaml    ← Active build entrypoint; adds BLE package
packages/
  board/                  ← ESP32-S3 board definition
  hardware/               ← BLE, display, I2C, motors, LED, 1-Wire, sensors
  network/                ← WiFi, API, OTA, Asgard bridge, forecast
  zones/                  ← Climate entities, zone sensors, UI, dashboard wiring
components/               ← Custom ESPHome external components (C++)
  hv6_config_store/       ← NVS persistence (DeviceConfig struct)
  hv6_valve_controller/   ← Motor FSM, endstop detection, ripple counting
  hv6_zone_controller/    ← Zone state machine, control algorithms, hydraulic balance
  hv6_asgard_bridge/      ← Weighted house temp → Asgard/Ecodan virtual thermostat
  hv6_forecast/           ← Open-Meteo wind-aware per-zone preload (forecast_model = host-testable)
  hv6_dashboard/          ← HTTP API + SSE server, dashboard asset serving
web/dashboard-src/        ← Dashboard source (modular JS, bundled by esbuild)
web/dashboard.js          ← Bundled dashboard artifact (committed, served by firmware)
docs/                     ← Architecture, API contract, endstop detection, schematics
test/ripple_counter/      ← Host-side unit test for RippleCounter
test/forecast/            ← Host-side unit test for the forecast preload model
```

## Architecture

### Config Composition

`configurations/heatvalve-6-ble.yaml` is the build entrypoint. It includes `heatvalve-6.yaml` (shared base) which assembles the firmware via `packages:` includes. All user-tunable GPIO pins and control defaults live in the `substitutions:` block at the top of `heatvalve-6.yaml`.

### Custom Components

Six ESPHome external components live under `components/`. Each has a Python `__init__.py` for ESPHome code-generation and C++ implementation files. The components depend on each other in this order:

```
hv6_config_store  ← hv6_valve_controller  ← hv6_zone_controller
                                                     ↑
                                             hv6_asgard_bridge
                                             hv6_forecast
                                             hv6_dashboard (reads all five)
```

### FreeRTOS Task Layout

| Task | Core | Priority | Period |
|------|------|----------|--------|
| `hv6_valve` (motor FSM) | 1 | 7 | 10 ms tick |
| `hv6_ripple` (DMA ADC) | 1 | 7 | continuous |
| `hv6_zone` (control cycle) | 0 | 6 | 10 s (configurable) |
| `hv6_asgard` (HTTP) | 1 | 1 | 30 s push (coordinator only) |
| `hv6_forecast` (HTTPS) | 1 | 1 | 1 h fetch / 5 min recompute |
| `hv6_nvs` (flash commit) | 1 | 1 | event-driven |
| ESPHome loopTask | 1 | 1 | — |

Cross-task state is exchanged via FreeRTOS queues and mutexes. Dashboard snapshots are assembled in `hv6_dashboard::loop()` (main loop) using a dedicated `snapshot_mutex_`.

### Hardware Constraint: One Motor at a Time

All 6 IPROPI outputs are wire-ORed to a single ADC pin (GPIO7). The valve controller FSM enforces sequential execution — only one motor runs at a time. Endstop detection (threshold, slope dI/dt, hard cap, ripple limit) and ripple counting both operate on this shared signal.

### NVS Config Store

`Hv6ConfigStore` wraps the entire `DeviceConfig` struct in a single NVS key. When the struct layout or a default value changes, increment `CONFIG_VERSION` in [components/hv6_config_store/hv6_types.h](components/hv6_config_store/hv6_types.h). On version mismatch, the **main** blob is discarded and C++ defaults apply — but the per-section durable blobs below are overlaid back on top, so user settings survive.

Motor calibration telemetry is stored separately per-motor under keys `mot0`–`mot5`.

**Every user-configurable section is mirrored to its own versioned durable NVS key** so it survives a `CONFIG_VERSION` bump (not just zones/sensors): `system`, `control`, `probes`, `pid`, `motorcfg`, `manifold`, `balancing`, `asgard`, `forecast` (plus `zones` and `sensors`, described below). Each carries its own `*_CONFIG_VERSION` in [hv6_types.h](components/hv6_config_store/hv6_types.h) — **bump only the one whose struct layout changed**, which resets just that section instead of the user's whole config. `save_config_()` writes all sections via the generic `save_section()` helper on every commit; `load_config_()` overlays them via `load_section()` on boot (a missing durable copy is seeded automatically). `erase-nvs` clears everything. Note: a section's settings still reset once on the firmware update that *first introduces or layout-changes* its durable blob (no prior copy exists), then persist across all later updates.

Zone configuration (`ZoneConfig[NUM_ZONES]`: area, pipe type/spacing, exterior walls,
setpoint, per-zone forecast tuning, etc.) is **also mirrored to its own `zones` NVS
key** for the same reason as the BLE pairings below — without it, every firmware update
that bumps `CONFIG_VERSION` would reset the user's per-room setup to defaults. The
durable blob carries its own `ZONE_CONFIG_VERSION` (bump only when `ZoneConfig`'s layout
changes); on boot `load_config_()` overlays it on top of the (possibly version-reset)
main config, and a returning device with no durable copy yet seeds one automatically. It
is written together with the main config on every commit and cleared by `erase-nvs`.

BLE sensor pairing (`SensorConfig`: per-zone `zone_ble_mac` + `zone_temp_source`) is
**also mirrored to its own `sensors` NVS key** so it survives a `CONFIG_VERSION` bump —
otherwise every firmware update that changes the struct would wipe the user's BLE
pairings along with the rest of the discarded blob. On boot, `load_config_()` overlays
the durable `sensors` blob on top of the (possibly version-reset) main config; a
returning device with no durable copy yet seeds one automatically. Both keys are written
together on every config commit, and `erase-nvs` clears it like everything else. The
blob carries its own `SENSOR_CONFIG_VERSION` (bump only when `SensorConfig`'s layout
changes).

### Dashboard

Source files live under `web/dashboard-src/` and are bundled by esbuild into `web/dashboard.js`. The bundled artifact is committed and embedded into the firmware at build time. The stock ESPHome `web_server` UI was removed (it kept per-entity JSON + SSE in scarce internal heap); the C++ `hv6_dashboard` component registers its handler on `web_server_base` directly (auto-loaded, port 80), serves the app at `/dashboard`, and exposes a JSON API at `/api/hv6/v1`. The API contract is documented in [docs/hv6_api_v1.md](docs/hv6_api_v1.md).

The dashboard **must not** call ESPHome entity REST routes (`/climate`, `/switch`, `/number`, etc.) — all dashboard traffic goes through `/api/hv6/v1`.

**Config-card save model** — the Settings + Zones config cards (manifold, asgard, motor-cal, smart-preheat, forecast, zone-room, zone-sensor) use a shared per-card staging controller, `cardForm()` in [web/dashboard-src/core/ui-kit.js](web/dashboard-src/core/ui-kit.js). Edits to any control (number/text/select/toggle, plus the custom wall buttons) are staged locally and surface an **"Unsaved changes"** banner under that card's title with **Apply / Discard**; nothing is written to the device until **Apply** (per-card, not global). Incoming device state refreshes a control only while it is *not* dirty, so pending edits aren't clobbered; switching zones discards a zone card's pending edits. Numeric fields render as flat text between **− / +** steppers (double-click to type) with a magnitude-aware step (`dynamicStep`: declared precision below 1000, scaling up above). Feature-gate toggles (bridge, forecast, absorption) un-fade their gated body off the *staged* toggle so you can enable → edit → Apply in one go. `zone-detail`'s target-temp ± and Zone-Enabled remain **live** (operational thermostat controls, not staged).

The app has four top-level sections (nav in [web/dashboard-src/app/header.js](web/dashboard-src/app/header.js), one `<section data-section>` per area in [web/dashboard-src/app/app-root.js](web/dashboard-src/app/app-root.js); the internal key for Monitor is still `overview`):

- **Monitor** — live system overview: flow diagram, zone-state timeline (with a preheat-absorption band), a compact connectivity card, flow/return + demand graphs, and a read-only fetched-forecast **graph** (`monitor-forecast-preview`, served by `GET /api/hv6/v1/forecast`) plotting temperature + wind speed with hour/direction x-labels.
- **Zones** — three columns for the selected zone: **Zone** (`zone-detail`, which now also shows the merged snapshot — state, temps, flow %, motor learned parameters, last fault), a middle column stacking the sensor/**connectivity** card (`zone-sensor-card`) and the **Faults & Relearn** card (`diag-zone-recovery-card`, reset fault / factors / relearn for the selected zone), and **Zone Settings** (`zone-room-card`). The standalone `diag-zone` snapshot card was folded into `zone-detail`.
- **Settings** — a 4-column equal-height row of global settings: `settings-manifold-card`, `settings-asgard-card`, `settings-motor-calibration-card`, and the combined **Smart Heating** card (`settings-smart-heating-card`, hosting `smart-preheat-card` and `settings-forecast-card` as subsections). Collapses to 2 columns ≤1200px and 1 column ≤860px. The **Motor Drivers** enable toggle lives at the top of `settings-motor-calibration-card`.
- **Logs** — live device-log stream (`logs-view`, fed by `GET /api/hv6/v1/logs?since=<seq>` which taps the ESPHome logger via `add_log_callback`) plus device-level diagnostics, the manual **Motor Control** card (`diag-zone-motor-card`, for fault situations), the **Device Control** actions card (`settings-control-card` — probe-map reset, 1-Wire dump, restart), `diag-manual-badge`, `diag-i2c`, `diag-activity`.

Preheat-absorption episodes are surfaced two ways: the live `ESP_LOGI` lines appear in the Logs view, and the on/off history is drawn as a band on the Monitor zone-state timeline (the `/history` ring carries a trailing `absorbing` flag per sample). Global typography scales from `html { font-size }` (12px) in [app-root.js](web/dashboard-src/app/app-root.js).

### Helios command path (internal)

The external `hv6_helios_client` component was **removed** — whole-house MPC is now handled by Odin via the Asgard bridge, not an external Helios-3 HTTP optimizer. What remains is the **internal command path**: `HeliosZoneCommand`, `Hv6ZoneController::apply_helios_command()` / `clear_all_helios_commands()`, and `HeliosConfig` in NVS. Forecast preload writes its per-zone offsets through this path so the per-zone safety clamps (`min_offset_c`, `max_offset_c` in `ZoneConfig`) apply unchanged. `HeliosConfig.enabled` is retained as a quiesce gate (always false now; lets forecast stand down if a future external optimizer is reintroduced) — the dashboard no longer exposes any Helios controls.

### Asgard / Ecodan Bridge

`hv6_asgard_bridge` pushes the house-weighted room temperature (Σ temp×area / Σ area over all enabled zones with a valid reading) to Asgard's virtual thermostat z1 via REST. Two boards run identical firmware; the runtime NVS toggle `coordinator` selects which board aggregates — the master polls the peer board's compact `GET /api/hv6/v1/peer` snapshot and excludes peer data older than `peer_stale_after_s`. Configured via the dashboard Asgard card (`AsgardConfig` in NVS). See [docs/ecodan_integration.md](docs/ecodan_integration.md).

### Forecast Preload (wind-aware)

`hv6_forecast` fetches a 48 h Open-Meteo forecast (HTTPS, cached in its own `hv6f` NVS namespace) and issues per-zone setpoint preload offsets through the **existing Helios command path** (so all per-zone clamps apply). Per forecast hour each zone gets a dimensionless weather load = wind hitting its `exterior_walls` (direction-matched) × cold × exposure − solar relief; when the peak load inside the zone's `thermal_lead_h` window exceeds `load_threshold`, an offset is applied so the slab charges before the storm. The producer **auto-quiesces while an external Helios service is enabled**. The load/preload math lives in [components/hv6_forecast/forecast_model.cpp](components/hv6_forecast/forecast_model.cpp) (namespace `hv6fc`, no ESP deps) and is host-tested via `make test-forecast`. Global settings (`ForecastConfig`) live in the dashboard Forecast card, which also shows each zone's live preload offset; the per-zone `wind_exposure`/`solar_gain_factor`/`thermal_lead_h` are edited in the Zone card next to `exterior_walls`. `wind_exposure` is auto-seeded from the `exterior_walls` bitmask (via `default_wind_exposure()` in [hv6_types.h](components/hv6_config_store/hv6_types.h)) whenever the walls change, and stays user-editable. See [docs/forecast_preload.md](docs/forecast_preload.md).

### BLE Temperature Sources

The BLE variant (`heatvalve-6-ble.yaml`) enables passive BTHome scanning for Shelly BLU H&T sensors. Each zone can use either a local DS18B20 probe or a BLE sensor as its control input (`TempSource::LOCAL_PROBE` vs `TempSource::BLE_SENSOR`). External temperatures are considered stale after 60 minutes.

### DS18B20 ROM Mapping

Probe slot assignments (`probe_addr_1`–`probe_addr_8`) are persisted to NVS. On boot, stored ROMs are re-applied to the ESPHome sensor entities so that probe slots remain stable across reboots. A watchdog tracks per-probe consecutive-miss counters: if ≥ 2 of ≥ 4 mapped probes are each persistently missing (4 × 30 s cycles), the map is reset and the device reboots to relearn. If *all* mapped probes go missing at once, it is treated as a 1-Wire bus fault and the map is kept. The reset is intentionally atomic (all slots) — a partially cleared map would let index-based fallback assign a ROM another slot already owns.

### Control Algorithms

Zone valve positions are calculated every 10 s by `Hv6ZoneController`. Available algorithms (set per-zone in `ControlAlgorithm` enum): `TANH` (default, nonlinear smooth response), `LINEAR`, `PID`. Hydraulic balance factors scale raw positions by pipe length and zone area. A `global_min_valve_opening` floor ensures the heat source always has minimum flow.

**Preheat absorption**: when hot water arrives (flow ≥ house-avg + `preheat_detect_delta_c`) while no zone demands heat, an external optimizer (Odin via Asgard) is pre-buffering. The overheat cutoff is then raised by `preheat_absorb_band_c`, weighted by floor thermal mass, so satisfied zones keep their maintenance opening instead of closing and fighting the optimizer. Releases immediately on any zone demand. See [docs/ecodan_integration.md](docs/ecodan_integration.md).

## Known Issues / Remaining Work

**ESPHome stock web UI still enabled** — `web_server: version: 2` ([packages/network/api.yaml](packages/network/api.yaml)) runs the full ESPHome web UI with entity REST routes and SSE on port 80. The custom dashboard doesn't use any of it (it talks to `/api/hv6/v1`), and Home Assistant uses the native API. Replacing `web_server` with bare `web_server_base` would free RAM/CPU, at the cost of losing the stock fallback UI.

**Enveloped v1 read endpoints pending** — `GET /api/hv6/v1/state` returns the raw snapshot map consumed by the frontend store; the resource-shaped `overview`/`zones` reads and SSE from [docs/hv6_api_v1.md](docs/hv6_api_v1.md) are not yet implemented.
