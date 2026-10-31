// The Presidium of the Russian Academy of Sciences, Moscow, nicknamed "the golden brains".
// An interpretation of two photographs supplied in conversation; no photograph is reproduced here.
const FLOORS = 22;
const CUBES = [
  { x: 2, s: 1.0 }, { x: 24, s: 1.15 }, { x: 50, s: 1.15 }, { x: 74, s: 1.0 },
];

export default function GoldenBrains({ night, setNight }) {
  return (
    <div className="brains" data-time={night ? 'night' : 'day'}>
      <a className="skip" href="#brains-text">Skip to text</a>
      <div className="brains-sky" aria-hidden="true"><i className="cloud c1" /><i className="cloud c2" /><i className="cloud c3" /></div>

      <nav className="brains-nav" aria-label="Pages">
        <a href="#/">← Block 14</a>
        <button type="button" className="time-switch" aria-pressed={night} onClick={() => setNight(!night)}>
          <i /><span>{night ? 'Night' : 'Day'}</span>
        </button>
      </nav>

      <header className="brains-title">
        <p className="eyebrow">Block 14 / Page 02 / Moscow, Leninsky Prospekt</p>
        <h1>The Golden<br />Brains</h1>
        <p className="sub">A concrete tower wearing a crown of gilded lattice. By day it is grey and ordered. By night only the crown is lit.</p>
      </header>

      <div className="elevation" aria-hidden="true">
        <div className="crown">
          {CUBES.map((c, i) => (
            <i key={i} className="cube" style={{ left: `${c.x}%`, '--s': c.s, '--d': `${i * 120}ms` }}>
              <b className="lattice" /><b className="lattice back" /><b className="mast" />
            </i>
          ))}
          <i className="crown-slab" />
        </div>
        <div className="tower">
          <div className="shaft left">{Array.from({ length: FLOORS }, (_, i) => <i key={i} className="band" />)}</div>
          <div className="spine" />
          <div className="shaft right">{Array.from({ length: FLOORS }, (_, i) => <i key={i} className="band" />)}</div>
        </div>
        <div className="podium">
          <i className="wing" /><i className="portal"><b /><b /><b /></i><i className="wing" />
        </div>
        <div className="plinth"><i className="walker" /></div>
      </div>

      <section className="brains-text" id="brains-text">
        <div>
          <h2>What is there</h2>
          <p>The Presidium of the Russian Academy of Sciences on Leninsky Prospekt, Moscow: a tall concrete slab with a crown of gilded metal lattice structures on its roof. Designed under Yuri Platonov, built from the 1970s and opened in 1990. Muscovites call the crown “the golden brains”.</p>
        </div>
        <div>
          <h2>What was kept</h2>
          <p>Two readings from the photographs. Day: a grey ordered slab, two shafts split by a dark spine, bronze glass wings at the base catching an orange sky. Night: the slab goes black and only the lattice burns. Flip the switch to move between them.</p>
        </div>
        <div>
          <h2>What is invented</h2>
          <p>Proportions, the number of floors, the lattice pattern and the walker. The photographs are not reproduced; they informed the composition and nothing more. No claim is made about the crown’s original purpose.</p>
        </div>
      </section>
    </div>
  );
}
