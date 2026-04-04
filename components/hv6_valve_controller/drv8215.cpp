// =============================================================================
// DRV8215 — Implementation (ESPHome I2C abstraction)
// =============================================================================

#include "drv8215.h"
#include "esphome/core/log.h"

namespace hv6 {

static const char *const TAG = "drv8215";

bool DRV8215::init() {
  ESP_LOGI(TAG, "Motor %d @ 0x%02X: initializing", motor_num_, address_);

  if (!write_reg(drv8215_reg::CONFIG4, drv8215_cfg4::COAST)) {
    ESP_LOGW(TAG, "Motor %d: CONFIG4 write failed", motor_num_);
    return false;
  }
  if (!write_reg(drv8215_reg::CONFIG3, drv8215_cfg3::DEFAULT)) {
    ESP_LOGW(TAG, "Motor %d: CONFIG3 write failed", motor_num_);
    return false;
  }
  if (!write_reg(drv8215_reg::CONFIG0, drv8215_cfg0::ACTIVE)) {
    ESP_LOGW(TAG, "Motor %d: CONFIG0 write failed", motor_num_);
    return false;
  }
  if (!write_reg(drv8215_reg::RC_CTRL0, drv8215_rc::GAIN_5320)) {
    ESP_LOGW(TAG, "Motor %d: RC_CTRL0 write failed", motor_num_);
    return false;
  }

  ESP_LOGI(TAG, "Motor %d @ 0x%02X: init OK", motor_num_, address_);
  return true;
}

void DRV8215::coast() { write_reg(drv8215_reg::CONFIG4, drv8215_cfg4::COAST); }
void DRV8215::forward() { write_reg(drv8215_reg::CONFIG4, drv8215_cfg4::FORWARD); }
void DRV8215::reverse() { write_reg(drv8215_reg::CONFIG4, drv8215_cfg4::REVERSE); }
void DRV8215::brake() { write_reg(drv8215_reg::CONFIG4, drv8215_cfg4::BRAKE); }

DRV8215FaultStatus DRV8215::read_fault() {
  DRV8215FaultStatus status{};
  uint8_t raw = 0;
  if (read_reg(drv8215_reg::FAULT_STATUS, raw)) {
    status.raw = raw;
    status.fault = (raw & drv8215_fault::FAULT) != 0;
    status.stall = (raw & drv8215_fault::STALL) != 0;
    status.ocp = (raw & drv8215_fault::OCP) != 0;
    status.tsd = (raw & drv8215_fault::TSD) != 0;
  }
  return status;
}

void DRV8215::clear_fault() {
  write_reg(drv8215_reg::CONFIG0, drv8215_cfg0::CLR_FLT_CMD);
  write_reg(drv8215_reg::CONFIG0, drv8215_cfg0::ACTIVE);
}

bool DRV8215::write_reg(uint8_t reg, uint8_t value) {
  esphome::i2c::I2CDevice dev;
  dev.set_i2c_bus(bus_);
  dev.set_i2c_address(address_);
  uint8_t buf[2] = {reg, value};
  auto err = dev.write(buf, 2);
  if (err != esphome::i2c::ERROR_OK) {
    ESP_LOGW(TAG, "Motor %d: I2C write 0x%02X=0x%02X failed", motor_num_, reg, value);
    return false;
  }
  return true;
}

bool DRV8215::read_reg(uint8_t reg, uint8_t &value) {
  esphome::i2c::I2CDevice dev;
  dev.set_i2c_bus(bus_);
  dev.set_i2c_address(address_);
  auto err = dev.write(&reg, 1);
  if (err != esphome::i2c::ERROR_OK) {
    ESP_LOGW(TAG, "Motor %d: I2C write-addr 0x%02X failed", motor_num_, reg);
    return false;
  }
  err = dev.read(&value, 1);
  if (err != esphome::i2c::ERROR_OK) {
    ESP_LOGW(TAG, "Motor %d: I2C read 0x%02X failed", motor_num_, reg);
    return false;
  }
  return true;
}

}  // namespace hv6
