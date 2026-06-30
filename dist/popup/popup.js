function updateUI(status) {
  const seal = document.getElementById('seal');
  const dot = document.getElementById('sealDot');
  const text = document.getElementById('statusText');
  const footer = document.getElementById('footerInfo');
  const empty = document.getElementById('emptyState');
  const active = document.getElementById('activeEntry');
  const container = document.getElementById('activityContainer');

  if (status.rpcConnected) {
    seal.dataset.status = 'connected';
    dot.className = 'seal-dot connected';
    text.className = 'status-text connected';
    text.textContent = 'Connected';
    footer.textContent = status.userId ? `User ${status.userId}` : '';
    footer.className = 'footer-info';
  } else if (status.connecting) {
    seal.dataset.status = 'connecting';
    dot.className = 'seal-dot connecting';
    text.className = 'status-text connecting';
    text.textContent = 'Connecting…';
    footer.className = 'footer-info';
    footer.textContent = '';
  } else {
    seal.dataset.status = 'disconnected';
    dot.className = 'seal-dot disconnected';
    text.className = 'status-text disconnected';
    text.textContent = status.lastError || 'Disconnected';
    footer.className = 'footer-info error';
    footer.textContent = status.lastError || '';
  }

  if (status.currentActivity) {
    empty.style.display = 'none';
    active.style.display = 'block';
    const a = status.currentActivity;
    document.getElementById('entrySite').textContent = status.currentSite || '';
    document.getElementById('entryDetails').textContent = a.details || '';
    document.getElementById('entryState').textContent = a.state || '';
  } else {
    empty.style.display = 'block';
    active.style.display = 'none';
    const messages = [
      'Hewwo! Your journal is ready~♪',
      'I\'m so glad I was born an otaku~♪',
      'Sparkling content is being logged!',
      'Ready to support your adventures~!',
      'Every page is a new sparkle~☆',
      'Hewwo! Waiting for something shiny~!',
    ];
    document.getElementById('emptyMessage').textContent =
      status.rpcConnected ? messages[Math.floor(Math.random() * messages.length)] : 'No connection.';
    document.getElementById('emptyHint').textContent =
      status.rpcConnected ? 'Open a tracked site to start logging sparkling content!' : 'Click Reconnect to try again.';
  }

  container.classList.remove('fade-in');
  void container.offsetWidth;
  container.classList.add('fade-in');
}

function fetchStatus() {
  browser.runtime.sendMessage({ type: 'getStatus' }).then((status) => {
    updateUI(status);
  });
}

browser.runtime.sendMessage({ type: 'getStatus' }).then((status) => {
  updateUI(status);
});

browser.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local') return;
  const relevant = ['rpcConnected', 'connecting', 'userId', 'lastError', 'currentSite', 'currentActivity'];
  if (relevant.some(k => changes[k])) fetchStatus();
});

document.getElementById('reconnectBtn').addEventListener('click', () => {
  const btn = document.getElementById('reconnectBtn');
  btn.textContent = 'Reconnecting…';
  btn.disabled = true;
  browser.runtime.sendMessage({ type: 'reconnect' }).then(() => {
    setTimeout(() => {
      browser.runtime.sendMessage({ type: 'getStatus' }).then((status) => {
        updateUI(status);
        btn.textContent = 'Reconnect';
        btn.disabled = false;
      });
    }, 1500);
  });
});

document.getElementById('clearBtn').addEventListener('click', () => {
  const btn = document.getElementById('clearBtn');
  btn.style.transform = 'scale(0.9)';
  setTimeout(() => { btn.style.transform = ''; }, 150);
  browser.runtime.sendMessage({ type: 'clearActivity' }).then(() => {
    browser.runtime.sendMessage({ type: 'getStatus' }).then((status) => updateUI(status));
  });
});
