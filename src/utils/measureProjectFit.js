/**
 * measureProjectFit — determines what content can be shown inside a project tile.
 *
 * Uses the Canvas 2D API for off-screen text measurement (no DOM reflow).
 * Must be called in a browser context (inside useLayoutEffect or after mount).
 *
 * Layout model (all values in px):
 *   tile outer:  rect.w × rect.h  (from packer, gap already applied)
 *   item inner:  rect.w×0.975 − 2×PADDING  wide
 *                rect.h×0.975 − 2×PADDING  tall
 *   image area:  35% of item height (flex: 0 0 35%)
 *   text area:   remaining height after image + image margin
 *
 * @param {{ title: string, body: string, tags: string[] }} project
 * @param {{ w: number, h: number }} rect  — pixel rect from packProjects
 * @returns {{ titleFits: boolean, showBody: boolean, showTags: boolean }}
 */

const ITEM_PADDING    = 12   // px — matches .projects-item padding in CSS
const ITEM_SCALE      = 0.975 // inner article is 97.5% of outer wrapper
const IMAGE_FRACTION  = 0.35  // .project-visual height = 35% of item height (flex)
const IMAGE_MARGIN_PX = 16    // 1rem margin-bottom below image
const BODY_MARGIN_PX  = 14    // .project-body margin-bottom
const TAGS_HEIGHT_PX  = 32    // one row of tags (~.34rem padding + font-size)
const TITLE_MARGIN_PX = 8     // margin-bottom on .project-title

// Shared offscreen canvas — reused across all calls
let _canvas = null
function getCtx() {
  if (!_canvas) _canvas = document.createElement('canvas')
  return _canvas.getContext('2d')
}

/**
 * Measures wrapped text height using Canvas measureText.
 * Accounts for CSS letter-spacing by widening each character's contribution.
 */
function wrappedHeight(ctx, text, maxWidth, fontSizePx, lineHeight, letterSpacingPx = 0) {
  const words = String(text).split(/\s+/).filter(Boolean)
  if (!words.length) return 0

  let lines = 0
  let line  = ''

  for (const word of words) {
    const test        = line ? `${line} ${word}` : word
    const testWidth   = ctx.measureText(test).width + test.length * letterSpacingPx
    const lineWidth   = ctx.measureText(line).width + line.length * letterSpacingPx

    if (line && testWidth > maxWidth) {
      // Check if this single word already exceeds maxWidth (force-place it)
      lines++
      line = word
    } else {
      line = test
    }
    void lineWidth // suppress unused warning
  }
  if (line) lines++

  return lines * fontSizePx * lineHeight
}

export function measureProjectFit(project, rect) {
  const itemW  = rect.w * ITEM_SCALE
  const itemH  = rect.h * ITEM_SCALE
  const innerW = itemW - ITEM_PADDING * 2
  const innerH = itemH - ITEM_PADDING * 2

  if (innerW < 40 || innerH < 40) {
    return { titleFits: false, showBody: false, showTags: false }
  }

  const imageH    = itemH * IMAGE_FRACTION
  const textAreaH = innerH - imageH - IMAGE_MARGIN_PX

  if (textAreaH < 20) {
    return { titleFits: false, showBody: false, showTags: false }
  }

  const ctx = getCtx()

  // ── Title ──────────────────────────────────────────────────────────────────
  // CSS: font-size: clamp(1.8rem, 3vw, 2.6rem); font-weight: 700; line-height: .95
  // letter-spacing: 0.13rem = ~2px
  const vwPx         = typeof window !== 'undefined' ? window.innerWidth : 1200
  const titleFontPx  = Math.min(41.6, Math.max(28.8, vwPx * 0.03))
  const titleLetterSp = 2.08  // 0.13rem at 16px base

  ctx.font = `700 ${titleFontPx}px "Instrument Serif", Georgia, serif`
  const titleH = wrappedHeight(ctx, project.title, innerW, titleFontPx, 0.95, titleLetterSp)

  if (titleH > textAreaH * 0.95) {
    return { titleFits: false, showBody: false, showTags: false }
  }

  const remainAfterTitle = textAreaH - titleH - TITLE_MARGIN_PX

  // ── Body ───────────────────────────────────────────────────────────────────
  // CSS: font-size: calc(.95rem + 2.5px) ≈ 17.7px; line-height: 1.7; font-family: Inter
  const bodyFontPx = 17

  ctx.font = `400 ${bodyFontPx}px "Inter", ui-sans-serif, sans-serif`
  const bodyH    = wrappedHeight(ctx, project.body, innerW, bodyFontPx, 1.7)
  const showBody = bodyH + BODY_MARGIN_PX <= remainAfterTitle

  // ── Tags ───────────────────────────────────────────────────────────────────
  const remainAfterBody = remainAfterTitle - (showBody ? bodyH + BODY_MARGIN_PX : 0)
  const showTags        = remainAfterBody >= TAGS_HEIGHT_PX

  return { titleFits: true, showBody, showTags }
}
