import { describe, expect, it } from 'vitest';
import { createRehypeImageAltFallback } from '../../scripts/lib/markdown-image-alt.mjs';

type TestElement = {
  type: 'element';
  tagName: string;
  properties: Record<string, string>;
};

type TestTree = {
  type: 'root';
  children: TestElement[];
};

describe('Markdown image alt fallback plugin', () => {
  it('uses article title when markdown image alt is missing', () => {
    const tree: TestTree = {
      type: 'root',
      children: [
        {
          type: 'element',
          tagName: 'img',
          properties: { src: '/images/example.png' },
        },
      ],
    };

    createRehypeImageAltFallback()()(tree, {
      data: { astro: { frontmatter: { title: 'AI Basics' } } },
    });

    expect(tree.children[0].properties.alt).toBe('AI Basics');
  });

  it('keeps explicit alt text unchanged', () => {
    const tree: TestTree = {
      type: 'root',
      children: [
        {
          type: 'element',
          tagName: 'img',
          properties: { src: '/images/example.png', alt: 'Architecture diagram' },
        },
      ],
    };

    createRehypeImageAltFallback()()(tree, {
      data: { astro: { frontmatter: { title: 'AI Basics' } } },
    });

    expect(tree.children[0].properties.alt).toBe('Architecture diagram');
  });

  it('uses configured fallback when no title is available', () => {
    const tree: TestTree = {
      type: 'root',
      children: [
        {
          type: 'element',
          tagName: 'img',
          properties: { src: '/images/example.png', alt: '' },
        },
      ],
    };

    createRehypeImageAltFallback({ fallbackAlt: 'Content illustration' })()(tree, { data: {} });

    expect(tree.children[0].properties.alt).toBe('Content illustration');
  });
});
