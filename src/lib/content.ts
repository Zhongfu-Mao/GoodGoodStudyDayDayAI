import { getCollection, getEntry } from 'astro:content';
import {
  collectionNames,
  collectionLabels,
  type CollectionName,
  type Locale,
  slugifyTag,
  stripLocaleSuffix,
  isJapaneseId,
} from './site';

type BlogEntryItem = Awaited<ReturnType<typeof getCollectionEntries>>[number];

export type AcademyModuleGroup = {
  series: string;
  modules: Array<{
    name: string;
    order: number;
    items: BlogEntryItem[];
  }>;
};

async function getCollectionEntries(collection: CollectionName) {
  const entries = await getCollection(collection);
  return entries.map((entry) => ({
    collection,
    entry,
    slug: stripLocaleSuffix(entry.id, entry.data.lang as Locale),
    locale: entry.data.lang as Locale,
  }));
}

export async function getEntriesForLocale(locale: Locale) {
  const entries = await Promise.all(collectionNames.map((collection) => getCollectionEntries(collection)));
  return entries
    .flat()
    .filter((item) => item.locale === locale && !item.entry.data.draft)
    .sort((a, b) => b.entry.data.date.getTime() - a.entry.data.date.getTime());
}

export async function getEntriesForTag(locale: Locale, tagSlug: string) {
  const entries = await getEntriesForLocale(locale);
  return entries.filter((item) => item.entry.data.tags.some((tag: string) => slugifyTag(tag) === tagSlug));
}

export async function getTagIndex(locale: Locale) {
  const entries = await getEntriesForLocale(locale);
  const tags = new Map<string, { slug: string; label: string; count: number }>();

  for (const { entry } of entries) {
    for (const tag of entry.data.tags) {
      const slug = slugifyTag(tag);
      const existing = tags.get(slug);

      if (existing) {
        existing.count += 1;
      } else {
        tags.set(slug, { slug, label: tag, count: 1 });
      }
    }
  }

  return [...tags.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'zh-Hans'));
}

export async function getTagStaticPaths(locale: Locale) {
  return (await getTagIndex(locale)).map((tag) => ({
    params: { tag: tag.slug },
    props: { tagLabel: tag.label, tagCount: tag.count },
  }));
}

export async function getPostStaticPaths(locale: Locale) {
  const entries = await getEntriesForLocale(locale);
  return entries.map(({ collection, entry, slug }) => ({
    params: {
      category: entry.data.category,
      slug,
    },
    props: {
      collection,
      entryId: entry.id,
    },
  }));
}

export async function getEntryForRoute(collection: CollectionName, entryId: string) {
  return getEntry(collection, entryId);
}

export function getCategoryLabel(category: CollectionName, locale: Locale) {
  return collectionLabels[category][locale];
}

export function isEntryJapanese(entryId: string) {
  return isJapaneseId(entryId);
}

export async function getAcademySeriesGroups(locale: Locale): Promise<AcademyModuleGroup[]> {
  const entries = (await getEntriesForLocale(locale))
    .filter((item) => item.entry.data.category === 'academy' && item.entry.data.academy)
    .sort(compareAcademyEntries);

  const seriesMap = new Map<string, Map<string, AcademyModuleGroup['modules'][number]>>();

  for (const item of entries) {
    const academy = item.entry.data.academy;

    if (!academy) continue;

    const moduleOrder = academy.moduleOrder ?? Number.MAX_SAFE_INTEGER;
    const moduleName = academy.module;
    const seriesName = academy.series;
    const seriesModules = seriesMap.get(seriesName) ?? new Map<string, AcademyModuleGroup['modules'][number]>();
    const existingModule = seriesModules.get(moduleName);

    if (existingModule) {
      existingModule.items.push(item);
      existingModule.items.sort(compareAcademyEntries);
    } else {
      seriesModules.set(moduleName, {
        name: moduleName,
        order: moduleOrder,
        items: [item],
      });
    }

    seriesMap.set(seriesName, seriesModules);
  }

  return [...seriesMap.entries()]
    .map(([series, modules]) => ({
      series,
      modules: [...modules.values()].sort(
        (a, b) => a.order - b.order || a.name.localeCompare(b.name, locale === 'ja' ? 'ja' : 'zh-Hans'),
      ),
    }))
    .sort((a, b) => a.series.localeCompare(b.series, locale === 'ja' ? 'ja' : 'zh-Hans'));
}

function compareAcademyEntries(a: BlogEntryItem, b: BlogEntryItem) {
  const aOrder = a.entry.data.academy?.moduleOrder ?? Number.MAX_SAFE_INTEGER;
  const bOrder = b.entry.data.academy?.moduleOrder ?? Number.MAX_SAFE_INTEGER;

  return (
    aOrder - bOrder ||
    a.slug.localeCompare(b.slug, 'en') ||
    b.entry.data.date.getTime() - a.entry.data.date.getTime()
  );
}
