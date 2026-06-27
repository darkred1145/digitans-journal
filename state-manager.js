class StateManager {
  constructor(rpc) {
    this.rpc = rpc;
    this.currentActivity = null;
    this.currentSite = null;
    this.lastError = null;
    this.trackedTabs = new Set();
    this.idleTimer = null;
    this.settings = { ...DEFAULTS };

    rpc.onStatus((status) => {
      this.lastError = status.error;
      this.userId = status.userId || null;
      this.rpcConnected = status.connected;
      this.connecting = status.connecting || false;
      chrome.storage.local.set({
        rpcConnected: status.connected,
        connecting: status.connecting || false,
        userId: status.userId,
        lastError: status.error,
      }, () => { chrome.runtime.lastError && console.error('storage set failed', chrome.runtime.lastError); });
    });

    chrome.storage.onChanged.addListener((changes, area) => {
      if (area !== 'sync') return;
      if (changes.enabled) this.settings.enabled = changes.enabled.newValue;
      if (changes.sites) this.settings.sites = changes.sites.newValue || {};
      if (changes.idleTimeout) {
        this.settings.idleTimeout = changes.idleTimeout.newValue || 0;
        this.resetIdleTimer();
      }
      if (changes.privacyMode) this.settings.privacyMode = changes.privacyMode.newValue || false;
      if (changes.templates) this.settings.templates = changes.templates.newValue || {};
    });
  }

  loadSettings() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(DEFAULTS, (s) => {
        this.settings = s;
        resolve();
      });
    });
  }

  /**
   * @param {string} site
   * @param {PresenceData} data
   * @returns {PresenceData}
   */
  formatPresence(site, data) {
    return formatPresence(site, data, this.settings);
  }

  /**
   * @param {string} site
   * @param {PresenceData} data
   */
  sendActivity(site, data) {
    if (!this.settings.enabled || this.settings.sites[site] === false) return;
    const finalData = this.formatPresence(site, data);
    this.currentSite = site;
    this.currentActivity = finalData;
    this.rpc.setActivity(finalData);
    this.lastError = null;
    chrome.storage.local.set({ currentSite: site, currentActivity: finalData, lastError: null }, () => {
      if (chrome.runtime.lastError) console.error('storage set failed', chrome.runtime.lastError);
    });
    this.resetIdleTimer();
  }

  clearActivity() {
    this.currentSite = null;
    this.currentActivity = null;
    this.rpc.clearActivity();
    chrome.storage.local.set({ currentSite: null, currentActivity: null }, () => {
      if (chrome.runtime.lastError) console.error('storage set failed', chrome.runtime.lastError);
    });
  }

  /**
   * @returns {StatusObject}
   */
  getStatus() {
    return {
      rpcConnected: this.rpcConnected || false,
      connecting: this.connecting || false,
      userId: this.userId || null,
      currentSite: this.currentSite,
      currentActivity: this.currentActivity,
      lastError: this.lastError,
    };
  }

  trackTab(tabId) {
    this.trackedTabs.add(tabId);
  }

  untrackTab(tabId) {
    if (this.trackedTabs.delete(tabId) && this.trackedTabs.size === 0) {
      this.clearActivity();
    }
  }

  resetIdleTimer() {
    if (this.idleTimer) clearTimeout(this.idleTimer);
    if (this.settings.idleTimeout > 0) {
      this.idleTimer = setTimeout(() => {
        this.clearActivity();
      }, this.settings.idleTimeout * 60 * 1000);
    }
  }
}
