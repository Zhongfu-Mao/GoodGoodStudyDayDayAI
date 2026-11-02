import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import sharp from 'sharp';
import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import { buildInfographicBrief, createVisualCopyTemplate } from '../../scripts/lib/radar-infographic-brief.mjs';
import { parseFrontmatter } from '../../scripts/lib/frontmatter.mjs';

const mocks = vi.hoisted(() => ({
  create: vi.fn(), source: vi.fn(), run: vi.fn(), wait: vi.fn(), directory: vi.fn(),
  compress: vi.fn(), inspect: vi.fn(), optimize: vi.fn(), writeFailure: vi.fn(),
}));
vi.mock('node:fs/promises', async original => {
  const actual = await original<typeof import('node:fs/promises')>();
  return { ...actual, writeFile: async (...args: Parameters<typeof actual.writeFile>) => {
    mocks.writeFailure(String(args[0]));
    return actual.writeFile(...args);
  } };
});
vi.mock('../../scripts/lib/notebooklm.mjs', async (original) => ({
  ...(await original<object>()), createNotebook: mocks.create, addSourceFile: mocks.source,
  runNotebooklm: mocks.run, waitForArtifact: mocks.wait,
}));
vi.mock('../../scripts/lib/radar-review.mjs', async (original) => ({
  ...(await original<object>()), newCandidateDirectory: mocks.directory, inspectAudio: mocks.inspect,
  audioCache: vi.fn(async () => ({ transcriptAvailable: false })),
}));
vi.mock('../../scripts/lib/audio-compression.mjs', () => ({ compressSpeechMp3: mocks.compress }));
vi.mock('../../scripts/lib/image-compression.mjs', () => ({
  optimizeWebpImage: mocks.optimize, formatImageCompressionResult: () => 'mock image processing',
}));
import { main as audio } from '../../scripts/radar/generate-audio.mjs';
import { main as infographic } from '../../scripts/radar/generate-infographic.mjs';
let root: string, file: string, job: string, copy: string, image: Buffer;
let normalRun: (args: string[]) => Promise<{ stdout: string }>;
beforeEach(async () => {
  vi.resetAllMocks();
  root = await mkdtemp(path.join(os.tmpdir(), 'radar-local-retry-'));
  file = path.join(root, `${path.basename(root)}.md`);
  job = path.join(root, 'job.json');
  const raw = await readFile('src/content/radar/daily-ai-radar-2026-10-15.md', 'utf8');
  await writeFile(file, raw);
  const meta = parseFrontmatter(raw);
  const plan = createVisualCopyTemplate(buildInfographicBrief(meta, meta.body));
  for (const section of plan.sections) for (const item of section.items) {
    item.label = item.sourceTitle.split('：')[0]; item.text = '仅限来源所述条件'; item.visual = '机制示意';
  }
  copy = path.join(root, 'copy.json'); await writeFile(copy, JSON.stringify(plan));
  image = await sharp({ create: { width: 300, height: 200, channels: 3, background: '#fff' } }).png().toBuffer();
  mocks.create.mockResolvedValue('known-notebook'); mocks.source.mockResolvedValue({ id: 'known-source' });
  mocks.wait.mockImplementation(async (_n, artifact) => artifact);
  mocks.directory.mockImplementation(async () => {
    const directory = path.join(root, 'candidate'); await mkdir(directory, { recursive: true }); return directory;
  });
  mocks.compress.mockImplementation(async p => writeFile(p, 'encoded audio fixture'));
  mocks.inspect.mockResolvedValue({ duration: 100, size: 100, durationDelta: 0, fullDecode: 'passed', tailDecode: 'passed' });
  normalRun = async args => {
    if (args[0] === 'download') await writeFile(args.at(-2)!, args[1] === 'audio' ? 'original audio fixture' : image);
    return { stdout: JSON.stringify({ task_id: 'known-artifact', status: 'ready' }) };
  };
  mocks.run.mockImplementation(normalRun);
});
afterEach(async () => {
  await rm(root, { recursive: true, force: true });
  await rm(path.resolve('.cache/radar-infographic', path.basename(root)), { recursive: true, force: true });
});
const invoke = (kind: string) => (kind === 'audio' ? audio : infographic)([
  '--file', file, '--job-file', job, ...(kind === 'infographic' ? ['--visual-copy', copy] : []),
]);
const state = async () => JSON.parse(await readFile(job, 'utf8'));
function exactIdsOnly() {
  expect(mocks.create).toHaveBeenCalledTimes(1);
  expect(mocks.source).toHaveBeenCalledTimes(1);
  expect(mocks.run.mock.calls.filter(([a]) => a[0] === 'generate')).toHaveLength(1);
  for (const [a] of mocks.run.mock.calls.filter(([a]) => a[0] === 'download')) {
    expect(a[a.indexOf('--notebook') + 1]).toBe('known-notebook');
    expect(a[a.indexOf('--artifact') + 1]).toBe('known-artifact');
  }
}
it.each(['audio', 'infographic'])('retries %s download and local conversion without regenerating', async kind => {
  let failed = false;
  mocks.run.mockImplementation(async a => {
    if (a[0] === 'download' && !failed) { failed = true; throw new Error('download local write failed'); }
    return normalRun(a);
  });
  (kind === 'audio' ? mocks.compress : mocks.optimize).mockRejectedValueOnce(new Error('local conversion failed'));
  await expect(invoke(kind)).rejects.toThrow(kind === 'infographic' ? 'Failed to generate' : 'download local write failed');
  await expect(invoke(kind)).rejects.toThrow(kind === 'infographic' ? 'Failed to generate' : 'local conversion failed');
  expect((await state()).steps.candidate.phase).toBe('failed');
  expect((await state()).steps.candidate.error).toBe('local conversion failed');
  await invoke(kind);
  expect((await state()).steps.candidate.phase).toBe('completed');
  exactIdsOnly();
});
it('keeps audio integrity failure blocking and retries only original-asset processing', async () => {
  mocks.inspect.mockRejectedValue(new Error('integrity failed'));
  await expect(invoke('audio')).rejects.toThrow('integrity failed');
  await expect(invoke('audio')).rejects.toThrow('integrity failed');
  expect((await state()).steps.candidate.phase).toBe('failed');
  await expect(readFile(path.join(root, 'candidate/candidate.json'))).rejects.toThrow('ENOENT');
  exactIdsOnly();
});
it.each(['audio', 'infographic'])('recovers %s directory creation failure before any remote calls', async kind => {
  mocks.directory.mockRejectedValueOnce(new Error('mkdir failed'));
  await expect(invoke(kind)).rejects.toThrow(kind === 'infographic' ? 'Failed to generate' : 'mkdir failed');
  expect(mocks.create).not.toHaveBeenCalled();
  await invoke(kind); exactIdsOnly();
});
it.each(['audio', 'infographic'])('recovers a written %s candidate without replacing its review or raw bytes', async kind => {
  await invoke(kind);
  const saved = await state(); const packet = saved.steps.candidate.result;
  const candidate = JSON.parse(await readFile(packet.candidateFile, 'utf8'));
  const rawPath = path.join(path.dirname(packet.candidateFile), candidate.files.raw.path);
  const rawBytes = await readFile(rawPath);
  const review = await readFile(packet.reviewFile, 'utf8') + '\n';
  await writeFile(packet.reviewFile, review);
  // Simulate a receipt interruption after candidate/review were fully written.
  saved.steps.candidate = { phase: 'uncertain', error: 'old interrupted local receipt' };
  await writeFile(job, JSON.stringify(saved));
  await invoke(kind);
  expect(await readFile(packet.reviewFile, 'utf8')).toBe(review);
  expect(await readFile(rawPath)).toEqual(rawBytes);
  expect(mocks.run.mock.calls.filter(([a]) => a[0] === 'download')).toHaveLength(1);
  exactIdsOnly();
});
it.each(['audio', 'infographic'])('keeps unknown %s remote generation blocked on the original job', async kind => {
  mocks.run.mockImplementation(async a => {
    if (a[0] === 'generate') throw new Error('response lost');
    return normalRun(a);
  });
  await expect(invoke(kind)).rejects.toThrow(kind === 'infographic' ? 'Failed to generate' : 'response lost');
  await expect(invoke(kind)).rejects.toThrow(kind === 'infographic' ? 'Failed to generate' : 'outcome uncertain');
  expect((await state()).steps[`generate:${kind}`].error).toBe('response lost');
  expect(mocks.create).toHaveBeenCalledTimes(1);
  expect(mocks.run.mock.calls.filter(([a]) => a[0] === 'generate')).toHaveLength(1);
  expect(mocks.run.mock.calls.filter(([a]) => a[0] === 'download')).toHaveLength(0);
});


it.each(['review.json', 'expected.json', 'regions.json'])(
  'finishes interrupted local %s without replacing candidate bytes or prior review', async name => {
    let failed = false;
    mocks.writeFailure.mockImplementation(file => {
      if (file.endsWith('/' + name) && !failed) { failed = true; throw new Error('packet write interrupted'); }
    });
    await expect(invoke('infographic')).rejects.toThrow('Failed to generate');
    const candidatePath = path.join(root, 'candidate/candidate.json');
    const candidateBytes = await readFile(candidatePath);
    const reviewPath = path.join(root, 'candidate/review.json');
    let reviewBytes: string | null = null;
    if (name !== 'review.json') {
      reviewBytes = await readFile(reviewPath, 'utf8') + '\n'; await writeFile(reviewPath, reviewBytes);
    }
    await invoke('infographic');
    expect(await readFile(candidatePath)).toEqual(candidateBytes);
    if (reviewBytes) expect(await readFile(reviewPath, 'utf8')).toBe(reviewBytes);
    else {
      const review = JSON.parse(await readFile(reviewPath, 'utf8'));
      expect(review.reviewer).toBe(''); expect(review.facts.status).toBe('pending');
    }
    expect((await state()).steps.candidate.phase).toBe('completed');
    const regions = JSON.parse(await readFile(path.join(root, 'candidate/regions.json'), 'utf8'));
    for (const crop of regions.crops) expect((await readFile(path.join(root, 'candidate', crop))).length).toBeGreaterThan(0);
    expect(mocks.run.mock.calls.filter(([a]) => a[0] === 'download')).toHaveLength(1);
    exactIdsOnly();
  },
);
it.each(['audio', 'infographic'])('preserves a damaged %s candidate for inspection instead of overwriting it', async kind => {
  await invoke(kind);
  const saved = await state(); const packet = saved.steps.candidate.result;
  const candidate = JSON.parse(await readFile(packet.candidateFile, 'utf8'));
  const assetPath = path.join(path.dirname(packet.candidateFile), candidate.files.asset.path);
  await writeFile(assetPath, 'edited bytes');
  saved.steps.candidate = { phase: 'failed', error: 'receipt interrupted' };
  await writeFile(job, JSON.stringify(saved));
  await expect(invoke(kind)).rejects.toThrow(kind === 'audio' ? 'Candidate bytes changed' : 'Failed to generate');
  expect(await readFile(assetPath, 'utf8')).toBe('edited bytes');
  expect(mocks.run.mock.calls.filter(([a]) => a[0] === 'download')).toHaveLength(1);
  exactIdsOnly();
});
