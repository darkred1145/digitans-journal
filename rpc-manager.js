class RPCManager {
  constructor(hostName, clientId) {
    this.hostName = hostName;
    this.clientId = clientId;
    this.port = null;
    this.listeners = [];
  }

  onStatus(fn) {
    this.listeners.push(fn);
  }

  _emit(status) {
    this.listeners.forEach(fn => fn(status));
  }

  connect() {
    if (this.port) return;
    try {
      this.port = chrome.runtime.connectNative(this.hostName);
      this.port.onMessage.addListener((msg) => {
        if (msg.type === 'rpcStatus') {
          this._emit({ connected: msg.connected, userId: msg.userId || null, error: msg.error || null });
        }
      });
      this.port.onDisconnect.addListener(() => {
        this.port = null;
        this._emit({ connected: false, userId: null, error: 'Native host disconnected' });
      });
      this.port.postMessage({ action: 'connect', clientId: this.clientId });
    } catch (err) {
      this.port = null;
      this._emit({ connected: false, userId: null, error: err.message });
    }
  }

  disconnect() {
    if (this.port) {
      try { this.port.postMessage({ action: 'disconnect' }); } catch (_) {}
      this.port.disconnect();
      this.port = null;
    }
  }

  setActivity(presence) {
    if (!this.port) {
      this.connect();
    }
    if (this.port) {
      try {
        this.port.postMessage({ action: 'setActivity', presence });
      } catch (e) {
        this.port = null;
        this.connect();
        if (this.port) {
          try { this.port.postMessage({ action: 'setActivity', presence }); } catch (_) {}
        }
      }
    }
  }

  clearActivity() {
    if (this.port) {
      try { this.port.postMessage({ action: 'setActivity', presence: null }); } catch (_) {}
    }
  }
}
