/**
 * Generates Discord Rich Presence asset images for the Developer Portal.
 *
 * Prerequisites:
 *   npm install playwright
 *   npx playwright install chromium
 *
 * Usage:
 *   node scripts/store-assets/generate-assets.js
 *
 * Produces:
 *   store-assets/assets/umaguide_small.png   (512×512)
 *   store-assets/assets/umalator_small.png   (512×512)
 *   store-assets/assets/cover-image.png      (1024×576)
 */

const { chromium } = require('playwright');
const { existsSync, mkdirSync, readFileSync } = require('fs');
const path = require('path');

const STORE_DIR = path.resolve(__dirname, '..', '..', 'store-assets');
const OUT_DIR = path.join(STORE_DIR, 'assets');
const SRC_DIR = STORE_DIR;
const ROOT_DIR = path.resolve(STORE_DIR, '..');

const ASSET_SIZE = 512;
const COVER_W = 1024;
const COVER_H = 576;

// Extension brand colors (from popup/options CSS)
const BG = '#1A1423';
const SURFACE = '#271E33';
const BORDER = '#3D2E4A';
const TEXT = '#F0E8D8';
const TEXT_SECONDARY = '#C4B5CB';
const MUTED = '#9585A5';
const PINK = '#F37F96';
const PINK_GLOW = 'rgba(243,127,150,0.2)';
const YELLOW = '#F9F189';

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
      <link rel="preconnect" href="https://fonts.gstatic.com">
      <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;500;600;700;800&display=swap" rel="stylesheet">
      <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        body {
          width: ${COVER_W}px; height: ${COVER_H}px;
          background:
            radial-gradient(ellipse 120% 50% at 50% -10%, ${PINK_GLOW} 0%, transparent 65%),
            radial-gradient(ellipse 80% 40% at 20% 105%, rgba(249,241,137,0.04) 0%, transparent 50%),
            linear-gradient(135deg, ${BG} 0%, ${SURFACE} 60%, ${BG} 100%);
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          font-family: 'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          color: ${TEXT};
          overflow: hidden;
          position: relative;
        }
        .pink-bar {
          position: absolute; top: 0; left: 0; right: 0;
          height: 4px;
          background: linear-gradient(90deg, transparent, ${PINK}44, ${PINK}, ${PINK}44, transparent);
        }
        .icon-wrap {
          width: 96px; height: 96px;
          border-radius: 20px;
          background: linear-gradient(135deg, ${PINK}, #D46078);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 20px ${PINK_GLOW};
          margin-bottom: 18px;
        }
        .icon-wrap img { width: 68px; height: 68px; border-radius: 4px; }
        h1 {
          font-family: 'Fredoka', 'Nunito', sans-serif;
          font-size: 52px;
          font-weight: 600;
          letter-spacing: -0.5px;
          color: ${TEXT};
        }
        .h1-pink { color: ${PINK}; }
        .subtitle {
          font-size: 20px;
          color: ${TEXT_SECONDARY};
          margin-top: 6px;
          font-weight: 400;
        }
        .sub-accent { color: ${PINK}; font-weight: 700; }
        .pill {
          margin-top: 26px;
          display: inline-flex; align-items: center; gap: 8px;
          padding: 10px 22px;
          border: 2px solid ${BORDER};
          border-radius: 999px;
          font-size: 14px;
          font-weight: 500;
          color: ${MUTED};
          background: rgba(39,30,51,0.6);
        }
        .pill-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: #6CD4A0;
          box-shadow: 0 0 6px rgba(108,212,160,0.4);
        }
        .footer {
          position: absolute; bottom: 24px;
          font-size: 12px;
          color: rgba(149,133,165,0.35);
          letter-spacing: 2px;
          text-transform: uppercase;
          font-weight: 500;
        }
      </style></head>
      <body>
        <div class="pink-bar"></div>
        <div class="icon-wrap">
          <img src="data:image/png;base64,${iconB64}" alt="Digitan's Journal">
        </div>
        <h1><span class="h1-pink">Digitan's</span> Journal</h1>
        <p class="subtitle">Browsing activity as <span class="sub-accent">Discord Rich Presence</span></p>
        <div class="pill">
          <span class="pill-dot"></span>
          No data leaves your machine
        </div>
        <div class="footer">uma.guide · umalator · gametora · raggooner</div>
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
