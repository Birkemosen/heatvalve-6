# Ecodan Heat Pump Integration (Asgard Virtual Thermostat)

Integration between HeatValve-6 floor heating controllers and the Mitsubishi Ecodan heat
pump via [esphome-ecodan-hp](https://github.com/gekkekoe/esphome-ecodan-hp)'s Asgard
virtual thermostat.

> **Status:** Implemented (`components/hv6_asgard_bridge/`, configured via the
> dashboard's Asgard card). An earlier MQTT-based multi-board bridge existed but was
> removed together with MQTT support; all communication is plain HTTP over LAN.

## Architecture

Two HeatValve-6 boards (one per manifold/floor, 6 zones each = 12 zones). Both boards run
identical firmware; the **coordinator (master)** role is a runtime toggle persisted in NVS.

```
┌─────────────────────┐   GET /api/hv6/v1/peer    ┌─────────────────────┐
│  HeatValve-6 slave  │◀──────────────────────────│ HeatValve-6 master  │
│  (manifold B)       │                           │ (manifold A,        │
└─────────────────────┘                           │  coordinator)       │
                                                  └──────────┬──────────┘
                                                             │ HTTP REST push
                                                             │ (weighted house temp)
                                                             ▼
                                                  ┌─────────────────────┐
                                                  │     Asgard PCB      │
                                                  │ virtual thermostat  │
                                                  │  z1 → relay1 → IN1  │
                                                  └──────────┬──────────┘
                                                             ▼
                                                       Ecodan (FTC)
```

1. The master polls the slave's compact `/api/hv6/v1/peer` snapshot every push cycle and
   extracts zone temperatures + areas. Slave data older than `peer_stale_after_s`
   (default 5 minutes) is excluded; if the slave is unreachable, the master weights only
   its own zones and shows peer status "stale"/"unreachable" in the dashboard.
2. The master computes the **house-weighted average of real zone temperatures** across
   all 12 zones: `Σ(temp × area) / Σ(area)` (enabled zones with a valid temperature).
3. The master pushes that value to Asgard's virtual thermostat z1 input via REST.
4. In parallel the board computes the **recommended fixed setpoint**: the area-weighted
   average of each enabled zone's *configured* base setpoint
   (`Σ(setpoint × area) / Σ(area)`, transient forecast/command-path offsets excluded). This is
   the value the operator enters once as Asgard's virtual-thermostat setpoint, so the
   pump calls for heat exactly when the weighted house temperature drops below the
   weighted house target. It is a **static** recommendation: computed purely from zone
   settings, so it is shown on the dashboard Asgard card **regardless of whether the
   bridge is enabled** and **regardless of current zone temperatures** (it appears even
   before any probe has reported). It is never pushed automatically — the Asgard setpoint
   is a fixed user-entered value. Peer-board zones are folded in only while the
   coordinator is actively polling a fresh peer snapshot; otherwise the value reflects the
   local board's zones.

## Why a real weighted temperature (not a synthetic demand signal)

The earlier design pushed a synthetic "derived temperature" (`reference_setpoint −
demand_delta`) to force the relay on/off. With an MPC optimizer (Odin) attached to
Asgard, the z1 input is also the signal the optimizer uses to learn house physics
(thermal mass, heat-loss rate, solar gain). A synthetic signal corrupts that learning,
so the z1 feed must be a physical temperature. Heat demand is expressed through the
optimizer's comfort band instead.

## Asgard Configuration

- Wire relay 1 → IN1 on the FTC (single-zone operation).
- Enable the virtual thermostat for zone 1.
- The z1 input is writable via REST, e.g.:
  `POST http://<asgard>/number/virtual_thermostat_input_z1/set?value=21.0`
  (verify the exact entity name against the installed Asgard firmware).

## HeatValve-6 Configuration (`hv6_asgard_bridge`)

`AsgardConfig` in NVS (pattern follows `HeliosConfig`), editable at runtime from the
dashboard's Asgard card:

| Field | Purpose |
|---|---|
| `enabled` | Master on/off switch for the bridge |
| `coordinator` | This board pushes to Asgard (exactly one board) |
| `host` / `port` | Asgard address |
| `entity_name` | Asgard z1 number entity to write |
| `push_interval_s` | Push cadence (30–60 s) |
| `peer_host` | The other HeatValve-6 board (master only) |

Dashboard settings card shows coordinator role, peer status, last push, the recommended
fixed Asgard setpoint, and the failure counter.

The board-to-board `/api/hv6/v1/peer` snapshot carries each zone's `sp` (configured
setpoint) alongside `t`/`area`/`en` so the coordinator can fold the peer board's zones
into the recommended-setpoint average.

## Preheat Absorption

When the Odin optimizer pre-buffers the slab, hot water arrives at the manifold while no
zone demands heat. Without countermeasures the zones would classify OVERHEATED and close
their valves, blocking the buffer and fighting the optimizer.

`hv6_zone_controller` therefore detects external pre-buffering each control cycle:
manifold flow temperature exceeds the house-average room temperature by
`preheat_detect_delta_c` (default 8 °C) **and** no zone is in DEMAND, sustained for two
cycles (2 °C release hysteresis). While active, the overheat cutoff is raised by
`preheat_absorb_band_c` (default 1.0 °C), scaled per zone by floor thermal mass
(tile 1.0× — concrete slabs absorb the most; parquet/oak 0.6×; carpet 0.4×), so
satisfied zones keep their maintenance opening and the slab absorbs the buffer.

The state releases immediately when any zone drops into DEMAND (the buffer is then routed
to the cold zone by normal control) or when the flow temperature decays. Configured from
the dashboard Smart Heating card (`ControlConfig` in NVS: `preheat_absorb_enabled`,
`preheat_absorb_band_c`, `preheat_detect_delta_c`); live state is shown as an
"active/idle" badge in the dashboard.

## Troubleshooting

- **Verify Asgard push**: `curl -s "http://<asgard>/number/virtual_thermostat_input_z1"`
  to read the current value.
- **Peer status**: check the dashboard Asgard card — "degraded" means the slave snapshot
  is stale/unreachable and only local zones are being weighted.
