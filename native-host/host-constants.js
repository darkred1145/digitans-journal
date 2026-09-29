const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const HOST_NAME = 'com.digitansjournal.rpc';
const MANIFEST_FILE = HOST_NAME + '.json';
const MANIFEST_FILE_FIREFOX = HOST_NAME + '-firefox.json';

// manifest.json pins a "key", so the extension ID is the same whichever folder
// the extension was loaded from. Deriving it here lets `cli.js --install` skip
// reading browser prefs entirely, so the two can never disagree.
function idFromKey(key) {
  const der = Buffer.from(key, 'base64');
  const hash = crypto.createHash('sha256').update(der).digest('hex').slice(0, 32);
  return [...hash].map(c => String.fromCharCode(97 + parseInt(c, 16))).join('');
}

const CHROME_EXTENSION_ID = idFromKey(require('../manifest.json').key);
const GECKO_EXTENSION_ID = require('../manifest.firefox.json').applications.gecko.id;

function getHostDir() {
  return process.pkg ? path.dirname(process.execPath) : __dirname;
}

function getHostPath() {
  const hostDir = getHostDir();
  const hostExe = path.join(hostDir, 'host.exe');
  const isPkg = !!process.pkg;
  return isPkg ? hostExe : (fs.existsSync(hostExe) ? hostExe : path.join(hostDir, 'host.bat'));
}

function getChromeManifest() {
  return {
    name: HOST_NAME,
    description: "Digitan's Journal Discord RPC bridge",
    path: getHostPath(),
    type: 'stdio',
    allowed_origins: [`chrome-extension://${CHROME_EXTENSION_ID}/`],
  };
}

function getFirefoxManifest() {
  return {
    name: HOST_NAME,
    description: "Digitan's Journal Discord RPC bridge",
    path: getHostPath(),
    type: 'stdio',
    allowed_extensions: [GECKO_EXTENSION_ID],
  };
}

module.exports = {
  HOST_NAME, MANIFEST_FILE, MANIFEST_FILE_FIREFOX,
  CHROME_EXTENSION_ID, GECKO_EXTENSION_ID,
  getHostDir, getChromeManifest, getFirefoxManifest,
};
