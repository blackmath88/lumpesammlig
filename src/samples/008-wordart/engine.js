// 008 — WordArt engine.
//
// A pure function from a small, explicit parameter set to a standalone SVG
// string. No DOM, no dependencies: the editor page, file export, share links
// and any future host (a CLI, an MCP tool, another page) all call the same
// renderer, so a WordArt is always reproducible from its recipe.

export const VERSION = 1;
export const GENERATOR = 'lumpesammlig/008-wordart';

export const SHAPES = {
  straight: 'M75 315 H925',
  'arch-up': 'M75 355 Q500 90 925 355',
  'arch-down': 'M75 210 Q500 500 925 210',
  wave: 'M75 330 C250 80 360 520 500 300 C650 60 760 500 925 260',
  rise: 'M75 420 L925 175'
};

export const FONTS = {
  impact: { family: "'Arial Black', Impact, sans-serif", weight: 900, style: 'normal', advance: 0.7 },
  grotesk: { family: "'Helvetica Neue', Inter, Arial, sans-serif", weight: 800, style: 'normal', advance: 0.72 },
  serif: { family: "Georgia, 'Times New Roman', serif", weight: 700, style: 'italic', advance: 0.66 },
  mono: { family: "'Courier New', ui-monospace, monospace", weight: 700, style: 'normal', advance: 0.62 }
};

export const DEPTH_STYLES = ['extrude', 'offset'];

// Every parameter the renderer understands, with its default. The type of the
// default decides how untrusted input (URL, file, tool call) is coerced.
export const DEFAULTS = {
  text: 'MAKE IT LOUD',
  shape: 'arch-up',
  font: 'impact',
  fillA: '#fff45c',
  fillB: '#ff25ba',
  gradientAngle: 0,
  outline: '#42126f',
  outlineWidth: 8,
  depth: 12,
  depthStyle: 'extrude',
  depthColor: '#42126f',
  rotation: -4,
  tracking: 0,
  shadow: true,
  shadowColor: '#1c2f9d',
  shadowBlur: 4,
  shadowOffset: 12,
  background: '#f7f5ef'
};

export const LIMITS = {
  gradientAngle: [0, 180],
  outlineWidth: [0, 18],
  depth: [0, 24],
  rotation: [-18, 18],
  tracking: [-8, 20],
  shadowBlur: [0, 30],
  shadowOffset: [0, 30]
};

const ENUMS = { shape: Object.keys(SHAPES), font: Object.keys(FONTS), depthStyle: DEPTH_STYLES };
const COLORS = ['fillA', 'fillB', 'outline', 'depthColor', 'shadowColor'];
const MAX_TEXT = 48;

const classic = (fillA, fillB, outline, depth, rotation, tracking, shape, shadow) => ({
  shape, font: 'impact', fillA, fillB, gradientAngle: 0, outline, outlineWidth: 8,
  depth, depthStyle: 'extrude', depthColor: outline, rotation, tracking,
  shadow, shadowColor: '#1c2f9d', shadowBlur: 4, shadowOffset: 12, background: '#f7f5ef'
});

// Presets are complete parameter sets (minus text): a preset is a point in the
// parameter space, not a sealed style. Everything stays editable afterwards.
export const PRESETS = {
  chrome: { group: 'classic', ...classic('#f7fbff', '#536879', '#0b1826', 14, -3, 0, 'arch-up', true) },
  rainbow: { group: 'classic', ...classic('#fff200', '#ff00bf', '#4420a8', 11, 2, 1, 'wave', true) },
  corporate: { group: 'classic', ...classic('#8fe8ff', '#0751c9', '#052a71', 8, 0, 2, 'straight', true) },
  bubblegum: { group: 'classic', ...classic('#fff0fb', '#ff4aad', '#a6006f', 7, -5, 3, 'arch-down', true) },
  lime: { group: 'classic', ...classic('#f1ff54', '#28cf45', '#005e38', 18, 5, 1, 'rise', true) },
  gold: { group: 'classic', ...classic('#fff6a0', '#b56d00', '#4a2600', 16, -2, 0, 'arch-up', true) },
  flame: { group: 'classic', ...classic('#fff15a', '#ff4218', '#781000', 10, 4, -1, 'wave', true) },
  ice: { group: 'classic', ...classic('#ffffff', '#7ae7ff', '#006699', 6, 0, 4, 'straight', false) },

  glass: {
    group: 'now', shape: 'straight', font: 'grotesk', fillA: '#ffffff', fillB: '#a9b8ff', gradientAngle: 0,
    outline: '#ffffff', outlineWidth: 2, depth: 0, depthStyle: 'extrude', depthColor: '#a9b8ff',
    rotation: 0, tracking: 2, shadow: true, shadowColor: '#7d6bff', shadowBlur: 22, shadowOffset: 0,
    background: '#12163a'
  },
  acid: {
    group: 'now', shape: 'wave', font: 'grotesk', fillA: '#d8ff3c', fillB: '#39ff9e', gradientAngle: 90,
    outline: '#0b0b0b', outlineWidth: 6, depth: 10, depthStyle: 'extrude', depthColor: '#ff3cac',
    rotation: -3, tracking: 0, shadow: false, shadowColor: '#ff3cac', shadowBlur: 0, shadowOffset: 0,
    background: '#0b0b0b'
  },
  riso: {
    group: 'now', shape: 'straight', font: 'grotesk', fillA: '#ff4fa3', fillB: '#ff4fa3', gradientAngle: 0,
    outline: '#ff4fa3', outlineWidth: 0, depth: 9, depthStyle: 'offset', depthColor: '#2b59ff',
    rotation: -2, tracking: 1, shadow: false, shadowColor: '#2b59ff', shadowBlur: 0, shadowOffset: 0,
    background: '#f4efe4'
  },
  brutal: {
    group: 'now', shape: 'straight', font: 'mono', fillA: '#111111', fillB: '#111111', gradientAngle: 0,
    outline: '#111111', outlineWidth: 0, depth: 12, depthStyle: 'offset', depthColor: '#c8ff00',
    rotation: 0, tracking: 4, shadow: false, shadowColor: '#111111', shadowBlur: 0, shadowOffset: 0,
    background: '#ffffff'
  }
};

const HEX = /^#?([0-9a-f]{6})$/i;

function color(value, fallback) {
  const match = HEX.exec(String(value ?? '').trim());
  return match ? '#' + match[1].toLowerCase() : fallback;
}

function number(value, [min, max], fallback) {
  const n = Math.round(Number(value));
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
}

function bool(value, fallback) {
  if (value === undefined || value === null || value === '') return fallback;
  return value === true || value === 'true' || value === '1' || value === 1 || value === 'on';
}

// Coerce anything (form state, URL, parsed file, tool arguments) into a valid
// parameter set. Unknown keys are dropped; invalid values fall back to defaults.
export function normalize(input = {}) {
  const p = { ...DEFAULTS };
  const src = input && typeof input === 'object' ? input : {};
  if (src.text !== undefined) {
    p.text = String(src.text).replace(/[\u0000-\u001f\u007f]/g, '').slice(0, MAX_TEXT);
  }
  for (const [key, allowed] of Object.entries(ENUMS)) {
    if (allowed.includes(src[key])) p[key] = src[key];
  }
  for (const key of COLORS) p[key] = color(src[key], DEFAULTS[key]);
  for (const [key, range] of Object.entries(LIMITS)) p[key] = number(src[key] ?? DEFAULTS[key], range, DEFAULTS[key]);
  p.shadow = bool(src.shadow, DEFAULTS.shadow);
  p.background = src.background === 'none' ? 'none' : color(src.background, DEFAULTS.background);
  return p;
}

const escapeXml = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&apos;');

const unescapeXml = (s) => String(s)
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
  .replace(/&apos;/g, "'").replace(/&#39;/g, "'").replace(/&amp;/g, '&');

const r3 = (n) => Math.round(n * 1000) / 1000;

// Render a parameter set to a standalone SVG document string. `id` prefixes
// internal references so several WordArts can live inline on one page.
export function renderWordArt(input, { id = 'wordart', metadata = true } = {}) {
  const p = normalize(input);
  const font = FONTS[p.font];
  const text = escapeXml(p.text || ' ');
  const pathId = `${id}-path`;
  const fillId = `${id}-fill`;
  const shadowId = `${id}-shadow`;

  const a = (p.gradientAngle * Math.PI) / 180;
  const [x1, y1, x2, y2] = [0.5 - Math.sin(a) / 2, 0.5 - Math.cos(a) / 2, 0.5 + Math.sin(a) / 2, 0.5 + Math.cos(a) / 2].map(r3);

  // Browsers disagree on textLength along a path, so fit by estimate instead:
  // average advance per glyph (em) per font, capped at the classic 120px.
  const glyphs = Math.max(1, [...p.text].length);
  const fontSize = r3(Math.min(120, Math.max(24, (820 - glyphs * p.tracking) / (glyphs * font.advance))));
  const textAttrs = `text-anchor="middle" font-family="${font.family}" font-size="${fontSize}" font-weight="${font.weight}"`
    + (font.style !== 'normal' ? ` font-style="${font.style}"` : '')
    + (p.tracking ? ` letter-spacing="${p.tracking}"` : '')
    + ' stroke-linejoin="round"';
  const textPath = `<textPath href="#${pathId}" xlink:href="#${pathId}" startOffset="50%">${text}</textPath>`;

  const offsets = [];
  if (p.depth > 0) {
    if (p.depthStyle === 'offset') offsets.push(p.depth);
    else for (let i = p.depth; i > 0; i -= 2) offsets.push(i);
  }
  const depthStroke = Math.max(1, p.outlineWidth * 0.6);
  const depthLayers = offsets.map((o) =>
    `<text ${textAttrs} transform="translate(${o} ${o})" fill="${p.depthColor}" stroke="${p.depthColor}" stroke-width="${r3(depthStroke)}">${textPath}</text>`
  ).join('');

  const topStroke = p.outlineWidth > 0 ? ` stroke="${p.outline}" stroke-width="${p.outlineWidth}" paint-order="stroke fill"` : '';
  const topFilter = p.shadow ? ` filter="url(#${shadowId})"` : '';
  const top = `<text ${textAttrs} fill="url(#${fillId})"${topStroke}${topFilter}>${textPath}</text>`;

  const shadowDef = p.shadow
    ? `<filter id="${shadowId}" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="${p.shadowOffset}" dy="${r3(p.shadowOffset * 1.15)}" stdDeviation="${p.shadowBlur}" flood-color="${p.shadowColor}" flood-opacity=".75"/></filter>`
    : '';

  const meta = metadata
    ? `<metadata id="wordart-params">${escapeXml(JSON.stringify({ generator: GENERATOR, version: VERSION, params: p }))}</metadata>`
    : '';

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1000 600" width="1000" height="600" role="img" aria-label="${text}">`,
    `<title>${text}</title>`,
    meta,
    `<defs><path id="${pathId}" d="${SHAPES[p.shape]}"/>`,
    `<linearGradient id="${fillId}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"><stop offset="0" stop-color="${p.fillA}"/><stop offset="1" stop-color="${p.fillB}"/></linearGradient>`,
    `${shadowDef}</defs>`,
    p.background !== 'none' ? `<rect width="1000" height="600" fill="${p.background}"/>` : '',
    `<g transform="rotate(${p.rotation} 500 300)">${depthLayers}${top}</g>`,
    '</svg>'
  ].join('');
}

// Recover the recipe from an SVG this engine produced. Returns null for SVGs
// without a WordArt recipe.
export function readRecipe(svg) {
  const match = /<metadata[^>]*id="wordart-params"[^>]*>([\s\S]*?)<\/metadata>/.exec(String(svg));
  if (!match) return null;
  try {
    const data = JSON.parse(unescapeXml(match[1]));
    return data && data.generator === GENERATOR ? normalize(data.params) : null;
  } catch {
    return null;
  }
}

// Readable share state: only values that differ from the defaults, colours
// without '#', e.g. "text=HELLO&shape=wave&fillA=ff00bf".
export function toQuery(input) {
  const p = normalize(input);
  const q = new URLSearchParams();
  for (const [key, value] of Object.entries(p)) {
    if (value === DEFAULTS[key]) continue;
    q.set(key, typeof value === 'string' ? value.replace(/^#/, '') : String(value));
  }
  return q.toString();
}

export function fromQuery(query) {
  const q = new URLSearchParams(String(query).replace(/^[#?]/, ''));
  return normalize(Object.fromEntries(q.entries()));
}
