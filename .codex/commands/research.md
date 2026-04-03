# `/research`

Use this workflow when the user invokes `/research <prompt-name>` or wants a documentation-only research task run from `context/research/`.

## Steps

1. Require a prompt name.
2. Read `context/research/<prompt-name>.md`.
3. Extract:
   - output path
   - research goal
   - required inclusions
   - allowed sources
4. Perform the research using local project files and approved tools.
5. Write the requested documentation output.
6. Summarize the findings.

## Guardrails

- Documentation only.
- Do not change app source code as part of this workflow.
- Do not create branches or commits unless the user separately asks.
