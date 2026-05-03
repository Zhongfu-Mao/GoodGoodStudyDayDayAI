export const locales = ['zh', 'ja'] as const;
export type Locale = (typeof locales)[number];

export const collectionNames = ['radar', 'academy', 'engineering', 'foundations'] as const;
export type CollectionName = (typeof collectionNames)[number];

export const collectionLabels: Record<CollectionName, { zh: string; ja: string }> = {
  radar: { zh: 'AI 雷达', ja: 'AI レーダー' },
  academy: { zh: 'AI Academy', ja: 'AI Academy' },
  engineering: { zh: '工程实践', ja: '実践' },
  foundations: { zh: '底层原理', ja: '基礎' },
};

export const radarCadences = ['daily', 'weekly', 'monthly'] as const;
export type RadarCadence = (typeof radarCadences)[number];

export const cadenceLabels: Record<RadarCadence, { zh: string; ja: string }> = {
  daily: { zh: 'Daily', ja: '日次' },
  weekly: { zh: 'Weekly', ja: '週次' },
  monthly: { zh: 'Monthly', ja: '月次' },
};

const rawBase = import.meta.env.BASE_URL || '/';
const normalizedBase = rawBase === '/' ? '/' : `/${rawBase.replace(/^\/+|\/+$/g, '')}/`;

export function withBase(path: string) {
  const normalizedPath = normalizeAbsolutePath(path);

  if (normalizedBase === '/') {
    return normalizedPath;
  }

  const basePrefix = normalizedBase.slice(0, -1);
  return normalizedPath === '/' ? normalizedBase : `${basePrefix}${normalizedPath}`;
}

export function withoutBase(path: string) {
  const normalizedPath = normalizeAbsolutePath(path);

  if (normalizedBase === '/') {
    return normalizedPath;
  }

  const basePrefix = normalizedBase.slice(0, -1);

  if (normalizedPath === basePrefix || normalizedPath === normalizedBase) {
    return '/';
  }

  if (normalizedPath.startsWith(`${basePrefix}/`)) {
    return normalizedPath.slice(basePrefix.length) || '/';
  }

  return normalizedPath;
}

export function resolveSiteUrl(path: string) {
  if (!path) {
    return path;
  }

  if (path.startsWith('/')) {
    return withBase(path);
  }

  return path;
}

export function localePrefix(locale: Locale) {
  return locale === 'ja' ? '/ja' : '';
}

export function homePath(locale: Locale) {
  return withBase(`${localePrefix(locale)}/`);
}

export function tagIndexPath(locale: Locale) {
  return withBase(`${localePrefix(locale)}/tags/`);
}

export function searchPath(locale: Locale) {
  return withBase(`${localePrefix(locale)}/search/`);
}

export function startPath(locale: Locale) {
  return withBase(`${localePrefix(locale)}/start/`);
}

export type StartSubPageKey = 'layers' | 'safety' | 'plan' | 'faq';

export function startSubPath(locale: Locale, key: StartSubPageKey) {
  return withBase(`${localePrefix(locale)}/start/${key}/`);
}

export function radarGalleryPath(locale: Locale) {
  return withBase(`${localePrefix(locale)}/radar/gallery/`);
}

export function tagPath(tag: string, locale: Locale) {
  return withBase(`${localePrefix(locale)}/tags/${slugifyTag(tag)}/`);
}

export function articlePath(category: CollectionName, slug: string, locale: Locale) {
  return withBase(withTrailingSlash([localePrefix(locale), category, slug]));
}

export function categoryPath(category: CollectionName, locale: Locale) {
  return withBase(withTrailingSlash([localePrefix(locale), category]));
}

export function slugifyTag(tag: string) {
  return tag
    .trim()
    .toLowerCase()
    .normalize('NFKC')
    .replace(/[\s/_]+/gu, '-')
    .replace(/[^\p{Letter}\p{Number}-]+/gu, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function stripLocaleSuffix(id: string, locale?: Locale) {
  if (locale !== 'ja') {
    return id;
  }

  return id.endsWith('.ja') ? id.slice(0, -3) : id;
}

export function isJapaneseId(id: string) {
  return id.endsWith('.ja');
}

function withTrailingSlash(parts: string[]) {
  const normalized = parts
    .filter(Boolean)
    .map((part) => part.replace(/^\/+|\/+$/g, ''))
    .filter(Boolean);

  return `/${normalized.join('/')}/`;
}

function normalizeAbsolutePath(path: string) {
  return path.startsWith('/') ? path : `/${path}`;
}
