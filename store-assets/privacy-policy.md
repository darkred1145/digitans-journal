# Privacy Policy for Digitan's Journal

*Last updated: June 2026*

## Data Collection

Digitan's Journal collects only the information necessary to display Discord Rich Presence:

- **Site name** — the domain of the supported site you are visiting (e.g., "uma.guide")
- **Page or section title** — the human-readable title of the page or section you are viewing (e.g., "Special Week — Character Detail")
- **Timestamp** — when you started viewing the page

This data is extracted from the page's DOM metadata (title element, heading elements). The extension never reads:
- Page body text, images, or media
- Form inputs, credentials, or cookies
- Browsing history or navigation outside supported sites
- Any content on non-supported sites

## Data Usage

The collected information is used solely to construct a Discord Rich Presence status object, which is sent through your local machine's Discord IPC socket. This is the same mechanism Discord's own client uses to communicate with locally running games.

## Data Sharing

**No data is shared with any third party.** The entire data path is:

```
Browser Extension → Native Messaging (stdin/stdout) → Local Host Process → Discord IPC (local socket)
```

No external servers, analytics services, or remote endpoints are contacted. The native host process does not expose any network ports and cannot receive remote connections.

## Data Storage

The extension does not store any personally identifiable information on disk. Presence data exists only ephemerally in memory while you are actively visiting a supported site. A small amount of non-identifying state (connection status, extension settings) is stored in `chrome.storage.sync` solely for extension functionality and is not accessible to any external service.

## Third-Party Services

The only external software involved is the Discord desktop client itself, which runs locally on your machine. Discord's handling of data received via Rich Presence is governed by Discord's own privacy policy.

## Changes

If this policy changes, the version date at the top will be updated. Since the extension is loaded unpacked, users should check this page periodically for any updates.

## Contact

For questions about this privacy policy or the extension's data practices, open an issue at the project repository.
