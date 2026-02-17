# junior-mcp

MCP server for [Junior](https://github.com/JHostalek/junior). stdio-based wrapper — translates MCP tool calls into `junior` CLI commands.

## install

```bash
git clone https://github.com/JHostalek/junior-mcp.git && cd junior-mcp
bun install && bun run build
```

needs [Bun](https://bun.sh) and [Junior](https://github.com/JHostalek/junior) installed and on your `PATH`.

## configure

add to your project's `.mcp.json`:

```json
{
  "mcpServers": {
    "junior": {
      "command": "/path/to/junior-mcp/dist/junior-mcp"
    }
  }
}
```

or if `junior-mcp` is on your `PATH`:

```json
{
  "mcpServers": {
    "junior": {
      "command": "junior-mcp"
    }
  }
}
```

## license

MIT
