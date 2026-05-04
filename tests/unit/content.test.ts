import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Locale } from '../../src/lib/site';

type MockEntry = {
  id: string;
  collection?: string;
  data: {
    title: string;
    date: Date;
    category: string;
    lang: Locale;
    draft: boolean;
    tags: string[];
    description?: string;
    plainSummary?: string;
    coverImage?: string;
    academy?: {
      series: string;
      module: string;
      moduleOrder?: number;
      prerequisites?: string[];
    };
  };
};
type MockEntryOverride = Omit<Partial<MockEntry['data']>, 'date'> & { date?: Date | string };

let collections: Record<string, MockEntry[]> = {};

vi.mock('astro:content', () => ({
  getCollection: vi.fn(async (collection: string) => collections[collection] ?? []),
  getEntry: vi.fn(async (collection: string, id: string) =>
    (collections[collection] ?? []).find((entry) => entry.id === id),
  ),
}));

describe('content helpers', () => {
  beforeEach(() => {
    collections = {};
    vi.resetModules();
  });

  it('loads locale entries across collections while filtering drafts and sorting newest first', async () => {
    collections = {
      radar: [
        mockEntry('weekly-old.ja', 'radar', { lang: 'ja', date: '2026-04-01' }),
        mockEntry('weekly-draft.ja', 'radar', { lang: 'ja', date: '2026-04-03', draft: true }),
        mockEntry('weekly-zh', 'radar', { lang: 'zh', date: '2026-04-04' }),
      ],
      start: [
        mockEntry('basics/newer.ja', 'start', { lang: 'ja', date: '2026-04-05' }),
      ],
    };

    const { getEntriesForLocale } = await import('../../src/lib/content');
    const entries = await getEntriesForLocale('ja');

    expect(entries.map((item) => item.entry.id)).toEqual(['basics/newer.ja', 'weekly-old.ja']);
    expect(entries.map((item) => item.slug)).toEqual(['basics/newer', 'weekly-old']);
  });

  it('keeps public tag pages constrained to repeated tags', async () => {
    collections = {
      radar: [
        mockEntry('daily-1', 'radar', { tags: ['Agent', 'Solo'] }),
        mockEntry('daily-2', 'radar', { tags: ['Agent'] }),
      ],
      engineering: [
        mockEntry('engineering-1', 'engineering', { tags: ['CI/CD'] }),
      ],
    };

    const { getAllTagIndex, getPublicTagsForEntry, getTagIndex } = await import('../../src/lib/content');

    expect((await getAllTagIndex('zh')).map((tag) => [tag.slug, tag.count])).toEqual([
      ['agent', 2],
      ['ci-cd', 1],
      ['solo', 1],
    ]);
    expect(await getTagIndex('zh')).toEqual([{ slug: 'agent', label: 'Agent', count: 2 }]);
    expect(await getPublicTagsForEntry('zh', ['Agent', 'Solo'])).toEqual(['Agent']);
  });

  it('links localized siblings when present and falls back to the category page when absent', async () => {
    const zhEntry = mockEntry('shared-slug', 'radar', { lang: 'zh' });
    const zhOnlyEntry = mockEntry('zh-only', 'radar', { lang: 'zh' });

    collections = {
      radar: [
        zhEntry,
        zhOnlyEntry,
        mockEntry('shared-slug.ja', 'radar', { lang: 'ja' }),
      ],
    };

    const { getLanguagePathsForEntry } = await import('../../src/lib/content');

    await expect(getLanguagePathsForEntry('radar', zhEntry as never, 'zh')).resolves.toEqual({
      zh: '/radar/shared-slug/',
      ja: '/ja/radar/shared-slug/',
    });
    await expect(getLanguagePathsForEntry('radar', zhOnlyEntry as never, 'zh')).resolves.toEqual({
      zh: '/radar/zh-only/',
      ja: '/ja/radar/',
    });
  });

  it('uses OpenAI Academy tracks and other academy module names for catalog grouping', async () => {
    collections = {
      academy: [
        mockEntry('openai-academy/02-using-chatgpt/prompting', 'academy', {
          academy: { series: 'OpenAI Academy', module: 'Legacy module', moduleOrder: 12 },
        }),
        mockEntry('anthropic-academy/01-claude-basics/overview', 'academy', {
          academy: { series: 'Anthropic Academy', module: 'Claude Basics', moduleOrder: 1 },
        }),
      ],
    };

    const { getAcademyCatalogGroups } = await import('../../src/lib/content');
    const groups = await getAcademyCatalogGroups('zh');

    expect(groups.map((group) => [group.series, group.groupKind, group.itemCount])).toEqual([
      ['OpenAI Academy', 'track', 1],
      ['Anthropic Academy', 'module', 1],
    ]);
    expect(groups[0].groups[0].name).toBe('Using ChatGPT');
    expect(groups[1].groups[0].name).toBe('Claude Basics');
  });
});

function mockEntry(
  id: string,
  collection: string,
  overrides: MockEntryOverride = {},
): MockEntry {
  return {
    id,
    collection,
    data: {
      title: `Title ${id}`,
      date: new Date(overrides.date ?? '2026-04-02'),
      category: collection,
      lang: overrides.lang ?? 'zh',
      draft: overrides.draft ?? false,
      tags: overrides.tags ?? [],
      description: overrides.description,
      plainSummary: overrides.plainSummary,
      coverImage: overrides.coverImage,
      academy: overrides.academy,
    },
  };
}
