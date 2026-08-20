// Single source of truth for treemap tile geometry (.projects-item and
// friends), shared by measureProjectFitPretext.js's layout predictions and
// global.css's actual tile rules (via the CSS custom properties this module
// generates). Previously these constants were hand-duplicated in both
// places and drifted out of sync — that duplication, not the pretext
// algorithm itself, was the source of tile-fit bugs.
export const TILE_METRICS = {
  itemPadding: 12,      // .projects-item padding (px)
  itemPaddingLast: 8,   // .projects-item--last padding (px)
  itemScale: 0.975,     // pretext safety margin vs the real box
  imageFraction: 0.40,  // .project-visual flex-basis
  imageMarginPx: 16,    // portrait-tile image margin-bottom
  contentGap: 0.3,      // .project-content gap, in rem — real fixed gap,
                         // not cq-responsive, so the measurer no longer
                         // approximates it with its own clamp

  /** Max share of the image band height a title may occupy before rejection. */
  titleMaxOfImage: 0.65,

  // Each font-size entry mirrors a CSS clamp(): min, max in rem, preferred
  // value `rem*1rem + cqw*1cqw + cqh*1cqh`.
  title:       { min: 0.8,   rem: 0.44, cqw: 2.4,  cqh: 1,    max: 1.6 },
  titleLast:   { min: 0.736, rem: 0.36, cqw: 2,     cqh: 0.8,  max: 1.2 },
  titleLetter: { min: 0.048, rem: 0.032, cqw: 0.28, cqh: 0,    max: 0.104 },
  body:        { min: 0.704, rem: 0.4,  cqw: 1.76,  cqh: 0.72, max: 1.2 + 2 / 16 },
  tag:         { min: 0.52,  rem: 0.4,  cqw: 0.88,  cqh: 0,    max: 0.616 },
}

const REM = 16

function clampFormula({ min, rem, cqw, cqh, max }) {
  return `clamp(${min}rem, ${rem}rem + ${cqw}cqw + ${cqh}cqh, ${max}rem)`
}

/**
 * Publishes TILE_METRICS as CSS custom properties consumed by the
 * `.projects-item` rules in global.css. Call once (see ProjectsArticle.jsx).
 */
export function applyTileMetricsCssVars(root = document.documentElement) {
  const m = TILE_METRICS
  const set = (name, value) => root.style.setProperty(name, value)

  set('--tile-pad', `${m.itemPadding}px`)
  set('--tile-pad-last', `${m.itemPaddingLast}px`)
  set('--tile-image-fraction', `${m.imageFraction * 100}%`)
  set('--tile-content-gap', `${m.contentGap}rem`)

  set('--tile-title-font', clampFormula(m.title))
  set('--tile-title-last-font', clampFormula(m.titleLast))
  set('--tile-title-letter', clampFormula(m.titleLetter))
  set('--tile-body-font', clampFormula(m.body))
  set('--tile-tag-font', clampFormula(m.tag))
}

/** Mirrors a TILE_METRICS clamp entry in JS px, given the tile's cqw/cqh (px). */
export function clampFormulaPx({ min, rem, cqw, cqh, max }, innerW, innerH) {
  const cqwPx = innerW / 100
  const cqhPx = innerH / 100
  const pref = rem * REM + cqw * cqwPx + cqh * cqhPx
  return Math.min(max * REM, Math.max(min * REM, pref))
}

export { REM as TILE_METRICS_REM }
