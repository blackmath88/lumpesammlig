# Working state · 014 Made Heavy

Last updated 2026-10-31 after the working-history page was added. Read this first when resuming.

**Current focus.** The study is implemented and in the collection. The open work is review, not building: human perceptual review has not happened, and the research's sources have not been checked beyond reading the two reports.

**Agreed direction.** Four separate experiments on one page, paper and ink, behavioural throughout. See `decisions/`. Do not replace this with the MASS / OPENING façade proposed earlier in `docs/AGENT-WORKBENCH-BUILD-PLAN.md` §6; that is a different interpretation.

**Files that matter.**
- `history.ts` — the explicit list of record documents published at `/samples/014-made-heavy/history`, and the rewriter; `history.test.mjs`, `history.css`; page at `src/pages/samples/014-made-heavy/history.astro`. Excluded on purpose: `sample.md`, this file, the two research exports.
- `sample.md` — the study's own account, reflection, falsification and the author-written verification record.
- `encounter/README.md` — what the two research exports are, inventory, missing evidence.
- `research/sources.md` — what the reports cite, what the study relies on, check status (nothing consulted directly yet).
- `readings/` — chosen, dropped and untranslated readings.
- `decisions/` — four reconstructed decisions and a list of choices with no recorded reasoning.
- `feedback/` — check re-runs; no user feedback exists.
- Implementation: `made-heavy.ts` (page wiring), `piers.ts`, `shadow.ts`, `panels.ts`, `pours.ts` (pure models), `made-heavy.test.mjs`, `made-heavy.css`; page at `src/pages/samples/014-made-heavy.astro`.

**Open decisions.**
- Whether to check the Ivaschenko and Heathcote sources before Phase C publishes any of this record (recommended; see `research/sources.md` → Next checks).
- Whether the social reading should get a second attempt or stay recorded as untranslated.
- Whether the rhetorical pier needs to be perceptible without the load-path toggle (`sample.md` says it is not).
- Whether to reword "after Vassiliev's observation that the image of support and the engineering need not agree" in the page prose and `sample.md`, since the source check found that step to be the report's inference (`feedback/2026-10-31-source-check.md`).

**Blockers.** None technical. Everything above waits on the author.

**Next useful action.** Author reads `sample.md`, then the history page, and says whether the reconstructed readings and decisions match what was actually meant. Corrections go in as linked additions, not edits to these notes; the page shows whatever the approved files say.
