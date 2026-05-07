import type { CollectionEntry } from 'astro:content';
import {
  articlePath,
  collectionLabels,
  resolveSiteUrl,
  type CollectionName,
  type Locale,
} from './site';

const SITE_NAME = 'Good Good Study, Day Day AI';

type BlogPostingJsonLdOptions = {
  entry: CollectionEntry<CollectionName>;
  slug: string;
  locale: Locale;
  site: URL | undefined;
};

export function buildBlogPostingJsonLd({ entry, slug, locale, site }: BlogPostingJsonLdOptions) {
  if (!site) {
    return undefined;
  }

  const url = new URL(articlePath(entry.data.category, slug, locale), site).toString();
  const logoUrl = toAssetUrl('/favicon.svg', site);
  const description = entry.data.description ?? entry.data.plainSummary;
  const image = entry.data.coverImage ? [toAssetUrl(entry.data.coverImage, site)] : undefined;
  const date = entry.data.date.toISOString();
  const modifiedDate = (entry.data.updatedDate ?? entry.data.date).toISOString();

  return omitUndefined({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: entry.data.title,
    description,
    inLanguage: locale === 'ja' ? 'ja-JP' : 'zh-CN',
    datePublished: date,
    dateModified: modifiedDate,
    url,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    author: {
      '@type': 'Organization',
      name: SITE_NAME,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: logoUrl,
      },
    },
    image,
    articleSection: collectionLabels[entry.data.category][locale],
    keywords: entry.data.tags,
  });
}

function toAssetUrl(path: string, site: URL) {
  return new URL(resolveSiteUrl(path), site).toString();
}

function omitUndefined<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined));
}
