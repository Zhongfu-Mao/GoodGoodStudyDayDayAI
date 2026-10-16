import { readFileSync } from 'node:fs';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { parseFrontmatter } from '../../scripts/lib/frontmatter.mjs';
import { extractSectionBlock } from '../../scripts/lib/markdown.mjs';

const notebook = vi.hoisted(() => ({
  createNotebook: vi.fn(),
  addSourceFile: vi.fn(),
  runNotebooklm: vi.fn(),
  maybeDeleteNotebook: vi.fn(),
  waitForArtifact: vi.fn(),
  generationArtifact: vi.fn(),
  languageArg: vi.fn((lang: string) => lang),
}));
vi.mock('../../scripts/lib/notebooklm.mjs', () => notebook);

import { buildBriefMemo, main } from '../../scripts/radar/generate-audio.mjs';

function report(language: string) {
  const file = `src/content/radar/daily-ai-radar-2026-10-15${language === 'ja' ? '.ja' : ''}.md`;
  const raw = readFileSync(file, 'utf8');
  return { file, raw, meta: parseFrontmatter(raw) };
}

beforeEach(() => {
  vi.clearAllMocks();
  notebook.createNotebook.mockResolvedValue('test-notebook');
  notebook.addSourceFile.mockResolvedValue({ id: 'exact-fact-source' });
  notebook.runNotebooklm.mockRejectedValue(new Error('stop before remote generation'));
});

describe('daily audio complete fact brief', () => {
  it.each(['zh', 'ja'])('keeps every item and full summary in source order (%s)', (language) => {
    const { meta } = report(language);
    const memo = buildBriefMemo(meta.body, meta);
    const titles = [...meta.body.matchAll(/^###\s+(.+)$/gm)].map((match) => match[1]);
    const summaries = [...meta.body.matchAll(/^- (?:摘要|要約)：(.+)$/gm)].map((match) => match[1]);
    expect(titles).toHaveLength(13);
    expect(summaries).toHaveLength(13);
    expect([...memo.matchAll(/^## /gm)]).toHaveLength(6);
    expect([...memo.matchAll(/^###\s+(.+)$/gm)].map((match) => match[1])).toEqual(titles);
    for (const summary of summaries) expect(memo).toContain(summary);
    expect(memo).not.toContain('radar-visual:');
    expect(memo).not.toContain('/images/radar/');
    expect(memo).not.toContain('https://');
  });

  it('preserves multiline caveats and has no per-section paragraph or item cap', () => {
    const { meta } = report('zh');
    const extraItems = Array.from(
      { length: 5 },
      (_, index) =>
        `### Extra ${index}\n\n- 来源：Example\n- 日期：2026-10-15\n- 链接：https://example.com/${index}\n- 摘要：Fact ${index}: 2.85倍仅限单台A100。\n限定条件不能丢失。`,
    ).join('\n\n');
    const body = meta.body.replace('## 2. 模型前沿', `${extraItems}\n\n## 2. 模型前沿`);
    const memo = buildBriefMemo(body, meta);
    expect([...memo.matchAll(/^### /gm)]).toHaveLength(18);
    for (let index = 0; index < 5; index += 1) {
      expect(memo).toContain(`Fact ${index}: 2.85倍仅限单台A100。\n限定条件不能丢失。`);
    }
    expect(memo).toContain('Every');
  });

  it.each(['zh', 'ja'])(
    'uploads the complete brief by default and selects its exact source (%s)',
    async (language) => {
      const { file, meta } = report(language);
      let uploaded = '';
      notebook.addSourceFile.mockImplementationOnce(async (_id: string, sourcePath: string) => {
        uploaded = await readFile(sourcePath, 'utf8');
        return { id: 'exact-fact-source' };
      });
      await expect(main(['--file', file])).rejects.toThrow('stop before remote generation');
      expect(uploaded).toBe(buildBriefMemo(meta.body, meta));
      const args = notebook.runNotebooklm.mock.calls[0][0];
      expect(args.slice(0, 8)).toEqual([
        'generate',
        'audio',
        '--notebook',
        'test-notebook',
        '--source',
        'exact-fact-source',
        '--format',
        'deep-dive',
      ]);
      expect(args[args.indexOf('--length') + 1]).toBe('default');
    },
  );

  it('retains explicit markdown input for callers that request it', async () => {
    const { file } = report('zh');
    await expect(main(['--file', file, '--source-mode', 'markdown'])).rejects.toThrow(
      'stop before remote generation',
    );
    expect(notebook.addSourceFile).toHaveBeenCalledWith('test-notebook', path.resolve(file));
  });

  it('rejects a missing required section', () => {
    const { meta } = report('zh');
    expect(() => buildBriefMemo(meta.body.split('## 📬 Newsletter')[0], meta)).toThrow(
      'newsletter section',
    );
  });

  it.each(['zh', 'ja'])(
    'rejects an empty fact summary instead of using source metadata (%s)',
    (language) => {
      const { meta } = report(language);
      const body = meta.body.replace(/^(- (?:摘要|要約)：).+/m, '$1');
      expect(() => buildBriefMemo(body, meta)).toThrow('no facts');
    },
  );

  it('validates the default input before creating a remote notebook', async () => {
    const { raw } = report('zh');
    const directory = await mkdtemp(path.join(os.tmpdir(), 'radar-audio-brief-test-'));
    const file = path.join(directory, 'missing-newsletter.md');
    try {
      await writeFile(file, raw.split('## 📬 Newsletter')[0]);
      await expect(main(['--file', file])).rejects.toThrow('newsletter section');
      expect(notebook.createNotebook).not.toHaveBeenCalled();
      expect(notebook.addSourceFile).not.toHaveBeenCalled();
      expect(notebook.runNotebooklm).not.toHaveBeenCalled();
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });
});

describe('Markdown section end boundary', () => {
  it.each(['', '\n'])('extracts the final section at true EOF (%j)', (ending) => {
    expect(
      extractSectionBlock(`## Earlier\n\nfirst\n\n## Newsletter\n\nlast${ending}`, ['Newsletter']),
    ).toBe('last');
  });

  it('does not treat a literal Z as the end of a section', () => {
    expect(extractSectionBlock('## A\n\nZ remains\n\n## B\n\nnext', ['A'])).toBe('Z remains');
  });
});
