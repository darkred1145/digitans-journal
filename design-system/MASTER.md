# Digitan's Journal — Design System

> Brand identity master reference. Inspired by Agnes Digital (Digitan), a self-described "super all-around otaku" who loves supporting her fellow Uma Musume.

---

## Brand Personality

| Trait | Description |
|-------|-------------|
| Voice | Kawaii, playful, supportive, energetic — "Hewwo! I'm Digi-tan!" |
| Tone | Warm, encouraging, otaku-positive |
| Metaphor | A personal journal / diary that sparkles with your browsing adventures |
| Audience | Uma Musume fans, otaku community, Discord users |

---

## Color Tokens

### Brand Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--pink` | `#F37F96` | Primary brand color, accent borders, active states |
| `--pink-dark` | `#D46078` | Hover/active states, gradient partner |
| `--yellow` | `#F9F189` | Secondary brand color, highlights, stars |
| `--yellow-dim` | `rgba(249,241,137,0.2)` | Subtle dividers, decorative elements |

### Surface & Text (Dark Mode)

| Token | Hex | Usage |
|-------|-----|-------|
| `--bg` | `#1A1423` | Page background (deep purple journal cover) |
| `--surface` | `#271E33` | Card/section surface |
| `--surface-hover` | `#32263F` | Hover state for cards |
| `--text` | `#F0E8D8` | Primary text (warm cream) |
| `--text-secondary` | `#C4B5CB` | Secondary text (lavender gray) |
| `--text-muted` | `#9585A5` | Muted/hint text |
| `--border` | `#3D2E4A` | Default borders |
| `--border-light` | `#4A3A5A` | Lighter borders |

### Status Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--green` | `#6CD4A0` | Connected status, success |
| `--amber` | `#F0A345` | Connecting/warning |
| `--red` | `#E8536D` | Error/disconnected |

### Opacity & Glow Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--pink-glow` | `rgba(243,127,150,0.15)` | Section pink glow |
| `--green-glow` | `rgba(108,212,160,0.25)` | Connected ring glow |
| `--amber-glow` | `rgba(240,163,69,0.25)` | Connecting ring glow |

---

## Typography

| Role | Font | Weight | Fallback |
|------|------|--------|----------|
| Display / Headings | Fredoka | 500-700 | Nunito, sans-serif |
| Body | Nunito | 400-600 | -apple-system, sans-serif |
| Mono / Code | JetBrains Mono | 400-500 | Cascadia Code, Consolas, monospace |

### Font Sizing (Popup)

| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| Title | 17px | 600 | 1.3 |
| Entry message | 14px | 500 | 1.4 |
| Body | 13px | 400 | 1.5 |
| Status text | 11px | 600 | 1.3 |
| Hint / footer | 10px | 400 | 1.4 |

### Font Sizing (Options)

| Element | Size | Weight |
|---------|------|--------|
| Page title | 24px | 600 |
| Section header | 14px | 600 |
| Row label | 14px | 500 |
| Body | 14px | 400 |
| Description | 12px | 400 |

---

## Effects & Shadows

### Entry Card
```
box-shadow:
  0 4px 12px rgba(0,0,0,0.2),
  inset 0 1px 0 rgba(255,255,255,0.03)
border-radius: 12px
border: 2px solid var(--border)
border-left: 3px solid var(--pink)
```

### Section Card
```
box-shadow:
  0 4px 16px rgba(0,0,0,0.15),
  inset 0 1px 0 rgba(255,255,255,0.03)
border-radius: 14px
border: 2px solid var(--border)
```

### Buttons
```
box-shadow:
  0 2px 4px rgba(0,0,0,0.15),
  inset 0 1px 0 rgba(255,255,255,0.04)
border-radius: 10px
border: 2px solid var(--border)
:active → transform: scale(0.96)
```

---

## Animation Tokens

| Property | Duration | Easing | Usage |
|----------|----------|--------|-------|
| Status change | 400ms | ease | Seal ring glow transition |
| Toggle switch | 250ms | cubic-bezier(0.34, 1.56, 0.64, 1) | Slider knob movement |
| Button press | 150ms | cubic-bezier(0.34, 1.56, 0.64, 1) | scale transform |
| Card fade-in | 300ms | ease-out | Entry content transition |
| Connecting pulse | 1.4s | ease-in-out infinite | Seal dot animation |
| Toast appear | 300ms | cubic-bezier(0.34, 1.56, 0.64, 1) | Save notification |
| Glow pulse | 2s | ease-in-out infinite | Connected seal glow |

---

## Icons

| Size | File | Usage |
|------|------|-------|
| 16×16 | `icons/icon16.png` | Browser toolbar / favicon |
| 48×48 | `icons/icon48.png` | Extensions management page |
| 128×128 | `icons/icon128.png` | Store listing, larger displays |

**Design**: Pink gradient circle with "DJ" monogram, cream/white text, yellow star accent

---

## Patterns

### Divider (Washi Tape)
```css
.divider::before {
  height: 2px;
  background: linear-gradient(90deg, transparent, yellow-dim 20%, yellow-dim 80%, transparent);
}
.divider::after {
  content: '✦';
  color: var(--yellow);
  opacity: 0.5;
}
```

### Row Left Accent
```css
border-left: 2px solid rgba(243,127,150,0.18);
```

### Input Focus
```css
border-color: var(--pink);
outline: 2px solid var(--pink);
outline-offset: 1px;
```

---

## Accessibility

- `prefers-reduced-motion` disables all animations
- Focus-visible rings use brand pink at 2px offset
- Touch targets meet minimum sizing recommendations
- Status is conveyed through both color AND text (not color alone)
- All form inputs have associated labels or aria-labels
- Save notifications use `aria-live="polite"`

---

## Anti-Patterns

| Avoid | Instead |
|-------|---------|
| Pure white backgrounds | Use dark purple base `#1A1423` |
| Emojis as navigation icons | Use vector-based approach or styled elements |
| Hardcoded hex colors per-screen | Use CSS custom properties from this spec |
| Instant color transitions | Always animate (150-400ms) |
| Low contrast text | Keep body text >= 4.5:1 against surfaces |
| Skeleton layouts without animation | Only show loading states after 300ms |

---

*Last updated: 2026-06-30*
