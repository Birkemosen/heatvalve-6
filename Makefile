# HeatValve-6 – lokalt udviklingsmiljø
# Kør fra repo-roden. Kræver: pip install esphome (eller esphome i venv)

CONFIG_DEV = heatvalve-6-dev.yaml
CONFIG_DRV8215_M1 = heatvalve-6-drv8215-motor1-manual.yaml
PYTHON ?= python3

.PHONY: run compile upload log clean run-drv8215-m1 compile-drv8215-m1

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

# ============================================
# DRV8215 hardware bring-up (motor 1 manual)
# ============================================

run-drv8215-m1:
	esphome run $(CONFIG_DRV8215_M1)

compile-drv8215-m1:
	esphome compile $(CONFIG_DRV8215_M1)


