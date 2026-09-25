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

`engine.js` is a pure function from a small, explicit parameter set to a standalone SVG string: no DOM, no dependencies. The editor, file export and share links all call it. `normalize()` is the whole schema: anything that comes in from a URL, a file or a tool call is coerced into it or falls back to a default.

## Reflection: control, not prompting

Implementation made the argument sharper. The question stopped being "what could WordArt do" and became **what WordArt can do that a generative model cannot**: offer exact, cheap, repeatable control over a result.

- A prompt describes an outcome and hopes. A parameter *is* the outcome. "Slightly less depth" is one slider step, not another round of re-rolling.
- A rendered WordArt is about 2–4 KB of SVG. It costs nothing to produce, re-render or change, and it is deterministic.
- **The file keeps its adaptability.** Every exported SVG carries its recipe as JSON in `<metadata>`. Drop it back onto the stage and every control returns. The URL hash holds the same recipe in readable form, so a link is also an editable document.
- Presets remain points in the parameter space. The *Now* row (glass glow, acid, riso misregistration, brutalist offset) does not add a new mechanism. It reuses the same parameters, which shows that the old interaction grammar carries contemporary styles without a style-transfer model.

Open threads, deliberately left outside the specimen:

- **Other hosts.** Because the renderer is a pure function, it could be exposed as a tool (for example an MCP server) so a chat or another site gets a controllable WordArt instead of an image prompt. That belongs in a separate package, not in the exhibition.
- **Email signatures** are a real use case, but mail clients strip SVG. That would need a PNG plus a link back to the editable recipe.
- Text remains live `<text>`, so rendering depends on the fonts installed where the file is opened. Fitting is estimated per font instead of `textLength`, because browsers disagree about `textLength` along a path.
