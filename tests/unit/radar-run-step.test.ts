import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';

const script = fileURLToPath(new URL('../../scripts/radar/run-step.mjs', import.meta.url));

it('distinguishes successful processes from required nonempty deliverables', () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'radar-step-test-'));
  try {
    for (const [required, source, expected] of [
      [false, '', 0],
      [true, 'process.stdout.write("   ")', 2],
      [true, 'process.stderr.write("only diagnostic")', 2],
      [true, 'process.stdout.write("result")', 0],
    ] as const) {
      const r = spawnSync(
        process.execPath,
        [script, ...(required ? ['--require-output'] : []), '--', process.execPath, '-e', source],
        { cwd: dir, encoding: 'utf8' },
      );
      expect(r.status).toBe(expected);
      const record = JSON.parse(r.stdout.trim().split('\n').at(-1)!);
      expect(record.processExitCode).toBe(0);
      expect(record.status).toBe(expected === 0 ? 'success' : 'failed');
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

it('passes the input packet through and stores complete output in the log', () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'radar-step-test-'));
  try {
    const r = spawnSync(
      process.execPath,
      [
        script,
        '--require-output',
        '--',
        process.execPath,
        '-e',
        'process.stdin.pipe(process.stdout)',
      ],
      { cwd: dir, input: 'evidence packet', encoding: 'utf8' },
    );
    expect(r.status).toBe(0);
    const record = JSON.parse(r.stdout.trim().split('\n').at(-1)!);
    expect(readFileSync(record.logFile, 'utf8')).toBe('evidence packet');
    expect(r.stdout).not.toContain('evidence packet');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
