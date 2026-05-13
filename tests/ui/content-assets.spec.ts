import { expect, test } from '@playwright/test';
import { JSDOM } from 'jsdom';
import * as fs from 'node:fs';
import * as path from 'node:path';

import {
  collectContentEntries,
  distRoot,
  fileExistsWithContent,
  isExternalUrl,
  listDistHtmlPages,
  resolveDistAsset,
  resolvePublicAsset,
  stripUrlDecorations,
  toPosixPath,
} from './qa-utils';

test.describe('content and asset QA', () => {
  test.beforeEach(({ isMobile }) => {
    test.skip(isMobile, 'content QA only needs one browser project');
  });

  test('published markdown keeps Chinese and Japanese sibling parity', () => {
    const missingSiblings = Array.from(
      collectContentEntries()
        .filter((entry) => entry.frontmatter.draft !== true)
        .reduce((groups, entry) => {
          const key = `${entry.collection}/${entry.baseSlug}`;
          const locales = groups.get(key) ?? new Set();
          locales.add(entry.locale);
          groups.set(key, locales);
          return groups;
        }, new Map<string, Set<string>>()),
    )
      .filter(([, locales]) => !locales.has('zh') || !locales.has('ja'))
      .map(([key, locales]) => `${key} has ${Array.from(locales).join(', ')}`);

    expect(missingSiblings).toEqual([]);
  });

  test('frontmatter local assets exist and radar covers stay locale-specific', () => {
    const problems: string[] = [];
    const assetKeys = ['coverImage', 'audioUrl', 'deckUrl'] as const;

    for (const entry of collectContentEntries()) {
      for (const key of assetKeys) {
        const value = entry.frontmatter[key];
        if (!value || isExternalUrl(value) || !value.startsWith('/')) {
          continue;
        }

        const assetPath = resolvePublicAsset(value);
        if (!fileExistsWithContent(assetPath)) {
          problems.push(`${entry.collection}/${entry.relativePath} ${key} is missing ${value}`);
        }
      }

      const coverImage = entry.frontmatter.coverImage;
      if (entry.collection === 'radar' && coverImage?.startsWith('/images/radar/')) {
        const fileName = path.basename(stripUrlDecorations(coverImage));
        const hasJapaneseMarker = /\.ja[-.]/.test(fileName);
        if (entry.locale === 'ja' && !hasJapaneseMarker) {
          problems.push(
            `${entry.collection}/${entry.relativePath} uses a non-Japanese radar cover ${coverImage}`,
          );
        }
        if (entry.locale === 'zh' && hasJapaneseMarker) {
          problems.push(
            `${entry.collection}/${entry.relativePath} uses a Japanese radar cover ${coverImage}`,
          );
        }
      }
    }

    expect(problems).toEqual([]);
  });

  test('FastAPI practice articles stay public-facing and avoid inline SVG diagrams', () => {
    const targetSlugs = new Set([
      'practice/express-to-fastapi-migration-map',
      'practice/fastapi-agent-runtime-patterns',
      'practice/fastapi-architecture-observability-for-tls',
      'practice/python-fastapi-developer-foundations',
      'practice/uv-python-project-workflow',
    ]);
    const internalContextPattern =
      /学习会|讲法|听众|勉強会|聴衆|社内|workshop notes|speaker notes/i;
    const problems: string[] = [];

    for (const entry of collectContentEntries()) {
      if (entry.collection !== 'engineering' || !targetSlugs.has(entry.baseSlug)) {
        continue;
      }

      const markdown = fs.readFileSync(entry.filePath, 'utf8');
      if (/\]\([^)]*\.svg(?:[?#][^)]*)?\)/.test(markdown)) {
        problems.push(`${entry.relativePath} references an inline SVG body image`);
      }
      if (internalContextPattern.test(markdown)) {
        problems.push(`${entry.relativePath} contains internal workshop context wording`);
      }
    }

    expect(problems).toEqual([]);
  });

  test('built HTML references existing local assets', () => {
    const missing = new Set<string>();
    const htmlPages = listDistHtmlPages();
    expect(htmlPages.length).toBeGreaterThan(0);

    for (const htmlPath of htmlPages) {
      const html = fs.readFileSync(htmlPath, 'utf8');
      const document = new JSDOM(html).window.document;
      const references = collectLocalAssetReferences(document);

      for (const reference of references) {
        if (reference.pathname === '/') {
          continue;
        }

        const candidate = reference.pathname.endsWith('/')
          ? resolveDistAsset(`${reference.pathname}index.html`)
          : resolveDistAsset(reference.pathname);

        if (!fileExistsWithContent(candidate)) {
          const page = toPosixPath(path.relative(distRoot, htmlPath));
          missing.add(`${page} -> ${reference.original}`);
        }
      }
    }

    expect(Array.from(missing).sort()).toEqual([]);
  });
});

function collectLocalAssetReferences(document: Document) {
  const references: Array<{ original: string; pathname: string }> = [];
  const attributes = [
    ['img[src]', 'src'],
    ['script[src]', 'src'],
    ['link[href]', 'href'],
    ['source[src]', 'src'],
    ['audio[src]', 'src'],
    ['video[src]', 'src'],
    ['track[src]', 'src'],
    ['iframe[src]', 'src'],
    ['object[data]', 'data'],
  ] as const;

  for (const [selector, attribute] of attributes) {
    for (const element of Array.from(document.querySelectorAll(selector))) {
      const value = element.getAttribute(attribute);
      if (value) {
        pushReference(references, value);
      }
    }
  }

  for (const element of Array.from(document.querySelectorAll('[srcset]'))) {
    const srcset = element.getAttribute('srcset');
    if (!srcset) {
      continue;
    }

    for (const candidate of srcset.split(',')) {
      const value = candidate.trim().split(/\s+/)[0];
      if (value) {
        pushReference(references, value);
      }
    }
  }

  return references;
}

function pushReference(references: Array<{ original: string; pathname: string }>, value: string) {
  if (
    value.startsWith('#') ||
    value.startsWith('data:') ||
    value.startsWith('mailto:') ||
    value.startsWith('tel:')
  ) {
    return;
  }

  const parsed = new URL(value, 'http://site.test');
  if (parsed.origin !== 'http://site.test') {
    return;
  }

  const pathname = decodeURIComponent(parsed.pathname);
  const extension = path.extname(pathname);
  if (!extension && !pathname.endsWith('/')) {
    return;
  }

  references.push({ original: value, pathname });
}
