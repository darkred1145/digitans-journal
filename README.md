# Digitan's Journal

A browser extension that shows what you're browsing as Discord Rich Presence.

## Architecture

Extension (Manifest V3) → Native Messaging Host (Node.js) → Discord RPC (IPC)

## Installation

1. **Install Node.js dependencies**

   ```bash
   cd agnes-digital-extension/native-host
   npm install
   ```

2. **Load the extension in Chrome**

   - Go to `chrome://extensions`
   - Enable Developer Mode
   - Click "Load unpacked"
   - Select the `agnes-digital-extension` folder
   - Copy the extension ID shown on the card

3. **Install the native host**

   - Run `native-host/install-host.bat` as Administrator
   - Paste the extension ID when prompted

4. **Make sure Discord is running**

5. **Visit a supported site** — the extension will automatically show your presence

## Uninstall

- Remove the extension from `chrome://extensions`
- Delete the registry key: `HKCU\Software\Google\Chrome\NativeMessagingHosts\com.digitansjournal.rpc`
- Delete the `agnes-digital-extension` folder

## Manual Registration

If the installer fails, you can manually create a registry key:

```
HKEY_CURRENT_USER\Software\Google\Chrome\NativeMessagingHosts\com.digitansjournal.rpc
Default value: full path to com.digitansjournal.rpc.json
```

And update `allowed_origins` in the JSON with your extension ID.
