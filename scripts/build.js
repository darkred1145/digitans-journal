const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');

if (!fs.existsSync(DIST)) {
  fs.mkdirSync(DIST, { recursive: true });
}

function read(name) {
  return fs.readFileSync(path.join(ROOT, name), 'utf-8') + '\n';
}

// Content script shared bundle: shared dependencies for all site extractors
const contentShared = [
  'shared/truncate.js',
  'shared/presence-contract.js',
  'content-scripts/harvester.js',
];
const contentSharedCode = contentShared.map(read).join('\n');
fs.writeFileSync(path.join(DIST, 'content-shared.js'), contentSharedCode);
console.log('-> dist/content-shared.js');

// Per-site content bundles: shared + site-specific extractor
const sites = ['nhentai', 'gametora', 'raggooner', 'uma-guide', 'umalator'];
for (const site of sites) {
  const code = contentSharedCode + read(`content-scripts/${site}.js`);
  fs.writeFileSync(path.join(DIST, `content-${site}.js`), code);
  console.log(`-> dist/content-${site}.js`);
}

// Background bundle: all dependencies for the service worker
const backgroundDeps = [
  'shared/truncate.js',
  'shared/presence-contract.js',
  'shared/presence-formatter.js',
  'shared/settings.js',
  'shared/rpc-protocol.js',
  'rpc-manager.js',
  'state-manager.js',
];
let backgroundCode = backgroundDeps.map(read).join('\n');
const bgRaw = read('background.js');
// Strip the importScripts line in the bundled version (all deps are inlined)
backgroundCode += bgRaw.replace(/^importScripts\(.*?\);\n?/m, '');
fs.writeFileSync(path.join(DIST, 'background.js'), backgroundCode);
console.log('-> dist/background.js');

console.log('\nBuild complete.');
