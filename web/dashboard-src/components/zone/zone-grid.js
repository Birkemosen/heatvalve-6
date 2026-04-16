import { component, mountComponent } from '../../core/component.js';
import { injectStyle } from '../../core/style.js';

// ========================================
// CSS
// ========================================
const css = `
.zone-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 8px;
    margin-bottom: 14px;
}

@media (max-width: 720px) {
    .zone-grid { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 560px) {
    .zone-grid { grid-template-columns: repeat(2, 1fr); }
}
`;

injectStyle('zone-grid', css);

// ========================================
// TEMPLATE
// ========================================
const template = () => `<div class="zone-grid"></div>`;

// ========================================
// COMPONENT
// ========================================
export default component({
	tag: 'zone-grid',
	render: template,
	onMount(ctx, el) {
		for (let zone = 1; zone <= 6; zone++) {
			el.appendChild(mountComponent('zone-card', { zone }));
		}
	}
});
