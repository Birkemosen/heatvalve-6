import { component, subscribe } from '../../core/component.js';
import { injectStyle } from '../../core/style.js';
import { cardForm, helpBadge } from '../../core/ui-kit.js';
import { es, ev, isEntityOn, setEntity } from '../../core/store.js';
import { setGlobalSelect, setGlobalNumber } from '../../core/api.js';
import { gkey, key } from '../../utils/keys.js';
import { fmtT } from '../../utils/format.js';

// ========================================
// CSS
// ========================================
const css = `
/* Probe readouts mirror the zone-detail stat style: small uppercase label
   above a large mono value, no cell chrome. */
.settings-manifold-card .probe-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px 20px;
  margin-top: 12px;
}

.settings-manifold-card .probe-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.settings-manifold-card .probe-name {
  color: var(--text-secondary);
  font-size: .64rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.settings-manifold-card .probe-temp {
  font-family: var(--mono);
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-strong);
  line-height: 1;
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
    <div class="ui-card settings-manifold-card">
      <div class="ui-card-title"><span class="ui-title-text">Manifold Configuration${helpBadge('Manifold valve polarity (Normally Open/Closed) and which probes read the flow and return water temperature for the flow–return delta.')}</span></div>
      <div class="ui-row">
        <span class="ui-label">Manifold Type</span>
        <span class="ui-field"><select class="ui-select sm-type"><option value="NO (Normally Open)">Normally Open (NO)</option><option value="NC (Normally Closed)">Normally Closed (NC)</option></select></span>
      </div>
      <div class="ui-row">
        <span class="ui-label">Flow Probe</span>
        <span class="ui-field"><select class="ui-select sm-flow">${probeOptions}</select></span>
      </div>
      <div class="ui-row">
        <span class="ui-label">Return Probe</span>
        <span class="ui-field"><select class="ui-select sm-ret">${probeOptions}</select></span>
      </div>
      <div class="ui-section">Probe Temperatures</div>
      <div class="probe-grid">${probes}</div>

      <div class="ui-section">Minimum Zone Flow</div>
      <div class="ui-row">
        <span class="ui-label">Enabled <span class="ui-sublabel">manual floor for a modulating heat source, independent of the bridge</span></span>
        <span class="ui-field"><div class="ui-toggle sm-minflow-always" role="switch" aria-label="Enable minimum zone flow"></div></span>
      </div>
      <div class="ui-row">
        <span class="ui-label">Min valve opening (%) <span class="ui-sublabel">floor held on every enabled zone while active</span></span>
        <span class="ui-field"><input class="ui-input sm-minflow" type="number" min="0" max="50" step="1" placeholder="15" /></span>
      </div>
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
    const minFlowAlwaysBtn = el.querySelector('.sm-minflow-always');
    const minFlowEl = el.querySelector('.sm-minflow');

    const form = cardForm(el);
    form.select(typeEl, { read: () => es(gkey.manifoldType) || 'NO (Normally Open)', commit: (v) => setGlobalSelect('manifold_type', v) });
    form.select(flowEl, { read: () => es(gkey.manifoldFlowProbe) || 'Probe 7', commit: (v) => setGlobalSelect('manifold_flow_probe', v) });
    form.select(retEl, { read: () => es(gkey.manifoldReturnProbe) || 'Probe 8', commit: (v) => setGlobalSelect('manifold_return_probe', v) });
    form.toggle(minFlowAlwaysBtn, {
      read: () => isEntityOn(gkey.minimumFlowAlways),
      commit: (on) => {
        const next = on ? 'on' : 'off';
        setEntity(gkey.minimumFlowAlways, { state: next });
        setGlobalSelect('minimum_flow_always', next)
          .catch(() => setEntity(gkey.minimumFlowAlways, { state: on ? 'off' : 'on' }));
      }
    });
    form.num(minFlowEl, {
      read: () => ev(gkey.minZoneFlowPct),
      commit: (v) => {
        setEntity(gkey.minZoneFlowPct, { value: v });
        setGlobalNumber('min_zone_flow_pct', v);
      }
    });

    function updateProbes() {
      for (let probe = 1; probe <= 8; probe++) {
        const target = el.querySelector('[data-probe="' + probe + '"]');
        if (target) target.textContent = fmtT(ev(key.probeTemp(probe)));
      }
    }

    subscribe(gkey.manifoldType, form.refresh);
    subscribe(gkey.manifoldFlowProbe, form.refresh);
    subscribe(gkey.manifoldReturnProbe, form.refresh);
    subscribe(gkey.minimumFlowAlways, form.refresh);
    subscribe(gkey.minZoneFlowPct, form.refresh);
    for (let probe = 1; probe <= 8; probe++) subscribe(key.probeTemp(probe), updateProbes);
    form.refresh();
    updateProbes();
  }
});
