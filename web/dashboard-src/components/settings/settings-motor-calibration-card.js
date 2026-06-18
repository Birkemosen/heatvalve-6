import { component, subscribe } from '../../core/component.js';
import { injectStyle } from '../../core/style.js';
import { cardForm } from '../../core/ui-kit.js';
import { ev, es, isEntityOn } from '../../core/store.js';
import { setGlobalNumber, setGlobalSelect, setDriversEnabled } from '../../core/api.js';
import { gkey } from '../../utils/keys.js';

const css = `
.settings-motor-cal-card .runtime-note {
  color: var(--state-warn);
  font-size: .74rem;
  line-height: 1.4;
  border: 1px solid rgba(255,133,49,.35);
  background: rgba(255,133,49,.12);
  border-radius: 10px;
  padding: 8px 10px;
  margin: 10px 0 2px;
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
  let rows = '';
  for (let i = 0; i < FIELDS.length; i++) {
    const field = FIELDS[i];
    const step = isIntegerSetting(field.key) ? '1' : '0.1';
    rows += '<div class="ui-row">' +
      '<span class="ui-label">' + field.label + ' (' + field.unit + ')</span>' +
      '<span class="ui-field">' +
      '<input type="number" class="ui-input smc-' + field.cls + '" value="0" step="' + step + '">' +
      '</span></div>';
  }

  return `
    <div class="ui-card settings-motor-cal-card">
      <div class="ui-card-title">Motor Calibration & Learning</div>
      <div class="ui-row">
        <span class="ui-label">Motor Drivers</span>
        <span class="ui-field"><div class="ui-toggle mc-drivers-toggle" role="switch" aria-label="Toggle motor drivers"></div></span>
      </div>
      <div class="ui-note">Default starting thresholds and learning bounds used by the motor controller.</div>

      <div class="ui-section">Profile</div>
      <div class="ui-row">
        <span class="ui-label">Motor Type (Default Profile)</span>
        <span class="ui-field"><select class="ui-select smc-profile">
          <option value="Generic">Generic</option>
          <option value="HmIP VdMot">HmIP VdMot</option>
        </select></span>
      </div>
      <div class="runtime-note">HmIP-VDMot safety: runtime is fixed to 40s to prevent piston overtravel. Generic allows editable runtime.</div>

      <div class="ui-section">Thresholds &amp; Learning</div>
      ${rows}
    </div>
  `;
};

function isIntegerSetting(keyName) {
  return keyName === 'learned_factor_min_samples' ||
    keyName === 'generic_runtime_limit_seconds' ||
    keyName === 'relearn_after_movements' ||
    keyName === 'relearn_after_hours';
}

export default component({
  tag: 'settings-motor-calibration-card',
  render: template,
  onMount(ctx, el) {
    const profileEl = el.querySelector('.smc-profile');
    const safeRuntimeEl = el.querySelector('.smc-safe-runtime');
    const driversToggle = el.querySelector('.mc-drivers-toggle');

    const form = cardForm(el);

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

    // Motor Drivers enable toggle (merged in from the old Control card).
    form.toggle(driversToggle, { read: () => isEntityOn(gkey.drivers), commit: (on) => setDriversEnabled(on) });

    // Default-profile select. On apply, also normalise the matching runtime.
    form.select(profileEl, {
      read: () => es(gkey.motorProfileDefault) || 'HmIP VdMot',
      commit: (v) => { setGlobalSelect('motor_profile_default', v); enforceProfileRuntime(v); }
    });

    // Safe runtime is fixed at 40 / disabled for HmIP, editable for Generic.
    // Disabled state follows the *committed* profile.
    function updateRuntimeDisabled() {
      const profile = es(gkey.motorProfileDefault) || 'HmIP VdMot';
      safeRuntimeEl.disabled = (profile === 'HmIP VdMot');
    }
    form.num(safeRuntimeEl, {
      read: () => {
        const profile = es(gkey.motorProfileDefault) || 'HmIP VdMot';
        return profile === 'HmIP VdMot' ? 40 : ev(gkey.genericRuntimeLimitSeconds);
      },
      // Only writes a generic runtime when the staged profile is Generic.
      commit: (v) => { if (profileEl.value === 'Generic') setGlobalNumber('generic_runtime_limit_seconds', v); }
    });

    for (let i = 0; i < FIELDS.length; i++) {
      const field = FIELDS[i];
      if (field.key === 'generic_runtime_limit_seconds') continue;  // handled above
      const input = el.querySelector('.smc-' + field.cls);
      if (!input) continue;
      form.num(input, { read: () => ev(field.id), commit: (v) => setGlobalNumber(field.key, v) });
      subscribe(field.id, form.refresh);
    }

    subscribe(gkey.drivers, form.refresh);
    subscribe(gkey.motorProfileDefault, () => { form.refresh(); updateRuntimeDisabled(); });
    subscribe(gkey.genericRuntimeLimitSeconds, form.refresh);
    subscribe(gkey.hmipRuntimeLimitSeconds, form.refresh);

    enforceProfileRuntime(es(gkey.motorProfileDefault) || 'HmIP VdMot');
    form.refresh();
    updateRuntimeDisabled();
  }
});
