import { component, subscribe } from '../../core/component.js';
import { injectStyle } from '../../core/style.js';
import { es, ev, isEntityOn, setEntity } from '../../core/store.js';
import { setGlobalSelect, setGlobalNumber, setZoneNumber } from '../../core/api.js';
import { key, gkey } from '../../utils/keys.js';

const ZONES = [1, 2, 3, 4, 5, 6];

// ========================================
// CSS — reuses the helios/asgard card language
// ========================================
const css = `
.settings-forecast-card {
  background: var(--panel-bg-vibrant);
  border: 1px solid var(--panel-border);
  border-radius: 18px;
  padding: 20px;
  box-shadow: var(--panel-shadow);
}

.settings-forecast-card .card-title {
  font-size: .84rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1.1px;
  color: var(--accent);
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--panel-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.settings-forecast-card .fc-badge {
  font-size: .72rem;
  font-weight: 800;
  letter-spacing: .9px;
  text-transform: uppercase;
  padding: 3px 10px;
  border-radius: 8px;
  flex-shrink: 0;
  background: rgba(70,70,70,.28);
  color: #ADADAD;
  border: 1px solid rgba(150,150,150,.25);
}

.settings-forecast-card .fc-badge.ok {
  background: rgba(45,110,45,.36);
  color: #CBFFD0;
  border-color: rgba(100,255,100,.35);
}

.settings-forecast-card .fc-badge.stale,
.settings-forecast-card .fc-badge.external {
  background: rgba(110,90,20,.36);
  color: #FFE9A0;
  border-color: rgba(255,200,50,.35);
}

.settings-forecast-card .enable-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 14px;
  padding: 10px 14px;
  border: 1px solid var(--control-border);
  border-radius: 12px;
  background: var(--control-bg);
}

.settings-forecast-card .enable-label { font-size: .88rem; font-weight: 700; color: var(--text); }
.settings-forecast-card .enable-row.is-on { border-color: rgba(100,255,100,.4); background: rgba(45,110,45,.2); }

.settings-forecast-card .enable-toggle {
  width: 48px; height: 26px; border-radius: 999px;
  background: var(--control-bg-hover); position: relative; cursor: pointer;
  border: 1px solid var(--control-border); transition: background .2s ease, border-color .2s ease; flex-shrink: 0;
}
.settings-forecast-card .enable-toggle::after {
  content: ''; position: absolute; top: 3px; left: 3px; width: 18px; height: 18px;
  background: #dbe8ff; border-radius: 999px; transition: transform .2s ease;
}
.settings-forecast-card .enable-row.is-on .enable-toggle { background: rgba(121,209,126,.25); border-color: rgba(121,209,126,.5); }
.settings-forecast-card .enable-row.is-on .enable-toggle::after { transform: translateX(22px); background: #0f213c; }

.settings-forecast-card .section-title {
  color: var(--text-secondary); font-size: .76rem; font-weight: 700;
  letter-spacing: .8px; text-transform: uppercase; margin: 16px 0 10px;
}

.settings-forecast-card .row-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 12px; }
.settings-forecast-card .lbl {
  display: block; color: var(--text-secondary); font-size: .74rem; font-weight: 700;
  letter-spacing: .45px; text-transform: uppercase; margin-bottom: 4px;
}
.settings-forecast-card .inp {
  width: 100%; box-sizing: border-box; border: 1px solid var(--control-border);
  background: var(--control-bg); color: var(--text); border-radius: 10px; padding: 8px 10px; font-size: .88rem;
}

.settings-forecast-card .zone-table { width: 100%; border-collapse: collapse; font-size: .8rem; }
.settings-forecast-card .zone-table th {
  color: var(--text-secondary); font-size: .68rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: .4px; text-align: center; padding: 4px 2px; font-weight: 700;
}
.settings-forecast-card .zone-table th:first-child { text-align: left; }
.settings-forecast-card .zone-table td { padding: 3px 2px; text-align: center; }
.settings-forecast-card .zone-table td:first-child { text-align: left; color: var(--text); font-weight: 600; white-space: nowrap; }
.settings-forecast-card .zone-table input {
  width: 100%; box-sizing: border-box; border: 1px solid var(--control-border);
  background: var(--control-bg); color: var(--text); border-radius: 8px; padding: 5px 4px; font-size: .8rem; text-align: center;
}
.settings-forecast-card .zone-table .offset-cell { font-weight: 700; color: var(--text-secondary); }
.settings-forecast-card .zone-table .offset-cell.active { color: #CBFFD0; }

.settings-forecast-card .note { color: var(--text-secondary); font-size: .75rem; margin-top: 6px; line-height: 1.4; }
`;

injectStyle('settings-forecast-card', css);

// ========================================
// TEMPLATE
// ========================================
const zoneRow = (z) => `
  <tr data-zone="${z}">
    <td>Zone ${z}</td>
    <td><input class="fc-wind" type="number" min="0" max="1" step="0.05" /></td>
    <td><input class="fc-solar" type="number" min="0" max="1" step="0.05" /></td>
    <td><input class="fc-lead" type="number" min="0" max="48" step="1" /></td>
    <td class="offset-cell fc-offset">—</td>
  </tr>
`;

const template = () => `
  <div class="settings-forecast-card">
    <div class="card-title">
      <span>Forecast Preload</span>
      <span class="fc-badge">disabled</span>
    </div>

    <div class="enable-row is-off">
      <span class="enable-label">Wind preload enabled</span>
      <div class="enable-toggle fc-enable" role="switch" aria-label="Toggle forecast preload"></div>
    </div>

    <div class="section-title">Location</div>
    <div class="row-2col">
      <div><span class="lbl">Latitude</span><input class="inp fc-lat" type="number" min="-90" max="90" step="0.0001" placeholder="55.6761" /></div>
      <div><span class="lbl">Longitude</span><input class="inp fc-lon" type="number" min="-180" max="180" step="0.0001" placeholder="12.5683" /></div>
    </div>

    <div class="section-title">Model</div>
    <div class="row-2col">
      <div><span class="lbl">Load threshold</span><input class="inp fc-threshold" type="number" min="0.1" max="10" step="0.1" placeholder="1.0" /></div>
      <div><span class="lbl">Max offset (°C)</span><input class="inp fc-maxoffset" type="number" min="0" max="3" step="0.1" placeholder="1.5" /></div>
    </div>

    <div class="section-title">Per-zone exposure</div>
    <table class="zone-table">
      <thead>
        <tr><th>Zone</th><th>Wind</th><th>Solar</th><th>Lead h</th><th>Now</th></tr>
      </thead>
      <tbody class="fc-zone-body">
        ${ZONES.map(zoneRow).join('')}
      </tbody>
    </table>
    <div class="note fc-note">Wind (0–1) = how exposed this room's outside walls are to wind-driven heat loss (0 sheltered/internal, 1 fully exposed). Solar (0–1) = how much passive sun this room gains, which reduces its preload (0 none, 1 strong). Lead h = how many hours ahead to start charging the slab before a forecast cold/wind peak (fixed per room, not learned). The live wind speed, direction and sun come from the forecast; the room's exterior walls (set in the zone sensor card) decide which wind directions count.</div>
  </div>
`;

// ========================================
// COMPONENT
// ========================================
export default component({
  tag: 'settings-forecast-card',
  render: template,
  onMount(ctx, el) {
    const badge = el.querySelector('.fc-badge');
    const enableRow = el.querySelector('.enable-row');
    const enableBtn = el.querySelector('.fc-enable');
    const latEl = el.querySelector('.fc-lat');
    const lonEl = el.querySelector('.fc-lon');
    const thrEl = el.querySelector('.fc-threshold');
    const maxEl = el.querySelector('.fc-maxoffset');

    enableBtn.addEventListener('click', () => {
      const current = isEntityOn(gkey.forecastEnabled);
      const next = current ? 'off' : 'on';
      setEntity(gkey.forecastEnabled, { state: next });
      setGlobalSelect('forecast_enabled', next)
        .catch(err => {
          console.error('[Forecast] toggle failed:', err);
          setEntity(gkey.forecastEnabled, { state: current ? 'on' : 'off' });
        });
    });

    function bindGlobalNum(input, settingKey, gk, min, max) {
      input.addEventListener('blur', () => {
        const v = parseFloat(input.value);
        if (!Number.isNaN(v) && v >= min && v <= max) {
          setEntity(gk, { value: v });
          setGlobalNumber(settingKey, v).catch(err => console.error(`[Forecast] ${settingKey} failed:`, err));
        }
      });
    }
    bindGlobalNum(latEl, 'forecast_latitude', gkey.forecastLatitude, -90, 90);
    bindGlobalNum(lonEl, 'forecast_longitude', gkey.forecastLongitude, -180, 180);
    bindGlobalNum(thrEl, 'forecast_load_threshold', gkey.forecastLoadThreshold, 0.1, 10);
    bindGlobalNum(maxEl, 'forecast_max_offset_c', gkey.forecastMaxOffsetC, 0, 3);

    // Per-zone exposure inputs
    el.querySelectorAll('.fc-zone-body tr').forEach((row) => {
      const z = parseInt(row.getAttribute('data-zone'), 10);
      const windEl = row.querySelector('.fc-wind');
      const solarEl = row.querySelector('.fc-solar');
      const leadEl = row.querySelector('.fc-lead');
      const bindZone = (input, settingKey, gk, min, max) => {
        input.addEventListener('blur', () => {
          const v = parseFloat(input.value);
          if (!Number.isNaN(v) && v >= min && v <= max) {
            setEntity(gk(z), { value: v });
            setZoneNumber(z, settingKey, v).catch(err => console.error(`[Forecast] z${z} ${settingKey} failed:`, err));
          }
        });
      };
      bindZone(windEl, 'zone_wind_exposure', key.windExposure, 0, 1);
      bindZone(solarEl, 'zone_solar_gain', key.solarGain, 0, 1);
      bindZone(leadEl, 'zone_thermal_lead_h', key.thermalLeadH, 0, 48);
    });

    function updateStatus() {
      const status = es(gkey.forecastStatus) || 'disabled';
      badge.textContent = status;
      badge.className = 'fc-badge';
      if (status === 'ok') badge.classList.add('ok');
      else if (status === 'stale' || status.indexOf('external') >= 0) badge.classList.add('external');

      const on = isEntityOn(gkey.forecastEnabled);
      enableRow.classList.toggle('is-on', on);
      enableRow.classList.toggle('is-off', !on);
      enableBtn.setAttribute('aria-checked', on ? 'true' : 'false');
    }

    function updateOffsets() {
      el.querySelectorAll('.fc-zone-body tr').forEach((row) => {
        const z = parseInt(row.getAttribute('data-zone'), 10);
        const cell = row.querySelector('.fc-offset');
        const off = ev(key.forecastOffset(z));
        const peak = ev(key.forecastPeakH(z));
        if (off != null && off > 0.01) {
          cell.textContent = `+${off.toFixed(1)}°` + (peak != null && peak >= 0 ? ` (${peak}h)` : '');
          cell.classList.add('active');
        } else {
          cell.textContent = '—';
          cell.classList.remove('active');
        }
      });
    }

    function populateInputs() {
      const set = (input, gk, fallback) => {
        const v = ev(gk);
        if (document.activeElement !== input && v != null) input.value = v || fallback;
      };
      set(latEl, gkey.forecastLatitude, '');
      set(lonEl, gkey.forecastLongitude, '');
      set(thrEl, gkey.forecastLoadThreshold, 1.0);
      set(maxEl, gkey.forecastMaxOffsetC, 1.5);
      el.querySelectorAll('.fc-zone-body tr').forEach((row) => {
        const z = parseInt(row.getAttribute('data-zone'), 10);
        set(row.querySelector('.fc-wind'), key.windExposure(z), 0.5);
        set(row.querySelector('.fc-solar'), key.solarGain(z), 0.3);
        set(row.querySelector('.fc-lead'), key.thermalLeadH(z), 4);
      });
    }

    subscribe(gkey.forecastStatus, updateStatus);
    subscribe(gkey.forecastEnabled, updateStatus);
    subscribe(gkey.forecastLatitude, populateInputs);
    subscribe(gkey.forecastLongitude, populateInputs);
    subscribe(gkey.forecastLoadThreshold, populateInputs);
    subscribe(gkey.forecastMaxOffsetC, populateInputs);
    ZONES.forEach((z) => {
      subscribe(key.windExposure(z), populateInputs);
      subscribe(key.solarGain(z), populateInputs);
      subscribe(key.thermalLeadH(z), populateInputs);
      subscribe(key.forecastOffset(z), updateOffsets);
    });

    updateStatus();
    updateOffsets();
    populateInputs();
  }
});
