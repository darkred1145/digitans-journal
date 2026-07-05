class StateManager {
  constructor(rpc) {
    this.rpc = rpc;
    this.currentActivity = null;
    this.currentSite = null;
    this.lastError = null;
    this.trackedTabs = new Set();
    this.idleTimer = null;
    this._untrackedTabs = new Set();
    this._lastStableKey = null;
    this.settings = { ...DEFAULTS };

    rpc.onStatus((status) => {
      this.lastError = status.error;
      this.userId = status.userId || null;
      this.rpcConnected = status.connected;
      this.connecting = status.connecting || false;
      if (status.connected && this.currentActivity) {
        this.rpc.setActivity(this.currentActivity);
      }
      browser.storage.local.set({
        rpcConnected: status.connected,
        connecting: status.connecting || false,
        userId: status.userId,
        lastError: status.error,
      }).catch((err) => console.error('storage set failed', err));
    });

    browser.storage.onChanged.addListener((changes, area) => {
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

  async loadSettings() {
    this.settings = await browser.storage.sync.get(DEFAULTS);
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
    finalData.details = finalData.details || 'Digitan\'s Journal';
    finalData.largeImageKey = finalData.largeImageKey || 'digitan';
    finalData.largeImageText = finalData.largeImageText || 'Digitan\'s Journal';
    const stableKey = [site, finalData.details, data.raw?.phase || ''].join('::');
    if (
      !this.currentActivity ||
      stableKey !== this._lastStableKey
    ) {
      this._lastStableKey = stableKey;
      finalData.startTimestamp = Date.now();
    } else {
      finalData.startTimestamp = this.currentActivity.startTimestamp;
    }
    this.currentSite = site;
    this.currentActivity = finalData;
    this.rpc.setActivity(finalData);
    this.lastError = null;
    browser.storage.local.set({ currentSite: site, currentActivity: finalData, lastError: null })
      .catch((err) => console.error('storage set failed', err));
    this.resetIdleTimer();
  }

  clearActivity() {
    this.currentSite = null;
    this.currentActivity = null;
    this._lastStableKey = null;
    this.rpc.clearActivity();
    browser.storage.local.set({ currentSite: null, currentActivity: null })
      .catch((err) => console.error('storage set failed', err));
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
    if (this._untrackedTabs.has(tabId)) return false;
    this.trackedTabs.add(tabId);
    return true;
  }

  allowTab(tabId) {
    this._untrackedTabs.delete(tabId);
  }

  untrackTab(tabId) {
    this._untrackedTabs.add(tabId);
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
