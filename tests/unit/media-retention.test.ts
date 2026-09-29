import { describe, expect, it } from 'vitest';
import {
  monthCutoff,
  shouldArchiveMedia,
  rewriteMediaReferences,
} from '../../scripts/lib/media-retention.mjs';
describe('media retention', () => {
  it('uses a calendar month and clamps short months', () => {
    expect(monthCutoff('2026-09-29')).toBe('2026-08-29');
    expect(monthCutoff('2026-03-31')).toBe('2026-02-28');
    expect(monthCutoff('2026-01-01')).toBe('2025-12-01');
  });
  it('keeps the boundary day and shared undated artwork, archives all heavy media', () => {
    expect(shouldArchiveMedia('public/images/radar/a.webp', '2026-08-29', '2026-08-29')).toBe(
      false,
    );
    expect(shouldArchiveMedia('public/images/radar/a.webp', '2026-08-28', '2026-08-29')).toBe(true);
    expect(shouldArchiveMedia('public/images/radar/a.svg', undefined, '2026-08-29')).toBe(false);
    expect(shouldArchiveMedia('public/audio/radar/a.mp3', '2026-09-29', '2026-08-29')).toBe(true);
    expect(shouldArchiveMedia('public/decks/radar/a.pdf', '2026-09-29', '2026-08-29')).toBe(true);
  });
  it('rewrites exact local references and preserves external hosts and URL suffixes', () => {
    const urls = new Map([['public/images/radar/a.webp', 'https://media.example/a-sha.webp']]);
    expect(
      rewriteMediaReferences(
        '![x](/images/radar/a.webp?x=1) https://other.example/images/radar/a.webp',
        urls,
      ),
    ).toBe('![x](https://media.example/a-sha.webp?x=1) https://other.example/images/radar/a.webp');
  });
});
