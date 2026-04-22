import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

const repository = process.env.GITHUB_REPOSITORY?.split('/')[1];
const site =
  process.env.SITE_URL ??
  (process.env.GITHUB_REPOSITORY_OWNER ? `https://${process.env.GITHUB_REPOSITORY_OWNER}.github.io` : 'https://example.com');
const base =
  process.env.BASE_PATH ??
  (repository && !repository.endsWith('.github.io') ? `/${repository}` : '/');
const normalizedBase = base === '/' ? '/' : `/${base.replace(/^\/+|\/+$/g, '')}/`;

function withBasePath(path) {
  if (!path?.startsWith('/')) {
    return path;
  }

  if (normalizedBase === '/') {
    return path;
  }

  const basePrefix = normalizedBase.slice(0, -1);
  return path === '/' ? normalizedBase : `${basePrefix}${path}`;
}

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
      node.properties.href = withBasePath(node.properties.href);
    }

    if (typeof node.properties.src === 'string') {
      node.properties.src = withBasePath(node.properties.src);
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
    node.url = withBasePath(node.url);
  }

  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      visitMarkdownNode(child);
    }
  }
}

export default defineConfig({
  integrations: [react(), tailwind()],
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
