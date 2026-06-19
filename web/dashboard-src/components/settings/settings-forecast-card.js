import { component, subscribe } from '../../core/component.js';
import { injectStyle } from '../../core/style.js';
import { cardForm, helpBadge } from '../../core/ui-kit.js';
import { es, ev, isEntityOn, setEntity } from '../../core/store.js';
import { setGlobalSelect, setGlobalNumber, command, fetchForecastHours } from '../../core/api.js';
import { key, gkey } from '../../utils/keys.js';

const ZONES = [1, 2, 3, 4, 5, 6];

// ========================================
// CSS — reuses the helios/asgard card language
// ========================================
const css = `
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

.settings-forecast-card .fc-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 10px;
  font-size: .78rem;
}
.settings-forecast-card .fc-age {
  color: var(--text-secondary);
}
.settings-forecast-card .fc-error {
  color: #FFB4B4;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 240px;
}
.settings-forecast-card .fc-fetch-btn {
  margin-left: auto;
  padding: 4px 12px;
  border: 1px solid var(--control-border);
  background: var(--control-bg);
  color: var(--text-strong);
  border-radius: 8px;
  cursor: pointer;
  font-size: .78rem;
  font-weight: 700;
  transition: .18s ease;
  white-space: nowrap;
  flex-shrink: 0;
}
.settings-forecast-card .fc-fetch-btn:hover {
  background: var(--control-bg-hover);
  border-color: rgba(120,146,200,.52);
}
.settings-forecast-card .fc-fetch-btn:disabled {
  opacity: .5;
  cursor: default;
}

.settings-forecast-card .zone-table { width: 100%; border-collapse: collapse; font-size: .8rem; margin-top: 4px; }
.settings-forecast-card .zone-table th {
  color: var(--text-secondary); font-size: .68rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: .4px; text-align: center; padding: 4px 2px;
}
.settings-forecast-card .zone-table th:first-child { text-align: left; }
.settings-forecast-card .zone-table td { padding: 4px 2px; text-align: center; }
.settings-forecast-card .zone-table td:first-child { text-align: left; color: var(--text); font-weight: 600; white-space: nowrap; }
.settings-forecast-card .zone-table .offset-cell { font-weight: 700; color: var(--text-secondary); font-family: var(--mono); }
.settings-forecast-card .zone-table .offset-cell.active { color: #CBFFD0; }
`;

injectStyle('settings-forecast-card', css);

// ========================================
// TEMPLATE
// ========================================
const zoneRow = (z) => `
  <tr data-zone="${z}">
    <td>Zone ${z}</td>
    <td class="offset-cell fc-offset">—</td>
  </tr>
`;

const template = () => `
  <div class="ui-card settings-forecast-card">
    <div class="ui-card-title">
      <span class="ui-title-text">Forecast Preload${helpBadge('Charges the slab before incoming weather: raises a zone setpoint when forecast wind on its exterior walls is about to spike. Solar gain offsets it. Fetched from Open-Meteo hourly.')}</span>
      <span class="fc-badge">disabled</span>
    </div>

    <div class="fc-meta">
      <span class="fc-age"></span>
      <span class="fc-error"></span>
      <button class="fc-fetch-btn">Fetch Now</button>
    </div>

    <div class="ui-row">
      <span class="ui-label">Wind preload enabled</span>
      <span class="ui-field"><div class="ui-toggle fc-enable" role="switch" aria-label="Toggle forecast preload"></div></span>
    </div>
    <div class="ui-note">Charges the slab before an incoming storm: raises a zone's setpoint when forecast wind hitting its exterior walls is about to spike. The fetched forecast is shown on the Monitor page.</div>

    <div class="gated-body fc-body">
      <div class="ui-section">Location</div>
      <div class="ui-row">
        <span class="ui-label">Latitude</span>
        <span class="ui-field"><input class="ui-input wide fc-lat" type="number" min="-90" max="90" step="0.0001" placeholder="55.6761" data-nostep /></span>
      </div>
      <div class="ui-row">
        <span class="ui-label">Longitude</span>
        <span class="ui-field"><input class="ui-input wide fc-lon" type="number" min="-180" max="180" step="0.0001" placeholder="12.5683" data-nostep /></span>
      </div>

      <div class="ui-section">Model</div>
      <div class="ui-row">
        <span class="ui-label">Load threshold</span>
        <span class="ui-field"><input class="ui-input fc-threshold" type="number" min="0.1" max="10" step="0.1" placeholder="1.0" /></span>
      </div>
      <div class="ui-row">
        <span class="ui-label">Max offset (°C)</span>
        <span class="ui-field"><input class="ui-input fc-maxoffset" type="number" min="0" max="3" step="0.1" placeholder="1.5" /></span>
      </div>

      <div class="ui-section">Per-zone preload (now)</div>
      <table class="zone-table">
        <thead>
          <tr><th>Zone</th><th>Active offset</th></tr>
        </thead>
        <tbody class="fc-zone-body">
          ${ZONES.map(zoneRow).join('')}
        </tbody>
      </table>
      <div class="ui-note fc-note">Live forecast preload offset applied to each zone right now (the hours-ahead figure is when the load peak is expected). Per-zone wind exposure, solar gain and thermal lead are configured in the Zone card alongside Exterior Walls.</div>
    </div>
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
    const enableBtn = el.querySelector('.fc-enable');
    const body = el.querySelector('.fc-body');
    const latEl = el.querySelector('.fc-lat');
    const lonEl = el.querySelector('.fc-lon');
    const thrEl = el.querySelector('.fc-threshold');
    const maxEl = el.querySelector('.fc-maxoffset');
    const ageEl = el.querySelector('.fc-age');
    const errorEl = el.querySelector('.fc-error');
    const fetchBtn = el.querySelector('.fc-fetch-btn');

    const form = cardForm(el);

    function fmtFetchTime(epoch) {
      if (!epoch) return '';
      if (epoch < 1600000000) return 'clock syncing…';
      const d = new Date(epoch * 1000);
      const hhmm = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const now = new Date();
      const sameDay = d.getFullYear() === now.getFullYear() &&
                      d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
      return sameDay ? hhmm
        : d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + hhmm;
    }

    function updateMeta() {
      const ts = fmtFetchTime(ev(gkey.forecastFetchEpoch));
      ageEl.textContent = ts ? `Last fetch: ${ts}` : '';
      const err = es(gkey.forecastLastError);
      errorEl.textContent = err || '';
    }

    fetchBtn.addEventListener('click', () => {
      fetchBtn.disabled = true;
      fetchBtn.textContent = 'Fetching…';
      command('trigger_forecast_fetch').catch(() => {});
      // Refresh the monitor graph after giving the firmware time to fetch (~15 s)
      setTimeout(() => { fetchForecastHours(); }, 15000);
      setTimeout(() => {
        fetchBtn.disabled = false;
        fetchBtn.textContent = 'Fetch Now';
      }, 20000);
    });

    const gate = (on) => { if (body) body.classList.toggle('is-disabled', !on); };
    form.toggle(enableBtn, {
      read: () => isEntityOn(gkey.forecastEnabled),
      onChange: gate,
      commit: (on) => {
        const next = on ? 'on' : 'off';
        setEntity(gkey.forecastEnabled, { state: next });
        setGlobalSelect('forecast_enabled', next).catch(err => {
          console.error('[Forecast] toggle failed:', err);
          setEntity(gkey.forecastEnabled, { state: on ? 'off' : 'on' });
        });
      }
    });

    function commitNum(gk, settingKey) {
      return (v) => {
        setEntity(gk, { value: v });
        setGlobalNumber(settingKey, v).catch(err => console.error(`[Forecast] ${settingKey} failed:`, err));
      };
    }
    // Lat/Lon keep typeable inputs (no stepper — 0.0001° buttons aren't useful).
    form.num(latEl, { nostep: true, read: () => ev(gkey.forecastLatitude), commit: commitNum(gkey.forecastLatitude, 'forecast_latitude') });
    form.num(lonEl, { nostep: true, read: () => ev(gkey.forecastLongitude), commit: commitNum(gkey.forecastLongitude, 'forecast_longitude') });
    form.num(thrEl, { read: () => ev(gkey.forecastLoadThreshold), commit: commitNum(gkey.forecastLoadThreshold, 'forecast_load_threshold') });
    form.num(maxEl, { read: () => ev(gkey.forecastMaxOffsetC), commit: commitNum(gkey.forecastMaxOffsetC, 'forecast_max_offset_c') });

    function updateStatus() {
      const status = es(gkey.forecastStatus) || 'disabled';
      badge.textContent = status;
      badge.className = 'fc-badge';
      if (status === 'ok') badge.classList.add('ok');
      else if (status === 'stale' || status.indexOf('external') >= 0) badge.classList.add('external');
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

    subscribe(gkey.forecastStatus, updateStatus);
    subscribe(gkey.forecastEnabled, () => { form.refresh(); updateStatus(); });
    subscribe(gkey.forecastLatitude, form.refresh);
    subscribe(gkey.forecastLongitude, form.refresh);
    subscribe(gkey.forecastLoadThreshold, form.refresh);
    subscribe(gkey.forecastMaxOffsetC, form.refresh);
    subscribe(gkey.forecastFetchEpoch, updateMeta);
    subscribe(gkey.forecastLastError, updateMeta);
    ZONES.forEach((z) => {
      subscribe(key.forecastOffset(z), updateOffsets);
    });

    updateStatus();
    updateMeta();
    updateOffsets();
    form.refresh();
  }
});
