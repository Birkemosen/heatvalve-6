import { component, subscribe } from '../../core/component.js';
import { injectStyle } from '../../core/style.js';
import { es, getDashboardValue, subscribeDashboard } from '../../core/store.js';
import { setDriversEnabled } from '../../core/api.js';
import { gkey } from '../../utils/keys.js';

// ========================================
// CSS
// ========================================
const css = `
.status-card {
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  border-radius: 18px;
  padding: 20px;
  box-shadow: var(--panel-shadow);
  min-width: 220px;
}
.status-card .card-title {
  font-size: .84rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1.1px;
  color: var(--accent);
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--panel-border);
}
.status-card .st {
  width: 100%;
  border-collapse: collapse;
  color: var(--text-strong);
}
.status-card .st td {
  padding: 6px 0;
  font-size: 1rem;
}
.status-card .st tr:not(:last-child) td {
  border-bottom: 1px solid rgba(255,255,255,.08);
}
.status-card .drv-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
}
.status-card .sw {
  width: 38px;
  height: 22px;
  border-radius: 999px;
  background: var(--state-danger);
  border: 1px solid rgba(255,100,100,.3);
  cursor: pointer;
  margin-left: 6px;
  position: relative;
  flex-shrink: 0;
  transition: background .2s ease, border-color .2s ease;
}
.status-card .sw::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 14px;
  height: 14px;
  background: #dbe8ff;
  border-radius: 999px;
  transition: .2s ease;
}
.status-card .sw.on {
  background: var(--blue);
  border-color: rgba(83,168,255,.4);
}
.status-card .sw.on::after {
  transform: translateX(16px);
  background: #0f213c;
}
.status-card .sw.off {
  background: var(--state-danger);
  border-color: rgba(255,100,100,.3);
}
.status-card .dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: rgba(120,168,255,.35);
  transition: .2s ease;
  flex-shrink: 0;
  display: inline-block;
}
.status-card .dot.on {
  background: var(--blue);
  box-shadow: 0 0 12px rgba(83,168,255,.55);
}
`;
injectStyle('status-card', css);

// ========================================
// TEMPLATE
// ========================================
const template = (ctx) => `
  <div class="card status-card">
    <div class="card-title">Status</div>
    <table class="st">
      <tr>
        <td>Motor Drivers</td>
        <td>
          <div class="drv-toggle">
            <span id="sys-drv">${ctx.motorDrivers}</span>
            <div class="sw ${ctx.motorDriversOn ? 'on' : 'off'}" id="sw-drv"></div>
          </div>
        </td>
      </tr>
      <tr>
        <td>Motor Fault</td>
        <td id="sys-fault">${ctx.motorFault}</td>
      </tr>
      <tr>
        <td>Connection</td>
        <td id="sys-conn"><span class="dot ${ctx.connOn ? 'on' : ''}" id="sys-dot"></span></td>
      </tr>
    </table>
  </div>
`;

// ========================================
// COMPONENT
// ========================================
export default component({
  tag: 'status-card',
  state: () => ({
    motorDrivers: '---',
    motorDriversOn: false,
    motorFault: '---',
    connOn: false
  }),
  render: template,
  methods: {
    update(el) {
      this.motorDriversOn = String(es(gkey.drivers)).toLowerCase() === 'on';
      this.motorDrivers = this.motorDriversOn ? 'ON' : 'OFF';
      this.motorFault = String(es(gkey.fault)).toLowerCase() === 'on' ? 'FAULT' : 'OK';
      this.connOn = getDashboardValue('live') === true;
      const drvEl = el.querySelector('#sys-drv');
      drvEl.textContent = this.motorDrivers;
      drvEl.style.color = this.motorDriversOn ? 'var(--blue)' : 'var(--state-danger)';
      const faultEl = el.querySelector('#sys-fault');
      const isFault = this.motorFault === 'FAULT';
      faultEl.textContent = this.motorFault;
      faultEl.style.color = isFault ? 'var(--state-danger)' : 'var(--state-ok)';
      el.querySelector('#sys-dot').classList.toggle('on', this.connOn);
      el.querySelector('#sw-drv').className = 'sw ' + (this.motorDriversOn ? 'on' : 'off');
    }
  },
  onMount(ctx, el) {
    const update = () => ctx.update(el);
    subscribe(gkey.drivers, update);
    subscribe(gkey.fault, update);
    subscribeDashboard('live', update);
    el.querySelector('#sw-drv').onclick = () => {
      setDriversEnabled(!ctx.motorDriversOn);
    };
    update();
  }
});
