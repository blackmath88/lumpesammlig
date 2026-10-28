import { connections, contributions } from './records';
import { emptyDesk, openCircuit, patch, release } from './circuits';
import type { Desk } from './circuits';
const root = document.querySelector<HTMLElement>('#live-desk')!;
let desk: Desk = emptyDesk();
const status = (message: string) => { root.querySelector('#desk-status')!.textContent = message; };
function render() {
  const occupied = desk.filter(Boolean).length;
  root.dataset.full = String(occupied === 2);
  root.querySelector('#capacity-status')!.textContent = `0${occupied} / 02 spaces occupied`;
  root.querySelectorAll<HTMLElement>('.capacity-lamps i').forEach((lamp, i) => lamp.classList.toggle('occupied', i < occupied));
  desk.forEach((circuit, slot) => {
    const el = root.querySelector<HTMLElement>(`[data-slot="${slot}"]`)!;
    el.dataset.phase = circuit?.phase ?? 'empty';
    el.querySelector<HTMLElement>('.slot-empty')!.hidden = !!circuit;
    el.querySelector<HTMLElement>('.slot-content')!.hidden = !circuit;
    el.querySelector('.slot-phase')!.textContent = !circuit ? 'Available' : circuit.phase === 'patched' ? 'Patched · ready to read' : 'Open · reading together';
    el.setAttribute('aria-labelledby', circuit ? `active-slot-title-${slot}` : `slot-title-${slot}`);
    if (!circuit) return;
    const relation = connections.find(c => c.id === circuit.id)!;
    const title = el.querySelector<HTMLElement>('.slot-title')!;
    title.id = `active-slot-title-${slot}`;
    title.textContent = `${relation.from} ↔ ${relation.to}`;
    el.classList.toggle('contested', relation.kind === 'disagrees');
    el.querySelector('.slot-relation')!.textContent = `${relation.kind} / specimen’s interpretation`;
    el.querySelector('.slot-reason')!.textContent = relation.why;
    const voices = el.querySelector<HTMLElement>('.slot-voices')!;
    voices.hidden = circuit.phase !== 'open';
    // Preserve the live comparison DOM when other circuits change (including text selection).
    if (voices.dataset.connection !== circuit.id) {
      voices.replaceChildren();
      for (const id of [relation.from, relation.to]) {
        const source = contributions.find(c => c.id === id)!;
        const block = document.createElement('div');
        const heading = document.createElement('p');
        heading.className = 'voice-byline';
        heading.textContent = `${source.id} / ${source.author}`;
        const quote = document.createElement('blockquote');
        quote.textContent = source.text;
        const link = document.createElement('a');
        link.href = `#source-${source.id}`;
        link.textContent = `Original at ${source.home} ↓`;
        block.append(heading, quote, link);
        voices.append(block);
      }
      voices.dataset.connection = circuit.id;
    }
    const open = el.querySelector<HTMLButtonElement>('[data-open]')!;
    open.hidden = circuit.phase === 'open';
  });
  root.querySelectorAll<HTMLButtonElement>('[data-patch]').forEach(button => {
    const index = desk.findIndex(c => c?.id === button.dataset.patch);
    button.disabled = index !== -1;
    button.textContent = index === -1 ? occupied === 2 ? 'Desk full · release a circuit' : 'Patch this relation ↗' : `On circuit 0${index + 1}`;
    button.closest<HTMLElement>('[data-offer]')!.dataset.patched = String(index !== -1);
  });
  root.querySelector<HTMLButtonElement>('#clear-desk')!.disabled = occupied === 0;
}
root.addEventListener('click', event => {
  const button = (event.target as Element).closest<HTMLButtonElement>('button');
  if (!button) return;
  if (button.dataset.patch) {
    const result = patch(desk, button.dataset.patch);
    desk = result.desk;
    render();
    if (result.result === 'full') { status('Both spaces are occupied. Release a circuit; nothing was replaced.'); return; }
    if (result.result !== 'patched') return;
    const index = desk.findIndex(c => c?.id === button.dataset.patch);
    status(`${button.dataset.patch} patched into circuit 0${index + 1}. Open the comparison when you are ready.`);
    root.querySelector<HTMLButtonElement>(`[data-open="${index}"]`)!.focus();
  } else if (button.dataset.open !== undefined) {
    const slot = Number(button.dataset.open);
    desk = openCircuit(desk, slot);
    render();
    status(`Circuit 0${slot + 1} open. Two unchanged sources, one proposed relation.`);
    root.querySelector<HTMLButtonElement>(`[data-release="${slot}"]`)!.focus();
  } else if (button.dataset.release !== undefined) {
    const slot = Number(button.dataset.release);
    const id = desk[slot]?.id;
    desk = release(desk, slot);
    render();
    status(`${id} released from circuit 0${slot + 1}. Space available; all six originals remain.`);
    if (id) root.querySelector<HTMLButtonElement>(`[data-patch="${id}"]`)!.focus();
  } else if (button.id === 'clear-desk') {
    desk = emptyDesk();
    render();
    status('The operator has left. Both circuits are clear. All six sources remain in the ledger.');
    root.querySelector('#cleared-note')!.textContent = 'No connection remains. No source was erased. Reloading also starts with a clear desk.';
    root.querySelector<HTMLAnchorElement>('.clearing a')!.focus();
  }
});
render();
