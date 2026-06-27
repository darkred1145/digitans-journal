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

const SITE = 'gametora';

function getPageInfo() {
  const path = window.location.pathname;
  const h1 = document.querySelector('h1');
  const h1Text = h1 ? h1.textContent.trim() : '';

  if (path === '/umamusume' || path === '/umamusume/') {
    return {
      details: 'GameTora \u00b7 Uma Musume',
      state: 'Browsing GameTora',
      largeImageKey: 'digitan',
      largeImageText: 'gametora.com/umamusume \u00b7 Digitan\'s Journal',
      smallImageKey: 'gametora_small',
      smallImageText: 'GameTora',
      raw: { title: 'GameTora \u00b7 Uma Musume', page: null, totalPages: null },
    };
  }

  const remaining = path.replace(/^\/umamusume\/?/, '');
  const segments = remaining.split('/').filter(Boolean);

  if (segments.length >= 2) {
    const category = segments[0];
    const item = segments.slice(1).join('/');
    const label = h1Text || item;

    let state = `Viewing ${category}`;
    if (category === 'characters' && item !== 'profiles') state = 'Viewing character';
    else if (category === 'supports') state = 'Viewing support card';
    else if (category === 'events') state = 'Viewing event';
    else if (category === 'guides') state = 'Reading guide';

    return {
      details: label,
      state,
      largeImageKey: 'digitan',
      largeImageText: 'gametora.com/umamusume \u00b7 Digitan\'s Journal',
      smallImageKey: 'gametora_small',
      smallImageText: 'GameTora',
      raw: { title: label, page: null, totalPages: null },
    };
  }

  const page = segments[0] || '';
  const pageLabels = {
    'characters': 'Character List',
    'supports': 'Support Card List',
    'skills': 'Skill List',
    'races': 'Race List',
    'racetracks': 'Racetrack List',
    'scenarios': 'Scenario List',
    'items': 'Item List',
    'gacha': 'Gacha Banners',
    'gacha-simulator': 'Gacha Simulator',
    'training-event-helper': 'Training Event Helper',
    'compatibility': 'Compatibility Calculator',
    'race-scheduler': 'Race Scheduler',
    'compare': 'Compare Tool',
    'skill-condition-viewer': 'Skill Condition Viewer',
    'banner-planner': 'Banner Planner',
    'collection-tracker': 'Collection Tracker',
    'canvas': 'Canvas',
    'foresight-timeline': 'Foresight Timeline',
    'nicknames': 'Epithets',
    'missions': 'Missions',
    'events': 'Events',
    'trainer-titles': 'Trainer Titles',
    'g1-race-factor-list': 'G1 Race Factors',
    'beginners-guide': "Beginner's Guide",
    'race-mechanics': 'Race Mechanics Handbook',
    'legacies': 'Legacy Guide',
    'team-trials-pvp-scoring': 'Team Trials Scoring',
    'trackblazer': 'Trackblazer Scenario',
    'grand-live': 'Grand Live Career',
    'grand-masters': 'Grand Masters Career',
    'project-larc': "Project L'Arc Career",
    'uaf': 'U.A.F. Career',
    'great-food-festival': 'Great Food Festival',
    'the-twinkle-legends': 'Twinkle Legends Career',
    'design-your-island': 'Design Your Island',
    'run-mecha-umamusume': 'Run, Mecha Umamusume!',
    'unity-cup': 'Unity Cup Scenario',
    'ura-finals': 'URA Finale Scenario',
  };

  const label = pageLabels[page];
  if (label) {
    return {
      details: h1Text || label,
      state: 'Browsing GameTora',
      largeImageKey: 'digitan',
      largeImageText: 'gametora.com/umamusume \u00b7 Digitan\'s Journal',
      smallImageKey: 'gametora_small',
      smallImageText: 'GameTora',
      raw: { title: h1Text || label, page: null, totalPages: null },
    };
  }

  return {
    details: h1Text || 'GameTora Uma Musume',
    state: 'Browsing GameTora',
    largeImageKey: 'digitan',
    largeImageText: 'gametora.com/umamusume \u00b7 Digitan\'s Journal',
    smallImageKey: 'gametora_small',
    smallImageText: 'GameTora',
    raw: { title: h1Text || 'GameTora Uma Musume', page: null, totalPages: null },
  };
}

harvest(SITE, {}, getPageInfo);

