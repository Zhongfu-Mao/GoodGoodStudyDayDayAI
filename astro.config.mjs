import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import pagefind from 'astro-pagefind';
import { resolveBasePath, withBasePath } from './scripts/lib/base-path.mjs';

const site =
  process.env.SITE_URL ??
  (process.env.GITHUB_REPOSITORY_OWNER ? `https://${process.env.GITHUB_REPOSITORY_OWNER}.github.io` : 'https://example.com');
const base = resolveBasePath();

function rehypeGitHubPagesBase() {
  return function transform(tree) {
    visitNode(tree);
  };
}

function remarkGitHubPagesBase() {
  return function transform(tree) {
    visitMarkdownNode(tree);
  };
}

function visitNode(node) {
  if (!node || typeof node !== 'object') {
    return;
  }

  if (node.type === 'element' && node.properties) {
    if (typeof node.properties.href === 'string') {
      node.properties.href = withBasePath(node.properties.href, { basePath: base });
    }

    if (typeof node.properties.src === 'string') {
      node.properties.src = withBasePath(node.properties.src, { basePath: base });
    }
  }

  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      visitNode(child);
    }
  }
}

function visitMarkdownNode(node) {
  if (!node || typeof node !== 'object') {
    return;
  }

  if ((node.type === 'link' || node.type === 'image') && typeof node.url === 'string') {
    node.url = withBasePath(node.url, { basePath: base });
  }

  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      visitMarkdownNode(child);
    }
  }
}

export default defineConfig({
  devToolbar: {
    enabled: false,
  },
  integrations: [
    tailwind(),
    sitemap({
      i18n: {
        defaultLocale: 'zh',
        locales: { zh: 'zh-Hans', ja: 'ja-JP' },
      },
    }),
    pagefind(),
  ],
  site,
  base,
  markdown: {
    remarkPlugins: [remarkGitHubPagesBase],
    rehypePlugins: [rehypeGitHubPagesBase],
  },
  i18n: {
    defaultLocale: 'zh',
    locales: ['zh', 'ja'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
