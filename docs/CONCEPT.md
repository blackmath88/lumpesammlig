# Conceptual Spine

## Lumpesammlig is a practice of semantic transformation

Lumpesammlig does not collect visual styles.

It collects **encounters**: objects, materials, interfaces, behaviours, rituals, mechanisms, fragments of language, remembered software, conversations, places, mistakes, habits and other things that become interesting because something about their occurrence resists the obvious category.

The work is not to copy their appearance into a user interface.

The work is to understand what was encountered closely enough that it can become a **new proposition about interaction**.

A useful shorthand is:

> encounter → situated reading → distinction → transformation → experiment

This is a direction of attention, not a fixed process.

There is deliberately no guarantee that every encounter produces the same analytical entities, the same number of intermediate steps, or the same type of interface output.

---

## 1. The encounter is multimodal

A photograph is evidence, but it is not the encounter.

An encounter can include:

- photographs;
- video or sound;
- the circumstances in which something appeared;
- remembered associations;
- conversation about what felt strange or important;
- comparisons that arose during discussion;
- sketches;
- links or references;
- later corrections;
- contradictions;
- physical measurements;
- implementation experiments.

The conversation can matter as much as the image because perception is already interpretive. A photo may show a washcloth; the conversation may reveal that the interesting thing is not its colour or weave but distributed tension, permeability, repair, or the way many weak loops form a resilient surface.

The repository should therefore preserve **encounter context**, not reduce the source to a canonical picture.

---

## 2. Read the source before translating it

The first question is not:

> What UI could this become?

The first questions are closer to:

- What exactly did we encounter?
- In what domain does it normally belong?
- What function does it perform there?
- Under what conditions does it occur?
- What are its nearest peers?
- What distinguishes it from those peers?
- What behaviours, tensions, constraints or affordances make it itself?
- Which of those qualities seem accidental, and which seem structural?
- What became visible only through the conversation around it?

These are **lenses**, not required fields.

Some encounters may need a strong material analysis. Others may need historical context, social function, spatial behaviour, temporal rhythm, symbolic meaning, procedural logic or a comparison with neighbouring artefacts.

The reading should be allowed to discover its own useful vocabulary.

---

## 3. Distinction matters more than category

The goal is not to classify the encounter correctly.

The goal is to discover what is **specific enough to generate a non-generic transformation**.

A useful question is:

> Why this thing and not its nearest peer?

For WordArt, the interesting distinction may not be gradients or bevels. It may be that expressive display typography existed as a directly manipulable object inside otherwise utilitarian office software.

For a knitted cloth, the interesting distinction may not be textile texture. It may be that local tension propagates through a loosely coupled network while holes remain structural rather than defective.

The more specific the distinction, the less likely the result is to collapse into aesthetic imitation.

---

## 4. Transformation is semantic, not stylistic

A weak translation preserves appearance:

> knitted thing → knitted website

A stronger transformation preserves a relation, behaviour, tension or organising principle:

> loosely coupled loops distributing tension → interface whose neighbouring elements deform and redistribute load

The source may disappear visually while remaining structurally present.

Lumpesammlig values transformations that are:

- traceable to something specific in the encounter;
- surprising without being arbitrary;
- capable of changing interaction, not only decoration;
- different enough from existing interface conventions to teach us something;
- allowed to fail.

---

## 5. The model is here for Einbildungskraft

The project uses language models precisely where deterministic systems are weakest: **semantic transformation across domains**.

“Einbildungskraft” is used here as a project metaphor: the capacity to form a new configuration from things that are not already identical.

This is not a claim about AGI.

It is a design decision.

Deterministic software is excellent at:

- preserving files;
- storing provenance;
- maintaining identifiers;
- rendering known representations;
- validating technical constraints;
- recording versions;
- testing accessibility;
- checking builds;
- reproducing a chosen implementation.

It is poor at deciding that a washcloth's holes resemble productive absence, or that WordArt's real contribution was visible possibility rather than decorative type.

That interpretive jump is where a non-deterministic model is useful.

The model should not merely fill a schema. It should be invited to:

- notice;
- compare;
- reframe;
- propose competing readings;
- find distinctions;
- generate analogies;
- cross domains;
- reject shallow translations;
- mutate the implementation vocabulary;
- surprise the author.

The system should **plan for creativity without pretending creativity is deterministic**.

---

## 6. Structured enough to remember, open enough to think

Lumpesammlig needs architecture, but not a funnel.

The repository should distinguish between:

### Evidence

What was actually encountered.

This should be preserved faithfully and can be structured deterministically.

### Reading

What we currently think is interesting about it.

This is provisional, revisable and may contain competing interpretations.

### Transformation

What happens when one or more readings are moved into another domain.

This is explicitly generative and should not be forced into a fixed taxonomy.

### Experiment

A concrete implementation that tests a transformation.

It is not “the answer”. It is one executable interpretation.

### Reflection

What the implementation revealed that the initial reading did not.

This can modify the encounter's interpretation and generate further experiments.

The relationship is therefore recursive, not linear.

```text
            ┌──────────── reflection ◀────────────┐
            │                                      │
encounter ──┴─▶ reading ⇢ transformation ⇢ experiment
   ▲              │            │              │
   │              └──── competing readings ───┘
   └──────────── new evidence / conversation
```

---

## 7. Do not normalize the specimens

Repeated structure is useful only where repetition is genuinely the same problem.

Do not force every sample to have:

- the same headings;
- the same number of “principles”;
- the same UI mutation cards;
- the same hero;
- the same renderer;
- the same metadata;
- the same visual explanation;
- the same path from evidence to output.

A sample may be primarily:

- a material reconstruction;
- an interaction;
- a sound study;
- a spatial composition;
- an animation;
- a tiny tool;
- a game;
- an essay with one executable fragment;
- several competing prototypes;
- something not yet represented in the repository.

The architecture should make difference cheap.

---

## 8. A good experiment remains accountable to its source

Creative transformation does not mean arbitrary generation.

Each experiment should be able to answer:

> What in the encounter gave us permission to make this move?

That trace can be prose, annotations, source fragments, links to conversation excerpts, or an explicit reflection.

The point is not to prove that a transformation is objectively correct.

The point is to keep the experiment **grounded enough that its weirdness has a reason**.

---

## 9. Anti-goals

Lumpesammlig is not:

- a style-transfer gallery;
- an AI component generator;
- a prompt-to-website pipeline;
- a fixed design-thinking canvas;
- a taxonomy project;
- a dataset whose rows must share one schema;
- a design system;
- a mechanism for producing the same page in different colours;
- a claim that every observation must become useful.

Some encounters should remain unresolved.

Some transformations should contradict one another.

Some experiments should be beautiful failures.

That is part of the collection.
