import { component } from '../../core/component.js';
import { injectStyle } from '../../core/style.js';
import { getDashboardValue, subscribeDashboard, zoneLabel } from '../../core/store.js';
import { resetMotorFault, resetMotorLearnedFactors, resetMotorAndRelearn } from '../../core/api.js';
import { localize, subscribeLanguage, t } from '../../core/i18n.js';

// ========================================
// CSS
// ========================================
const css = `
.diag-zone-recovery {
  background: var(--panel-bg-vibrant);
  border: 1px solid var(--panel-border);
  border-radius: 18px;
  padding: 18px;
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
.diag-zone-recovery .recovery-note {
  color: var(--text-secondary);
  font-size: .76rem;
  line-height: 1.4;
  margin-bottom: 12px;
}
.diag-zone-recovery .recovery-status {
  margin-top: 10px;
  font-size: .78rem;
  font-weight: 600;
  min-height: 1.1em;
  opacity: 0;
  transition: opacity .15s ease;
}
.diag-zone-recovery .recovery-status.show { opacity: 1; }
.diag-zone-recovery .recovery-status.ok { color: var(--state-ok); }
.diag-zone-recovery .recovery-status.err { color: var(--state-danger); }
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
  outline: 2px solid rgba(124,155,208,.6);
  outline-offset: 1px;
  border-color: rgba(124,155,208,.55);
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
  border-color: rgba(255,133,49,.5);
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
const template = () => `
    <div class="diag-zone-recovery">
      <div class="card-title" data-i18n="diagnostics.recovery.title">Faults &amp; Relearn</div>
      <div class="recovery-note" data-i18n="diagnostics.recovery.note">Recover the selected zone's motor after a fault or bad calibration.</div>
      <div class="btn-row">
        <button class="btn recovery-fault-btn" data-i18n="diagnostics.recovery.resetFault">Reset Fault</button>
        <button class="btn warn recovery-factors-btn" data-i18n="diagnostics.recovery.resetFactors">Reset Factors</button>
        <button class="btn accent recovery-relearn-btn" data-i18n="diagnostics.recovery.resetRelearn">Reset + Relearn</button>
      </div>
      <div class="recovery-status" role="status"></div>
    </div>
  `;

// ========================================
// COMPONENT — operates on the currently selected zone
// ========================================
export default component({
  tag: 'diag-zone-recovery-card',
  render: template,
  onMount(ctx, el) {
    let zone = Number(getDashboardValue('selectedZone') || 1);
    const faultBtn = el.querySelector('.recovery-fault-btn');
    const factorsBtn = el.querySelector('.recovery-factors-btn');
    const relearnBtn = el.querySelector('.recovery-relearn-btn');
    const statusEl = el.querySelector('.recovery-status');

    subscribeDashboard('selectedZone', () => {
      zone = Number(getDashboardValue('selectedZone') || 1);
    });

    let statusTimer = null;
    function showStatus(msg, ok) {
      statusEl.textContent = msg;
      statusEl.className = 'recovery-status show ' + (ok ? 'ok' : 'err');
      clearTimeout(statusTimer);
      statusTimer = setTimeout(() => { statusEl.classList.remove('show'); }, 4000);
    }

    // Fire the action, then reflect success/failure locally so the click has
    // visible feedback on the Zones page (the activity entry lives in Logs).
    function run(action, sentMsg) {
      const p = action(zone);
      showStatus(sentMsg, true);
      if (p && typeof p.then === 'function') {
        p.then((resp) => {
          if (resp && resp.ok === false) showStatus(t('diagnostics.recovery.rejected'), false);
        }).catch(() => showStatus(t('diagnostics.recovery.unreachable'), false));
      }
    }

    faultBtn?.addEventListener('click', () => {
      run(resetMotorFault, '✓ ' + t('diagnostics.recovery.faultSent', { zone: zoneLabel(zone) }));
    });

    factorsBtn?.addEventListener('click', () => {
      if (confirm(t('diagnostics.recovery.confirmFactors', { zone: zoneLabel(zone) }))) {
        run(resetMotorLearnedFactors, '✓ ' + t('diagnostics.recovery.factorsReset', { zone: zoneLabel(zone) }));
      }
    });

    relearnBtn?.addEventListener('click', () => {
      if (confirm(t('diagnostics.recovery.confirmRelearn', { zone: zoneLabel(zone) }))) {
        run(resetMotorAndRelearn, '✓ ' + t('diagnostics.recovery.relearnStarted', { zone: zoneLabel(zone) }));
      }
    });
    subscribeLanguage(() => localize(el));
    localize(el);
  }
});
