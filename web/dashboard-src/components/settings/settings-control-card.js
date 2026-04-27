import { component, subscribe } from '../../core/component.js';
import { injectStyle } from '../../core/style.js';
import { command, setDriversEnabled, setGlobalSelect } from '../../core/api.js';
import { es, isEntityOn } from '../../core/store.js';
import { gkey } from '../../utils/keys.js';

// ========================================
// CSS
// ========================================
const css = `
.settings-control-stack {
  display: grid;
  gap: 14px;
}

.settings-card {
  background: var(--panel-bg-vibrant);
  border: 1px solid var(--panel-border);
  border-radius: 18px;
  padding: 20px;
  box-shadow: var(--panel-shadow);
}

.settings-card .card-title {
  font-size: .84rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1.1px;
  color: var(--accent);
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--panel-border);
}

.settings-card .toggle-row {
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

.settings-card .toggle-label {
  font-size: .88rem;
  font-weight: 700;
  color: var(--text);
}

.settings-card .toggle-row.is-on {
  border-color: rgba(100,255,100,.4);
  background: rgba(45,110,45,.2);
}

/* Match Helios toggle styling for consistency */
.settings-card .ui-toggle {
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

.settings-card .ui-toggle::after {
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

.settings-card .ui-toggle.on {
  background: rgba(121, 209, 126, 0.25);
  border-color: rgba(121, 209, 126, 0.5);
}

.settings-card .ui-toggle.on::after {
  transform: translateX(22px);
  background: #0f213c;
}

.settings-card .btn-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.settings-card .btn {
  width: 100%;
  min-width: 0;
  border: 1px solid var(--control-border);
  background: var(--control-bg);
  color: var(--text-strong);
  border-radius: 10px;
  padding: 9px 14px;
  cursor: pointer;
  font-weight: 700;
  transition: .18s ease;
}

.settings-card .btn:hover {
  background: var(--control-bg-hover);
  border-color: rgba(120,168,255,.52);
  color: var(--text-strong);
}

.settings-card .btn.warn {
  grid-column: 1 / -1;
  border-color: rgba(255,118,118,.5);
  background: rgba(255,118,118,.2);
  color: #FFD9D9;
}

.settings-card .btn.warn:hover {
  background: rgba(255,100,100,.3);
  border-color: rgba(255,100,100,.6);
}

@media (max-width: 640px) {
  .settings-card .btn-row {
    grid-template-columns: 1fr;
  }

  .settings-card .btn.warn {
    grid-column: 1;
  }
}
`;

injectStyle('settings-control-card', css);

// ========================================
// TEMPLATE
// ========================================
const template = () => `
  <div class="settings-control-stack">
    <div class="settings-card settings-functionality-card">
      <div class="card-title">Functionality</div>
      <div class="toggle-row">
        <span class="toggle-label">Motor Drivers</span>
        <div class="ui-toggle drivers-toggle" role="switch" aria-label="Toggle motor drivers"></div>
      </div>
      <div class="toggle-row">
        <span class="toggle-label">Simple Preheat</span>
        <div class="ui-toggle preheat-toggle" role="switch" aria-label="Toggle simple preheat"></div>
      </div>
    </div>

    <div class="settings-card settings-action-card">
      <div class="card-title">Control</div>
      <div class="btn-row">
        <button class="btn sc-reset-probe-map">Reset 1-Wire Probe Map</button>
        <button class="btn sc-dump-1wire">Dump 1-Wire Diagnostics</button>
        <button class="btn warn sc-restart">Restart Device</button>
      </div>
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
    const motorToggle = el.querySelector('.drivers-toggle');
    const preheatToggle = el.querySelector('.preheat-toggle');
    const motorRow = motorToggle.closest('.toggle-row');
    const preheatRow = preheatToggle.closest('.toggle-row');

    function isMotorDriversEnabled() {
      return isEntityOn(gkey.drivers);
    }

    function updateMotorToggle() {
      const enabled = isMotorDriversEnabled();
      motorToggle.classList.toggle('on', enabled);
      motorRow.classList.toggle('is-on', enabled);
      motorToggle.setAttribute('aria-checked', enabled ? 'true' : 'false');
    }

    motorToggle.addEventListener('click', () => {
      setDriversEnabled(!isMotorDriversEnabled());
    });
    subscribe(gkey.drivers, updateMotorToggle);
    updateMotorToggle();

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
