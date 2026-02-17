import { beforeEach, describe, expect, mock, test } from 'bun:test';
import { registerTaskTools } from './tasks.js';

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

describe('registerTaskTools', () => {
  test('registers all 7 task tools', () => {
    const server = createMockServer();
    registerTaskTools(server as never);

    const names = server.tools.map((t) => t.name);
    expect(names).toEqual([
      'create_task',
      'list_tasks',
      'show_task',
      'cancel_task',
      'retry_task',
      'delete_task',
      'task_logs',
    ]);
  });

  describe('create_task', () => {
    test('calls runJunior with correct args', async () => {
      runJuniorMock.mockResolvedValue({ stdout: 'Task 1 created', stderr: '', exitCode: 0 });
      const server = createMockServer();
      registerTaskTools(server as never);
      const tool = getTool(server.tools, 'create_task');

      const result = await tool.handler({ description: 'fix the bug' });

      expect(runJuniorMock).toHaveBeenCalledWith(['task', 'add', 'fix the bug']);
      expect(result).toEqual({ content: [{ type: 'text', text: 'Task 1 created' }] });
    });

    test('returns isError when exitCode is non-zero', async () => {
      runJuniorMock.mockResolvedValue({ stdout: '', stderr: 'failed to create', exitCode: 1 });
      const server = createMockServer();
      registerTaskTools(server as never);
      const tool = getTool(server.tools, 'create_task');

      const result = await tool.handler({ description: 'bad task' });

      expect(result).toEqual({ content: [{ type: 'text', text: 'failed to create' }], isError: true });
    });
  });

  describe('list_tasks', () => {
    test('calls runJunior with --json flag', async () => {
      runJuniorMock.mockResolvedValue({ stdout: '[]', stderr: '', exitCode: 0 });
      const server = createMockServer();
      registerTaskTools(server as never);
      const tool = getTool(server.tools, 'list_tasks');

      await tool.handler({});

      expect(runJuniorMock).toHaveBeenCalledWith(['task', 'list', '--json']);
    });

    test('passes status filter when provided', async () => {
      runJuniorMock.mockResolvedValue({ stdout: '[]', stderr: '', exitCode: 0 });
      const server = createMockServer();
      registerTaskTools(server as never);
      const tool = getTool(server.tools, 'list_tasks');

      await tool.handler({ status: 'running' });

      expect(runJuniorMock).toHaveBeenCalledWith(['task', 'list', '--json', '--status', 'running']);
    });

    test('returns isError when exitCode is non-zero', async () => {
      runJuniorMock.mockResolvedValue({ stdout: '', stderr: 'list error', exitCode: 1 });
      const server = createMockServer();
      registerTaskTools(server as never);
      const tool = getTool(server.tools, 'list_tasks');

      const result = await tool.handler({});

      expect(result).toEqual({ content: [{ type: 'text', text: 'list error' }], isError: true });
    });
  });

  describe('show_task', () => {
    test('calls runJunior with string id', async () => {
      runJuniorMock.mockResolvedValue({ stdout: 'task details', stderr: '', exitCode: 0 });
      const server = createMockServer();
      registerTaskTools(server as never);
      const tool = getTool(server.tools, 'show_task');

      const result = await tool.handler({ id: 42 });

      expect(runJuniorMock).toHaveBeenCalledWith(['task', 'show', '42']);
      expect(result).toEqual({ content: [{ type: 'text', text: 'task details' }] });
    });

    test('returns isError when exitCode is non-zero', async () => {
      runJuniorMock.mockResolvedValue({ stdout: '', stderr: 'not found', exitCode: 1 });
      const server = createMockServer();
      registerTaskTools(server as never);
      const tool = getTool(server.tools, 'show_task');

      const result = await tool.handler({ id: 999 });

      expect(result).toEqual({ content: [{ type: 'text', text: 'not found' }], isError: true });
    });
  });

  describe('cancel_task', () => {
    test('calls runJunior with correct args', async () => {
      runJuniorMock.mockResolvedValue({ stdout: 'cancelled', stderr: '', exitCode: 0 });
      const server = createMockServer();
      registerTaskTools(server as never);
      const tool = getTool(server.tools, 'cancel_task');

      const result = await tool.handler({ id: 5 });

      expect(runJuniorMock).toHaveBeenCalledWith(['task', 'cancel', '5']);
      expect(result).toEqual({ content: [{ type: 'text', text: 'cancelled' }] });
    });

    test('returns isError when exitCode is non-zero', async () => {
      runJuniorMock.mockResolvedValue({ stdout: 'fallback', stderr: '', exitCode: 1 });
      const server = createMockServer();
      registerTaskTools(server as never);
      const tool = getTool(server.tools, 'cancel_task');

      const result = await tool.handler({ id: 5 });

      expect(result).toEqual({ content: [{ type: 'text', text: 'fallback' }], isError: true });
    });
  });

  describe('retry_task', () => {
    test('calls runJunior with correct args', async () => {
      runJuniorMock.mockResolvedValue({ stdout: 'retried', stderr: '', exitCode: 0 });
      const server = createMockServer();
      registerTaskTools(server as never);
      const tool = getTool(server.tools, 'retry_task');

      const result = await tool.handler({ id: 3 });

      expect(runJuniorMock).toHaveBeenCalledWith(['task', 'retry', '3']);
      expect(result).toEqual({ content: [{ type: 'text', text: 'retried' }] });
    });

    test('returns isError when exitCode is non-zero', async () => {
      runJuniorMock.mockResolvedValue({ stdout: '', stderr: 'retry failed', exitCode: 1 });
      const server = createMockServer();
      registerTaskTools(server as never);
      const tool = getTool(server.tools, 'retry_task');

      const result = await tool.handler({ id: 3 });

      expect(result).toEqual({ content: [{ type: 'text', text: 'retry failed' }], isError: true });
    });
  });

  describe('delete_task', () => {
    test('calls runJunior with correct args', async () => {
      runJuniorMock.mockResolvedValue({ stdout: 'deleted', stderr: '', exitCode: 0 });
      const server = createMockServer();
      registerTaskTools(server as never);
      const tool = getTool(server.tools, 'delete_task');

      const result = await tool.handler({ id: 7 });

      expect(runJuniorMock).toHaveBeenCalledWith(['task', 'delete', '7']);
      expect(result).toEqual({ content: [{ type: 'text', text: 'deleted' }] });
    });

    test('returns isError when exitCode is non-zero', async () => {
      runJuniorMock.mockResolvedValue({ stdout: '', stderr: 'delete error', exitCode: 1 });
      const server = createMockServer();
      registerTaskTools(server as never);
      const tool = getTool(server.tools, 'delete_task');

      const result = await tool.handler({ id: 7 });

      expect(result).toEqual({ content: [{ type: 'text', text: 'delete error' }], isError: true });
    });
  });

  describe('task_logs', () => {
    test('calls runJunior with --last flag', async () => {
      runJuniorMock.mockResolvedValue({ stdout: 'log output', stderr: '', exitCode: 0 });
      const server = createMockServer();
      registerTaskTools(server as never);
      const tool = getTool(server.tools, 'task_logs');

      const result = await tool.handler({ id: 10 });

      expect(runJuniorMock).toHaveBeenCalledWith(['task', 'logs', '10', '--last']);
      expect(result).toEqual({ content: [{ type: 'text', text: 'log output' }] });
    });

    test('returns isError when exitCode is non-zero', async () => {
      runJuniorMock.mockResolvedValue({ stdout: '', stderr: 'no logs', exitCode: 1 });
      const server = createMockServer();
      registerTaskTools(server as never);
      const tool = getTool(server.tools, 'task_logs');

      const result = await tool.handler({ id: 10 });

      expect(result).toEqual({ content: [{ type: 'text', text: 'no logs' }], isError: true });
    });
  });

  test('error handler prefers stderr over stdout', async () => {
    runJuniorMock.mockResolvedValue({ stdout: 'stdout msg', stderr: 'stderr msg', exitCode: 1 });
    const server = createMockServer();
    registerTaskTools(server as never);
    const tool = getTool(server.tools, 'create_task');

    const result = await tool.handler({ description: 'test' });

    expect(result).toEqual({ content: [{ type: 'text', text: 'stderr msg' }], isError: true });
  });

  test('error handler falls back to stdout when stderr is empty', async () => {
    runJuniorMock.mockResolvedValue({ stdout: 'stdout fallback', stderr: '', exitCode: 1 });
    const server = createMockServer();
    registerTaskTools(server as never);
    const tool = getTool(server.tools, 'create_task');

    const result = await tool.handler({ description: 'test' });

    expect(result).toEqual({ content: [{ type: 'text', text: 'stdout fallback' }], isError: true });
  });
});
