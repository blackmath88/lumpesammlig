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

  const applyPreset = (preset: KnitPreset) => {
    setParameters(copy(preset.values));
    setActivePreset(preset.id);
  };
  const update = (key: keyof KnitMaterialParameters, value: number) => {
    setParameters((current) => ({ ...current, [key]: value }));
    setActivePreset('custom');
  };

  return (
    <div className="material-experience">
      <section className="gather-scene" aria-labelledby="gather-title">
        <div className="scene-copy gather-copy">
          <p className="lab-index">04 / PRESSURE</p>
          <h2 id="gather-title">A control gathers<br />out of the field.</h2>
          <p>There is no permanent button frame. Local tension gives a soft region enough structure to accept pressure; release travels back into the weave.</p>
        </div>
        <div className="gather-field">
          <KnitButton material={parameters}>Press the gathered cloth</KnitButton>
          <figure className="scale-whisper scale-whisper--micro">
            <div><KnitMaterial parameters={parameters} quality="micro" label="Micro knit specimen" /></div>
            <figcaption>36 px / fibre becomes signal</figcaption>
          </figure>
          <p className="field-note">PRESS / HOLD / RELEASE</p>
        </div>
      </section>

      <section className="anchor-scene" aria-labelledby="anchor-title">
        <header className="scene-copy anchor-copy">
          <p className="lab-index">05 / TWO ANCHORS</p>
          <h2 id="anchor-title">State is the distance<br />the cloth can hold.</h2>
        </header>
        <div className="anchor-stage">
          <TensionToggle material={parameters} checked={toggle} onChange={setToggle} />
          <p className="anchor-explanation">Loose cloth hangs between two fixed points. Toggle the state and the mesh itself becomes the indicator: openings align, slack is taken up, and the span rises.</p>
        </div>
      </section>

      <section className="progress-scene" aria-labelledby="progress-title">
        <div className="progress-heading">
          <p className="lab-index">06 / PROPAGATION</p>
          <h2 id="progress-title">Progress crosses<br />a connected field.</h2>
          <p>Not a bar filling a container: a broad textile band moving from slack to held tension.</p>
        </div>
        <MeshLoader material={parameters} progress={progress} />
        <label className="progress-control">
          <span>Move the tension front</span>
          <input type="range" min="0" max="1" step=".01" value={progress} onChange={(event) => setProgress(Number(event.currentTarget.value))} />
          <output>{Math.round(progress * 100)}%</output>
        </label>
        <div className="travelling-specimen">
          <span>INDETERMINATE / LOCAL WAVE</span>
          <MeshLoader material={parameters} />
        </div>
      </section>

      <section className="perimeter-scene" aria-labelledby="perimeter-title">
        <div className="perimeter-intro">
          <p className="lab-index">07 / PERIMETER</p>
          <h2 id="perimeter-title">The reading stays still.<br />Its boundary negotiates.</h2>
          <p>Drag the exposed cloth. The content remains composed while force moves through the material around it.</p>
        </div>
        <StretchCard material={parameters} />
        <figure className="scale-whisper scale-whisper--small">
          <div><KnitMaterial parameters={parameters} quality="micro" label="Small knit control specimen" /></div>
          <figcaption>72 px / colour + topology</figcaption>
        </figure>
      </section>

      <section className="scale-drift" aria-labelledby="scale-title">
        <div className="scale-statement">
          <p className="lab-index">08 / SCALE, DISPERSED</p>
          <h2 id="scale-title">The cloth does not<br />survive intact.</h2>
          <p>At each size a different part is surrendered. Failure is useful: it identifies which qualities can actually carry interface meaning.</p>
        </div>
        <figure className="drift-specimen drift-specimen--medium">
          <div><KnitMaterial parameters={parameters} quality="small" label="Medium knit specimen" /></div>
          <figcaption><b>220 px</b><span>yarn and openings remain distinct</span></figcaption>
        </figure>
        <figure className="drift-specimen drift-specimen--large">
          <div><KnitMaterial parameters={parameters} quality="small" interactive label="Large interactive knit specimen" /></div>
          <figcaption><b>environment</b><span>gesture can propagate through the field</span></figcaption>
        </figure>
        <figure className="drift-specimen drift-specimen--tiny">
          <div><KnitMaterial parameters={parameters} quality="micro" label="Tiny knit specimen" /></div>
          <figcaption><b>16 px</b><span>material collapses into a coloured pulse</span></figcaption>
        </figure>
      </section>

      <section className="material-lab" aria-labelledby="material-lab-title">
        <header className="lab-heading">
          <p className="lab-index">09 / OPEN THE MATERIAL</p>
          <h2 id="material-lab-title">Inspection<br />instrument.</h2>
          <p>The exhibit has already behaved. Here the same engine can be opened, named and tuned. Every specimen above inherits this live material state.</p>
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

      <section className="implementation-note">
        <p className="lab-index">10 / IMPLEMENTATION NOTE</p>
        <blockquote>Code does not preserve a picture of the material. It preserves a field of possible behaviours.</blockquote>
        <p>A single canvas reconstruction scales stitch count, detail, pixel density and motion budget to every surface here. The exhibition changes shape around it; the material engine does not fork.</p>
      </section>
    </div>
  );
}

