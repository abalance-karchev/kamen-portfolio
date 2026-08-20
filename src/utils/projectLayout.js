// projectLayout.js
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

/**
 * @typedef {{
 *   id: string;
 *   area: number;
 *   type: 'real' | 'potential';
 *   segments?: SpaceSegment[];
 * }} Candidate
 */

// ─── Constants ────────────────────────────────────────────────────────────────

const ASPECT = 1.5;           // width : height ratio for all cards
const MARGIN_WINDOW = 0.1;    // 10% of project area as match tolerance
const RECT_EPSILON = 1e-6;    // float tolerance for rectangle validity check

// ─── SpaceSegment ─────────────────────────────────────────────────────────────

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

  /** Top-left corner point */
  getStart()           { return point(this.box.xmin, this.box.ymin); }
  getWidth()           { return this.box.width; }
  getHeight()          { return this.box.height; }
  getArea()            { return this.box.width * this.box.height; }
  getSegment()         { return this.box; }
  getMergeOptionIds()  { return this.mergeOptionIds; }
}

// ─── Space ────────────────────────────────────────────────────────────────────

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
   * Returns adjacency flags between two box-bearing objects.
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
   * Returns the TL segment (caller allocates it to a project).
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
      return next[0]; // TL
    }

    return null;
  }

  /**
   * Split one segment at (x, y) into four axis-aligned rectangles:
   *   TL [xmin,ymin → x,y]   TR [x,ymin → xmax,y]
   *   BL [xmin,y   → x,ymax] BR [x,y    → xmax,ymax]
   *
   * Only valid when (x, y) is strictly inside the box.
   *
   * @param {SpaceSegment} segment
   * @param {number} x
   * @param {number} y
   * @returns {SpaceSegment[] | null}
   */
  cutSegment(segment, x, y) {
    const { xmin, ymin, xmax, ymax } = segment.box;

    if (x <= xmin || x >= xmax || y <= ymin || y >= ymax) return null;

    const id = segment.id;
    const tl = new SpaceSegment(id,              box(xmin, ymin, x,    y),    []);
    const tr = new SpaceSegment(id.concat('1'),  box(x,    ymin, xmax, y),    []);
    const bl = new SpaceSegment(id.concat('2'),  box(xmin, y,    x,    ymax), []);
    const br = new SpaceSegment(id.concat('3'),  box(x,    y,    xmax, ymax), []);

    // Pass existing segments + all 4 siblings so each new cell discovers
    // both external neighbours and its own siblings in one pass.
    const pool = this.segments.concat([tl, tr, bl, br]);
    this.newNeighbours(tl.box, tl.id, pool);
    this.newNeighbours(tr.box, tr.id, pool);
    this.newNeighbours(bl.box, bl.id, pool);
    this.newNeighbours(br.box, br.id, pool);

    return [tl, tr, bl, br];
  }

  /**
   * Wire mergeOptionIds between one new cell and all edge-adjacent segments.
   * Mutates both the relocated cell and its neighbours in place.
   *
   * @param {import('@flatten-js/core').Box} relocatedBox
   * @param {string} relocatedId
   * @param {SpaceSegment[]} segments  — authoritative list including the new cell
   */
  newNeighbours(relocatedBox, relocatedId, segments) {
    const cell = { box: relocatedBox };

    const neighbors = segments.filter(
      (other) => other.id !== relocatedId && this.detectNeighborRelation(cell, other).touching
    );

    const relocated = segments.find((s) => s.id === relocatedId);
    if (!relocated) return;

    // Overwrite entirely — cell is brand-new, no prior neighbours to preserve
    relocated.mergeOptionIds = neighbors.map((n) => n.id);

    for (const n of neighbors) {
      // Use Set to guarantee no duplicate id is added
      if (!n.mergeOptionIds.includes(relocatedId)) {
        n.mergeOptionIds.push(relocatedId);
      }
    }
  }

  /**
   * Merge every free segment whose box is fully inside the region defined
   * by two corner points.
   * @param {{ x: number; y: number }} start
   * @param {{ x: number; y: number }} end
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
   * Merge a set of segments (must form a perfect rectangle).
   * Removes parent segments, scrubs their ids from neighbours,
   * and inserts a single merged segment.
   *
   * @param {SpaceSegment[]} segments
   * @returns {SpaceSegment | null}
   */
  mergeSegments(segments) {
    if (!segments.length) return null;
    if (segments.length === 1) return segments[0];

    const parentIds = new Set(segments.map((s) => s.id));

    // Capture all needed data BEFORE mutating this.segments
    const mergedBox = segments.map((s) => s.box).reduce((acc, b) => acc.merge(b));

    // Use top-left segment's id as the merged id
    const newId = segments.reduce((best, s) =>
      !best ||
      s.box.low.y < best.box.low.y ||
      (s.box.low.y === best.box.low.y && s.box.low.x < best.box.low.x)
        ? s : best
    , null).id;

    // Collect external graph neighbours (those not being merged away)
    const graphNeighborIds = new Set(
      segments.flatMap((s) => s.mergeOptionIds.filter((id) => !parentIds.has(id)))
    );

    // Remove parents and scrub their ids from remaining segments
    this.segments = this.segments.filter((s) => !parentIds.has(s.id));
    for (const s of this.segments) {
      s.mergeOptionIds = s.mergeOptionIds.filter((id) => !parentIds.has(id));
    }

    // Re-detect geometric neighbours of the new merged box (catches any missed by graph)
    const geomNeighborIds = this.segments
      .filter((o) => this.detectNeighborRelation({ box: mergedBox }, o).touching)
      .map((g) => g.id);

    const mergedOptionIds = [...new Set([...graphNeighborIds, ...geomNeighborIds])];

    const merged = new SpaceSegment(newId, mergedBox, mergedOptionIds);
    this.segments.push(merged);

    // Symmetrically add merged id to each neighbour's list
    for (const nid of mergedOptionIds) {
      const n = this.segments.find((s) => s.id === nid);
      if (n && !n.mergeOptionIds.includes(newId)) {
        n.mergeOptionIds.push(newId);
      }
    }

    return merged;
  }
}

// ─── Content parsing ──────────────────────────────────────────────────────────

/**
 * @param {Array<{ id: string; value: number }>} items
 * @returns {ProjectConcept[]}
 */
function parseContent(items) {
  return items.map((p) => ({ id: p.id, value: p.value }));
}

/**
 * Proportionally translate project values to canvas areas.
 * @param {ProjectConcept[]} concepts
 * @param {number} totalArea
 * @returns {ProjectBlueprint[]}
 */
function conceptsToBlueprints(concepts, totalArea) {
  const totalValue =
    concepts.reduce((acc, c) => acc + (typeof c.value === 'number' ? c.value : 0), 0) || 1;

  return concepts.map((c) => ({
    id:   c.id,
    area: (c.value / totalValue) * totalArea,
  }));
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Round area to nearest integer for use as a Map key */
function bucketArea(area) {
  return Math.round(area);
}

/**
 * Apply credit delta from one allocation step.
 * actual > desired → we used more space (BUY debt, credit goes negative)
 * actual < desired → we compressed (SELL gain, credit goes positive)
 * @param {number} credit
 * @param {number} actual
 * @param {number} desired
 * @returns {number}
 */
function applyCredit(credit, actual, desired) {
  return credit - (actual - desired); // unified: overdraft lowers, underspend raises
}

// ─── SpaceAllocator ───────────────────────────────────────────────────────────

class SpaceAllocator {
  /**
   * @param {Space} space
   * @param {ProjectBlueprint[]} blueprints
   */
  constructor(space, blueprints) {
    this.space      = space;
    this.blueprints = [...blueprints];
    this.credit     = 0;

    // Ratio: acceptable area mismatch = marginWindow * projectArea
    this.marginWindow = MARGIN_WINDOW;

    this.minaProjectArea = 0;

    /** @type {Map<number, string[]>} bucket → [segmentId | potentialId] */
    this.segmentMarket = new Map();

    /** @type {Map<string, string[]>} potentialId → [realId, realId] */
    this.potentialIds = new Map();

    /** @type {Set<string>} ids of segments already allocated to a project (sites) */
    this.allocatedIds = new Set();

    this._init();
  }

  _init() {
    this.minaProjectArea =
      this.blueprints.reduce((min, b) => (min == null ? b.area : Math.min(min, b.area)), null) ?? 0;

    this._rebuildSegmentMarket();
  }

  /**
   * BUY  — credit < 0: we've wasted space; prefer bigger segments to keep debt from growing.
   * SELL — credit >= 0: we start here; prefer smaller segments to build positive credit first.
   * No NEUTRAL state — at zero we default to SELL (build credit before going into debt).
   */
  get mode() {
    return this.credit < 0 ? 'BUY' : 'SELL';
  }

  // ── Market management ───────────────────────────────────────────────────────

  _rebuildSegmentMarket() {
    this.segmentMarket.clear();
    this.potentialIds.clear(); // potentials rebuilt separately via mergePotential

    for (const seg of this.space.segments) {
      if (this.allocatedIds.has(seg.id)) continue;
      this._addRealToMarket(seg);
    }
  }

  /** @param {string} id */
  _removeFromMarket(id) {
    for (const [bucket, ids] of this.segmentMarket.entries()) {
      const next = ids.filter((x) => x !== id);
      if (next.length !== ids.length) {
        next.length === 0
          ? this.segmentMarket.delete(bucket)
          : this.segmentMarket.set(bucket, next);
        return; // each id lives in exactly one bucket
      }
    }
  }

  /** @param {SpaceSegment} segment */
  _addRealToMarket(segment) {
    if (this.allocatedIds.has(segment.id)) return;
    const bucket = bucketArea(segment.getArea());
    if (!this.segmentMarket.has(bucket)) this.segmentMarket.set(bucket, []);
    this.segmentMarket.get(bucket).push(segment.id);
  }

  /** Full rebuild — called after any structural change (cut / merge / allocate) */
  _updateSegmentMarket() {
    this._rebuildSegmentMarket();
    this.mergePotential();
  }

  // ── Potential merges ────────────────────────────────────────────────────────

  /**
   * Discover all pairwise merges between free neighbouring segments that form
   * a valid rectangle (bounding-box area === sum of areas).
   * Adds entries to potentialIds and segmentMarket.
   */
  mergePotential() {
    this.potentialIds.clear();
    // Remove stale potential entries from the market
    for (const [bucket, ids] of this.segmentMarket.entries()) {
      const next = ids.filter((id) => !id.startsWith('p-'));
      next.length === 0
        ? this.segmentMarket.delete(bucket)
        : this.segmentMarket.set(bucket, next);
    }

    for (const s of this.space.segments) {
      if (this.allocatedIds.has(s.id)) continue;

      for (const nid of s.mergeOptionIds) {
        if (this.allocatedIds.has(nid)) continue;

        const n = this.space.segments.find((x) => x.id === nid);
        if (!n) continue;

        // Process each pair once: only when s.id < n.id lexicographically
        if (s.id >= n.id) continue;

        const mergedBox  = s.box.merge(n.box);
        const mergedArea = mergedBox.width * mergedBox.height;
        const areaSum    = s.getArea() + n.getArea();

        // Valid rectangle: bounding box area must equal combined area (no gaps)
        if (Math.abs(mergedArea - areaSum) >= RECT_EPSILON) continue;

        const potentialId = `p-${s.id}-${n.id}`;
        this.potentialIds.set(potentialId, [s.id, n.id]);

        const bucket = bucketArea(mergedArea);
        if (!this.segmentMarket.has(bucket)) this.segmentMarket.set(bucket, []);

        // Guard: don't add the same potentialId twice to the same bucket
        const bucketList = this.segmentMarket.get(bucket);
        if (!bucketList.includes(potentialId)) bucketList.push(potentialId);
      }
    }
  }

  // ── Candidate selection ─────────────────────────────────────────────────────

  /**
   * Collect all free real and potential candidates, then partition into:
   *   bigger  — smallest candidate with area > projectArea (best fit from above)
   *   smaller — all candidates with area < projectArea
   *
   * If a perfect match (within margin) is found it is returned as bigger
   * with smaller = [], regardless of mode (perfect match is always taken).
   *
   * Mode-specific priority between bigger/smaller is handled by allocateBlueprint.
   *
   * @param {ProjectBlueprint} blueprint
   * @returns {{ bigger: Candidate | null; smaller: Candidate[] }}
   */
  candidateSegments(blueprint) {
    const projectArea = blueprint.area;
    const margin      = projectArea * this.marginWindow;

    /** @type {Candidate[]} */
    const candidates = [];

    for (const seg of this.space.segments) {
      if (this.allocatedIds.has(seg.id)) continue;
      candidates.push({ id: seg.id, area: seg.getArea(), type: 'real' });
    }

    for (const [pid, realIds] of this.potentialIds.entries()) {
      const segs = this.space.getSegmentsByIds(realIds);
      if (segs.some((s) => this.allocatedIds.has(s.id))) continue;
      const area = segs.reduce((acc, s) => acc + s.getArea(), 0);
      candidates.push({ id: pid, area, type: 'potential', segments: segs });
    }

    // Perfect match — skip mode logic entirely
    const perfect = candidates.find((c) => Math.abs(c.area - projectArea) <= margin);
    if (perfect) return { bigger: perfect, smaller: [] };

    const smaller = [];
    let bestBigger = null;

    for (const c of candidates) {
      if (c.area < projectArea) {
        smaller.push(c);
      } else if (!bestBigger || c.area < bestBigger.area) {
        bestBigger = c;
      }
    }

    return { bigger: bestBigger, smaller };
  }

  // ── Allocation primitives ───────────────────────────────────────────────────

  /**
   * Mark a concrete segment as a site and build its ProjectCard.
   * Does NOT cut — call allocateWithCut when the segment is oversized.
   * @param {SpaceSegment} segment
   * @param {ProjectBlueprint} blueprint
   * @returns {ProjectCard}
   */
  _allocate(segment, blueprint) {
    this.allocatedIds.add(segment.id);
    this._removeFromMarket(segment.id);

    const start = segment.getStart();
    const area  = segment.getArea();

    // Compute card dimensions from area + aspect ratio, clamped to segment bounds
    let w = Math.sqrt(area / ASPECT);
    let h = w * ASPECT;
    if (w > segment.getWidth() || h > segment.getHeight()) {
      w = segment.getWidth();
      h = Math.min(area / w, segment.getHeight());
    }

    return { id: blueprint.id, width: w, height: h, startx: start.x, starty: start.y };
  }

  /**
   * If candidate is potential, execute the merge first; otherwise return the real segment.
   * @param {Candidate} candidate
   * @returns {SpaceSegment | null}
   */
  _mergeCandidate(candidate) {
    if (candidate.type === 'real') {
      return this.space.segments.find((s) => s.id === candidate.id) ?? null;
    }

    const realIds = this.potentialIds.get(candidate.id) ?? [];
    const segs    = candidate.segments ?? this.space.getSegmentsByIds(realIds);
    if (!segs.length) return null;

    for (const s of segs) this._removeFromMarket(s.id);
    this._removeFromMarket(candidate.id);
    this.potentialIds.delete(candidate.id);

    const merged = this.space.mergeSegments(segs);
    if (merged) this._addRealToMarket(merged);
    return merged;
  }

  /**
   * Compute (x, y) cut point so that TL quadrant matches blueprint area at ASPECT ratio.
   * Falls back to full width if ideal dimensions exceed segment bounds.
   * @param {SpaceSegment} segment
   * @param {ProjectBlueprint} blueprint
   * @returns {{ x: number; y: number }}
   */
  _computeCutPoint(segment, blueprint) {
    const { xmin, ymin, xmax, ymax } = segment.box;

    let w = Math.sqrt(blueprint.area / ASPECT);
    let h = w * ASPECT;

    if (w > xmax - xmin || h > ymax - ymin) {
      w = xmax - xmin;
      h = Math.min(blueprint.area / w, ymax - ymin);
    }

    return { x: xmin + w, y: ymin + h };
  }

  /**
   * Cut segment so TL = blueprint target area, then allocate TL.
   * Falls back to whole-segment allocation if cut is geometrically invalid.
   * @param {SpaceSegment} segment
   * @param {ProjectBlueprint} blueprint
   * @returns {ProjectCard}
   */
  _allocateWithCut(segment, blueprint) {
    const { x, y } = this._computeCutPoint(segment, blueprint);
    const tl = this.space.cut(x, y);

    const target = tl ?? segment;
    const card   = this._allocate(target, blueprint);
    this.credit  = applyCredit(this.credit, target.getArea(), blueprint.area);
    this._updateSegmentMarket();
    return card;
  }

  // ── Main allocation step ────────────────────────────────────────────────────

  /**
   * Allocate one blueprint using BUY/SELL heuristic.
   * @param {ProjectBlueprint} blueprint
   * @returns {ProjectCard | null}
   */
  allocateBlueprint(blueprint) {
    this.mergePotential();

    const { bigger, smaller } = this.candidateSegments(blueprint);

    // SELL (credit >= 0): prefer smaller to build/preserve positive credit
    // BUY  (credit <  0): prefer bigger to avoid deepening debt
    let chosen = null;
    const largestSmaller = smaller.length
      ? smaller.reduce((best, c) => (c.area > best.area ? c : best))
      : null;

    if (this.mode === 'SELL') {
      chosen = largestSmaller ?? bigger;
    } else {
      chosen = bigger ?? largestSmaller;
    }

    if (!chosen) return null;

    const segment = this._mergeCandidate(chosen);
    if (!segment) return null;

    if (segment.getArea() >= blueprint.area) {
      return this._allocateWithCut(segment, blueprint);
    }

    // Segment is smaller than target — allocate whole, accept compression
    const card  = this._allocate(segment, blueprint);
    this.credit = applyCredit(this.credit, segment.getArea(), blueprint.area);
    this._updateSegmentMarket();
    return card;
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Compute pixel-accurate ProjectCard layout for the given canvas dimensions.
 * @param {number} widthConstraint
 * @param {number} heightConstraint
 * @param {Array<{ id: string; value: number }>} [projectItems]
 * @returns {ProjectCard[]}
 */
export function getProjectCards(
  widthConstraint,
  heightConstraint,
  projectItems = EN_PROJECTS
) {
  const space      = new Space(widthConstraint, heightConstraint);
  const totalArea  = widthConstraint * heightConstraint;
  const blueprints = conceptsToBlueprints(parseContent(projectItems), totalArea);

  // Largest first — placing big projects early leaves less awkward leftover space
  blueprints.sort((a, b) => b.area - a.area);

  const allocator = new SpaceAllocator(space, blueprints);
  const cards     = [];

  for (const blueprint of blueprints) {
    const card = allocator.allocateBlueprint(blueprint);
    if (card) cards.push(card);
  }

  return cards;
}
