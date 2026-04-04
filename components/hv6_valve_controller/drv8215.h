// =============================================================================
// DRV8215 — I2C H-Bridge Motor Driver (ESPHome port)
// =============================================================================
// Low-level driver for TI DRV8215 with PWM mode and I2C bridge control.
// Ported from lib/valve_controller/src/drv8215.h/cpp
// Uses ESPHome I2C abstraction instead of raw ESP-IDF i2c_master_write_to_device.
// =============================================================================

#pragma once

#include "esphome/components/i2c/i2c.h"
#include <cstdint>

namespace hv6 {

// Register addresses
namespace drv8215_reg {
static constexpr uint8_t FAULT_STATUS = 0x00;
static constexpr uint8_t CONFIG0 = 0x09;
static constexpr uint8_t CONFIG3 = 0x0C;
static constexpr uint8_t CONFIG4 = 0x0D;
static constexpr uint8_t RC_CTRL0 = 0x11;
}  // namespace drv8215_reg

// CONFIG4 bit masks
namespace drv8215_cfg4 {
static constexpr uint8_t PMODE = 0x08;
static constexpr uint8_t I2C_BC = 0x04;
static constexpr uint8_t IN1 = 0x02;
static constexpr uint8_t IN2 = 0x01;
static constexpr uint8_t COAST = PMODE | I2C_BC;
static constexpr uint8_t FORWARD = PMODE | I2C_BC | IN1;
static constexpr uint8_t REVERSE = PMODE | I2C_BC | IN2;
static constexpr uint8_t BRAKE = PMODE | I2C_BC | IN1 | IN2;
}  // namespace drv8215_cfg4

namespace drv8215_cfg0 {
static constexpr uint8_t EN_OUT = 0x80;
static constexpr uint8_t EN_OVP = 0x40;
static constexpr uint8_t EN_STALL = 0x20;
static constexpr uint8_t CLR_FLT = 0x02;
// Do NOT enable EN_STALL — DRV8215 stall threshold is ~500mA, far too high
// for small valve motors (~20mA). We detect endstop via current sensing instead.
static constexpr uint8_t ACTIVE = EN_OUT | EN_OVP;
static constexpr uint8_t CLR_FLT_CMD = ACTIVE | CLR_FLT;
}  // namespace drv8215_cfg0

namespace drv8215_cfg3 {
static constexpr uint8_t DEFAULT = 0x33;
}

namespace drv8215_rc {
static constexpr uint8_t GAIN_5320 = 0x06;
}

namespace drv8215_fault {
static constexpr uint8_t FAULT = 0x80;
static constexpr uint8_t STALL = 0x20;
static constexpr uint8_t OCP = 0x10;
static constexpr uint8_t TSD = 0x04;
}  // namespace drv8215_fault

struct DRV8215FaultStatus {
  uint8_t raw = 0;
  bool fault = false;
  bool stall = false;
  bool ocp = false;
  bool tsd = false;
};

class DRV8215 {
 public:
  DRV8215(esphome::i2c::I2CBus *bus, uint8_t address, uint8_t motor_num)
      : bus_(bus), address_(address), motor_num_(motor_num) {}

  bool init();
  void coast();
  void forward();
  void reverse();
  void brake();

  DRV8215FaultStatus read_fault();
  void clear_fault();

  uint8_t address() const { return address_; }
  uint8_t motor_num() const { return motor_num_; }

 protected:
  bool write_reg(uint8_t reg, uint8_t value);
  bool read_reg(uint8_t reg, uint8_t &value);

  esphome::i2c::I2CBus *bus_;
  uint8_t address_;
  uint8_t motor_num_;
};

}  // namespace hv6
