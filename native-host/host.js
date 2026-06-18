const DiscordRPC = require('discord-rpc');

let rpc = null;
let rpcConnected = false;
let clientId = null;

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

function truncate(s, n = 128) { return s && s.length > n ? s.slice(0, n - 1) + '…' : s; }

function setActivity(presence) {
  if (!rpc || !rpcConnected) return;
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
      if (msg.action === 'connect') connectRPC(msg.clientId).catch((err) => sendMessage({ type: 'rpcStatus', connected: false, error: err.message }));
      else if (msg.action === 'setActivity') setActivity(msg.presence);
      else if (msg.action === 'disconnect') disconnectRPC();
      else if (msg.action === 'ping') sendMessage({ type: 'pong' });
    } catch (e) {
      sendMessage({ type: 'error', message: e.message });
    }
  }
});

process.stdin.on('end', () => {
  disconnectRPC();
  process.exit(0);
});
