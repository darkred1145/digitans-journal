const DEFAULTS = {
  enabled: true,
  sites: { nhentai: true, gametora: true, raggooner: true },
  idleTimeout: 0,
  privacyMode: false,
  templates: {},
};

async function loadSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(DEFAULTS, resolve);
  });
}

async function saveSettings(settings) {
  return new Promise((resolve) => {
    chrome.storage.sync.set(settings, resolve);
  });
}

function showSaved() {
  const el = document.getElementById('saveStatus');
  el.textContent = 'Saved';
  setTimeout(() => { el.textContent = ''; }, 1500);
}

async function init() {
  document.getElementById('extId').textContent = chrome.runtime.id;

  const settings = await loadSettings();
  document.getElementById('masterToggle').checked = settings.enabled;
  document.querySelectorAll('.site-toggle').forEach((cb) => {
    cb.checked = settings.sites[cb.dataset.site] !== false;
  });
  document.getElementById('idleTimeout').value = settings.idleTimeout || 0;
  document.getElementById('privacyMode').checked = settings.privacyMode || false;

  document.querySelectorAll('.template-group').forEach((group) => {
    const site = group.dataset.site;
    const tmpl = (settings.templates && settings.templates[site]) || {};
    group.querySelector('.template-details').value = tmpl.details || '';
    group.querySelector('.template-state').value = tmpl.state || '';
  });

  document.getElementById('masterToggle').addEventListener('change', async (e) => {
    const s = await loadSettings();
    s.enabled = e.target.checked;
    await saveSettings(s);
    showSaved();
  });

  document.querySelectorAll('.site-toggle').forEach((cb) => {
    cb.addEventListener('change', async (e) => {
      const s = await loadSettings();
      s.sites[e.target.dataset.site] = e.target.checked;
      await saveSettings(s);
      showSaved();
    });
  });

  document.getElementById('idleTimeout').addEventListener('change', async (e) => {
    const s = await loadSettings();
    s.idleTimeout = parseInt(e.target.value, 10) || 0;
    await saveSettings(s);
    showSaved();
  });

  document.getElementById('privacyMode').addEventListener('change', async (e) => {
    const s = await loadSettings();
    s.privacyMode = e.target.checked;
    await saveSettings(s);
    showSaved();
  });

  document.querySelectorAll('.template-details, .template-state').forEach((input) => {
    input.addEventListener('change', async (e) => {
      const s = await loadSettings();
      const group = e.target.closest('.template-group');
      const site = group.dataset.site;
      if (!s.templates) s.templates = {};
      if (!s.templates[site]) s.templates[site] = {};
      s.templates[site].details = group.querySelector('.template-details').value;
      s.templates[site].state = group.querySelector('.template-state').value;
      await saveSettings(s);
      showSaved();
    });
  });
}

document.addEventListener('DOMContentLoaded', init);
