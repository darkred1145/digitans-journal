const path = require('path');
const fs = require('fs');

async function withTrace(context, traceDir, label, fn) {
  fs.mkdirSync(traceDir, { recursive: true });
  await context.tracing.start({ screenshots: true, snapshots: true });
  try {
    await fn();
    await context.tracing.stop({ path: path.join(traceDir, `${label}-passed.zip`) });
  } catch (err) {
    await context.tracing.stop({ path: path.join(traceDir, `${label}-failed.zip`) });
    throw err;
  }
}

module.exports = { withTrace };
