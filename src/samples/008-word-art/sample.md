# 008 — WordArt

## Source object

The Microsoft Word WordArt gallery of the late 1990s and 2000s: one dialog, thirty preset tiles, gradient fills, thick outlines, drop shadows and a 3D depth slider. Not physical matter, but a real cultural object — the typesetting experience of an entire generation of school newsletters, club flyers and homework covers.

## Observation

The useful qualities are not kitsch alone. WordArt gave non-designers semantic coordinates — arch, inflate, deflate, chevron, wave, slant, gradient, outline, shadow, extrusion — with immediate, forgiving feedback. Its behaviour was deliberate, democratic exuberance: a word that states itself and refuses to be mistaken for body text.

## Web translation

`material/wordArt.ts` is the sample-local scene builder. Letter placement (advance-width table, per-glyph displacement and rotation along arch, chevron, wave and inflate curves), fill gradients, outline stroke, shadow and 3D extrusion all derive from one `WordArtParameters` model. The thirty gallery presets in `material/presets.ts` are named readings of those coordinates — the classic tiles, rebuilt, not screenshotted.

`WordArtRender.tsx` maps a scene to static SVG; there is nothing to animate and nothing to hydrate beyond React. `WordArtStudio.tsx` is the full generator: text entry, the 30-tile gallery, shape and fill modes, colour coordinates, outline weight, depth, tracking and shadow — plus native `.svg` export. The page then derives three interface mutations (primary action, error state, progress label) from the same builder.

The render is resolution-independent SVG, keyboard operable, and has no motion dependency at all; the only animation on the page is the honest progress bar in the third mutation, which honours `prefers-reduced-motion`.

## Boundary

This directory belongs to Sample 008. The advance-width table and the curve formulas are precedent only for this object. No shared typography framework, no cross-sample text-effect API, and no assumption that a later sample wants Impact as anything but a historical material choice.
