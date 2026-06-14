import { component, subscribe } from '../../core/component.js';
import { injectStyle } from '../../core/style.js';
import { setGlobalSelect, setGlobalNumber } from '../../core/api.js';
import { es, ev, isEntityOn, setEntity } from '../../core/store.js';
import { gkey } from '../../utils/keys.js';

// ========================================
// CSS — reuses the control/forecast card language
// ========================================
const css = `
.smart-preheat-card {
  background: var(--panel-bg-vibrant);
  border: 1px solid var(--panel-border);
  border-radius: 18px;
  padding: 20px;
  box-shadow: var(--panel-shadow);
}

.smart-preheat-card .card-title {
  font-size: .84rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1.1px;
  color: var(--accent);
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--panel-border);
}

.smart-preheat-card .toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
  padding: 10px 14px;
  border: 1px solid var(--control-border);
  border-radius: 12px;
  background: var(--control-bg);
}

.smart-preheat-card .toggle-label {
  font-size: .88rem;
  font-weight: 700;
  color: var(--text);
}

.smart-preheat-card .toggle-row.is-on {
  border-color: rgba(100,255,100,.4);
  background: rgba(45,110,45,.2);
}

.smart-preheat-card .ui-toggle {
  width: 48px;
  height: 26px;
  border-radius: 999px;
  background: var(--control-bg-hover);
  position: relative;
  cursor: pointer;
  border: 1px solid var(--control-border);
  transition: background .2s ease, border-color .2s ease;
  flex-shrink: 0;
}

.smart-preheat-card .ui-toggle::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  background: #dbe8ff;
  border-radius: 999px;
  transition: transform .2s ease;
}

.smart-preheat-card .ui-toggle.on {
  background: rgba(121, 209, 126, 0.25);
  border-color: rgba(121, 209, 126, 0.5);
}

.smart-preheat-card .ui-toggle.on::after {
  transform: translateX(22px);
  background: #0f213c;
}

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

.smart-preheat-card .num-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 10px;
}

.smart-preheat-card .num-row .lbl {
  display: block;
  color: var(--text-secondary);
  font-size: .74rem;
  font-weight: 700;
  letter-spacing: .45px;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.smart-preheat-card .num-row .inp {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid var(--control-border);
  background: var(--control-bg);
  color: var(--text);
  border-radius: 10px;
  padding: 8px 10px;
  font-size: .88rem;
}

.smart-preheat-card .note {
  color: var(--text-secondary);
  font-size: .75rem;
  margin-top: 6px;
  line-height: 1.4;
}
`;

injectStyle('smart-preheat-card', css);

// ========================================
// TEMPLATE
// ========================================
const template = () => `
  <div class="smart-preheat-card">
    <div class="card-title">Preheat</div>
    <div class="toggle-row">
      <span class="toggle-label">Simple Preheat</span>
      <div class="ui-toggle preheat-toggle" role="switch" aria-label="Toggle simple preheat"></div>
    </div>
    <div class="toggle-row">
      <span class="toggle-label">Preheat Absorption <span class="absorb-badge">idle</span></span>
      <div class="ui-toggle absorb-toggle" role="switch" aria-label="Toggle preheat absorption"></div>
    </div>
    <div class="num-row">
      <div>
        <span class="lbl">Absorb band (°C)</span>
        <input class="inp absorb-band" type="number" min="0" max="5" step="0.1" placeholder="1.0" />
      </div>
      <div>
        <span class="lbl">Detect delta (°C)</span>
        <input class="inp absorb-delta" type="number" min="2" max="25" step="0.5" placeholder="8.0" />
      </div>
    </div>
    <div class="note">Simple Preheat learns a per-zone head-start so a room reaches setpoint on time despite slab lag. Preheat Absorption keeps satisfied zones open while an external optimizer pre-buffers hot water.</div>
  </div>
`;

// ========================================
// COMPONENT
// ========================================
export default component({
  tag: 'smart-preheat-card',
  render: template,
  onMount(ctx, el) {
    // --- simple preheat (adaptive per-zone head-start) ---
    const preheatToggle = el.querySelector('.preheat-toggle');
    const preheatRow = preheatToggle.closest('.toggle-row');

    function isPreheatEnabled() {
      const state = String(es(gkey.simplePreheatEnabled) || '').toLowerCase();
      return state === 'on' || state === 'true' || state === '1' || state === 'enabled';
    }

    function updatePreheatToggle() {
      const enabled = isPreheatEnabled();
      preheatToggle.classList.toggle('on', enabled);
      preheatRow.classList.toggle('is-on', enabled);
      preheatToggle.setAttribute('aria-checked', enabled ? 'true' : 'false');
    }

    preheatToggle.addEventListener('click', () => {
      const nextEnabled = !isPreheatEnabled();
      setGlobalSelect('simple_preheat_enabled', nextEnabled ? 'on' : 'off');
    });
    subscribe(gkey.simplePreheatEnabled, updatePreheatToggle);
    updatePreheatToggle();

    // --- preheat absorption (external pre-buffering, e.g. Odin via Asgard) ---
    const absorbToggle = el.querySelector('.absorb-toggle');
    const absorbRow = absorbToggle.closest('.toggle-row');
    const absorbBadge = el.querySelector('.absorb-badge');
    const absorbBandEl = el.querySelector('.absorb-band');
    const absorbDeltaEl = el.querySelector('.absorb-delta');

    function updateAbsorbToggle() {
      const enabled = isEntityOn(gkey.preheatAbsorbEnabled);
      absorbToggle.classList.toggle('on', enabled);
      absorbRow.classList.toggle('is-on', enabled);
      absorbToggle.setAttribute('aria-checked', enabled ? 'true' : 'false');

      const absorbing = String(es(gkey.preheatAbsorbing) || '').toLowerCase() === 'active';
      absorbBadge.textContent = absorbing ? 'active' : 'idle';
      absorbBadge.classList.toggle('active', absorbing);
    }

    absorbToggle.addEventListener('click', () => {
      const next = isEntityOn(gkey.preheatAbsorbEnabled) ? 'off' : 'on';
      setEntity(gkey.preheatAbsorbEnabled, { state: next });
      setGlobalSelect('preheat_absorb_enabled', next);
    });

    function populateAbsorbInputs() {
      const band = ev(gkey.preheatAbsorbBandC);
      const delta = ev(gkey.preheatDetectDeltaC);
      if (document.activeElement !== absorbBandEl && band != null) absorbBandEl.value = band;
      if (document.activeElement !== absorbDeltaEl && delta != null) absorbDeltaEl.value = delta;
    }

    absorbBandEl.addEventListener('blur', () => {
      const v = parseFloat(absorbBandEl.value);
      if (v >= 0 && v <= 5) {
        setEntity(gkey.preheatAbsorbBandC, { value: v });
        setGlobalNumber('preheat_absorb_band_c', v);
      }
    });

    absorbDeltaEl.addEventListener('blur', () => {
      const v = parseFloat(absorbDeltaEl.value);
      if (v >= 2 && v <= 25) {
        setEntity(gkey.preheatDetectDeltaC, { value: v });
        setGlobalNumber('preheat_detect_delta_c', v);
      }
    });

    subscribe(gkey.preheatAbsorbEnabled, updateAbsorbToggle);
    subscribe(gkey.preheatAbsorbing,     updateAbsorbToggle);
    subscribe(gkey.preheatAbsorbBandC,   populateAbsorbInputs);
    subscribe(gkey.preheatDetectDeltaC,  populateAbsorbInputs);
    updateAbsorbToggle();
    populateAbsorbInputs();
  }
});
