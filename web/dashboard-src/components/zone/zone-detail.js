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
  background: radial-gradient(700px 220px at 88% -42%, rgba(83,168,255,.22), transparent 62%), linear-gradient(180deg, rgba(20,44,79,.44), rgba(13,31,58,.38));
  border: 1px solid var(--panel-border);
  border-radius: 18px;
  padding: 20px;
  box-shadow: var(--panel-shadow);
}

.zone-detail .zd-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.zone-detail .zd-title {
  font-size: 1.12rem;
  font-weight: 700;
}

.zone-detail .zd-badge {
  border-radius: 999px;
  padding: 4px 10px;
  font-size: .62rem;
  text-transform: uppercase;
  font-weight: 800;
  letter-spacing: .8px;
  background: rgba(83,168,255,.22);
  color: var(--text-secondary);
  border: 1px solid transparent;
  transition: .18s ease;
}

.zone-detail .zd-badge.badge-heating {
  background: rgba(238,161,17,.18);
  color: var(--state-warn);
  border-color: rgba(238,161,17,.32);
}

.zone-detail .zd-badge.badge-idle {
  background: rgba(121,209,126,.14);
  color: var(--state-ok);
  border-color: rgba(121,209,126,.26);
}

.zone-detail .zd-badge.badge-disabled {
  background: rgba(125,139,167,.1);
  color: var(--state-disabled);
  border-color: rgba(125,139,167,.22);
}

.zone-detail .zd-badge.badge-fault {
  background: rgba(255,118,118,.18);
  color: var(--state-danger);
  border-color: rgba(255,100,100,.32);
}

.zone-detail .zd-control {
  border: 1px solid var(--control-border);
  border-radius: 14px;
  padding: 14px;
  background: linear-gradient(180deg, rgba(83,168,255,.16), rgba(83,168,255,.06));
  margin-bottom: 12px;
}

.zone-detail .zd-kicker {
  font-size: .72rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--text-secondary);
  font-weight: 700;
}

.zone-detail .zd-setpoint {
  font-family: var(--mono);
  font-size: 2.2rem;
  font-weight: 800;
  line-height: 1;
  margin-top: 4px;
  color: var(--accent);
}

.zone-detail .zd-actions {
  display: flex;
  gap: 10px;
  margin-top: 12px;
  margin-bottom: 8px;
}

.zone-detail .zd-toggle {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: var(--text-secondary);
  font-size: .78rem;
  font-weight: 600;
}

.zone-detail .zd-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.zone-detail .zd-stat {
  border: 1px solid var(--control-border);
  border-radius: 12px;
  padding: 10px;
  background: var(--control-bg);
}

.zone-detail .zd-stat span {
  display: block;
  font-size: .72rem;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.zone-detail .zd-stat strong {
  font-size: 1.1rem;
  font-weight: 800;
}

.zone-detail .spb {
  width: 48px;
  height: 40px;
  border-radius: 10px;
  border: 1px solid var(--control-border);
  background: var(--control-bg);
  color: var(--text);
  cursor: pointer;
  font-size: 1.45rem;
  transition: .18s ease;
}

.zone-detail .spb:hover {
  border-color: rgba(238,161,17,.55);
  color: var(--accent);
  background: rgba(238,161,17,.1);
}

.zone-detail .sw {
  width: 48px;
  height: 26px;
  border-radius: 999px;
  background: var(--control-bg-hover);
  position: relative;
  cursor: pointer;
}

.zone-detail .sw::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 20px;
  height: 20px;
  background: #dbe8ff;
  border-radius: 999px;
  transition: .2s ease;
}

.zone-detail .sw.on {
  background: var(--blue);
}

.zone-detail .sw.on::after {
  transform: translateX(22px);
  background: #0f213c;
}

@media (max-width: 560px) {
  .zone-detail .zd-grid { grid-template-columns: 1fr; }
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
    <div class="zd-control">
      <div class="zd-kicker">Target Temperature</div>
      <div class="zd-setpoint">---</div>
      <div class="zd-actions">
        <button class="spb btn-dec">−</button>
        <button class="spb btn-inc">+</button>
      </div>
      <div class="zd-toggle"><span>Zone Enabled</span><div class="sw btn-toggle"></div></div>
    </div>
    <div class="zd-grid">
      <div class="zd-stat"><span>Current Temperature</span><strong class="zd-temp">---</strong></div>
      <div class="zd-stat"><span>Return Temperature</span><strong class="zd-ret">---</strong></div>
      <div class="zd-stat"><span>Flow %</span><strong class="zd-valve">---</strong></div>
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