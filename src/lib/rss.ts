import rss from '@astrojs/rss';
import { getEntriesForLocale, getPublicTagsForEntry } from './content';
import { articlePath, type Locale } from './site';

const siteTitles: Record<Locale, string> = {
  zh: 'Good Good Study, Day Day AI',
  ja: 'Good Good Study, Day Day AI',
};

const siteDescriptions: Record<Locale, string> = {
  zh: '以 Markdown 为核心，持续整理双语文章、AI 雷达与课程笔记。',
  ja: 'Markdown をベースに、二言語の記事、AI Radar、講座ノートを継続的に整理します。',
};

const RSS_ENTRY_LIMIT = 50;

export async function buildFeed({ site, locale }: { site: URL | undefined; locale: Locale }) {
  if (!site) {
    throw new Error('Astro.site is required to build the RSS feed.');
  }

  const entries = await getEntriesForLocale(locale);
  const items = await Promise.all(
    entries.slice(0, RSS_ENTRY_LIMIT).map(async ({ entry, slug }) => ({
      title: entry.data.title,
      description: entry.data.description,
      pubDate: entry.data.date,
      link: articlePath(entry.data.category, slug, locale),
      categories: await getPublicTagsForEntry(locale, entry.data.tags),
    })),
  );

  return rss({
    title: siteTitles[locale],
    description: siteDescriptions[locale],
    site,
    items,
    customData: `<language>${locale === 'ja' ? 'ja-jp' : 'zh-cn'}</language>`,
  });
}
