---
description: Clean up project housekeeping tasks. Use /cleanup check to review only, /cleanup run to fix.
---

# Cleanup Workflow

Review the codebase for cleanup tasks:

1. Make sure that the history in `context/current-feature.md` is in order from oldest to newest
2. Find unnecessary `console.log` statements in `src/`
3. Find unused imports
4. Check for stale TODO comments
5. Find orphaned/unused files
6. Check that context files match actual project state
7. Check if `.env.production` has the same variables (not always the same value) as `.env`. If something is missing, report it.
8. Find `@ts-ignore` comments that might be stale

---

## Mode

Determine mode from the argument (`check` or `run`):

**If no argument or argument is `check`:**

- Only report findings, don't modify anything
- List what WOULD be cleaned up

**If argument is `run` or `fix`:**

- First, report all findings with numbered items
- Then ask: "Which items would you like me to fix? (enter numbers like 1,3,5 or 'all' or 'none')"
- Wait for user response before making any changes
- Only fix the items the user specifies
- Report what you changed
