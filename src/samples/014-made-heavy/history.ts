// Working history for study 014: the explicit publication boundary and the
// pure transformations applied to each approved document before it is rendered.
// Nothing outside HISTORY_DOCUMENTS is rendered; scripts/check-history-output.mjs
// checks the built page against the excluded files.

export const STUDY_DIR = 'src/samples/014-made-heavy';
export const REPO_BLOB = 'https://github.com/blackmath88/lumpesammlig/blob/main/';
export const REPO_TREE = 'https://github.com/blackmath88/lumpesammlig/tree/main/';

export type HistoryDocument = {
  /** Anchor id on the page; also the prefix for the document's heading ids. */
  id: string;
  /** Path relative to the study directory. */
  file: string;
  /** Short label for the contents list. */
  label: string;
  /** Which part of the record this is. Shown beside the document. */
  kind: 'encounter' | 'research' | 'reading' | 'decision' | 'feedback';
};

/** The approved documents, in reading order. Add to this list deliberately. */
export const HISTORY_DOCUMENTS: readonly HistoryDocument[] = [
  { id: 'encounter', file: 'encounter/README.md', label: 'Encounter evidence and inventory', kind: 'encounter' },
  { id: 'sources', file: 'research/sources.md', label: 'Research sources and their check status', kind: 'research' },
  { id: 'readings', file: 'readings/README.md', label: 'Readings: overview', kind: 'reading' },
  { id: 'reading-01', file: 'readings/01-tectonic-language.md', label: '01 The tectonic language', kind: 'reading' },
  { id: 'reading-02', file: 'readings/02-collective-promise-individual-smallness.md', label: '02 Collective promise, individual smallness', kind: 'reading' },
  { id: 'reading-03', file: 'readings/03-archaic-and-futuristic.md', label: '03 The archaic and the futuristic', kind: 'reading' },
  { id: 'decisions', file: 'decisions/README.md', label: 'Decisions: overview', kind: 'decision' },
  { id: 'decision-001', file: 'decisions/001-four-separate-experiments.md', label: '001 Four separate experiments', kind: 'decision' },
  { id: 'decision-002', file: 'decisions/002-paper-and-ink-not-concrete.md', label: '002 Paper and ink, not concrete', kind: 'decision' },
  { id: 'decision-003', file: 'decisions/003-drop-the-fifth-direction.md', label: '003 Drop the fifth direction', kind: 'decision' },
  { id: 'decision-004', file: 'decisions/004-the-sliver-at-the-seam.md', label: '004 The sliver at the seam', kind: 'decision' },
  { id: 'feedback', file: 'feedback/README.md', label: 'Feedback: overview', kind: 'feedback' },
  { id: 'feedback-checks', file: 'feedback/2026-10-31-independent-check-rerun.md', label: 'Independent re-run of the recorded checks', kind: 'feedback' },
  { id: 'feedback-sources', file: 'feedback/2026-10-31-source-check.md', label: 'Checking two cited sources', kind: 'feedback' },
];

/** Files in the study directory that are deliberately not published here. */
export const HISTORY_EXCLUDED: readonly string[] = [
  'sample.md',
  'working-state.md',
  'encounter/research-01-conceptualisation.md',
  'encounter/research-02-materials-and-tectonics.md',
];

export const KIND_LABEL: Record<HistoryDocument['kind'], string> = {
  encounter: 'Encounter',
  research: 'Research',
  reading: 'Reading',
  decision: 'Decision',
  feedback: 'Feedback',
};

/** Resolve a posix-style relative path against a directory; '' means the repo root. */
export function resolvePath(fromDir: string, target: string): string {
  const parts = fromDir ? fromDir.split('/') : [];
  for (const seg of target.split('/')) {
    if (seg === '' || seg === '.') continue;
    if (seg === '..') { if (!parts.length) throw new Error(`Link escapes the repository: ${target}`); parts.pop(); }
    else parts.push(seg);
  }
  return parts.join('/');
}

/**
 * Throw if the Markdown source contains raw HTML outside code. The approved
 * documents are plain Markdown; HTML would be rendered unescaped by the shell.
 */
export function assertNoRawHtml(markdown: string, name: string): void {
  const stripped = markdown.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '');
  const m = stripped.match(/<[a-zA-Z!/][^\n]{0,40}/);
  if (m) throw new Error(`${name}: raw HTML is not published (${m[0]})`);
}

export type Resolver = {
  /** Does this repo-relative path exist, and is it a directory? Undefined if absent. */
  stat: (repoPath: string) => 'file' | 'dir' | undefined;
};

/**
 * Rewrite one compiled document for inclusion on the page:
 * - headings demoted one level and their ids prefixed with the document id;
 * - fragment links prefixed the same way;
 * - relative links to approved documents become in-page anchors;
 * - relative links to other repository files become GitHub links, if they exist;
 * - anything else relative fails the build;
 * - tables wrapped so they can scroll on narrow screens.
 */
export function rewriteDocument(html: string, doc: HistoryDocument, resolver: Resolver): string {
  const dir = doc.file.includes('/') ? doc.file.slice(0, doc.file.lastIndexOf('/')) : '';
  const byFile = new Map(HISTORY_DOCUMENTS.map((d) => [`${STUDY_DIR}/${d.file}`, d.id]));
  let out = html;
  out = out.replace(/<(\/?)h([1-5])\b/g, (_, slash, n) => `<${slash}h${Number(n) + 1}`);
  out = out.replace(/\bid="([^"]+)"/g, (_, id) => `id="${doc.id}--${id}"`);
  out = out.replace(/\bhref="([^"]*)"/g, (_, href: string) => {
    if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(href)) return `href="${href}"`;
    if (href.startsWith('#')) return `href="#${doc.id}--${href.slice(1)}"`;
    const [path, fragment] = href.split('#');
    const repoPath = resolvePath(`${STUDY_DIR}/${dir}`, path);
    const target = byFile.get(repoPath);
    if (target) return `href="#${fragment ? `${target}--${fragment}` : target}"`;
    const kind = resolver.stat(repoPath);
    if (!kind) throw new Error(`${doc.file}: link to a path that does not exist: ${href}`);
    return `href="${kind === 'dir' ? REPO_TREE : REPO_BLOB}${repoPath}${fragment ? `#${fragment}` : ''}"`;
  });
  out = out.replace(/<table>/g, '<div class="table-scroll" tabindex="0"><table>').replace(/<\/table>/g, '</table></div>');
  return out;
}
