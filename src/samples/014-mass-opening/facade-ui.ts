import {
  rows,
  columns,
  bayState,
  initialState,
  toggle,
  close,
  setSurrounding,
  stepAperture,
  selectRepeat,
  extendProjection,
  setProjectionVariant,
  setSection,
  selectSupport,
  statusLine,
  APERTURE_MIN,
  APERTURE_MAX,
  type BayId,
  type FacadeState,
} from "./facade";
import { titles, supportedSummary, units } from "./content";

const facade = document.querySelector<HTMLElement>("#facade")!;
const status = document.querySelector<HTMLElement>("#facade-status")!;
const rowEls = Array.from(facade.querySelectorAll<HTMLElement>(".row"));
const bays = new Map<BayId, HTMLElement>();
facade.querySelectorAll<HTMLElement>("[data-bay]").forEach((el) => {
  bays.set(el.dataset.bay as BayId, el);
});
const $ = <T extends Element>(sel: string, root: ParentNode = facade) =>
  root.querySelector<T>(sel)!;
const $$ = <T extends Element>(sel: string, root: ParentNode = facade) =>
  Array.from(root.querySelectorAll<T>(sel));

let state: FacadeState = initialState;

function pressed(buttons: Element[], isOn: (el: HTMLElement) => boolean) {
  buttons.forEach((b) =>
    (b as HTMLElement).setAttribute("aria-pressed", String(isOn(b as HTMLElement))),
  );
}

function renderFacade() {
  rowEls.forEach((row, r) =>
    row.style.setProperty("--cols", columns(rows[r], state.active)),
  );
  for (const [id, el] of bays) {
    const s = bayState(id, state.active);
    el.dataset.state = s;
    const trigger = $<HTMLButtonElement>(".bay-trigger", el);
    const panel = $<HTMLElement>(".bay-panel", el);
    trigger.setAttribute("aria-expanded", String(s === "open"));
    panel.hidden = s !== "open";
  }
  status.textContent = statusLine(state, titles);
}

function renderMass() {
  const demo = $<HTMLElement>(".demo-mass");
  demo.dataset.surrounding = state.surrounding;
  pressed($$("[data-surrounding]", demo), (b) => b.dataset.surrounding === state.surrounding);
}

function renderRecess() {
  const demo = $<HTMLElement>(".demo-recess");
  demo.dataset.aperture = String(state.aperture);
  $<HTMLElement>("#aperture-level").textContent = `${state.aperture} / ${APERTURE_MAX}`;
  $<HTMLButtonElement>("#aperture-narrow").disabled = state.aperture <= APERTURE_MIN;
  $<HTMLButtonElement>("#aperture-enlarge").disabled = state.aperture >= APERTURE_MAX;
}

function renderRepetition() {
  const demo = $<HTMLElement>(".demo-repetition");
  const unitEls = $$<HTMLButtonElement>(".unit", demo);
  pressed(unitEls, (b) => Number(b.dataset.unit) === state.repeat);
  unitEls.forEach((b) => b.classList.toggle("is-wide", Number(b.dataset.unit) === state.repeat));
  $<HTMLButtonElement>("#restore-rhythm").disabled = state.repeat === null;
  $<HTMLElement>("#rhythm-status").textContent =
    state.repeat === null
      ? "Seven equal widths"
      : `Unit 0${state.repeat + 1} widened / ${units.length - 1} units narrowed, none removed`;
}

function renderProjection() {
  const demo = $<HTMLElement>(".demo-projection");
  const { extended, variant } = state.projection;
  demo.dataset.extended = String(extended);
  demo.dataset.variant = variant;
  const surface = $<HTMLElement>("#projection-surface");
  if (extended) surface.removeAttribute("inert");
  else surface.setAttribute("inert", "");
  const button = $<HTMLButtonElement>("#extend-projection");
  button.setAttribute("aria-expanded", String(extended));
  button.textContent = extended ? "Retract comparison" : "Extend comparison";
  $<HTMLElement>("#projection-status").textContent = extended
    ? `Comparison extended / showing ${variant} / anchor unchanged`
    : "Comparison retracted";
  pressed($$("[data-variant]", demo), (b) => b.dataset.variant === variant);
}

function renderSection() {
  const demo = $<HTMLElement>(".demo-section");
  demo.dataset.view = state.section;
  const face = $<HTMLElement>(".face", demo);
  const bands = $<HTMLElement>(".bands", demo);
  if (state.section === "face") {
    face.removeAttribute("inert");
    bands.setAttribute("inert", "");
  } else {
    bands.removeAttribute("inert");
    face.setAttribute("inert", "");
  }
  pressed($$("[data-view]", demo), (b) => b.dataset.view === state.section);
}

function renderSupport() {
  const demo = $<HTMLElement>(".demo-support");
  demo.dataset.support = state.support ?? "";
  pressed($$("[data-support]", demo), (b) => b.dataset.support === state.support);
  $$<HTMLElement>(".passage", demo).forEach((p) =>
    p.classList.toggle("is-held", p.dataset.passage === state.support),
  );
  const passage = supportedSummary.passages.find((p) => p.key === state.support);
  $<HTMLElement>("#support-note").textContent = passage
    ? `${passage.label}: ${passage.note}`
    : "Select a connection.";
}

function render() {
  renderFacade();
  renderMass();
  renderRecess();
  renderRepetition();
  renderProjection();
  renderSection();
  renderSupport();
}

function commit(next: FacadeState) {
  if (next === state) return;
  state = next;
  render();
}

/** Closing shrinks the row. Keep the visitor near the bay rather than sending them anywhere. */
function closeBay(id: BayId, returnFocus: boolean) {
  const bay = bays.get(id)!;
  const trigger = $<HTMLButtonElement>(".bay-trigger", bay);
  commit(close(state));
  if (returnFocus) trigger.focus({ preventScroll: true });
  const top = bay.getBoundingClientRect().top;
  if (top < 0) bay.scrollIntoView({ block: "start", behavior: "auto" });
}

facade.addEventListener("click", (event) => {
  const target = (event.target as HTMLElement).closest<HTMLElement>("button");
  if (!target) return;
  const d = target.dataset;
  if (d.trigger) {
    const id = d.trigger as BayId;
    if (state.active === id) closeBay(id, false);
    else commit(toggle(state, id));
  } else if (d.close) closeBay(d.close as BayId, true);
  else if (d.surrounding) commit(setSurrounding(state, d.surrounding as FacadeState["surrounding"]));
  else if (d.apertureStep) commit(stepAperture(state, Number(d.apertureStep)));
  else if (d.unit !== undefined) commit(selectRepeat(state, Number(d.unit)));
  else if (target.id === "restore-rhythm") commit(selectRepeat(state, null));
  else if (target.id === "extend-projection") commit(extendProjection(state, !state.projection.extended));
  else if (d.variant) commit(setProjectionVariant(state, d.variant as FacadeState["projection"]["variant"]));
  else if (d.view) commit(setSection(state, d.view as FacadeState["section"]));
  else if (d.support) commit(selectSupport(state, d.support as FacadeState["support"]));
});

facade.addEventListener("keydown", (event) => {
  if (event.key !== "Escape" || !state.active) return;
  const bay = bays.get(state.active)!;
  if (!bay.contains(event.target as Node)) return;
  event.preventDefault();
  closeBay(state.active, true);
});

render();
