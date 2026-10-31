# Agent workbench · working state

Resumption note for [AGENT-WORKBENCH-BUILD-PLAN.md](AGENT-WORKBENCH-BUILD-PLAN.md). Rewritten whenever a phase changes; the plan itself is not edited to record progress. Distinguish what is verified from what is planned.

Last updated: 2026-10-31, on branch `claude/funny-maxwell-o40dyb`, after Prompt 1.

## Current focus

Phase A (instructions and continuity) and the documentation portion of Phase B (pilot record for 014) are implemented on this branch and await the author's review. Nothing has been merged or deployed.

## State by phase

| Phase | State | Evidence |
| :-- | :-- | :-- |
| A — instructions and continuity | Implemented, checks run, not yet accepted | `AGENTS.md`, `CLAUDE.md`, `docs/method/`, `scripts/check-docs.mjs`, `npm run check:docs` |
| B — pilot research record | Documentation implemented for 014; readings, decisions and inventory are labelled retrospective | `src/samples/014-made-heavy/{encounter,research,readings,decisions,feedback}/`, `working-state.md` |
| C — public working history | Not started. Requires Prompt 2 | — |
| D — local retrieval | Not started. Requires Prompt 3 | — |
| E — feedback and learning | Not started; the feedback note format exists in `docs/method/records.md` | — |
| F — portable kit | Not started | — |
| G — BYOK workbench | Not started; separately authorised | — |

## Agreed direction

Markdown is canonical. The exhibition builds without any of this. No retrieval, backend, model calls or deployment have been added. No existing study's interaction design was changed.

## Open decisions

- Whether `check:docs` should also run in `deploy.yml` (currently only in the pull-request workflow, beside the other checks).
- Whether the two `008` directories and routes should be reconciled; noted in the study index, not changed.
- Whether the pilot's readings and decisions, written after implementation, are an acceptable basis for Phase C, or whether the author wants to add first-hand notes first.

## Blockers

None technical. Human acceptance of Phase A and B wording is required before Phase C publishes any of the pilot record.

## Next useful action

Author reviews this branch. If accepted, Prompt 2 (Phase C) for the pilot only.
