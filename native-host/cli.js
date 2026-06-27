const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { HOST_NAME, getHostDir, getRegistryPaths } = require('./host-constants');

const KNOWN_COMMANDS = ['clear-activity'];

function detectExtensionId() {
  const browsers = [
    { name: 'Chrome', key: 'Google/Chrome', prefs: [path.join(process.env.LOCALAPPDATA, 'Google/Chrome/User Data/Default/Preferences')] },
    { name: 'Edge', key: 'Microsoft/Edge', prefs: [path.join(process.env.LOCALAPPDATA, 'Microsoft/Edge/User Data/Default/Preferences')] },
    { name: 'Brave', key: 'BraveSoftware/Brave', prefs: [path.join(process.env.LOCALAPPDATA, 'BraveSoftware/Brave/User Data/Default/Preferences')] },
    { name: 'Chromium', key: 'Chromium', prefs: [
      path.join(process.env.LOCALAPPDATA, 'Chromium/User Data/Default/Preferences'),
      path.join(process.env.LOCALAPPDATA, 'imput/Helium/User Data/Default/Preferences'),
    ]},
  ];
  for (const b of browsers) {
    for (const prefsPath of b.prefs) {
      try {
        const prefs = JSON.parse(fs.readFileSync(prefsPath, 'utf-8'));
        const ext = prefs.extensions;
        if (!ext) continue;

        const settings = ext.settings;
        if (settings) {
          const projectDir = path.basename(path.resolve(getHostDir(), '..'));
          for (const [id, data] of Object.entries(settings)) {
            if (data.path && data.path.includes(projectDir)) {
              console.error(`Detected extension ID ${id} from ${b.name} (settings)`);
              return { id, browserName: b.name, browserKey: b.key };
            }
          }
        }

        const commands = ext.commands;
        if (commands) {
          for (const [key, val] of Object.entries(commands)) {
            if (KNOWN_COMMANDS.includes(val.command_name)) {
              console.error(`Detected extension ID ${val.extension} from ${b.name} (commands)`);
              return { id: val.extension, browserName: b.name, browserKey: b.key };
            }
          }
        }
      } catch {}
    }
  }
  return null;
}

function getBrowserList() {
  return [
    { name: 'Chrome', key: 'Google/Chrome' },
    { name: 'Edge', key: 'Microsoft/Edge' },
    { name: 'Brave', key: 'BraveSoftware/Brave' },
    { name: 'Chromium', key: 'Chromium' },
  ];
}

function installHost() {
  const detected = detectExtensionId();
  const extId = detected ? detected.id : (process.argv[process.argv.indexOf('--install') + 1]);
  const browserName = detected ? detected.browserName : null;
  const browserKey = detected ? detected.browserKey : null;

  if (!extId || extId.startsWith('--')) {
    console.error('Extension ID not found. Load the extension first, then run:');
    console.error(`  node ${path.basename(process.argv[1])} --install <extension-id>`);
    process.exit(1);
  }

  const { manifestPath, manifest } = getRegistryPaths();
  manifest.allowed_origins = [`chrome-extension://${extId}/`];
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  console.error(`Manifest written to ${manifestPath}`);

  if (browserKey) {
    execSync(`reg add "HKCU\\Software\\${browserKey}\\NativeMessagingHosts\\${HOST_NAME}" /ve /t REG_SZ /d "${manifestPath}" /f`, { stdio: 'pipe' });
    console.error(`Registered for ${browserName}`);
  } else {
    for (const b of getBrowserList()) {
      try {
        execSync(`reg add "HKCU\\Software\\${b.key}\\NativeMessagingHosts\\${HOST_NAME}" /ve /t REG_SZ /d "${manifestPath}" /f`, { stdio: 'pipe' });
        console.error(`Registered for ${b.name}`);
      } catch {}
    }
  }

  console.error('Install complete. Reload the extension in your browser.');
}

function uninstallHost() {
  for (const b of getBrowserList()) {
    try {
      execSync(`reg delete "HKCU\\Software\\${b.key}\\NativeMessagingHosts\\${HOST_NAME}" /f`, { stdio: 'pipe' });
      console.error(`Unregistered for ${b.name}`);
    } catch {}
  }

  const { manifestPath } = getRegistryPaths();
  try { fs.unlinkSync(manifestPath); } catch {}

  console.error('Uninstall complete.');
}

if (process.argv.includes('--install')) installHost();
else if (process.argv.includes('--uninstall')) uninstallHost();
else {
  console.error('Usage: node cli.js --install [extension-id]');
  console.error('       node cli.js --uninstall');
  process.exit(1);
}
