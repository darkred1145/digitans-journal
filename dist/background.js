(function(a,b){if("function"==typeof define&&define.amd)define("webextension-polyfill",["module"],b);else if("undefined"!=typeof exports)b(module);else{var c={exports:{}};b(c),a.browser=c.exports}})("undefined"==typeof globalThis?"undefined"==typeof self?this:self:globalThis,function(a){"use strict";if(!(globalThis.chrome&&globalThis.chrome.runtime&&globalThis.chrome.runtime.id))throw new Error("This script should only be loaded in a browser extension.");if(!(globalThis.browser&&globalThis.browser.runtime&&globalThis.browser.runtime.id)){a.exports=(a=>{const b={alarms:{clear:{minArgs:0,maxArgs:1},clearAll:{minArgs:0,maxArgs:0},get:{minArgs:0,maxArgs:1},getAll:{minArgs:0,maxArgs:0}},bookmarks:{create:{minArgs:1,maxArgs:1},get:{minArgs:1,maxArgs:1},getChildren:{minArgs:1,maxArgs:1},getRecent:{minArgs:1,maxArgs:1},getSubTree:{minArgs:1,maxArgs:1},getTree:{minArgs:0,maxArgs:0},move:{minArgs:2,maxArgs:2},remove:{minArgs:1,maxArgs:1},removeTree:{minArgs:1,maxArgs:1},search:{minArgs:1,maxArgs:1},update:{minArgs:2,maxArgs:2}},browserAction:{disable:{minArgs:0,maxArgs:1,fallbackToNoCallback:!0},enable:{minArgs:0,maxArgs:1,fallbackToNoCallback:!0},getBadgeBackgroundColor:{minArgs:1,maxArgs:1},getBadgeText:{minArgs:1,maxArgs:1},getPopup:{minArgs:1,maxArgs:1},getTitle:{minArgs:1,maxArgs:1},openPopup:{minArgs:0,maxArgs:0},setBadgeBackgroundColor:{minArgs:1,maxArgs:1,fallbackToNoCallback:!0},setBadgeText:{minArgs:1,maxArgs:1,fallbackToNoCallback:!0},setIcon:{minArgs:1,maxArgs:1},setPopup:{minArgs:1,maxArgs:1,fallbackToNoCallback:!0},setTitle:{minArgs:1,maxArgs:1,fallbackToNoCallback:!0}},browsingData:{remove:{minArgs:2,maxArgs:2},removeCache:{minArgs:1,maxArgs:1},removeCookies:{minArgs:1,maxArgs:1},removeDownloads:{minArgs:1,maxArgs:1},removeFormData:{minArgs:1,maxArgs:1},removeHistory:{minArgs:1,maxArgs:1},removeLocalStorage:{minArgs:1,maxArgs:1},removePasswords:{minArgs:1,maxArgs:1},removePluginData:{minArgs:1,maxArgs:1},settings:{minArgs:0,maxArgs:0}},commands:{getAll:{minArgs:0,maxArgs:0}},contextMenus:{remove:{minArgs:1,maxArgs:1},removeAll:{minArgs:0,maxArgs:0},update:{minArgs:2,maxArgs:2}},cookies:{get:{minArgs:1,maxArgs:1},getAll:{minArgs:1,maxArgs:1},getAllCookieStores:{minArgs:0,maxArgs:0},remove:{minArgs:1,maxArgs:1},set:{minArgs:1,maxArgs:1}},devtools:{inspectedWindow:{eval:{minArgs:1,maxArgs:2,singleCallbackArg:!1}},panels:{create:{minArgs:3,maxArgs:3,singleCallbackArg:!0},elements:{createSidebarPane:{minArgs:1,maxArgs:1}}}},downloads:{cancel:{minArgs:1,maxArgs:1},download:{minArgs:1,maxArgs:1},erase:{minArgs:1,maxArgs:1},getFileIcon:{minArgs:1,maxArgs:2},open:{minArgs:1,maxArgs:1,fallbackToNoCallback:!0},pause:{minArgs:1,maxArgs:1},removeFile:{minArgs:1,maxArgs:1},resume:{minArgs:1,maxArgs:1},search:{minArgs:1,maxArgs:1},show:{minArgs:1,maxArgs:1,fallbackToNoCallback:!0}},extension:{isAllowedFileSchemeAccess:{minArgs:0,maxArgs:0},isAllowedIncognitoAccess:{minArgs:0,maxArgs:0}},history:{addUrl:{minArgs:1,maxArgs:1},deleteAll:{minArgs:0,maxArgs:0},deleteRange:{minArgs:1,maxArgs:1},deleteUrl:{minArgs:1,maxArgs:1},getVisits:{minArgs:1,maxArgs:1},search:{minArgs:1,maxArgs:1}},i18n:{detectLanguage:{minArgs:1,maxArgs:1},getAcceptLanguages:{minArgs:0,maxArgs:0}},identity:{launchWebAuthFlow:{minArgs:1,maxArgs:1}},idle:{queryState:{minArgs:1,maxArgs:1}},management:{get:{minArgs:1,maxArgs:1},getAll:{minArgs:0,maxArgs:0},getSelf:{minArgs:0,maxArgs:0},setEnabled:{minArgs:2,maxArgs:2},uninstallSelf:{minArgs:0,maxArgs:1}},notifications:{clear:{minArgs:1,maxArgs:1},create:{minArgs:1,maxArgs:2},getAll:{minArgs:0,maxArgs:0},getPermissionLevel:{minArgs:0,maxArgs:0},update:{minArgs:2,maxArgs:2}},pageAction:{getPopup:{minArgs:1,maxArgs:1},getTitle:{minArgs:1,maxArgs:1},hide:{minArgs:1,maxArgs:1,fallbackToNoCallback:!0},setIcon:{minArgs:1,maxArgs:1},setPopup:{minArgs:1,maxArgs:1,fallbackToNoCallback:!0},setTitle:{minArgs:1,maxArgs:1,fallbackToNoCallback:!0},show:{minArgs:1,maxArgs:1,fallbackToNoCallback:!0}},permissions:{contains:{minArgs:1,maxArgs:1},getAll:{minArgs:0,maxArgs:0},remove:{minArgs:1,maxArgs:1},request:{minArgs:1,maxArgs:1}},runtime:{getBackgroundPage:{minArgs:0,maxArgs:0},getPlatformInfo:{minArgs:0,maxArgs:0},openOptionsPage:{minArgs:0,maxArgs:0},requestUpdateCheck:{minArgs:0,maxArgs:0},sendMessage:{minArgs:1,maxArgs:3},sendNativeMessage:{minArgs:2,maxArgs:2},setUninstallURL:{minArgs:1,maxArgs:1}},sessions:{getDevices:{minArgs:0,maxArgs:1},getRecentlyClosed:{minArgs:0,maxArgs:1},restore:{minArgs:0,maxArgs:1}},storage:{local:{clear:{minArgs:0,maxArgs:0},get:{minArgs:0,maxArgs:1},getBytesInUse:{minArgs:0,maxArgs:1},remove:{minArgs:1,maxArgs:1},set:{minArgs:1,maxArgs:1}},managed:{get:{minArgs:0,maxArgs:1},getBytesInUse:{minArgs:0,maxArgs:1}},sync:{clear:{minArgs:0,maxArgs:0},get:{minArgs:0,maxArgs:1},getBytesInUse:{minArgs:0,maxArgs:1},remove:{minArgs:1,maxArgs:1},set:{minArgs:1,maxArgs:1}}},tabs:{captureVisibleTab:{minArgs:0,maxArgs:2},create:{minArgs:1,maxArgs:1},detectLanguage:{minArgs:0,maxArgs:1},discard:{minArgs:0,maxArgs:1},duplicate:{minArgs:1,maxArgs:1},executeScript:{minArgs:1,maxArgs:2},get:{minArgs:1,maxArgs:1},getCurrent:{minArgs:0,maxArgs:0},getZoom:{minArgs:0,maxArgs:1},getZoomSettings:{minArgs:0,maxArgs:1},goBack:{minArgs:0,maxArgs:1},goForward:{minArgs:0,maxArgs:1},highlight:{minArgs:1,maxArgs:1},insertCSS:{minArgs:1,maxArgs:2},move:{minArgs:2,maxArgs:2},query:{minArgs:1,maxArgs:1},reload:{minArgs:0,maxArgs:2},remove:{minArgs:1,maxArgs:1},removeCSS:{minArgs:1,maxArgs:2},sendMessage:{minArgs:2,maxArgs:3},setZoom:{minArgs:1,maxArgs:2},setZoomSettings:{minArgs:1,maxArgs:2},update:{minArgs:1,maxArgs:2}},topSites:{get:{minArgs:0,maxArgs:0}},webNavigation:{getAllFrames:{minArgs:1,maxArgs:1},getFrame:{minArgs:1,maxArgs:1}},webRequest:{handlerBehaviorChanged:{minArgs:0,maxArgs:0}},windows:{create:{minArgs:0,maxArgs:1},get:{minArgs:1,maxArgs:2},getAll:{minArgs:0,maxArgs:1},getCurrent:{minArgs:0,maxArgs:1},getLastFocused:{minArgs:0,maxArgs:1},remove:{minArgs:1,maxArgs:1},update:{minArgs:2,maxArgs:2}}};if(0===Object.keys(b).length)throw new Error("api-metadata.json has not been included in browser-polyfill");class c extends WeakMap{constructor(a,b=void 0){super(b),this.createItem=a}get(a){return this.has(a)||this.set(a,this.createItem(a)),super.get(a)}}const d=a=>a&&"object"==typeof a&&"function"==typeof a.then,e=(b,c)=>(...d)=>{a.runtime.lastError?b.reject(new Error(a.runtime.lastError.message)):c.singleCallbackArg||1>=d.length&&!1!==c.singleCallbackArg?b.resolve(d[0]):b.resolve(d)},f=a=>1==a?"argument":"arguments",g=(a,b)=>function(c,...d){if(d.length<b.minArgs)throw new Error(`Expected at least ${b.minArgs} ${f(b.minArgs)} for ${a}(), got ${d.length}`);if(d.length>b.maxArgs)throw new Error(`Expected at most ${b.maxArgs} ${f(b.maxArgs)} for ${a}(), got ${d.length}`);return new Promise((f,g)=>{if(b.fallbackToNoCallback)try{c[a](...d,e({resolve:f,reject:g},b))}catch(e){console.warn(`${a} API method doesn't seem to support the callback parameter, `+"falling back to call it without a callback: ",e),c[a](...d),b.fallbackToNoCallback=!1,b.noCallback=!0,f()}else b.noCallback?(c[a](...d),f()):c[a](...d,e({resolve:f,reject:g},b))})},h=(a,b,c)=>new Proxy(b,{apply(b,d,e){return c.call(d,a,...e)}});let i=Function.call.bind(Object.prototype.hasOwnProperty);const j=(a,b={},c={})=>{let d=Object.create(null),e=Object.create(a);return new Proxy(e,{has(b,c){return c in a||c in d},get(e,f){if(f in d)return d[f];if(!(f in a))return;let k=a[f];if("function"==typeof k){if("function"==typeof b[f])k=h(a,a[f],b[f]);else if(i(c,f)){let b=g(f,c[f]);k=h(a,a[f],b)}else k=k.bind(a);}else if("object"==typeof k&&null!==k&&(i(b,f)||i(c,f)))k=j(k,b[f],c[f]);else if(i(c,"*"))k=j(k,b[f],c["*"]);else return Object.defineProperty(d,f,{configurable:!0,enumerable:!0,get(){return a[f]},set(b){a[f]=b}}),k;return d[f]=k,k},set(b,c,e){return c in d?d[c]=e:a[c]=e,!0},defineProperty(a,b,c){return Reflect.defineProperty(d,b,c)},deleteProperty(a,b){return Reflect.deleteProperty(d,b)}})},k=a=>({addListener(b,c,...d){b.addListener(a.get(c),...d)},hasListener(b,c){return b.hasListener(a.get(c))},removeListener(b,c){b.removeListener(a.get(c))}}),l=new c(a=>"function"==typeof a?function(b){const c=j(b,{},{getContent:{minArgs:0,maxArgs:0}});a(c)}:a),m=new c(a=>"function"==typeof a?function(b,c,e){let f,g,h=!1,i=new Promise(a=>{f=function(b){h=!0,a(b)}});try{g=a(b,c,f)}catch(a){g=Promise.reject(a)}const j=!0!==g&&d(g);if(!0!==g&&!j&&!h)return!1;const k=a=>{a.then(a=>{e(a)},a=>{let b;b=a&&(a instanceof Error||"string"==typeof a.message)?a.message:"An unexpected error occurred",e({__mozWebExtensionPolyfillReject__:!0,message:b})}).catch(a=>{console.error("Failed to send onMessage rejected reply",a)})};return j?k(g):k(i),!0}:a),n=({reject:b,resolve:c},d)=>{a.runtime.lastError?a.runtime.lastError.message==="The message port closed before a response was received."?c():b(new Error(a.runtime.lastError.message)):d&&d.__mozWebExtensionPolyfillReject__?b(new Error(d.message)):c(d)},o=(a,b,c,...d)=>{if(d.length<b.minArgs)throw new Error(`Expected at least ${b.minArgs} ${f(b.minArgs)} for ${a}(), got ${d.length}`);if(d.length>b.maxArgs)throw new Error(`Expected at most ${b.maxArgs} ${f(b.maxArgs)} for ${a}(), got ${d.length}`);return new Promise((a,b)=>{const e=n.bind(null,{resolve:a,reject:b});d.push(e),c.sendMessage(...d)})},p={devtools:{network:{onRequestFinished:k(l)}},runtime:{onMessage:k(m),onMessageExternal:k(m),sendMessage:o.bind(null,"sendMessage",{minArgs:1,maxArgs:3})},tabs:{sendMessage:o.bind(null,"sendMessage",{minArgs:2,maxArgs:3})}},q={clear:{minArgs:1,maxArgs:1},get:{minArgs:1,maxArgs:1},set:{minArgs:1,maxArgs:1}};return b.privacy={network:{"*":q},services:{"*":q},websites:{"*":q}},j(a,p,b)})(chrome)}else a.exports=globalThis.browser});
//# sourceMappingURL=browser-polyfill.min.js.map

// webextension-polyfill v.0.12.0 (https://github.com/mozilla/webextension-polyfill)

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

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
 * @property {number} [startTimestamp]
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
  sites: { gametora: true, raggooner: true, 'uma-guide': true, umalator: true },
  idleTimeout: 0,
  privacyMode: false,
  templates: {},
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DEFAULTS };
}


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

const STABLE_CONNECTION_MS = 10000;

class RPCManager {
  constructor(hostName, clientId) {
    this.hostName = hostName;
    this.clientId = clientId;
    this.port = null;
    this.listeners = [];
    this._backoff = 0;
    this._backoffTimerId = null;
    this._connectTime = 0;
    this._stabilityTimerId = null;
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
    this.port = browser.runtime.connectNative(this.hostName);
    this._emit({ connected: false, connecting: true, userId: null, error: null });
    this.port.onMessage.addListener((msg) => {
      if (msg.type === TYPE_RPC_STATUS) {
        if (msg.connected) {
          this._connectTime = Date.now();
          if (this._stabilityTimerId) clearTimeout(this._stabilityTimerId);
          this._stabilityTimerId = setTimeout(() => {
            this._stabilityTimerId = null;
            this._backoff = 0;
          }, STABLE_CONNECTION_MS);
        }
        this._emit({ connected: msg.connected, connecting: false, userId: msg.userId || null, error: msg.error || null });
      }
    });
    this.port.onDisconnect.addListener(() => {
      this.port = null;
      if (this._stabilityTimerId) {
        clearTimeout(this._stabilityTimerId);
        this._stabilityTimerId = null;
      }
      this._emit({ connected: false, connecting: false, userId: null, error: 'Native host disconnected' });
      this._scheduleReconnect();
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
    if (this._stabilityTimerId) {
      clearTimeout(this._stabilityTimerId);
      this._stabilityTimerId = null;
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
      if (this._stabilityTimerId) {
        clearTimeout(this._stabilityTimerId);
        this._stabilityTimerId = null;
      }
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
    this._untrackedTabs = new Set();
    this._lastStableKey = null;
    this.settings = { ...DEFAULTS };

    rpc.onStatus((status) => {
      this.lastError = status.error;
      this.userId = status.userId || null;
      this.rpcConnected = status.connected;
      this.connecting = status.connecting || false;
      if (status.connected && this.currentActivity) {
        this.rpc.setActivity(this.currentActivity);
      }
      browser.storage.local.set({
        rpcConnected: status.connected,
        connecting: status.connecting || false,
        userId: status.userId,
        lastError: status.error,
      }).catch((err) => console.error('storage set failed', err));
    });

    browser.storage.onChanged.addListener((changes, area) => {
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

  async loadSettings() {
    this.settings = await browser.storage.sync.get(DEFAULTS);
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
    finalData.details = finalData.details || 'Digitan\'s Journal';
    finalData.largeImageKey = finalData.largeImageKey || 'digitan';
    finalData.largeImageText = finalData.largeImageText || 'Digitan\'s Journal';
    const stableKey = [site, finalData.details, data.raw?.phase || ''].join('::');
    if (
      !this.currentActivity ||
      stableKey !== this._lastStableKey
    ) {
      this._lastStableKey = stableKey;
      finalData.startTimestamp = Date.now();
    } else {
      finalData.startTimestamp = this.currentActivity.startTimestamp;
    }
    this.currentSite = site;
    this.currentActivity = finalData;
    this.rpc.setActivity(finalData);
    this.lastError = null;
    browser.storage.local.set({ currentSite: site, currentActivity: finalData, lastError: null })
      .catch((err) => console.error('storage set failed', err));
    this.resetIdleTimer();
  }

  clearActivity() {
    this.currentSite = null;
    this.currentActivity = null;
    this._lastStableKey = null;
    this.rpc.clearActivity();
    browser.storage.local.set({ currentSite: null, currentActivity: null })
      .catch((err) => console.error('storage set failed', err));
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
    if (this._untrackedTabs.has(tabId)) return false;
    this.trackedTabs.add(tabId);
    return true;
  }

  allowTab(tabId) {
    this._untrackedTabs.delete(tabId);
  }

  untrackTab(tabId) {
    this._untrackedTabs.add(tabId);
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

let siteMatches = [];

async function loadSiteMatches() {
  try {
    const resp = await fetch(chrome.runtime.getURL('sites.json'));
    siteMatches = (await resp.json()).map(s => s.match);
  } catch {}
}

function isSupportedUrl(url) {
  if (!url) return false;
  return siteMatches.some(m => {
    const pattern = m.replace(/\*/g, '');
    return url.startsWith(pattern);
  });
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.url) {
    if (isSupportedUrl(changeInfo.url)) {
      state.allowTab(tabId);
    } else {
      state.untrackTab(tabId);
    }
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  state.untrackTab(tabId);
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'presence') {
    if (sender.tab && sender.tab.id) {
      if (sender.url && (sender.url.startsWith('chrome-extension://') || sender.url.startsWith('moz-extension://'))) {
        // Extension page (popup/options), not a content script — don't track
      } else if (!state.trackTab(sender.tab.id)) {
        sendResponse({ ok: false }); return;
      }
    }
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

Promise.all([state.loadSettings(), loadSiteMatches()]).then(() => rpc.connect());

chrome.runtime.onStartup.addListener(() => {
  rpc.connect();
});

chrome.runtime.onInstalled.addListener(() => {
  rpc.connect();
});

