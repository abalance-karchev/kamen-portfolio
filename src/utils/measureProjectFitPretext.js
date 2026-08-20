/**
 * measureProjectFitPretext — tile content visibility using @chenglou/pretext.
 *
 * Same outer contract as measureProjectFit.js (input/output). Geometry
 * constants come from src/styles/tileMetrics.js — the single source of
 * truth shared with global.css's `.projects-item` rules (via
 * applyTileMetricsCssVars), so this measurer can't drift out of sync with
 * the real tiles the way the old hand-duplicated constants did.
 *
 * Rules:
 *   - Title rejected if its laid-out height is strictly greater than 65% of
 *     the image band height, or if the title block does not fit textAreaH.
 *   - Tags hidden before body when space is tight; if title+body does not fit,
 *     try title+tags (body off, tags on if they fit).
 *
 * @param {{ title: string, body: string, tags: string[] }} project
 * @param {{ w: number, h: number }} rect
 * @param {{ isLast?: boolean }} [options] — `isLast` matches `.projects-item--last` (8px padding + smaller title cap in CSS)
 * @returns {{ titleFits: boolean, showBody: boolean, showTags: boolean }}
 */

import { prepare, layout } from '@chenglou/pretext'
import { TILE_METRICS, clampFormulaPx, TILE_METRICS_REM } from '../styles/tileMetrics'

const REM = TILE_METRICS_REM

function padPx(isLast) {
  return isLast ? TILE_METRICS.itemPaddingLast : TILE_METRICS.itemPadding
}

/**
 * @param {string} text
 * @param {number} innerW
 * @param {number} bodyFontPx
 */
function bodyHeight(text, innerW, bodyFontPx) {
  const t = String(text ?? '')
  if (!t.trim()) return 0
  const prepared = prepare(t, `400 ${bodyFontPx}px "Inter", ui-sans-serif, sans-serif`)
  const { height } = layout(prepared, innerW, bodyFontPx * 1.6)
  return height
}

/**
 * Wrapped height for tag chips as flowing text (approximation of .tags flex).
 * @param {string[]} tags
 * @param {number} innerW
 */
function tagsBlockHeight(tags, innerW) {
  if (!tags?.length) return 0
  const line = tags.join('  ')
  const tPx = clampFormulaPx(TILE_METRICS.tag, innerW, 0)
  const prepared = prepare(line, `700 ${tPx}px "Inter", sans-serif`)
  const lh = Math.max(10.4, tPx * 1.2)
  const { height } = layout(prepared, innerW, lh)
  return height + 6
}

export function measureProjectFitPretext(project, rect, options = {}) {
  const { isLast = false } = options

  const itemW  = rect.w * TILE_METRICS.itemScale
  const itemH  = rect.h * TILE_METRICS.itemScale
  const pad    = padPx(isLast)
  const innerW = itemW - pad * 2
  const innerH = itemH - pad * 2

  if (innerW < 40 || innerH < 40) {
    return { titleFits: false, showBody: false, showTags: false }
  }

  const imageH    = itemH * TILE_METRICS.imageFraction
  const textAreaH = innerH - imageH - TILE_METRICS.imageMarginPx

  if (textAreaH < 20) {
    return { titleFits: false, showBody: false, showTags: false }
  }

  const gapPx = TILE_METRICS.contentGap * REM

  const tPx           = clampFormulaPx(isLast ? TILE_METRICS.titleLast : TILE_METRICS.title, innerW, innerH)
  const titleLetterPx = clampFormulaPx(TILE_METRICS.titleLetter, innerW, 0)

  const title = String(project.title ?? '')
  const titlePrepared = prepare(
    title,
    `700 ${tPx}px "Instrument Serif", Georgia, serif`,
    { letterSpacing: titleLetterPx }
  )
  const titleLH = tPx * 0.95
  const { height: titleH } = layout(titlePrepared, innerW, titleLH)

  if (titleH > TILE_METRICS.titleMaxOfImage * imageH) {
    return { titleFits: false, showBody: false, showTags: false }
  }

  const titleBlock = titleH + gapPx
  if (titleBlock > textAreaH) {
    return { titleFits: false, showBody: false, showTags: false }
  }

  const bodyFontPx = clampFormulaPx(TILE_METRICS.body, innerW, innerH)
  const bodyH      = bodyHeight(project.body, innerW, bodyFontPx)
  const bodyBlock  = bodyH > 0 ? bodyH + gapPx : 0

  const tags      = Array.isArray(project.tags) ? project.tags : []
  const tagsBlock = tags.length ? tagsBlockHeight(tags, innerW) : 0

  const full = titleBlock + bodyBlock + tagsBlock
  if (full <= textAreaH) {
    return {
      titleFits: true,
      showBody:  bodyH > 0,
      showTags:  tags.length > 0,
    }
  }

  const noTags = titleBlock + bodyBlock
  if (noTags <= textAreaH) {
    return { titleFits: true, showBody: bodyH > 0, showTags: false }
  }

  const noBody = titleBlock + tagsBlock
  if (noBody <= textAreaH) {
    return { titleFits: true, showBody: false, showTags: tags.length > 0 }
  }

  return { titleFits: true, showBody: false, showTags: false }
}
