import { component } from '../../core/component.js';
import { injectStyle } from '../../core/style.js';
import { getDashboardValue } from '../../core/store.js';
import { resetMotorFault, resetMotorLearnedFactors, resetMotorAndRelearn } from '../../core/api.js';

// ========================================
// CSS
// ========================================
const css = `
.diag-zone-recovery {
  background: var(--panel-bg-vibrant);
  border: 1px solid var(--panel-border);
  border-radius: 18px;
  padding: 18px;
  margin-bottom: 18px;
  box-shadow: var(--panel-shadow);
}
.diag-zone-recovery .card-title {
  font-size: .84rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1.1px;
  color: var(--accent);
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--panel-border);
}
.diag-zone-recovery .btn-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.diag-zone-recovery .cfg-row {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
  align-items: center;
}
.diag-zone-recovery .lbl {
  font-weight: 600;
  color: var(--text);
  min-width: 140px;
}
.diag-zone-recovery .sel {
  background: var(--control-bg);
  border: 1px solid var(--control-border);
  border-radius: 8px;
  padding: 6px 10px;
  color: var(--text);
  font-family: var(--mono);
  font-size: .95rem;
  min-width: 140px;
  transition: border-color .15s ease;
}
.diag-zone-recovery .sel:focus {
  outline: 2px solid rgba(83,168,255,.6);
  outline-offset: 1px;
  border-color: rgba(83,168,255,.55);
}
.diag-zone-recovery .btn {
  flex: 1;
  min-width: 140px;
  padding: 10px 14px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: .9rem;
  cursor: pointer;
  background: var(--control-bg);
  border: 1px solid var(--control-border);
  color: var(--text-strong);
  transition: all 0.2s;
}
.diag-zone-recovery .btn:hover {
  background: var(--control-bg-hover);
  border-color: rgba(238,161,17,.5);
  color: #ffe8ba;
}
.diag-zone-recovery .btn.warn {
  background: rgba(255,118,118,.2);
  border-color: rgba(255,118,118,.4);
  color: #FFD9D9;
}
.diag-zone-recovery .btn.warn:hover {
  background: linear-gradient(135deg, rgba(255,100,100,.3), rgba(255,100,100,.15));
  border-color: rgba(255,100,100,.5);
}
`;

injectStyle('diag-zone-recovery', css);

// ========================================
// TEMPLATE
// ========================================
const template = (ctx) => {
  const zone = ctx.zone || getDashboardValue('selectedZone') || 1;
  let zoneOptions = '';
  for (let z = 1; z <= 6; z++) {
    zoneOptions += '<option value="' + z + '"' + (z === zone ? ' selected' : '') + '>Zone ' + z + '</option>';
  }
  return `
    <div class="diag-zone-recovery">
      <div class="card-title">Motor Recovery</div>
      <div class="cfg-row">
        <span class="lbl">Motor</span>
        <select class="sel recovery-zone-select">${zoneOptions}</select>
      </div>
      <div class="btn-row">
        <button class="btn recovery-fault-btn">Reset Fault</button>
        <button class="btn warn recovery-factors-btn">Reset Factors</button>
        <button class="btn accent recovery-relearn-btn">Reset + Relearn</button>
      </div>
    </div>
  `;
};

// ========================================
// COMPONENT
// ========================================
export default component({
  tag: 'diag-zone-recovery-card',
  render: template,
  onMount(ctx, el) {
    let zone = Number(ctx.zone || getDashboardValue('selectedZone') || 1);
    const zoneSelect = el.querySelector('.recovery-zone-select');
    const faultBtn = el.querySelector('.recovery-fault-btn');
    const factorsBtn = el.querySelector('.recovery-factors-btn');
    const relearnBtn = el.querySelector('.recovery-relearn-btn');

    zoneSelect?.addEventListener('change', () => {
      zone = Number(zoneSelect.value || 1);
    });

    faultBtn?.addEventListener('click', () => {
      resetMotorFault(zone);
    });

    factorsBtn?.addEventListener('click', () => {
      if (confirm('Reset learned factors for Zone ' + zone + '?')) {
        resetMotorLearnedFactors(zone);
      }
    });

    relearnBtn?.addEventListener('click', () => {
      if (confirm('Reset + relearn motor for Zone ' + zone + '?')) {
        resetMotorAndRelearn(zone);
      }
    });
  }
});
