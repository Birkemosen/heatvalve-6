# Helios-3 ↔ HeatValve-6 ↔ Asgard (Ecodan) Integration Spec

**Status:** v2.0 — 2026-04-23
**Owner:** Birkemosen
**Scope:** Defines the wire-level contract between the three modules of the
"Helios-3" home heating stack:

| Module        | Role                                              | Repo                     |
| ------------- | ------------------------------------------------- | ------------------------ |
| `heatvalve-6` | Local 6-zone UFH actuator (firmware on hardware)  | `birkemosen/heatvalve-6` |
| `helios`      | Central Go intelligence service (this repository) | `birkemosen/helios-3`    |
| `asgard`      | Ecodan heat-pump bridge (virtual thermostat)      | `birkemosen/asgard`      |

> **Naming note.** The product family is **Helios-3** because it
> integrates **3** components: HeatValve, Helios (brain), and Asgard/Ecodan.
> The Go module path is `github.com/birkemosen/helios-3`.

---

## 1. Architecture

```
    ┌──────────────┐  HTTP (LAN)  ┌───────────────────┐  HTTP  ┌────────────────┐
    │  HeatValve-6 │─────────────▶│      Helios       │◀──────▶│ Asgard (Ecodan)│
    │  (firmware)  │◀─────────────│   (Go service)    │        │  esphome-hp    │
    └──────────────┘              └───────────────────┘        └────────────────┘
                                          │
                                          │ Open-Meteo, ENTSO-E
```

**No message broker required.** All communication uses plain HTTP/JSON over LAN.

- **HeatValve-6** POSTs a state snapshot to Helios every ≤ 30 s, and polls
  Helios for pending commands at the same cadence.
- **Helios** is the only authoritative optimizer. It stores the latest
  snapshot in memory, runs the solver hourly, and writes the resulting
  command batch back to an in-memory store for HV6 to collect.
- **Asgard** polls Helios's `/solver/plan` for the aggregate heat demand and
  flow-temperature target, then forwards them to Ecodan.

### Failure modes

| Failure | Behaviour |
|---|---|
| Helios offline | HV6 runs local PID. After `helios_stale_after_s` (default 600 s) it clears all active offsets and reverts to user setpoints. |
| HV6 offline / stops POSTing | Helios marks controller stale, suspends solver output for that controller, notifies dashboard. |
| Asgard offline | Helios continues optimizing zones; Ecodan falls back to its internal weather-compensation curve. |

---

## 2. Transport

| Channel            | Protocol   | Direction        | Notes |
| ------------------ | ---------- | ---------------- | ----- |
| HeatValve-6 → Helios | HTTP POST | HV6 pushes snapshot | `POST /api/hv6/{controller_id}/snapshot` |
| Helios → HeatValve-6 | HTTP GET  | HV6 polls commands | `GET /api/hv6/{controller_id}/commands`  |
| Asgard → Helios    | HTTP GET   | Asgard polls plan  | `GET /solver/plan` etc.                  |

All payloads are **UTF-8 JSON**. All timestamps are **Unix epoch seconds (UTC)**.
All temperatures are **°C**.

### Identifiers

- `controller_id`: stable string, lowercase `[a-z0-9_-]{3,32}`
  (e.g. `hv6-livingroom`). Set in HeatValve-6 firmware config; never
  auto-generated at runtime.
- `zone_number`: integer `1..6` (JSON object key, encoded as string in maps).

---

## 3. HV6 → Helios: Snapshot

**`POST /api/hv6/{controller_id}/snapshot`**

- Called by HV6 every ≤ 30 s and on any significant state change.
- `controller_id` in the URL path is canonical; any `controller_id` field in
  the body is ignored (prevents spoofing).
- Response: `204 No Content` on success.

### `Snapshot` payload

```json
{
  "controller_id": "hv6-main",        // informational only; path param wins
  "firmware_ver":  "1.2.0",           // optional
  "ts":            1772140800,         // epoch s UTC
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
  "zone_configs": {                    // send on boot and on config change
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

**Zone `state` values:** `0=idle  1=heating  2=satisfied  3=fault`

`zone_configs` is omitted after boot once Helios has acknowledged the config.
HV6 MUST resend it whenever zone configuration changes.

---

## 4. Helios → HV6: Commands

**`GET /api/hv6/{controller_id}/commands`**

- Called by HV6 at the same cadence as the snapshot POST (≤ 30 s).
- Always returns `200 OK` with a `Commands` object; Helios never returns 404
  for an unknown controller (returns safe defaults instead).

### `Commands` payload

```json
{
  "helios_status":   "active",         // "active" | "degraded"
  "heating_profile": "heat_pump",      // hint for local PID profile
  "zones": {
    "1": {
      "setpoint_offset":  -0.5,        // °C; clamped by HV6 to [min, max]
      "reason":           "price_peak",// diagnostic string
      "valid_until":      1772144400,  // epoch s; 0 = until next poll
      "preheat_start":    0,           // epoch s; 0 = no preheat
      "preheat_end":      0,
      "preheat_target_c": 0.0
    }
  }
}
```

**HV6 receiver rules:**

- MUST clamp `setpoint_offset` to its per-zone `[min_offset_c, max_offset_c]`
  config — safety boundary enforced in firmware regardless of Helios trust state.
- Effective setpoint = `clamp(user_setpoint + setpoint_offset, abs_min, abs_max)`.
- During an active preheat window (`now ∈ [preheat_start, preheat_end]`):
  effective setpoint = `max(effective, preheat_target_c)`.
- If `valid_until > 0` and `now > valid_until`, the offset expires immediately.
- `setpoint_offset == 0` clears the offset.
- If Helios has not been reachable for `helios_stale_after_s` seconds, HV6
  MUST clear all offsets/preheats and revert to user setpoints.
- HV6 SHOULD display `helios_status` in its UI (badge: Active / Degraded / Offline).

---

## 5. HTTP API (Helios — full endpoint list)

All endpoints are served by the Helios dashboard HTTP server.
Authentication: optional `X-Helios-Token` shared secret header for
machine-to-machine access (Asgard).

### HV6 integration

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/hv6/{controller_id}/snapshot` | Ingest HV6 state snapshot |
| GET  | `/api/hv6/{controller_id}/commands` | Return pending commands for HV6 |

### Dashboard / Asgard

| Method | Path | Description |
|--------|------|-------------|
| GET  | `/api/zones`              | All controller states (snapshot view) |
| GET  | `/api/status`             | Service status JSON |
| GET  | `/api/weather`            | Current weather forecast |
| GET  | `/api/history/zones`      | Zone history (query: `hours`, `controller`) |
| GET  | `/api/history/weather`    | Weather history (query: `hours`) |
| GET  | `/api/events`             | SSE stream (live updates) |
| GET  | `/solver/plan`            | Latest optimization plan |
| POST | `/solver/run`             | Force immediate re-solve |
| GET  | `/solver/physics`         | Per-zone derived UA/C/τ |
| GET  | `/api/config`             | Read optimizer/house/energy config |
| PUT  | `/api/config/schedule`    | Update 24h comfort schedule |
| PUT  | `/api/config/optimizer`   | Update optimizer tuning |

### Solver plan envelope

```json
{
  "generated_at":  1772140800,
  "horizon_h":     24,
  "degraded_mode": false,
  "controllers": {
    "hv6-main": {
      "zones": {
        "1": {
          "setpoint_offset_c": -0.5,
          "preheat":           false,
          "expected_temp_c":   21.0
        }
      }
    }
  },
  "system": {
    "heat_demand_kw":  4.2,
    "flow_target_c":   38.0
  }
}
```

---

## 6. Discovery & Lifecycle

1. **Boot.** HV6 sends its first snapshot (including `zone_configs`). Helios
   auto-creates a `ControllerState` entry and derives per-zone physics.
2. **Steady state.** HV6 POSTs snapshot every ≤ 30 s; polls commands at the
   same cadence.
3. **Config change.** HV6 includes `zone_configs` in the next snapshot. Helios
   re-derives physics on any change.
4. **Helios restart.** In-memory state is rebuilt from the first incoming
   snapshots. No persistent pairing needed.
5. **HV6 offline.** Helios detects staleness when `LastSeen` exceeds
   `stale_threshold` (currently 90 s). Dashboard shows controller as stale.

---

## 7. Versioning & Compatibility

- This spec is versioned in `docs/integration_spec.md`.
- Breaking schema changes increment `protocol_version` (int field in
  `Snapshot` and `Commands`). Both sides MUST ignore unknown fields.
- Helios logs a warning on unknown `protocol_version` but MUST NOT refuse
  to operate.

---

## 8. Security

- HTTP endpoints bind to LAN interface by default; expose behind a
  reverse proxy (TLS + auth) if remote access is needed.
- `setpoint_offset` clamping is enforced in HV6 firmware as a hard safety
  boundary — independent of Helios trust state.
- `controller_id` is taken from the URL path, not the request body, to
  prevent controller ID spoofing.
- Sensitive config fields (passwords, license keys) are never returned by
  `GET /api/config`.

---

## 9. Open questions

- **Per-zone schedule push-down:** should the full weekly schedule be
  pushable from Helios for centralized editing? *Defer to v3.*
- **Multi-tenant:** a single Helios controlling multiple physical sites is
  out of scope; `controller_id` is flat per Helios instance.
