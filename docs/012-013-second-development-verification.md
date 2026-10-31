# Second development of 012 / 013 · verification

Base: `c69ccc2e68a164d9969aa7fdc4e246c897bc864e`. Scope and semantic acceptance are in `012-013-development-ledger.md`; primary sources, alternatives and falsification questions are in `research/012-013-held-place-live-circuits.md`.

## Delivered

012 has a working held place with title, subject and vocabulary filings. Holding preserves record identity while the neighbourhood changes; releasing preserves position. The previous neighbours are named, and each new neighbour gives its filing reason. All original fixtures and the exact-term query remain.

013 has two circuit positions with patch/open/release states, actual pairwise reading, explicit occupancy, full-desk refusal without replacement, individual release and clearing. Every source contribution survives. The first unrestricted diagram remains as a baseline rather than being rewritten to claim a lifecycle it never had.

Collection previews now identify both experiments. Previously 012 and 013 used the fallback CordField intended for a different object. The metadata describes the new behaviour.

## Checks

- `npm run check`: 76 source files, zero errors, warnings or hints.
- `npm run test:studies`: seven model tests cover identity versus position, stable vocabulary reference, complete record retention, boundaries, capacity refusal, duplicate/unknown refusal, immutable originals and release/reallocation.
- `npm run test:assets`: seven CSS guard tests pass.
- `npm run build`: all 13 pages and 13 stylesheet references pass the production asset check.
- `scripts/check-study-dom.mjs`: 30 DOM integration assertions using jsdom 27.4.0. Loads production HTML and bundles the actual study controllers, including both pre-existing controllers on the same page. Exercises hold/file/release, arrow-key selection and focus, exact-term query coexistence, patch/open/full/release/reallocate/clear, preserved sources, map coexistence and unique IDs.
- `git diff --check`.

To reproduce DOM checks without adding a project dependency:

```sh
npm ci
npm run build
npm install --prefix /tmp/lumpesammlig-dom --no-audit --no-fund jsdom@27.4.0
node scripts/check-study-dom.mjs /tmp/lumpesammlig-dom/node_modules/jsdom/lib/api.js
```

PR CI runs these same model, production and DOM checks on Node 22. jsdom is installed into the runner's temporary directory; no dependency or lockfile change is needed for the study runtime.

## Explicit limits

Browser preview was attempted, not passed. The local development server was unavailable to the connected browser; the production server was also unreachable across the execution environment's network boundary. The browser's URL policy rejects self-contained data previews. No browser-policy workaround was used. DOM simulation is not a rendering engine: no screenshot, responsive-layout, actual browser keyboard, reduced-motion emulation or assistive-technology validation is claimed for this iteration.

The CSS includes narrow-screen layouts, visible focus and a reduced-motion override, but these require real browser verification before acceptance. The static HTML retains the complete source ledger/archive without JavaScript. Source availability is structurally inspected, not browser-tested with scripting disabled.

This is coordinator self-review, not an enforced independent review. No claim of user comprehension, historical simulation, search superiority or achievement of the je ne sais quoi follows from the tests. The branch remains a draft for visual and human review. No merge or deliberate deployment was performed.
