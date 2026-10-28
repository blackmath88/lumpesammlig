# 011 — Thread Icons

## Intent (recorded 2026-10-25)

The hanger (009) was the impulse; the pixel-to-stitch comparison (010) was useful but its grid and traditional motifs constrained the question. This sample asks:

> Can familiar digital icons feel made from thread while remaining clear, contemporary and useful at normal UI sizes?

The key shift is construction: **threads follow the shape** rather than occupying a fixed diagonal grid. The art direction is a contemporary patch for a digital world, with a subtle anime/streetwear-patch influence carried by proportion, colour blocking and small expressive details, not by faces.

This is a material study with a usable specimen. The earlier studies stay as evidence of the exploration and are not changed.

## What the brief described, and what was translated

The user's references (not available to this runtime; the brief described them) showed threads fanning within shapes, curved lines built from directional stitches, raised outlines, overlapping colour regions, and small embroidered interventions on an existing surface. Those construction qualities were translated; no reference artwork was reproduced and no surrounding interface was imported.

## References consulted (Interface Atlas at `43cbc51`, plus the two entries proposed in interface-lib PR #4)

The Atlas had nothing on SVG stitch construction. Four primary pages were read on 2026-10-25:

1. **Satin stitch** (Wikipedia). Flat parallel stitches covering a region; long-and-short and brick layouts for shading; padded satin for body; machine satin for outlining appliqué. → The fill is parallel satin at a chosen angle per region; the cord is a padded outline.
2. **Embroidered patch** (Wikipedia). Backing cut to shape, serge or satin borders, chain/satin/hemming stitches, multi-colour machine work. → A cord around every silhouette; two or three colour regions; no fabric square.
3. **SVG `<clipPath>`** (MDN). Clips rendering, not geometry; pointer events ignore clipped areas. → Considered, then not used: stitches are clipped geometrically (each stitch line intersected with the region polygon) so nothing is drawn outside a boundary and no clip elements are needed.
4. **SVG `stroke-dasharray`** (MDN). Dash and gap lengths; round caps extend dashes. → The cord's wrapped highlight is a dashed, round-capped stroke over the cord body.

## Rendering decision

**Static SVG generated at build time**, inlined once as a sprite of `<symbol>`s and placed with `<use>`.

- A region fill is **one `<path>`** whose subpaths are the stitches, so a region costs three or four nodes however many stitches it has. The whole set at three detail levels is 18 symbols, about 400 paths and roughly 90 KB inline.
- Crisp at any device pixel ratio with no runtime drawing, no canvas sizing, no resize observers; the toolbar needs only CSS and attribute state.
- Detail adapts by **re-stitching per size**: 24 px uses wider threads, no ground gap and a heavier cord; 32 and 48 px share a finer level; the enlarged view adds strands and the cord wrap.
- Canvas was the right tool for 010's per-stitch count animation; here nothing is drawn incrementally, so SVG wins on integration cost. A shader would add nothing at icon size.
- Limitation: the sprite's `<defs>` gradient id must be unique per page; a page that inlines the sprite twice would need namespacing.

## Vocabulary (sample-local, `stitch-svg.ts`)

- `satinSegments(poly, angle, pitch)`: parallel stitches cut to a polygon.
- `fanSegments(poly, cx, cy, pitch, a0, a1)`: stitches radiating from a centre, spacing set at the outermost radius so the outer edge stays covered.
- `region(...)`: darker ground, stitches, optional strands, one directional matte highlight, optional contact shadow.
- `cord(path)`: shadow, body, wrapped highlight.
- `knot(x, y, r)`, `stitch(...)`: dots and glints.

Direction is deliberate per region. There is no randomness anywhere in the set.

## What the browser showed

- **Stitch spacing on fans.** Deriving the angular step from the mean radius left comb-like gaps at the outer edge of the headphone arch. Setting it from the outermost radius fixed it.
- **A cord on one edge is not a band.** The first arch had a cord only on its inner edge and read as a fuzzy caterpillar; a closed cord around the whole band made it a headphone arch.
- **Pale colours need a lighter ground.** The cloud's darker ground (62 % of the colour) turned it grey; at 76 % the lobes stay pale and the stitches still read.
- **24 px.** All six are recognisable by silhouette at 24 px on both surfaces. The thread effect there is mostly the cord's dashed wrap and the directional gaps in the fill; satin direction is visible on the bubble, bolt, folder and cursor, less so on the cloud.
- **What only works enlarged.** Strands, the wrapped cord highlight and the ground gaps between stitches.

## Specimen

Native `<button>`s with visually hidden names; the icons are `aria-hidden` `<use>` instances. Hover and focus lift the patch 1 px and deepen its shadow. Selection is `aria-pressed` with a contrasting running stitch (CSS dashed border). The chat button carries a knot badge and "3 unread" in its name. Upload is a labelled simulated state change: the attribute flips at once, the knot scales in over 180 ms, instantly under reduced motion. A polite live region reports selection and upload. A surface toggle switches the toolbar between light and dark.

## Candid evaluation

- **Reads as embroidery?** At 48 px and enlarged, yes: satin direction, cord, contact shadows and knots are all legible. At 32 px, yes with less detail. At 24 px it reads as a bold patch-style icon with a stitched border; the fill direction is subtle.
- **Does direction describe the object?** Bolt stitches run down the bolt, the arch fans around its centre, the cursor is stitched along its pointer, the folder front runs level. The cloud's per-lobe fans are correct but low-contrast.
- **Coherent set?** One light direction, one cord treatment, the same two-or-three-region rule and the same glint make the six feel related despite six colour schemes. The cursor is the odd one out in weight (ink on light) and works as the set's accent.
- **Anime influence without gimmick?** Present in the fat bubble, the chunky earcups, the hot-pink cursor tail and the single glints. No faces.
- **Still yours to judge.** Whether the set feels contemporary rather than kitsch, and whether the cord's dashed wrap is a convincing thread at 32 px on a real screen.

## Limitations and next decision

- The cord wrap is one dash rhythm for every icon; a true merrowed edge would vary with curvature.
- No long-and-short shading; regions are flat satin.
- The folder's mint tab and the cloud are the weakest at 24 px.
- Most useful next visual decision: whether to push the set warmer (one shared thread sheen gradient per icon) or keep it matte, and whether the badge should be a stitched knot drawn from the vocabulary instead of a CSS radial gradient.
