import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import { globToRegExp, matchesCorpus, collectFiles, classify, sectionise, buildIndex, search, pack, allSections } from './lib.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, '../..');
const config = JSON.parse(readFileSync(join(here, 'corpus.json'), 'utf8'));

test('corpus: globs match what they say and nothing more', () => {
  assert.ok(globToRegExp('docs/*.md').test('docs/CONCEPT.md'));
  assert.ok(!globToRegExp('docs/*.md').test('docs/method/README.md'));
  assert.ok(globToRegExp('src/samples/*/{readings,decisions}/*.md').test('src/samples/014-made-heavy/decisions/001-x.md'));
  assert.ok(globToRegExp('a/**/*.md').test('a/b/c/d.md') && globToRegExp('a/**/*.md').test('a/d.md'));
  assert.ok(matchesCorpus('src/samples/014-made-heavy/encounter/README.md', config));
  assert.ok(!matchesCorpus('src/samples/014-made-heavy/encounter/research-02-materials-and-tectonics.md', config));
  assert.ok(!matchesCorpus('node_modules/astro/README.md', config));
  assert.ok(!matchesCorpus('dist/samples/014-made-heavy/history/index.html', config));
  assert.ok(!matchesCorpus('src/samples/014-made-heavy/made-heavy.ts', config));
  assert.ok(!matchesCorpus('.env', config));
});

test('corpus: the real repository walk stays inside the boundary', () => {
  const files = collectFiles(repo, config);
  const paths = files.map((f) => f.path);
  assert.ok(paths.includes('src/samples/014-made-heavy/working-state.md'));
  assert.ok(paths.includes('docs/method/study-index.md'));
  assert.ok(paths.every((p) => matchesCorpus(p, config)));
  assert.ok(!paths.some((p) => /^(node_modules|dist|\.git|\.astro)\//.test(p) || p.includes('research-0')));
});

test('corpus: symlinks and files outside the repository are never read', () => {
  const outside = mkdtempSync(join(tmpdir(), 'lr-outside-'));
  writeFileSync(join(outside, 'secret.md'), '# Secret\n\nprivate');
  const root = mkdtempSync(join(tmpdir(), 'lr-repo-'));
  mkdirSync(join(root, 'docs'));
  writeFileSync(join(root, 'docs', 'ok.md'), '# Ok\n\npublic');
  symlinkSync(join(outside, 'secret.md'), join(root, 'docs', 'link.md'));
  symlinkSync(outside, join(root, 'docs', 'linkdir'));
  const files = collectFiles(root, { include: ['docs/**/*.md'], exclude: [] });
  assert.deepEqual(files.map((f) => f.path), ['docs/ok.md']);
});

test('sections: heading path, kind, study and hash travel with every section', () => {
  const md = '# Title\n\nintro\n\n## Status\n\nStatus: dropped\n\n### Why\n\n```\n# not a heading\n```\nbecause\n';
  const s = sectionise('src/samples/014-made-heavy/readings/02-x.md', md);
  assert.deepEqual(s.map((x) => x.heading), ['Title', 'Status', 'Why']);
  assert.deepEqual(s[2].headings, ['Title', 'Status', 'Why']);
  assert.equal(s[2].kind, 'reading'); assert.equal(s[2].study, '014'); assert.equal(s[2].line, 9);
  assert.ok(s[2].text.includes('# not a heading'));
  assert.ok(s.every((x) => x.hash === s[0].hash && x.hash.length === 12));
  assert.deepEqual(classify('docs/method/records.md'), { kind: 'method', study: null });
  assert.deepEqual(classify('src/samples/013-switchboard/sample.md'), { kind: 'study-note', study: '013' });
});

test('index: unchanged files are reused, changed ones rebuilt, deleted ones dropped, output deterministic', () => {
  const a = { path: 'docs/a.md', content: '# A\n\nalpha' }, b = { path: 'docs/b.md', content: '# B\n\nbeta' };
  const first = buildIndex([b, a]);
  assert.deepEqual(Object.keys(first.files), ['docs/a.md', 'docs/b.md']);
  assert.deepEqual(first.stats, { files: 2, reused: 0, rebuilt: 2, removed: [] });
  const second = buildIndex([a, { path: 'docs/b.md', content: '# B\n\nbeta changed' }, { path: 'docs/c.md', content: '# C\n\ngamma' }], first);
  assert.equal(second.files['docs/a.md'], first.files['docs/a.md']);
  assert.notEqual(second.files['docs/b.md'].hash, first.files['docs/b.md'].hash);
  assert.deepEqual(second.stats, { files: 3, reused: 1, rebuilt: 2, removed: [] });
  const third = buildIndex([a], second);
  assert.deepEqual(third.stats.removed, ['docs/b.md', 'docs/c.md']);
  assert.ok(!allSections(third).some((s) => s.text.includes('beta')));
  assert.equal(JSON.stringify(buildIndex([a, b])), JSON.stringify(buildIndex([b, a])));
});

test('search: results carry path, heading, kind, study, hash and an excerpt; filters hold', () => {
  const index = buildIndex([
    { path: 'src/samples/014-made-heavy/readings/02-x.md', content: '# Two\n\nStatus: dropped.\n\n## Why\n\nA page that refuses to adapt to the viewer was dropped because any monument could produce it.' },
    { path: 'src/samples/014-made-heavy/readings/01-y.md', content: '# One\n\nStatus: chosen.\n\nPiers and shadow. The viewer is not the subject.' },
    { path: 'src/samples/013-switchboard/sample.md', content: '# 013\n\nA viewer patches a connection and releases it.' },
  ]);
  const r = search(index, 'refuses to adapt to the viewer');
  assert.equal(r[0].section.path, 'src/samples/014-made-heavy/readings/02-x.md');
  assert.equal(r[0].section.heading, 'Why');
  assert.match(r[0].excerpt, /refuses to adapt/);
  assert.ok(r[0].section.hash && r[0].section.kind === 'reading' && r[0].section.study === '014');
  assert.ok(search(index, 'viewer', { study: '013' }).every((x) => x.section.study === '013'));
  assert.ok(search(index, 'viewer', { kind: 'study-note' }).every((x) => x.section.kind === 'study-note'));
  assert.deepEqual(search(index, 'zzzz'), []);
  assert.deepEqual(search(index, '  '), []);
});

test('pack: consulted files are listed with hashes and the study\'s dissenting record travels along', () => {
  const index = buildIndex([
    { path: 'src/samples/014-made-heavy/readings/01-y.md', content: '# One\n\nStatus: **chosen**. Piers bear load.' },
    { path: 'src/samples/014-made-heavy/readings/02-x.md', content: '# Two\n\nStatus: **held, then dropped**. The social reading.' },
    { path: 'src/samples/014-made-heavy/feedback/note.md', content: '# Note\n\n## Observation\n\nchecks re-run\n\n## Interpretation\n\nfine' },
    { path: 'src/samples/014-made-heavy/sample.md', content: '# 014\n\n## What weakened, what remains untranslated\n\nscale is untranslated\n\n## Falsification\n\nstrip the paper' },
  ]);
  const p = pack(index, search(index, 'piers bear load'));
  assert.deepEqual(p.consulted.map((c) => c.path), ['src/samples/014-made-heavy/readings/01-y.md']);
  assert.ok(p.consulted[0].hash);
  const why = p.dissent.map((d) => `${d.section.path.split('/').pop()}:${d.why}`);
  assert.ok(why.includes('02-x.md:reading with status "held, then dropped"'));
  assert.equal(why.filter((w) => w.startsWith('note.md:feedback note')).length, 1);
  assert.ok(why.some((w) => w.startsWith('sample.md:limit')));
  assert.ok(!why.some((w) => w.startsWith('01-y.md')));
});
