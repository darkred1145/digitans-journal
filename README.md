# Digitan's Journal

A browser extension that shows what you're browsing as Discord Rich Presence. Supports **Chrome** (Manifest V3), **Firefox** (Manifest V2), and other Chromium-based browsers (Edge, Brave, Vivaldi).

## Architecture

```
Extension (MV3 Chrome / MV2 Firefox) ↔ Native Messaging (stdin/stdout) ↔ Host Process (Node.js or standalone binary) ↔ Discord RPC (IPC)
```

The extension communicates with a local host process via native messaging protocol — no WebSocket server, no manual startup needed.

## Building

The build script accepts a `--target` flag:

```bash
npm run build              # Chrome MV3 (default)
npm run build -- --target firefox  # Firefox MV2
```

For Chrome, the polyfill is inlined into bundles. For Firefox, the manifest loads `browser-polyfill.js` as a separate script entry. Both produce output in `dist/`.

## Installation

### 1. Install dependencies

```bash
cd native-host
npm install
```

### 2. Load the extension

- **Chrome / Edge / Brave / Chromium:** Go to `chrome://extensions`, enable Developer Mode, click "Load unpacked", select the project folder
- **Firefox:** Go to `about:debugging#/runtime/this-firefox`, click "Load Temporary Add-on…", select `dist/manifest.json` (must be built with `--target firefox` first)

### 3. Register the native host (one-time)

**Chrome and Chromium browsers:**

```bash
cd native-host
node cli.js --install
```

This auto-detects your extension ID, writes the native manifest, and registers in the registry.

If auto-detection fails, pass the extension ID manually:

```bash
node cli.js --install <extension-id>
```

You can find your extension ID on the extensions page (`chrome://extensions` with Developer Mode on).

**Firefox:**

```bash
cd native-host
node cli.js --install <gecko-addon-id> --browser firefox
```

The Gecko add-on ID is `digitans-journal@darkred1145` (defined in `manifest.firefox.json`).

> **Standalone binary:** If you've built `host.exe` (`npm run build` in `native-host`), use `native-host\host.exe --install` instead — no Node.js needed after that.

### 4. Make sure Discord is running

### 5. Visit a supported site

The extension will automatically show your presence on Discord.

## Uninstall

```bash
cd native-host
node cli.js --uninstall
```

Then remove the extension from your browser and delete the project folder.

## Supported Sites

- nhentai.net
- gametora.com/umamusume
- raggooneropen.web.app
- uma.guide
- umalator.app

## Configuration

Right-click the extension icon and select "Options" to:

- Enable/disable the extension or specific sites
- Set an idle timeout to auto-clear presence
- Enable privacy mode
- Customize presence text with templates

## Keyboard Shortcut

- `Alt+C` — Clear current activity

## Development

```bash
# Build for Chrome (default)
npm run build

# Build for Firefox
npm run build -- --target firefox

# Run unit tests
npm test

# Run the e2e smoke test (loads extension in headed Chromium)
npm install
npx playwright install chromium
npm run test:e2e

# Build standalone host.exe (no Node.js needed after this)
cd native-host
npm run build
```

### Cross-browser compatibility

All extension code uses `browser.*` APIs via [webextension-polyfill](https://github.com/mozilla/webextension-polyfill), which wraps `chrome.*` callbacks into Promises and normalizes API differences. The polyfill is automatically prepended to all bundles during build.

- Chrome bundle: polyfill inlined (service worker loads a single file)
- Firefox bundle: polyfill listed separately in the manifest scripts array
- HTML pages (popup, options): load polyfill as a separate `<script>` tag
