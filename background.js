importScripts('shared/truncate.js', 'shared/presence-contract.js', 'shared/presence-formatter.js', 'shared/settings.js', 'shared/rpc-protocol.js', 'rpc-manager.js', 'state-manager.js');

const CLIENT_ID = '1513880949220311181';

const rpc = new RPCManager('com.digitansjournal.rpc', CLIENT_ID);
const state = new StateManager(rpc);

browser.tabs.onRemoved.addListener((tabId) => {
  state.untrackTab(tabId);
});

browser.runtime.onMessage.addListener((msg, sender) => {
  if (msg.type === 'presence') {
    if (sender.tab && sender.tab.id) state.trackTab(sender.tab.id);
    state.sendActivity(msg.site, msg.data);
    return { ok: true };
  }
  if (msg.type === 'getStatus') {
    return state.getStatus();
  }
  if (msg.type === 'reconnect') {
    rpc.disconnect();
    rpc.connect();
    return { ok: true };
  }
  if (msg.type === 'clearActivity') {
    state.clearActivity();
    return { ok: true };
  }
});

browser.commands.onCommand.addListener((command) => {
  if (command === 'clear-activity') state.clearActivity();
});

state.loadSettings().then(() => rpc.connect());

browser.runtime.onStartup.addListener(() => {
  rpc.connect();
});

browser.runtime.onInstalled.addListener(() => {
  rpc.connect();
});
