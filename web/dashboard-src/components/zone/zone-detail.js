import { component, subscribe } from '../../core/component.js';
import { injectStyle } from '../../core/style.js';
import { ev, es, getDashboardValue, isEntityOn, subscribeDashboard, zoneLabel } from '../../core/store.js';
import { fmtT, fmtV } from '../../utils/format.js';
import { setEnabled, setSetpoint } from '../../core/api.js';
import { key } from '../../utils/keys.js';

// ========================================
// CSS (scoped by class)
// ========================================
const css = `
.zone-detail {
  background: linear-gradient(180deg, rgba(0,63,92,.30), rgba(0,32,46,.24));
  border: 1px solid rgba(120,146,200,.30);
  border-radius: 18px;
  padding: 16px 18px;
  box-shadow: var(--panel-shadow);
  height: 100%;
  box-sizing: border-box;
}

.zone-detail .zd-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--panel-border);
}

.zone-detail .zd-title {
  font-size: .95rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: .8px;
  color: var(--text-strong);
}

/* Header-right cluster: enable toggle sits next to the state pill. */
.zone-detail .zd-head-ctrl {
  display: flex;
  align-items: center;
  gap: 10px;
}

.zone-detail .zd-badge {
  border-radius: 999px;
  padding: 3px 9px;
  font-size: .62rem;
  text-transform: uppercase;
  font-weight: 800;
  letter-spacing: .7px;
  background: rgba(125,139,167,.12);
  color: var(--state-disabled);
  border: 1px solid rgba(125,139,167,.22);
  transition: .18s ease;
}

.zone-detail .zd-badge.badge-heating {
  background: rgba(255,133,49,.15);
  color: var(--state-warn);
  border-color: rgba(255,133,49,.3);
}

.zone-detail .zd-badge.badge-idle {
  background: rgba(121,209,126,.12);
  color: var(--state-ok);
  border-color: rgba(121,209,126,.24);
}

.zone-detail .zd-badge.badge-disabled {
  background: rgba(125,139,167,.1);
  color: var(--state-disabled);
  border-color: rgba(125,139,167,.22);
}

.zone-detail .zd-badge.badge-fault {
  background: rgba(255,118,118,.16);
  color: var(--state-danger);
  border-color: rgba(255,100,100,.3);
}

/* Body layout — the header's border-bottom is the only divider (no second
   border-top here, which previously read as a doubled horizontal line). */
.zone-detail .zd-body {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.zone-detail .zd-kicker {
  font-size: .62rem;
  text-transform: uppercase;
  letter-spacing: .8px;
  color: var(--text-secondary);
  font-weight: 700;
  margin-bottom: 4px;
}

.zone-detail .zd-setpoint {
  font-family: var(--mono);
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
  color: var(--accent);
}

.zone-detail .zd-target-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.zone-detail .zd-btns {
  display: flex;
  gap: 6px;
}

.zone-detail .spb {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: 1px solid var(--control-border);
  background: var(--control-bg);
  color: var(--text);
  cursor: pointer;
  font-size: 1.15rem;
  transition: .18s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.zone-detail .spb:hover {
  border-color: rgba(255,133,49,.55);
  color: var(--accent);
  background: rgba(255,133,49,.1);
}

/* Toggle uses the canonical .ui-toggle from the shared ui-kit. */

/* Temperatures on a single row: small uppercase label above a large value. */
.zone-detail .zd-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 28px;
}

.zone-detail .zd-stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.zone-detail .zd-stat-label {
  font-size: .64rem;
  color: var(--text-secondary);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.zone-detail .zd-stat-value {
  font-family: var(--mono);
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-strong);
  line-height: 1;
}

.zone-detail .zd-motor {
  border-top: 1px solid var(--panel-border);
  padding-top: 12px;
  margin-top: 2px;
}
.zone-detail .zd-motor-title {
  font-size: .64rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .7px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}
.zone-detail .zd-motor .zd-stats { margin-top: 2px; }
.zone-detail .zd-fault {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  margin-top: 8px;
  padding: 5px 8px;
  border-radius: 7px;
  background: rgba(255,118,118,.1);
  border: 1px solid rgba(255,100,100,.25);
  font-size: .76rem;
}
/* The [hidden] attribute must beat the display:flex above, or the row shows
   "Last fault NONE" even when there is no fault. */
.zone-detail .zd-fault[hidden] { display: none; }
.zone-detail .zd-fault-label { color: var(--text-secondary); }
.zone-detail .zd-fault-val { color: var(--state-danger); font-weight: 700; font-family: var(--mono); }
`;

// inject once
injectStyle('zone-detail', css);

// ========================================
// TEMPLATE
// ========================================
const template = (ctx) => `
  <div class="zone-detail" data-zone="${ctx.zone}">
    <div class="zd-head">
      <div class="zd-title">${zoneLabel(ctx.zone)}</div>
      <div class="zd-head-ctrl">
        <div class="ui-toggle btn-toggle" role="switch" aria-label="Zone enabled" title="Zone enabled"></div>
        <span class="zd-badge">---</span>
      </div>
    </div>
    <div class="zd-body">
      <div>
        <div class="zd-kicker">Target Temperature</div>
        <div class="zd-target-row">
          <button class="spb btn-dec">−</button>
          <div class="zd-setpoint">---</div>
          <button class="spb btn-inc">+</button>
        </div>
      </div>
      <div class="zd-stats">
        <div class="zd-stat"><div class="zd-stat-label">Current Temp</div><div class="zd-stat-value zd-temp">---</div></div>
        <div class="zd-stat"><div class="zd-stat-label">Return Temp</div><div class="zd-stat-value zd-ret">---</div></div>
        <div class="zd-stat"><div class="zd-stat-label">Flow %</div><div class="zd-stat-value zd-valve">---</div></div>
      </div>
      <div class="zd-motor">
        <div class="zd-motor-title">Motor learned parameters</div>
        <div class="zd-stats">
          <div class="zd-stat"><div class="zd-stat-label">Open Ripples</div><div class="zd-stat-value zd-orip">---</div></div>
          <div class="zd-stat"><div class="zd-stat-label">Close Ripples</div><div class="zd-stat-value zd-crip">---</div></div>
          <div class="zd-stat"><div class="zd-stat-label">Open Factor</div><div class="zd-stat-value zd-ofac">---</div></div>
          <div class="zd-stat"><div class="zd-stat-label">Close Factor</div><div class="zd-stat-value zd-cfac">---</div></div>
          <div class="zd-stat"><div class="zd-stat-label">Preheat Adv.</div><div class="zd-stat-value zd-ph">---</div></div>
        </div>
        <div class="zd-fault" hidden><span class="zd-fault-label">Last fault</span><span class="zd-fault-val">NONE</span></div>
      </div>
    </div>
  </div>
`;

function fmtFactor(v) { return v != null ? Number(v).toFixed(2) + 'x' : '---'; }
function fmtRipples(v) { return v != null ? Number(v).toFixed(0) : '---'; }
function fmtPreheat(v) { return v != null ? Number(v).toFixed(2) + 'C' : '---'; }

// ========================================
// COMPONENT
// ========================================
export default component({
  tag: 'zone-detail',

  state: (props) => ({
    zone: props.zone,
    temp: '---',
    setpoint: '---',
    valve: '---',
    state: '---'
  }),

  render: template,

  methods: {
    update(el, refs) {
      const zone = getDashboardValue('selectedZone');
      const state = String(es(key.state(zone)) || '').toUpperCase();
      const enabled = isEntityOn(key.enabled(zone));

      this.zone = zone;
      el.dataset.zone = String(zone);
      refs.title.textContent = zoneLabel(zone);
      refs.setpoint.textContent = fmtT(ev(key.setpoint(zone)));
      refs.temp.textContent = fmtT(ev(key.temp(zone)));
      refs.ret.textContent = fmtT(ev('sensor-manifold_return_temperature'));
      refs.valve.textContent = fmtV(ev(key.valve(zone)));
      const badge = refs.badge;
      badge.textContent = enabled ? (state || 'IDLE') : 'DISABLED';
      const badgeClass = !enabled ? 'badge-disabled' : state === 'HEATING' ? 'badge-heating' : state === 'IDLE' ? 'badge-idle' : state === 'FAULT' ? 'badge-fault' : '';
      badge.className = 'zd-badge' + (badgeClass ? ' ' + badgeClass : '');
      refs.toggle.classList.toggle('on', enabled);

      // Merged motor-snapshot data
      refs.orip.textContent = fmtRipples(ev(key.motorOpenRipples(zone)));
      refs.crip.textContent = fmtRipples(ev(key.motorCloseRipples(zone)));
      refs.ofac.textContent = fmtFactor(ev(key.motorOpenFactor(zone)));
      refs.cfac.textContent = fmtFactor(ev(key.motorCloseFactor(zone)));
      refs.ph.textContent = fmtPreheat(ev(key.preheatAdvance(zone)));
      const fault = String(es(key.motorLastFault(zone)) || '').toUpperCase();
      const hasFault = fault && fault !== 'NONE' && fault !== 'OK';
      refs.fault.hidden = !hasFault;
      if (hasFault) refs.faultVal.textContent = fault;
    },

    incSetpoint() {
      const z = this.zone;
      const current = ev(key.setpoint(z)) || 20;
      setSetpoint(z, Number((current + 0.5).toFixed(1)));
    },

    decSetpoint() {
      const z = this.zone;
      const current = ev(key.setpoint(z)) || 20;
      setSetpoint(z, Number((current - 0.5).toFixed(1)));
    },

    toggleEnabled() {
      const z = this.zone;
      const current = isEntityOn(key.enabled(z));
      setEnabled(z, !current);
    }
  },

  onMount(ctx, el) {
    const refs = {
      title: el.querySelector('.zd-title'),
      setpoint: el.querySelector('.zd-setpoint'),
      temp: el.querySelector('.zd-temp'),
      ret: el.querySelector('.zd-ret'),
      valve: el.querySelector('.zd-valve'),
      badge: el.querySelector('.zd-badge'),
      toggle: el.querySelector('.btn-toggle'),
      inc: el.querySelector('.btn-inc'),
      dec: el.querySelector('.btn-dec'),
      orip: el.querySelector('.zd-orip'),
      crip: el.querySelector('.zd-crip'),
      ofac: el.querySelector('.zd-ofac'),
      cfac: el.querySelector('.zd-cfac'),
      ph: el.querySelector('.zd-ph'),
      fault: el.querySelector('.zd-fault'),
      faultVal: el.querySelector('.zd-fault-val')
    };

    refs.inc.onclick = () => ctx.incSetpoint();
    refs.dec.onclick = () => ctx.decSetpoint();
    refs.toggle.onclick = () => ctx.toggleEnabled();

    const update = () => ctx.update(el, refs);
    const updateIfSelectedZone = (id) => {
      const zone = getDashboardValue('selectedZone');
      if (
        id === key.temp(zone) ||
        id === key.setpoint(zone) ||
        id === key.valve(zone) ||
        id === key.state(zone) ||
        id === key.enabled(zone)
      ) {
        update();
      }
    };

    for (let zone = 1; zone <= 6; zone++) {
      subscribe(key.temp(zone), updateIfSelectedZone);
      subscribe(key.setpoint(zone), updateIfSelectedZone);
      subscribe(key.valve(zone), updateIfSelectedZone);
      subscribe(key.state(zone), updateIfSelectedZone);
      subscribe(key.enabled(zone), updateIfSelectedZone);
      // Merged motor-snapshot fields (update() re-reads the selected zone).
      subscribe(key.motorOpenRipples(zone), update);
      subscribe(key.motorCloseRipples(zone), update);
      subscribe(key.motorOpenFactor(zone), update);
      subscribe(key.motorCloseFactor(zone), update);
      subscribe(key.preheatAdvance(zone), update);
      subscribe(key.motorLastFault(zone), update);
    }
    subscribe('sensor-manifold_return_temperature', update);
    subscribeDashboard('selectedZone', update);
    update();
  }
});