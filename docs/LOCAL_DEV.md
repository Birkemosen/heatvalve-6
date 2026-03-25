# Lokalt udviklingsmiljø

Test og byg firmware direkte fra repo-roden uden at kopiere config til Home Assistant eller lave commits/pulls.

## Krav

- **ESPHome** installeret lokalt, f.eks.:
  ```bash
  pip install esphome
  # eller: brew install esphome  (macOS)
  ```
- **secrets.yaml** i repo-roden med `wifi_ssid`, `wifi_password`, `ota_password` (repo indeholder en template).

## Hurtig start

Fra mappen `heatvalve-6/`:

```bash
make run
```

Vælg **Upload** eller **Run** når ESPHome spørger. Ved OTA vælges enhed (IP/hostname).  
Første gang kan du bruge **Install** med USB forbundet.

## Make-mål

| Kommando   | Beskrivelse                    |
|-----------|---------------------------------|
| `make run`    | Byg + upload OTA (interaktiv)   |
| `make compile`| Kun byg (ingen upload)          |
| `make upload` | Upload sidste build             |
| `make log`    | Åbn log fra enheden             |
| `make clean`  | Ryd `.esphome/build`            |

## Forskelle fra produktions-config

- **deploy/local-dev.yaml** er development-entrypoint og peger på root-template `heatvalve-6.yaml`.
- **Device-navn** er `heatvalve-6-dev`, så OTA overskriver ikke en evt. produktions-enhed med navnet `heatvalve-6`.
- Samme template bruges i alle deployment-profiler under `deploy/`; forskellen er primært substitutions og external_components source.

## Tip

- For at flashe den samme fysiske enhed som dev: brug OTA og vælg dens IP. Efter test kan du flashe produktions-firmware igen fra HA/ESPHome add-on.
- For kun at tjekke at YAML bygger: `make compile`.
