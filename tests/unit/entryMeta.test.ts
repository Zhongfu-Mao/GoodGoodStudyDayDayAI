import { describe, expect, it } from 'vitest';
import { estimateReadingMinutes, getPlainSummary } from '../../src/lib/entryMeta';

describe('entry metadata helpers', () => {
  it('preserves underscores in generated summaries', () => {
    const summary = getPlainSummary(
      {
        id: 'academy/example',
        body: 'This paragraph keeps snake_case identifiers readable when markdown syntax is stripped for summaries.',
        data: {
          title: 'Example',
          category: 'academy',
          date: new Date('2026-04-27'),
          tags: [],
          lang: 'zh',
        },
      } as any,
      'zh',
    );

    expect(summary).toContain('snake_case');
  });

  it('always returns at least one reading minute', () => {
    expect(estimateReadingMinutes('', 'zh')).toBe(1);
    expect(estimateReadingMinutes('短文', 'ja')).toBe(1);
  });
});
