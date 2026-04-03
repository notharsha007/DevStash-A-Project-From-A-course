# `/feature`

Use this workflow when the user invokes `/feature ...` or asks to load, start, review, test, explain, or complete the active feature.

## Shared Working File

`context/current-feature.md`

## Read First

- `context/ai-interaction.md`
- `context/coding-standards.md`
- `context/current-feature.md`

## Actions

### `load`

1. Read the argument after `load`.
2. If it looks like a spec name, check `context/features/<name>.md` and `context/fixes/<name>.md`.
3. If it is a free-form description, turn it into a feature title, goals, and notes.
4. Update `context/current-feature.md`:
   - Set the H1 to `# Current Feature: <name>`
   - Set `## Status` to `Not Started`
   - Write goals under `## Goals`
   - Write supporting context under `## Notes`
5. Confirm what was loaded.

### `start`

1. Read `context/current-feature.md`.
2. If goals are empty, stop and tell the user to run `/feature load` first.
3. Set `## Status` to `In Progress`.
4. If branch work is requested or appropriate, derive a branch name from the feature title and create it.
5. Implement from the documented goals.

### `review`

1. Read `context/current-feature.md`.
2. Review the current implementation against goals.
3. Report:
   - completed goals
   - missing goals
   - bugs or quality issues
   - any scope creep
4. End with a verdict: ready or needs changes.

### `test`

1. Read `context/current-feature.md`.
2. Identify changed server actions and utilities.
3. Add Vitest coverage where logic is meaningfully testable.
4. Run the relevant test command if feasible.
5. Summarize what was tested and any gaps.

### `explain`

1. Read `context/current-feature.md`.
2. Review the files changed for the active feature.
3. Explain what changed, why, and how the pieces connect.

### `complete`

1. Confirm the feature is actually complete.
2. Ask before any commit, merge, push, or branch deletion.
3. If approved, finish the git workflow and then reset `context/current-feature.md` back to its idle state while appending the completed feature to history.

## Guardrails

- Keep `.claude/` untouched.
- Use `context/current-feature.md` as the source of truth for active feature state.
- Do not commit without permission.
- Do not add scope that is not in the loaded spec.
