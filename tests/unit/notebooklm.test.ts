import { EventEmitter } from 'node:events';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { beforeEach, expect, it, vi } from 'vitest';

const { spawn } = vi.hoisted(() => ({ spawn: vi.fn() }));
vi.mock('node:child_process', () => ({ spawn }));
import {
  addSourceFile,
  generationArtifact,
  waitForArtifact,
} from '../../scripts/lib/notebooklm.mjs';

beforeEach(() => spawn.mockReset());

function reply(payload: unknown) {
  spawn.mockImplementationOnce(() => {
    const child = Object.assign(new EventEmitter(), {
      stdout: new EventEmitter(),
      stderr: new EventEmitter(),
    });
    queueMicrotask(() => {
      child.stdout.emit('data', JSON.stringify(payload));
      child.emit('close', 0);
    });
    return child;
  });
}

it('waits on the source returned by add without selecting from a list', async () => {
  reply({ source: { id: 'returned-source' } });
  reply({ status: 'ready' });
  await addSourceFile('notebook', '/tmp/source.md');
  expect(spawn.mock.calls.map((call) => call[1])).toEqual([
    ['source', 'add', '--notebook', 'notebook', '--follow-symlinks', '/tmp/source.md', '--json'],
    ['source', 'wait', '--notebook', 'notebook', 'returned-source', '--timeout', '300', '--json'],
  ]);
});

it('rejects a missing task ID instead of choosing an older artifact', () => {
  expect(() => generationArtifact('{"status":"failed"}')).toThrow('no task_id');
  expect(spawn).not.toHaveBeenCalled();
});

it('waits on the exact generation task', async () => {
  reply({ status: 'completed' });
  const artifact = generationArtifact('{"task_id":"new-task","status":"pending"}');
  expect(await waitForArtifact('notebook', artifact)).toEqual({ id: 'new-task' });
  expect(spawn.mock.calls[0][1]).toEqual([
    'artifact',
    'wait',
    '--notebook',
    'notebook',
    'new-task',
    '--timeout',
    '900',
    '--json',
  ]);
  const key = createHash('sha256').update('notebook:new-task').digest('hex');
  const state = JSON.parse(await readFile(`tmp/radar-artifact-jobs/${key}.json`, 'utf8'));
  expect(state).toMatchObject({
    notebookId: 'notebook',
    artifactId: 'new-task',
    phase: 'completed',
  });
});

it('keeps exact task identity when waiting fails without claiming generation failure', async () => {
  spawn.mockImplementationOnce(() => {
    const child = Object.assign(new EventEmitter(), {
      stdout: new EventEmitter(),
      stderr: new EventEmitter(),
    });
    queueMicrotask(() => {
      child.stderr.emit('data', 'Wait timed out');
      child.emit('close', 1);
    });
    return child;
  });
  await expect(waitForArtifact('notebook', { id: 'pending-task' })).rejects.toThrow(
    'Wait timed out',
  );
  const key = createHash('sha256').update('notebook:pending-task').digest('hex');
  const state = JSON.parse(await readFile(`tmp/radar-artifact-jobs/${key}.json`, 'utf8'));
  expect(state).toMatchObject({ artifactId: 'pending-task', phase: 'wait_interrupted' });
  expect(state.nextAction).toContain('do_not_regenerate');
  expect(spawn).toHaveBeenCalledTimes(1);
});
