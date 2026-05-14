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
      /学习会|讲法|听众|勉強会|聴衆|社内|站内未公开|站内来源清单|内部資料|サイト非公開|workshop notes|speaker notes/i;
    const problems: string[] = [];

    for (const entry of collectContentEntries()) {
      if (entry.collection !== 'engineering' || !targetSlugs.has(entry.baseSlug)) {
        continue;
      }

      const markdown = fs.readFileSync(entry.filePath, 'utf8');
      if (containsSvgReference(markdown)) {
        problems.push(`${entry.relativePath} references an inline SVG body image`);
      }
      if (internalContextPattern.test(markdown)) {
        problems.push(`${entry.relativePath} contains internal workshop context wording`);
      }
    }

    expect(problems).toEqual([]);
  });

  test('benchmark articles keep covers, raster visuals, and public-facing copy', () => {
    const targetArticles = [
      {
        collection: 'academy',
        baseSlug: 'llm-apps-notes-01',
        imagePrefix: '/images/academy/llm-apps-notes-01/',
        minBodyImages: 4,
      },
      {
        collection: 'foundations',
        baseSlug: 'math-for-ai-01',
        imagePrefix: '/images/foundations/math-for-ai-01/',
        minBodyImages: 3,
      },
      {
        collection: 'academy',
        baseSlug: 'agentic-workflows-02',
        imagePrefix: '/images/academy/agentic-workflows-02/',
        minBodyImages: 3,
      },
      {
        collection: 'engineering',
        baseSlug: 'app-dev-01',
        imagePrefix: '/images/engineering/app-dev-01/',
        minBodyImages: 3,
      },
      {
        collection: 'engineering',
        baseSlug: 'cloud-infra-02',
        imagePrefix: '/images/engineering/cloud-infra-02/',
        minBodyImages: 3,
      },
      {
        collection: 'foundations',
        baseSlug: 'data-science-02',
        imagePrefix: '/images/foundations/data-science-02/',
        minBodyImages: 3,
      },
      {
        collection: 'academy',
        baseSlug: 'openai-academy/07-building-with-ai/agents',
        imagePrefix: '/images/academy/openai-academy/07-building-with-ai/agents/',
        minBodyImages: 3,
      },
      {
        collection: 'academy',
        baseSlug: 'openai-academy/07-building-with-ai/rag',
        imagePrefix: '/images/academy/openai-academy/07-building-with-ai/rag/',
        minBodyImages: 3,
      },
      {
        collection: 'academy',
        baseSlug: 'openai-academy/07-building-with-ai/evals',
        imagePrefix: '/images/academy/openai-academy/07-building-with-ai/evals/',
        minBodyImages: 3,
      },
      {
        collection: 'academy',
        baseSlug: 'anthropic-academy/04-developer-tools/claude-code-in-action',
        imagePrefix:
          '/images/academy/anthropic-academy/04-developer-tools/claude-code-in-action/',
        minBodyImages: 3,
      },
      {
        collection: 'academy',
        baseSlug: 'anthropic-academy/05-agentic-mcp/introduction-to-model-context-protocol',
        imagePrefix:
          '/images/academy/anthropic-academy/05-agentic-mcp/introduction-to-model-context-protocol/',
        minBodyImages: 3,
      },
      {
        collection: 'academy',
        baseSlug: 'anthropic-academy/05-agentic-mcp/introduction-to-agent-skills',
        imagePrefix:
          '/images/academy/anthropic-academy/05-agentic-mcp/introduction-to-agent-skills/',
        minBodyImages: 3,
      },
      {
        collection: 'engineering',
        baseSlug: 'practice/fastapi-project-structure-dependency-boundaries',
        imagePrefix: '/images/engineering/practice/fastapi-project-structure/',
        minBodyImages: 3,
      },
      {
        collection: 'engineering',
        baseSlug: 'practice/fastapi-background-jobs-idempotency',
        imagePrefix: '/images/engineering/practice/fastapi-background-jobs/',
        minBodyImages: 3,
      },
    ];
    const internalContextPattern =
      /学习会|讲法|听众|勉強会|聴衆|社内|站内未公开|站内来源清单|内部資料|サイト非公開|workshop notes|speaker notes/i;
    const problems: string[] = [];

    for (const target of targetArticles) {
      const entries = collectContentEntries().filter(
        (entry) => entry.collection === target.collection && entry.baseSlug === target.baseSlug,
      );
      const imagesByLocale = new Map<string, string[]>();

      expect(entries.map((entry) => entry.locale).sort()).toEqual(['ja', 'zh']);

      for (const entry of entries) {
        const markdown = fs.readFileSync(entry.filePath, 'utf8');
        const markdownWithoutCodeBlocks = stripFencedCodeBlocks(markdown);
        const coverImage = entry.frontmatter.coverImage;
        if (!coverImage || !coverImage.startsWith(target.imagePrefix)) {
          problems.push(`${entry.relativePath} is missing the benchmark cover image`);
        } else if (!fileExistsWithContent(resolvePublicAsset(coverImage))) {
          problems.push(`${entry.relativePath} coverImage does not exist: ${coverImage}`);
        } else if (!stripUrlDecorations(coverImage).endsWith('.png')) {
          problems.push(`${entry.relativePath} coverImage should be a PNG asset: ${coverImage}`);
        }

        if (containsSvgReference(markdownWithoutCodeBlocks)) {
          problems.push(`${entry.relativePath} references an inline SVG body image`);
        }
        if (internalContextPattern.test(markdown)) {
          problems.push(`${entry.relativePath} contains internal context wording`);
        }

        const localImageRefs = Array.from(
          markdownWithoutCodeBlocks.matchAll(/!\[[^\]]*]\((\/images\/[^)]+)\)/g),
        ).map((match) => match[1]);
        imagesByLocale.set(entry.locale, localImageRefs);
        if (localImageRefs.length < target.minBodyImages) {
          problems.push(
            `${entry.relativePath} should include at least ${target.minBodyImages} local body visuals`,
          );
        }
        for (const imageRef of localImageRefs) {
          if (!imageRef.startsWith(target.imagePrefix)) {
            problems.push(`${entry.relativePath} references an out-of-topic image ${imageRef}`);
          }
          if (!stripUrlDecorations(imageRef).endsWith('.png')) {
            problems.push(`${entry.relativePath} body image should be a PNG asset: ${imageRef}`);
          }
          if (!fileExistsWithContent(resolvePublicAsset(imageRef))) {
            problems.push(`${entry.relativePath} references a missing image ${imageRef}`);
          }
        }
      }

      const zhImages = imagesByLocale.get('zh') ?? [];
      const jaImages = imagesByLocale.get('ja') ?? [];
      if (JSON.stringify(zhImages) !== JSON.stringify(jaImages)) {
        problems.push(
          `${target.collection}/${target.baseSlug} Chinese and Japanese body image refs differ`,
        );
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

function stripFencedCodeBlocks(markdown: string) {
  return markdown.replace(/(^|\n)```[\s\S]*?```(?=\n|$)/g, '$1');
}

function containsSvgReference(markdown: string) {
  return (
    /\]\([^)]*\.svg(?:[?#][^)]*)?\)/i.test(markdown) ||
    /<svg(?:\s|>)/i.test(markdown) ||
    /<img\b[^>]*\bsrc=["'][^"']*\.svg(?:[?#][^"']*)?["']/i.test(markdown)
  );
}
