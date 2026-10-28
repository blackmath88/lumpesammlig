import { connections, contributions } from "./records";
let topic = "all",
  relation = "all",
  selected = "";
const unplugged = new Set<string>();
const list = document.querySelector<HTMLElement>("#connection-list")!;
const cables = document.querySelector<SVGGElement>("#cables")!;
const toggle = document.querySelector<HTMLButtonElement>("#toggle-cable")!;
const positions: Record<string, [number, number]> = {
  A: [90, 75],
  B: [320, 75],
  C: [550, 75],
  D: [90, 325],
  E: [320, 325],
  F: [550, 325],
};
function visible() {
  return connections.filter(
    (c) =>
      (topic === "all" || c.topic === topic) &&
      (relation === "all" || c.kind === relation),
  );
}
function inspect() {
  const c = connections.find((c) => c.id === selected);
  document.querySelector("#inspector-title")!.textContent = c
    ? `${c.from} ↔ ${c.to} / ${c.kind}`
    : "Select a connection";
  document.querySelector("#connection-reason")!.textContent = c
    ? c.why
    : "Every line joins two source records. Inspect a route below to see why they were connected.";
  const endpoints = document.querySelector("#connection-endpoints")!;
  endpoints.replaceChildren();
  if (c)
    for (const id of [c.from, c.to]) {
      const source = contributions.find((s) => s.id === id)!;
      const link = document.createElement("a");
      link.href = `#source-${id}`;
      link.textContent = `${id} / ${source.author} → original contribution`;
      endpoints.append(link);
    }
  toggle.disabled = !c;
  toggle.textContent =
    c && unplugged.has(c.id)
      ? "Reconnect selected cable"
      : "Unplug selected cable";
}
function render() {
  const shown = visible();
  let active = 0;
  cables.replaceChildren();
  list
    .querySelectorAll<HTMLButtonElement>("[data-connection]")
    .forEach((button) => {
      const c = shown.find((c) => c.id === button.dataset.connection);
      button.hidden = !c;
      if (!c) return;
      const off = unplugged.has(c.id);
      button.classList.toggle("unplugged", off);
      button.classList.toggle("disagrees", c.kind === "disagrees");
      button.setAttribute("aria-pressed", String(selected === c.id));
      button.querySelector("small")!.textContent = off
        ? "Unplugged / inspect ↗"
        : "Connected / inspect ↗";
      if (off) return;
      active++;
      const [x1, y1] = positions[c.from],
        [x2, y2] = positions[c.to];
      const path = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path",
      );
      path.setAttribute(
        "d",
        y1 === y2
          ? `M${x1} ${y1} Q${(x1 + x2) / 2} ${y1 === 75 ? 200 : 200} ${x2} ${y2}`
          : `M${x1} ${y1} C${x1} 200 ${x2} 200 ${x2} ${y2}`,
      );
      path.setAttribute(
        "class",
        `${c.kind === "disagrees" ? "disagrees" : ""} ${selected === c.id ? "selected" : ""}`,
      );
      cables.append(path);
    });
  document.querySelector<HTMLElement>("#routing-empty")!.hidden = active !== 0;
  document.querySelector("#routing-status")!.textContent =
    `${active} connected / ${shown.length} routes in this lens / 6 source records unchanged`;
  inspect();
}
function setLens(kind: "topic" | "relation", button: HTMLButtonElement) {
  if (kind === "topic") topic = button.dataset.topic!;
  else relation = button.dataset.relation!;
  selected = "";
  document
    .querySelectorAll(`[data-${kind}]`)
    .forEach((el) => el.setAttribute("aria-pressed", String(el === button)));
  render();
}
document
  .querySelectorAll<HTMLButtonElement>("[data-topic]")
  .forEach((b) => b.addEventListener("click", () => setLens("topic", b)));
document
  .querySelectorAll<HTMLButtonElement>("[data-relation]")
  .forEach((b) => b.addEventListener("click", () => setLens("relation", b)));
list.querySelectorAll<HTMLButtonElement>("[data-connection]").forEach((b) =>
  b.addEventListener("click", () => {
    selected = b.dataset.connection!;
    render();
    document.querySelector<HTMLElement>("#inspector-title")!.focus();
  }),
);
toggle.addEventListener("click", () => {
  if (unplugged.has(selected)) unplugged.delete(selected);
  else unplugged.add(selected);
  render();
});
document.querySelector("#unplug-all")!.addEventListener("click", () => {
  connections.forEach((c) => unplugged.add(c.id));
  render();
});
document.querySelector("#restore-cables")!.addEventListener("click", () => {
  unplugged.clear();
  render();
});
render();
