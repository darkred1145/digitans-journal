function truncate(s, n = 128) {
  return s && s.length > n ? s.slice(0, n - 1) + '\u2026' : s;
}

function harvest(site, config, extractor) {
  const interval = config.interval ?? 5000;
  const throttle = config.throttle ?? 2000;
  let lastSend = 0;
  let lastUrl = location.href;

  function send(data) {
    if (!data) return;
    data.details = truncate(data.details);
    if (data.state) data.state = truncate(data.state);
    chrome.runtime.sendMessage({ type: 'presence', site, data });
  }

  function tick(force) {
    try {
      const url = location.href;
      if (url !== lastUrl) {
        lastUrl = url;
        setTimeout(() => tick(true), 1000);
        return;
      }

      const now = Date.now();
      if (!force && now - lastSend < throttle) return;

      const data = extractor();
      if (data) {
        lastSend = Date.now();
        send(data);
      }
    } catch (err) {
      console.error('[harvester] ' + site + ':', err);
    }
  }

  setTimeout(() => tick(true), 1000);
  setInterval(tick, interval);
}
