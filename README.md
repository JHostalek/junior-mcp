# junior-mcp

MCP server for [Junior](https://github.com/JHostalek/junior). lets Claude Code queue tasks, manage schedules, and control hooks through the Model Context Protocol.

## what it does

stdio-based MCP server that wraps the `junior` CLI. Claude Code talks MCP protocol in, the server translates to CLI commands out. no direct database access — pure CLI wrapper.

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

## tools

| tool | description |
|------|-------------|
| `create_task` | queue a new task for async execution |
| `list_tasks` | list all tasks (with optional status filter) |
| `show_task` | show task details |
| `cancel_task` | cancel a queued or running task |
| `retry_task` | re-queue a failed task |
| `delete_task` | delete a task and its data |
| `task_logs` | show logs for a task |
| `create_schedule` | create a cron-based recurring task |
| `list_schedules` | list all schedules |
| `pause_schedule` | pause a schedule |
| `resume_schedule` | resume a paused schedule |
| `remove_schedule` | remove a schedule |
| `create_hook` | create a reactive hook |
| `list_hooks` | list all hooks |
| `pause_hook` | pause a hook |
| `resume_hook` | resume a paused hook |
| `remove_hook` | remove a hook |
| `daemon_status` | show daemon status |

## license

MIT
