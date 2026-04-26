import type { Page } from '@playwright/test';

const appBasePath = resolveAppBasePath();

export function appPath(path = '/') {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  if (appBasePath === '/') {
    return normalizedPath;
  }

  return normalizedPath === '/'
    ? appBasePath
    : `${appBasePath.slice(0, -1)}${normalizedPath}`;
}

export function appUrlPattern(path = '/') {
  return new RegExp(`${escapeRegExp(appPath(path))}(?:[?#].*)?$`);
}

export async function gotoApp(page: Page, path = '/') {
  await page.goto(appPath(path));
}

function resolveAppBasePath() {
  const repository = process.env.GITHUB_REPOSITORY?.split('/')[1];
  const rawBasePath =
    process.env.BASE_PATH ??
    (repository && !repository.endsWith('.github.io') ? `/${repository}` : '/');
  const normalized = `/${rawBasePath.replace(/^\/+|\/+$/g, '')}`;

  return normalized === '/' ? '/' : `${normalized}/`;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
