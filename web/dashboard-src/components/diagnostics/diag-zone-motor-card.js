import { component, subscribe } from '../../core/component.js';
import { injectStyle } from '../../core/style.js';
import { ev, getDashboardValue, subscribeDashboard } from '../../core/store.js';
import { key } from '../../utils/keys.js';
import { setMotorTarget, openMotorTimed, closeMotorTimed, stopMotor, setManualMode } from '../../core/api.js';

// ========================================
// CSS
// ========================================
const css = `
.diag-zone-motor {
  background: var(--panel-bg-vibrant);
  border: 1px solid var(--panel-border);
  border-radius: 18px;
  padding: 18px;
  margin-bottom: 18px;
  box-shadow: var(--panel-shadow);
}
.diag-zone-motor .card-title {
  font-size: .84rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1.1px;
  color: var(--accent);
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--panel-border);
}
.diag-zone-motor .cfg-row {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
  align-items: center;
}
.diag-zone-motor .cfg-row.manual-row {
  justify-content: space-between;
  gap: 16px;
  padding: 8px 0 12px;
  border-bottom: 1px solid var(--panel-border);
  margin-bottom: 14px;
}
.diag-zone-motor .manual-note {
  color: var(--text-secondary);
  font-size: .82rem;
  font-weight: 600;
}
.diag-zone-motor .lbl {
  font-weight: 600;
  color: var(--text);
  min-width: 140px;
}
.diag-zone-motor .mn-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
}
.diag-zone-motor .sel {
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
.diag-zone-motor .sel:focus {
  outline: 2px solid rgba(83,168,255,.6);
  outline-offset: 1px;
  border-color: rgba(83,168,255,.55);
}
.diag-zone-motor .mn-inp {
  background: var(--control-bg);
  border: 1px solid var(--control-border);
  border-radius: 8px;
  padding: 6px 10px;
  color: var(--text);
  font-family: var(--mono);
  width: 80px;
  font-size: .95rem;
  transition: border-color .15s ease;
}
.diag-zone-motor .mn-inp:focus {
  outline: 2px solid rgba(83,168,255,.6);
  outline-offset: 1px;
  border-color: rgba(83,168,255,.55);
}
.diag-zone-motor .mn-unit {
  color: var(--muted);
  font-size: .9rem;
  font-weight: 500;
}
.diag-zone-motor .btn-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}
.diag-zone-motor .btn {
  flex: 1;
  min-width: 100px;
  padding: 8px 12px;
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
.diag-zone-motor .btn:hover {
  background: var(--control-bg-hover);
  border-color: rgba(238,161,17,.5);
  color: #ffe8ba;
}
.diag-zone-motor .btn.warn {
  background: rgba(255,118,118,.2);
  border-color: rgba(255,118,118,.4);
  color: #FFD9D9;
}
.diag-zone-motor .btn.warn:hover {
  background: linear-gradient(135deg, rgba(255,100,100,.3), rgba(255,100,100,.15));
  border-color: rgba(255,100,100,.5);
}
.diag-zone-motor .sw {
  width: 50px;
  height: 28px;
  border-radius: 999px;
  background: var(--control-bg-hover);
  border: 1px solid var(--control-border);
  position: relative;
  cursor: pointer;
  transition: .2s ease;
  flex-shrink: 0;
}
.diag-zone-motor .sw::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 20px;
  height: 20px;
  border-radius: 999px;
  background: #dbe8ff;
  transition: .2s ease;
}
.diag-zone-motor .sw.on {
  background: var(--blue);
  border-color: rgba(83,168,255,.4);
}
.diag-zone-motor .sw.on::after {
  transform: translateX(22px);
  background: #0f213c;
}
.diag-zone-motor .gated {
  transition: opacity .18s ease;
}
.diag-zone-motor .gated.locked {
  opacity: .48;
}
.diag-zone-motor .gated.locked .btn,
.diag-zone-motor .gated.locked .mn-inp,
.diag-zone-motor .gated.locked .sel {
  cursor: not-allowed;
}
`;

injectStyle('diag-zone-motor', css);

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
    <div class="diag-zone-motor">
      <div class="card-title">Motor Control</div>
      <div class="cfg-row manual-row">
        <span class="manual-note">Enable manual mode to suspend automatic management and unlock motor controls.</span>
        <div class="sw manual-mode-toggle" role="switch" aria-checked="false" tabindex="0"></div>
      </div>
      <div class="gated motor-gated locked">
        <div class="cfg-row">
          <span class="lbl">Motor</span>
          <select class="sel motor-zone-select">${zoneOptions}</select>
        </div>
        <div class="cfg-row">
          <span class="lbl">Motor Target</span>
          <div class="mn-wrap">
            <input type="number" class="mn-inp motor-target-input" min="0" max="100" step="1" value="0">
            <span class="mn-unit">%</span>
          </div>
        </div>
        <div class="btn-row">
          <button class="btn motor-open-btn">Open 10s</button>
          <button class="btn motor-close-btn">Close 10s</button>
          <button class="btn warn motor-stop-btn">Stop</button>
        </div>
      </div>
    </div>
  `;
};

// ========================================
// COMPONENT
// ========================================
export default component({
  tag: 'diag-zone-motor-card',
  render: template,
  onMount(ctx, el) {
    let zone = Number(ctx.zone || getDashboardValue('selectedZone') || 1);
    let manualMode = !!getDashboardValue('manualMode');
    const manualToggle = el.querySelector('.manual-mode-toggle');
    const gatedWrap = el.querySelector('.motor-gated');
    const zoneSelect = el.querySelector('.motor-zone-select');
    const motorTargetInput = el.querySelector('.motor-target-input');
    const openBtn = el.querySelector('.motor-open-btn');
    const closeBtn = el.querySelector('.motor-close-btn');
    const stopBtn = el.querySelector('.motor-stop-btn');

    function setControlsEnabled(enabled) {
      manualMode = !!enabled;
      if (manualToggle) {
        manualToggle.classList.toggle('on', manualMode);
        manualToggle.setAttribute('aria-checked', manualMode ? 'true' : 'false');
      }
      if (gatedWrap) gatedWrap.classList.toggle('locked', !manualMode);
      [zoneSelect, motorTargetInput, openBtn, closeBtn, stopBtn].forEach((node) => {
        if (node) node.disabled = !manualMode;
      });
    }

    function toggleManualMode() {
      const next = !manualMode;
      setControlsEnabled(next);
      if (next) {
        setManualMode(true);
        for (let z = 1; z <= 6; z++) stopMotor(z);
      } else {
        setManualMode(false);
      }
    }

    function updateMotorTarget() {
      const target = ev(key.motorTarget(zone));
      if (motorTargetInput && target != null) {
        motorTargetInput.value = Number(target).toFixed(0);
      } else if (motorTargetInput) {
        motorTargetInput.value = '0';
      }
    }

    zoneSelect?.addEventListener('change', () => {
      zone = Number(zoneSelect.value || 1);
      updateMotorTarget();
    });

    manualToggle?.addEventListener('click', toggleManualMode);
    manualToggle?.addEventListener('keydown', (e) => {
      if (e.key !== ' ' && e.key !== 'Enter') return;
      e.preventDefault();
      toggleManualMode();
    });

    // Subscribe to all motor target updates so the active selection stays in sync.
    for (let z = 1; z <= 6; z++) {
      subscribe(key.motorTarget(z), updateMotorTarget);
    }
    updateMotorTarget();
    setControlsEnabled(manualMode);
    subscribeDashboard('manualMode', () => {
      setControlsEnabled(!!getDashboardValue('manualMode'));
    });

    motorTargetInput?.addEventListener('change', (e) => {
      if (!manualMode) return;
      const value = e.target.value;
      setMotorTarget(zone, value);
    });

    openBtn?.addEventListener('click', () => {
      if (!manualMode) return;
      openMotorTimed(zone, 10000);
    });

    closeBtn?.addEventListener('click', () => {
      if (!manualMode) return;
      closeMotorTimed(zone, 10000);
    });

    stopBtn?.addEventListener('click', () => {
      if (!manualMode) return;
      stopMotor(zone);
    });
  }
});
