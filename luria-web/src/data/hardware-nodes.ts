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
    /** Short descriptor shown on the card face AND in the readable markdown list */
    description?: string;
    /**
     * Longer text, shown only in the card-focus overlay (never in the
     * generated markdown list) — appears as small text under description.
     */
    details?: string;
    /**
     * Image shown only in the card-focus overlay (never in the generated
     * markdown list), anchored to the right of the text column.
     *
     * Two distinct forms, handled differently:
     *   - LOCAL: just a filename, e.g. "redmi-note-10t.jpg" — must exist
     *     in src/images/hardware/. Rendered through Astro's <Image>
     *     component (optimized at build time: resized, compressed,
     *     converted to webp). Astro can only do this for files it can
     *     import at build time, which is why local images live in src/
     *     and are referenced by filename, not by a public/ path.
     *   - EXTERNAL: a full URL starting with "http", e.g. a hosted
     *     product photo. Rendered as a plain <img> — Astro's <Image>
     *     can technically handle remote URLs too, but only with the
     *     domain explicitly allowlisted in astro.config.mjs, and the
     *     optimization benefit is smaller since Astro has to fetch the
     *     remote file at build time to process it at all. Not worth
     *     the config overhead for occasional external images.
     *
     * Detected automatically (filename vs URL) — no separate field needed.
     */
    image?: string;
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
    { id: 'devices', kind: 'category', label: 'Devices', parentId: null },
    { id: 'io', kind: 'category', label: 'I/O', parentId: null },
    { id: 'physical', kind: 'category', label: 'Physical', parentId: null },

    // ── Devices ──
    { id: 'pc', kind: 'category', label: 'Desktop PC', parentId: 'devices' },
    {
        id: 'laptop', kind: 'card', label: 'Laptop', parentId: 'devices',
        description: 'Samsung Galaxy Book2 Pro', status: 'owned', date: '0000-00-00',
    },
    {
        id: 'phone', kind: 'card', label: 'Phone', parentId: 'devices',
        description: 'Xiaomi Redmi Note 10T 5G', status: 'owned', date: '0000-00-00',
        details: 'Please don\'t buy this, or anything from Xiaomi for this matter.<br>Default apps are account locked, bound with ads, and honestly not great.',
        image: 'https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Fcdn.shopify.com%2Fs%2Ffiles%2F1%2F0277%2F9850%2F3517%2Fproducts%2FXiaomiRedmiNote10ProGray1.jpg&f=1&nofb=1&ipt=f553a83ce3a80f40cc81ba89e3e38f7d3a673500c7f908645431abca9df189a9'
    },

    // ── PC components ──
    {
        id: 'pc-cpu', kind: 'card', label: 'CPU', parentId: 'pc',
        description: 'Your CPU here', status: 'owned', date: '0000-00-00',
        image: 'test-cpu.jpg', // LOCAL — must exist in src/images/hardware/
    },
    {
        id: 'pc-gpu', kind: 'card', label: 'GPU', parentId: 'pc',
        description: 'RTX 2080Ti EVGA Black', status: 'owned', date: '0000-00-00',
    },

    // ── I/O ──
    { id: 'display', kind: 'category', label: 'Display', parentId: 'io' },
    { id: 'keyboard', kind: 'category', label: 'Keyboard', parentId: 'io' },
    { id: 'mouse', kind: 'category', label: 'Mouse', parentId: 'io' },
    { id: 'audio', kind: 'category', label: 'Audio', parentId: 'io' },
    { id: 'camera', kind: 'category', label: 'Camera', parentId: 'io' },

    // ── Physical ──
    { id: 'chair', kind: 'category', label: 'Chair', parentId: 'physical' },
    { id: 'lighting', kind: 'category', label: 'Lighting', parentId: 'physical' },
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