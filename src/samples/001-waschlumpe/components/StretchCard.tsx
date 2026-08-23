import { useState } from 'react';
import KnitMaterial from '../material/KnitMaterial';
import type { KnitMaterialParameters } from '../material/parameters';

export default function StretchCard({ material }: { material: KnitMaterialParameters }) {
  const [stretch, setStretch] = useState(0);
  const [direction, setDirection] = useState(0);
  const onMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const dx = event.clientX - (rect.left + rect.width / 2);
    const dy = event.clientY - (rect.top + rect.height / 2);
    setDirection(Math.atan2(dy, dx)); setStretch(Math.min(1, Math.hypot(dx, dy) / (rect.width * .46)));
  };
  return (
    <div className="stretch-card-shell" onPointerDown={(event) => event.currentTarget.setPointerCapture(event.pointerId)} onPointerMove={onMove} onPointerUp={() => setStretch(0)} onPointerCancel={() => setStretch(0)}>
      <KnitMaterial parameters={material} quality="small" deformation={{ type: 'stretch', amount: stretch, x: .5, y: .5, direction }} label="Stretchable knitted card perimeter" />
      <article className="stretch-card-content">
        <p className="component-index">BOUND FIELD / 03</p>
        <h3>Content stays still.<br />The edge gives way.</h3>
        <p>Drag the textile margin, or use the control below, to send tension around the perimeter.</p>
        <button type="button" onClick={() => { setDirection(0); setStretch(value => value ? 0 : .8); }} aria-pressed={stretch > 0}>Toggle edge tension</button>
      </article>
    </div>
  );
}

