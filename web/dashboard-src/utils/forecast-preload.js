import { ev, es } from '../core/store.js';
import { key, gkey } from './keys.js';

const PREHEAT_GAIN_C_PER_LOAD = 0.5; // keep in sync with hv6fc::PreloadParams default

function parseWalls(value) {
  const raw = String(value || '').toUpperCase();
  let bits = 0;
  if (raw.includes('N')) bits |= 1;
  if (raw.includes('E')) bits |= 2;
  if (raw.includes('S')) bits |= 4;
  if (raw.includes('W')) bits |= 8;
  return bits;
}

function windAlignment(walls, windDirDeg) {
  const defs = [[1, 0], [2, 90], [4, 180], [8, 270]];
  let best = 0;
  for (const [bit, normal] of defs) {
    if (!(walls & bit)) continue;
    const delta = (Number(windDirDeg) - normal) * Math.PI / 180;
    best = Math.max(best, Math.cos(delta));
  }
  return Math.max(0, best);
}

function zoneHourLoad(hour, zone) {
  const walls = parseWalls(es(key.exteriorWalls(zone)));
  if (!walls) return 0;
  const windExposure = Number(ev(key.windExposure(zone)));
  const solarGain = Number(ev(key.solarGain(zone)));
  const exposure = Number.isFinite(windExposure) ? windExposure : 0.5;
  const solar = Number.isFinite(solarGain) ? solarGain : 0.3;
  const align = windAlignment(walls, hour[2]);
  const windTerm = exposure * align * (Number(hour[1]) / 10);
  const coldTerm = Math.max(0, 21 - Number(hour[0])) / 10;
  const solarRelief = solar * (Math.max(0, Number(hour[3]) || 0) / 800);
  return Math.max(0, windTerm * coldTerm - solarRelief);
}

export function computeForecastPreheat(hours, count) {
  const n = Math.min(count || (hours ? hours.length : 0), hours ? hours.length : 0);
  const thresholdRaw = Number(ev(gkey.forecastLoadThreshold));
  const maxOffsetRaw = Number(ev(gkey.forecastMaxOffsetC));
  const threshold = Number.isFinite(thresholdRaw) ? thresholdRaw : 1.0;
  const maxOffset = Number.isFinite(maxOffsetRaw) ? maxOffsetRaw : 1.5;
  const zones = [];

  for (let zone = 1; zone <= 6; zone++) {
    const leadRaw = Number(ev(key.thermalLeadH(zone)));
    const lead = Math.max(0, Math.min(24, Number.isFinite(leadRaw) ? Math.round(leadRaw) : 4));
    const offsets = [];
    for (let i = 0; i < n; i++) {
      const last = Math.min(n - 1, i + lead);
      let peak = 0;
      for (let h = i; h <= last; h++) peak = Math.max(peak, zoneHourLoad(hours[h], zone));
      const above = peak - threshold;
      offsets.push(above > 0 ? Math.min(maxOffset, above * PREHEAT_GAIN_C_PER_LOAD) : 0);
    }
    zones.push({ zone, offsets });
  }
  return zones;
}

export function forecastPreheatSubscriptions(subscribeFn, update) {
  subscribeFn(gkey.forecastLoadThreshold, update);
  subscribeFn(gkey.forecastMaxOffsetC, update);
  for (let zone = 1; zone <= 6; zone++) {
    subscribeFn(key.exteriorWalls(zone), update);
    subscribeFn(key.windExposure(zone), update);
    subscribeFn(key.solarGain(zone), update);
    subscribeFn(key.thermalLeadH(zone), update);
  }
}
