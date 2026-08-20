// nemotry.js (debug-friendly allocator)
import { point, box } from '@flatten-js/core';
import { EN_PROJECTS } from '../data/content.js';

/**
 * @typedef {{ id: string; value: number }} ProjectConcept
 */

/**
 * @typedef {{ id: string; area: number }} ProjectBlueprint
 */

/**
 * @typedef {{
 *   id: string;
 *   height: number;
 *   width: number;
 *   startx: number;
 *   starty: number;
 * }} ProjectCard
 */

// ─── Geometry primitives ─────────────────────────────────────────────────────

class SpaceSegment {
  /**
   * @param {string} id
   * @param {import('@flatten-js/core').Box} segmentBox
   * @param {string[]} mergeOptionIds
   */
  constructor(id = '0', segmentBox, mergeOptionIds = []) {
    this.id = id;
    this.box = segmentBox;
    this.mergeOptionIds = mergeOptionIds;
  }

  getStart()          { return point(this.box.xmin, this.box.ymin); }
  getWidth()          { return this.box.width; }
  getHeight()         { return this.box.height; }
  getArea()           { return this.box.width * this.box.height; }
  getSegment()        { return this.box; }
  getMergeOptionIds() { return this.mergeOptionIds; }
}

/**
 * Owns all geometry for the canvas partition.
 * Handles cuts, merges, and neighbor wiring.
 */
class Space {
  /** @type {SpaceSegment[]} */
  segments = [];

  constructor(baseWidth, baseHeight) {
    this.baseWidth  = baseWidth;
    this.baseHeight = baseHeight;
    this.base       = box(0, 0, baseWidth, baseHeight);
    this.segments.push(new SpaceSegment('0', this.base, []));
  }

  getBaseWidth()  { return this.baseWidth; }
  getBaseHeight() { return this.baseHeight; }

  /**
   * @param {string[]} segmentIds
   * @returns {SpaceSegment[]}
   */
  getSegmentsByIds(segmentIds) {
    const set = new Set(segmentIds);
    return this.segments.filter((s) => set.has(s.id));
  }

  rangesOverlap(aMin, aMax, bMin, bMax, strict = true) {
    return strict
      ? Math.max(aMin, bMin) < Math.min(aMax, bMax)
      : Math.max(aMin, bMin) <= Math.min(aMax, bMax);
  }

  /**
   * @param {{ box: import('@flatten-js/core').Box }} a
   * @param {{ box: import('@flatten-js/core').Box }} b
   */
  detectNeighborRelation(a, b) {
    const A = a.box;
    const B = b.box;

    const left   = A.xmin === B.xmax && this.rangesOverlap(A.ymin, A.ymax, B.ymin, B.ymax);
    const right  = A.xmax === B.xmin && this.rangesOverlap(A.ymin, A.ymax, B.ymin, B.ymax);
    const top    = A.ymin === B.ymax && this.rangesOverlap(A.xmin, A.xmax, B.xmin, B.xmax);
    const bottom = A.ymax === B.ymin && this.rangesOverlap(A.xmin, A.xmax, B.xmin, B.xmax);

    return { left, right, top, bottom, touching: left || right || top || bottom };
  }

  /**
   * Split the segment containing (x, y) into 4 segments.
   * Returns the TL segment.
   * @param {number} x
   * @param {number} y
   * @returns {SpaceSegment | null}
   */
  cut(x, y) {
    const p = point(x, y);

    for (let i = 0; i < this.segments.length; i++) {
      const segment = this.segments[i];
      if (!segment.box.contains(p)) continue;

      const next = this.cutSegment(segment, x, y);
      if (!next) return null;

      this.segments.splice(i, 1, ...next);
      return next[0];
    }

    return null;
  }

  /**
   * Split one segment at (x, y) into four axis-aligned rectangles.
   * @param {SpaceSegment} segment
   * @param {number} x
   * @param {number} y
   * @returns {SpaceSegment[] | null}
   */
  cutSegment(segment, x, y) {
    const { xmin, ymin, xmax, ymax } = segment.box;

    if (x <= xmin || x >= xmax || y <= ymin || y >= ymax) {
      return null;
    }

    const id = segment.id;
    const tl = new SpaceSegment(id,       box(xmin, ymin, x,    y),    []);
    const tr = new SpaceSegment(id + '1', box(x,    ymin, xmax, y),    []);
    const bl = new SpaceSegment(id + '2', box(xmin, y,    x,    ymax), []);
    const br = new SpaceSegment(id + '3', box(x,    y,    xmax, ymax), []);

    const pool = this.segments.concat([tl, tr, bl, br]);
    this.newNeighbours(tl.box, tl.id, pool);
    this.newNeighbours(tr.box, tr.id, pool);
    this.newNeighbours(bl.box, bl.id, pool);
    this.newNeighbours(br.box, br.id, pool);

    return [tl, tr, bl, br];
  }

  /**
   * @param {import('@flatten-js/core').Box} relocatedBox
   * @param {string} relocatedId
   * @param {SpaceSegment[]} segments
   */
  newNeighbours(relocatedBox, relocatedId, segments) {
    const cell = { box: relocatedBox };

    const neighbors = segments.filter(
      (other) =>
        other.id !== relocatedId &&
        this.detectNeighborRelation(cell, other).touching
    );

    const relocated = segments.find((s) => s.id === relocatedId);
    if (!relocated) return;

    relocated.mergeOptionIds = neighbors.map((n) => n.id);

    for (const n of neighbors) {
      if (!n.mergeOptionIds.includes(relocatedId)) {
        n.mergeOptionIds.push(relocatedId);
      }
    }
  }

  /**
   * @param {{x:number,y:number}} start
   * @param {{x:number,y:number}} end
   * @returns {SpaceSegment | null}
   */
  pack(start, end) {
    const region = box(
      Math.min(start.x, end.x), Math.min(start.y, end.y),
      Math.max(start.x, end.x), Math.max(start.y, end.y)
    );

    const inside = this.segments.filter((s) => region.contains(s.box));
    if (inside.length === 0) return null;
    if (inside.length === 1) return inside[0];
    return this.mergeSegments(inside);
  }

  /**
   * @param {SpaceSegment[]} segments
   * @returns {SpaceSegment | null}
   */
  mergeSegments(segments) {
    if (!segments.length) return null;
    if (segments.length === 1) return segments[0];

    const parentIds = new Set(segments.map((s) => s.id));
    const mergedBox = segments.map((s) => s.box).reduce((acc, b) => acc.merge(b));

    const tlSeg = segments.reduce(
      (best, s) =>
        !best ||
        s.box.low.y < best.box.low.y ||
        (s.box.low.y === best.box.low.y && s.box.low.x < best.box.low.x)
          ? s
          : best,
      null
    );
    const newId = tlSeg.id;

    const graphNeighborIds = new Set(
      segments.flatMap((s) => s.mergeOptionIds.filter((id) => !parentIds.has(id)))
    );

    this.segments = this.segments.filter((s) => !parentIds.has(s.id));
    for (const s of this.segments) {
      s.mergeOptionIds = s.mergeOptionIds.filter((id) => !parentIds.has(id));
    }

    const geomNeighborIds = this.segments
      .filter((o) => this.detectNeighborRelation({ box: mergedBox }, o).touching)
      .map((g) => g.id);

    const mergedOptionIds = [...new Set([...graphNeighborIds, ...geomNeighborIds])];

    const merged = new SpaceSegment(newId, mergedBox, mergedOptionIds);
    this.segments.push(merged);

    for (const nid of mergedOptionIds) {
      const n = this.segments.find((s) => s.id === nid);
      if (n && !n.mergeOptionIds.includes(newId)) {
        n.mergeOptionIds.push(newId);
      }
    }

    return merged;
  }
}

// ─── SpaceAllocator ──────────────────────────────────────────────────────────

const EPSILON          = 1e-9;
const RECT_MERGE_EPSILON = 1e-6; // bbox vs sum-of-areas (same idea as projectLayout)
const MIN_RATIO  = 1 / 2.5;  // 0.4
const MAX_RATIO  = 2.5;
const BUFFER     = 0.10;

/**
 * True if the union of two axis-aligned boxes is a single rectangle (no L-shape / gap).
 * @param {SpaceSegment} a
 * @param {SpaceSegment} b
 */
function validRectangularMergePair(a, b) {
  const mergedBox  = a.box.merge(b.box);
  const mergedArea = mergedBox.width * mergedBox.height;
  const areaSum    = a.getArea() + b.getArea();
  return Math.abs(mergedArea - areaSum) < RECT_MERGE_EPSILON;
}

class SpaceAllocator {
  /** @param {Space} space */
  constructor(space) {
    this.space       = space;
    this.parentRatio = space.getBaseWidth() / (space.getBaseHeight() || 1);
    /** @type {Set<string>} */
    this.allocatedIds = new Set();
    /** Card TL segments live off `space.segments` until merged with free space — keep refs for post-pass. */
    /** @type {Map<string, SpaceSegment>} */
    this.allocatedSegById = new Map();
  }

  // ─── SHAPING ───────────────────────────────────────────────────────────────

  /**
   * Try 4 pin strategies and return the best {w, h, priority} that satisfies
   * aspect-ratio and area-buffer constraints, or null if none pass.
   *
   * Priority:
   *   0 = touches both edges  (fills a full row or column — fewest new segments)
   *   1 = touches one edge
   *   2 = free-float
   *
   * @param {number} targetArea
   * @param {number} segW
   * @param {number} segH
   * @returns {{ w: number; h: number; priority: number } | null}
   */
  _shape(targetArea, segW, segH) {
    const areaMin = targetArea * (1 - BUFFER);
    const areaMax = targetArea * (1 + BUFFER);

    /**
     * @param {number|null} pinW
     * @param {number|null} pinH
     */
    const tryPin = (pinW, pinH) => {
      let w = pinW;
      let h = pinH;

      if (pinW !== null && pinH === null) {
        h = targetArea / pinW;
      } else if (pinH !== null && pinW === null) {
        w = targetArea / pinH;
      }

      if (!w || !h || w <= 0 || h <= 0)           return null;
      if (w > segW + EPSILON)                       return null;
      if (h > segH + EPSILON)                       return null;

      const ratio = w / h;
      if (ratio < MIN_RATIO - EPSILON)              return null;
      if (ratio > MAX_RATIO + EPSILON)              return null;

      const area = w * h;
      if (area < areaMin - EPSILON)                 return null;
      if (area > areaMax + EPSILON)                 return null;

      const touchesW = Math.abs(w - segW) < EPSILON;
      const touchesH = Math.abs(h - segH) < EPSILON;
      const priority = touchesW && touchesH ? 0 : touchesW || touchesH ? 1 : 2;

      return { w, h, priority, delta: Math.abs(area - targetArea) };
    };

    const side = Math.sqrt(targetArea);

    const candidates = [
      tryPin(segW, segH),                                   // full fill
      tryPin(segW, null),                                   // pin width
      tryPin(null, segH),                                   // pin height
      tryPin(Math.min(side, segW), Math.min(side, segH)),   // square-ish
    ].filter(Boolean);

    if (!candidates.length) return null;

    candidates.sort(
      (a, b) => a.priority - b.priority || a.delta - b.delta
    );

    const { w, h, priority } = candidates[0];
    return { w, h, priority };
  }

  // ─── CANDIDATE SELECTION ───────────────────────────────────────────────────

  /**
   * PASS 1: ratio-compliant segments where _shape succeeds.
   *         Pick by priority ASC then delta ASC.
   * PASS 2: fallback — closest area segment, no constraints.
   *
   * @param {ProjectBlueprint} blueprint
   * @returns {{ segment: SpaceSegment; dims: { w: number; h: number } } | null}
   */
  _pickSegment(blueprint) {
    const unallocated = this.space.segments.filter(
      (s) => !this.allocatedIds.has(s.id)
    );

    if (!unallocated.length) return null;

    // ── PASS 1 ──────────────────────────────────────────────────────────────
    let best = null; // { segment, dims, priority, delta }

    for (const seg of unallocated) {
      const ratio = seg.getWidth() / (seg.getHeight() || 1);
      if (ratio < MIN_RATIO - EPSILON || ratio > MAX_RATIO + EPSILON) continue;

      const dims = this._shape(blueprint.area, seg.getWidth(), seg.getHeight());
      if (!dims) continue;

      const delta = Math.abs(dims.w * dims.h - blueprint.area);

      if (
        !best ||
        dims.priority < best.priority ||
        (dims.priority === best.priority && delta < best.delta)
      ) {
        best = { segment: seg, dims, priority: dims.priority, delta };
      }
    }

    if (best) return { segment: best.segment, dims: best.dims };

    // ── PASS 2: fallback — closest area, no ratio/buffer requirement ─────────
    let fallback = null;
    let fallbackDelta = Infinity;

    for (const seg of unallocated) {
      const delta = Math.abs(seg.getArea() - blueprint.area);
      if (delta < fallbackDelta) {
        fallbackDelta = delta;
        fallback = seg;
      }
    }

    if (!fallback) return null;

    const dims =
      this._shape(blueprint.area, fallback.getWidth(), fallback.getHeight()) ??
      { w: fallback.getWidth(), h: fallback.getHeight() };

    return { segment: fallback, dims };
  }

  // ─── CUT ───────────────────────────────────────────────────────────────────

  /**
   * Remove `segment` from space, cut it at (xmin+w, ymin+h), push TR/BL/BR
   * back as free segments, and return the TL piece (the card's region).
   *
   * If the card fills the segment exactly, just remove it and return it as-is.
   *
   * @param {SpaceSegment} segment
   * @param {number} w
   * @param {number} h
   * @returns {SpaceSegment}
   */
  _cut(segment, w, h) {
    const cutX = segment.box.xmin + w;
    const cutY = segment.box.ymin + h;

    const fillsWidth  = Math.abs(cutX - segment.box.xmax) < EPSILON;
    const fillsHeight = Math.abs(cutY - segment.box.ymax) < EPSILON;

    // Remove segment from live list first — prevents cutSegment pool confusion
    const idx = this.space.segments.indexOf(segment);
    if (idx !== -1) this.space.segments.splice(idx, 1);

    if (fillsWidth && fillsHeight) {
      // Card fills segment exactly — nothing to push back
      return segment;
    }

    if (fillsWidth) {
      // Only need a horizontal cut — split into top (card) and bottom (free)
      // Simulate by cutting at the exact right edge: cutSegment needs strict interior
      // so we handle the two degenerate cases manually
      const id = segment.id;
      const { xmin, ymin, xmax, ymax } = segment.box;
      const top    = new SpaceSegment(id,       box(xmin, ymin, xmax, cutY), []);
      const bottom = new SpaceSegment(id + '2', box(xmin, cutY, xmax, ymax), []);
      const pool   = this.space.segments.concat([top, bottom]);
      this.space.newNeighbours(top.box,    top.id,    pool);
      this.space.newNeighbours(bottom.box, bottom.id, pool);
      if (bottom.getArea() > EPSILON) this.space.segments.push(bottom);
      return top;
    }

    if (fillsHeight) {
      // Only need a vertical cut — split into left (card) and right (free)
      const id = segment.id;
      const { xmin, ymin, xmax, ymax } = segment.box;
      const left  = new SpaceSegment(id,       box(xmin, ymin, cutX, ymax), []);
      const right = new SpaceSegment(id + '1', box(cutX, ymin, xmax, ymax), []);
      const pool  = this.space.segments.concat([left, right]);
      this.space.newNeighbours(left.box,  left.id,  pool);
      this.space.newNeighbours(right.box, right.id, pool);
      if (right.getArea() > EPSILON) this.space.segments.push(right);
      return left;
    }

    // General case: full 4-way cut
    const subs = this.space.cutSegment(segment, cutX, cutY);
    if (!subs) {
      // cutSegment returned null (point not strictly interior) — use segment as-is
      return segment;
    }

    const [tl, tr, bl, br] = subs;
    // TL is the card's region — keep it out of live segments
    // Push TR, BL, BR as free space (skip zero-area slivers)
    for (const sub of [tr, bl, br]) {
      if (sub.getArea() > EPSILON) this.space.segments.push(sub);
    }

    return tl;
  }

  // ─── MAIN ENTRY POINTS ─────────────────────────────────────────────────────

  /**
   * @param {ProjectBlueprint} blueprint
   * @returns {{ card: ProjectCard; allocSegmentId: string } | null}
   */
  allocateBlueprint(blueprint) {
    const result = this._pickSegment(blueprint);
    if (!result) return null;

    const { segment, dims } = result;
    const actualSeg = this._cut(segment, dims.w, dims.h);

    this.allocatedIds.add(actualSeg.id);
    this.allocatedSegById.set(actualSeg.id, actualSeg);

    const card = {
      id:     blueprint.id,
      width:  dims.w,
      height: dims.h,
      startx: actualSeg.box.xmin,
      starty: actualSeg.box.ymin,
    };
    return { card, allocSegmentId: actualSeg.id };
  }

  /**
   * After initial cuts, merge flush free strips into adjacent card cells when the
   * pair forms a valid rectangle; keeps `ProjectCard` bounds aligned with the merged segment.
   *
   * @param {Map<string, ProjectCard>} segmentIdToCard
   */
  _postMergeUnallocatedWithAllocated(segmentIdToCard) {
    const cap = Math.max(8, this.space.segments.length * 4);
    let passes = 0;

    while (passes++ < cap) {
      let didMerge = false;

      for (const U of [...this.space.segments]) {
        if (this.allocatedIds.has(U.id)) continue;

        for (const nid of U.mergeOptionIds) {
          if (!this.allocatedIds.has(nid)) continue;

          const A =
            this.allocatedSegById.get(nid) ??
            this.space.segments.find((s) => s.id === nid);
          if (!A) continue;
          if (!validRectangularMergePair(U, A)) continue;

          const card = segmentIdToCard.get(A.id);
          if (!card) continue;

          const merged = this.space.mergeSegments([U, A]);
          if (!merged) continue;

          this.allocatedIds.delete(U.id);
          this.allocatedIds.delete(A.id);
          this.allocatedIds.add(merged.id);

          this.allocatedSegById.delete(A.id);
          this.allocatedSegById.set(merged.id, merged);

          segmentIdToCard.delete(A.id);
          segmentIdToCard.set(merged.id, card);

          const b = merged.box;
          card.startx = b.xmin;
          card.starty = b.ymin;
          card.width  = b.width;
          card.height = b.height;

          didMerge = true;
          break;
        }
        if (didMerge) break;
      }

      if (!didMerge) break;
    }
  }

  /**
   * @param {ProjectConcept[]} concepts
   * @returns {ProjectCard[]}
   */
  allocate(concepts) {
    if (!concepts.length) return [];

    const totalValue = concepts.reduce((sum, c) => sum + (c.value ?? 0), 0);
    if (totalValue === 0) return [];

    const totalArea = this.space.getBaseWidth() * this.space.getBaseHeight();

    const blueprints = concepts
      .map((c) => ({ id: c.id, area: (c.value / totalValue) * totalArea }))
      .sort((a, b) => b.area - a.area);

    const cards = [];
    /** @type {Map<string, ProjectCard>} */
    const segmentIdToCard = new Map();

    this.allocatedSegById.clear();

    for (const bp of blueprints) {
      const placed = this.allocateBlueprint(bp);
      if (placed) {
        cards.push(placed.card);
        segmentIdToCard.set(placed.allocSegmentId, placed.card);
      }
    }

    this._postMergeUnallocatedWithAllocated(segmentIdToCard);
    return cards;
  }
}

/**
 * Pack projects into a width×height canvas (v3 allocator).
 * Same card shape as legacy helpers: `{ id, width, height, startx, starty }`.
 *
 * @param {number} widthConstraint
 * @param {number} heightConstraint
 * @param {Array<{ id: string, value?: number }>} [projectItems]
 * @returns {ProjectCard[]}
 */
export function getProjectCards(
  widthConstraint,
  heightConstraint,
  projectItems = EN_PROJECTS
) {
  if (widthConstraint <= 0 || heightConstraint <= 0) return [];

  const space     = new Space(widthConstraint, heightConstraint);
  const allocator = new SpaceAllocator(space);
  const concepts  = projectItems.map((p) => ({
    id:    p.id,
    value: typeof p.value === 'number' ? p.value : 1,
  }));

  return allocator.allocate(concepts);
}

export { Space, SpaceAllocator };
