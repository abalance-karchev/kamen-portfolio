/**
 * Squarified Treemap Layout for portfolio project tiles.
 *
 * Each project in content.js declares:
 *   value — relative size weight (arbitrary positive number).
 *
 * The algorithm:
 *   1. Normalize weights → proportional pixel areas that sum to W×H.
 *   2. Sort items descending by area (highest value = top-left, rendered first).
 *   3. Squarify recursion: greedily fill strips while both:
 *        a) aspect ratio improves (standard squarify condition), AND
 *        b) the worst tile in the strip stays within ASPECT_MAX (1:3 to 3:1 bound).
 *      A strip is committed early if adding the next item would violate either rule.
 *      Exception: the first item of each new strip is always placed even if it alone
 *      exceeds the bound (can't avoid it — that item has to go somewhere).
 *   4. Apply gap (inset each rect by gap/2 on every side).
 *
 * Aspect ratio bound: ASPECT_MAX = 3  →  1:3 ≤ w/h ≤ 3:1
 *
 * @param {Array<{id: string, value: number}>} projects — from content.js
 * @param {number} W   — container width  (px)
 * @param {number} H   — container height (px)
 * @param {number} gap — spacing between tiles (px, default 8)
 * @returns {{ rects: Record<string, {x,y,w,h}> }}
 */

const ASPECT_MAX = 3  // loose bound: tiles must stay within 1:3 ↔ 3:1

export function packProjects(projects, W, H, gap = 8) {
  if (!projects.length || W <= 0 || H <= 0) return { rects: {} }

  const totalWeight = projects.reduce((s, p) => s + (p.value ?? 1), 0)
  const totalArea   = W * H

  // Assign each project a proportional pixel area, sort largest first
  const items = projects
    .map(p => ({ id: p.id, area: ((p.value ?? 1) / totalWeight) * totalArea }))
    .sort((a, b) => b.area - a.area)

  const rawRects = {}

  // ── Core squarify ─────────────────────────────────────────────────────────

  /**
   * Computes the worst tile aspect ratio that would result from laying out
   * `row` as a strip of thickness T = sum(areas) / stripLongSide.
   *
   * In horizontal mode stripShortSide IS the strip height T (since the strip
   * spans the full long side). The formula resolves to the actual max(w/h, h/w)
   * across all tiles, confirmed: worstAspect([a], s) = s/T where T = a/s = s/T.
   * Returns a value ≥ 1; compare against ASPECT_MAX.
   */
  function worstAspect(row, stripShortSide) {
    const s    = row.reduce((acc, it) => acc + it.area, 0)
    const rMax = Math.max(...row.map(it => it.area))
    const rMin = Math.min(...row.map(it => it.area))
    const w2   = stripShortSide * stripShortSide
    return Math.max((w2 * rMax) / (s * s), (s * s) / (w2 * rMin))
  }

  function commitStrip(row, x, y, w, h, isHoriz) {
    const rowArea   = row.reduce((s, it) => s + it.area, 0)
    const thickness = rowArea / (isHoriz ? w : h)
    let cursor      = isHoriz ? x : y

    for (const item of row) {
      const extent = item.area / thickness
      if (isHoriz) {
        rawRects[item.id] = { x: cursor, y, w: extent, h: thickness }
        cursor += extent
      } else {
        rawRects[item.id] = { x, y: cursor, w: thickness, h: extent }
        cursor += extent
      }
    }
  }

  function squarifyRegion(items, x, y, w, h) {
    if (!items.length || w <= 0 || h <= 0) return
    if (items.length === 1) {
      rawRects[items[0].id] = { x, y, w, h }
      return
    }

    const isHoriz        = w >= h
    const stripShortSide = isHoriz ? h : w

    let row = []
    let i   = 0

    while (i < items.length) {
      const candidate      = [...row, items[i]]
      const candidateRatio = worstAspect(candidate, stripShortSide)
      const currentRatio   = row.length === 0 ? Infinity : worstAspect(row, stripShortSide)

      // Always seed a new strip with the first item (even if its lone aspect is bad).
      // After that: only grow the strip if aspect improves AND stays within bound.
      const mustSeed      = row.length === 0
      const improving     = candidateRatio <= currentRatio
      const withinBounds  = candidateRatio <= ASPECT_MAX

      if (mustSeed || (improving && withinBounds)) {
        row = candidate
        i++
      } else {
        // Growing the strip would worsen the ratio or cross the bound — commit it
        const rowArea   = row.reduce((s, it) => s + it.area, 0)
        const thickness = rowArea / (isHoriz ? w : h)

        commitStrip(row, x, y, w, h, isHoriz)

        if (isHoriz) {
          squarifyRegion(items.slice(i), x, y + thickness, w, h - thickness)
        } else {
          squarifyRegion(items.slice(i), x + thickness, y, w - thickness, h)
        }
        return
      }
    }

    // Commit the final strip — fills whatever space remains
    commitStrip(row, x, y, w, h, isHoriz)
  }

  squarifyRegion(items, 0, 0, W, H)

  // ── Apply gap (inset each cell by gap/2 on every side) ────────────────────
  const half  = gap / 2
  const rects = {}
  for (const [id, r] of Object.entries(rawRects)) {
    rects[id] = {
      x: r.x + half,
      y: r.y + half,
      w: r.w - gap,
      h: r.h - gap,
    }
  }

  return { rects }
}
