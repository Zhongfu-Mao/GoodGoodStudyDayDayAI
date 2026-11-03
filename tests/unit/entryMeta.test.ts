import { describe, expect, it } from 'vitest';
import { estimateReadingMinutes, getPlainSummary, getPostCardTitleMeta } from '../../src/lib/entryMeta';

describe('entry metadata helpers', () => {
  it('keeps an explicit edition summary ahead of descriptions and generated leads', () => {
    const summary = getPlainSummary({
      id: 'radar/example',
      data: {
        title: 'Example', category: 'radar', radarFormat: 2, tags: [], lang: 'zh',
        plainSummary: '整期摘要同时涵盖能力、费用与权限边界。',
        description: 'A shorter listing description.',
      },
      body: '## 本期重点\n\n- [只覆盖首个故事的重点。](#radar-first)\n\n## 构建与运行\n\n正文。',
    } as any, 'zh');
    expect(summary).toBe('整期摘要同时涵盖能力、费用与权限边界。');
  });
  it('uses a short edition highlight section before body or illustration text', () => {
    const summary = getPlainSummary({
      id: 'radar/example',
      data: { title: 'Example', category: 'radar', radarFormat: 2, date: new Date('2026-10-26'), tags: [], lang: 'zh' },
      body: 'Intro that should not become the card summary.\n\n## 本期重点\n\n- [裁掉中段会改变截图的连续性。](#radar-cut)\n- [延伸：权限仍需单独执行。](#radar-permission)\n\n## 构建与运行\n\nBody text and figure captions.',
    } as any, 'zh');
    expect(summary).toBe('裁掉中段会改变截图的连续性。 延伸：权限仍需单独执行。');
  });
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
