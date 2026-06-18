const DEFAULTS = {
  enabled: true,
  sites: { nhentai: true, gametora: true, raggooner: true },
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

  document.getElementById('masterToggle').addEventListener('change', async (e) => {
    const settings = await loadSettings();
    settings.enabled = e.target.checked;
    await saveSettings(settings);
    showSaved();
  });

  document.querySelectorAll('.site-toggle').forEach((cb) => {
    cb.addEventListener('change', async (e) => {
      const settings = await loadSettings();
      settings.sites[e.target.dataset.site] = e.target.checked;
      await saveSettings(settings);
      showSaved();
    });
  });
}

document.addEventListener('DOMContentLoaded', init);
