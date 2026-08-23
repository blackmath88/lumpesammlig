import { useState, type ButtonHTMLAttributes, type ReactNode } from 'react';
import KnitMaterial from '../material/KnitMaterial';
import type { KnitMaterialParameters } from '../material/parameters';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { material: KnitMaterialParameters; children: ReactNode };

export default function KnitButton({ material, children, ...props }: Props) {
  const [pressure, setPressure] = useState(0);
  return (
    <button
      {...props}
      className="knit-button"
      onPointerDown={(event) => { setPressure(1); props.onPointerDown?.(event); }}
      onPointerUp={(event) => { setPressure(0); props.onPointerUp?.(event); }}
      onPointerCancel={() => setPressure(0)}
      onPointerLeave={(event) => { setPressure(0); props.onPointerLeave?.(event); }}
      onKeyDown={(event) => { if (event.key === ' ' || event.key === 'Enter') setPressure(1); props.onKeyDown?.(event); }}
      onKeyUp={(event) => { setPressure(0); props.onKeyUp?.(event); }}
      onBlur={() => setPressure(0)}
      data-pressed={pressure > 0}
    >
      <KnitMaterial parameters={material} quality="small" deformation={{ type: 'press', amount: pressure }} label="" />
      <i className="gather-thread gather-thread--left" aria-hidden="true" />
      <i className="gather-thread gather-thread--right" aria-hidden="true" />
      <span className="knit-button-label">{children}</span>
    </button>
  );
}

