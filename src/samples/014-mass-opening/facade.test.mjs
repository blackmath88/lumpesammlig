import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  rows, closedSpan, spans, columns, bayState, toggle, close, initialState,
  stepAperture, selectRepeat, selectSupport, setSection, extendProjection, statusLine,
  OPEN_SPAN, PIER_SPAN, APERTURE_MAX, REPEAT_COUNT,
} from './facade.ts';

const all = rows.flat();

test('closed rows are unequal but share one twelve-part width', () => {
  for (const row of rows) {
    const s = spans(row, null);
    assert.equal(s.reduce((a, b) => a + b, 0), 12);
    assert.ok(new Set(s).size > 1, 'closed widths are deliberately unequal');
    assert.deepEqual(s, row.map((id) => closedSpan[id]));
  }
});

test('opening a bay takes space from its own row only', () => {
  for (const id of all) {
    const own = rows.find((r) => r.includes(id));
    const other = rows.find((r) => !r.includes(id));
    assert.deepEqual(spans(own, id), own.map((b) => (b === id ? OPEN_SPAN : PIER_SPAN)));
    assert.deepEqual(spans(other, id), other.map((b) => closedSpan[b]));
    assert.equal(columns(own, id).split(' ').length, 3);
  }
});

test('a pier is only ever a neighbour of the open bay', () => {
  assert.equal(bayState('recess', 'recess'), 'open');
  assert.equal(bayState('mass', 'recess'), 'pier');
  assert.equal(bayState('section', 'recess'), 'closed');
  assert.equal(bayState('section', null), 'closed');
});

test('switching goes directly from one bay to the next; closing restores the row', () => {
  let state = toggle(initialState, 'recess');
  assert.equal(state.active, 'recess');
  state = toggle(state, 'repetition');
  assert.equal(state.active, 'repetition');
  state = toggle(state, 'repetition');
  assert.equal(state.active, null);
  assert.equal(close(state), state, 'closing a closed façade changes nothing');
  assert.deepEqual(columns(rows[0], state.active), '5fr 4fr 3fr');
});

test('demonstration state survives opening, switching and closing', () => {
  let state = stepAperture(initialState, 2);
  state = selectRepeat(state, 3);
  state = setSection(state, 'section');
  state = selectSupport(state, 'limitation');
  state = extendProjection(state, true);
  const before = { ...state, active: null };
  state = close(toggle(toggle(state, 'mass'), 'support'));
  assert.deepEqual(state, before);
});

test('local demos are bounded and reversible', () => {
  assert.equal(stepAperture(initialState, 9).aperture, APERTURE_MAX);
  assert.equal(stepAperture(initialState, -9).aperture, 1);
  assert.equal(stepAperture(initialState, 0), initialState);
  assert.equal(selectRepeat(initialState, REPEAT_COUNT), initialState);
  assert.equal(selectRepeat(selectRepeat(initialState, 2), 2).repeat, null);
  assert.equal(selectSupport(selectSupport(initialState, 'design'), 'design').support, null);
});

test('the status line names the open bay and the piers it narrowed', () => {
  const titles = Object.fromEntries(all.map((id) => [id, id.toUpperCase()]));
  assert.match(statusLine(initialState, titles), /Open a bay/);
  assert.equal(statusLine(toggle(initialState, 'section'), titles), 'SECTION open / PROJECTION and SUPPORT narrowed to piers');
});
