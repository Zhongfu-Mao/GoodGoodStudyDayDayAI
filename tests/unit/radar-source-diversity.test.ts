import { describe, expect, it } from 'vitest';

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
    expect(failures).toContain(
      'daily-ai-radar-2026-06-01.md: official-triad source share 50.0% exceeds 35.0%',
    );
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
