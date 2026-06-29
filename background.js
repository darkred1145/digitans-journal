importScripts('shared/truncate.js', 'shared/presence-contract.js', 'shared/presence-formatter.js', 'shared/settings.js', 'shared/rpc-protocol.js', 'rpc-manager.js', 'state-manager.js');

const CLIENT_ID = '1513880949220311181';

const rpc = new RPCManager('com.digitansjournal.rpc', CLIENT_ID);
const state = new StateManager(rpc);

let siteMatches = [];

async function loadSiteMatches() {
  try {
    const resp = await fetch(chrome.runtime.getURL('sites.json'));
    siteMatches = (await resp.json()).map(s => s.match);
  } catch {}
}

function isSupportedUrl(url) {
  if (!url) return false;
  return siteMatches.some(m => {
    const pattern = m.replace(/\*/g, '');
    return url.startsWith(pattern);
  });
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.url && !isSupportedUrl(changeInfo.url)) {
    state.untrackTab(tabId);
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  state.untrackTab(tabId);
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'presence') {
    if (sender.tab && sender.tab.id) {
      if (!state.trackTab(sender.tab.id)) { sendResponse({ ok: false }); return; }
    }
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

Promise.all([state.loadSettings(), loadSiteMatches()]).then(() => rpc.connect());

chrome.runtime.onStartup.addListener(() => {
  rpc.connect();
});

chrome.runtime.onInstalled.addListener(() => {
  rpc.connect();
});
