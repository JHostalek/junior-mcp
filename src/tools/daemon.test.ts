import { beforeEach, describe, expect, mock, test } from 'bun:test';
import { registerDaemonTools } from './daemon.js';

const runJuniorMock = mock();
mock.module('../cli.js', () => ({ runJunior: runJuniorMock }));

type ToolHandler = (
  args: Record<string, unknown>,
) => Promise<{ content: { type: string; text: string }[]; isError?: boolean }>;

interface RegisteredTool {
  name: string;
  config: Record<string, unknown>;
  handler: ToolHandler;
}

function createMockServer() {
  const tools: RegisteredTool[] = [];
  return {
    tools,
    registerTool(name: string, config: Record<string, unknown>, handler: ToolHandler) {
      tools.push({ name, config, handler });
    },
  };
}

function getTool(tools: RegisteredTool[], name: string): RegisteredTool {
  const tool = tools.find((t) => t.name === name);
  if (!tool) throw new Error(`Tool "${name}" not found`);
  return tool;
}

beforeEach(() => {
  runJuniorMock.mockReset();
});

describe('registerDaemonTools', () => {
  test('registers daemon_status tool', () => {
    const server = createMockServer();
    registerDaemonTools(server as never);

    const names = server.tools.map((t) => t.name);
    expect(names).toEqual(['daemon_status']);
  });

  describe('daemon_status', () => {
    test('calls runJunior with correct args', async () => {
      runJuniorMock.mockResolvedValue({ stdout: 'daemon running', stderr: '', exitCode: 0 });
      const server = createMockServer();
      registerDaemonTools(server as never);
      const tool = getTool(server.tools, 'daemon_status');

      const result = await tool.handler({});

      expect(runJuniorMock).toHaveBeenCalledWith(['daemon', 'status']);
      expect(result).toEqual({ content: [{ type: 'text', text: 'daemon running' }] });
    });

    test('returns isError when exitCode is non-zero', async () => {
      runJuniorMock.mockResolvedValue({ stdout: '', stderr: 'daemon not running', exitCode: 1 });
      const server = createMockServer();
      registerDaemonTools(server as never);
      const tool = getTool(server.tools, 'daemon_status');

      const result = await tool.handler({});

      expect(result).toEqual({ content: [{ type: 'text', text: 'daemon not running' }], isError: true });
    });

    test('falls back to stdout when stderr is empty on error', async () => {
      runJuniorMock.mockResolvedValue({ stdout: 'stdout fallback', stderr: '', exitCode: 1 });
      const server = createMockServer();
      registerDaemonTools(server as never);
      const tool = getTool(server.tools, 'daemon_status');

      const result = await tool.handler({});

      expect(result).toEqual({ content: [{ type: 'text', text: 'stdout fallback' }], isError: true });
    });
  });
});
