const SITE = 'raggooner';
function truncate(s, n = 128) { return s && s.length > n ? s.slice(0, n - 1) + '…' : s; }
let lastUpdate = 0;

function sendPresence(data) {
  const now = Date.now();
  if (now - lastUpdate < 2000) return;
  lastUpdate = now;
  chrome.runtime.sendMessage({ type: 'presence', site: SITE, data });
}

function getPageInfo() {
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  const h1 = document.querySelector('h1');
  const h1Text = h1 ? h1.textContent.trim() : '';

  const base = {
    largeImageKey: 'digitan',
    largeImageText: 'raggooneropen.web.app · Digitan\'s Journal',
    smallImageKey: 'raggooner_small',
    smallImageText: 'Raccoon Open',
  };

  if (path === '/') {
    return { ...base, details: 'Raccoon Open', state: 'Browsing tournaments' };
  }

  const tourneyMatch = path.match(/^\/t\/(.+)/);
  if (tourneyMatch) {
    return { ...base, details: truncate(h1Text || 'Tournament'), state: 'Viewing tournament' };
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

function update() {
  try {
    const presence = getPageInfo();
    sendPresence(presence);
  } catch (_) {
  }
}

setTimeout(update, 1000);
setInterval(update, 5000);

let lastUrl = location.href;
new MutationObserver(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    setTimeout(update, 1000);
  }
}).observe(document, { subtree: true, childList: true });
