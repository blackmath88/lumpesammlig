import { useMemo, useState } from 'react';
import KnitButton from './components/KnitButton';
import MeshLoader from './components/MeshLoader';
import StretchCard from './components/StretchCard';
import TensionToggle from './components/TensionToggle';
import KnitMaterial from './material/KnitMaterial';
import { DEFAULT_KNIT_PARAMETERS, type KnitMaterialParameters } from './material/parameters';
import { KNIT_PRESETS, type KnitPreset } from './material/presets';
import './material-lab.css';

const controls: Array<{ key: keyof KnitMaterialParameters; label: string; low: string; high: string }> = [
  { key: 'openness', label: 'Openness', low: 'Dense', high: 'Open' },
  { key: 'yarnThickness', label: 'Yarn thickness', low: 'Fine', high: 'Heavy' },
  { key: 'irregularity', label: 'Irregularity', low: 'Even', high: 'Handmade' },
  { key: 'tension', label: 'Tension', low: 'Slack', high: 'Taut' },
  { key: 'softness', label: 'Softness', low: 'Quick', high: 'Yielding' },
  { key: 'gradientMix', label: 'Colour drift', low: 'Muted', high: 'Full' },
  { key: 'idleMotion', label: 'Idle motion', low: 'Still', high: 'Breathing' },
];

const copy = (values: KnitMaterialParameters) => ({ ...values });

export default function MaterialLab() {
  const [parameters, setParameters] = useState<KnitMaterialParameters>(() => copy(DEFAULT_KNIT_PARAMETERS));
  const [activePreset, setActivePreset] = useState<string>('original');
  const [toggle, setToggle] = useState(false);
  const [progress, setProgress] = useState(.64);

  const activeDescription = useMemo(
    () => KNIT_PRESETS.find((preset) => preset.id === activePreset)?.description ?? 'A custom coordinate in the Waschlumpe material system.',
    [activePreset],
  );

  const applyPreset = (preset: KnitPreset) => { setParameters(copy(preset.values)); setActivePreset(preset.id); };
  const update = (key: keyof KnitMaterialParameters, value: number) => {
    setParameters((current) => ({ ...current, [key]: value }));
    setActivePreset('custom');
  };

  return (
    <div className="material-experience">
      <section className="material-lab" aria-labelledby="material-lab-title">
        <header className="lab-heading">
          <p className="lab-index">04 / MATERIAL PLAYGROUND</p>
          <h2 id="material-lab-title">One cloth,<br />many tensions.</h2>
          <p>Change the physical reading, not rendering internals. Every study below inherits the same live material state.</p>
        </header>

        <div className="lab-workbench">
          <div className="lab-preview">
            <KnitMaterial parameters={parameters} quality="full" interactive label="Live knitted textile material preview. Move or drag across the surface." />
            <div className="lab-preview-caption">
              <span>{activePreset === 'custom' ? 'Custom state' : KNIT_PRESETS.find((preset) => preset.id === activePreset)?.label}</span>
              <p>{activeDescription}</p>
            </div>
          </div>

          <div className="lab-controls">
            <div className="preset-row" aria-label="Material presets">
              {KNIT_PRESETS.map((preset) => (
                <button key={preset.id} type="button" aria-pressed={activePreset === preset.id} onClick={() => applyPreset(preset)}>{preset.label}</button>
              ))}
            </div>
            <div className="slider-list">
              {controls.map((control) => (
                <label key={control.key} className="lab-slider">
                  <span><b>{control.label}</b><output>{Math.round(parameters[control.key] * 100)}</output></span>
                  <input type="range" min="0" max="1" step="0.01" value={parameters[control.key]} onChange={(event) => update(control.key, Number(event.currentTarget.value))} />
                  <small><i>{control.low}</i><i>{control.high}</i></small>
                </label>
              ))}
            </div>
            <button className="lab-reset" type="button" onClick={() => applyPreset(KNIT_PRESETS[0])}>Reset to Original</button>
          </div>
        </div>
      </section>

      <section className="variation-study" aria-labelledby="variation-title">
        <header className="section-heading">
          <p className="lab-index">05 / COORDINATES</p>
          <h2 id="variation-title">Same system.<br />Different weather.</h2>
          <p>Each live tile is a coordinate, not a separate artwork. Choose one to send it back into the playground.</p>
        </header>
        <div className="variation-grid">
          {KNIT_PRESETS.map((preset) => (
            <button key={preset.id} type="button" className="variation-tile" aria-pressed={activePreset === preset.id} onClick={() => applyPreset(preset)}>
              <KnitMaterial parameters={preset.values} quality="small" label={`${preset.label} knitted material variation`} />
              <span>{preset.label}</span>
            </button>
          ))}
          <button type="button" className="variation-tile" aria-pressed={activePreset === 'custom'} onClick={() => setActivePreset('custom')}>
            <KnitMaterial parameters={parameters} quality="small" label="Current custom knitted material variation" />
            <span>Current state</span>
          </button>
        </div>
      </section>

      <section className="scale-study" aria-labelledby="scale-title">
        <header className="section-heading">
          <p className="lab-index">06 / SCALE STUDY</p>
          <h2 id="scale-title">What survives<br />when it shrinks?</h2>
          <p>Small surfaces keep silhouette, colour drift and connected tension while surrendering fibre detail and frame rate.</p>
        </header>
        <div className="scale-grid">
          <figure className="scale-micro"><div><KnitMaterial parameters={parameters} quality="micro" label="Micro scale knit sample" /></div><figcaption><b>Micro</b><span>Indicator / 36 px</span></figcaption></figure>
          <figure className="scale-small"><div><KnitMaterial parameters={parameters} quality="micro" label="Small scale knit sample" /></div><figcaption><b>Small</b><span>Control / 72 px</span></figcaption></figure>
          <figure className="scale-medium"><div><KnitMaterial parameters={parameters} quality="small" label="Medium scale knit sample" /></div><figcaption><b>Medium</b><span>Card / 220 px</span></figcaption></figure>
          <figure className="scale-large"><div><KnitMaterial parameters={parameters} quality="small" interactive label="Large interactive knit sample" /></div><figcaption><b>Large</b><span>Panel / 440 px</span></figcaption></figure>
        </div>
      </section>

      <section className="component-study" aria-labelledby="components-title">
        <header className="section-heading component-heading">
          <p className="lab-index">07 / COMPONENT MUTATIONS</p>
          <h2 id="components-title">Behaviour,<br />not upholstery.</h2>
          <p>The cloth becomes useful when its connected structure changes how a control responds—not when it merely decorates the background.</p>
        </header>

        <div className="component-row component-row-button">
          <div className="component-copy"><p className="component-index">A / KNIT BUTTON</p><h3>Pressure spreads.</h3><p>Pressing compresses one area and asks neighbouring cells to make room. Release is deliberately slow.</p></div>
          <div className="component-demo"><KnitButton material={parameters}>Continue through cloth</KnitButton></div>
        </div>

        <div className="component-row component-row-toggle">
          <div className="component-copy"><p className="component-index">B / TENSION TOGGLE</p><h3>State becomes geometry.</h3><p>Loose openings settle into a taut field. The label confirms what the stitch structure communicates first.</p></div>
          <div className="component-demo"><TensionToggle material={parameters} checked={toggle} onChange={setToggle} /></div>
        </div>

        <div className="component-row component-row-card">
          <div className="component-copy"><p className="component-index">C / STRETCH CARD</p><h3>The frame yields.</h3><p>Drag is an enhancement. The semantic control offers the same tension state without precise pointer movement.</p></div>
          <div className="component-demo"><StretchCard material={parameters} /></div>
        </div>

        <div className="component-row component-row-loader">
          <div className="component-copy"><p className="component-index">D / MESH LOADER</p><h3>Loading travels.</h3><p>Progress is tension moving through connected cells, with a readable static state when motion is reduced.</p></div>
          <div className="component-demo loader-stack">
            <MeshLoader material={parameters} />
            <MeshLoader material={parameters} progress={progress} />
            <label className="progress-control"><span>Determinate tension</span><input type="range" min="0" max="1" step=".01" value={progress} onChange={(event) => setProgress(Number(event.currentTarget.value))} /></label>
          </div>
        </div>
      </section>

      <section className="implementation-note">
        <p className="lab-index">08 / IMPLEMENTATION NOTE</p>
        <blockquote>Code does not preserve a picture of the material. It preserves a field of possible behaviours.</blockquote>
        <p>A single canvas reconstruction now scales its stitch count, detail, pixel density and motion budget to the surface it inhabits. Public controls remain physical; canvas internals remain private to sample 001.</p>
      </section>
    </div>
  );
}

