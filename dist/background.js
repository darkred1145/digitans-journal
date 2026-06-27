/**
 * @param {string|null|undefined} s
 * @param {number} n
 * @returns {string|null|undefined}
 */
function truncate(s, n = 128) {
  return s && s.length > n ? s.slice(0, n - 1) + '\u2026' : s;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { truncate };
}

/**
 * @typedef {Object} PresenceData
 * @property {string} details
 * @property {string} [state]
 * @property {string} [largeImageKey]
 * @property {string} [largeImageText]
 * @property {string} [smallImageKey]
 * @property {string} [smallImageText]
 * @property {Array<{label:string, url:string}>} [buttons]
 * @property {Object} [raw]
 * @property {string} [raw.title]
 * @property {string|null} [raw.page]
 * @property {string} [raw.totalPages]
 * @property {string} [raw.type]
 * @property {string} [raw.rarity]
 * @property {string} [raw.subtitle]
 *
 * @typedef {Object} StatusObject
 * @property {boolean} rpcConnected
 * @property {boolean} connecting
 * @property {string|null} userId
 * @property {string|null} currentSite
 * @property {PresenceData|null} currentActivity
 * @property {string|null} lastError
 *
 * @typedef {Object} SettingsObject
 * @property {boolean} enabled
 * @property {Object<string, boolean>} sites
 * @property {number} idleTimeout
 * @property {boolean} privacyMode
 * @property {Object<string, TemplateConfig>} templates
 *
 * @typedef {Object} TemplateConfig
 * @property {string} [details]
 * @property {string} [state]
 *
 * @typedef {Object} RPCStatusEvent
 * @property {boolean} connected
 * @property {boolean} connecting
 * @property {string|null} userId
 * @property {string|null} error
 *
 * @typedef {Object} NativeMessage
 * @property {'connect'|'setActivity'|'disconnect'} action
 * @property {string} [clientId]
 * @property {PresenceData|null} [presence]
 *
 * @typedef {Object} HostMessage
 * @property {'rpcStatus'|'error'} type
 * @property {boolean} [connected]
 * @property {string} [userId]
 * @property {string} [message]
 * @property {string} [error]
 *
 * @typedef {Object} HarvesterConfig
 * @property {number} [interval]
 * @property {number} [throttle]
 */

/**
 * Validates required fields on a PresenceData object.
 * Logs a warning if required fields are missing (does not throw).
 * @param {PresenceData} data
 * @returns {boolean} true if valid
 */
function validatePresence(data) {
  if (!data || typeof data !== 'object' || !data.details) {
    console.warn('[presence-contract] missing required field: details');
    return false;
  }
  return true;
}


/**
 * @param {string} site
 * @param {PresenceData} data
 * @param {SettingsObject} settings
 * @returns {PresenceData}
 */
function formatPresence(site, data, settings) {
  if (settings.privacyMode) {
    return {
      details: truncate('Browsing ' + site),
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
        .replace(/\{type\}/g, r('type'))
        .replace(/\{rarity\}/g, r('rarity'))
        .replace(/\{subtitle\}/g, r('subtitle'))
        .replace(/\{site\}/g, site);
    }
    if (tmpl.state) {
      state = tmpl.state
        .replace(/\{title\}/g, r('title'))
        .replace(/\{page\}/g, r('page'))
        .replace(/\{total\}/g, r('totalPages'))
        .replace(/\{type\}/g, r('type'))
        .replace(/\{rarity\}/g, r('rarity'))
        .replace(/\{subtitle\}/g, r('subtitle'))
        .replace(/\{site\}/g, site);
    }
  }

  return { ...data, details: truncate(details), state: state ? truncate(state) : undefined };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { formatPresence };
}


/** @type {SettingsObject} */
const DEFAULTS = {
  enabled: true,
  sites: { nhentai: true, gametora: true, raggooner: true, 'uma-guide': true, umalator: true },
  idleTimeout: 0,
  privacyMode: false,
  templates: {},
};


const ACTION_CONNECT = 'connect';
const ACTION_SET_ACTIVITY = 'setActivity';
const ACTION_DISCONNECT = 'disconnect';

const TYPE_RPC_STATUS = 'rpcStatus';
const TYPE_ERROR = 'error';

const VALID_ACTIONS = [ACTION_CONNECT, ACTION_SET_ACTIVITY, ACTION_DISCONNECT];
const VALID_TYPES = [TYPE_RPC_STATUS, TYPE_ERROR];

function validateNativeMessage(msg) {
  if (!msg || typeof msg !== 'object') return false;
  if (msg.action && !VALID_ACTIONS.includes(msg.action)) return false;
  return true;
}

function validateHostMessage(msg) {
  if (!msg || typeof msg !== 'object') return false;
  if (msg.type && !VALID_TYPES.includes(msg.type)) return false;
  return true;
}

function rpcStatus(connected, opts) {
  const m = { type: TYPE_RPC_STATUS, connected };
  if (opts && opts.userId) m.userId = opts.userId;
  if (opts && opts.error) m.error = opts.error;
  return m;
}

function connectMsg(clientId) {
  return { action: ACTION_CONNECT, clientId };
}

function setActivityMsg(presence) {
  return { action: ACTION_SET_ACTIVITY, presence };
}

function disconnectMsg() {
  return { action: ACTION_DISCONNECT };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ACTION_CONNECT, ACTION_SET_ACTIVITY, ACTION_DISCONNECT,
    TYPE_RPC_STATUS, TYPE_ERROR,
    validateNativeMessage, validateHostMessage,
    rpcStatus, connectMsg, setActivityMsg, disconnectMsg,
  };
}


const BASE_BACKOFF = 1000;
const MAX_BACKOFF = 60000;

class RPCManager {
  constructor(hostName, clientId) {
    this.hostName = hostName;
    this.clientId = clientId;
    this.port = null;
    this.listeners = [];
    this._backoff = 0;
    this._backoffTimerId = null;
  }

  onStatus(fn) {
    this.listeners.push(fn);
  }

  /**
   * @param {RPCStatusEvent} status
   */
  _emit(status) {
    this.listeners.forEach(fn => fn(status));
  }

  _doConnect() {
    this.port = chrome.runtime.connectNative(this.hostName);
    this._emit({ connected: false, connecting: true, userId: null, error: null });
    this.port.onMessage.addListener((msg) => {
      if (msg.type === TYPE_RPC_STATUS) {
        if (msg.connected) this._backoff = 0;
        this._emit({ connected: msg.connected, connecting: false, userId: msg.userId || null, error: msg.error || null });
      }
    });
    this.port.onDisconnect.addListener(() => {
      this.port = null;
      this._emit({ connected: false, connecting: false, userId: null, error: 'Native host disconnected' });
    });
    this.port.postMessage(connectMsg(this.clientId));
  }

  _scheduleReconnect() {
    const delay = Math.min(BASE_BACKOFF * Math.pow(2, this._backoff), MAX_BACKOFF);
    this._backoff++;
    this._backoffTimerId = setTimeout(() => {
      this._backoffTimerId = null;
      if (!this.port) this._doConnect();
    }, delay);
  }

  connect() {
    if (this.port) return;
    if (this._backoffTimerId) return;
    try {
      this._doConnect();
    } catch (err) {
      this.port = null;
      this._emit({ connected: false, connecting: false, userId: null, error: err.message });
      this._scheduleReconnect();
    }
  }

  disconnect() {
    if (this._backoffTimerId) {
      clearTimeout(this._backoffTimerId);
      this._backoffTimerId = null;
    }
    this._backoff = 0;
    if (this.port) {
      try { this.port.postMessage(disconnectMsg()); } catch (_) {}
      this.port.disconnect();
      this.port = null;
    }
  }

  /**
   * @param {PresenceData|null} presence
   */
  setActivity(presence) {
    if (!this.port) { this.connect(); return; }
    try {
      this.port.postMessage(setActivityMsg(presence));
    } catch (e) {
      this.port = null;
      this._scheduleReconnect();
    }
  }

  clearActivity() {
    if (this.port) {
      try { this.port.postMessage(setActivityMsg(null)); } catch (_) {}
    }
  }
}


class StateManager {
  constructor(rpc) {
    this.rpc = rpc;
    this.currentActivity = null;
    this.currentSite = null;
    this.lastError = null;
    this.trackedTabs = new Set();
    this.idleTimer = null;
    this.settings = { ...DEFAULTS };

    rpc.onStatus((status) => {
      this.lastError = status.error;
      this.userId = status.userId || null;
      this.rpcConnected = status.connected;
      this.connecting = status.connecting || false;
      chrome.storage.local.set({
        rpcConnected: status.connected,
        connecting: status.connecting || false,
        userId: status.userId,
        lastError: status.error,
      }, () => { chrome.runtime.lastError && console.error('storage set failed', chrome.runtime.lastError); });
    });

    chrome.storage.onChanged.addListener((changes, area) => {
      if (area !== 'sync') return;
      if (changes.enabled) this.settings.enabled = changes.enabled.newValue;
      if (changes.sites) this.settings.sites = changes.sites.newValue || {};
      if (changes.idleTimeout) {
        this.settings.idleTimeout = changes.idleTimeout.newValue || 0;
        this.resetIdleTimer();
      }
      if (changes.privacyMode) this.settings.privacyMode = changes.privacyMode.newValue || false;
      if (changes.templates) this.settings.templates = changes.templates.newValue || {};
    });
  }

  loadSettings() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(DEFAULTS, (s) => {
        this.settings = s;
        resolve();
      });
    });
  }

  /**
   * @param {string} site
   * @param {PresenceData} data
   * @returns {PresenceData}
   */
  formatPresence(site, data) {
    return formatPresence(site, data, this.settings);
  }

  /**
   * @param {string} site
   * @param {PresenceData} data
   */
  sendActivity(site, data) {
    if (!this.settings.enabled || this.settings.sites[site] === false) return;
    const finalData = this.formatPresence(site, data);
    this.currentSite = site;
    this.currentActivity = finalData;
    this.rpc.setActivity(finalData);
    this.lastError = null;
    chrome.storage.local.set({ currentSite: site, currentActivity: finalData, lastError: null }, () => {
      if (chrome.runtime.lastError) console.error('storage set failed', chrome.runtime.lastError);
    });
    this.resetIdleTimer();
  }

  clearActivity() {
    this.currentSite = null;
    this.currentActivity = null;
    this.rpc.clearActivity();
    chrome.storage.local.set({ currentSite: null, currentActivity: null }, () => {
      if (chrome.runtime.lastError) console.error('storage set failed', chrome.runtime.lastError);
    });
  }

  /**
   * @returns {StatusObject}
   */
  getStatus() {
    return {
      rpcConnected: this.rpcConnected || false,
      connecting: this.connecting || false,
      userId: this.userId || null,
      currentSite: this.currentSite,
      currentActivity: this.currentActivity,
      lastError: this.lastError,
    };
  }

  trackTab(tabId) {
    this.trackedTabs.add(tabId);
  }

  untrackTab(tabId) {
    if (this.trackedTabs.delete(tabId) && this.trackedTabs.size === 0) {
      this.clearActivity();
    }
  }

  resetIdleTimer() {
    if (this.idleTimer) clearTimeout(this.idleTimer);
    if (this.settings.idleTimeout > 0) {
      this.idleTimer = setTimeout(() => {
        this.clearActivity();
      }, this.settings.idleTimeout * 60 * 1000);
    }
  }
}


const CLIENT_ID = '1513880949220311181';

const rpc = new RPCManager('com.digitansjournal.rpc', CLIENT_ID);
const state = new StateManager(rpc);

chrome.tabs.onRemoved.addListener((tabId) => {
  state.untrackTab(tabId);
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'presence') {
    if (sender.tab && sender.tab.id) state.trackTab(sender.tab.id);
    state.sendActivity(msg.site, msg.data);
    sendResponse({ ok: true });
  }
  if (msg.type === 'getStatus') {
    sendResponse(state.getStatus());
  }
  if (msg.type === 'reconnect') {
    rpc.disconnect();
    rpc.connect();
    sendResponse({ ok: true });
  }
  if (msg.type === 'clearActivity') {
    state.clearActivity();
    sendResponse({ ok: true });
  }
  return true;
});

chrome.commands.onCommand.addListener((command) => {
  if (command === 'clear-activity') state.clearActivity();
});

state.loadSettings().then(() => rpc.connect());

chrome.runtime.onStartup.addListener(() => {
  rpc.connect();
});

chrome.runtime.onInstalled.addListener(() => {
  rpc.connect();
});

