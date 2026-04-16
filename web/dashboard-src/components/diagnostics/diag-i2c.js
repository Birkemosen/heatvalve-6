import { component } from '../../core/component.js';
import { injectStyle } from '../../core/style.js';
import { getDashboardValue, subscribeDashboard } from '../../core/store.js';
import { runI2cScan } from '../../core/api.js';

// ========================================
// CSS
// ========================================
const css = `
.diag-i2c {
  background: var(--panel-bg-vibrant);
  border: 1px solid var(--panel-border);
  border-radius: 18px;
  padding: 18px;
  margin-bottom: 18px;
  box-shadow: var(--panel-shadow);
}
.diag-i2c .card-title {
  font-size: .84rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1.1px;
  color: var(--accent);
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--panel-border);
}
.diag-i2c pre {
  background: var(--control-bg);
  border: 1px solid var(--control-border);
  color: var(--text-strong);
  border-radius: 8px;
  padding: 10px;
  font-size: .92rem;
  overflow-x: auto;
  margin: 0;
}
.btn-row { margin-top: 12px; }
.btn { padding: 7px 14px; border-radius: 10px; border: 1px solid var(--control-border); background: var(--control-bg); color: var(--text-strong); font-weight: 700; cursor: pointer; }
.btn:hover { background: var(--control-bg-hover); border-color: rgba(238,161,17,.5); color: #ffe7b9; }
.diag-i2c .fault {
    color: var(--red);
    font-weight: bold;
}`;

injectStyle('diag-i2c', css);

// ========================================
// TEMPLATE
// ========================================
const template = () => `
  <div class="diag-i2c">
    <div class="card-title">I2C Diagnostics</div>
    <div class="btn-row">
      <button class="btn" id="btn-i2c-scan">Scan I2C Bus</button>
    </div>
    <pre id="i2c-result">No scan has been run yet.</pre>
  </div>
`;

// ========================================
// COMPONENT
// ========================================
export default component({
  tag: 'diag-i2c',
  render: template,
  onMount(ctx, el) {
    const resultEl = el.querySelector('#i2c-result');

    function update() {
      resultEl.textContent = getDashboardValue('i2cResult') || 'No scan has been run yet.';
    }

    el.querySelector('#btn-i2c-scan').addEventListener('click', () => {
      runI2cScan();
    });

    subscribeDashboard('i2cResult', update);
    update();
  }
});
