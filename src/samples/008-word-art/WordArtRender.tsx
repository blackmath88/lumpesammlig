import { useMemo } from 'react';
import type { WordArtParameters } from './material/parameters';
import { buildWordArtScene } from './material/wordArt';

type WordArtRenderProps = {
  parameters: WordArtParameters;
  className?: string;
  label?: string;
  idSeed?: string;
};

/**
 * Static SVG WordArt. There is deliberately nothing to hydrate beyond
 * React itself — the generator is pure and the render never animates.
 */
export default function WordArtRender({ parameters, className, label, idSeed = 'wa' }: WordArtRenderProps) {
  const scene = useMemo(() => buildWordArtScene(parameters, idSeed), [parameters, idSeed]);
  const text = label ?? parameters.text;

  return (
    <svg
      className={className}
      viewBox={`0 0 ${scene.width} ${scene.height}`}
      role="img"
      aria-label={`WordArt: ${text}`}
    >
      <defs>
        {scene.defs.map((d) =>
          d.kind === 'gradient' ? (
            <linearGradient
              key={d.id}
              id={d.id}
              gradientUnits="userSpaceOnUse"
              x1={d.x1}
              y1={d.y1}
              x2={d.x2}
              y2={d.y2}
            >
              {d.stops.map((s) => (
                <stop key={s.offset} offset={s.offset} stopColor={s.color} />
              ))}
            </linearGradient>
          ) : null
        )}
      </defs>
      <g transform={scene.groupTransform ?? undefined}>
        {scene.layers.map((layer, li) =>
          layer.letters.map((l, i) => {
            const parts = [`translate(${l.x} ${l.y})`];
            if (l.rotate) parts.push(`rotate(${l.rotate})`);
            if (l.scale !== 1) parts.push(`scale(${l.scale})`);
            return (
              <text
                key={`${li}-${i}`}
                transform={parts.join(' ')}
                textAnchor="middle"
                fontFamily="Impact, 'Arial Black', sans-serif"
                fontSize={scene.fontSize}
                fill={layer.fill}
                stroke={layer.stroke ?? undefined}
                strokeWidth={layer.stroke ? layer.strokeWidth : undefined}
                style={layer.stroke ? { paintOrder: 'stroke' } : undefined}
                opacity={layer.opacity !== 1 ? layer.opacity : undefined}
              >
                {l.char}
              </text>
            );
          })
        )}
      </g>
    </svg>
  );
}
