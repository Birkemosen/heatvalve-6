import { component, subscribe } from '../../core/component.js';
import { injectStyle } from '../../core/style.js';
import { cardForm } from '../../core/ui-kit.js';
import { setGlobalSelect, setGlobalNumber } from '../../core/api.js';
import { es, ev, isEntityOn, setEntity } from '../../core/store.js';
import { gkey } from '../../utils/keys.js';

// ========================================
// CSS — reuses the control/forecast card language
// ========================================
const css = `
.smart-preheat-card .absorb-badge {
  font-size: .7rem;
  font-weight: 800;
  letter-spacing: .8px;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: 8px;
  background: rgba(70,70,70,.28);
  color: #ADADAD;
  border: 1px solid rgba(150,150,150,.25);
}

.smart-preheat-card .absorb-badge.active {
  background: rgba(45,110,45,.36);
  color: #CBFFD0;
  border-color: rgba(100,255,100,.35);
}
`;

injectStyle('smart-preheat-card', css);

// ========================================
// TEMPLATE
// ========================================
const template = () => `
  <div class="ui-card smart-preheat-card">
    <div class="ui-card-title">Preheat</div>
    <div class="ui-row">
      <span class="ui-label">Simple Preheat</span>
      <span class="ui-field"><div class="ui-toggle preheat-toggle" role="switch" aria-label="Toggle simple preheat"></div></span>
    </div>
    <div class="ui-note">Learns a per-zone head-start so a room reaches its setpoint on time despite slab lag.</div>

    <div class="ui-divider"></div>
    <div class="ui-row">
      <span class="ui-label">Preheat Absorption <span class="absorb-badge">idle</span></span>
      <span class="ui-field"><div class="ui-toggle absorb-toggle" role="switch" aria-label="Toggle preheat absorption"></div></span>
    </div>
    <div class="ui-note">When an external optimizer pushes hot water with no zone demanding heat, keeps satisfied zones open so the slab soaks it up instead of fighting it. Releases the instant any zone calls for heat.</div>
    <div class="gated-body absorb-body">
      <div class="ui-row">
        <span class="ui-label">Absorb band (°C)</span>
        <span class="ui-field"><input class="ui-input absorb-band" type="number" min="0" max="5" step="0.1" placeholder="1.0" /></span>
      </div>
      <div class="ui-row">
        <span class="ui-label">Detect delta (°C)</span>
        <span class="ui-field"><input class="ui-input absorb-delta" type="number" min="2" max="25" step="0.5" placeholder="8.0" /></span>
      </div>
    </div>
  </div>
`;

// ========================================
// COMPONENT
// ========================================
export default component({
  tag: 'smart-preheat-card',
  render: template,
  onMount(ctx, el) {
    const preheatToggle = el.querySelector('.preheat-toggle');
    const absorbToggle = el.querySelector('.absorb-toggle');
    const absorbBadge = el.querySelector('.absorb-badge');
    const absorbBandEl = el.querySelector('.absorb-band');
    const absorbDeltaEl = el.querySelector('.absorb-delta');
    const absorbBody = el.querySelector('.absorb-body');

    function isPreheatEnabled() {
      const state = String(es(gkey.simplePreheatEnabled) || '').toLowerCase();
      return state === 'on' || state === 'true' || state === '1' || state === 'enabled';
    }

    const form = cardForm(el);

    // --- simple preheat (adaptive per-zone head-start) ---
    form.toggle(preheatToggle, {
      read: isPreheatEnabled,
      commit: (on) => setGlobalSelect('simple_preheat_enabled', on ? 'on' : 'off')
    });

    // --- preheat absorption (external pre-buffering, e.g. Odin via Asgard) ---
    const gate = (on) => { if (absorbBody) absorbBody.classList.toggle('is-disabled', !on); };
    form.toggle(absorbToggle, {
      read: () => isEntityOn(gkey.preheatAbsorbEnabled),
      onChange: gate,
      commit: (on) => {
        const next = on ? 'on' : 'off';
        setEntity(gkey.preheatAbsorbEnabled, { state: next });
        setGlobalSelect('preheat_absorb_enabled', next);
      }
    });
    form.num(absorbBandEl, {
      read: () => ev(gkey.preheatAbsorbBandC),
      commit: (v) => { setEntity(gkey.preheatAbsorbBandC, { value: v }); setGlobalNumber('preheat_absorb_band_c', v); }
    });
    form.num(absorbDeltaEl, {
      read: () => ev(gkey.preheatDetectDeltaC),
      commit: (v) => { setEntity(gkey.preheatDetectDeltaC, { value: v }); setGlobalNumber('preheat_detect_delta_c', v); }
    });

    // Live "absorbing" badge reflects the running device state.
    function updateBadge() {
      const absorbing = String(es(gkey.preheatAbsorbing) || '').toLowerCase() === 'active';
      absorbBadge.textContent = absorbing ? 'active' : 'idle';
      absorbBadge.classList.toggle('active', absorbing);
    }

    subscribe(gkey.simplePreheatEnabled, form.refresh);
    subscribe(gkey.preheatAbsorbEnabled, form.refresh);
    subscribe(gkey.preheatAbsorbing,     updateBadge);
    subscribe(gkey.preheatAbsorbBandC,   form.refresh);
    subscribe(gkey.preheatDetectDeltaC,  form.refresh);
    form.refresh();
    updateBadge();
  }
});
