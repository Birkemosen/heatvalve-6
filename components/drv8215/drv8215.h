#pragma once

#include "esphome/core/component.h"
#include "esphome/components/i2c/i2c.h"

namespace esphome {
namespace drv8215 {

// ============================================================
// DRV8215 Register Map
// ============================================================
static const uint8_t REG_FAULT_STATUS = 0x00;  // R    - Fault status
static const uint8_t REG_CONFIG0      = 0x09;  // RW   - EN_OUT, EN_OVP, EN_STALL, CLR_FLT
static const uint8_t REG_CONFIG3      = 0x0C;  // RW   - IMODE, SMODE, INT_VREF, OCP, TSD
static const uint8_t REG_CONFIG4      = 0x0D;  // RW   - PMODE, I2C_BC, I2C_EN_IN1, I2C_PH_IN2
static const uint8_t REG_RC_CTRL0     = 0x11;  // RW   - CS_GAIN_SEL

// CONFIG4 bit masks (PWM mode + internal bridge control)
static const uint8_t CONFIG4_PMODE   = 0x08;  // bit3 - 1 = PWM mode
static const uint8_t CONFIG4_I2C_BC  = 0x04;  // bit2 - 1 = I2C bits control bridge
static const uint8_t CONFIG4_IN1     = 0x02;  // bit1 - I2C_EN_IN1 (Input1)
static const uint8_t CONFIG4_IN2     = 0x01;  // bit0 - I2C_PH_IN2 (Input2)

// CONFIG4 pre-built values
static const uint8_t CONFIG4_COAST   = CONFIG4_PMODE | CONFIG4_I2C_BC;             // 0x0C
static const uint8_t CONFIG4_FORWARD = CONFIG4_PMODE | CONFIG4_I2C_BC | CONFIG4_IN1;              // 0x0E
static const uint8_t CONFIG4_REVERSE = CONFIG4_PMODE | CONFIG4_I2C_BC | CONFIG4_IN2;              // 0x0D
static const uint8_t CONFIG4_BRAKE   = CONFIG4_PMODE | CONFIG4_I2C_BC | CONFIG4_IN1 | CONFIG4_IN2;  // 0x0F

// CONFIG0 values
static const uint8_t CONFIG0_EN_OUT   = 0x80;
static const uint8_t CONFIG0_EN_OVP   = 0x40;
static const uint8_t CONFIG0_EN_STALL = 0x20;
static const uint8_t CONFIG0_CLR_FLT_BIT = 0x02;
static const uint8_t CONFIG0_ACTIVE   = CONFIG0_EN_OUT | CONFIG0_EN_OVP | CONFIG0_EN_STALL;  // 0xE0
static const uint8_t CONFIG0_CLR_FLT  = CONFIG0_ACTIVE | CONFIG0_CLR_FLT_BIT;                  // 0xE2

// CONFIG3: IMODE=00, SMODE=1, INT_VREF=1, OCP=1, TSD=1
static const uint8_t CONFIG3_DEFAULT = 0x33;

// RC_CTRL0: CS_GAIN_SEL=110b → 5320 µA/A (RIPROPI=5.1kΩ → 27.1 mV/A)
static const uint8_t RC_CTRL0_GAIN_5320 = 0x06;

// FAULT_STATUS bit masks
static const uint8_t FAULT_FAULT = 0x80;  // bit7 - any fault active
static const uint8_t FAULT_STALL = 0x20;  // bit5 - stall detected
static const uint8_t FAULT_OCP   = 0x10;  // bit4 - overcurrent
static const uint8_t FAULT_TSD   = 0x04;  // bit2 - thermal shutdown

struct Drv8215FaultStatus {
  bool fault{false};
  bool stall{false};
  bool ocp{false};
  bool tsd{false};
  uint8_t raw{0};
};

class Drv8215 : public i2c::I2CDevice, public Component {
 public:
  void setup() override {}  // Intentionally empty: init() is called explicitly after nSLEEP is enabled
  void dump_config() override;
  float get_setup_priority() const override { return setup_priority::DATA; }

  void set_motor_num(int num) { motor_num_ = num; }
  int get_motor_num() const { return motor_num_; }

  // -------------------------------------------------------
  // Called explicitly from YAML after nSLEEP is asserted.
  // Returns true on success, false if I2C communication fails.
  // -------------------------------------------------------
  bool init();

  // Motor drive commands
  void motor_coast();    // Coast (free-wheel) — I2C_EN=0
  void motor_forward();  // Forward / valve-open direction
  void motor_reverse();  // Reverse / valve-close direction
  void motor_brake();    // Active brake (both outputs LOW)

  // Fault management
  Drv8215FaultStatus read_fault_status();
  void clear_fault();

  // Low-level register access
  bool write_reg(uint8_t reg, uint8_t value);
  bool read_reg(uint8_t reg, uint8_t &value);

 protected:
  int motor_num_{0};
};

}  // namespace drv8215
}  // namespace esphome
