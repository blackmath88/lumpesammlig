import { useMemo, useState } from 'react';
import WordArtRender from './WordArtRender';
import type { WordArtParameters, WordArtShape } from './material/parameters';
import { DEFAULT_WORDART_PARAMETERS } from './material/parameters';
import { WORDART_PRESETS, DEFAULT_WORDART_PRESET_ID } from './material/presets';
import { buildWordArtScene, sceneToSvgString } from './material/wordArt';

const SHAPES: Array<{ id: WordArtShape; label: string }> = [
  { id: 'plain', label: 'Plain' },
  { id: 'arch-up', label: 'Arch up' },
  { id: 'arch-down', label: 'Arch down' },
  { id: 'chevron', label: 'Chevron' },
  { id: 'wave', label: 'Wave' },
  { id: 'inflate', label: 'Inflate' },
  { id: 'deflate', label: 'Deflate' },
  { id: 'slant', label: 'Slant' }
];

const GALLERY_TILE_PARAMS: Partial<WordArtParameters> = {
  text: 'ART',
  fontSize: 56,
  letterSpacing: 2
};

export default function WordArtStudio() {
  const [parameters, setParameters] = useState<WordArtParameters>(() => {
    const preset = WORDART_PRESETS.find((p) => p.id === DEFAULT_WORDART_PRESET_ID);
    return { ...DEFAULT_WORDART_PARAMETERS, ...(preset?.values ?? {}) };
  });
  const [activePreset, setActivePreset] = useState<string>(DEFAULT_WORDART_PRESET_ID);
  const [note, setNote] = useState('');

  const svgString = useMemo(() => sceneToSvgString(buildWordArtScene(parameters, 'wa-stage'), parameters.text), [parameters]);

  const update = <K extends keyof WordArtParameters>(key: K, value: WordArtParameters[K]) => {
    setParameters((p) => ({ ...p, [key]: value }));
    setActivePreset('');
  };

  const pickPreset = (id: string) => {
    const preset = WORDART_PRESETS.find((p) => p.id === id);
    if (!preset) return;
    setParameters((p) => ({ ...p, ...preset.values }));
    setActivePreset(id);
  };

  const flash = (message: string) => {
    setNote(message);
    window.setTimeout(() => setNote(''), 2200);
  };

  const downloadSvg = () => {
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wordart.svg';
    a.click();
    URL.revokeObjectURL(url);
    flash('Saved as wordart.svg');
  };

  const copySvg = async () => {
    try {
      await navigator.clipboard.writeText(svgString);
      flash('SVG copied to clipboard');
    } catch {
      flash('Copy blocked — use the download instead');
    }
  };

  const tileParameters = (values: Partial<WordArtParameters>) => ({
    ...DEFAULT_WORDART_PARAMETERS,
    ...values,
    ...GALLERY_TILE_PARAMS
  });

  return (
    <section className="wa-studio" aria-labelledby="wa-studio-title">
      <div className="wa-stage" aria-label="WordArt preview">
        <WordArtRender parameters={parameters} idSeed="wa-stage" className="wa-stage-svg" />
        <p className="wa-note" aria-live="polite">{note}</p>
      </div>

      <div className="wa-console">
        <label className="wa-field wa-field-text">
          <span>Your text</span>
          <input
            type="text"
            value={parameters.text}
            maxLength={24}
            onChange={(e) => update('text', e.target.value)}
            placeholder="Type something"
          />
        </label>

        <fieldset className="wa-gallery">
          <legend>Gallery — pick a style like it's 2000</legend>
          <div className="wa-gallery-grid" role="listbox" aria-label="WordArt gallery styles">
            {WORDART_PRESETS.map((preset, i) => (
              <button
                key={preset.id}
                type="button"
                role="option"
                aria-selected={activePreset === preset.id}
                className={`wa-tile${activePreset === preset.id ? ' is-active' : ''}`}
                onClick={() => pickPreset(preset.id)}
                title={`${String(i + 1).padStart(2, '0')} ${preset.name}`}
              >
                <WordArtRender parameters={tileParameters(preset.values)} idSeed={`wa-t-${i}`} className="wa-tile-svg" />
              </button>
            ))}
          </div>
        </fieldset>

        <div className="wa-controls">
          <label className="wa-field">
            <span>Shape</span>
            <select value={parameters.shape} onChange={(e) => update('shape', e.target.value as WordArtShape)}>
              {SHAPES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </label>

          <label className="wa-field">
            <span>Fill</span>
            <select value={parameters.fillMode} onChange={(e) => update('fillMode', e.target.value as WordArtParameters['fillMode'])}>
              <option value="solid">Solid</option>
              <option value="gradient">Gradient</option>
              <option value="rainbow">Rainbow</option>
            </select>
          </label>

          <label className="wa-field wa-field-color">
            <span>Colour A</span>
            <input type="color" value={parameters.fillA} onChange={(e) => update('fillA', e.target.value)} />
          </label>
          <label className="wa-field wa-field-color">
            <span>Colour B</span>
            <input type="color" value={parameters.fillB} onChange={(e) => update('fillB', e.target.value)} />
          </label>
          <label className="wa-field wa-field-color">
            <span>Outline</span>
            <input type="color" value={parameters.outlineColor} onChange={(e) => update('outlineColor', e.target.value)} />
          </label>

          <label className="wa-field wa-field-range">
            <span>Curve / shape force</span>
            <input type="range" min={0} max={1} step={0.01} value={parameters.shapeAmount} onChange={(e) => update('shapeAmount', Number(e.target.value))} />
          </label>
          <label className="wa-field wa-field-range">
            <span>Outline weight</span>
            <input type="range" min={0} max={10} step={0.5} value={parameters.outlineWidth} onChange={(e) => update('outlineWidth', Number(e.target.value))} />
          </label>
          <label className="wa-field wa-field-range">
            <span>3D depth</span>
            <input type="range" min={0} max={20} step={1} value={parameters.extrusion} onChange={(e) => update('extrusion', Number(e.target.value))} />
          </label>
          <label className="wa-field wa-field-range">
            <span>Tracking</span>
            <input type="range" min={0} max={30} step={1} value={parameters.letterSpacing} onChange={(e) => update('letterSpacing', Number(e.target.value))} />
          </label>

          <label className="wa-field wa-field-check">
            <input type="checkbox" checked={parameters.shadow} onChange={(e) => update('shadow', e.target.checked)} />
            <span>Drop shadow</span>
          </label>
        </div>

        <div className="wa-actions">
          <button type="button" className="wa-btn" onClick={downloadSvg}>Download .svg</button>
          <button type="button" className="wa-btn" onClick={copySvg}>Copy SVG code</button>
        </div>
      </div>
    </section>
  );
}
