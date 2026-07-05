const SITE = 'gametora';

function getPageInfo() {
  const path = window.location.pathname;
  const h1 = document.querySelector('h1');
  const h1Text = h1 ? h1.textContent.trim() : '';

  if (path === '/umamusume' || path === '/umamusume/') {
    return {
      details: 'GameTora \u00b7 Uma Musume',
      state: 'Browsing GameTora',
      largeImageKey: 'digitan',
      largeImageText: 'gametora.com/umamusume \u00b7 Digitan\'s Journal',
      smallImageKey: 'gametora_small',
      smallImageText: 'GameTora',
      raw: { title: 'GameTora \u00b7 Uma Musume', page: null, totalPages: null },
    };
  }

  const remaining = path.replace(/^\/umamusume\/?/, '');
  const segments = remaining.split('/').filter(Boolean);

  if (segments.length >= 2) {
    const category = segments[0];
    const item = segments.slice(1).join('/');
    const label = h1Text || item;

    let state = `Viewing ${category}`;
    if (category === 'characters' && item !== 'profiles') state = 'Viewing character';
    else if (category === 'supports') state = 'Viewing support card';
    else if (category === 'events') state = 'Viewing event';
    else if (category === 'guides') state = 'Reading guide';

    return {
      details: label,
      state,
      largeImageKey: 'digitan',
      largeImageText: 'gametora.com/umamusume \u00b7 Digitan\'s Journal',
      smallImageKey: 'gametora_small',
      smallImageText: 'GameTora',
      raw: { title: label, page: null, totalPages: null },
    };
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

  const label = pageLabels[page];
  if (label) {
    return {
      details: h1Text || label,
      state: 'Browsing GameTora',
      largeImageKey: 'digitan',
      largeImageText: 'gametora.com/umamusume \u00b7 Digitan\'s Journal',
      smallImageKey: 'gametora_small',
      smallImageText: 'GameTora',
      raw: { title: h1Text || label, page: null, totalPages: null },
    };
  }

  return {
    details: h1Text || 'GameTora Uma Musume',
    state: 'Browsing GameTora',
    largeImageKey: 'digitan',
    largeImageText: 'gametora.com/umamusume \u00b7 Digitan\'s Journal',
    smallImageKey: 'gametora_small',
    smallImageText: 'GameTora',
    raw: { title: h1Text || 'GameTora Uma Musume', page: null, totalPages: null },
  };
}

harvest(SITE, {}, getPageInfo);
