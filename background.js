importScripts('shared/presence-contract.js', 'shared/settings.js', 'rpc-manager.js', 'state-manager.js');

const CLIENT_ID = '1513880949220311181';

const rpc = new RPCManager('com.digitansjournal.rpc', CLIENT_ID);
const state = new StateManager(rpc);

chrome.tabs.onRemoved.addListener((tabId) => {
  state.untrackTab(tabId);
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'presence') {
    if (sender.tab && sender.tab.id) state.trackTab(sender.tab.id);
    state.sendActivity(msg.site, msg.data);
    sendResponse({ ok: true });
  }
  if (msg.type === 'getStatus') {
    sendResponse(state.getStatus());
  }
  if (msg.type === 'reconnect') {
    rpc.disconnect();
    rpc.connect();
    sendResponse({ ok: true });
  }
  if (msg.type === 'clearActivity') {
    state.clearActivity();
    sendResponse({ ok: true });
  }
  return true;
});

chrome.commands.onCommand.addListener((command) => {
  if (command === 'clear-activity') state.clearActivity();
});

state.loadSettings();
rpc.connect();

chrome.runtime.onStartup.addListener(() => {
  rpc.connect();
});

chrome.runtime.onInstalled.addListener(() => {
  rpc.connect();
});
