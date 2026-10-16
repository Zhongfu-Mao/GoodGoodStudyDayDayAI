import { readFileSync } from 'node:fs';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { parseFrontmatter } from '../../scripts/lib/frontmatter.mjs';
import {
  buildInfographicBrief,
  createVisualCopyTemplate,
} from '../../scripts/lib/radar-infographic-brief.mjs';

const mocks = vi.hoisted(() => ({
  createNotebook: vi.fn(),
  addSourceFile: vi.fn(),
  runNotebooklm: vi.fn(),
  maybeDeleteNotebook: vi.fn(),
  waitForArtifact: vi.fn(),
  generationArtifact: vi.fn(),
  languageArg: vi.fn((language: string) => language),
  publishRadarAsset: vi.fn(),
  optimizeWebpImage: vi.fn(),
}));
vi.mock('../../scripts/lib/notebooklm.mjs', () => mocks);
vi.mock('../../scripts/lib/radar-assets.mjs', () => ({
  publishRadarAsset: mocks.publishRadarAsset,
  assetUrlMatchesPublicAsset: () => true,
}));
vi.mock('../../scripts/lib/image-compression.mjs', () => ({
  optimizeWebpImage: mocks.optimizeWebpImage,
  formatImageCompressionResult: () => 'test image',
}));
import { main } from '../../scripts/radar/generate-infographic.mjs';

let directory: string;
let sourceFile: string;
let cache: string;
let raw: string;

beforeEach(async () => {
  vi.clearAllMocks();
  directory = await mkdtemp(path.join(os.tmpdir(), 'radar-infographic-preview-'));
  const slug = path.basename(directory);
  sourceFile = path.join(directory, `${slug}.md`);
  cache = path.resolve('.cache/radar-infographic', slug);
  raw = readFileSync('src/content/radar/daily-ai-radar-2026-10-15.md', 'utf8');
  await writeFile(sourceFile, raw);
  mocks.createNotebook.mockResolvedValue('preview-notebook');
  mocks.addSourceFile.mockResolvedValue({ id: 'preview-source' });
  mocks.generationArtifact.mockReturnValue({ id: 'preview-artifact' });
  mocks.waitForArtifact.mockResolvedValue({ id: 'preview-artifact' });
  mocks.runNotebooklm.mockImplementation(async (args: string[]) => {
    if (args[0] === 'download') await writeFile(args.at(-2) as string, 'preview image bytes');
    return { stdout: '{"task_id":"preview-artifact"}' };
  });
});

afterEach(async () => {
  await rm(directory, { recursive: true, force: true });
  await rm(cache, { recursive: true, force: true });
});

async function copyFile() {
  const meta = parseFrontmatter(raw);
  const copy = createVisualCopyTemplate(buildInfographicBrief(meta, meta.body));
  for (const section of copy.sections)
    for (const item of section.items) {
      item.label = item.sourceTitle.split('：')[0];
      item.text = '仅限来源所述条件';
      item.visual = '用独立小图呈现该条机制';
    }
  const file = path.join(directory, 'visual-copy.json');
  await writeFile(file, JSON.stringify(copy));
  return file;
}

describe('infographic isolated preview', () => {
  it('writes an editorial template without remote calls when brief-only has no copy plan', async () => {
    await main(['--file', sourceFile, '--brief-only']);
    const template = JSON.parse(
      await readFile(path.join(cache, 'visual-copy.template.json'), 'utf8'),
    );
    expect(
      template.sections.flatMap((section: { items: unknown[] }) => section.items),
    ).toHaveLength(13);
    expect(mocks.createNotebook).not.toHaveBeenCalled();
    await expect(readFile(path.join(cache, 'notebooklm-prompt.txt'))).rejects.toThrow();
  });

  it('refuses generation without a copy plan before creating a notebook', async () => {
    await expect(main(['--file', sourceFile, '--preview-dir', directory])).rejects.toThrow(
      'Failed to generate',
    );
    expect(mocks.createNotebook).not.toHaveBeenCalled();
    expect(mocks.publishRadarAsset).not.toHaveBeenCalled();
  });

  it('generates to a separate path without publishing or updating report frontmatter', async () => {
    const copy = await copyFile();
    await main(['--file', sourceFile, '--visual-copy', copy, '--preview-dir', directory]);
    expect(await readFile(sourceFile, 'utf8')).toBe(raw);
    expect(mocks.publishRadarAsset).not.toHaveBeenCalled();
    expect(mocks.addSourceFile).toHaveBeenCalledWith('preview-notebook', sourceFile);
    const generation = mocks.runNotebooklm.mock.calls.find(([args]) => args[0] === 'generate')?.[0];
    expect(generation).toContain('preview-source');
    expect(generation).toContain('--prompt-file');
    expect(generation[generation.indexOf('--style') + 1]).toBe('bento-grid');
    expect(generation[generation.indexOf('--detail') + 1]).toBe('standard');
    expect(generation[generation.indexOf('--orientation') + 1]).toBe('landscape');
    const download = mocks.runNotebooklm.mock.calls.find(([args]) => args[0] === 'download')?.[0];
    const output = download.at(-2);
    expect(path.dirname(output)).toBe(directory);
    expect(await readFile(output, 'utf8')).toBe('preview image bytes');
    const prompt = await readFile(path.join(cache, 'notebooklm-prompt.txt'), 'utf8');
    expect(prompt).toContain('<FACTS_JSON>');
    expect(prompt).toContain('<DISPLAY_COPY>');
    expect(prompt).toContain('<ILLUSTRATION_PLAN>');
    expect(prompt).toContain('不添加导语、一句话总结或副标题');
  });

  it('rejects protected source or public paths as preview output directories', async () => {
    const copy = await copyFile();
    for (const output of ['public/images/radar', 'src/content/radar']) {
      await expect(
        main(['--file', sourceFile, '--visual-copy', copy, '--preview-dir', output]),
      ).rejects.toThrow('Failed to generate');
    }
    expect(mocks.createNotebook).not.toHaveBeenCalled();
    expect(await readFile(sourceFile, 'utf8')).toBe(raw);
  });

  it('retains the normal publication path when preview mode is not requested', async () => {
    const copy = await copyFile();
    const slug = path.basename(sourceFile, '.md');
    const publicUrl = `/images/radar/${slug}-infographic.webp`;
    // Exercise publication routing without creating any real public test image.
    mocks.runNotebooklm.mockResolvedValue({ stdout: '{"task_id":"preview-artifact"}' });
    mocks.publishRadarAsset.mockResolvedValue(publicUrl);
    await main(['--file', sourceFile, '--visual-copy', copy, '--overwrite']);
    expect(mocks.publishRadarAsset).toHaveBeenCalledWith({
      localPath: path.resolve(`public/images/radar/${slug}-infographic.webp`),
      publicUrl,
      label: 'radar infographic',
    });
    expect(parseFrontmatter(await readFile(sourceFile, 'utf8')).coverImage).toBe(publicUrl);
  });
});
