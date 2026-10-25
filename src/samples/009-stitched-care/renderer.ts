/**
 * 009 — Stitched Care: Canvas 2D stitch renderer.
 *
 * Draws the shared pattern model at any scale. One routine draws every
 * stitch, so the whole hanger and the close detail are the same object seen
 * at two distances. Drawing is incremental while stitches accumulate and
 * restarts from the support when the count goes backwards.
 */
import {
  CENTRE_COL,
  COLS,
  HALF_LENGTH,
  HOOK_PATH,
  KIND_EDGE,
  PALETTE,
  centreLine,
  getStitchModel,
  halfWidth,
  type StitchModel
} from './pattern';

export type View = 'whole' | 'detail' | 'preview';

type Viewport = { x0: number; y0: number; cell: number };

const WHOLE_X0 = CENTRE_COL - 122;
const WHOLE_WIDTH = 244;
const WHOLE_Y0 = -26;
const WHOLE_HEIGHT = 77;

const STAGE = '#1b1e1d';
const SUPPORT = '#5a4636';
const SUPPORT_EDGE = 'rgba(38,26,19,.7)';
const MESH = 'rgba(226,212,184,.2)';

function hash(i: number, salt: number): number {
  let h = (Math.imul(i, 0x9e3779b1) + Math.imul(salt + 1, 0x85ebca77)) >>> 0;
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
  const b = Math.round(Math.min(255, rgb[2] * factor + (238 - rgb[2]) * lift));
  return `rgb(${r},${g},${b})`;
}

type Styles = { body: string[]; highlight: string[]; fibre: string[] };

let styles: Styles | undefined;

function getStyles(model: StitchModel): Styles {
  if (styles) return styles;
  const body: string[] = new Array(model.colour.length);
  const highlight: string[] = new Array(model.colour.length);
  const fibre: string[] = new Array(model.colour.length);
  for (let i = 0; i < model.colour.length; i++) {
    if (!model.inside[i]) continue;
    const rgb = PALETTE[model.colour[i]];
    const factor = 0.94 + hash(i, 2) * 0.12;
    body[i] = tone(rgb, factor, 0);
    highlight[i] = tone(rgb, factor, 0.26);
    fibre[i] = tone(rgb, factor * 0.72, 0);
  }
  styles = { body, highlight, fibre };
  return styles;
}

export function computeViewport(view: View, width: number, height: number): Viewport {
  if (view === 'whole') {
    const cell = Math.min(width / WHOLE_WIDTH, height / WHOLE_HEIGHT);
    return {
      cell,
      x0: WHOLE_X0 - (width / cell - WHOLE_WIDTH) / 2,
      y0: WHOLE_Y0 - (height / cell - WHOLE_HEIGHT) / 2
    };
  }
  if (view === 'preview') {
    const cell = width / 40;
    return { cell, x0: CENTRE_COL - 20, y0: centreLine(0) - 1 - height / cell / 2 };
  }
  const across = Math.min(46, Math.max(18, Math.round(width / 28)));
  const cell = width / across;
  return { cell, x0: CENTRE_COL - across / 2, y0: centreLine(0) + 0.5 - height / cell / 2 };
}

function tracePath(ctx: CanvasRenderingContext2D, vp: Viewport) {
  const endRadius = halfWidth(HALF_LENGTH);
  const endX = HALF_LENGTH - endRadius;
  const px = (x: number) => (x + CENTRE_COL - vp.x0) * vp.cell;
  const py = (y: number) => (y - vp.y0) * vp.cell;
  const edge = (x: number, sign: number) => {
    const slope = centreLine(x + 0.5) - centreLine(x - 0.5);
    return centreLine(x) + sign * halfWidth(x) * Math.sqrt(1 + slope * slope);
  };
  ctx.beginPath();
  ctx.moveTo(px(-endX), py(edge(-endX, -1)));
  for (let x = -endX; x <= endX; x += 2) ctx.lineTo(px(x), py(edge(x, -1)));
  ctx.arc(px(endX), py(centreLine(endX)), endRadius * vp.cell, -Math.PI / 2, Math.PI / 2);
  for (let x = endX; x >= -endX; x -= 2) ctx.lineTo(px(x), py(edge(x, 1)));
  ctx.arc(px(-endX), py(centreLine(-endX)), endRadius * vp.cell, Math.PI / 2, (3 * Math.PI) / 2);
  ctx.closePath();
}

function drawHook(ctx: CanvasRenderingContext2D, vp: Viewport) {
  const pts = HOOK_PATH.map(([x, y]) => [(x + CENTRE_COL - vp.x0) * vp.cell, (y - vp.y0) * vp.cell]);
  const trace = () => {
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[Math.min(pts.length - 1, i + 2)];
      ctx.bezierCurveTo(
        p1[0] + (p2[0] - p0[0]) / 6,
        p1[1] + (p2[1] - p0[1]) / 6,
        p2[0] - (p3[0] - p1[0]) / 6,
        p2[1] - (p3[1] - p1[1]) / 6,
        p2[0],
        p2[1]
      );
    }
  };
  const c = vp.cell;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.setLineDash([]);
  trace();
  ctx.strokeStyle = 'rgba(20,14,8,.55)';
  ctx.lineWidth = c * 1.9;
  ctx.stroke();
  ctx.strokeStyle = '#8f7340';
  ctx.lineWidth = c * 1.25;
  ctx.stroke();
  // Twisted wire: a dashed darker thread and a thin matte highlight.
  ctx.strokeStyle = 'rgba(60,42,20,.55)';
  ctx.lineWidth = c * 0.5;
  ctx.setLineDash([c * 0.7, c * 0.75]);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.save();
  ctx.translate(-c * 0.22, -c * 0.25);
  trace();
  ctx.strokeStyle = 'rgba(224,200,140,.55)';
  ctx.lineWidth = c * 0.3;
  ctx.stroke();
  ctx.restore();
}

function drawSupport(ctx: CanvasRenderingContext2D, vp: Viewport, width: number, height: number) {
  ctx.fillStyle = STAGE;
  ctx.fillRect(0, 0, width, height);
  drawHook(ctx, vp);
  tracePath(ctx, vp);
  ctx.fillStyle = SUPPORT;
  ctx.fill();
  ctx.save();
  ctx.clip();
  // Padded roundness: a soft dark rim inside the silhouette.
  ctx.strokeStyle = SUPPORT_EDGE;
  ctx.lineWidth = vp.cell * 3;
  ctx.stroke();
  if (vp.cell >= 5) {
    // The embroidery canvas: a faint mesh at stitch pitch.
    ctx.strokeStyle = MESH;
    ctx.lineWidth = Math.max(1, vp.cell * 0.08);
    ctx.beginPath();
    const c0 = Math.max(0, Math.floor(vp.x0));
    const c1 = Math.min(COLS, Math.ceil(vp.x0 + width / vp.cell));
    const r0 = Math.max(0, Math.floor(vp.y0));
    const r1 = Math.min(getStitchModel().rows, Math.ceil(vp.y0 + height / vp.cell));
    for (let c = c0; c <= c1; c++) {
      const x = (c - vp.x0) * vp.cell;
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    for (let r = r0; r <= r1; r++) {
      const y = (r - vp.y0) * vp.cell;
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();
  }
  ctx.restore();
}

function drawStitch(
  ctx: CanvasRenderingContext2D,
  model: StitchModel,
  st: Styles,
  i: number,
  k: number,
  px: number,
  py: number,
  cell: number
) {
  const edge = model.kind[i] === KIND_EDGE;
  const v1 = hash(i, 0);
  const v3 = hash(i, 3);
  const angle = (edge ? (k % 2 ? 1 : -1) * Math.PI / 4 : -Math.PI / 4) + (v1 - 0.5) * 0.12;
  const half = cell * (edge ? 0.54 : 0.5 + (v3 - 0.5) * 0.06);
  const dx = Math.cos(angle) * half;
  const dy = Math.sin(angle) * half;
  const ox = px + (v3 - 0.5) * 0.08 * cell;
  const oy = py + (v1 - 0.5) * 0.08 * cell;
  const w = cell * (edge ? 0.74 : 0.68);

  // Contact shadow towards the lower right.
  ctx.strokeStyle = 'rgba(14,10,8,.34)';
  ctx.lineWidth = w * 1.04;
  ctx.beginPath();
  ctx.moveTo(ox - dx + cell * 0.12, oy - dy + cell * 0.15);
  ctx.lineTo(ox + dx + cell * 0.12, oy + dy + cell * 0.15);
  ctx.stroke();

  // Thread body.
  ctx.strokeStyle = st.body[i];
  ctx.lineWidth = w;
  ctx.beginPath();
  ctx.moveTo(ox - dx, oy - dy);
  ctx.lineTo(ox + dx, oy + dy);
  ctx.stroke();

  if (cell >= 11) {
    // Fibre: a few darker strands lying along the stitch.
    ctx.strokeStyle = st.fibre[i];
    ctx.lineWidth = Math.max(0.6, cell * 0.045);
    ctx.globalAlpha = 0.28;
    const nx = -dy / half;
    const ny = dx / half;
    for (let f = -1; f <= 1; f++) {
      const off = f * w * 0.19 + (hash(i, 4 + f) - 0.5) * w * 0.1;
      const shrink = 0.72 + hash(i, 7 + f) * 0.2;
      ctx.beginPath();
      ctx.moveTo(ox - dx * shrink + nx * off, oy - dy * shrink + ny * off);
      ctx.lineTo(ox + dx * shrink + nx * off, oy + dy * shrink + ny * off);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  // Matte highlight on the side facing the light (upper left).
  ctx.strokeStyle = st.highlight[i];
  ctx.lineWidth = w * 0.3;
  ctx.globalAlpha = 0.42;
  ctx.beginPath();
  ctx.moveTo(ox - dx * 0.78 - cell * 0.1, oy - dy * 0.78 - cell * 0.12);
  ctx.lineTo(ox + dx * 0.78 - cell * 0.1, oy + dy * 0.78 - cell * 0.12);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

export class StitchRenderer {
  private ctx: CanvasRenderingContext2D;
  private model = getStitchModel();
  private width = 0;
  private height = 0;
  private dpr = 1;
  private view: View | undefined;
  private drawn = -1;
  private vp: Viewport = { x0: 0, y0: 0, cell: 1 };

  constructor(private canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  static create(canvas: HTMLCanvasElement): StitchRenderer | null {
    const ctx = canvas.getContext('2d', { alpha: false });
    return ctx ? new StitchRenderer(canvas, ctx) : null;
  }

  get total(): number {
    return this.model.total;
  }

  /** Resize the backing store; resolution is capped so dense views stay cheap. */
  resize(cssWidth: number, cssHeight: number, devicePixelRatio: number): void {
    const dpr = Math.min(2, devicePixelRatio || 1, 2200 / Math.max(1, cssWidth));
    const w = Math.max(1, Math.round(cssWidth * dpr));
    const h = Math.max(1, Math.round(cssHeight * dpr));
    this.width = cssWidth;
    this.height = cssHeight;
    if (w === this.canvas.width && h === this.canvas.height && dpr === this.dpr && this.drawn >= 0) return;
    this.canvas.width = w;
    this.canvas.height = h;
    this.dpr = dpr;
    this.drawn = -1;
  }

  /** Draw `count` stitches of the sequence in the given view. */
  render(view: View, count: number): void {
    const { ctx, model } = this;
    const n = Math.max(0, Math.min(model.total, Math.round(count)));
    if (view !== this.view || this.drawn < 0 || n < this.drawn) {
      this.view = view;
      this.vp = computeViewport(view, this.width, this.height);
      ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      drawSupport(ctx, this.vp, this.width, this.height);
      this.drawn = 0;
    }
    if (n === this.drawn) return;
    const st = getStyles(model);
    const vp = this.vp;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.lineCap = 'round';
    const margin = vp.cell;
    for (let k = this.drawn; k < n; k++) {
      const i = model.order[k];
      const px = ((i % COLS) + 0.5 - vp.x0) * vp.cell;
      const py = (Math.floor(i / COLS) + 0.5 - vp.y0) * vp.cell;
      if (px < -margin || py < -margin || px > this.width + margin || py > this.height + margin) continue;
      drawStitch(ctx, model, st, i, k, px, py, vp.cell);
    }
    this.drawn = n;
  }
}

/** One finished frame for a collection preview. Static; no loop. */
export function renderPreview(canvas: HTMLCanvasElement): boolean {
  const renderer = StitchRenderer.create(canvas);
  if (!renderer) return false;
  // clientWidth/Height ignore the library's slight rotation; a bounding box would stretch the stitches.
  renderer.resize(canvas.clientWidth || 320, canvas.clientHeight || 400, Math.min(1.5, window.devicePixelRatio || 1));
  renderer.render('preview', renderer.total);
  return true;
}
