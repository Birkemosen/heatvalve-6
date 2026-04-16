import { component } from '../../core/component.js';
import { subscribeDashboard, getDashboardValue } from '../../core/store.js';
import { injectStyle } from '../../core/style.js';

const css = `
.diag-manual-badge {
  display: none;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  border: 1px solid rgba(255,118,118,.45);
  background: linear-gradient(180deg, rgba(83,32,32,.42), rgba(52,21,21,.36));
  border-radius: 12px;
  padding: 10px 12px;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.05);
}

.diag-manual-badge.on {
  display: flex;
}

.diag-manual-dot {
  width: 9px;
  height: 9px;
  border-radius: 999px;
  background: var(--state-danger);
  box-shadow: 0 0 10px rgba(255,118,118,.6);
}

.diag-manual-text {
  color: #FFD9D9;
  font-size: .8rem;
  font-weight: 700;
  letter-spacing: .35px;
  text-transform: uppercase;
}
`;

injectStyle('diag-manual-badge', css);

const template = () => `
  <div class="diag-manual-badge" role="status" aria-live="polite">
    <span class="diag-manual-dot"></span>
    <span class="diag-manual-text">Manual Mode Active - Automatic Management Suspended</span>
  </div>
`;

export default component({
  tag: 'diag-manual-badge',
  render: template,
  onMount(ctx, el) {
    const badgeEl = el.classList.contains('diag-manual-badge') ? el : el.querySelector('.diag-manual-badge');

    function update() {
      const enabled = !!getDashboardValue('manualMode');
      if (badgeEl) badgeEl.classList.toggle('on', enabled);
    }

    subscribeDashboard('manualMode', update);
    update();
  }
});
