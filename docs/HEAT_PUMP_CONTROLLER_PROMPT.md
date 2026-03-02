# Heat Pump Controller – Optimization Prompt (from HeatValve-6 UFH behavior)

Use this as a detailed description prompt when optimizing your heat pump controller so it aligns with how the floor heating (HeatValve-6) system behaves and what it expects from the heat source.

---

## 1. System role

- **HeatValve-6** controls **zone valves** (0–100% opening) for underfloor heating (UFH) zones. It does **not** control the heat pump directly.
- The **heat pump** (or central boiler) supplies **flow temperature** and **on/off** (or modulation). The UFH controller expects a stable flow temperature and may send **flow temperature adjustment requests** (e.g. −2 to +2 °C) based on aggregate demand.
- Optimizing the heat pump means: **when** to run, **at what flow temperature**, and **how to respond** to demand signals and thermal inertia so that:
  - Zones reach setpoint without overshoot.
  - Valve average stays in the **50–80%** “sweet spot” when possible (good for efficiency and stability).
  - Short-cycling and excessive flow temperature are avoided.

---

## 2. How the UFH controller decides “demand”

### 2.1 Zone states (per zone)

Each zone is in one of three states based on **setpoint − current temperature** (or **effective** difference when forecast is used):

| State       | Condition (example with 0.5 °C band) | Valve behavior |
|------------|--------------------------------------|----------------|
| OVERHEATED | temp > setpoint + comfort_band       | Valve → 0%     |
| SATISFIED  | \|temp − setpoint\| ≤ comfort_band   | Maintenance flow (preload) |
| DEMAND     | temp < setpoint − comfort_band       | Heating with boost         |

- **Comfort band** (e.g. 0.5 °C): avoids chasing setpoint exactly; UFH has slow response, so a band reduces overshoot and valve flapping.
- **Overheated hysteresis**: zone closes when over setpoint+band; reopens only when temp is back at or below setpoint (not just “less overheated”). This avoids rapid on/off at the boundary.

**Implication for heat pump:**  
When many zones are SATISFIED or OVERHEATED, demand is low; the UFH system may request **lower** flow temperature. When many are in DEMAND, it may request **higher** flow temperature. The heat pump should respond to these signals and to **aggregate valve opening** (e.g. average 0–100%) rather than a single zone.

### 2.2 Effective temperature difference (with forecast)

When forecast/MPC is enabled:

- **effective_diff_temp = (setpoint − current_temp) + zone_forecast_correction**
- **zone_forecast_correction** is computed every 5 min from:
  - **Outdoor temperature** (colder → more demand): term like `k_outdoor * (t_ref - t_outdoor)`.
  - **Wind**: speed and **direction** vs. zone exposure (direction the room’s cold wall faces). Wind *from* the opposite direction increases loss and **pre-heat** for that zone.
  - **Per-zone thermal response time** (e.g. 3–12 h): slower rooms get a larger pre-heat offset so they “charge” before the loss arrives.
  - **Solar (illuminance)**: more light → less demand (subtracted term).
- Correction is clamped (e.g. −2 to +2.5 °C) to avoid extreme setpoint shifts.

**Implication for heat pump:**  
Demand can **anticipate** cold/wind and solar. The heat pump can treat “demand” as already weather-corrected; running flow temperature or start time in line with **forecast** (e.g. colder later today) can match this pre-heat behavior and avoid over- or under-heating.

### 2.3 Valve position mapping (tanh)

- **Base position** (before boost/min/hydraulic):  
  `base_position = max(0, tanh(tanh_steepness * effective_diff_temp))`  
  Then scaled by **boost_factor** (e.g. 100%) and optionally **hydraulic_factor**.
- **Tanh** gives a smooth S-curve: small diff → small opening; large diff → opening saturates toward 100%. Suited to slow UFH response.

**Implication for heat pump:**  
Large “cold” errors don’t mean “run at 100% flow temp forever”; valves already saturate. So the heat pump should avoid over-raising flow temperature when demand is already high; focus on **stability** and **average valve position** (e.g. 50–80%) rather than max power.

---

## 3. Hydraulic balancing (multi-zone)

- **Reference zone**: longest pipe among non-overheated zones. Other zones are scaled by **pipe length ratio** (zone pipe length / reference pipe length).
- **SATISFIED**: position = **maintenance_base × pipe_ratio** (with a floor of **minimum_valve_opening**).
- **DEMAND**: position combines hydraulic base (e.g. **max_opening × pipe_ratio**) with a **demand_boost** factor.
- **minimum_valve_opening** (e.g. 25%): ensures a minimum flow in heating zones to avoid stagnation and **heat pump short-cycling**.

**Implication for heat pump:**  
Even when “all zones at setpoint”, valves are not fully closed; they sit at a **maintenance** level. The heat pump should expect a **minimum load** when heating is “on” and avoid turning off too aggressively. Short cycle prevention (e.g. min on/off times) is important; this project uses **min_heating_off_time** and **min_heating_run_time** of 300 s on the thermostat side.

---

## 4. Flow temperature request (from UFH to heat pump)

The UFH controller can publish a **flow temperature adjustment** (e.g. −2 to +2 °C) based on **system-wide average valve position** (and possibly multi-controller average):

| Average valve position | Request (example) | Rationale |
|------------------------|--------------------|------------|
| &lt; 30%                | −2 °C              | Most zones satisfied or overheated |
| 30–50%                 | −1 °C              | Low demand |
| **50–80%**             | **0 °C**           | **Optimal** |
| 80–90%                 | +1 °C              | High demand |
| &gt; 90%                | +2 °C              | Valves near full open |

**Implication for heat pump:**  
Use this signal (if available) to **modulate flow temperature** rather than only on/off. Keeping the average in 50–80% by adjusting flow temperature is a design goal for efficiency and comfort.

---

## 5. Parameters you can mirror or respect

- **comfort_band** (e.g. 0.5 °C): tolerance around setpoint; don’t assume “exact setpoint” from the UFH logic.
- **minimum_valve_opening** (e.g. 25%): implies a minimum continuous load when heating is on.
- **min_heating_off_time / min_heating_run_time** (e.g. 300 s): avoid short cycles; heat pump should have compatible (or longer) min on/off times.
- **min_movement** (e.g. 5%): valve only moves if position change &gt; this; reduces flapping. Heat pump should avoid rapid setpoint changes that would cause all zones to flap.
- **check_interval** (e.g. 15 min): zone logic runs periodically; heat pump decisions can be on similar or slower time scales to avoid fighting the UFH controller.

---

## 6. Algorithm optimizations (Better Thermostat–inspired, from this project)

These are ideas the UFH side uses (or plans) to reduce overshoot and flapping; the heat pump can align with them:

1. **Temperature slope (dT/dt)**  
   Positive slope (room warming) → reduce output to limit overshoot. Heat pump: avoid raising flow temperature when room temps are already rising quickly.

2. **Fast-close on overheated**  
   When a zone is clearly overheated, valve closes immediately (ignore min_movement). Heat pump: when **aggregate** demand drops sharply (e.g. many zones overheated), reduce flow temperature or stop quickly.

3. **Smoothing and rate limit**  
   Valve position is smoothed (e.g. EMA) and only updated if change ≥ hysteresis and interval has passed. Heat pump: smooth flow temperature or on/off decisions; avoid step changes that force all zones to react at once.

4. **Near-setpoint throttling**  
   When close to setpoint, heating is throttled (e.g. lower maintenance opening) to avoid overshoot. Heat pump: when average valve position is in the “high but not max” range and temperatures are near setpoint, prefer small reductions in flow temperature rather than full power.

5. **Phase-aware behavior**  
   “Heating phase” vs “hold/cooling phase” can be used to learn or limit max/min opening. Heat pump: distinguish “ramp-up” (cold start) from “maintenance” (near setpoint) and use different flow temperature or modulation in each phase.

---

## 7. What to implement or tune on the heat pump side

- **Demand input:**  
  Use **average valve position** and/or **flow temperature request** from the UFH controller (if available). Optionally use **outdoor temperature** and **forecast** in the same way as the UFH (colder → higher flow temp, wind/solar per exposure).

- **Flow temperature:**  
  Modulate flow temperature so that system average valve position tends to stay in **50–80%** when heating. Avoid “max flow temp whenever any zone is cold”; tanh and hydraulic logic already limit valve opening.

- **Short-cycle prevention:**  
  Enforce **min on time** and **min off time** (e.g. ≥ 5 min) compatible with UFH’s 300 s thermostat times and minimum valve opening.

- **Stability:**  
  Smooth flow temperature setpoints and avoid rapid changes; respect the UFH **check_interval** and **min_movement** so zone valves don’t flap.

- **Weather and forecast:**  
  If the UFH uses outdoor temp and wind/solar for pre-heat, the heat pump can use the same or similar data to **pre-heat** (earlier or slightly higher flow temp) before cold/wind, and **reduce** flow temp when solar or mild weather is forecast.

---

## 8. Summary one-liner for a prompt

**“Optimize the heat pump controller for a floor heating system that uses: (1) zone states OVERHEATED / SATISFIED / DEMAND with a comfort band; (2) tanh mapping of temperature error to valve opening; (3) optional MPC-style forecast (outdoor temp, wind direction/exposure, solar, per-zone response time); (4) hydraulic balancing by pipe length and minimum valve opening; (5) flow temperature request from average valve position (target 50–80%); (6) min on/off times and smoothing to avoid short-cycling and flapping. The heat pump should modulate flow temperature and run times so that aggregate valve demand stays in the optimal range and responds to forecast and flow temp request.”**

You can paste the full document or the one-liner into your heat pump controller project as the “system description” when asking for optimization or code changes.
