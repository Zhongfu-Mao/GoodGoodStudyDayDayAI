import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  create: vi.fn(),
  source: vi.fn(),
  run: vi.fn(),
  wait: vi.fn(),
  publish: vi.fn(),
  hold: vi.fn(),
  inspect: vi.fn(),
  compress: vi.fn(),
  directory: vi.fn(),
  publicCopy: vi.fn(),
}));
vi.mock('node:fs/promises', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:fs/promises')>();
  return {
    ...actual,
    mkdir: (file: string, options: unknown) =>
      String(file).includes('/public/') ? Promise.resolve() : actual.mkdir(file, options as any),
    copyFile: (from: string, to: string) =>
      String(to).includes('/public/') ? mocks.publicCopy(from, to) : actual.copyFile(from, to),
  };
});
vi.mock('../../scripts/lib/notebooklm.mjs', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  createNotebook: mocks.create,
  addSourceFile: mocks.source,
  runNotebooklm: mocks.run,
  waitForArtifact: mocks.wait,
}));
vi.mock('../../scripts/lib/radar-review.mjs', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  inspectAudio: mocks.inspect,
  newCandidateDirectory: mocks.directory,
}));
vi.mock('../../scripts/lib/radar-assets.mjs', () => ({ publishRadarAsset: mocks.publish }));
vi.mock('../../scripts/lib/radar-publication.mjs', () => ({
  assertRadarPublicationAllowed: mocks.hold,
}));
vi.mock('../../scripts/lib/audio-compression.mjs', () => ({ compressSpeechMp3: mocks.compress }));
import { main as weekly } from '../../scripts/radar/generate-weekly-assets.mjs';
import { main as monthly } from '../../scripts/radar/generate-monthly-assets.mjs';

let root: string, target: string, raw: string;
beforeEach(async () => {
  vi.resetAllMocks();
  root = await mkdtemp(path.join(os.tmpdir(), 'radar-period-fixture-'));
  mocks.create.mockResolvedValue('fixture-notebook');
  mocks.source.mockImplementation(async (_id: string, file: string) => ({
    id: `source-${path.basename(file)}`,
  }));
  mocks.directory.mockImplementation(async () => {
    const dir = path.join(root, 'private-media');
    await mkdir(dir, { recursive: true });
    return dir;
  });
  mocks.run.mockImplementation(async (args: string[]) => {
    if (args[0] === 'download')
      await writeFile(args.at(-2)!, args[1] === 'audio' ? 'original-audio-fixture' : 'pdf-fixture');
    return {
      stdout: JSON.stringify({
        task_id: args[1] === 'audio' ? 'audio-id' : 'deck-id',
        status: 'ready',
      }),
    };
  });
  mocks.wait.mockImplementation(async (_id: string, artifact: unknown) => artifact);
  mocks.compress.mockImplementation(async (file: string) => writeFile(file, 'encoded-fixture'));
  mocks.inspect.mockImplementation(async (original: string, encoded: string) => {
    expect(await readFile(original, 'utf8')).toBe('original-audio-fixture');
    expect(await readFile(encoded, 'utf8')).toBe('encoded-fixture');
    return {
      duration: 100,
      size: 100,
      durationDelta: 0,
      fullDecode: 'passed',
      tailDecode: 'passed',
    };
  });
  mocks.publish.mockImplementation(async ({ publicUrl }: { publicUrl: string }) => publicUrl);
});
afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});

async function fixture(cadence: 'weekly' | 'monthly') {
  const name =
    cadence === 'weekly'
      ? 'weekly-ai-radar-2026-09-14-to-2026-09-20.md'
      : 'monthly-ai-radar-2026-09.md';
  raw = `---\ntitle: Fixture\ndate: 2026-09-20\nlang: zh\ncadence: ${cadence}\ndraft: true\n---\nPublic source fixture.`;
  target = path.join(root, name);
  await writeFile(target, raw);
  return ['--file', target, '--job-file', path.join(root, 'job.json')];
}

it.each(['weekly', 'monthly'] as const)(
  'keeps %s originals and technical checks private under --no-publish, reusing server IDs',
  async (cadence) => {
    const args = [...(await fixture(cadence)), '--no-publish'];
    const main = cadence === 'weekly' ? weekly : monthly;
    await main(args);
    await main(args);
    expect(mocks.inspect).toHaveBeenCalledTimes(1);
    expect(mocks.create).toHaveBeenCalledTimes(1);
    expect(mocks.run.mock.calls.filter(([args]) => args[0] === 'generate')).toHaveLength(2); // audio + deck, once each
    expect(mocks.publicCopy).not.toHaveBeenCalled();
    expect(mocks.publish).not.toHaveBeenCalled();
    expect(await readFile(target, 'utf8')).toBe(raw);
    expect(await readFile(path.join(root, 'private-media/raw.m4a'), 'utf8')).toBe(
      'original-audio-fixture',
    );
  },
);

it.each(['weekly', 'monthly'] as const)(
  'blocks %s publishing before service work when held',
  async (cadence) => {
    const args = await fixture(cadence);
    mocks.hold.mockRejectedValue(new Error('on hold'));
    await expect((cadence === 'weekly' ? weekly : monthly)(args)).rejects.toThrow('on hold');
    expect(mocks.create).not.toHaveBeenCalled();
    expect(mocks.publish).not.toHaveBeenCalled();
  },
);

it.each(['weekly', 'monthly'] as const)(
  'blocks %s public copies when integrity fails or text changes',
  async (cadence) => {
    const args = await fixture(cadence);
    mocks.inspect.mockRejectedValueOnce(new Error('Audio duration changed'));
    await expect((cadence === 'weekly' ? weekly : monthly)(args)).rejects.toThrow('duration');
    expect(mocks.publicCopy).not.toHaveBeenCalled();
    expect(mocks.publish).not.toHaveBeenCalled();
  },
);

it('does not overwrite a concurrent editorial edit or publish its old input', async () => {
  const args = await fixture('weekly');
  mocks.inspect.mockImplementationOnce(async () => {
    await writeFile(target, raw + '\nNew editor text');
    return { duration: 100 };
  });
  await expect(weekly(args)).rejects.toThrow('changed during generation');
  expect(await readFile(target, 'utf8')).toContain('New editor text');
  expect(mocks.publicCopy).not.toHaveBeenCalled();
  expect(mocks.publish).not.toHaveBeenCalled();
});

it.each(['audio', 'infographic', 'weekly-assets', 'monthly-assets'])(
  'the legacy %s entry actually executes instead of exit-zero no-op',
  (kind) => {
    const file = path.resolve(`scripts/generate-radar-${kind}.mjs`);
    const result = spawnSync(process.execPath, [file, '--file', path.join(root, 'missing.md')], {
      encoding: 'utf8',
    });
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('ENOENT');
  },
);


it.each(['weekly', 'monthly'] as const)(
  'resumes %s local download/ffmpeg/integrity failures on the same job and exact IDs', async (cadence) => {
    const args = [...(await fixture(cadence)), '--no-publish'];
    const main = cadence === 'weekly' ? weekly : monthly;
    const normal = mocks.run.getMockImplementation()!;
    let failedDownload = false;
    mocks.run.mockImplementation(async (a: string[]) => {
      if (a[0] === 'download' && !failedDownload) {
        failedDownload = true; throw new Error('local download write failed');
      }
      return normal(a);
    });
    mocks.compress.mockRejectedValueOnce(new Error('local ffmpeg failed'));
    mocks.inspect.mockRejectedValueOnce(new Error('integrity failed'));
    await expect(main(args)).rejects.toThrow('local download write failed');
    await expect(main(args)).rejects.toThrow('local ffmpeg failed');
    await expect(main(args)).rejects.toThrow('integrity failed');
    expect(JSON.parse(await readFile(path.join(root, 'job.json'), 'utf8')).steps.assets.phase).toBe('failed');
    expect(mocks.publish).not.toHaveBeenCalled();
    expect(mocks.publicCopy).not.toHaveBeenCalled();
    await main(args);
    expect(mocks.create).toHaveBeenCalledTimes(1);
    expect(mocks.run.mock.calls.filter(([a]) => a[0] === 'generate')).toHaveLength(2);
    for (const [a] of mocks.run.mock.calls.filter(([a]) => a[0] === 'download')) {
      expect(a[a.indexOf('--notebook') + 1]).toBe('fixture-notebook');
      expect(a[a.indexOf('--artifact') + 1]).toBe(a[1] === 'audio' ? 'audio-id' : 'deck-id');
    }
    expect(await readFile(target, 'utf8')).toBe(raw);
    expect(mocks.publish).not.toHaveBeenCalled();
    expect(mocks.publicCopy).not.toHaveBeenCalled();
  },
);
