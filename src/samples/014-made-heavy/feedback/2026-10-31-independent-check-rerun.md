# 2026-10-31 — Independent re-run of the recorded checks

**Version reviewed.** Study 014 as committed in `2756f40` and merged in `5eed2a8`, unchanged in this session; the record files added beside it are not part of the page. Reviewer: a later coding-agent session adding the research record, not the author and not a visitor. Kind: automated checks only. **This is not a user test and not a perceptual review.**

## Observation

What `sample.md` ("Verification record · 2026-10-31") reports, against what was run now in a fresh clone (Node 22.23.4, `npm ci`):

| Recorded in sample.md | Re-run result |
| :-- | :-- |
| `astro check`, zero diagnostics across 83 files | 0 errors, 0 warnings, 2 hints across 84 files. The 84th file is the new `scripts/check-docs.mjs`. The two hints are in `scripts/check-study-dom.mjs` (unchanged; `process` not found by the type checker) |
| Five model tests for 014 | `npm run test:studies`: 12 tests pass across 012, 013 and 014; the 014 tests are five of them |
| `npm run build`, 14 pages, 14 verified stylesheets | 14 pages built; `check:assets` verified 14 HTML pages, 14 references, 14 CSS files under `/lumpesammlig/` |
| 52 jsdom assertions across 012, 013, 014 | `scripts/check-study-dom.mjs` with jsdom 27.4.0 installed outside the repository: 52 checks passed |
| Headless Chromium pass at 1280 and 390 px, keyboard, reduced motion | **Not re-run.** No browser inspection was done in this session |
| Human perceptual review | Has not happened; still absent |

Also observed: `npm run test:assets` passes 7 tests. No file under `dist/` contains text from the record folders (`retrospective reconstruction`, `working-state`, `research/sources`, `decisions/00` were searched); no Markdown is emitted to `dist/`.

## Interpretation

The recorded automated results are reproducible, with one small discrepancy: "zero diagnostics" is not what `astro check` prints now. The two hints are in a pre-existing script, are hints rather than errors, and do not concern the study. Whether the hint count differed on 2026-10-31 in the author's environment or was rounded down in the record cannot be told from here. The browser-level claims in the record remain the implementing session's report.

## Proposed change

None to the study. For the record: the verification sentence in `sample.md` would be more exact as "0 errors, 0 warnings". It is left as written; this note is the linked correction.

## Outcome

Record added; no code changed. The browser pass and perceptual review remain open in `../working-state.md`.
