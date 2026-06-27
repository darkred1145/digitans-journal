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
 * @param {HarvesterConfig} config
 * @param {function(): (PresenceData|null|undefined)} extractor
 */
function harvest(site, config, extractor) {
  const interval = config.interval ?? 5000;
  const throttle = config.throttle ?? 2000;
  let lastSend = 0;
  let lastUrl = location.href;
  let timeoutId = null;
  let intervalId;
  let dead = false;

  function stop() {
    dead = true;
    clearInterval(intervalId);
    if (timeoutId) clearTimeout(timeoutId);
  }

  /**
   * @param {PresenceData|null} data
   */
  function send(data) {
    if (!data || dead) return;
    validatePresence(data);
    data.details = truncate(data.details);
    if (data.state) data.state = truncate(data.state);
    try {
      chrome.runtime.sendMessage({ type: 'presence', site, data }, () => {
        if (chrome.runtime.lastError) dead = true;
      });
    } catch (e) {
      dead = true;
      stop();
      console.error('[harvester] ' + site + ': extension context invalidated');
    }
  }

  function tick(force) {
    if (dead) return;
    try {
      const url = location.href;
      if (url !== lastUrl) {
        lastUrl = url;
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => tick(true), 1000);
        return;
      }

      const now = Date.now();
      if (!force && now - lastSend < throttle) return;

      const data = extractor();
      if (data) {
        lastSend = Date.now();
        send(data);
      }
    } catch (err) {
      console.error('[harvester] ' + site + ':', err);
    }
  }

  setTimeout(() => tick(true), 1000);
  intervalId = setInterval(tick, interval);

  return stop;
}

const SITE = 'uma-guide';

const DETAIL_NAME_SELECTORS = [
  '.char-card-identity h2',
  '.char-card-identity h3',
  '.sc-card-identity h2',
  '.sc-card-identity h3',
  '.vp-doc h1',
  '.vp-doc h2',
];

function getNameFromDOM() {
  const loading = document.querySelector('.vp-doc .loading');
  if (loading && loading.offsetParent !== null) return null;
  for (const sel of DETAIL_NAME_SELECTORS) {
    const el = document.querySelector(sel);
    if (el) {
      const text = el.textContent.trim();
      if (text && !text.startsWith('Loading') && text.length < 120) return text;
    }
  }
  return null;
}

function getCardMeta() {
  const path = window.location.pathname;

  if (/^\/characters\//.test(path)) {
    const subtitleEl = document.querySelector('.char-hero__subtitle');
    return {
      type: 'Character',
      rarity: null,
      subtitle: subtitleEl ? subtitleEl.textContent.trim() : null,
    };
  }

  if (/^\/support-cards\//.test(path)) {
    const badgesEl = document.querySelector('.card-badges');
    const titleEl = document.querySelector('.card-title-badge');
    let rarity = null;
    if (badgesEl) {
      const parts = badgesEl.textContent.trim().split(/\s+/);
      rarity = parts[0] || null;
    }
    return {
      type: 'Support Card',
      rarity,
      subtitle: titleEl ? titleEl.textContent.trim() : null,
    };
  }

  return {};
}

function getPageInfo() {
  const path = window.location.pathname;
  const title = document.title.replace(/\s*\|\s*uma\.guide.*$/, '').trim();
  const isDetailPage = /^\/(characters|support-cards)\/(detail|\d+)/.test(path);

  if (path === '/' || path === '') {
    return {
      details: 'uma.guide',
      state: 'Browsing homepage',
      largeImageKey: 'digitan',
      largeImageText: 'uma.guide \u00b7 Digitan\'s Journal',
      smallImageKey: 'umaguide_small',
      smallImageText: 'uma.guide',
      raw: { title: 'uma.guide', page: null, totalPages: null, type: null, rarity: null, subtitle: null },
    };
  }

  const section = path.split('/').filter(Boolean)[0];

  const sectionLabels = {
    'characters': 'Characters',
    'support-cards': 'Support Cards',
    'skills': 'Skills',
    'guides': 'Guides',
    'tracks': 'Track Browser',
    'agenda-planner': 'Agenda Planner',
    'roster-viewer': 'Roster Viewer',
    'cm-schedule': 'Champions Meeting',
    'banner-reviews': 'Banner Reviews',
    'about': 'About',
  };

  const label = sectionLabels[section] || 'uma.guide';

  let displayName = title || label;
  const meta = getCardMeta();

  if (isDetailPage) {
    const domName = getNameFromDOM();
    if (domName) displayName = domName;
  }

  const stateParts = [];
  if (isDetailPage) {
    if (meta.rarity) stateParts.push(meta.rarity);
    if (meta.type) stateParts.push(meta.type);
  }
  const state = stateParts.length > 0 ? stateParts.join(' \u00b7 ') : `Browsing ${label}`;

  return {
    details: displayName,
    state,
    largeImageKey: 'digitan',
    largeImageText: meta.subtitle || 'uma.guide \u00b7 Digitan\'s Journal',
    smallImageKey: 'umaguide_small',
    smallImageText: 'uma.guide',
    raw: { title: displayName, page: null, totalPages: null, type: meta.type || null, rarity: meta.rarity || null, subtitle: meta.subtitle || null },
  };
}

harvest(SITE, { interval: 4000 }, getPageInfo);

