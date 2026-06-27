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

const SITE = 'nhentai';
const GALLERY_CACHE_MAX = 50;
const galleryCache = new Map();

function getPageInfo() {
  const path = window.location.pathname;

  if (path === '/' || path === '/home') {
    return { details: 'Browsing nhentai' };
  }

  const match = path.match(/^\/g\/(\d+)\/(\d+)?\/?$/);
  if (match) {
    const id = match[1];
    const pageNum = match[2] || null;
    let title = 'Untitled';
    let totalPages = '?';
    let currentPage = pageNum || '?';

    const infoEl = document.getElementById('info');
    if (infoEl) {
      const titleEl = infoEl.querySelector('.pretty');
      if (titleEl) title = titleEl.textContent.trim();
      document.querySelectorAll('.tag-container').forEach(el => {
        if (el.textContent.trim().startsWith('Pages:')) {
          const num = el.querySelector('.name');
          if (num) totalPages = num.textContent.trim();
        }
      });
      galleryCache.set(id, { title, totalPages });
      if (galleryCache.size > GALLERY_CACHE_MAX) {
        const firstKey = galleryCache.keys().next().value;
        galleryCache.delete(firstKey);
      }
    } else {
      const cached = galleryCache.get(id);
      if (cached) {
        title = cached.title;
        totalPages = cached.totalPages;
      } else {
        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) title = ogTitle.content;
      }
    }
    return {
      details: title,
      state: currentPage !== '?' ? `Page ${currentPage} / ${totalPages}` : undefined,
      largeImageKey: 'digitan',
      largeImageText: 'nhentai.net \u00b7 Digitan\'s Journal',
      smallImageKey: 'nhentai_small',
      smallImageText: 'nhentai.net',
      buttons: [{ label: 'View Gallery', url: `https://nhentai.net/g/${id}/` }],
      raw: { title, page: currentPage, totalPages },
    };
  }

  if (path.startsWith('/search/')) {
    const params = new URLSearchParams(window.location.search);
    return {
      details: 'Searching',
      state: params.get('q') || 'nhentai',
      largeImageKey: 'digitan',
      largeImageText: 'nhentai.net \u00b7 Digitan\'s Journal',
      smallImageKey: 'nhentai_small',
      smallImageText: 'nhentai.net',
    };
  }

  if (/^\/(tag|artist|parody|character|group|language|category)\//.test(path)) {
    const labelEl = document.querySelector('h1 .name');
    return {
      details: 'Browsing nhentai',
      state: labelEl ? labelEl.textContent.trim() : path.split('/').filter(Boolean).pop(),
      largeImageKey: 'digitan',
      largeImageText: 'nhentai.net \u00b7 Digitan\'s Journal',
      smallImageKey: 'nhentai_small',
      smallImageText: 'nhentai.net',
    };
  }

  return {
    details: 'Browsing nhentai',
    largeImageKey: 'digitan',
    largeImageText: 'nhentai.net \u00b7 Digitan\'s Journal',
    smallImageKey: 'nhentai_small',
    smallImageText: 'nhentai.net',
  };
}

harvest(SITE, {}, getPageInfo);

