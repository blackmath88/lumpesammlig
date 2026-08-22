# Lumpesammlig

**Real objects → web artefacts.**

Lumpesammlig is an experimental front-end collection built from ordinary physical objects, surfaces, mechanisms and material behaviours. Each sample asks: what happens if we translate the object's *logic* into a native web interaction instead of photographing it and using the photo as decoration?

## Sample 001 — Waschlumpe

A loosely knitted washcloth becomes a procedural, interactive textile surface. The canvas is generated at runtime; there is no background image. Pointer movement introduces smooth wave-like tension, while the knit itself stays deliberately irregular and handmade.

## Why Astro + islands?

The collection is intentionally open-ended. Future samples may need very different rendering strategies:

- ordinary HTML/CSS for typographic or layout studies;
- React for stateful components;
- Canvas 2D for lightweight procedural surfaces;
- Three.js / React Three Fiber for true 3D, shaders and material studies;
- WebGL/WebGPU experiments when a sample needs game-like rendering;
- minimal or zero JavaScript for samples that do not need it.

Astro lets each sample hydrate only the interactive islands it needs instead of forcing the whole exhibition into one client-side application.

## Structure

```text
src/
  components/
    KnitSurface.tsx          # sample 001 interactive hero
    SampleLibrary.astro      # collection / library view
  data/
    samples.ts               # sample catalogue metadata
  pages/
    index.astro              # landing + collection
    samples/
      001-waschlumpe.astro   # dedicated sample page
```

## Run

```bash
npm install
npm run dev
```

Then open the local Astro URL shown in the terminal.

## Direction

Each new sample should ideally contain:

1. the real-world source object;
2. the observation: what is formally or behaviourally interesting about it;
3. the web translation;
4. one hero interaction;
5. component-level variations showing how the idea can escape the background and become navigation, cards, controls, separators, loaders, forms, etc.;
6. a short technical note documenting why a particular rendering strategy was chosen.

The collection is not a UI kit. It is a promenade through possible front ends.
