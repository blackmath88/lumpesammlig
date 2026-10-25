/**
 * 010 — Pixels to Stitches: one small stitch vocabulary.
 *
 * Every mark in this sample (comparison glyphs, checkmarks, seams, borders,
 * one stitched label) is drawn by the routines here, so the working interface
 * and the material comparison share the same construction. The four
 * qualities under investigation can be switched independently.
 *
 * Derived from sample 009's renderer, but kept local: this is not a shared
 * textile engine.
 */

export type Qualities = {
  /** Slanted, rounded marks instead of squares. */
  directional: boolean;
  /** Contact shadow, matte highlight and fibre strands on each mark. */
  volume: boolean;
  /** An evenweave ground visible between marks. */
  fabric: boolean;
  /** Small deterministic differences in angle, length, width and tone. */
  variation: boolean;
};

export const ALL_ON: Qualities = { directional: true, volume: true, fabric: true, variation: true };
export const PIXELS: Qualities = { directional: false, volume: false, fabric: false, variation: false };

/** Thread colours taken from the photograph, plus the ground. Index 0 is empty. */
export const THREAD: ReadonlyArray<readonly [number, number, number]> = [
  [0, 0, 0],
  [207, 111, 147], // 1 rose
  [233, 168, 191], // 2 rose light
  [160, 56, 103], // 3 rose deep
  [108, 138, 63], // 4 olive
  [157, 179, 94], // 5 olive light
  [69, 96, 42], // 6 olive dark
  [225, 134, 92], // 7 coral
  [242, 180, 141], // 8 coral light
  [104, 70, 40], // 9 brown
  [62, 160, 204], // 10 turquoise
  [42, 127, 159], // 11 turquoise deep
  [232, 194, 61] // 12 yellow
] as const;

export const GROUND = '#f2efe6';
export const GROUND_THREAD = '#ebe6d9';
export const GROUND_THREAD_LIGHT = 'rgba(255,252,244,.55)';
export const GROUND_THREAD_SHADE = '#cfc7b6';
export const GROUND_WEAVE = 'rgba(120,108,88,.08)';
export const GROUND_HOLE = '#b8ae9c';
export const FLAT_GROUND = '#ece9e1';

export type Glyph = { cols: number; rows: number; cells: Uint8Array };

/** Parse a glyph from text rows; `key` maps characters to thread indices. */
export function glyph(rows: string[], key: Record<string, number>): Glyph {
  const cols = rows[0].length;
  const cells = new Uint8Array(cols * rows.length);
  rows.forEach((row, r) => {
    for (let c = 0; c < cols; c++) cells[r * cols + c] = key[row[c]] ?? 0;
  });
  return { cols, rows: rows.length, cells };
}

export function hash(i: number, salt: number): number {
  let h = (Math.imul(i + 1, 0x9e3779b1) + Math.imul(salt + 1, 0x85ebca77)) >>> 0;
  h ^= h >>> 15;
  h = Math.imul(h, 0x2c1b3c6d);
  h ^= h >>> 12;
  h = Math.imul(h, 0x297a2d39);
  h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}

function tone(rgb: readonly [number, number, number], factor: number, lift: number): string {
  const r = Math.round(Math.min(255, rgb[0] * factor + (255 - rgb[0]) * lift));
  const g = Math.round(Math.min(255, rgb[1] * factor + (250 - rgb[1]) * lift));
  const b = Math.round(Math.min(255, rgb[2] * factor + (240 - rgb[2]) * lift));
  return `rgb(${r},${g},${b})`;
}

/**
 * Draw an evenweave ground. The threads run through the cell centres (a tent
 * stitch covers one crossing), so the holes are the spaces between them.
 */
export function drawFabric(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, cell: number) {
  ctx.fillStyle = GROUND_HOLE;
  ctx.fillRect(x, y, w, h);
  if (cell < 2.5) {
    ctx.fillStyle = GROUND;
    ctx.globalAlpha = 0.75;
    ctx.fillRect(x, y, w, h);
    ctx.globalAlpha = 1;
    return;
  }
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.lineCap = 'butt';
  const lw = cell * 0.58;
  // Each thread: a shaded under-edge, then the lit body slightly narrower.
  const passes: Array<[string, number, number]> = [
    [GROUND_THREAD_SHADE, lw, cell * 0.07],
    [GROUND_THREAD, lw * 0.82, 0],
    [GROUND_THREAD_LIGHT, lw * 0.3, -cell * 0.1]
  ];
  for (const [style, width, shift] of passes) {
    ctx.strokeStyle = style;
    ctx.lineWidth = width;
    ctx.beginPath();
    for (let gx = x + cell / 2; gx < x + w; gx += cell) {
      ctx.moveTo(gx + shift, y);
      ctx.lineTo(gx + shift, y + h);
    }
    ctx.stroke();
    ctx.beginPath();
    for (let gy = y + cell / 2; gy < y + h; gy += cell) {
      ctx.moveTo(x, gy + shift);
      ctx.lineTo(x + w, gy + shift);
    }
    ctx.stroke();
  }
  if (cell >= 8) {
    // Over/under: a faint shade where the horizontal thread passes under the vertical one.
    ctx.fillStyle = GROUND_WEAVE;
    for (let gx = x + cell / 2; gx < x + w; gx += cell) {
      for (let gy = y + cell / 2; gy < y + h; gy += cell) {
        const over = (Math.round((gx - x) / cell) + Math.round((gy - y) / cell)) % 2 === 0;
        if (over) ctx.fillRect(gx - lw / 2, gy - lw * 0.41, lw, lw * 0.82);
        else ctx.fillRect(gx - lw * 0.41, gy - lw / 2, lw * 0.82, lw);
      }
    }
  }
  ctx.restore();
}

/**
 * One tent stitch (or one pixel) centred at (cx, cy) in a cell of size `s`.
 * `seed` drives the deterministic variation; `angle` is the slant.
 */
export function drawMark(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  s: number,
  colour: number,
  q: Qualities,
  seed: number,
  angle = -Math.PI / 4,
  lengthFactor = 1
) {
  const rgb = THREAD[colour];
  const v1 = q.variation ? hash(seed, 1) : 0.5;
  const v2 = q.variation ? hash(seed, 2) : 0.5;
  const v3 = q.variation ? hash(seed, 3) : 0.5;
  const factor = 0.95 + (v2 - 0.5) * 0.14;

  if (!q.directional) {
    ctx.fillStyle = q.variation ? tone(rgb, factor, 0) : tone(rgb, 1, 0);
    ctx.fillRect(cx - s / 2, cy - s / 2, s, s);
    return;
  }

  const a = angle + (v1 - 0.5) * 0.08;
  const half = s * (0.31 + (v3 - 0.5) * 0.05) * lengthFactor;
  const w = s * (0.76 + (v1 - 0.5) * 0.08);
  const ox = cx + (v3 - 0.5) * 0.07 * s;
  const oy = cy + (v2 - 0.5) * 0.07 * s;
  const dx = Math.cos(a) * half;
  const dy = Math.sin(a) * half;

  ctx.lineCap = 'round';

  if (q.volume) {
    ctx.strokeStyle = 'rgba(30,20,14,.3)';
    ctx.lineWidth = w * 1.0;
    ctx.beginPath();
    ctx.moveTo(ox - dx + s * 0.09, oy - dy + s * 0.12);
    ctx.lineTo(ox + dx + s * 0.09, oy + dy + s * 0.12);
    ctx.stroke();
  }

  ctx.strokeStyle = tone(rgb, factor, 0);
  ctx.lineWidth = w;
  ctx.beginPath();
  ctx.moveTo(ox - dx, oy - dy);
  ctx.lineTo(ox + dx, oy + dy);
  ctx.stroke();

  if (!q.volume) return;

  if (s >= 10) {
    // Fibre: darker strands lying along the thread, slightly off the axis.
    ctx.strokeStyle = tone(rgb, factor * 0.74, 0);
    ctx.lineWidth = Math.max(0.6, s * 0.045);
    ctx.globalAlpha = 0.28;
    const nx = -dy / half;
    const ny = dx / half;
    for (let f = -1; f <= 1; f++) {
      const off = f * w * 0.2 + (hash(seed, 5 + f) - 0.5) * w * 0.08;
      const shrink = 0.7 + hash(seed, 9 + f) * 0.2;
      ctx.beginPath();
      ctx.moveTo(ox - dx * shrink + nx * off, oy - dy * shrink + ny * off);
      ctx.lineTo(ox + dx * shrink + nx * off, oy + dy * shrink + ny * off);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  // Matte highlight on the side facing the light (upper left).
  ctx.strokeStyle = tone(rgb, factor, 0.28);
  ctx.lineWidth = w * 0.26;
  ctx.globalAlpha = 0.36;
  ctx.beginPath();
  ctx.moveTo(ox - dx * 0.7 - s * 0.08, oy - dy * 0.7 - s * 0.1);
  ctx.lineTo(ox + dx * 0.7 - s * 0.08, oy + dy * 0.7 - s * 0.1);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

export type GlyphOrder = 'rows' | 'cols';

/** Cell indices of a glyph in a stitching order. */
export function glyphOrder(g: Glyph, order: GlyphOrder): number[] {
  const out: number[] = [];
  if (order === 'rows') {
    for (let r = 0; r < g.rows; r++) for (let c = 0; c < g.cols; c++) if (g.cells[r * g.cols + c]) out.push(r * g.cols + c);
  } else {
    for (let c = 0; c < g.cols; c++) for (let r = 0; r < g.rows; r++) if (g.cells[r * g.cols + c]) out.push(r * g.cols + c);
  }
  return out;
}

/**
 * Draw a glyph at (x, y) with cell size `s`. `count` limits how many marks are
 * drawn in stitching order (for fill / unpick); omit it for the finished glyph.
 */
export function drawGlyph(
  ctx: CanvasRenderingContext2D,
  g: Glyph,
  x: number,
  y: number,
  s: number,
  q: Qualities,
  seed = 0,
  count?: number,
  order: GlyphOrder = 'rows'
) {
  const cells = glyphOrder(g, order);
  const n = count === undefined ? cells.length : Math.max(0, Math.min(cells.length, count));
  for (let k = 0; k < n; k++) {
    const i = cells[k];
    const c = i % g.cols;
    const r = Math.floor(i / g.cols);
    drawMark(ctx, x + (c + 0.5) * s, y + (r + 0.5) * s, s, g.cells[i], q, seed * 7919 + i);
  }
}

/** Fill the whole canvas with ground or flat colour according to the qualities. */
export function drawGround(ctx: CanvasRenderingContext2D, w: number, h: number, cell: number, q: Qualities) {
  if (q.fabric) drawFabric(ctx, 0, 0, w, h, cell);
  else {
    ctx.fillStyle = FLAT_GROUND;
    ctx.fillRect(0, 0, w, h);
  }
}

/** A running stitch along a horizontal line: dashes with gaps, slightly lifted. */
export function drawRunningStitch(
  ctx: CanvasRenderingContext2D,
  x0: number,
  x1: number,
  y: number,
  s: number,
  colour: number,
  q: Qualities,
  seed = 0
) {
  const pitch = s * 3.1;
  let k = 0;
  for (let x = x0 + s; x + s * 1.6 <= x1; x += pitch, k++) {
    drawMark(ctx, x + s * 0.9, y, s * 0.9, colour, q, seed * 131 + k, 0, 2.1);
  }
}

/** Satin stitches around a rectangle: short parallel marks perpendicular to each edge. */
export function drawSatinBorder(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  s: number,
  colour: number,
  q: Qualities,
  seed = 0
) {
  const pitch = s * 0.78;
  const len = 2.6;
  let k = 0;
  for (let px = x + s; px < x + w - s * 0.5; px += pitch, k++) {
    drawMark(ctx, px, y + s * 0.2, s * 0.8, colour, q, seed + k, Math.PI / 2 + 0.18, len);
    drawMark(ctx, px, y + h - s * 0.2, s * 0.8, colour, q, seed + 1000 + k, Math.PI / 2 - 0.18, len);
  }
  for (let py = y + s; py < y + h - s * 0.5; py += pitch, k++) {
    drawMark(ctx, x + s * 0.2, py, s * 0.8, colour, q, seed + 2000 + k, 0.18, len);
    drawMark(ctx, x + w - s * 0.2, py, s * 0.8, colour, q, seed + 3000 + k, -0.18, len);
  }
}

/** Size a canvas for crisp output at a capped device pixel ratio; returns the 2D context or null. */
export function prepare(canvas: HTMLCanvasElement, cssW: number, cssH: number): CanvasRenderingContext2D | null {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const w = Math.max(1, Math.round(cssW * dpr));
  const h = Math.max(1, Math.round(cssH * dpr));
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  canvas.style.width = `${cssW}px`;
  canvas.style.height = `${cssH}px`;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}
