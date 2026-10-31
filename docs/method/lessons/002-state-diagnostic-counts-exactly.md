# 002 — State diagnostic counts exactly

Status: proposed
Scope: verification records in study notes and handoffs, wherever a tool prints counts
Supporting examples: `src/samples/014-made-heavy/feedback/2026-10-31-independent-check-rerun.md`, where "zero diagnostics across 83 files" re-ran as 0 errors, 0 warnings, 2 hints across 84 files
Counterexamples: `docs/012-013-verification.md` already writes "57 files, zero errors, warnings or hints"; the discrepancy in 014 is small and concerns hints in an unrelated script, so the cost of the existing wording was low
Approval: none yet

## Observation

A later session re-ran the recorded checks and found the record's summary ("zero diagnostics") differed from the tool's output (two hints). Whether the hints existed on the day cannot be told from the record. The difference is harmless here, but a verification sentence that rounds is a verification sentence a reader cannot re-run against.

## Proposed change

Add one line to the "Verification honesty" section of [AGENTS.md](../../../AGENTS.md): *Quote counts as the tool prints them (errors, warnings, hints, files, tests), not as a summary word.*

## What would show it was a mistake

If records become lists of numbers that no one reads, the line should be softened to apply only to the counts a later reader would need to reproduce the check.
