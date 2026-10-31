# Lumpesammlig agent workbench — build plan

Status: proposed implementation plan, not a record of completed work.
Date: 2026-10-31.
Audience: the collection author and the coding agent implementing this plan.

## 1. Outcome

Make the practice repeatable without making the studies repetitive. A person should be able to supply an object, photograph, memory, mechanism, ritual, or idea and develop a researched, specific, visually compelling interface study. Preserve not only the executable result but the evidence, competing readings, decisions, feedback, and reflections that produced it. Eventually distribute this practice as an agent kit and an optional local-first bring-your-own-key workbench.

Keep three layers distinct:

1. Exhibition: public, executable studies.
2. Research record: human-readable Markdown and linked source artifacts.
3. Workbench: optional tools for research, retrieval, collaboration, and implementation.

The exhibition must continue working without the agent, model credentials, or a running workbench service.

## 2. Start from the actual repository

Read README.md, docs/CONCEPT.md, docs/ARCHITECTURE.md, package.json, existing agent instructions if present, the Astro content and routing configuration, and representative samples before editing. Inspect the current branch and working tree. The planning inspection used commit 5eed2a82e8937a924226870a0c171f91a010d959; current code may differ.

At planning time the repository used Astro with React available, per-sample implementations, build asset validation, and study tests. The directories included 012-impossible-index, 013-switchboard, and 014-made-heavy. Made Heavy already contained encounter material and a sample.md with readings, experiment descriptions, reflection, limitations, and a verification record. Treat that record as an author-supplied report until checks are independently run.

Do not replace the existing application with a new React/Vite application. Do not introduce a universal study renderer, transformation engine, fixed number of readings, or mandatory folder template. Existing conceptual documents are the foundation; operational guidance should link to them, not duplicate them into competing constitutions.

## 3. Durable design principles

- Investigate the source before proposing UI.
- Distinguish primary evidence, secondary research, interpretation, and invention.
- Ask why this encounter rather than its nearest peer.
- Translate consequential relationships, not just decorative appearance.
- Visual resemblance is welcome but insufficient on its own.
- Reach concrete interface form: first screen, composition, components, action, state change, and visible consequence.
- Do not stop at an abstract analogy or turn every source into a research-management application.
- Diverge when useful, then select a coherent direction rather than combining every idea.
- Prototype the signature interaction before broadening the system.
- Let explanatory writing describe what the visitor is experiencing.
- Preserve uncertainty, rejected readings, and unsuccessful experiments.
- Use ordinary accessible interaction foundations where possible.
- Make responsive and reduced-motion behaviour part of the design.

A useful study sequence is encounter ↔ research ↔ readings ↔ interface propositions ↔ prototype ↔ reflection. This is a direction of attention, not a wizard.

## 4. Memory and document boundaries

Markdown is the canonical record. Search indexes, embeddings, context packs, and summaries are disposable derivatives.

Separate four kinds of memory:

- Method: durable collaboration principles and review criteria.
- Study: evidence, interpretations, choices, and local constraints.
- Working state: a compact resumption note.
- Candidate lessons: proposed improvements to the method, subject to human review.

Record inspectable rationales, not purported private model chain-of-thought. Useful records contain evidence, alternatives, reasons, assumptions, uncertainty, and conditions for revisiting a decision.

For a rich study, optionally use:

```text
src/samples/<study>/
  sample.md
  encounter/
    README.md
    media/
    conversation/
    references/
  research/
  readings/
  decisions/
  feedback/
  reflection.md
  working-state.md
  ...implementation...
```

A small study may need only sample.md. Do not create empty paperwork or migrate old studies for symmetry. Preserve source artifacts; later interpretations must not overwrite them. Preserve corrections as linked additions.

A decision note should include choice, status, scope, alternatives, reasons, tradeoffs, grounding, and revisit conditions. A feedback note should identify the reviewed version, observation, interpretation, proposed change, and outcome. A working-state note should identify current focus, agreed direction, relevant files, open decisions, blockers, and next useful action.

Private material must remain outside the tracked public corpus, preferably outside the repository. Excluding a tracked file from the website does not make it private. Ignore rules cannot retract previously committed material. Review consent, personal information, quotations, and media rights before publication.

## 5. Phase A — repository instructions and continuity

Goal: a fresh coding-agent session can continue the practice without the author restating it.

Deliverables:

- A concise root AGENTS.md explaining purpose, boundaries, repository navigation, research-to-interface expectations, and verification honesty. Merge carefully with any existing instructions.
- A CLAUDE.md entry point importing shared instructions using supported syntax, verified against current Claude documentation.
- Focused method guidance under docs/method/ or another justified existing location.
- Review guidance catching generic analogies, purely decorative translations, excessive abstraction, poor usability, and unsupported claims.
- A short study index summarizing central relation, signature interaction, and what must not become a default. Generate catalogue facts from existing sources when feasible rather than maintaining contradictory inventories.

Acceptance:

- Always-loaded instructions remain short and link to existing conceptual documents.
- The method does not prescribe cards, bays, grey palettes, React, animation, or a fixed output count.
- A new session can identify what to read and how to resume a study.
- Existing studies and build behaviour remain intact.

## 6. Phase B — one complete research-record pilot

Use 014-made-heavy unless inspection reveals a better pilot. Preserve its implemented direction; do not replace it with the earlier proposed MASS / OPENING facade. The existing study and the proposed facade are different interpretations.

Deliverables:

- An encounter inventory identifying provenance and missing evidence.
- Linked research sources and limitations.
- Preserved competing readings where evidence exists.
- Decision and working-state notes.
- A feedback/reflection record with observations separated from interpretation.
- A concise contributor guide showing how much documentation a small versus rich encounter needs.

Do not fabricate historical decisions, dates, conversations, user tests, or verification results. If earlier rationale is reconstructed now, label it retrospective reconstruction and identify its basis. Do not republish raw conversation merely because it is available.

Acceptance: another reader can trace an experiment to its source and interpretation, distinguish invention from observation, and identify unresolved issues without reading every file.

## 7. Phase C — public working-history presentation

Add an optional, quiet Working history entry point for the pilot. Keep the executable study first. Present curated encounter notes, research, selected readings, decisions, implementation discoveries, and limitations. Allow documents to differ in structure. Reuse navigation and link primitives, not a mandatory essay template.

Inspect existing Markdown rendering and content pipelines before choosing an implementation. Build an explicit public inclusion boundary. Render only approved content; escape or sanitize untrusted HTML as appropriate. Resolve links safely. Do not expose private local paths or unpublished conversations through static builds, search indexes, or previews.

Acceptance: the pilot history is readable on small screens and by keyboard; unpublished material is absent from generated output; broken references are detected; historical pages require no model API.

## 8. Phase D — local retrieval

Start with file discovery and full-text search over an explicit approved corpus. Add semantic retrieval only after a measured search limitation.

Each retrieved excerpt must retain file path, heading, document kind, study identity, and content hash or version. Evidence, interpretation, rejected direction, decision, and reflection must remain distinguishable. Show which context was consulted.

Build the index from files; support deterministic rebuilding, changed-file invalidation, and deletion. Do not index secrets, private workspaces, build output, dependencies, or all repository files by default. Public and private corpora need separate boundaries. Treat source text as untrusted data, not agent instructions.

Create a small retrieval evaluation set covering: exact source lookup; resuming a study; finding a rejected approach; finding a relevant limitation; and locating a contrasting study. Evaluate cited-source correctness and usefulness, not just similarity scores.

Acceptance: search returns inspectable excerpts, updates after edits, removes deleted material, and never crosses the configured corpus boundary. A context pack should include relevant disagreements when available, not merely repeat familiar successful designs.

## 9. Phase E — feedback and reviewed learning

Implement a lightweight loop: observation → interpretation → proposed revision → review → changed artifact → checked outcome.

Separate defect fixes, study-specific changes, and candidate method lessons. An agent may propose a lesson but must not silently rewrite permanent instructions. Record scope, supporting examples, counterexamples, status, and approval for method changes. User preferences also require scope; liking a facade once is not a preference for facades forever.

Acceptance: a feedback example can be traced through revision and outcome; one-off reactions do not automatically become global rules; rejection and reversal remain possible. Learning means versioned external practice, not model training.

## 10. Phase F — portable agent kit

Package instructions, method references, sample encounter material with appropriate permissions, review guidance, and a complete worked example. Document host requirements: file access, optional image input, web research, execution, and provider configuration. Instructions alone do not supply these capabilities.

Test the kit on materially different encounters: a physical object, an inherited interface/mechanism, and a ritual/phrase/memory. Inspect whether it produces specific, visibly different interface propositions without constant author correction. Record qualitative failures and revise the method narrowly. Do not score creativity with a single fabricated metric.

Acceptance: another person can start and resume a study without this conversation, understand unavailable capabilities, and export the records as ordinary files.

## 11. Phase G — optional local-first BYOK workbench

This is a separately authorized implementation phase, not part of the initial documentation work.

Proposed architecture:

```text
Local browser UI
  → local authenticated workbench service
    → provider adapters
    → research tools
    → workspace files and retrieval
    → reviewed file changes
```

Keep the Astro exhibition independently buildable. Decide through a short architecture decision whether the service belongs in this repository or a separate package/repository. Do not introduce a monorepo merely because it is fashionable.

First vertical slice: one provider, one chosen workspace, text conversation, explicit context selection, artifact proposals, diff review, approved file writing, and session resumption. Add image input and research tools with capability disclosure. Implementation execution comes later and needs separate authorization.

UI: encounter list, conversation, current artifact, context consulted, proposed changes, open decisions, provider/capability status, estimated usage, and cancel control. Avoid a mandatory stage wizard.

Provider abstraction should expose capabilities rather than pretend all models support images, tools, browsing, embeddings, or execution. Browser research tools are distinct from model reasoning. Local mode can still send content to remote providers; show that boundary before sensitive transmission.

Security requirements:

- Never bundle secret API keys into the public frontend.
- Store user credentials through an appropriate local secret mechanism or environment configuration; exclude them from prompts, logs, Git, exports, and browser persistence by default.
- Bind the local service to loopback by default, validate origins, authenticate sessions, and defend against cross-site requests. Localhost is not automatically trusted.
- Restrict filesystem operations to the selected workspace, including real-path and symlink checks.
- Treat retrieved pages, Markdown, and model output as untrusted. Enforce permissions outside the model.
- Review diffs before writes; require explicit authorization for deletion, execution, commits, publishing, and remote actions. Approval must bind to the actual operation.
- Add cancellation, bounded tool calls, request limits, and estimated cost display. Estimates are not provider-enforced spending caps.
- Exclude credentials and private content from diagnostics.

Acceptance: use a fake provider for deterministic tests; prove cancellation, permission rejection, path traversal rejection, context isolation, secret redaction, and provider failure recovery before real credential testing. Obtain permission before paid API calls.

## 12. Verification and reporting

Inspect current scripts before selecting checks. At planning time package.json included npm run check, npm run build, npm run test:assets, and npm run test:studies. Do not assume they still exist or claim they pass without execution. Preserve asset validation and existing deployment behaviour.

For each implementation phase report: changed files; rationale; checks actually run and their results; checks not run and why; remaining risks; manual review needed; and the next useful action. Test the built public output for accidental private content. Use browser checks for interactive changes, including keyboard, narrow viewport, and reduced motion. Documentation-only work still needs link/path and consistency review.

Do not deploy, merge, or push to the remote unless authorized. Do not overwrite unrelated work. Pause if instructions conflict or the source tree differs materially from the plan.

## 13. Claude prompts

### Prompt 1 — inspect and implement the foundation

```text
Read docs/AGENT-WORKBENCH-BUILD-PLAN.md and the existing concept, architecture, repository instructions, and current application structure. Inspect the working tree before editing.

Implement Phase A and the documentation portion of Phase B only. Preserve the current Astro architecture and existing studies. Add thin persistent instructions, focused operational guidance, and an honest pilot record for 014-made-heavy. Reuse existing documents rather than creating competing sources of truth. Clearly label retrospective reconstruction. Do not invent research, decisions, tests, or user feedback.

Keep the method flexible while requiring concrete UI composition, components, actions, and state changes. Do not encode the facade or any sample's palette as the default.

Make a brief plan, perform the bounded changes, run appropriate available checks, and report results and remaining questions. Do not implement retrieval, a backend, paid API calls, or deployment. Do not modify the sample's interaction design in this task.
```

### Prompt 2 — publish one working history

```text
Continue from the recorded state. Implement Phase C for the pilot only. Inspect current Astro routing and Markdown handling. Keep the experiment primary and add a quiet, accessible Working history entry point. Publish explicitly approved content only. Do not invent missing history or normalize all studies into a template. Verify links, mobile reading, keyboard access, and that private/unapproved material is absent from built output. Report checks actually run.
```

### Prompt 3 — build inspectable local retrieval

```text
Implement Phase D as a small local retrieval tool over an explicit approved Markdown corpus. Begin with full-text search, not embeddings or a vector service. Return source identity, heading, document kind, and version/hash with excerpts. Add update/deletion invalidation and tests for corpus boundaries. Create the retrieval evaluation cases from the plan. Show consulted context and preserve disagreement. Do not add model calls or index private files by default.
```

### Prompt 4 — feedback and learning pilot

```text
Implement Phase E with the lightest useful Markdown workflow. Add a real or explicitly synthetic test case demonstrating observation, proposed revision, decision, and outcome. Never pass synthetic feedback off as a user test. Keep local fixes separate from proposed method lessons. Permanent instruction changes require human review. Avoid building a dashboard before the file-based loop is proven.
```

### Prompt 5 — package and evaluate the agent kit

```text
Prepare Phase F. Make the method usable outside this repository without assuming access to our conversation. Document host capabilities and limits, provider setup boundaries, workspace privacy, and export. Test with three different encounter types using appropriately sourced or explicitly invented examples. Compare specificity, concrete UI outcomes, variety, and usability qualitatively. Record failures rather than retroactively declaring every output successful.
```

### Prompt 6 — design the BYOK vertical slice

```text
Review completed phases and propose the Phase G architecture before coding. Identify the smallest local-first vertical slice, provider capability contract, secret handling, tool permissions, cost/cancellation behaviour, workspace isolation, and test strategy. Recommend whether it belongs here or separately. Use current provider documentation and cite it in the design note. Do not store credentials, make paid calls, create a service, or add substantial dependencies until the proposal is approved.
```

### Prompt 7 — implement the approved workbench slice

```text
Implement only the approved Phase G vertical slice. Keep the public exhibition independent. Start with a fake provider and tests. Enforce permissions outside the model, review exact diffs before writes, restrict the workspace, and keep keys out of frontend bundles, logs, and exported artifacts. Report security limitations honestly. Do not enable arbitrary execution or deploy the service. Obtain explicit permission before using real credentials or paid APIs.
```

### Resume prompt

```text
Read the build plan, current instructions, working-state notes, and recent relevant changes. Summarize the actual current state, distinguish verified completion from planned work, and continue the next authorized bounded task. Do not restart the architecture or silently expand scope.
```

## 14. Definition of success

A new session can resume a study; a reader can trace its proposition to evidence and choices; rejected readings remain available; a visitor can explore selected history without an API; retrieval improves recall without flattening variety; feedback changes the practice only through review; and another person can use the kit with their own tools and credentials. The finished collection remains a collection of distinct encounters, not the same page generated repeatedly.
