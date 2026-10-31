import { addPier, bearings, freeColumn, initialStructure, loads, movePier, removePier, setMass, COLUMNS, MAX_PIERS, MIN_PIERS } from './piers';
import type { Mass, Structure } from './piers';
import { actionable, bays, face, initialFacade, look, setDepth, toggleKeep, visible } from './shadow';
import type { Facade } from './shadow';
import { count, emptySite, masses, preset, toggle, GRID_H, GRID_W } from './panels';
import type { Preset, Site } from './panels';
import { cancelPatch, formwork, initialWall, pour, startPatch, strike, surface } from './pours';
import type { Wall } from './pours';

const q = <T extends Element>(root: ParentNode, selector: string) => root.querySelector<T>(selector)!;
const massName: Record<Mass, string> = { 1: 'slender', 2: 'heavy', 3: 'monumental' };

/* ---------- 01 Piers ---------- */
const piersRoot = document.querySelector<HTMLElement>('#piers');
if (piersRoot) {
  let structure: Structure = initialStructure();
  let showLoad = false;
  const storeys = q<HTMLElement>(piersRoot, '#storeys');
  const ground = q<HTMLElement>(piersRoot, '#ground');
  const pierRow = q<HTMLElement>(piersRoot, '#pier-row');
  const controls = q<HTMLElement>(piersRoot, '#pier-controls');
  const status = q<HTMLElement>(piersRoot, '#pier-status');
  const loadToggle = q<HTMLButtonElement>(piersRoot, '#load-path');
  const addButton = q<HTMLButtonElement>(piersRoot, '#add-pier');

  function render(message?: string) {
    const all = bearings(structure);
    const pierLoads = loads(structure);
    piersRoot!.dataset.loadPath = String(showLoad);
    storeys.replaceChildren();
    ground.replaceChildren();
    structure.regions.forEach((region, row) => {
      const bearing = all.find(b => b.region === region.id)!;
      const article = document.createElement('article');
      article.className = 'region';
      article.dataset.state = bearing.state;
      article.dataset.region = region.id;
      const title = document.createElement('h4');
      title.textContent = region.title;
      const text = document.createElement('p');
      text.textContent = region.text;
      const note = document.createElement('span');
      note.className = 'bearing-note';
      note.textContent =
        bearing.state === 'grounded' ? 'no pier beneath · on the ground'
        : bearing.state === 'cantilever' ? `projects ${Math.max(bearing.overhang.left, bearing.overhang.right)} columns past ${bearing.piers.join(', ')}`
        : `bears on ${bearing.piers.join(', ')}`;
      article.append(title, text, note);
      if (bearing.state === 'grounded') {
        ground.append(article);
        return;
      }
      article.style.gridColumn = `${region.start + 1} / ${region.end + 2}`;
      article.style.gridRow = String(row + 1);
      const width = region.end - region.start + 1;
      for (const id of bearing.piers) {
        const pier = structure.piers.find(p => p.id === id)!;
        const mark = document.createElement('i');
        mark.className = 'bearing-mark';
        mark.style.left = `${((pier.column - region.start + 0.5) / width) * 100}%`;
        mark.setAttribute('aria-hidden', 'true');
        article.append(mark);
      }
      storeys.append(article);
    });
    ground.hidden = ground.children.length === 0;
    pierRow.replaceChildren();
    for (const pier of structure.piers) {
      const load = pierLoads.find(l => l.pier === pier.id)!;
      const el = document.createElement('div');
      el.className = 'pier';
      el.dataset.pier = pier.id;
      el.dataset.mass = String(pier.mass);
      el.dataset.rhetorical = String(load.rhetorical);
      el.style.gridColumn = String(pier.column + 1);
      el.innerHTML = `<b>${pier.id}</b><span class="pier-load">${showLoad ? `carries ${load.load}` : massName[pier.mass]}</span>`;
      pierRow.append(el);
    }
    controls.replaceChildren();
    for (const pier of structure.piers) {
      const load = pierLoads.find(l => l.pier === pier.id)!;
      const row = document.createElement('div');
      row.className = 'pier-control';
      row.dataset.rhetorical = String(load.rhetorical);
      row.innerHTML = `
        <span class="pier-name"><b>${pier.id}</b> column ${String(pier.column + 1).padStart(2, '0')}</span>
        <span class="pier-move" role="group" aria-label="Move ${pier.id}">
          <button data-move="${pier.id}" data-delta="-1" aria-label="Move ${pier.id} one column left" ${pier.column === 0 ? 'disabled' : ''}>←</button>
          <button data-move="${pier.id}" data-delta="1" aria-label="Move ${pier.id} one column right" ${pier.column === COLUMNS - 1 ? 'disabled' : ''}>→</button>
        </span>
        <label class="pier-mass">image <select data-mass="${pier.id}" aria-label="Apparent mass of ${pier.id}">
          ${([1, 2, 3] as Mass[]).map(m => `<option value="${m}" ${m === pier.mass ? 'selected' : ''}>${massName[m]}</option>`).join('')}
        </select></label>
        <span class="pier-actual">${load.rhetorical ? 'carries nothing' : `carries ${load.load} of ${load.regions.length} region${load.regions.length === 1 ? '' : 's'}`}</span>
        <button data-remove="${pier.id}" ${structure.piers.length <= MIN_PIERS ? 'disabled' : ''}>Remove</button>`;
      controls.append(row);
    }
    addButton.disabled = structure.piers.length >= MAX_PIERS || freeColumn(structure) === null;
    loadToggle.setAttribute('aria-pressed', String(showLoad));
    loadToggle.textContent = showLoad ? 'Hide actual load path' : 'Show actual load path';
    const grounded = all.filter(b => b.state === 'grounded').length;
    const cantilevers = all.filter(b => b.state === 'cantilever').length;
    const rhetorical = pierLoads.filter(l => l.rhetorical).length;
    status.textContent = message ?? `${structure.piers.length} pier${structure.piers.length === 1 ? '' : 's'} · ${cantilevers} cantilever${cantilevers === 1 ? '' : 's'} · ${grounded} on the ground · ${rhetorical} pier${rhetorical === 1 ? '' : 's'} carrying nothing`;
  }

  piersRoot.addEventListener('click', event => {
    const button = (event.target as Element).closest<HTMLButtonElement>('button');
    if (!button) return;
    if (button.dataset.move) {
      const id = button.dataset.move;
      structure = movePier(structure, id, Number(button.dataset.delta));
      render();
      piersRoot!.querySelector<HTMLButtonElement>(`[data-move="${id}"][data-delta="${button.dataset.delta}"]`)?.focus();
    } else if (button.dataset.remove) {
      structure = removePier(structure, button.dataset.remove);
      render(`${button.dataset.remove} removed. Whatever it alone carried is on the ground.`);
      addButton.focus();
    } else if (button === addButton) {
      const column = freeColumn(structure);
      if (column !== null) structure = addPier(structure, column);
      render(`A slender pier added at column ${String((column ?? 0) + 1).padStart(2, '0')}.`);
      controls.querySelector<HTMLButtonElement>('.pier-control:last-child [data-move]')?.focus();
    } else if (button === loadToggle) {
      showLoad = !showLoad;
      render(showLoad ? 'Actual load shown. Compare it with the apparent mass of each pier.' : 'Only the image of support is shown.');
    } else if (button.id === 'reset-piers') {
      structure = initialStructure();
      render('Structure reset.');
    }
  });
  piersRoot.addEventListener('change', event => {
    const select = (event.target as Element).closest<HTMLSelectElement>('select[data-mass]');
    if (!select) return;
    structure = setMass(structure, select.dataset.mass!, Number(select.value) as Mass);
    render(`${select.dataset.mass} now looks ${massName[Number(select.value) as Mass]}. Its load did not change.`);
    piersRoot!.querySelector<HTMLSelectElement>(`select[data-mass="${select.dataset.mass}"]`)?.focus();
  });
  render();
}

/* ---------- 02 Façade ---------- */
const facadeRoot = document.querySelector<HTMLElement>('#facade');
if (facadeRoot) {
  let facade: Facade = initialFacade();
  const eye = q<HTMLInputElement>(facadeRoot, '#eye');
  const status = q<HTMLElement>(facadeRoot, '#facade-status');
  function render(message?: string) {
    facadeRoot!.style.setProperty('--eye', String(facade.eye));
    facadeRoot!.style.setProperty('--depth', String(facade.depth));
    eye.value = String(Math.round(facade.eye * 100));
    eye.setAttribute('aria-valuetext', facade.eye === 0 ? 'facing the centre' : `turned ${Math.round(Math.abs(facade.eye) * 100)}% to the ${facade.eye < 0 ? 'left' : 'right'}`);
    facadeRoot!.querySelectorAll<HTMLButtonElement>('[data-depth]').forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.depth) === facade.depth)));
    let faced = 0;
    for (const bay of bays) {
      const el = q<HTMLElement>(facadeRoot!, `[data-bay="${bay.id}"]`);
      const v = visible(facade, bay);
      el.style.setProperty('--reveal', v.toFixed(3));
      el.dataset.faced = String(actionable(facade, bay));
      el.dataset.kept = String(facade.kept.includes(bay.id));
      const keep = q<HTMLButtonElement>(el, '[data-keep]');
      keep.disabled = !actionable(facade, bay);
      keep.setAttribute('aria-pressed', String(facade.kept.includes(bay.id)));
      keep.textContent = facade.kept.includes(bay.id) ? 'Kept · release' : actionable(facade, bay) ? 'Keep this bay' : 'Turn to face it first';
      q<HTMLElement>(el, '[data-face]').setAttribute('aria-pressed', String(Math.abs(facade.eye - bay.position) < 0.01));
      if (actionable(facade, bay)) faced++;
    }
    status.textContent = message ?? `${faced} of ${bays.length} bays faced squarely · ${facade.kept.length} kept · depth ${facade.depth === 0 ? 'flat' : facade.depth < 0.6 ? 'shallow' : 'deep'}`;
  }
  eye.addEventListener('input', () => { facade = look(facade, Number(eye.value) / 100); render(); });
  facadeRoot.addEventListener('click', event => {
    const button = (event.target as Element).closest<HTMLButtonElement>('button');
    if (!button) return;
    if (button.dataset.face) {
      const bay = bays.find(b => b.id === button.dataset.face)!;
      facade = face(facade, bay);
      render(`Turned to face ${bay.label}.`);
      q<HTMLButtonElement>(facadeRoot!, `[data-bay="${bay.id}"] [data-keep]`).focus();
    } else if (button.dataset.keep) {
      const bay = bays.find(b => b.id === button.dataset.keep)!;
      const before = facade;
      facade = toggleKeep(facade, bay);
      render(facade === before ? `${bay.label} is screened by its rib from here. Turn to face it.` : facade.kept.includes(bay.id) ? `${bay.label} kept.` : `${bay.label} released.`);
      q<HTMLButtonElement>(facadeRoot!, `[data-bay="${bay.id}"] [data-keep]`).focus();
    } else if (button.dataset.depth) {
      facade = setDepth(facade, Number(button.dataset.depth));
      render(facade.depth === 0 ? 'Flat façade: every bay is visible and actionable from anywhere. This is the interface we already have.' : undefined);
    }
  });
  render();
}

/* ---------- 03 Panels ---------- */
const panelsRoot = document.querySelector<HTMLElement>('#panels');
if (panelsRoot) {
  let site: Site = preset('block');
  const grid = q<HTMLElement>(panelsRoot, '#site');
  const report = q<HTMLElement>(panelsRoot, '#site-report');
  const status = q<HTMLElement>(panelsRoot, '#site-status');
  const verdictName = { fabric: 'Fabric', exception: 'Exception', unbuildable: 'Unbuildable' };
  function render(message?: string) {
    for (let y = 0; y < GRID_H; y++) for (let x = 0; x < GRID_W; x++) {
      const cell = q<HTMLButtonElement>(grid, `[data-cell="${y}-${x}"]`);
      cell.setAttribute('aria-pressed', String(site[y][x]));
    }
    const reports = masses(site);
    report.replaceChildren();
    reports.forEach((m, i) => {
      const li = document.createElement('li');
      li.dataset.verdict = m.verdict;
      li.innerHTML = `<b>${verdictName[m.verdict]}</b><span>${m.cells} units · ${m.width} × ${m.height}${m.rectangular ? ' · rectangular' : ''}${m.overhang ? ` · ${m.overhang} overhanging` : ''}${m.openGround ? ` · ${m.openGround} open at ground` : ''}${m.grounded ? '' : ' · nothing reaches the ground'}</span>`;
      report.append(li);
      void i;
    });
    if (!reports.length) {
      const li = document.createElement('li');
      li.textContent = 'Empty site.';
      report.append(li);
    }
    const exceptions = reports.filter(m => m.verdict === 'exception').length;
    status.textContent = message ?? `${count(site)} identical units · ${reports.length} mass${reports.length === 1 ? '' : 'es'} · ${exceptions} exception${exceptions === 1 ? '' : 's'}`;
  }
  grid.addEventListener('click', event => {
    const cell = (event.target as Element).closest<HTMLButtonElement>('[data-cell]');
    if (!cell) return;
    const [y, x] = cell.dataset.cell!.split('-').map(Number);
    site = toggle(site, y, x);
    render();
  });
  grid.addEventListener('keydown', event => {
    const cell = (event.target as Element).closest<HTMLButtonElement>('[data-cell]');
    if (!cell) return;
    const [y, x] = cell.dataset.cell!.split('-').map(Number);
    const delta: Record<string, [number, number]> = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
    const d = delta[event.key];
    if (!d) return;
    event.preventDefault();
    const ny = Math.max(0, Math.min(GRID_H - 1, y + d[0])), nx = Math.max(0, Math.min(GRID_W - 1, x + d[1]));
    q<HTMLButtonElement>(grid, `[data-cell="${ny}-${nx}"]`).focus();
  });
  panelsRoot.addEventListener('click', event => {
    const button = (event.target as Element).closest<HTMLButtonElement>('[data-preset]');
    if (!button) return;
    site = button.dataset.preset === 'clear' ? emptySite() : preset(button.dataset.preset as Preset);
    render(`Preset: ${button.textContent?.trim()}. Same unit, different arrangement.`);
  });
  render();
}

/* ---------- 04 Pours ---------- */
const poursRoot = document.querySelector<HTMLElement>('#pours');
if (poursRoot) {
  let wall: Wall = initialWall();
  const surfaceEl = q<HTMLElement>(poursRoot, '#wall');
  const wet = q<HTMLTextAreaElement>(poursRoot, '#wet');
  const strikeButton = q<HTMLButtonElement>(poursRoot, '#strike');
  const cancelButton = q<HTMLButtonElement>(poursRoot, '#cancel-patch');
  const patchNote = q<HTMLElement>(poursRoot, '#patch-note');
  const status = q<HTMLElement>(poursRoot, '#wall-status');
  function render(message?: string) {
    const segments = surface(wall);
    surfaceEl.replaceChildren();
    for (const segment of segments) {
      const article = document.createElement('article');
      const fw = formwork(segment.index, segment.covers.length > 0);
      article.className = 'pour';
      article.dataset.grain = fw.grain;
      article.dataset.patch = String(segment.covers.length > 0);
      article.dataset.patching = String(wall.patching === segment.index);
      article.style.setProperty('--pitch', `${fw.pitch}px`);
      const label = document.createElement('span');
      label.className = 'pour-label';
      label.textContent = `pour ${String(segment.index).padStart(2, '0')}${segment.covers.length ? ` over ${segment.covers.map(c => String(c.index).padStart(2, '0')).join(', ')}` : ''}`;
      article.append(label);
      for (const cover of segment.covers) {
        const sliver = document.createElement('span');
        sliver.className = 'sliver';
        sliver.textContent = cover.sliver;
        sliver.title = `Pour ${cover.index}, covered. Its first words remain at the seam.`;
        article.append(sliver);
      }
      const text = document.createElement('p');
      text.textContent = segment.text;
      article.append(text);
      const button = document.createElement('button');
      button.dataset.overcast = String(segment.index);
      button.textContent = wall.patching === segment.index ? 'Overcasting this pour' : 'Overcast this pour';
      button.setAttribute('aria-pressed', String(wall.patching === segment.index));
      article.append(button);
      surfaceEl.append(article);
    }
    wet.value = wall.wet;
    strikeButton.disabled = wall.wet.trim().length === 0;
    strikeButton.textContent = wall.patching === null ? 'Strike the formwork' : `Strike over pour ${String(wall.patching).padStart(2, '0')}`;
    cancelButton.hidden = wall.patching === null;
    patchNote.textContent = wall.patching === null
      ? 'The next pour is added at the end of the wall.'
      : `The next pour covers pour ${String(wall.patching).padStart(2, '0')}. The covered text keeps a sliver at the seam; it is not deleted.`;
    const patches = wall.pours.filter(p => p.over !== null).length;
    status.textContent = message ?? `${wall.pours.length} pours struck · ${patches} overcast · ${segments.length} visible on the surface`;
  }
  wet.addEventListener('input', () => { wall = pour(wall, wet.value); strikeButton.disabled = wall.wet.trim().length === 0; });
  poursRoot.addEventListener('click', event => {
    const button = (event.target as Element).closest<HTMLButtonElement>('button');
    if (!button) return;
    if (button === strikeButton) {
      const before = wall;
      wall = strike(wall);
      render(wall === before ? 'Nothing in the formwork.' : `Pour ${String(wall.pours.at(-1)!.index).padStart(2, '0')} struck. It cannot be edited now, only overcast.`);
      wet.focus();
    } else if (button.dataset.overcast) {
      const index = Number(button.dataset.overcast);
      wall = wall.patching === index ? cancelPatch(wall) : startPatch(wall, index);
      render();
      wet.focus();
    } else if (button === cancelButton) {
      wall = cancelPatch(wall);
      render('Overcast cancelled. The next pour is added at the end.');
      wet.focus();
    } else if (button.id === 'reset-wall') {
      wall = initialWall();
      render('Wall reset to its first three pours.');
    }
  });
  render();
}
