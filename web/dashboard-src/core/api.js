// core/api.js

import { beginPendingWrite, endPendingWrite, setEntity, setI2cResult, setLive, addActivity, setDashboardValue } from './store.js';
import { handleMockPost } from './mock.js';
import { key, gkey } from '../utils/keys.js';

const BASE = '/api/hv6/v1';

function isMock() {
  return !!(window.HV6_DASHBOARD_CONFIG && window.HV6_DASHBOARD_CONFIG.mock);
}

export function post(path) {
  beginPendingWrite();

  if (isMock()) {
    try {
      handleMockPost(path);
      return Promise.resolve({ ok: true });
    } finally {
      endPendingWrite();
    }
  }

  return fetch(BASE + path, { method: 'POST' })
    .finally(() => {
      endPendingWrite();
    });
}

export function setSetpoint(zone, value) {
  setEntity(key.setpoint(zone), { value });
  return post('/zones/' + zone + '/setpoint?setpoint_c=' + encodeURIComponent(value));
}

export function setEnabled(zone, enabled) {
  setEntity(key.enabled(zone), { state: enabled ? 'on' : 'off', value: enabled });
  return post('/zones/' + zone + '/enabled?enabled=' + (enabled ? 'true' : 'false'));
}

export function setDriversEnabled(enabled) {
  setEntity(gkey.drivers, { state: enabled ? 'on' : 'off', value: enabled });
  return post('/drivers/enabled?enabled=' + (enabled ? 'true' : 'false'));
}

export function command(name, zone, extraSuffix = '') {
  const suffix = zone ? '&zone=' + zone : '';
  return post('/commands?command=' + encodeURIComponent(name) + suffix + extraSuffix);
}


export function runI2cScan() {
  setI2cResult('Scanning I2C bus...');
  addActivity('I2C scan started');
  return command('i2c_scan');
}

const zoneSelectMap = {
  zone_probe: (zone) => key.probe(zone),
  zone_temp_source: (zone) => key.tempSource(zone),
  zone_sync_to: (zone) => key.syncTo(zone),
  zone_pipe_type: (zone) => key.pipeType(zone)
};

const zoneTextMap = {
  zone_zigbee_device: (zone) => key.zigbee(zone),
  zone_ble_mac: (zone) => key.ble(zone),
  zone_exterior_walls: (zone) => key.exteriorWalls(zone)
};

const zoneNumberMap = {
  zone_area_m2: (zone) => key.area(zone),
  zone_pipe_spacing_mm: (zone) => key.spacing(zone)
};

const globalSelectMap = {
  manifold_type: gkey.manifoldType,
  manifold_flow_probe: gkey.manifoldFlowProbe,
  manifold_return_probe: gkey.manifoldReturnProbe,
  motor_profile_default: gkey.motorProfileDefault
};

const globalNumberMap = {
  close_threshold_multiplier: gkey.closeThresholdMultiplier,
  close_slope_threshold: gkey.closeSlopeThreshold,
  close_slope_current_factor: gkey.closeSlopeCurrentFactor,
  open_threshold_multiplier: gkey.openThresholdMultiplier,
  open_slope_threshold: gkey.openSlopeThreshold,
  open_slope_current_factor: gkey.openSlopeCurrentFactor,
  open_ripple_limit_factor: gkey.openRippleLimitFactor,
  generic_runtime_limit_seconds: gkey.genericRuntimeLimitSeconds,
  hmip_runtime_limit_seconds: gkey.hmipRuntimeLimitSeconds,
  learned_factor_min_samples: gkey.learnedFactorMinSamples,
  learned_factor_max_deviation_pct: gkey.learnedFactorMaxDeviationPct
};

export function setZoneSelect(zone, settingKey, value) {
  const idBuilder = zoneSelectMap[settingKey];
  if (idBuilder) setEntity(idBuilder(zone), { state: value });
  return post('/settings/select?key=' + encodeURIComponent(settingKey) + '&value=' + encodeURIComponent(value) + '&zone=' + zone);
}

export function setZoneText(zone, settingKey, value) {
  const idBuilder = zoneTextMap[settingKey];
  if (idBuilder) setEntity(idBuilder(zone), { state: value });
  return post('/settings/text?key=' + encodeURIComponent(settingKey) + '&value=' + encodeURIComponent(value) + '&zone=' + zone);
}

export function setZoneNumber(zone, settingKey, value) {
  const numeric = Number(value);
  const idBuilder = zoneNumberMap[settingKey];
  if (idBuilder && !Number.isNaN(numeric)) setEntity(idBuilder(zone), { value: numeric });
  return post('/settings/number?key=' + encodeURIComponent(settingKey) + '&value=' + encodeURIComponent(value) + '&zone=' + zone);
}

export function setGlobalSelect(settingKey, value) {
  const id = globalSelectMap[settingKey];
  if (id) setEntity(id, { state: value });
  return post('/settings/select?key=' + encodeURIComponent(settingKey) + '&value=' + encodeURIComponent(value));
}

export function setGlobalNumber(settingKey, value) {
  const numeric = Number(value);
  const id = globalNumberMap[settingKey];
  if (id && !Number.isNaN(numeric)) setEntity(id, { value: numeric });
  return post('/settings/number?key=' + encodeURIComponent(settingKey) + '&value=' + encodeURIComponent(value));
}

export function applyZoneName(zone, value) {
  addActivity('Zone ' + zone + ' renamed to ' + (value || '(blank)'), zone);
}

export function markConnected() {
  setLive(true);
}

// Motor control helpers
export function setMotorTarget(zone, targetPct) {
  const numeric = Number(targetPct);
  if (Number.isNaN(numeric)) return post('/motors/' + zone + '/target?value=' + 0);
  const clamped = Math.max(0, Math.min(100, Math.round(numeric)));
  setEntity(key.motorTarget(zone), { value: clamped });
  addActivity('Motor ' + zone + ' target set to ' + clamped + '%', zone);
  return post('/motors/' + zone + '/target?value=' + clamped);
}

export function openMotorTimed(zone, durationMs = 10000) {
  addActivity('Motor ' + zone + ' open for ' + durationMs + 'ms', zone);
  return command('open_motor_timed', zone, '&duration_ms=' + durationMs);
}

export function closeMotorTimed(zone, durationMs = 10000) {
  addActivity('Motor ' + zone + ' close for ' + durationMs + 'ms', zone);
  return command('close_motor_timed', zone, '&duration_ms=' + durationMs);
}

export function stopMotor(zone) {
  addActivity('Motor ' + zone + ' stopped', zone);
  return command('stop_motor', zone);
}

export function setManualMode(enabled) {
  setDashboardValue('manualMode', !!enabled);
  addActivity(enabled ? 'Manual mode enabled — automatic management paused' : 'Manual mode disabled — automatic management resumed');
  return post('/manual_mode?enabled=' + (enabled ? 'true' : 'false'));
}

// Recovery/reset helpers
export function resetMotorFault(zone) {
  addActivity('Motor ' + zone + ' fault reset', zone);
  return command('motor_reset_fault', zone);
}

export function resetMotorLearnedFactors(zone) {
  addActivity('Motor ' + zone + ' learned factors reset', zone);
  return command('motor_reset_learned_factors', zone);
}

export function resetMotorAndRelearn(zone) {
  addActivity('Motor ' + zone + ' reset and relearn started', zone);
  return command('motor_reset_and_relearn', zone);
}