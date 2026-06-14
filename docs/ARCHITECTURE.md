# HeatValve-6 Architecture

## System Overview

HeatValve-6 is a 6-zone underfloor heating (UFH) valve controller built on ESP32-S3 with
ESPHome firmware. Custom C++ components run as FreeRTOS tasks alongside the ESPHome main
loop and separate hardware control (motor FSM, endstop detection) from heating logic
(zone state machine, control algorithms, hydraulic balance).

```
┌──────────────────────────────────────────────────────────────┐
│                     Config Composition                       │
│  configurations/heatvalve-6-ble.yaml → heatvalve-6.yaml      │
│  (substitutions + packages: board / hardware / network /     │
│   zones)                                                     │
└────────────────────────────┬─────────────────────────────────┘
                             ▼
┌──────────────────────────────────────────────────────────────┐
│                    Custom C++ Components                     │
│                                                              │
│  hv6_config_store ← hv6_valve_controller ← hv6_zone_controller
│                                                  ↑           │
│                                          hv6_asgard_bridge   │
│                                          hv6_forecast        │
│                                          hv6_dashboard       │
└────────────────────────────┬─────────────────────────────────┘
                             ▼
┌──────────────────────────────────────────────────────────────┐
│                       Hardware Layer                         │
│  • 6× DRV8215 I2C H-bridge motor drivers                     │
│  • Shared IPROPI current-sense ADC (GPIO7)                   │
│  • 1-Wire DS18B20 probes (8 slots)                           │
│  • BLE (BTHome / Shelly BLU H&T)                             │
│  • Status LED, display                                       │
└──────────────────────────────────────────────────────────────┘
```

## Repository Structure

```
heatvalve-6/
├── heatvalve-6.yaml          Shared base config (substitutions + packages)
├── configurations/
│   └── heatvalve-6-ble.yaml  Active build entrypoint (adds BLE package)
├── packages/
│   ├── board/                ESP32-S3 board definition
│   ├── hardware/             BLE, display, I2C, motors, LED, 1-Wire, sensors
│   ├── network/              WiFi, API, OTA, Asgard bridge, forecast
│   └── zones/                Climate entities, zone sensors, UI, dashboard wiring
├── components/               Custom ESPHome external components (C++)
│   ├── hv6_config_store/     NVS persistence (DeviceConfig struct)
│   ├── hv6_valve_controller/ Motor FSM, endstop detection, ripple counting
│   ├── hv6_zone_controller/  Zone state machine, algorithms, hydraulic balance
│   ├── hv6_asgard_bridge/    Weighted house temp → Asgard/Ecodan thermostat
│   ├── hv6_forecast/         Open-Meteo wind-aware per-zone preload
│   └── hv6_dashboard/        HTTP API (/api/hv6/v1), dashboard asset serving
├── web/
│   ├── dashboard-src/        Dashboard source (modular JS, esbuild)
│   └── dashboard.js          Bundled artifact (committed, embedded in firmware)
├── test/ripple_counter/      Host-side unit tests (clang++, no ESP-IDF)
├── docs/                     Architecture, API contract, integration docs
└── Makefile                  Build/deploy/test targets
```

## FreeRTOS Task Layout

| Task | Core | Priority | Period |
|------|------|----------|--------|
| `hv6_valve` (motor FSM) | 1 | 7 | 10 ms tick |
| `hv6_ripple` (DMA ADC) | 1 | 7 | continuous |
| `hv6_zone` (control cycle) | 0 | 6 | 10 s (configurable) |
| `hv6_asgard` (HTTP) | 1 | 1 | 30 s push (coordinator only) |
| `hv6_forecast` (HTTPS) | 1 | 1 | 1 h fetch / 5 min recompute |
| `hv6_nvs` (flash commit) | 1 | 1 | event-driven |
| ESPHome loopTask | 1 | 1 | — |

Cross-task state is exchanged via FreeRTOS queues and mutexes. Dashboard snapshots are
assembled in `hv6_dashboard::loop()` (main loop) under a dedicated `snapshot_mutex_`.

## Data Flow

### Local Control

```
Temp source (DS18B20 / BLE) → Zone state machine → Control algorithm → Hydraulic balance
                                   ↑                (tanh/linear/PID)        ↓
                              Setpoint + offsets                       Valve position
                                                                            ↓
                                                                   Motor FSM (one at a time)
                                                                            ↓
                                                                       DRV8215 I2C
```

### Setpoint-offset command path

On-device optimizers (currently `hv6_forecast`) write per-zone setpoint-offset / preheat
commands through `Hv6ZoneController::apply_helios_command()`. Offsets are clamped in
firmware by per-zone safety limits; if a producer goes stale, its offsets are cleared and
local control continues unchanged. `HeliosConfig.enabled` (NVS) acts as a quiesce gate so
a producer can stand down if an external optimizer is ever reintroduced.

Whole-house MPC is provided by Odin via the [Asgard / Ecodan bridge](ecodan_integration.md),
not an external HTTP optimizer — the previous `hv6_helios_client` was removed. Removing any
producer reverts transparently to local control: no vendor lock-in, no firmware dependency
on an external service.

## Hardware Layer

- **Motor Control**: 6× DRV8215 I2C H-bridges with shared IPROPI ADC current sensing
- **Constraint**: One motor at a time (all IPROPI outputs wire-ORed to GPIO7; the valve
  FSM enforces sequential execution)
- **Endstop Detection**: Four-path software detection (threshold, slope, hard cap, ripple
  limit) with per-direction parameters — see [endstop_detection.md](endstop_detection.md)
- **Sensors**: 1-Wire DS18B20 (8 slots, NVS-persisted ROM mapping), BLE BTHome
- **Communication**: WiFi, ESPHome native API (Home Assistant), HTTP/JSON (dashboard +
  Asgard bridge). No message broker — MQTT was removed in favor of plain HTTP over LAN.

## Dashboard API

Dashboard transport uses the dedicated `/api/hv6/v1` JSON namespace served by
`hv6_dashboard` on the device web server (port 80):

- The dashboard app is served at `/dashboard` (+ `/dashboard.js`)
- All dashboard reads/writes go through `/api/hv6/v1` — the dashboard must not call
  ESPHome entity REST routes (`/climate`, `/switch`, `/number`, …)
- Home Assistant integration continues through the ESPHome native API
- Contract: [hv6_api_v1.md](hv6_api_v1.md)

Frontend source lives under `web/dashboard-src/` and is bundled by esbuild into
`web/dashboard.js`, which is committed and embedded into the firmware at build time.
