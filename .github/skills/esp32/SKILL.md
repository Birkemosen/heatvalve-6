---
name: esp32-s3-ufh-pcb
description: functional skills for each UFH PCB based on ESP32-S3
---

# ESP32-S3 PCB Skills

## Purpose
This file describes the functional skills for each UFH PCB based on the ESP32-S3.

---

## High Priority
- **Zone Control**: Control 6 VDMOT valves (0–100%) via PWM or GPIO
- **Local PID / Manifold Balancing**: Calculate valve positions based on return temperatures (DS18B20)
- **Sensor Reading**: Read all DS18B20 sensors for return temperature
- **Failsafe / Minimum Flow**: Ensure total valve opening does not fall below minimum for the heat pump
- **MQTT Communication**: Publish sensor data, valve status, manifold demand; subscribe to setpoints / overrides
- **OTA Update**: Receive and install firmware updates via MQTT/HTTP
- **Watchdog & Reliability**: Watchdog timer, automatic reboot on failure

## Medium Priority
- **Web Dashboard**: Host a local web page showing status of all zones, setpoints, and temperatures
- **Configuration Storage**: Store local configuration (min flow, PID parameters, override)

## Low Priority
- **Logging**: Local logging of errors / valve actions (limited due to flash memory)