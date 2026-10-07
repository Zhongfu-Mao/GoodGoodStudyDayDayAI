import { describe, expect, it } from 'vitest';
import { inspectRadarEditorial } from '../../scripts/lib/radar-editorial-policy.mjs';

const policy = {
  enforceFrom: '2026-10-07',
  trendDefaultMaximum: 2,
  trendMaximum: 3,
  trendLeadMaximum: 4,
  minimumModelAndToolEntriesWhenTrendExpanded: 2,
  exceptions: [],
};
const taxonomy = {
  daily: {
    zh: ['Engineering', 'Models', 'Tools', 'Industry', 'Trend', 'Newsletter'],
    ja: ['設計', 'モデル', '道具', '業界', '流行', '便り'],
  },
};
const file = 'src/content/radar/daily-ai-radar-2026-10-07.md';
const article = (counts = [2, 2, 2, 2, 2, 2], lang: 'zh' | 'ja' = 'zh') =>
  `---\ntitle: Test\ndraft: false\n---\n${taxonomy.daily[lang].map((heading, i) => `## ${heading}\n${Array.from({ length: counts[i] }, (_, n) => `### Item ${n}\nTechnical evidence\n`).join('')}`).join('\n')}`;

describe('radar editorial checks', () => {
  it('accepts balanced bilingual issues and legitimate technical terminology', () => {
    expect(
      inspectRadarEditorial(file, `${article()}\n使用 curl 验证数据去重算法。`, policy, taxonomy),
    ).toEqual([]);
    expect(
      inspectRadarEditorial(
        file.replace('.md', '.ja.md'),
        article(undefined, 'ja'),
        policy,
        taxonomy,
      ),
    ).toEqual([]);
  });
  it('detects private data even in frontmatter and does not allow a privacy exception', () => {
    const leak = article().replace(
      'title: Test',
      'title: https://mail.google.com/mail/u/0/#inbox/123',
    );
    const exceptions = [
      {
        file,
        rule: 'private-mail-link',
        reason: 'This reason must never waive private information.',
      },
    ];
    expect(inspectRadarEditorial(file, leak, { ...policy, exceptions }, taxonomy)[0]).toContain(
      'private-mail-link',
    );
  });
  it('requires review for skewed allocation and an explicit reason for an allowed exception', () => {
    const skew = article([2, 1, 1, 2, 3, 2]);
    expect(inspectRadarEditorial(file, skew, policy, taxonomy)[0]).toContain('section-balance');
    const exceptions = [
      {
        file,
        rule: 'section-balance',
        reason: 'Reviewed evidence supports three separate trend stories today.',
      },
    ];
    expect(inspectRadarEditorial(file, skew, { ...policy, exceptions }, taxonomy)).toEqual([]);
    expect(
      inspectRadarEditorial(
        file,
        article([2, 2, 2, 2, 5, 2]),
        { ...policy, exceptions },
        taxonomy,
      )[0],
    ).toContain('trend-hard-limit');
  });
  it('does not impose a new gate on historical content or drafts', () => {
    expect(
      inspectRadarEditorial(
        file.replace('10-07', '10-06'),
        `${article()}\n本期采用`,
        policy,
        taxonomy,
      ),
    ).toEqual([]);
    expect(
      inspectRadarEditorial(
        file,
        article().replace('draft: false', 'draft: true'),
        policy,
        taxonomy,
      ),
    ).toEqual([]);
  });
});
