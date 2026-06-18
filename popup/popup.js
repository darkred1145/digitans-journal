function updateUI(status) {
  const dot = document.getElementById('statusDot');
  const text = document.getElementById('statusText');
  const userId = document.getElementById('userIdInfo');
  const activityEmpty = document.getElementById('activityEmpty');
  const activityContent = document.getElementById('activityContent');
  const errorMsg = document.getElementById('errorMsg');

  if (status.rpcConnected) {
    dot.className = 'status-dot connected';
    text.textContent = 'Connected to Discord';
    if (status.userId) userId.textContent = `User ID: ${status.userId}`;
    else userId.textContent = '';
    errorMsg.style.display = 'none';
  } else {
    dot.className = 'status-dot disconnected';
    text.textContent = 'Disconnected';
    userId.textContent = '';
    if (status.lastError) {
      errorMsg.textContent = status.lastError;
      errorMsg.style.display = 'block';
    } else {
      errorMsg.style.display = 'none';
    }
  }

  if (status.currentActivity) {
    activityEmpty.style.display = 'none';
    activityContent.style.display = 'block';
    const a = status.currentActivity;
    activityContent.innerHTML = '<h3></h3><p></p>';
    activityContent.querySelector('h3').textContent = a.details || '';
    activityContent.querySelector('p').textContent = a.state || '';
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

document.getElementById('clearBtn').addEventListener('click', () => {
  chrome.runtime.sendMessage({ type: 'clearActivity' }, () => {
    chrome.runtime.sendMessage({ type: 'getStatus' }, (status) => updateUI(status));
  });
});
