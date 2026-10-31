// Pure state for the façade. The DOM binding in facade-ui.ts renders it;
// nothing here knows about elements, so the accommodation rule can be tested.

export type BayId =
  | "mass"
  | "recess"
  | "repetition"
  | "projection"
  | "section"
  | "support";

export type BayState = "closed" | "open" | "pier";

export type FacadeState = {
  active: BayId | null;
  /** 01 — only the space around the slab changes. */
  surrounding: "compact" | "generous";
  /** 02 — aperture level inside a stable frame. */
  aperture: number;
  /** 03 — which of the equal units is widened. */
  repeat: number | null;
  /** 04 — the comparison surface and which version it shows. */
  projection: { extended: boolean; variant: "floating" | "attached" };
  /** 05 — one object, two organisations. */
  section: "face" | "section";
  /** 06 — which connection is selected. */
  support: "research" | "design" | "limitation" | null;
};

/** Two rows of three bays. Closed widths are unequal but add to twelve. */
export const rows: readonly (readonly BayId[])[] = [
  ["mass", "recess", "repetition"],
  ["projection", "section", "support"],
];

export const closedSpan: Record<BayId, number> = {
  mass: 5,
  recess: 4,
  repetition: 3,
  projection: 3,
  section: 4,
  support: 5,
};

export const OPEN_SPAN = 10;
export const PIER_SPAN = 1;
export const APERTURE_MIN = 1;
export const APERTURE_MAX = 3;
export const REPEAT_COUNT = 7;

export const initialState: FacadeState = {
  active: null,
  surrounding: "compact",
  aperture: 1,
  repeat: null,
  projection: { extended: false, variant: "attached" },
  section: "face",
  support: null,
};

export function rowOf(id: BayId): readonly BayId[] {
  return rows.find((row) => row.includes(id))!;
}

/** A bay is a pier only while a neighbour in its own row is open. */
export function bayState(id: BayId, active: BayId | null): BayState {
  if (active === id) return "open";
  if (active && rowOf(active).includes(id)) return "pier";
  return "closed";
}

export function spans(row: readonly BayId[], active: BayId | null): number[] {
  return row.map((id) => {
    const state = bayState(id, active);
    return state === "open"
      ? OPEN_SPAN
      : state === "pier"
        ? PIER_SPAN
        : closedSpan[id];
  });
}

/** grid-template-columns for a row: the open bay takes space from its row only. */
export function columns(row: readonly BayId[], active: BayId | null): string {
  return spans(row, active)
    .map((n) => `${n}fr`)
    .join(" ");
}

/** Open a bay, switch to it from a neighbour, or close it again. Demo state survives. */
export function toggle(state: FacadeState, id: BayId): FacadeState {
  return { ...state, active: state.active === id ? null : id };
}

export function close(state: FacadeState): FacadeState {
  return state.active ? { ...state, active: null } : state;
}

export function setSurrounding(
  state: FacadeState,
  surrounding: FacadeState["surrounding"],
): FacadeState {
  return { ...state, surrounding };
}

export function stepAperture(state: FacadeState, delta: number): FacadeState {
  const aperture = Math.min(
    APERTURE_MAX,
    Math.max(APERTURE_MIN, state.aperture + delta),
  );
  return aperture === state.aperture ? state : { ...state, aperture };
}

export function selectRepeat(state: FacadeState, index: number | null): FacadeState {
  if (index !== null && (index < 0 || index >= REPEAT_COUNT)) return state;
  return { ...state, repeat: state.repeat === index ? null : index };
}

export function extendProjection(state: FacadeState, extended: boolean): FacadeState {
  return { ...state, projection: { ...state.projection, extended } };
}

export function setProjectionVariant(
  state: FacadeState,
  variant: FacadeState["projection"]["variant"],
): FacadeState {
  return { ...state, projection: { ...state.projection, variant } };
}

export function setSection(state: FacadeState, section: FacadeState["section"]): FacadeState {
  return { ...state, section };
}

export function selectSupport(
  state: FacadeState,
  support: FacadeState["support"],
): FacadeState {
  return { ...state, support: state.support === support ? null : support };
}

/** One line for the status region under the façade. */
export function statusLine(state: FacadeState, titles: Record<BayId, string>): string {
  if (!state.active) return "Open a bay / 06 formal operations";
  const row = rowOf(state.active);
  const piers = row.filter((id) => id !== state.active).map((id) => titles[id]);
  return `${titles[state.active]} open / ${piers.join(" and ")} narrowed to piers`;
}
