# Claude Code entry point

Shared repository instructions live in `AGENTS.md`, imported here so that Claude Code and other agents read one text:

@AGENTS.md

Claude-specific notes:

- Prompts for the phased workbench plan are in section 13 of [docs/AGENT-WORKBENCH-BUILD-PLAN.md](docs/AGENT-WORKBENCH-BUILD-PLAN.md); the current verified state is in [docs/AGENT-WORKBENCH-WORKING-STATE.md](docs/AGENT-WORKBENCH-WORKING-STATE.md).
- The import above uses Claude Code's `@path` syntax (relative to this file, code spans are not imported). Keep imports inside the repository so no approval dialog for external files is needed.
