// core/style.js

let injected = Object.create(null);

export function injectStyle(id, css) {
  if (injected[id]) return;
  injected[id] = 1;

  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
}

// ========================================
// Usage:
// import { injectStyle } from '../../core/style.js';
// 
// injectStyle('zone-card', `
//   .zone-card { ... }
// `);