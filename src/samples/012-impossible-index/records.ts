// Authored fixture classification, fixed before any query. No external evidence implied.
export const records = [
  {
    id: "IDX-001",
    drawer: "Identity",
    title: "Refresh an expired OAuth access token",
    terms: [
      "oauth",
      "refresh",
      "expired",
      "token",
      "rotate",
      "access",
      "credentials",
    ],
    note: "Exchange a refresh token for an access token; serialize concurrent refresh attempts.",
    kind: "Solution pattern",
    caveat:
      "Provider rotation rules differ. This record is illustrative, not verified implementation advice.",
  },
  {
    id: "IDX-002",
    drawer: "Hosting",
    title: "Recover a broken static-site base path",
    terms: [
      "github",
      "pages",
      "static",
      "assets",
      "base",
      "path",
      "subdirectory",
      "routes",
    ],
    note: "Give routes and assets the same project prefix before publishing the static build.",
    kind: "Implementation note",
    caveat: "A correct prefix does not establish that a deployed asset exists.",
  },
  {
    id: "IDX-003",
    drawer: "Community",
    title: "Keep public discussions attributable",
    terms: [
      "atproto",
      "blog",
      "replies",
      "identity",
      "provenance",
      "decentralized",
      "comments",
    ],
    note: "Keep author identity and a source address with each contribution, separately from the view.",
    kind: "Open question",
    caveat: "Attribution is not proof of consent or durable availability.",
  },
  {
    id: "IDX-004",
    drawer: "Indexing",
    title: "Avoid repeated repository exploration",
    terms: [
      "index",
      "github",
      "code",
      "issues",
      "problems",
      "solved",
      "retrieval",
    ],
    note: "Classify solved problems in advance, keeping the original evidence address alongside each entry.",
    kind: "Research hypothesis",
    caveat:
      "Classification can become stale and can reproduce a curator’s biases.",
  },
  {
    id: "IDX-005",
    drawer: "Identity",
    title: "Coordinate simultaneous token refresh",
    terms: ["oauth", "refresh", "token", "concurrent", "lock", "credentials"],
    note: "A shared in-flight operation prevents two callers from rotating the same credential independently.",
    kind: "Related pattern",
    caveat: "This fixture does not implement cross-process coordination.",
  },
  {
    id: "IDX-006",
    drawer: "Community",
    title: "Retain disagreement across portable replies",
    terms: [
      "replies",
      "community",
      "disagreement",
      "provenance",
      "comments",
      "index",
    ],
    note: "Store a reply and its relationship without turning several authors into one accepted answer.",
    kind: "Design constraint",
    caveat:
      "A relationship label is an interpretation and needs its own provenance.",
  },
  {
    id: "IDX-007",
    drawer: "Hosting",
    title: "Check missing assets before rebuilding",
    terms: ["static", "assets", "path", "missing", "build", "code"],
    note: "Inspect the generated asset address and the published tree before changing the source.",
    kind: "Diagnostic note",
    caveat: "No actual site was audited to produce this record.",
  },
  {
    id: "IDX-008",
    drawer: "Indexing",
    title: "Record when a previously solved problem returns",
    terms: ["index", "solved", "problems", "refresh", "evidence", "stale"],
    note: "Preserve the old classification and attach a dated qualification instead of silently replacing it.",
    kind: "Maintenance question",
    caveat: "The fixture has no update service or quality score.",
  },
] as const;
export const wordsFor = (query: string) => [
  ...new Set(query.toLowerCase().match(/[a-z0-9]+/g) ?? []),
];
export function rank(query: string) {
  const words = wordsFor(query);
  return records
    .map((record) => ({
      record,
      matched: words.filter((word) =>
        (record.terms as readonly string[]).includes(word),
      ),
    }))
    .sort(
      (a, b) =>
        b.matched.length - a.matched.length ||
        a.record.id.localeCompare(b.record.id),
    );
}
