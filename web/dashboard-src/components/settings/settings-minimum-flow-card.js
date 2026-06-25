import { component, subscribe } from '../../core/component.js';
import { cardForm, helpBadgeI18n } from '../../core/ui-kit.js';
import { ev, isEntityOn, setEntity } from '../../core/store.js';
import { setGlobalNumber, setGlobalSelect } from '../../core/api.js';
import { gkey } from '../../utils/keys.js';
import { localize, subscribeLanguage } from '../../core/i18n.js';

const template = () => `
  <div class="ui-card settings-minimum-flow-card">
    <div class="ui-card-title"><span class="ui-title-text"><span data-i18n="settings.minFlow.title">Minimum Zone Flow</span>${helpBadgeI18n('settings.minFlow.help')}</span></div>
    <div class="ui-row">
      <span class="ui-label"><span data-i18n="common.enabled">Enabled</span> <span class="ui-sublabel" data-i18n="settings.minFlow.enabledSub">manual floor for a modulating heat source, independent of the bridge</span></span>
      <span class="ui-field"><div class="ui-toggle smf-always" role="switch" data-i18n-label="settings.minFlow.title" aria-label="Enable minimum zone flow"></div></span>
    </div>
    <div class="ui-row">
      <span class="ui-label"><span data-i18n="settings.minFlow.opening">Min valve opening (%)</span> <span class="ui-sublabel" data-i18n="settings.minFlow.openingSub">floor held on every enabled zone while active</span></span>
      <span class="ui-field"><input class="ui-input smf-pct" type="number" min="0" max="50" step="1" placeholder="15" /></span>
    </div>
  </div>
`;

export default component({
  tag: 'settings-minimum-flow-card',
  render: template,
  onMount(ctx, el) {
    const toggleEl = el.querySelector('.smf-always');
    const pctEl = el.querySelector('.smf-pct');
    const form = cardForm(el);

    form.toggle(toggleEl, {
      read: () => isEntityOn(gkey.minimumFlowAlways),
      commit: (on) => {
        const next = on ? 'on' : 'off';
        setEntity(gkey.minimumFlowAlways, { state: next });
        setGlobalSelect('minimum_flow_always', next)
          .catch(() => setEntity(gkey.minimumFlowAlways, { state: on ? 'off' : 'on' }));
      }
    });
    form.num(pctEl, {
      read: () => ev(gkey.minZoneFlowPct),
      commit: (v) => {
        setEntity(gkey.minZoneFlowPct, { value: v });
        setGlobalNumber('min_zone_flow_pct', v);
      }
    });

    subscribe(gkey.minimumFlowAlways, form.refresh);
    subscribe(gkey.minZoneFlowPct, form.refresh);
    subscribeLanguage(() => localize(el));
    localize(el);
    form.refresh();
  }
});
