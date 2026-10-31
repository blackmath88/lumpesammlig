import { test } from 'node:test';
import assert from 'node:assert/strict';
import { HISTORY_DOCUMENTS, HISTORY_EXCLUDED, STUDY_DIR, REPO_BLOB, REPO_TREE, resolvePath, assertNoRawHtml, rewriteDocument } from './history.ts';

const exists = new Set([
  `${STUDY_DIR}/sample.md`, `${STUDY_DIR}/working-state.md`, `${STUDY_DIR}/pours.ts`, 'docs/CONCEPT.md',
  ...HISTORY_DOCUMENTS.map((d) => `${STUDY_DIR}/${d.file}`),
]);
const dirs = new Set([`${STUDY_DIR}/encounter`, `${STUDY_DIR}/decisions`]);
const resolver = { stat: (p) => (dirs.has(p) ? 'dir' : exists.has(p) ? 'file' : undefined) };
const reading = HISTORY_DOCUMENTS.find((d) => d.id === 'reading-01');

test('history: the boundary is explicit and excludes the study note, working state and raw research exports', () => {
  const files = HISTORY_DOCUMENTS.map((d) => d.file);
  for (const f of HISTORY_EXCLUDED) assert.ok(!files.includes(f), f);
  assert.equal(new Set(HISTORY_DOCUMENTS.map((d) => d.id)).size, HISTORY_DOCUMENTS.length);
  assert.ok(files.every((f) => f.endsWith('.md') && !f.startsWith('/') && !f.includes('..')));
});

test('history: headings are demoted and ids and fragments are scoped to the document', () => {
  const out = rewriteDocument('<h1 id="t">T</h1><h2 id="what-it-foregrounds">W</h2><a href="#what-it-foregrounds">x</a>', reading, resolver);
  assert.equal(out, '<h2 id="reading-01--t">T</h2><h3 id="reading-01--what-it-foregrounds">W</h3><a href="#reading-01--what-it-foregrounds">x</a>');
});

test('history: relative links go to in-page anchors, GitHub, or fail', () => {
  assert.equal(rewriteDocument('<a href="02-collective-promise-individual-smallness.md">a</a>', reading, resolver), '<a href="#reading-02">a</a>');
  assert.equal(rewriteDocument('<a href="../decisions/001-four-separate-experiments.md#choice">a</a>', reading, resolver), '<a href="#decision-001--choice">a</a>');
  assert.equal(rewriteDocument('<a href="../sample.md">a</a>', reading, resolver), `<a href="${REPO_BLOB}${STUDY_DIR}/sample.md">a</a>`);
  assert.equal(rewriteDocument('<a href="../encounter/">a</a>', reading, resolver), `<a href="${REPO_TREE}${STUDY_DIR}/encounter">a</a>`);
  assert.equal(rewriteDocument('<a href="../../../../docs/CONCEPT.md">a</a>', reading, resolver), `<a href="${REPO_BLOB}docs/CONCEPT.md">a</a>`);
  assert.equal(rewriteDocument('<a href="https://example.org/x#y">a</a>', reading, resolver), '<a href="https://example.org/x#y">a</a>');
  assert.throws(() => rewriteDocument('<a href="../missing.md">a</a>', reading, resolver), /does not exist/);
  assert.throws(() => resolvePath('a', '../../../x'), /escapes/);
});

test('history: tables become scrollable and raw HTML is refused', () => {
  assert.equal(rewriteDocument('<table><tr><td>1</td></tr></table>', reading, resolver), '<div class="table-scroll" tabindex="0"><table><tr><td>1</td></tr></table></div>');
  assert.doesNotThrow(() => assertNoRawHtml('# T\n\nplain `<b>` and\n\n```\n<div>\n```\n', 'ok'));
  assert.throws(() => assertNoRawHtml('text <span style="display:none">x</span>', 'bad'), /raw HTML/);
});
