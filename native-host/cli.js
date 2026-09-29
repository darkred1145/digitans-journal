const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const {
  HOST_NAME, MANIFEST_FILE, MANIFEST_FILE_FIREFOX,
  CHROME_EXTENSION_ID, GECKO_EXTENSION_ID,
  getHostDir, getChromeManifest, getFirefoxManifest,
} = require('./host-constants');

const BROWSERS = [
  { name: 'Chrome', key: 'Google/Chrome' },
  { name: 'Edge', key: 'Microsoft/Edge' },
  { name: 'Brave', key: 'BraveSoftware/Brave' },
  { name: 'Chromium', key: 'Chromium' },
];

function reg(args) {
  try {
    execSync(`reg ${args}`, { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

function installHost() {
  const hostDir = getHostDir();
  const wantFirefox = process.argv[process.argv.indexOf('--browser') + 1] === 'firefox';

  if (wantFirefox) {
    const manifestPath = path.join(hostDir, MANIFEST_FILE_FIREFOX);
    fs.writeFileSync(manifestPath, JSON.stringify(getFirefoxManifest(), null, 2) + '\n');
    const ok = reg(`add "HKCU\\Software\\Mozilla\\NativeMessagingHosts\\${HOST_NAME}" /ve /t REG_SZ /d "${manifestPath}" /f`);
    console.error(ok
      ? `Registered for Firefox (${GECKO_EXTENSION_ID})`
      : 'Failed to write the Firefox registry key');
    return;
  }

  const manifestPath = path.join(hostDir, MANIFEST_FILE);
  fs.writeFileSync(manifestPath, JSON.stringify(getChromeManifest(), null, 2) + '\n');

  let registered = 0;
  for (const b of BROWSERS) {
    if (reg(`add "HKCU\\Software\\${b.key}\\NativeMessagingHosts\\${HOST_NAME}" /ve /t REG_SZ /d "${manifestPath}" /f`)) {
      console.error(`Registered for ${b.name}`);
      registered++;
    }
  }
  if (!registered) console.error('No Chromium registry keys were written');
  console.error(`Extension ID: ${CHROME_EXTENSION_ID} (pinned by manifest.json)`);
}

function uninstallHost() {
  for (const b of BROWSERS) {
    reg(`delete "HKCU\\Software\\${b.key}\\NativeMessagingHosts\\${HOST_NAME}" /f`);
  }
  reg(`delete "HKCU\\Software\\Mozilla\\NativeMessagingHosts\\${HOST_NAME}" /f`);

  const hostDir = getHostDir();
  for (const f of [MANIFEST_FILE, MANIFEST_FILE_FIREFOX]) {
    try { fs.unlinkSync(path.join(hostDir, f)); } catch {}
  }

  console.error('Unregistered and removed the host manifests.');
}

const argv = process.argv.slice(2);

if (argv.includes('--install')) installHost();
else if (argv.includes('--uninstall')) uninstallHost();
else {
  console.error('Usage:');
  console.error(`  node ${path.basename(process.argv[1])} --install`);
  console.error(`  node ${path.basename(process.argv[1])} --install --browser firefox`);
  console.error(`  node ${path.basename(process.argv[1])} --uninstall`);
  process.exit(1);
}
