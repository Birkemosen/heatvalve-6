// core/api.js

import { beginPendingWrite, endPendingWrite, setEntity, setI2cResult, setLive, addActivity, setDashboardValue, setZoneStateHistory } from './store.js';
import { handleMockPost } from './mock.js';
import { key, gkey } from '../utils/keys.js';

const BASE = '/dashboard';

function isMock() {
  return !!(window.HV6_DASHBOARD_CONFIG && window.HV6_DASHBOARD_CONFIG.mock);
}

// Unified POST to /dashboard/set with JSON body {key, value, zone?}
export function postSet(body) {
  beginPendingWrite();

  if (isMock()) {
    try {
      handleMockPost(body);
      return Promise.resolve({ ok: true });
    } finally {
      endPendingWrite();
    }
  }

  return fetch(BASE + '/set', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: (() => {
      const params = new URLSearchParams();
      for (const [k, v] of Object.entries(body)) {
        if (v !== undefined && v !== null) params.append(k, v);
      }
      return params.toString();
    })()
  }).finally(() => {
    endPendingWrite();
  });
}

export function setSetpoint(zone, value) {
  setEntity(key.setpoint(zone), { value });
  return postSet({ key: 'zone_setpoint', value, zone });
}

export function setEnabled(zone, enabled) {
  setEntity(key.enabled(zone), { state: enabled ? 'on' : 'off', value: enabled });
  return postSet({ key: 'zone_enabled', value: enabled ? 1 : 0, zone });
}

export function setDriversEnabled(enabled) {
  setEntity(gkey.drivers, { state: enabled ? 'on' : 'off', value: enabled });
  return postSet({ key: 'drivers_enabled', value: enabled ? 1 : 0 });
}

export function command(name, zone) {
  return postSet({ key: 'command', value: name, zone: zone || undefined });
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
  motor_profile_default: gkey.motorProfileDefault,
  simple_preheat_enabled: gkey.simplePreheatEnabled
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
  relearn_after_movements: gkey.relearnAfterMovements,
  relearn_after_hours: gkey.relearnAfterHours,
  learned_factor_min_samples: gkey.learnedFactorMinSamples,
  learned_factor_max_deviation_pct: gkey.learnedFactorMaxDeviationPct
};

export function setZoneSelect(zone, settingKey, value) {
  const idBuilder = zoneSelectMap[settingKey];
  if (idBuilder) setEntity(idBuilder(zone), { state: value });
  return postSet({ key: settingKey, value, zone });
}

export function setZoneText(zone, settingKey, value) {
  const idBuilder = zoneTextMap[settingKey];
  if (idBuilder) setEntity(idBuilder(zone), { state: value });
  return postSet({ key: settingKey, value, zone });
}

export function setZoneNumber(zone, settingKey, value) {
  const numeric = Number(value);
  const idBuilder = zoneNumberMap[settingKey];
  if (idBuilder && !Number.isNaN(numeric)) setEntity(idBuilder(zone), { value: numeric });
  return postSet({ key: settingKey, value: numeric, zone });
}

export function setGlobalSelect(settingKey, value) {
  const id = globalSelectMap[settingKey];
  if (id) setEntity(id, { state: value });
  return postSet({ key: settingKey, value });
}

export function setGlobalNumber(settingKey, value) {
  const numeric = Number(value);
  const id = globalNumberMap[settingKey];
  if (id && !Number.isNaN(numeric)) setEntity(id, { value: numeric });
  return postSet({ key: settingKey, value: numeric });
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
  const clamped = Number.isNaN(numeric) ? 0 : Math.max(0, Math.min(100, Math.round(numeric)));
  setEntity(key.motorTarget(zone), { value: clamped });
  addActivity('Motor ' + zone + ' target set to ' + clamped + '%', zone);
  return postSet({ key: 'motor_target', value: clamped, zone });
}

export function openMotorTimed(zone, durationMs = 10000) {
  addActivity('Motor ' + zone + ' open for ' + durationMs + 'ms', zone);
  return postSet({ key: 'command', value: 'open_motor_timed', zone });
}

export function closeMotorTimed(zone, durationMs = 10000) {
  addActivity('Motor ' + zone + ' close for ' + durationMs + 'ms', zone);
  return postSet({ key: 'command', value: 'close_motor_timed', zone });
}

export function stopMotor(zone) {
  addActivity('Motor ' + zone + ' stopped', zone);
  return postSet({ key: 'command', value: 'stop_motor', zone });
}

export function setManualMode(enabled) {
  setDashboardValue('manualMode', !!enabled);
  addActivity(enabled ? 'Manual mode enabled — automatic management paused' : 'Manual mode disabled — automatic management resumed');
  return postSet({ key: 'manual_mode', value: enabled ? 1 : 0 });
}

// Recovery/reset helpers
export function resetMotorFault(zone) {
  addActivity('Motor ' + zone + ' fault reset', zone);
  return postSet({ key: 'command', value: 'motor_reset_fault', zone });
}

export function resetMotorLearnedFactors(zone) {
  addActivity('Motor ' + zone + ' learned factors reset', zone);
  return postSet({ key: 'command', value: 'motor_reset_learned_factors', zone });
}

export function resetMotorAndRelearn(zone) {
  addActivity('Motor ' + zone + ' reset and relearn started', zone);
  return postSet({ key: 'command', value: 'motor_reset_and_relearn', zone });
}

export function fetchHistory() {
  if (isMock()) return;
  fetch(BASE + '/history', { cache: 'no-store' })
    .then((response) => response.ok ? response.json() : null)
    .then((data) => { if (data) setZoneStateHistory(data); })
    .catch(() => { /* history fetch errors are non-fatal */ });
}