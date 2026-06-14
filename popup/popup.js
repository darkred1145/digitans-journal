function updateUI(status) {
  const dot = document.getElementById('statusDot');
  const text = document.getElementById('statusText');
  const userId = document.getElementById('userIdInfo');
  const activityEmpty = document.getElementById('activityEmpty');
  const activityContent = document.getElementById('activityContent');

  if (status.rpcConnected) {
    dot.className = 'status-dot connected';
    text.textContent = 'Connected to Discord';
    if (status.userId) userId.textContent = `User ID: ${status.userId}`;
    else userId.textContent = '';
  } else {
    dot.className = 'status-dot disconnected';
    text.textContent = 'Disconnected';
    userId.textContent = '';
  }

  if (status.currentActivity) {
    activityEmpty.style.display = 'none';
    activityContent.style.display = 'block';
    const a = status.currentActivity;
    activityContent.innerHTML = `
      <h3>${a.details || ''}</h3>
      <p>${a.state || ''}</p>
    `;
  } else {
    activityEmpty.style.display = 'block';
    activityContent.style.display = 'none';
  }
}

chrome.runtime.sendMessage({ type: 'getStatus' }, (status) => {
  updateUI(status);
});

document.getElementById('reconnectBtn').addEventListener('click', () => {
  const btn = document.getElementById('reconnectBtn');
  btn.textContent = 'Reconnecting...';
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
