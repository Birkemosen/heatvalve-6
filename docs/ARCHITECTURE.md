# HeatValve-6 Architecture

## System Overview

HeatValve-6 is a modular underfloor heating (UFH) valve controller built on ESP32-S3 with ESPHome firmware. The architecture separates hardware control from heating algorithms, so zone behavior and control profiles can evolve independently without changing low-level motor/sensor handling.

```
┌─────────────────────────────────────────────────────────────┐
│                    User Configuration                       │
│     heatvalve-6.yaml + deploy/*.yaml entrypoints           │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
         ┌───────────────────────┐
         │     Control Layer     │
         │                       │
         │  • PID                │
         │  • Linear             │
         │  • Tanh               │
         │  • Remote             │
         └───────────┬───────────┘
                     │
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
├── optional/                   Optional integrations
│   ├── pump_control.yaml       ESP-NOW pump relay control
│   └── mqtt_ecodan.yaml        Multi-controller MQTT bridge
├── sensors/                    Sensor templates
│   └── return_temp.yaml        Per-zone Dallas template
├── components/                 Custom ESPHome components
│   └── heatvalve_dashboard/    Standalone web dashboard
├── docs/                       Documentation
├── heatvalve-6.yaml            Single root template
├── deploy/                     Deployment entrypoints
│   ├── local-prod.yaml         Repo-local production
│   ├── local-dev.yaml          Repo-local development
│   ├── esphome-remote.yaml     ESPHome server (no clone)
│   ├── drv8215-test.yaml       DRV8215 test profile
│   └── drv8215-motor1-manual.yaml
└── Makefile                    Build targets
```

## Data Flow

```
Temperature Sensor → Climate Thermostat → Control Algorithm → Valve Position
                          ↑                    (tanh/linear/PID)     ↓
                     Setpoint                                   Cover (motor)
                     Presets                                        ↓
                                                              DRV8215 I2C
```

## Hardware Layer

All hardware control is in `core/` and `boards/`:

- **Motor Control**: 6x DRV8215 I2C H-bridges with shared IPROPI ADC current sensing
- **Constraint**: One motor at a time (shared IPROPI, firmware mutex)
- **Endstop Detection**: Software overcurrent + hardware nFAULT
- **Sensors**: 1-Wire bus (DS18B20), HomeAssistant, BLE, DHT, I2C
- **Communication**: WiFi, MQTT, ESPHome API, ESP-NOW (pump control)
