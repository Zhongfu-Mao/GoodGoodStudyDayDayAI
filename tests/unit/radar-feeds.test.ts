import { describe, expect, it } from 'vitest';
import {
  parseRadarFeed,
  validateRadarFeed,
  mergeDiscoveryCandidates,
  discoveryTargets,
  radarDailyWindow,
  resolveDiscoveryWindow,
  selectFeedCandidates,
} from '../../scripts/lib/radar-feeds.mjs';
import { normalizeRadarUrl } from '../../scripts/lib/radar-url.mjs';
import { readFileSync } from 'node:fs';
import { previewMediaPath } from '../../scripts/lib/radar-local-preview.mjs';

describe('source feeds and cross-format story identity', () => {
  it('fixes the historical JST window and preserves it on resume', () => {
    const window = radarDailyWindow('2026-10-21');
    expect(window).toEqual({ start: '2026-10-20T03:00:00.000Z', end: '2026-10-21T03:00:00.000Z' });
    expect(resolveDiscoveryWindow('2026-10-21', { previous: { window } })).toEqual(window);
    expect(resolveDiscoveryWindow('2026-10-21', { previous: { cutoff: '2026-10-21T02:00:00Z' } }).end).toBe('2026-10-21T02:00:00.000Z');
    expect(resolveDiscoveryWindow('2026-10-21', { previous: { window: { start: '2026-10-20T12:00:00+09:00', end: '2026-10-21T12:00:00+09:00' } } })).toEqual(window);
    expect(() => resolveDiscoveryWindow('2026-10-21', { previous: { cutoff: '2026-10-28T03:00:00Z' } })).toThrow('outside this edition');
    expect(() => resolveDiscoveryWindow('2026-10-21', { previous: { window }, cutoff: '2026-10-21T02:00:00Z' })).toThrow('differs');
    expect(() => resolveDiscoveryWindow('2026-10-21', { cutoff: '2026-10-28T03:00:00Z' })).toThrow('noon-JST');
    expect(() => radarDailyWindow('2026-02-30')).toThrow('calendar');
    expect(() => resolveDiscoveryWindow('2026-10-21', { cutoff: '2026-10-21T03:00:00' })).toThrow('timezone');
  });
  it('filters every podcast candidate and keeps both sides of the window for review', () => {
    const item = { title: 'Episode', link: 'https://example.com/episode', published: '2026-10-20T05:00:00Z',
      enclosure: { type: 'audio/mpeg', url: 'https://example.com/audio.mp3' } };
    const result = { ok: true, mode: 'rss', feed: { items: [item,
      { ...item, title: 'Text only', link: 'https://example.com/text', enclosure: undefined },
      { ...item, title: 'Future', published: '2026-10-21T04:00:00Z' },
      { ...item, title: 'Previous boundary', published: '2026-10-20T03:00:00Z' },
      { ...item, title: 'Cutoff boundary', published: '2026-10-21T03:00:00Z' },
      { ...item, title: 'Date only', published: '2026-10-20' },
    ] } };
    expect(validateRadarFeed(result, { podcast: true }).validEntries).toBe(5);
    const selected = selectFeedCandidates(result, { source: 'Show', kind: 'podcast-rss' }, radarDailyWindow('2026-10-21'));
    expect(selected.stories.map(s => s.title)).toEqual(['Episode', 'Cutoff boundary']);
    expect(selected.rejectedEntries[0].reason).toContain('audio enclosure');
    expect(selected.futureCandidates).toHaveLength(1);
    expect(selected.olderCandidates).toHaveLength(1);
    expect(selected.dateUncertainCandidates[0].title).toBe('Date only');
  });
  it('preserves content query parameters while removing only known tracking parameters', () => {
    const papers = ['a', 'b'].map(id => ({ link: `https://openreview.net/forum?id=${id}`, channels: ['paper'] }));
    expect(mergeDiscoveryCandidates(papers)).toHaveLength(2);
    expect(normalizeRadarUrl('https://www.example.com/p?id=a&utm_source=x#intro')).toBe('https://example.com/p?id=a');
    expect(() => normalizeRadarUrl('https://example.com/a https://example.com/b')).toThrow('one URL');
  });
  it('does not proactively collect excluded vendors, but keeps approved project-team feeds', () => {
    const access = { primary: { kind: 'rss', url: 'https://example.com/feed' } };
    const targets = discoveryTargets({ activeCoreSources: [{ name: 'Microsoft', access }],
      supplementalDiscoverySources: [{ name: 'HF project-team releases', access }], excludedActiveSources: [{ name: 'Microsoft' }] });
    expect(targets.map(t => t.source)).toEqual(['HF project-team releases']);
  });
  it('serves local sample audio only when explicitly enabled, without arbitrary cache access', () => {
    const url = '/__radar-preview/audio/daily-ai-radar-2026-10-20.ja.mp3';
    expect(previewMediaPath(url)).toBeNull();
    expect(previewMediaPath(url, { enabled: true })).toContain('daily-ai-radar-2026-10-20.ja.mp3');
    expect(previewMediaPath('/__radar-preview/audio/../../.env', { enabled: true })).toBeNull();
  });
  it('rejects HTML, malformed XML and feed-shaped pages without usable entries', () => {
    expect(() => parseRadarFeed('<html><body>Podcast</body></html>')).toThrow('Expected RSS');
    expect(() => parseRadarFeed('<rss><channel>')).toThrow('Invalid feed XML');
    expect(() => validateRadarFeed({ ok: true, mode: 'rss', feed: { items: [] } })).toThrow(
      'nonempty',
    );
  });
  it('retains real episode enclosures, transcript links and original dates', () => {
    const feed = parseRadarFeed(
      '<rss xmlns:podcast="https://podcastindex.org/namespace/1.0"><channel><title>Show</title><item><title>Episode</title><link>https://example.com/e1</link><pubDate>Mon, 19 Oct 2026 15:00:00 GMT</pubDate><guid>e1</guid><enclosure url="https://example.com/e1.mp3" type="audio/mpeg" length="123"/><podcast:transcript url="https://example.com/e1.txt" type="text/plain"/></item></channel></rss>',
    );
    expect(feed.items[0].enclosure?.url).toBe('https://example.com/e1.mp3');
    expect(feed.items[0].transcripts).toHaveLength(1);
    expect(validateRadarFeed({ ok: true, mode: 'rss', feed }, { podcast: true }).validEntries).toBe(
      1,
    );
    expect(() =>
      validateRadarFeed(
        { ok: true, mode: 'rss', feed: { items: [{ ...feed.items[0], enclosure: undefined }] } },
        { podcast: true },
      ),
    ).toThrow('episode evidence');
  });
  it('parses Atom alternate links without substituting an updated date for an available publication date', () => {
    const f = parseRadarFeed(
      '<feed xmlns="http://www.w3.org/2005/Atom"><title>Author</title><entry><title>Post</title><link rel="self" href="https://example.com/atom"/><link rel="alternate" href="https://example.com/post"/><published>2026-10-18T00:00:00Z</published><updated>2026-10-20T00:00:00Z</updated></entry></feed>',
    );
    expect(f.items[0]).toMatchObject({
      link: 'https://example.com/post',
      published: '2026-10-18T00:00:00Z',
    });
  });
  it('merges episode/article/transcript variants but never unrelated stories with similar titles', () => {
    const a = {
      link: 'https://www.example.com/episode?utm_source=newsletter',
      published: '2026-10-18',
      channels: ['newsletter'],
    };
    const merged = mergeDiscoveryCandidates([
      a,
      {
        link: 'https://example.com/transcript',
        canonicalUrl: 'https://example.com/episode',
        published: '2026-10-18',
        channels: ['podcast'],
      },
    ]);
    expect(merged).toHaveLength(1);
    expect(merged[0].channels).toEqual(['newsletter', 'podcast']);
    expect(
      mergeDiscoveryCandidates([a, { ...a, link: 'https://example.com/different' }]),
    ).toHaveLength(2);
    expect(mergeDiscoveryCandidates([a, { ...a, published: '2026-10-19' }])[0].dateConflict).toBe(
      true,
    );
  });
  it('derives targets from actual config including supplemental/podcast feeds, preserving exclusions and low-frequency cadence', () => {
    const pool = JSON.parse(readFileSync('scripts/radar/source-pool.json', 'utf8'));
    const targets = discoveryTargets(pool);
    expect(targets.some((t) => t.source === 'Hamel Husain')).toBe(true);
    expect(targets.filter((t) => t.kind === 'podcast-rss')).toHaveLength(2);
    expect(targets.some((t) => t.source === 'Chip Huyen')).toBe(false);
    expect(
      discoveryTargets(pool, { includeLowFrequency: true }).some((t) => t.source === 'Chip Huyen'),
    ).toBe(true);
    expect(pool.excludedActiveSources.map((s: { name: string }) => s.name)).toEqual([
      'AWS',
      'Meta',
      'Microsoft',
      'NVIDIA',
    ]);
  });
});
