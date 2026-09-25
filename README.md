# Lumpesammlig

**Encounter → situated reading → distinction → transformation → experiment.**

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

## Cloudflare deployment

The project is a static Astro build. Cloudflare Pages is the chosen initial path because it needs no runtime adapter or Worker:

- Framework preset: Astro
- Build command: npm run build
- Build output directory: dist
- Production branch: your repository's production branch (commonly main)

Connect the Git repository in **Cloudflare Dashboard → Workers & Pages → Create application → Pages → Import an existing Git repository**. Cloudflare installs dependencies and deploys dist.

For a manual Pages upload after creating the Pages project:

~~~powershell
npm run build
npx wrangler pages deploy dist --project-name YOUR_PROJECT_NAME
~~~

Do not add @astrojs/cloudflare while the site remains fully static; that adapter is for server rendering. If the deployment model later changes to Workers Static Assets, use a current wrangler.jsonc with assets.directory set to ./dist, not deprecated Workers Sites configuration.

## Working principle

Preserve intentional oddness.

Structure should protect evidence and make experiments executable. It should not decide what an encounter means.

The next source should be allowed to invalidate assumptions made by the first.
