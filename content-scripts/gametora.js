const SITE = 'gametora';

const BASE = {
  largeImageKey: 'digitan',
  largeImageText: 'gametora.com/umamusume · Digitan\'s Journal',
  smallImageKey: 'gametora_small',
  smallImageText: 'GameTora',
};

const CATEGORY_STATES = {
  supports: 'Viewing support card',
  events: 'Viewing event',
  guides: 'Reading guide',
};

function presence(details, state) {
  return { ...BASE, details, state, raw: { title: details, page: null, totalPages: null } };
}

function getPageInfo() {
  const path = window.location.pathname;
  const h1 = document.querySelector('h1');
  const h1Text = h1 ? h1.textContent.trim() : '';

  if (path === '/umamusume' || path === '/umamusume/') {
    return presence('GameTora · Uma Musume', 'Browsing GameTora');
  }

  const remaining = path.replace(/^\/umamusume\/?/, '');
  const segments = remaining.split('/').filter(Boolean);

  if (segments.length >= 2) {
    const category = segments[0];
    const item = segments.slice(1).join('/');
    const state = category === 'characters' && item !== 'profiles'
      ? 'Viewing character'
      : CATEGORY_STATES[category] || `Viewing ${category}`;
    return presence(h1Text || item, state);
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

  return presence(h1Text || pageLabels[page] || 'GameTora Uma Musume', 'Browsing GameTora');
}

harvest(SITE, {}, getPageInfo);
