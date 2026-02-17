import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { runJunior } from '../cli.js';

export function registerTaskTools(server: McpServer): void {
  server.registerTool(
    'create_task',
    {
      description: 'Queue a new task for asynchronous execution by a Junior worker agent.',
      inputSchema: {
        description: z.string().describe('What to do — detailed task description with acceptance criteria'),
      },
    },
    async ({ description }) => {
      const result = await runJunior(['task', 'add', description]);
      if (result.exitCode !== 0)
        return { content: [{ type: 'text', text: result.stderr || result.stdout }], isError: true };
      return { content: [{ type: 'text', text: result.stdout }] };
    },
  );

  server.registerTool(
    'list_tasks',
    {
      description: 'List all tasks. Optionally filter by status.',
      inputSchema: {
        status: z.string().optional().describe('Filter by status: queued, running, done, failed, cancelled'),
      },
    },
    async ({ status }) => {
      const args = ['task', 'list', '--json'];
      if (status) args.push('--status', status);
      const result = await runJunior(args);
      if (result.exitCode !== 0)
        return { content: [{ type: 'text', text: result.stderr || result.stdout }], isError: true };
      return { content: [{ type: 'text', text: result.stdout }] };
    },
  );

  server.registerTool(
    'show_task',
    {
      description: 'Show details for a specific task.',
      inputSchema: { id: z.number().describe('Task ID') },
    },
    async ({ id }) => {
      const result = await runJunior(['task', 'show', String(id)]);
      if (result.exitCode !== 0)
        return { content: [{ type: 'text', text: result.stderr || result.stdout }], isError: true };
      return { content: [{ type: 'text', text: result.stdout }] };
    },
  );

  server.registerTool(
    'cancel_task',
    {
      description: 'Cancel a queued or running task.',
      inputSchema: { id: z.number().describe('Task ID') },
    },
    async ({ id }) => {
      const result = await runJunior(['task', 'cancel', String(id)]);
      if (result.exitCode !== 0)
        return { content: [{ type: 'text', text: result.stderr || result.stdout }], isError: true };
      return { content: [{ type: 'text', text: result.stdout }] };
    },
  );

  server.registerTool(
    'retry_task',
    {
      description: 'Re-queue a failed task for another attempt.',
      inputSchema: { id: z.number().describe('Task ID') },
    },
    async ({ id }) => {
      const result = await runJunior(['task', 'retry', String(id)]);
      if (result.exitCode !== 0)
        return { content: [{ type: 'text', text: result.stderr || result.stdout }], isError: true };
      return { content: [{ type: 'text', text: result.stdout }] };
    },
  );

  server.registerTool(
    'delete_task',
    {
      description: 'Delete a task and all its data.',
      inputSchema: { id: z.number().describe('Task ID') },
    },
    async ({ id }) => {
      const result = await runJunior(['task', 'delete', String(id)]);
      if (result.exitCode !== 0)
        return { content: [{ type: 'text', text: result.stderr || result.stdout }], isError: true };
      return { content: [{ type: 'text', text: result.stdout }] };
    },
  );

  server.registerTool(
    'task_logs',
    {
      description: 'Show execution logs for a task.',
      inputSchema: { id: z.number().describe('Task ID') },
    },
    async ({ id }) => {
      const result = await runJunior(['task', 'logs', String(id), '--last']);
      if (result.exitCode !== 0)
        return { content: [{ type: 'text', text: result.stderr || result.stdout }], isError: true };
      return { content: [{ type: 'text', text: result.stdout }] };
    },
  );
}
