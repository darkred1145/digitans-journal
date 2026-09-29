/** @type {SettingsObject} */
const DEFAULTS = {
  enabled: true,
  // Per-site opt-out only. A site absent from this map is enabled; the UI and
  // state-manager both test `!== false`, so sites.json never needs seeding here.
  sites: {},
  idleTimeout: 0,
  privacyMode: false,
  templates: {},
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DEFAULTS };
}
