import { connections } from './records.ts';
export type ConnectionId = (typeof connections)[number]['id'];
export type Circuit = { id: ConnectionId; phase: 'patched' | 'open' };
export type Desk = readonly (Circuit | null)[];
export const emptyDesk = (): Desk => [null, null];
export type PatchResult = { desk: Desk; result: 'patched' | 'full' | 'duplicate' | 'unknown' };
export function patch(desk: Desk, id: string): PatchResult {
  if (!connections.some(c => c.id === id)) return { desk, result: 'unknown' };
  if (desk.some(c => c?.id === id)) return { desk, result: 'duplicate' };
  const slot = desk.findIndex(c => c === null);
  if (slot === -1) return { desk, result: 'full' };
  return { desk: desk.map((c, i) => i === slot ? { id: id as ConnectionId, phase: 'patched' as const } : c), result: 'patched' };
}
export function openCircuit(desk: Desk, slot: number): Desk {
  return desk.map((c, i) => i === slot && c ? { ...c, phase: 'open' as const } : c);
}
export function release(desk: Desk, slot: number): Desk {
  return desk.map((c, i) => i === slot ? null : c);
}
