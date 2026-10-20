import { describe, expect, it } from 'vitest';
import {
  parseRadarFeed,
  validateRadarFeed,
  mergeDiscoveryCandidates,
  discoveryTargets,
} from '../../scripts/lib/radar-feeds.mjs';
import { readFileSync } from 'node:fs';
import { previewMediaPath } from '../../scripts/lib/radar-local-preview.mjs';

describe('source feeds and cross-format story identity', () => {
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
