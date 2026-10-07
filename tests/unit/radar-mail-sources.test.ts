import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const pool = JSON.parse(readFileSync(new URL('../../scripts/radar/source-pool.json', import.meta.url), 'utf8'));

describe('radar confirmed newsletter senders', () => {
  it.each([
    ['The Rundown AI', 'news@daily.therundown.ai'],
    ['ByteByteGo', 'bytebytego@substack.com'],
    ['AI Valley', 'aivalley@mail.beehiiv.com'],
    ['The Batch / DeepLearning.AI', 'thebatch@deeplearning.ai'],
    ['The Batch / DeepLearning.AI', 'hello@deeplearning.ai'],
    ['Programmer Weekly', 'rahul@programmerweekly.com'],
  ])('keeps the actual sender for %s: %s', (name, sender) => {
    const source = pool.activeCoreSources.find((entry: { name: string }) => entry.name === name);
    const queries = source.access.fallbacks.filter((item: { kind: string }) => item.kind === 'gmail');
    expect(queries.some((item: { query: string }) => item.query.includes(sender))).toBe(true);
  });

  it('does not restore unverified historical sender guesses', () => {
    const serialized = JSON.stringify(pool.activeCoreSources);
    expect(serialized).not.toContain('newsletter@aivalley.ai');
    expect(serialized).not.toContain('news@deeplearning.ai');
  });
});
