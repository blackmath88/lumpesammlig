# Feedback loop

How an observation about a study or about the method becomes a change, and how it can be refused or reversed. The whole loop is Markdown notes; there is no tool, queue or dashboard, and none should be built until this file-based loop has proved too slow in practice.

```text
observation → interpretation → proposed revision → review → changed artefact → checked outcome
```

A note may stop at any step. An observation without a proposal is still worth recording. A proposal that is rejected stays in the record with its reason.

## Three tracks, three kinds of authority

Every proposed revision belongs to exactly one track. Mixing them is how a one-off reaction becomes a global rule.

| Track | What changes | Who may apply it | Where it is recorded |
| :-- | :-- | :-- | :-- |
| **Defect fix** | Code or copy that is wrong by the study's own stated intent: a broken anchor, an overflow, a test that no longer matches the model | An agent, within the task's scope, with the fix reported | The study's `feedback/` note, outcome filled in; the commit |
| **Study-specific change** | The study's reading, prose, rule, record or interaction, because of something seen in this study | The study's author, or an agent when the task authorises it; never generalised to other studies | The study's `feedback/`, `decisions/` or `readings/`; `working-state.md` if it changes the next action |
| **Candidate method lesson** | `AGENTS.md`, `docs/method/`, the review questions, the records guidance | Proposed by anyone, including an agent. Applied only after a human sets its status to accepted | `docs/method/lessons/`, one file per lesson |

An agent may write any note. An agent may not change the method files on the strength of its own lesson, however well supported. If a task says "update the method", it still goes through a lesson note so the reasoning and the counterexamples are kept.

## What each note carries

A **feedback note** (in a study's `feedback/`) identifies the version reviewed by commit, then keeps apart: observation (what was seen or run), interpretation (what it is taken to mean), proposed revision (what should change, and on which track), decision (who decided what, when), and outcome (what actually changed, with the commit, or that nothing did). A synthetic or self-review says so in its first lines and is never described as a user test. The shape is in [records.md](records.md).

A **lesson note** (in `lessons/`) carries, as plain `Key: value` lines near the top so the docs check can read them:

```text
Status: proposed | accepted | rejected | withdrawn | applied
Scope: where the lesson would apply (a study kind, a step of the practice, all studies)
Supporting examples: the notes or commits that show the problem
Counterexamples: cases where the lesson would be wrong or unnecessary
Approval: who accepted or rejected it and when, or "none yet"
```

then the lesson itself: the observation it comes from, the proposed change to which method file, and what would show it was a mistake. `applied` means the method file was changed; the lesson note then links the commit, and the method file links back to the lesson.

## Preferences have scope too

"I liked the paper-and-ink page" is an observation about one study. It becomes a preference only when written down with a scope, the evidence it rests on, and a date, for example in a lesson note or a decision note: *scope: studies without visual evidence of their own; evidence: 014 decision 002; date*. Without a scope a preference is not applied to the next study. The [study index](study-index.md) column "not a default" is the list of preferences that were explicitly refused generalisation.

## Reversal

Any accepted lesson can be reversed: a new note sets the status to rejected or withdrawn with the reason and the counterexample that caused it, and the method file is changed back or amended, linking the note. The original lesson note is not deleted or edited beyond its status and approval lines. The same holds for a study-specific change: the record keeps the earlier state, and the reversal is a dated addition.

## Two real traces from the pilot

Both are in `src/samples/014-made-heavy/feedback/`; neither is a user test, and both say so.

**Independent re-run of the recorded checks.** Observation: `astro check` prints two hints where the study note says zero diagnostics; everything else reproduces. Interpretation: a rounding in the record, not a defect in the study. Proposed revision: none to the study (track: study-specific), and a wording lesson (track: method, [lessons/002-state-diagnostic-counts-exactly.md](lessons/002-state-diagnostic-counts-exactly.md)). Decision: the agent left `sample.md` as written and added the note as the linked correction, within its task's scope. Outcome: note committed in `05a3eac`; the lesson awaits a human.

**Checking two cited sources.** Observation: the "image of support versus engineering" step is the report's inference, not Vassiliev's words as quoted by Ivaschenko. Interpretation: the rhetorical pier rests on a reasonable reading, not on the source it names. Proposed revision: reword the attribution in the study prose and `sample.md` (track: study-specific), and a method lesson on checking the load-bearing link of a source chain ([lessons/001-check-the-load-bearing-link.md](lessons/001-check-the-load-bearing-link.md)). Decision: **pending the author**; the agent did not change the study. Outcome: the record was updated in `58e3541`; the prose is unchanged until the author decides.

## A synthetic walkthrough, for the shape only

**This example is invented to show a rejection. No one made this observation, proposed this lesson or reviewed it. It is not a user test and it is not evidence about any study.**

1. *Observation (synthetic).* While reviewing study 012, a reviewer notes that the held record's neighbours expose their placement reason in small type that is hard to read at phone width.
2. *Interpretation (synthetic).* The reviewer reads this as a general problem: explanatory microcopy in the collection is set too small.
3. *Proposed revision (synthetic).* A lesson for `docs/method/study-practice.md`: "explanatory text next to a signature interaction must be at least 14 px". Track: candidate method lesson. Status: proposed.
4. *Review (synthetic).* The author checks the counterexamples: 009's stitch counter label and 014's aside text are 14 px and 11 px monospace by deliberate choice, and the 012 note is a defect in one study, not a pattern. The lesson would turn a local fix into a typographic rule the method deliberately does not have.
5. *Decision (synthetic).* Lesson rejected, with the reason and counterexamples written into its Approval and Counterexamples lines. The 012 observation is re-filed as a **defect fix** in that study's feedback note.
6. *Changed artefact (synthetic).* The 012 microcopy is enlarged in one commit; no method file changes.
7. *Checked outcome (synthetic).* The 012 page is re-checked at 390 px; the lesson note remains in `lessons/` as rejected, so the next reviewer who has the same thought finds the reasoning.

The walkthrough shows the two things the loop exists for: a reaction did not become a rule, and the refusal is itself recorded.
