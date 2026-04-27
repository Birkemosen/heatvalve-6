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
  background: linear-gradient(180deg, rgba(20,44,79,.30), rgba(13,31,58,.24));
  border: 1px solid rgba(120,168,255,.30);
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
  background: rgba(238,161,17,.15);
  color: var(--state-warn);
  border-color: rgba(238,161,17,.3);
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

/* Body layout */
.zone-detail .zd-body {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding-top: 14px;
  border-top: 1px solid rgba(120,168,255,.18);
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
  border-color: rgba(238,161,17,.55);
  color: var(--accent);
  background: rgba(238,161,17,.1);
}

.zone-detail .zd-toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 14px;
  border: 1px solid var(--control-border);
  border-radius: 12px;
  background: var(--control-bg);
}

.zone-detail .zd-toggle-label {
  font-size: .88rem;
  font-weight: 700;
  color: var(--text);
}

.zone-detail .zd-toggle-row.is-on {
  border-color: rgba(100,255,100,.4);
  background: rgba(45,110,45,.2);
}

.zone-detail .sw {
  width: 48px;
  height: 26px;
  border-radius: 999px;
  background: var(--control-bg-hover);
  position: relative;
  cursor: pointer;
  flex-shrink: 0;
  border: 1px solid var(--control-border);
  transition: background .2s ease, border-color .2s ease;
}

.zone-detail .sw::after {
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

.zone-detail .sw.on {
  background: rgba(121, 209, 126, 0.25);
  border-color: rgba(121, 209, 126, 0.5);
}

.zone-detail .sw.on::after {
  transform: translateX(22px);
  background: #0f213c;
}

.zone-detail .zd-stats {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.zone-detail .zd-stat {
  padding: 2px 0 6px;
  border-bottom: 1px solid rgba(120,168,255,.22);
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.zone-detail .zd-stat-label {
  font-size: .62rem;
  color: var(--text-secondary);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .5px;
}

.zone-detail .zd-stat-value {
  font-family: var(--mono);
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--text-strong);
  line-height: 1;
}
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
      <span class="zd-badge">---</span>
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
      <div class="zd-toggle-row"><span class="zd-toggle-label">Zone Enabled</span><div class="sw btn-toggle"></div></div>
      <div class="zd-stats">
        <div class="zd-stat"><div class="zd-stat-label">Current Temp</div><div class="zd-stat-value zd-temp">---</div></div>
        <div class="zd-stat"><div class="zd-stat-label">Return Temp</div><div class="zd-stat-value zd-ret">---</div></div>
        <div class="zd-stat"><div class="zd-stat-label">Flow %</div><div class="zd-stat-value zd-valve">---</div></div>
      </div>
    </div>
  </div>
`;

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
      refs.toggleRow.classList.toggle('is-on', enabled);
      refs.toggle.classList.toggle('on', enabled);
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
      toggleRow: el.querySelector('.zd-toggle-row'),
      toggle: el.querySelector('.btn-toggle'),
      inc: el.querySelector('.btn-inc'),
      dec: el.querySelector('.btn-dec')
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
    }
    subscribe('sensor-manifold_return_temperature', update);
    subscribeDashboard('selectedZone', update);
    update();
  }
});