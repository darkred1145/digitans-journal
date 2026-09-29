# Naming Rationale

**Digitan** (デジたん) is the established nickname of **Agnes Digital** (アグネスデジタル), a canonical Uma Musume character. She introduces herself as *"Hewwo! I'm Digi-tan!"* — a self-described "super all-around otaku" who LOVES supporting her fellow Uma Musume.

The brand name is a tribute/fan reference, not a made-up tech name. All character references are intended as homage and are not affiliated with Cygames.

## Official Data Source

Character data (color palette, profile, imagery) sourced from https://umapyoi.net/api/v1/character/1019 via the Umamusume.jp official site.

- **Color main**: #F37F96 (pink/coral)
- **Color sub**: #F9F189 (light yellow)
- **Height**: 143cm
- **Profile**: "Hewwo! I'm Digi-tan! I'm a massive fan of all of the sparkling Umamusume! I'm so happy every day! I'm so glad I was born an otaku!~♪"

## Build Output

`dist/` is the extension and is **not committed**. Always `npm run build` before
loading it, and load the `dist/` folder (not the repo root — the root manifest is
a source template whose paths are `dist/`-relative). `scripts/build.js` wipes and
regenerates `dist/` on every run, so stale files from the other target cannot
survive a build.

## Graphify

Knowledge graph lives in `graphify-out/` (HTML viz at `graph.html`, audit at
`GRAPH_REPORT.md`). It is generated output and is **not committed** — the
directory will be absent on a fresh clone.

Rebuild: run `/graphify` from project root, then read `graphify-out/GRAPH_REPORT.md`.
Only trust query results that name real functions; a graph built purely from JS
AST extraction has no semantic layer, so `graphify query` matches identifiers and
can return noise like `main()`. For questions about behavior, read the source.
