import { test } from 'node:test';
import assert from 'node:assert/strict';
import { initialStructure, bearings, loads, movePier, addPier, removePier, setMass, freeColumn, COLUMNS, MAX_PIERS } from './piers.ts';
import { initialFacade, bays, visible, actionable, face, look, setDepth, toggleKeep } from './shadow.ts';
import { emptySite, toggle, masses, preset, count, GRID_H } from './panels.ts';
import { initialWall, pour, strike, startPatch, cancelPatch, surface, formwork } from './pours.ts';

test('01 piers: regions bear, project or drop depending only on where the piers stand', () => {
  const s = initialStructure();
  const b = Object.fromEntries(bearings(s).map(x => [x.region, x]));
  assert.equal(b.encounter.state, 'bearing');
  assert.equal(b.transformation.state, 'bearing');
  assert.deepEqual(b.transformation.piers, ['P1', 'P2', 'P3']);
  // Move the middle pier out of the reading span: the reading now hangs off one pier.
  let moved = s;
  moved = movePier(moved, 'P2', 1);
  const after = Object.fromEntries(bearings(moved).map(x => [x.region, x]));
  assert.equal(after.reading.piers.length, 1);
  assert.equal(after.reading.state, 'cantilever');
  // Remove the last pier: the reflection, which only it carried, drops to the ground.
  const dropped = removePier(moved, 'P3');
  assert.equal(Object.fromEntries(bearings(dropped).map(x => [x.region, x])).reflection.state, 'grounded');
  // Constraints: no two piers in one column, no more than MAX_PIERS, at least one pier.
  assert.equal(movePier(s, 'P1', 4), s);
  let full = s;
  while (full.piers.length < MAX_PIERS) full = addPier(full, freeColumn(full));
  assert.equal(addPier(full, freeColumn(full) ?? 0), full);
  let one = s;
  one = removePier(removePier(removePier(one, 'P1'), 'P2'), 'P3');
  assert.equal(one.piers.length, 1);
  assert.ok(COLUMNS === 12);
});

test('01 piers: the image of support and the actual load can disagree', () => {
  let s = initialStructure();
  // Make P3 enormous, then move it out of every span.
  s = setMass(s, 'P3', 3);
  s = movePier(s, 'P3', 1); // column 11, still inside distinction/transformation/reflection
  let l = loads(s).find(x => x.pier === 'P3');
  assert.equal(l.rhetorical, false);
  assert.ok(l.load > 0);
  // Shrink the regions' reach by moving P3 into a column nothing spans: impossible here, all columns are spanned.
  // So demonstrate rhetoric with an added heavy pier under an uncovered... every column is spanned by 'transformation'.
  // Remove transformation's reach instead: narrow test fixture.
  const narrow = { ...s, regions: s.regions.filter(r => r.id !== 'transformation' && r.id !== 'distinction' && r.id !== 'reflection') };
  const l2 = loads(narrow).find(x => x.pier === 'P3');
  assert.equal(l2.load, 0);
  assert.equal(l2.rhetorical, true);
  const total = loads(narrow).reduce((sum, x) => sum + x.load, 0);
  const width = narrow.regions.reduce((sum, r) => sum + (bearings(narrow).find(b => b.region === r.id).state === 'grounded' ? 0 : r.end - r.start + 1), 0);
  assert.equal(Math.round(total), width);
});

test('02 shadow: what you can act on depends on where you stand; depth zero is the flat façade', () => {
  let f = initialFacade();
  const centre = bays.find(b => b.id === 'deep');
  const edge = bays.find(b => b.id === 'ribs');
  assert.equal(visible(f, centre), 1);
  assert.ok(visible(f, edge) < 0.6);
  assert.equal(actionable(f, edge), false);
  assert.equal(toggleKeep(f, edge), f, 'cannot keep a bay you are not facing');
  f = face(f, edge);
  assert.equal(actionable(f, edge), true);
  f = toggleKeep(f, edge);
  assert.deepEqual(f.kept, ['ribs']);
  assert.ok(visible(f, centre) < 1, 'turning to the edge screens the centre');
  f = setDepth(f, 0);
  for (const bay of bays) assert.equal(visible(f, bay), 1, 'a flat façade shows everything from anywhere');
  assert.equal(look(f, 5).eye, 1);
});

test('03 panels: one unit, verdict by arrangement alone', () => {
  const block = masses(preset('block'));
  assert.equal(block.length, 1);
  assert.equal(block[0].verdict, 'fabric');
  assert.equal(block[0].rectangular, true);
  const raised = masses(preset('raised'));
  assert.equal(raised.length, 1);
  assert.equal(raised[0].verdict, 'exception');
  assert.ok(raised[0].openGround >= 2);
  assert.ok(raised[0].overhang >= 2);
  const gear = masses(preset('gear'));
  assert.equal(gear.length, 1);
  assert.equal(gear[0].verdict, 'exception');
  assert.equal(gear[0].rectangular, false);
  // A floating mass is unbuildable, however shapely.
  let site = emptySite();
  for (let x = 2; x < 9; x++) site = toggle(site, 1, x);
  assert.equal(masses(site)[0].verdict, 'unbuildable');
  // Small exceptions are not exceptions; the rule needs mass.
  let small = emptySite();
  small = toggle(small, GRID_H - 1, 0);
  small = toggle(small, GRID_H - 2, 0);
  small = toggle(small, GRID_H - 2, 1);
  assert.equal(masses(small)[0].verdict, 'fabric');
  assert.equal(count(preset('clear')), 0);
  assert.equal(toggle(site, 99, 99), site);
});

test('04 pours: a struck pour cannot change; an overcast keeps a sliver of what it covers', () => {
  let w = initialWall();
  assert.equal(surface(w).length, 3);
  assert.equal(strike(w), w, 'empty formwork strikes nothing');
  w = strike(pour(w, '  '));
  assert.equal(w.pours.length, 3);
  w = strike(pour(w, 'A fourth pour.'));
  assert.equal(w.pours.length, 4);
  assert.equal(w.wet, '');
  // Overcast pour 2. The surface keeps pour 2's position and shows its sliver.
  w = startPatch(w, 2);
  assert.equal(w.patching, 2);
  w = strike(pour(w, 'Roughness here is designed, not an absence of workmanship.'));
  const s = surface(w);
  assert.deepEqual(s.map(x => x.index), [1, 5, 3, 4]);
  assert.equal(s[1].covers.length, 1);
  assert.equal(s[1].covers[0].index, 2);
  assert.ok(s[1].covers[0].sliver.startsWith('These traces are the finished surface'));
  // Overcast the patch itself: the lineage accumulates, oldest first.
  w = strike(pour(startPatch(w, 5), 'Third layer.'));
  assert.deepEqual(surface(w)[1].covers.map(c => c.index), [2, 5]);
  assert.equal(cancelPatch(startPatch(w, 1)).patching, null);
  assert.equal(startPatch(w, 99), w);
  assert.equal(formwork(1, false).grain, 'horizontal');
  assert.equal(formwork(2, false).grain, 'vertical');
  assert.ok(formwork(2, true).pitch < formwork(2, false).pitch);
});
