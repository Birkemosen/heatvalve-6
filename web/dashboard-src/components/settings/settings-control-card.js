import { component } from '../../core/component.js';
import { injectStyle } from '../../core/style.js';
import { command } from '../../core/api.js';
import { setGlobalSelect } from '../../core/api.js';
import { subscribe } from '../../core/component.js';
import { es } from '../../core/store.js';
import { gkey } from '../../utils/keys.js';

// ========================================
// CSS
// ========================================
const css = `
.settings-control-card {
  background: var(--panel-bg-vibrant);
  border: 1px solid var(--panel-border);
  border-radius: 18px;
  padding: 20px;
  box-shadow: var(--panel-shadow);
}

.settings-control-card .card-title {
  font-size: .84rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1.1px;
  color: var(--accent);
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--panel-border);
}

.settings-control-card .btn-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.settings-control-card .btn {
  flex: 1;
  min-width: 180px;
  border: 1px solid var(--control-border);
  background: var(--control-bg);
  color: var(--text-strong);
  border-radius: 10px;
  padding: 9px 14px;
  cursor: pointer;
  font-weight: 700;
  transition: .18s ease;
}

.settings-control-card .btn:hover {
  background: var(--control-bg-hover);
  border-color: rgba(120,168,255,.52);
  color: var(--text-strong);
}

.settings-control-card .btn.warn {
  border: 1px solid rgba(255,118,118,.5);
  background: rgba(255,118,118,.2);
  color: #FFD9D9;
}

.settings-control-card .btn.warn:hover {
  background: rgba(255,100,100,.3);
  border-color: rgba(255,100,100,.6);
}

.settings-control-card .btn.sc-simple-preheat {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.settings-control-card .btn.sc-simple-preheat.is-on {
  border-color: rgba(100,255,100,.65);
  background: rgba(45,110,45,.36);
  color: #CBFFD0;
  box-shadow: inset 0 0 0 1px rgba(100,255,100,.2);
}

.settings-control-card .btn.sc-simple-preheat.is-off {
  border-color: rgba(170,170,170,.45);
  background: rgba(70,70,70,.22);
  color: #DEDEDE;
}

.settings-control-card .btn.sc-simple-preheat .preheat-state {
  font-weight: 800;
  letter-spacing: .45px;
}

.settings-control-card .btn.sc-simple-preheat .preheat-action {
  font-size: .66rem;
  text-transform: uppercase;
  opacity: .95;
}
`;

injectStyle('settings-control-card', css);

// ========================================
// TEMPLATE
// ========================================
const template = () => `
  <div class="settings-control-card">
    <div class="card-title">Control</div>
    <div class="btn-row">
      <button class="btn sc-simple-preheat">
        <span class="preheat-state">Simple Preheat: ---</span>
        <span class="preheat-action">Toggle</span>
      </button>
      <button class="btn sc-reset-probe-map">Reset 1-Wire Probe Map</button>
      <button class="btn sc-dump-1wire">Dump 1-Wire Diagnostics</button>
      <button class="btn warn sc-restart">Restart Device</button>
    </div>
  </div>
`;

// ========================================
// COMPONENT
// ========================================
export default component({
  tag: 'settings-control-card',
  render: template,
  onMount(ctx, el) {
    const preheatBtn = el.querySelector('.sc-simple-preheat');
    const preheatStateEl = preheatBtn.querySelector('.preheat-state');
    const preheatActionEl = preheatBtn.querySelector('.preheat-action');

    function isPreheatEnabled() {
      const state = String(es(gkey.simplePreheatEnabled) || '').toLowerCase();
      return state === 'on' || state === 'true' || state === '1' || state === 'enabled';
    }

    function updatePreheatLabel() {
      const enabled = isPreheatEnabled();
      preheatBtn.classList.toggle('is-on', enabled);
      preheatBtn.classList.toggle('is-off', !enabled);
      preheatStateEl.textContent = 'Simple Preheat: ' + (enabled ? 'ENABLED' : 'DISABLED');
      preheatActionEl.textContent = enabled ? 'Tap to disable' : 'Tap to enable';
    }

    preheatBtn.addEventListener('click', () => {
      const nextEnabled = !isPreheatEnabled();
      setGlobalSelect('simple_preheat_enabled', nextEnabled ? 'on' : 'off');
    });
    subscribe(gkey.simplePreheatEnabled, updatePreheatLabel);
    updatePreheatLabel();

    el.querySelector('.sc-reset-probe-map').addEventListener('click', () => {
      command('reset_1wire_probe_map_reboot');
    });

    el.querySelector('.sc-dump-1wire').addEventListener('click', () => {
      command('dump_1wire_probe_diagnostics');
    });

    el.querySelector('.sc-restart').addEventListener('click', () => {
      command('restart');
    });
  }
});
