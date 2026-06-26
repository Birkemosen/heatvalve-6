import { component, subscribe } from '../../core/component.js';
import { injectStyle } from '../../core/style.js';
import { ev } from '../../core/store.js';
import { key } from '../../utils/keys.js';
import { localize, subscribeLanguage } from '../../core/i18n.js';

const ZONES = [1, 2, 3, 4, 5, 6];

const css = `
.balancing-status-card .zone-table {
  width: 100%;
  border-collapse: collapse;
  font-size: .8rem;
  margin-top: 4px;
}
.balancing-status-card .zone-table th {
  color: var(--text-secondary);
  font-size: .68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .4px;
  text-align: center;
  padding: 4px 2px;
}
.balancing-status-card .zone-table th:first-child { text-align: left; }
.balancing-status-card .zone-table td {
  padding: 4px 2px;
  text-align: center;
  font-family: var(--mono);
  color: var(--text-secondary);
}
.balancing-status-card .zone-table td:first-child {
  text-align: left;
  color: var(--text);
  font-weight: 600;
  white-space: nowrap;
  font-family: inherit;
}
.balancing-status-card .zone-table .eff {
  color: var(--text-strong);
  font-weight: 700;
}
.balancing-status-card .zone-table .err.cold { color: #FFB4B4; }
.balancing-status-card .zone-table .err.warm { color: #CBFFD0; }
`;

injectStyle('balancing-status-card', css);

const zoneRow = (z) => `
  <tr data-zone="${z}">
    <td><span data-i18n="common.zone">Zone</span> ${z}</td>
    <td class="bal-static">—</td>
    <td class="bal-adapt">—</td>
    <td class="bal-eff eff">—</td>
    <td class="bal-err err">—</td>
  </tr>
`;

const template = () => `
  <div class="ui-card balancing-status-card">
    <div class="ui-card-title"><span data-i18n="diagnostics.balancing.title">Balancing Status</span></div>
    <table class="zone-table">
      <thead>
        <tr>
          <th data-i18n="common.zone">Zone</th>
          <th data-i18n="diagnostics.balancing.prior">Prior</th>
          <th data-i18n="diagnostics.balancing.learned">Learned</th>
          <th data-i18n="diagnostics.balancing.effective">Effective</th>
          <th data-i18n="diagnostics.balancing.error">Error</th>
        </tr>
      </thead>
      <tbody class="bal-zone-body">
        ${ZONES.map(zoneRow).join('')}
      </tbody>
    </table>
    <div class="ui-note" data-i18n="diagnostics.balancing.note">Prior = static design factor. Learned = adaptive multiplier. Effective = prior times learned. Error is the long-window setpoint-room average used to boost cold loops and throttle warm loops.</div>
  </div>
`;

export default component({
  tag: 'balancing-status-card',
  render: template,
  onMount(ctx, el) {
    const fmt = (v, d = 2) => (v != null && Number.isFinite(Number(v))) ? Number(v).toFixed(d) : '—';

    function updateZones() {
      el.querySelectorAll('.bal-zone-body tr').forEach((row) => {
        const z = parseInt(row.getAttribute('data-zone'), 10);
        row.querySelector('.bal-static').textContent = fmt(ev(key.staticFactor(z)));
        row.querySelector('.bal-adapt').textContent = fmt(ev(key.balanceAdapt(z)));
        row.querySelector('.bal-eff').textContent = fmt(ev(key.balanceFactor(z)));

        const err = ev(key.adaptErr(z));
        const cell = row.querySelector('.bal-err');
        cell.classList.remove('cold', 'warm');
        if (err == null || !Number.isFinite(Number(err))) {
          cell.textContent = '—';
          return;
        }
        cell.textContent = (err >= 0 ? '+' : '') + Number(err).toFixed(2);
        const errorClass = err > 0.05 ? 'cold' : (err < -0.05 ? 'warm' : '');
        if (errorClass) cell.classList.add(errorClass);
      });
    }

    ZONES.forEach((z) => {
      subscribe(key.staticFactor(z), updateZones);
      subscribe(key.balanceAdapt(z), updateZones);
      subscribe(key.balanceFactor(z), updateZones);
      subscribe(key.adaptErr(z), updateZones);
    });
    subscribeLanguage(() => localize(el));
    localize(el);
    updateZones();
  }
});
