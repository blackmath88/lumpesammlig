# 007 — Blue Printed Paper

## Source object

A worn sheet of decorative paper fixed inside a wooden cabinet. Dusty indigo ink carries hundreds of cream dash marks arranged in overlapping radial and spiral fields. Small tears and losses remain evidence, but the study does not reproduce the photographed cabinet or its exact damage.

## Material observation

The visible system is strict from a distance and fallible up close. Every dash inherits the same paper: shallow waviness, compressed pulp, uneven absorption, feathered pigment edges and occasional missing coverage. The pattern hierarchy is dash → arc → radial system → overlapping field.

## Translation

A static raw-WebGL material synthesises the sheet from one shared topology. Five seeded radial systems generate the cream marks. Their placement is systematic, while one coherent absorption and fibre field weakens, drifts and interrupts them. Pointer input changes broad matte light only; it never edits or animates the pattern.

The derived interface experiment below the source asks whether precise records can inherit one material-error field without becoming a distressed component style.

## Technical boundary

- React island with raw WebGL 1 and GLSL; no texture photograph in the hero.
- Draws only on load, resize and pointer movement; device pixel ratio is capped at 1 on small screens and 1.3 elsewhere.
- Reduced-motion users receive the fixed initial light.
- CSS fallback preserves the indigo/cream radial reading when WebGL is unavailable.
- Diagnostic query modes: `?material=paper`, `?material=print`, and `?material=normal` isolate the substrate, flat print mask, and derived normal field.

The shader deliberately stops short of torn edges, cabinet geometry and literal photographic damage. The question is how print and substrate share error, not how accurately one photograph can be copied.
