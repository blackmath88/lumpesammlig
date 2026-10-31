import {test} from 'node:test';
import assert from 'node:assert/strict';
import {emptyDesk, patch, openCircuit, release} from './circuits.ts';
import {contributions, connections} from './records.ts';
test('patch, read and release are distinct; a third request cannot displace occupied work', () => {
  const a = patch(emptyDesk(), 'AB');
  assert.equal(a.result, 'patched'); assert.equal(a.desk[0].phase, 'patched');
  const open = openCircuit(a.desk, 0);
  assert.equal(open[0].phase, 'open'); assert.equal(a.desk[0].phase, 'patched');
  const b = patch(open, 'CD');
  const full = patch(b.desk, 'AF');
  assert.equal(full.result, 'full'); assert.equal(full.desk, b.desk);
  assert.deepEqual(full.desk.map(c => c.id), ['AB','CD']);
  const freed = release(full.desk, 0);
  assert.equal(freed[0], null); assert.equal(freed[1].id, 'CD');
  assert.equal(patch(freed, 'AF').desk[0].id, 'AF');
});
test('duplicate or unknown relations cannot occupy a circuit', () => {
  const desk = patch(emptyDesk(), 'AB').desk;
  assert.equal(patch(desk,'AB').result,'duplicate'); assert.equal(patch(desk,'ZZ').result,'unknown');
  assert.equal(patch(desk,'ZZ').desk, desk);
});
test('working with every relation never modifies source records or relation provenance', () => {
  const original = JSON.stringify({contributions, connections});
  for (const c of connections) {
    const desk = patch(emptyDesk(), c.id).desk;
    const opened = openCircuit(desk, 0);
    assert.deepEqual(release(opened, 0), emptyDesk());
  }
  assert.equal(JSON.stringify({contributions,connections}),original);
});
