const BASE_BACKOFF = 1000;
const MAX_BACKOFF = 60000;

class RPCManager {
  constructor(hostName, clientId) {
    this.hostName = hostName;
    this.clientId = clientId;
    this.port = null;
    this.listeners = [];
    this._backoff = 0;
    this._backoffTimerId = null;
  }

  onStatus(fn) {
    this.listeners.push(fn);
  }

  /**
   * @param {RPCStatusEvent} status
   */
  _emit(status) {
    this.listeners.forEach(fn => fn(status));
  }

  _doConnect() {
    this.port = chrome.runtime.connectNative(this.hostName);
    this._emit({ connected: false, connecting: true, userId: null, error: null });
    this.port.onMessage.addListener((msg) => {
      if (msg.type === 'rpcStatus') {
        if (msg.connected) this._backoff = 0;
        this._emit({ connected: msg.connected, connecting: false, userId: msg.userId || null, error: msg.error || null });
      }
    });
    this.port.onDisconnect.addListener(() => {
      this.port = null;
      this._emit({ connected: false, connecting: false, userId: null, error: 'Native host disconnected' });
    });
    this.port.postMessage({ action: 'connect', clientId: this.clientId });
  }

  _scheduleReconnect() {
    const delay = Math.min(BASE_BACKOFF * Math.pow(2, this._backoff), MAX_BACKOFF);
    this._backoff++;
    this._backoffTimerId = setTimeout(() => {
      this._backoffTimerId = null;
      if (!this.port) this._doConnect();
    }, delay);
  }

  connect() {
    if (this.port) return;
    if (this._backoffTimerId) return;
    try {
      this._doConnect();
    } catch (err) {
      this.port = null;
      this._emit({ connected: false, connecting: false, userId: null, error: err.message });
      this._scheduleReconnect();
    }
  }

  disconnect() {
    if (this._backoffTimerId) {
      clearTimeout(this._backoffTimerId);
      this._backoffTimerId = null;
    }
    this._backoff = 0;
    if (this.port) {
      try { this.port.postMessage({ action: 'disconnect' }); } catch (_) {}
      this.port.disconnect();
      this.port = null;
    }
  }

  /**
   * @param {PresenceData|null} presence
   */
  setActivity(presence) {
    if (!this.port) { this.connect(); return; }
    try {
      this.port.postMessage({ action: 'setActivity', presence });
    } catch (e) {
      this.port = null;
      this._scheduleReconnect();
    }
  }

  clearActivity() {
    if (this.port) {
      try { this.port.postMessage({ action: 'setActivity', presence: null }); } catch (_) {}
    }
  }
}
