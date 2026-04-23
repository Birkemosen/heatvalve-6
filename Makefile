CONFIG ?= heatvalve-6.yaml
ESPHOME ?= $(if $(wildcard .venv313/bin/esphome),.venv313/bin/esphome,$(if $(wildcard .venv/bin/esphome),.venv/bin/esphome,esphome))
PIO ?= $(if $(wildcard .venv313/bin/platformio),.venv313/bin/platformio,$(if $(wildcard .venv/bin/platformio),.venv/bin/platformio,platformio))
PYTHON ?= $(if $(wildcard .venv313/bin/python3),.venv313/bin/python3,$(if $(wildcard .venv/bin/python3),.venv/bin/python3,python3))
BUILD_NAME ?= heatvalve-6
BUILD_ROOT ?= .esphome/build/$(BUILD_NAME)
PIO_BUILD_DIR ?= $(BUILD_ROOT)/.pio/build/$(BUILD_NAME)
FIRMWARE_BIN ?= $(PIO_BUILD_DIR)/firmware.bin
HOST ?=
PORT ?=
AUTO_PORT := $(strip $(shell ls /dev/cu.usbmodem* /dev/cu.usbserial* /dev/cu.SLAB_USBtoUART* /dev/cu.wchusbserial* 2>/dev/null | head -n 1))
SERIAL_PORT := $(if $(PORT),$(PORT),$(AUTO_PORT))
DASHBOARD_SRC_DIR ?= web/dashboard-src
DASHBOARD_OUT_FILE ?= web/dashboard.js

.PHONY: help check config build build-patch build-minor build-major build-verify deploy ota logs discover monitor erase erase-nvs clean dashboard dashboard-tooling dashboard-build dashboard-watch test test-ripple

help:
	@echo "HeatValve-6 ESPHome tasks"
	@echo "  make config        Validate YAML"
	@echo "  make build         Compile firmware (no version bump)"
	@echo "  make build-patch   Bump patch version + compile firmware"
	@echo "  make build-minor   Bump minor version + compile firmware"
	@echo "  make build-major   Bump major version + compile firmware"
	@echo "  make build-verify  Alias for make build"
	@echo "  make deploy        Build + upload (USB, OTA, or auto-discover)"
	@echo "  make ota           Build + upload over network (auto-discover if HOST unset)"
	@echo "  make logs          Stream logs (auto-discover if HOST unset)"
	@echo "  make discover      Scan network and list found devices"
	@echo "  make monitor       Open serial monitor on PORT"
	@echo "  make erase         Erase flash on PORT"
	@echo "  make erase-nvs     Erase NVS partition only (clears calibration data)"
	@echo "  make test          Run all host unit tests"
	@echo "  make test-ripple   Run ripple-counter unit tests (5 rates × 5 cases)"
	@echo ""
	@echo "Examples:"
	@echo "  make build"
	@echo "  make build-patch"
	@echo "  make deploy"
	@echo "  make deploy PORT=/dev/cu.usbmodemXXXX"
	@echo "  make monitor PORT=/dev/cu.usbmodemXXXX"
	@echo "  make erase PORT=/dev/cu.usbmodemXXXX"
	@echo "  make ota HOST=heatvalve-6-a1b2c3.local"
	@echo "  make discover"

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

# =============================================================================
# Host unit tests (no ESP-IDF, runs on macOS/Linux with clang++)
# =============================================================================
RIPPLE_CXX      ?= clang++
RIPPLE_CXXFLAGS  = -std=c++17 -O2 -Wall -Wextra -Wno-unused-parameter \
                   -I components/hv6_valve_controller
RIPPLE_SRCS      = components/hv6_valve_controller/ripple_counter.cpp \
                   test/ripple_counter/test_ripple_counter.cpp
RIPPLE_OUT       = /tmp/test_ripple_counter

test-ripple:
	$(RIPPLE_CXX) $(RIPPLE_CXXFLAGS) $(RIPPLE_SRCS) -o $(RIPPLE_OUT) -lm
	$(RIPPLE_OUT)

test: test-ripple
	@if [ -n "$(PORT)" ]; then \
		$(PIO) run -d $(BUILD_ROOT) -t upload --upload-port $(PORT); \
	elif [ -n "$(AUTO_PORT)" ]; then \
		echo "Auto-detected serial port: $(AUTO_PORT)"; \
		$(PIO) run -d $(BUILD_ROOT) -t upload --upload-port $(AUTO_PORT); \
	elif [ -n "$(HOST)" ]; then \
		$(ESPHOME) upload $(CONFIG) --file $(FIRMWARE_BIN) --device $(HOST); \
	else \
		echo "No serial port detected. Scanning for HeatValve-6 devices (3s)..."; \
		hosts=$$($(PYTHON) discover_devices.py 2>/dev/null); \
		if [ -z "$$hosts" ]; then echo "No devices found. Use PORT= or HOST=heatvalve-6-XXXXXX.local"; exit 1; fi; \
		count=$$(echo "$$hosts" | wc -l | tr -d ' '); \
		echo "Found devices:"; \
		i=1; for h in $$hosts; do printf "  %d) %s\n" $$i $$h; i=$$((i+1)); done; \
		printf "Select device [1-$$count]: "; \
		read choice < /dev/tty; \
		selected=$$(echo "$$hosts" | sed -n "$${choice}p"); \
		[ -z "$$selected" ] && { echo "Invalid selection"; exit 1; }; \
		$(ESPHOME) upload $(CONFIG) --file $(FIRMWARE_BIN) --device $$selected; \
	fi

ota: check
	$(MAKE) build
	@if [ -z "$(HOST)" ]; then \
		echo "Scanning for HeatValve-6 devices (3s)..."; \
		hosts=$$($(PYTHON) discover_devices.py 2>/dev/null); \
		if [ -z "$$hosts" ]; then echo "No devices found. Use: make ota HOST=heatvalve-6-XXXXXX.local"; exit 1; fi; \
		count=$$(echo "$$hosts" | wc -l | tr -d ' '); \
		echo "Found devices:"; \
		i=1; for h in $$hosts; do printf "  %d) %s\n" $$i $$h; i=$$((i+1)); done; \
		printf "Select device [1-$$count]: "; \
		read choice < /dev/tty; \
		selected=$$(echo "$$hosts" | sed -n "$${choice}p"); \
		[ -z "$$selected" ] && { echo "Invalid selection"; exit 1; }; \
		$(ESPHOME) upload $(CONFIG) --file $(FIRMWARE_BIN) --device $$selected; \
	else \
		$(ESPHOME) upload $(CONFIG) --file $(FIRMWARE_BIN) --device $(HOST); \
	fi

logs: check
	@if [ -z "$(HOST)" ]; then \
		echo "Scanning for HeatValve-6 devices (3s)..."; \
		hosts=$$($(PYTHON) discover_devices.py 2>/dev/null); \
		if [ -z "$$hosts" ]; then echo "No devices found. Use: make logs HOST=heatvalve-6-XXXXXX.local"; exit 1; fi; \
		count=$$(echo "$$hosts" | wc -l | tr -d ' '); \
		echo "Found devices:"; \
		i=1; for h in $$hosts; do printf "  %d) %s\n" $$i $$h; i=$$((i+1)); done; \
		printf "Select device [1-$$count]: "; \
		read choice < /dev/tty; \
		selected=$$(echo "$$hosts" | sed -n "$${choice}p"); \
		[ -z "$$selected" ] && { echo "Invalid selection"; exit 1; }; \
		$(ESPHOME) logs $(CONFIG) --device $$selected; \
	else \
		$(ESPHOME) logs $(CONFIG) --device $(HOST); \
	fi

discover: check
	@echo "Scanning for HeatValve-6 devices (5s)..."
	@$(PYTHON) discover_devices.py 2>/dev/null || echo "(no devices found)"

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