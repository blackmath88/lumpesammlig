# Agent workbench · working state

Resumption note for [AGENT-WORKBENCH-BUILD-PLAN.md](AGENT-WORKBENCH-BUILD-PLAN.md). Rewritten whenever a phase changes; the plan itself is not edited to record progress. Distinguish what is verified from what is planned.

Last updated: 2026-10-31, on branch `claude/funny-maxwell-o40dyb`, after Prompt 4.

## Current focus

Phases A, B (documentation), C (working history for the 014 pilot only), D (local full-text retrieval) and E (file-based feedback loop) are implemented on this branch and await the author's review. Nothing has been merged or deployed.

## State by phase

| Phase | State | Evidence |
| :-- | :-- | :-- |
| A — instructions and continuity | Implemented, checks run, not yet accepted | `AGENTS.md`, `CLAUDE.md`, `docs/method/`, `scripts/check-docs.mjs`, `npm run check:docs` |
| B — pilot research record | Documentation implemented for 014; readings, decisions and inventory are labelled retrospective | `src/samples/014-made-heavy/{encounter,research,readings,decisions,feedback}/`, `working-state.md` |
| C — public working history | Implemented for 014 only; browser-checked at 1280 and 390 px, keyboard, reduced motion; not yet accepted | `src/pages/samples/014-made-heavy/history.astro`, `src/samples/014-made-heavy/history.{ts,css,test.mjs}`, `scripts/check-history-output.mjs` |
| D — local retrieval | Implemented as a dependency-free CLI over an explicit corpus; 7 tests; evaluation 5 of 5 files cited, one weak section noted | `tools/retrieval/{corpus.json,lib.mjs,cli.mjs,eval.json,README.md}`, `npm run retrieval:*`, `npm run test:retrieval` |
| E — feedback and learning | Implemented as Markdown only: loop document, two real traces, one explicitly synthetic rejection walkthrough, two proposed lessons awaiting a human, lesson-note check in `check:docs` | `docs/method/feedback-loop.md`, `docs/method/lessons/` |
| F — portable kit | Not started | — |
| G — BYOK workbench | Not started; separately authorised | — |

## Agreed direction

Markdown is canonical. The exhibition builds without any of this. Retrieval is full text only, local, outside `src/`, with a gitignored index; no embeddings, backend, model calls or deployment have been added. No existing study's interaction design was changed; the 014 page gained two links to its history. The history page is a per-study list and renderer, not a shared engine.

## Open decisions

- Whether `check:docs` should also run in `deploy.yml` (currently only in the pull-request workflow, beside the other checks).
- Whether the two `008` directories and routes should be reconciled; noted in the study index, not changed.
- The pilot's readings and decisions, written after implementation, are now public through the history page under the label of retrospective reconstruction. If the author disagrees with any of them, corrections go in as dated additions, which the page will then show.
- `feedback/2026-10-31-source-check.md` proposes rewording the Vassiliev attribution in the study prose and `sample.md`; not done, the author decides.
- The two raw research exports stay unpublished because they contain raw HTML and 27 mostly unchecked citations; they remain linked on GitHub. They are also excluded from the retrieval corpus by default (`tools/retrieval/corpus.json`).
- Whether the retrieval heading bonus should be weakened; see the evaluation record in `tools/retrieval/README.md`.
- Two proposed lessons in `docs/method/lessons/` wait for a status from the author. Neither has been applied.

## Blockers

None technical. Human acceptance of Phase A and B wording is required before Phase C publishes any of the pilot record.

## Next useful action

Author reviews this branch: the instructions, the pilot record, the public history page, a trial of `npm run retrieval:search`, and the two proposed lessons (accept, reject or withdraw each). If accepted, Prompt 5 (Phase F, the portable agent kit) is the next authorised step.
