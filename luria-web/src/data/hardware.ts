// ============================================================
// Hardware data
// Each HardwareItem lives in exactly one Layer → one Category.
// "nodes" within a category are purely visual (seeded random
// positions on the constellation canvas); order here is data
// order only.
// ============================================================

export type ItemStatus = 'owned' | 'wished';

export interface HardwareItem {
  id: string;
  name: string;
  /** Short descriptor shown on the card (brand, model, specs…) */
  description: string;
  status: ItemStatus;
  /** ISO date string — when acquired (owned) or added to wishlist (wished) */
  date: string;
  /** Optional URL for more info */
  url?: string;
}

export interface Category {
  id: string;
  label: string;
  /** Categories can be "parents" that reveal sub-constellations */
  children?: Category[];
  items: HardwareItem[];
}

export interface Layer {
  id: string;
  label: string;
  categories: Category[];
}

// ── DATA ────────────────────────────────────────────────────

export const layers: Layer[] = [
  {
    id: 'devices',
    label: 'Devices',
    categories: [
      {
        id: 'pc',
        label: 'Desktop PC',
        items: [
          // Example — replace with your actual components
          {
            id: 'pc-cpu',
            name: 'CPU',
            description: 'Your CPU here',
            status: 'owned',
            date: '2024-01-01',
          },
          {
            id: 'pc-gpu',
            name: 'GPU',
            description: 'Your GPU here',
            status: 'owned',
            date: '2024-01-01',
          },
        ],
        children: [
          {
            id: 'pc-components',
            label: 'PC Components',
            items: [], // populated above via the parent's items
          },
        ],
      },
      {
        id: 'laptop',
        label: 'Laptop',
        items: [],
      },
      {
        id: 'phone',
        label: 'Phone',
        items: [],
      },
    ],
  },
  {
    id: 'io',
    label: 'I/O',
    categories: [
      {
        id: 'display',
        label: 'Display',
        items: [],
      },
      {
        id: 'keyboard',
        label: 'Keyboard',
        items: [],
        children: [
          {
            id: 'keyboard-components',
            label: 'Keyboard Components',
            items: [],
          },
        ],
      },
      {
        id: 'mouse',
        label: 'Mouse',
        items: [],
      },
      {
        id: 'audio',
        label: 'Audio',
        items: [],
      },
      {
        id: 'camera',
        label: 'Camera',
        items: [],
      },
    ],
  },
  {
    id: 'physical',
    label: 'Physical',
    categories: [
      {
        id: 'chair',
        label: 'Chair',
        items: [],
      },
      {
        id: 'lighting',
        label: 'Lighting',
        items: [],
      },
      {
        id: 'accessories',
        label: 'Accessories',
        items: [],
      },
    ],
  },
];
