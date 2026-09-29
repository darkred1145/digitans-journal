# Privacy Policy for Digitan's Journal

*Last updated: June 2026*

## Data Collection

Digitan's Journal collects only the information necessary to display Discord Rich Presence:

- **Site name** — the domain of the supported site you are visiting (e.g., "uma.guide")
- **Page or section title** — the human-readable title of the page or section you are viewing (e.g., "Special Week — Character Detail")
- **Timestamp** — when you started viewing the page

This data comes from the page's DOM metadata (title element, heading elements). The extension never reads:

- Page body text, images, or media
- Form inputs, credentials, or cookies
- Browsing history or navigation outside supported sites
- Any content on non-supported sites

## Data Usage

The collected information is used only to build a Discord Rich Presence status object, which is sent through your machine's Discord IPC socket. This is the same mechanism Discord's own client uses to talk to locally running games.

## Data Sharing

No data is shared with any third party. The whole path is:

```
Browser Extension → Native Messaging (stdin/stdout) → Local Host Process → Discord IPC (local socket)
```

No external servers, analytics services, or remote endpoints are contacted. The native host process opens no network ports and cannot receive remote connections.

## Data Storage

The extension does not store personally identifiable information on disk. Presence data exists only in memory, and only while you are on a supported site. A small amount of non-identifying state (connection status, extension settings) is kept in `chrome.storage.sync` for the extension to work, and no external service can read it.

## Third-Party Services

The only external software involved is the Discord desktop client, which runs on your machine. Discord's handling of data received via Rich Presence is covered by Discord's own privacy policy.

## Changes

If this policy changes, the version date at the top is updated. The extension is loaded unpacked rather than installed from a store, so check this page after updating.

## Contact

For questions about this privacy policy or the extension's data practices, open an issue at the project repository.
