# Digitan's Journal

A browser extension that shows what you're browsing as Discord Rich Presence.

## Architecture

```
Extension (Manifest V3) ↔ Native Messaging (stdin/stdout) ↔ Host Process (Node.js or standalone binary) ↔ Discord RPC (IPC)
```

The extension communicates with a local host process via Chrome's native messaging protocol — no WebSocket server, no manual startup needed.

## Installation

### 1. Get the host binary

Download `host.exe` from [Releases](https://github.com/darkred1145/digitans-journal/releases).

To build from source instead (requires Node.js):

```bash
cd native-host
npm install && npm run build
```

### 2. Load the extension

- **Chrome / Edge / other Chromium browsers:** Go to `chrome://extensions` (or `edge://extensions`), enable Developer Mode, click "Load unpacked", select the project folder

> **Note:** Firefox is not supported (different native messaging implementation).

### 3. Register the native host (one-time)

```batch
native-host\host.exe --install
```

This auto-detects your extension ID, writes the native manifest, and registers in the registry. Your browser will now auto-start the bridge whenever the extension needs it.

If auto-detection fails, pass the extension ID manually:

```batch
native-host\host.exe --install <extension-id>
```

You can find your extension ID on the extensions page (`chrome://extensions` or `edge://extensions` with Developer Mode on).

> **Development:** If you don't have the binary, use `node host.js --install` from the `native-host` directory instead.

### 4. Make sure Discord is running

### 5. Visit a supported site

The extension will automatically show your presence on Discord.

## Uninstall

```batch
native-host\host.exe --uninstall
```

Then remove the extension from your browser and delete the project folder.

> **Development:** Use `node host.js --uninstall` if running without the binary.

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
# Run the e2e smoke test (loads extension in headed Chromium)
npm install
npx playwright install chromium
npm run test:e2e

# Build standalone host binary
cd native-host
npm install
npm run build
```
