import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { openGenerationJob } from '../../scripts/lib/radar-generation-job.mjs';

let directory: string, file: string;
beforeEach(async () => {
  directory = await mkdtemp(path.join(os.tmpdir(), 'radar-receipt-test-'));
  file = path.join(directory, 'job.json');
});
afterEach(async () => {
  await rm(directory, { recursive: true, force: true });
});

it('saves a receipt before mutation and reuses exact returned IDs on resume', async () => {
  const run = vi.fn();
  const first = await openGenerationJob(file, 'same-input', { run });
  await first.once('notebook', async () => {
    const state = JSON.parse(await readFile(file, 'utf8'));
    expect(state.steps.notebook.phase).toBe('submitted');
    return 'exact-notebook';
  });
  await first.once('generate:audio', async () => ({ id: 'exact-artifact' }));
  const resumed = await openGenerationJob(file, 'same-input', { run });
  const duplicate = vi.fn();
  expect(await resumed.once('notebook', duplicate)).toBe('exact-notebook');
  expect(await resumed.once('generate:audio', duplicate)).toEqual({ id: 'exact-artifact' });
  expect(duplicate).not.toHaveBeenCalled();
  expect(run).not.toHaveBeenCalled();
});

it('reads back an uncertain submission without generating again or choosing the latest result', async () => {
  const run = vi.fn(async () => ({
    stdout: '{"items":[{"id":"unrelated"},{"id":"maybe-original"}]}',
  }));
  const first = await openGenerationJob(file, 'same-input', { run });
  await first.once('notebook', async () => 'original-notebook');
  await expect(
    first.once('generate:audio', async () => {
      throw new Error('response lost');
    }),
  ).rejects.toThrow('response lost');
  const resumed = await openGenerationJob(file, 'same-input', { run });
  const generate = vi.fn();
  await expect(resumed.once('generate:audio', generate)).rejects.toThrow('Reconcile exact IDs');
  expect(run).toHaveBeenCalledWith([
    'artifact',
    'list',
    '--notebook',
    'original-notebook',
    '--json',
  ]);
  expect(generate).not.toHaveBeenCalled();
});

it('keeps an unknown notebook creation and changed inputs blocked without another mutation', async () => {
  const run = vi.fn(async () => ({ stdout: '[]' }));
  const first = await openGenerationJob(file, 'original', { run });
  await expect(
    first.once('notebook', async () => {
      throw new Error('create response lost');
    }),
  ).rejects.toThrow();
  const resumed = await openGenerationJob(file, 'original', { run });
  const create = vi.fn();
  await expect(resumed.once('notebook', create)).rejects.toThrow('no new submission');
  expect(run).toHaveBeenCalledWith(['list', '--json']);
  expect(create).not.toHaveBeenCalled();
  await expect(openGenerationJob(file, 'changed', { run })).rejects.toThrow('input changed');
});

it('refuses competing submissions to the same existing receipt without losing the winning ID', async () => {
  const run = vi.fn(async () => ({ stdout: '[]' }));
  const first = await openGenerationJob(file, 'same', { run });
  const second = await openGenerationJob(file, 'same', { run });
  const mutation = vi.fn(async () => 'only-artifact');
  const results = await Promise.allSettled([
    first.once('generate:audio', mutation),
    second.once('generate:audio', mutation),
  ]);
  expect(results.some((result) => result.status === 'fulfilled')).toBe(true);
  expect(mutation).toHaveBeenCalledTimes(1);
  expect(JSON.parse(await readFile(file, 'utf8')).steps['generate:audio']).toEqual({
    phase: 'completed',
    result: 'only-artifact',
  });
});


it.each(['directory', 'candidate', 'assets'])('retries failed local %s in the original job', async (name) => {
  const run = vi.fn();
  const first = await openGenerationJob(file, 'same', { run });
  await expect(first.once(name, async () => { throw new Error('local failure'); })).rejects.toThrow('local failure');
  expect(JSON.parse(await readFile(file, 'utf8')).steps[name].phase).toBe('failed');
  const resumed = await openGenerationJob(file, 'same', { run });
  expect(await resumed.once(name, async () => 'recovered')).toBe('recovered');
  expect(run).not.toHaveBeenCalled();
});

it('recovers an old uncertain local receipt without changing known remote IDs', async () => {
  const run = vi.fn();
  const job = await openGenerationJob(file, 'same', { run });
  await job.once('notebook', async () => 'original-notebook');
  await job.once('generate:audio', async () => ({ id: 'original-artifact' }));
  const state = JSON.parse(await readFile(file, 'utf8'));
  state.steps.assets = { phase: 'uncertain', error: 'old ffmpeg error' };
  await writeFile(file, JSON.stringify(state));
  expect(await job.once('assets', async () => 'local result')).toBe('local result');
  const next = JSON.parse(await readFile(file, 'utf8'));
  expect(next.steps.notebook.result).toBe('original-notebook');
  expect(next.steps['generate:audio'].result.id).toBe('original-artifact');
  expect(run).not.toHaveBeenCalled();
});

it('serializes a failed local retry without racing another writer', async () => {
  const run = vi.fn();
  const a = await openGenerationJob(file, 'same', { run });
  await expect(a.once('candidate', async () => { throw new Error('failed'); })).rejects.toThrow();
  const b = await openGenerationJob(file, 'same', { run });
  let release!: () => void;
  let entered!: () => void;
  const started = new Promise<void>(resolve => { entered = resolve; });
  const blocked = new Promise<void>(resolve => { release = resolve; });
  const first = a.once('candidate', async () => { entered(); await blocked; return 'only result'; });
  await started;
  const competing = vi.fn();
  await expect(b.once('candidate', competing)).rejects.toThrow('already claimed');
  release();
  expect(await first).toBe('only result');
  expect(competing).not.toHaveBeenCalled();
  expect(run).not.toHaveBeenCalled();
});

it.each(['source:report', 'generate:audio', 'generate:infographic', 'generate:deck'])(
  'never retries unknown remote %s as a local failure', async (name) => {
    const run = vi.fn(async () => ({ stdout: '[]' }));
    const job = await openGenerationJob(file, 'same', { run });
    await job.once('notebook', async () => 'exact-notebook');
    await expect(job.once(name, async () => { throw new Error('response lost'); })).rejects.toThrow();
    const duplicate = vi.fn();
    await expect(job.once(name, duplicate)).rejects.toThrow('outcome uncertain');
    expect(duplicate).not.toHaveBeenCalled();
  },
);
