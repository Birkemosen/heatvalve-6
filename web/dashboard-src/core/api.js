// core/api.js

import { beginPendingWrite, endPendingWrite, setEntity, setI2cResult, setLive, addActivity, setDashboardValue, setZoneStateHistory, appendDeviceLog, getDeviceLogSeq, setForecastHours } from './store.js';
import { handleMockPost } from './mock.js';
import { key, gkey } from '../utils/keys.js';

export const BASE = '/api/hv6/v1';

function isMock() {
  return !!(window.HV6_DASHBOARD_CONFIG && window.HV6_DASHBOARD_CONFIG.mock);
}

// POST to a /api/hv6/v1 write endpoint (query params per docs/hv6_api_v1.md).
// mockBody carries the legacy {key, value, zone?} action shape consumed by core/mock.js.
function postV1(path, params, mockBody) {
  beginPendingWrite();

  if (isMock()) {
    try {
      handleMockPost(mockBody);
      return Promise.resolve({ ok: true });
    } finally {
      endPendingWrite();
    }
  }

  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params || {})) {
    if (v !== undefined && v !== null) qs.append(k, v);
  }
  const query = qs.toString();
  const url = BASE + path + (query ? '?' + query : '');

  return fetch(url, { method: 'POST' }).then(resp => {
    if (!resp.ok) {
      console.warn(`API call failed: POST ${path} status=${resp.status}`);
    }
    return resp;
  }).catch(err => {
    console.error(`API call error: POST ${path}:`, err);
    throw err;
  }).finally(() => {
    endPendingWrite();
  });
}

export function setSetpoint(zone, value) {
  setEntity(key.setpoint(zone), { value });
  return postV1(`/zones/${zone}/setpoint`, { setpoint_c: value }, { key: 'zone_setpoint', value, zone });
}

export function setEnabled(zone, enabled) {
  setEntity(key.enabled(zone), { state: enabled ? 'on' : 'off', value: enabled });
  return postV1(`/zones/${zone}/enabled`, { enabled: !!enabled }, { key: 'zone_enabled', value: enabled ? 1 : 0, zone });
}

export function setDriversEnabled(enabled) {
  setEntity(gkey.drivers, { state: enabled ? 'on' : 'off', value: enabled });
  return postV1('/drivers/enabled', { enabled: !!enabled }, { key: 'drivers_enabled', value: enabled ? 1 : 0 });
}

export function command(name, zone) {
  return postV1('/commands', { command: name, zone: zone || undefined }, { key: 'command', value: name, zone: zone || undefined });
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
  simple_preheat_enabled: gkey.simplePreheatEnabled,
  balance_mode: gkey.balanceMode
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
  learned_factor_max_deviation_pct: gkey.learnedFactorMaxDeviationPct,
  adapt_interval_s: gkey.adaptIntervalS,
  adapt_step: gkey.adaptStep,
  adapt_min: gkey.adaptMin,
  adapt_max: gkey.adaptMax
};

export function setZoneSelect(zone, settingKey, value) {
  const idBuilder = zoneSelectMap[settingKey];
  if (idBuilder) setEntity(idBuilder(zone), { state: value });
  return postV1('/settings/select', { key: settingKey, value, zone }, { key: settingKey, value, zone });
}

export function setZoneText(zone, settingKey, value) {
  const idBuilder = zoneTextMap[settingKey];
  if (idBuilder) setEntity(idBuilder(zone), { state: value });
  return postV1('/settings/text', { key: settingKey, value, zone }, { key: settingKey, value, zone });
}

export function setZoneNumber(zone, settingKey, value) {
  const numeric = Number(value);
  const idBuilder = zoneNumberMap[settingKey];
  if (idBuilder && !Number.isNaN(numeric)) setEntity(idBuilder(zone), { value: numeric });
  return postV1('/settings/number', { key: settingKey, value: numeric, zone }, { key: settingKey, value: numeric, zone });
}

export function setGlobalSelect(settingKey, value) {
  const id = globalSelectMap[settingKey];
  if (id) setEntity(id, { state: value });
  return postV1('/settings/select', { key: settingKey, value }, { key: settingKey, value });
}

export function setGlobalNumber(settingKey, value) {
  const numeric = Number(value);
  const id = globalNumberMap[settingKey];
  if (id && !Number.isNaN(numeric)) setEntity(id, { value: numeric });
  return postV1('/settings/number', { key: settingKey, value: numeric }, { key: settingKey, value: numeric });
}

export function setGlobalText(settingKey, value) {
  return postV1('/settings/text', { key: settingKey, value }, { key: settingKey, value });
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
  return postV1(`/motors/${zone}/target`, { value: clamped }, { key: 'motor_target', value: clamped, zone });
}

export function openMotorTimed(zone, durationMs = 10000) {
  addActivity('Motor ' + zone + ' open for ' + durationMs + 'ms', zone);
  return postV1(`/motors/${zone}/open_timed`, {}, { key: 'command', value: 'open_motor_timed', zone });
}

export function closeMotorTimed(zone, durationMs = 10000) {
  addActivity('Motor ' + zone + ' close for ' + durationMs + 'ms', zone);
  return postV1(`/motors/${zone}/close_timed`, {}, { key: 'command', value: 'close_motor_timed', zone });
}

export function stopMotor(zone) {
  addActivity('Motor ' + zone + ' stopped', zone);
  return postV1(`/motors/${zone}/stop`, {}, { key: 'command', value: 'stop_motor', zone });
}

export function setManualMode(enabled) {
  setDashboardValue('manualMode', !!enabled);
  addActivity(enabled ? 'Manual mode enabled — automatic management paused' : 'Manual mode disabled — automatic management resumed');
  return postV1('/manual_mode', { enabled: !!enabled }, { key: 'manual_mode', value: enabled ? 1 : 0 });
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

export function resetBalancing() {
  addActivity('Adaptive balancing reset — learned factors back to 1.0');
  return command('reset_balancing');
}

export function dumpTaskStats() {
  addActivity('Task stats dumped to device log');
  return command('dump_task_stats');
}

export function fetchHistory() {
  if (isMock()) return;
  fetch(BASE + '/history', { cache: 'no-store' })
    .then((response) => response.ok ? response.json() : null)
    .then((data) => { if (data) setZoneStateHistory(data); })
    .catch(() => { /* history fetch errors are non-fatal */ });
}

// Live device logs: only request lines newer than the last seq we've stored.
export function fetchLogs() {
  if (isMock()) return;
  const since = getDeviceLogSeq();
  fetch(BASE + '/logs?since=' + since, { cache: 'no-store' })
    .then((response) => response.ok ? response.json() : null)
    .then((data) => { if (data) appendDeviceLog(data.lines, data.next_seq); })
    .catch(() => { /* log fetch errors are non-fatal */ });
}

// Fetched Open-Meteo forecast (read-only preview to prove data freshness).
export function fetchForecastHours() {
  if (isMock()) return;
  fetch(BASE + '/forecast', { cache: 'no-store' })
    .then((response) => response.ok ? response.json() : null)
    .then((data) => { if (data) setForecastHours(data); })
    .catch(() => { /* forecast fetch errors are non-fatal */ });
}