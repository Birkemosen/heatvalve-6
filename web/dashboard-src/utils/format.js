// utils/format.js

// =======================
// BASIC FORMATTERS
// =======================

export function round1(v) {
  return Math.round(v * 10) / 10;
}

export function fmtT(v) {
  return v != null && !isNaN(v)
    ? (Math.round(v * 10) / 10) + "°C"
    : "---";
}

export function fmtV(v) {
  return v != null && !isNaN(v)
    ? (v | 0) + "%"
    : "---";
}

export function fmtUp(s) {
  if (!s || isNaN(s)) return "---";

  s = s | 0;

  var d = (s / 86400) | 0;
  var hr = ((s % 86400) / 3600) | 0;
  var m = ((s % 3600) / 60) | 0;

  return d > 0
    ? d + "d " + hr + "h " + m + "m"
    : hr > 0
    ? hr + "h " + m + "m"
    : m + "m";
}

export function fmtWifi(v) {
  if (v == null || isNaN(v)) return "---";

  v = v | 0;

  if (v > -50) return v + " dBm ▐▐▐▐";
  if (v > -60) return v + " dBm ▐▐▐░";
  if (v > -70) return v + " dBm ▐▐░░";
  if (v > -80) return v + " dBm ▐░░░";
  return v + " dBm ░░░░";
}

// =======================
// SAFE PARSERS (OPTIONAL)
// =======================

// Only use if your backend sends strings sometimes

export function parseNum(v) {
  if (v == null) return null;

  if (typeof v === 'number') return v;

  if (typeof v === 'string') {
    var n = Number(v);
    if (!isNaN(n)) return n;

    var m = v.match(/-?\d+(?:[\.,]\d+)?/);
    if (m) {
      return Number(m[0].replace(',', '.'));
    }
  }

  return null;
}