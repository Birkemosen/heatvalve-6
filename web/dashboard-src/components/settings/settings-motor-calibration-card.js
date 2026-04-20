import { component, subscribe } from '../../core/component.js';
import { injectStyle } from '../../core/style.js';
import { ev, es } from '../../core/store.js';
import { setGlobalNumber, setGlobalSelect } from '../../core/api.js';
import { gkey } from '../../utils/keys.js';

const css = `
.settings-motor-cal-card {
  background: var(--panel-bg-vibrant);
  border: 1px solid var(--panel-border);
  border-radius: 18px;
  padding: 20px;
  box-shadow: var(--panel-shadow);
}

.settings-motor-cal-card .card-title {
  font-size: .84rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1.1px;
  color: var(--accent);
  margin-bottom: 8px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--panel-border);
}

.settings-motor-cal-card .hint {
  color: var(--text-secondary);
  font-size: .78rem;
  margin-bottom: 12px;
}

.settings-motor-cal-card .cfg-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.settings-motor-cal-card .cfg-row {
  display: grid;
  gap: 6px;
}

.settings-motor-cal-card .cfg-row.full {
  grid-column: 1 / -1;
}

.settings-motor-cal-card .lbl {
  color: var(--text-secondary);
  font-size: .74rem;
  font-weight: 700;
  letter-spacing: .45px;
  text-transform: uppercase;
}

.settings-motor-cal-card .txt {
  width: 100%;
  border: 1px solid var(--control-border);
  background: var(--control-bg);
  color: var(--text);
  border-radius: 10px;
  padding: 8px 10px;
  font-size: .86rem;
}

.settings-motor-cal-card .sel {
  width: 100%;
  border: 1px solid var(--control-border);
  background: var(--control-bg);
  color: var(--text);
  border-radius: 10px;
  padding: 8px 10px;
  font-size: .86rem;
}

.settings-motor-cal-card .txt:focus {
  outline: 2px solid rgba(83,168,255,.6);
  outline-offset: 1px;
  border-color: rgba(83,168,255,.55);
}

.settings-motor-cal-card .sel:focus {
  outline: 2px solid rgba(83,168,255,.6);
  outline-offset: 1px;
  border-color: rgba(83,168,255,.55);
}

.settings-motor-cal-card .unit {
  color: var(--text-faint);
  font-size: .7rem;
}

.settings-motor-cal-card .runtime-note {
  grid-column: 1 / -1;
  color: var(--state-warn);
  font-size: .74rem;
  border: 1px solid rgba(238,161,17,.35);
  background: rgba(238,161,17,.12);
  border-radius: 10px;
  padding: 8px 10px;
}

@media (max-width: 960px) {
  .settings-motor-cal-card .cfg-grid { grid-template-columns: 1fr; }
}
`;

injectStyle('settings-motor-calibration-card', css);

const FIELDS = [
  { cls: 'safe-runtime', key: 'generic_runtime_limit_seconds', id: gkey.genericRuntimeLimitSeconds, label: 'Max Safe Runtime', unit: 's' },
  { cls: 'close-threshold', key: 'close_threshold_multiplier', id: gkey.closeThresholdMultiplier, label: 'Close Endstop Threshold', unit: 'x' },
  { cls: 'close-slope-threshold', key: 'close_slope_threshold', id: gkey.closeSlopeThreshold, label: 'Close Endstop Slope', unit: 'mA/s' },
  { cls: 'close-slope-floor', key: 'close_slope_current_factor', id: gkey.closeSlopeCurrentFactor, label: 'Close Endstop Slope Floor', unit: 'x' },
  { cls: 'open-threshold', key: 'open_threshold_multiplier', id: gkey.openThresholdMultiplier, label: 'Open Endstop Threshold', unit: 'x' },
  { cls: 'open-slope-threshold', key: 'open_slope_threshold', id: gkey.openSlopeThreshold, label: 'Open Endstop Slope', unit: 'mA/s' },
  { cls: 'open-slope-floor', key: 'open_slope_current_factor', id: gkey.openSlopeCurrentFactor, label: 'Open Endstop Slope Floor', unit: 'x' },
  { cls: 'open-ripple-limit', key: 'open_ripple_limit_factor', id: gkey.openRippleLimitFactor, label: 'Open Ripple Limit', unit: 'x' },
  { cls: 'relearn-movements', key: 'relearn_after_movements', id: gkey.relearnAfterMovements, label: 'Relearn After Movements', unit: 'count' },
  { cls: 'relearn-hours', key: 'relearn_after_hours', id: gkey.relearnAfterHours, label: 'Relearn After Hours', unit: 'h' },
  { cls: 'learn-min-samples', key: 'learned_factor_min_samples', id: gkey.learnedFactorMinSamples, label: 'Learned Factor Min Samples', unit: 'count' },
  { cls: 'learn-max-deviation', key: 'learned_factor_max_deviation_pct', id: gkey.learnedFactorMaxDeviationPct, label: 'Learned Factor Max Deviation', unit: '%' }
];

const template = () => {
  const profile = `
    <div class="cfg-row full">
      <span class="lbl">Motor Type (Default Profile)</span>
      <select class="sel smc-profile">
        <option value="Generic">Generic</option>
        <option value="HmIP VdMot">HmIP VdMot</option>
      </select>
      <span class="unit">Applied as default motor profile</span>
    </div>
    <div class="runtime-note">HmIP-VDMot safety: runtime is fixed to 40s to prevent piston overtravel. Generic allows editable runtime.</div>
  `;

  let rows = '';
  for (let i = 0; i < FIELDS.length; i++) {
    const field = FIELDS[i];
    rows += '<div class="cfg-row">' +
      '<span class="lbl">' + field.label + '</span>' +
      '<input type="number" class="txt smc-' + field.cls + '" value="0" step="0.1">' +
      '<span class="unit">' + field.unit + '</span>' +
      '</div>';
  }

  return `
    <div class="settings-motor-cal-card">
      <div class="card-title">Motor Calibration & Learning</div>
      <div class="hint">Default starting thresholds and learning bounds used by the motor controller.</div>
      <div class="cfg-grid">${profile}${rows}</div>
    </div>
  `;
};

function isIntegerSetting(keyName) {
  return keyName === 'learned_factor_min_samples' ||
    keyName === 'generic_runtime_limit_seconds' ||
    keyName === 'relearn_after_movements' ||
    keyName === 'relearn_after_hours';
}

function formatValue(keyName, value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return '0';
  return isIntegerSetting(keyName) ? String(Math.round(numeric)) : numeric.toFixed(2);
}

export default component({
  tag: 'settings-motor-calibration-card',
  render: template,
  onMount(ctx, el) {
    const profileEl = el.querySelector('.smc-profile');
    const safeRuntimeEl = el.querySelector('.smc-safe-runtime');

    function enforceProfileRuntime(profile) {
      if (profile === 'HmIP VdMot') {
        setGlobalNumber('hmip_runtime_limit_seconds', 40);
      }
      if (profile === 'Generic') {
        const genericRuntime = Number(ev(gkey.genericRuntimeLimitSeconds));
        if (!Number.isFinite(genericRuntime) || genericRuntime <= 0) {
          setGlobalNumber('generic_runtime_limit_seconds', 45);
        }
      }
    }

    function update() {
      const profile = es(gkey.motorProfileDefault) || 'HmIP VdMot';
      if (profileEl) profileEl.value = profile;

      if (safeRuntimeEl) {
        if (profile === 'HmIP VdMot') {
          safeRuntimeEl.value = '40';
          safeRuntimeEl.disabled = true;
        } else {
          safeRuntimeEl.value = formatValue('generic_runtime_limit_seconds', ev(gkey.genericRuntimeLimitSeconds));
          safeRuntimeEl.disabled = false;
        }
      }

      for (let i = 0; i < FIELDS.length; i++) {
        const field = FIELDS[i];
        const input = el.querySelector('.smc-' + field.cls);
        if (!input) continue;
        if (field.key === 'generic_runtime_limit_seconds') continue;
        input.value = formatValue(field.key, ev(field.id));
      }
    }

    if (profileEl) {
      profileEl.addEventListener('change', () => {
        setGlobalSelect('motor_profile_default', profileEl.value);
        enforceProfileRuntime(profileEl.value);
      });
      subscribe(gkey.motorProfileDefault, update);
    }

    for (let i = 0; i < FIELDS.length; i++) {
      const field = FIELDS[i];
      const input = el.querySelector('.smc-' + field.cls);
      if (!input) continue;

      input.addEventListener('change', () => {
        if (field.key === 'generic_runtime_limit_seconds') {
          const profile = es(gkey.motorProfileDefault) || 'HmIP VdMot';
          if (profile !== 'Generic') return;
          setGlobalNumber('generic_runtime_limit_seconds', input.value);
          return;
        }
        setGlobalNumber(field.key, input.value);
      });

      subscribe(field.id, update);
    }

    subscribe(gkey.genericRuntimeLimitSeconds, update);
    subscribe(gkey.hmipRuntimeLimitSeconds, update);

    enforceProfileRuntime(es(gkey.motorProfileDefault) || 'HmIP VdMot');
    update();
  }
});
