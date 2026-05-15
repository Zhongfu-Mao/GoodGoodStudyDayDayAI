import { describe, expect, it } from 'vitest';
import { estimateReadingMinutes, getPlainSummary, getPostCardTitleMeta } from '../../src/lib/entryMeta';

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

  it('shortens repeated learning-note prefixes for card views', () => {
    expect(getPostCardTitleMeta('OpenAI Academy ノート：AI の基礎', 'academy')).toEqual({
      badge: 'OpenAI Academy',
      title: 'AI の基礎',
    });
    expect(getPostCardTitleMeta('OpenAI Academy 学習ノート：ChatGPT のパーソナライズ', 'academy'))
      .toEqual({
        badge: 'OpenAI Academy',
        title: 'ChatGPT のパーソナライズ',
      });
    expect(getPostCardTitleMeta('AI Developer Core：Transformer 与 Attention', 'foundations')).toEqual({
      badge: 'AI Developer Core',
      title: 'Transformer 与 Attention',
    });
    expect(getPostCardTitleMeta('没有前缀的标题', 'engineering')).toEqual({
      badge: undefined,
      title: '没有前缀的标题',
    });
  });
});
