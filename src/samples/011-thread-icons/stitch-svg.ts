/**
 * 011 — Thread Icons: a small SVG stitch vocabulary.
 *
 * Everything is generated as SVG markup at build time. A fill is one <path>
 * whose subpaths are the individual stitches, clipped geometrically to the
 * region polygon (no <clipPath>, no hatching outside boundaries). Direction is
 * deliberate per region: parallel satin at an angle, or a fan around a centre.
 * Cords are stroked contours with a wrapped highlight. Knots are dots.
 *
 * Local to this sample. Not an engine.
 */

export type Pt = [number, number];
export type Poly = Pt[];

export type Level = {
  /** Thread width in icon units (viewBox 48). */
  width: number;
  /** Distance between stitch centres. Slightly more than width shows the ground between threads. */
  pitch: number;
  /** Cord outline width. */
  cord: number;
  /** Per-stitch highlight strands (only worth it when enlarged). */
  strands: boolean;
  /** Fan angular step in degrees, scaled from pitch at the fan's mean radius. */
  fanScale: number;
};

export const LEVELS: Record<'coarse' | 'fine' | 'detail', Level> = {
  coarse: { width: 3.1, pitch: 3.1, cord: 3.4, strands: false, fanScale: 1.1 },
  fine: { width: 2.2, pitch: 2.4, cord: 2.8, strands: false, fanScale: 1 },
  detail: { width: 1.75, pitch: 1.95, cord: 2.5, strands: true, fanScale: 1 }
};

const f = (n: number) => (Math.round(n * 100) / 100).toString();

// ---------------------------------------------------------------- geometry

export function roundedRect(x: number, y: number, w: number, h: number, r: number, n = 6): Poly {
  const pts: Poly = [];
  const corners: Array<[number, number, number]> = [
    [x + w - r, y + r, -90],
    [x + w - r, y + h - r, 0],
    [x + r, y + h - r, 90],
    [x + r, y + r, 180]
  ];
  for (const [cx, cy, start] of corners) {
    for (let i = 0; i <= n; i++) {
      const a = ((start + (90 * i) / n) * Math.PI) / 180;
      pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
    }
  }
  return pts;
}

export function circle(cx: number, cy: number, r: number, n = 36): Poly {
  const pts: Poly = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  return pts;
}

/** Annular band between r0 and r1 from angle a0 to a1 (degrees, clockwise on screen). */
export function arcBand(cx: number, cy: number, r0: number, r1: number, a0: number, a1: number, n = 24): Poly {
  const pts: Poly = [];
  for (let i = 0; i <= n; i++) {
    const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180;
    pts.push([cx + Math.cos(a) * r1, cy + Math.sin(a) * r1]);
  }
  for (let i = n; i >= 0; i--) {
    const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180;
    pts.push([cx + Math.cos(a) * r0, cy + Math.sin(a) * r0]);
  }
  return pts;
}

export function translate(p: Poly, dx: number, dy: number): Poly {
  return p.map(([x, y]) => [x + dx, y + dy]);
}

export function polyPath(p: Poly): string {
  return p.map(([x, y], i) => `${i ? 'L' : 'M'}${f(x)} ${f(y)}`).join('') + 'Z';
}

function bbox(p: Poly) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const [x, y] of p) {
    x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y);
  }
  return { x0, y0, x1, y1 };
}

/** Parameters t along the line p + t·d where it crosses the polygon boundary, sorted. */
function crossings(poly: Poly, px: number, py: number, dx: number, dy: number): number[] {
  const ts: number[] = [];
  for (let i = 0; i < poly.length; i++) {
    const [ax, ay] = poly[i];
    const [bx, by] = poly[(i + 1) % poly.length];
    const ex = bx - ax;
    const ey = by - ay;
    const den = dx * ey - dy * ex;
    if (Math.abs(den) < 1e-9) continue;
    const u = ((ax - px) * ey - (ay - py) * ex) / den; // along the line
    const v = ((ax - px) * dy - (ay - py) * dx) / den; // along the edge
    if (v >= 0 && v < 1) ts.push(u);
  }
  return ts.sort((a, b) => a - b);
}

type Segment = [number, number, number, number];

/** Parallel stitches at `angle` degrees across the polygon. */
export function satinSegments(poly: Poly, angle: number, pitch: number, inset = 0, phase = 0): Segment[] {
  const a = (angle * Math.PI) / 180;
  const dx = Math.cos(a);
  const dy = Math.sin(a);
  const nx = -dy;
  const ny = dx;
  const b = bbox(poly);
  const cx = (b.x0 + b.x1) / 2;
  const cy = (b.y0 + b.y1) / 2;
  const half = Math.hypot(b.x1 - b.x0, b.y1 - b.y0) / 2;
  const out: Segment[] = [];
  const count = Math.ceil(half / pitch);
  for (let k = -count; k <= count; k++) {
    const o = k * pitch + phase;
    const px = cx + nx * o;
    const py = cy + ny * o;
    const ts = crossings(poly, px, py, dx, dy);
    for (let i = 0; i + 1 < ts.length; i += 2) {
      const t0 = ts[i] + inset;
      const t1 = ts[i + 1] - inset;
      if (t1 - t0 < pitch * 0.4) continue;
      out.push([px + dx * t0, py + dy * t0, px + dx * t1, py + dy * t1]);
    }
  }
  return out;
}

/** Stitches radiating from a centre, clipped to the polygon. Angular step derived from pitch at mean radius. */
export function fanSegments(poly: Poly, cx: number, cy: number, pitch: number, a0: number, a1: number, inset = 0): Segment[] {
  let maxR = 1;
  for (const [x, y] of poly) maxR = Math.max(maxR, Math.hypot(x - cx, y - cy));
  const step = ((pitch / maxR) * 180) / Math.PI;
  const out: Segment[] = [];
  const n = Math.max(1, Math.round((a1 - a0) / step));
  for (let i = 0; i <= n; i++) {
    const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180;
    const dx = Math.cos(a);
    const dy = Math.sin(a);
    const ts = crossings(poly, cx, cy, dx, dy).filter((t) => t > 0);
    for (let j = 0; j + 1 < ts.length; j += 2) {
      const t0 = ts[j] + inset;
      const t1 = ts[j + 1] - inset;
      if (t1 - t0 < pitch * 0.4) continue;
      out.push([cx + dx * t0, cy + dy * t0, cx + dx * t1, cy + dy * t1]);
    }
  }
  return out;
}

// ---------------------------------------------------------------- colour

export function shade(hex: string, factor: number, lift = 0): string {
  const n = parseInt(hex.slice(1), 16);
  const ch = (v: number) => Math.max(0, Math.min(255, Math.round(v * factor + (255 - v) * lift)));
  const r = ch((n >> 16) & 255);
  const g = ch((n >> 8) & 255);
  const b = ch(n & 255);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

// ---------------------------------------------------------------- markup

function segPath(segs: Segment[]): string {
  return segs.map(([x0, y0, x1, y1]) => `M${f(x0)} ${f(y0)}L${f(x1)} ${f(y1)}`).join('');
}

export type FillSpec =
  | { kind: 'satin'; angle: number; phase?: number }
  | { kind: 'fan'; cx: number; cy: number; a0: number; a1: number };

/**
 * A stitched region: base in a darker tone (the ground between threads), the
 * stitches, a restrained directional highlight, and optional strands.
 */
export function region(poly: Poly, colour: string, fill: FillSpec, L: Level, opts: { shadow?: boolean; ground?: number } = {}): string {
  const inset = L.width * 0.1;
  const segs =
    fill.kind === 'satin'
      ? satinSegments(poly, fill.angle, L.pitch, inset, fill.phase ?? 0)
      : fanSegments(poly, fill.cx, fill.cy, L.pitch * L.fanScale, fill.a0, fill.a1, inset);
  const d = segPath(segs);
  const outline = polyPath(poly);
  const parts: string[] = [];
  if (opts.shadow) parts.push(`<path d="${outline}" fill="#000" opacity=".28" transform="translate(.7 1.1)"/>`);
  parts.push(`<path d="${outline}" fill="${shade(colour, opts.ground ?? 0.62)}"/>`);
  parts.push(
    `<path d="${d}" stroke="${colour}" stroke-width="${f(L.width)}" stroke-linecap="round" fill="none"/>`
  );
  if (L.strands) {
    parts.push(
      `<path d="${d}" stroke="${shade(colour, 1, 0.3)}" stroke-width="${f(L.width * 0.28)}" stroke-linecap="round" fill="none" opacity=".5" transform="translate(${f(-L.width * 0.14)} ${f(-L.width * 0.18)})"/>`
    );
    parts.push(
      `<path d="${d}" stroke="${shade(colour, 0.7)}" stroke-width="${f(L.width * 0.16)}" stroke-linecap="round" fill="none" opacity=".35" transform="translate(${f(L.width * 0.2)} ${f(L.width * 0.22)})"/>`
    );
  }
  // One matte highlight from the upper left, clipped by the region itself.
  parts.push(`<path d="${outline}" fill="url(#ti-light)" opacity=".55"/>`);
  return parts.join('');
}

/** A cord outline following a contour: shadow, body, wrapped highlight. */
export function cord(d: string, colour: string, L: Level, opts: { closed?: boolean; wrap?: boolean } = {}): string {
  const w = L.cord;
  const wrap = opts.wrap ?? true;
  const parts: string[] = [];
  parts.push(
    `<path d="${d}" stroke="#000" stroke-width="${f(w * 1.05)}" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".3" transform="translate(.5 .9)"/>`
  );
  parts.push(`<path d="${d}" stroke="${colour}" stroke-width="${f(w)}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`);
  if (wrap) {
    parts.push(
      `<path d="${d}" stroke="${shade(colour, 1, 0.34)}" stroke-width="${f(w * 0.5)}" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="${f(w * 0.55)} ${f(w * 0.75)}" opacity=".7" transform="translate(${f(-w * 0.08)} ${f(-w * 0.12)})"/>`
    );
  }
  return parts.join('');
}

/** A knot: a raised dot with a dark rim and a tiny glint. */
export function knot(cx: number, cy: number, r: number, colour: string): string {
  return (
    `<circle cx="${f(cx + 0.4)}" cy="${f(cy + 0.6)}" r="${f(r)}" fill="#000" opacity=".3"/>` +
    `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="${shade(colour, 0.7)}"/>` +
    `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r * 0.72)}" fill="${colour}"/>` +
    `<circle cx="${f(cx - r * 0.3)}" cy="${f(cy - r * 0.32)}" r="${f(r * 0.26)}" fill="#fff" opacity=".7"/>`
  );
}

/** A short straight stitch, for glints and accents. */
export function stitch(x0: number, y0: number, x1: number, y1: number, colour: string, w: number, opacity = 0.75): string {
  return `<path d="M${f(x0)} ${f(y0)}L${f(x1)} ${f(y1)}" stroke="${colour}" stroke-width="${f(w)}" stroke-linecap="round" fill="none" opacity="${f(opacity)}"/>`;
}

/** Shared defs: the directional highlight gradient. */
export const DEFS =
  '<defs><linearGradient id="ti-light" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".34"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".14"/></linearGradient></defs>';
