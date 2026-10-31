import { useEffect, useRef, useState } from 'react';
import { FLOORS } from './content.js';

function useActiveFloor() {
  const [active, setActive] = useState(FLOORS[0].id);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const sections = FLOORS.map((f) => document.getElementById(f.id)).filter(Boolean);
    const onScroll = () => {
      const mid = window.innerHeight * 0.4;
      let current = sections[0];
      for (const s of sections) if (s.getBoundingClientRect().top <= mid) current = s;
      setActive(current.id);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
  }, []);
  return { active, progress };
}

function Window({ w, lit, kind }) {
  const Tag = w.href ? 'a' : 'div';
  return (
    <Tag className={`window ${kind || ''}`} href={w.href} target={w.href ? '_blank' : undefined} rel={w.href ? 'noreferrer' : undefined} data-lit={lit}>
      <div className="reveal"><div className="glass">
        {w.tag && <span className="tag">{w.tag}</span>}
        <h3>{w.h}</h3>
        <p>{w.p}</p>
      </div></div>
      <i className="sill" aria-hidden="true" />
      <i className="streak" aria-hidden="true" />
    </Tag>
  );
}

function Floor({ f, night }) {
  const cls = ['floor', f.cantilever && 'cantilever', f.slots && 'slots', f.ground && 'ground'].filter(Boolean).join(' ');
  return (
    <section id={f.id} className={cls} aria-labelledby={`h-${f.id}`}>
      <header className="floor-head">
        <span className="floor-num">{f.num}</span>
        <h2 id={`h-${f.id}`}>{f.name}</h2>
        <p className="floor-lead">{f.lead}</p>
      </header>
      {f.ground ? (
        <div className="pilotis">
          <i className="column" /><i className="column" />
          <div className="entrance">
            <span className="cast">Entrance</span>
            {f.windows.map((w) => <Window key={w.h} w={w} lit={false} kind="door" />)}
          </div>
          <i className="column" /><i className="column" />
        </div>
      ) : (
        <div className="windows">
          {f.windows.map((w, i) => <Window key={w.h} w={w} lit={night && (i % 3 !== 1)} />)}
        </div>
      )}
      {f.cantilever && <i className="underside" aria-hidden="true" />}
    </section>
  );
}

export default function App() {
  const [night, setNight] = useState(false);
  const { active, progress } = useActiveFloor();
  const go = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  return (
    <div className="site" data-time={night ? 'night' : 'day'}>
      <a className="skip" href="#roof">Skip to building</a>
      <div className="sky" aria-hidden="true"><i className="sun" /></div>

      <aside className="stair-tower" aria-hidden="true">
        {Array.from({ length: 18 }, (_, i) => <i key={i} className="slit" />)}
        <i className="lift-car" style={{ top: `calc(4% + ${progress * 88}%)` }} />
      </aside>

      <nav className="lift-panel" aria-label="Floors">
        <span className="panel-label">Lift</span>
        {FLOORS.map((f) => (
          <button key={f.id} type="button" className="lift-button" aria-current={active === f.id ? 'true' : undefined} onClick={() => go(f.id)} aria-label={`Floor ${f.num}, ${f.name}`}>
            <b>{f.num}</b>
          </button>
        ))}
        <button type="button" className="time-switch" aria-pressed={night} onClick={() => setNight(!night)}>
          <i /><span>{night ? 'Night' : 'Day'}</span>
        </button>
      </nav>

      <main className="building">
        <div className="parapet concrete">
          <h1 className="cast nameplate">Block 14</h1>
          <p className="plaque">Lumpesammlig · cast in CSS · {new Date().getFullYear()}</p>
        </div>
        {FLOORS.map((f) => <Floor key={f.id} f={f} night={night} />)}
      </main>
      <div className="plaza" aria-hidden="true"><i className="step" /><i className="step" /><i className="step" /></div>
      <footer className="kerb">
        <p>Block 14 is a visual study. The concrete is gradients and noise, the depth is shadow, the lift is a scroll listener. <a href="https://github.com/blackmath88/lumpesammlig/tree/main/brutal-building">Source ↗</a></p>
      </footer>
    </div>
  );
}
