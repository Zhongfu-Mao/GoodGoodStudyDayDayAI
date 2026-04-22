export const locales = ['zh', 'ja'] as const;
export type Locale = (typeof locales)[number];

export const collectionNames = ['radar', 'academy', 'engineering', 'foundations'] as const;
export type CollectionName = (typeof collectionNames)[number];

export const collectionLabels: Record<CollectionName, { zh: string; ja: string }> = {
  radar: { zh: 'AI 雷达', ja: 'AI Radar' },
  academy: { zh: 'AI Academy', ja: 'AI Academy' },
  engineering: { zh: '工程实践', ja: 'エンジニアリング実践' },
  foundations: { zh: '底层原理', ja: '基礎原理' },
};

export const radarCadences = ['daily', 'weekly', 'monthly'] as const;
export type RadarCadence = (typeof radarCadences)[number];

export const cadenceLabels: Record<RadarCadence, { zh: string; ja: string }> = {
  daily: { zh: 'Daily', ja: 'Daily' },
  weekly: { zh: 'Weekly', ja: 'Weekly' },
  monthly: { zh: 'Monthly', ja: 'Monthly' },
};

export function localePrefix(locale: Locale) {
  return locale === 'ja' ? '/ja' : '';
}

export function homePath(locale: Locale) {
  return `${localePrefix(locale)}/`;
}

export function tagIndexPath(locale: Locale) {
  return `${localePrefix(locale)}/tags/`;
}

export function tagPath(tag: string, locale: Locale) {
  return `${localePrefix(locale)}/tags/${slugifyTag(tag)}/`;
}

export function articlePath(category: CollectionName, slug: string, locale: Locale) {
  return `${localePrefix(locale)}/${category}/${slug}/`;
}

export function categoryPath(category: CollectionName, locale: Locale) {
  return `${localePrefix(locale)}/${category}/`;
}

export function slugifyTag(tag: string) {
  return tag
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function stripLocaleSuffix(id: string) {
  return id.replace(/\.ja$/, '');
}

export function isJapaneseId(id: string) {
  return id.endsWith('.ja');
}
