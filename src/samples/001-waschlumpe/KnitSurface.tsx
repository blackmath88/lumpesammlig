import { useEffect, useRef, useState } from 'react';
import './knit-surface.css';

type Point = [number, number, number, number];

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

type KnitSurfaceProps = {
  collectionHref?: string;
};

export default function KnitSurface({ collectionHref = '#library' }: KnitSurfaceProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const motionQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    let reduced = motionQuery?.matches ?? false;
    let animate = running && !reduced;
    let raf = 0;
    let start = performance.now();

    const pointer = {
      x: 0.5, y: 0.5, tx: 0.5, ty: 0.5,
      down: false, active: false,
      strength: 0
    };

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.6);
      canvas.width = Math.max(1, Math.floor(r.width * dpr));
      canvas.height = Math.max(1, Math.floor(r.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const mix = (a: number[], b: number[], t: number) => a.map((v, i) => lerp(v, b[i], t));
    const colorAt = (x: number, y: number) => {
      const lil = [190, 183, 200];
      const grey = [196, 197, 187];
      const sage = [177, 191, 159];
      const mint = [159, 207, 186];
      const aqua = [144, 192, 187];
      const t = clamp(x * 0.9 + y * 0.12, 0, 1);
      let c = t < 0.38 ? mix(lil, grey, t / 0.38)
        : t < 0.72 ? mix(grey, sage, (t - 0.38) / 0.34)
        : mix(sage, mint, (t - 0.72) / 0.28);
      c = mix(c, aqua, Math.max(0, y - 0.76) * 0.45);
      return c;
    };
    const rgba = (c: number[], a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
    const noise = (x: number, y: number, t: number) =>
      Math.sin(x * 0.063 + y * 0.021 + t * 0.28) * 0.42 +
      Math.sin(x * 0.018 - y * 0.071 - t * 0.16) * 0.33 +
      Math.cos((x + y) * 0.041 + t * 0.11) * 0.25;

    const tensionField = (x: number, y: number, w: number, h: number) => {
      const px = pointer.x * w, py = pointer.y * h;
      const dx = x - px, dy = y - py, d = Math.hypot(dx, dy);
      if (!pointer.active) return [0, 0, 0] as const;
      const radius = Math.min(w, h) * 0.28;
      const falloff = Math.exp(-(d * d) / (2 * radius * radius));
      const lagX = (pointer.tx - pointer.x) * w;
      const lagY = (pointer.ty - pointer.y) * h;
      const pressure = pointer.down ? 1.35 : 1;
      const strength = falloff * pointer.strength * pressure;
      return [lagX * strength * 0.34, lagY * strength * 0.34, strength] as const;
    };

    const deform = (x: number, y: number, i: number, j: number, w: number, h: number, t: number): Point => {
      const nx = x / w, ny = y / h;
      const idle = Math.sin(nx * 5.7 + ny * 2.3 + t * 0.22) * 4.0 + Math.sin(ny * 7.8 - nx * 2.8 - t * 0.17) * 3.0;
      const handmadeX = Math.sin(i * 0.8 + j * 0.26) * 4.0 + Math.cos(j * 0.43 - i * 0.19) * 2.4;
      const handmadeY = Math.sin(j * 0.68 + i * 0.21) * 3.6 + Math.cos(i * 0.39 - j * 0.18) * 2.1;
      const tension = tensionField(x, y, w, h);
      return [
        x + handmadeX + Math.sin(ny * 8 + t * 0.12) * 2.4 + tension[0],
        y + handmadeY + idle + noise(x, y, t) * 3.4 + tension[1],
        tension[2],
        Math.hypot(tension[0], tension[1])
      ];
    };

    const drawCurve = (a: Point, b: Point, color: string, width: number, bendX: number, bendY: number) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.moveTo(a[0], a[1]);
      const mx = (a[0] + b[0]) * 0.5 + bendX;
      const my = (a[1] + b[1]) * 0.5 + bendY;
      ctx.quadraticCurveTo(mx, my, b[0], b[1]);
      ctx.stroke();
    };

    const draw = () => {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      const t = (performance.now() - start) / 1000;
      pointer.x = lerp(pointer.x, pointer.tx, 0.055);
      pointer.y = lerp(pointer.y, pointer.ty, 0.055);
      pointer.strength = lerp(pointer.strength, pointer.active ? 1 : 0, 0.045);

      const bg = ctx.createLinearGradient(0, 0, w, h);
      bg.addColorStop(0, '#28262b'); bg.addColorStop(0.48, '#1a1d19'); bg.addColorStop(1, '#111712');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);

      const stepX = Math.max(25, Math.min(35, w / 38));
      const stepY = stepX * 0.93;
      const cols = Math.ceil(w / stepX) + 7;
      const rows = Math.ceil(h / stepY) + 7;
      const pts: Point[][] = [];

      for (let j = -3; j < rows; j++) {
        const row: Point[] = [];
        for (let i = -3; i < cols; i++) {
          let x = i * stepX + (j % 2 === 0 ? stepX * 0.16 : -stepX * 0.07);
          let y = j * stepY;
          x += Math.sin(j * 0.72 + i * 0.16) * 3.8;
          y += Math.sin(i * 0.57 - j * 0.18) * 3.1;
          row.push(deform(x, y, i, j, w, h, t));
        }
        pts.push(row);
      }

      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      for (let j = 0; j < pts.length - 1; j++) {
        for (let i = 0; i < pts[j].length - 1; i++) {
          const p = pts[j][i], pr = pts[j][i + 1], pd = pts[j + 1][i];
          const base = colorAt(clamp(p[0] / w, 0, 1), clamp(p[1] / h, 0, 1));
          const irregular = 0.85 + (Math.sin(i * 0.57 + j * 0.31) + 1) * 0.34 + (Math.cos(i * 0.19 - j * 0.63) + 1) * 0.18;
          const thick = 3.8 * irregular + p[3] * 0.02;

          drawCurve([p[0] + 1.5, p[1] + 1.7, 0, 0], [pr[0] + 1.5, pr[1] + 1.7, 0, 0], 'rgba(0,0,0,.33)', thick + 3.0, 0, -4.2);
          drawCurve([p[0] + 1.5, p[1] + 1.7, 0, 0], [pd[0] + 1.5, pd[1] + 1.7, 0, 0], 'rgba(0,0,0,.33)', thick + 3.0, 4.3, 0);
          drawCurve(p, pr, rgba(base), thick, 0, -5.4 - Math.sin(i + j) * 1.8);
          drawCurve(p, pd, rgba(base), thick * 0.95, 5.2 + Math.cos(i * 0.8) * 1.5, 0);
          drawCurve([p[0] - .7, p[1] - .7, 0, 0], [pr[0] - .7, pr[1] - .7, 0, 0], 'rgba(255,255,245,.20)', Math.max(.8, thick * .22), 0, -4.2);

          if ((i + j) % 2 === 0) {
            ctx.beginPath();
            ctx.arc(p[0], p[1], Math.max(1.6, thick * .38), 0, Math.PI * 2);
            ctx.fillStyle = rgba(base, .92);
            ctx.fill();
          }
        }
      }

      const vign = ctx.createRadialGradient(w * .52, h * .42, Math.min(w,h)*.16, w*.52, h*.42, Math.max(w,h)*.78);
      vign.addColorStop(0, 'rgba(255,255,255,.025)'); vign.addColorStop(1, 'rgba(0,0,0,.45)');
      ctx.fillStyle = vign; ctx.fillRect(0, 0, w, h);
      if (animate) raf = requestAnimationFrame(draw);
    };

    const setPointer = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      pointer.tx = clamp((e.clientX - r.left) / r.width, 0, 1);
      pointer.ty = clamp((e.clientY - r.top) / r.height, 0, 1);
      pointer.active = true;
    };
    const onDown = (e: PointerEvent) => { setPointer(e); pointer.down = true; canvas.setPointerCapture?.(e.pointerId); };
    const onUp = () => { pointer.down = false; };
    const onLeave = () => { pointer.active = false; pointer.down = false; };

    canvas.addEventListener('pointermove', setPointer, { passive: true });
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);
    canvas.addEventListener('pointerleave', onLeave);
    const onMotionPreference = (event: MediaQueryListEvent) => {
      reduced = event.matches;
      animate = running && !reduced;
      cancelAnimationFrame(raf);
      draw();
    };
    motionQuery?.addEventListener('change', onMotionPreference);
    const ro = new ResizeObserver(() => { resize(); if (!animate) draw(); });
    ro.observe(canvas);
    resize(); draw();

    return () => {
      animate = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener('pointermove', setPointer);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
      canvas.removeEventListener('pointerleave', onLeave);
      motionQuery?.removeEventListener('change', onMotionPreference);
    };
  }, [running]);

  return (
    <section className="knit-stage" aria-label="Sample 001 — Waschlumpe">
      <canvas ref={canvasRef} className="knit-canvas" aria-label="Interactive loosely knitted textile surface" />
      <div className="knit-overlay">
        <div className="knit-copy">
          <p className="eyebrow">LUMPESAMMLIG / SAMPLE 001</p>
          <h1>Waschlumpe<br />becomes interface.</h1>
          <p className="lede">A real knitted cloth, translated into a procedural web surface.</p>
          <a className="scroll-link" href={collectionHref}>Enter the collection ↓</a>
        </div>
        <button className="motion" type="button" aria-pressed={running} onClick={() => setRunning(v => !v)}>
          {running ? 'Pause motion' : 'Resume motion'}
        </button>
      </div>
    </section>
  );
}
