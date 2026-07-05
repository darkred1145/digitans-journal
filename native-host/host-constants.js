const path = require('path');
const fs = require('fs');

const HOST_NAME = 'com.digitansjournal.rpc';
const MANIFEST_FILE = HOST_NAME + '.json';
const MANIFEST_FILE_FIREFOX = HOST_NAME + '-firefox.json';

function getHostDir() {
  return process.pkg ? path.dirname(process.execPath) : __dirname;
}

function getHostPath() {
  const hostDir = getHostDir();
  const hostExe = path.join(hostDir, 'host.exe');
  const isPkg = !!process.pkg;
  return isPkg ? hostExe : (fs.existsSync(hostExe) ? hostExe : path.join(hostDir, 'host.bat'));
}

function getChromeManifest(extId) {
  return {
    name: HOST_NAME,
    description: "Digitan's Journal Discord RPC bridge",
    path: getHostPath(),
    type: 'stdio',
    allowed_origins: [`chrome-extension://${extId}/`],
  };
}

function getFirefoxManifest(extId) {
  return {
    name: HOST_NAME,
    description: "Digitan's Journal Discord RPC bridge",
    path: getHostPath(),
    type: 'stdio',
    allowed_extensions: [extId],
  };
}

module.exports = { HOST_NAME, MANIFEST_FILE, MANIFEST_FILE_FIREFOX, getHostDir, getChromeManifest, getFirefoxManifest };
