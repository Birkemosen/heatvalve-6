# HeatValve-6 Project – Summary Prompt (for AI / documentation)

Copy this document into your HeatValve-6 project as the single reference for: (1) heat pump integration, (2) replicating the Asgard standalone dashboard pattern, and (3) upstream alignment. Use it when asking for features, optimization, or implementation guidance.

---

## 1. HeatValve-6 ↔ Heat Pump (Ecodan ESPHome) Integration

### Roles
- **HeatValve-6**: Controls **zone valves** (0–100%) per UFH zone. Does **not** control the heat pump.
- **Heat pump (Ecodan ESPHome)**: Supplies **flow temperature** and on/off. Should respond to **demand** and, when available, to a **flow temperature request** from the UFH system.

### Flow temperature request (UFH → heat pump)
Many UFH controllers send a **flow temperature adjustment** (−2 to +2 °C) from **average valve position**:

| Average valve position | Request (example) |
|------------------------|-------------------|
| < 30%                  | −2 °C             |
| 30–50%                 | −1 °C             |
| **50–80%**             | **0 °C** (optimal)|
| 80–90%                 | +1 °C             |
| > 90%                  | +2 °C             |

- **Upstream ecodan-esphome** (gekkekoe/esphome-ecodan-hp): Has **temperature_feedback_z1/z2** and **setpoint_bias** (−2.5 to +2.5 °C). No dedicated “flow temp request” number; map flow request to setpoint_bias if needed.
- **Fork with UFH support**: Adds **flow_temperature_request** (−2 to +2 °C) number; auto-adaptive adds it to the calculated flow then clamps. REST: `POST http://<esp_ip>/number/flow_temperature_request/set?value=<adjustment>`.

### Room temperature feedback (zones → heat pump)
Heat pump has at most **two** inputs: Zone 1 and Zone 2. HeatValve-6 (or HA) should provide:
- **temperature_feedback_z1** (and z2 if two zones): e.g. aggregate or “effective” room temp from zones.
- Set heat pump “Room Temperature source” to **Home Assistant / REST API** so it uses these values.

### Two HeatValve-6 controllers
Aggregate average valve position (and optionally temps) across **both** controllers in HA, then push **one** flow temp request and per-zone temperature feedback to the heat pump.

### Parameters to align on the heat pump
- Heating system type: **Underfloor Heating**
- Short-Cycle: Minimum On-Time **≥ 5 min**, Lockout **≥ 5 min** (e.g. 15–30 min)
- Min/max flow temp: per floor and heat pump (e.g. 25–38 °C for UFH)

---

## 2. Asgard Standalone Dashboard – How It Works (for HeatValve-6)

Use this pattern to implement a “set and forget” local web UI on the HeatValve-6 board (no Home Assistant required).

### Architecture
- **ESP** runs an HTTP server (ESPHome `web_server` / `web_server_base`).
- A **dashboard component** registers as an `AsyncWebHandler` and serves:
  1. **GET `/dashboard`** (or `/dashboard/`): Single HTML page (can be gzipped and embedded in firmware).
  2. **GET `/dashboard/state`**: JSON object with all current state (sensors, numbers, switches, selects, climates).
  3. **POST `/dashboard/set`**: Body or query with `key` and `value` (and optionally `value` as float/index for numbers/selects). Handler updates the corresponding ESPHome entity (number, switch, select, climate) and returns.

### Data flow
- **Read**: Browser (or app) periodically fetches `GET /dashboard/state` → JSON with all displayed values.
- **Write**: User changes a control → frontend sends `POST /dashboard/set` with e.g. `key=maximum_heating_flow_temp&value=35`. Server looks up the entity by key, builds an ESPHome `call` (e.g. `number.set_value`), and executes it. Changes take effect immediately; next `/state` poll reflects them.

### Implementation details (from Asgard)
- **Web server**: ESPHome’s `web_server` component (enabled e.g. for OTA). A **web_server_base** provides the `AsyncWebServer` and a way to `add_handler(component)`.
- **Handler**: Component implements `canHandle(request)`, `handleRequest(request)`. Routes: `url == "/dashboard" || "/dashboard/"` → serve HTML; `"/dashboard/state"` → build JSON from sensor/switch/number/select/climate pointers; `"/dashboard/set"` → parse key/value, push to a small **action queue**, then in `loop()` drain the queue and call `number->set_value()`, `switch->turn_on/off()`, `select->select_option()`, `climate->set_target_temperature()`, etc. (Queue avoids doing I/O or heavy work inside the async request callback.)
- **HTML**: Single-page app (HTML + JS) embedded in firmware (e.g. as a gzip’d constant). The JS polls `/dashboard/state` on an interval (e.g. 2–5 s), renders the values, and on user input POSTs to `/dashboard/set` with the entity key and new value.
- **Standalone history**: Optional. Asgard stores graph data in the **browser** (e.g. last 24 h) and shows logs at the bottom of the page with an export/download button. No server-side storage required.

### What to replicate for HeatValve-6
- **ESPHome** with `web_server` (or `web_server_base`) and a **custom dashboard component** that:
  - Serves `GET /dashboard` → your HTML (zone temps, valve positions, setpoints, flow request, etc.).
  - Serves `GET /dashboard/state` → JSON of all sensors/numbers/switches/selects you want to show.
  - Handles `POST /dashboard/set` with key/value → updates the matching entity (e.g. zone setpoints, flow request, switches). Use an action queue and process in `loop()`.
- **Frontend**: One HTML page (embedded or served) that polls state and sends set commands. Optionally add browser-side history and log export like Asgard.

### References (in esphome-ecodan-hp repo)
- **Component**: `components/asgard_dashboard/` — `asgard_dashboard.cpp` (routes, `handle_state_` JSON build, `handle_set_` + `dispatch_set_` key→entity, action queue in `loop()`), `asgard_dashboard.h`, `__init__.py` (wires sensor/number/switch/select/climate IDs to the component).
- **HTML**: `components/asgard_dashboard/dashboard_source.html` → compiled to `dashboard_html.h` (gzip’d string).
- **Config**: `confs/asgard-dashboard-z1.yaml` (and z2) — list of entity IDs passed to the dashboard.
- **Standalone usage**: `asgard/sa-config.md` — URL `http://device.local/dashboard`, no HA required; history in browser, logs export.

---

## 3. Upstream vs Fork

- **Upstream**: [gekkekoe/esphome-ecodan-hp](https://github.com/gekkekoe/esphome-ecodan-hp). No `flow_temperature_request`; use **temperature_feedback_z1/z2** and **setpoint_bias** for HeatValve-6 integration. No Asgard-specific hardware; relay boards documented in `docs/hardware.md`.
- **Fork**: May add e.g. ESP32 WROOM32 dual-relay configs, **flow_temperature_request** number, HeatValve-6 doc. For “set and forget” long term, consider contributing the flow temp request (and doc) to upstream and running upstream only.

---

## 4. One-Liner for Optimization Prompts

*“HeatValve-6 is a UFH zone valve controller (0–100% per zone) that works with a heat pump (Ecodan ESPHome). The heat pump sets flow temperature; HeatValve-6 can send a flow temperature request (−2 to +2 °C) from average valve position (target 50–80%). HeatValve-6 should expose temperature feedback and flow request via REST or HA. Replicate the Asgard standalone dashboard: GET /dashboard = HTML, GET /dashboard/state = JSON state, POST /dashboard/set = key/value to update entities; use an action queue in loop(); optional browser-side history and log export.”*

---

## 5. Garage Door Use of the Relay Board

**Yes.** An ESP32 WROOM32 **dual-relay** board can control **2 garage doors**: one relay per door. Typical patterns:
- **Momentary**: Relay closes for 1–2 s then opens (same as wall button). One relay per door.
- **Open/close**: Two relays per door (open / close) if the opener expects separate contacts; then you’d need 4 relays for 2 doors. With “single button” openers, 2 relays (one per door) is enough.

Use a separate ESPHome config (or a different device) for the garage so the heat-pump device stays dedicated. Same board type can be reflashed for garage duty if you move the heat pump to Asgard or another board.
