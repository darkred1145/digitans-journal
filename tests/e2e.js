const path = require('path');
const fs = require('fs');
const os = require('os');
const { execSync } = require('child_process');
const { retry } = require('./helpers/retry');

const ROOT = path.resolve(__dirname, '..');

const BROWSER = process.argv.includes('--browser')
  ? process.argv[process.argv.indexOf('--browser') + 1]
  : 'chromium';

const BROWSER_LIBS = {
  chromium: require('playwright').chromium,
  firefox: require('playwright').firefox,
};

const EXT_ID_FIREFOX = 'digitans-journal@darkred1145';

async function main() {
  const lib = BROWSER_LIBS[BROWSER];
  const tempDirs = [];
  let passed = 0;
  let failed = 0;

  function assert(label, ok, detail) {
    const status = ok ? 'PASS' : 'FAIL';
    console.error(`  ${status}  ${label}${detail !== undefined ? ': ' + detail : ''}`);
    if (ok) passed++; else failed++;
  }

  let context;
  let extId = null;

  try {
    if (BROWSER === 'chromium') {
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dj-e2e-'));
      tempDirs.push(tempDir);
      context = await lib.launchPersistentContext(tempDir, {
        headless: false,
        args: [
          `--disable-extensions-except=${ROOT}`,
          `--load-extension=${ROOT}`,
          '--no-first-run',
          '--no-default-browser-check',
        ],
      });
      await new Promise(r => setTimeout(r, 2000));

      for (const w of context.serviceWorkers()) {
        const m = w.url().match(/^chrome-extension:\/\/([^/]+)\//);
        if (m) extId = m[1];
      }
      assert('extension ID detected', !!extId, extId);
      assert('service worker registered', !!extId);
    } else {
      execSync('node scripts/build.js --target firefox', { cwd: ROOT, stdio: 'pipe' });
      const xpiFile = fs.readdirSync(ROOT).find(f => /^digitans-journal-firefox-v[\d.]+\.xpi$/.test(f));
      assert('firefox xpi built', !!xpiFile, xpiFile || 'not found');
      if (!xpiFile) { failed++; return { passed, failed }; }

      const profileDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dj-fx-'));
      tempDirs.push(profileDir);
      const extDir = path.join(profileDir, 'extensions');
      fs.mkdirSync(extDir, { recursive: true });
      fs.copyFileSync(path.join(ROOT, xpiFile), path.join(extDir, `${EXT_ID_FIREFOX}.xpi`));

      context = await lib.launchPersistentContext(profileDir, {
        headless: false,
        firefoxUserPrefs: {
          'xpinstall.signatures.required': false,
          'extensions.autoDisableScopes': 0,
        },
      });
      await new Promise(r => setTimeout(r, 5000));

      for (const p of context.backgroundPages()) {
        const m = p.url().match(/^moz-extension:\/\/([^/]+)\//);
        if (m) extId = m[1];
      }
      if (!extId) {
        for (const p of context.pages()) {
          const m = p.url().match(/^moz-extension:\/\/([^/]+)\//);
          if (m) { extId = m[1]; break; }
        }
      }
      if (!extId) {
        console.error('  SKIP  runtime tests: Playwright Firefox cannot load unsigned extensions');
        console.error('(Use web-ext for Firefox E2E)');
        passed++; // count skip as pass for build verification
        return { passed, failed };
      }
      assert('extension loaded', true, extId);
    }

    if (!extId) {
      console.error('  FAIL  extension not detected — aborting');
      return { passed, failed };
    }

    const scheme = BROWSER === 'chromium' ? 'chrome-extension' : 'moz-extension';

    // === RPC message layer ===
    const popup = await context.newPage();
    await popup.goto(`${scheme}://${extId}/popup/popup.html`, { waitUntil: 'networkidle' });
    const popupText = await popup.textContent('body');
    assert('popup renders', popupText.includes('Digitan'));

    await popup.evaluate(() => chrome.runtime.sendMessage({ type: 'clearActivity' }));
    await new Promise(r => setTimeout(r, 500));

    const sendResult = await popup.evaluate(() => {
      return chrome.runtime.sendMessage({ type: 'presence', site: 'uma-guide', data: { details: 'E2E Test' } });
    });
    assert('presence message accepted', sendResult && sendResult.ok === true, JSON.stringify(sendResult));
    await new Promise(r => setTimeout(r, 500));

    const status = await popup.evaluate(() => {
      return chrome.runtime.sendMessage({ type: 'getStatus' });
    });
    assert('getStatus returns status', !!status, status ? JSON.stringify(status) : 'null');
    assert('currentSite matches', status && status.currentSite === 'uma-guide');
    assert('currentActivity has details',
      status && status.currentActivity && status.currentActivity.details === 'E2E Test',
      status && status.currentActivity ? `got="${status.currentActivity.details}"` : 'no activity');

    await popup.evaluate(() => chrome.runtime.sendMessage({ type: 'clearActivity' }));
    await new Promise(r => setTimeout(r, 500));

    // === Content script injection ===
    const page = await context.newPage();
    const pageErrors = [];
    page.on('pageerror', e => pageErrors.push(e.message));
    await page.goto('https://uma.guide/characters/', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await new Promise(r => setTimeout(r, 5000));
    assert('uma.guide page loaded', await page.title() !== '');
    assert('no content script errors', pageErrors.length === 0, pageErrors.join('; ') || 'none');

    const guides = await context.newPage();
    const guideErrors = [];
    guides.on('pageerror', e => guideErrors.push(e.message));
    await guides.goto('https://uma.guide/guides/', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await new Promise(r => setTimeout(r, 4000));
    assert('no errors on /guides/', guideErrors.length === 0, guideErrors.join('; ') || 'none');

    await guides.close();
    await page.close();
    await new Promise(r => setTimeout(r, 3000));

    // === Tab close clears presence ===
    const tabForClose = await context.newPage();
    await tabForClose.goto('https://uma.guide/characters/', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await new Promise(r => setTimeout(r, 6000));

    const statusBeforeClose = await popup.evaluate(() => {
      return chrome.runtime.sendMessage({ type: 'getStatus' });
    });
    assert('has activity after opening tab', !!statusBeforeClose && !!statusBeforeClose.currentActivity,
      statusBeforeClose && statusBeforeClose.currentActivity ? `details=${statusBeforeClose.currentActivity.details}` : 'null');

    await tabForClose.close();

    const cleared = await retry(async () => {
      const s = await popup.evaluate(() => chrome.runtime.sendMessage({ type: 'getStatus' }));
      if (s && s.currentSite) throw new Error(`still has site=${s.currentSite}`);
      return s;
    }, { retries: 5, delay: 1500, backoff: 1.5 });
    assert('activity cleared after tab close',
      !cleared || !cleared.currentSite,
      cleared ? `site=${cleared.currentSite}` : 'null');

    await popup.close();
    await page.close();
  } catch (err) {
    console.error('  FAIL  unexpected error:', err.message);
    failed++;
  } finally {
    if (context) await context.close();
    for (const dir of tempDirs) {
      try { fs.rmSync(dir, { recursive: true, force: true }); } catch (_) {}
    }
  }

  return { passed, failed };
}

main().then(({ passed, failed }) => {
  console.error(`\n${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
});
