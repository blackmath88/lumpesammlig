/**
 * 010 — Pixels to Stitches: a small working list.
 *
 * Native controls carry the interaction. The stitching is decoration drawn
 * from the same vocabulary as the comparison: a stitched checkmark that fills
 * or unpicks with the real state change, a satin border on the selected item,
 * a running-stitch seam and one stitched label.
 */
import { CHECK, CROSS, letteringGlyph } from './glyphs';
import {
  ALL_ON,
  drawFabric,
  drawGlyph,
  drawRunningStitch,
  drawSatinBorder,
  glyphOrder,
  prepare,
  type Glyph
} from './stitch-vocabulary';

const CELL = 3;
const CHECK_CELLS = glyphOrder(CHECK, 'cols').length;
const FILL_MS = 340;

type Item = { text: string; done: boolean };

const SEED_ITEMS: Item[] = [
  { text: 'Water the geraniums', done: false },
  { text: 'Return the library book', done: true },
  { text: 'Fix the hem on the blue skirt', done: false }
];

function drawBox(canvas: HTMLCanvasElement, count: number, seed: number) {
  const size = (CHECK.cols + 2) * CELL;
  const ctx = prepare(canvas, size, size);
  if (!ctx) return;
  drawFabric(ctx, 0, 0, size, size, CELL);
  ctx.strokeStyle = 'rgba(104,70,40,.55)';
  ctx.lineWidth = 1;
  ctx.strokeRect(0.5, 0.5, size - 1, size - 1);
  drawGlyph(ctx, CHECK, CELL, CELL, CELL, ALL_ON, seed, count, 'cols');
}

function drawIcon(canvas: HTMLCanvasElement, g: Glyph, seed: number) {
  const size = (g.cols + 2) * CELL;
  const ctx = prepare(canvas, size, size);
  if (!ctx) return;
  ctx.clearRect(0, 0, size, size);
  drawGlyph(ctx, g, CELL, CELL, CELL, ALL_ON, seed);
}

export function mountSpecimen(root: HTMLElement): () => void {
  const form = root.querySelector<HTMLFormElement>('form');
  const input = root.querySelector<HTMLInputElement>('input[name="item"]');
  const list = root.querySelector<HTMLUListElement>('[data-items]');
  const template = root.querySelector<HTMLTemplateElement>('template');
  const status = root.querySelector<HTMLElement>('[data-status]');
  const undoButton = root.querySelector<HTMLButtonElement>('[data-undo]');
  const seam = root.querySelector<HTMLCanvasElement>('[data-seam]');
  const lettering = root.querySelector<HTMLCanvasElement>('[data-lettering]');
  if (!form || !input || !list || !template || !status || !undoButton) return () => {};

  const probe = document.createElement('canvas');
  const available = Boolean(probe.getContext('2d'));
  root.dataset.state = available ? 'ready' : 'unavailable';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const animations = new Map<HTMLCanvasElement, number>();
  let seedCounter = 1;
  let lastRemoved: { item: Item; index: number } | null = null;

  // Ground for the whole panel: one fabric tile as a CSS background.
  if (available) {
    const tile = document.createElement('canvas');
    const tctx = prepare(tile, CELL * 2, CELL * 2);
    if (tctx) {
      drawFabric(tctx, 0, 0, CELL * 2, CELL * 2, CELL);
      root.style.backgroundImage = `url(${tile.toDataURL()})`;
      root.style.backgroundSize = `${CELL * 2}px ${CELL * 2}px`;
    }
  }

  const setStatus = (text: string, undoable = false) => {
    status.textContent = text;
    undoButton.hidden = !undoable;
  };

  const animateBox = (canvas: HTMLCanvasElement, seed: number, to: number) => {
    const previous = animations.get(canvas);
    if (previous) cancelAnimationFrame(previous);
    const from = Number(canvas.dataset.count ?? (to === 0 ? CHECK_CELLS : 0));
    if (!available) return;
    if (reducedMotion.matches || from === to) {
      canvas.dataset.count = String(to);
      drawBox(canvas, to, seed);
      return;
    }
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / FILL_MS);
      const count = Math.round(from + (to - from) * t);
      canvas.dataset.count = String(count);
      drawBox(canvas, count, seed);
      if (t < 1) animations.set(canvas, requestAnimationFrame(step));
      else animations.delete(canvas);
    };
    animations.set(canvas, requestAnimationFrame(step));
  };

  const select = (li: HTMLElement | null) => {
    for (const other of list.querySelectorAll<HTMLElement>('li[aria-current]')) {
      if (other !== li) {
        other.removeAttribute('aria-current');
        const border = other.querySelector<HTMLCanvasElement>('[data-border]');
        if (border) border.width = 0;
      }
    }
    if (!li) return;
    li.setAttribute('aria-current', 'true');
    drawBorder(li);
  };

  const drawBorder = (li: HTMLElement) => {
    const border = li.querySelector<HTMLCanvasElement>('[data-border]');
    if (!border || !available || li.getAttribute('aria-current') !== 'true') return;
    const w = li.clientWidth;
    const h = li.clientHeight;
    const ctx = prepare(border, w, h);
    if (!ctx) return;
    ctx.clearRect(0, 0, w, h);
    drawSatinBorder(ctx, 0, 0, w, h, CELL, 10, ALL_ON, Number(li.dataset.seed ?? 0));
  };

  const addItem = (item: Item, index?: number, announce = true) => {
    const fragment = template.content.cloneNode(true) as DocumentFragment;
    const li = fragment.querySelector<HTMLElement>('li');
    const check = fragment.querySelector<HTMLInputElement>('input[type="checkbox"]');
    const text = fragment.querySelector<HTMLElement>('[data-text]');
    const box = fragment.querySelector<HTMLCanvasElement>('[data-box]');
    const remove = fragment.querySelector<HTMLButtonElement>('[data-remove]');
    const removeIcon = fragment.querySelector<HTMLCanvasElement>('[data-remove-icon]');
    if (!li || !check || !text || !box || !remove || !removeIcon) return;
    const seed = seedCounter++;
    li.dataset.seed = String(seed);
    text.textContent = item.text;
    check.checked = item.done;
    check.id = `item-${seed}`;
    li.dataset.done = String(item.done);
    remove.setAttribute('aria-label', `Remove “${item.text}”`);
    box.dataset.count = String(item.done ? CHECK_CELLS : 0);
    if (available) {
      drawBox(box, item.done ? CHECK_CELLS : 0, seed);
      drawIcon(removeIcon, CROSS, seed);
    }

    check.addEventListener('change', () => {
      // The state changes now; the stitching only follows it.
      li.dataset.done = String(check.checked);
      animateBox(box, seed, check.checked ? CHECK_CELLS : 0);
      setStatus(check.checked ? `Completed “${item.text}”.` : `Reopened “${item.text}”.`);
    });
    remove.addEventListener('click', () => {
      const index = Array.from(list.children).indexOf(li);
      const current = animations.get(box);
      if (current) cancelAnimationFrame(current);
      animations.delete(box);
      lastRemoved = { item: { text: item.text, done: check.checked }, index };
      li.remove();
      setStatus(`Removed “${item.text}”.`, true);
      undoButton.focus();
    });
    li.addEventListener('focusin', () => select(li));
    li.addEventListener('pointerdown', () => select(li));

    const siblings = list.children;
    if (index !== undefined && index < siblings.length) list.insertBefore(fragment, siblings[index]);
    else list.appendChild(fragment);
    if (announce) setStatus(`Added “${item.text}”.`);
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    addItem({ text, done: false });
    input.value = '';
    input.focus();
  });

  undoButton.addEventListener('click', () => {
    if (!lastRemoved) return;
    const { item, index } = lastRemoved;
    lastRemoved = null;
    addItem(item, index, false);
    setStatus(`Restored “${item.text}”.`);
    const restored = list.children[index] as HTMLElement | undefined;
    restored?.querySelector<HTMLInputElement>('input')?.focus();
  });

  const drawChrome = () => {
    if (!available) return;
    if (seam) {
      const w = seam.parentElement?.clientWidth ?? 320;
      const h = CELL * 4;
      const ctx = prepare(seam, w, h);
      if (ctx) {
        ctx.clearRect(0, 0, w, h);
        drawRunningStitch(ctx, 0, w, h / 2, CELL, 9, ALL_ON, 11);
      }
    }
    if (lettering) {
      const g = letteringGlyph('to do');
      const cell = 4;
      const ctx = prepare(lettering, (g.cols + 1) * cell, (g.rows + 2) * cell);
      if (ctx) {
        ctx.clearRect(0, 0, lettering.width, lettering.height);
        drawGlyph(ctx, g, cell * 0.5, cell, cell, ALL_ON, 21);
      }
    }
    for (const li of list.querySelectorAll<HTMLElement>('li[aria-current]')) drawBorder(li);
  };

  const observer = new ResizeObserver(drawChrome);
  observer.observe(root);

  for (const item of SEED_ITEMS) addItem(item, undefined, false);
  setStatus('Three items to start with.');
  drawChrome();

  const dispose = () => {
    for (const handle of animations.values()) cancelAnimationFrame(handle);
    animations.clear();
    observer.disconnect();
    window.removeEventListener('pagehide', dispose);
  };
  window.addEventListener('pagehide', dispose);
  return dispose;
}
