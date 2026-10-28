# Studies 012 + 013 · implementation evidence

2026-10-28, NUC. Continued draft PR #8 from `f525449b77a00d9ac442eccdbd9bccacf0dcedd5`, not a new implementation baseline. The Orca-created branch was initially based on main; it was fast-forwarded to the PR head before edits. Other remote branches were inspected and left untouched.

## Scope and governance

Read CLAUDE.md, README, CONCEPT, ARCHITECTURE, notes and implementation context for 008–013; development-practice baseline, prototype profile and build guidance; Weavr canonical CHATGPT-OPERATING-CONTRACT. The Weavr overview had no registered Lumpesammlig/Postack project or active mission. No governance objects were created, dispatched, waived or promoted. No merge or deployment.

Read Colors records `003-retro-product-technical`, `004-kanji-signal`, `pair-08-print-white-one-blue`, `comp-radar-dusk-violet`. The implementation uses the supplied Postack palette rather than importing Colors' entire palette or decorative language. No outside rendering technique was required. No Interface Atlas changes were warranted.

## Technical boundary

Each study has a local fixture file, TypeScript interaction and CSS; Astro emits full static source records. No dependencies or lockfile changes, backend, network retrieval, authentication or shared engine. Query rank is exact controlled-term intersection, one point per distinct term, accession ID tie-break. Four distinct ASCII alphanumeric words maximum. Switchboard topics and relationship lenses intersect; unplug state belongs to the view and resets on reload.

Fixed the missing comma between catalogue entries 011 and 012 inherited from PR #8.

## Checks actually performed

- `npm ci` completed. npm reported 14 dependency audit findings (1 moderate, 12 high, 1 critical) in the existing lockfile. No dependency remediation was bundled into these studies.
- `npm run check`: 57 files, zero errors, warnings or hints after the catalogue fix.
- `npm run build`: all 12 routes generated.
- `git diff --check`.
- Real Chromium via Playwright, using the system `/usr/bin/chromium`. Browser tooling installed only in chat scratch space, not in the repository. Initial Orca browser snapshot and 390px overflow inspection succeeded; Orca screenshot capture timed out, so visual inspection used the independent Chromium fallback.
- Both studies captured and visually inspected at 390, 768 and 1440px. No document horizontal overflow. On mobile the index is one column and the switchboard inspector sits below the diagram; at 768 the ledger has two columns; at 1440 routing and inspector sit beside one another. Small technical annotations in the mobile diagram are supplementary; complete authorship remains in the ledger.
- Compared actual rendered output with 008 WordArt and 011 Thread Icons: preserved collection links, deliberate type hierarchy, generous specimen framing and source accountability, while giving 012 serif record titles and 013 a dark routing plane.
- 012: keyboard query + Enter; exact four-point top match; deterministic ranking and retained unmatched originals; native disclosure via keyboard; no-match query; over-limit validation; reset; drawer filtering; controlled-term cross-reference. Original record content remains unchanged.
- 013: keyboard lens selection, disagreement relation, cable reason, unplug/reconnect, empty lens intersection, unplug-all/restore-all, unchanged six-record ledger, source anchor and keyboard source disclosure. Inspecting a cable moves focus to its inspector heading, so mobile and keyboard users arrive at the explanation and its controls.
- Focus visible: 3px outline observed on keyboard-focused disclosure. Native links, buttons, input and summary controls retain keyboard access.
- Emulated `prefers-reduced-motion: reduce`; no running animations in either study. Both specimens are intentionally instantaneous.
- JavaScript disabled: all eight index records and all six switchboard source contributions readable.
- No uncaught browser runtime exceptions observed during the journeys. This is not a full assistive-technology or cross-browser audit.

## What remains open

Eight records cannot validate retrieval quality. Six fixed personas cannot validate federation or a community governance model. Source fixture addresses are illustrative, not remote resources. Cable changes and query state are session-local. Keyboard and browser checks establish mechanics, not human acceptance of the semantic transformations. Read each sample's reflection for what weakened and what can move into Postack Underflow.
