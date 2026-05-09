import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import pagefind from 'astro-pagefind';
import { resolveBasePath } from './scripts/lib/base-path.mjs';
import {
  createRehypeGitHubPagesBase,
  createRemarkGitHubPagesBase,
} from './scripts/lib/github-pages-base.mjs';
import { createRehypeImageAltFallback } from './scripts/lib/markdown-image-alt.mjs';

const site =
  process.env.SITE_URL ??
  (process.env.GITHUB_REPOSITORY_OWNER
    ? `https://${process.env.GITHUB_REPOSITORY_OWNER}.github.io`
    : 'https://example.com');
const base = resolveBasePath();
const rehypeGitHubPagesBase = createRehypeGitHubPagesBase(base);
const remarkGitHubPagesBase = createRemarkGitHubPagesBase(base);
const rehypeImageAltFallback = createRehypeImageAltFallback();

export default defineConfig({
  devToolbar: {
    enabled: false,
  },
  integrations: [
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
  prefetch: {
    defaultStrategy: 'hover',
  },
  markdown: {
    remarkPlugins: [remarkGitHubPagesBase],
    rehypePlugins: [rehypeImageAltFallback, rehypeGitHubPagesBase],
  },
  i18n: {
    defaultLocale: 'zh',
    locales: ['zh', 'ja'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: ['pdfjs-dist'],
    },
  },
});
