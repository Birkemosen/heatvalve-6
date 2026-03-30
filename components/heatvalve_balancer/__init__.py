"""HeatValve-6 Hydraulic Balancer Component.

Free hydraulic balancing for underfloor heating zones.
Computes per-zone hydraulic factors based on pipe lengths,
pipe types, floor types, and floor cover thickness, then
writes them to per-zone globals for use by zone control scripts.

Copyright (c) 2026 Birkemosen. All rights reserved.
"""

import esphome.codegen as cg
import esphome.config_validation as cv
from esphome.components import climate, number, select
from esphome.const import CONF_ID

DEPENDENCIES = []
AUTO_LOAD = []

heatvalve_balancer_ns = cg.esphome_ns.namespace("heatvalve_balancer")
HeatvalveBalancer = heatvalve_balancer_ns.class_(
    "HeatvalveBalancer", cg.PollingComponent
)
HeatingProfile = heatvalve_balancer_ns.enum("HeatingProfile", is_class=True)

# Globals type for float outputs
globals_ns = cg.esphome_ns.namespace("globals")
GlobalsComponent = globals_ns.class_("GlobalsComponent", cg.Component)

HEATING_PROFILES = {
    "boiler": HeatingProfile.enum("BOILER"),
    "heat_pump": HeatingProfile.enum("HEAT_PUMP"),
    "district_heating": HeatingProfile.enum("DISTRICT_HEATING"),
}

CONFIG_SCHEMA = cv.Schema(
    {
        cv.GenerateID(): cv.declare_id(HeatvalveBalancer),
        # Heating profile
        cv.Optional("heating_profile", default="boiler"): cv.enum(
            HEATING_PROFILES, lower=True
        ),
        # Zone climates
        cv.Optional("climate_z1_id"): cv.use_id(climate.Climate),
        cv.Optional("climate_z2_id"): cv.use_id(climate.Climate),
        cv.Optional("climate_z3_id"): cv.use_id(climate.Climate),
        cv.Optional("climate_z4_id"): cv.use_id(climate.Climate),
        cv.Optional("climate_z5_id"): cv.use_id(climate.Climate),
        cv.Optional("climate_z6_id"): cv.use_id(climate.Climate),
        # Settings numbers
        cv.Required("comfort_band_id"): cv.use_id(number.Number),
        cv.Required("maintenance_base_id"): cv.use_id(number.Number),
        # Per-zone area numbers
        cv.Optional("zone_1_area_id"): cv.use_id(number.Number),
        cv.Optional("zone_2_area_id"): cv.use_id(number.Number),
        cv.Optional("zone_3_area_id"): cv.use_id(number.Number),
        cv.Optional("zone_4_area_id"): cv.use_id(number.Number),
        cv.Optional("zone_5_area_id"): cv.use_id(number.Number),
        cv.Optional("zone_6_area_id"): cv.use_id(number.Number),
        # Per-zone pipe spacing numbers
        cv.Optional("zone_1_pipe_spacing_id"): cv.use_id(number.Number),
        cv.Optional("zone_2_pipe_spacing_id"): cv.use_id(number.Number),
        cv.Optional("zone_3_pipe_spacing_id"): cv.use_id(number.Number),
        cv.Optional("zone_4_pipe_spacing_id"): cv.use_id(number.Number),
        cv.Optional("zone_5_pipe_spacing_id"): cv.use_id(number.Number),
        cv.Optional("zone_6_pipe_spacing_id"): cv.use_id(number.Number),
        # Per-zone pipe type selects
        cv.Optional("zone_1_pipe_type_id"): cv.use_id(select.Select),
        cv.Optional("zone_2_pipe_type_id"): cv.use_id(select.Select),
        cv.Optional("zone_3_pipe_type_id"): cv.use_id(select.Select),
        cv.Optional("zone_4_pipe_type_id"): cv.use_id(select.Select),
        cv.Optional("zone_5_pipe_type_id"): cv.use_id(select.Select),
        cv.Optional("zone_6_pipe_type_id"): cv.use_id(select.Select),
        # Per-zone floor type selects
        cv.Optional("zone_1_floor_type_id"): cv.use_id(select.Select),
        cv.Optional("zone_2_floor_type_id"): cv.use_id(select.Select),
        cv.Optional("zone_3_floor_type_id"): cv.use_id(select.Select),
        cv.Optional("zone_4_floor_type_id"): cv.use_id(select.Select),
        cv.Optional("zone_5_floor_type_id"): cv.use_id(select.Select),
        cv.Optional("zone_6_floor_type_id"): cv.use_id(select.Select),
        # Per-zone floor cover thickness numbers
        cv.Optional("zone_1_floor_cover_thickness_id"): cv.use_id(number.Number),
        cv.Optional("zone_2_floor_cover_thickness_id"): cv.use_id(number.Number),
        cv.Optional("zone_3_floor_cover_thickness_id"): cv.use_id(number.Number),
        cv.Optional("zone_4_floor_cover_thickness_id"): cv.use_id(number.Number),
        cv.Optional("zone_5_floor_cover_thickness_id"): cv.use_id(number.Number),
        cv.Optional("zone_6_floor_cover_thickness_id"): cv.use_id(number.Number),
        # Per-zone hydraulic factor output globals
        cv.Optional("hyd_factor_z1_id"): cv.use_id(GlobalsComponent),
        cv.Optional("hyd_factor_z2_id"): cv.use_id(GlobalsComponent),
        cv.Optional("hyd_factor_z3_id"): cv.use_id(GlobalsComponent),
        cv.Optional("hyd_factor_z4_id"): cv.use_id(GlobalsComponent),
        cv.Optional("hyd_factor_z5_id"): cv.use_id(GlobalsComponent),
        cv.Optional("hyd_factor_z6_id"): cv.use_id(GlobalsComponent),
    }
).extend(cv.polling_component_schema("5min"))


async def _wire(config, var, conf_key, setter):
    """Wire a config entity reference to a C++ setter."""
    if conf_key in config:
        ent = await cg.get_variable(config[conf_key])
        cg.add(getattr(var, setter)(ent))


async def to_code(config):
    var = cg.new_Pvariable(config[CONF_ID])
    await cg.register_component(var, config)

    cg.add(var.set_heating_profile(config["heating_profile"]))

    pairs = [
        # Climates
        ("climate_z1_id", "set_climate_z1"),
        ("climate_z2_id", "set_climate_z2"),
        ("climate_z3_id", "set_climate_z3"),
        ("climate_z4_id", "set_climate_z4"),
        ("climate_z5_id", "set_climate_z5"),
        ("climate_z6_id", "set_climate_z6"),
        # Settings
        ("comfort_band_id", "set_comfort_band"),
        ("maintenance_base_id", "set_maintenance_base"),
        # Per-zone areas
        ("zone_1_area_id", "set_zone_1_area"),
        ("zone_2_area_id", "set_zone_2_area"),
        ("zone_3_area_id", "set_zone_3_area"),
        ("zone_4_area_id", "set_zone_4_area"),
        ("zone_5_area_id", "set_zone_5_area"),
        ("zone_6_area_id", "set_zone_6_area"),
        # Per-zone pipe spacings
        ("zone_1_pipe_spacing_id", "set_zone_1_pipe_spacing"),
        ("zone_2_pipe_spacing_id", "set_zone_2_pipe_spacing"),
        ("zone_3_pipe_spacing_id", "set_zone_3_pipe_spacing"),
        ("zone_4_pipe_spacing_id", "set_zone_4_pipe_spacing"),
        ("zone_5_pipe_spacing_id", "set_zone_5_pipe_spacing"),
        ("zone_6_pipe_spacing_id", "set_zone_6_pipe_spacing"),
        # Per-zone pipe types
        ("zone_1_pipe_type_id", "set_zone_1_pipe_type"),
        ("zone_2_pipe_type_id", "set_zone_2_pipe_type"),
        ("zone_3_pipe_type_id", "set_zone_3_pipe_type"),
        ("zone_4_pipe_type_id", "set_zone_4_pipe_type"),
        ("zone_5_pipe_type_id", "set_zone_5_pipe_type"),
        ("zone_6_pipe_type_id", "set_zone_6_pipe_type"),
        # Per-zone floor types
        ("zone_1_floor_type_id", "set_zone_1_floor_type"),
        ("zone_2_floor_type_id", "set_zone_2_floor_type"),
        ("zone_3_floor_type_id", "set_zone_3_floor_type"),
        ("zone_4_floor_type_id", "set_zone_4_floor_type"),
        ("zone_5_floor_type_id", "set_zone_5_floor_type"),
        ("zone_6_floor_type_id", "set_zone_6_floor_type"),
        # Per-zone floor cover thicknesses
        ("zone_1_floor_cover_thickness_id", "set_zone_1_floor_cover_thickness"),
        ("zone_2_floor_cover_thickness_id", "set_zone_2_floor_cover_thickness"),
        ("zone_3_floor_cover_thickness_id", "set_zone_3_floor_cover_thickness"),
        ("zone_4_floor_cover_thickness_id", "set_zone_4_floor_cover_thickness"),
        ("zone_5_floor_cover_thickness_id", "set_zone_5_floor_cover_thickness"),
        ("zone_6_floor_cover_thickness_id", "set_zone_6_floor_cover_thickness"),
        # Hydraulic factor output globals
        ("hyd_factor_z1_id", "set_hyd_factor_z1_global"),
        ("hyd_factor_z2_id", "set_hyd_factor_z2_global"),
        ("hyd_factor_z3_id", "set_hyd_factor_z3_global"),
        ("hyd_factor_z4_id", "set_hyd_factor_z4_global"),
        ("hyd_factor_z5_id", "set_hyd_factor_z5_global"),
        ("hyd_factor_z6_id", "set_hyd_factor_z6_global"),
    ]

    for conf_key, setter in pairs:
        await _wire(config, var, conf_key, setter)
