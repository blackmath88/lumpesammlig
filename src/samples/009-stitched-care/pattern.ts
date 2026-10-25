/**
 * 009 — Stitched Care: pattern model.
 *
 * One deterministic grid describes the whole embroidered hanger cover.
 * Every cell inside the shaped silhouette is one stitch; motifs, field and
 * edging are only different colour decisions on the same grid.
 *
 * Units: grid cells. x runs from the hanger centre (negative = left arm),
 * y runs downwards from the top of the grid. The hook rises above y = 0.
 */

export const COLS = 236;
export const ROWS = 50;
export const HALF_LENGTH = 112; // half of the hanger length in cells

export const CENTRE_COL = COLS / 2;

/** Colour vocabulary observed in the photograph (sRGB). */
export const PALETTE: ReadonlyArray<readonly [number, number, number]> = [
  [62, 160, 204], // 0 turquoise field
  [104, 70, 40], // 1 edging brown
  [233, 168, 191], // 2 rose light
  [207, 111, 147], // 3 rose mid
  [160, 56, 103], // 4 rose deep
  [112, 34, 74], // 5 rose centre
  [243, 205, 217], // 6 rose pale
  [242, 180, 141], // 7 coral light
  [225, 134, 92], // 8 coral
  [186, 84, 47], // 9 coral deep
  [232, 194, 61], // 10 yellow
  [244, 220, 130], // 11 yellow light
  [108, 138, 63], // 12 olive
  [69, 96, 42], // 13 olive dark
  [157, 179, 94], // 14 olive light
  [237, 240, 238], // 15 pale flower white
  [183, 205, 228], // 16 pale flower blue
  [125, 82, 48], // 17 curl brown
  [165, 122, 76], // 18 curl brown light
  [91, 106, 52] // 19 stem
] as const;

export const KIND_FIELD = 0;
export const KIND_MOTIF = 1;
export const KIND_EDGE = 2;

export type StitchModel = {
  cols: number;
  rows: number;
  /** PALETTE index per cell. */
  colour: Uint8Array;
  /** KIND_* per cell. */
  kind: Uint8Array;
  /** 1 when the cell is inside the textile silhouette. */
  inside: Uint8Array;
  /** Cell indices in the deterministic reveal sequence. */
  order: Uint32Array;
  total: number;
  counts: { motif: number; field: number; edge: number };
};

/** Centre line of the hanger body (row) for a horizontal offset from the centre. */
export function centreLine(x: number): number {
  const t = Math.min(1, Math.abs(x) / HALF_LENGTH);
  return 16 + 22 * Math.pow(t, 1.55);
}

/** Half thickness of the body at a horizontal offset from the centre. */
export function halfWidth(x: number): number {
  const t = Math.min(1, Math.abs(x) / HALF_LENGTH);
  return 11.5 - 4 * t * t;
}

const END_RADIUS = halfWidth(HALF_LENGTH);
const END_CENTRE_X = HALF_LENGTH - END_RADIUS;

/**
 * Signed distance (in cells, approximately) from the silhouette edge.
 * Positive inside, negative outside.
 */
export function silhouetteDistance(x: number, y: number): number {
  const ax = Math.abs(x);
  if (ax <= END_CENTRE_X) {
    const slope = (centreLine(ax + 0.5) - centreLine(ax - 0.5));
    const perpendicular = Math.abs(y - centreLine(x)) / Math.sqrt(1 + slope * slope);
    return halfWidth(x) - perpendicular;
  }
  const ex = Math.sign(x) * END_CENTRE_X;
  return END_RADIUS - Math.hypot(x - ex, y - centreLine(ex));
}

/** Hook path in grid units, starting at the top of the body centre. */
export const HOOK_PATH: ReadonlyArray<readonly [number, number]> = [
  [0, 4.5],
  [0, -9],
  [2, -17],
  [7, -20],
  [12.5, -22.5],
  [18, -17.5],
  [16, -11],
  [14, -7.5],
  [10.5, -7.2],
  [9.5, -9.5]
];

const EDGE_WIDTH = 1.7;

type Painter = {
  set(x: number, y: number, colour: number, motif: number): void;
};

function makeModel(): StitchModel {
  const size = COLS * ROWS;
  const colour = new Uint8Array(size);
  const kind = new Uint8Array(size);
  const inside = new Uint8Array(size);
  const motifOf = new Int16Array(size).fill(-1);
  const distance = new Float32Array(size);

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const i = r * COLS + c;
      const d = silhouetteDistance(c + 0.5 - CENTRE_COL, r + 0.5);
      distance[i] = d;
      if (d > 0) {
        inside[i] = 1;
        colour[i] = 0;
        kind[i] = KIND_FIELD;
      }
    }
  }

  const painter: Painter = {
    set(x, y, col, motif) {
      const c = Math.floor(x + CENTRE_COL);
      const r = Math.floor(y);
      if (c < 0 || c >= COLS || r < 0 || r >= ROWS) return;
      const i = r * COLS + c;
      if (!inside[i] || distance[i] <= EDGE_WIDTH) return;
      colour[i] = col;
      kind[i] = KIND_MOTIF;
      motifOf[i] = motif;
    }
  };

  paintMotifs(painter);

  // Edging follows the silhouette and is applied last.
  for (let i = 0; i < size; i++) {
    if (inside[i] && distance[i] <= EDGE_WIDTH) {
      colour[i] = 1;
      kind[i] = KIND_EDGE;
      motifOf[i] = -1;
    }
  }

  // Reveal sequence: motifs by motif order, field in a sweep from the left
  // tip to the right tip, edging as a continuous run around the perimeter.
  const motifCells: number[] = [];
  const fieldCells: number[] = [];
  const edgeCells: number[] = [];
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r < ROWS; r++) {
      const i = r * COLS + c;
      if (!inside[i]) continue;
      if (kind[i] === KIND_EDGE) edgeCells.push(i);
      else if (kind[i] === KIND_MOTIF) motifCells.push(i);
      else fieldCells.push(i);
    }
  }
  motifCells.sort((a, b) => {
    const m = motifOf[a] - motifOf[b];
    if (m) return m;
    const ra = Math.floor(a / COLS);
    const rb = Math.floor(b / COLS);
    return ra - rb || (a % COLS) - (b % COLS);
  });
  edgeCells.sort((a, b) => perimeterParameter(a) - perimeterParameter(b));

  const order = new Uint32Array(motifCells.length + fieldCells.length + edgeCells.length);
  order.set(motifCells, 0);
  order.set(fieldCells, motifCells.length);
  order.set(edgeCells, motifCells.length + fieldCells.length);

  return {
    cols: COLS,
    rows: ROWS,
    colour,
    kind,
    inside,
    order,
    total: order.length,
    counts: { motif: motifCells.length, field: fieldCells.length, edge: edgeCells.length }
  };
}

/** Parameter along the perimeter: top edge left→right, then bottom edge right→left. */
function perimeterParameter(i: number): number {
  const x = (i % COLS) + 0.5 - CENTRE_COL;
  const y = Math.floor(i / COLS) + 0.5;
  const above = y < centreLine(x);
  if (Math.abs(x) > END_CENTRE_X) {
    const ex = Math.sign(x) * END_CENTRE_X;
    const angle = Math.atan2(y - centreLine(ex), x - ex); // -π..π
    if (x > 0) return HALF_LENGTH + angle + Math.PI / 2; // right cap, sweeping over the top then down
    const a = angle < -Math.PI / 2 ? angle + Math.PI * 2 : angle; // left cap, π/2..3π/2
    return 3 * HALF_LENGTH + Math.PI + (a - Math.PI / 2);
  }
  return above ? x + HALF_LENGTH : 3 * HALF_LENGTH - x;
}

// ---------------------------------------------------------------------------
// Motifs. Each arm mirrors the same sequence; the rose sits at the centre.
// ---------------------------------------------------------------------------

function paintMotifs(p: Painter) {
  let motif = 0;

  // 0 — rose at the centre.
  const rx = 7.6;
  const ry = 6.9;
  const roseY = centreLine(0) + 0.4;
  for (let y = roseY - ry - 1; y <= roseY + ry + 1; y++) {
    for (let x = -rx - 1; x <= rx + 1; x++) {
      const dx = (x + 0.5) / rx;
      const dy = (y + 0.5 - roseY) / ry;
      const r = Math.hypot(dx, dy);
      if (r > 1) continue;
      // The dark heart sits slightly off-centre, as in the photograph.
      const hx = dx - 0.22;
      const hy = dy + 0.18;
      const hr = Math.hypot(hx, hy);
      const angle = Math.atan2(hy, hx);
      const band = (hr * 2.6 + angle / (Math.PI * 2) + 10) % 1;
      let col: number;
      if (hr < 0.28) col = 5;
      else if (hr < 0.42) col = band < 0.5 ? 4 : 3;
      else if (r > 0.86) col = band < 0.45 ? 6 : 2;
      else col = band < 0.3 ? 2 : band < 0.68 ? 3 : 4;
      p.set(x, y, col, motif);
    }
  }
  motif++;

  // Leaves around the rose.
  leaf(p, -9.5, roseY - 4.5, -0.6, 4.5, 2.1, motif);
  leaf(p, 9.5, roseY + 4.2, 0.5, 4.5, 2.1, motif);
  leaf(p, -8.8, roseY + 5.2, 0.9, 3.6, 1.8, motif);
  leaf(p, 8.6, roseY - 5.4, -1.0, 3.6, 1.8, motif);
  motif++;

  for (const s of [-1, 1] as const) {
    const arm = (u: number, v: number): [number, number] => [s * u, centreLine(s * u) + v];
    const slope = (u: number) => Math.atan2(centreLine(s * (u + 1)) - centreLine(s * (u - 1)), 2 * s);

    // Pale flowers beside the rose.
    paleFlower(p, ...arm(14, -0.6), motif);
    smallDot(p, ...arm(4.5, -9.3), 16, motif);
    smallDot(p, ...arm(3.5, 9.6), 16, motif);
    motif++;

    // Stem and leaves to the coral flower.
    stem(p, arm(17.5, 1.8), arm(28.5, -1.2), motif);
    leaf(p, ...arm(21, 4.2), slope(21) + 0.9, 3.8, 1.7, motif);
    leaf(p, ...arm(25, -4.4), slope(25) - 0.8, 3.8, 1.7, motif);
    motif++;

    // Coral trumpet flower.
    coral(p, ...arm(34.5, 0), slope(34.5) + s * 0.55, motif);
    motif++;

    // Stem and leaves to the curl.
    stem(p, arm(39.5, -1.5), arm(51, 1.5), motif);
    leaf(p, ...arm(44, -4.6), slope(44) - 0.7, 4, 1.8, motif);
    leaf(p, ...arm(47.5, 4.3), slope(47.5) + 0.8, 4, 1.8, motif);
    motif++;

    // Brown curl.
    curl(p, ...arm(59, 0.2), s, motif);
    leaf(p, ...arm(66, -4.1), slope(66) - 0.9, 3.4, 1.6, motif);
    leaf(p, ...arm(67, 3.9), slope(67) + 0.9, 3.4, 1.6, motif);
    motif++;

    // Yellow flower cluster.
    stem(p, arm(70, 0), arm(80, -1), motif);
    smallDot(p, ...arm(77.5, -2.6), 10, motif);
    smallDot(p, ...arm(75.5, 1.8), 10, motif);
    smallDot(p, ...arm(80.5, 1.2), 10, motif);
    p.set(...arm(77.5, -2.6), 11, motif);
    p.set(...arm(75.5, 1.8), 11, motif);
    p.set(...arm(80.5, 1.2), 11, motif);
    leaf(p, ...arm(84.5, -3.2), slope(84.5) - 0.9, 3.4, 1.6, motif);
    leaf(p, ...arm(86, 2.8), slope(86) + 0.9, 3.4, 1.6, motif);
    motif++;

    // Sprig towards the tip.
    stem(p, arm(89, 0.5), arm(98, -0.5), motif);
    leaf(p, ...arm(93.5, -2.9), slope(93.5) - 1.1, 2.8, 1.4, motif);
    leaf(p, ...arm(96, 2.4), slope(96) + 1.1, 2.8, 1.4, motif);
    motif++;
  }
}

function leaf(p: Painter, cx: number, cy: number, rot: number, len: number, wid: number, motif: number) {
  const cos = Math.cos(rot);
  const sin = Math.sin(rot);
  const reach = Math.ceil(len) + 1;
  for (let y = Math.floor(cy) - reach; y <= Math.floor(cy) + reach; y++) {
    for (let x = Math.floor(cx) - reach; x <= Math.floor(cx) + reach; x++) {
      const dx = x + 0.5 - cx;
      const dy = y + 0.5 - cy;
      const u = (dx * cos + dy * sin) / len;
      const v = (-dx * sin + dy * cos) / wid;
      const r = u * u + v * v;
      if (r > 1) continue;
      const col = Math.abs(v) < 0.22 && Math.abs(u) < 0.85 ? 13 : v < -0.35 ? 14 : 12;
      p.set(x, y, col, motif);
    }
  }
}

function stem(p: Painter, a: [number, number], b: [number, number], motif: number) {
  const steps = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) * 2);
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = a[0] + (b[0] - a[0]) * t;
    const y = a[1] + (b[1] - a[1]) * t + Math.sin(t * Math.PI) * 0.6;
    p.set(x, y, 19, motif);
  }
}

function smallDot(p: Painter, cx: number, cy: number, col: number, motif: number) {
  for (let y = -2; y <= 2; y++) {
    for (let x = -2; x <= 2; x++) {
      if (Math.hypot(x, y) <= 1.6) p.set(cx + x, cy + y, col, motif);
    }
  }
}

function paleFlower(p: Painter, cx: number, cy: number, motif: number) {
  for (let y = -4; y <= 4; y++) {
    for (let x = -4; x <= 4; x++) {
      const r = Math.hypot(x, y);
      if (r > 3.4) continue;
      const angle = Math.atan2(y, x);
      const petal = Math.cos(angle * 5) * 0.55 + 2.85;
      if (r > petal) continue;
      let col = 15;
      if (r < 1.1) col = 10;
      else if (y > 0.5 && r > 2.1) col = 16;
      p.set(cx + x, cy + y, col, motif);
    }
  }
}

function coral(p: Painter, cx: number, cy: number, rot: number, motif: number) {
  const cos = Math.cos(rot);
  const sin = Math.sin(rot);
  const len = 5.2;
  const wid = 3.4;
  for (let y = -7; y <= 7; y++) {
    for (let x = -7; x <= 7; x++) {
      const dx = x + 0.5;
      const dy = y + 0.5;
      const u = (dx * cos + dy * sin) / len;
      const v = (-dx * sin + dy * cos) / wid;
      // Trumpet: narrower at the base (u < 0), flaring at the mouth (u > 0).
      const flare = 0.55 + 0.45 * (u + 1) / 2;
      if (u * u + (v / flare) * (v / flare) > 1) continue;
      let col: number;
      if (u < -0.55) col = 13; // calyx
      else if (v < -0.3) col = 7;
      else if (v > 0.35 || u > 0.6) col = 9;
      else col = 8;
      p.set(cx + x, cy + y, col, motif);
    }
  }
}

function curl(p: Painter, cx: number, cy: number, s: number, motif: number) {
  for (let y = -6; y <= 6; y++) {
    for (let x = -6; x <= 6; x++) {
      const dx = (x + 0.5) * s;
      const dy = y + 0.5;
      const r = Math.hypot(dx, dy);
      const angle = Math.atan2(dy, dx);
      // Opening between about 20° and 115°, so the C faces the centre.
      const gap = angle > 0.35 && angle < 2.0;
      const ring = r > 2.9 && r < 4.9;
      const tail = Math.hypot(dx - 0.6, dy - 3.9) < 1.4;
      if ((ring && !gap) || tail) p.set(cx + x, cy + y, r > 4.2 || tail ? 18 : 17, motif);
    }
  }
}

let cached: StitchModel | undefined;

/** The one shared model. Building it is cheap, but it only needs to happen once. */
export function getStitchModel(): StitchModel {
  if (!cached) cached = makeModel();
  return cached;
}
