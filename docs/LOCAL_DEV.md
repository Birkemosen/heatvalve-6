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

- **heatvalve-6-dev.yaml** bruger relative stier (`boards/`, `core/`, `zones/`) og `components` (ikke `heatvalve-6/components`), så alt kører fra repo-roden.
- **Device-navn** er `heatvalve-6-dev`, så OTA overskriver ikke en evt. produktions-enhed med navnet `heatvalve-6`.
- Samme indhold som `heatvalve-6.yaml`; kun stier og device-navn er ændret.

## Tip

- For at flashe den samme fysiske enhed som dev: brug OTA og vælg dens IP. Efter test kan du flashe produktions-firmware igen fra HA/ESPHome add-on.
- For kun at tjekke at YAML bygger: `make compile`.
