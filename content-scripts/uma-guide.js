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
