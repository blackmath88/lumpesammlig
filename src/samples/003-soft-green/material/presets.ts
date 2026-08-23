import type { CordParameters } from './parameters';
export type CordPreset = { id: string; label: string; description: string; values: CordParameters };
export const CORD_PRESETS: CordPreset[] = [
  { id:'source', label:'Source', description:'Balanced wound cord with matte fuzz and visible compression channels.', values:{ strandThickness:.56, twist:.72, compression:.58, packingDensity:.72, fuzz:.42, tension:.64, lightDirection:.34 } },
  { id:'compressed', label:'Compressed', description:'Dense winding presses each strand into a darker neighbour.', values:{ strandThickness:.68, twist:.65, compression:.9, packingDensity:.9, fuzz:.24, tension:.78, lightDirection:.28 } },
  { id:'slack', label:'Slack', description:'Open packing and low tension let the cord wander.', values:{ strandThickness:.58, twist:.5, compression:.28, packingDensity:.42, fuzz:.52, tension:.18, lightDirection:.42 } },
  { id:'load', label:'Load-bearing', description:'Tight twist and aligned fibres carry visible force.', values:{ strandThickness:.48, twist:.9, compression:.7, packingDensity:.78, fuzz:.2, tension:.94, lightDirection:.2 } },
  { id:'frayed', label:'Frayed', description:'Fibre escape weakens the clean helical silhouette.', values:{ strandThickness:.6, twist:.42, compression:.38, packingDensity:.6, fuzz:.96, tension:.3, lightDirection:.5 } },
];

