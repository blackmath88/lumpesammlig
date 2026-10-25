# 010 — Pixels to Stitches

## Encounter and clarified intent

The encounter is sample 009's embroidered hanger cover and the question it raised, recorded with that encounter:

> The hanger prompted an interest in embroidery as a digital interface language. The user sees a relationship to pixels, but experiences embroidery as warmer and more handmade. The investigation concerns the material and perceptual qualities of stitches and their application to working UI.

This sample is a **material and perceptual study with a working specimen**, named as such. It does not claim a behavioural transformation, and it does not attach a story about care or support to justify itself.

## Observed (from the photograph)

- A regular grid of slanted marks that all lean the same way; each mark is rounded at its ends and slightly domed.
- A dark gap at the crossings where the ground shows through.
- Motifs are the same marks in other colours; nothing is drawn over the field.
- A braided brown border follows the object's outline.
- The exact technique is not asserted. The marks are consistent with tent stitch on counted canvas, but the photograph does not prove it.

## Questions this study asks instead of the "remove the texture" test

- Which observable qualities produce the intended material impression?
- Does that impression survive at actual UI size?
- Can it coexist with legibility, clear states and responsive interaction?

## References consulted (Interface Atlas at commit `43cbc51`)

The Atlas had no entry on embroidery, thread rendering, stitch graphics or Canvas material techniques; the closest were `webgpu-glass`, `react-bits` and the pmndrs entries, none of which informed this work. Five primary references were read on 2026-10-25:

1. **Tent stitch** (Wikipedia, construction facts). A diagonal stitch at about 45° covering one canvas crossing; half cross, continental and basketweave look the same from the front and differ on the back. → Grounds the choice of one slanted mark per chart cell and one slant direction everywhere.
2. **Aida cloth** (Wikipedia). A counted evenweave: "count" is squares per inch, common counts 7–20. → A chart cell is literally a pixel of the fabric; the 1× row uses 3 px cells, roughly a 14-count cloth seen at arm's length on a 2× display.
3. **Stitch Meshes** (Yuksel, Kaldor, James, Marschner, SIGGRAPH 2012). Yarn-level knit modelling from a stitch layout mesh plus relaxed yarn curves; the authors claim only qualitative agreement with photographs. → Atlas entry `stitch-meshes`. Sets the honest bar: a web approximation can show which qualities matter, not that a treatment is correct.
4. **Canvas 2D `lineCap`** (MDN). A round cap extends half the line width past each endpoint; Baseline widely available. → Atlas entry `canvas-2d-api`. The rounded thread body is one short stroke with round caps, no geometry.
5. **CSS `image-rendering`** (MDN). `pixelated` and `crisp-edges` keep hard pixel edges when upscaling. → Folded into `canvas-2d-api`. The study draws enlargements at target size instead of upscaling a small canvas.

## Rendering approaches considered

- **Native SVG/CSS.** Crisp icons at any size and no script, but each stitch would be a DOM node (a 13 × 12 motif is ~90 nodes; a list with borders is thousands), and the fill/unpick count would mean toggling node visibility. Viable for a single icon, poor for the comparison and the borders.
- **Canvas 2D (chosen).** One stroke routine for every mark, cheap at icon size, incremental drawing for the fill/unpick, decorative canvases beside native controls. Reuses sample 009's construction (shadow, body, matte highlight, fibre strands) without sharing code.
- **Shader (WebGL).** Would allow per-pixel lighting and a true relief, but buys nothing at 24–36 px icons and would need a second vocabulary for the DOM-level borders and seams. Kept as the fallback if a later study needs large animated surfaces.

The choice stays provisional. What the first comparison showed: the deciding factor at 1× was mark length and plumpness, not rendering technology. Canvas 2D handled every treatment once the stitch sat on one crossing.

## What the implementation showed

- **Stitch length decides everything.** The first build used marks about 1.8 cells long; enlarged, they read as diagonal hatching, and even the 1× row looked like a striped pixel. Shortening each mark to about 1.35 cells including its round caps, and widening it to about 0.76 of a cell, made marks sit on their crossings. This single change did more than shadow, fabric or variation.
- **Direction alone separates stitch from pixel at 1×** (treatment B). The heart and the check are recognisably "sewn" even without volume.
- **Volume makes thread** (treatment C). The contact shadow does most of the work; the highlight must stay narrow and matte or marks turn into tubes.
- **Fabric contributes warmth but is the easiest quality to get wrong.** Drawing holes as dots inside tiles read as bathroom tiles. Drawing threads through the cell centres with the hole as the open space between them read as canvas. At 1× the fabric collapses to a faint texture, which is probably right.
- **Variation contributes least.** With long marks it made things worse; with short marks it is barely visible at 1× and helps a little when enlarged. It must stay small (±4° angle, ±5 % length, ±7 % tone).
- **At 1× the fibre strands and the over/under weave are switched off** (thresholds on cell size); they only exist to explain construction when enlarged.

## Working specimen

A native `<form>` and `<ul>` with checkboxes and buttons. The stitching is decorative and `aria-hidden`: a stitched checkmark fills in stitching order when an item is completed and unpicks when it is reopened (340 ms, instant under reduced motion; the state change itself is immediate), a satin border on the item that has focus or was last pointed at, a running-stitch seam under the form, and one stitched label. Reading text stays plain. Add, complete, reopen, remove and undo-remove all work by keyboard; status is announced through a polite live region.

## Reflection

**Revealed.** A chart is the shared logic; the stitch is a chart cell with a direction and a body. The impression of "handmade" came from construction constraints (one slant, one crossing, one plump mark) rather than from irregularity. Randomness was the least useful quality.

**Weakened.** The idea that variation is what makes embroidery feel handmade. In this study, regularity did.

**Untranslated.** Real thread has sheen that changes with viewing angle, split strands and a twist; the back of the work; the slight canvas distortion that tent stitch causes. None is attempted.

**Needs human comparison.** Whether any treatment feels warmer or more wholesome, whether the fabric ground at 1× is pleasant or merely noisy on a given screen, and whether the stitched label is charming or an obstacle. The study does not claim these are validated.

**Most useful next visual decision.** Whether the specimen's ground should stay fabric-coloured or become the photograph's turquoise with cream stitching, which would test the strong-colour direction properly.
