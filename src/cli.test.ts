import { afterEach, describe, expect, mock, test } from 'bun:test';
import { runJunior } from './cli.js';

type ExecFileCallback = (error: Error | null, stdout: string, stderr: string) => void;

const execFileMock = mock();

mock.module('node:child_process', () => ({
  execFile: execFileMock,
}));

afterEach(() => {
  execFileMock.mockReset();
});

describe('runJunior', () => {
  test('calls execFile with correct args', async () => {
    execFileMock.mockImplementation((_cmd: string, _args: string[], _opts: unknown, cb: ExecFileCallback) => {
      cb(null, 'ok', '');
    });

    await runJunior(['task', 'list', '--json']);

    expect(execFileMock).toHaveBeenCalledWith(
      'junior',
      ['task', 'list', '--json'],
      expect.any(Object),
      expect.any(Function),
    );
  });

  test('returns stdout, stderr, and exitCode', async () => {
    execFileMock.mockImplementation((_cmd: string, _args: string[], _opts: unknown, cb: ExecFileCallback) => {
      cb(null, 'output text', 'error text');
    });

    const result = await runJunior(['task', 'show', '1']);

    expect(result).toEqual({ stdout: 'output text', stderr: 'error text', exitCode: 0 });
  });

  test('trims whitespace from stdout and stderr', async () => {
    execFileMock.mockImplementation((_cmd: string, _args: string[], _opts: unknown, cb: ExecFileCallback) => {
      cb(null, '  hello world  \n', '  warn  \n');
    });

    const result = await runJunior(['daemon', 'status']);

    expect(result.stdout).toBe('hello world');
    expect(result.stderr).toBe('warn');
  });

  test('returns non-zero exitCode on failure', async () => {
    execFileMock.mockImplementation((_cmd: string, _args: string[], _opts: unknown, cb: ExecFileCallback) => {
      const error = Object.assign(new Error('Command failed'), { code: 1 });
      cb(error, '', 'not found');
    });

    const result = await runJunior(['task', 'show', '999']);

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toBe('not found');
  });
});
