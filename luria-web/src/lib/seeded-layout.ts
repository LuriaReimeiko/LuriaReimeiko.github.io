// ============================================================
// Seeded procedural layout for constellations.
//
// Goals:
//  - Same category always lays out the same way (seeded by id),
//    so we never need to store coordinates anywhere.
//  - Placement looks organic but respects a minimum distance
//    between nodes (simple Poisson-disc-style rejection, capped
//    attempts — not full Poisson-disc, but gives the same "felt"
//    result for the small N's a constellation realistically has).
//  - Sparse constellations (few nodes) generate on a SMALLER
//    virtual canvas, centered, then the caller scales the whole
//    thing up to fill the viewport — so 3 nodes don't look lost
//    in a screen built for 30.
// ============================================================

/** Deterministic 32-bit PRNG. Same seed -> same sequence, always. */
function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Turn an arbitrary string id into a numeric seed for mulberry32. */
export function seedFromString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

export interface LayoutNode {
  id: string;
  x: number; // 0..1, normalized within the constellation's own bounds
  y: number; // 0..1
  /** Radius this node was placed with, in normalized units (0..1 scale) */
  r: number;
}

export interface LayoutOptions {
  minDistance?: number; // normalized 0..1, min gap between any two node centers
  maxAttempts?: number; // per-node placement retries before giving up
  innerRadius?: number; // normalized, e.g. 0.1 keeps a dead zone in the center
}

const DEFAULTS: Required<LayoutOptions> = {
  minDistance: 0.16,
  maxAttempts: 60,
  innerRadius: 0.1,
};

/**
 * Lay out `ids` inside a normalized unit circle (radius 1, centered at 0.5,0.5).
 * Deterministic for a given `seedKey` + id list.
 *
 * Also returns `suggestedScale`: how much the caller should scale the
 * whole constellation up so sparse layouts (few nodes) still use the
 * available viewport space instead of looking lost in the middle.
 */
export function layoutConstellation(
  seedKey: string,
  ids: string[],
  options: LayoutOptions = {}
): { nodes: LayoutNode[]; suggestedScale: number } {
  const opts = { ...DEFAULTS, ...options };
  const rand = mulberry32(seedFromString(seedKey));

  const placed: LayoutNode[] = [];

  for (const id of ids) {
    let best: { x: number; y: number } | null = null;
    let bestMinDist = -Infinity;

    for (let attempt = 0; attempt < opts.maxAttempts; attempt++) {
      const angle = rand() * Math.PI * 2;
      // sqrt() keeps points uniformly distributed by AREA, not bunched at center
      const radius = opts.innerRadius + Math.sqrt(rand()) * (1 - opts.innerRadius);
      const x = 0.5 + Math.cos(angle) * radius * 0.5;
      const y = 0.5 + Math.sin(angle) * radius * 0.5;

      const minDistToOthers = placed.length === 0
        ? Infinity
        : Math.min(...placed.map((p) => Math.hypot(p.x - x, p.y - y)));

      if (minDistToOthers >= opts.minDistance) {
        best = { x, y };
        break; // good enough, stop searching
      }
      // keep the least-bad candidate in case every attempt fails
      if (minDistToOthers > bestMinDist) {
        bestMinDist = minDistToOthers;
        best = { x, y };
      }
    }

    placed.push({ id, x: best!.x, y: best!.y, r: opts.minDistance / 2 });
  }

  // How far from center does the layout actually reach?
  const maxReach = placed.length
    ? Math.max(...placed.map((p) => Math.hypot(p.x - 0.5, p.y - 0.5))) * 2
    : 1;

  // Never scale up by more than ~2.2x — past that, gaps between few
  // nodes start to look like a layout bug rather than a deliberate
  // sparse constellation.
  const suggestedScale = Math.min(2.2, Math.max(1, 0.85 / Math.max(maxReach, 0.2)));

  return { nodes: placed, suggestedScale };
}

// ============================================================
// Connecting line: angular order, straight segments
//
// Goal: link all nodes in a constellation with straight lines that
// never cross and never cut across the middle — they should trace
// the shape's perimeter (e.g. go the "long way around" an octagon,
// not through its center).
//
// This falls out of the SAME angular-sort property used elsewhere:
// a path visiting points in strictly increasing angular order around
// their shared centroid walks the perimeter by construction (each
// step only moves to the next-most-clockwise point), and can never
// self-intersect (every edge only ever sweeps "forward" in angle).
// No curve-fitting is needed or wanted here — straight segments
// through this order ARE the perimeter-following shape.
// ============================================================

/**
 * Sort nodes into a crossing-free, perimeter-following visiting order,
 * by angle around their shared centroid. Returns the SAME LayoutNode
 * objects, reordered.
 */
export function orderNodesForPath(nodes: LayoutNode[]): LayoutNode[] {
  if (nodes.length <= 2) return nodes; // 0, 1, or 2 points: no ordering ambiguity

  const cx = nodes.reduce((sum, n) => sum + n.x, 0) / nodes.length;
  const cy = nodes.reduce((sum, n) => sum + n.y, 0) / nodes.length;

  return [...nodes].sort((a, b) => {
    const angleA = Math.atan2(a.y - cy, a.x - cx);
    const angleB = Math.atan2(b.y - cy, b.x - cx);
    return angleA - angleB;
  });
}

/**
 * Build an SVG path `d` string: straight segments through `points`,
 * in the order given (does not reorder — call orderNodesForPath first
 * to guarantee the perimeter-following, non-crossing order).
 *
 * Each segment is pulled back by `gap` at BOTH ends, so lines stop
 * short of the node markers instead of touching/entering them.
 *
 * Points are in already-scaled screen/SVG coordinates, not the
 * normalized 0..1 space — pass them post-transform.
 */
export function straightPathThrough(
  points: { x: number; y: number }[],
  gap: number = 14
): string {
  if (points.length === 0) return '';
  if (points.length === 1) return '';

  const segments: string[] = [];

  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dist = Math.hypot(dx, dy);

    // If two nodes land almost on top of each other, skip the gap math
    // entirely rather than producing a negative-length (inverted) segment.
    if (dist <= gap * 2) continue;

    const ux = dx / dist;
    const uy = dy / dist;

    const startX = a.x + ux * gap;
    const startY = a.y + uy * gap;
    const endX = b.x - ux * gap;
    const endY = b.y - uy * gap;

    segments.push(`M ${startX} ${startY} L ${endX} ${endY}`);
  }

  return segments.join(' ');
}