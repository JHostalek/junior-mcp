export interface CliResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export async function runJunior(args: string[]): Promise<CliResult> {
  const proc = Bun.spawn(['junior', ...args], {
    stdout: 'pipe',
    stderr: 'pipe',
    stdin: 'ignore',
  });

  const [stdout, stderr] = await Promise.all([new Response(proc.stdout).text(), new Response(proc.stderr).text()]);

  const exitCode = await proc.exited;

  return { stdout: stdout.trim(), stderr: stderr.trim(), exitCode };
}
