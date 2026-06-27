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

let saveQueue = Promise.resolve();

async function queuedSave(updater) {
  await (saveQueue = saveQueue.then(async () => {
    const s = await loadSettings();
    updater(s);
    await saveSettings(s);
    showSaved();
  }));
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

  document.getElementById('masterToggle').addEventListener('change', (e) => {
    queuedSave((s) => { s.enabled = e.target.checked; });
  });

  document.querySelectorAll('.site-toggle').forEach((cb) => {
    cb.addEventListener('change', (e) => {
      queuedSave((s) => { s.sites[e.target.dataset.site] = e.target.checked; });
    });
  });

  document.getElementById('idleTimeout').addEventListener('change', (e) => {
    queuedSave((s) => { s.idleTimeout = parseInt(e.target.value, 10) || 0; });
  });

  document.getElementById('privacyMode').addEventListener('change', (e) => {
    queuedSave((s) => { s.privacyMode = e.target.checked; });
  });

  document.querySelectorAll('.template-details, .template-state').forEach((input) => {
    input.addEventListener('change', (e) => {
      queuedSave((s) => {
        const group = e.target.closest('.template-group');
        const site = group.dataset.site;
        if (!s.templates) s.templates = {};
        if (!s.templates[site]) s.templates[site] = {};
        s.templates[site].details = group.querySelector('.template-details').value;
        s.templates[site].state = group.querySelector('.template-state').value;
      });
    });
  });
}

document.addEventListener('DOMContentLoaded', init);
