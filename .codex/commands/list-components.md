# `/list-components`

Use this workflow when the user invokes `/list-components` or wants an inventory of React components.

## Steps

1. Search `components/` first.
2. If an argument is provided, limit the search to that subdirectory.
3. List component files with these extensions:
   - `.tsx`
   - `.ts`
   - `.jsx`
   - `.js`
4. Return:
   - a numbered list of relative paths
   - a short inferred description for each file
   - a final count

If no components are found, say `No components found.`
