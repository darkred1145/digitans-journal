const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const os = require('os');

const EXT_PATH = path.resolve(__dirname, '..');

async function main() {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dj-e2e-'));
  let passed = 0;
  let failed = 0;

  function assert(label, ok, detail) {
    const status = ok ? 'PASS' : 'FAIL';
    console.error(`  ${status}  ${label}${detail ? ': ' + detail : ''}`);
    if (ok) passed++; else failed++;
  }

  const context = await chromium.launchPersistentContext(tempDir, {
    headless: false,
    args: [
      `--disable-extensions-except=${EXT_PATH}`,
      `--load-extension=${EXT_PATH}`,
      '--no-first-run',
      '--no-default-browser-check',
    ],
  });

  try {
    await new Promise(r => setTimeout(r, 2000));

    // 1. Extension loads
    const sws = context.serviceWorkers();
    assert('service worker registered', sws.length > 0);

    // 2. Extension ID
    let extId = null;
    for (const w of context.serviceWorkers()) {
      const m = w.url().match(/^chrome-extension:\/\/([^/]+)\//);
      if (m) extId = m[1];
    }
    assert('extension ID detected', !!extId, extId);

    // 3. Open uma.guide and wait for content scripts to fire
    const page = await context.newPage();
    const pageErrors = [];
    page.on('pageerror', e => pageErrors.push(e.message));
    await page.goto('https://uma.guide/characters/', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await new Promise(r => setTimeout(r, 5000));
    assert('uma.guide page loaded', await page.title() !== '');
    assert('no content script errors on uma.guide', pageErrors.length === 0, pageErrors.join('; ') || 'none');

    // 4. Open uma.guide /guides/ to verify content script on a different route
    const guides = await context.newPage();
    const guideErrors = [];
    guides.on('pageerror', e => guideErrors.push(e.message));
    await guides.goto('https://uma.guide/guides/', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await new Promise(r => setTimeout(r, 5000));
    assert('no content script errors on /guides/', guideErrors.length === 0, guideErrors.join('; ') || 'none');
    await guides.close();

    // 5. Popup renders
    if (extId) {
      const popup = await context.newPage();
      await popup.goto(`chrome-extension://${extId}/popup/popup.html`, { waitUntil: 'networkidle' });
      const popupText = await popup.textContent('body');
      assert('popup renders', popupText.includes('Digitan'));
      await popup.close();
    }

    await page.close();
  } catch (err) {
    console.error('  FAIL  unexpected error:', err.message);
    failed++;
  } finally {
    await context.close();
    fs.rmSync(tempDir, { recursive: true, force: true });
  }

  console.error(`\n${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

main();
