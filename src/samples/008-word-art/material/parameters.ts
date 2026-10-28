export type WordArtShape =
  | 'plain'
  | 'arch-up'
  | 'arch-down'
  | 'chevron'
  | 'wave'
  | 'inflate'
  | 'deflate'
  | 'slant';

export type WordArtFill = 'solid' | 'gradient' | 'rainbow';

/**
 * Semantic WordArt coordinates. The gallery presets are named readings of
 * these coordinates — the coordinates, not the presets, are the model.
 */
export type WordArtParameters = {
  text: string;
  shape: WordArtShape;
  /** 0..1 — how strongly the shape acts. */
  shapeAmount: number;
  fillMode: WordArtFill;
  fillA: string;
  fillB: string;
  /** px stroke around each glyph, 0 = no outline. */
  outlineWidth: number;
  outlineColor: string;
  shadow: boolean;
  /** px shadow drop offset. */
  shadowOffset: number;
  /** px 3D extrusion depth, 0 = flat. */
  extrusion: number;
  extrusionColor: string;
  fontSize: number;
  /** px extra tracking between glyphs. */
  letterSpacing: number;
  /** degrees, rotates the whole word. */
  rotate: number;
};

export const DEFAULT_WORDART_PARAMETERS: WordArtParameters = {
  text: 'WORD ART',
  shape: 'arch-up',
  shapeAmount: 0.65,
  fillMode: 'gradient',
  fillA: '#ff2d95',
  fillB: '#ffd200',
  outlineWidth: 3,
  outlineColor: '#1d2b53',
  shadow: true,
  shadowOffset: 8,
  extrusion: 0,
  extrusionColor: '#7a1f4f',
  fontSize: 96,
  letterSpacing: 6,
  rotate: 0
};
