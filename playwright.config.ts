import { defineConfig, devices } from '@playwright/test';
import { resolveAppBasePath } from './scripts/lib/base-path.mjs';

const configuredBaseUrl = process.env.PLAYWRIGHT_BASE_URL
  ? new URL(process.env.PLAYWRIGHT_BASE_URL)
  : undefined;
const port = Number(process.env.PLAYWRIGHT_PORT ?? configuredBaseUrl?.port ?? 4321);
const host = process.env.PLAYWRIGHT_HOST ?? configuredBaseUrl?.hostname ?? '127.0.0.1';
const serverOrigin = configuredBaseUrl?.origin ?? `http://${host}:${port}`;
const appBasePath = resolveAppBasePath();
const readyUrl = new URL(appBasePath, `${serverOrigin}/`).toString();

export default defineConfig({
  testDir: './tests/ui',
  fullyParallel: true,
  timeout: 30_000,
  expect: {
    timeout: 10_000,
  },
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: serverOrigin,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    command: `npm run preview -- --host ${host} --port ${port}`,
    url: readyUrl,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 7'] },
    },
  ],
});
