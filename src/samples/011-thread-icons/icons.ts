/**
 * 011 — Thread Icons: the six icons, each drawn in a 48 × 48 box from the
 * stitch vocabulary. Every icon is a function of the detail level, so the
 * same construction is re-stitched for 24, 32/48 and the enlarged view.
 */
import {
  DEFS,
  LEVELS,
  type Level,
  type Poly,
  arcBand,
  circle,
  cord,
  knot,
  polyPath,
  region,
  roundedRect,
  stitch
} from './stitch-svg';

export type IconId = 'chat' | 'bolt' | 'headphones' | 'folder' | 'upload' | 'cursor';

export const ICONS: Array<{ id: IconId; label: string; note: string }> = [
  { id: 'chat', label: 'Chat', note: 'Lilac satin body, violet cord, three knots.' },
  { id: 'bolt', label: 'Lightning', note: 'Acid yellow with an orange shadow half; stitches run down the bolt.' },
  { id: 'headphones', label: 'Headphones', note: 'Cobalt; the arch is fanned around its centre, the cups are vertical satin.' },
  { id: 'folder', label: 'Folder', note: 'Coral front over a deeper back; a mint tab; a contact shadow in the overlap.' },
  { id: 'upload', label: 'Upload', note: 'Pale cloud fanned per lobe; electric-blue arrow.' },
  { id: 'cursor', label: 'Cursor', note: 'Ink body stitched along the pointer, light cord, hot-pink tail.' }
];

const C = {
  lilac: '#b8a4ff',
  violet: '#4f35b8',
  acid: '#e9ff3a',
  orange: '#ff8a3a',
  rust: '#7a3410',
  cobalt: '#2f55ff',
  cobaltDeep: '#1b2f9a',
  cushion: '#7f93ff',
  navy: '#121a4d',
  coral: '#ff7657',
  coralDeep: '#d9472c',
  mint: '#8ff0cf',
  cloud: '#e4eaff',
  cloudCord: '#6f7fc4',
  electric: '#1f6bff',
  electricDeep: '#0f3fb3',
  ink: '#1e1b33',
  paper: '#f4f2ff',
  pink: '#ff3d9a',
  white: '#ffffff'
};

// ------------------------------------------------------------------ chat

function chat(L: Level): string {
  const body: Poly = roundedRect(5, 6, 38, 29, 10, 7);
  // Tail: a small triangle attached at the lower left.
  const tail: Poly = [
    [12, 33],
    [21, 33],
    [10, 43.5]
  ];
  const outline = `M15 6H33a10 10 0 0 1 10 10V25a10 10 0 0 1-10 10H21L10 43.5 12.5 35H15a10 10 0 0 1-10-10V16a10 10 0 0 1 10-10Z`;
  return (
    region(tail, C.lilac, { kind: 'satin', angle: -62 }, L) +
    region(body, C.lilac, { kind: 'satin', angle: -14 }, L, { shadow: true }) +
    cord(outline, C.violet, L) +
    knot(16, 20.5, 2.6, C.violet) +
    knot(24, 20.5, 2.6, C.violet) +
    knot(32, 20.5, 2.6, C.violet) +
    stitch(12, 11.5, 15.5, 9.8, C.white, L.width * 0.6, 0.65)
  );
}

// ------------------------------------------------------------------ bolt

function bolt(L: Level): string {
  const whole: Poly = [
    [27, 3],
    [11, 27],
    [22, 27],
    [18, 45],
    [38, 19],
    [26, 19],
    [31, 3]
  ];
  // Orange shadow region: the lower right of the bolt, split by a line.
  const shadow: Poly = [
    [22, 27],
    [18, 45],
    [38, 19],
    [30, 19],
    [26, 30]
  ];
  return (
    region(whole, C.acid, { kind: 'satin', angle: -64 }, L, { shadow: true }) +
    region(shadow, C.orange, { kind: 'satin', angle: -64 }, L) +
    cord(polyPath(whole), C.rust, L) +
    stitch(26, 8, 24.5, 11, C.white, L.width * 0.7)
  );
}

// ------------------------------------------------------------ headphones

function headphones(L: Level): string {
  const arch: Poly = arcBand(24, 29, 15, 21, 192, 348, 28);
  const leftCup: Poly = roundedRect(2.5, 24, 13, 20, 5.5, 5);
  const rightCup: Poly = roundedRect(32.5, 24, 13, 20, 5.5, 5);
  const leftPad: Poly = roundedRect(9.5, 28, 5.5, 12, 2.5, 4);
  const rightPad: Poly = roundedRect(33, 28, 5.5, 12, 2.5, 4);
  return (
    region(arch, C.cobalt, { kind: 'fan', cx: 24, cy: 29, a0: 190, a1: 350 }, L, { shadow: true }) +
    cord(polyPath(arch), C.navy, L) +
    region(leftCup, C.cobaltDeep, { kind: 'satin', angle: 90 }, L, { shadow: true }) +
    region(rightCup, C.cobaltDeep, { kind: 'satin', angle: 90 }, L, { shadow: true }) +
    region(leftPad, C.cushion, { kind: 'satin', angle: 90 }, L) +
    region(rightPad, C.cushion, { kind: 'satin', angle: 90 }, L) +
    cord(polyPath(leftCup), C.navy, L) +
    cord(polyPath(rightCup), C.navy, L) +
    stitch(6.5, 29, 6.5, 32, C.white, L.width * 0.6, 0.6) +
    stitch(36.5, 29, 36.5, 32, C.white, L.width * 0.6, 0.6)
  );
}

// ---------------------------------------------------------------- folder

function folder(L: Level): string {
  const back: Poly = [
    [4, 9],
    [19, 9],
    [23, 14],
    [44, 14],
    [44, 41],
    [4, 41]
  ];
  const tab: Poly = [
    [4, 9],
    [19, 9],
    [23, 14],
    [4, 14]
  ];
  const front: Poly = [
    [7, 21],
    [47, 21],
    [43, 42],
    [4, 42]
  ];
  return (
    region(back, C.coralDeep, { kind: 'satin', angle: 0 }, L, { shadow: true }) +
    region(tab, C.mint, { kind: 'satin', angle: 0 }, L) +
    cord(polyPath(back), C.rust, L) +
    region(front, C.coral, { kind: 'satin', angle: -8 }, L, { shadow: true }) +
    cord(polyPath(front), C.rust, L) +
    stitch(10, 25.5, 15, 25, C.white, L.width * 0.7)
  );
}

// ---------------------------------------------------------------- upload

function upload(L: Level): string {
  const lobeA: Poly = circle(16, 24, 9.5, 30);
  const lobeB: Poly = circle(27, 18, 11.5, 30);
  const lobeC: Poly = circle(36, 26, 8.5, 30);
  const base: Poly = roundedRect(8, 24, 36, 12, 5.5, 5);
  const cloudOutline = `M14 36H37a7 7 0 0 0 1.5-13.8A11.5 11.5 0 0 0 16.5 17 9 9 0 0 0 14 36Z`;
  const shaft: Poly = [
    [21.5, 24],
    [26.5, 24],
    [26.5, 44],
    [21.5, 44]
  ];
  const head: Poly = [
    [24, 14],
    [33, 26],
    [15, 26]
  ];
  return (
    region(base, C.cloud, { kind: 'satin', angle: 0 }, L, { shadow: true, ground: 0.76 }) +
    region(lobeA, C.cloud, { kind: 'fan', cx: 16, cy: 24, a0: 0, a1: 360 }, L, { ground: 0.76 }) +
    region(lobeC, C.cloud, { kind: 'fan', cx: 36, cy: 26, a0: 0, a1: 360 }, L, { ground: 0.76 }) +
    region(lobeB, C.cloud, { kind: 'fan', cx: 27, cy: 18, a0: 0, a1: 360 }, L, { ground: 0.76 }) +
    cord(cloudOutline, C.cloudCord, L) +
    region(shaft, C.electric, { kind: 'satin', angle: 90 }, L, { shadow: true }) +
    region(head, C.electric, { kind: 'satin', angle: 0 }, L, { shadow: true }) +
    cord(`M24 14L33 26H26.5V44H21.5V26H15Z`, C.electricDeep, L) +
    stitch(20, 15.5, 23, 12.5, C.white, L.width * 0.6)
  );
}

// ---------------------------------------------------------------- cursor

function cursor(L: Level): string {
  const whole: Poly = [
    [12, 3],
    [12, 37],
    [19.5, 30.5],
    [25, 43],
    [31, 40.2],
    [25.5, 28],
    [35, 28]
  ];
  const head: Poly = [
    [12, 3],
    [12, 37],
    [19.5, 30.5],
    [25.5, 28],
    [35, 28]
  ];
  const tail: Poly = [
    [19.5, 30.5],
    [25, 43],
    [31, 40.2],
    [25.5, 28]
  ];
  return (
    region(head, C.ink, { kind: 'satin', angle: -52 }, L, { shadow: true, ground: 0.45 }) +
    region(tail, C.pink, { kind: 'satin', angle: 65 }, L, { shadow: true }) +
    cord(polyPath(whole), C.paper, L) +
    stitch(15, 9, 15, 14.5, C.pink, L.width * 0.7, 0.9) +
    stitch(15, 17, 15, 19, C.pink, L.width * 0.7, 0.9)
  );
}

const DRAW: Record<IconId, (L: Level) => string> = { chat, bolt, headphones, folder, upload, cursor };

/** One sprite with every icon at every level, to be inlined once per page. */
export function buildSprite(): string {
  const symbols: string[] = [];
  for (const [level, L] of Object.entries(LEVELS)) {
    for (const { id } of ICONS) {
      symbols.push(`<symbol id="ti-${id}-${level}" viewBox="0 0 48 48">${DRAW[id](L)}</symbol>`);
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">${DEFS}${symbols.join('')}</svg>`;
}

/** Markup for one icon at a given CSS size. Level follows size. */
export function iconUse(id: IconId, size: number, level?: keyof typeof LEVELS): string {
  const lv = level ?? (size <= 24 ? 'coarse' : 'fine');
  return `<svg class="ti" width="${size}" height="${size}" viewBox="0 0 48 48" aria-hidden="true" focusable="false"><use href="#ti-${id}-${lv}"/></svg>`;
}

/** A self-contained inline SVG for the collection preview: three icons at the fine level. */
export function previewMarkup(): string {
  const ids: IconId[] = ['chat', 'bolt', 'headphones'];
  const groups = ids.map((id, i) => `<g transform="translate(${i * 56} 0)">${DRAW[id](LEVELS.fine)}</g>`).join('');
  return `<svg class="ti-preview" viewBox="-4 -4 168 56" aria-hidden="true" focusable="false">${DEFS}${groups}</svg>`;
}

export function spriteStats(): { symbols: number; bytes: number; nodes: number } {
  const s = buildSprite();
  return { symbols: (s.match(/<symbol/g) ?? []).length, bytes: s.length, nodes: (s.match(/<(path|circle)/g) ?? []).length };
}
