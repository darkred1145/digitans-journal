const CLIENT_ID = '1513880949220311181';
let nativePort = null;
let currentActivity = null;
let currentSite = null;

function connectNative() {
  if (nativePort) return;
  try {
    nativePort = chrome.runtime.connectNative('com.digitansjournal.rpc');
    nativePort.onMessage.addListener((msg) => {
      if (msg.type === 'rpcStatus') {
        chrome.storage.local.set({ rpcConnected: msg.connected, userId: msg.userId || null });
      }
    });
    nativePort.onDisconnect.addListener(() => {
      nativePort = null;
      chrome.storage.local.set({ rpcConnected: false, userId: null });
    });
    nativePort.postMessage({ action: 'connect', clientId: CLIENT_ID });
  } catch (_) {
  }
}

function sendActivity(site, data) {
  currentSite = site;
  currentActivity = data;
  if (!nativePort) connectNative();
  if (nativePort) {
    nativePort.postMessage({ action: 'setActivity', presence: data });
    chrome.storage.local.set({ currentSite: site, currentActivity: data });
  }
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'presence') {
    sendActivity(msg.site, msg.data);
    sendResponse({ ok: true });
  }
  if (msg.type === 'getStatus') {
    sendResponse({
      rpcConnected: nativePort !== null,
      currentSite,
      currentActivity,
    });
  }
  if (msg.type === 'reconnect') {
    if (nativePort) { nativePort.disconnect(); nativePort = null; }
    connectNative();
    sendResponse({ ok: true });
  }
  return true;
});

chrome.runtime.onInstalled.addListener(() => {
  connectNative();
});
