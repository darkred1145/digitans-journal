# Graph Report - .  (2026-07-11)

## Corpus Check
- Corpus is ~33,952 words - fits in a single context window. You may not need a graph.

## Summary
- 271 nodes · 338 edges · 25 communities (21 shown, 4 thin omitted)
- Extraction: 90% EXTRACTED · 10% INFERRED · 0% AMBIGUOUS · INFERRED: 35 edges (avg confidence: 0.7)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Extension Manifest
- Native Host CLI
- Brand & UI Identity
- Presence Formatting Tests
- Build & Dependencies
- RPC Protocol & Host
- Build Pipeline
- Native Host Package
- State Manager
- RPC Manager
- Options Page Logic
- Screenshot Generation
- Asset Generation
- E2E Testing
- Background Script
- Raggooner Content Script
- uma.guide Content Script
- Popup Logic
- Shared Settings

## God Nodes (most connected - your core abstractions)
1. `Digitan's Journal` - 14 edges
2. `StateManager` - 11 edges
3. `RPCManager` - 10 edges
4. `Design System` - 9 edges
5. `getHostDir()` - 7 edges
6. `queuedSave()` - 7 edges
7. `scripts` - 7 edges
8. `Data Flow` - 7 edges
9. `installHost()` - 6 edges
10. `scripts` - 6 edges

## Surprising Connections (you probably didn't know these)
- `Digitan` --references--> `Brand Personality`  [INFERRED]
  AGENTS.md → design-system/MASTER.md
- `Digitan` --references--> `Color Tokens`  [INFERRED]
  AGENTS.md → design-system/MASTER.md
- `Digitan` --rationale_for--> `Digitan's Journal`  [INFERRED]
  AGENTS.md → README.md
- `umapyoi.net API` --references--> `Color Tokens`  [INFERRED]
  AGENTS.md → design-system/MASTER.md
- `Design System` --references--> `Digitan's Journal`  [INFERRED]
  design-system/MASTER.md → README.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Data Pipeline** — readme_md_digitans_journal, readme_md_native_messaging, readme_md_discord_rich_presence, security_md_data_flow, security_md_native_host, security_md_security_model [EXTRACTED 0.95]
- **Brand Foundation** — agents_md_digitan, agents_md_agnes_digital, design_system_master_md_brand_personality, design_system_master_md_color_tokens, agents_md_umapyoi_api [INFERRED 0.85]
- **Extension UI** — options_options_options_html_options_page, popup_popup_popup_html_popup_ui, popup_popup_popup_html_seal_indicator, design_system_master_md_design_system [INFERRED 0.85]

## Communities (25 total, 4 thin omitted)

### Community 0 - "Extension Manifest"
Cohesion: 0.06
Nodes (35): action, default_icon, default_popup, background, service_worker, description, suggested_key, commands (+27 more)

### Community 1 - "Native Host CLI"
Cohesion: 0.13
Nodes (22): detectExtensionId(), { execSync }, fs, getChromeBrowsers(), { HOST_NAME, MANIFEST_FILE, MANIFEST_FILE_FIREFOX, getHostDir, getChromeManifest, getFirefoxManifest }, installHost(), KNOWN_COMMANDS, path (+14 more)

### Community 2 - "Brand & UI Identity"
Cohesion: 0.17
Nodes (24): Agnes Digital, Digitan, umapyoi.net API, Accessibility, Anti-Patterns, Brand Personality, Color Tokens, Design System (+16 more)

### Community 3 - "Presence Formatting Tests"
Cohesion: 0.10
Nodes (16): formatPresence(), defaults, extBuildPayload(), { formatPresence }, defaults, { formatPresence }, longTitle, metaResult (+8 more)

### Community 4 - "Build & Dependencies"
Cohesion: 0.10
Nodes (19): adm-zip, dependencies, adm-zip, webextension-polyfill, devDependencies, playwright, @types/chrome, private (+11 more)

### Community 5 - "RPC Protocol & Host"
Cohesion: 0.20
Nodes (16): {
  ACTION_CONNECT, ACTION_SET_ACTIVITY, ACTION_DISCONNECT,
  TYPE_RPC_STATUS, TYPE_ERROR,
  validateNativeMessage, validateHostMessage,
  rpcStatus, connectMsg, setActivityMsg, disconnectMsg,
}, buffer, clearPresence(), connectRPC(), DiscordRPC, sendMessage(), setActivity(), main() (+8 more)

### Community 6 - "Build Pipeline"
Cohesion: 0.11
Nodes (14): backgroundDeps, bgRaw, contentShared, contentSharedCode, DIST, fs, manifest, matches (+6 more)

### Community 7 - "Native Host Package"
Cohesion: 0.12
Nodes (15): discord-rpc, dependencies, discord-rpc, devDependencies, pkg, name, private, scripts (+7 more)

### Community 10 - "Options Page Logic"
Cohesion: 0.42
Nodes (9): createSiteToggle(), createTemplateGroup(), init(), loadSettings(), loadSites(), queuedSave(), saveQueue, saveSettings() (+1 more)

### Community 11 - "Screenshot Generation"
Cohesion: 0.28
Nodes (8): { chromium }, { existsSync, mkdirSync }, getExtensionId(), main(), OUT_DIR, path, renderPromoPage(), ROOT_DIR

### Community 12 - "Asset Generation"
Cohesion: 0.29
Nodes (6): { chromium }, { existsSync, mkdirSync, readFileSync }, OUT_DIR, path, ROOT_DIR, STORE_DIR

### Community 13 - "E2E Testing"
Cohesion: 0.29
Nodes (5): { chromium }, EXT_PATH, fs, os, path

### Community 14 - "Background Script"
Cohesion: 0.33
Nodes (3): rpc, siteMatches, state

### Community 15 - "Raggooner Content Script"
Cohesion: 0.60
Nodes (4): getPageInfo(), getText(), getTitleFromLines(), parseQueueInfo()

### Community 16 - "uma.guide Content Script"
Cohesion: 0.60
Nodes (4): DETAIL_NAME_SELECTORS, getCardMeta(), getNameFromDOM(), getPageInfo()

## Knowledge Gaps
- **115 isolated node(s):** `rpc`, `state`, `siteMatches`, `DETAIL_NAME_SELECTORS`, `manifest_version` (+110 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `addAll()` connect `Build & Dependencies` to `Build Pipeline`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `Digitan's Journal` (e.g. with `Digitan` and `Design System`) actually correct?**
  _`Digitan's Journal` has 4 INFERRED edges - model-reasoned connections that need verification._
- **Are the 4 inferred relationships involving `Design System` (e.g. with `Options Page` and `Popup UI`) actually correct?**
  _`Design System` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `rpc`, `state`, `siteMatches` to the rest of the system?**
  _116 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Extension Manifest` be split into smaller, more focused modules?**
  _Cohesion score 0.05555555555555555 - nodes in this community are weakly interconnected._
- **Should `Native Host CLI` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._
- **Should `Presence Formatting Tests` be split into smaller, more focused modules?**
  _Cohesion score 0.09881422924901186 - nodes in this community are weakly interconnected._