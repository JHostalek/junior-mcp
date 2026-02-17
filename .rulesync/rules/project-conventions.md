---
root: false
description: "Project-specific architecture, conventions, testing, linting, and gotchas"
targets: ["*"]
---

# junior-mcp — Project Conventions

MCP server that wraps the Junior CLI. Exposes task queue, schedules, hooks, and daemon control to AI coding agents via the Model Context Protocol.

**Key constraint:** pure CLI wrapper. No direct database access, no Junior library imports. Every operation shells out to `junior` via `Bun.spawn()`.

## Stack

- TypeScript (strict), Bun runtime, ESM
- MCP SDK: `@modelcontextprotocol/sdk` (server + stdio transport)
- Validation: Zod (tool input schemas)
- Build: `bun build --compile` (single native binary at `dist/junior-mcp`)
- Runtime dependency: `junior` CLI must be on `PATH`

## Architecture

```
stdin (MCP JSON-RPC) → McpServer → tool handler → runJunior() → Bun.spawn(['junior', ...args]) → stdout/stderr → MCP response
```

stdio-based server. The MCP SDK handles protocol framing over stdin/stdout. Each tool handler translates MCP calls into CLI invocations and returns the CLI output as text content. Errors are surfaced via `isError: true` when the CLI exits non-zero.

```
src/
├── index.ts           # Entry point: creates McpServer, registers all tool modules, connects StdioServerTransport
├── cli.ts             # CLI wrapper: runJunior(args) → Bun.spawn(['junior', ...args]) → { stdout, stderr, exitCode }
└── tools/
    ├── tasks.ts       # 7 tools: create_task, list_tasks, show_task, cancel_task, retry_task, delete_task, task_logs
    ├── schedules.ts   # 5 tools: create_schedule, list_schedules, pause_schedule, resume_schedule, remove_schedule
    ├── hooks.ts       # 5 tools: create_hook, list_hooks, pause_hook, resume_hook, remove_hook
    ├── daemon.ts      # 1 tool: daemon_status
    └── *.test.ts      # Co-located tests
```

3 source files, 4 tool modules, 18 total tools.

## Conventions

- IMPORTANT: Always run `bun run build` after completing a task
- IMPORTANT: No comments in code unless explicitly requested
- All CLI delegation goes through `runJunior()` in `src/cli.ts` — never call `Bun.spawn(['junior', ...])` directly from tool handlers
- Tool handlers follow a strict pattern: call `runJunior(args)`, check `exitCode`, return `{ content: [{ type: 'text', text }], isError? }`
- Error responses prefer `stderr` over `stdout` (fallback to stdout when stderr is empty)
- Input validation uses Zod schemas passed to `server.registerTool()` via `inputSchema`
- All imports use explicit `.js` extensions (ESM requirement)
- Same-directory imports use `./`; no `@/*` path aliases (flat structure doesn't need them)

### Adding a New Tool

1. Decide which tool module it belongs to (or create a new `src/tools/<category>.ts`)
2. Inside the `register<Category>Tools(server)` function, call `server.registerTool(name, { description, inputSchema }, handler)`
3. The handler calls `runJunior([...args])` and returns the standard response shape
4. If creating a new module, add a `register<Category>Tools` export and wire it in `src/index.ts`
5. Add tests in `src/tools/<category>.test.ts` following the existing mock pattern

## Testing

- Test runner: Bun built-in (`bun test`), Jest-compatible API
- Test files co-located with source: `src/tools/tasks.test.ts` next to `src/tools/tasks.ts`
- Use `bun:test` imports (`describe`, `test`, `expect`, `mock`, `beforeEach`)
- **Mock strategy:** `mock.module('../cli.js', () => ({ runJunior: runJuniorMock }))` — all tests mock the CLI layer, never spawn real processes
- **Mock server:** `createMockServer()` captures `registerTool` calls; `getTool(tools, name)` retrieves a specific tool handler for invocation
- Each test file verifies: correct tool count registered, correct CLI args passed, success response shape, error response shape (exitCode !== 0), stderr-over-stdout preference

## Linting

- Linter: Biome (Rust-based, combines linting + formatting)
- Config: `biome.json` — recommended rules, single quotes, semicolons, 2-space indent, 120 line width
- Run `bun run lint:fix` to auto-fix; `bun run check` for typecheck + lint together

## Gotchas

- `junior` CLI must be installed and on `PATH` — the server will fail silently with unhelpful errors if it's missing
- MCP protocol uses stdout for responses — all diagnostic logging goes to stderr (`console.error`)
- `bun build --compile` produces a self-contained binary — `process.execPath` points to the binary itself
- `list_tasks` passes `--json` to get machine-readable output; other tools return human-readable text
- The server has no state — every request is a fresh CLI invocation; no caching, no connection pooling
