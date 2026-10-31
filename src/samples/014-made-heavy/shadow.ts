// Experiment 02 — Shadow as material.
// A deep façade: bays sit behind ribs. How much of a bay you can see, and whether
// you can act on it, depends on where you stand. Depth 0 is the flat façade we already have.

export type Bay = { id: string; label: string; text: string; position: number /* -1 .. 1 across the façade */ };
export type Facade = { eye: number /* -1 .. 1 */; depth: number /* 0 .. 1 */; kept: string[] };

/** Angular tolerance inside which a bay is faced squarely. */
export const SQUARE = 0.22;
/** Visible fraction of a bay at which its action becomes available. */
export const ACTIONABLE = 0.6;

export function reveal(eye: number, position: number, depth: number): number {
  const oblique = Math.max(0, Math.abs(eye - position) - SQUARE);
  return Math.max(0, Math.min(1, 1 - oblique * depth * 2.2));
}

export function visible(facade: Facade, bay: Bay): number {
  return reveal(facade.eye, bay.position, facade.depth);
}

export function actionable(facade: Facade, bay: Bay): boolean {
  return visible(facade, bay) >= ACTIONABLE;
}

export function face(facade: Facade, bay: Bay): Facade {
  return { ...facade, eye: bay.position };
}

export function look(facade: Facade, eye: number): Facade {
  return { ...facade, eye: Math.max(-1, Math.min(1, eye)) };
}

export function setDepth(facade: Facade, depth: number): Facade {
  return { ...facade, depth: Math.max(0, Math.min(1, depth)) };
}

/** Keeping a bay is only possible while you face it. Returns the same façade otherwise. */
export function toggleKeep(facade: Facade, bay: Bay): Facade {
  if (!actionable(facade, bay)) return facade;
  const kept = facade.kept.includes(bay.id) ? facade.kept.filter(id => id !== bay.id) : [...facade.kept, bay.id];
  return { ...facade, kept };
}

export function initialFacade(): Facade {
  return { eye: 0, depth: 0.8, kept: [] };
}

export const bays: Bay[] = [
  { id: 'piers', label: 'Piers', text: 'Supports enlarged, exposed or widened toward the top. Concentrated force, visible bearing.', position: -1 },
  { id: 'raised', label: 'Raised volume', text: 'Occupied floors above an open lower level. A heavy object apparently lifted from the ground.', position: -2 / 3 },
  { id: 'cantilever', label: 'Cantilever', text: 'A volume projecting beyond its immediate support. Tension between mass and suspension.', position: -1 / 3 },
  { id: 'deep', label: 'Deep façade', text: 'Windows behind projecting frames and substantial reveals. Thickness, shadow, enclosure.', position: 0 },
  { id: 'modules', label: 'Repeated modules', text: 'Bays, balconies, panels recurring across the elevation. Order, production, collective scale.', position: 1 / 3 },
  { id: 'massing', label: 'Sculptural massing', text: 'Cubes, cylinders, wedges combined into one composition. A building that reads as an object.', position: 2 / 3 },
  { id: 'ribs', label: 'Sun-screen ribs', text: 'Projecting members in front of glazing. A façade whose appearance changes with the light.', position: 1 },
];
