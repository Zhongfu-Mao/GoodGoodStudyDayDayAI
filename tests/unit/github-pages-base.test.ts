import { describe, expect, it } from 'vitest';
import {
  createRehypeGitHubPagesBase,
  createRemarkGitHubPagesBase,
} from '../../scripts/lib/github-pages-base.mjs';

describe('GitHub Pages markdown base path plugins', () => {
  it('prefixes markdown links and images once', () => {
    const tree = {
      type: 'root',
      children: [
        { type: 'link', url: '/radar/' },
        { type: 'image', url: '/GoodGoodStudyDayDayAI/images/card.png' },
        { type: 'link', url: 'https://example.com/external' },
      ],
    };

    createRemarkGitHubPagesBase('/GoodGoodStudyDayDayAI')()(tree);

    expect(tree.children.map((child) => child.url)).toEqual([
      '/GoodGoodStudyDayDayAI/radar/',
      '/GoodGoodStudyDayDayAI/images/card.png',
      'https://example.com/external',
    ]);
  });

  it('prefixes HTML href and src attributes once', () => {
    const tree = {
      type: 'root',
      children: [
        {
          type: 'element',
          properties: { href: '/academy/', src: '/images/hero.png' },
          children: [
            {
              type: 'element',
              properties: { href: '/GoodGoodStudyDayDayAI/start/' },
            },
          ],
        },
      ],
    };

    createRehypeGitHubPagesBase('/GoodGoodStudyDayDayAI')()(tree);

    expect(tree.children[0].properties).toEqual({
      href: '/GoodGoodStudyDayDayAI/academy/',
      src: '/GoodGoodStudyDayDayAI/images/hero.png',
    });
    expect(tree.children[0].children[0].properties.href).toBe('/GoodGoodStudyDayDayAI/start/');
  });
});
