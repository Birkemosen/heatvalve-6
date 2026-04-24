# HeatValve-6 Firmware — Helios-3 HTTP Integration Implementation Prompt

**Audience:** firmware developer of heatvalve-6  
**Spec reference:** `docs/integration_spec.md`

---

## Context

HeatValve-6 is a 6-zone UFH actuator controller running embedded firmware.
It already has an internal `StateSnapshot` struct that captures the full
system and zone state at each control cycle.

Helios-3 is a Go service running on a local server/Raspberry Pi. It runs a
24-hour optimizer that produces setpoint offsets and preheat windows for
each zone. No MQTT broker is required — integration is plain HTTP/JSON.

---

## Integration Pattern: Push + Poll

HeatValve-6 MUST implement two periodic HTTP operations:

```
Every ≤ 30 s:
  1. POST /api/hv6/{controller_id}/snapshot   → push current state to Helios
  2. GET  /api/hv6/{controller_id}/commands   → fetch pending commands from Helios
```

Both operations should use the same timer (or two back-to-back calls on the
same cycle). If Helios is unreachable, HV6 continues operating locally using
the last known commands until `helios_stale_after_s` (default 600 s).

---

## Deliverable 1 — HTTP Snapshot Publisher

Map the existing `StateSnapshot` to the following JSON body and POST it:

### `POST /api/hv6/{controller_id}/snapshot`

```json
{
  "firmware_ver":  "1.2.0",
  "ts":            1772140800,
  "system": {
    "input_temp":   36.2,
    "output_temp":  31.8,
    "avg_valve":    0.41,
    "active_zones": 3,
    "zone_count":   6
  },
  "zones": {
    "1": {
      "temperature": 21.4,
      "setpoint":    21.0,
      "valve":       0.62,
      "state":       2,
      "hyd_factor":  1.05
    }
  },
  "zone_configs": {
    "1": {
      "area_m2":        18.5,
      "pipe_type":      "PEX-AL-PEX-16",
      "pipe_length_m":  85.0,
      "floor_type":     "tile",
      "exterior_walls": 2,
      "friendly_name":  "Living Room"
    }
  }
}
```

- `zone_configs` MUST be sent on first boot and on any config change.
  After first successful POST it MAY be omitted from subsequent payloads
  until a config change occurs.
- Zone keys are string representations of integers `"1"`.."6"`.
- Zone `state`: `0=idle  1=heating  2=satisfied  3=fault`
- `controller_id` in the path is authoritative; do not rely on any ID field
  in the response body.

Expected response: **`204 No Content`**

---

## Deliverable 2 — HTTP Command Poller

### `GET /api/hv6/{controller_id}/commands`

Expected response `200 OK`:

```json
{
  "helios_status":   "active",
  "heating_profile": "heat_pump",
  "zones": {
    "1": {
      "setpoint_offset":  -0.5,
      "reason":           "price_peak",
      "valid_until":      1772144400,
      "preheat_start":    0,
      "preheat_end":      0,
      "preheat_target_c": 0.0
    }
  }
}
```

### Command application rules (MUST implement)

1. **Offset clamping** — `setpoint_offset` MUST be clamped to the zone's
   configured `[min_offset_c, max_offset_c]` before being applied.
   This is a firmware-side hard safety boundary.

2. **Effective setpoint** — `effective = clamp(user_setpoint + setpoint_offset, abs_min, abs_max)`

3. **Preheat** — During `[preheat_start, preheat_end]` (epoch seconds),
   `effective = max(effective, preheat_target_c)`.

4. **Expiry** — If `valid_until > 0` and `now > valid_until`, discard the
   offset immediately. `valid_until == 0` means offset is valid until the
   next poll replaces it.

5. **Staleness** — If the Helios host has been unreachable for
   `helios_stale_after_s` seconds (default 600), CLEAR all active
   offsets/preheats and revert to plain user setpoints.

6. **Status display** — Reflect `helios_status` in any UI:
   `"active"` → green, `"degraded"` → amber, Helios unreachable → grey.

---

## Deliverable 3 — Firmware Configuration

Add a `[helios]` section to the firmware config (NVS / JSON file / EEPROM):

```
helios_host            = "192.168.1.10"     # Helios server IP/hostname
helios_port            = 8080               # dashboard / API port
controller_id          = "hv6-main"         # stable unique ID
poll_interval_s        = 30                 # snapshot + command cadence
helios_stale_after_s   = 600               # offline fallback timeout
```

`controller_id` MUST be set at provisioning time and MUST NOT change after
first boot. Changing it effectively registers a new controller in Helios.

---

## Implementation Notes

- Use HTTP/1.1 keep-alive if the HTTP client supports it — both POST and GET
  go to the same host:port.
- Timeout each HTTP call at ≤ 10 s; failure is silently absorbed; staleness
  counter continues.
- JSON parsing: unknown fields MUST be ignored (forward-compat).
- The full `Snapshot` struct in `internal/hv6/store.go` in the Helios repo
  is the authoritative Go-side definition — it maps 1:1 to the JSON above.

---

## Out of Scope

- TLS (handled at network layer; add if Helios is exposed beyond LAN).
- Authentication (`X-Helios-Token` header supported by Helios but optional
  for LAN-only deployments).
- MQTT (not used by this integration; no broker required).
