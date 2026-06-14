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

# Build with version bump
make build-patch    # x.x.N+1
make build-minor    # x.N+1.0
make build-major    # N+1.0.0

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
  network/                ← WiFi, API, OTA, Helios client, Asgard bridge, forecast
  zones/                  ← Climate entities, zone sensors, UI, dashboard wiring
components/               ← Custom ESPHome external components (C++)
  hv6_config_store/       ← NVS persistence (DeviceConfig struct)
  hv6_valve_controller/   ← Motor FSM, endstop detection, ripple counting
  hv6_zone_controller/    ← Zone state machine, control algorithms, hydraulic balance
  hv6_helios_client/      ← HTTP client for external Helios-3 optimizer
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

Seven ESPHome external components live under `components/`. Each has a Python `__init__.py` for ESPHome code-generation and C++ implementation files. The components depend on each other in this order:

```
hv6_config_store  ← hv6_valve_controller  ← hv6_zone_controller
                                                     ↑
                                             hv6_helios_client
                                             hv6_asgard_bridge
                                             hv6_forecast
                                             hv6_dashboard (reads all six)
```

### FreeRTOS Task Layout

| Task | Core | Priority | Period |
|------|------|----------|--------|
| `hv6_valve` (motor FSM) | 1 | 7 | 10 ms tick |
| `hv6_ripple` (DMA ADC) | 1 | 7 | continuous |
| `hv6_zone` (control cycle) | 0 | 6 | 10 s (configurable) |
| `hv6_helios` (HTTP) | 1 | 1 | 60 s poll |
| `hv6_asgard` (HTTP) | 1 | 1 | 30 s push (coordinator only) |
| `hv6_forecast` (HTTPS) | 1 | 1 | 1 h fetch / 5 min recompute |
| `hv6_nvs` (flash commit) | 1 | 1 | event-driven |
| ESPHome loopTask | 1 | 1 | — |

Cross-task state is exchanged via FreeRTOS queues and mutexes. Dashboard snapshots are assembled in `hv6_dashboard::loop()` (main loop) using a dedicated `snapshot_mutex_`.

### Hardware Constraint: One Motor at a Time

All 6 IPROPI outputs are wire-ORed to a single ADC pin (GPIO7). The valve controller FSM enforces sequential execution — only one motor runs at a time. Endstop detection (threshold, slope dI/dt, hard cap, ripple limit) and ripple counting both operate on this shared signal.

### NVS Config Store

`Hv6ConfigStore` wraps the entire `DeviceConfig` struct in a single NVS key. When the struct layout or a default value changes, increment `CONFIG_VERSION` in [components/hv6_config_store/hv6_types.h](components/hv6_config_store/hv6_types.h). On version mismatch, NVS is discarded and C++ defaults apply.

Motor calibration telemetry is stored separately per-motor under keys `mot0`–`mot5`.

### Dashboard

Source files live under `web/dashboard-src/` and are bundled by esbuild into `web/dashboard.js`. The bundled artifact is committed and embedded into the firmware at build time via ESPHome's `web_server` component. The C++ `hv6_dashboard` component serves the app at `/dashboard` and exposes a JSON API at `/api/hv6/v1` on the device web server (port 80). The API contract is documented in [docs/hv6_api_v1.md](docs/hv6_api_v1.md).

The dashboard **must not** call ESPHome entity REST routes (`/climate`, `/switch`, `/number`, etc.) — all dashboard traffic goes through `/api/hv6/v1`.

### Helios-3 Integration

`hv6_helios_client` optionally pushes a system snapshot to an external Helios-3 HTTP optimizer and polls for per-zone setpoint offset commands. Offsets are clamped by per-zone safety limits (`min_offset_c`, `max_offset_c`, `abs_min_c`, `abs_max_c` in `ZoneConfig`). The integration is configured via `HeliosConfig` in NVS and enabled/disabled at runtime — removing it reverts transparently to local control algorithms.

### Asgard / Ecodan Bridge

`hv6_asgard_bridge` pushes the house-weighted room temperature (Σ temp×area / Σ area over all enabled zones with a valid reading) to Asgard's virtual thermostat z1 via REST. Two boards run identical firmware; the runtime NVS toggle `coordinator` selects which board aggregates — the master polls the peer board's compact `GET /api/hv6/v1/peer` snapshot and excludes peer data older than `peer_stale_after_s`. Configured via the dashboard Asgard card (`AsgardConfig` in NVS). See [docs/ecodan_integration.md](docs/ecodan_integration.md).

### Forecast Preload (wind-aware)

`hv6_forecast` fetches a 48 h Open-Meteo forecast (HTTPS, cached in its own `hv6f` NVS namespace) and issues per-zone setpoint preload offsets through the **existing Helios command path** (so all per-zone clamps apply). Per forecast hour each zone gets a dimensionless weather load = wind hitting its `exterior_walls` (direction-matched) × cold × exposure − solar relief; when the peak load inside the zone's `thermal_lead_h` window exceeds `load_threshold`, an offset is applied so the slab charges before the storm. The producer **auto-quiesces while an external Helios service is enabled**. The load/preload math lives in [components/hv6_forecast/forecast_model.cpp](components/hv6_forecast/forecast_model.cpp) (namespace `hv6fc`, no ESP deps) and is host-tested via `make test-forecast`. Configured via the dashboard Forecast card (`ForecastConfig` + per-zone `wind_exposure`/`solar_gain_factor`/`thermal_lead_h`). See [docs/forecast_preload.md](docs/forecast_preload.md).

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
