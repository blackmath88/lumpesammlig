# Block 14 — a website built like a brutalist building

A standalone visual study in the Lumpesammlig repository. Where sample 014
tests one behaviour (a façade that makes room), this one wears the building:
the page is a single concrete elevation you scroll from roof to ground.

- **Stair tower** on the left with a lift indicator that follows your scroll.
- **Lift panel** on the right is the navigation; the current floor's button is lit.
- **Five floors**: plant room, studio, works (the cantilevered one), archive (narrow slots), ground (pilotis and an entrance recess).
- **Windows** are cut into the wall: reveal, glass, sill, weathering streak.
- **Day / night** switch: the sky darkens, the concrete cools, the windows light up.

No images. Concrete is layered gradients plus an inline SVG noise tile; depth is shadow.

```bash
cd brutal-building
npm install
npm run dev
```

`npm run build` writes a relative-path bundle to `dist/`, so it can be hosted from any subpath.
This folder is independent of the Astro site at the repository root and is not part of its deployment.

Known limits: desktop composition is the primary target; phones get a narrower tower and single-column floors.
Reduced motion removes transitions and smooth scrolling. No accessibility audit beyond native buttons, labels, focus styles and a skip link.
