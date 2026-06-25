import { component, subscribe } from '../../core/component.js';
import { injectStyle } from '../../core/style.js';
import { cardForm, helpBadgeI18n } from '../../core/ui-kit.js';
import { es, ev, setEntity } from '../../core/store.js';
import { setGlobalSelect, setGlobalNumber, resetBalancing } from '../../core/api.js';
import { gkey } from '../../utils/keys.js';
import { localize, subscribeLanguage } from '../../core/i18n.js';

// ========================================
// CSS — reuses the forecast/asgard card language
// ========================================
const css = `
.settings-balancing-card .bal-reset { width: 100%; }
`;

injectStyle('settings-balancing-card', css);

// ========================================
// TEMPLATE
// ========================================
const template = () => `
  <div class="ui-card settings-balancing-card">
    <div class="ui-card-title"><span class="ui-title-text"><span data-i18n="settings.balancing.title">Hydraulic Balancing</span>${helpBadgeI18n('settings.balancing.help')}</span></div>

    <div class="ui-row">
      <span class="ui-label" data-i18n="settings.balancing.mode">Balancing mode</span>
      <span class="ui-field"><select class="ui-select bal-mode">
        <option value="Static" data-i18n="settings.balancing.static">Static</option>
        <option value="Adaptive" data-i18n="settings.balancing.adaptive">Adaptive</option>
      </select></span>
    </div>
    <div class="ui-note" data-i18n="settings.balancing.note">Static splits flow from the resistance-aware design model (area, pipe, floor). Adaptive adds a slow room-temperature correction on top - no return probes - nudging chronically cold loops open and over-served loops closed over days. It only redistributes flow between loops, never raises total demand.</div>

    <div class="gated-body bal-adaptive-body">
      <div class="ui-section" data-i18n="settings.balancing.tuning">Adaptive tuning</div>
      <div class="ui-row">
        <span class="ui-label" data-i18n="settings.balancing.interval">Update interval (s)</span>
        <span class="ui-field"><input class="ui-input bal-interval" type="number" min="60" max="86400" step="60" placeholder="3600" /></span>
      </div>
      <div class="ui-row">
        <span class="ui-label" data-i18n="settings.balancing.step">Step (k)</span>
        <span class="ui-field"><input class="ui-input bal-step" type="number" min="0.001" max="0.2" step="0.01" placeholder="0.02" /></span>
      </div>
      <div class="ui-row">
        <span class="ui-label" data-i18n="settings.balancing.minFactor">Min factor</span>
        <span class="ui-field"><input class="ui-input bal-min" type="number" min="0.1" max="1" step="0.05" placeholder="0.5" /></span>
      </div>
      <div class="ui-row">
        <span class="ui-label" data-i18n="settings.balancing.maxFactor">Max factor</span>
        <span class="ui-field"><input class="ui-input bal-max" type="number" min="1" max="3" step="0.05" placeholder="1.5" /></span>
      </div>
      <button class="ui-btn warn bal-reset" type="button" data-i18n="settings.balancing.reset">Reset balancing</button>
      <div class="ui-note" data-i18n="settings.balancing.resetNote">Reset clears every loop's learned multiplier back to 1.0 (relearns over days). The step bounds the per-update move; convergence is intentionally slow to match the slab's thermal lag.</div>
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

    subscribe(gkey.balanceMode, () => { form.refresh(); gate(es(gkey.balanceMode) || 'Static'); });
    subscribe(gkey.adaptIntervalS, form.refresh);
    subscribe(gkey.adaptStep, form.refresh);
    subscribe(gkey.adaptMin, form.refresh);
    subscribe(gkey.adaptMax, form.refresh);
    subscribeLanguage(() => localize(el));
    localize(el);

    form.refresh();
    gate(es(gkey.balanceMode) || 'Static');
  }
});
