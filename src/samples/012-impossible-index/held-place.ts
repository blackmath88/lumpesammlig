import { records } from './records.ts';
export type Filing = 'title' | 'subject' | 'vocabulary';
export type RecordId = (typeof records)[number]['id'];
export type Place = { id: RecordId; filing: Filing; held: boolean; reference: RecordId };
export const initialPlace: Place = { id: 'IDX-006', filing: 'title', held: false, reference: 'IDX-006' };
export const recordFor = (id: RecordId) => records.find(r => r.id === id)!;
export function sharedTerms(a: RecordId, b: RecordId) {
  const terms: readonly string[] = recordFor(a).terms;
  return recordFor(b).terms.filter(term => terms.includes(term));
}
export function filed(filing: Filing, anchor: RecordId) {
  return [...records].sort((a, b) => {
    if (filing === 'subject') return a.drawer.localeCompare(b.drawer) || a.title.localeCompare(b.title);
    if (filing === 'vocabulary') return sharedTerms(anchor, b.id).length - sharedTerms(anchor, a.id).length || a.title.localeCompare(b.title);
    return a.title.localeCompare(b.title);
  });
}
export function changeFiling(place: Place, filing: Filing): Place {
  if (filing === place.filing) return place;
  const position = filed(place.filing, place.reference).findIndex(r => r.id === place.id);
  const reference = filing === 'vocabulary' ? place.id : place.reference;
  return { ...place, filing, reference, id: place.held ? place.id : filed(filing, reference)[position].id };
}
export function neighbours(place: Place) {
  const order = filed(place.filing, place.reference);
  const position = order.findIndex(r => r.id === place.id);
  return { order, position, before: order[position - 1], after: order[position + 1] };
}
export function placementReason(id: RecordId, place: Place) {
  if (place.filing === 'title') return 'Title filing · alphabetical neighbours, not relevance.';
  if (place.filing === 'subject') return `Subject filing · ${recordFor(id).drawer}, then title A–Z.`;
  const terms = sharedTerms(id, place.reference);
  return terms.length ? `Shared with ${place.reference} · ${terms.join(' / ')}.` : 'No shared controlled terms · alphabetical tie-break.';
}
