## Short Description (132 chars)

Your browsing activity, journaled by a tiny digital otaku. Discord Rich Presence for Umamusume sites. All local, nothing leaves your machine.

---

## Detailed Description

Digitan's Journal puts the page you're reading on your Discord profile. It shows the site and section as a Rich Presence status, and it does it without sending anything to a third-party server.

### How It Works

When you visit a supported site, the extension reads lightweight metadata (page title, section name). This is sent via Chrome's native messaging to a small local host process, which forwards it directly to your local Discord client over IPC. No data ever touches the internet.

### Supported Sites

- **uma.guide** — Guides, character/support card details, skills, tracks, agenda planner
- **umalator.app** — Race simulator
- **gametora.com/umamusume** — Umamusume game data and tools
- **raggooneropen.web.app** — Umamusume tools

### Features

- **Auto-detection**: Content scripts adapt to each site's layout. SPAs that render client-side are handled by polling.
- **Per-site toggles**: Enable or disable individual sites from the settings page.
- **Privacy Mode**: Shows only "Browsing [site]" instead of the page title.
- **Idle Timeout**: Auto-clears your presence after a configurable period of inactivity.
- **Custom Templates**: Override the default presence text with `{title}`, `{page}`, `{total}`, and `{site}` placeholders.
- **Keyboard Shortcut**: Press `Alt+C` to clear your presence.
- **Connection Status**: The popup shows a wax-seal indicator, green for connected, amber for connecting, grey for disconnected, plus the current activity entry.
- **Auto-reconnect**: If the native host drops, the extension retries with exponential backoff (1s to 60s).

### Installation

1. Install dependencies: `npm install`, then `cd native-host && npm install`
2. Build the extension: `npm run build`
3. Load `dist/` unpacked from `chrome://extensions` (Developer Mode)
4. Register the native host: `node cli.js --install` in `native-host/`
5. Make sure Discord is running
6. Visit a supported site, and your presence appears

To update later, pull, run `npm run build` again, and hit reload on the extension card. The native host stays registered, since the extension ID is pinned rather than derived from the install path.

A standalone binary (`host.exe`) is also available. Build it with `npm run build` in `native-host/`, and no Node.js installation is needed afterward.

### What Data Is Collected

Only what Rich Presence needs: site name, page or section title, and a "started at" timestamp. No page content, credentials, cookies, or browsing history is read or transmitted.

Full data flow documentation is in the project's SECURITY.md.
