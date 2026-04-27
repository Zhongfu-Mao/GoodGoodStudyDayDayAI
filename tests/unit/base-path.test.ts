import { describe, expect, it } from 'vitest';
import { resolveAppBasePath, resolveBasePath, withBasePath } from '../../scripts/lib/base-path.mjs';

describe('base path helpers', () => {
  it('resolves repository base paths with and without trailing slashes', () => {
    const env = { GITHUB_REPOSITORY: 'owner/GoodGoodStudyDayDayAI' };

    expect(resolveBasePath({ env })).toBe('/GoodGoodStudyDayDayAI');
    expect(resolveAppBasePath({ env })).toBe('/GoodGoodStudyDayDayAI/');
  });

  it('keeps user or org pages at the root base path', () => {
    const env = { GITHUB_REPOSITORY: 'owner/owner.github.io' };

    expect(resolveBasePath({ env })).toBe('/');
    expect(resolveAppBasePath({ env })).toBe('/');
  });

  it('prefixes absolute paths once', () => {
    expect(withBasePath('/images/radar/card.png', { basePath: '/GoodGoodStudyDayDayAI' })).toBe(
      '/GoodGoodStudyDayDayAI/images/radar/card.png',
    );
    expect(withBasePath('/GoodGoodStudyDayDayAI/images/radar/card.png', { basePath: '/GoodGoodStudyDayDayAI' })).toBe(
      '/GoodGoodStudyDayDayAI/images/radar/card.png',
    );
    expect(withBasePath('https://example.com/card.png', { basePath: '/GoodGoodStudyDayDayAI' })).toBe(
      'https://example.com/card.png',
    );
  });
});
