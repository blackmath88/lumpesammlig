// Local full-text retrieval over an explicit Markdown corpus. No dependencies, no network, no model.
// Everything here is pure except collectFiles, which walks the repository within the configured boundary.
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, lstatSync, realpathSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';

export const ALWAYS_SKIP = new Set(['node_modules', 'dist', '.git', '.astro', '.wrangler']);

/** Convert a repo-relative glob (supports **, *, {a,b}) to a RegExp over posix paths. */
export function globToRegExp(glob) {
  let re = '';
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i];
    if (c === '*' && glob[i + 1] === '*') { re += glob[i + 2] === '/' ? '(?:.*/)?' : '.*'; i += glob[i + 2] === '/' ? 2 : 1; }
    else if (c === '*') re += '[^/]*';
    else if (c === '{') { const end = glob.indexOf('}', i); re += `(?:${glob.slice(i + 1, end).split(',').map(escape).join('|')})`; i = end; }
    else re += escape(c);
  }
  return new RegExp(`^${re}$`);
}
const escape = (s) => s.replace(/[.+?^$()|[\]\\]/g, '\\$&');

export function matchesCorpus(path, config) {
  const inc = config.include.map(globToRegExp);
  const exc = (config.exclude || []).map(globToRegExp);
  return inc.some((r) => r.test(path)) && !exc.some((r) => r.test(path));
}

/**
 * Walk the repository and return the approved files with their content.
 * Boundary: only regular files, never symlinks, whose real path is inside the repository's real path,
 * never inside ALWAYS_SKIP directories, and matching the corpus patterns.
 */
export function collectFiles(repoRoot, config) {
  const root = realpathSync(repoRoot);
  const out = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir).sort()) {
      if (name.startsWith('.') || ALWAYS_SKIP.has(name)) continue;
      const full = join(dir, name);
      const st = lstatSync(full);
      if (st.isSymbolicLink()) continue;
      if (st.isDirectory()) { walk(full); continue; }
      if (!st.isFile()) continue;
      const real = realpathSync(full);
      if (!(real === root || real.startsWith(root + sep))) continue;
      const rel = relative(root, real).split(sep).join('/');
      if (matchesCorpus(rel, config)) out.push({ path: rel, content: readFileSync(real, 'utf8') });
    }
  };
  walk(root);
  return out;
}

export const hashText = (s) => createHash('sha256').update(s).digest('hex').slice(0, 12);

/** Document kind and study identity from the path alone. */
export function classify(path) {
  const study = (path.match(/^src\/samples\/(\d{3})-/) || [])[1] || null;
  const kind =
    /^src\/samples\/[^/]+\/encounter\//.test(path) ? 'evidence'
    : /^src\/samples\/[^/]+\/research\//.test(path) ? 'research'
    : /^src\/samples\/[^/]+\/readings\//.test(path) ? 'reading'
    : /^src\/samples\/[^/]+\/decisions\//.test(path) ? 'decision'
    : /^src\/samples\/[^/]+\/feedback\//.test(path) ? 'feedback'
    : /^src\/samples\/[^/]+\/working-state\.md$/.test(path) ? 'working-state'
    : /^src\/samples\/[^/]+\/sample\.md$/.test(path) ? 'study-note'
    : /^docs\/method\//.test(path) || path === 'AGENTS.md' ? 'method'
    : /^docs\/(CONCEPT|ARCHITECTURE)\.md$/.test(path) ? 'concept'
    : /^docs\/AGENT-WORKBENCH/.test(path) ? 'plan'
    : /^docs\//.test(path) ? 'docs-note'
    : 'overview';
  return { kind, study };
}

export const slugify = (s) => s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '');

/** Split one Markdown file into heading-delimited sections carrying their heading path. */
export function sectionise(path, content) {
  const hash = hashText(content);
  const { kind, study } = classify(path);
  const lines = content.split('\n');
  const sections = [];
  let trail = [];
  let current = { heading: '', trail: [], start: 1, lines: [] };
  let inFence = false;
  const flush = () => {
    const text = current.lines.join('\n').trim();
    if (text || current.heading) sections.push({ path, kind, study, hash, heading: current.heading, headings: current.trail, anchor: current.heading ? slugify(current.heading) : '', line: current.start, text });
  };
  lines.forEach((line, i) => {
    if (/^(```|~~~)/.test(line)) inFence = !inFence;
    const m = !inFence && line.match(/^(#{1,6})\s+(.*)$/);
    if (m) {
      flush();
      const depth = m[1].length;
      trail = [...trail.slice(0, depth - 1)];
      while (trail.length < depth - 1) trail.push('');
      trail.push(m[2].trim());
      current = { heading: m[2].trim(), trail: trail.filter(Boolean), start: i + 1, lines: [] };
    } else current.lines.push(line);
  });
  flush();
  return sections;
}

/** Tokens: lowercase letters/digits, light plural stripping, length ≥ 2. */
export function tokenize(text) {
  return (text.toLowerCase().match(/[\p{L}\p{N}]+/gu) || [])
    .map((t) => (t.length > 4 && t.endsWith('s') && !t.endsWith('ss') ? t.slice(0, -1) : t))
    .filter((t) => t.length >= 2);
}

/**
 * Build or update the index. Files whose hash is unchanged keep their sections from `previous`;
 * changed files are re-sectioned; files no longer present are dropped. Output is deterministic.
 */
export function buildIndex(files, previous = null, config = null) {
  const prevFiles = previous?.files || {};
  const out = {};
  let reused = 0, rebuilt = 0;
  for (const f of [...files].sort((a, b) => a.path.localeCompare(b.path))) {
    const hash = hashText(f.content);
    if (prevFiles[f.path]?.hash === hash) { out[f.path] = prevFiles[f.path]; reused++; }
    else { out[f.path] = { hash, sections: sectionise(f.path, f.content) }; rebuilt++; }
  }
  const removed = Object.keys(prevFiles).filter((p) => !out[p]).sort();
  return { format: 1, corpus: config ? hashText(JSON.stringify(config)) : null, files: out, stats: { files: Object.keys(out).length, reused, rebuilt, removed } };
}

export const allSections = (index) => Object.values(index.files).flatMap((f) => f.sections);

/** Full-text ranking (BM25 over sections) with a phrase bonus and a heading bonus. */
export function search(index, query, { kind = null, study = null, limit = 8 } = {}) {
  const sections = allSections(index).filter((s) => (!kind || s.kind === kind) && (!study || s.study === study));
  const qTokens = [...new Set(tokenize(query))];
  if (!qTokens.length) return [];
  const docs = sections.map((s) => ({ s, tokens: tokenize(`${s.headings.join(' ')} ${s.text}`) }));
  const N = docs.length;
  const avg = docs.reduce((a, d) => a + d.tokens.length, 0) / Math.max(N, 1);
  const df = new Map();
  for (const d of docs) for (const t of new Set(d.tokens)) df.set(t, (df.get(t) || 0) + 1);
  const k1 = 1.2, b = 0.75;
  const phrase = query.trim().toLowerCase();
  const scored = docs.map(({ s, tokens }) => {
    const tf = new Map();
    for (const t of tokens) tf.set(t, (tf.get(t) || 0) + 1);
    let score = 0;
    const matched = [];
    for (const q of qTokens) {
      const f = tf.get(q) || 0;
      if (!f) continue;
      matched.push(q);
      const idf = Math.log(1 + (N - df.get(q) + 0.5) / (df.get(q) + 0.5));
      score += idf * (f * (k1 + 1)) / (f + k1 * (1 - b + b * tokens.length / avg));
    }
    if (!matched.length) return null;
    const hay = `${s.headings.join(' ')}\n${s.text}`.toLowerCase();
    if (phrase.length > 3 && hay.includes(phrase)) score *= 1.5;
    if (qTokens.some((q) => tokenize(s.headings.join(' ')).includes(q))) score *= 1.15;
    return { section: s, score, matched };
  }).filter(Boolean);
  scored.sort((a, c) => c.score - a.score || a.section.path.localeCompare(c.section.path) || a.section.line - c.section.line);
  return scored.slice(0, limit).map((r) => ({ ...r, excerpt: excerpt(r.section.text, r.matched) }));
}

/** A short window around the first matched term, on word boundaries. */
export function excerpt(text, matched, width = 260) {
  const flat = text.replace(/\s+/g, ' ').trim();
  const lower = flat.toLowerCase();
  let at = -1;
  for (const m of matched) { const i = lower.search(new RegExp(`\\b${escape(m)}`)); if (i >= 0 && (at < 0 || i < at)) at = i; }
  if (at < 0) at = 0;
  let start = Math.max(0, at - Math.floor(width / 3));
  if (start > 0) { const sp = flat.indexOf(' ', start); if (sp > 0 && sp < at) start = sp + 1; }
  let end = Math.min(flat.length, start + width);
  if (end < flat.length) { const sp = flat.lastIndexOf(' ', end); if (sp > start) end = sp; }
  return `${start > 0 ? '… ' : ''}${flat.slice(start, end)}${end < flat.length ? ' …' : ''}`;
}

const DISSENT = /\b(dropped|rejected|untranslated|held|not developed|superseded|weakened|weakens|limitation|falsification|not done|unchecked)\b/i;

/**
 * A context pack: the results, the files consulted (with hashes), and for every study in the
 * results the record sections that disagree, qualify or limit: non-chosen readings, feedback
 * notes, and study-note sections about what weakened or remains untranslated.
 */
export function pack(index, results) {
  const consulted = [...new Map(results.map((r) => [r.section.path, { path: r.section.path, hash: r.section.hash, kind: r.section.kind }])).values()];
  const studies = [...new Set(results.map((r) => r.section.study).filter(Boolean))].sort();
  const hitKeys = new Set(results.map((r) => `${r.section.path}#${r.section.line}`));
  const dissent = [];
  for (const study of studies) {
    for (const s of allSections(index).filter((x) => x.study === study)) {
      if (hitKeys.has(`${s.path}#${s.line}`)) continue;
      const firstStatus = ((s.text.match(/Status:?\s*([^\n.]*)/i) || [])[1] || '').replace(/\*/g, '').trim();
      const why =
        s.kind === 'reading' && DISSENT.test(firstStatus) ? `reading with status "${firstStatus.trim()}"`
        : s.kind === 'feedback' && s.headings.length === 1 ? 'feedback note'
        : s.kind === 'decision' && /^Alternatives/i.test(s.text) ? 'alternatives considered'
        : (s.kind === 'study-note' || s.kind === 'working-state') && DISSENT.test(s.heading) ? 'limit recorded in the study note'
        : null;
      if (why) dissent.push({ section: s, why, excerpt: excerpt(s.text, []) });
    }
  }
  return { results, consulted, studies, dissent };
}
