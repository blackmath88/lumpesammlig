# Working in Lumpesammlig

## Start with the repository's philosophy

Before adding or substantially changing a sample, read:
- [Conceptual Spine](docs/CONCEPT.md)
- [Architecture for Planned Non-Determinism](docs/ARCHITECTURE.md)
- [README](README.md)
- The sample's source evidence, conversation, readings and reflections, where available.

These documents are the conceptual source of truth. This file makes their implications actionable; it does not replace them.

Lumpesammlig collects encounters and explores semantic transformations:
**encounter → situated reading → distinction → transformation → experiment → reflection.**
This is a direction of attention, not a mandatory funnel or page template.

## Understand before choosing the UI

Read the object, material, behaviour or remembered interface on its own terms. Ask what it does in its original domain, what distinguishes it from its nearest peers, and which relationships, constraints or tensions matter. Colour and texture may matter, but are not the whole encounter.

Preserve photographs and relevant conversation as evidence. Separate what is observed, what the user supplied, and what you infer. Never invent provenance, intent, history or physical behaviour. Missing evidence should remain visibly missing.

For a new transformation, explore genuinely different readings before settling on an implementation. Explain briefly what each foregrounds and leaves out. Do not manufacture a fixed number of alternatives or reopen an explicitly chosen direction without reason.

## Make the semantic move explicit

Before substantial implementation, record in sample-local prose:
- What specific quality of the encounter motivates the move?
- What happens when that quality is moved into the proposed interaction?
- What can the visitor actually do, and what changes as a result?
- What would the executable experiment help us learn?

Keep this compact and in a form suited to the sample; these are reasoning questions, not required UI headings or schema fields. Proceed within the user's agreed scope without adding a routine approval gate.

A faithful rendering can be a valuable material study. Name it as such. A recreation with zoom, lighting or a reveal slider does not automatically establish a new interaction proposition. If the task calls for an artifact-to-UI transformation, make the behaviour or organising principle explicit rather than claiming visual fidelity completes it.

Examples are provocations, not recipes:
- Loosely coupled loops distributing tension might become neighbouring elements that redistribute load.
- WordArt might suggest visible possibilities and direct expressive manipulation inside a utilitarian tool.
- An embroidered hanger might prompt readings of fitted support, accumulated contributions or care in everyday use. None is proven by its photograph; do not prescribe a stitched progress bar for every textile.

The source may disappear visually while remaining structurally present.

## Challenge the experiment

Before calling an interaction transformation complete, ask:
1. If colours, textures and references to the source disappeared, would its behaviour, structure or interaction still carry something specific from the encounter?
2. Could ten unrelated sources produce this exact experiment just by swapping labels and colours?
3. What in the encounter gives us permission to make this move?

If the first answer is no or the second is yes, revisit the transformation or honestly describe the result as a material/visual study. Do not attach an abstract story after the fact to justify a generic interface.

These questions test behavioural transformations. They must not disqualify an explicitly requested material or perceptual experiment, where appearance and tactile suggestion are the subject. For such a study ask instead, as context-sensitive questions rather than a new template:
- Which observable qualities produce the intended material impression?
- Does that impression survive at actual UI size?
- Can it coexist with legibility, clear states and responsive interaction?

Material reconstructions, essays, unresolved encounters and beautiful failures remain legitimate collection entries. Do not force every encounter into a useful UI component.

## Implement the proposition, not a universal template

Choose the smallest technical system that can test the idea. Astro is the exhibition shell; React, SVG, Canvas, WebGL, sound or plain HTML are local choices, not compulsory stages.

Keep evidence, interpretation and experiment distinguishable. Preserve competing readings and source context without imposing new directories on every sample.

Maintain a coherent collection shell while allowing individual samples their own form. Do not require identical heroes, headings, mutation cards, renderers or numbers of principles. Do not extract a shared transformation engine or renderer without demonstrated repetition.

For implementation changes, run the repository's applicable checks (currently `npm run check` and `npm run build`), inspect actual browser output, and verify relevant keyboard, mobile, reduced-motion and fallback behaviour. Report what was actually checked; documentation-only edits do not need a runtime build.

## Research through the library

When a sample needs outside technique, run the loop explicitly and record it in the sample's note: look up Interface Atlas (blackmath88/interface-lib, catalogue in `catalog/entries.json`; note the commit consulted) → research a bounded number of primary sources → make a small technical trial → build the experiment → reflect → feed verified, useful knowledge back to the Atlas on a branch and PR, following its schema and evidence rules. Link stable Atlas IDs and canonical URLs. Do not pad the catalogue with generic links or invent licence, compatibility or audit claims.

## Reflect and hand off

Record what the executable version revealed, what weakened the initial reading, what remains untranslated, and any unexpected behaviour. Reflection can revise the reading without rewriting original evidence.

In the handoff, explain the source-to-interaction move and distinguish implementation, verification and human acceptance. Include remaining limitations. Do not equate build success with a successful transformation.

Inspect current repository work before editing. Respect existing ownership and scope. For governed work, follow the current [Weavr operating contract](https://github.com/blackmath88/weavr/blob/main/docs/CHATGPT-OPERATING-CONTRACT.md); a plan does not itself authorize mission dispatch, scope expansion, merge or deployment.
