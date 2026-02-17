import { afterEach, describe, expect, mock, test } from 'bun:test';
import { runJunior } from './cli.js';

function makeProc(stdout: string, stderr: string, exitCode: number) {
  return {
    stdout: new Response(stdout).body,
    stderr: new Response(stderr).body,
    exited: Promise.resolve(exitCode),
    pid: 1,
    stdin: undefined,
    kill: () => {},
    ref: () => {},
    unref: () => {},
    exitCode: null,
    signalCode: null,
    killed: false,
    readable: new ReadableStream(),
    resourceUsage: () => ({ userCPUTime: 0, systemCPUTime: 0, maxRSS: 0 }),
  };
}

const spawnMock = mock();

const originalSpawn = Bun.spawn;

afterEach(() => {
  spawnMock.mockRestore();
  Bun.spawn = originalSpawn;
});

describe('runJunior', () => {
  test('spawns junior with correct args', async () => {
    spawnMock.mockImplementation(() => makeProc('ok', '', 0));
    Bun.spawn = spawnMock as typeof Bun.spawn;

    await runJunior(['task', 'list', '--json']);

    expect(spawnMock).toHaveBeenCalledWith(['junior', 'task', 'list', '--json'], {
      stdout: 'pipe',
      stderr: 'pipe',
      stdin: 'ignore',
    });
  });

  test('returns stdout, stderr, and exitCode', async () => {
    spawnMock.mockImplementation(() => makeProc('output text', 'error text', 0));
    Bun.spawn = spawnMock as typeof Bun.spawn;

    const result = await runJunior(['task', 'show', '1']);

    expect(result).toEqual({ stdout: 'output text', stderr: 'error text', exitCode: 0 });
  });

  test('trims whitespace from stdout and stderr', async () => {
    spawnMock.mockImplementation(() => makeProc('  hello world  \n', '  warn  \n', 0));
    Bun.spawn = spawnMock as typeof Bun.spawn;

    const result = await runJunior(['daemon', 'status']);

    expect(result.stdout).toBe('hello world');
    expect(result.stderr).toBe('warn');
  });

  test('returns non-zero exitCode on failure', async () => {
    spawnMock.mockImplementation(() => makeProc('', 'not found', 1));
    Bun.spawn = spawnMock as typeof Bun.spawn;

    const result = await runJunior(['task', 'show', '999']);

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toBe('not found');
  });
});
