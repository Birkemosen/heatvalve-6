import { component, mountComponent } from '../../core/component.js';
import { injectStyle } from '../../core/style.js';

// Combined "Smart Heating" card: hosts the Preheat and Forecast Preload controls
// as labelled subsections of a single panel. The inner cards keep all their
// behaviour — we just strip their panel chrome so they read as sections here.
const css = `
.settings-smart-heating {
  background: var(--panel-bg-vibrant);
  border: 1px solid var(--panel-border);
  border-radius: 18px;
  padding: 20px;
  box-shadow: var(--panel-shadow);
}

/* De-chrome the nested cards so they sit flush inside this panel. */
.settings-smart-heating .smart-preheat-card,
.settings-smart-heating .settings-forecast-card {
  background: none;
  border: none;
  box-shadow: none;
  border-radius: 0;
  padding: 0;
}

/* The inner card titles ("Preheat" / "Forecast Preload") become subsection heads. */
.settings-smart-heating .sh-section + .sh-section {
  margin-top: 18px;
  padding-top: 18px;
  border-top: 1px solid var(--panel-border);
}
`;

injectStyle('settings-smart-heating', css);

const template = () => `
  <div class="settings-smart-heating">
    <div class="sh-section sh-preheat-slot"></div>
    <div class="sh-section sh-forecast-slot"></div>
  </div>
`;

export default component({
  tag: 'settings-smart-heating-card',
  render: template,
  onMount(ctx, el) {
    el.querySelector('.sh-preheat-slot').appendChild(mountComponent('smart-preheat-card'));
    el.querySelector('.sh-forecast-slot').appendChild(mountComponent('settings-forecast-card'));
  }
});
