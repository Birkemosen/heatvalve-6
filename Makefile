CONFIG ?= heatvalve-6.yaml
ESPHOME ?= $(if $(wildcard .venv313/bin/esphome),.venv313/bin/esphome,$(if $(wildcard .venv/bin/esphome),.venv/bin/esphome,esphome))
PIO ?= $(if $(wildcard .venv313/bin/platformio),.venv313/bin/platformio,$(if $(wildcard .venv/bin/platformio),.venv/bin/platformio,platformio))
BUILD_NAME ?= heatvalve-6
BUILD_ROOT ?= .esphome/build/$(BUILD_NAME)
PIO_BUILD_DIR ?= $(BUILD_ROOT)/.pio/build/$(BUILD_NAME)
FIRMWARE_BIN ?= $(PIO_BUILD_DIR)/firmware.bin
HOST ?= heatvalve-6.local
PORT ?=
AUTO_PORT := $(strip $(shell ls /dev/cu.usbmodem* /dev/cu.usbserial* /dev/cu.SLAB_USBtoUART* /dev/cu.wchusbserial* 2>/dev/null | head -n 1))
SERIAL_PORT := $(if $(PORT),$(PORT),$(AUTO_PORT))
DASHBOARD_SRC_DIR ?= web/dashboard-src
DASHBOARD_OUT_FILE ?= web/dashboard.js

.PHONY: help check config build build-patch build-minor build-major build-verify deploy ota logs monitor erase erase-nvs clean dashboard dashboard-tooling dashboard-build dashboard-watch

help:
	@echo "HeatValve-6 ESPHome tasks"
	@echo "  make config        Validate YAML"
	@echo "  make build         Compile firmware (no version bump)"
	@echo "  make build-patch   Bump patch version + compile firmware"
	@echo "  make build-minor   Bump minor version + compile firmware"
	@echo "  make build-major   Bump major version + compile firmware"
	@echo "  make build-verify  Alias for make build"
	@echo "  make deploy        Build + upload (USB if PORT is set, otherwise OTA)"
	@echo "  make ota           Build + upload over network to HOST"
	@echo "  make logs          Stream logs from HOST"
	@echo "  make monitor       Open serial monitor on PORT"
	@echo "  make erase         Erase flash on PORT"
	@echo "  make erase-nvs     Erase NVS partition only (clears calibration data)"
	@echo ""
	@echo "Examples:"
	@echo "  make build"
	@echo "  make build-patch"
	@echo "  make deploy"
	@echo "  make deploy PORT=/dev/cu.usbmodemXXXX"
	@echo "  make monitor PORT=/dev/cu.usbmodemXXXX"
	@echo "  make erase PORT=/dev/cu.usbmodemXXXX"
	@echo "  make ota HOST=192.168.1.50"

check:
	@command -v $(ESPHOME) >/dev/null 2>&1 || { \
		echo "ESPHome CLI not found."; \
		echo "Create .venv and install: python3 -m venv .venv && ./.venv/bin/pip install esphome"; \
		exit 1; \
	}
	@command -v $(PIO) >/dev/null 2>&1 || { \
		echo "PlatformIO CLI not found."; \
		echo "Install in venv: ./.venv313/bin/pip install platformio"; \
		exit 1; \
	}

config: check
	$(ESPHOME) config $(CONFIG)

build: check dashboard-build
	$(ESPHOME) compile --only-generate $(CONFIG)
	perl -0pi -e 's/" ".join\(cmd\)/" ".join(map(str, cmd))/g' $(BUILD_ROOT)/post_build.py
	$(PIO) run -d $(BUILD_ROOT)

build-patch: check dashboard-build
	bash bump_patch_version.sh patch
	$(MAKE) build

build-minor: check dashboard-build
	bash bump_patch_version.sh minor
	$(MAKE) build

build-major: check dashboard-build
	bash bump_patch_version.sh major
	$(MAKE) build

build-verify: check dashboard-build
	$(MAKE) build

deploy: check
	$(MAKE) build
	@if [ -n "$(PORT)" ]; then \
		$(PIO) run -d $(BUILD_ROOT) -t upload --upload-port $(PORT); \
	elif [ -n "$(AUTO_PORT)" ]; then \
		echo "Auto-detected serial port: $(AUTO_PORT)"; \
		$(PIO) run -d $(BUILD_ROOT) -t upload --upload-port $(AUTO_PORT); \
	else \
		$(ESPHOME) upload $(CONFIG) --file $(FIRMWARE_BIN) --device $(HOST); \
	fi

ota: check
	$(MAKE) build
	$(ESPHOME) upload $(CONFIG) --file $(FIRMWARE_BIN) --device $(HOST)

logs: check
	$(ESPHOME) logs $(CONFIG) --device $(HOST)

monitor: check
	@if [ -z "$(SERIAL_PORT)" ]; then \
		echo "No serial port detected. Use PORT=/dev/cu.usbmodemXXXX"; \
		exit 1; \
	fi
	@echo "Using serial port: $(SERIAL_PORT)"
	$(PIO) device monitor --port $(SERIAL_PORT)

erase: check
	@if [ -z "$(SERIAL_PORT)" ]; then \
		echo "No serial port detected. Use PORT=/dev/cu.usbmodemXXXX"; \
		exit 1; \
	fi
	@echo "Using serial port: $(SERIAL_PORT)"
	$(PIO) run -d $(BUILD_ROOT) -t erase --upload-port $(SERIAL_PORT)

erase-nvs: check
	@if [ -z "$(SERIAL_PORT)" ]; then \
		echo "No serial port detected. Use PORT=/dev/cu.usbmodemXXXX"; \
		exit 1; \
	fi
	@echo "Erasing NVS partition on $(SERIAL_PORT)..."
	python3 -m esptool --port $(SERIAL_PORT) erase_region 0x9000 0x6000
	@echo "NVS erased. Calibration data cleared — device will need recalibration."

clean:
	rm -rf .esphome/build

# Dashboard build tasks
dashboard: check
	# Check if esbuild is available, if not, download it (silent unless error)
	@command -v ./.tools/esbuild >/dev/null 2>&1 || $(MAKE) dashboard-tooling
	$(MAKE) dashboard-build

dashboard-tooling:
	# Download esbuild if not present into .tools/esbuild
	mkdir -p .tools
	# change to .tools directory and download esbuild
	cd .tools && curl -fsSL https://esbuild.github.io/dl/latest | sh
	cd ../

dashboard-build:
	@command -v ./.tools/esbuild >/dev/null 2>&1 || $(MAKE) dashboard-tooling
	./.tools/esbuild $(DASHBOARD_SRC_DIR)/main.js \
	--bundle \
	--minify \
	--tree-shaking=true \
	--format=iife \
	--target=es2018 \
	--platform=browser \
	--define:DEBUG=false \
	--outfile=$(DASHBOARD_OUT_FILE)

dashboard-watch:
	@echo "Watching dashboard source for changes... press (ctrl+c to stop)"
	@fswatch -r -o web/dashboard-src | \
    while read; do \
        echo "Rebuilding dashboard..."; \
        if ! $(MAKE) dashboard --no-print-directory; then \
            echo "Dashboard build failed!"; \
        fi; \
    done