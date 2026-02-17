#!/usr/bin/env bun
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerDaemonTools } from './tools/daemon.js';
import { registerHookTools } from './tools/hooks.js';
import { registerScheduleTools } from './tools/schedules.js';
import { registerTaskTools } from './tools/tasks.js';

const server = new McpServer({
  name: 'junior-mcp',
  version: '0.1.0',
});

registerTaskTools(server);
registerScheduleTools(server);
registerHookTools(server);
registerDaemonTools(server);

const transport = new StdioServerTransport();
await server.connect(transport);
console.error('junior-mcp running');
