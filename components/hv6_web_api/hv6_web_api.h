// =============================================================================
// HV6 Web API — ESPHome Component Header
// =============================================================================
// Dedicated HTTP API/dashboard entrypoint scaffold.
// Endpoint registration and request handling will be added incrementally.
// =============================================================================

#pragma once

#include "esphome/core/component.h"
#include "esphome/core/progmem.h"
#include "esphome/components/web_server_base/web_server_base.h"
#include "../hv6_config_store/hv6_config_store.h"
#include "../hv6_valve_controller/hv6_valve_controller.h"
#include "../hv6_zone_controller/hv6_zone_controller.h"
#include "esp_http_server.h"

#ifdef HV6_HAS_DASHBOARD
extern const uint8_t HV6_DASHBOARD_JS_DATA[] PROGMEM;
extern const size_t HV6_DASHBOARD_JS_SIZE;
extern const uint8_t HV6_DASHBOARD_CSS_DATA[] PROGMEM;
extern const size_t HV6_DASHBOARD_CSS_SIZE;
#endif

namespace hv6 {

class Hv6WebApi : public esphome::Component, public AsyncWebHandler {
 public:
  float get_setup_priority() const override { return 19.0f; }  // AFTER_LATE — runs after web_server_base
  void setup() override;
  void dump_config() override;

  void set_config_store(Hv6ConfigStore *store) { config_store_ = store; }
  void set_valve_controller(Hv6ValveController *ctrl) { valve_controller_ = ctrl; }
  void set_zone_controller(Hv6ZoneController *ctrl) { zone_controller_ = ctrl; }

  // AsyncWebHandler interface — serves /api/hv6/v1/* and /dashboard* on port 80
  bool canHandle(AsyncWebServerRequest *request) const override;
  void handleRequest(AsyncWebServerRequest *request) override;
  bool isRequestHandlerTrivial() const override { return false; }

 protected:
  static esp_err_t overview_handler_(httpd_req_t *req);
  static esp_err_t zones_handler_(httpd_req_t *req);
  static esp_err_t zone_setpoint_handler_(httpd_req_t *req);
  static esp_err_t zone_enabled_handler_(httpd_req_t *req);
  static esp_err_t commands_handler_(httpd_req_t *req);
  static esp_err_t motor_target_handler_(httpd_req_t *req);
  static esp_err_t motor_open_handler_(httpd_req_t *req);
  static esp_err_t motor_open_timed_handler_(httpd_req_t *req);
  static esp_err_t motor_close_handler_(httpd_req_t *req);
  static esp_err_t motor_close_timed_handler_(httpd_req_t *req);
  static esp_err_t motor_stop_handler_(httpd_req_t *req);
  static esp_err_t drivers_enabled_handler_(httpd_req_t *req);
  static esp_err_t auto_learn_handler_(httpd_req_t *req);
  static esp_err_t settings_select_handler_(httpd_req_t *req);
  static esp_err_t settings_number_handler_(httpd_req_t *req);
  static esp_err_t settings_text_handler_(httpd_req_t *req);
  static esp_err_t manual_mode_handler_(httpd_req_t *req);
  static esp_err_t options_handler_(httpd_req_t *req);
  #ifdef HV6_HAS_DASHBOARD
    static esp_err_t dashboard_handler_(httpd_req_t *req);
    static esp_err_t dashboard_js_handler_(httpd_req_t *req);
    static esp_err_t dashboard_css_handler_(httpd_req_t *req);
  #endif

  Hv6ConfigStore *config_store_{nullptr};
  Hv6ValveController *valve_controller_{nullptr};
  Hv6ZoneController *zone_controller_{nullptr};
};

}  // namespace hv6
