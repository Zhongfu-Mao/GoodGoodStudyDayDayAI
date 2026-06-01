import { expect, test, type Page } from '@playwright/test';

import { gotoApp } from './site-test-utils';

const layoutRoutes = [
  '/',
  '/ja/',
  '/start/',
  '/start/#ai-basics-for-everyone',
  '/start/#start-layers',
  '/start/#start-safety',
  '/start/#start-faq',
  '/start/layers/',
  '/start/safety/',
  '/start/plan/',
  '/start/faq/',
  '/ja/start/',
  '/ja/start/#ai-basics-for-everyone',
  '/ja/start/#start-layers',
  '/ja/start/#start-safety',
  '/ja/start/#start-faq',
  '/ja/start/layers/',
  '/ja/start/safety/',
  '/ja/start/plan/',
  '/ja/start/faq/',
  '/radar/#daily',
  '/radar/#weekly',
  '/radar/#monthly',
  '/ja/radar/#daily',
  '/ja/radar/#weekly',
  '/ja/radar/#monthly',
  '/radar/gallery/',
  '/ja/radar/gallery/',
  '/academy/',
  '/ja/academy/',
  '/academy/openai-academy/00-overview/openai-academy-overview/',
  '/ja/academy/openai-academy/00-overview/openai-academy-overview/',
] as const;

const viewports = [
  { name: 'phone', width: 390, height: 844 },
  { name: 'review-narrow', width: 721, height: 963 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1366, height: 900 },
] as const;

test.describe('multi-viewport layout QA', () => {
  test.beforeEach(({ isMobile }) => {
    test.skip(isMobile, 'custom viewport crawl covers mobile, tablet, and desktop');
  });

  for (const viewport of viewports) {
    test(`${viewport.name} routes have no broken images, horizontal overflow, or covered controls`, async ({
      page,
    }) => {
      test.setTimeout(180_000);

      const consoleErrors: string[] = [];
      const pageErrors: string[] = [];
      let currentCase = '';

      page.on('console', (message) => {
        const text = message.text();
        if (
          message.type() === 'error' &&
          !text.includes('Failed to load resource: the server responded with a status of 404')
        ) {
          consoleErrors.push(`${currentCase}: ${text}`);
        }
      });
      page.on('pageerror', (error) => {
        pageErrors.push(`${currentCase}: ${error.message}`);
      });

      await page.setViewportSize({ width: viewport.width, height: viewport.height });

      for (const route of layoutRoutes) {
        currentCase = `${viewport.name} ${route}`;
        const consoleStart = consoleErrors.length;
        const errorStart = pageErrors.length;

        await gotoApp(page, route);
        await disableMotion(page);
        await expect(page.locator('main')).toBeVisible();
        await scanViewportAtScrollPositions(page, currentCase);

        expect(pageErrors.slice(errorStart)).toEqual([]);
        expect(consoleErrors.slice(consoleStart)).toEqual([]);
      }
    });
  }
});

async function scanViewportAtScrollPositions(page: Page, label: string) {
  const positions = await page.evaluate(() => {
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    return Array.from(new Set([0, Math.floor(maxScroll / 2), maxScroll]));
  });

  for (const y of positions) {
    await page.evaluate((nextY) => window.scrollTo(0, nextY), y);
    await page.waitForTimeout(80);

    const audit = await page.evaluate(() => {
      const doc = document.documentElement;
      const body = document.body;
      const horizontalOverflow = Math.max(doc.scrollWidth, body.scrollWidth) - window.innerWidth;
      const visibleImages = Array.from(document.images).filter(isVisible);
      const brokenImages = visibleImages
        .filter((image) => image.currentSrc && image.complete && image.naturalWidth === 0)
        .map((image) => image.currentSrc);

      return {
        horizontalOverflow,
        brokenImages,
        coveredInteractive: findCoveredInteractiveElements(),
        clippedControls: findClippedControls(),
      };

      function isVisible(element: Element) {
        const rect = element.getBoundingClientRect();
        const style = window.getComputedStyle(element);
        return (
          rect.width > 0 &&
          rect.height > 0 &&
          rect.bottom > 0 &&
          rect.right > 0 &&
          rect.top < window.innerHeight &&
          rect.left < window.innerWidth &&
          style.display !== 'none' &&
          style.visibility !== 'hidden' &&
          style.opacity !== '0'
        );
      }

      function isFullyInsideViewport(element: Element) {
        const rect = element.getBoundingClientRect();
        return (
          rect.top >= 0 &&
          rect.left >= 0 &&
          rect.bottom <= window.innerHeight &&
          rect.right <= window.innerWidth
        );
      }

      function describe(element: Element) {
        const rect = element.getBoundingClientRect();
        const text = (element.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 80);
        const label =
          element.getAttribute('aria-label') ||
          element.getAttribute('data-tooltip') ||
          text ||
          element.getAttribute('href') ||
          element.getAttribute('name') ||
          element.id;
        const className =
          typeof element.className === 'string'
            ? element.className.split(/\s+/).filter(Boolean).slice(0, 3).join('.')
            : '';
        return `${element.tagName.toLowerCase()}${className ? `.${className}` : ''} "${label}" @ ${Math.round(rect.left)},${Math.round(rect.top)} ${Math.round(rect.width)}x${Math.round(rect.height)}`;
      }

      function findCoveredInteractiveElements() {
        const stickyHeaderBottom = Array.from(document.querySelectorAll('header'))
          .filter(isVisible)
          .reduce((bottom, header) => {
            const style = window.getComputedStyle(header);
            if (style.position !== 'sticky' && style.position !== 'fixed') {
              return bottom;
            }
            return Math.max(bottom, header.getBoundingClientRect().bottom);
          }, 0);

        return Array.from(
          document.querySelectorAll(
            'a[href], button, input, textarea, select, summary, [role="button"], [tabindex]:not([tabindex="-1"])',
          ),
        )
          .filter((element) => {
            const rect = element.getBoundingClientRect();
            const style = window.getComputedStyle(element);
            return (
              isVisible(element) &&
              isFullyInsideViewport(element) &&
              rect.width >= 12 &&
              rect.height >= 12 &&
              style.pointerEvents !== 'none' &&
              !element.hasAttribute('disabled') &&
              element.getAttribute('aria-hidden') !== 'true'
            );
          })
          .flatMap((element) => {
            const rect = element.getBoundingClientRect();
            const centerX = Math.min(
              window.innerWidth - 1,
              Math.max(1, rect.left + rect.width / 2),
            );
            const centerY = Math.min(
              window.innerHeight - 1,
              Math.max(1, rect.top + rect.height / 2),
            );
            if (
              stickyHeaderBottom > 0 &&
              centerY <= stickyHeaderBottom + 2 &&
              !element.closest('header')
            ) {
              return [];
            }

            const topElement = document.elementFromPoint(centerX, centerY);
            if (
              !topElement ||
              topElement === element ||
              element.contains(topElement) ||
              topElement.contains(element) ||
              topElement.closest('[data-gallery-dialog]') ||
              topElement.closest('[data-pagefind-ui-root]')?.contains(element)
            ) {
              return [];
            }

            return [`${describe(element)} covered by ${describe(topElement)}`];
          });
      }

      function findClippedControls() {
        return Array.from(
          document.querySelectorAll(
            'button, nav a, [data-radar-subnav], [data-cadence-filter], [data-month-filter], .theme-chip, .theme-button-soft, .theme-action-primary, .theme-action-secondary',
          ),
        )
          .filter((element) => {
            const style = window.getComputedStyle(element);
            const rect = element.getBoundingClientRect();
            return (
              isVisible(element) &&
              isFullyInsideViewport(element) &&
              rect.width >= 8 &&
              rect.height >= 8 &&
              style.overflow !== 'visible' &&
              !element.classList.contains('sr-only') &&
              !element.closest('[data-pagefind-ui-root]')
            );
          })
          .filter(
            (element) =>
              element.scrollWidth > element.clientWidth + 2 ||
              element.scrollHeight > element.clientHeight + 2,
          )
          .map(describe);
      }
    });

    expect(
      audit.horizontalOverflow,
      `${label} at scrollY ${y} has horizontal overflow`,
    ).toBeLessThanOrEqual(4);
    expect(audit.brokenImages, `${label} at scrollY ${y} has broken images`).toEqual([]);
    expect(audit.coveredInteractive, `${label} at scrollY ${y} has covered controls`).toEqual([]);
    expect(audit.clippedControls, `${label} at scrollY ${y} has clipped controls`).toEqual([]);
  }
}

async function disableMotion(page: Page) {
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-delay: 0s !important;
        animation-duration: 0s !important;
        caret-color: transparent !important;
        scroll-behavior: auto !important;
        transition-duration: 0s !important;
      }
    `,
  });
}
