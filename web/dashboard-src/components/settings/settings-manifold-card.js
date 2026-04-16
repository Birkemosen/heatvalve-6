import { component, subscribe } from '../../core/component.js';
import { injectStyle } from '../../core/style.js';
import { es, ev } from '../../core/store.js';
import { setGlobalSelect } from '../../core/api.js';
import { gkey, key } from '../../utils/keys.js';
import { fmtT } from '../../utils/format.js';

// ========================================
// CSS
// ========================================
const css = `
.settings-manifold-card {
  background: var(--panel-bg-vibrant);
  border: 1px solid var(--panel-border);
  border-radius: 18px;
  padding: 20px;
  box-shadow: var(--panel-shadow);
}

.settings-manifold-card .card-title {
  font-size: .84rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1.1px;
  color: var(--accent);
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--panel-border);
}

.settings-manifold-card .cfg-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 6px;
  margin-bottom: 10px;
}

.settings-manifold-card .lbl {
  color: var(--text-secondary);
  font-size: .78rem;
  font-weight: 700;
  letter-spacing: .45px;
  text-transform: uppercase;
}

.settings-manifold-card .sel {
  width: 100%;
  border: 1px solid var(--control-border);
  background: var(--control-bg);
  color: var(--text);
  border-radius: 10px;
  padding: 9px 10px;
  font-size: .88rem;
  transition: border-color .15s ease;
}

.settings-manifold-card .sel:focus {
  outline: 2px solid rgba(83,168,255,.6);
  outline-offset: 1px;
  border-color: rgba(83,168,255,.55);
}

.settings-manifold-card .probe-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin-top: 12px;
}

.settings-manifold-card .probe-cell {
  border: 1px solid var(--control-border);
  border-radius: 10px;
  padding: 10px;
  background: var(--control-bg);
}

.settings-manifold-card .probe-name {
  color: var(--text-secondary);
  font-size: .72rem;
  font-weight: 700;
  letter-spacing: .5px;
}

.settings-manifold-card .probe-temp {
  margin-top: 4px;
  font-size: 1rem;
  font-weight: 800;
}

@media (max-width: 900px) {
  .settings-manifold-card .probe-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
`;

injectStyle('settings-manifold-card', css);

// ========================================
// TEMPLATE
// ========================================
const template = () => {
  let probeOptions = '';
  for (let probe = 1; probe <= 8; probe++) probeOptions += '<option>Probe ' + probe + '</option>';

  let probes = '';
  for (let probe = 1; probe <= 8; probe++) {
    probes += '<div class="probe-cell"><div class="probe-name">Probe ' + probe + '</div><div class="probe-temp" data-probe="' + probe + '">---</div></div>';
  }

  return `
    <div class="settings-manifold-card">
      <div class="card-title">Manifold Configuration</div>
      <div class="cfg-row"><span class="lbl">Manifold Type</span>
        <select class="sel sm-type"><option value="NO (Normally Open)">Normally Open (NO)</option><option value="NC (Normally Closed)">Normally Closed (NC)</option></select>
      </div>
      <div class="cfg-row"><span class="lbl">Flow Probe</span><select class="sel sm-flow">${probeOptions}</select></div>
      <div class="cfg-row"><span class="lbl">Return Probe</span><select class="sel sm-ret">${probeOptions}</select></div>
      <div class="probe-grid">${probes}</div>
    </div>
  `;
};

// ========================================
// COMPONENT
// ========================================
export default component({
  tag: 'settings-manifold-card',
  render: template,
  onMount(ctx, el) {
    const typeEl = el.querySelector('.sm-type');
    const flowEl = el.querySelector('.sm-flow');
    const retEl = el.querySelector('.sm-ret');

    function update() {
      typeEl.value = es(gkey.manifoldType) || 'NC (Normally Closed)';
      flowEl.value = es(gkey.manifoldFlowProbe) || 'Probe 7';
      retEl.value = es(gkey.manifoldReturnProbe) || 'Probe 8';
      for (let probe = 1; probe <= 8; probe++) {
        const target = el.querySelector('[data-probe="' + probe + '"]');
        const value = ev(key.probeTemp(probe));
        if (target) target.textContent = fmtT(value);
      }
    }

    typeEl.addEventListener('change', () => setGlobalSelect('manifold_type', typeEl.value));
    flowEl.addEventListener('change', () => setGlobalSelect('manifold_flow_probe', flowEl.value));
    retEl.addEventListener('change', () => setGlobalSelect('manifold_return_probe', retEl.value));

    subscribe(gkey.manifoldType, update);
    subscribe(gkey.manifoldFlowProbe, update);
    subscribe(gkey.manifoldReturnProbe, update);
    for (let probe = 1; probe <= 8; probe++) subscribe(key.probeTemp(probe), update);
    update();
  }
});
