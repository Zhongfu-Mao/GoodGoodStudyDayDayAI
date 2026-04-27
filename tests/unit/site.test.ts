import { describe, expect, it } from 'vitest';
import { isJapaneseId, slugifyTag, stripLocaleSuffix } from '../../src/lib/site';

describe('site helpers', () => {
  it('only treats dotted .ja ids as Japanese entries', () => {
    expect(isJapaneseId('daily-ai-radar-2026-04-26.ja')).toBe(true);
    expect(isJapaneseId('ninja')).toBe(false);
    expect(isJapaneseId('claude-101-ja-recap')).toBe(false);
  });

  it('only strips the dotted Japanese locale suffix', () => {
    expect(stripLocaleSuffix('daily-ai-radar-2026-04-26.ja', 'ja')).toBe('daily-ai-radar-2026-04-26');
    expect(stripLocaleSuffix('ninja', 'ja')).toBe('ninja');
    expect(stripLocaleSuffix('daily-ai-radar-2026-04-26.ja', 'zh')).toBe('daily-ai-radar-2026-04-26.ja');
  });

  it('slugifies public tags consistently', () => {
    expect(slugifyTag(' AI / Agents 101 ')).toBe('ai-agents-101');
    expect(slugifyTag('生成 AI：基礎')).toBe('生成-ai基礎');
  });
});
