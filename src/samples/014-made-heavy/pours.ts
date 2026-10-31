// Experiment 04 — The wall as record of manufacture.
// Text is poured in sequence. A struck pour cannot be edited; it can only be
// overcast by a later pour, and the earlier pour keeps a sliver at the seam.

export type Pour = { index: number; text: string; over: number | null };
export type Wall = { pours: Pour[]; wet: string; patching: number | null };

export type Segment = {
  index: number;
  text: string;
  /** Pour indices this one covers, oldest first. The covered text remains as slivers. */
  covers: { index: number; sliver: string }[];
};

export const SLIVER = 48;

export function initialWall(): Wall {
  return {
    pours: [
      { index: 1, text: 'Cast-in-place concrete is poured into temporary formwork. When the formwork is removed, the surface keeps the grain of the boards, the seams between sections and the positions of the ties.', over: null },
      { index: 2, text: 'These traces are the finished surface. Nothing is added to conceal them.', over: null },
      { index: 3, text: 'The wall is a record of its own manufacture, not only a boundary around a room.', over: null },
    ],
    wet: '',
    patching: null,
  };
}

export function pour(wall: Wall, wet: string): Wall {
  return { ...wall, wet };
}

/** Begin an overcast: the next strike covers pour `index` instead of appending. */
export function startPatch(wall: Wall, index: number): Wall {
  if (!wall.pours.some(p => p.index === index)) return wall;
  return { ...wall, patching: index };
}

export function cancelPatch(wall: Wall): Wall {
  return { ...wall, patching: null };
}

/** Strike the formwork: the wet text becomes a sealed pour. Empty text does nothing. */
export function strike(wall: Wall): Wall {
  const text = wall.wet.trim();
  if (!text) return wall;
  const index = Math.max(0, ...wall.pours.map(p => p.index)) + 1;
  return { pours: [...wall.pours, { index, text, over: wall.patching }], wet: '', patching: null };
}

/** The visible surface: each uncovered pour, carrying slivers of whatever it covers. */
export function surface(wall: Wall): Segment[] {
  const covered = new Set(wall.pours.filter(p => p.over !== null).map(p => p.over as number));
  const segments: Segment[] = [];
  for (const p of wall.pours) {
    if (covered.has(p.index)) continue;
    segments.push({ index: p.index, text: p.text, covers: lineage(wall, p) });
  }
  // The surface keeps the position of the original pour: a patch sits where the pour it covers sat.
  return segments.sort((a, b) => anchor(wall, a.index) - anchor(wall, b.index));
}

function lineage(wall: Wall, p: Pour): { index: number; sliver: string }[] {
  const out: { index: number; sliver: string }[] = [];
  let current = p;
  while (current.over !== null) {
    const below = wall.pours.find(q => q.index === current.over);
    if (!below) break;
    out.unshift({ index: below.index, sliver: below.text.slice(0, SLIVER) });
    current = below;
  }
  return out;
}

function anchor(wall: Wall, index: number): number {
  let current = wall.pours.find(p => p.index === index)!;
  while (current.over !== null) current = wall.pours.find(p => p.index === current.over) ?? current;
  return current.index;
}

/** Formwork direction alternates with each pour; tie pitch tightens for patches. */
export function formwork(index: number, isPatch: boolean): { grain: 'horizontal' | 'vertical'; pitch: number } {
  return { grain: index % 2 ? 'horizontal' : 'vertical', pitch: isPatch ? 18 : 28 };
}
