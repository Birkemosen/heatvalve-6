# HeatValve-6 Architecture

## System Overview

HeatValve-6 is a modular underfloor heating (UFH) valve controller built on ESP32-S3 with ESPHome firmware. The architecture separates hardware control from heating algorithms, enabling two independent control systems:

1. **Basic Control** (open-source, this repo) — Simple, reliable valve control with PID/linear/tanh profiles
2. **Helios-6 Advanced Control** (closed-source, separate repo) — Physics-aware, self-learning thermal management

```
┌─────────────────────────────────────────────────────────────┐
│                    User Configuration                       │
│  config.yaml / config_dev.yaml / config_dev_Helios-6.yaml     │
└─────────────────────┬───────────────────────────────────────┘
                      │
          ┌───────────┴───────────┐
          ▼                       ▼
┌─────────────────┐   ┌────────────────────────┐
│  Basic Control  │   │  Helios-6 Advanced     │
│  (this repo)    │   │  (external component)  │
│                 │   │                        │
│  • PID          │   │  • Hydraulic balancing │
│  • Linear       │   │  • Weather-aware       │
│  • Tanh         │   │  • Self-learning       │
│  • Remote       │   │  • Predictive          │
│                 │   │  • License required    │
└────────┬────────┘   └───────────┬────────────┘
         │                        │
         └───────────┬────────────┘
                     ▼
         ┌───────────────────────┐
         │   Hardware Layer      │
         │                       │
         │  • DRV8215 I2C motors │
         │  • 1-Wire sensors     │
         │  • Status LED         │
         │  • MQTT / API         │
         │  • Dashboard          │
         └───────────────────────┘
```

## Repository Structure

```
heatvalve-6/                    (public, open-source)
├── boards/                     Board definitions (ESP32-S3)
├── core/                       Hardware abstraction & shared infrastructure
│   ├── motor_driver.yaml       DRV8215 I2C motor control
│   ├── settings.yaml           Global parameters (comfort band, min opening, etc)
│   ├── onewire.yaml            1-Wire temperature sensors
│   ├── logger.yaml             Logging configuration
│   ├── time.yaml               NTP, reboot scheduling
│   ├── wifi.yaml               WiFi configuration
│   ├── sensor_others.yaml      System sensors (WiFi signal, uptime)
│   └── switch_others.yaml      System switches
├── control/                    Control algorithms (basic)
│   ├── tanh.yaml               Non-linear tanh curve (recommended)
│   ├── linear.yaml             Linear proportional
│   ├── pid.yaml                PID with auto-tune
│   └── remote.yaml             External/Home Assistant control
├── zones/                      Zone templates (base + control profile)
│   ├── base.yaml               Zone infrastructure (motor scripts, endstop, params)
│   ├── tanh.yaml               Zone = base + tanh control
│   ├── linear.yaml             Zone = base + linear control
│   ├── pid.yaml                Zone = base + PID control
│   └── remote.yaml             Zone = base + remote control
├── modes/                      Operating modes (legacy)
│   └── hydraulic.yaml          Basic hydraulic balancing (replaced by Helios-6)
├── optional/                   Optional integrations
│   ├── pump_control.yaml       ESP-NOW pump relay control
│   └── mqtt_ecodan.yaml        Multi-controller MQTT bridge
├── sensors/                    Sensor templates
│   └── return_temp.yaml        Per-zone Dallas template
├── components/                 Custom ESPHome components
│   └── heatvalve_dashboard/    Standalone web dashboard
├── docs/                       Documentation
├── Helios-6.yaml                 Helios-6 integration config
├── config.yaml                 Production config
├── config_dev.yaml             Development config (basic)
├── config_dev_Helios-6.yaml      Development config (Helios-6 enabled)
└── Makefile                    Build targets
```

## Data Flow

### Basic Control Mode

```
Temperature Sensor → Climate Thermostat → Control Algorithm → Valve Position
                          ↑                    (tanh/linear/PID)     ↓
                     Setpoint                                   Cover (motor)
                     Presets                                        ↓
                                                              DRV8215 I2C
```

### Helios-6 Advanced Mode

```
Temperature Sensors ──┐
Weather Data ─────────┤
Energy Prices ────────┼──→ Helios-6 Engine ──→ Hydraulic Balancer ──→ Valve Positions
Solar Influx ─────────┤         ↓                                       ↓
Thermal History ──────┘   Thermal Model                            Cover (motor)
                          (self-learning)                              ↓
                               ↓                                 DRV8215 I2C
                         Predictive Control
                         (preheating, comfort)
```

## Integration Between Systems

Helios-6 integrates with HeatValve-6 through ESPHome's `external_components` system:

```yaml
# In config_dev_Helios-6.yaml
external_components:
  - source:
      type: local
      path: ../Helios-6/components
    components:
      - Helios-6
```

Helios-6 reads zone state through ESPHome entity references (climates, covers, sensors, numbers) rather than modifying core files. This ensures:

- **No vendor lock-in**: Removing Helios-6 reverts to basic control automatically
- **Clean separation**: Basic control never depends on Helios-6 code
- **Graceful fallback**: License expiry → basic control continues working
- **Independent development**: Both systems can be developed and tested separately

## License System

Helios-6 uses RSA-2048 signed license keys validated on the ESP32 using mbedtls:

| License Type | Duration | Grace Period | Fallback |
|-------------|----------|-------------|----------|
| One-Time | Perpetual | N/A | N/A |
| Subscription | Monthly/Annual | 30 days | Basic control |
| Trial | 30 days | None | Basic control |

License validation is performed at boot and periodically (every 24h). NVS storage enables offline validation.

## Hardware Layer

All hardware control is in `core/` and `boards/`:

- **Motor Control**: 6x DRV8215 I2C H-bridges with shared IPROPI ADC current sensing
- **Constraint**: One motor at a time (shared IPROPI, firmware mutex)
- **Endstop Detection**: Four-path software detection (threshold, slope, hard cap, ripple limit) with per-direction parameters — see [endstop_detection.md](endstop_detection.md)
- **Sensors**: 1-Wire bus (DS18B20), HomeAssistant, BLE, DHT, I2C
- **Communication**: WiFi, MQTT, ESPHome API, ESP-NOW (pump control)

## Dashboard API Direction (2026 Restructure)

The project is migrating dashboard transport away from ESPHome entity-name REST calls toward a dedicated JSON API namespace.

- Base HTTP stack remains ESPHome `web_server`
- Dedicated API namespace is `/api/hv6/v1`
- Dashboard transport is HTTP JSON + SSE
- Home Assistant integration continues through ESPHome API/entities/services
- Mock dashboard mode has been removed to keep one production transport path

The API contract and rollout order are defined in [hv6_api_v1.md](hv6_api_v1.md).

Dashboard frontend code is now organized as modular source files under `web/dashboard-src/` and bundled into the single artifact `web/dashboard.js` for ESPHome `web_server` embedding.
