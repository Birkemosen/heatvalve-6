// utils/dom.js

export function qs(el, sel) {
  return el.querySelector(sel);
}

export function setText(el, value) {
  el.textContent = value;
}

// safe number update (avoid DOM writes if unchanged)
export function setTextIfChanged(el, value) {
  if (el.textContent !== value) {
    el.textContent = value;
  }
}