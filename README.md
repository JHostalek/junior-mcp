# junior-mcp

MCP server for [Junior](https://github.com/JHostalek/junior). stdio-based wrapper — translates MCP tool calls into `junior` CLI commands.

## configure

add to your project's `.mcp.json`:

```json
{
  "mcpServers": {
    "junior": {
      "command": "npx",
      "args": ["-y", "@jhostalek/junior-mcp"]
    }
  }
}
```

needs [Junior](https://github.com/JHostalek/junior) installed and on your `PATH`.

## tools

18 tools across 4 categories:

- **tasks** — create, list, show, cancel, retry, delete, logs
- **schedules** — create, list, pause, resume, remove
- **hooks** — create, list, pause, resume, remove
- **daemon** — status

## license

MIT
