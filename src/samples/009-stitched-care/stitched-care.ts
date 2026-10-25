/**
 * 009 — Stitched Care: page behaviour.
 *
 * Wires the labelled controls to one renderer. The finished textile is the
 * default state; the reveal is an exploratory view of accumulated work.
 */
import { StitchRenderer, type View } from './renderer';

const PLAY_SECONDS = 18;

export function mountStitchedCare(root: HTMLElement): () => void {
  const canvas = root.querySelector<HTMLCanvasElement>('[data-stitch-canvas]');
  const stage = root.querySelector<HTMLElement>('[data-stitch-stage]');
  const range = root.querySelector<HTMLInputElement>('[data-stitch-range]');
  const output = root.querySelector<HTMLOutputElement>('[data-stitch-count]');
  const play = root.querySelector<HTMLButtonElement>('[data-stitch-play]');
  const reset = root.querySelector<HTMLButtonElement>('[data-stitch-reset]');
  const viewButtons = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-stitch-view]'));
  const status = root.querySelector<HTMLElement>('[data-stitch-status]');

  if (!canvas || !stage || !range || !output || !play || !reset) return () => {};

  const renderer = StitchRenderer.create(canvas);
  if (!renderer) {
    root.dataset.state = 'unavailable';
    for (const el of [range, play, reset, ...viewButtons]) el.disabled = true;
    return () => {};
  }
  root.dataset.state = 'ready';

  const total = renderer.total;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const format = new Intl.NumberFormat('en-GB');

  let count = total;
  let view: View = 'whole';
  let playing = false;
  let frame = 0;
  let last = 0;
  let renderQueued = 0;
  let disposed = false;

  range.max = String(total);
  range.value = String(total);

  const describe = () => {
    const label = view === 'whole' ? 'Whole hanger' : 'Close detail of the central rose';
    const described = `${label}: ${format.format(count)} of ${format.format(total)} stitches completed.`;
    if (canvas.getAttribute('aria-label') !== described) canvas.setAttribute('aria-label', described);
    const counted = `${format.format(count)} / ${format.format(total)}`;
    if (output.textContent !== counted) output.textContent = counted;
    if (status) {
      const state =
        count === total
          ? 'Finished state'
          : count === 0
            ? 'Bare support and canvas'
            : playing
              ? 'Accumulating'
              : 'Paused mid-work';
      // Only touch the live region when the text actually changes.
      if (status.textContent !== state) status.textContent = state;
    }
  };

  const paint = () => {
    renderQueued = 0;
    if (disposed) return;
    renderer.render(view, count);
    describe();
  };

  const requestPaint = () => {
    if (!renderQueued) renderQueued = requestAnimationFrame(paint);
  };

  const setCount = (next: number) => {
    count = Math.max(0, Math.min(total, Math.round(next)));
    range.value = String(count);
    requestPaint();
  };

  const stop = () => {
    playing = false;
    cancelAnimationFrame(frame);
    frame = 0;
    play.textContent = 'Play reveal';
    describe();
  };

  const tick = (now: number) => {
    if (!playing || disposed) return;
    const dt = Math.min(0.25, (now - last) / 1000);
    // Reduced motion: advance in a few coarse steps per second instead of every frame.
    const step = reducedMotion.matches ? (dt >= 0.25 ? total / (PLAY_SECONDS * 4) : 0) : (total / PLAY_SECONDS) * dt;
    if (step > 0) {
      last = now;
      setCount(count + step);
    }
    if (count >= total) {
      stop();
      return;
    }
    frame = requestAnimationFrame(tick);
  };

  const start = () => {
    if (count >= total) setCount(0);
    playing = true;
    play.textContent = 'Pause';
    last = performance.now();
    frame = requestAnimationFrame(tick);
    describe();
  };

  const setView = (next: View) => {
    view = next;
    root.dataset.view = next;
    for (const button of viewButtons) {
      button.setAttribute('aria-pressed', String(button.dataset.stitchView === next));
    }
    resize();
  };

  const resize = () => {
    const rect = stage.getBoundingClientRect();
    renderer.resize(rect.width, rect.height, window.devicePixelRatio || 1);
    requestPaint();
  };

  const onRange = () => {
    setCount(Number(range.value));
  };
  const onPlay = () => (playing ? stop() : start());
  const onReset = () => {
    stop();
    setCount(total);
  };
  const onVisibility = () => {
    if (document.hidden && playing) stop();
  };
  const onViewClick = (event: Event) => {
    const target = event.currentTarget as HTMLButtonElement;
    const next = target.dataset.stitchView;
    if (next === 'whole' || next === 'detail') setView(next);
  };

  range.addEventListener('input', onRange);
  play.addEventListener('click', onPlay);
  reset.addEventListener('click', onReset);
  for (const button of viewButtons) button.addEventListener('click', onViewClick);
  document.addEventListener('visibilitychange', onVisibility);

  const observer = new ResizeObserver(resize);
  observer.observe(stage);

  const dispose = () => {
    if (disposed) return;
    disposed = true;
    stop();
    cancelAnimationFrame(renderQueued);
    observer.disconnect();
    range.removeEventListener('input', onRange);
    play.removeEventListener('click', onPlay);
    reset.removeEventListener('click', onReset);
    for (const button of viewButtons) button.removeEventListener('click', onViewClick);
    document.removeEventListener('visibilitychange', onVisibility);
    window.removeEventListener('pagehide', dispose);
  };
  window.addEventListener('pagehide', dispose);

  setView('whole');
  return dispose;
}
