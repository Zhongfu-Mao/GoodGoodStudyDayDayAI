import { XMLParser, XMLValidator } from 'fast-xml-parser';

export function parseRadarFeed(body) {
  const valid = XMLValidator.validate(body);
  if (valid !== true) throw new Error(`Invalid feed XML: ${valid.err.msg}`);
  const doc = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    trimValues: true,
  }).parse(body);
  if (!doc?.rss?.channel && !doc?.feed)
    throw new Error('Expected RSS channel or Atom feed, not a webpage');
  const root = doc.rss?.channel ?? doc.feed;
  const raw = root.item ?? root.entry ?? [];
  const text = (value) => (typeof value === 'string' ? value : (value?.['#text'] ?? ''));
  const array = (value) => (value == null ? [] : Array.isArray(value) ? value : [value]);
  return {
    feedTitle: text(root.title),
    items: array(raw).map((item) => {
      const links = array(item.link);
      const link =
        typeof item.link === 'string'
          ? item.link
          : (links.find((l) => !l['@_rel'] || l['@_rel'] === 'alternate')?.['@_href'] ?? '');
      const enclosure = item.enclosure ?? links.find((l) => l?.['@_rel'] === 'enclosure');
      return {
        title: text(item.title),
        link,
        published: item.pubDate || item.published || item.updated || '',
        summary:
          text(item.description) ||
          text(item.summary) ||
          text(item['content:encoded']) ||
          text(item.content),
        author: text(item.author) || item.author?.name || item['dc:creator'] || '',
        guid: text(item.guid) || text(item.id),
        ...(enclosure
          ? {
              enclosure: {
                url: enclosure['@_url'] ?? enclosure['@_href'],
                type: enclosure['@_type'],
                length: enclosure['@_length'],
              },
            }
          : {}),
        transcripts: array(item['podcast:transcript']).map((t) => ({
          url: t['@_url'],
          type: t['@_type'],
        })),
      };
    }),
  };
}

export function validateRadarFeed(result, { podcast = false } = {}) {
  if (!result?.ok || result.mode !== 'rss' || !result.feed?.items?.length)
    throw new Error('No valid nonempty parsed feed');
  const valid = result.feed.items.filter((item) => {
    try {
      const url = new URL(item.link);
      if (
        !item.title?.trim() ||
        url.protocol !== 'https:' ||
        Number.isNaN(Date.parse(item.published))
      )
        return false;
      if (podcast)
        return (
          /^audio\//.test(item.enclosure?.type ?? '') &&
          new URL(item.enclosure.url).protocol === 'https:'
        );
      return true;
    } catch {
      return false;
    }
  });
  if (!valid.length)
    throw new Error('Feed has no dated public entries with required episode evidence');
  return {
    title: result.feed.feedTitle,
    entries: result.feed.items.length,
    validEntries: valid.length,
    sample: valid.slice(0, 3).map(({ title, link, published }) => ({ title, link, published })),
  };
}

export function storyIdentity(item) {
  // A transcript at another URL must explicitly identify the canonical episode;
  // do not infer identity from a common model name or a fuzzy similar title.
  const url = new URL(item.canonicalUrl ?? item.link);
  url.search = '';
  url.hash = '';
  url.hostname = url.hostname.replace(/^www\./, '');
  return url.href.replace(/\/$/, '');
}

export function mergeDiscoveryCandidates(items) {
  const stories = new Map();
  for (const item of items) {
    const key = storyIdentity(item);
    const previous = stories.get(key);
    if (
      previous &&
      item.published &&
      previous.published &&
      new Date(item.published).getTime() !== new Date(previous.published).getTime()
    ) {
      // Publication-date disagreements need review, not silent date replacement.
      previous.dateConflict = true;
    }
    stories.set(key, {
      ...item,
      ...previous,
      canonicalUrl: key,
      channels: [...new Set([...(previous?.channels ?? []), ...(item.channels ?? [])])],
      discoverySources: [
        ...new Set([...(previous?.discoverySources ?? []), item.source].filter(Boolean)),
      ],
      variants: [...(previous?.variants ?? []), item.link],
    });
  }
  return [...stories.values()];
}

export function discoveryTargets(pool, { includeLowFrequency = false } = {}) {
  const roles = [
    'activeCoreSources',
    'supplementalDiscoverySources',
    'officialConfirmationSources',
    'trendSources',
    ...(includeLowFrequency ? ['lowFrequencySources'] : []),
  ];
  return roles.flatMap((role) =>
    (pool[role] ?? []).flatMap((source) =>
      [source.access.primary, ...(source.access.additionalFeeds ?? [])]
        .filter((access) => access.kind !== 'chrome')
        .map((access) => ({
          source: source.name,
          role,
          channel: source.channel ?? 'blog',
          ...access,
        })),
    ),
  );
}
