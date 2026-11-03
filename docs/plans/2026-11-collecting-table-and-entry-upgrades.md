# The collecting table and entry upgrades

Prepared 2026-11-03. Part one is implemented in this change. Part two is a plan, one brief per entry,
written against [CLAUDE.md](../../CLAUDE.md): each upgrade names the quality of the encounter it
deepens, says honestly whether it is a material study or an interaction transformation, and says
where three.js would be wrong.

## 1. Implemented: the collecting table (`SampleTable.astro`)

**What it is.** A sticky, scroll-driven three.js scene between the hero and the catalogue. Every
sample rests as a specimen on one long linen table. Scrolling walks the camera along the table,
hovering lifts a specimen into the light and shows its caption, and clicking opens the study. A
numbered strip at the bottom gives keyboard and screen-reader access; focusing a number brings its
specimen into view and lifts it.

**Why a table, and not a carousel.** *Lumpesammlig* means a collection of rags and scraps: things
picked up and laid out to be looked at. The table is the place where collected things meet before they
are read. It is an entrance, not a reading. The existing promenade (`SampleLibrary.astro`) stays
unchanged below as the readable catalogue.

**How each source rests** (`FORMS` in `sample-table/scene.ts`). The form comes from the encounter, not
from the look:

| Specimen | Rests as | Why |
|---|---|---|
| 001, 003, 009, 010, 011 | cloth: a draped plane with folds that touches the table | textile sources, or studies of stitch |
| 004, 006 | board | basket lid and painted wood have body |
| 007 | paper | a sheet |
| 012, 013 | card | catalogue card / desk record |
| 014 | ream of paper | researched, not visited; its surfaces are paper and ink on purpose, not concrete |
| 008 | screen-thin panel | a remembered desktop interface |

**Specimen faces** are still posters of each sample's own gallery preview
(`public/samples/posters/*.webp`, about 400 KB in total), captured unretouched. The live renderers stay
in the studies, so ten WebGL contexts never compete on one page. Regenerate the posters with
`scripts/capture-posters.mjs`.

**Boundaries**
- three.js (0.170) loads only when WebGL2 exists and the table is within 600 px of the viewport. The
  render loop stops offscreen. Pixel ratio is capped at 1.75.
- Without WebGL the section stays hidden and the page is exactly as before.
- Reduced motion: no camera easing or sway, and lifts are instant.
- Touch: the first tap lifts a specimen, the second tap opens it.
- Grounding uses soft contact shadows plus a shadow-mapped window light. The contact shadows keep
  specimens grounded on GPUs where shadow maps are weak.
- `scene.ts` belongs to the landing page. It is not a shared 3D framework for samples.

**Open points for the owner**
- Headline copy ("Everything collected, laid out on one table.") is a proposal.
- 002 and 005 do not exist. The table does not invent placeholders, consistent with the open-end line.

## 2. Audit notes (from the running build, 1440 × 900)

- Every study renders and the build passes; no console errors.
- **Two WordArt routes** exist: `008-word-art` (React studio) and `008-wordart` (vanilla engine). Only
  `wordart` is in `samples.ts`. Decide which one is canonical; the other should redirect or be documented
  as an earlier take. The richer WordArt now lives in the MakeWordartGreatAgain repo, so link it.
- The catalogue heading reads "012 OBJECT"; consider "OBJECTS", or "SPECIMENS" to match the table.
- The promenade is long, with 12 previews of 390–700 px. The table now gives a fast overview, so the
  promenade can stay as it is as a slow, readable catalogue.

## 3. Entry upgrade briefs

Ordered by gain. "Material study" and "interaction transformation" are used as CLAUDE.md defines them.

### 001 Waschlumpe: from pointer field to connected loops (interaction)
- **Quality:** deformation spreads through connected fibres; tension is uneven.
- **Upgrade:** replace the broad pointer field with a constraint net in which each loop is a node joined
  to its neighbours (Verlet). Pulling one loop visibly redistributes load to its neighbours. The existing
  component mutations (pressure gathers a control, the toggle spans two anchors) run on the same net.
- **Tech:** three.js instanced loop geometry or a deformed plane. Canvas 2D stays as the fallback and
  the reduced-motion path.
- **Check:** with colour removed, does a pulled control still redistribute load to its neighbours? It
  should. This is the CLAUDE.md example used literally, so make sure the experiment is about *load*,
  not about *wobble*.

### 004 Blue Coil: accumulation you can watch (interaction)
- **Quality:** accumulated rather than surfaced.
- **Upgrade:** one continuous tube spiralling outwards (`TubeGeometry` along a drifting spiral) with
  instanced wrapping marks. The progress indicator literally lays coil; interrupting it leaves a visible
  seam. Keep "pointer moves only the light".
- **Tech:** three.js; the raw WebGL relief stays as the fallback.

### 006 Flaked Blue: layers with real depth (material study → interaction)
- **Quality:** stratigraphy: newer layers cover older ones without deleting them.
- **Upgrade:** three stacked, displaced layers (paint, undercoat, wood) with lifted flake edges that
  catch raking light. The revision-stratigraphy mutation peels a selected revision and shows exactly what
  lies under it.
- **Tech:** three.js with one shared erosion field, as today. Keep the WebGL 1 renderer as the fallback.

### 003 Soft Green: cords as geometry (material study, named as such)
- **Quality:** strength from twist; dark channels are compression and self-occlusion.
- **Upgrade:** real helical cords (tube along a helix, with a twist normal map) so occlusion is
  geometric. The knot slider redistributes actual slack along a curve.
- **Note:** this deepens fidelity, not the proposition. Label it a material study.

### 009 Stitched Care: the cover on its support (material study)
- **Quality:** a cover *fitted to* a curved support; thousands of stitches.
- **Upgrade:** instanced stitch meshes (domed and slanted) on the curved hanger body in 3D. The "stitches
  completed" control builds the cover onto the form. The photograph stays evidence and is never a texture.

### 007 Blue Printed Paper: light through the sheet (new reading, small)
- **Quality:** one shared absorption field weakens every mark.
- **Upgrade:** a transmitted-light mode in the existing raw WebGL renderer (no three.js): hold the sheet
  against a window and fibre density and absorption become visible as a second reading of the same field.

### 010 Pixels to Stitches: the transition is the comparison (small)
- Keep Canvas 2D. Add a continuous morph pixel → stitch per treatment, so the five qualities are seen
  arriving one by one instead of side by side.

### 012 The Impossible Index: watch the neighbours move (no 3D)
- Its own notes say "do not animate a fake 3D cabinet". Upgrade with FLIP / View Transitions so cards
  physically move when the filing changes while the held card stays put. That *is* the proposition.

### 013 The Switchboard: cords with weight (no 3D)
- Draw patch cords as SVG catenaries that sag and swing briefly on connect and release. Voices stay
  fixed; only the routing moves.

### 014 Made Heavy: load you can feel (no concrete)
- Keep paper and ink. In 01 Piers, give unsupported regions a short, honest drop (gravity easing) and
  cantilevers a slight deflection proportional to their reach. No concrete textures.

### 008 WordArt and 011 Thread Icons
- **008:** resolve the duplicate routes and link the MakeWordartGreatAgain studio. An optional true 3D
  extrusion mode would be faithful to the original's depth slider, but is not needed.
- **011:** stays SVG. It is a usable specimen at UI sizes, and 3D would work against that.

## 4. Suggested order
1. Land the collecting table (this change).
2. 001 and 004 (biggest gain, clearest propositions).
3. 006, then 012 and 013 (small, high-signal motion).
4. 003, 009 and 007 as material studies.
5. Cleanup for 008.
