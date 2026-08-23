import KnitMaterial from '../material/KnitMaterial';
import type { KnitMaterialParameters } from '../material/parameters';

type Props = { material: KnitMaterialParameters; progress?: number };

export default function MeshLoader({ material, progress }: Props) {
  const determinate = typeof progress === 'number';
  const value = Math.max(0, Math.min(1, progress ?? 1));
  return (
    <div className="mesh-loader" role={determinate ? 'progressbar' : 'status'} aria-label={determinate ? 'Textile loading progress' : 'Loading through connected stitches'} aria-valuemin={determinate ? 0 : undefined} aria-valuemax={determinate ? 100 : undefined} aria-valuenow={determinate ? Math.round(value * 100) : undefined}>
      <KnitMaterial parameters={{ ...material, idleMotion: determinate ? 0 : material.idleMotion }} quality="small" deformation={{ type: determinate ? 'toggle' : 'wave', amount: value }} label="" />
      <span>{determinate ? `${Math.round(value * 100)}% taut` : 'Tension travelling'}</span>
    </div>
  );
}

