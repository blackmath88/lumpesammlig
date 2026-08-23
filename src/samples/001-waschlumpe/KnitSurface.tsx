import { useState } from 'react';
import KnitMaterial from './material/KnitMaterial';
import { DEFAULT_KNIT_PARAMETERS } from './material/parameters';
import './knit-surface.css';

type KnitSurfaceProps = { collectionHref?: string };

export default function KnitSurface({ collectionHref = '#material-reading' }: KnitSurfaceProps) {
  const [running, setRunning] = useState(true);
  return (
    <section className="knit-stage" aria-labelledby="knit-hero-title">
      <KnitMaterial
        parameters={DEFAULT_KNIT_PARAMETERS}
        quality="full"
        interactive
        active={running}
        className="knit-canvas"
        label="Interactive loosely knitted textile surface. Move or drag across the cloth to transmit tension."
      />
      <div className="knit-overlay">
        <div className="knit-copy">
          <p className="eyebrow">LUMPESAMMLIG / SAMPLE 001</p>
          <h1 id="knit-hero-title">Waschlumpe<br />becomes interface.</h1>
          <p className="lede">A real knitted cloth, translated into a procedural web surface.</p>
          <a className="scroll-link" href={collectionHref}>Read the material ↓</a>
        </div>
        <button className="motion" type="button" aria-pressed={running} onClick={() => setRunning((value) => !value)}>
          {running ? 'Pause motion' : 'Resume motion'}
        </button>
      </div>
    </section>
  );
}
