# Architecture for Planned Non-Determinism

## Objective

Build a system that is deterministic about **evidence, provenance and execution**, while deliberately non-deterministic about **interpretation and semantic transformation**.

The architecture should support creative work without turning creativity into a form wizard.

---

## 1. The unit is an encounter, not a row

Each specimen begins as an encounter directory.

A practical shape is:

```text
src/samples/008-wordart/
  encounter/
    README.md
    media/
    conversation/
    references/
  readings/
  experiments/
  reflection.md
```

This is a suggested topology, not a required per-sample contract.

A simple encounter may use only `sample.md`.
A rich encounter may preserve many source artefacts.

The important architectural boundary is conceptual:

```text
evidence  !=  interpretation  !=  experiment
```

Do not overwrite source evidence with a later interpretation.

---

## 2. Preserve chat as first-class evidence

A conversation can contain perceptual information that an image cannot.

For encounters developed through dialogue, preserve useful excerpts or a compact offload alongside the image rather than reducing the encounter to a visual asset.

A conversation record can contain:

```text
- what drew attention first;
- what changed after looking longer;
- comparisons that emerged;
- rejected interpretations;
- contextual facts;
- phrases worth preserving;
- unresolved questions.
```

Do not require a transcript to be converted into fixed fields before it can participate in later reasoning.

Raw or lightly edited language is valuable because later models may notice something the first reading missed.

---

## 3. Minimal deterministic substrate

The deterministic layer should do only what benefits from determinism.

### A. Evidence store

Responsibilities:

- file identity;
- media references;
- timestamps when useful;
- source/provenance;
- immutable originals where practical;
- links between derived material and source material.

### B. Experiment registry

The collection UI may keep lightweight catalogue metadata:

```ts
type SampleIndex = {
  id: string;
  title: string;
  route: string;
  status: 'study' | 'live';
}
```

Do not make the catalogue schema carry the interpretation.

### C. Build and quality layer

Responsibilities:

- Astro build;
- type checking;
- accessibility checks;
- asset validation;
- broken-link checks;
- performance boundaries where necessary.

### D. Provenance links

An experiment should be able to point back to the evidence and reading that motivated it.

This may be lightweight Markdown links. It does not need a graph database unless the collection proves that need.

---

## 4. The semantic workspace

Between encounter and implementation sits a model-assisted workspace.

This is not a pipeline stage with a canonical output schema.

It is a **thinking surface**.

The model receives some subset of:

```text
encounter evidence
+ prior conversation
+ current readings
+ relevant peer examples
+ existing experiments
+ explicit author intent
```

and can produce any of:

- competing interpretations;
- domain analysis;
- peer comparisons;
- distinctions;
- analogies;
- invariants;
- provocations;
- UI hypotheses;
- counterexamples;
- implementation sketches;
- questions that change the reading;
- proposals to collect more evidence.

The output format should follow the task.

Markdown is usually preferable to JSON here because premature schemas narrow the semantic search space.

Use JSON only when a later deterministic tool genuinely needs machine-readable structure.

---

## 5. Divergence before convergence

To avoid “same entity, different colour”, model work should often be explicitly divergent before implementation.

A useful invocation pattern is:

```text
1. Read the encounter closely.
2. Produce several substantially different readings.
3. Identify what each reading foregrounds and what it ignores.
4. Generate transformations from different readings, not variations of one design.
5. Reject transformations that merely imitate surface appearance.
6. Select one or more propositions worth making executable.
```

This is guidance for reasoning, not a workflow engine.

The number and shape of readings should vary by encounter.

---

## 6. Preserve competing interpretations

Do not collapse ambiguity too early.

Example:

```text
readings/
  01-visible-possibility.md
  02-expressive-exception.md
  03-amateur-agency.md
```

For WordArt these could lead to three unrelated experiments:

- a visible possibility surface;
- a sober application containing a bounded expressive mode;
- an interface designed for proud amateur authorship.

Only one may become the first implementation.

The others remain useful intellectual inventory.

---

## 7. Models should mutate the implementation language

The architecture must not predetermine the technical form.

The model can recommend that an encounter wants:

- SVG;
- plain HTML/CSS;
- Canvas;
- WebGL;
- sound;
- a state machine;
- a physics model;
- procedural typography;
- a tiny game;
- no JavaScript;
- a physical print artifact;
- several simultaneous prototypes.

The rule remains:

> use the smallest technical system that can test the actual transformation.

Do not establish a universal `TransformationEngine`, `SampleRenderer` or `MutationCard` abstraction.

---

## 8. A lightweight provenance pattern

Experiments can carry a small frontmatter-like note:

```md
## Grounding

Source:
- encounter/photo-01.jpg
- encounter/conversation/2026-09-25.md

Reading:
- readings/01-visible-possibility.md

Transformation:
Visible capability should become part of the interaction surface rather than hidden behind a generative command.

What this experiment tests:
Whether presets + direct manipulation teach a parameter space better than an empty prompt.
```

This is enough to make the semantic jump inspectable without pretending it was deterministic.

---

## 9. Reflection closes the loop

After implementation, ask the model and the human:

- What did the executable version reveal?
- Which original reading became weaker?
- What unexpected behaviour appeared?
- Did the implementation accidentally fall back into a familiar UI pattern?
- Which aspects of the source remain untranslated?
- Did a new distinction emerge?
- Should another experiment branch from the same encounter?

Reflection may modify the reading but should not rewrite the original evidence.

---

## 10. Suggested repository evolution

Near term:

```text
docs/
  CONCEPT.md
  ARCHITECTURE.md

src/samples/<sample>/
  sample.md
  ...implementation...
```

For richer future encounters, optionally grow into:

```text
src/samples/<sample>/
  encounter/
  readings/
  experiments/
  reflection.md
```

Do not migrate old samples just to satisfy a new folder convention.

Let a future specimen prove that the additional structure is useful before standardising it.

---

## 11. Human/model division of labour

### Human

- encounters the thing;
- decides what remains interesting;
- contributes embodied and contextual knowledge;
- challenges generic interpretations;
- chooses which transformations deserve time;
- judges whether an experiment feels alive or derivative.

### Model

- expands the field of possible readings;
- connects distant domains;
- compares peers;
- makes semantic leaps;
- creates alternatives quickly;
- attacks shallow analogies;
- proposes transformations;
- helps implement selected experiments.

### Deterministic software

- preserves;
- links;
- validates;
- builds;
- tests;
- renders;
- records.

This division is intentional.

---

## 12. Design test

Before accepting an experiment, ask:

> If I removed the colours, textures and references to the source, would something in the behaviour, structure or interaction still carry the encounter?

If the answer is no, the work may still be visually interesting, but it is probably style transfer rather than a Lumpesammlig transformation.

A second test:

> Could this exact experiment have been produced from ten unrelated inputs by swapping labels and colours?

If yes, the semantic transformation is not specific enough yet.
