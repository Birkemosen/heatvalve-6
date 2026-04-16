// core/sse.js

import { startMock } from './mock.js';
import { setEntity, setLive, sampleHistory, addActivity, setI2cResult } from './store.js';

let source;
let reconnectTimer = null;

function applyStateMap(payload) {
  if (!payload || typeof payload !== 'object') return;
  for (const id in payload) setEntity(id, payload[id]);
  sampleHistory(false);
}

function onMessage(event) {
  let message = null;
  try {
    message = JSON.parse(event.data);
  } catch (error) {
    return;
  }

  if (!message || !message.type) return;

  if (message.type === 'state') {
    applyStateMap(message.data);
    return;
  }

  if (message.type === 'log') {
    const text = message.data && (message.data.message || message.data.msg || message.data.text || '');
    if (!text) return;
    addActivity(text);
    if (String(text).indexOf('I2C_SCAN:') !== -1) setI2cResult(String(text));
  }
}

function scheduleReconnect() {
  if (reconnectTimer) return;
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    connect();
  }, 2500);
}

export function connect() {
  const cfg = window.HV6_DASHBOARD_CONFIG;

  if (cfg && cfg.mock) {
    startMock();
    return;
  }

  if (source) source.close();

  source = new EventSource('/api/hv6/v1/events');
  source.onopen = () => setLive(true);
  source.onmessage = onMessage;
  source.onerror = function () {
    setLive(false);
    scheduleReconnect();
  };
}