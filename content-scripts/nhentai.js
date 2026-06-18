const SITE = 'nhentai';
let lastUpdate = 0;
let galleryCache = {};

function sendPresence(data) {
  const now = Date.now();
  if (now - lastUpdate < 2000) return;
  lastUpdate = now;
  chrome.runtime.sendMessage({ type: 'presence', site: SITE, data });
}

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
      galleryCache[id] = { title, totalPages };
    } else {
      const cached = galleryCache[id];
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
      state: `Page ${currentPage} / ${totalPages}`,
      largeImageKey: 'digitan',
      largeImageText: 'nhentai.net · Digitan\'s Journal',
      smallImageKey: 'nhentai_small',
      smallImageText: 'nhentai.net',
      buttons: [{ label: 'View Gallery', url: `https://nhentai.net/g/${id}/` }],
    };
  }

  if (path.startsWith('/search/')) {
    const params = new URLSearchParams(window.location.search);
    return {
      details: 'Searching',
      state: params.get('q') || 'nhentai',
      largeImageKey: 'digitan',
      largeImageText: 'nhentai.net · Digitan\'s Journal',
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
      largeImageText: 'nhentai.net · Digitan\'s Journal',
      smallImageKey: 'nhentai_small',
      smallImageText: 'nhentai.net',
    };
  }

  return {
    details: 'Browsing nhentai',
    largeImageKey: 'digitan',
    largeImageText: 'nhentai.net · Digitan\'s Journal',
    smallImageKey: 'nhentai_small',
    smallImageText: 'nhentai.net',
  };
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
