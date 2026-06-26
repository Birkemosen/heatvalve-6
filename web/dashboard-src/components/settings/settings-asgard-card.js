import { component, subscribe } from '../../core/component.js';
import { injectStyle } from '../../core/style.js';
import { cardForm, helpBadgeI18n } from '../../core/ui-kit.js';
import { es, ev, isEntityOn, setEntity } from '../../core/store.js';
import { setGlobalSelect, setGlobalNumber, setGlobalText } from '../../core/api.js';
import { gkey } from '../../utils/keys.js';
import { localize, subscribeLanguage } from '../../core/i18n.js';

// ========================================
// CSS — reuses the helios card visual language
// ========================================
const css = `
.settings-asgard-card .ui-row:last-child { margin-bottom: 0; }
`;

injectStyle('settings-asgard-card', css);

// ========================================
// TEMPLATE
// ========================================
const template = () => `
  <div class="ui-card settings-asgard-card">
    <div class="ui-card-title">
      <span class="ui-title-text"><span data-i18n="settings.asgard.title">Modulating Heat Source</span>${helpBadgeI18n('settings.asgard.help')}</span>
    </div>

    <div class="ui-row">
      <span class="ui-label"><span data-i18n="settings.asgard.bridgeEnabled">Bridge enabled</span> <span class="ui-sublabel" data-i18n="settings.asgard.bridgeSub">send weighted house temperature to the heat-source controller</span></span>
      <span class="ui-field"><div class="ui-toggle sa-enable" role="switch" data-i18n-label="settings.asgard.bridgeEnabled" aria-label="Toggle heat-source bridge"></div></span>
    </div>

    <div class="gated-body sa-body">
      <div class="ui-row">
        <span class="ui-label"><span data-i18n="settings.asgard.coordinator">Coordinator</span> <span class="ui-sublabel" data-i18n="settings.asgard.coordinatorSub">pushes to the heat source</span></span>
        <span class="ui-field"><div class="ui-toggle sa-coord" role="switch" data-i18n-label="settings.asgard.coordinator" aria-label="Toggle coordinator role"></div></span>
      </div>

      <div class="ui-section" data-i18n="settings.asgard.endpoint">Heat Source Endpoint</div>
      <div class="ui-row">
        <span class="ui-label" data-i18n="settings.asgard.host">Host</span>
        <span class="ui-field"><input class="ui-input wide sa-host" type="text" placeholder="ecodan-heatpump.local" maxlength="63" /></span>
      </div>
      <div class="ui-row">
        <span class="ui-label" data-i18n="settings.asgard.port">Port</span>
        <span class="ui-field"><input class="ui-input sa-port" type="number" min="1" max="65535" step="1" placeholder="80" /></span>
      </div>
      <div class="ui-row">
        <span class="ui-label"><span data-i18n="settings.asgard.entity">Number entity</span> <span class="ui-sublabel" data-i18n="settings.asgard.entitySub">REST object_id for the weighted house temp</span></span>
        <span class="ui-field"><input class="ui-input wide sa-entity" type="text" maxlength="47" placeholder="virtual_thermostat_input_z1" /></span>
      </div>

      <div class="ui-section" data-i18n="settings.asgard.peerBoard">Peer board</div>
      <div class="ui-row">
        <span class="ui-label" data-i18n="settings.asgard.peerHost">Peer host</span>
        <span class="ui-field"><input class="ui-input wide sa-peer" type="text" placeholder="empty = single board" data-i18n-placeholder="settings.asgard.peerPlaceholder" maxlength="63" /></span>
      </div>
      <div class="ui-row">
        <span class="ui-label" data-i18n="settings.asgard.pushInterval">Push interval (s)</span>
        <span class="ui-field"><input class="ui-input sa-interval" type="number" min="5" max="3600" step="1" placeholder="30" /></span>
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
    const enableBtn = el.querySelector('.sa-enable');
    const coordBtn  = el.querySelector('.sa-coord');
    const hostEl    = el.querySelector('.sa-host');
    const portEl    = el.querySelector('.sa-port');
    const entityEl  = el.querySelector('.sa-entity');
    const peerEl    = el.querySelector('.sa-peer');
    const intervalEl = el.querySelector('.sa-interval');
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

    subscribe(gkey.asgardEnabled,       form.refresh);
    subscribe(gkey.asgardCoordinator,   form.refresh);
    subscribe(gkey.asgardHost,          form.refresh);
    subscribe(gkey.asgardEntityName,    form.refresh);
    subscribe(gkey.asgardPeerHost,      form.refresh);
    subscribe(gkey.asgardPort,          form.refresh);
    subscribe(gkey.asgardPushIntervalS, form.refresh);
    subscribeLanguage(() => localize(el));
    localize(el);

    form.refresh();
  }
});
