async function loadSettings() {
  return browser.storage.sync.get(DEFAULTS);
}

async function saveSettings(settings) {
  return browser.storage.sync.set(settings);
}

function showSaved() {
  const el = document.getElementById('saveStatus');
  el.textContent = 'Saved';
  setTimeout(() => { el.textContent = ''; }, 1500);
}

let saveQueue = Promise.resolve();

async function queuedSave(updater) {
  await (saveQueue = saveQueue.then(async () => {
    const s = await loadSettings();
    updater(s);
    await saveSettings(s);
    showSaved();
  }).catch(() => {}));
}

async function loadSites() {
  const resp = await fetch(browser.runtime.getURL('sites.json'));
  return resp.json();
}

function createSiteToggle(site, checked) {
  const div = document.createElement('div');
  div.className = 'row';
  div.innerHTML = `
    <label class="row-label" for="site-${site.id}">${site.label}</label>
    <label class="toggle">
      <input type="checkbox" class="site-toggle" id="site-${site.id}" data-site="${site.id}" ${checked ? 'checked' : ''}>
      <span class="slider"></span>
    </label>`;
  div.querySelector('.site-toggle').addEventListener('change', (e) => {
    queuedSave((s) => { s.sites[e.target.dataset.site] = e.target.checked; });
  });
  return div;
}

function createTemplateGroup(site, tmpl) {
  const div = document.createElement('div');
  div.className = 'template-group';
  div.dataset.site = site.id;
  div.innerHTML = `
    <div class="template-label">${site.label}</div>
    <div class="template-row">
      <span class="template-prefix">details</span>
      <input type="text" class="input-text template-details" autocomplete="off" spellcheck="false" placeholder="e.g. {title}…" aria-label="Details template" value="${(tmpl && tmpl.details) || ''}">
    </div>
    <div class="template-row">
      <span class="template-prefix">state</span>
      <input type="text" class="input-text template-state" autocomplete="off" spellcheck="false" placeholder="e.g. Browsing {title}…" aria-label="State template" value="${(tmpl && tmpl.state) || ''}">
    </div>`;
  div.querySelectorAll('.template-details, .template-state').forEach((input) => {
    input.addEventListener('change', (e) => {
      queuedSave((s) => {
        const g = e.target.closest('.template-group');
        const siteId = g.dataset.site;
        if (!s.templates) s.templates = {};
        if (!s.templates[siteId]) s.templates[siteId] = {};
        s.templates[siteId].details = g.querySelector('.template-details').value;
        s.templates[siteId].state = g.querySelector('.template-state').value;
      });
    });
  });
  return div;
}

async function init() {
  document.getElementById('extId').textContent = browser.runtime.id;

  const [sites, settings] = await Promise.all([loadSites(), loadSettings()]);
  document.getElementById('masterToggle').checked = settings.enabled;

  const sitesList = document.getElementById('sitesList');
  const templateGroups = document.getElementById('templateGroups');
  for (const site of sites) {
    const checked = settings.sites[site.id] !== false;
    sitesList.appendChild(createSiteToggle(site, checked));
    templateGroups.appendChild(createTemplateGroup(site, (settings.templates && settings.templates[site.id]) || {}));
  }

  document.getElementById('idleTimeout').value = settings.idleTimeout || 0;
  document.getElementById('privacyMode').checked = settings.privacyMode || false;

  document.getElementById('masterToggle').addEventListener('change', (e) => {
    queuedSave((s) => { s.enabled = e.target.checked; });
  });

  document.getElementById('idleTimeout').addEventListener('change', (e) => {
    queuedSave((s) => { s.idleTimeout = parseInt(e.target.value, 10) || 0; });
  });

  document.getElementById('privacyMode').addEventListener('change', (e) => {
    queuedSave((s) => { s.privacyMode = e.target.checked; });
  });
}

document.addEventListener('DOMContentLoaded', init);
