import { component, subscribe } from '../../core/component.js';
import { injectStyle } from '../../core/style.js';
import { ev, subscribeDashboard, zoneLabel } from '../../core/store.js';
import { key } from '../../utils/keys.js';
import { localize, subscribeLanguage } from '../../core/i18n.js';

const ZONES = [1, 2, 3, 4, 5, 6];

const css = `
.forecast-preload-status-card .zone-table {
  width: 100%;
  border-collapse: collapse;
  font-size: .82rem;
  margin-top: 4px;
}
.forecast-preload-status-card .zone-table th {
  color: var(--text-secondary);
  font-size: .68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .4px;
  text-align: center;
  padding: 4px 2px;
}
.forecast-preload-status-card .zone-table th:first-child { text-align: left; }
.forecast-preload-status-card .zone-table td { padding: 5px 2px; text-align: center; }
.forecast-preload-status-card .zone-table td:first-child {
  text-align: left;
  color: var(--text);
  font-weight: 600;
  white-space: nowrap;
}
.forecast-preload-status-card .offset-cell {
  font-weight: 700;
  color: var(--text-secondary);
  font-family: var(--mono);
}
.forecast-preload-status-card .offset-cell.active { color: #CBFFD0; }
`;

injectStyle('forecast-preload-status-card', css);

const zoneRow = (z) => `
  <tr data-zone="${z}">
    <td class="zone-name"><span data-i18n="common.zone">Zone</span> ${z}</td>
    <td class="offset-cell fc-offset">—</td>
  </tr>
`;

const template = () => `
  <div class="ui-card forecast-preload-status-card">
    <div class="ui-card-title"><span data-i18n="diagnostics.forecastPreload.title">Forecast Preload Status</span></div>
    <table class="zone-table">
      <thead>
        <tr><th data-i18n="diagnostics.forecastPreload.zone">Zone</th><th data-i18n="diagnostics.forecastPreload.activeOffset">Active offset</th></tr>
      </thead>
      <tbody class="fc-zone-body">
        ${ZONES.map(zoneRow).join('')}
      </tbody>
    </table>
    <div class="ui-note" data-i18n="diagnostics.forecastPreload.note">Live forecast preload offset applied to each zone right now. The hours-ahead figure shows when the forecast load peak is expected.</div>
  </div>
`;

export default component({
  tag: 'forecast-preload-status-card',
  render: template,
  onMount(ctx, el) {
    function update() {
      el.querySelectorAll('.fc-zone-body tr').forEach((row) => {
        const z = parseInt(row.getAttribute('data-zone'), 10);
        row.querySelector('.zone-name').textContent = zoneLabel(z);
        const cell = row.querySelector('.fc-offset');
        const off = ev(key.forecastOffset(z));
        const peak = ev(key.forecastPeakH(z));
        if (off != null && off > 0.01) {
          cell.textContent = `+${off.toFixed(1)}°` + (peak != null && peak >= 0 ? ` (${peak}h)` : '');
          cell.classList.add('active');
        } else {
          cell.textContent = '—';
          cell.classList.remove('active');
        }
      });
    }

    ZONES.forEach((z) => {
      subscribe(key.forecastOffset(z), update);
      subscribe(key.forecastPeakH(z), update);
    });
    subscribeDashboard('zoneNames', update);
    subscribeLanguage(() => { localize(el); update(); });
    localize(el);
    update();
  }
});
