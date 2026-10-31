// Checks the built working-history page for study 014 against its publication boundary.
// Run after `astro build` with --experimental-strip-types (imports the study's history.ts).
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { HISTORY_DOCUMENTS, HISTORY_EXCLUDED, STUDY_DIR } from '../src/samples/014-made-heavy/history.ts';

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const page = join(repo, 'dist/samples/014-made-heavy/history/index.html');
if (!existsSync(page)) { console.error(`missing ${page}; run the build first`); process.exit(1); }
const html = readFileSync(page, 'utf8');
const problems = [];

const decode = (s) => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&#x27;/g, "'").replace(/&nbsp;/g, ' ');
const normalise = (s) => decode(s).replace(/\s+/g, ' ').trim().toLowerCase();
const pageText = normalise(html.replace(/<[^>]+>/g, ' '));
const markdownToText = (md) => md
  .replace(/```[\s\S]*?```/g, '')
  .replace(/^\s{0,3}(#{1,6}|[-*>]|\d+\.)\s+/gm, '')
  .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
  .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
  .replace(/[`*_]/g, '');

// 1. Every approved document is on the page, with its anchor.
for (const d of HISTORY_DOCUMENTS) if (!html.includes(`id="${d.id}"`)) problems.push(`approved document not rendered: ${d.file}`);

// 2. Every in-page anchor resolves.
const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));
for (const m of html.matchAll(/\bhref="#([^"]+)"/g)) if (!ids.has(m[1])) problems.push(`dangling anchor: #${m[1]}`);

// 3. No local paths, no scripts.
for (const needle of ['/home/', '/tmp/', 'file://', 'C:\\']) if (html.includes(needle)) problems.push(`local path in output: ${needle}`);
if (/<script\b/i.test(html)) problems.push('the history page must not need a script');

// 4. Nothing distinctive from an excluded file appears on the page, unless an approved file quotes it.
const approvedText = normalise(HISTORY_DOCUMENTS.map((d) => markdownToText(readFileSync(join(repo, STUDY_DIR, d.file), 'utf8'))).join('\n'));
let probes = 0;
for (const file of HISTORY_EXCLUDED) {
  const text = markdownToText(readFileSync(join(repo, STUDY_DIR, file), 'utf8'));
  for (const line of text.split('\n')) {
    if (line.includes('|')) continue;
    const probe = normalise(line).slice(0, 80);
    if (probe.length < 80 || approvedText.includes(probe)) continue;
    probes++;
    if (pageText.includes(probe)) problems.push(`${file}: text from an excluded file is on the page: "${probe}"`);
  }
}

if (problems.length) { console.error(problems.join('\n')); process.exit(1); }
console.log(`history output verified: ${HISTORY_DOCUMENTS.length} documents, ${ids.size} anchors, ${probes} excluded-text probes absent.`);
