export type KnitMaterialParameters = {
  /** Distance between stitches / openness of the mesh. 0 = dense, 1 = very open. */
  openness: number;
  /** Visual thickness of the yarn. */
  yarnThickness: number;
  /** Handmade departure from a regular grid. */
  irregularity: number;
  /** Overall tautness of the material. */
  tension: number;
  /** How slowly / softly deformation settles. */
  softness: number;
  /** Strength of the lilac → sage → mint colour drift. */
  gradientMix: number;
  /** Amount of idle material motion. */
  idleMotion: number;
};

export const DEFAULT_KNIT_PARAMETERS: KnitMaterialParameters = {
  openness: 0.64,
  yarnThickness: 0.58,
  irregularity: 0.68,
  tension: 0.24,
  softness: 0.78,
  gradientMix: 0.88,
  idleMotion: 0.28,
};

export function clampKnitParameters(value: Partial<KnitMaterialParameters>): KnitMaterialParameters {
  const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
  return Object.fromEntries(
    Object.entries({ ...DEFAULT_KNIT_PARAMETERS, ...value }).map(([key, val]) => [key, clamp01(Number(val))]),
  ) as KnitMaterialParameters;
}

