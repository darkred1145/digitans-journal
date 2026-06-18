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
    return { ...base, details: 'Raccoon Open', state: 'Browsing tournaments' };
  }

  const tourneyMatch = path.match(/^\/t\/(.+)/);
  if (tourneyMatch) {
    return { ...base, details: h1Text || 'Tournament', state: 'Viewing tournament' };
  }

  const pageMap = {
    '/analytics': { details: 'Analytics', state: 'Browsing stats' },
    '/tools': { details: 'Tools', state: 'Using tools' },
    '/profile': { details: 'Profile', state: 'Viewing profile' },
    '/admin/users': { details: 'Admin', state: 'Managing users' },
    '/settings': { details: 'Settings', state: 'Configuring' },
  };

  if (pageMap[path]) {
    return { ...base, details: h1Text || pageMap[path].details, state: pageMap[path].state };
  }

  return { ...base, details: h1Text || 'Raccoon Open', state: 'Browsing Raccoon Open' };
}

harvest(SITE, {}, getPageInfo);
