// ============================================================
// Generates public/hardware-notes/index.md from src/data/hardware-nodes.ts
//
// Run manually:        npx tsx scripts/generate-hardware-md.ts
// Or wire into build:  "prebuild": "tsx scripts/generate-hardware-md.ts"
//
// Behavior:
//   - Categories become "## Label" headers (nested by depth: "##", "###", …)
//   - Cards become rows in a table under their parent category's header
//   - The whole generated block is wrapped between two markers.
//     Anything you hand-write BELOW the closing marker is preserved
//     across regenerations — use that space for prose notes.
//   - If the file doesn't exist yet, it's created with an empty
//     hand-written section below the marker.
// ============================================================

// ============================================================
// Generates src/pages/hardware-notes.md from src/data/hardware-nodes.ts
//
// This is a real Astro page (not a public/ static asset) — Astro's
// built-in markdown processor renders it automatically, wrapped in
// src/layouts/markdown.astro (site palette + font only, no
// constellation theming). Routed at /hardware-notes/.
//
// Run manually:        npx tsx scripts/generate-hardware-md.ts
// Or wire into build:  "prebuild": "tsx scripts/generate-hardware-md.ts"
//
// Behavior:
//   - Categories become "## Label" headers (nested by depth: "##", "###", …)
//   - Cards become rows in a table under their parent category's header
//   - The whole generated block is wrapped between two markers.
//     Anything you hand-write BELOW the closing marker is preserved
//     across regenerations — use that space for prose notes.
//   - If the file doesn't exist yet, it's created with an empty
//     hand-written section below the marker.
// ============================================================

import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { hardwareNodes, childrenOf, type HardwareNode } from '../src/data/hardware-nodes.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = join(__dirname, '../src/pages/hardware-notes.md');

const FRONTMATTER = ['---', 'layout: ../layouts/markdown.astro', 'title: Hardware', 'description: Hardware, in readable list form.', '---'].join('\n');

const BEGIN_MARKER = '<!-- AUTO-GENERATED:BEGIN — do not edit between these markers, regenerated on build -->';
const END_MARKER = '<!-- AUTO-GENERATED:END -->';

function statusBadge(n: HardwareNode): string {
    if (!n.status) return '';
    return n.status === 'owned' ? '✦ owned' : '☆ wished';
}

function renderCardsTable(cards: HardwareNode[]): string {
    if (cards.length === 0) return '';
    const rows = cards.map((c) => {
        const desc = c.description ?? '';
        const status = statusBadge(c);
        const date = c.date ?? '';
        const link = c.url ? `[link](${c.url})` : '';
        return `| ${c.label} | ${desc} | ${status} | ${date} | ${link} |`;
    });
    return ['| Item | Description | Status | Date | Link |', '|---|---|---|---|---|', ...rows].join('\n');
}

function renderCategory(node: HardwareNode, depth: number): string {
    const heading = '#'.repeat(Math.min(depth + 2, 6)); // root categories -> "##"
    const children = childrenOf(node.id);
    const subcats = children.filter((c) => c.kind === 'category');
    const cards = children.filter((c) => c.kind === 'card');

    const parts: string[] = [`${heading} ${node.label}`];

    if (cards.length > 0) {
        parts.push('', renderCardsTable(cards));
    }

    for (const sub of subcats) {
        parts.push('', renderCategory(sub, depth + 1));
    }

    return parts.join('\n');
}

function generateBody(): string {
    const rootCategories = childrenOf(null).filter((n) => n.kind === 'category');
    const sections = rootCategories.map((cat) => renderCategory(cat, 0));
    return ['# Hardware', '_Generated from `src/data/hardware-nodes.ts`._', ...sections].join('\n\n');
}

function main() {
    mkdirSync(dirname(OUT_PATH), { recursive: true });

    const generated = `${BEGIN_MARKER}\n\n${generateBody()}\n\n${END_MARKER}\n`;

    let handWritten = '\n## Notes\n\n_Add your own notes here — preserved across regenerations._\n';

    if (existsSync(OUT_PATH)) {
        const existing = readFileSync(OUT_PATH, 'utf-8');
        const endIdx = existing.indexOf(END_MARKER);
        if (endIdx !== -1) {
            handWritten = existing.slice(endIdx + END_MARKER.length);
        }
    }

    writeFileSync(OUT_PATH, `${FRONTMATTER}\n\n${generated}${handWritten}`, 'utf-8');
    console.log(`Generated ${OUT_PATH} (${hardwareNodes.length} nodes)`);
}

main();
