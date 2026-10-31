// Experiment 01 — Support as the subject.
// A small structural model: regions of content bear on a few piers.
// What carries what is computed, never decorated.

export const COLUMNS = 12;
export const MAX_PIERS = 5;
export const MIN_PIERS = 1;
/** Columns a region may extend past its outermost pier before it reads as a cantilever. */
export const CANTILEVER_LIMIT = 3;

export type Mass = 1 | 2 | 3;
export type Pier = { id: string; column: number; mass: Mass };
export type Region = { id: string; title: string; text: string; start: number; end: number };
export type Structure = { piers: Pier[]; regions: Region[] };

export type BearingState = 'bearing' | 'cantilever' | 'grounded';
export type Bearing = {
  region: string;
  piers: string[];
  state: BearingState;
  /** Columns the region projects past its outermost pier on either side. */
  overhang: { left: number; right: number };
};
export type PierLoad = { pier: string; load: number; regions: string[]; rhetorical: boolean };

export function bearings(structure: Structure): Bearing[] {
  return structure.regions.map(region => {
    const supporting = structure.piers.filter(p => p.column >= region.start && p.column <= region.end);
    if (supporting.length === 0) return { region: region.id, piers: [], state: 'grounded', overhang: { left: 0, right: 0 } };
    const columns = supporting.map(p => p.column);
    const left = Math.min(...columns) - region.start;
    const right = region.end - Math.max(...columns);
    const state: BearingState = Math.max(left, right) >= CANTILEVER_LIMIT ? 'cantilever' : 'bearing';
    return { region: region.id, piers: supporting.map(p => p.id), state, overhang: { left, right } };
  });
}

/** Actual load per pier: each bearing region distributes its width evenly over its supporting piers. */
export function loads(structure: Structure): PierLoad[] {
  const all = bearings(structure);
  return structure.piers.map(pier => {
    const carried = all.filter(b => b.piers.includes(pier.id));
    const load = carried.reduce((sum, b) => {
      const region = structure.regions.find(r => r.id === b.region)!;
      return sum + (region.end - region.start + 1) / b.piers.length;
    }, 0);
    return { pier: pier.id, load: Math.round(load * 10) / 10, regions: carried.map(b => b.region), rhetorical: pier.mass >= 2 && carried.length === 0 };
  });
}

export function movePier(structure: Structure, id: string, delta: number): Structure {
  const pier = structure.piers.find(p => p.id === id);
  if (!pier) return structure;
  const column = Math.max(0, Math.min(COLUMNS - 1, pier.column + delta));
  if (column === pier.column || structure.piers.some(p => p.id !== id && p.column === column)) return structure;
  return { ...structure, piers: structure.piers.map(p => (p.id === id ? { ...p, column } : p)) };
}

export function addPier(structure: Structure, column: number): Structure {
  if (structure.piers.length >= MAX_PIERS) return structure;
  if (column < 0 || column >= COLUMNS || structure.piers.some(p => p.column === column)) return structure;
  const used = new Set(structure.piers.map(p => p.id));
  const id = ['P1', 'P2', 'P3', 'P4', 'P5'].find(candidate => !used.has(candidate))!;
  const piers = [...structure.piers, { id, column, mass: 1 as Mass }].sort((a, b) => a.column - b.column);
  return { ...structure, piers };
}

export function removePier(structure: Structure, id: string): Structure {
  if (structure.piers.length <= MIN_PIERS) return structure;
  return { ...structure, piers: structure.piers.filter(p => p.id !== id) };
}

export function setMass(structure: Structure, id: string, mass: Mass): Structure {
  return { ...structure, piers: structure.piers.map(p => (p.id === id ? { ...p, mass } : p)) };
}

/** The first free column nearest the centre, for "add a pier". */
export function freeColumn(structure: Structure): number | null {
  const taken = new Set(structure.piers.map(p => p.column));
  const order = [...Array(COLUMNS).keys()].sort((a, b) => Math.abs(a - 5.5) - Math.abs(b - 5.5));
  return order.find(c => !taken.has(c)) ?? null;
}

export function initialStructure(): Structure {
  return {
    piers: [
      { id: 'P1', column: 2, mass: 2 },
      { id: 'P2', column: 6, mass: 1 },
      { id: 'P3', column: 10, mass: 3 },
    ],
    regions: [
      { id: 'reflection', title: 'Reflection', text: 'A pier can look enormous and carry nothing. The image of support and the actual load path can disagree.', start: 9, end: 11 },
      { id: 'distinction', title: 'Distinction', text: 'Interfaces have shadow without load. Brutalism has load that produces its own shadow.', start: 6, end: 11 },
      { id: 'reading', title: 'Reading', text: 'The effect comes from making a building appear to bear, suspend, resist, repeat or concentrate force.', start: 4, end: 8 },
      { id: 'encounter', title: 'Encounter', text: 'Two research reports, no building visited. The evidence here is secondary and says so.', start: 0, end: 4 },
      { id: 'transformation', title: 'Transformation', text: 'Every region of this page rests on a pier. Move the piers and the regions must follow, project or drop.', start: 0, end: 11 },
    ],
  };
}
