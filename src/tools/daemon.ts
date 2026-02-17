import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { runJunior } from '../cli.js';

export function registerDaemonTools(server: McpServer): void {
  server.registerTool(
    'daemon_status',
    {
      description: 'Show Junior daemon status — whether it is running, uptime, active and queued jobs.',
      inputSchema: {},
    },
    async () => {
      const result = await runJunior(['daemon', 'status']);
      if (result.exitCode !== 0)
        return { content: [{ type: 'text', text: result.stderr || result.stdout }], isError: true };
      return { content: [{ type: 'text', text: result.stdout }] };
    },
  );
}
