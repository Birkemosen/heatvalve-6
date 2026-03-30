# Ecodan Heat Pump Integration (Asgard Virtual Thermostat)

Integration between HeatValve-6 floor heating controllers and the Mitsubishi Ecodan heat pump via [esphome-ecodan-hp](https://github.com/gekkekoe/esphome-ecodan-hp)'s Asgard virtual thermostat.

## Architecture

```
┌─────────────────────┐  MQTT   ┌──────────────────────┐  HTTP REST  ┌──────────────┐
│  HeatValve-6 Board  │────────>│  Coordinator Board   │────────────>│  Asgard PCB  │
│  (6 zones each)     │  zone   │  (aggregates demand) │  derived    │  (Ecodan HP) │
│                     │  data   │                      │  temp       │              │
└─────────────────────┘         └──────────────────────┘             └──────────────┘
                                   ▲  also a HeatValve-6
                                   │  board with 6 zones
                                   │
                        ┌──────────┘
                        │ local zone data
```

Multiple HeatValve-6 boards feed zone data (temperature, setpoint, state, valve position, area) via MQTT. One board acts as **coordinator** (runtime-switchable) and:

1. Aggregates demand from all boards into a single "derived temperature"
2. Pushes that derived temperature to the Asgard virtual thermostat via HTTP REST
3. Publishes system-wide derived temp via MQTT for Home Assistant fallback

## Derived Temperature Algorithm

The core idea: produce a synthetic room temperature that falls below the Asgard's setpoint when heating is demanded, causing the heat pump relay to activate.

```
For each zone across ALL boards:
  if DEMAND (state=2):   delta = setpoint - current_temp  (positive)
  if SATISFIED (state=1): delta = 0
  if OVERHEATED (state=0): delta = -(current_temp - setpoint)  (negative)

demand_delta = Σ(delta × area) / Σ(area)
derived_temp = reference_setpoint - demand_delta
derived_temp = clamp(derived_temp, 10.0, 30.0)
```

- When zones demand heat → `derived_temp` drops below `reference_setpoint` → Asgard relay ON → heat pump fires
- When zones are satisfied → `derived_temp` ≈ `reference_setpoint` → Asgard relay OFF → heat pump idles

## Setup

### 1. Asgard Virtual Thermostat Configuration

On the Asgard PCB, ensure the virtual thermostat is enabled and configured:
- **Virtual Thermostat Setpoint** (zone 1): Set to match the `Asgard Reference Setpoint` on the HeatValve-6 coordinator (default: 21°C)
- **Mode**: The Asgard controls relay IN1 (zone 1) based on whether the virtual thermostat input is above or below its setpoint

### 2. HeatValve-6 Configuration

#### Enable MQTT (all boards)

Each board needs MQTT enabled. In your deployment file (e.g., `deploy/local-mqtt.yaml`), ensure `mqtt_ecodan.yaml` is included in the packages:

```yaml
packages:
  ecodan: !include ../optional/mqtt_ecodan.yaml
```

The `mqtt_ecodan.yaml` package publishes per-zone data every 30s and computes a local board derived temperature.

#### Enable the Asgard Bridge (coordinator board)

Add the bridge package to the coordinator board's deployment:

```yaml
packages:
  ecodan_bridge: !include ../optional/ecodan_asgard_bridge.yaml
```

#### Set the Coordinator (runtime)

In the web dashboard or Home Assistant, toggle **Ecodan Coordinator** ON for exactly one board. Only the coordinator pushes to Asgard.

#### Configure Asgard Host

Set the **Asgard Host** text entity to your Asgard's hostname or IP (e.g., `ecodan-heatpump.local` or `192.168.1.100`).

#### Set Reference Setpoint

Set **Asgard Reference Setpoint** to match the Asgard virtual thermostat's target temperature (default: 21°C). This value must match on both sides.

### 3. Zone Climate IDs

The `mqtt_ecodan.yaml` package requires zone climate entity ID substitutions. These are defined in `heatvalve-6.yaml`:

```yaml
substitutions:
  zone_1_climate_id: "wc_thermostat"
  zone_2_climate_id: "storage_thermostat"
  # ... etc, matching your zone 'id' parameter + _thermostat
```

## MQTT Topic Reference

### Per-Board Publishing (every 30s)

| Topic | Payload | Description |
|---|---|---|
| `floor_heating/controller_{id}/zone/{N}/temperature` | float | Zone current temp (°C) |
| `floor_heating/controller_{id}/zone/{N}/setpoint` | float | Zone target temp (°C) |
| `floor_heating/controller_{id}/zone/{N}/state` | int | 0=overheated, 1=satisfied, 2=demand |
| `floor_heating/controller_{id}/zone/{N}/valve_position` | float | Valve opening (0-100%) |
| `floor_heating/controller_{id}/zone/{N}/area` | float | Zone area (m²) |
| `floor_heating/controller_{id}/derived_temp` | float | Board's local derived temp (°C) |
| `floor_heating/controller_{id}/total_area` | float | Sum of active zone areas (m²) |

### Coordinator Publishing (every 60s)

| Topic | Payload | Description |
|---|---|---|
| `floor_heating/system/derived_temp` | float | System-wide derived temp (°C) |

### Existing Topics (unchanged)

| Topic | Description |
|---|---|
| `floor_heating/controller_{id}/online` | Board availability (LWT) |
| `floor_heating/controller_{id}/heating_demand` | Any zone in demand (true/false) |
| `floor_heating/controller_{id}/avg_valve_position` | Average valve position (%) |

## Multi-Board Setup

1. **All boards**: Include `mqtt_ecodan.yaml` and `ecodan_asgard_bridge.yaml` in packages. Set unique `controller_id` substitution ("1", "2", etc.)
2. **One board**: Toggle "Ecodan Coordinator" ON in the dashboard
3. The coordinator subscribes to `floor_heating/controller_+/derived_temp` and `total_area` via MQTT wildcards
4. Remote board data older than 5 minutes is considered stale and excluded

## Home Assistant Fallback

The coordinator also publishes `floor_heating/system/derived_temp` via MQTT. You can create a Home Assistant automation to bridge this to Asgard as an alternative to direct HTTP REST:

```yaml
automation:
  - alias: "Sync derived temp to Asgard"
    trigger:
      - platform: mqtt
        topic: "floor_heating/system/derived_temp"
    action:
      - service: rest_command.set_asgard_vt
        data:
          temperature: "{{ trigger.payload }}"

rest_command:
  set_asgard_vt:
    url: "http://ecodan-heatpump.local/number/Virtual%20Thermostat%20Input%20z1/set?value={{ temperature }}"
    method: POST
```

## Troubleshooting

- **Verify MQTT**: `mosquitto_sub -h broker.local -t 'floor_heating/#' -v`
- **Check derived temp**: Watch `floor_heating/controller_1/derived_temp` — should track near `reference_setpoint` when zones are satisfied
- **Test demand**: Lower a zone setpoint below current room temp (creates "overheated" state → derived temp rises). Raise it above (creates "demand" → derived temp drops)
- **Verify Asgard push**: `curl -s "http://ecodan-heatpump.local/number/Virtual%20Thermostat%20Input%20z1"` to read current value
- **Push failures**: Monitor "Asgard Push Failures" sensor in the dashboard — resets to 0 on success

## Files

| File | Purpose |
|---|---|
| `core/settings.yaml` | Ecodan Coordinator switch, Asgard Reference Setpoint, Asgard Host |
| `optional/mqtt_ecodan.yaml` | Per-zone MQTT publishing + local derived temp calculation |
| `optional/ecodan_asgard_bridge.yaml` | Multi-board aggregation + HTTP REST push to Asgard |
| `deploy/local-mqtt.yaml` | Deployment entrypoint with bridge included |
