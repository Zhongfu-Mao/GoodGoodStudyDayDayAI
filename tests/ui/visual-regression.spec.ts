import { expect, test, type Page } from '@playwright/test';

import { gotoApp } from './site-test-utils';

const visualSnapshots = [
  {
    name: 'home-desktop',
    path: '/',
    viewport: { width: 1366, height: 900 },
  },
  {
    name: 'ja-radar-weekly-review-narrow',
    path: '/ja/radar/#weekly',
    viewport: { width: 721, height: 963 },
  },
  {
    name: 'radar-monthly-desktop',
    path: '/radar/#monthly',
    viewport: { width: 1366, height: 900 },
  },
  {
    name: 'ja-radar-monthly-review-narrow',
    path: '/ja/radar/#monthly',
    viewport: { width: 721, height: 963 },
  },
  {
    name: 'ja-academy-detail-phone',
    path: '/ja/academy/openai-academy/00-overview/openai-academy-overview/',
    viewport: { width: 390, height: 844 },
  },
  {
    name: 'radar-gallery-desktop',
    path: '/radar/gallery/',
    viewport: { width: 1366, height: 900 },
  },
] as const;

test.describe('critical page visual baselines', () => {
  test.beforeEach(async ({ page, isMobile }) => {
    test.skip(isMobile, 'visual baselines are captured once with explicit viewport sizes');
    test.skip(
      Boolean(process.env.CI),
      'local visual baselines are OS-font sensitive; structural UI QA still runs in CI',
    );

    await page.addInitScript(() => {
      window.localStorage.setItem('ggsdda-theme', 'light');
      window.localStorage.setItem('ggsdda-aquarium', 'off');
      window.localStorage.removeItem('ggsdda-audio-player');
    });
  });

  for (const snapshot of visualSnapshots) {
    test(`${snapshot.name} matches the approved baseline`, async ({ page }) => {
      await page.setViewportSize(snapshot.viewport);
      await gotoApp(page, snapshot.path);
      await stabilizeVisualPage(page);
      await expect(page.locator('main')).toBeVisible();

      await expect(page).toHaveScreenshot(`${snapshot.name}.png`, {
        animations: 'disabled',
        caret: 'hide',
        fullPage: false,
        maxDiffPixelRatio: 0.015,
        scale: 'css',
      });
    });
  }
});

async function stabilizeVisualPage(page: Page) {
  await page.evaluate(() => {
    document.documentElement.dataset.theme = 'light';
    document.documentElement.style.colorScheme = 'light';
    window.scrollTo(0, 0);
  });

  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-delay: 0s !important;
        animation-duration: 0s !important;
        caret-color: transparent !important;
        scroll-behavior: auto !important;
        transition-duration: 0s !important;
      }

      [data-global-audio-player],
      .transparent-aquarium,
      .ui-tooltip::before,
      .ui-tooltip::after {
        display: none !important;
      }
    `,
  });

  await page.waitForLoadState('load');
  await page.waitForTimeout(120);
}

