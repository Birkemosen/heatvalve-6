# Algoritme-optimeringer inspireret af Better Thermostat

Dette dokument beskriver idéer fra [Better Thermostat](https://github.com/KartoffelToby/better_thermostat) (algoritmer og [hydraulisk balancering](https://github.com/KartoffelToby/better_thermostat/blob/master/docs/hydraulic_balance_design.md)), der kan bruges til at forbedre HeatValve-6’s kontrol og reducere overshoot / flapping.

---

## 1. Temperaturtrend (slope) – reduktion af overshoot

**BT:** Beregner temperaturtrend dT/dt (K/min) over 5–10 min med EMA-glättning og bruger den til at justere ventilåbning:

- **Positiv slope** (rummet bliver varmere) → **reducer** ventilåbning for at undgå overshoot.
- **Negativ slope** (rummet køler) mens ΔT > 0 → sikr mindste åbning så rummet ikke køler for meget.

**Forslag til HeatValve-6:**

- Per zone: gem sidste N temperaturmålinger med tidsstempler (eller én EMA af temperatur + tid), beregn slope som (T_now − T_prev) / dt (fx i °C/min).
- Glat slope med EMA: `slope_ema = 0.6 * slope_ema + 0.4 * slope_raw`.
- **Slope-korrektion på target_position:**  
  `position_adj = target_position + slope_gain * slope_ema` med `slope_gain < 0` (fx −5 til −20 %-point per 0.01 °C/min), derefter clamp 0–100 %.
- I **SATISFIED**-området (|ΔT| lille): øg effekten (stærkere throttling ved positiv slope) for at undgå at overskride setpoint.

Kræver: et lille interval (fx 1–2 min) der opdaterer per-zone slope/EMA og globals som `zone_N_temp_slope_ema`. Kontrolscriptet (tanh_forecast/tanh) læser disse og anvender korrektionen.

---

## 2. Hurtig lukning ved overophedning (overshoot fast-close)

**BT:** Når ΔT ≤ −band_far (tydelig overophedning), bypasses rate limit og hysteresis, og ventil sættes med det samme til 0 %.

**HeatValve-6 i dag:** Ventilen lukkes ved OVERHEATED, men kun hvis `abs(position - target_position) > min_movement`. Det kan forsinke lukning.

**Forslag:** Når `new_state == 0` (OVERHEATED), **ignorer** `min_movement` og udfør altid `set_position(0)` (eller sæt en fast lav terskel fx 2 % så motor stadig kører). Det giver hurtigere lukning ved overshoot.

---

## 3. Glatning af ventilåbning (EMA) + rate limit

**BT:**  
- `p_smooth = (1 − α) * p_last + α * p`  
- Opdater kun fysisk ventil hvis `|p_smooth − p_last| ≥ hysteresis` og `Δt ≥ min_update_interval`.  
- Reducerer flapping og unødvendige motorbevægelser.

**HeatValve-6 i dag:** Vi har `min_movement` (hysterese) og check-interval, men ingen EMA på den beregnede position.

**Forslag (valgfri):**

- Per zone: `zone_N_position_smooth` (global float), opdateres hver kørsel:  
  `position_smooth = (1 - alpha) * position_smooth + alpha * target_position`.
- Send kun `set_position(position_smooth)` når `abs(position_smooth - last_sent_position) >= min_movement` og interval er overholdt.
- Alpha fx 0,3–0,4 (lidt langsom glatning). Kan gøres konfigurerbar (substitution eller number i web UI).

---

## 4. Near-setpoint throttling (MPC-agtig)

**BT:** Tæt på setpoint (|ΔT| ≤ band_near):  
- Hvis slope ≥ slope_up → throttl (p_adj *= 0.7).  
- Hvis slope ≤ slope_down og ΔT > 0 → sikr mindste åbning (fx 60 %).

**Forslag til HeatValve-6:**

- I **SATISFIED** (new_state == 1): Hvis vi har slope_ema og den er positiv og stor nok, brug en lavere “maintenance”-åbning end hydraulic_factor (fx hydraulic_factor * 0.7) for at mindske overshoot.
- I **DEMAND** tæt på grænsen (effective_diff lille men > comfort_band): Hvis slope_ema er negativ (rummet køler), brug mindst en vis åbning (fx min_opening eller lidt højere) så vi ikke lukker for tidligt.

Kan implementeres som ekstra betingelser i tanh_forecast/tanh efter at slope er tilføjet.

---

## 5. Phase-aware learning (hydraulik / caps)

**BT:** Lærer per rum og per setpoint-bucket:  
- **max_open** opdateres kun i opvarmningsfase (ΔT ≥ band_near).  
- **min_open** opdateres kun i hold/cooling (ΔT ≤ band_near).  
- Undgår at “stærke” rum dominerer ved at begrænse max åbning efter læring.

**HeatValve-6 i dag:** Hydraulic_factor er baseret på rørlængde (reference zone), ikke lært adfærd. Tau-læring er per zone og bruges til pre-heat.

**Forslag (langsigtet):**  
- Overvej at lære en “effektiv max åbning” per zone (eller per zone + setpoint-bucket): når zone ofte når setpoint med fx 60 % åbning, begræns fremadrettet til ~65 % i DEMAND for at give plads til svagere zoner.  
- Kræver persistering og lidt mere state; kan bygges oven på eksisterende hydraulic + forecast_learn.

---

## 6. Valgfri PID / avanceret modus

**BT:** Tilbyder PID med D på måling (blandet rum/TRV-temp), anti-windup og “near-setpoint integrator relief”. Særligt nyttigt med direkte ventilstyring.

**Forslag:** Behold tanh (og evt. linear) som hovedprofil. Hvis der senere ønskes en “PID”-agtig profil, kan den laves som et separat control-profile (fx `control/pid.yaml`) med:  
- P på diff_temp, I med anti-windup, D på glattet temperatur (eller slope).  
- Output clamp 0–100 % og samme overshoot-hysterese som i dag.

Ikke nødvendigt for de første optimeringer; mere en mulig udvidelse.

---

## 7. Sammenfatning – anbefalet rækkefølge

| Prioritet | Tiltag | Effekt | Kompleksitet |
|----------|--------|--------|---------------|
| Høj | Slope-baseret korrektion (1) | Mindre overshoot, mere stabil temperatur | Medium (globals + interval til slope) |
| Høj | Fast-close ved OVERHEATED (2) | Hurtigere lukning ved overshoot | Lav |
| Medium | EMA på position + rate limit (3) | Mindre flapping, færre motorbevægelser | Lav–medium |
| Medium | Near-setpoint throttling (4) | Finere kontrol tæt på setpoint | Lav (når slope findes) |
| Lav | Phase-aware / lært max (5) | Bedre fordeling mellem zoner på sigt | Høj |
| Valgfri | PID-profil (6) | Til meget avancerede brugere | Høj |

Kilder:

- [Better Thermostat – Calibration Algorithms](https://github.com/KartoffelToby/better_thermostat/blob/master/docs/Configuration/algorithms.md)
- [Better Thermostat – Hydraulic Balance Design](https://github.com/KartoffelToby/better_thermostat/blob/master/docs/hydraulic_balance_design.md)
- [Better Thermostat – Configuration](https://github.com/KartoffelToby/better_thermostat/blob/master/docs/Configuration/configuration.md)
