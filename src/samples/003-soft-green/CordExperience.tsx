import { useMemo, useState, type CSSProperties } from 'react';
import CordField from './CordField';
import { DEFAULT_CORD_PARAMETERS, type CordParameters } from './material/parameters';
import { CORD_PRESETS, type CordPreset } from './material/presets';
import './cord-experience.css';

const controls:Array<[keyof CordParameters,string,string,string]>=[['strandThickness','Strand thickness','Fine','Heavy'],['twist','Twist','Loose','Tight'],['compression','Compression','Soft','Pressed'],['packingDensity','Packing density','Open','Dense'],['fuzz','Fuzz','Bound','Escaping'],['tension','Tension','Slack','Loaded'],['lightDirection','Light direction','Left','Right']];

export default function CordExperience(){
  const [parameters,setParameters]=useState({...DEFAULT_CORD_PARAMETERS});const [preset,setPreset]=useState('source');const [knot,setKnot]=useState(46);const [load,setLoad]=useState(52);
  const description=useMemo(()=>CORD_PRESETS.find(item=>item.id===preset)?.description??'A custom balance of twist, compression and carried load.',[preset]);
  const apply=(item:CordPreset)=>{setParameters({...item.values});setPreset(item.id)};
  const update=(key:keyof CordParameters,value:number)=>{setParameters(current=>({...current,[key]:value}));setPreset('custom')};
  return <div className="cord-experience">
    <section className="knot-scene" aria-labelledby="knot-title">
      <header><p className="cord-lab-index">05 / KNOT AS VALUE</p><h2 id="knot-title">Slack changes sides.</h2><p>The knot carries the value. Moving it shortens one span, lengthens the other and redistributes visible tension.</p></header>
      <div className="knot-instrument" style={{'--knot':`${knot}%`} as CSSProperties}>
        <div className="cord-span cord-span--left"><CordField bare parameters={{...parameters,tension:knot/100}} quality="small" interactive={false} label="" /></div>
        <div className="cord-span cord-span--right"><CordField bare parameters={{...parameters,tension:1-knot/100}} quality="small" interactive={false} label="" /></div>
        <span className="knot-marker" aria-hidden="true"><i/></span>
        <label><span>Knot position</span><input type="range" min="0" max="100" value={knot} onChange={event=>setKnot(Number(event.currentTarget.value))}/><output>{knot}</output></label>
      </div>
    </section>

    <section className="suspension-scene" aria-labelledby="suspension-title" style={{'--load':load/100} as CSSProperties}>
      <div className="suspension-copy"><p className="cord-lab-index">06 / SUSPENDED PANEL</p><h2 id="suspension-title">Content asks the line to carry it.</h2><p>Increasing load deepens sag and tightens the approaches to both anchors while the reading remains stable.</p></div>
      <div className="suspended-system">
        <i className="anchor anchor--a"/><i className="anchor anchor--b"/>
        <div className="suspended-cord"><CordField bare parameters={{...parameters,tension:Math.max(.2,load/100)}} quality="small" interactive={false} label="Continuous cord carrying a suspended panel" /></div>
        <article><small>LOAD / {load}</small><h3>Many weak fibres become one structural promise.</h3><p>The panel is readable without animation; deformation only clarifies the force path.</p></article>
      </div>
      <label className="load-control"><span>Panel load</span><input type="range" min="0" max="100" value={load} onChange={event=>setLoad(Number(event.currentTarget.value))}/><output>{load}</output></label>
    </section>

    <section className="cord-scale" aria-labelledby="cord-scale-title">
      <div><p className="cord-lab-index">07 / SCALE UNDER LOAD</p><h2 id="cord-scale-title">Fibre becomes system.</h2><p>At 18 px the fuzz is lost. Twist survives into a strand; tension becomes legible only once the cord connects distant anchors.</p></div>
      <figure className="fibre"><span/><figcaption>fibre / alignment</figcaption></figure>
      <figure className="strand"><CordField bare parameters={parameters} quality="micro" interactive={false} label="Tiny cord specimen"/><figcaption>strand / twist</figcaption></figure>
      <figure className="structure"><CordField bare parameters={parameters} quality="small" interactive label="Load-bearing cord field"/><figcaption>structure / carried force</figcaption></figure>
    </section>

    <section className="cord-lab" aria-labelledby="cord-lab-title">
      <header><p className="cord-lab-index">08 / ATTACHED WORKBENCH</p><h2 id="cord-lab-title">Inspect the load.</h2><p>{description}</p></header>
      <div className="cord-lab-grid"><div className="cord-lab-preview"><CordField bare parameters={parameters} quality="full" label="Live cord material preview"/></div><div className="cord-controls">
        <div className="cord-presets">{CORD_PRESETS.map(item=><button type="button" key={item.id} aria-pressed={preset===item.id} onClick={()=>apply(item)}>{item.label}</button>)}</div>
        {controls.map(([key,label,low,high])=><label className="cord-control" key={key}><span><b>{label}</b><output>{Math.round(parameters[key]*100)}</output></span><input type="range" min="0" max="1" step=".01" value={parameters[key]} onChange={event=>update(key,Number(event.currentTarget.value))}/><small>{low}<i>{high}</i></small></label>)}
        <button className="cord-reset" type="button" onClick={()=>apply(CORD_PRESETS[0])}>Reset to Source</button>
      </div></div>
    </section>
  </div>;
}
