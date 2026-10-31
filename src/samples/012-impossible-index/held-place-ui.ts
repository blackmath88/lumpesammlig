import { changeFiling, filed, initialPlace, neighbours, placementReason, recordFor } from './held-place';
import type { Filing, Place, RecordId } from './held-place';
const root = document.querySelector<HTMLElement>('#held-place')!;
let place: Place = { ...initialPlace };
let lastNeighbours = '';
const text = (selector: string, value: string) => { root.querySelector(selector)!.textContent = value; };
function render(announce = '') {
  const view = neighbours(place);
  const anchor = recordFor(place.id);
  root.dataset.held = String(place.held);
  text('#held-number', anchor.id);
  text('#held-heading', anchor.title);
  text('#held-note', anchor.note);
  text('#held-terms', anchor.terms.join(' / '));
  text('#held-classification', `${anchor.drawer} / ${anchor.kind}`);
  text('#held-qualification', anchor.caveat);
  text('#place-position', `${String(view.position + 1).padStart(2, '0')} / 08`);
  text('#hold-place', place.held ? 'Release your place' : 'Hold this place');
  root.querySelector('#hold-place')!.setAttribute('aria-pressed', String(place.held));
  text('#finger-state', place.held ? 'Your finger stays. The catalogue moves.' : 'No place held. The same position may reveal another record.');
  for (const [side, record] of [['before', view.before], ['after', view.after]] as const) {
    const el = root.querySelector<HTMLButtonElement>(`#neighbour-${side}`)!;
    el.disabled = !record;
    el.dataset.pick = record?.id ?? '';
    el.querySelector('.neighbour-id')!.textContent = record?.id ?? 'BOUNDARY';
    el.querySelector('strong')!.textContent = record?.title ?? (side === 'before' ? 'Beginning of this filing' : 'End of this filing');
    el.querySelector('.neighbour-reason')!.textContent = record ? placementReason(record.id, place) : 'The catalogue does not wrap around.';
  }
  const rail = root.querySelector('#filing-rail')!;
  for (const record of view.order) {
    const button = rail.querySelector<HTMLButtonElement>(`[data-pick="${record.id}"]`)!;
    button.setAttribute('aria-pressed', String(record.id === place.id));
    button.querySelector('.rail-position')!.textContent = String(view.order.indexOf(record) + 1).padStart(2, '0');
    rail.append(button);
  }
  root.querySelectorAll<HTMLElement>('[data-filing]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.filing === place.filing)));
  text('#place-memory', lastNeighbours || 'Pick a record. Hold its place. Change the filing. Notice who arrives beside it.');
  if (announce) text('#held-status', announce);
}
root.addEventListener('click', event => {
  const target = (event.target as Element).closest<HTMLButtonElement>('button');
  if (!target) return;
  if (target.id === 'hold-place') {
    place = { ...place, held: !place.held };
    render(place.held ? `${place.id} held. Changing the filing will keep this record.` : 'Place released. Changing filing will keep the position instead.');
  } else if (target.dataset.filing) {
    if (target.dataset.filing === place.filing) return;
    const previous = neighbours(place);
    lastNeighbours = `Previously beside ${place.id}: ${previous.before?.id ?? 'beginning'} ← → ${previous.after?.id ?? 'end'}.`;
    const old = place.id;
    place = changeFiling(place, target.dataset.filing as Filing);
    render(place.held ? `${old} stays held. Its neighbours have changed.` : `Position retained: ${old} → ${place.id}. Hold a place to keep the record instead.`);
  } else if (target.dataset.pick) {
    place = { ...place, id: target.dataset.pick as RecordId };
    lastNeighbours = '';
    render(`${place.id} ${place.held ? 'now held' : 'selected'}. ${recordFor(place.id).title}`);
  }
});
// A native-button filing rail supports both ordinary Tab navigation and arrow browsing.
root.querySelector('#filing-rail')!.addEventListener('keydown', event => {
  const e = event as KeyboardEvent;
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
  const order = filed(place.filing, place.reference);
  const index = order.findIndex(r => r.id === place.id);
  const next = e.key === 'Home' ? 0 : e.key === 'End' ? order.length - 1 : Math.max(0, Math.min(order.length - 1, index + (e.key === 'ArrowRight' ? 1 : -1)));
  e.preventDefault();
  place = { ...place, id: order[next].id };
  render(`${place.id} selected.`);
  root.querySelector<HTMLButtonElement>(`#filing-rail [data-pick="${place.id}"]`)!.focus();
});
render();
