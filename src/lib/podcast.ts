import rss from '@astrojs/rss';
import { stat } from 'node:fs/promises';
import path from 'node:path';
import { getEntriesForLocale } from './content';
import { articlePath, homePath, resolveSiteUrl, type Locale } from './site';

const PODCAST_ENTRY_LIMIT = 100;
const EPISODE_DETAIL_CHAR_LIMIT = 7000;

const showMeta: Record<
  Locale,
  {
    title: string;
    description: string;
    author: string;
    email: string;
    language: string;
    category: string;
    artwork: string;
  }
> = {
  zh: {
    title: 'AI 雷达',
    description:
      '每日、每周、每月追踪 AI 工程、模型、Agent 与产业信号，把 Good Good Study, Day Day AI 的 AI 雷达变成可以订阅收听的音频简报。',
    author: '清风明月',
    email: 'maozhongfu0827@gmail.com',
    language: 'zh-cn',
    category: 'Technology',
    artwork: '/images/podcast-cover.jpg',
  },
  ja: {
    title: 'AI レーダー',
    description:
      'Good Good Study, Day Day AI の日次・週次・月次 AI レーダーを、モデル、Agent、AI エンジニアリング、産業シグナルまで追える音声ブリーフィングとして届けます。',
    author: '清風明月',
    email: 'maozhongfu0827@gmail.com',
    language: 'ja-jp',
    category: 'Technology',
    artwork: '/images/podcast-cover.jpg',
  },
};

export async function buildPodcastFeed({
  site,
  locale,
}: {
  site: URL | undefined;
  locale: Locale;
}) {
  if (!site) {
    throw new Error('Astro.site is required to build the podcast feed.');
  }

  const show = showMeta[locale];
  const entries = (await getEntriesForLocale(locale))
    .filter(({ entry }) => entry.data.category === 'radar' && entry.data.audioUrl)
    .slice(0, PODCAST_ENTRY_LIMIT);
  const artworkUrl = new URL(resolveSiteUrl(show.artwork), site).toString();
  const feedSite = new URL(homePath(locale), site);
  const feedLink = feedSite.toString();
  const items = await Promise.all(
    entries.map(async ({ entry, slug }) => {
      const audioUrl = resolveAbsoluteUrl(entry.data.audioUrl ?? '', site);
      const coverUrl = entry.data.coverImage
        ? resolveAbsoluteUrl(entry.data.coverImage, site)
        : artworkUrl;
      const audioLength =
        entry.data.audioSize ?? (await getLocalPublicAssetSize(entry.data.audioUrl));
      const duration = entry.data.audioDuration;
      const articleUrl = new URL(articlePath(entry.data.category, slug, locale), site).toString();
      const episodeDescription = buildEpisodeDescription({
        summary: entry.data.plainSummary ?? entry.data.description ?? entry.data.title,
        body: entry.body,
        articleUrl,
        locale,
      });

      return {
        title: entry.data.title,
        description: episodeDescription,
        pubDate: entry.data.date,
        link: articlePath(entry.data.category, slug, locale),
        enclosure: {
          url: audioUrl,
          length: audioLength,
          type: 'audio/mpeg',
        },
        customData: [
          duration ? `<itunes:duration>${duration}</itunes:duration>` : '',
          `<itunes:summary>${escapeXmlText(episodeDescription)}</itunes:summary>`,
          `<itunes:explicit>${entry.data.audioExplicit ? 'true' : 'false'}</itunes:explicit>`,
          `<itunes:episodeType>full</itunes:episodeType>`,
          `<itunes:image href="${escapeXmlAttribute(coverUrl)}" />`,
        ]
          .filter(Boolean)
          .join(''),
      };
    }),
  );

  return rss({
    xmlns: {
      itunes: 'http://www.itunes.com/dtds/podcast-1.0.dtd',
    },
    title: show.title,
    description: show.description,
    site: feedSite,
    items,
    customData: [
      `<language>${show.language}</language>`,
      `<itunes:author>${escapeXmlText(show.author)}</itunes:author>`,
      `<itunes:owner><itunes:name>${escapeXmlText(show.author)}</itunes:name><itunes:email>${escapeXmlText(show.email)}</itunes:email></itunes:owner>`,
      `<itunes:category text="${escapeXmlAttribute(show.category)}" />`,
      `<itunes:explicit>false</itunes:explicit>`,
      `<itunes:type>episodic</itunes:type>`,
      `<itunes:image href="${escapeXmlAttribute(artworkUrl)}" />`,
      `<image><url>${escapeXmlText(artworkUrl)}</url><title>${escapeXmlText(show.title)}</title><link>${escapeXmlText(feedLink)}</link></image>`,
    ].join(''),
  });
}

function resolveAbsoluteUrl(url: string, site: URL) {
  return url.startsWith('http') ? url : new URL(resolveSiteUrl(url), site).toString();
}

async function getLocalPublicAssetSize(url: string | undefined) {
  if (!url?.startsWith('/')) {
    return 0;
  }

  const pathname = url.split(/[?#]/, 1)[0];
  const filePath = path.join(process.cwd(), 'public', pathname.replace(/^\/+/, ''));

  try {
    const file = await stat(filePath);
    return file.size;
  } catch {
    return 0;
  }
}

function buildEpisodeDescription({
  summary,
  body,
  articleUrl,
  locale,
}: {
  summary: string;
  body: string | undefined;
  articleUrl: string;
  locale: Locale;
}) {
  const bodyText = body ? markdownToPodcastText(body) : '';
  const readMore = locale === 'ja' ? '全文を読む' : '阅读全文';
  const parts = [
    summary.trim(),
    bodyText ? truncateAtParagraphBoundary(bodyText, EPISODE_DETAIL_CHAR_LIMIT) : '',
    `${readMore}: ${articleUrl}`,
  ].filter(Boolean);

  return parts.join('\n\n');
}

function markdownToPodcastText(markdown: string) {
  return markdown
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/```[\s\S]*?```/g, (match) => match.replace(/```[^\n]*\n?|```/g, ''))
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    .replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g, '$1 ($2)')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^>\s?/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '- ')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/gm, '')
    .replace(/<\/?[^>]+>/g, '')
    .replace(/[*_~`]/g, '')
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function truncateAtParagraphBoundary(text: string, limit: number) {
  if (text.length <= limit) {
    return text;
  }

  const boundary = text.lastIndexOf('\n\n', limit);
  const cutPoint = boundary > limit * 0.6 ? boundary : limit;
  return `${text.slice(0, cutPoint).trimEnd()}...`;
}

function escapeXmlText(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeXmlAttribute(value: string) {
  return escapeXmlText(value).replace(/"/g, '&quot;');
}
