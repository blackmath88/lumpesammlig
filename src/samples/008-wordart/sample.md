# 008 — WordArt

## Source object

WordArt as encountered in late-1990s and early-2000s desktop publishing: a piece of text stopped behaving like document typography and became an object. It could be selected, stretched, rotated, warped, filled with gradients, outlined, shadowed and made proudly three-dimensional.

The source here is not one exact Microsoft Word version or one screenshot. It is the remembered interaction grammar of that era.

## Observation

The interesting part is not the chrome gradient.

WordArt made typography **directly manipulable**. The user did not have to understand a type system, token hierarchy or CSS property. They grabbed a thing, chose an effect, and made it more itself.

Its aesthetic excess also exposed state unusually clearly:

- selected objects looked selected;
- effects were visible before they were tasteful;
- presets were invitations to mutate, not final answers;
- shape was a first-class property of text;
- depth, outline and shadow were independent, legible dimensions.

## Translation

Rebuild that interaction grammar as a browser-native specimen.

The page is a tiny tool rather than a retrospective gallery. The text is editable. Presets are intentionally unapologetic. Warp, fill, outline, depth, tracking and rotation remain exposed. The object keeps visible selection handles. Export closes the loop from playful manipulation to usable artefact.

The point is not to recreate an old Office UI pixel-for-pixel. It is to ask what contemporary interfaces lost when every expressive control became a sober property panel or an invisible AI prompt.

## Interface mutation

Use WordArt as a counterexample to AI-slop UI:

- show the object, not a chat box;
- prefer visible states over hidden capability;
- let presets teach the parameter space;
- make manipulation reversible and immediate;
- allow delight without pretending every surface must be neutral;
- let "wrong" aesthetics remain productive.

## Technical boundary

Astro + native SVG + vanilla JavaScript.

No canvas rendering dependency and no React island are required. SVG keeps the typography inspectable, scalable and serializable for export.
