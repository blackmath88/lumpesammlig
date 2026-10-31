# Study practice

How a study moves from an encounter to an executable interface proposition. The sequence encounter ↔ research ↔ readings ↔ propositions ↔ prototype ↔ reflection is a direction of attention; studies loop back, skip, and stop at different points. What follows are the qualities each movement should have, not steps to tick.

## 1. Investigate the source before proposing UI

Read the object, material, mechanism, remembered interface or text on its own terms.

- What exactly was encountered, and under what circumstances? What is only a photograph, and what is the encounter around it?
- In which domain does it normally belong, and what does it do there?
- What are its nearest peers, and what distinguishes it from them? *Why this and not that* is the question most likely to produce something non-generic.
- Which relationships, constraints, forces or tensions make it itself? Which qualities look accidental, which structural?
- What became visible only through conversation, comparison or research?

Outside research is welcome and often necessary; see [records.md](records.md) for keeping it apart from primary evidence. Keep four kinds of statement distinguishable at all times: **primary evidence** (what was observed or supplied), **secondary research** (what sources say, cited), **interpretation** (what we currently think matters) and **invention** (what the study adds). Where evidence is missing, say so; do not fill the gap with plausible history.

## 2. Diverge, then select

Explore genuinely different readings when the source supports them. Say what each foregrounds and what it leaves out. Then select a coherent direction rather than combining every idea. Rejected readings remain in the record; they are inventory, not waste.

Do not manufacture a fixed number of alternatives, and do not reopen a direction the author has explicitly chosen without a reason that comes from the evidence.

## 3. Translate a relation, not an appearance

A weak translation preserves what the thing looks like. A strong one preserves a behaviour, relation, tension or organising principle, and may let the source disappear visually. Before building, write down compactly, in whatever form suits the study:

- which specific quality of the encounter motivates the move;
- what happens when that quality is moved into interaction;
- what the visitor can actually do, and what changes as a result;
- what the executable experiment would let us learn.

Resist two opposite failures: stopping at an abstract analogy ("the interface is like a wall"), and turning every source into a research-management application because that is what agents find easy to build.

## 4. Reach concrete interface form

A proposition is not finished until it names:

- the **first screen**: what a visitor sees before doing anything;
- the **composition**: how the page is organised and what is primary;
- the **components**: the controls and surfaces involved, preferably ordinary accessible ones;
- the **action**: what the visitor does;
- the **state change** and its **visible consequence**: what is different afterwards, and how the visitor knows.

If the proposition cannot say these things, it is still a reading. If it can say them but any ten unrelated sources could produce the same screen, it is not yet specific.

## 5. Prototype the signature interaction first

Build the one interaction that carries the distinction before broadening the system. Use the smallest technical system that can test it: plain HTML and CSS, SVG, Canvas, WebGL, sound, a state machine, React, or none of these. Astro is the shell; everything else is a local choice. Keep a pure, testable model of the state where behaviour matters, so the claim can be checked without the page.

Responsive layout, keyboard operation, reduced-motion behaviour and a script-off fallback are part of the design, not polish added after acceptance. Let the explanatory prose describe what the visitor is experiencing on this page rather than what the source looks like in the world.

## 6. Material and perceptual studies

A faithful rendering can be a valuable study. Name it as such. For such work the questions change: which observable qualities produce the material impression, does the impression survive at interface size, and can it coexist with legibility, clear states and responsive interaction? Do not attach a behavioural story to justify it.

## 7. Reflect, and let reflection revise the reading

After the executable version exists, record what it revealed, which reading weakened, what remains untranslated, what fell back into a familiar pattern, and whether another experiment should branch from the same encounter. Reflection may revise the interpretation; it does not rewrite the evidence.

## 8. Research through the library

When a study needs outside technique, run the loop explicitly and record it in the study's note: look up Interface Atlas (`blackmath88/interface-lib`, catalogue in `catalog/entries.json`; note the commit consulted) → research a bounded number of primary sources → make a small technical trial → build → reflect → return verified, useful knowledge to the Atlas on a branch and pull request, following its schema and evidence rules. Link stable Atlas IDs and canonical URLs. Do not pad the catalogue with generic links or invent licence, compatibility or audit claims.
