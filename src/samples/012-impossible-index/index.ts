import { rank, wordsFor } from "./records";
const input = document.querySelector<HTMLInputElement>("#query")!;
const cards = document.querySelector<HTMLElement>("#index-cards")!;
const unmatched = document.querySelector<HTMLElement>("#unmatched-cards")!;
const elements = new Map(
  Array.from(cards.querySelectorAll<HTMLElement>("[data-record]")).map((el) => [
    el.dataset.record!,
    el,
  ]),
);
let query = "",
  drawer = "All";
function render() {
  const ranked = rank(query).filter(
    (item) => drawer === "All" || item.record.drawer === drawer,
  );
  cards.replaceChildren();
  unmatched.replaceChildren();
  let found = 0,
    other = 0;
  for (const item of ranked) {
    const el = elements.get(item.record.id)!;
    const matches = item.matched.length;
    el.querySelector(".rank")!.textContent = query
      ? matches
        ? `Rank ${++found} / ${matches} pt`
        : "No match"
      : "Unranked";
    el.querySelector(".match-note")!.textContent = query
      ? matches
        ? `Matched: ${item.matched.join(" + ")}. ${matches} of ${wordsFor(query).length} query terms.`
        : "No controlled terms match this question."
      : "Classification existed before your query.";
    el.classList.toggle("matched", !!query && matches > 0);
    if (query && !matches) {
      unmatched.append(el);
      other++;
    } else cards.append(el);
  }
  document.querySelector<HTMLElement>("#index-empty")!.hidden =
    !query || found > 0;
  document.querySelector<HTMLElement>("#unmatched-drawer")!.hidden =
    other === 0;
  document.querySelector("#unmatched-label")!.textContent =
    `${other} unmatched records / still in the archive`;
  document.querySelector("#index-status")!.textContent = query
    ? `${found} matching / ${ranked.length} records in ${drawer === "All" ? "all drawers" : drawer} / question: “${query}”`
    : `${ranked.length} records / accession order / ${drawer === "All" ? "all drawers" : drawer}`;
}
function submit() {
  const words = wordsFor(input.value);
  const error = document.querySelector<HTMLElement>("#query-error")!;
  if (words.length > 4) {
    error.textContent =
      "Use up to four distinct words. The previous ordering is unchanged.";
    input.setAttribute("aria-invalid", "true");
    return;
  }
  error.textContent = "";
  input.removeAttribute("aria-invalid");
  query = words.join(" ");
  render();
}
document.querySelector("#index-query")!.addEventListener("submit", (e) => {
  e.preventDefault();
  submit();
});
document.querySelectorAll<HTMLButtonElement>("[data-query]").forEach((button) =>
  button.addEventListener("click", () => {
    input.value = button.dataset.query!;
    submit();
  }),
);
document
  .querySelectorAll<HTMLButtonElement>("[data-drawer]")
  .forEach((button) =>
    button.addEventListener("click", () => {
      drawer = button.dataset.drawer!;
      document
        .querySelectorAll("[data-drawer]")
        .forEach((el) =>
          el.setAttribute("aria-pressed", String(el === button)),
        );
      render();
    }),
  );
document.querySelector("#reset-index")!.addEventListener("click", () => {
  input.value = "";
  submit();
});

// Following a term is a catalogue cross-reference, not an edit to its source record.
document.querySelectorAll<HTMLButtonElement>("[data-term]").forEach((button) =>
  button.addEventListener("click", () => {
    input.value = button.dataset.term!;
    submit();
    input.focus();
  }),
);
