# 014 — Made Heavy

Four experiments from one researched encounter with Russian Soviet-era brutalism. The study is deliberately plural: the research describes a tectonic language, not a single building, and four of its distinctions were different enough to deserve separate executable trials rather than one composite.

## Encounter

Secondary only. Two research reports supplied by the author sit in `encounter/` with a README stating what they are and are not. No building was visited, photographed or measured. The surfaces of this page are paper and ink, not concrete, on purpose: the encounter gave us a language of bearing, suspension, repetition and trace, and no permission to paint anything grey.

## Situated reading

The second report's central claim is that the effect does not come from concrete. It comes from making a building *appear to bear, suspend, resist, repeat or concentrate force*. That is already a description of behaviour. The report then separates the structural medium (reinforced concrete) from its two surface logics (continuous cast, repeated precast), lists the compositional devices (piers, raised volume, cantilever, deep façade, modules, massing, sun-screen ribs), and, citing Vassiliev, warns that the image of support and the actual engineering are not always the same thing.

The first report adds the social double edge: the same monumental scale that dignifies a collective can subordinate the individual, and the Soviet system produced both repetitive background fabric and singular representational exceptions.

## Distinction

Why this and not its nearest peer in interface design? The nearest peer is elevation: cards floating on drop shadows, a z-index stack. Interfaces have **shadow without load**. Brutalism has **load that produces its own shadow**. The piers are the composition; the shadow is where the mass stops the light. Nothing in current UI practice makes what-carries-what legible, and nothing makes depth consequential. That inversion is the permission for the whole study.

## Transformations and what each tests

**01 Piers · support as the subject.** Five regions of this study's own prose rest on a few piers across twelve columns. The visitor moves, adds and removes piers; regions bear, project past their outermost pier as cantilevers, or drop to the ground when nothing stands beneath them. Each pier also has an *apparent* mass chosen freely by the visitor and an *actual* load computed from what it carries. A heavy-looking pier carrying nothing is reported as rhetorical. Tests whether a visitor can read structure before reading content, and whether the disagreement between image and load is perceptible as an interaction rather than as a caption.

**02 Façade · shadow as material.** Seven bays, each carrying one device from the research, sit behind ribs. The visitor's standing position (a slider, or clicking a rib to turn and face it) and the façade's depth determine how much of each bay is revealed. Crucially, a bay's action is only available while it is faced squarely; screened bays can be seen in part but not acted on. Depth zero collapses the façade into the flat interface we already have, where everything is reachable from anywhere. Tests whether screening that changes what you can do reads as depth rather than as a lighting gimmick.

**03 Panels · provision and exception.** One unit that cannot be designed, a 12 × 7 site, and arrangement as the only act. A rule classifies every connected mass as fabric (a grounded rectangular block), exception (at least six units with overhang, open ground beneath, or a non-rectangular profile of some height) or unbuildable (nothing reaches the ground). Presets show the same unit as a housing block, a raised volume on two piers, and a ring on legs after the Druzhba sanatorium. Tests whether monumentality can be felt to emerge from arrangement alone, with the unit held constant.

**04 Pours · the wall as record of manufacture.** Text is poured in sequence. A struck pour cannot be edited. It can only be overcast by a later pour, and the covered pour keeps its first words as a sliver at the seam, permanently, on the surface. Formwork grain alternates with each pour and tie pitch tightens on patches, so construction order is legible without opening anything. Nearest peer: track changes, where history is a layer you toggle. Here the history is the surface. Tests whether a sequence legible in the finished surface reads as honesty or as clutter.

## What the executable versions revealed · 2026-10-31

**01.** The strongest moment is not moving a pier but removing one: a region that only it carried falls to the ground row, and the structure visibly reorganises around an absence. The rhetorical pier is harder to feel than to compute. It works when the load path is toggled on and a monumental pier reads "carries nothing" beside a slender one carrying most of the wall; it does not announce itself without the toggle. That is probably correct to the source, where structural honesty is an aspiration rather than a fact, but it means the point depends on inspection.

**02.** Depth zero turned out to be the most explanatory control, because it names the peer inside the experiment. With depth on, the disabled action is what makes the screening real; without it the slider is exactly the lighting gimmick the repository warns about. The façade is one-dimensional. A real deep façade also screens vertically and by distance, which this does not attempt.

**03.** The rule had to be written down to be fair, and once written it is visibly crude: it rewards overhang and open ground, so a visitor can game an "exception" with a two-unit lip. That is honest about the source too. The research says the exceptional buildings were a matter of commission and programme, not of profile. The verdict is this study's rule, not a theory of monumentality.

**04.** The sliver is the whole experiment. Hiding the covered text entirely would have made this undo with a texture; showing it in full would have made it a diff. A crushed first line at the seam is enough to make the earlier pour present without reopening it. Formwork grain is decorative by the repository's own test and is kept only because this direction is explicitly about trace as surface.

## What weakened, what remains untranslated

The research's social reading (collective promise against individual smallness) is not in any of the four. The fifth direction that would have carried it, a page that refuses to adapt to the viewer, was dropped because any monument could produce it. Scale is therefore untranslated, and so is the archaic-plus-futuristic double image, which belongs to material and silhouette rather than to behaviour.

Nothing here is a building. The piers do not resist moment, the cantilever limit of three columns is a rule of thumb, the panel verdict is a rule of this study, and the pours are text. None of the four has been reviewed by a person who has stood in front of these buildings.

## Falsification

Strip the paper colour, the labels and the word brutalism. 01 still has regions that must rest on something and fall when it goes. 02 still has actions that are only available from where you stand. 03 still has one unit and a verdict by arrangement. 04 still has sealed text that can only be covered, with the seam showing. Those behaviours do not come from ten unrelated sources. They come from the research's feature table and its caution about the image of support.

## Verification record · 2026-10-31

Run on the built output, not on claims: `astro check` with zero diagnostics across 83 files; five model tests covering bearing, cantilever, grounding, rhetorical piers, reveal and actionability, mass verdicts and pour lineage; `npm run build` producing 14 pages with 14 verified stylesheets; 52 jsdom assertions across 012, 013 and 014 in `scripts/check-study-dom.mjs`; and a headless Chromium pass of the page at 1280 px and 390 px with no console, page or request errors, no horizontal overflow at phone width, arrow-key movement across the site grid, focus handed to the keep button after turning to face a bay, and transitions reduced to zero under `prefers-reduced-motion`. Human perceptual review, and review by anyone who has stood in front of these buildings, has not happened.

## Research record · added 2026-10-31

This note remains the study's own account. A fuller record, written after implementation and labelled as retrospective where it reconstructs reasoning, sits beside it: an inventory of the encounter and what is missing in `encounter/README.md`, the cited sources and their check status in `research/sources.md`, the chosen and dropped readings in `readings/`, four decisions in `decisions/`, check re-runs in `feedback/`, and how to resume in `working-state.md`. No user feedback exists yet; the verification record above is the implementing session's report and is re-run, not restated, in `feedback/`.
