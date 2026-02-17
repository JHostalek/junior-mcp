import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { runJunior } from '../cli.js';

export function registerHookTools(server: McpServer): void {
  server.registerTool(
    'create_hook',
    {
      description: 'Create a reactive hook from a natural-language description.',
      inputSchema: {
        description: z
          .string()
          .describe('Natural-language hook description, e.g. "whenever main changes, review the diff"'),
      },
    },
    async ({ description }) => {
      const result = await runJunior(['hook', 'add', description]);
      if (result.exitCode !== 0)
        return { content: [{ type: 'text', text: result.stderr || result.stdout }], isError: true };
      return { content: [{ type: 'text', text: result.stdout }] };
    },
  );

  server.registerTool(
    'list_hooks',
    {
      description: 'List all hooks.',
      inputSchema: {},
    },
    async () => {
      const result = await runJunior(['hook', 'list']);
      if (result.exitCode !== 0)
        return { content: [{ type: 'text', text: result.stderr || result.stdout }], isError: true };
      return { content: [{ type: 'text', text: result.stdout }] };
    },
  );

  server.registerTool(
    'pause_hook',
    {
      description: 'Pause a hook.',
      inputSchema: { id: z.number().describe('Hook ID') },
    },
    async ({ id }) => {
      const result = await runJunior(['hook', 'pause', String(id)]);
      if (result.exitCode !== 0)
        return { content: [{ type: 'text', text: result.stderr || result.stdout }], isError: true };
      return { content: [{ type: 'text', text: result.stdout }] };
    },
  );

  server.registerTool(
    'resume_hook',
    {
      description: 'Resume a paused hook.',
      inputSchema: { id: z.number().describe('Hook ID') },
    },
    async ({ id }) => {
      const result = await runJunior(['hook', 'resume', String(id)]);
      if (result.exitCode !== 0)
        return { content: [{ type: 'text', text: result.stderr || result.stdout }], isError: true };
      return { content: [{ type: 'text', text: result.stdout }] };
    },
  );

  server.registerTool(
    'remove_hook',
    {
      description: 'Remove a hook.',
      inputSchema: { id: z.number().describe('Hook ID') },
    },
    async ({ id }) => {
      const result = await runJunior(['hook', 'remove', String(id)]);
      if (result.exitCode !== 0)
        return { content: [{ type: 'text', text: result.stderr || result.stdout }], isError: true };
      return { content: [{ type: 'text', text: result.stdout }] };
    },
  );
}
