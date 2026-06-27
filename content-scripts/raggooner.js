const SITE = 'raggooner';

function getPageInfo() {
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  const h1 = document.querySelector('h1');
  const h1Text = h1 ? h1.textContent.trim() : '';

  const base = {
    largeImageKey: 'digitan',
    largeImageText: 'raggooneropen.web.app \u00b7 Digitan\'s Journal',
    smallImageKey: 'raggooner_small',
    smallImageText: 'Raccoon Open',
  };

  if (path === '/') {
    return { ...base, details: 'Raccoon Open', state: 'Browsing tournaments', raw: { title: 'Raccoon Open', page: null, totalPages: null } };
  }

  const tourneyMatch = path.match(/^\/t\/(.+)/);
  if (tourneyMatch) {
    const title = h1Text || 'Tournament';
    return { ...base, details: title, state: 'Viewing tournament', raw: { title, page: null, totalPages: null } };
  }

  const pageMap = {
    '/analytics': { details: 'Analytics', state: 'Browsing stats' },
    '/tools': { details: 'Tools', state: 'Using tools' },
    '/profile': { details: 'Profile', state: 'Viewing profile' },
    '/admin/users': { details: 'Admin', state: 'Managing users' },
    '/settings': { details: 'Settings', state: 'Configuring' },
  };

  if (pageMap[path]) {
    const title = h1Text || pageMap[path].details;
    return { ...base, details: title, state: pageMap[path].state, raw: { title, page: null, totalPages: null } };
  }

  const title = h1Text || 'Raccoon Open';
  return { ...base, details: title, state: 'Browsing Raccoon Open', raw: { title, page: null, totalPages: null } };
}

harvest(SITE, {}, getPageInfo);
