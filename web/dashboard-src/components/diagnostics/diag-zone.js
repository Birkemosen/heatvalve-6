import { component, subscribe } from '../../core/component.js';
import { injectStyle } from '../../core/style.js';
import { es, ev, isEntityOn } from '../../core/store.js';
import { fmtT, fmtV } from '../../utils/format.js';
import { key, gkey } from '../../utils/keys.js';

// ========================================
// CSS
// ========================================
const css = `
.diag-zone {
  background: var(--panel-bg-vibrant);
  border: 1px solid var(--panel-border);
  border-radius: 18px;
  padding: 18px;
  margin-bottom: 18px;
  box-shadow: var(--panel-shadow);
}
.diag-zone .card-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: .84rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1.1px;
  color: var(--accent);
  margin-bottom: 14px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--panel-border);
}

.card-title-preheat {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 5px;
  font-size: .72rem;
  font-weight: 800;
  letter-spacing: .4px;
  text-transform: uppercase;
  border: 1.5px solid;
}

.card-title-preheat.on {
  border-color: rgba(100,255,100,.6);
  background: rgba(60,120,60,.4);
  color: #80FF80;
  box-shadow: 0 0 12px rgba(100,255,100,.2);
}

.card-title-preheat.off {
  border-color: rgba(120,120,120,.4);
  background: rgba(40,40,40,.3);
  color: #999999;
}

.card-title-preheat-dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  box-shadow: 0 0 5px currentColor;
  flex-shrink: 0;
}

.card-title-preheat-dot.on {
  background: #60FF60;
  box-shadow: 0 0 8px rgba(96,255,96,.8);
}

.card-title-preheat-dot.off {
  background: #666666;
  box-shadow: 0 0 3px rgba(102,102,102,.4);
}
.dz-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
@media (max-width: 900px) { .dz-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 560px) { .dz-grid { grid-template-columns: 1fr; } }

.dz-zone-card {
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  border-radius: 14px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dz-zone-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.dz-zone-name {
  font-size: .88rem;
  font-weight: 800;
  color: var(--text-strong);
  text-transform: uppercase;
  letter-spacing: .6px;
}
.dz-state-badge {
  font-size: .62rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: .7px;
  border-radius: 999px;
  padding: 3px 9px;
  border: 1px solid transparent;
  background: rgba(125,139,167,.12);
  color: var(--state-disabled);
}
.dz-state-badge.s-heating {
  background: rgba(238,161,17,.15);
  color: var(--state-warn);
  border-color: rgba(238,161,17,.3);
}
.dz-state-badge.s-idle {
  background: rgba(121,209,126,.12);
  color: var(--state-ok);
  border-color: rgba(121,209,126,.24);
}
.dz-state-badge.s-fault {
  background: rgba(255,118,118,.16);
  color: var(--state-danger);
  border-color: rgba(255,100,100,.3);
}

.dz-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}
.dz-stat {
  background: var(--control-bg);
  border: 1px solid var(--control-border);
  border-radius: 8px;
  padding: 6px 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.dz-stat-label {
  font-size: .62rem;
  color: var(--text-secondary);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dz-stat-value {
  font-size: .88rem;
  font-weight: 800;
  color: var(--text-strong);
  font-family: var(--mono);
}

.dz-motor-section {
  border-top: 1px solid var(--panel-border);
  padding-top: 8px;
}
.dz-motor-label {
  font-size: .64rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .7px;
  color: var(--text-secondary);
  margin-bottom: 6px;
}
.dz-motor-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 5px;
}
.dz-motor-param {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--control-bg);
  border: 1px solid var(--control-border);
  border-radius: 7px;
  padding: 5px 8px;
  font-size: .76rem;
  gap: 4px;
}
.dz-motor-param-name {
  color: var(--text-secondary);
  white-space: nowrap;
}
.dz-motor-param-val {
  color: var(--text-strong);
  font-family: var(--mono);
  font-weight: 700;
}

.dz-fault-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 8px;
  border-radius: 7px;
  background: rgba(255,118,118,.1);
  border: 1px solid rgba(255,100,100,.25);
  font-size: .76rem;
  margin-top: 4px;
}
.dz-fault-label {
  color: var(--text-secondary);
  flex-shrink: 0;
}
.dz-fault-val {
  color: var(--state-danger);
  font-weight: 700;
  font-family: var(--mono);
}
`;

injectStyle('diag-zone', css);

// ========================================
// HELPERS
// ========================================
function stateClass(state) {
  if (state === 'HEATING') return 's-heating';
  if (state === 'IDLE') return 's-idle';
  if (state === 'FAULT') return 's-fault';
  return '';
}

function fmtFactor(v) {
  return v != null ? Number(v).toFixed(2) + 'x' : '---';
}

function fmtRipples(v) {
  return v != null ? Number(v).toFixed(0) : '---';
}

function fmtPreheat(v) {
  return v != null ? Number(v).toFixed(2) + 'C' : '---';
}

// ========================================
// TEMPLATE
// ========================================
const template = () => {
  let cards = '';
  for (let zone = 1; zone <= 6; zone++) {
    cards += `
      <div class="dz-zone-card" data-zone="${zone}">
        <div class="dz-zone-head">
          <span class="dz-zone-name">Zone ${zone}</span>
          <span class="dz-state-badge" data-dz-state="${zone}">---</span>
        </div>
        <div class="dz-stats">
          <div class="dz-stat"><span class="dz-stat-label">Room Temp</span><span class="dz-stat-value" data-dz-temp="${zone}">---</span></div>
          <div class="dz-stat"><span class="dz-stat-label">Flow %</span><span class="dz-stat-value" data-dz-valve="${zone}">---</span></div>
          <div class="dz-stat"><span class="dz-stat-label">Return</span><span class="dz-stat-value" data-dz-ret="${zone}">---</span></div>
        </div>
        <div class="dz-motor-section">
          <div class="dz-motor-label">Motor ${zone} learned parameters</div>
          <div class="dz-motor-grid">
            <div class="dz-motor-param"><span class="dz-motor-param-name">Open ripples</span><span class="dz-motor-param-val" data-dz-orip="${zone}">---</span></div>
            <div class="dz-motor-param"><span class="dz-motor-param-name">Close ripples</span><span class="dz-motor-param-val" data-dz-crip="${zone}">---</span></div>
            <div class="dz-motor-param"><span class="dz-motor-param-name">Open factor</span><span class="dz-motor-param-val" data-dz-ofac="${zone}">---</span></div>
            <div class="dz-motor-param"><span class="dz-motor-param-name">Close factor</span><span class="dz-motor-param-val" data-dz-cfac="${zone}">---</span></div>
            <div class="dz-motor-param"><span class="dz-motor-param-name">Preheat advance</span><span class="dz-motor-param-val" data-dz-ph="${zone}">---</span></div>
          </div>
          <div class="dz-fault-row" data-dz-faultrow="${zone}" style="display:none">
            <span class="dz-fault-label">Last fault</span>
            <span class="dz-fault-val" data-dz-fault="${zone}">NONE</span>
          </div>
        </div>
      </div>`;
  }
  return `
    <div class="diag-zone">
      <div class="card-title">
        <span>Zone Snapshot</span>
        <div class="card-title-preheat off" role="status" aria-live="polite" data-preheat-badge>
          <span class="card-title-preheat-dot off"></span>
          <span>Preheat: Off</span>
        </div>
      </div>
      <div class="dz-grid">${cards}</div>
    </div>
  `;
};

// ========================================
// COMPONENT
// ========================================
export default component({
  tag: 'diag-zone',
  render: template,
  onMount(ctx, el) {
    function updateZone(zone) {
      const state = String(es(key.state(zone)) || '').toUpperCase() || 'OFF';
      const enabled = isEntityOn(key.enabled(zone));

      const badgeEl = el.querySelector('[data-dz-state="' + zone + '"]');
      badgeEl.textContent = enabled ? state : 'OFF';
      badgeEl.className = 'dz-state-badge' + (enabled ? ' ' + stateClass(state) : '');

      el.querySelector('[data-dz-temp="' + zone + '"]').textContent = fmtT(ev(key.temp(zone)));
      el.querySelector('[data-dz-valve="' + zone + '"]').textContent = fmtV(ev(key.valve(zone)));
      el.querySelector('[data-dz-ret="' + zone + '"]').textContent = fmtT(ev(gkey.ret));

      el.querySelector('[data-dz-orip="' + zone + '"]').textContent = fmtRipples(ev(key.motorOpenRipples(zone)));
      el.querySelector('[data-dz-crip="' + zone + '"]').textContent = fmtRipples(ev(key.motorCloseRipples(zone)));
      el.querySelector('[data-dz-ofac="' + zone + '"]').textContent = fmtFactor(ev(key.motorOpenFactor(zone)));
      el.querySelector('[data-dz-cfac="' + zone + '"]').textContent = fmtFactor(ev(key.motorCloseFactor(zone)));
      el.querySelector('[data-dz-ph="' + zone + '"]').textContent = fmtPreheat(ev(key.preheatAdvance(zone)));

      const fault = String(es(key.motorLastFault(zone)) || '').toUpperCase();
      const hasFault = fault && fault !== 'NONE' && fault !== 'OK';
      const faultRow = el.querySelector('[data-dz-faultrow="' + zone + '"]');
      faultRow.style.display = hasFault ? 'flex' : 'none';
      if (hasFault) el.querySelector('[data-dz-fault="' + zone + '"]').textContent = fault;
    }

    for (let zone = 1; zone <= 6; zone++) {
      const z = zone;
      const update = () => updateZone(z);
      subscribe(key.state(z), update);
      subscribe(key.enabled(z), update);
      subscribe(key.temp(z), update);
      subscribe(key.valve(z), update);
      subscribe(gkey.ret, update);
      subscribe(key.motorOpenRipples(z), update);
      subscribe(key.motorCloseRipples(z), update);
      subscribe(key.motorOpenFactor(z), update);
      subscribe(key.motorCloseFactor(z), update);
      subscribe(key.preheatAdvance(z), update);
      subscribe(key.motorLastFault(z), update);
      updateZone(z);
    }

    // Update preheat badge on header
    function updatePreheatBadge() {
      const badgeEl = el.querySelector('[data-preheat-badge]');
      const dotEl = badgeEl.querySelector('.card-title-preheat-dot');
      const textEl = badgeEl.querySelector('span:last-child');
      const state = (es(gkey.simplePreheatEnabled) || 'off').toString().toLowerCase();
      const isOn = state === 'on';
      
      badgeEl.classList.toggle('on', isOn);
      badgeEl.classList.toggle('off', !isOn);
      dotEl.classList.toggle('on', isOn);
      dotEl.classList.toggle('off', !isOn);
      textEl.textContent = isOn ? 'Preheat: On' : 'Preheat: Off';
    }

    subscribe(gkey.simplePreheatEnabled, updatePreheatBadge);
    updatePreheatBadge();
  }
});