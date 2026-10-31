<!-- BEGIN public-repo-header -->
<div align="center">

# Lumpesammlig

**Encounter → situated reading → distinction → transformation → experiment.**

<a href="https://github.com/blackmath88/lumpesammlig"><img alt="Primary language: TypeScript" src="https://img.shields.io/badge/language-TypeScript-526078?style=flat"></a>
<a href="https://github.com/blackmath88/lumpesammlig/tree/main/docs"><img alt="Documentation" src="https://img.shields.io/badge/docs-guide-16796f?style=flat"></a>
<a href="https://github.com/blackmath88/lumpesammlig/commits/main"><img alt="Last commit" src="https://img.shields.io/github/last-commit/blackmath88/lumpesammlig?style=flat&amp;color=737373"></a>

</div>
<!-- END public-repo-header -->

Lumpesammlig is a small digital exhibition and front-end R&D repository for translating real encounters into new propositions about interaction.

The sources can be physical objects, materials, inherited interfaces, behaviours, conversations, rituals, mechanisms, fragments of language or other things that become interesting because something about their occurrence resists the obvious category.

The important rule is: **do not jump from appearance to UI.** Read the source on its own terms first. Ask what domain it belongs to, what function it performs, what distinguishes it from its peers, what behaviours and tensions make it specific, and what became visible only through the surrounding conversation.

Those questions are lenses, not a mandatory funnel.

The project deliberately separates:
- **evidence** — what was actually encountered;
- **reading** — provisional interpretations of what matters;
- **transformation** — semantic movement into another domain;
- **experiment** — one executable interpretation;
- **reflection** — what implementation teaches us back.

The repository is deterministic where determinism is useful: provenance, files, builds, validation and reproducibility. It is intentionally non-deterministic where semantic transformation matters. Language models are used not to fill a component schema, but to compare, reframe, find distinctions, cross domains and propose transformations that deterministic rules cannot derive.

See:
- [Conceptual Spine](docs/CONCEPT.md)
- [Architecture for Planned Non-Determinism](docs/ARCHITECTURE.md)

This is not a component library, design system, style-transfer gallery or prompt-to-website factory. The exhibition shell should remain coherent; each sample should remain technically and aesthetically free.

## Current samples

### 001 — Waschlumpe

A loosely knitted washcloth becomes a runtime-generated Canvas 2D textile. Thick, uneven yarn and open holes move from lavender-grey through sage to mint/aqua. A broad delayed pointer field introduces soft tension; it is intentionally not a click ripple or magnetic pull.

The source note and implementation live together in src/samples/001-waschlumpe/.

### 003 — Soft Green

A wound 3.5 mm macramé cord becomes a procedural height field. A raw WebGL island reconstructs packed diagonal bands, internal twist and fibre-scale roughness before deriving normals for matte lighting. The real photographs remain evidence below the synthetic material study.

### 004 — Blue Coil

A hand-wrapped basket lid becomes a concentric procedural relief. Its raw WebGL study preserves accumulated coils, short indigo binding marks, radial compression and the small drift of hand construction. Pointer input changes only the broad light direction; the material itself remains still.

### 006 — Flaked Blue

Old blue-grey paint becomes a procedural material stratigraphy. One erosion history determines intact paint, lifted edges, pale undercoat and deeper wood exposure; a derived height field keeps their order visible through matte light and micro-shadow rather than colour alone.

### 007 — Blue Printed Paper

Dusty indigo decorative paper becomes a procedural print-and-substrate study. Seeded radial systems create cream dashes, while one shared pulp and absorption field gives every mark the same feathering, drift and missing coverage.

### 008 — WordArt

A remembered turn-of-the-millennium desktop publishing interface becomes an interaction study rather than a retro skin. Editable text, preset galleries, warp, gradient, outline, extrusion, shadow and selection handles reconstruct the important behaviour: typography as a directly manipulable object. A dependency-free engine renders a small parameter set to standalone SVG. Exported SVGs carry their recipe in `<metadata>` and can be reopened for editing, the URL hash holds the same recipe as a shareable link, and a *Now* preset row pushes the same parameters into contemporary styles. The argument: exact, cheap control instead of fuzzy prompting.

### 009 — Stitched Care

An embroidered cover on a curved clothes hanger becomes a stitch-by-stitch study. One deterministic grid describes the shaped silhouette, the turquoise field, the rose, flowers, leaves, curls and the brown edging; a local Canvas 2D renderer draws the same model as a whole hanger and as a close detail where individual stitches resolve. A labelled "Stitches completed" control reveals the work as a count of accumulated decisions. The finished textile is the default state; nothing autoplays.

### 010 — Pixels to Stitches

The question raised by the hanger: pixels and stitches share a chart, so why does embroidery read as warmer and handmade? A still comparison renders the same heart, checkmark and leaf-and-bud chart as flat pixels, flat directional stitches, stitches with thread volume, stitches on visible fabric, and stitches with controlled variation, at 1× and enlarged, with single qualities switchable. A small working list then uses the same Canvas 2D vocabulary for a stitched checkmark that fills and unpicks with real state changes, a satin selection border, a seam and one stitched label, on top of native controls. The note records the references consulted and what went back to Interface Atlas.

### 011 — Thread Icons

Embroidery as a contemporary digital medium rather than a traditional motif. Six familiar interface icons (chat, lightning, headphones, folder, cloud upload, cursor) are built from a sample-local SVG stitch vocabulary in which threads follow each shape: satin fills clipped to regions, fanned stitches around curves, cord outlines along contours, layered regions with contact shadows, and knots. Everything is generated at build time into one sprite; the page shows all six at 24, 32 and 48 px on light and dark surfaces, an enlarged construction view, and a native-button toolbar with selected, notification and simulated-upload states.

### 014 — Made Heavy

Russian Soviet-era brutalism, encountered through two research reports rather than a visit, read as a tectonic language: bearing, suspension, repetition, trace. Four separate experiments test four distinctions. Regions of the study's own prose rest on movable piers and bear, cantilever or drop; a deep façade screens which bays you can act on from where you stand, with depth zero exposing the flat interface as the nearest peer; one undesignable unit is arranged on a site and judged by rule as fabric, exception or unbuildable; and text is poured in sequence, where a struck pour can only be overcast and keeps a sliver of what it covers at the seam. Paper and ink throughout; nothing is concrete-coloured.

## Architecture

Astro is the stable, mostly static exhibition shell:

~~~text
docs/
  CONCEPT.md                     # conceptual spine
  ARCHITECTURE.md                # evidence / model / experiment architecture
src/
  components/
    SampleLibrary.astro          # static promenade + low-cost previews
  data/
    samples.ts                   # lightweight navigation/catalogue metadata
  layouts/
    BaseLayout.astro
  pages/
    index.astro                  # current experiment → collection
    samples/
      001-waschlumpe.astro
      003-soft-green.astro
      004-blue-coil.astro
      006-flaked-blue.astro
      007-blue-printed-paper.astro
      008-wordart.astro
      009-stitched-care.astro
      010-pixels-to-stitches.astro
      011-thread-icons.astro
      012-impossible-index.astro
      013-switchboard.astro
      014-made-heavy.astro
  samples/
    ...
~~~

Only each sample's focused interactive islands hydrate where a framework is useful. Hero materials load immediately; deeper experiences and small collection previews hydrate when visible. The library, layout and notes remain static Astro. Sample 008 demonstrates the opposite boundary: a plain Astro route with SVG and vanilla JavaScript is sufficient.

React is therefore a local implementation choice, not the site runtime. A later sample may use plain Astro/CSS, vanilla JavaScript, SVG, Canvas, Three.js, WebGL/WebGPU, sound, a state machine, a tiny game, or another focused technology if its transformation calls for it.

There is deliberately no universal Sample page component and no universal semantic schema. `src/data/samples.ts` is navigation/catalogue metadata, not an interpretation contract.

For richer future encounters, a sample may optionally grow into:

~~~text
src/samples/<sample>/
  encounter/
    media/
    conversation/
    references/
  readings/
  experiments/
  reflection.md
~~~

Do not migrate existing samples merely to satisfy this shape. Let future encounters prove which structures deserve repetition.

## Add a sample

Start only after there is a real encounter worth reading.

1. Preserve the relevant evidence. A photograph may be part of the encounter, but so can conversation, context, references or memory.
2. Read the source before designing from it.
3. Allow several competing interpretations when the source supports them.
4. Reject transformations that merely imitate surface appearance.
5. Build one or more experiments with the smallest technology that can test the selected proposition.
6. Keep enough grounding that the experiment can answer: **what in the encounter gave us permission to make this move?**
7. Give the experiment an individual presence in the collection.
8. Verify keyboard access, reduced motion where relevant, small screens, runtime errors and production build output.
9. Reflect on what the executable version changed in the original reading.

These are orientations, not mandatory form fields. Different encounters should produce different artefacts.

Do not add empty placeholder samples, prebuild hypothetical component mutations, force all experiments through React, or extract shared abstractions until repeated work proves the same technical boundary.

## Local development (Windows)

PowerShell:

~~~powershell
npm install
npm run dev
~~~

Open the local URL Astro prints (normally http://localhost:4321).

Before handing off a change:

~~~powershell
npm run check
npm run build
npm run preview
~~~

dist\ is generated and should not be committed.

## Deployment

The site deploys to GitHub Pages as a project site at https://blackmath88.github.io/lumpesammlig/ through `.github/workflows/deploy.yml`, which runs on every push to `main` (Pages source: GitHub Actions).

Because the site lives under `/lumpesammlig/`, `astro.config.mjs` sets `site` and `base`, and every root-relative link or asset path in the shell and the samples goes through `withBase()` from `src/data/site.ts`. New samples should do the same for their own links and evidence images.

`wrangler.jsonc` remains for an optional manual Cloudflare Workers upload (`npm run deploy`), which is not part of the automated path.

## Working principle

Preserve intentional oddness.

Structure should protect evidence and make experiments executable. It should not decide what an encounter means.

The next source should be allowed to invalidate assumptions made by the first.
