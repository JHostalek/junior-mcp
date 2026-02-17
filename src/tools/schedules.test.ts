import { beforeEach, describe, expect, mock, test } from 'bun:test';
import { registerScheduleTools } from './schedules.js';

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

describe('registerScheduleTools', () => {
  test('registers all 5 schedule tools', () => {
    const server = createMockServer();
    registerScheduleTools(server as never);

    const names = server.tools.map((t) => t.name);
    expect(names).toEqual([
      'create_schedule',
      'list_schedules',
      'pause_schedule',
      'resume_schedule',
      'remove_schedule',
    ]);
  });

  describe('create_schedule', () => {
    test('calls runJunior with correct args', async () => {
      runJuniorMock.mockResolvedValue({ stdout: 'Schedule created', stderr: '', exitCode: 0 });
      const server = createMockServer();
      registerScheduleTools(server as never);
      const tool = getTool(server.tools, 'create_schedule');

      const result = await tool.handler({ description: 'run lint every day at 9am' });

      expect(runJuniorMock).toHaveBeenCalledWith(['schedule', 'add', 'run lint every day at 9am']);
      expect(result).toEqual({ content: [{ type: 'text', text: 'Schedule created' }] });
    });

    test('returns isError when exitCode is non-zero', async () => {
      runJuniorMock.mockResolvedValue({ stdout: '', stderr: 'parse error', exitCode: 1 });
      const server = createMockServer();
      registerScheduleTools(server as never);
      const tool = getTool(server.tools, 'create_schedule');

      const result = await tool.handler({ description: 'bad schedule' });

      expect(result).toEqual({ content: [{ type: 'text', text: 'parse error' }], isError: true });
    });
  });

  describe('list_schedules', () => {
    test('calls runJunior with correct args', async () => {
      runJuniorMock.mockResolvedValue({ stdout: 'schedules list', stderr: '', exitCode: 0 });
      const server = createMockServer();
      registerScheduleTools(server as never);
      const tool = getTool(server.tools, 'list_schedules');

      const result = await tool.handler({});

      expect(runJuniorMock).toHaveBeenCalledWith(['schedule', 'list']);
      expect(result).toEqual({ content: [{ type: 'text', text: 'schedules list' }] });
    });

    test('returns isError when exitCode is non-zero', async () => {
      runJuniorMock.mockResolvedValue({ stdout: '', stderr: 'list error', exitCode: 1 });
      const server = createMockServer();
      registerScheduleTools(server as never);
      const tool = getTool(server.tools, 'list_schedules');

      const result = await tool.handler({});

      expect(result).toEqual({ content: [{ type: 'text', text: 'list error' }], isError: true });
    });
  });

  describe('pause_schedule', () => {
    test('calls runJunior with correct args', async () => {
      runJuniorMock.mockResolvedValue({ stdout: 'paused', stderr: '', exitCode: 0 });
      const server = createMockServer();
      registerScheduleTools(server as never);
      const tool = getTool(server.tools, 'pause_schedule');

      const result = await tool.handler({ id: 2 });

      expect(runJuniorMock).toHaveBeenCalledWith(['schedule', 'pause', '2']);
      expect(result).toEqual({ content: [{ type: 'text', text: 'paused' }] });
    });

    test('returns isError when exitCode is non-zero', async () => {
      runJuniorMock.mockResolvedValue({ stdout: '', stderr: 'pause error', exitCode: 1 });
      const server = createMockServer();
      registerScheduleTools(server as never);
      const tool = getTool(server.tools, 'pause_schedule');

      const result = await tool.handler({ id: 2 });

      expect(result).toEqual({ content: [{ type: 'text', text: 'pause error' }], isError: true });
    });
  });

  describe('resume_schedule', () => {
    test('calls runJunior with correct args', async () => {
      runJuniorMock.mockResolvedValue({ stdout: 'resumed', stderr: '', exitCode: 0 });
      const server = createMockServer();
      registerScheduleTools(server as never);
      const tool = getTool(server.tools, 'resume_schedule');

      const result = await tool.handler({ id: 4 });

      expect(runJuniorMock).toHaveBeenCalledWith(['schedule', 'resume', '4']);
      expect(result).toEqual({ content: [{ type: 'text', text: 'resumed' }] });
    });

    test('returns isError when exitCode is non-zero', async () => {
      runJuniorMock.mockResolvedValue({ stdout: '', stderr: 'resume error', exitCode: 1 });
      const server = createMockServer();
      registerScheduleTools(server as never);
      const tool = getTool(server.tools, 'resume_schedule');

      const result = await tool.handler({ id: 4 });

      expect(result).toEqual({ content: [{ type: 'text', text: 'resume error' }], isError: true });
    });
  });

  describe('remove_schedule', () => {
    test('calls runJunior with correct args', async () => {
      runJuniorMock.mockResolvedValue({ stdout: 'removed', stderr: '', exitCode: 0 });
      const server = createMockServer();
      registerScheduleTools(server as never);
      const tool = getTool(server.tools, 'remove_schedule');

      const result = await tool.handler({ id: 6 });

      expect(runJuniorMock).toHaveBeenCalledWith(['schedule', 'remove', '6']);
      expect(result).toEqual({ content: [{ type: 'text', text: 'removed' }] });
    });

    test('returns isError when exitCode is non-zero', async () => {
      runJuniorMock.mockResolvedValue({ stdout: '', stderr: 'remove error', exitCode: 1 });
      const server = createMockServer();
      registerScheduleTools(server as never);
      const tool = getTool(server.tools, 'remove_schedule');

      const result = await tool.handler({ id: 6 });

      expect(result).toEqual({ content: [{ type: 'text', text: 'remove error' }], isError: true });
    });
  });
});
