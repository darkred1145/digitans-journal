const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const DiscordRPC = require('discord-rpc');

const HOST_NAME = 'com.digitansjournal.rpc';
const MANIFEST_FILE = HOST_NAME + '.json';

let rpc = null;
let rpcConnected = false;
let clientId = null;
let pendingActivity = null;

function sendMessage(msg) {
  const json = JSON.stringify(msg);
  const len = Buffer.alloc(4);
  len.writeUInt32LE(Buffer.byteLength(json), 0);
  process.stdout.write(len);
  process.stdout.write(json);
}

async function connectRPC(id) {
  if (rpc) return;
  clientId = id;
  try {
    DiscordRPC.register(clientId);
    rpc = new DiscordRPC.Client({ transport: 'ipc' });
    rpc.on('ready', () => {
      rpcConnected = true;
      if (pendingActivity) {
        const p = pendingActivity;
        pendingActivity = null;
        setActivity(p);
      }
      sendMessage({ type: 'rpcStatus', connected: true, userId: rpc.user ? rpc.user.id : null });
    });
    rpc.on('disconnected', () => {
      rpcConnected = false;
      rpc = null;
      sendMessage({ type: 'rpcStatus', connected: false });
    });
    await rpc.login({ clientId });
  } catch (err) {
    rpcConnected = false;
    rpc = null;
    sendMessage({ type: 'rpcStatus', connected: false, error: err.message });
  }
}

function truncate(s, n = 128) { return s && s.length > n ? s.slice(0, n - 1) + '\u2026' : s; }

function clearPresence() {
  pendingActivity = null;
  if (rpc && rpcConnected) {
    rpc.setActivity(null).catch((err) => {
      sendMessage({ type: 'rpcStatus', connected: true, error: err.message });
    });
  }
}

function setActivity(presence) {
  if (!presence) { clearPresence(); return; }
  if (!rpc || !rpcConnected) { pendingActivity = presence; return; }
  const payload = {
    details: truncate(presence.details) || 'Digitan\'s Journal',
    startTimestamp: presence.startTimestamp || Date.now(),
    largeImageKey: presence.largeImageKey || 'digitan',
    largeImageText: presence.largeImageText || 'Digitan\'s Journal',
  };
  if (presence.state) payload.state = truncate(presence.state);
  if (presence.smallImageKey) payload.smallImageKey = presence.smallImageKey;
  if (presence.smallImageText) payload.smallImageText = presence.smallImageText;
  if (presence.buttons) payload.buttons = presence.buttons;
  rpc.setActivity(payload).catch((err) => {
    sendMessage({ type: 'rpcStatus', connected: true, error: err.message });
  });
}

function disconnectRPC() {
  pendingActivity = null;
  if (rpc) {
    rpc.destroy();
    rpc = null;
  }
  rpcConnected = false;
  clientId = null;
}

process.on('unhandledRejection', (err) => {
  sendMessage({ type: 'error', message: err.message });
});

// === Install / Uninstall ===

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

        // Method 1: Check extensions.settings for unpacked extension path
        const settings = ext.settings;
        if (settings) {
          const projectDir = path.basename(path.resolve(__dirname, '..'));
          for (const [id, data] of Object.entries(settings)) {
            if (data.path && data.path.includes(projectDir)) {
              console.error(`Detected extension ID ${id} from ${b.name} (settings)`);
              return { id, browserName: b.name, browserKey: b.key };
            }
          }
        }

        // Method 2: Check extensions.commands for known commands from our manifest
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

function getRegistryPaths() {
  const hostDir = __dirname;
  const manifestPath = path.join(hostDir, MANIFEST_FILE);
  const batchPath = path.join(hostDir, 'host.bat');
  const manifest = {
    name: HOST_NAME,
    description: "Digitan's Journal Discord RPC bridge",
    path: batchPath,
    type: 'stdio',
    allowed_origins: [],
  };
  return { hostDir, manifestPath, manifest };
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

if (process.argv.includes('--install')) {
  installHost();
  process.exit(0);
}
if (process.argv.includes('--uninstall')) {
  uninstallHost();
  process.exit(0);
}

// === Native messaging stdin handler ===

let buffer = Buffer.alloc(0);

process.stdin.on('data', (chunk) => {
  buffer = Buffer.concat([buffer, chunk]);
  while (buffer.length >= 4) {
    const len = buffer.readUInt32LE(0);
    if (buffer.length < 4 + len) break;
    const json = buffer.slice(4, 4 + len).toString('utf-8');
    buffer = buffer.slice(4 + len);
    try {
      const msg = JSON.parse(json);
      if (msg.action === 'connect') connectRPC(msg.clientId);
      else if (msg.action === 'setActivity') setActivity(msg.presence);
      else if (msg.action === 'disconnect') disconnectRPC();
    } catch (e) {
      sendMessage({ type: 'error', message: e.message });
    }
  }
});

process.stdin.on('end', () => {
  disconnectRPC();
  process.exit(0);
});
