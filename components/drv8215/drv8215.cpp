#include "drv8215.h"
#include "esphome/core/log.h"

namespace esphome {
namespace drv8215 {

static const char *TAG = "drv8215";

void Drv8215::dump_config() {
  ESP_LOGCONFIG(TAG, "DRV8215 Motor %d (I2C 0x%02X)", motor_num_, this->address_);
  LOG_I2C_DEVICE(this);
  if (this->is_failed()) {
    ESP_LOGCONFIG(TAG, "  Communication FAILED");
  }
}

bool Drv8215::init() {
  ESP_LOGI(TAG, "Motor %d @ 0x%02X: initializing", motor_num_, this->address_);

  // CONFIG4: PMODE=1, I2C_BC=1, IN1=0, IN2=0 -> coast on entry
  if (!write_reg(REG_CONFIG4, CONFIG4_COAST)) {
    ESP_LOGW(TAG, "Motor %d @ 0x%02X: CONFIG4 write failed", motor_num_, this->address_);
    return false;
  }

  // CONFIG3: no current regulation, report stall, internal 500 mV ref, auto-retry OCP/TSD
  if (!write_reg(REG_CONFIG3, CONFIG3_DEFAULT)) {
    ESP_LOGW(TAG, "Motor %d @ 0x%02X: CONFIG3 write failed", motor_num_, this->address_);
    return false;
  }

  // CONFIG0: enable outputs + OVP + hardware stall detection
  if (!write_reg(REG_CONFIG0, CONFIG0_ACTIVE)) {
    ESP_LOGW(TAG, "Motor %d @ 0x%02X: CONFIG0 write failed", motor_num_, this->address_);
    return false;
  }

  // RC_CTRL0: current-sense gain 5320 µA/A (covers 10–60 mA range via 5.1 kΩ RIPROPI)
  if (!write_reg(REG_RC_CTRL0, RC_CTRL0_GAIN_5320)) {
    ESP_LOGW(TAG, "Motor %d @ 0x%02X: RC_CTRL0 write failed", motor_num_, this->address_);
    return false;
  }

  ESP_LOGI(TAG, "Motor %d @ 0x%02X: init OK", motor_num_, this->address_);
  return true;
}

void Drv8215::motor_coast() {
  write_reg(REG_CONFIG4, CONFIG4_COAST);
}

void Drv8215::motor_forward() {
  write_reg(REG_CONFIG4, CONFIG4_FORWARD);
}

void Drv8215::motor_reverse() {
  write_reg(REG_CONFIG4, CONFIG4_REVERSE);
}

void Drv8215::motor_brake() {
  write_reg(REG_CONFIG4, CONFIG4_BRAKE);
}

Drv8215FaultStatus Drv8215::read_fault_status() {
  Drv8215FaultStatus status{};
  uint8_t raw = 0;
  if (read_reg(REG_FAULT_STATUS, raw)) {
    status.raw   = raw;
    status.fault = (raw & FAULT_FAULT) != 0;
    status.stall = (raw & FAULT_STALL) != 0;
    status.ocp   = (raw & FAULT_OCP)   != 0;
    status.tsd   = (raw & FAULT_TSD)   != 0;
  }
  return status;
}

void Drv8215::clear_fault() {
  write_reg(REG_CONFIG0, CONFIG0_CLR_FLT);  // CLR_FLT=1 (self-clearing command)
  write_reg(REG_CONFIG0, CONFIG0_ACTIVE);   // Keep outputs + protections enabled
}

bool Drv8215::write_reg(uint8_t reg, uint8_t value) {
  uint8_t buf[2] = {reg, value};
  return this->write(buf, 2) == i2c::ERROR_OK;
}

bool Drv8215::read_reg(uint8_t reg, uint8_t &value) {
  if (this->write(&reg, 1) != i2c::ERROR_OK) return false;
  return this->read(&value, 1) == i2c::ERROR_OK;
}

}  // namespace drv8215
}  // namespace esphome
