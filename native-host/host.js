if (process.argv.includes('--install') || process.argv.includes('--uninstall')) {
  console.error('Install/uninstall is now a separate command:');
  console.error('  node cli.js ' + process.argv.slice(2).join(' '));
  process.exit(1);
}

const DiscordRPC = require('discord-rpc');

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
      sendMessage(rpcStatus(true, { userId: rpc.user ? rpc.user.id : null }));
    });
    rpc.on('disconnected', () => {
      rpcConnected = false;
      rpc = null;
      sendMessage(rpcStatus(false));
    });
    await rpc.login({ clientId });
  } catch (err) {
    rpcConnected = false;
    rpc = null;
    sendMessage(rpcStatus(false, { error: err.message }));
  }
}

const { truncate } = require('../shared/truncate');
const {
  ACTION_CONNECT, ACTION_SET_ACTIVITY, ACTION_DISCONNECT,
  TYPE_RPC_STATUS, TYPE_ERROR,
  validateNativeMessage, validateHostMessage,
  rpcStatus, connectMsg, setActivityMsg, disconnectMsg,
} = require('../shared/rpc-protocol');

function clearPresence() {
  pendingActivity = null;
  if (rpc && rpcConnected) {
    rpc.clearActivity().catch((err) => {
      sendMessage(rpcStatus(true, { error: err.message }));
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
    sendMessage(rpcStatus(true, { error: err.message }));
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
  sendMessage({ type: TYPE_ERROR, message: err.message });
});

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
      if (!validateNativeMessage(msg)) { sendMessage({ type: TYPE_ERROR, message: 'invalid message' }); return; }
      if (msg.action === ACTION_CONNECT) connectRPC(msg.clientId);
      else if (msg.action === ACTION_SET_ACTIVITY) setActivity(msg.presence);
      else if (msg.action === ACTION_DISCONNECT) disconnectRPC();
    } catch (e) {
      sendMessage({ type: TYPE_ERROR, message: e.message });
    }
  }
});

process.stdin.on('end', () => {
  disconnectRPC();
  process.exit(0);
});
