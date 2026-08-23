import KnitMaterial from '../material/KnitMaterial';
import type { KnitMaterialParameters } from '../material/parameters';

type Props = { material: KnitMaterialParameters; checked: boolean; onChange: (checked: boolean) => void };

export default function TensionToggle({ material, checked, onChange }: Props) {
  return (
    <button className="tension-toggle" type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}>
      <span className="tension-anchor tension-anchor--left" aria-hidden="true"><i /></span>
      <span className="tension-membrane" aria-hidden="true">
        <KnitMaterial parameters={{ ...material, tension: checked ? Math.max(.82, material.tension) : Math.min(.12, material.tension), openness: checked ? .68 : .86 }} quality="small" deformation={{ type: 'toggle', amount: checked ? 1 : .04 }} label="" />
      </span>
      <span className="tension-anchor tension-anchor--right" aria-hidden="true"><i /></span>
      <span className="tension-state">{checked ? 'Held taut' : 'Resting loose'}<small>{checked ? 'force reaches both anchors' : 'weight collects in the centre'}</small></span>
    </button>
  );
}

