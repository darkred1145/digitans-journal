/**
 * Screenshot generation script for Chrome Web Store assets.
 *
 * Prerequisites:
 *   npm install playwright
 *   npx playwright install chromium
 *
 * Usage:
 *   node scripts/store-assets/generate-screenshots.js [path-to-extension-dir]
 *
 * Produces PNG files in store-assets/screenshots/:
 *   - screenshot-01-popup.png       (1280x800) — popup showing connected state
 *   - screenshot-02-uma-guide.png   (1280x800) — browsing uma.guide
 *   - screenshot-03-options.png     (1280x800) — settings page
 *   - screenshot-04-privacy.png     (1280x800) — privacy mode active
 *   - screenshot-05-templates.png   (1280x800) — custom template editing
 *   - promo-tile-small.png          (440x280)
 *   - promo-tile-large.png          (920x680)
 *   - promo-tile-marquee.png        (1400x560)
 */

const { chromium } = require('playwright');
const { existsSync, mkdirSync, rmSync, mkdtempSync } = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const ROOT_DIR = path.resolve(__dirname, '..', '..');
const EXT_PATH = process.argv[2] || ROOT_DIR;
const OUT_DIR = path.join(ROOT_DIR, 'store-assets', 'screenshots');

const SCREENSHOT_W = 1280;
const SCREENSHOT_H = 800;
const WAIT_EXTENSION_LOAD = 5000;
const WAIT_NAVIGATION = 3000;
const WAIT_RENDER = 500;

async function main() {
  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

  const tempDir = mkdtempSync(path.join(os.tmpdir(), 'dj-ss-'));
  const context = await chromium.launchPersistentContext(tempDir, {
    headless: false,
    args: [
      `--disable-extensions-except=${EXT_PATH}`,
      `--load-extension=${EXT_PATH}`,
      '--window-position=-10000,-10000',
      '--no-first-run',
      '--no-default-browser-check',
    ],
  });

  await new Promise(r => setTimeout(r, WAIT_EXTENSION_LOAD));
  const extId = await getExtensionId(context);
  console.log('Extension ID:', extId);

  try {
    const umaPage = await captureExtensionPopup(context, extId);
    await captureUmaGuide(umaPage);
    await captureOptionsPage(context, extId);
    await capturePrivacyMode(context, extId);
    await captureTemplates(context, extId);
    await capturePromoTile(context, extId, 'small');
    await capturePromoTile(context, extId, 'large');
    await capturePromoTile(context, extId, 'marquee');
    await umaPage.close();
  } finally {
    await context.close();
    try { rmSync(tempDir, { recursive: true, force: true }); }
    catch (e) { console.error('  WARN  temp cleanup failed:', e.message); }
  }

  console.log('\nAll assets generated in:', OUT_DIR);
}

async function captureScreenshot(page, name) {
  await page.screenshot({ path: path.join(OUT_DIR, name) });
  console.log(`\u2713 ${name}`);
}

async function captureExtensionPopup(context, extId) {
  const page = await context.newPage();
  await page.goto('https://uma.guide/', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(WAIT_NAVIGATION);

  const popupPage = await context.newPage();
  await popupPage.goto(`chrome-extension://${extId}/popup/popup.html`, { waitUntil: 'networkidle' });
  await popupPage.waitForTimeout(WAIT_RENDER);
  await popupPage.setViewportSize({ width: SCREENSHOT_W, height: SCREENSHOT_H });
  await captureScreenshot(popupPage, 'screenshot-01-popup.png');
  await popupPage.close();

  return page;
}

async function captureUmaGuide(page) {
  await page.goto('https://uma.guide/guides', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(2000);
  await captureScreenshot(page, 'screenshot-02-uma-guide.png');
}

async function captureOptionsPage(context, extId) {
  const page = await context.newPage();
  await page.goto(`chrome-extension://${extId}/options/options.html`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(WAIT_RENDER);
  await captureScreenshot(page, 'screenshot-03-options.png');
  await page.close();
}

async function setPrivacy(context, extId, enabled) {
  const p = await context.newPage();
  await p.goto(`chrome-extension://${extId}/popup/popup.html`, { waitUntil: 'networkidle' });
  await p.evaluate((val) => {
    chrome.storage.sync.set({ privacyMode: val });
  }, enabled);
  await p.close();
}

async function capturePrivacyMode(context, extId) {
  await setPrivacy(context, extId, true);

  const page = await context.newPage();
  await page.goto(`chrome-extension://${extId}/popup/popup.html`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(WAIT_RENDER);
  await captureScreenshot(page, 'screenshot-04-privacy.png');
  await page.close();

  await setPrivacy(context, extId, false);
}

async function captureTemplates(context, extId) {
  const page = await context.newPage();
  await page.goto(`chrome-extension://${extId}/options/options.html`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(WAIT_RENDER);
  await page.evaluate(() => {
    const details = document.querySelector('[data-site="gametora"] .template-details');
    const state = document.querySelector('[data-site="gametora"] .template-state');
    if (details) details.value = 'Reading about {title}';
    if (state) state.value = 'Section: {section}';
  });
  await captureScreenshot(page, 'screenshot-05-templates.png');
  await page.close();
}

async function capturePromoTile(context, extId, size) {
  const page = await context.newPage();
  await renderPromoPage(page, extId, size);
  await captureScreenshot(page, `promo-tile-${size}.png`);
  await page.close();
}

/**
 * Detect the extension ID from a launched browser context.
 * Checks service workers first, then falls back to page URLs.
 * @param {import('playwright').BrowserContext} context
 * @returns {Promise<string>}
 * @throws {Error} If extension ID cannot be detected
 */
async function getExtensionId(context) {
  for (const sw of context.serviceWorkers()) {
    const m = sw.url().match(/^chrome-extension:\/\/([^/]+)\//);
    if (m) return m[1];
  }
  for (const p of context.pages()) {
    const url = p.url();
    if (url.startsWith('chrome-extension://')) {
      return url.split('/')[2];
    }
  }
  throw new Error('Could not detect extension ID');
}

/**
 * Render a promotional landing page for a screenshot.
 * @param {import('playwright').Page} page
 * @param {string} extId - The extension ID
 * @param {'small'|'large'|'marquee'} size - Promo tile size variant
 */
async function renderPromoPage(page, extId, size) {
  const bg = '#1A1423';
  const pink = '#F37F96';
  const text = '#F0E8D8';
  const muted = '#9585A5';
  const titleSize = size === 'small' ? '28px' : '48px';
  const subtitleSize = size === 'small' ? '12px' : '18px';

  const dims = { small: '440x280', large: '920x680', marquee: '1400x560' };
  const [w, h] = dims[size].split('x').map(Number);
  await page.setViewportSize({ width: w, height: h });

  const iconUrl = `chrome-extension://${extId}/icons/icon128.png`;

  await page.setContent(`
    <!DOCTYPE html>
    <html style="color-scheme:dark">
    <head><meta charset="UTF-8">
    <link rel="preconnect" href="https://fonts.gstatic.com">
    <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
        width: 100%; height: 100%;
        background: ${bg};
        display: flex; flex-direction: column;
        align-items: center; justify-content: center;
        font-family: 'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        color: ${text};
        overflow: hidden;
      }
      .icon { width: ${size === 'small' ? '64px' : '96px'}; height: auto; margin-bottom: ${size === 'small' ? '12px' : '20px'}; }
      .icon { border-radius: ${size === 'small' ? '6px' : '10px'}; }
      h1 {
        font-family: 'Fredoka', 'Nunito', sans-serif;
        font-size: ${titleSize};
        font-weight: 600;
        letter-spacing: -0.3px;
      }
      .h1-pink { color: ${pink}; }
      p {
        font-size: ${subtitleSize};
        color: ${muted};
        margin-top: ${size === 'small' ? '4px' : '8px'};
        max-width: 80%;
        text-align: center;
      }
      .sub-accent { color: ${pink}; font-weight: 700; }
    </style>
    </head>
    <body>
      <img class="icon" src="${iconUrl}" alt="Digitan's Journal icon" onerror="this.style.display='none'">
      <h1><span class="h1-pink">Digitan's</span> Journal</h1>
      <p>Browsing activity as <span class="sub-accent">Discord Rich Presence</span></p>
      <p style="margin-top:${size === 'small' ? '2px' : '4px'};font-size:${size === 'small' ? '10px' : '14px'};color:rgba(149,133,165,0.4)">No data leaves your machine</p>
    </body>
    </html>
  `, { waitUntil: 'networkidle' });
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
