const SITE = 'uma-guide';

function getPageInfo() {
  const path = window.location.pathname;
  const title = document.title.replace(/\s*\|\s*uma\.guide.*$/, '').trim();

  if (path === '/' || path === '') {
    return {
      details: 'uma.guide',
      state: 'Browsing homepage',
      largeImageKey: 'digitan',
      largeImageText: 'uma.guide \u00b7 Digitan\'s Journal',
      smallImageKey: 'umaguide_small',
      smallImageText: 'uma.guide',
      raw: { title: 'uma.guide', page: null, totalPages: null },
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

  return {
    details: title || label,
    state: `Browsing ${label}`,
    largeImageKey: 'digitan',
    largeImageText: 'uma.guide \u00b7 Digitan\'s Journal',
    smallImageKey: 'umaguide_small',
    smallImageText: 'uma.guide',
    raw: { title: title || label, page: null, totalPages: null },
  };
}

harvest(SITE, {}, getPageInfo);
