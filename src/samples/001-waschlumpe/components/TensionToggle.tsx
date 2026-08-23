import KnitMaterial from '../material/KnitMaterial';
import type { KnitMaterialParameters } from '../material/parameters';

type Props = { material: KnitMaterialParameters; checked: boolean; onChange: (checked: boolean) => void };

export default function TensionToggle({ material, checked, onChange }: Props) {
  return (
    <button className="tension-toggle" type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}>
      <KnitMaterial parameters={{ ...material, tension: checked ? Math.max(.78, material.tension) : Math.min(.18, material.tension), openness: checked ? .7 : .82 }} quality="small" deformation={{ type: 'toggle', amount: checked ? 1 : .08 }} label="" />
      <span className="toggle-state" aria-hidden="true"><i /><i /></span>
      <span>{checked ? 'Held taut' : 'Resting loose'}</span>
    </button>
  );
}

