import type { CSSProperties } from 'react';
import KnitMaterial from '../material/KnitMaterial';
import type { KnitMaterialParameters } from '../material/parameters';

type Props = { material: KnitMaterialParameters; progress?: number };

export default function MeshLoader({ material, progress }: Props) {
  const determinate = typeof progress === 'number';
  const value = Math.max(0, Math.min(1, progress ?? 1));
  const displayMaterial = determinate
    ? { ...material, tension: Math.max(material.tension, .12 + value * .78), openness: material.openness + (.7 - material.openness) * value }
    : material;
  return (
    <div className={`mesh-loader ${determinate ? 'mesh-loader--field' : 'mesh-loader--travelling'}`} style={{ '--tension-progress': value } as CSSProperties} role={determinate ? 'progressbar' : 'status'} aria-label={determinate ? 'Textile loading progress' : 'Loading through connected stitches'} aria-valuemin={determinate ? 0 : undefined} aria-valuemax={determinate ? 100 : undefined} aria-valuenow={determinate ? Math.round(value * 100) : undefined}>
      <KnitMaterial parameters={{ ...displayMaterial, idleMotion: determinate ? 0 : material.idleMotion }} quality="small" deformation={{ type: determinate ? 'toggle' : 'wave', amount: value }} label="" />
      <span className="tension-front" aria-hidden="true" />
      <span className="mesh-loader-label">{determinate ? `${Math.round(value * 100)}% of field held` : 'Tension travelling'}</span>
    </div>
  );
}

