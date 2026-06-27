/**
 * Generates Discord Rich Presence asset images for the Developer Portal.
 *
 * Prerequisites:
 *   npm install playwright
 *   npx playwright install chromium
 *
 * Usage:
 *   node store-assets/generate-assets.js
 *
 * Produces:
 *   store-assets/assets/umaguide_small.png   (512×512)
 *   store-assets/assets/umalator_small.png   (512×512)
 *   store-assets/assets/cover-image.png      (1024×576)
 */

const { chromium } = require('playwright');
const { existsSync, mkdirSync, readFileSync } = require('fs');
const path = require('path');

const OUT_DIR = path.resolve(__dirname, 'assets');
const SRC_DIR = __dirname;
const ROOT_DIR = path.resolve(__dirname, '..');

const ASSET_SIZE = 512;
const COVER_W = 1024;
const COVER_H = 576;

// Extension brand colors (from popup/options CSS)
const BG = '#0E0C17';
const SURFACE = '#1B1728';
const BORDER = '#2C2740';
const TEXT = '#E8E0D0';
const MUTED = '#63597A';
const ACCENT = '#E35D6B';

async function main() {
  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext();

  try {
    // ── umaguide_small (512×512) ──
    const umaFavicon = readFileSync(path.join(SRC_DIR, 'src-umaguide-favicon.png'));
    const umaB64 = umaFavicon.toString('base64');

    const umaPage = await ctx.newPage();
    await umaPage.setViewportSize({ width: ASSET_SIZE, height: ASSET_SIZE });
    await umaPage.setContent(`
      <!DOCTYPE html>
      <html style="color-scheme:dark"><head><meta charset="UTF-8">
      <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        body {
          width: ${ASSET_SIZE}px; height: ${ASSET_SIZE}px;
          background: ${SURFACE};
          display: flex; align-items: center; justify-content: center;
          border: 1px solid ${BORDER};
        }
        img { width: 60%; height: 60%; object-fit: contain; border-radius: 12px; }
      </style></head>
      <body>
        <img src="data:image/png;base64,${umaB64}" alt="uma.guide">
      </body></html>
    `, { waitUntil: 'networkidle' });
    await umaPage.screenshot({ path: path.join(OUT_DIR, 'umaguide_small.png') });
    await umaPage.close();
    console.log('✓ umaguide_small.png (512×512)');

    // ── umalator_small (512×512) ──
    const umalatorSvg = readFileSync(path.join(SRC_DIR, 'src-umalator-favicon.svg'), 'utf-8');
    const umalatorB64 = Buffer.from(umalatorSvg).toString('base64');

    const umaPage2 = await ctx.newPage();
    await umaPage2.setViewportSize({ width: ASSET_SIZE, height: ASSET_SIZE });
    await umaPage2.setContent(`
      <!DOCTYPE html>
      <html style="color-scheme:dark"><head><meta charset="UTF-8">
      <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        body {
          width: ${ASSET_SIZE}px; height: ${ASSET_SIZE}px;
          background: ${SURFACE};
          display: flex; align-items: center; justify-content: center;
          border: 1px solid ${BORDER};
        }
        svg { width: 60%; height: 60%; }
      </style></head>
      <body>
        <div style="width:60%;height:60%;display:flex;align-items:center;justify-content:center">
          <img src="data:image/svg+xml;base64,${umalatorB64}" alt="umalator" style="width:100%;height:100%;object-fit:contain">
        </div>
      </body></html>
    `, { waitUntil: 'networkidle' });
    await umaPage2.screenshot({ path: path.join(OUT_DIR, 'umalator_small.png') });
    await umaPage2.close();
    console.log('✓ umalator_small.png (512×512)');

    // ── Cover Image (1024×576) ──
    const iconPng = readFileSync(path.join(ROOT_DIR, 'icons', 'icon128.png'));
    const iconB64 = iconPng.toString('base64');

    const coverPage = await ctx.newPage();
    await coverPage.setViewportSize({ width: COVER_W, height: COVER_H });
    await coverPage.setContent(`
      <!DOCTYPE html>
      <html style="color-scheme:dark"><head><meta charset="UTF-8">
      <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        body {
          width: ${COVER_W}px; height: ${COVER_H}px;
          background: linear-gradient(135deg, ${BG} 0%, ${SURFACE} 60%, ${BG} 100%);
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          font-family: 'Georgia', serif;
          color: ${TEXT};
          overflow: hidden;
          position: relative;
        }
        .accent-bar {
          position: absolute; top: 0; left: 0; right: 0;
          height: 4px;
          background: linear-gradient(90deg, transparent, ${ACCENT}33, ${ACCENT}, ${ACCENT}33, transparent);
        }
        .icon { width: 96px; height: 96px; border-radius: 50%; margin-bottom: 16px; }
        h1 {
          font-family: 'Georgia', serif;
          font-style: italic;
          font-size: 52px;
          font-weight: 700;
          letter-spacing: -0.5px;
          color: ${TEXT};
        }
        .subtitle {
          font-size: 20px;
          color: ${MUTED};
          margin-top: 8px;
          letter-spacing: 1px;
        }
        .accent { color: ${ACCENT}; font-weight: 700; }
        .pill {
          margin-top: 24px;
          display: inline-flex; align-items: center; gap: 8px;
          padding: 8px 20px;
          border: 1px solid ${BORDER};
          border-radius: 999px;
          font-size: 14px;
          color: ${MUTED};
        }
        .pill-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: #4CC48A;
        }
        .footer {
          position: absolute; bottom: 24px;
          font-size: 12px;
          color: #3D3855;
          letter-spacing: 2px;
          text-transform: uppercase;
        }
      </style></head>
      <body>
        <div class="accent-bar"></div>
        <img class="icon" src="data:image/png;base64,${iconB64}" alt="Digitan's Journal">
        <h1>Digitan's Journal</h1>
        <p class="subtitle">Browsing activity as <span class="accent">Discord Rich Presence</span></p>
        <div class="pill">
          <span class="pill-dot"></span>
          No data leaves your machine
        </div>
        <div class="footer">uma.guide · umalator · gametora · raggooner · nhentai</div>
      </body></html>
    `, { waitUntil: 'networkidle' });
    await coverPage.screenshot({ path: path.join(OUT_DIR, 'cover-image.png') });
    await coverPage.close();
    console.log('✓ cover-image.png (1024×576)');

  } finally {
    await browser.close();
  }

  console.log('\nAll assets generated in:', OUT_DIR);
  console.log('Upload these to the Discord Developer Portal > Rich Presence > Art Assets');
}

main().catch(err => { console.error(err); process.exit(1); });
