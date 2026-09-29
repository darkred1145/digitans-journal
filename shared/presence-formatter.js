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
    // {total} is the documented alias for raw.totalPages — preserved because saved
    // user templates depend on it.
    const vars = { ...raw, total: raw.totalPages, site };
    const render = (s) => s.replace(/\{(\w+)\}/g, (_, k) =>
      vars[k] !== undefined && vars[k] !== null ? String(vars[k]) : '');
    if (tmpl.details) details = render(tmpl.details);
    if (tmpl.state) state = render(tmpl.state);
  }

  return { ...data, details: truncate(details), state: state ? truncate(state) : undefined };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { formatPresence };
}
