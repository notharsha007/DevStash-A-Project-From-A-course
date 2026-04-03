# Codex Workflow Layer

This folder is a Codex-specific workflow bridge for this repo.

Goals:

- Preserve the existing `.claude/` setup
- Reuse `context/` as the project source of truth
- Keep `context/current-feature.md` as the shared active feature file
- Mirror the slash-style command workflow you already use in Claude Code

## Command Map

- `/feature ...` -> `.codex/commands/feature.md`
- `/research ...` -> `.codex/commands/research.md`
- `/cleanup ...` -> `.codex/commands/cleanup.md`
- `/list-components ...` -> `.codex/commands/list-components.md`

## Working Rules

- Treat these command docs as workflow instructions, not runtime code.
- Do not modify `.claude/` unless the user explicitly asks.
- Keep changes in sync with `context/ai-interaction.md`, `context/coding-standards.md`, and `context/current-feature.md`.
