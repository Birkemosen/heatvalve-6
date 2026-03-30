import esphome.codegen as cg
import esphome.config_validation as cv
from esphome.components import web_server_base
from esphome.const import CONF_ID

DEPENDENCIES = ["web_server_base", "network"]
AUTO_LOAD = ["web_server_base", "text"]

CONF_WEB_SERVER_BASE_ID = "web_server_base_id"

from esphome.components import sensor, text_sensor, climate, number, switch, select, cover, text

heatvalve_dashboard_ns = cg.esphome_ns.namespace("heatvalve_dashboard")
HeatvalveDashboard = heatvalve_dashboard_ns.class_("HeatvalveDashboard", cg.Component)

_SCHEMA_DICT = {
        cv.GenerateID(): cv.declare_id(HeatvalveDashboard),
        cv.GenerateID(CONF_WEB_SERVER_BASE_ID): cv.use_id(
            web_server_base.WebServerBase
        ),
        # Zone climates (thermostats)
        cv.Optional("climate_z1_id"): cv.use_id(climate.Climate),
        cv.Optional("climate_z2_id"): cv.use_id(climate.Climate),
        cv.Optional("climate_z3_id"): cv.use_id(climate.Climate),
        cv.Optional("climate_z4_id"): cv.use_id(climate.Climate),
        cv.Optional("climate_z5_id"): cv.use_id(climate.Climate),
        cv.Optional("climate_z6_id"): cv.use_id(climate.Climate),
        # Zone covers (valves)
        cv.Optional("cover_z1_id"): cv.use_id(cover.Cover),
        cv.Optional("cover_z2_id"): cv.use_id(cover.Cover),
        cv.Optional("cover_z3_id"): cv.use_id(cover.Cover),
        cv.Optional("cover_z4_id"): cv.use_id(cover.Cover),
        cv.Optional("cover_z5_id"): cv.use_id(cover.Cover),
        cv.Optional("cover_z6_id"): cv.use_id(cover.Cover),
        # Temperature sensors (room temps)
        cv.Optional("temp_z1_id"): cv.use_id(sensor.Sensor),
        cv.Optional("temp_z2_id"): cv.use_id(sensor.Sensor),
        cv.Optional("temp_z3_id"): cv.use_id(sensor.Sensor),
        cv.Optional("temp_z4_id"): cv.use_id(sensor.Sensor),
        cv.Optional("temp_z5_id"): cv.use_id(sensor.Sensor),
        cv.Optional("temp_z6_id"): cv.use_id(sensor.Sensor),
        # Zone temperature source selects
        cv.Optional("sel_zone_1_source_id"): cv.use_id(select.Select),
        cv.Optional("sel_zone_2_source_id"): cv.use_id(select.Select),
        cv.Optional("sel_zone_3_source_id"): cv.use_id(select.Select),
        cv.Optional("sel_zone_4_source_id"): cv.use_id(select.Select),
        cv.Optional("sel_zone_5_source_id"): cv.use_id(select.Select),
        cv.Optional("sel_zone_6_source_id"): cv.use_id(select.Select),
        # Heating circuit sensors
        cv.Optional("input_temp_id"): cv.use_id(sensor.Sensor),
        cv.Optional("output_temp_id"): cv.use_id(sensor.Sensor),
        cv.Optional("extra_temp_id"): cv.use_id(sensor.Sensor),
        # Status sensors
        cv.Optional("avg_valve_position_id"): cv.use_id(sensor.Sensor),
        cv.Optional("active_zones_id"): cv.use_id(sensor.Sensor),
        cv.Optional("wifi_signal_id"): cv.use_id(sensor.Sensor),
        # Text sensors
        cv.Optional("controller_mode_id"): cv.use_id(text_sensor.TextSensor),
        cv.Optional("system_status_id"): cv.use_id(text_sensor.TextSensor),
        cv.Optional("uptime_id"): cv.use_id(text_sensor.TextSensor),
        # Switches
        cv.Optional("sw_balancing_id"): cv.use_id(switch.Switch),
        cv.Optional("sw_standalone_id"): cv.use_id(switch.Switch),
        cv.Optional("sw_display_id"): cv.use_id(switch.Switch),
        cv.Optional("sw_ecodan_coordinator_id"): cv.use_id(switch.Switch),
        # Zone enable switches
        cv.Optional("sw_zone_1_enabled_id"): cv.use_id(switch.Switch),
        cv.Optional("sw_zone_2_enabled_id"): cv.use_id(switch.Switch),
        cv.Optional("sw_zone_3_enabled_id"): cv.use_id(switch.Switch),
        cv.Optional("sw_zone_4_enabled_id"): cv.use_id(switch.Switch),
        cv.Optional("sw_zone_5_enabled_id"): cv.use_id(switch.Switch),
        cv.Optional("sw_zone_6_enabled_id"): cv.use_id(switch.Switch),
        # Numbers (settings)
        cv.Optional("num_min_valve_opening_id"): cv.use_id(number.Number),
        cv.Optional("num_comfort_band_id"): cv.use_id(number.Number),
        cv.Optional("num_maintenance_base_id"): cv.use_id(number.Number),
        cv.Optional("num_demand_boost_id"): cv.use_id(number.Number),
        cv.Optional("num_boost_factor_id"): cv.use_id(number.Number),
        cv.Optional("num_min_movement_id"): cv.use_id(number.Number),
        # Asgard integration
        cv.Optional("num_asgard_reference_setpoint_id"): cv.use_id(number.Number),
        cv.Optional("text_asgard_host_id"): cv.use_id(text.Text),
        # Helios/Threyr integration (optional)
        cv.Optional("helios_status_id"): cv.use_id(text_sensor.TextSensor),
        # Zone numbers
        cv.Optional("num_zone_1_area_id"): cv.use_id(number.Number),
        cv.Optional("num_zone_2_area_id"): cv.use_id(number.Number),
        cv.Optional("num_zone_3_area_id"): cv.use_id(number.Number),
        cv.Optional("num_zone_4_area_id"): cv.use_id(number.Number),
        cv.Optional("num_zone_5_area_id"): cv.use_id(number.Number),
        cv.Optional("num_zone_6_area_id"): cv.use_id(number.Number),
        cv.Optional("num_zone_1_max_opening_id"): cv.use_id(number.Number),
        cv.Optional("num_zone_2_max_opening_id"): cv.use_id(number.Number),
        cv.Optional("num_zone_3_max_opening_id"): cv.use_id(number.Number),
        cv.Optional("num_zone_4_max_opening_id"): cv.use_id(number.Number),
        cv.Optional("num_zone_5_max_opening_id"): cv.use_id(number.Number),
        cv.Optional("num_zone_6_max_opening_id"): cv.use_id(number.Number),
        # Zone pipe type selects
        cv.Optional("sel_zone_1_pipe_type_id"): cv.use_id(select.Select),
        cv.Optional("sel_zone_2_pipe_type_id"): cv.use_id(select.Select),
        cv.Optional("sel_zone_3_pipe_type_id"): cv.use_id(select.Select),
        cv.Optional("sel_zone_4_pipe_type_id"): cv.use_id(select.Select),
        cv.Optional("sel_zone_5_pipe_type_id"): cv.use_id(select.Select),
        cv.Optional("sel_zone_6_pipe_type_id"): cv.use_id(select.Select),
        # Zone floor type selects
        cv.Optional("sel_zone_1_floor_type_id"): cv.use_id(select.Select),
        cv.Optional("sel_zone_2_floor_type_id"): cv.use_id(select.Select),
        cv.Optional("sel_zone_3_floor_type_id"): cv.use_id(select.Select),
        cv.Optional("sel_zone_4_floor_type_id"): cv.use_id(select.Select),
        cv.Optional("sel_zone_5_floor_type_id"): cv.use_id(select.Select),
        cv.Optional("sel_zone_6_floor_type_id"): cv.use_id(select.Select),
        # Zone pipe spacing numbers
        cv.Optional("num_zone_1_pipe_spacing_id"): cv.use_id(number.Number),
        cv.Optional("num_zone_2_pipe_spacing_id"): cv.use_id(number.Number),
        cv.Optional("num_zone_3_pipe_spacing_id"): cv.use_id(number.Number),
        cv.Optional("num_zone_4_pipe_spacing_id"): cv.use_id(number.Number),
        cv.Optional("num_zone_5_pipe_spacing_id"): cv.use_id(number.Number),
        cv.Optional("num_zone_6_pipe_spacing_id"): cv.use_id(number.Number),
        # Zone floor cover thickness numbers
        cv.Optional("num_zone_1_floor_cover_thickness_id"): cv.use_id(number.Number),
        cv.Optional("num_zone_2_floor_cover_thickness_id"): cv.use_id(number.Number),
        cv.Optional("num_zone_3_floor_cover_thickness_id"): cv.use_id(number.Number),
        cv.Optional("num_zone_4_floor_cover_thickness_id"): cv.use_id(number.Number),
        cv.Optional("num_zone_5_floor_cover_thickness_id"): cv.use_id(number.Number),
        cv.Optional("num_zone_6_floor_cover_thickness_id"): cv.use_id(number.Number),
        # Zone control profile selects (adaptive control)
        cv.Optional("sel_zone_1_profile_id"): cv.use_id(select.Select),
        cv.Optional("sel_zone_2_profile_id"): cv.use_id(select.Select),
        cv.Optional("sel_zone_3_profile_id"): cv.use_id(select.Select),
        cv.Optional("sel_zone_4_profile_id"): cv.use_id(select.Select),
        cv.Optional("sel_zone_5_profile_id"): cv.use_id(select.Select),
        cv.Optional("sel_zone_6_profile_id"): cv.use_id(select.Select),
        # Zone link group selects
        cv.Optional("sel_zone_1_link_group_id"): cv.use_id(select.Select),
        cv.Optional("sel_zone_2_link_group_id"): cv.use_id(select.Select),
        cv.Optional("sel_zone_3_link_group_id"): cv.use_id(select.Select),
        cv.Optional("sel_zone_4_link_group_id"): cv.use_id(select.Select),
        cv.Optional("sel_zone_5_link_group_id"): cv.use_id(select.Select),
        cv.Optional("sel_zone_6_link_group_id"): cv.use_id(select.Select),
        # Zone BLE MAC text entities
        cv.Optional("text_zone_1_ble_mac_id"): cv.use_id(text.Text),
        cv.Optional("text_zone_2_ble_mac_id"): cv.use_id(text.Text),
        cv.Optional("text_zone_3_ble_mac_id"): cv.use_id(text.Text),
        cv.Optional("text_zone_4_ble_mac_id"): cv.use_id(text.Text),
        cv.Optional("text_zone_5_ble_mac_id"): cv.use_id(text.Text),
        cv.Optional("text_zone_6_ble_mac_id"): cv.use_id(text.Text),
        # BLE scan results text sensor
        cv.Optional("ble_scan_results_id"): cv.use_id(text_sensor.TextSensor),
    }
CONFIG_SCHEMA = cv.Schema(_SCHEMA_DICT).extend(cv.COMPONENT_SCHEMA)


async def _wire(config, var, conf_key, setter):
    if conf_key in config:
        ent = await cg.get_variable(config[conf_key])
        cg.add(getattr(var, setter)(ent))


async def to_code(config):
    var = cg.new_Pvariable(config[CONF_ID])
    await cg.register_component(var, config)

    wsb = await cg.get_variable(config[CONF_WEB_SERVER_BASE_ID])
    cg.add(var.set_web_server_base(wsb))

    pairs = [
        # Climates
        ("climate_z1_id", "set_climate_z1"),
        ("climate_z2_id", "set_climate_z2"),
        ("climate_z3_id", "set_climate_z3"),
        ("climate_z4_id", "set_climate_z4"),
        ("climate_z5_id", "set_climate_z5"),
        ("climate_z6_id", "set_climate_z6"),
        # Covers
        ("cover_z1_id", "set_cover_z1"),
        ("cover_z2_id", "set_cover_z2"),
        ("cover_z3_id", "set_cover_z3"),
        ("cover_z4_id", "set_cover_z4"),
        ("cover_z5_id", "set_cover_z5"),
        ("cover_z6_id", "set_cover_z6"),
        # Temperature sensors
        ("temp_z1_id", "set_temp_z1"),
        ("temp_z2_id", "set_temp_z2"),
        ("temp_z3_id", "set_temp_z3"),
        ("temp_z4_id", "set_temp_z4"),
        ("temp_z5_id", "set_temp_z5"),
        ("temp_z6_id", "set_temp_z6"),
        # Zone temperature source selects
        ("sel_zone_1_source_id", "set_sel_zone_1_source"),
        ("sel_zone_2_source_id", "set_sel_zone_2_source"),
        ("sel_zone_3_source_id", "set_sel_zone_3_source"),
        ("sel_zone_4_source_id", "set_sel_zone_4_source"),
        ("sel_zone_5_source_id", "set_sel_zone_5_source"),
        ("sel_zone_6_source_id", "set_sel_zone_6_source"),
        # Heating circuit
        ("input_temp_id", "set_input_temp"),
        ("output_temp_id", "set_output_temp"),
        ("extra_temp_id", "set_extra_temp"),
        # Status
        ("avg_valve_position_id", "set_avg_valve_position"),
        ("active_zones_id", "set_active_zones"),
        ("wifi_signal_id", "set_wifi_signal"),
        # Text sensors
        ("controller_mode_id", "set_controller_mode"),
        ("system_status_id", "set_system_status"),
        ("uptime_id", "set_uptime"),
        # Switches
        ("sw_balancing_id", "set_sw_balancing"),
        ("sw_standalone_id", "set_sw_standalone"),
        ("sw_display_id", "set_sw_display"),
        ("sw_ecodan_coordinator_id", "set_sw_ecodan_coordinator"),
        # Zone enable switches
        ("sw_zone_1_enabled_id", "set_sw_zone_1_enabled"),
        ("sw_zone_2_enabled_id", "set_sw_zone_2_enabled"),
        ("sw_zone_3_enabled_id", "set_sw_zone_3_enabled"),
        ("sw_zone_4_enabled_id", "set_sw_zone_4_enabled"),
        ("sw_zone_5_enabled_id", "set_sw_zone_5_enabled"),
        ("sw_zone_6_enabled_id", "set_sw_zone_6_enabled"),
        # Numbers
        ("num_min_valve_opening_id", "set_num_min_valve_opening"),
        ("num_comfort_band_id", "set_num_comfort_band"),
        ("num_maintenance_base_id", "set_num_maintenance_base"),
        ("num_demand_boost_id", "set_num_demand_boost"),
        ("num_boost_factor_id", "set_num_boost_factor"),
        ("num_min_movement_id", "set_num_min_movement"),
        # Asgard integration
        ("num_asgard_reference_setpoint_id", "set_num_asgard_reference_setpoint"),
        ("text_asgard_host_id", "set_text_asgard_host"),
        # Helios/Threyr integration (optional)
        ("helios_status_id", "set_helios_status"),
        # Zone numbers
        ("num_zone_1_area_id", "set_num_zone_1_area"),
        ("num_zone_2_area_id", "set_num_zone_2_area"),
        ("num_zone_3_area_id", "set_num_zone_3_area"),
        ("num_zone_4_area_id", "set_num_zone_4_area"),
        ("num_zone_5_area_id", "set_num_zone_5_area"),
        ("num_zone_6_area_id", "set_num_zone_6_area"),
        ("num_zone_1_max_opening_id", "set_num_zone_1_max_opening"),
        ("num_zone_2_max_opening_id", "set_num_zone_2_max_opening"),
        ("num_zone_3_max_opening_id", "set_num_zone_3_max_opening"),
        ("num_zone_4_max_opening_id", "set_num_zone_4_max_opening"),
        ("num_zone_5_max_opening_id", "set_num_zone_5_max_opening"),
        ("num_zone_6_max_opening_id", "set_num_zone_6_max_opening"),
        # Zone pipe type selects
        ("sel_zone_1_pipe_type_id", "set_sel_zone_1_pipe_type"),
        ("sel_zone_2_pipe_type_id", "set_sel_zone_2_pipe_type"),
        ("sel_zone_3_pipe_type_id", "set_sel_zone_3_pipe_type"),
        ("sel_zone_4_pipe_type_id", "set_sel_zone_4_pipe_type"),
        ("sel_zone_5_pipe_type_id", "set_sel_zone_5_pipe_type"),
        ("sel_zone_6_pipe_type_id", "set_sel_zone_6_pipe_type"),
        # Zone floor type selects
        ("sel_zone_1_floor_type_id", "set_sel_zone_1_floor_type"),
        ("sel_zone_2_floor_type_id", "set_sel_zone_2_floor_type"),
        ("sel_zone_3_floor_type_id", "set_sel_zone_3_floor_type"),
        ("sel_zone_4_floor_type_id", "set_sel_zone_4_floor_type"),
        ("sel_zone_5_floor_type_id", "set_sel_zone_5_floor_type"),
        ("sel_zone_6_floor_type_id", "set_sel_zone_6_floor_type"),
        # Zone pipe spacing numbers
        ("num_zone_1_pipe_spacing_id", "set_num_zone_1_pipe_spacing"),
        ("num_zone_2_pipe_spacing_id", "set_num_zone_2_pipe_spacing"),
        ("num_zone_3_pipe_spacing_id", "set_num_zone_3_pipe_spacing"),
        ("num_zone_4_pipe_spacing_id", "set_num_zone_4_pipe_spacing"),
        ("num_zone_5_pipe_spacing_id", "set_num_zone_5_pipe_spacing"),
        ("num_zone_6_pipe_spacing_id", "set_num_zone_6_pipe_spacing"),
        # Zone floor cover thickness numbers
        ("num_zone_1_floor_cover_thickness_id", "set_num_zone_1_floor_cover_thickness"),
        ("num_zone_2_floor_cover_thickness_id", "set_num_zone_2_floor_cover_thickness"),
        ("num_zone_3_floor_cover_thickness_id", "set_num_zone_3_floor_cover_thickness"),
        ("num_zone_4_floor_cover_thickness_id", "set_num_zone_4_floor_cover_thickness"),
        ("num_zone_5_floor_cover_thickness_id", "set_num_zone_5_floor_cover_thickness"),
        ("num_zone_6_floor_cover_thickness_id", "set_num_zone_6_floor_cover_thickness"),
        # Zone control profile selects
        ("sel_zone_1_profile_id", "set_sel_zone_1_profile"),
        ("sel_zone_2_profile_id", "set_sel_zone_2_profile"),
        ("sel_zone_3_profile_id", "set_sel_zone_3_profile"),
        ("sel_zone_4_profile_id", "set_sel_zone_4_profile"),
        ("sel_zone_5_profile_id", "set_sel_zone_5_profile"),
        ("sel_zone_6_profile_id", "set_sel_zone_6_profile"),
        # Zone link group selects
        ("sel_zone_1_link_group_id", "set_sel_zone_1_link_group"),
        ("sel_zone_2_link_group_id", "set_sel_zone_2_link_group"),
        ("sel_zone_3_link_group_id", "set_sel_zone_3_link_group"),
        ("sel_zone_4_link_group_id", "set_sel_zone_4_link_group"),
        ("sel_zone_5_link_group_id", "set_sel_zone_5_link_group"),
        ("sel_zone_6_link_group_id", "set_sel_zone_6_link_group"),
        # Zone BLE MAC text entities
        ("text_zone_1_ble_mac_id", "set_text_zone_1_ble_mac"),
        ("text_zone_2_ble_mac_id", "set_text_zone_2_ble_mac"),
        ("text_zone_3_ble_mac_id", "set_text_zone_3_ble_mac"),
        ("text_zone_4_ble_mac_id", "set_text_zone_4_ble_mac"),
        ("text_zone_5_ble_mac_id", "set_text_zone_5_ble_mac"),
        ("text_zone_6_ble_mac_id", "set_text_zone_6_ble_mac"),
        # BLE scan results
        ("ble_scan_results_id", "set_ble_scan_results"),
    ]

    for conf_key, setter in pairs:
        await _wire(config, var, conf_key, setter)
