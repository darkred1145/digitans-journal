const path = require('path');
const fs = require('fs');

const HOST_NAME = 'com.digitansjournal.rpc';
const MANIFEST_FILE = HOST_NAME + '.json';

function getHostDir() {
  return process.pkg ? path.dirname(process.execPath) : __dirname;
}

function getRegistryPaths() {
  const hostDir = getHostDir();
  const manifestPath = path.join(hostDir, MANIFEST_FILE);
  const hostExe = path.join(hostDir, 'host.exe');
  const isPkg = !!process.pkg;
  const hostPath = isPkg ? hostExe : (fs.existsSync(hostExe) ? hostExe : path.join(hostDir, 'host.bat'));
  return {
    hostDir,
    manifestPath,
    manifest: {
      name: HOST_NAME,
      description: "Digitan's Journal Discord RPC bridge",
      path: hostPath,
      type: 'stdio',
      allowed_origins: [],
    },
  };
}

module.exports = { HOST_NAME, MANIFEST_FILE, getHostDir, getRegistryPaths };
