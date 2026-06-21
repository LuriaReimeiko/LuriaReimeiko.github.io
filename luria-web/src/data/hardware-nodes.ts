// ============================================================
// Hardware constellation data
//
// Flat node list. Every node is either:
//   - a "category": a door into a sub-constellation. Opening it
//     means "show all nodes whose parentId === this node's id".
//   - a "card": a leaf with actual content (an item you own or
//     want). Opening it means "zoom this card to focus view".
//
// Root constellation = all nodes where parentId === null.
//
// Layout (x/y position on screen) is NEVER stored here. It's
// derived at render time from a seed (see src/lib/seeded-layout.ts)
// so the constellation shape is stable across visits without us
// ever having to hand-place a single coordinate.
// ============================================================

export type NodeKind = 'category' | 'card';
export type ItemStatus = 'owned' | 'wished';

export interface HardwareNode {
  id: string;
  kind: NodeKind;
  label: string;
  /** null = lives in the root constellation */
  parentId: string | null;

  // ── card-only fields ──
  /** Short descriptor shown on the card face */
  description?: string;
  status?: ItemStatus;
  /** ISO date string. Drives the timeline slider + accent color shift. */
  date?: string;
  /** Optional external URL (store page, spec sheet, etc.) */
  url?: string;
}

// ── DATA ────────────────────────────────────────────────────
// Add nodes freely. Order doesn't matter — layout is seeded from
// `id`, not array position. To add a new sub-constellation, add a
// category node, then give other nodes `parentId` pointing to it.

export const hardwareNodes: HardwareNode[] = [
  // ── Root: Layers ──
  { id: 'devices',  kind: 'category', label: 'Devices',  parentId: null },
  { id: 'io',       kind: 'category', label: 'I/O',       parentId: null },
  { id: 'physical', kind: 'category', label: 'Physical', parentId: null },

  // ── Devices ──
  { id: 'pc',     kind: 'category', label: 'Desktop PC', parentId: 'devices' },
  { id: 'laptop', kind: 'category', label: 'Laptop',      parentId: 'devices' },
  { id: 'phone',  kind: 'category', label: 'Phone',       parentId: 'devices' },

  // ── PC components (example data — replace with yours) ──
  {
    id: 'pc-cpu', kind: 'card', label: 'CPU', parentId: 'pc',
    description: 'Your CPU here', status: 'owned', date: '2024-01-01',
  },
  {
    id: 'pc-gpu', kind: 'card', label: 'GPU', parentId: 'pc',
    description: 'Your GPU here', status: 'owned', date: '2024-01-01',
  },

  // ── I/O ──
  { id: 'display',  kind: 'category', label: 'Display',  parentId: 'io' },
  { id: 'keyboard', kind: 'category', label: 'Keyboard',  parentId: 'io' },
  { id: 'mouse',    kind: 'category', label: 'Mouse',     parentId: 'io' },
  { id: 'audio',    kind: 'category', label: 'Audio',     parentId: 'io' },
  { id: 'camera',   kind: 'category', label: 'Camera',    parentId: 'io' },

  // ── Physical ──
  { id: 'chair',       kind: 'category', label: 'Chair',       parentId: 'physical' },
  { id: 'lighting',    kind: 'category', label: 'Lighting',    parentId: 'physical' },
  { id: 'accessories', kind: 'category', label: 'Accessories', parentId: 'physical' },
];

// ── Helpers ─────────────────────────────────────────────────

/** All nodes directly inside a constellation. `null` = root. */
export function childrenOf(parentId: string | null): HardwareNode[] {
  return hardwareNodes.filter((n) => n.parentId === parentId);
}

export function findNode(id: string): HardwareNode | undefined {
  return hardwareNodes.find((n) => n.id === id);
}

/** Breadcrumb path from root to this node, inclusive. */
export function pathTo(id: string): HardwareNode[] {
  const path: HardwareNode[] = [];
  let current = findNode(id);
  while (current) {
    path.unshift(current);
    current = current.parentId ? findNode(current.parentId) : undefined;
  }
  return path;
}
