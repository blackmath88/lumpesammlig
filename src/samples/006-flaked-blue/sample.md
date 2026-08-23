# 006 — Flaked Blue

## Source object

An old blue-grey painted wooden surface beside a window. Paint has cracked, lifted and fallen away, exposing a pale older layer and occasional raw wood beneath.

## Observation

This is material stratigraphy rather than a distressed pattern. Most of the field remains calm and intact. Damage gathers in directional clusters: brittle blue paint sits highest, pale undercoat occupies the next level, and directional wood grain appears in the deepest losses. Thin occlusion at raised edges makes the order readable even without colour.

## Translation

A fragment shader builds one erosion history from vertically biased coherent fields. Thresholds through that same history decide which layer remains, which edges lift, and where damage reaches wood. A derived height field supplies normals for restrained matte lighting and micro-shadow.

The same renderer now drives an erosion reveal, revision stratigraphy, connected surface-integrity reading, scale cutaways and a late conservation lab. Newer information covers older states without deleting them; history becomes legible where the present surface has been lost.

## Technical boundary

Sample-local React islands reuse one raw WebGL 1 renderer. The material renders on demand, stops scheduling work offscreen or while the document is hidden, avoids identical resize allocations, and caps pixel ratio by context. Reduced motion keeps a still high-quality frame, and CSS provides a non-WebGL fallback.
