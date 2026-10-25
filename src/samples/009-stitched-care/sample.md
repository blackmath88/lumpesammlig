# 009 — Stitched Care

## Source evidence

One photograph of an embroidered cover fitted to a curved clothes hanger, lying on a white sheet beside a paperback. The sheet and the book are incidental and play no part in the study.

Visible in the photograph:

- a dense, saturated turquoise field of slanted needlepoint stitches, each stitch individually legible;
- a central pink rose with a darker, slightly off-centre heart; small pale flowers with yellow centres; coral trumpet-shaped flowers; olive stems and leaves;
- brown curled motifs, one per arm, and a brown braided perimeter that follows the hanger's outline;
- a twisted metal hook rising from the centre of the convex side;
- a bent, shaped body with rounded ends, wider at the centre and tapering towards the tips;
- the same stitch structure under the motifs and under the field: the flowers are colour decisions on the grid, not applied shapes.

Not visible, and therefore not asserted: maker, age, origin, sentimental history, the exact stitch technique, the canvas gauge, the material of the support beneath the cover, or the back of the object.

The photograph is kept as evidence at `public/samples/009-stitched-care/source.jpg` (downscaled, metadata stripped). It is never used as a texture.

## Three readings

1. **Disproportionate care.** A hanger is a hidden, humble support. This one received thousands of deliberate stitches. Attention exceeds function; the excess is the point.
2. **A regular grid carries an organic image.** Rose, leaves and curls are the same slanted stitches in other colours. Softness emerges from many small, discrete decisions on one rigid structure.
3. **Ornament follows a working boundary.** The pattern does not occupy a convenient rectangle. Its border is the hanger's outline, and the motifs are composed along the curve of the arms.

## Chosen proposition

**Care becomes visible as accumulated stitches on one shaped grid.**

The study joins readings 1 and 2 and keeps reading 3 as a constraint. The whole hanger and the close detail are one model seen at two distances. A visitor can scrub or play the work as a count of decisions. This reveal is an exploratory view of accumulated effort, not a reconstruction of how this particular object was made; the ordering shown (motifs, then field in a sweep from tip to tip, then the border) is the study's own.

## Grounding

Source:
- `public/samples/009-stitched-care/source.jpg`

Reading:
- readings 1 + 2 above, constrained by 3

Transformation:
- an object → a count of discrete decisions on a shaped grid, legible at two scales

What this experiment tests:
- whether a regular, deterministic stitch vocabulary can carry both the field and the organic motifs convincingly, and whether revealing the count makes care visible rather than merely decorative.

## Implementation

- `pattern.ts` — one deterministic grid (236 × 50 cells). The silhouette is a parametric arch with rounded ends; cells inside it are stitches. Motifs are painted as colour indices with small stamping primitives (rose banding, leaves, stems, trumpet, curl, pale flower). The perimeter band is edging. The reveal order is derived once from the same data.
- `renderer.ts` — Canvas 2D. One routine draws every stitch: contact shadow, rounded directional thread body, a matte highlight on the lit side, and a few darker fibre strands when the stitch is large enough on screen. Variation is hashed from the cell index, so it is deterministic. The support (padded hanger body, canvas mesh, twisted hook) is drawn beneath. Drawing is incremental while stitches accumulate and restarts when the count goes backwards. Device pixel ratio is capped at 2 and the backing store at 2200 px wide.
- `stitched-care.ts` — wires the labelled range control, play/pause, "Show finished" and the whole/detail switch; honours `prefers-reduced-motion` by stepping coarsely instead of per frame; stops on page hide and disposes listeners, observers and animation frames.
- No React, no WebGL, no shared textile engine, no DOM element per stitch.

## Technical boundary

- Astro route + vanilla TypeScript + Canvas 2D.
- Finished state is the default; nothing autoplays.
- Static fallback: canvas fallback text, an inline SVG silhouette when a 2D context is unavailable, and a `<noscript>` note.
- The collection preview renders one static frame of the same model's detail view.

## Reflection

**Revealed.** Once every motif had to be stated as colour choices on cells, the rose stopped being a shape and became a banding rule around an off-centre heart. The grid did more of the organic work than expected; the stitch body and its contact shadow did the rest. The mid-reveal state, where motifs sit on bare canvas before the field arrives, turned out to be the most informative view of "care".

**Simplified.** One stitch slant everywhere; one braid rhythm for the edge; a smooth arch instead of the slight notch the photograph suggests at the hook; one light direction; both faces of the cover collapsed into one.

**Speculative.** The reveal order, the total stitch count, the canvas gauge, the colour of the support beneath the cover and the hook's exact curve are the study's assumptions. The photograph confirms none of them.
