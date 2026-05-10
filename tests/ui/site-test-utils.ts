import type { Page } from '@playwright/test';
import { resolveAppBasePath } from '../../scripts/lib/base-path.mjs';

const appBasePath = resolveAppBasePath();

export function appPath(path = '/') {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  if (appBasePath === '/') {
    return normalizedPath;
  }

  return normalizedPath === '/' ? appBasePath : `${appBasePath.slice(0, -1)}${normalizedPath}`;
}

export function appUrlPattern(path = '/') {
  return new RegExp(`${escapeRegExp(appPath(path))}(?:[?#].*)?$`);
}

export async function gotoApp(page: Page, path = '/') {
  await page.goto(appPath(path), { waitUntil: 'domcontentloaded' });
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
