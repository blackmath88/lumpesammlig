# 004 — Blue Coil

## Source object

A photographed hand-wrapped basket lid or shallow coiled vessel. A small raised spiral occupies the centre; broad natural-fibre coils expand toward the edge. Deep blue binding appears as short marks and interrupted rings.

## Observation

The object is accumulated rather than surfaced. Its identity comes from the rounded relief between adjacent coils, dense perpendicular wrapping, radial compression and slight handmade drift. The blue is indigo—not black—and remains subordinate to the dry straw-coloured fibre.

## Translation

A fragment shader constructs a shallow height field from concentric, slightly wandering bands. Arc-length phase creates the short wrapping marks; selected cycles become indigo. Finite differences derive normals so a broad, pointer-directed light can reveal relief without moving the material.

The interface proposition stays restrained: information can accumulate from a centre and be read as distance travelled, rather than as a conventional vertical stack.

## Technical boundary

One React island owns a raw WebGL 1 canvas. The rest of the route is static Astro and CSS. Pixel ratio is capped, animation is paced near 30 fps, and reduced-motion mode draws a still frame. A CSS radial field remains if WebGL is unavailable. No source photograph is used as the rendered texture.
