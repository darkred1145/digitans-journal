const SITE = 'uma-guide';

const BASE = {
  largeImageKey: 'digitan',
  smallImageKey: 'umaguide_small',
  smallImageText: 'uma.guide',
};

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

function presence(details, state, meta = {}) {
  return {
    ...BASE,
    details,
    state,
    largeImageText: meta.subtitle || 'uma.guide · Digitan\'s Journal',
    raw: {
      title: details,
      page: null,
      totalPages: null,
      type: meta.type || null,
      rarity: meta.rarity || null,
      subtitle: meta.subtitle || null,
    },
  };
}

function getPageInfo() {
  const path = window.location.pathname;
  const title = document.title.replace(/\s*\|\s*uma\.guide.*$/, '').trim();
  const isDetailPage = /^\/(characters|support-cards)\/(detail|\d+)/.test(path);

  if (path === '/' || path === '') {
    return presence('uma.guide', 'Browsing homepage');
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
  const meta = getCardMeta();
  const displayName = isDetailPage ? (getNameFromDOM() || title || label) : (title || label);

  if (!isDetailPage) return presence(displayName, `Browsing ${label}`, meta);

  const stateParts = [meta.rarity, meta.type].filter(Boolean);
  return presence(displayName, stateParts.length ? stateParts.join(' · ') : `Browsing ${label}`, meta);
}

harvest(SITE, { interval: 4000 }, getPageInfo);
