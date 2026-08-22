# Lumpesammlig

**Real object → observation → material logic → native web experiment → possible component mutations.**

Lumpesammlig is a small digital exhibition and front-end R&D repository. It starts with ordinary physical objects, imperfections and mechanisms, then asks what the web becomes when their logic—not an established UI pattern—sets the rules.

This is not a component library, design system, texture collection, or factory for identical case-study pages. The exhibition shell should remain coherent; each sample should remain technically and aesthetically free.

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

## Architecture

Astro is the stable, mostly static exhibition shell:

~~~text
src/
  components/
    SampleLibrary.astro          # collection promenade (Astro, no hydration)
  data/
    samples.ts                   # lightweight metadata for real samples only
  layouts/
    BaseLayout.astro
  pages/
    index.astro                  # current experiment → collection
    samples/
      001-waschlumpe.astro       # dedicated exhibition route
      003-soft-green.astro
      004-blue-coil.astro
      006-flaked-blue.astro
  samples/
    001-waschlumpe/
      sample.md                  # object, observation, translation, boundary
      KnitSurface.tsx            # the sample's React island
      knit-surface.css           # sample-owned presentation
    003-soft-green/
      sample.md
      CordField.tsx              # raw WebGL + GLSL island
      cord-field.css
    004-blue-coil/
      sample.md
      CoilField.tsx              # concentric raw WebGL + GLSL relief
      coil-field.css
    006-flaked-blue/
      sample.md
      PaintField.tsx             # layered erosion + height-derived lighting
      paint-field.css
~~~

Only each sample's focused interactive island hydrates (`KnitSurface`, `CordField`, `CoilField`, and `PaintField`). The library, layout and notes are static Astro. React is therefore a local implementation choice, not the site runtime. A later sample may use plain Astro/CSS, vanilla JavaScript, SVG, Canvas, Three.js, WebGL/WebGPU, sound, or another focused dependency if its object calls for it.

There is deliberately no universal Sample page component. src/data/samples.ts is navigation/catalogue metadata, not an implementation contract.

## Add a sample

Start only after there is a real object and an observation worth translating.

1. Add one metadata record to src/data/samples.ts.
2. Give the experiment a self-contained directory such as src/samples/002-object-name/.
3. Add a short sample.md describing the source object, observation, translation and technical boundary.
4. Build the implementation with the smallest technology that fits it.
5. Add its Astro route under src/pages/samples/.
6. Give it an individual preview/presence in SampleLibrary.astro; do not assume it should look like Sample 001.
7. Verify keyboard access, reduced motion where relevant, small screens, runtime errors and production build output.

Do not add empty placeholder samples, prebuild hypothetical component mutations, force all experiments through React, or extract shared abstractions until at least two real implementations prove the same boundary.

For each object, work in this order: reconstruct the material first, identify its performative behaviour second, and derive interface mutations third. The source photograph is evidence and reference—not the rendered background.

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

Preserve intentional oddness. Shared code is useful only when it supports the exhibition without flattening the samples. The next object should be allowed to invalidate assumptions made by the first.
