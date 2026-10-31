// Documentation consistency check.
// 1. Every relative Markdown link in the record files resolves to an existing path.
// 2. CLAUDE.md @imports resolve.
// 3. docs/method/study-index.md lists exactly the study numbers in src/data/samples.ts.
// Catalogue facts stay in samples.ts; the index only adds interpretation, so the two must agree.
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const problems = [];

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (name.endsWith('.md')) out.push(p);
  }
  return out;
}

const files = [
  ...['AGENTS.md', 'CLAUDE.md', 'README.md'].map((f) => join(repo, f)),
  ...walk(join(repo, 'docs')),
  ...walk(join(repo, 'src', 'samples')),
];

function stripFences(text) {
  return text.replace(/```[\s\S]*?```/g, '').replace(/~~~[\s\S]*?~~~/g, '').replace(/`[^`\n]*`/g, '');
}

for (const file of files) {
  const text = stripFences(readFileSync(file, 'utf8'));
  const rel = relative(repo, file);
  for (const m of text.matchAll(/\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) {
    const target = m[1];
    if (/^(https?:|mailto:|#)/.test(target)) continue;
    const path = target.replace(/#.*$/, '');
    if (!path) continue;
    if (!existsSync(resolve(dirname(file), path))) problems.push(`${rel}: broken link → ${target}`);
  }
  if (rel === 'CLAUDE.md') {
    for (const m of text.matchAll(/(?:^|\s)@([^\s]+)/gm)) {
      if (!existsSync(resolve(dirname(file), m[1]))) problems.push(`${rel}: @import does not resolve → ${m[1]}`);
    }
  }
}

const catalogue = readFileSync(join(repo, 'src/data/samples.ts'), 'utf8');
const inCatalogue = [...catalogue.matchAll(/number:\s*'(\d{3})'/g)].map((m) => m[1]).sort();
const index = readFileSync(join(repo, 'docs/method/study-index.md'), 'utf8');
const inIndex = [...index.matchAll(/^###\s+(\d{3})\b/gm)].map((m) => m[1]).sort();
for (const n of inCatalogue) if (!inIndex.includes(n)) problems.push(`study-index.md: missing study ${n} (in samples.ts)`);
for (const n of inIndex) if (!inCatalogue.includes(n)) problems.push(`study-index.md: lists ${n}, not in samples.ts`);
if (new Set(inIndex).size !== inIndex.length) problems.push('study-index.md: duplicate study heading');

// 4. Lesson notes carry their status lines, with an allowed status.
const lessonsDir = join(repo, 'docs/method/lessons');
if (existsSync(lessonsDir)) {
  const STATUS = new Set(['proposed', 'accepted', 'rejected', 'withdrawn', 'applied']);
  for (const file of walk(lessonsDir)) {
    if (file.endsWith('README.md')) continue;
    const rel = relative(repo, file);
    const head = readFileSync(file, 'utf8').split('\n').slice(0, 20).join('\n');
    for (const key of ['Status', 'Scope', 'Supporting examples', 'Counterexamples', 'Approval']) {
      if (!new RegExp(`^${key}:\\s*\\S`, 'm').test(head)) problems.push(`${rel}: missing "${key}:" line near the top`);
    }
    const status = (head.match(/^Status:\s*(\S+)/m) || [])[1];
    if (status && !STATUS.has(status)) problems.push(`${rel}: status "${status}" is not one of ${[...STATUS].join(', ')}`);
  }
}

if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log(`docs check passed: ${files.length} Markdown files, ${inCatalogue.length} studies indexed, lesson notes well-formed.`);
