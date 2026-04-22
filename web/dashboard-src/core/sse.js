// core/sse.js

import { startMock } from './mock.js';
import { setEntity, setLive, sampleHistory, addActivity, setI2cResult, shouldSuppressStateUpdate } from './store.js';

let reconnectTimer = null;
let pollAbortController = null;

async function fetchStateOnce() {
  if (pollAbortController) {
    pollAbortController.abort();
  }

  pollAbortController = new AbortController();

  const response = await fetch('/dashboard/state', {
    cache: 'no-store',
    signal: pollAbortController.signal,
  });

  if (response.status === 503) {
    throw new Error('State fetch busy');
  }

  if (!response.ok) {
    throw new Error('State fetch failed: ' + response.status);
  }

  return response.json();
}

function applyStateMap(payload) {
  if (!payload || typeof payload !== 'object') return;
  if (shouldSuppressStateUpdate()) return;
  for (const id in payload) setEntity(id, payload[id]);
  sampleHistory(false);
}

function onMessage(message) {
  if (!message) return;

  if (!message.type) {
    applyStateMap(message);
    return;
  }

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
  }, 1000);
}

export function connect() {
  const cfg = window.HV6_DASHBOARD_CONFIG;

  if (cfg && cfg.mock) {
    startMock();
    return;
  }

  fetchStateOnce()
    .then((message) => {
      setLive(true);
      onMessage(message);
      scheduleReconnect();
    })
    .catch(() => {
      setLive(false);
      scheduleReconnect();
    });
}