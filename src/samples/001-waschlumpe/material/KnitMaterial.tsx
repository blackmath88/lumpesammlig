import { useEffect, useRef } from 'react';
import type { KnitMaterialParameters } from './parameters';

export type KnitQuality = 'micro' | 'small' | 'full';
export type KnitDeformation = {
  type: 'press' | 'stretch' | 'toggle' | 'wave';
  amount?: number;
  x?: number;
  y?: number;
  direction?: number;
};

type Point = [number, number, number, number];
type Props = {
  parameters: KnitMaterialParameters;
  quality?: KnitQuality;
  interactive?: boolean;
  active?: boolean;
  deformation?: KnitDeformation;
  className?: string;
  label?: string;
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

export default function KnitMaterial({ parameters, quality = 'full', interactive = false, active = true, deformation, className = '', label = 'Procedurally rendered knitted textile' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d', { alpha: false });
    if (!canvas || !ctx) return;

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let reduced = motionQuery.matches;
    let visible = true;
    let raf = 0;
    let animating = false;
    let lastFrame = 0;
    const start = performance.now();
    const pointer = { x: .5, y: .5, tx: .5, ty: .5, down: false, active: false, strength: 0 };
    const frameInterval = quality === 'micro' ? 1000 / 18 : quality === 'small' ? 1000 / 30 : 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dprCap = quality === 'full' ? 1.6 : quality === 'small' ? 1.25 : 1;
      const dpr = Math.min(window.devicePixelRatio || 1, dprCap);
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const mix = (a: number[], b: number[], t: number) => a.map((v, i) => lerp(v, b[i], t));
    const colorAt = (x: number, y: number) => {
      const lilac = [187, 181, 199];
      const neutral = [194, 196, 181];
      const sage = [170, 190, 155];
      const mint = [151, 207, 183];
      const aqua = [139, 190, 187];
      const drift = clamp(x * .86 + y * .16, 0, 1);
      let color = drift < .38 ? mix(lilac, neutral, drift / .38) : drift < .72 ? mix(neutral, sage, (drift - .38) / .34) : mix(sage, mint, (drift - .72) / .28);
      color = mix([188, 190, 183], color, parameters.gradientMix);
      return mix(color, aqua, Math.max(0, y - .74) * .42 * parameters.gradientMix);
    };
    const rgba = (c: number[], a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
    const noise = (x: number, y: number, t: number) => Math.sin(x * .063 + y * .021 + t * .28) * .42 + Math.sin(x * .018 - y * .071 - t * .16) * .33 + Math.cos((x + y) * .041 + t * .11) * .25;

    const field = (x: number, y: number, w: number, h: number, t: number) => {
      let fx = 0, fy = 0, strength = 0;
      const apply = (px: number, py: number, amount: number, radius: number, mode: string) => {
        const dx = x - px, dy = y - py;
        const falloff = Math.exp(-(dx * dx + dy * dy) / (2 * radius * radius));
        const local = falloff * amount;
        if (mode === 'press') { fx += dx / (radius + 1) * local * 16; fy += dy / (radius + 1) * local * 16; }
        else if (mode === 'stretch') { fx += Math.cos(deformation?.direction ?? 0) * local * 34; fy += Math.sin(deformation?.direction ?? 0) * local * 24; }
        else if (mode === 'toggle') { fx += (x - w / 2) / (w + 1) * local * 22; fy -= (y - h / 2) / (h + 1) * local * 12; }
        strength = Math.max(strength, local);
      };

      if (interactive && pointer.active) {
        const px = pointer.x * w, py = pointer.y * h;
        const dx = x - px, dy = y - py;
        const radius = Math.min(w, h) * .3;
        const falloff = Math.exp(-(dx * dx + dy * dy) / (2 * radius * radius));
        const lagX = (pointer.tx - pointer.x) * w;
        const lagY = (pointer.ty - pointer.y) * h;
        const local = falloff * pointer.strength * (pointer.down ? 1.35 : 1);
        fx += lagX * local * .34; fy += lagY * local * .34; strength = local;
      }
      if (deformation) {
        const amount = clamp(deformation.amount ?? 1, 0, 1);
        if (deformation.type === 'wave') {
          const phase = reduced ? .5 : (t * .24) % 1;
          const band = Math.exp(-Math.pow((x / w - phase) * 7, 2));
          fy -= Math.sin((y / h) * Math.PI) * band * 8 * amount;
          strength = Math.max(strength, band * amount);
        } else {
          apply((deformation.x ?? .5) * w, (deformation.y ?? .5) * h, amount, Math.min(w, h) * .48, deformation.type);
        }
      }
      return [fx, fy, strength] as const;
    };

    const drawCurve = (a: Point, b: Point, color: string, width: number, bendX: number, bendY: number) => {
      ctx.strokeStyle = color; ctx.lineWidth = width; ctx.beginPath(); ctx.moveTo(a[0], a[1]);
      ctx.quadraticCurveTo((a[0] + b[0]) * .5 + bendX, (a[1] + b[1]) * .5 + bendY, b[0], b[1]); ctx.stroke();
    };

    const draw = (now = performance.now()) => {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      const t = reduced ? 0 : (now - start) / 1000;
      pointer.x = lerp(pointer.x, pointer.tx, .03 + (1 - parameters.softness) * .12);
      pointer.y = lerp(pointer.y, pointer.ty, .03 + (1 - parameters.softness) * .12);
      pointer.strength = lerp(pointer.strength, pointer.active ? 1 : 0, .025 + (1 - parameters.softness) * .11);
      const bg = ctx.createLinearGradient(0, 0, w, h);
      bg.addColorStop(0, '#29272d'); bg.addColorStop(.48, '#1a1e1a'); bg.addColorStop(1, '#101713');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);

      const qualityScale = quality === 'micro' ? 1.55 : quality === 'small' ? 1.22 : 1;
      const step = clamp((22 + parameters.openness * 18) * qualityScale, quality === 'full' ? 24 : 18, quality === 'micro' ? 48 : 40);
      const stepY = step * lerp(.78, 1.03, parameters.tension);
      const cols = Math.ceil(w / step) + 7, rows = Math.ceil(h / stepY) + 7;
      const pts: Point[][] = [];
      const irregularity = parameters.irregularity;
      for (let j = -3; j < rows; j++) {
        const row: Point[] = [];
        for (let i = -3; i < cols; i++) {
          let x = i * step + (j % 2 === 0 ? step * .14 : -step * .06);
          let y = j * stepY;
          x += (Math.sin(j * .72 + i * .16) * 4 + Math.cos(i * .41 - j * .2) * 2) * irregularity;
          y += (Math.sin(i * .57 - j * .18) * 3.2 + Math.cos(j * .37) * 2) * irregularity;
          const idle = (Math.sin(x / Math.max(w, 1) * 5.7 + y / Math.max(h, 1) * 2.3 + t * .22) * 4 + Math.sin(y / Math.max(h, 1) * 7.8 - t * .17) * 3) * parameters.idleMotion;
          const f = field(x, y, w, h, t);
          row.push([x + f[0], y + f[1] + idle + noise(x, y, t) * 3.4 * irregularity, f[2], Math.hypot(f[0], f[1])]);
        }
        pts.push(row);
      }

      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      for (let j = 0; j < pts.length - 1; j++) for (let i = 0; i < pts[j].length - 1; i++) {
        const p = pts[j][i], pr = pts[j][i + 1], pd = pts[j + 1][i];
        const color = colorAt(clamp(p[0] / w, 0, 1), clamp(p[1] / h, 0, 1));
        const handmade = .78 + ((Math.sin(i * .57 + j * .31) + 1) * .22 + (Math.cos(i * .19 - j * .63) + 1) * .12) * irregularity;
        const thick = lerp(2.2, 7.2, parameters.yarnThickness) * handmade + p[3] * .012;
        const bend = lerp(6.2, 2.2, parameters.tension);
        drawCurve([p[0] + 1.5, p[1] + 1.8, 0, 0], [pr[0] + 1.5, pr[1] + 1.8, 0, 0], 'rgba(0,0,0,.34)', thick + 3, 0, -bend);
        drawCurve([p[0] + 1.5, p[1] + 1.8, 0, 0], [pd[0] + 1.5, pd[1] + 1.8, 0, 0], 'rgba(0,0,0,.34)', thick + 3, bend, 0);
        drawCurve(p, pr, rgba(color), thick, 0, -bend - Math.sin(i + j) * irregularity * 1.5);
        drawCurve(p, pd, rgba(color), thick * .95, bend + Math.cos(i * .8) * irregularity, 0);
        if (quality !== 'micro') drawCurve([p[0] - .6, p[1] - .7, 0, 0], [pr[0] - .6, pr[1] - .7, 0, 0], 'rgba(255,255,245,.19)', Math.max(.7, thick * .2), 0, -bend);
      }
      const vignette = ctx.createRadialGradient(w * .52, h * .42, Math.min(w, h) * .16, w * .52, h * .42, Math.max(w, h) * .78);
      vignette.addColorStop(0, 'rgba(255,255,255,.025)'); vignette.addColorStop(1, 'rgba(0,0,0,.43)');
      ctx.fillStyle = vignette; ctx.fillRect(0, 0, w, h);
    };

    const loop = (now: number) => {
      if (!visible || !active || reduced) { animating = false; return; }
      if (now - lastFrame >= frameInterval) { draw(now); lastFrame = now; }
      raf = requestAnimationFrame(loop);
    };
    const startLoop = () => {
      if (!animating && visible && active && !reduced) { animating = true; raf = requestAnimationFrame(loop); }
    };
    const setPointer = (event: PointerEvent) => { const rect = canvas.getBoundingClientRect(); pointer.tx = clamp((event.clientX - rect.left) / rect.width, 0, 1); pointer.ty = clamp((event.clientY - rect.top) / rect.height, 0, 1); pointer.active = true; };
    const onDown = (event: PointerEvent) => { setPointer(event); pointer.down = true; canvas.setPointerCapture?.(event.pointerId); };
    const onUp = () => { pointer.down = false; };
    const onLeave = () => { pointer.active = false; pointer.down = false; };
    const onMotion = (event: MediaQueryListEvent) => { reduced = event.matches; if (reduced) { cancelAnimationFrame(raf); animating = false; draw(); } else startLoop(); };
    const resizeObserver = new ResizeObserver(() => { resize(); draw(); });
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) { draw(); startLoop(); }
      else { cancelAnimationFrame(raf); animating = false; }
    }, { rootMargin: '120px' });

    if (interactive) { canvas.addEventListener('pointermove', setPointer, { passive: true }); canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp); canvas.addEventListener('pointerleave', onLeave); }
    motionQuery.addEventListener('change', onMotion); resizeObserver.observe(canvas); intersectionObserver.observe(canvas);
    resize(); draw(); startLoop();
    return () => { cancelAnimationFrame(raf); resizeObserver.disconnect(); intersectionObserver.disconnect(); motionQuery.removeEventListener('change', onMotion); canvas.removeEventListener('pointermove', setPointer); canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); canvas.removeEventListener('pointerleave', onLeave); };
  }, [active, deformation, interactive, parameters, quality]);

  return <canvas ref={canvasRef} className={`knit-material ${className}`} role={label ? 'img' : undefined} aria-label={label || undefined} aria-hidden={label ? undefined : true} />;
}
