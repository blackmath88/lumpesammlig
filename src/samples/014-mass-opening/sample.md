# 014 — Mass / Opening

A UI study. The second brutalism entry for the collection; the first is being developed separately and this one does not depend on it.

## Encounter
The source is not a building and not a photograph. It is a two-part conversation held with a research assistant before this study: first a vocabulary of brutalism-informed formal operations (mass, recess, repetition, projection, section, support), then a redirection: "let's be more visual and UI/UX, not over-conceptual; what features and components would amaze people and have the resemblance of brutalism." Both documents are preserved as the encounter evidence; their claims about architecture are the assistant's summaries, not verified history, and the study treats them as vocabulary rather than fact.

What drew attention was one sentence from the second document: *you do not leave the archive to read; the archive makes space for reading.* Everything else in the brief is a consequence of that.

## Situated reading
In the gathered vocabulary, mass is never a property of one object. A volume reads as heavy because of what is around it: an empty interval, narrow supports, a deep opening in a thick surface, a row of equal units, an element projecting from a visible anchor. The nearest peers of this vocabulary in interface design are the expanding card, the modal, the lightbox and the side drawer. All of them add a layer. The distinction worth keeping is that the architectural operations change the surroundings instead.

## Competing readings
- **Costume:** concrete textures, oversized type, hazard stripes. Rejected: it produces a recognisable look while leaving the interface conventional. The brief itself rejects it.
- **Suspended archive:** a huge panel repositioned by a small rail. Interesting, but its memorable quality is scale ratio, and it collapses into a carousel on a phone.
- **Accommodation:** opening one part makes the whole make room, with the neighbours still present and named. Chosen. It is the only reading whose behaviour survives the removal of all colour and texture.

## The move
- *Motivating quality:* mass is relational, and an opening reorganises its surroundings rather than covering them.
- *Moved into interaction:* a façade of six bays in two rows with shared edges and deliberately unequal widths (5 / 4 / 3 and 3 / 4 / 5). Opening a bay takes width from its own row; the two neighbours narrow to piers that keep their index and title; the other row is untouched; closing gives the width back.
- *What the visitor can do:* open, switch directly between bays, close, and operate one bounded demonstration per bay: change surrounding space around a fixed slab; enlarge an aperture in a fixed frame; widen one of seven equal units; extend an authored comparison from an anchor; switch one object between face and section; select which of three supports holds up which passage of the study's own summary.
- *What the experiment should teach:* whether accommodation is legible as a distinct behaviour (not an accordion with better proportions), and whether the pier is enough to keep the whole present while one part is read.

## Research through the library
Interface Atlas (blackmath88/interface-lib) was consulted at commit `43cbc51`. Its catalogue holds 21 entries, none covering disclosure semantics, grid track interpolation or reduced-motion handling, so nothing was imported. Primary sources actually relied on: the WAI-ARIA Authoring Practices disclosure pattern for the trigger/panel contract; MDN on `grid-template-columns` (track lists interpolate as animation targets in current engines) and on `prefers-reduced-motion`. The brief's View Transition sources were read and set aside: a state change plus interpolated tracks was enough, and nothing depends on the API. A feedback entry to the Atlas on the "animate the track list, not the boxes" technique is a sensible follow-up, not done here.

## Implementation
`facade.ts` is a pure state module: active bay, pier rule, per-row column templates and six small demo states. `facade.test.mjs` checks that an open bay takes space only from its own row, that closed rows always sum to twelve parts, that piers are only ever neighbours of the open bay, that switching is direct, and that demo state survives open, switch and close. `facade-ui.ts` renders that state onto native buttons with `aria-expanded`, `hidden` panels and `inert` for retracted or inactive surfaces. Copy and fixtures live in `content.ts`. No React, no shared engine, no images.

Responsive rule, chosen by testing where labels stopped fitting rather than by device width: above about 1040 px the rows keep their proportions and piers are vertical; between 641 and 1040 px a row with an open bay collapses to one column and its neighbours become full-width named strips; below that everything stacks and the projection extends downward. Transitions were added after instant-state layouts worked, and are removed under reduced motion.

## Reflection · after the executable version, 2026-10-31
**Revealed.** The piers carry the idea, not the open bay. While the neighbours stay dark, narrow and named, the composition reads as one surface making room; the moment they lose their titles it is an accordion. The 03 Repetition demo turned out to be the façade's own rule at a smaller scale, which makes it the clearest explanation on the page and slightly redundant as a separate operation.

The recess needed two trials. An aperture that grows from the centre of the card cuts through the middle of a paragraph at its narrowest and reads as broken, not selective. Growing the opening sideways from the centre but downward from a fixed sill keeps the card's head in view at every level and fits the whole card at the widest; the card holds one position in stage coordinates throughout, which was measured rather than assumed.

**Weakened.** "Mass" as a demonstrable operation. The slab-and-interval toggle is honest (the slab never changes size) but it reads as a layout preference rather than weight, and it is the demo least likely to be described correctly afterwards. The signature opening does more for mass than bay 01 does.

**Untranslated.** Section, depth and material are still mostly proportion and colour. There is no section through the page itself; the face/section switch applies to one small object. Nothing here establishes that visitors can describe the formal relationship after interacting, which the brief named as the real acceptance test. That review has not been run.

**Falsification check.** Remove every colour and the behaviour remains: unequal widths, a row that reallocates, piers that keep names, an aperture that grows inside a fixed frame, one unit widening against six. Ten unrelated sources would not produce the pier rule by swapping labels; most would produce a modal. The permission for the move is the brief's own refusal of overlay in favour of a composition that accommodates.

**Limitations and acceptance.** Build and checks pass; keyboard, reduced-motion and three viewport widths were inspected in a headless browser. Human acceptance of the transformation, and of whether the study "resembles brutalism" to anyone else, is open.
