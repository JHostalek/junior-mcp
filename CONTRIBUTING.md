# contributing

## setup

```bash
git clone https://github.com/JHostalek/junior-mcp.git && cd junior-mcp
bun install
```

## workflow

```bash
bun run check        # typecheck + lint
bun run build        # compile to binary — always run before submitting
```

## conventions

code style and architecture rules live in `CLAUDE.md`. the short version:

- strict TypeScript, ESM, explicit `.js` extensions
- `@/*` for cross-directory imports, `./` for same-directory
- `Bun.spawn()` for all CLI invocations (never shell strings)
- all logging to `console.error()` — stdout is reserved for MCP protocol

## submitting changes

1. fork and branch from `main`
2. follow the conventions above
3. `bun run check && bun run build` — all green
4. open a PR with a clear description of what and why

## reporting issues

include: junior-mcp version, junior version, bun version, OS, and steps to reproduce.
