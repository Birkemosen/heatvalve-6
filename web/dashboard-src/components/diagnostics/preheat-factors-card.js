import { component, subscribe } from '../../core/component.js';
import { injectStyle } from '../../core/style.js';
import { ev, subscribeDashboard, zoneLabel } from '../../core/store.js';
import { key } from '../../utils/keys.js';
import { localize, subscribeLanguage } from '../../core/i18n.js';

const MAX_ADVANCE_C = 0.8;

const css = `
.preheat-factors-card .pf-list {
  display: grid;
  gap: 9px;
  margin-top: 4px;
}
.preheat-factors-card .pf-row {
  display: grid;
  grid-template-columns: minmax(92px, 1fr) minmax(70px, 1.4fr) 48px;
  gap: 10px;
  align-items: center;
}
.preheat-factors-card .pf-zone {
  min-width: 0;
  color: var(--text-strong);
  font-size: .8rem;
  font-weight: 800;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.preheat-factors-card .pf-track {
  height: 7px;
  border-radius: 999px;
  overflow: hidden;
  background: rgba(124,155,208,.14);
  border: 1px solid rgba(120,146,200,.18);
}
.preheat-factors-card .pf-fill {
  display: block;
  width: 0%;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--series-cool), var(--accent), var(--series-solar));
  transition: width .25s ease;
}
.preheat-factors-card .pf-value {
  color: var(--accent);
  font-family: var(--mono);
  font-size: .82rem;
  font-weight: 800;
  text-align: right;
  white-space: nowrap;
}
`;

injectStyle('preheat-factors-card', css);

const template = () => {
  let rows = '';
  for (let zone = 1; zone <= 6; zone++) {
    rows += `
      <div class="pf-row" data-zone="${zone}">
        <div class="pf-zone"></div>
        <div class="pf-track"><i class="pf-fill"></i></div>
        <div class="pf-value">---</div>
      </div>
    `;
  }

  return `
    <div class="ui-card preheat-factors-card">
      <div class="ui-card-title"><span data-i18n="diagnostics.preheatFactors.title">Preheat Factors</span></div>
      <div class="pf-list">${rows}</div>
      <div class="ui-note" data-i18n="diagnostics.preheatFactors.note">Learned simple-preheat head-start per zone. The control runs automatically; these values show how much earlier each room starts calling for heat.</div>
    </div>
  `;
};

function fmtAdvance(value) {
  return Number.isFinite(value) ? value.toFixed(2) + 'C' : '---';
}

export default component({
  tag: 'preheat-factors-card',
  render: template,
  onMount(ctx, el) {
    function update() {
      for (let zone = 1; zone <= 6; zone++) {
        const row = el.querySelector('[data-zone="' + zone + '"]');
        const value = Number(ev(key.preheatAdvance(zone)));
        const finite = Number.isFinite(value);
        row.querySelector('.pf-zone').textContent = zoneLabel(zone);
        row.querySelector('.pf-value').textContent = fmtAdvance(value);
        row.querySelector('.pf-fill').style.width = finite
          ? Math.max(0, Math.min(100, (value / MAX_ADVANCE_C) * 100)) + '%'
          : '0%';
      }
    }

    for (let zone = 1; zone <= 6; zone++) subscribe(key.preheatAdvance(zone), update);
    subscribeDashboard('zoneNames', update);
    subscribeLanguage(() => localize(el));
    localize(el);
    update();
  }
});
