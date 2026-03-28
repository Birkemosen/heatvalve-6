# HeatValve-6 – lokalt udviklingsmiljø
# Kør fra repo-roden. Kræver: pip install esphome (eller esphome i venv)

CONFIG_DEV = deploy/local-dev.yaml
PYTHON ?= python3

.PHONY: run compile upload log clean

# ============================================
# Basic Control (default)
# ============================================

# Byg og upload OTA (vælg enhed når der køres)
run:
	esphome run $(CONFIG_DEV)

# Kun kompilér (ingen upload)
compile:
	esphome compile $(CONFIG_DEV)

# Upload til enhed (efter compile, eller brug run)
upload:
	esphome upload $(CONFIG_DEV)

# Åbn log fra enhed (vælg IP/hostname)
log:
	esphome logs $(CONFIG_DEV)

# Ryd build-cache
clean:
	rm -rf .esphome/build
