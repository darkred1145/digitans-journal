const CLIENT_ID = '1513880949220311181';
const SETTINGS_DEFAULTS = {
  enabled: true,
  sites: {},
  idleTimeout: 0,
  privacyMode: false,
  templates: {},
};

let nativePort = null;
let currentActivity = null;
let currentSite = null;
let lastError = null;
let settings = { ...SETTINGS_DEFAULTS };
let trackedTabs = new Set();
let idleTimer = null;

function loadSettings() {
  chrome.storage.sync.get(SETTINGS_DEFAULTS, (s) => { settings = s; });
}

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync') {
    if (changes.enabled) settings.enabled = changes.enabled.newValue;
    if (changes.sites) settings.sites = changes.sites.newValue || {};
    if (changes.idleTimeout) {
      settings.idleTimeout = changes.idleTimeout.newValue || 0;
      resetIdleTimer();
    }
    if (changes.privacyMode) settings.privacyMode = changes.privacyMode.newValue || false;
    if (changes.templates) settings.templates = changes.templates.newValue || {};
  }
});

function truncate(s, n = 128) {
  return s && s.length > n ? s.slice(0, n - 1) + '…' : s;
}

function formatPresence(site, data) {
  if (settings.privacyMode) {
    return {
      details: truncate(`Browsing ${site}`),
      state: undefined,
      largeImageKey: data.largeImageKey || 'digitan',
      largeImageText: data.largeImageText || '',
      smallImageKey: data.smallImageKey,
      smallImageText: data.smallImageText,
    };
  }

  const raw = data.raw || {};
  const tmpl = settings.templates && settings.templates[site];
  let details = data.details;
  let state = data.state;

  if (tmpl) {
    const r = (s) => (raw[s] !== undefined && raw[s] !== null ? String(raw[s]) : '');
    if (tmpl.details) {
      details = tmpl.details
        .replace(/\{title\}/g, r('title'))
        .replace(/\{page\}/g, r('page'))
        .replace(/\{total\}/g, r('totalPages'))
        .replace(/\{site\}/g, site);
    }
    if (tmpl.state) {
      state = tmpl.state
        .replace(/\{title\}/g, r('title'))
        .replace(/\{page\}/g, r('page'))
        .replace(/\{total\}/g, r('totalPages'))
        .replace(/\{site\}/g, site);
    }
  }

  return { ...data, details: truncate(details), state: state ? truncate(state) : undefined };
}

function connectNative() {
  if (nativePort) return;
  try {
    nativePort = chrome.runtime.connectNative('com.digitansjournal.rpc');
    nativePort.onMessage.addListener((msg) => {
      if (msg.type === 'rpcStatus') {
        lastError = msg.error || null;
        chrome.storage.local.set({ rpcConnected: msg.connected, userId: msg.userId || null, lastError }, () => {
          if (chrome.runtime.lastError) console.error('storage set failed', chrome.runtime.lastError);
        });
      }
    });
    nativePort.onDisconnect.addListener(() => {
      nativePort = null;
      lastError = 'Native host disconnected';
      chrome.storage.local.set({ rpcConnected: false, userId: null, lastError }, () => {
        if (chrome.runtime.lastError) console.error('storage set failed', chrome.runtime.lastError);
      });
    });
    nativePort.postMessage({ action: 'connect', clientId: CLIENT_ID });
  } catch (err) {
    console.error('native connect failed', err);
    lastError = err.message;
    chrome.storage.local.set({ rpcConnected: false, lastError }, () => {});
  }
}

function clearActivity() {
  currentSite = null;
  currentActivity = null;
  if (nativePort) nativePort.postMessage({ action: 'disconnect' });
  chrome.storage.local.set({ currentSite: null, currentActivity: null }, () => {
    if (chrome.runtime.lastError) console.error('storage set failed', chrome.runtime.lastError);
  });
}

function resetIdleTimer() {
  if (idleTimer) clearTimeout(idleTimer);
  if (settings.idleTimeout > 0) {
    idleTimer = setTimeout(() => {
      clearActivity();
    }, settings.idleTimeout * 60 * 1000);
  }
}

function sendActivity(site, data) {
  if (!settings.enabled || settings.sites[site] === false) return;
  const finalData = formatPresence(site, data);
  currentSite = site;
  currentActivity = finalData;
  if (!nativePort) connectNative();
  if (nativePort) {
    nativePort.postMessage({ action: 'setActivity', presence: finalData });
    lastError = null;
    chrome.storage.local.set({ currentSite: site, currentActivity: finalData, lastError: null }, () => {
      if (chrome.runtime.lastError) console.error('storage set failed', chrome.runtime.lastError);
    });
  }
  resetIdleTimer();
}

chrome.tabs.onRemoved.addListener((tabId) => {
  if (trackedTabs.delete(tabId) && trackedTabs.size === 0) {
    clearActivity();
  }
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'presence') {
    if (sender.tab && sender.tab.id) trackedTabs.add(sender.tab.id);
    sendActivity(msg.site, msg.data);
    sendResponse({ ok: true });
  }
  if (msg.type === 'getStatus') {
    sendResponse({
      rpcConnected: nativePort !== null,
      currentSite,
      currentActivity,
      lastError,
    });
  }
  if (msg.type === 'reconnect') {
    if (nativePort) { nativePort.disconnect(); nativePort = null; }
    connectNative();
    sendResponse({ ok: true });
  }
  if (msg.type === 'clearActivity') {
    clearActivity();
    sendResponse({ ok: true });
  }
  return true;
});

chrome.commands.onCommand.addListener((command) => {
  if (command === 'clear-activity') clearActivity();
});

chrome.runtime.onInstalled.addListener(() => {
  loadSettings();
  connectNative();
});
