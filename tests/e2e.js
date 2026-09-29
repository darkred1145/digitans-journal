const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');
const { chromium } = require('playwright');
const { retry } = require('./helpers/retry');

const ROOT = path.resolve(__dirname, '..');
// dist/ is the loadable extension, and pretest:e2e builds it first
const EXT = path.join(ROOT, 'dist');
const SCREENSHOTS = path.join(ROOT, 'test-results');

const SCHEME = 'chrome-extension';

const WAIT_EXTENSION_LOAD = 2000;
const WAIT_RENDER = 500;

function screenshotPath(name) {
  fs.mkdirSync(SCREENSHOTS, { recursive: true });
  return path.join(SCREENSHOTS, `${Date.now()}-${name}.png`);
}

async function screenshot(page, name) {
  try { await page.screenshot({ path: screenshotPath(name), fullPage: true }); }
  catch {}
}

let passed = 0;
let failed = 0;

function assert(label, ok, detail) {
  const status = ok ? 'PASS' : 'FAIL';
  console.error(`  ${status}  ${label}${detail !== undefined ? ': ' + detail : ''}`);
  if (ok) passed++; else failed++;
}

async function main() {
  const tempDirs = [];
  let context;
  let extId = null;

  try {
    context = await setupChromium(tempDirs);
    extId = detectChromiumExtId(context);
    assert('extension ID detected', !!extId, extId || 'null');
    assert('service worker registered', !!extId);

    if (!extId) {
      console.error('  FAIL  extension not detected, aborting');
      return { passed, failed };
    }

    const popup = await context.newPage();
    await popup.goto(`${SCHEME}://${extId}/popup/popup.html`, { waitUntil: 'networkidle' });
    const popupText = await popup.textContent('body');
    assert('popup renders', popupText.includes('Digitan'));
    await screenshot(popup, 'popup');

    await testRPCMessageLayer(popup, context, extId);
    await testOptionsPage(context, extId);
    await testContentScripts(context);
    await testTabClose(context, popup);
    await popup.close();
  } catch (err) {
    console.error('  FAIL  unexpected error:', err.message);
    if (context) {
      try {
        const p = await context.newPage();
        const id = extId || 'unknown';
        await p.goto(`${SCHEME}://${id}/popup/popup.html`, { waitUntil: 'networkidle', timeout: 5000 }).catch(() => {});
        await screenshot(p, 'failure-popup');
        await p.goto(`${SCHEME}://${id}/options/options.html`, { waitUntil: 'networkidle', timeout: 5000 }).catch(() => {});
        await screenshot(p, 'failure-options');
        await p.close();
      } catch {}
    }
    failed++;
  } finally {
    if (context) await context.close();
    for (const dir of tempDirs) {
      try { fs.rmSync(dir, { recursive: true, force: true }); }
      catch (e) { console.error('  WARN  temp cleanup failed:', e.message); }
    }
  }

  return { passed, failed };
}

async function setupChromium(tempDirs) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dj-e2e-'));
  tempDirs.push(tempDir);
  const context = await chromium.launchPersistentContext(tempDir, {
    headless: false,
    args: [
      `--disable-extensions-except=${EXT}`,
      `--load-extension=${EXT}`,
      '--no-first-run',
      '--no-default-browser-check',
    ],
  });
  await new Promise(r => setTimeout(r, WAIT_EXTENSION_LOAD));
  return context;
}

function detectChromiumExtId(context) {
  for (const w of context.serviceWorkers()) {
    const m = w.url().match(/^chrome-extension:\/\/([^/]+)\//);
    if (m) return m[1];
  }
  return null;
}

async function testRPCMessageLayer(popup, context, extId) {
  await popup.evaluate(() => chrome.runtime.sendMessage({ type: 'clearActivity' }));
  await new Promise(r => setTimeout(r, WAIT_RENDER));

  const sendResult = await popup.evaluate(() => {
    return chrome.runtime.sendMessage({ type: 'presence', site: 'uma-guide', data: { details: 'E2E Test' } });
  });
  assert('presence message accepted', sendResult && sendResult.ok === true, JSON.stringify(sendResult));
  await new Promise(r => setTimeout(r, WAIT_RENDER));

  const status = await popup.evaluate(() => {
    return chrome.runtime.sendMessage({ type: 'getStatus' });
  });
  assert('getStatus returns status', !!status, status ? JSON.stringify(status) : 'null');
  assert('currentSite matches', status && status.currentSite === 'uma-guide');
  assert('currentActivity has details',
    status && status.currentActivity && status.currentActivity.details === 'E2E Test',
    status && status.currentActivity ? `got="${status.currentActivity.details}"` : 'no activity');

  await popup.evaluate(() => chrome.runtime.sendMessage({ type: 'clearActivity' }));
  await new Promise(r => setTimeout(r, WAIT_RENDER));

  const popup2 = await context.newPage();
  await popup2.goto(`${SCHEME}://${extId}/popup/popup.html`, { waitUntil: 'networkidle' });
  const sealHtml = await popup2.evaluate(() => {
    const seal = document.getElementById('seal');
    const dot = document.getElementById('sealDot');
    return {
      sealStatus: seal ? seal.dataset.status : null,
      dotClass: dot ? dot.className : null,
      statusText: document.getElementById('statusText')?.textContent?.trim(),
      hint: document.querySelector('.hint')?.textContent?.trim(),
    };
  });

  assert('seal data-status is valid',
    ['connected', 'disconnected', 'connecting'].includes(sealHtml.sealStatus),
    `seal="${sealHtml.sealStatus}"`);
  assert('seal dot reflects state',
    ['connected', 'disconnected', 'connecting'].some(p => sealHtml.dotClass?.includes(p)),
    `dot="${sealHtml.dotClass}"`);
  assert('status text is non-empty',
    (sealHtml.statusText || '').length > 0,
    `text="${sealHtml.statusText}"`);
  assert('keyboard hint shows Alt+C',
    (sealHtml.hint || '').includes('Alt + C'),
    `hint="${sealHtml.hint}"`);

  await screenshot(popup2, 'popup-after-clear');
  await popup2.close();
}

async function testOptionsPage(context, extId) {
  const page = await context.newPage();
  await page.goto(`${SCHEME}://${extId}/options/options.html`, { waitUntil: 'networkidle' });
  await screenshot(page, 'options-page');

  const titleText = await page.textContent('.page-title');
  assert('options title shows Digitan', titleText.includes('Digitan'), titleText);

  const masterChecked = await page.isChecked('#masterToggle');
  assert('master toggle defaults to enabled', masterChecked === true);

  await page.waitForSelector('#site-gametora', { state: 'attached', timeout: 5000 });
  const siteIds = ['gametora', 'raggooner', 'uma-guide', 'umalator'];
  for (const id of siteIds) {
    const slider = await page.isVisible(`#site-${id} + .slider`);
    assert(`site toggle "${id}" visible`, slider);
  }

  const timeoutVal = await page.inputValue('#idleTimeout');
  assert('idle timeout defaults to 0', timeoutVal === '0', `got="${timeoutVal}"`);

  const privacyChecked = await page.isChecked('#privacyMode');
  assert('privacy mode defaults to off', privacyChecked === false);

  const extIdText = (await page.textContent('#extId')).trim();
  assert('extension ID displayed', extIdText.length > 0, extIdText);
  assert('extension ID is 32-char hex', /^[a-z0-9]{32}$/.test(extIdText), extIdText);

  await page.click('#masterToggle + .slider');
  await new Promise(r => setTimeout(r, WAIT_RENDER));
  assert('master toggle turns off', !(await page.isChecked('#masterToggle')));

  await page.click('#masterToggle + .slider');
  await new Promise(r => setTimeout(r, WAIT_RENDER));
  assert('master toggle turns back on', await page.isChecked('#masterToggle'));

  await page.click('#privacyMode + .slider');
  await new Promise(r => setTimeout(r, WAIT_RENDER));
  assert('privacy mode turns on', await page.isChecked('#privacyMode'));

  await page.click('#privacyMode + .slider');
  await new Promise(r => setTimeout(r, WAIT_RENDER));
  assert('privacy mode turns off', !(await page.isChecked('#privacyMode')));

  await page.fill('#idleTimeout', '15');
  await page.dispatchEvent('#idleTimeout', 'change');
  await new Promise(r => setTimeout(r, WAIT_RENDER));
  assert('idle timeout persists', await page.inputValue('#idleTimeout') === '15');

  await page.fill('#idleTimeout', '0');
  await page.dispatchEvent('#idleTimeout', 'change');
  await new Promise(r => setTimeout(r, WAIT_RENDER));
  assert('idle timeout resets', await page.inputValue('#idleTimeout') === '0');

  // Flip a setting and wait for the toast
  const toastResult = await page.evaluate(async () => {
    const el = document.getElementById('saveStatus');
    if (!el) return 'NO_EL';
    document.querySelector('#masterToggle + .slider').click();
    for (let i = 0; i < 30; i++) {
      if (el.textContent === 'Saved') return 'Saved';
      await new Promise(r => setTimeout(r, 100));
    }
    return el.textContent || '(empty)';
  });
  assert('save toast shown', toastResult === 'Saved', `got="${toastResult}"`);

  // Put the master toggle back
  await page.click('#masterToggle + .slider');
  await new Promise(r => setTimeout(r, WAIT_RENDER));

  await page.waitForSelector('[data-site="gametora"] .template-details', { timeout: 5000 });
  const tmplDetails = page.locator('[data-site="gametora"] .template-details');
  const tmplState = page.locator('[data-site="gametora"] .template-state');
  await tmplDetails.fill('Viewing {title} on {site}');
  await tmplDetails.dispatchEvent('change');
  await new Promise(r => setTimeout(r, WAIT_RENDER));
  assert('template details set',
    await tmplDetails.inputValue() === 'Viewing {title} on {site}');

  await tmplState.fill('Page {page} of {total}');
  await tmplState.dispatchEvent('change');
  await new Promise(r => setTimeout(r, WAIT_RENDER));
  assert('template state set',
    await tmplState.inputValue() === 'Page {page} of {total}');

  await tmplDetails.fill('');
  await tmplDetails.dispatchEvent('change');
  await tmplState.fill('');
  await tmplState.dispatchEvent('change');
  await new Promise(r => setTimeout(r, WAIT_RENDER));

  await page.close();
}

async function testContentScripts(context) {
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', e => pageErrors.push(e.message));
  await page.goto('https://uma.guide/characters/', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await new Promise(r => setTimeout(r, 5000));
  assert('uma.guide page loaded', await page.title() !== '');
  assert('no content script errors', pageErrors.length === 0, pageErrors.join('; ') || 'none');
  await screenshot(page, 'uma-guide-characters');

  const guides = await context.newPage();
  const guideErrors = [];
  guides.on('pageerror', e => guideErrors.push(e.message));
  await guides.goto('https://uma.guide/guides/', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await new Promise(r => setTimeout(r, 4000));
  assert('no errors on /guides/', guideErrors.length === 0, guideErrors.join('; ') || 'none');

  await guides.close();
  await page.close();
  await new Promise(r => setTimeout(r, 3000));
}

async function testTabClose(context, popup) {
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
}

main().then(({ passed, failed }) => {
  console.error(`\n${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}).catch(err => {
  console.error('  FAIL  fatal error:', err.message);
  console.error(`\n0 passed, 1 failed`);
  process.exit(1);
});
