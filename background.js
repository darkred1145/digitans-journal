const CLIENT_ID = '1513880949220311181';
let nativePort = null;
let currentActivity = null;
let currentSite = null;
let lastError = null;

function connectNative() {
  if (nativePort) return;
  try {
    nativePort = chrome.runtime.connectNative('com.digitansjournal.rpc');
    nativePort.onMessage.addListener((msg) => {
      if (msg.type === 'rpcStatus') {
        lastError = msg.error || null;
        chrome.storage.local.set({ rpcConnected: msg.connected, userId: msg.userId || null, lastError }, () => {
          if (chrome.runtime.lastError) console.error('storage set failed', chrome.runtime.lastError);
        });
      }
    });
    nativePort.onDisconnect.addListener(() => {
      nativePort = null;
      lastError = 'Native host disconnected';
      chrome.storage.local.set({ rpcConnected: false, userId: null, lastError }, () => {
        if (chrome.runtime.lastError) console.error('storage set failed', chrome.runtime.lastError);
      });
    });
    nativePort.postMessage({ action: 'connect', clientId: CLIENT_ID });
  } catch (err) {
    console.error('native connect failed', err);
    lastError = err.message;
    chrome.storage.local.set({ rpcConnected: false, lastError }, () => {});
  }
}

function clearActivity() {
  currentSite = null;
  currentActivity = null;
  if (nativePort) nativePort.postMessage({ action: 'disconnect' });
  chrome.storage.local.set({ currentSite: null, currentActivity: null }, () => {
    if (chrome.runtime.lastError) console.error('storage set failed', chrome.runtime.lastError);
  });
}

function sendActivity(site, data) {
  currentSite = site;
  currentActivity = data;
  if (!nativePort) connectNative();
  if (nativePort) {
    nativePort.postMessage({ action: 'setActivity', presence: data });
    lastError = null;
    chrome.storage.local.set({ currentSite: site, currentActivity: data, lastError: null }, () => {
      if (chrome.runtime.lastError) console.error('storage set failed', chrome.runtime.lastError);
    });
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
      lastError,
    });
  }
  if (msg.type === 'reconnect') {
    if (nativePort) { nativePort.disconnect(); nativePort = null; }
    connectNative();
    sendResponse({ ok: true });
  }
  if (msg.type === 'clearActivity') {
    clearActivity();
    sendResponse({ ok: true });
  }
  return true;
});

chrome.commands.onCommand.addListener((command) => {
  if (command === 'clear-activity') clearActivity();
});

chrome.runtime.onInstalled.addListener(() => {
  connectNative();
});
