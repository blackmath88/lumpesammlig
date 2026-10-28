# GitHub Pages CSS investigation · 2026-10-28

## Finding

The reported mostly unstyled homepage **was not reproducible** during this investigation in fresh Chromium sessions at 1440 and 390 px. No stylesheet/base-path repair is justified by the observed deployment. A prior delivery/cache/client failure remains possible but unproven; it is not reported as the root cause.

Inspected deployment: `23c9c443686e5e49138ddd336d27b590421bd605`, successful [Actions run 40676357292](https://github.com/blackmath88/lumpesammlig/actions/runs/40676357292), downloaded artifact `github-pages` / `12810671706`. No deployment was triggered.

## Actual deployed requests

The homepage is HTTP 200, `text/html; charset=utf-8`. Its stylesheet link is exactly:

```html
<link rel="stylesheet" href="/lumpesammlig/_astro/index.Cwjwdw49.css">
```

Chromium requested `https://blackmath88.github.io/lumpesammlig/_astro/index.Cwjwdw49.css`: HTTP **200**, **text/css; charset=utf-8**, **5402 bytes**, 38 parsed CSS rules. The 79-rule inline stylesheet also parsed. Loaded script requests in the recorded homepage journey returned HTTP 200 with JavaScript MIME types. No failed application requests or uncaught browser exceptions were observed. Chromium initially logged a resource 404 for its favicon; an explicit HTTP probe confirmed `/favicon.ico` returns 404, `text/html; charset=utf-8`. That is unrelated to stylesheet loading.

A diagnostic request to `https://blackmath88.github.io/_astro/index.Cwjwdw49.css` (without the project prefix) returned 404, `text/html; charset=utf-8`. **The deployed HTML does not request this incorrect URL.**

All generated external stylesheet paths were also fetched through Chromium with `cache: no-store`. Each exists in local `dist/_astro/`, in the deployed artifact, and responds live with HTTP 200 / `text/css; charset=utf-8`:

| Path below `/lumpesammlig/_astro/` | Bytes |
| --- | ---: |
| `index.Cwjwdw49.css` | 5402 |
| `001-waschlumpe.Br_vtTYE.css` | 16302 |
| `003-soft-green.D1iW2vHa.css` | 12300 |
| `004-blue-coil.Z-4gxNv9.css` | 13685 |
| `006-flaked-blue.CHxYYJIh.css` | 13958 |
| `007-blue-printed-paper.BpW7dByN.css` | 13730 |
| `008-wordart.BhOXOb6c.css` | 10944 |
| `009-stitched-care.B3pSo29X.css` | 8142 |
| `010-pixels-to-stitches.DA6CiAot.css` | 10013 |
| `011-thread-icons.BdHQXFtW.css` | 9470 |
| `012-impossible-index.DkeSsTki.css` | 4486 |
| `013-switchboard.QFkrOBUq.css` | 6502 |

## Artifact and local production comparison

`astro.config.mjs` already sets `site: 'https://blackmath88.github.io'` and `base: '/lumpesammlig'`. The output artifact's root is served at that prefix; a second nested `dist/lumpesammlig/` directory is neither required nor present.

Homepage CSS SHA-256 is identical live, in the Actions artifact, and in the fresh local production build:

```text
623efc48fe481e732196ce61fe3c7031e4168dbda7728945f29685350d21397f
```

Raw live homepage HTML is byte-for-byte identical to the deployed artifact:

```text
6caf19b16f8783f17bb6a49f59e5b90f849fd83108b506915d0bc0fe87827e18
```

The local build differs only in generated Astro island `uid` values; after normalizing those IDs, the complete homepage HTML is identical. Stylesheet names, paths, scope attributes and content match.

Real Chromium comparison against local `npm run preview` at `/lumpesammlig/`:

| Observation | Desktop 1440 px, local and live | Mobile 390 px, local and live |
| --- | --- | --- |
| Collection background | `rgb(238, 234, 227)` | same |
| Collection header display | `grid`, 3 columns | `grid`, one 350px column |
| Sample display | `grid`, 3 columns | `grid`, one 350px column |
| Collection heading font size | 94px | 46px |
| External stylesheet rules | 38 | 38 |
| Horizontal document overflow | none | none |
| Uncaught browser exceptions | none | none |

Screenshots were inspected for both local/live at both widths; the editorial layout, WordArt CSS artwork, heading sizes and responsive stacking are applied. Inline SVG continuing to render by itself would not establish a CSS delivery failure.

## Change made

The previous build/deployment path did not validate generated stylesheet references. `scripts/check-built-css.mjs` now checks every generated HTML page's stylesheet links against the **expected** `/lumpesammlig/` mount, independently of `config.base`. It resolves paths as a browser would (including nested pages), rejects foreign/root-outside-base URLs, missing files, empty files and HTML masquerading as CSS, and requires a homepage stylesheet link.

`npm run build` runs this check after Astro finishes, so the existing `withastro/action` deployment fails before upload if it emits broken references. A PR-only workflow runs installation, type checking, guard tests and the production build. No styles, base configuration, assets, dependencies or deployment trigger were changed.

## Verification

- `npm ci`: completed using the existing lockfile; 14 pre-existing audit findings reported (1 moderate, 12 high, 1 critical).
- `npm run test:assets`: seven passing cases covering valid nested references, missing asset, absent/duplicated project prefix, HTML payload, empty CSS and lost homepage stylesheet link.
- `npm run check`: 59 files, zero errors/warnings/hints.
- `npm run build`: 12 pages; guard validates 12 stylesheet references to 12 CSS assets.
- Actual-output negative test: temporarily removed the homepage CSS from `dist`, observed guard exit 1 with `index.html: missing CSS asset /lumpesammlig/_astro/index.Cwjwdw49.css`, restored it, and observed the check pass.
- Chromium at 1440 and 390 px on both the public site and local production build, including response status/MIME, parsed stylesheets, computed styles, screenshots and runtime errors.
- `git diff --check`.

This PR closes the missing artifact-validation gap. It does **not** claim to have fixed or diagnosed an unobserved historical stylesheet outage. If the symptom persists in the affected browser, its network/HAR and cached HTML response are needed to identify the difference from the verified public artifact.
