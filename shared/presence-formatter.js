/**
 * @param {string} site
 * @param {PresenceData} data
 * @param {SettingsObject} settings
 * @returns {PresenceData}
 */
function formatPresence(site, data, settings) {
  if (settings.privacyMode) {
    return {
      details: truncate('Browsing ' + site),
      state: undefined,
      largeImageKey: data.largeImageKey || 'digitan',
      largeImageText: data.largeImageText || '',
      smallImageKey: data.smallImageKey,
      smallImageText: data.smallImageText,
    };
  }

  const raw = data.raw || {};
  const tmpl = settings.templates && settings.templates[site];
  let details = data.details;
  let state = data.state;

  if (tmpl) {
    const r = (s) => (raw[s] !== undefined && raw[s] !== null ? String(raw[s]) : '');
    if (tmpl.details) {
      details = tmpl.details
        .replace(/\{title\}/g, r('title'))
        .replace(/\{page\}/g, r('page'))
        .replace(/\{total\}/g, r('totalPages'))
        .replace(/\{type\}/g, r('type'))
        .replace(/\{rarity\}/g, r('rarity'))
        .replace(/\{subtitle\}/g, r('subtitle'))
        .replace(/\{site\}/g, site);
    }
    if (tmpl.state) {
      state = tmpl.state
        .replace(/\{title\}/g, r('title'))
        .replace(/\{page\}/g, r('page'))
        .replace(/\{total\}/g, r('totalPages'))
        .replace(/\{type\}/g, r('type'))
        .replace(/\{rarity\}/g, r('rarity'))
        .replace(/\{subtitle\}/g, r('subtitle'))
        .replace(/\{site\}/g, site);
    }
  }

  return { ...data, details: truncate(details), state: state ? truncate(state) : undefined };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { formatPresence };
}
