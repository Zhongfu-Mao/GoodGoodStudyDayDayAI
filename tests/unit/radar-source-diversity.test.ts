import { describe, expect, it } from 'vitest';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';

import {
  evaluateRadarSourceDiversity,
  extractSourceGroups,
} from '../../scripts/check/radar-source-diversity.mjs';

const sourcePool = {
  publicationGate: {
    minimumEntries: 12,
    minimumSourceFamilies: 5,
    minimumCoreEntries: 4,
    minimumActiveCoreEntries: 4,
    minimumNewsletterEntries: 2,
    maxSingleFamilyShare: 0.35,
    maxOfficialTriadShare: 0.35,
    maxTrendShare: 0.35,
  },
  activeCoreSources: [
    { name: 'Every', aliases: ['every.to'], access: { primary: { url: 'https://every.to/' } } },
    {
      name: 'Daily Dose of Data Science',
      aliases: ['Daily Dose'],
      access: { primary: { url: 'https://blog.dailydoseofds.com/' } },
    },
    {
      name: 'The Rundown AI',
      aliases: ['The Rundown'],
      access: { primary: { url: 'https://www.therundown.ai/' } },
    },
  ],
  officialConfirmationSources: [
    { name: 'OpenAI', aliases: ['OpenAI'], access: { primary: { url: 'https://openai.com/' } } },
    { name: 'Anthropic', aliases: ['Claude'], access: { primary: { url: 'https://anthropic.com/' } } },
    {
      name: 'Google / Gemini / DeepMind',
      aliases: ['Google', 'Gemini', 'DeepMind'],
      access: { primary: { url: 'https://blog.google/' } },
    },
  ],
  trendSources: [
    {
      name: 'GitHub Trending',
      aliases: ['GitHub Trending'],
      access: { primary: { url: 'https://github.com/trending' } },
    },
  ],
  canonicalConfirmationSources: [],
  excludedActiveSources: [],
};

function sourceLine(label: string) {
  return `### item from ${label}\n\n- 来源：${label}\n- 日期：2026-06-01\n- 链接：https://example.com/${encodeURIComponent(label)}\n- 摘要：测试条目。\n`;
}

describe('radar source diversity gate', () => {

  it('reports both concentration ratios without rejecting an otherwise valid edition', () => {
    const warnings: string[] = [];
    const groups = [
      ...Array.from({ length: 4 }, () => ({ name: 'OpenAI', kind: 'official-triad' })),
      ...Array.from({ length: 5 }, (_, i) => ({ name: `Independent ${i}`, kind: 'core' })),
    ];
    const failures = evaluateRadarSourceDiversity({
      file: 'daily-ai-radar-2026-10-27.md', body: '', groups, warnings,
      sourcePool: { ...sourcePool, publicationGate: {
        ...sourcePool.publicationGate, minimumEntries: 0, minimumNewsletterEntries: 0,
      } },
    });
    expect(failures).toEqual([]);
    expect(warnings).toHaveLength(2);
    expect(warnings[0]).toContain('OpenAI 4/9 (44.4%)');
    expect(warnings[1]).toContain('official-triad sources combined 4/9 (44.4%)');
    for (const warning of warnings) {
      expect(warning).toContain('35.0%');
      expect(warning).toContain('overlooked important candidates');
      expect(warning).toContain('vendor effectiveness claims');
    }
  });

  it('keeps the trend limit and source-family minimum blocking alongside reminders', () => {
    const warnings: string[] = [];
    const failures = evaluateRadarSourceDiversity({
      file: 'daily-ai-radar-2026-06-01.md', body: '', warnings,
      groups: Array.from({ length: 12 }, () => ({ name: 'GitHub Trending', kind: 'trend' })),
      sourcePool,
    });
    expect(failures).toContain('daily-ai-radar-2026-06-01.md: trend source share 100.0% exceeds 35.0%');
    expect(failures).toContain('daily-ai-radar-2026-06-01.md: has 1 source groups, expected at least 5');
    expect(warnings).toHaveLength(1);
  });

  it('does not warn when both ratios are at or below their thresholds', () => {
    const warnings: string[] = [];
    evaluateRadarSourceDiversity({
      file: 'daily-ai-radar-2026-06-01.md', body: '', sourcePool, warnings,
      groups: Array.from({ length: 20 }, (_, i) => ({
        name: i < 7 ? 'OpenAI' : `Independent ${i}`, kind: i < 7 ? 'official-triad' : 'core',
      })),
    });
    expect(warnings).toEqual([]);
  });

  it('prints non-blocking reminders for a bilingual edition using original publishers', () => {
    const root = mkdtempSync(path.join(os.tmpdir(), 'radar-source-reminders-'));
    try {
      mkdirSync(path.join(root, 'src/content/radar'), { recursive: true });
      mkdirSync(path.join(root, 'scripts/radar'), { recursive: true });
      writeFileSync(path.join(root, 'scripts/radar/source-pool.json'), JSON.stringify({
        ...sourcePool,
        dailyV2Gate: {
          minimumEntries: 0, minimumCoreEntries: 0,
          minimumActiveCoreEntries: 0, minimumNewsletterEntries: 0,
        },
      }));
      for (const lang of ['zh', 'ja']) {
        const items = Array.from({ length: 9 }, (_, index) => {
          const host = index < 4 ? 'openai.com' : `independent-${index}.example`;
          const sourceKey = lang === 'ja' ? '出典' : '来源';
          const linkKey = lang === 'ja' ? 'リンク' : '链接';
          // Discovery labels deliberately differ from the original publishers.
          return `### Story ${index}\n<a id="radar-story-${index}"></a>\n- ${sourceKey}：Every\n- ${linkKey}：https://${host}/story-${index}\n`;
        }).join('\n');
        writeFileSync(path.join(root, 'src/content/radar',
          `daily-ai-radar-2026-10-27${lang === 'ja' ? '.ja' : ''}.md`),
        `---\nradarFormat: 2\nlang: ${lang}\n---\n## ${lang === 'ja' ? '構築と運用' : '构建与运行'}\n${items}`);
      }
      const result = spawnSync(process.execPath, [
        path.resolve('scripts/check/radar-source-diversity.mjs'),
        '--from', '2026-10-27', '--to', '2026-10-27',
      ], { cwd: root, encoding: 'utf8' });
      expect(result.status).toBe(0);
      expect(result.stdout).toContain('Checked radar source diversity in 2 daily radar files.');
      expect(result.stderr.match(/EDITORIAL REMINDER \(non-blocking\)/g)).toHaveLength(4);
      expect(result.stderr).toContain('OpenAI 4/9 (44.4%)');
      expect(result.stderr).toContain('official-triad sources combined 4/9 (44.4%)');
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('classifies V2 original publishers rather than the first mixed source label', () => {
    const pool = JSON.parse(readFileSync('scripts/radar/source-pool.json', 'utf8'));
    const item = (label: string, link: string, id: number) => `### Story ${id}\n<a id="radar-item-${id}"></a>\n- 来源：${label}\n- 来源渠道：博客\n- 证据性质：作者研究\n- 原始日期：2026-10-20\n- 链接：${link}\n- 摘要：Public evidence.\n`;
    const body = '---\nradarFormat: 2\nlang: zh\n---\n## 构建与运行\n' + [
      item('ByteByteGo / Daily Dose of Data Science', 'https://blog.bytebytego.com/p/rag', 1),
      item('Daily Dose of Data Science', 'https://blog.dailydoseofds.com/p/cuda', 2),
      item('Hugging Face / IBM Research', 'https://huggingface.co/blog/ibm-research/granite', 3),
      item('Hugging Face / Ai2', 'https://huggingface.co/blog/allenai/litpivot', 4),
      item('Hugging Face / AWS Neuron', 'https://huggingface.co/blog/torch-neuronx-model-support', 5),
      item('GitHub / Microsoft', 'https://github.com/microsoft/one', 6),
      item('GitHub / Ai2', 'https://github.com/allenai/two', 7),
      item('X / First author', 'https://x.com/first/status/1', 8),
    ].join('\n');
    expect(extractSourceGroups(body, pool).map(g => g.name)).toEqual([
      'ByteByteGo', 'Daily Dose of Data Science', 'HF project team: ibm-research',
      'HF project team: allenai', 'Hugging Face (publisher unresolved)',
      'GitHub owner: microsoft', 'GitHub owner: allenai', 'X author: first',
    ]);
  });
  it('does not infer prohibited proactive discovery from a cited vendor label', () => {
    const config = { ...sourcePool, excludedActiveSources: [{ name: 'NVIDIA' }] };
    const check = (label: string) => evaluateRadarSourceDiversity({
      file: 'daily-ai-radar-2026-09-27.md', body: sourceLine(label), sourcePool: config,
    }).filter((failure: string) => failure.includes('excluded from active'));
    expect(check('GitHub Trending / NVIDIA Model Optimizer')).toEqual([]);
    expect(check('NVIDIA')).toEqual([]);
  });

  it('keeps pilot discovery sources separate from required active core sources', () => {
    const groups = extractSourceGroups(sourceLine('Simon Willison'), {
      ...sourcePool,
      supplementalDiscoverySources: [{ name: 'Simon Willison', aliases: ['simonwillison.net'] }],
    });
    expect(groups[0]).toMatchObject({ name: 'Simon Willison', kind: 'supplemental' });
    expect(groups.filter((group) => group.kind === 'core')).toHaveLength(0);
  });

  it('classifies explicit GitHub Trending labels as trend even when the owner matches an official source', () => {
    const body = sourceLine('GitHub Trending / Anthropic');

    expect(extractSourceGroups(body, sourcePool)).toEqual([
      expect.objectContaining({
        name: 'GitHub Trending',
        kind: 'trend',
        label: 'GitHub Trending / Anthropic',
      }),
    ]);
  });

  it('does not let official and trend sources substitute for active core discovery sources', () => {
    const body = [
      '## 1. AI Engineering & 架构',
      ...Array.from({ length: 4 }, () => sourceLine('OpenAI')),
      ...Array.from({ length: 3 }, () => sourceLine('Google / Gemini / DeepMind')),
      ...Array.from({ length: 4 }, () => sourceLine('GitHub Trending / repo')),
      sourceLine('Every'),
      '## 📬 Newsletter 精选',
      sourceLine('Daily Dose of Data Science'),
      sourceLine('Every'),
    ].join('\n');

    const failures = evaluateRadarSourceDiversity({
      file: 'daily-ai-radar-2026-06-01.md',
      body,
      sourcePool,
    });

    expect(failures).toContain(
      'daily-ai-radar-2026-06-01.md: has 3 active-core source entries, expected at least 4',
    );
    expect(failures.some((message: string) => message.includes('official-triad source share'))).toBe(false);
  });

  it('allows explicit audited historical exceptions for active-core backfill only', () => {
    const body = [
      '## 1. AI Engineering & 架构',
      ...Array.from({ length: 8 }, (_, index) =>
        sourceLine(index < 2 ? 'Every' : `Independent Source ${index}`),
      ),
      ...Array.from({ length: 2 }, () => sourceLine('GitHub Trending / repo')),
      '## 📬 Newsletter 精选',
      sourceLine('Daily Dose of Data Science'),
      sourceLine('Independent Newsletter'),
    ].join('\n');

    const failures = evaluateRadarSourceDiversity({
      file: 'daily-ai-radar-2026-05-17.md',
      body,
      sourcePool: {
        ...sourcePool,
        historicalExceptions: [
          {
            date: '2026-05-17',
            locales: ['zh'],
            skipChecks: ['minimumActiveCoreEntries'],
          },
        ],
      },
    });

    expect(failures).not.toContain(
      'daily-ai-radar-2026-05-17.md: has 3 active-core source entries, expected at least 4',
    );
  });
});
