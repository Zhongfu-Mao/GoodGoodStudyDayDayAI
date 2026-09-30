import { expect, it } from 'vitest';
import { compactFetch } from '../../scripts/lib/radar-output.mjs';

it('keeps evidence pointers and marks truncation without returning HTML', () => {
  const output = compactFetch({
    ok: true,
    article: {
      title: 'Source',
      publishedTime: '2026-08-28',
      textContent: 'a'.repeat(10000),
      content: '<a href="https://example.org/p?a=1&amp;b=2">x</a>',
    },
    body: 'data:image/png;base64,' + 'x'.repeat(100000),
  });
  expect(output.article.text).toHaveLength(1200);
  expect(output.article.truncated).toBe(true);
  expect(output.article.publishedTime).toBe('2026-08-28');
  expect(output.article.links).toEqual(['https://example.org/p?a=1&b=2']);
  expect(JSON.stringify(output)).not.toContain('base64');
  expect(JSON.stringify(output).length).toBeLessThan(2000);
});

it('bounds feed results and preserves original total', () => {
  const output = compactFetch({
    feed: {
      feedTitle: 'RSS',
      items: Array.from({ length: 100 }, () => ({
        title: 'x',
        link: 'https://example.org',
        published: '2026-08-28',
        summary: 'x'.repeat(1000),
      })),
    },
  });
  expect(output.feed.count).toBe(100);
  expect(output.feed.items).toHaveLength(15);
  expect(output.feed.items[0].summary).toHaveLength(160);
});
