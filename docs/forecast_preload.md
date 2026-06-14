# Forecast Preload (wind-aware, on-device)

`hv6_forecast` adds weather-forecast-driven per-zone preheating to HeatValve-6, on the
board itself — no external service required. It exists because a Mitsubishi Ecodan + Odin
optimizer plans the *whole house's* heat as a single signal, but this house loses heat
unevenly: depending on wind direction and speed, only one or two of the six rooms (mostly
the low-thermal-mass first floor) lag during a winter storm. Odin cannot route heat to a
specific facade; HeatValve-6 must, and to do that it has to know which way the wind blows.

## How it works

1. **Fetch.** A FreeRTOS task (Core 1, same pattern as the Asgard component) pulls a
   48 h Open-Meteo forecast over HTTPS every `fetch_interval_s` (default 1 h): hourly
   temperature, wind speed, wind direction and shortwave radiation. The parsed forecast is
   cached in its own NVS namespace (`hv6f`) so a reboot does not lose it.

2. **Per-zone weather load.** Each forecast hour is reduced to a dimensionless load per zone
   ([forecast_model.h](../components/hv6_forecast/forecast_model.h)):

   ```
   wind_alignment = max over the zone's exterior walls of cos(wind_dir − wall_normal), ≥ 0
   load = wind_exposure × wind_alignment × (wind_speed / 10 m/s)
            × max(0, indoor_ref − outdoor) / 10 K
            − solar_gain × (shortwave / 800 W/m²),  floored at 0
   ```

   A zone with no exterior walls (interior room) always scores 0. Wind from a sheltered
   side scores 0. The per-zone `exterior_walls` bitmask (set in the zone sensor card) is
   what makes this directional.

3. **Preload decision.** For each zone the model scans the next `thermal_lead_h` hours and
   takes the peak load. Above `load_threshold` it issues a setpoint offset
   `min(max_offset_c, (peak − threshold) × gain_c_per_load)`, so charging starts
   `thermal_lead_h` before the storm — longer for high-mass floors (concrete ground floor
   ≈ 8–12 h), shorter for the light first floor (≈ 2–3 h).

4. **Apply.** The offset is fed through the **internal setpoint-offset command path**
   (`apply_helios_command`), so every per-zone firmware safety clamp applies unchanged:
   `[min_offset_c, max_offset_c]`, `abs_min_c/abs_max_c`. The forecast producer
   **auto-quiesces whenever the `HeliosConfig.enabled` gate is set** — a hook left in place
   so an external optimizer could reclaim the command slots; with the external Helios client
   removed this gate is normally off and the local producer stays active.

The forecast and the preheat-absorption logic (see
[ecodan_integration.md](ecodan_integration.md)) are complementary: forecast preload opens
the exposed zone's valve / raises its setpoint *before* the weather, so the weighted house
temperature dips slightly and Odin/Asgard delivers the heat; preheat-absorption then keeps
the satisfied zones open so the slab can store it.

## Two boards

Each board runs its own `hv6_forecast` for its own six zones — exposure config is per zone
and local, and two Open-Meteo calls are harmless. No cross-board coordination is needed in
the preload layer; only the Asgard z1 feed is aggregated (master/slave).

## Configuration

Dashboard **Forecast Preload** card (`ForecastConfig` + per-zone exposure in NVS):

| Field | Default | Meaning |
|---|---|---|
| `enabled` | false | Master on/off |
| `latitude` / `longitude` | 0 | Site location (required; 0,0 disables) |
| `fetch_interval_s` | 3600 | Open-Meteo refresh cadence |
| `recompute_interval_s` | 300 | Preload re-evaluation cadence |
| `load_threshold` | 1.0 | Load units before preload kicks in |
| `gain_c_per_load` | 0.5 | °C offset per load unit above threshold |
| `max_offset_c` | 1.5 | Model cap (per-zone clamps still apply) |
| `indoor_ref_c` | 21.0 | Reference indoor temp for the cold term |
| per-zone `wind_exposure` | 0.5 | 0–1 facade exposure (shelter/terrain) |
| per-zone `solar_gain_factor` | 0.3 | 0–1 passive solar relief through glazing |
| per-zone `thermal_lead_h` | 4 | Hours of slab charging before a load peak |

Status (badge + per-zone active offset / hours-to-peak) is shown on the card and reported
in the dashboard state.

## Testing

The load/preload math is pure C++ with no ESP dependencies and is covered by
[test/forecast/test_forecast_model.cpp](../test/forecast/test_forecast_model.cpp):

```bash
make test-forecast   # or: make test   (runs ripple + forecast)
```
