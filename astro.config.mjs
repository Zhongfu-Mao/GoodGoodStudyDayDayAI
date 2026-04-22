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

export default defineConfig({
  integrations: [react(), tailwind()],
  site,
  base,
  i18n: {
    defaultLocale: 'zh',
    locales: ['zh', 'ja'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
