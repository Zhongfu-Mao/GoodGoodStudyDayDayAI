import { beforeEach, describe, expect, it, vi } from 'vitest';
import { buildPodcastFeed } from '../../src/lib/podcast';
import { getEntriesForLocale } from '../../src/lib/content';

vi.mock('../../src/lib/content', () => ({ getEntriesForLocale: vi.fn() }));

function episode(notice?: string) {
  return {
    slug: 'daily-ai-radar-2026-10-22',
    entry: {
      id: 'daily-ai-radar-2026-10-22',
      data: {
        title: 'Radar',
        category: 'radar',
        date: new Date('2026-10-22T00:00:00Z'),
        plainSummary: 'Source-backed article summary.',
        audioUrl: 'https://example.com/audio/radar/episode.mp3',
        audioDuration: 120,
        audioSize: 12345,
        audioNotice: notice,
      },
    },
  };
}

describe('podcast audio disclosure', () => {
  beforeEach(() => vi.clearAllMocks());
  it.each([
    ['zh', '本期音频尚未完成完整语义复核，以有来源的正文为准。'],
    ['ja', '音声の意味の確認は未完了です。出典付きの本文をご確認ください。'],
  ] as const)(
    'keeps the %s notice in both episode descriptions and podcast summaries',
    async (locale, notice) => {
      vi.mocked(getEntriesForLocale).mockResolvedValue([episode(notice)] as never);
      const response = await buildPodcastFeed({ site: new URL('https://example.com'), locale });
      const xml = await response.text();
      expect(xml.split(notice).length - 1).toBe(2);
      expect(xml).toContain('Source-backed article summary.');
      expect(xml).toContain('radar:daily-ai-radar-2026-10-22');
      expect(xml).toContain('length="12345"');
    },
  );
  it('does not invent a disclosure for an episode without one', async () => {
    vi.mocked(getEntriesForLocale).mockResolvedValue([episode()] as never);
    const response = await buildPodcastFeed({ site: new URL('https://example.com'), locale: 'zh' });
    const xml = await response.text();
    expect(xml).not.toContain('undefined');
    expect(xml).not.toContain('语义复核');
  });
});
