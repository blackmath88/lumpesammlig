import type { BayId } from "./facade";

export type StudyEntry = {
  id: BayId;
  index: string;
  /** Title with soft hyphens so a narrowed pier can break it legibly. */
  title: string;
  proposition: string;
  /** One line shown during interaction. */
  instruction: string;
  /** The principal explanation, read inside the open bay. */
  explanation: string[];
  moved: string;
  remained: string;
  tryThis: string;
};

export const studies: StudyEntry[] = [
  {
    id: "mass",
    index: "01",
    title: "Mass",
    proposition: "Mass is relational.",
    instruction: "Change the surrounding space. The slab stays the same size.",
    explanation: [
      "This surface feels large because the things around it are small, narrow or absent. Its scale comes from contrast, not from decoration or from its own pixel count.",
      "The control below changes only the interval around the slab and the size of its supports. Measure the slab before and after: nothing about it moves. What changes is how much of the composition is willing to stay empty on its behalf.",
    ],
    moved: "The empty interval and the narrow supports.",
    remained: "The slab, its title and its width.",
    tryThis: "Switch to generous, then look away and back. The slab reads heavier without having grown.",
  },
  {
    id: "recess",
    index: "02",
    title: "Recess",
    proposition: "Depth before detail.",
    instruction: "Enlarge the opening. The outer surface stays in place.",
    explanation: [
      "Content is not floating above the page. It sits behind an edge, and access increases as that edge withdraws. The frame stays. The opening changes.",
      "Each step of the control widens the aperture inside a fixed outer surface. The card behind it is never scaled or stretched; it is simply less cropped. The closed opening is selective rather than broken: it shows enough to invite, not enough to read.",
    ],
    moved: "The inner edges, and therefore how much of the card is visible.",
    remained: "The outer surface, the title on its face, the card’s size.",
    tryThis: "Go to the widest opening, then back to the narrowest. The card does not travel; the wall does.",
  },
  {
    id: "repetition",
    index: "03",
    title: "Repe­tition",
    proposition: "Repetition makes interruption legible.",
    instruction: "Select one unit. The others stay in the row.",
    explanation: [
      "Equal units establish an expectation. Opening one does not erase the system; it reveals a difference within it. The widened unit is readable because its six neighbours are still narrow and still present.",
      "This is the façade’s own rule at a smaller scale. Nothing is removed, nothing is layered on top. A unit takes room from its row, and the rhythm can be restored at once.",
    ],
    moved: "One unit’s width and the fragments of its neighbours.",
    remained: "Seven units, their order and their indices.",
    tryThis: "Select a unit near the edge, then one in the middle. The interruption reads differently against the same rhythm.",
  },
  {
    id: "projection",
    index: "04",
    title: "Projec­tion",
    proposition: "An extension needs an origin.",
    instruction: "Extend the comparison. The source stays where it is.",
    explanation: [
      "This surface adds space without hiding where it came from. The source remains present while the comparison extends beyond it. The point of attachment is visible the whole time.",
      "The comparison itself is one authored pair: the same small panel shown as an isolated floating object and as an attached projection. Switch between them and watch what the shared edge does to the relationship, not to the content.",
    ],
    moved: "The comparison surface, out from the anchor.",
    remained: "The anchor, its position and its label.",
    tryThis: "Set the comparison to floating, then attached. Ask which version you would trust to still be there after a scroll.",
  },
  {
    id: "section",
    index: "05",
    title: "Section",
    proposition: "A face presents. A section explains.",
    instruction: "Switch from face to section. It is the same object.",
    explanation: [
      "The object remains the same. What changes is which relationships become visible. The face shows a title, an image surface and one statement. The section shows the same material as three labelled bands: surface, interaction, evidence.",
      "No rotation, no second page. A planar reorganisation keeps the title in place and lets the same sentences land in different bands, so the visitor can see that explanation is a re-reading, not an addition.",
    ],
    moved: "The arrangement: one composed face becomes three bands.",
    remained: "The title, the words, the object’s outline.",
    tryThis: "Read the statement in face view, then find where each of its clauses lands in the section.",
  },
  {
    id: "support",
    index: "06",
    title: "Support",
    proposition: "The explanation has supports too.",
    instruction: "Select a connection to see which passage it holds up.",
    explanation: [
      "A large surface depends on visible connections. This study’s own summary stands on three: what we observed in the research, what we decided as designers, and what the prototype does not establish.",
      "Selecting a support highlights the passage it is responsible for. It is a designed navigational relationship, not a simulation of forces. It returns the study to Lumpesammlig’s habit of keeping evidence, interpretation and experiment distinguishable.",
    ],
    moved: "Emphasis, from one passage to another.",
    remained: "The whole paragraph and all three supports.",
    tryThis: "Select limitation last. It carries the least weight in most write-ups and the most here.",
  },
];

export const titles = Object.fromEntries(
  studies.map((s) => [s.id, s.title.replace(/­/g, "")]),
) as Record<BayId, string>;

/** 03 — seven equal units, each with an index and a fragment that the widened unit completes. */
export const units = [
  { fragment: "Bays share", text: "Bays share edges. There are no floating cards or rounded containers; every division is a line two neighbours agree on." },
  { fragment: "Widths are", text: "Widths are unequal but deliberate. The closed row reads five, four, three; the eye learns the proportion before anything opens." },
  { fragment: "Opening one", text: "Opening one changes the arrangement of its row. The other row is left alone, so the change is legible as local." },
  { fragment: "Labels stay", text: "Labels stay identifiable throughout the change. A pier keeps its index and its title; nothing becomes an anonymous strip." },
  { fragment: "The study", text: "The study retains its shape without photography or texture. Remove every surface colour and the proportions still describe the operation." },
  { fragment: "A visitor", text: "A visitor can reverse any action immediately. Close, restore, narrow, retract: each control has its opposite within reach." },
  { fragment: "Motion is", text: "Motion is presentation, not truth. The final layouts are correct with transitions removed; animation only shows the route between them." },
];

/** 05 — the same material, read as a face and as three bands. */
export const sectionObject = {
  title: "Bay 02 / Recess",
  statement:
    "A narrow opening in a thick surface shows a little of what lies behind it; a control withdraws the inner edges until the card is readable; the outer frame and the title never move.",
  bands: [
    { label: "Surface", text: "A narrow opening in a thick surface shows a little of what lies behind it." },
    { label: "Interaction", text: "A control withdraws the inner edges until the card is readable." },
    { label: "Evidence", text: "The outer frame and the title never move: compare the before and after positions." },
  ],
};

/** 06 — one summary paragraph whose three passages each rest on a named support. */
export const supportedSummary = {
  passages: [
    {
      key: "research",
      label: "Research",
      text: "In the material we gathered, large concrete volumes read as mass because of what surrounds them: deep openings, narrow supports, repeated units and projecting elements that keep their point of attachment.",
      note: "An observation drawn from the architectural vocabulary collected before this study. It describes relationships between parts, not the intentions of any particular building.",
    },
    {
      key: "design",
      label: "Design decision",
      text: "We translated those relationships into a façade of six bays where opening one makes the row accommodate it, instead of placing a layer over the interface.",
      note: "An invention. Accommodation rather than overlay is our proposition about interaction; nothing in the sources prescribes it.",
    },
    {
      key: "limitation",
      label: "Limitation",
      text: "The prototype does not show that visitors can describe the formal relationship afterwards, nor that the resemblance survives beyond proportion, depth and shared edges.",
      note: "Unestablished. Human review of comprehension has not happened; the claim stops at behaviour that can be inspected in the browser.",
    },
  ],
};
