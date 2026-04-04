# ESP32-S3-WROOM-1-N16R8 Controller Schematic (Rev3)

This is a complete schematic specification for replacing ESP32-S3 Super Mini with ESP32-S3-WROOM-1-N16R8 on the HeatValve controller PCB.

Design intent:
- Use ESP32 native USB (USB-C connector on base PCB).
- Keep all inter-sheet connections as netlabels on ESP32 pins.
- Keep ESP-local support circuitry explicit (decoupling, EN/BOOT, USB-C, ESD, pull resistors).
- Use DRV8213 motor drivers (GPIO-controlled H-bridge, no I2C control plane).
- Keep one dedicated I2C bus for display and expansion (I2C_AUX).

## 1. Recommended Sheet Structure

- Sheet A: ESP32 Core (module + EN/BOOT + strapping + decoupling + crystal not needed)
- Sheet B: USB-C + Protection + Native USB D+/D-
- Sheet C: Motor Interface (DRV8213 control nets + nSLEEP + nFAULT)
- Sheet D: Aux Interface (I2C_AUX + display/expansion headers)
- Sheet E: 1-Wire + Pump + Status LED + UART header

Use global netlabels for all nets crossing sheets.

## 2. Netlabels (Global)

Power:
- +5V_USB
- +3V3
- GND

ESP control:
- ESP_EN
- ESP_BOOT

USB:
- USB_D+
- USB_D-
- USB_CC1
- USB_CC2
- USB_SHIELD

I2C bus (aux):
- I2C_AUX_SCL
- I2C_AUX_SDA

Motor logic:
- MOTOR_nSLEEP_ALL
- MOTOR_nFAULT_ALL
- M1_IN1
- M1_IN2
- M2_IN1
- M2_IN2
- M3_IN1
- M3_IN2
- M4_IN1
- M4_IN2
- M5_IN1
- M5_IN2
- M6_IN1
- M6_IN2

Other I/O:
- ONEWIRE_BUS
- PUMP_CTRL
- WS2812_DATA
- UART_TX_DBG
- UART_RX_DBG
- SAFE_IN_1
- AUX_OD_OUT

## 3. ESP32-S3-WROOM-1-N16R8 Connections

U1 = ESP32-S3-WROOM-1-N16R8

Important:
- Keep antenna end outside copper under-module keepout area (all layers).
- Place decoupling capacitors close to U1 3V3 pins.
- Use only netlabels from U1 pins to non-local circuitry.

### 3.1 Power Pins

- U1 3V3 pins -> +3V3
- U1 GND pins -> GND

Decoupling (local, place next to module):
- C101 = 100nF, +3V3 to GND
- C102 = 100nF, +3V3 to GND
- C103 = 1uF, +3V3 to GND
- C104 = 10uF, +3V3 to GND

## 4. EN / BOOT / Reset Circuit

### 4.1 Enable (Reset)

- U1 EN pin -> net ESP_EN
- R101 = 10k, ESP_EN to +3V3 (pull-up)
- C105 = 100nF, ESP_EN to GND
- SW1 RESET pushbutton: ESP_EN to GND (momentary)

### 4.2 Boot Strap

- U1 GPIO0 pin -> net ESP_BOOT
- R102 = 10k, ESP_BOOT to +3V3 (pull-up)
- SW2 BOOT pushbutton: ESP_BOOT to GND (momentary)

### 4.3 Optional Auto-Program Header

If adding USB-UART auto program support:
- 1x6 tag-connect or pin header:
  - +3V3, GND, UART_TX_DBG, UART_RX_DBG, DTR, RTS
- DTR/RTS -> standard ESP auto-program transistor network -> ESP_BOOT/ESP_EN

If not needed, omit DTR/RTS network and keep only SW1/SW2.

## 5. USB-C (Native USB)

### 5.1 USB-C Receptacle

J1 = USB Type-C receptacle (USB2.0)

Connections:
- J1 VBUS -> +5V_USB via F1
- J1 GND -> GND
- J1 SHIELD -> USB_SHIELD
- J1 CC1 -> USB_CC1
- J1 CC2 -> USB_CC2
- J1 D+ pins shorted together -> USB_D+
- J1 D- pins shorted together -> USB_D-

### 5.2 USB-C Sink Signature

- R111 = 5.1k, USB_CC1 to GND
- R112 = 5.1k, USB_CC2 to GND

### 5.3 Input Protection (Recommended)

- F1 = resettable polyfuse, 500mA to 1A hold, between J1 VBUS and +5V_USB
- D111 = TVS 5V, +5V_USB to GND (close to J1)
- U111 = USB ESD array (low capacitance):
  - Protect USB_D+
  - Protect USB_D-
  - Protect CC lines if selected part supports it

### 5.4 USB Data to ESP32

- U1 GPIO20 -> net USB_D+
- U1 GPIO19 -> net USB_D-

Routing rules:
- Keep D+/D- as a tight pair, short and symmetric.
- Avoid stubs and via count mismatch.
- Keep away from switching inductor and motor switching traces.

## 6. Motor Control and I2C Assignment

### 6.1 DRV8213 Motor Control (No I2C)

DRV8213 is controlled by logic inputs, so motor control is GPIO-based.

Assumed topology for 6 valves:
- 6x DRV8213 devices
- Each DRV8213 controls 1 motor (single H-bridge)

Shared motor control nets:
- MOTOR_nSLEEP_ALL (optional shared enable)
- MOTOR_nFAULT_ALL (wired-OR fault back to ESP input, with pull-up)

Per-valve control nets:
- M1_IN1, M1_IN2
- M2_IN1, M2_IN2
- M3_IN1, M3_IN2
- M4_IN1, M4_IN2
- M5_IN1, M5_IN2
- M6_IN1, M6_IN2

Recommended signal conditioning:
- 33R to 100R series resistor near ESP pin on each INx net
- 10k pull-down on each INx net at driver side for known power-up state

Optional current-sense nets:
- M1_IPROPI, M2_IPROPI, M3_IPROPI, M4_IPROPI, M5_IPROPI, M6_IPROPI
- If MCU ADC channels are limited, route IPROPI lines through an analog mux and expose one net to ADC (for example IPROPI_MUX_OUT)

### 6.2 I2C_AUX (Display + Expansion)

- U1 GPIO17 -> I2C_AUX_SCL
- U1 GPIO18 -> I2C_AUX_SDA
- U1 GPIO47 -> PUMP_CTRL

Pull-ups:
- R123 = 3.3k, I2C_AUX_SCL to +3V3
- R124 = 3.3k, I2C_AUX_SDA to +3V3

Display/expansion header (J_AUX_I2C, 1x4):
- Pin 1 GND
- Pin 2 +3V3
- Pin 3 I2C_AUX_SDA
- Pin 4 I2C_AUX_SCL

## 7. Control I/O Mapping (DRV8213 Revision)

Use netlabels only at U1 pins for non-local circuits.

- U1 GPIO1  -> M1_IN1
- U1 GPIO2  -> M1_IN2
- U1 GPIO3  -> M2_IN1
- U1 GPIO4  -> M2_IN2
- U1 GPIO5  -> M3_IN1
- U1 GPIO6  -> M3_IN2
- U1 GPIO7  -> M4_IN1
- U1 GPIO8  -> M4_IN2
- U1 GPIO9  -> M5_IN1
- U1 GPIO10 -> M5_IN2
- U1 GPIO11 -> M6_IN1
- U1 GPIO12 -> M6_IN2
- U1 GPIO13 -> MOTOR_nSLEEP_ALL
- U1 GPIO14 -> MOTOR_nFAULT_ALL
- U1 GPIO15 -> ONEWIRE_BUS
- U1 GPIO16 -> SAFE_IN_1
- U1 GPIO17 -> I2C_AUX_SCL
- U1 GPIO18 -> I2C_AUX_SDA
- U1 GPIO21 -> AUX_OD_OUT
- U1 GPIO43 -> UART_TX_DBG
- U1 GPIO44 -> UART_RX_DBG
- U1 GPIO48 -> WS2812_DATA

Recommended extra I/O use:
- Keep one spare test pad net (for example GPIO47_SPARE) for future expansion

## 8. Suggested External Protection/Conditioning

### 8.1 1-Wire

- R131 = 4.7k, ONEWIRE_BUS to +3V3
- D131 = TVS (optional), ONEWIRE_BUS to GND
- C131 = 100nF from +3V3 to GND near connector

### 8.2 nFAULT and Motor INx Lines

- nFAULT line pull-up on logic side (wired-OR open-drain)
- Optional RC filter on MOTOR_nFAULT_ALL if noise is observed
- Optional series resistor 33R to 100R near ESP pin on each INx line

### 8.3 SAFE_IN_1

- R141 = 10k pull-up to +3V3
- C141 = 100nF to GND
- Optional 1k series into GPIO16
- Optional ESD diode to GND for external connector usage

## 9. Strapping and Pin Safety Notes

- Do not attach heavy external loads to GPIO0, GPIO45, GPIO46.
- Ensure GPIO0 stays high at boot except when BOOT button is pressed.
- Avoid forcing undefined levels on strapping pins during power-up.
- Keep EN RC values as listed to avoid unstable boot.

## 10. Power Topology for WROOM Module

Because WROOM-1-N16R8 is a bare RF module (not dev board):
- Feed U1 directly with +3V3 from board regulator.
- Do not route +5V_USB directly to U1 power pins.
- Keep regulator and decoupling sized for Wi-Fi bursts.

Recommended minimum:
- 3V3 regulator continuous >= 600mA (1A preferred margin)
- Local bulk near U1: 10uF + 1uF + 2x100nF

## 11. EasyEDA NetPort Pin List (Quick Copy)

U1 pins should be labeled with these nets:
- EN          -> ESP_EN
- GPIO0       -> ESP_BOOT
- GPIO19      -> USB_D-
- GPIO20      -> USB_D+
- GPIO1       -> M1_IN1
- GPIO2       -> M1_IN2
- GPIO3       -> M2_IN1
- GPIO4       -> M2_IN2
- GPIO5       -> M3_IN1
- GPIO6       -> M3_IN2
- GPIO7       -> M4_IN1
- GPIO8       -> M4_IN2
- 