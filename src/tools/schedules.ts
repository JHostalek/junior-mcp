import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { runJunior } from '../cli.js';

export function registerScheduleTools(server: McpServer): void {
  server.registerTool(
    'create_schedule',
    {
      description: 'Create a cron-based recurring task schedule from a natural-language description.',
      inputSchema: {
        description: z
          .string()
          .describe('Natural-language schedule description, e.g. "run lint checks every weekday at 9am"'),
      },
    },
    async ({ description }) => {
      const result = await runJunior(['schedule', 'add', description]);
      if (result.exitCode !== 0)
        return { content: [{ type: 'text', text: result.stderr || result.stdout }], isError: true };
      return { content: [{ type: 'text', text: result.stdout }] };
    },
  );

  server.registerTool(
    'list_schedules',
    {
      description: 'List all schedules.',
      inputSchema: {},
    },
    async () => {
      const result = await runJunior(['schedule', 'list']);
      if (result.exitCode !== 0)
        return { content: [{ type: 'text', text: result.stderr || result.stdout }], isError: true };
      return { content: [{ type: 'text', text: result.stdout }] };
    },
  );

  server.registerTool(
    'pause_schedule',
    {
      description: 'Pause a schedule.',
      inputSchema: { id: z.number().describe('Schedule ID') },
    },
    async ({ id }) => {
      const result = await runJunior(['schedule', 'pause', String(id)]);
      if (result.exitCode !== 0)
        return { content: [{ type: 'text', text: result.stderr || result.stdout }], isError: true };
      return { content: [{ type: 'text', text: result.stdout }] };
    },
  );

  server.registerTool(
    'resume_schedule',
    {
      description: 'Resume a paused schedule.',
      inputSchema: { id: z.number().describe('Schedule ID') },
    },
    async ({ id }) => {
      const result = await runJunior(['schedule', 'resume', String(id)]);
      if (result.exitCode !== 0)
        return { content: [{ type: 'text', text: result.stderr || result.stdout }], isError: true };
      return { content: [{ type: 'text', text: result.stdout }] };
    },
  );

  server.registerTool(
    'remove_schedule',
    {
      description: 'Remove a schedule.',
      inputSchema: { id: z.number().describe('Schedule ID') },
    },
    async ({ id }) => {
      const result = await runJunior(['schedule', 'remove', String(id)]);
      if (result.exitCode !== 0)
        return { content: [{ type: 'text', text: result.stderr || result.stdout }], isError: true };
      return { content: [{ type: 'text', text: result.stdout }] };
    },
  );
}
