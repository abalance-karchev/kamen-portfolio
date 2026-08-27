function sumAreas(row) {
  return row.reduce((acc, item) => acc + item.area, 0)
}

function worstAspectRatio(row, shortSide) {
  if (!row.length || shortSide <= 0) return Number.POSITIVE_INFINITY
  const areaSum = sumAreas(row)
  if (areaSum <= 0) return Number.POSITIVE_INFINITY

  let maxArea = -Infinity
  let minArea = Infinity

  for (const item of row) {
    if (item.area > maxArea) maxArea = item.area
    if (item.area < minArea) minArea = item.area
  }

  const side2 = shortSide * shortSide
  const sum2 = areaSum * areaSum
  const first = (side2 * maxArea) / sum2
  const second = sum2 / (side2 * minArea)
  return Math.max(first, second)
}

function layoutRow(row, rect, horizontal, out) {
  const rowArea = sumAreas(row)
  if (rowArea <= 0) return rect

  if (horizontal) {
    // Items are stacked left-to-right; the row occupies a horizontal band
    const rowHeight = rowArea / rect.width
    let cursorX = rect.x
    for (const item of row) {
      const width = item.area / rowHeight
      out.push({ id: item.id, x: cursorX, y: rect.y, width, height: rowHeight })
      cursorX += width
    }
    return {
      x: rect.x,
      y: rect.y + rowHeight,
      width: rect.width,
      height: rect.height - rowHeight,
    }
  }

  // Items are stacked top-to-bottom; the row occupies a vertical band
  const rowWidth = rowArea / rect.height
  let cursorY = rect.y
  for (const item of row) {
    const height = item.area / rowWidth
    out.push({ id: item.id, x: rect.x, y: cursorY, width: rowWidth, height })
    cursorY += height
  }
  return {
    x: rect.x + rowWidth,
    y: rect.y,
    width: rect.width - rowWidth,
    height: rect.height,
  }
}

function normalizeItems(items, width, height) {
  const safeItems = items.filter(item => item && item.id)
  const valued = safeItems.filter(item => Number.isFinite(item.value) && item.value > 0)
  const auto = safeItems.filter(item => !Number.isFinite(item.value) || item.value <= 0)

  const valuedSum = valued.reduce((acc, item) => acc + item.value, 0)
  const valuedAvg = valued.length ? valuedSum / valued.length : 1
  const autoValue = valuedAvg > 0 ? valuedAvg : 1
  const totalWeight = valuedSum + auto.length * autoValue
  const containerArea = Math.max(0, width) * Math.max(0, height)

  if (containerArea <= 0 || totalWeight <= 0) return []

  return safeItems
    .map(item => {
      const weight =
        Number.isFinite(item.value) && item.value > 0 ? item.value : autoValue
      return {
        id: item.id,
        area: (weight / totalWeight) * containerArea,
      }
    })
    .sort((a, b) => b.area - a.area)
}

/**
 * Squarified Treemap — Bruls, Huizing, van Wijk (2000)
 *
 * Items are placed largest-first into the free rectangle, building rows
 * along the shorter side. A new item is added to the current row only
 * while doing so *strictly improves* the worst aspect ratio; otherwise
 * the row is committed and a fresh row starts on the remaining rectangle.
 *
 * @param {Array<{id: string, value: number}>} items
 * @param {number} containerWidth
 * @param {number} containerHeight
 * @param {number} gap  - pixel gap between tiles (default 8)
 * @returns {Array<{id, x, y, width, height}>}
 */
export function squarify(items, containerWidth, containerHeight, gap = 8) {
  const width = Math.max(0, containerWidth)
  const height = Math.max(0, containerHeight)
  const normalized = normalizeItems(items, width, height)
  const rects = []

  if (!normalized.length) return rects

  let remaining = [...normalized]
  let freeRect = { x: 0, y: 0, width, height }

  while (remaining.length > 0 && freeRect.width > 1 && freeRect.height > 1) {
    // Recompute orientation for the current free rect on every iteration
    const horizontal = freeRect.width >= freeRect.height
    const shortSide = horizontal ? freeRect.height : freeRect.width

    let row = [remaining[0]]
    let i = 1

    while (i < remaining.length) {
      const candidate = [...row, remaining[i]]
      // Only extend the row when aspect ratio *strictly* improves
      if (worstAspectRatio(candidate, shortSide) < worstAspectRatio(row, shortSide)) {
        row = candidate
        i += 1
      } else {
        break
      }
    }

    freeRect = layoutRow(row, freeRect, horizontal, rects)
    remaining = remaining.slice(row.length)
  }

  const halfGap = Math.max(0, gap) / 2
  return rects.map(rect => ({
    id: rect.id,
    x: rect.x + halfGap,
    y: rect.y + halfGap,
    width: Math.max(0, rect.width - halfGap * 2),
    height: Math.max(0, rect.height - halfGap * 2),
  }))
}
