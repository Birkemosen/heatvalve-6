# ESP32-S3 UFH PCB Solution

## Overview
Each UFH (underfloor heating) PCB uses an ESP32-S3 to control 6 VDMOT valves and read DS18B20 temperature sensors. The PCB handles local regulation, basic PID/manifold balancing, and communication with a central service via MQTT. The system is designed for autonomous operation in case the network or central service fails.

---

## Functional Components

### Zone Control
- Controls 6 motorized valves (VDMOT) per PCB using PWM or GPIO.
- Applies local PID or heuristic control to reach setpoints.

### Sensor Integration
- Reads DS18B20 temperature sensors on each return zone.
- Monitors manifold temperature and calculates overall heat demand.

### Failsafe Mechanisms
- Ensures a minimum total valve opening to protect the heat pump.
- Watchdog timer for automatic recovery on errors.
- Fallback setpoints if MQTT or Zigbee data is unavailable.

### Communication
- Publishes sensor readings, valve positions, and manifold demand via MQTT.
- Subscribes to setpoints, override commands, and minimum flow thresholds.

### Local Web Dashboard
- Hosts a lightweight web interface for local status monitoring.
- Displays temperature readings, valve positions, and setpoints.

### OTA Firmware Updates
- Supports over-the-air updates via MQTT or HTTP.
- Dual-partition firmware for safe rollback in case of failure.

### Configuration Storage
- Stores local settings (PID parameters, min flow, overrides) in persistent memory.

---

## Recommended Implementation
- **Firmware Framework:** ESP-IDF or ESPHome (ESPHome suitable if BLE is removed).
- **Real-time Scheduling:** Use FreeRTOS tasks for control, sensors, MQTT, web server, and OTA.
- **MQTT Topics:**
  - Publish: `ufh/{pcb_id}/zone/{zone_id}/temp`, `ufh/{pcb_id}/zone/{zone_id}/valve`, `ufh/{pcb_id}/manifold_demand`
  - Subscribe: `ufh/{pcb_id}/set/zone/{zone_id}/setpoint`, `ufh/{pcb_id}/set/override`, `ufh/{pcb_id}/set/min_flow`

---

## Key Design Principles
1. **Autonomy First:** PCB continues to operate safely even if the network or Go-service fails.
2. **Failsafe:** Protect the heat pump with minimum flow thresholds.
3. **Simplicity:** Local PID/manifold control should be simple enough to be reliable.
4. **OTA Safety:** Ensure rollback mechanism is in place for firmware updates.