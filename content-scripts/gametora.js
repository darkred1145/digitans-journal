const SITE = 'gametora';
let lastUpdate = 0;

function sendPresence(data) {
  const now = Date.now();
  if (now - lastUpdate < 2000) return;
  lastUpdate = now;
  chrome.runtime.sendMessage({ type: 'presence', site: SITE, data });
}

function getPageInfo() {
  const path = window.location.pathname;
  const h1 = document.querySelector('h1');
  const h1Text = h1 ? h1.textContent.trim() : '';

  if (path === '/umamusume' || path === '/umamusume/') {
    return {
      details: 'GameTora · Uma Musume',
      state: 'Browsing GameTora',
      largeImageKey: 'digitan',
      largeImageText: 'gametora.com/umamusume · Agnes Digital',
      smallImageKey: 'gametora_small',
      smallImageText: 'GameTora',
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
      largeImageText: 'gametora.com/umamusume · Agnes Digital',
      smallImageKey: 'gametora_small',
      smallImageText: 'GameTora',
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
      largeImageText: 'gametora.com/umamusume · Agnes Digital',
      smallImageKey: 'gametora_small',
      smallImageText: 'GameTora',
    };
  }

  return {
    details: h1Text || 'GameTora Uma Musume',
    state: 'Browsing GameTora',
    largeImageKey: 'digitan',
    largeImageText: 'gametora.com/umamusume · Agnes Digital',
    smallImageKey: 'gametora_small',
    smallImageText: 'GameTora',
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
