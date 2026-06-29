/** @type {SettingsObject} */
const DEFAULTS = {
  enabled: true,
  sites: { nhentai: true, gametora: true, raggooner: true, 'uma-guide': true, umalator: true },
  idleTimeout: 0,
  privacyMode: false,
  templates: {},
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DEFAULTS };
}
