# Text Fitting Work — Handoff for Claude Code

This document summarizes ongoing layout work on **kamen-portfolio**: making prose scale to fixed flex regions on tall newspaper-style pages without overflow, clipping, or broken aspect ratios.

## Project context

- React + Vite portfolio with a **newspaper page** metaphor (`NewspaperPage`, `newspaper-page--tall`).
- Tall sections (Feature, Projects, Contact) live in `.glass` cards with large fixed heights (`222vh` desktop, `100vh` in narrow media queries).
- Copy is bilingual (EN/BG) via `src/data/content.js`; Bulgarian strings are often longer and stress-fit logic more.
- Primary dependency: **`react-use-fittext`** (`useFitText`).

## Core pattern (repeat everywhere)

Multi-line editorial text uses a shared wrapper:

**`src/components/FitBox.jsx`**

```jsx
// fitMode: 'both' — scales font to fit container width AND height
// scale prop — multiplies computed fontSize for tighter visual fit (e.g. 0.82)
// Structure: outer div (containerRef) + inner Tag (textRef)
```

### Rules that must hold

1. **Bounded parent first** — Text only fits correctly if a parent has a predetermined height via flex (`flex: 0 0 18%`, `flex: 1 1 0`, etc.) plus `min-height: 0` and `overflow: hidden`.
2. **Plain eyebrow** — `<span className="smallcaps">` is NOT wrapped in FitBox; it is `flex: 0 0 auto`.
3. **Margins off fitted text** — Set `margin: 0` on `h2`/`h3`/`p` inside FitBox (inline + CSS). Margins on fitted elements break height calculations and cause vertical misalignment.
4. **No forced `whiteSpace: nowrap` on multi-line FitBox** — An earlier bug forced nowrap on all FitBox text, causing single-line blow-ups. FitBox must NOT add nowrap; let `useFitText` wrap for `fitMode: 'both'`.
5. **`max-width: none` on decks** — `.article-deck` has `max-width: 64ch` globally; override inside fitted blocks (`.contact-welcome .article-deck`, `.feature-article-head .article-deck`) or text only uses ~half the width.
6. **`scale` for tightness** — Caps (`maxFontSize`) limit absolute size; `scale={0.82}` (etc.) prevents text from visually filling 100% of the computed fit box.

### Flex child wrappers

Every FitBox renders an extra wrapper `<div ref={containerRef}>`. Parent flex columns need:

```css
.parent > div {
  min-width: 0;
  min-height: 0;
  width: 100%;
}
```

---

## Section-by-section status

### Hero — `src/components/Hero.jsx`

| Region | Implementation |
|--------|----------------|
| `.hero-copy-text` | `flex: 0 0 60%` parent; plain eyebrow + two FitBoxes (h2, p) |
| Buttons | `FitBtn` — inner `.btn-fit` + `useFitText` with `fitMode: 'both'` |
| Quick cards | Separate `useFitText` per label/value |

CSS: `src/styles/global.css` — `.hero-copy-text`, `.btn-fit`, margin resets on `h2`/`p`.

### Contact — `src/components/ContactArticle.jsx`

| Region | Implementation |
|--------|----------------|
| `.contact-welcome` | `flex: 0 0 20%`; eyebrow + FitBox h3 + FitBox p; title `flex: 1.5`, deck `flex: 1`; `scale={0.82}` |
| Profile cards | Single column grid `1fr 1fr 1fr 1fr 2fr` (CV spans 2 rows); `FitCardBody` with three FitBoxes in label/text/desc wraps |
| Label width | `.profile-card-label-wrap { width: 25% }`; text/desc wraps `width: 100%` |

Certificates card uses same `FitCardBody` in closed state; cert trigger layout aligned with regular cards (`flex: 1`, `gap: inherit` on trigger).

### Feature / video article — `src/components/FeatureArticle.jsx`

| Region | Implementation |
|--------|----------------|
| `.feature-article-head` | `flex: 0 0 18%`; same FitBox pattern as contact welcome |
| `.feature-video-wrap` | `flex: 1 1 0`; shares space with timeline |
| `.video-frame` | **`width: 100%`, `aspect-ratio: 16/9`, `flex: 0 0 auto`** — video drives width, never stretched by flex |
| `.feature-video-caption` | `flex: 1 1 0`; contains FitBox **strong** (label), **span** (meta), **p.feature-body-copy** (body) — body was moved here from removed `.feature-body-copy-wrap` |
| Timeline cards | `CheckpointCard` — FitBox on year (`flex: 0 0 auto`), title (`flex: 1`), body (`flex: 1.5`); scales 0.85 / 0.85 / 0.82 |

### Not yet migrated

- **Projects article** (`ProjectsArticle.jsx`) still uses static `.article-head` with clamp CSS and tall-page scroll fallback (`max-height: 10vh; overflow-y: auto`).

---

## Key CSS locations (`src/styles/global.css`)

```
.hero-copy-text              — 60% hero text block
.contact-welcome             — 20% contact header
.profile-cards               — single column, CV 2fr row
.feature-article-head        — 18% feature header
.feature-video-wrap          — flex 1; video 16:9 + caption
.feature-video-caption       — flex 1; all video prose
.checkpoint-content          — FitBox wrappers + gap
.newspaper-page--tall ...    — tall overrides, margin resets
```

Generic `.article-head` tall rules (10vh + scroll) apply to **Projects** only now; feature uses `.feature-article-head` instead.

---

## Pitfalls encountered (do not reintroduce)

| Mistake | Symptom | Fix |
|---------|---------|-----|
| `fitMode: 'width'` + nowrap on buttons/body | Text overflows vertically | Use `fitMode: 'both'`; measure inside `.btn-fit` |
| `lineMode: 'single'` / forced nowrap on FitBox | One cramped line, huge unused vertical space | Remove; use clean FitBox |
| `maxFontSize` too low OR only lowering cap when user wants tighter fit | Text too small or still too large proportionally | Tune `scale`, not only cap |
| Margins on `.article-title` / `.article-deck` | FitBox height wrong, gaps at top/bottom | `margin: 0` + parent `gap` |
| `aspect-ratio: unset` on video | Video stretched/squashed | Restore `16/9`, `flex: 0 0 auto` |
| 2-column profile grid (mistaken) | User wanted single column | `grid-template-columns: 1fr` only |

---

## Tuning knobs

When text feels too large/small in a region:

1. **`scale`** on FitBox (e.g. `0.82`, `0.85`) — visual tightness without changing fit algorithm ceiling
2. **`maxFontSize` / `minFontSize`** — hard limits for useFitText search
3. **Flex ratios** on FitBox `containerStyle` — e.g. title `1.5`, deck `1`, body `1.5`
4. **Parent flex percentage** — e.g. contact welcome `20%`, feature head `18%`

---

## Files touched in this effort

| File | Role |
|------|------|
| `src/components/FitBox.jsx` | Shared multi-line fit wrapper |
| `src/components/Hero.jsx` | Hero copy + buttons |
| `src/components/ContactArticle.jsx` | Welcome + profile cards |
| `src/components/FeatureArticle.jsx` | Head, caption, checkpoint cards |
| `src/styles/global.css` | All flex budgets and overrides |

---

## Verification

```bash
npm run build
```

Manually check on `newspaper-page--tall` viewports:

- Hero: h2/p fill `.hero-copy-text` without overflow; buttons fit height
- Contact: welcome 20%; cards single column; CV 2× height; link text width-fits
- Feature: video 16:9 full width; caption has label + meta + body; timeline card text scales

---

## Suggested next steps

1. Apply same FitBox + flex budget pattern to **ProjectsArticle** (`.article-head` + project tile text if needed).
2. Consider extracting `FitBtn` / `FitCardBody` patterns if more sections need width-only single-line fit.
3. Remove debug export `HelloWorld` from `FeatureArticle.jsx` if still present (leftover).

---

*Last updated from Cursor session: dynamic text fitting across Hero, Contact, and Feature articles.*
