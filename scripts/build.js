const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');

const TARGET = process.argv.includes('--target')
  ? process.argv[process.argv.indexOf('--target') + 1]
  : 'chrome';

const isFirefox = TARGET === 'firefox';
const doPackage = isFirefox || process.argv.includes('--package');

const SITES = JSON.parse(fs.readFileSync(path.join(ROOT, 'sites.json'), 'utf-8'));

if (!fs.existsSync(DIST)) {
  fs.mkdirSync(DIST, { recursive: true });
}

// Build manifest with content_scripts generated from sites.json
const MANIFEST_SRC = isFirefox ? 'manifest.firefox.json' : 'manifest.json';
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, MANIFEST_SRC), 'utf-8'));
const jsFile = (id) => isFirefox ? ['browser-polyfill.js', `content-${id}.js`] : [`content-${id}.js`];
const matches = SITES.map(s => s.match);
manifest.content_scripts = SITES.map(s => ({
  matches: [s.match],
  js: jsFile(s.id),
  run_at: 'document_idle',
}));
if (isFirefox) {
  const existing = manifest.permissions.filter(p => !p.startsWith('https://'));
  manifest.permissions = [...existing, ...matches];
} else {
  manifest.host_permissions = matches;
}
fs.writeFileSync(path.join(DIST, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(`-> dist/manifest.json (from ${MANIFEST_SRC} + sites.json)`);

// Copy the polyfill
const polyfillSrc = path.join(ROOT, 'node_modules/webextension-polyfill/dist/browser-polyfill.min.js');
const polyfill = fs.readFileSync(polyfillSrc, 'utf-8');
fs.writeFileSync(path.join(DIST, 'browser-polyfill.js'), polyfill);
console.log('-> dist/browser-polyfill.js');

// For Firefox builds, copy HTML pages, shared files, and icons into dist/
// so the manifest (at dist/) resolves all paths correctly.
if (isFirefox) {
  copyDir('popup', 'popup');
  copyDir('options', 'options');
  copyDir('shared', 'shared');
  copyDir('icons', 'icons');
  fs.copyFileSync(path.join(ROOT, 'sites.json'), path.join(DIST, 'sites.json'));
}

function copyDir(src, dest) {
  const srcDir = path.join(ROOT, src);
  if (!fs.existsSync(srcDir)) return;
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  for (const e of entries) {
    if (e.isDirectory()) copyDir(path.join(src, e.name), path.join(dest, e.name));
    else {
      const out = path.join(DIST, dest, e.name);
      fs.mkdirSync(path.dirname(out), { recursive: true });
      fs.copyFileSync(path.join(srcDir, e.name), out);
    }
  }
}

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
for (const site of SITES) {
  const code = readPolyfill() + contentSharedCode + read(`content-scripts/${site.id}.js`);
  fs.writeFileSync(path.join(DIST, `content-${site.id}.js`), code);
  console.log(`-> dist/content-${site.id}.js`);
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

// Generate settings.js with DEFAULTS.sites derived from sites.json
const sitesDefaults = Object.fromEntries(SITES.map(s => [s.id, s.defaultEnabled]));
const generatedSettings = `const DEFAULTS = {\n  enabled: true,\n  sites: ${JSON.stringify(sitesDefaults, null, 2).replace(/\n/g, '\n  ')},\n  idleTimeout: 0,\n  privacyMode: false,\n  templates: {},\n};\n`;
const settingsOut = isFirefox ? path.join(DIST, 'shared', 'settings.js') : path.join(DIST, 'settings.js');
fs.writeFileSync(settingsOut, generatedSettings);
console.log(`-> ${path.relative(ROOT, settingsOut)} (generated from sites.json)`);

if (doPackage) {
  const AdmZip = require('adm-zip');
  const zip = new AdmZip();
  const version = require(path.join(ROOT, MANIFEST_SRC)).version;
  const pkgName = `digitans-journal-${TARGET}-v${version}.xpi`;

  function addAll(dir, zipDir) {
    const abs = path.join(DIST, dir);
    if (!fs.existsSync(abs)) return;
    for (const e of fs.readdirSync(abs, { withFileTypes: true })) {
      const rel = path.join(dir, e.name);
      if (e.isDirectory()) addAll(rel, zipDir);
      else zip.addLocalFile(path.join(DIST, rel), zipDir || '');
    }
  }

  // Add manifest at root
  zip.addLocalFile(path.join(DIST, 'manifest.json'), '');

  // Add everything else from dist/ maintaining relative paths
  for (const dir of ['browser-polyfill.js', 'background.js', 'content-shared.js', ...SITES.map(s => `content-${s.id}.js`)]) {
    if (fs.existsSync(path.join(DIST, dir))) zip.addLocalFile(path.join(DIST, dir), '');
  }
  for (const dir of ['popup', 'options', 'shared', 'icons']) {
    addAll(dir, dir);
  }

  zip.writeZip(path.join(ROOT, pkgName));
  console.log(`-> ${pkgName}`);
}

console.log(`\nBuild complete (target: ${TARGET}).`);
