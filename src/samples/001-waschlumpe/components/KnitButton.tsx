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
      onPointerLeave={(event) => { setPressure(0); props.onPointerLeave?.(event); }}
      onKeyDown={(event) => { if (event.key === ' ' || event.key === 'Enter') setPressure(1); props.onKeyDown?.(event); }}
      onKeyUp={(event) => { setPressure(0); props.onKeyUp?.(event); }}
    >
      <KnitMaterial parameters={material} quality="small" deformation={{ type: 'press', amount: pressure }} label="" />
      <span>{children}</span>
    </button>
  );
}

