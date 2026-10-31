#!/usr/bin/env node
// Usage:
//   node tools/retrieval/cli.mjs index                      rebuild tools/retrieval/index.json from corpus.json
//   node tools/retrieval/cli.mjs search "query" [--kind k] [--study 014] [--limit 8] [--pack] [--json]
//   node tools/retrieval/cli.mjs eval [--strict]            run eval.json and report hits and misses
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildIndex, collectFiles, pack, search } from './lib.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, '../..');
const indexPath = join(here, 'index.json');
const config = JSON.parse(readFileSync(join(here, 'corpus.json'), 'utf8'));

const args = process.argv.slice(2);
const command = args.shift();
const flag = (name, dflt = null) => { const i = args.indexOf(`--${name}`); if (i < 0) return dflt; const v = args[i + 1]; args.splice(i, v && !v.startsWith('--') ? 2 : 1); return v && !v.startsWith('--') ? v : true; };

function loadIndex({ refresh = true } = {}) {
  const previous = existsSync(indexPath) ? JSON.parse(readFileSync(indexPath, 'utf8')) : null;
  if (!refresh && previous) return previous;
  const index = buildIndex(collectFiles(repo, config), previous, config);
  writeFileSync(indexPath, JSON.stringify(index, null, 1) + '\n');
  return index;
}

const where = (s) => `${s.path}${s.anchor ? `#${s.anchor}` : ''}  [${s.kind}${s.study ? ` · ${s.study}` : ''} · ${s.hash}]`;

if (command === 'index') {
  const index = loadIndex();
  console.log(`indexed ${index.stats.files} files (${index.stats.reused} unchanged, ${index.stats.rebuilt} rebuilt, ${index.stats.removed.length} removed${index.stats.removed.length ? ': ' + index.stats.removed.join(', ') : ''}) → ${indexPath}`);
} else if (command === 'search') {
  const kind = flag('kind'), study = flag('study'), limit = Number(flag('limit', 8)), asJson = flag('json', false), withPack = flag('pack', false);
  const query = args.join(' ').trim();
  if (!query) { console.error('search needs a query'); process.exit(2); }
  const index = loadIndex();
  const results = search(index, query, { kind, study, limit });
  const out = withPack ? pack(index, results) : { results };
  if (asJson) { console.log(JSON.stringify(out, null, 1)); }
  else {
    if (!results.length) console.log('no sections match');
    results.forEach((r, i) => console.log(`${String(i + 1).padStart(2)}. ${where(r.section)}\n    ${r.section.headings.join(' › ') || '(top)'}  · score ${r.score.toFixed(2)}\n    ${r.excerpt}\n`));
    if (withPack) {
      console.log(`Consulted (${out.consulted.length} files):`);
      for (const c of out.consulted) console.log(`  ${c.path}  ${c.kind}  ${c.hash}`);
      console.log(`\nDisagreement and limits for ${out.studies.length ? 'stud' + (out.studies.length > 1 ? 'ies ' : 'y ') + out.studies.join(', ') : 'no study'} (${out.dissent.length}):`);
      for (const d of out.dissent) console.log(`  ${where(d.section)}\n    ${d.why}: ${d.excerpt.slice(0, 180)}`);
    }
  }
} else if (command === 'eval') {
  const strict = flag('strict', false);
  const index = loadIndex();
  const cases = JSON.parse(readFileSync(join(here, 'eval.json'), 'utf8'));
  let misses = 0;
  for (const c of cases) {
    const results = search(index, c.query, { kind: c.kind || null, study: c.study || null, limit: c.top || 5 });
    const rank = results.findIndex((r) => c.expect.includes(r.section.path));
    const hit = rank >= 0;
    if (!hit) misses++;
    console.log(`${hit ? 'HIT ' : 'MISS'} ${c.id} · ${c.name}\n     query: "${c.query}"${c.kind ? ` (kind ${c.kind})` : ''}\n     ${hit ? `rank ${rank + 1}: ${results[rank].section.path}#${results[rank].section.anchor}` : `expected one of ${c.expect.join(', ')}`}\n     top: ${results.slice(0, 3).map((r) => r.section.path.replace(/^src\/samples\//, '')).join(' | ') || 'nothing'}\n     judged by: ${c.judge}\n`);
  }
  console.log(`${cases.length - misses}/${cases.length} cases cite an expected source in the top ${cases[0]?.top || 5}.`);
  if (strict && misses) process.exit(1);
} else {
  console.error('commands: index | search "query" [--kind] [--study] [--limit] [--pack] [--json] | eval [--strict]');
  process.exit(2);
}
