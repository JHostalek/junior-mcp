import { beforeEach, describe, expect, mock, test } from 'bun:test';
import { registerHookTools } from './hooks.js';

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

describe('registerHookTools', () => {
  test('registers all 5 hook tools', () => {
    const server = createMockServer();
    registerHookTools(server as never);

    const names = server.tools.map((t) => t.name);
    expect(names).toEqual(['create_hook', 'list_hooks', 'pause_hook', 'resume_hook', 'remove_hook']);
  });

  describe('create_hook', () => {
    test('calls runJunior with correct args', async () => {
      runJuniorMock.mockResolvedValue({ stdout: 'Hook created', stderr: '', exitCode: 0 });
      const server = createMockServer();
      registerHookTools(server as never);
      const tool = getTool(server.tools, 'create_hook');

      const result = await tool.handler({ description: 'whenever main changes, review the diff' });

      expect(runJuniorMock).toHaveBeenCalledWith(['hook', 'add', 'whenever main changes, review the diff']);
      expect(result).toEqual({ content: [{ type: 'text', text: 'Hook created' }] });
    });

    test('returns isError when exitCode is non-zero', async () => {
      runJuniorMock.mockResolvedValue({ stdout: '', stderr: 'hook error', exitCode: 1 });
      const server = createMockServer();
      registerHookTools(server as never);
      const tool = getTool(server.tools, 'create_hook');

      const result = await tool.handler({ description: 'bad hook' });

      expect(result).toEqual({ content: [{ type: 'text', text: 'hook error' }], isError: true });
    });
  });

  describe('list_hooks', () => {
    test('calls runJunior with correct args', async () => {
      runJuniorMock.mockResolvedValue({ stdout: 'hooks list', stderr: '', exitCode: 0 });
      const server = createMockServer();
      registerHookTools(server as never);
      const tool = getTool(server.tools, 'list_hooks');

      const result = await tool.handler({});

      expect(runJuniorMock).toHaveBeenCalledWith(['hook', 'list']);
      expect(result).toEqual({ content: [{ type: 'text', text: 'hooks list' }] });
    });

    test('returns isError when exitCode is non-zero', async () => {
      runJuniorMock.mockResolvedValue({ stdout: '', stderr: 'list error', exitCode: 1 });
      const server = createMockServer();
      registerHookTools(server as never);
      const tool = getTool(server.tools, 'list_hooks');

      const result = await tool.handler({});

      expect(result).toEqual({ content: [{ type: 'text', text: 'list error' }], isError: true });
    });
  });

  describe('pause_hook', () => {
    test('calls runJunior with correct args', async () => {
      runJuniorMock.mockResolvedValue({ stdout: 'paused', stderr: '', exitCode: 0 });
      const server = createMockServer();
      registerHookTools(server as never);
      const tool = getTool(server.tools, 'pause_hook');

      const result = await tool.handler({ id: 1 });

      expect(runJuniorMock).toHaveBeenCalledWith(['hook', 'pause', '1']);
      expect(result).toEqual({ content: [{ type: 'text', text: 'paused' }] });
    });

    test('returns isError when exitCode is non-zero', async () => {
      runJuniorMock.mockResolvedValue({ stdout: '', stderr: 'pause error', exitCode: 1 });
      const server = createMockServer();
      registerHookTools(server as never);
      const tool = getTool(server.tools, 'pause_hook');

      const result = await tool.handler({ id: 1 });

      expect(result).toEqual({ content: [{ type: 'text', text: 'pause error' }], isError: true });
    });
  });

  describe('resume_hook', () => {
    test('calls runJunior with correct args', async () => {
      runJuniorMock.mockResolvedValue({ stdout: 'resumed', stderr: '', exitCode: 0 });
      const server = createMockServer();
      registerHookTools(server as never);
      const tool = getTool(server.tools, 'resume_hook');

      const result = await tool.handler({ id: 3 });

      expect(runJuniorMock).toHaveBeenCalledWith(['hook', 'resume', '3']);
      expect(result).toEqual({ content: [{ type: 'text', text: 'resumed' }] });
    });

    test('returns isError when exitCode is non-zero', async () => {
      runJuniorMock.mockResolvedValue({ stdout: '', stderr: 'resume error', exitCode: 1 });
      const server = createMockServer();
      registerHookTools(server as never);
      const tool = getTool(server.tools, 'resume_hook');

      const result = await tool.handler({ id: 3 });

      expect(result).toEqual({ content: [{ type: 'text', text: 'resume error' }], isError: true });
    });
  });

  describe('remove_hook', () => {
    test('calls runJunior with correct args', async () => {
      runJuniorMock.mockResolvedValue({ stdout: 'removed', stderr: '', exitCode: 0 });
      const server = createMockServer();
      registerHookTools(server as never);
      const tool = getTool(server.tools, 'remove_hook');

      const result = await tool.handler({ id: 8 });

      expect(runJuniorMock).toHaveBeenCalledWith(['hook', 'remove', '8']);
      expect(result).toEqual({ content: [{ type: 'text', text: 'removed' }] });
    });

    test('returns isError when exitCode is non-zero', async () => {
      runJuniorMock.mockResolvedValue({ stdout: '', stderr: 'remove error', exitCode: 1 });
      const server = createMockServer();
      registerHookTools(server as never);
      const tool = getTool(server.tools, 'remove_hook');

      const result = await tool.handler({ id: 8 });

      expect(result).toEqual({ content: [{ type: 'text', text: 'remove error' }], isError: true });
    });
  });
});
