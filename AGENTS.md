# Naming Rationale

**Digitan** (デジたん) is the established nickname of **Agnes Digital** (アグネスデジタル), a canonical Uma Musume character. She introduces herself as *"Hewwo! I'm Digi-tan!"* — a self-described "super all-around otaku" who LOVES supporting her fellow Uma Musume.

The brand name is a tribute/fan reference, not a made-up tech name. All character references are intended as homage and are not affiliated with Cygames.

## Official Data Source

Character data (color palette, profile, imagery) sourced from https://umapyoi.net/api/v1/character/1019 via the Umamusume.jp official site.

- **Color main**: #F37F96 (pink/coral)
- **Color sub**: #F9F189 (light yellow)
- **Height**: 143cm
- **Profile**: "Hewwo! I'm Digi-tan! I'm a massive fan of all of the sparkling Umamusume! I'm so happy every day! I'm so glad I was born an otaku!~♪"

## Extension ID

`manifest.json` pins a `key` (a public key, safe to commit), so the extension ID
is fixed at `bjlefkbhpldffadmpbnhdefgfneanhcn` regardless of install path or
machine. `native-host/host-constants.js` derives that ID from the key with the
same SHA-256-to-a-p mapping Chrome uses.

Never hardcode that ID anywhere. Read `CHROME_EXTENSION_ID` from
host-constants, or read the `key` from the manifest. Changing the `key` changes
the ID and invalidates every registered native host manifest, so it needs a
`node cli.js --install` afterward.

## Build Output

`dist/` is the extension and is **not committed**. Run `npm run build` before
loading it, and load the `dist/` folder. The repo root is not loadable: its
manifest is a source template whose paths are relative to `dist/`.
`scripts/build.js` wipes and regenerates `dist/` on every run, so files left over
from the other build target cannot survive.

## Graphify

Knowledge graph lives in `graphify-out/` (HTML viz at `graph.html`, audit at
`GRAPH_REPORT.md`). It is generated output and is **not committed**, so the
directory will be absent on a fresh clone.

Rebuild: run `/graphify` from the project root, then read
`graphify-out/GRAPH_REPORT.md`.

A graph built only from JS AST extraction has no semantic layer, so
`graphify query` matches identifiers and can return noise like `main()`. Trust
query output that names real functions. For questions about behavior, read the
source.
