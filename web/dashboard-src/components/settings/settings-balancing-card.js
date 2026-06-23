import { component, subscribe } from '../../core/component.js';
import { injectStyle } from '../../core/style.js';
import { cardForm, helpBadge } from '../../core/ui-kit.js';
import { es, ev, setEntity } from '../../core/store.js';
import { setGlobalSelect, setGlobalNumber, resetBalancing } from '../../core/api.js';
import { key, gkey } from '../../utils/keys.js';

const ZONES = [1, 2, 3, 4, 5, 6];

// ========================================
// CSS — reuses the forecast/asgard card language
// ========================================
const css = `
.settings-balancing-card .zone-table { width: 100%; border-collapse: collapse; font-size: .8rem; margin-top: 4px; }
.settings-balancing-card .zone-table th {
  color: var(--text-secondary); font-size: .68rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: .4px; text-align: center; padding: 4px 2px;
}
.settings-balancing-card .zone-table th:first-child { text-align: left; }
.settings-balancing-card .zone-table td { padding: 4px 2px; text-align: center; font-family: var(--mono); color: var(--text-secondary); }
.settings-balancing-card .zone-table td:first-child { text-align: left; color: var(--text); font-weight: 600; white-space: nowrap; font-family: inherit; }
.settings-balancing-card .zone-table .eff { color: var(--text-strong); font-weight: 700; }
.settings-balancing-card .zone-table .err.cold { color: #FFB4B4; }
.settings-balancing-card .zone-table .err.warm { color: #CBFFD0; }
.settings-balancing-card .bal-reset { width: 100%; }
`;

injectStyle('settings-balancing-card', css);

// ========================================
// TEMPLATE
// ========================================
const zoneRow = (z) => `
  <tr data-zone="${z}">
    <td>Zone ${z}</td>
    <td class="bal-static">—</td>
    <td class="bal-adapt">—</td>
    <td class="bal-eff eff">—</td>
    <td class="bal-err err">—</td>
  </tr>
`;

const template = () => `
  <div class="ui-card settings-balancing-card">
    <div class="ui-card-title"><span class="ui-title-text">Hydraulic Balancing${helpBadge('Scales raw valve positions by pipe length and zone area so long loops get proportionally more flow. Adaptive mode tunes the factors over time.')}</span></div>

    <div class="ui-row">
      <span class="ui-label">Balancing mode</span>
      <span class="ui-field"><select class="ui-select bal-mode">
        <option>Static</option>
        <option>Adaptive</option>
      </select></span>
    </div>
    <div class="ui-note">Static splits flow from the resistance-aware design model (area, pipe, floor). Adaptive adds a slow room-temperature correction on top — no return probes — nudging chronically cold loops open and over-served loops closed over days. It only redistributes flow between loops, never raises total demand.</div>

    <div class="ui-section">Per-zone factors</div>
    <table class="zone-table">
      <thead>
        <tr><th>Zone</th><th>Prior</th><th>Learned</th><th>Effective</th><th>Error</th></tr>
      </thead>
      <tbody class="bal-zone-body">
        ${ZONES.map(zoneRow).join('')}
      </tbody>
    </table>
    <div class="ui-note">Prior = static design factor · Learned = adaptive multiplier · Effective = prior × learned (the valve scale applied). Error is the long-window setpoint−room average a cold (+) loop is boosted on, a warm (−) loop throttled.</div>

    <div class="gated-body bal-adaptive-body">
      <div class="ui-section">Adaptive tuning</div>
      <div class="ui-row">
        <span class="ui-label">Update interval (s)</span>
        <span class="ui-field"><input class="ui-input bal-interval" type="number" min="60" max="86400" step="60" placeholder="3600" /></span>
      </div>
      <div class="ui-row">
        <span class="ui-label">Step (k)</span>
        <span class="ui-field"><input class="ui-input bal-step" type="number" min="0.001" max="0.2" step="0.01" placeholder="0.02" /></span>
      </div>
      <div class="ui-row">
        <span class="ui-label">Min factor</span>
        <span class="ui-field"><input class="ui-input bal-min" type="number" min="0.1" max="1" step="0.05" placeholder="0.5" /></span>
      </div>
      <div class="ui-row">
        <span class="ui-label">Max factor</span>
        <span class="ui-field"><input class="ui-input bal-max" type="number" min="1" max="3" step="0.05" placeholder="1.5" /></span>
      </div>
      <button class="ui-btn warn bal-reset" type="button">Reset balancing</button>
      <div class="ui-note">Reset clears every loop's learned multiplier back to 1.0 (relearns over days). The step bounds the per-update move; convergence is intentionally slow to match the slab's thermal lag.</div>
    </div>
  </div>
`;

// ========================================
// COMPONENT
// ========================================
export default component({
  tag: 'settings-balancing-card',
  render: template,
  onMount(ctx, el) {
    const modeEl = el.querySelector('.bal-mode');
    const body = el.querySelector('.bal-adaptive-body');
    const intervalEl = el.querySelector('.bal-interval');
    const stepEl = el.querySelector('.bal-step');
    const minEl = el.querySelector('.bal-min');
    const maxEl = el.querySelector('.bal-max');

    const form = cardForm(el);

    const gate = (mode) => { if (body) body.classList.toggle('is-disabled', mode !== 'Adaptive'); };

    form.select(modeEl, {
      read: () => es(gkey.balanceMode) || 'Static',
      commit: (v) => setGlobalSelect('balance_mode', v)
    });
    // Un-fade the adaptive tuning body off the *staged* select value, before Apply.
    modeEl.addEventListener('change', () => gate(modeEl.value));

    function commitNum(gk, settingKey) {
      return (v) => {
        setEntity(gk, { value: v });
        setGlobalNumber(settingKey, v).catch(err => console.error(`[Balancing] ${settingKey} failed:`, err));
      };
    }
    form.num(intervalEl, { read: () => ev(gkey.adaptIntervalS), commit: commitNum(gkey.adaptIntervalS, 'adapt_interval_s') });
    form.num(stepEl, { read: () => ev(gkey.adaptStep), commit: commitNum(gkey.adaptStep, 'adapt_step') });
    form.num(minEl, { read: () => ev(gkey.adaptMin), commit: commitNum(gkey.adaptMin, 'adapt_min') });
    form.num(maxEl, { read: () => ev(gkey.adaptMax), commit: commitNum(gkey.adaptMax, 'adapt_max') });

    el.querySelector('.bal-reset').addEventListener('click', () => {
      resetBalancing().catch(err => console.error('[Balancing] reset failed:', err));
    });

    const fmt = (v, d = 2) => (v != null && Number.isFinite(Number(v))) ? Number(v).toFixed(d) : '—';

    function updateZones() {
      el.querySelectorAll('.bal-zone-body tr').forEach((row) => {
        const z = parseInt(row.getAttribute('data-zone'), 10);
        row.querySelector('.bal-static').textContent = fmt(ev(key.staticFactor(z)));
        row.querySelector('.bal-adapt').textContent = fmt(ev(key.balanceAdapt(z)));
        row.querySelector('.bal-eff').textContent = fmt(ev(key.balanceFactor(z)));
        const err = ev(key.adaptErr(z));
        const cell = row.querySelector('.bal-err');
        cell.classList.remove('cold', 'warm');
        if (err == null || !Number.isFinite(Number(err))) {
          cell.textContent = '—';
        } else {
          cell.textContent = (err >= 0 ? '+' : '') + Number(err).toFixed(2);
          const errorClass = err > 0.05 ? 'cold' : (err < -0.05 ? 'warm' : '');
          if (errorClass) cell.classList.add(errorClass);
        }
      });
    }

    subscribe(gkey.balanceMode, () => { form.refresh(); gate(es(gkey.balanceMode) || 'Static'); });
    subscribe(gkey.adaptIntervalS, form.refresh);
    subscribe(gkey.adaptStep, form.refresh);
    subscribe(gkey.adaptMin, form.refresh);
    subscribe(gkey.adaptMax, form.refresh);
    ZONES.forEach((z) => {
      subscribe(key.staticFactor(z), updateZones);
      subscribe(key.balanceAdapt(z), updateZones);
      subscribe(key.balanceFactor(z), updateZones);
      subscribe(key.adaptErr(z), updateZones);
    });

    form.refresh();
    gate(es(gkey.balanceMode) || 'Static');
    updateZones();
  }
});
