# Forecast-data: kilder og API-opkobling

## Standalone med Open-Meteo (vejr direkte på controlleren)

Controlleren kan **selv** hente vejr fra Open-Meteo uden MQTT eller Home Assistant.

**Kun aktuel vejr (simpel):**
1. Inkluder **optional/forecast.yaml** (eller forecast_no_ble.yaml).
2. Inkluder **optional/forecast_openmeteo_current.yaml**.
3. Sæt **openmeteo_latitude**, **openmeteo_longitude** (fx 55.68, 12.57) i substitutions.

**Aktuel vejr + 24h prognose:**
1. Inkluder **optional/forecast.yaml** (eller forecast_no_ble.yaml).
2. Inkluder **optional/forecast_learn.yaml**.
3. Inkluder **optional/forecast_openmeteo.yaml**.
4. Sæt **openmeteo_latitude**, **openmeteo_longitude**. Evt. **openmeteo_interval_min** (default 10).

Controlleren skal have **WiFi og internet**. Open-Meteo er gratis og kræver ingen API-nøgle. Vindhastighed konverteres automatisk fra km/h til m/s.

**Prognose-horisont:** Antal timer frem bruges **forecast_horizon_hours** (default 12). Det bør matche rummenes reaktionstid – fx den længste **zN_response_h** eller lært tau (typisk 6–12 h). Sæt evt. i config: `forecast_horizon_hours: "12"`.

---

## Vejr via MQTT (uden internet på controlleren)

ESP'en behøver ikke selv internet – den kan modtage al vejrdata via **MQTT**. Den del der henter fra et API (fx Open-Meteo), kan køre i Home Assistant, Node-RED eller et script.

---

## Overblik

```
  [Vejr-API]  →  [Home Assistant / Node-RED / script]  →  MQTT  →  [ESP / HeatValve-6]
   (internet)         henter data, formaterer              broker      læser globals
```

- **ESP:** Abonnerer på MQTT-topics og opdaterer `forecast_outdoor_temp`, `forecast_wind_speed`, `forecast_wind_direction` og evt. 24h-text-sensorer.
- **Du** tilføjer i din MQTT-konfiguration (fx i `mqtt_ecodan.yaml`) `on_message`-handlers, der sætter disse værdier når nogen publiserer til de rigtige topics.
- **Data fra API:** I Home Assistant (eller andet) henter du vejr fra fx Open-Meteo og publiserer til de samme MQTT-topics.

---

## 1. MQTT-topics (standard)

Publiser til disse topics (payload som angivet), så ESP'en kan bruge dem når du har tilføjet `on_message` nedenfor.

| Formål | Topic | Payload eksempel |
|--------|--------|-------------------|
| Udetemp (nu) | `weather/forecast/outdoor_temp` | `10.2` |
| Vindhastighed (m/s) | `weather/forecast/wind_speed` | `3.5` |
| Vindretning (grader) | `weather/forecast/wind_dir` | `180` |
| N-timer udetemp | `weather/forecast/outdoor_24h` | `10.2,9.8,9.5,...` (N tal, N = forecast_horizon_hours) |
| N-timer vindhastighed | `weather/forecast/wind_speed_24h` | `2.1,3.0,4.0,...` |
| N-timer vindretning | `weather/forecast/wind_dir_24h` | `180,185,190,...` |

---

## 2. Tilføj on_message i ESPHome (MQTT)

I din MQTT-pakke (fx `optional/mqtt_ecodan.yaml`) skal du have et `mqtt:`-block med `on_message`. Tilføj disse handlers (brug samme `id_prefix` som resten af config, typisk `heating_`):

```yaml
# Under mqtt: -> on_message: (tilføj disse entries)
- topic: weather/forecast/outdoor_temp
  then:
    - lambda: |-
        float v = atof(x.c_str());
        id(heating_forecast_outdoor_temp) = v;
- topic: weather/forecast/wind_speed
  then:
    - lambda: |-
        float v = atof(x.c_str());
        id(heating_forecast_wind_speed) = v;
- topic: weather/forecast/wind_dir
  then:
    - lambda: |-
        float v = atof(x.c_str());
        id(heating_forecast_wind_direction) = v;
# 24h (kun nødvendigt hvis forecast_learn er inkluderet)
- topic: weather/forecast/outdoor_24h
  then:
    - lambda: id(heating_forecast_24h_outdoor).publish_state(x);
- topic: weather/forecast/wind_speed_24h
  then:
    - lambda: id(heating_forecast_24h_wind_speed).publish_state(x);
- topic: weather/forecast/wind_dir_24h
  then:
    - lambda: id(heating_forecast_24h_wind_dir).publish_state(x);
```

Hvis din `id_prefix` ikke er `heating_`, erstat `heating_` med din prefix. Kræver at `optional/forecast.yaml` (eller `forecast_no_ble.yaml`) og evt. `forecast_learn.yaml` er inkluderet, så de pågældende ids findes.

---

## 3. Data fra API (fx Open-Meteo)

**[Open-Meteo](https://open-meteo.com/)** er gratis og kræver ingen API-nøgle. Du kan bruge det fra Home Assistant eller andet.

### Home Assistant: REST + MQTT

1. **Aktuel vejr** – tilføj REST-sensorer der henter fra Open-Meteo (erstat `LAT,LON` med din lokation):

```yaml
# configuration.yaml eller via UI: Config -> REST
rest:
  - resource: https://api.open-meteo.com/v1/forecast?latitude=LAT&longitude=LON&current=temperature_2m,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,wind_speed_10m,wind_direction_10m
    scan_interval: 600  # 10 min
    sensor:
      - name: "Open-Meteo Outdoor Temp"
        unique_id: openmeteo_outdoor_temp
        value_template: "{{ value_json.current.temperature_2m }}"
      - name: "Open-Meteo Wind Speed"
        unique_id: openmeteo_wind_speed
        value_template: "{{ value_json.current.wind_speed_10m }}"
      - name: "Open-Meteo Wind Direction"
        unique_id: openmeteo_wind_direction
        value_template: "{{ value_json.current.wind_direction_10m }}"
```

2. **Publish til MQTT** – automation der sender værdierne til de topics ESP'en lytter på (brug fx `mqtt.publish` i HA):

```yaml
# automation: når sensor opdateres, send til MQTT
trigger:
  - platform: state
    entity_id:
      - sensor.open_meteo_outdoor_temp
      - sensor.open_meteo_wind_speed
      - sensor.open_meteo_wind_direction
action:
  - service: mqtt.publish
    data:
      topic: weather/forecast/outdoor_temp
      payload: "{{ states('sensor.open_meteo_outdoor_temp') }}"
  - service: mqtt.publish
    data:
      topic: weather/forecast/wind_speed
      payload: "{{ states('sensor.open_meteo_wind_speed') }}"
  - service: mqtt.publish
    data:
      topic: weather/forecast/wind_dir
      payload: "{{ states('sensor.open_meteo_wind_direction') }}"
```

3. **24-timers prognose** – Open-Meteo returnerer `hourly.temperature_2m` (liste med 24+ værdier). I HA kan du lave en template-sensor der formaterer de næste 24 timer som kommasepareret streng, og en automation der publiserer den til `weather/forecast/outdoor_24h`, `wind_speed_24h` og `wind_dir_24h`. (REST-resource med `&hourly=temperature_2m,wind_speed_10m,wind_direction_10m` og template der tager `value_json.hourly.temperature_2m[0:24]` og joiner med `,`.)

### Alternativer

- **Weather-integration** i Home Assistant (Open-Meteo, SMHI, Yr osv.) eksponerer ofte `weather.<navn>_temperature`, vind osv. Du kan bruge disse entities i stedet for REST og stadig publish til MQTT via automation.
- **Node-RED:** Flow der kalder Open-Meteo HTTP-request, formaterer payload og sender til MQTT-broker med de ovenstående topics.
- **Lille script** (Python/Node) på en Raspberry Pi eller server: kald API, publish til MQTT med fx `paho-mqtt` / `mqtt.js`.

---

## Kort sagt

- **Ekstern opkobling:** Ikke på ESP'en – den bruger kun MQTT.
- **API:** Kan bruges i den komponent der sender data til MQTT (HA, Node-RED, script). Open-Meteo er en simpel, gratis mulighed uden API-nøgle.
