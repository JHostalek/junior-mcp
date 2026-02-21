import { execFile } from 'node:child_process';

export interface CliResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export function runJunior(args: string[]): Promise<CliResult> {
  return new Promise((resolve) => {
    execFile('junior', args, { encoding: 'utf-8' }, (error, stdout, stderr) => {
      resolve({
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        exitCode: error?.code && typeof error.code === 'number' ? error.code : error ? 1 : 0,
      });
    });
  });
}
