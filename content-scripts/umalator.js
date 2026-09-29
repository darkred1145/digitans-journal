const SITE = 'umalator';

const BASE = {
  largeImageKey: 'digitan',
  largeImageText: 'umalator.app · Digitan\'s Journal',
  smallImageKey: 'umalator_small',
  smallImageText: 'Moomoolator',
};

function getPageInfo() {
  const title = document.title.replace(/\s*-\s*Moomoolator.*$/, '').trim() || 'Moomoolator';

  return {
    ...BASE,
    details: title,
    state: 'Using race simulator',
    raw: { title, page: null, totalPages: null },
  };
}

harvest(SITE, {}, getPageInfo);
