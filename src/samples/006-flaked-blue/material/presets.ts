import type { PaintParameters } from './parameters';
export type PaintPreset = { id:string; label:string; description:string; values:PaintParameters };
export const PAINT_PRESETS: PaintPreset[] = [
  { id:'source', label:'Source', description:'Mostly intact blue-grey paint with clustered edge loss.', values:{ paintCoverage:.74, age:.58, brittleness:.62, crackDirection:.7, flakeLift:.64, undercoatExposure:.52, woodExposure:.24, lightDirection:.3 } },
  { id:'intact', label:'Intact', description:'Young connected coverage keeps earlier layers almost hidden.', values:{ paintCoverage:.96, age:.12, brittleness:.16, crackDirection:.55, flakeLift:.12, undercoatExposure:.08, woodExposure:.02, lightDirection:.36 } },
  { id:'hairline', label:'Hairline', description:'Fine directional cracks appear before broad material loss.', values:{ paintCoverage:.9, age:.42, brittleness:.72, crackDirection:.92, flakeLift:.24, undercoatExposure:.18, woodExposure:.04, lightDirection:.28 } },
  { id:'lifted', label:'Lifted', description:'Raised edges cast enough shadow to expose layer order.', values:{ paintCoverage:.66, age:.72, brittleness:.88, crackDirection:.74, flakeLift:1, undercoatExposure:.68, woodExposure:.22, lightDirection:.18 } },
  { id:'exposed', label:'Exposed', description:'Deep loss reveals pale undercoat and directional wood.', values:{ paintCoverage:.34, age:.94, brittleness:.94, crackDirection:.66, flakeLift:.72, undercoatExposure:.9, woodExposure:.82, lightDirection:.42 } },
];

