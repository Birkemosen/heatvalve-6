import { component, subscribe } from '../../core/component.js';
import { injectStyle } from '../../core/style.js';
import { cardForm, helpBadge } from '../../core/ui-kit.js';
import { es, ev, isEntityOn, setEntity } from '../../core/store.js';
import { setGlobalSelect, setGlobalNumber, setGlobalText } from '../../core/api.js';
import { gkey } from '../../utils/keys.js';

// ========================================
// CSS — reuses the helios card visual language
// ========================================
const css = `
.settings-asgard-card .asgard-role-badge {
  font-size: .72rem;
  font-weight: 800;
  letter-spacing: .9px;
  text-transform: uppercase;
  padding: 3px 10px;
  border-radius: 8px;
  flex-shrink: 0;
}
.settings-asgard-card .asgard-role-badge.master {
  background: rgba(45,110,45,.36);
  color: #CBFFD0;
  border: 1px solid rgba(100,255,100,.35);
}
.settings-asgard-card .asgard-role-badge.slave {
  background: rgba(70,70,70,.28);
  color: #ADADAD;
  border: 1px solid rgba(150,150,150,.25);
}

.settings-asgard-card .setpoint-box {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px 14px;
  border: 1px solid var(--control-border);
  border-radius: 12px;
  background: var(--control-bg);
  margin-top: 8px;
}
.settings-asgard-card .setpoint-val {
  font-size: 1.6rem;
  font-weight: 800;
  letter-spacing: .3px;
  color: var(--accent);
  line-height: 1;
  font-family: var(--mono);
}

.settings-asgard-card .status-grid {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 6px 14px;
  font-size: .82rem;
  color: var(--text-secondary);
  margin-top: 8px;
}
.settings-asgard-card .status-grid .val { color: var(--text); font-weight: 600; }
.settings-asgard-card .status-grid .val.warn { color: #FFE9A0; }
`;

injectStyle('settings-asgard-card', css);

// ========================================
// TEMPLATE
// ========================================
const template = () => `
  <div class="ui-card settings-asgard-card">
    <div class="ui-card-title">
      <span class="ui-title-text">Asgard / Ecodan Bridge${helpBadge('Pushes the house-weighted room temperature to the Ecodan/Asgard virtual thermostat. One board is the coordinator and aggregates zones from both boards; the other is a slave.')}</span>
      <span class="asgard-role-badge slave">slave</span>
    </div>

    <div class="ui-row">
      <span class="ui-label">Bridge enabled</span>
      <span class="ui-field"><div class="ui-toggle sa-enable" role="switch" aria-label="Toggle Asgard bridge"></div></span>
    </div>

    <div class="ui-section">Minimum zone flow</div>
    <div class="ui-row">
      <span class="ui-label">Always enforce <span class="ui-sublabel">use when a modulating heat source is attached without enabling this bridge</span></span>
      <span class="ui-field"><div class="ui-toggle sa-minflow-always" role="switch" aria-label="Always enforce minimum zone flow"></div></span>
    </div>
    <div class="ui-row">
      <span class="ui-label">Min valve opening (%) <span class="ui-sublabel">floor held on every enabled zone while the bridge or this option is active</span></span>
      <span class="ui-field"><input class="ui-input sa-minflow" type="number" min="0" max="50" step="1" placeholder="15" /></span>
    </div>

    <div class="gated-body sa-body">
      <div class="ui-row">
        <span class="ui-label">Coordinator <span class="ui-sublabel">pushes to Asgard</span></span>
        <span class="ui-field"><div class="ui-toggle sa-coord" role="switch" aria-label="Toggle coordinator role"></div></span>
      </div>

      <div class="ui-section">Asgard</div>
      <div class="ui-row">
        <span class="ui-label">Host</span>
        <span class="ui-field"><input class="ui-input wide sa-host" type="text" placeholder="ecodan-heatpump.local" maxlength="63" /></span>
      </div>
      <div class="ui-row">
        <span class="ui-label">Port</span>
        <span class="ui-field"><input class="ui-input sa-port" type="number" min="1" max="65535" step="1" placeholder="80" /></span>
      </div>
      <div class="ui-row">
        <span class="ui-label">Number entity <span class="ui-sublabel">REST object_id for the weighted house temp</span></span>
        <span class="ui-field"><input class="ui-input wide sa-entity" type="text" maxlength="47" placeholder="virtual_thermostat_input_z1" /></span>
      </div>

      <div class="ui-section">Peer board</div>
      <div class="ui-row">
        <span class="ui-label">Peer host</span>
        <span class="ui-field"><input class="ui-input wide sa-peer" type="text" placeholder="empty = single board" maxlength="63" /></span>
      </div>
      <div class="ui-row">
        <span class="ui-label">Push interval (s)</span>
        <span class="ui-field"><input class="ui-input sa-interval" type="number" min="5" max="3600" step="1" placeholder="30" /></span>
      </div>

      <div class="ui-section">Recommended setpoint</div>
      <div class="setpoint-box">
        <span class="setpoint-val sa-st-setpoint">—</span>
        <span class="ui-note">Fixed value to set as the virtual thermostat setpoint in Asgard — the area-weighted target of all enabled zones (derived from static zone settings, not live status).</span>
      </div>

      <div class="ui-section">Status</div>
      <div class="status-grid">
        <span>Peer</span><span class="val sa-st-peer">n/a</span>
        <span>Last push</span><span class="val sa-st-push">—</span>
        <span>Zones weighted</span><span class="val sa-st-zones">—</span>
        <span>Last error</span><span class="val sa-st-err">—</span>
      </div>
    </div>
  </div>
`;

// ========================================
// COMPONENT
// ========================================
export default component({
  tag: 'settings-asgard-card',
  render: template,
  onMount(ctx, el) {
    const badge     = el.querySelector('.asgard-role-badge');
    const enableBtn = el.querySelector('.sa-enable');
    const coordBtn  = el.querySelector('.sa-coord');
    const hostEl    = el.querySelector('.sa-host');
    const portEl    = el.querySelector('.sa-port');
    const entityEl  = el.querySelector('.sa-entity');
    const peerEl    = el.querySelector('.sa-peer');
    const intervalEl = el.querySelector('.sa-interval');
    const minFlowAlwaysBtn = el.querySelector('.sa-minflow-always');
    const minFlowEl  = el.querySelector('.sa-minflow');
    const stPeer    = el.querySelector('.sa-st-peer');
    const stPush    = el.querySelector('.sa-st-push');
    const stSetpoint = el.querySelector('.sa-st-setpoint');
    const stZones   = el.querySelector('.sa-st-zones');
    const stErr     = el.querySelector('.sa-st-err');
    const body      = el.querySelector('.sa-body');

    const form = cardForm(el);

    function commitToggle(key, settingKey, label) {
      return (on) => {
        const next = on ? 'on' : 'off';
        setEntity(key, { state: next });
        setGlobalSelect(settingKey, next)
          .catch(err => {
            console.error(`[Asgard] Failed to update ${label}:`, err);
            setEntity(key, { state: on ? 'off' : 'on' });
          });
      };
    }
    // Fade + lock the rest of the card based on the *staged* bridge toggle.
    const gate = (on) => body.classList.toggle('is-disabled', !on);
    form.toggle(enableBtn, { read: () => isEntityOn(gkey.asgardEnabled), commit: commitToggle(gkey.asgardEnabled, 'asgard_enabled', 'enabled'), onChange: gate });
    form.toggle(coordBtn,  { read: () => isEntityOn(gkey.asgardCoordinator), commit: commitToggle(gkey.asgardCoordinator, 'asgard_coordinator', 'coordinator') });
    form.toggle(minFlowAlwaysBtn, { read: () => isEntityOn(gkey.minimumFlowAlways), commit: commitToggle(gkey.minimumFlowAlways, 'minimum_flow_always', 'minimum flow') });

    function commitText(key, settingKey) {
      return (v) => {
        setEntity(key, { state: v });
        setGlobalText(settingKey, v).catch(err => console.error(`[Asgard] Failed to update ${settingKey}:`, err));
      };
    }
    form.text(hostEl,   { read: () => es(gkey.asgardHost), commit: commitText(gkey.asgardHost, 'asgard_host') });
    form.text(entityEl, { read: () => es(gkey.asgardEntityName), commit: commitText(gkey.asgardEntityName, 'asgard_entity_name') });
    form.text(peerEl,   { read: () => es(gkey.asgardPeerHost), commit: commitText(gkey.asgardPeerHost, 'asgard_peer_host') });

    function commitNum(key, settingKey) {
      return (v) => {
        setEntity(key, { value: v });
        setGlobalNumber(settingKey, v).catch(err => console.error(`[Asgard] Failed to update ${settingKey}:`, err));
      };
    }
    form.num(portEl,     { read: () => ev(gkey.asgardPort), commit: commitNum(gkey.asgardPort, 'asgard_port') });
    form.num(intervalEl, { read: () => ev(gkey.asgardPushIntervalS), commit: commitNum(gkey.asgardPushIntervalS, 'asgard_push_interval_s') });
    form.num(minFlowEl,  { read: () => ev(gkey.minZoneFlowPct), commit: commitNum(gkey.minZoneFlowPct, 'min_zone_flow_pct') });

    function updateStatus() {
      const role = es(gkey.asgardRole) || 'slave';
      badge.textContent = role;
      badge.className = 'asgard-role-badge ' + (role === 'master' ? 'master' : 'slave');

      const peer = es(gkey.asgardPeerStatus) || 'n/a';
      stPeer.textContent = peer;
      stPeer.classList.toggle('warn', peer === 'stale' || peer === 'unreachable');

      const pushC = ev(gkey.asgardLastPushC);
      const age = ev(gkey.asgardLastPushAgeS);
      if (pushC != null && Number.isFinite(pushC) && age != null) {
        const ageStr = age < 120 ? `${Math.round(age)}s ago` : `${Math.round(age / 60)}m ago`;
        stPush.textContent = `${pushC.toFixed(2)}°C (${ageStr})`;
      } else {
        stPush.textContent = '—';
      }

      const setpointC = ev(gkey.asgardSetpointC);
      stSetpoint.textContent = (setpointC != null && Number.isFinite(setpointC))
        ? `${setpointC.toFixed(1)}°C`
        : '—';

      const local = ev(gkey.asgardLocalZones);
      const remote = ev(gkey.asgardPeerZones);
      stZones.textContent = (local != null) ? `${local} local + ${remote || 0} peer` : '—';

      const err = es(gkey.asgardLastError);
      stErr.textContent = err || '—';
      stErr.classList.toggle('warn', !!err);
    }

    subscribe(gkey.asgardEnabled,       form.refresh);
    subscribe(gkey.minimumFlowAlways,   form.refresh);
    subscribe(gkey.asgardCoordinator,   form.refresh);
    subscribe(gkey.asgardRole,          updateStatus);
    subscribe(gkey.asgardPeerStatus,    updateStatus);
    subscribe(gkey.asgardLastPushC,     updateStatus);
    subscribe(gkey.asgardSetpointC,     updateStatus);
    subscribe(gkey.asgardLastPushAgeS,  updateStatus);
    subscribe(gkey.asgardLocalZones,    updateStatus);
    subscribe(gkey.asgardPeerZones,     updateStatus);
    subscribe(gkey.asgardLastError,     updateStatus);
    subscribe(gkey.asgardHost,          form.refresh);
    subscribe(gkey.asgardEntityName,    form.refresh);
    subscribe(gkey.asgardPeerHost,      form.refresh);
    subscribe(gkey.asgardPort,          form.refresh);
    subscribe(gkey.asgardPushIntervalS, form.refresh);
    subscribe(gkey.minZoneFlowPct,      form.refresh);

    form.refresh();
    updateStatus();
  }
});
