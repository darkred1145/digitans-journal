// presence-formatter.js uses truncate as a global (browser/importScripts pattern)
global.truncate = require('../shared/truncate.js').truncate;
const { formatPresence } = require('../shared/presence-formatter.js');

let passed = 0;
let failed = 0;

function assert(cond, label) {
  if (cond) { passed++; }
  else { failed++; console.error('FAIL:', label); }
}

// Default settings (no privacy, no templates)
const defaults = { enabled: true, sites: {}, idleTimeout: 0, privacyMode: false, templates: {} };

// Basic formatting
const result = formatPresence('uma-guide', {
  details: 'Viewing Tokai Teio',
  state: 'Character detail',
  largeImageKey: 'umaguide',
  smallImageKey: 'digitan',
  raw: { title: 'Tokai Teio' },
}, defaults);
assert(result.details === 'Viewing Tokai Teio', 'details pass through');
assert(result.state === 'Character detail', 'state pass through');
assert(result.largeImageKey === 'umaguide', 'largeImageKey pass through');

// Privacy mode
const privacyResult = formatPresence('uma-guide', {
  details: 'Viewing Tokai Teio',
  state: 'Character detail',
}, { ...defaults, privacyMode: true });
assert(privacyResult.details === 'Browsing uma-guide', 'privacy mode hides details');
assert(privacyResult.state === undefined, 'privacy mode clears state');

// Template rendering
const templateResult = formatPresence('uma-guide', {
  details: 'ignored',
  state: 'ignored',
  raw: { title: 'Tokai Teio', page: '3', totalPages: '10' },
}, {
  ...defaults,
  templates: { 'uma-guide': { details: 'Viewing {title}', state: 'Page {page} of {total}' } },
});
assert(templateResult.details === 'Viewing Tokai Teio', 'template replaces {title}');
assert(templateResult.state === 'Page 3 of 10', 'template replaces {page} and {total}');

// Null state
const nullState = formatPresence('uma-guide', { details: 'test' }, defaults);
assert(nullState.state === undefined, 'null state is omitted');

// Missing raw fields in template
const missingRaw = formatPresence('uma-guide', {
  details: 'ignored',
  raw: {},
}, {
  ...defaults,
  templates: { 'uma-guide': { details: '{title} - {site}' } },
});
assert(missingRaw.details === ' - uma-guide', 'missing raw fields produce empty string');

// Truncation
const longTitle = 'A'.repeat(200);
const truncResult = formatPresence('uma-guide', { details: longTitle }, defaults);
assert(truncResult.details.length <= 128, 'truncation keeps within limit');
assert(truncResult.details.endsWith('\u2026'), 'truncation adds ellipsis');

// New placeholders: type, rarity, subtitle
const metaResult = formatPresence('uma-guide', {
  details: 'ignored',
  raw: { title: 'Agnes Digital', type: 'Character', rarity: '\u2605\u2605\u2605', subtitle: 'Super versatile otaku' },
}, {
  ...defaults,
  templates: { 'uma-guide': { details: '{title} ({type})', state: '{rarity} \u00b7 {subtitle}' } },
});
assert(metaResult.details === 'Agnes Digital (Character)', 'template replaces {type}');
assert(metaResult.state.indexOf('\u2605\u2605\u2605') !== -1, 'template replaces {rarity}');
assert(metaResult.state.indexOf('Super versatile otaku') !== -1, 'template replaces {subtitle}');

// Missing meta fields produce empty string
const missingMeta = formatPresence('uma-guide', {
  details: 'ignored',
  raw: { title: 'Test' },
}, {
  ...defaults,
  templates: { 'uma-guide': { details: '{rarity} {type}', state: '{subtitle}' } },
});
assert(missingMeta.details === ' ', 'missing type/rarity produce empty string');

// No templates = raw data pass through
const noTemplate = formatPresence('uma-guide', { details: 'Hello', state: 'World' }, defaults);
assert(noTemplate.details === 'Hello', 'no template uses raw details');
assert(noTemplate.state === 'World', 'no template uses raw state');

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
