/**
 * 010 — Pixels to Stitches: the still comparison.
 *
 * Five fixed treatments (A–E) plus one panel whose four qualities the visitor
 * can switch independently. Every panel draws the same charts, palette and
 * scale: a 1× row at the size the icons would be used, and one enlargement
 * that explains the construction.
 */
import { BOTANICAL_MOTIF, CHECK, HEART } from './glyphs';
import { ALL_ON, drawGlyph, drawGround, prepare, type Glyph, type Qualities } from './stitch-vocabulary';

export const TREATMENTS: Record<string, Qualities> = {
  A: { directional: false, volume: false, fabric: false, variation: false },
  B: { directional: true, volume: false, fabric: false, variation: false },
  C: { directional: true, volume: true, fabric: false, variation: false },
  D: { directional: true, volume: true, fabric: true, variation: false },
  E: ALL_ON
};

const GLYPHS: Record<string, Glyph> = { heart: HEART, check: CHECK, motif: BOTANICAL_MOTIF };
const ROW: Glyph[] = [HEART, CHECK, BOTANICAL_MOTIF];
const PAD = 2;
const GAP = 3;
const CELL_1X = 3;

function drawRow(canvas: HTMLCanvasElement, q: Qualities) {
  const cols = ROW.reduce((sum, g) => sum + g.cols, 0) + GAP * (ROW.length - 1) + PAD * 2;
  const rows = Math.max(...ROW.map((g) => g.rows)) + PAD * 2;
  const ctx = prepare(canvas, cols * CELL_1X, rows * CELL_1X);
  if (!ctx) return;
  drawGround(ctx, cols * CELL_1X, rows * CELL_1X, CELL_1X, q);
  let x = PAD;
  ROW.forEach((g, i) => {
    const y = PAD + Math.floor((rows - PAD * 2 - g.rows) / 2);
    drawGlyph(ctx, g, x * CELL_1X, y * CELL_1X, CELL_1X, q, i + 1);
    x += g.cols + GAP;
  });
}

function drawEnlarged(canvas: HTMLCanvasElement, q: Qualities, g: Glyph, seed: number, width: number) {
  const cols = g.cols + PAD * 2;
  const rows = g.rows + PAD * 2;
  const cell = Math.max(8, Math.min(18, Math.floor(width / cols)));
  const ctx = prepare(canvas, cols * cell, rows * cell);
  if (!ctx) return;
  drawGround(ctx, cols * cell, rows * cell, cell, q);
  drawGlyph(ctx, g, PAD * cell, PAD * cell, cell, q, seed);
}

export function mountComparison(root: HTMLElement): () => void {
  const panels = Array.from(root.querySelectorAll<HTMLElement>('[data-treatment]'));
  const enlargeInputs = Array.from(root.querySelectorAll<HTMLInputElement>('input[name="enlarge"]'));
  const qualityInputs = Array.from(root.querySelectorAll<HTMLInputElement>('input[data-quality]'));

  const probe = document.createElement('canvas');
  if (!probe.getContext('2d')) {
    root.dataset.state = 'unavailable';
    return () => {};
  }
  root.dataset.state = 'ready';

  const customQualities = (): Qualities => ({
    directional: qualityInputs.find((i) => i.dataset.quality === 'directional')?.checked ?? true,
    volume: qualityInputs.find((i) => i.dataset.quality === 'volume')?.checked ?? true,
    fabric: qualityInputs.find((i) => i.dataset.quality === 'fabric')?.checked ?? true,
    variation: qualityInputs.find((i) => i.dataset.quality === 'variation')?.checked ?? true
  });

  let frame = 0;
  const render = () => {
    frame = 0;
    const which = enlargeInputs.find((i) => i.checked)?.value ?? 'heart';
    const glyphToEnlarge = GLYPHS[which] ?? HEART;
    const seed = which === 'heart' ? 1 : which === 'check' ? 2 : 3;
    for (const panel of panels) {
      const key = panel.dataset.treatment ?? 'E';
      const q = key === 'custom' ? customQualities() : TREATMENTS[key] ?? ALL_ON;
      const row = panel.querySelector<HTMLCanvasElement>('[data-row]');
      const big = panel.querySelector<HTMLCanvasElement>('[data-enlarged]');
      if (row) drawRow(row, q);
      if (big) drawEnlarged(big, q, glyphToEnlarge, seed, big.parentElement?.clientWidth ?? 260);
    }
  };
  const request = () => {
    if (!frame) frame = requestAnimationFrame(render);
  };

  for (const input of [...enlargeInputs, ...qualityInputs]) input.addEventListener('change', request);
  const observer = new ResizeObserver(request);
  observer.observe(root);

  const dispose = () => {
    cancelAnimationFrame(frame);
    observer.disconnect();
    for (const input of [...enlargeInputs, ...qualityInputs]) input.removeEventListener('change', request);
    window.removeEventListener('pagehide', dispose);
  };
  window.addEventListener('pagehide', dispose);
  render();
  return dispose;
}

/** One static frame for the collection preview: the full treatment, enlarged. */
export function renderPreview(canvas: HTMLCanvasElement): boolean {
  const width = canvas.clientWidth || 320;
  const height = canvas.clientHeight || 400;
  const cell = Math.max(10, Math.min(26, Math.floor(width / 24)));
  const ctx = prepare(canvas, width, height);
  if (!ctx) return false;
  drawGround(ctx, width, height, cell, ALL_ON);
  const x0 = Math.floor((width - (HEART.cols + 2 + BOTANICAL_MOTIF.cols) * cell) / 2);
  const y0 = Math.floor((height - BOTANICAL_MOTIF.rows * cell) / 2);
  drawGlyph(ctx, HEART, x0, y0 + cell, cell, ALL_ON, 1);
  drawGlyph(ctx, BOTANICAL_MOTIF, x0 + (HEART.cols + 2) * cell, y0, cell, ALL_ON, 3);
  return true;
}
