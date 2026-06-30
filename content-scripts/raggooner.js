const SITE = 'raggooner';

function getText() {
  return document.body.innerText;
}

function extractBetween(text, before, after) {
  const start = text.indexOf(before);
  if (start === -1) return null;
  const from = start + before.length;
  const end = after ? text.indexOf(after, from) : text.length;
  if (after && end === -1) return null;
  return text.slice(from, end).trim();
}

function getTitleFromLines(lines) {
  const skip = new Set(['RACCOON OPEN', 'Viewer', 'PARTY', 'Queued Player', 'HOW IT WORKS', 'Source', 'API']);
  for (const l of lines) {
    if (!skip.has(l) && l.length > 1 && !l.startsWith('Created with')) return l;
  }
  return null;
}

function parseQueueInfo(text, lines) {
  const countMatch = text.match(/Queue Status\s*\n\s*(\d+)\s*\/\s*(\d+)/);
  const timerMatch = text.match(/Queue expires in\s*\n\s*([\d:.]+)/);
  const title = getTitleFromLines(lines);
  const formatMatch = text.match(/(\d+v\d+[^]*?·[^]*?Races)/);
  const format = formatMatch ? formatMatch[1].trim() : null;

  return {
    title,
    format,
    queued: countMatch ? `${countMatch[1]}/${countMatch[2]}` : null,
    queuedCount: countMatch ? parseInt(countMatch[1], 10) : null,
    queuedTotal: countMatch ? parseInt(countMatch[2], 10) : null,
    queueTimer: timerMatch ? timerMatch[1] : null,
  };
}

function getPageInfo() {
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  const text = getText();
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  const base = {
    largeImageKey: 'digitan',
    largeImageText: 'raggooneropen.web.app \u00b7 Digitan\'s Journal',
    smallImageKey: 'raggooner_small',
    smallImageText: 'Raccoon Open',
  };

  if (path === '/') {
    return { ...base, details: 'Raccoon Open', state: 'Browsing tournaments', raw: { title: 'Raccoon Open' } };
  }

  if (/^\/t\//.test(path)) {
    const inQueue = text.includes('Queue Status') && text.includes('Queue expires in');
    const inDraft = text.includes('Ban') || text.includes('Draft') || text.includes('Pick');
    const inResults = text.includes('Results') || text.includes('Winner');
    const inRace = text.includes('Race ') && !inDraft && !inResults;

    if (inQueue) {
      const info = parseQueueInfo(text, lines);
      const timerPart = info.queueTimer ? ` \u00b7 ${info.queueTimer}` : '';
      const state = info.queued ? `In Queue (${info.queued})${timerPart}` : 'In Queue';
      return {
        ...base,
        details: info.title || 'Tournament',
        state: state.slice(0, 128),
        buttons: [{ label: 'View Tournament', url: window.location.href }],
        raw: { title: info.title, phase: 'queue', format: info.format, queued: info.queued, timer: info.queueTimer },
      };
    }

    if (inDraft) {
      return {
        ...base,
        details: getTitleFromLines(lines) || 'Tournament',
        state: 'Draft Phase',
        buttons: [{ label: 'View Tournament', url: window.location.href }],
        raw: { title: getTitleFromLines(lines), phase: 'draft' },
      };
    }

    if (inRace) {
      return {
        ...base,
        details: getTitleFromLines(lines) || 'Tournament',
        state: 'Racing',
        buttons: [{ label: 'View Tournament', url: window.location.href }],
        raw: { title: getTitleFromLines(lines), phase: 'racing' },
      };
    }

    if (inResults) {
      return {
        ...base,
        details: getTitleFromLines(lines) || 'Tournament',
        state: 'Results',
        buttons: [{ label: 'View Results', url: window.location.href }],
        raw: { title: getTitleFromLines(lines), phase: 'results' },
      };
    }

    const title = getTitleFromLines(lines) || 'Tournament';
    return { ...base, details: title, state: 'Viewing tournament', raw: { title, phase: 'idle' } };
  }

  // Known static pages mapped by path
  const pageMap = {
    '/analytics': { details: 'Analytics', state: 'Browsing stats' },
    '/tools': { details: 'Tools', state: 'Using tools' },
    '/profile': { details: 'Profile', state: 'Viewing profile' },
    '/admin/users': { details: 'Admin', state: 'Managing users' },
    '/settings': { details: 'Settings', state: 'Configuring' },
  };

  if (pageMap[path]) {
    return { ...base, details: pageMap[path].details, state: pageMap[path].state, raw: { title: pageMap[path].details } };
  }

  return { ...base, details: 'Raccoon Open', state: 'Browsing', raw: { title: 'Raccoon Open' } };
}

harvest(SITE, {}, getPageInfo);
