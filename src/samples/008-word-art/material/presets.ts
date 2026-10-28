import type { WordArtParameters } from './parameters';

/**
 * The thirty tiles of the classic Word 2000 WordArt gallery, rebuilt as
 * named readings of the semantic WordArt coordinates.
 */
export type WordArtPreset = {
  id: string;
  name: string;
  values: Partial<WordArtParameters>;
};

const noEffect = { shadow: false, extrusion: 0 } as const;

export const WORDART_PRESETS: WordArtPreset[] = [
  { id: 'outline-classic', name: 'Outline Classic', values: { shape: 'plain', shapeAmount: 0, fillMode: 'solid', fillA: '#009e9e', outlineWidth: 4, outlineColor: '#0d3b3b', ...noEffect } },
  { id: 'arch-sunset', name: 'Arch Sunset', values: { shape: 'arch-up', shapeAmount: 0.7, fillMode: 'gradient', fillA: '#ff5f1f', fillB: '#ffe600', outlineWidth: 3, outlineColor: '#5c1a00', shadow: true, shadowOffset: 7, extrusion: 0 } },
  { id: 'arch-lagoon', name: 'Arch Lagoon', values: { shape: 'arch-down', shapeAmount: 0.6, fillMode: 'gradient', fillA: '#00b3f6', fillB: '#00688b', outlineWidth: 3, outlineColor: '#023e52', ...noEffect } },
  { id: 'rainbow-plain', name: 'Rainbow Plain', values: { shape: 'plain', shapeAmount: 0, fillMode: 'rainbow', fillA: '#ff004d', fillB: '#8a2be2', outlineWidth: 2, outlineColor: '#222', ...noEffect } },
  { id: 'inflate-pop', name: 'Inflate Pop', values: { shape: 'inflate', shapeAmount: 0.6, fillMode: 'gradient', fillA: '#ff2d95', fillB: '#ff9a00', outlineWidth: 4, outlineColor: '#4d0026', shadow: true, shadowOffset: 6, extrusion: 0 } },
  { id: 'deflate-slim', name: 'Deflate Slim', values: { shape: 'deflate', shapeAmount: 0.55, fillMode: 'solid', fillA: '#339966', outlineWidth: 2, outlineColor: '#0d2b1d', ...noEffect } },
  { id: 'slant-flyer', name: 'Slant Flyer', values: { shape: 'slant', shapeAmount: 0.5, fillMode: 'gradient', fillA: '#ffe600', fillB: '#ff6600', outlineWidth: 3, outlineColor: '#331a00', shadow: true, shadowOffset: 5, extrusion: 0 } },
  { id: 'chevron-racing', name: 'Chevron Racing', values: { shape: 'chevron', shapeAmount: 0.55, fillMode: 'solid', fillA: '#cc0000', outlineWidth: 4, outlineColor: '#330000', shadow: true, shadowOffset: 9, extrusion: 0 } },
  { id: 'wave-surf', name: 'Wave Surf', values: { shape: 'wave', shapeAmount: 0.5, fillMode: 'gradient', fillA: '#00b3f6', fillB: '#b3ecff', outlineWidth: 2, outlineColor: '#004d7a', ...noEffect } },
  { id: 'chrome-ice', name: 'Chrome Ice', values: { shape: 'plain', shapeAmount: 0, fillMode: 'gradient', fillA: '#f4fbff', fillB: '#7aa7c7', outlineWidth: 5, outlineColor: '#274b63', shadow: true, shadowOffset: 4, extrusion: 0 } },
  { id: 'neon-night', name: 'Neon Night', values: { shape: 'plain', shapeAmount: 0, fillMode: 'solid', fillA: '#ff00ff', outlineWidth: 3, outlineColor: '#aaff00', shadow: true, shadowOffset: 6, extrusion: 0 } },
  { id: 'deep-block', name: 'Deep Block', values: { shape: 'plain', shapeAmount: 0, fillMode: 'solid', fillA: '#ff3300', outlineWidth: 2, outlineColor: '#661500', shadow: false, extrusion: 14, extrusionColor: '#7a1f00' } },
  { id: 'gold-arch', name: 'Gold Arch', values: { shape: 'arch-up', shapeAmount: 0.8, fillMode: 'gradient', fillA: '#fff2b3', fillB: '#c9a227', outlineWidth: 3, outlineColor: '#5c4700', shadow: true, shadowOffset: 6, extrusion: 0 } },
  { id: 'grape-deflate', name: 'Grape Deflate', values: { shape: 'deflate', shapeAmount: 0.5, fillMode: 'gradient', fillA: '#8a2be2', fillB: '#c7a0ff', outlineWidth: 2, outlineColor: '#2d004d', ...noEffect } },
  { id: 'brick-wave', name: 'Brick Wave', values: { shape: 'wave', shapeAmount: 0.65, fillMode: 'solid', fillA: '#990000', outlineWidth: 3, outlineColor: '#400000', shadow: true, shadowOffset: 8, extrusion: 0 } },
  { id: 'mint-slant', name: 'Mint Slant', values: { shape: 'slant', shapeAmount: 0.35, fillMode: 'gradient', fillA: '#7dffb3', fillB: '#009e60', outlineWidth: 3, outlineColor: '#003d24', ...noEffect } },
  { id: 'office-teal', name: 'Office Teal', values: { shape: 'plain', shapeAmount: 0, fillMode: 'solid', fillA: '#008080', outlineWidth: 0, outlineColor: '#000', shadow: true, shadowOffset: 5, extrusion: 0 } },
  { id: 'sky-chevron', name: 'Sky Chevron', values: { shape: 'chevron', shapeAmount: 0.45, fillMode: 'gradient', fillA: '#66ccff', fillB: '#0033cc', outlineWidth: 2, outlineColor: '#001a66', ...noEffect } },
  { id: 'toffee-inflate', name: 'Toffee Inflate', values: { shape: 'inflate', shapeAmount: 0.45, fillMode: 'solid', fillA: '#ffcc00', outlineWidth: 3, outlineColor: '#804000', shadow: false, extrusion: 10, extrusionColor: '#804000' } },
  { id: 'rainbow-arch', name: 'Rainbow Arch', values: { shape: 'arch-up', shapeAmount: 0.75, fillMode: 'rainbow', fillA: '#ff004d', fillB: '#8a2be2', outlineWidth: 2, outlineColor: '#222', ...noEffect } },
  { id: 'forest-slant', name: 'Forest Slant', values: { shape: 'slant', shapeAmount: 0.6, fillMode: 'gradient', fillA: '#a8d08d', fillB: '#375623', outlineWidth: 3, outlineColor: '#1a2b10', shadow: true, shadowOffset: 6, extrusion: 0 } },
  { id: 'night-block', name: 'Night Block', values: { shape: 'plain', shapeAmount: 0, fillMode: 'solid', fillA: '#003399', outlineWidth: 2, outlineColor: '#001347', shadow: false, extrusion: 16, extrusionColor: '#001f5c' } },
  { id: 'coral-arch', name: 'Coral Arch', values: { shape: 'arch-down', shapeAmount: 0.5, fillMode: 'gradient', fillA: '#ff7f66', fillB: '#ff2d95', outlineWidth: 3, outlineColor: '#5c0f38', ...noEffect } },
  { id: 'steel-wave', name: 'Steel Wave', values: { shape: 'wave', shapeAmount: 0.4, fillMode: 'gradient', fillA: '#d9d9d9', fillB: '#595959', outlineWidth: 2, outlineColor: '#1f1f1f', shadow: true, shadowOffset: 4, extrusion: 0 } },
  { id: 'bubble-inflate', name: 'Bubble Inflate', values: { shape: 'inflate', shapeAmount: 0.7, fillMode: 'gradient', fillA: '#b3ecff', fillB: '#00b3f6', outlineWidth: 5, outlineColor: '#00688b', shadow: true, shadowOffset: 5, extrusion: 0 } },
  { id: 'lava-chevron', name: 'Lava Chevron', values: { shape: 'chevron', shapeAmount: 0.6, fillMode: 'gradient', fillA: '#ff9a00', fillB: '#cc0000', outlineWidth: 3, outlineColor: '#400000', shadow: false, extrusion: 12, extrusionColor: '#5c0000' } },
  { id: 'paper-outline', name: 'Paper Outline', values: { shape: 'plain', shapeAmount: 0, fillMode: 'solid', fillA: '#fffbe8', outlineWidth: 3, outlineColor: '#333', ...noEffect } },
  { id: 'retro-slab', name: 'Retro Slab', values: { shape: 'plain', shapeAmount: 0, fillMode: 'gradient', fillA: '#ff2d95', fillB: '#7a1f4f', outlineWidth: 4, outlineColor: '#1d2b53', shadow: false, extrusion: 12, extrusionColor: '#3d1030' } },
  { id: 'thin-deflate', name: 'Thin Deflate', values: { shape: 'deflate', shapeAmount: 0.4, fillMode: 'gradient', fillA: '#00b3f6', fillB: '#8a2be2', outlineWidth: 0, outlineColor: '#000', ...noEffect } },
  { id: 'poster-slant', name: 'Poster Slant', values: { shape: 'slant', shapeAmount: 0.75, fillMode: 'solid', fillA: '#ffe600', outlineWidth: 5, outlineColor: '#000', shadow: true, shadowOffset: 10, extrusion: 0 } }
];

export const DEFAULT_WORDART_PRESET_ID = 'arch-sunset';
