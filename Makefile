# HeatValve-6 – lokalt udviklingsmiljø
# Kør fra repo-roden. Kræver: pip install esphome (eller esphome i venv)

CONFIG_DEV = config_dev.yaml
CONFIG_THREYR = config_dev_threyr.yaml

.PHONY: run compile upload log clean run-threyr compile-threyr

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
# Threyr Advanced Control
# Requires: ../threyr/ repo cloned as sibling
# ============================================

# Byg og upload med Threyr enabled
run-threyr:
	@test -d ../threyr/components/threyr || (echo "Error: ../threyr/ not found. Clone: git clone https://github.com/birkemosen/threyr.git ../threyr" && exit 1)
	esphome run $(CONFIG_THREYR)

# Kun kompilér Threyr config
compile-threyr:
	@test -d ../threyr/components/threyr || (echo "Error: ../threyr/ not found." && exit 1)
	esphome compile $(CONFIG_THREYR)
