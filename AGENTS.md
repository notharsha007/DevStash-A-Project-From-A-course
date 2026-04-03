<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Codex Workflow Bridge

Use the repo-local `.codex/` workflow layer for Codex-specific command handling.

- `/feature ...` -> `.codex/commands/feature.md`
- `/research ...` -> `.codex/commands/research.md`
- `/cleanup ...` -> `.codex/commands/cleanup.md`
- `/list-components ...` -> `.codex/commands/list-components.md`

Keep `.claude/` untouched unless the user explicitly asks to modify it. `context/current-feature.md` is the shared active feature file and may be updated as part of the feature workflow.
