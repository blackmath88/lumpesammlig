import { test } from 'node:test';
import assert from 'node:assert/strict';
import { initialPlace, changeFiling, neighbours, filed, placementReason } from './held-place.ts';
import { records } from './records.ts';
const filings = ['title', 'subject', 'vocabulary'];
test('holding preserves identity while neighbours change under a different filing', () => {
  const held = { ...initialPlace, held: true };
  const before = neighbours(held);
  const next = changeFiling(held, 'vocabulary');
  assert.equal(next.id, held.id);
  assert.notDeepEqual([neighbours(next).before?.id, neighbours(next).after?.id], [before.before?.id, before.after?.id]);
});
test('without a held place, changing filing preserves position, not necessarily identity', () => {
  const before = neighbours(initialPlace);
  const next = changeFiling(initialPlace, 'vocabulary');
  assert.equal(neighbours(next).position, before.position);
  assert.notEqual(next.id, initialPlace.id);
  assert.equal(next.reference, initialPlace.id);
});
test('every record survives every filing, with no source mutation or wraparound neighbours', () => {
  const original = JSON.stringify(records);
  for (const filing of filings) for (const record of records) {
    const place = { id: record.id, reference: record.id, filing, held: true };
    const view = neighbours(place);
    assert.deepEqual([...view.order.map(r => r.id)].sort(), records.map(r => r.id).sort());
    assert.equal(view.order[view.position].id, record.id);
    assert.equal(view.before?.id, view.order[view.position-1]?.id);
    assert.equal(view.after?.id, view.order[view.position+1]?.id);
  }
  assert.equal(JSON.stringify(records), original);
});
test('vocabulary orders expose the exact shared terms and keep a stable reference', () => {
  const place = changeFiling({...initialPlace, held:true}, 'vocabulary');
  assert.equal(filed('vocabulary', place.reference)[0].id, place.reference);
  assert.match(placementReason('IDX-003', place), /replies/);
  assert.equal(changeFiling(place, 'vocabulary'), place);
});
