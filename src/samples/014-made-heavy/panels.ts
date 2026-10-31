// Experiment 03 — Provision and exception.
// One unit, which cannot be designed. Only arrangement. The verdict on whether
// an arrangement is background fabric or a singular exception is computed by rule.

export const GRID_W = 12;
export const GRID_H = 7;
export type Site = boolean[][]; // [row][col]; row 0 is the top, row GRID_H - 1 the ground.

export type Verdict = 'fabric' | 'exception' | 'unbuildable';
export type MassReport = {
  cells: number;
  width: number;
  height: number;
  /** Units with nothing directly beneath them (and not on the ground). */
  overhang: number;
  /** Ground columns inside the footprint left open beneath the mass. */
  openGround: number;
  rectangular: boolean;
  grounded: boolean;
  verdict: Verdict;
};

export const EXCEPTION_MIN_UNITS = 6;

export function emptySite(): Site {
  return Array.from({ length: GRID_H }, () => Array(GRID_W).fill(false));
}

export function toggle(site: Site, row: number, col: number): Site {
  if (row < 0 || row >= GRID_H || col < 0 || col >= GRID_W) return site;
  return site.map((r, y) => (y === row ? r.map((v, x) => (x === col ? !v : v)) : r));
}

export function count(site: Site): number {
  return site.flat().filter(Boolean).length;
}

/** Four-connected masses, reported separately. */
export function masses(site: Site): MassReport[] {
  const seen = emptySite();
  const reports: MassReport[] = [];
  for (let y = 0; y < GRID_H; y++) for (let x = 0; x < GRID_W; x++) {
    if (!site[y][x] || seen[y][x]) continue;
    const cells: [number, number][] = [];
    const stack: [number, number][] = [[y, x]];
    seen[y][x] = true;
    while (stack.length) {
      const [cy, cx] = stack.pop()!;
      cells.push([cy, cx]);
      for (const [dy, dx] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const ny = cy + dy, nx = cx + dx;
        if (ny < 0 || ny >= GRID_H || nx < 0 || nx >= GRID_W || !site[ny][nx] || seen[ny][nx]) continue;
        seen[ny][nx] = true;
        stack.push([ny, nx]);
      }
    }
    reports.push(report(site, cells));
  }
  return reports;
}

function report(site: Site, cells: [number, number][]): MassReport {
  const rows = cells.map(c => c[0]), cols = cells.map(c => c[1]);
  const top = Math.min(...rows), bottom = Math.max(...rows), left = Math.min(...cols), right = Math.max(...cols);
  const width = right - left + 1, height = bottom - top + 1;
  const overhang = cells.filter(([y, x]) => y < GRID_H - 1 && !site[y + 1][x]).length;
  const grounded = bottom === GRID_H - 1;
  let openGround = 0;
  for (let x = left; x <= right; x++) if (!site[GRID_H - 1][x] && cells.some(c => c[1] === x)) openGround++;
  const rectangular = cells.length === width * height;
  let verdict: Verdict;
  if (!grounded) verdict = 'unbuildable';
  else if (cells.length >= EXCEPTION_MIN_UNITS && (overhang >= 2 || openGround >= 2 || (!rectangular && height >= 3))) verdict = 'exception';
  else verdict = 'fabric';
  return { cells: cells.length, width, height, overhang, openGround, rectangular, grounded, verdict };
}

export type Preset = 'block' | 'raised' | 'gear' | 'clear';

export function preset(name: Preset): Site {
  const site = emptySite();
  const fill = (y: number, x: number) => { if (y >= 0 && y < GRID_H && x >= 0 && x < GRID_W) site[y][x] = true; };
  if (name === 'block') {
    for (let y = GRID_H - 3; y < GRID_H; y++) for (let x = 2; x < 10; x++) fill(y, x);
  } else if (name === 'raised') {
    // Two piers, a wide volume lifted above an open ground floor, projecting past both.
    for (let y = GRID_H - 2; y < GRID_H; y++) { fill(y, 3); fill(y, 8); }
    for (let y = GRID_H - 5; y < GRID_H - 2; y++) for (let x = 1; x < 11; x++) fill(y, x);
  } else if (name === 'gear') {
    // Repeated units organised into a ring on two short legs.
    const cx = 5.5, cy = 2.6;
    for (let y = 0; y < GRID_H - 2; y++) for (let x = 0; x < GRID_W; x++) {
      const d = Math.hypot((x - cx) / 1.35, y - cy);
      if (d >= 1.3 && d <= 2.75) fill(y, x);
    }
    for (let y = GRID_H - 2; y < GRID_H; y++) { fill(y, 4); fill(y, 7); }
  }
  return site;
}
