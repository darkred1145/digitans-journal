async function retry(fn, opts = {}) {
  const { retries = 3, delay = 1000, backoff = 2 } = opts;
  let lastErr;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (i < retries - 1) {
        await new Promise(r => setTimeout(r, delay * Math.pow(backoff, i)));
      }
    }
  }
  throw lastErr;
}

module.exports = { retry };
