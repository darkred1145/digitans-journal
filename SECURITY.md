# Security

## Data Flow

1. **Browser → Extension**: Content scripts read page metadata (URL, title, section) from supported sites. No credentials, cookies, or page content is collected.
2. **Extension → Native Host**: A presence object (details, state, image keys) is sent via `chrome.runtime.sendMessage` to the service worker, then forwarded over native messaging (`stdin/stdout`) to `host.exe`.
3. **Native Host → Discord**: The host process connects to Discord's local IPC socket and calls `setActivity()` with the presence data. This never leaves your machine.
4. **No external servers**: No data is sent to any third-party server. The extension communicates exclusively with a local process, which communicates exclusively with the local Discord client.

## What Data Is Transmitted

- Site name and section (e.g., "Cancer Cup (CM15) | uma.guide")
- A timestamp for "started at"
- Image keys for Discord Rich Presence assets

## What Data Is NOT Collected

- Page content, text, images, or media
- Form data, credentials, or cookies
- Personal identifiers beyond your Discord user ID (received from Discord's RPC, not sent by the extension)
- Browsing history (presence is sent only while actively visiting a supported site)

## Native Host

The native messaging host (`host.exe` or `host.js`) runs as a local process on your machine. It does not expose any network ports, does not accept remote connections, and has no persistent storage beyond the native messaging manifest.
