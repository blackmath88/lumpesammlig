import type { PaperParameters } from './parameters';
export type PaperPreset = { id:string; label:string; description:string; values:PaperParameters };
export const PAPER_PRESETS: PaperPreset[] = [
  { id:'source', label:'Source', description:'Dusty indigo and absorbed cream marks share one imperfect sheet.', values:{ pulpRoughness:.58, sheetWaviness:.46, pigmentDensity:.72, absorption:.62, markSoftness:.55, repeatRadius:.58, registrationDrift:.34, missingCoverage:.28 } },
  { id:'bare', label:'Bare Sheet', description:'Paper topology remains after printed intent is almost removed.', values:{ pulpRoughness:.76, sheetWaviness:.72, pigmentDensity:.02, absorption:.3, markSoftness:.4, repeatRadius:.58, registrationDrift:.2, missingCoverage:.1 } },
  { id:'fresh', label:'Fresh Print', description:'Dense pigment retains sharper systematic marks.', values:{ pulpRoughness:.34, sheetWaviness:.28, pigmentDensity:.98, absorption:.2, markSoftness:.18, repeatRadius:.62, registrationDrift:.08, missingCoverage:.04 } },
  { id:'absorbed', label:'Absorbed', description:'The sheet softens edges and draws pigment into its fibres.', values:{ pulpRoughness:.82, sheetWaviness:.52, pigmentDensity:.62, absorption:1, markSoftness:.9, repeatRadius:.56, registrationDrift:.28, missingCoverage:.36 } },
  { id:'misregistered', label:'Misregistered', description:'Systematic intent drifts against one continuous substrate.', values:{ pulpRoughness:.6, sheetWaviness:.5, pigmentDensity:.78, absorption:.58, markSoftness:.52, repeatRadius:.7, registrationDrift:1, missingCoverage:.5 } },
];
