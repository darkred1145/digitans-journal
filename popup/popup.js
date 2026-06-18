function updateUI(status) {
  const seal = document.getElementById('seal');
  const dot = document.getElementById('sealDot');
  const text = document.getElementById('statusText');
  const footer = document.getElementById('footerInfo');
  const empty = document.getElementById('emptyState');
  const active = document.getElementById('activeEntry');

  if (status.rpcConnected) {
    seal.dataset.status = 'connected';
    dot.className = 'seal-dot connected';
    text.className = 'status-text connected';
    text.textContent = 'Connected';
    footer.textContent = status.userId ? `User ${status.userId}` : '';
    footer.className = 'footer-info';
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
    document.getElementById('emptyMessage').textContent =
      status.rpcConnected ? 'Your journal is ready.' : 'No connection.';
    document.getElementById('emptyHint').textContent =
      status.rpcConnected ? 'Open a tracked site to begin logging.' : 'Click Reconnect to try again.';
  }
}

chrome.runtime.sendMessage({ type: 'getStatus' }, (status) => {
  updateUI(status);
});

document.getElementById('reconnectBtn').addEventListener('click', () => {
  const btn = document.getElementById('reconnectBtn');
  btn.textContent = 'Reconnecting…';
  btn.disabled = true;
  chrome.runtime.sendMessage({ type: 'reconnect' }, () => {
    setTimeout(() => {
      chrome.runtime.sendMessage({ type: 'getStatus' }, (status) => {
        updateUI(status);
        btn.textContent = 'Reconnect';
        btn.disabled = false;
      });
    }, 1500);
  });
});

document.getElementById('clearBtn').addEventListener('click', () => {
  chrome.runtime.sendMessage({ type: 'clearActivity' }, () => {
    chrome.runtime.sendMessage({ type: 'getStatus' }, (status) => updateUI(status));
  });
});
