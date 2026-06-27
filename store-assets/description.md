## Short Description (132 chars)

Your browsing activity, journaled by a tiny digital otaku. Discord Rich Presence for Umamusume sites — all local, no data leaves your machine.

---

## Detailed Description

Digitan's Journal bridges your browser and Discord, displaying the site or page you're currently viewing as a Rich Presence status — all without sending data to any third-party server.

### How It Works

When you visit a supported site, the extension reads lightweight metadata (page title, section name). This is sent via Chrome's native messaging to a small local host process, which forwards it directly to your local Discord client over IPC. **No data ever touches the internet.** The entire pipeline stays on your machine.

### Supported Sites

- **uma.guide** — Guides, character/support card details, skills, tracks, agenda planner
- **umalator.app** — Race simulator
- **gametora.com/umamusume** — Umamusume game data and tools
- **raggooneropen.web.app** — Umamusume tools
- **nhentai.net** — Gallery browsing

### Features

- **Auto-detection**: Content scripts adapt to each site's layout — SPAs that render content client-side are handled via polling.
- **Per-site toggles**: Enable or disable individual sites from the settings page.
- **Privacy Mode**: Shows only "Browsing [site]" instead of the specific page title.
- **Idle Timeout**: Auto-clears your presence after a configurable period of inactivity.
- **Custom Templates**: Override the default presence text using `{title}`, `{page}`, `{total}`, and `{site}` placeholders.
- **Keyboard Shortcut**: Press `Alt+C` to clear your presence instantly.
- **Connection Status**: The popup shows a wax-seal indicator — green for connected, amber for connecting, grey for disconnected — plus the current activity entry.
- **Auto-reconnect**: If the native host disconnects, the extension retries with exponential backoff (1s–60s).

### Installation

1. Install native dependencies: `cd native-host && npm install`
2. Load the extension unpacked from `chrome://extensions` (Developer Mode)
3. Register the native host: `node cli.js --install` in `native-host/`
4. Make sure Discord is running
5. Visit a supported site — your presence appears automatically

A standalone binary (`host.exe`) is also available — build it with `npm run build` in `native-host/`, then no Node.js installation is required.

### What Data Is Collected

Only the minimal information needed for Rich Presence: site name, page/section title, and a "started at" timestamp. No page content, credentials, cookies, or browsing history is ever read or transmitted.

Full data flow documentation is in the project's SECURITY.md.
