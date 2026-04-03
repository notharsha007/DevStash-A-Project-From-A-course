# `/cleanup`

Use this workflow when the user invokes `/cleanup check`, `/cleanup run`, or asks for a structured repo cleanup pass.

## Cleanup Checklist

1. Check that `context/current-feature.md` history is ordered oldest to newest.
2. Find unnecessary `console.log` statements.
3. Find unused imports.
4. Check stale TODO comments.
5. Find orphaned or unused files.
6. Check whether context docs drift from actual project state.
7. Compare `.env.production` variable names with `.env`.
8. Find stale `@ts-ignore` comments.

## Modes

### `check`

- Report findings only.
- Do not modify files.

### `run`

1. Report findings as numbered items first.
2. Ask which numbered items to fix.
3. Only edit the items the user approves.
4. Summarize the completed cleanup.
