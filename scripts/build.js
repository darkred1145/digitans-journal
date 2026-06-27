const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');

const TARGET = process.argv.includes('--target')
  ? process.argv[process.argv.indexOf('--target') + 1]
  : 'chrome';

const isFirefox = TARGET === 'firefox';

if (!fs.existsSync(DIST)) {
  fs.mkdirSync(DIST, { recursive: true });
}

const MANIFEST_SRC = isFirefox ? 'manifest.firefox.json' : 'manifest.json';
fs.copyFileSync(path.join(ROOT, MANIFEST_SRC), path.join(DIST, 'manifest.json'));
console.log(`-> dist/manifest.json (from ${MANIFEST_SRC})`);

// Copy the polyfill
const polyfillSrc = path.join(ROOT, 'node_modules/webextension-polyfill/dist/browser-polyfill.min.js');
const polyfill = fs.readFileSync(polyfillSrc, 'utf-8');
fs.writeFileSync(path.join(DIST, 'browser-polyfill.js'), polyfill);
console.log('-> dist/browser-polyfill.js');

function read(name) {
  return fs.readFileSync(path.join(ROOT, name), 'utf-8') + '\n';
}

function readPolyfill() {
  return polyfill + '\n';
}

// Content script shared bundle
const contentShared = [
  'shared/truncate.js',
  'shared/presence-contract.js',
  'content-scripts/harvester.js',
];
const contentSharedCode = contentShared.map(read).join('\n');
const contentSharedBundled = readPolyfill() + contentSharedCode;
fs.writeFileSync(path.join(DIST, 'content-shared.js'), contentSharedBundled);
console.log('-> dist/content-shared.js');

// Per-site content bundles: polyfill + shared + site-specific extractor
const sites = ['nhentai', 'gametora', 'raggooner', 'uma-guide', 'umalator'];
for (const site of sites) {
  const code = readPolyfill() + contentSharedCode + read(`content-scripts/${site}.js`);
  fs.writeFileSync(path.join(DIST, `content-${site}.js`), code);
  console.log(`-> dist/content-${site}.js`);
}

// Background bundle: polyfill + dependencies
const backgroundDeps = [
  'shared/truncate.js',
  'shared/presence-contract.js',
  'shared/presence-formatter.js',
  'shared/settings.js',
  'shared/rpc-protocol.js',
  'rpc-manager.js',
  'state-manager.js',
];
let backgroundCode = readPolyfill() + backgroundDeps.map(read).join('\n');
const bgRaw = read('background.js');
backgroundCode += bgRaw.replace(/^importScripts\(.*?\);\n?/m, '');
fs.writeFileSync(path.join(DIST, 'background.js'), backgroundCode);
console.log('-> dist/background.js');

console.log(`\nBuild complete (target: ${TARGET}).`);
