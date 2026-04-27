import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import {
  collectionNames,
  collectionLabels,
  type CollectionName,
  type Locale,
  slugifyTag,
  stripLocaleSuffix,
  isJapaneseId,
  articlePath,
  categoryPath,
  locales,
} from './site';

type BlogEntryItem = Awaited<ReturnType<typeof getCollectionEntries>>[number];
type TagIndexItem = { slug: string; label: string; count: number };

export const PUBLIC_TAG_MIN_COUNT = 2;
const tagIndexCache = new Map<Locale, Promise<TagIndexItem[]>>();
const entriesByLocaleCache = new Map<Locale, Promise<BlogEntryItem[]>>();

export type AcademyModuleGroup = {
  series: string;
  modules: Array<{
    name: string;
    order: number;
    items: BlogEntryItem[];
  }>;
};

export type AcademyCatalogGroup = {
  series: string;
  order: number;
  groupKind: 'track' | 'module';
  itemCount: number;
  groups: Array<{
    name: string;
    order: number;
    items: BlogEntryItem[];
  }>;
};

const openAiAcademyTracks = [
  {
    name: { zh: '学习路线总览', ja: '学習ルート全体' },
    order: 0,
    pathParts: ['/openai-academy/00-overview/'],
  },
  {
    name: { zh: 'AI Fundamentals', ja: 'AI Fundamentals' },
    order: 1,
    pathParts: ['/openai-academy/01-ai-fundamentals/'],
  },
  {
    name: { zh: 'Using ChatGPT', ja: 'Using ChatGPT' },
    order: 2,
    pathParts: ['/openai-academy/02-using-chatgpt/'],
  },
  {
    name: { zh: 'ChatGPT for Work', ja: 'ChatGPT for Work' },
    order: 3,
    pathParts: ['/openai-academy/03-chatgpt-for-work/', '/openai-academy/05-chatgpt-for-work/'],
  },
  {
    name: { zh: 'ChatGPT for Education', ja: 'ChatGPT for Education' },
    order: 4,
    pathParts: ['/openai-academy/04-chatgpt-for-education/', '/openai-academy/06-chatgpt-for-education/'],
  },
  {
    name: { zh: 'Codex', ja: 'Codex' },
    order: 5,
    pathParts: ['/openai-academy/03-codex/', '/openai-academy/05-codex/', '/openai-academy/06-codex-for-work/'],
  },
  {
    name: { zh: 'Building with AI', ja: 'Building with AI' },
    order: 6,
    pathParts: ['/openai-academy/04-building-with-ai/', '/openai-academy/07-building-with-ai/'],
  },
] as const;

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
  const cached = entriesByLocaleCache.get(locale);

  if (cached) {
    return cached;
  }

  const entries = buildEntriesForLocale(locale);
  entriesByLocaleCache.set(locale, entries);
  return entries;
}

async function buildEntriesForLocale(locale: Locale) {
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

export async function getAllTagIndex(locale: Locale) {
  const cached = tagIndexCache.get(locale);

  if (cached) {
    return cached;
  }

  const tagIndex = buildAllTagIndex(locale);
  tagIndexCache.set(locale, tagIndex);
  return tagIndex;
}

async function buildAllTagIndex(locale: Locale) {
  const entries = await getEntriesForLocale(locale);
  const tags = new Map<string, TagIndexItem>();

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

export async function getTagIndex(locale: Locale) {
  return (await getAllTagIndex(locale)).filter((tag) => tag.count >= PUBLIC_TAG_MIN_COUNT);
}

export async function getPublicTagsForEntry(locale: Locale, tags: string[]) {
  const publicTagSlugs = new Set((await getTagIndex(locale)).map((tag) => tag.slug));
  return tags.filter((tag) => publicTagSlugs.has(slugifyTag(tag)));
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

export async function getLanguagePathsForEntry(
  collection: CollectionName,
  entry: CollectionEntry<CollectionName>,
  currentLocale: Locale,
): Promise<Partial<Record<Locale, string>>> {
  const currentSlug = stripLocaleSuffix(entry.id, currentLocale);
  const paths: Partial<Record<Locale, string>> = {
    [currentLocale]: articlePath(collection, currentSlug, currentLocale),
  };

  for (const target of locales) {
    if (target === currentLocale) continue;

    const targetEntries = await getEntriesForLocale(target);
    const match = targetEntries.find(
      (item) => item.collection === collection && item.slug === currentSlug,
    );

    paths[target] = match
      ? articlePath(collection, match.slug, target)
      : categoryPath(collection, target);
  }

  return paths;
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

export async function getAcademyCatalogGroups(locale: Locale): Promise<AcademyCatalogGroup[]> {
  const entries = (await getEntriesForLocale(locale))
    .filter((item) => item.entry.data.category === 'academy' && item.entry.data.academy)
    .sort(compareAcademyEntries);

  const seriesMap = new Map<string, AcademyCatalogGroup>();

  for (const item of entries) {
    const academy = item.entry.data.academy;

    if (!academy) continue;

    const isOpenAiAcademy = academy.series === 'OpenAI Academy';
    const catalogGroup = resolveAcademyCatalogGroup(item.entry);
    const seriesGroup = seriesMap.get(academy.series) ?? {
      series: academy.series,
      order: isOpenAiAcademy ? 0 : 10,
      groupKind: isOpenAiAcademy ? 'track' : 'module',
      itemCount: 0,
      groups: [],
    };
    const existingGroup = seriesGroup.groups.find((group) => group.name === catalogGroup.name);

    if (existingGroup) {
      existingGroup.items.push(item);
      existingGroup.items.sort(compareAcademyEntries);
    } else {
      seriesGroup.groups.push({
        name: catalogGroup.name,
        order: catalogGroup.order,
        items: [item],
      });
    }

    seriesGroup.itemCount += 1;
    seriesGroup.groups.sort(
      (a, b) => a.order - b.order || a.name.localeCompare(b.name, locale === 'ja' ? 'ja' : 'zh-Hans'),
    );
    seriesMap.set(academy.series, seriesGroup);
  }

  return [...seriesMap.values()].sort(
    (a, b) =>
      a.order - b.order ||
      a.series.localeCompare(b.series, locale === 'ja' ? 'ja' : 'zh-Hans'),
  );
}

export function getAcademyCatalogGroupName(entry: CollectionEntry<CollectionName>) {
  if (!entry.data.academy) {
    return undefined;
  }

  return resolveAcademyCatalogGroup(entry).name;
}

export function getAcademyCatalogAnchor(entry: CollectionEntry<CollectionName>) {
  const academy = entry.data.academy;

  if (!academy) {
    return '';
  }

  return `${slugifyTag(academy.series)}-${slugifyTag(resolveAcademyCatalogGroup(entry).name)}`;
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

function resolveAcademyCatalogGroup(entry: CollectionEntry<CollectionName>) {
  const academy = entry.data.academy;
  const moduleOrder = academy?.moduleOrder ?? Number.MAX_SAFE_INTEGER;

  if (academy?.series !== 'OpenAI Academy') {
    return {
      name: academy?.module ?? entry.data.title,
      order: moduleOrder,
    };
  }

  const normalizedId = `/${entry.id.replace(/\\/g, '/')}/`;
  const locale = entry.data.lang as Locale;
  const track = openAiAcademyTracks.find((candidate) =>
    candidate.pathParts.some((pathPart) => normalizedId.includes(pathPart)),
  );

  return {
    name: track?.name[locale] ?? academy.module,
    order: track?.order ?? moduleOrder,
  };
}
