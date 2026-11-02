import { XMLParser, XMLValidator } from 'fast-xml-parser';
import { normalizeRadarUrl } from './radar-url.mjs';

export function radarDailyWindow(date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('Invalid radar date');
  // Noon Asia/Tokyo is 03:00 UTC, with no daylight-saving changes.
  const end = new Date(`${date}T03:00:00Z`);
  if (!Number.isFinite(end.getTime()) || end.toISOString().slice(0, 10) !== date)
    throw new Error('Invalid radar calendar date');
  return { start: new Date(end.getTime() - 86_400_000).toISOString(), end: end.toISOString() };
}

export function resolveDiscoveryWindow(date, { start, cutoff, previous } = {}) {
  const policy = radarDailyWindow(date);
  if (previous?.date && previous.date !== date) throw new Error('Saved discovery edition differs');
  // Legacy partial-day work must not silently expand to noon on resume.
  const saved =
    previous?.window ?? (previous?.cutoff ? { start: policy.start, end: previous.cutoff } : null);
  const normalizedSaved = saved
    ? { start: new Date(saved.start).toISOString(), end: new Date(saved.end).toISOString() }
    : null;
  if (
    normalizedSaved &&
    (normalizedSaved.start < policy.start ||
      normalizedSaved.end > policy.end ||
      normalizedSaved.start >= normalizedSaved.end)
  )
    throw new Error(
      'Saved discovery cutoff is outside this edition; preserve it for review before a separate corrected run',
    );
  const window = {
    start: start ?? saved?.start ?? policy.start,
    end: cutoff ?? saved?.end ?? policy.end,
  };
  for (const time of [window.start, window.end]) {
    if (!/(?:Z|[+-]\d{2}:\d{2})$/.test(time) || !Number.isFinite(Date.parse(time)))
      throw new Error('Discovery window requires timestamps with timezone');
  }
  window.start = new Date(window.start).toISOString();
  window.end = new Date(window.end).toISOString();
  if (window.start < policy.start || window.end > policy.end || window.start >= window.end)
    throw new Error('Discovery window must stay within the edition noon-JST window');
  if (
    normalizedSaved &&
    (window.start !== normalizedSaved.start || window.end !== normalizedSaved.end)
  )
    throw new Error(
      'Saved discovery window differs; preserve the old index instead of changing it on resume',
    );
  return window;
}

export function selectFeedCandidates(result, target, window) {
  const stories = [],
    futureCandidates = [],
    olderCandidates = [],
    rejectedEntries = [],
    dateUncertainCandidates = [];
  for (const item of result.feed.items) {
    const reason = validateRadarFeedItem(item, { podcast: target.kind === 'podcast-rss' });
    if (reason) {
      rejectedEntries.push({ title: item.title, link: item.link, reason });
      continue;
    }
    const story = {
      title: item.title,
      link: item.link,
      published: item.published,
      source: target.source,
      channels: [target.kind === 'podcast-rss' ? 'podcast' : target.channel],
    };
    if (!/\d{1,2}:\d{2}.*(?:Z|GMT|UTC|[+-]\d{2}:?\d{2})$/i.test(item.published)) {
      dateUncertainCandidates.push({
        ...story,
        reason:
          'Publication clock/timezone not established; review the original, do not assume midnight',
      });
      continue;
    }
    const time = Date.parse(item.published);
    if (time > Date.parse(window.end)) {
      futureCandidates.push(story);
      continue;
    }
    // Adjacent editions share a cutoff but not an article: (start, end].
    if (time <= Date.parse(window.start)) {
      olderCandidates.push(story);
      continue;
    }
    stories.push(story);
    for (const transcript of item.transcripts ?? []) {
      try {
        normalizeRadarUrl(transcript.url);
      } catch {
        continue;
      }
      stories.push({ ...story, link: transcript.url, canonicalUrl: item.link, form: 'transcript' });
    }
  }
  return { stories, futureCandidates, olderCandidates, rejectedEntries, dateUncertainCandidates };
}

export function validateRadarFeedItem(item, { podcast = false } = {}) {
  try {
    normalizeRadarUrl(item.link);
    if (!item.title?.trim() || !Number.isFinite(Date.parse(item.published)))
      return 'Missing title or publication date';
    if (podcast) {
      if (!/^audio\//.test(item.enclosure?.type ?? '')) return 'Missing audio enclosure';
      normalizeRadarUrl(item.enclosure.url);
    }
    return null;
  } catch {
    return 'Invalid public item or enclosure URL';
  }
}

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
  const valid = result.feed.items.filter((item) => !validateRadarFeedItem(item, { podcast }));
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
  return normalizeRadarUrl(item.canonicalUrl ?? item.link);
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
    (pool[role] ?? [])
      .filter(
        (source) =>
          !(pool.excludedActiveSources ?? []).some(
            (excluded) => source.name.toLowerCase() === excluded.name.toLowerCase(),
          ),
      )
      .flatMap((source) =>
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
