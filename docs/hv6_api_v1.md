# HV6 API v1 Contract

This document defines the dedicated dashboard API contract for HeatValve-6.

## Scope

- Dedicated namespace: `/api/hv6/v1`
- Dashboard transport: HTTP JSON + SSE
- Home Assistant integration remains on ESPHome API/entities/services
- Dashboard no longer depends on ESPHome entity-name REST routes
- Dashboard source is modularized under `web/dashboard-src/` and bundled into `web/dashboard.js`

## Current Implementation Status

- Implemented now:
  - `GET /api/hv6/v1/overview`
  - `GET /api/hv6/v1/zones`
  - `POST /api/hv6/v1/zones/{zone}/setpoint?setpoint_c=<float>`
  - `POST /api/hv6/v1/zones/{zone}/enabled?enabled=true|false`
  - `POST /api/hv6/v1/commands?command=<name>[&zone=1..6]`
  - `POST /api/hv6/v1/drivers/enabled?enabled=true|false`
  - `POST /api/hv6/v1/motor/auto_learn?enabled=true|false`
  - `POST /api/hv6/v1/motors/{zone}/target?value=<0..100>`
  - `POST /api/hv6/v1/motors/{zone}/open`
  - `POST /api/hv6/v1/motors/{zone}/open_timed?duration_ms=<1..60000>`
  - `POST /api/hv6/v1/motors/{zone}/close`
  - `POST /api/hv6/v1/motors/{zone}/close_timed?duration_ms=<1..60000>`
  - `POST /api/hv6/v1/motors/{zone}/stop`
  - `POST /api/hv6/v1/settings/select?key=<name>&value=<value>&zone=<1..6>`
  - `POST /api/hv6/v1/settings/number?key=<name>&value=<value>&zone=<1..6>`
  - `POST /api/hv6/v1/settings/text?key=<name>&value=<value>&zone=<1..6>`
  - `POST /api/hv6/v1/manual_mode?enabled=true|false`
- Current server port: `8081` (configured in `hv6_web_api.port`)
- Next endpoint implementation target:
  - `GET /api/hv6/v1/events` (SSE)

Note: write endpoints currently accept query parameters to avoid browser preflight friction during cross-port migration. JSON body support can be added once same-port serving is finalized.

Implemented command names:

- `calibrate_all_motors`
- `i2c_scan`
- `motor_reset_fault` (requires `zone`)
- `motor_reset_and_relearn` (requires `zone`)
- `motor_reset_learned_factors` (requires `zone`)

## Response Envelope

All JSON responses use this structure:

```json
{
  "ok": true,
  "version": "v1",
  "ts_ms": 1713111111000,
  "data": {}
}
```

Error responses:

```json
{
  "ok": false,
  "version": "v1",
  "ts_ms": 1713111111000,
  "error": {
    "code": "invalid_zone",
    "message": "Zone must be in range 1..6"
  }
}
```

## Read Endpoints

### `GET /api/hv6/v1/overview`

Returns controller-level snapshot:

```json
{
  "ok": true,
  "version": "v1",
  "ts_ms": 1713111111000,
  "data": {
    "controller_state": "running",
    "system_condition_state": "normal",
    "active_zones": 2,
    "avg_valve_pct": 31.5,
    "manifold": {
      "flow_c": 33.8,
      "return_c": 30.6
    },
    "motor": {
      "drivers_enabled": true,
      "fault": false,
      "current_ma": 21.4
    },
    "connectivity": {
      "ip": "192.168.1.50",
      "ssid": "MyWiFi",
      "mac": "AA:BB:CC:DD:EE:FF",
      "uptime_s": 123456
    },
    "firmware": {
      "version": "1.4.12"
    }
  }
}
```

### `GET /api/hv6/v1/zones`

Returns all zones:

```json
{
  "ok": true,
  "version": "v1",
  "ts_ms": 1713111111000,
  "data": {
    "count": 6,
    "zones": [
      {
        "zone": 1,
        "name": "Zone 1",
        "enabled": true,
        "state": "heating",
        "temperature_c": 21.3,
        "setpoint_c": 22.0,
        "valve_pct": 47.0,
        "probe_temp_c": 21.2,
        "temp_source": "local_probe"
      }
    ]
  }
}
```

### `GET /api/hv6/v1/zones/{zone}`

Returns one zone with settings/diagnostics fields required by dashboard details panel.

### `GET /api/hv6/v1/diagnostics`

Returns diagnostics summary and latest fault/calibration state.

### `GET /api/hv6/v1/settings`

Returns dashboard-editable settings currently backed by config store and controllers.

## Write Endpoints

### `POST /api/hv6/v1/zones/{zone}/setpoint`

Request:

```json
{
  "setpoint_c": 22.5
}
```

### `POST /api/hv6/v1/zones/{zone}/enabled`

Request:

```json
{
  "enabled": true
}
```

### `POST /api/hv6/v1/commands`

Generic command endpoint for button-style actions.

Request:

```json
{
  "command": "motor_reset_fault",
  "zone": 3
}
```

Minimum command set:

- `motor_reset_fault`
- `motor_reset_and_relearn`
- `motor_reset_learned_factors`
- `calibrate_all_motors`
- `i2c_scan`

### `POST /api/hv6/v1/settings`

Applies validated partial settings payload.

## SSE Endpoint

### `GET /api/hv6/v1/events`

Event types:

- `state`
- `diagnostics`
- `command_ack`
- `log`

Event payload envelope:

```json
{
  "type": "state",
  "ts_ms": 1713111111000,
  "data": {}
}
```

`command_ack` example:

```json
{
  "type": "command_ack",
  "ts_ms": 1713111111000,
  "data": {
    "request_id": "c6dc7f1d",
    "command": "motor_reset_fault",
    "ok": true,
    "message": "Zone 3 fault reset requested"
  }
}
```

## HTTP Status Codes

- `200` success
- `400` validation error
- `404` unknown route/resource
- `409` command rejected due to busy/unsafe state
- `500` internal error

## Migration Constraints

- Dashboard runtime must not call `/climate`, `/switch`, `/number`, `/select`, `/text`, `/button`.
- HA services and entities remain intact for automations and integrations.
- The API component currently exists as a scaffold and will implement endpoints incrementally in this order:
  1. `GET overview`
  2. `GET zones`
  3. `POST setpoint` and `POST enabled`
  4. `POST commands`
  5. `GET events` SSE
