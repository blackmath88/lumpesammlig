# Collecting-table edition — 2026-11-03

Applied the supplied collecting-table patch to upstream main at `6bd8fde` for the existing
GitHub Pages deployment at https://blackmath88.github.io/lumpesammlig/.
The per-entry roadmap remains a future plan.

The table stages the collection as things laid out together. It is an entrance into the studies;
the readable catalogue remains underneath it. Laid Coil is explicitly a material study: the slider
lays a continuous length of coiled material, while the pointer changes only its lighting.

Deployment preparation preserves the `/lumpesammlig` asset base and updates the lockfile. Other fixes:
direct tap hit-testing and retained
touch selection; enhancement failure fallback; accessible specimen names and coil slider label;
zero progress draws no tube segments; coil animation cancels offscreen; mobile captions clear the
navigation strip.

Verification:
- Astro check: 0 errors, 0 warnings, 2 existing hints in `scripts/check-study-dom.mjs`.
- Production build: 14 pages; all generated CSS references resolve.
- 7 asset tests and 12 existing study tests pass.
- Browser: table render, keyboard specimen selection and captions, 390 × 844 mobile layout,
  coil rendering and keyboard 0% / 100% states. No errors in the inspected browser console.
- Reduced-motion and no-WebGL paths were reviewed in source, not browser-emulated. Physical
  touchscreen gestures were not tested.

The browser pass exposed a caption/navigation overlap at mobile width and an implicit range label
that bound to the nested output instead of the input; both were corrected. The table successfully
gives a spatial overview, but the specimen faces remain captured previews rather than live studies.
Whether its pace and material impression suit the collection remains an owner judgment.
