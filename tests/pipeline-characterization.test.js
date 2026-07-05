global.truncate = require('../shared/truncate.js').truncate;
const { formatPresence } = require('../shared/presence-formatter.js');

let passed = 0;
let failed = 0;

function assert(cond, label) {
  if (cond) { passed++; }
  else { failed++; console.error('FAIL:', label); }
}

function deepEqual(a, b) {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (typeof a !== 'object' || a === null || b === null) return false;
  const ka = Object.keys(a).sort();
  const kb = Object.keys(b).sort();
  if (ka.length !== kb.length) return false;
  for (let i = 0; i < ka.length; i++) {
    if (ka[i] !== kb[i]) return false;
    if (!deepEqual(a[ka[i]], b[ka[i]])) return false;
  }
  return true;
}

const defaults = { enabled: true, sites: {}, idleTimeout: 0, privacyMode: false, templates: {} };

function hostBuildPayload(presence) {
  const payload = {
    details: truncate(presence.details) || 'Digitan\'s Journal',
    startTimestamp: presence.startTimestamp || Date.now(),
    largeImageKey: presence.largeImageKey || 'digitan',
    largeImageText: presence.largeImageText || 'Digitan\'s Journal',
  };
  if (presence.state) payload.state = truncate(presence.state);
  if (presence.smallImageKey) payload.smallImageKey = presence.smallImageKey;
  if (presence.smallImageText) payload.smallImageText = presence.smallImageText;
  if (presence.buttons) payload.buttons = presence.buttons;
  return payload;
}

function extBuildPayload(site, data, settings) {
  const fmt = formatPresence(site, data, settings);
  fmt.details = fmt.details || 'Digitan\'s Journal';
  fmt.largeImageKey = fmt.largeImageKey || 'digitan';
  fmt.largeImageText = fmt.largeImageText || 'Digitan\'s Journal';
  if (!fmt.startTimestamp) fmt.startTimestamp = Date.now();
  if (!fmt.state) delete fmt.state;
  return fmt;
}

// Normal presence (use fixed timestamp to avoid Date.now() race)
{
  const ts = 1712345678000;
  const input = { details: 'Viewing Tokai Teio', state: 'Character detail', startTimestamp: ts };
  const host = hostBuildPayload(input);
  const ext = extBuildPayload('uma-guide', input, defaults);
  assert(deepEqual(host, ext), 'normal presence');
  assert(ext.details === 'Viewing Tokai Teio', 'details pass through');
}

// Missing details
{
  const ts = 1712345678000;
  const input = { startTimestamp: ts };
  const host = hostBuildPayload(input);
  const ext = extBuildPayload('uma-guide', input, defaults);
  assert(deepEqual(host, ext), 'missing details falls back');
  assert(ext.details === 'Digitan\'s Journal', 'details fallback');
}

// Missing largeImageKey
{
  const ts = 1712345678000;
  const input = { details: 'Test', startTimestamp: ts };
  const host = hostBuildPayload(input);
  const ext = extBuildPayload('uma-guide', input, defaults);
  assert(deepEqual(host, ext), 'missing largeImageKey falls back');
  assert(ext.largeImageKey === 'digitan', 'largeImageKey fallback');
}

// All optional fields
{
  const ts = 1712345678000;
  const input = {
    details: 'Title',
    state: 'Chapter 5',
    startTimestamp: ts,
    smallImageKey: 'small-key',
    smallImageText: 'Small text',
    buttons: [{ label: 'View', url: 'https://example.com' }],
  };
  const host = hostBuildPayload(input);
  const ext = extBuildPayload('uma-guide', input, defaults);
  assert(deepEqual(host, ext), 'all optional fields');
  assert(ext.buttons.length === 1, 'buttons pass through');
}

// Null state
{
  const ts = 1712345678000;
  const input = { details: 'Test', startTimestamp: ts };
  const host = hostBuildPayload(input);
  const ext = extBuildPayload('uma-guide', input, defaults);
  assert(deepEqual(host, ext), 'null state omitted');
  assert(ext.state === undefined, 'no state key');
}

// Empty string state (should be omitted, matching host)
{
  const ts = 1712345678000;
  const input = { details: 'Test', state: '', startTimestamp: ts };
  const host = hostBuildPayload(input);
  const ext = extBuildPayload('uma-guide', input, defaults);
  assert(deepEqual(host, ext), 'empty state omitted');
}

// Truncated details
{
  const ts = 1712345678000;
  const input = { details: 'A'.repeat(200), startTimestamp: ts };
  const host = hostBuildPayload(input);
  const ext = extBuildPayload('uma-guide', input, defaults);
  assert(deepEqual(host, ext), 'truncated details');
  assert(ext.details.length <= 128, 'within limit');
  assert(ext.details.endsWith('\u2026'), 'ellipsis');
}

// Truncated state
{
  const ts = 1712345678000;
  const input = { details: 'Test', state: 'B'.repeat(200), startTimestamp: ts };
  const host = hostBuildPayload(input);
  const ext = extBuildPayload('uma-guide', input, defaults);
  assert(deepEqual(host, ext), 'truncated state');
}

// Privacy mode
{
  const input = { details: 'Viewing Tokai Teio', state: 'Secret', largeImageKey: 'umaguide' };
  const host = hostBuildPayload(input);
  const ext = extBuildPayload('uma-guide', input, { ...defaults, privacyMode: true });
  assert(ext.details !== input.details, 'privacy mode changes details');
}

// Template rendering
{
  const input = { details: 'ignored', state: 'ignored', raw: { title: 'Tokai Teio', page: '3', totalPages: '10' } };
  const tmpl = { 'uma-guide': { details: '{title}', state: 'Page {page} of {total}' } };
  const ext = extBuildPayload('uma-guide', input, { ...defaults, templates: tmpl });
  assert(ext.details === 'Tokai Teio', 'template details');
  assert(ext.state === 'Page 3 of 10', 'template state');
}

// With startTimestamp preserved
{
  const ts = 1712345678000;
  const input = { details: 'Test', startTimestamp: ts };
  const host = hostBuildPayload(input);
  const ext = extBuildPayload('uma-guide', input, defaults);
  assert(ext.startTimestamp === ts, 'startTimestamp preserved');
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
