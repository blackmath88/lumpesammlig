import type { WordArtParameters } from './parameters';

export type GradientDef = {
  kind: 'gradient';
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  stops: Array<{ offset: number; color: string }>;
};

export type LetterPlacement = {
  char: string;
  x: number;
  y: number;
  rotate: number;
  scale: number;
};

export type SceneLayer = {
  letters: LetterPlacement[];
  fill: string;
  stroke: string | null;
  strokeWidth: number;
  opacity: number;
};

export type WordArtScene = {
  width: number;
  height: number;
  defs: GradientDef[];
  layers: SceneLayer[];
  groupTransform: string | null;
  fontSize: number;
};

const RAINBOW_STOPS = ['#ff004d', '#ff9a00', '#ffe600', '#33d17a', '#00b3f6', '#8a2be2'];

const ADVANCE: Record<string, number> = {
  ' ': 0.36, '!': 0.32, '"': 0.45, "'": 0.26, '(': 0.36, ')': 0.36, ',': 0.3,
  '-': 0.4, '.': 0.3, ':': 0.3, ';': 0.3, '?': 0.5, '&': 0.68,
  '0': 0.6, '1': 0.6, '2': 0.6, '3': 0.6, '4': 0.6, '5': 0.6, '6': 0.6,
  '7': 0.6, '8': 0.6, '9': 0.6,
  A: 0.74, B: 0.68, C: 0.7, D: 0.74, E: 0.6, F: 0.56, G: 0.76, H: 0.74,
  I: 0.34, J: 0.56, K: 0.66, L: 0.56, M: 0.9, N: 0.76, O: 0.78, P: 0.6,
  Q: 0.78, R: 0.66, S: 0.6, T: 0.62, U: 0.72, V: 0.7, W: 0.96, X: 0.66,
  Y: 0.66, Z: 0.6
};

function advanceOf(char: string): number {
  if (ADVANCE[char] !== undefined) return ADVANCE[char];
  const lower = char.toLowerCase();
  if (lower !== char && ADVANCE[lower] !== undefined) return ADVANCE[lower] + 0.14;
  if (lower >= 'a' && lower <= 'z') return 0.52;
  return 0.6;
}

type Displacement = { dy: number; angle: number; scale: number };

function shapeOffset(shape: WordArtParameters['shape'], amount: number, t: number, amp: number, span: number): Displacement {
  // t in 0..1 across the word, amp in px, span = word width in px.
  const bell = 1 - (2 * t - 1) * (2 * t - 1); // 0 at edges, 1 in the middle
  switch (shape) {
    case 'plain':
    case 'slant':
      return { dy: 0, angle: 0, scale: 1 };
    case 'arch-up': {
      const dy = -amp * bell;
      const angle = span > 0 ? (Math.atan((amp * (4 * t - 2)) / span) * 180) / Math.PI : 0;
      return { dy, angle, scale: 1 };
    }
    case 'arch-down': {
      const dy = amp * bell;
      const angle = span > 0 ? (-Math.atan((amp * (4 * t - 2)) / span) * 180) / Math.PI : 0;
      return { dy, angle, scale: 1 };
    }
    case 'chevron': {
      const k = Math.abs(2 * t - 1);
      const dy = k * amp;
      const angle = span > 0 ? (Math.atan((2 * amp * (t < 0.5 ? 1 : -1)) / span) * 180) / Math.PI : 0;
      return { dy, angle, scale: 1 };
    }
    case 'wave': {
      const phase = t * Math.PI * 3;
      const dy = Math.sin(phase) * amp * 0.42;
      const angle = span > 0 ? (Math.atan((Math.cos(phase) * amp * 0.42 * (Math.PI * 3)) / span) * 180) / Math.PI : 0;
      return { dy, angle, scale: 1 };
    }
    case 'inflate':
      return { dy: 0, angle: 0, scale: 1 + amount * 0.62 * bell };
    case 'deflate':
      return { dy: 0, angle: 0, scale: Math.max(0.34, 1 - amount * 0.5 * bell) };
    default:
      return { dy: 0, angle: 0, scale: 1 };
  }
}

function shiftLayer(letters: LetterPlacement[], dx: number, dy: number): LetterPlacement[] {
  return letters.map((l) => ({ ...l, x: l.x + dx, y: l.y + dy }));
}

export function buildWordArtScene(p: WordArtParameters, idSeed = 'wa'): WordArtScene {
  const fs = p.fontSize;
  const chars = [...(p.text.length > 0 ? p.text : ' ')];
  const widths = chars.map((c) => advanceOf(c) * fs);
  const n = chars.length;
  const span = widths.reduce((a, b) => a + b, 0) + p.letterSpacing * Math.max(0, n - 1);
  const pad = fs * 0.55;
  const amp = p.shapeAmount * fs * 0.9;
  const width = span + pad * 2;
  const height = fs * 1.75 + Math.max(amp, fs * 0.4);
  const baseline = height - fs * 0.32;

  const letters: LetterPlacement[] = [];
  let cursor = 0;
  for (let i = 0; i < n; i++) {
    const center = cursor + widths[i] / 2;
    const t = span > 0 ? center / span : 0.5;
    const d = shapeOffset(p.shape, p.shapeAmount, t, amp, span);
    letters.push({ char: chars[i], x: pad + center, y: baseline + d.dy, rotate: d.angle, scale: d.scale });
    cursor += widths[i] + p.letterSpacing;
  }

  // Fill definition shared by every front-face glyph.
  const defs: GradientDef[] = [];
  let fill = p.fillA;
  if (p.fillMode === 'gradient') {
    const id = `${idSeed}-grad`;
    defs.push({ kind: 'gradient', id, x1: pad, y1: 0, x2: pad + span, y2: 0, stops: [
      { offset: 0, color: p.fillA },
      { offset: 1, color: p.fillB }
    ] });
    fill = `url(#${id})`;
  } else if (p.fillMode === 'rainbow') {
    const id = `${idSeed}-rainbow`;
    defs.push({ kind: 'gradient', id, x1: pad, y1: 0, x2: pad + span, y2: 0, stops: RAINBOW_STOPS.map((color, i) => ({ offset: i / (RAINBOW_STOPS.length - 1), color })) });
    fill = `url(#${id})`;
  }

  const layers: SceneLayer[] = [];

  if (p.extrusion > 0) {
    const steps = Math.max(2, Math.min(8, Math.round(p.extrusion / 3)));
    for (let s = steps; s >= 1; s--) {
      const k = (s / steps) * p.extrusion;
      layers.push({
        letters: shiftLayer(letters, k, k),
        fill: p.extrusionColor,
        stroke: null,
        strokeWidth: 0,
        opacity: 1
      });
    }
  }

  if (p.shadow) {
    layers.push({
      letters: shiftLayer(letters, p.shadowOffset, p.shadowOffset),
      fill: '#101312',
      stroke: null,
      strokeWidth: 0,
      opacity: 0.9
    });
  }

  layers.push({
    letters,
    fill,
    stroke: p.outlineWidth > 0 ? p.outlineColor : null,
    strokeWidth: p.outlineWidth > 0 ? p.outlineWidth : 0,
    opacity: 1
  });

  const transforms: string[] = [];
  if (p.shape === 'slant') transforms.push(`skewX(${-p.shapeAmount * 24})`);
  if (p.rotate !== 0) transforms.push(`rotate(${p.rotate} ${width / 2} ${height / 2})`);

  return {
    width,
    height,
    defs,
    layers,
    groupTransform: transforms.length > 0 ? transforms.join(' ') : null,
    fontSize: fs
  };
}

/** Pure serializer — the same scene can become a standalone .svg file. */
export function sceneToSvgString(scene: WordArtScene, label: string): string {
  const defs = scene.defs
    .map((d) =>
      d.kind === 'gradient'
        ? `<linearGradient id="${d.id}" gradientUnits="userSpaceOnUse" x1="${d.x1}" y1="${d.y1}" x2="${d.x2}" y2="${d.y2}">` +
          d.stops.map((s) => `<stop offset="${s.offset}" stop-color="${s.color}"/>`).join('') +
          `</linearGradient>`
        : ''
    )
    .join('');

  const layers = scene.layers
    .map((layer) =>
      layer.letters
        .map((l) => {
          const t = `translate(${l.x.toFixed(2)} ${l.y.toFixed(2)})` +
            (l.rotate ? ` rotate(${l.rotate.toFixed(2)})` : '') +
            (l.scale !== 1 ? ` scale(${l.scale.toFixed(3)})` : '');
          const stroke = layer.stroke
            ? ` stroke="${layer.stroke}" stroke-width="${layer.strokeWidth}" paint-order="stroke"`
            : '';
          const opacity = layer.opacity !== 1 ? ` opacity="${layer.opacity}"` : '';
          const char = l.char.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
          return `<text transform="${t}" text-anchor="middle" font-family="Impact, 'Arial Black', sans-serif" font-size="${scene.fontSize}" fill="${layer.fill}"${stroke}${opacity}>${char}</text>`;
        })
        .join('')
    )
    .join('');

  const group = scene.groupTransform ? `<g transform="${scene.groupTransform}">${layers}</g>` : layers;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${scene.width.toFixed(1)} ${scene.height.toFixed(1)}" role="img" aria-label="${label}"><defs>${defs}</defs>${group}</svg>`;
}
