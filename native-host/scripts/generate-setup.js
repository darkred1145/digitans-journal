const fs = require('fs');
const path = require('path');

const { HOST_NAME, getHostDir, getRegistryPaths } = require('../host-constants');

const hostDir = path.resolve(__dirname, '..');
const manifestPath = path.join(hostDir, HOST_NAME + '.json');
const hostExe = path.join(hostDir, 'host.exe');
const hostPath = fs.existsSync(hostExe) ? hostExe : path.join(hostDir, 'host.bat');

const manifest = {
  name: HOST_NAME,
  description: "Digitan's Journal Discord RPC bridge",
  path: hostPath,
  type: 'stdio',
  allowed_origins: ['chrome-extension://REPLACE_WITH_EXTENSION_ID/'],
};

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');

console.error('Setup manifest generated: ' + HOST_NAME + '.json');
console.error('Run `node cli.js --install` to auto-detect your extension ID and register the host.');
