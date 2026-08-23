import type { KnitMaterialParameters } from './parameters';

export type KnitPreset = {
  id: 'original' | 'quiet' | 'macro' | 'tense' | 'loose';
  label: string;
  description: string;
  values: KnitMaterialParameters;
};

export const KNIT_PRESETS: KnitPreset[] = [
  { id: 'original', label: 'Original', description: 'Closest reconstruction of the photographed Waschlumpe.', values: { openness: .64, yarnThickness: .58, irregularity: .68, tension: .24, softness: .78, gradientMix: .88, idleMotion: .28 } },
  { id: 'quiet', label: 'Quiet UI', description: 'Reduced motion and texture density for small interface surfaces.', values: { openness: .48, yarnThickness: .44, irregularity: .38, tension: .40, softness: .70, gradientMix: .54, idleMotion: .08 } },
  { id: 'macro', label: 'Macro', description: 'Large yarn, open cells and strong material presence.', values: { openness: .82, yarnThickness: .82, irregularity: .74, tension: .14, softness: .90, gradientMix: .95, idleMotion: .18 } },
  { id: 'tense', label: 'Tense', description: 'The cloth is pulled tight; openings stretch and response becomes quicker.', values: { openness: .72, yarnThickness: .50, irregularity: .34, tension: .84, softness: .34, gradientMix: .78, idleMotion: .12 } },
  { id: 'loose', label: 'Loose', description: 'Sagging, soft, irregular and slow to settle.', values: { openness: .76, yarnThickness: .64, irregularity: .92, tension: .06, softness: .96, gradientMix: .90, idleMotion: .42 } },
];

export const ORIGINAL_KNIT_PRESET = KNIT_PRESETS[0];

