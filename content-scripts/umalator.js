const SITE = 'umalator';

function getPageInfo() {
  const title = document.title.replace(/\s*-\s*Moomoolator.*$/, '').trim();

  return {
    details: title || 'Moomoolator',
    state: 'Using race simulator',
    largeImageKey: 'digitan',
    largeImageText: 'umalator.app \u00b7 Digitan\'s Journal',
    smallImageKey: 'umalator_small',
    smallImageText: 'Moomoolator',
    raw: { title: title || 'Moomoolator', page: null, totalPages: null },
  };
}

harvest(SITE, {}, getPageInfo);
