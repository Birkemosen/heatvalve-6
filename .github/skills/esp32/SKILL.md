---
name: esp32-s3-ufh-pcb
description: functional skills for each UFH PCB based on ESP32-S3
---

# ESP32-S3 PCB Skills

## Purpose
This file describes the functional skills for each UFH PCB based on the ESP32-S3.

## Runtime Architecture Pattern (Required)

Use this pattern for all networked or potentially slow integrations so ESPHome stays responsive:

1. Keep `loop()` short and non-blocking.
2. Run HTTP/MQTT bridge work in a dedicated FreeRTOS worker task.
3. Trigger work from `loop()` using a semaphore or queue.
4. In the worker, block on `xSemaphoreTake(..., portMAX_DELAY)` instead of busy polling.
5. Gate expensive work behind readiness checks (WiFi connected, MQTT stable, endpoint resolved).
6. Apply exponential backoff + jitter after failures.
7. Use cooldown windows so repeated failures cannot starve other subsystems.
8. Use low worker priority unless strict real-time requirements demand otherwise.
9. Avoid long critical sections; lock only around shared resources.
10. Keep watchdog safety by yielding in long worker code paths.

### Why
- Prevents blocking the ESPHome main scheduler.
- Reduces contention with MQTT and API tasks.
- Avoids retry storms that can look like system instability.

### Anti-Patterns (Do Not Use)
- Network calls directly inside `loop()`.
- Infinite polling loops with short `vTaskDelay` intervals.
- Repeated task creation attempts on every `loop()` tick.
- High-priority worker tasks for best-effort telemetry.
- Global mutex hold across full HTTP transactions when not required.

## FreeRTOS Task Rules

- Create long-lived tasks once; do not churn tasks.
- Use clear ownership for task handle, trigger primitive, and lifecycle flags.
- Prefer pinned-core tasks only when justified by measured contention.
- Make all retries time-based and monotonic-clock driven.
- Separate "trigger time" from "not-before time" to combine interval + cooldown behavior.
- Log state transitions (started, gated, backed off, recovered), not every loop iteration.

## ESPHome Interaction Rules

- `setup()`: initialize semaphores/queues and create worker task only if feature is enabled/configured.
- `loop()`: schedule triggers, refresh cached config, and perform stale-state cleanup only.
- Worker task: execute one cycle per trigger and return to blocked wait state.
- Runtime enable/disable should not require reboot; handle task start retry with throttling.
- Treat optional integrations as inert by default when unconfigured.

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