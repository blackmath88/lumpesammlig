import type { CoilParameters } from './parameters';
export type CoilPreset = { id:string; label:string; description:string; values:CoilParameters };
export const COIL_PRESETS: CoilPreset[] = [
  { id:'source', label:'Source', description:'Dry fibre, raised origin and restrained indigo interruptions.', values:{ coilSpacing:.54, coilThickness:.62, centerLift:.72, radialDrift:.46, bindingFrequency:.56, indigoDensity:.42, compression:.68, lightDirection:.32 } },
  { id:'open', label:'Open Coil', description:'More space between rounds exposes the path of accumulation.', values:{ coilSpacing:.86, coilThickness:.44, centerLift:.58, radialDrift:.62, bindingFrequency:.38, indigoDensity:.3, compression:.25, lightDirection:.4 } },
  { id:'compressed', label:'Compressed', description:'Tight adjacent circuits read as a load-bearing field.', values:{ coilSpacing:.22, coilThickness:.78, centerLift:.5, radialDrift:.24, bindingFrequency:.7, indigoDensity:.34, compression:.94, lightDirection:.26 } },
  { id:'indigo', label:'Indigo Bound', description:'Binding becomes frequent enough to interrupt the straw rhythm.', values:{ coilSpacing:.5, coilThickness:.6, centerLift:.64, radialDrift:.4, bindingFrequency:.92, indigoDensity:.9, compression:.7, lightDirection:.34 } },
  { id:'raised', label:'Raised Center', description:'The origin lifts above later circuits and retains its beginning.', values:{ coilSpacing:.58, coilThickness:.66, centerLift:1, radialDrift:.52, bindingFrequency:.48, indigoDensity:.38, compression:.62, lightDirection:.18 } },
];

