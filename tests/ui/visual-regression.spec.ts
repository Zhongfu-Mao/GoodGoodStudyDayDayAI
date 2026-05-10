import { expect, test, type Page } from '@playwright/test';

import { gotoApp } from './site-test-utils';

const visualSnapshots = [
  // Keep pixel baselines on content-stable regions only. Global navigation,
  // public tags, radar archives, and the home page include dynamic content, so
  // structural UI tests cover those surfaces instead.
  {
    name: 'ja-academy-detail-phone',
    path: '/ja/academy/openai-academy/00-overview/openai-academy-overview/',
    clipHeight: 760,
    target: 'article[data-pagefind-body]',
    viewport: { width: 390, height: 844 },
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
      const target = page.locator(snapshot.target).first();
      await expect(target).toBeVisible();
      await target.evaluate((element) => element.scrollIntoView({ block: 'start' }));
      await page.waitForTimeout(80);
      const targetBox = await target.boundingBox();
      if (!targetBox) {
        throw new Error(
          `Expected visual snapshot target "${snapshot.target}" to have a layout box.`,
        );
      }

      await expect(page).toHaveScreenshot(`${snapshot.name}.png`, {
        animations: 'disabled',
        caret: 'hide',
        clip: {
          height: Math.min(Math.floor(targetBox.height), snapshot.clipHeight),
          width: Math.floor(targetBox.width),
          x: Math.max(0, Math.floor(targetBox.x)),
          y: Math.max(0, Math.floor(targetBox.y)),
        },
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
  await page.evaluate(() => {
    document.documentElement.dataset.theme = 'light';
    document.documentElement.style.colorScheme = 'light';
    window.scrollTo(0, 0);
  });
  await page.evaluate(async () => {
    const images = Array.from(document.images).filter((image) => {
      const box = image.getBoundingClientRect();
      return box.width > 0 && box.height > 0 && box.bottom >= 0 && box.top <= window.innerHeight;
    });

    await Promise.all(
      images.map(async (image) => {
        if (!image.complete) {
          await new Promise<void>((resolve) => {
            image.addEventListener('load', () => resolve(), { once: true });
            image.addEventListener('error', () => resolve(), { once: true });
          });
        }
        await image.decode().catch(() => undefined);
      }),
    );
  });
  await page.waitForTimeout(80);
}
