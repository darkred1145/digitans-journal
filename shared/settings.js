/** @type {SettingsObject} */
const DEFAULTS = {
  enabled: true,
  // Opt-out map, so a site is on unless it is set to false. Both the UI and
  // state-manager test `!== false`, which is why nothing seeds this from sites.json.
  sites: {},
  idleTimeout: 0,
  privacyMode: false,
  templates: {},
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DEFAULTS };
}
