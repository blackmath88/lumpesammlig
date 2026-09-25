import type { CSSProperties } from 'react';
import WordArtRender from './WordArtRender';
import { DEFAULT_WORDART_PARAMETERS } from './material/parameters';
import { WORDART_PRESETS, DEFAULT_WORDART_PRESET_ID } from './material/presets';

/**
 * Collection presence for Sample 008 — a static arch tile that fills the
 * promenade preview frame. No hydration, no animation.
 */
export default function WordArtMini({ className, style }: { className?: string; style?: CSSProperties }) {
  const preset = WORDART_PRESETS.find((p) => p.id === DEFAULT_WORDART_PRESET_ID) ?? WORDART_PRESETS[0];
  const parameters = {
    ...DEFAULT_WORDART_PARAMETERS,
    ...preset.values,
    text: 'WORD ART',
    fontSize: 120
  };

  return (
    <div className={className} style={{ background: '#0e1f1f', ...style }}>
      <WordArtRender parameters={parameters} idSeed="wa-mini" className="wa-mini-svg" />
    </div>
  );
}
