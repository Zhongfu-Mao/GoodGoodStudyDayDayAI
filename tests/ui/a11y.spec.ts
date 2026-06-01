import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { gotoApp } from './site-test-utils';

const a11yPages = [
  { name: 'home', path: '/' },
  { name: 'radar gallery', path: '/radar/gallery/', timeout: 90_000 },
  {
    name: 'academy detail',
    path: '/academy/openai-academy/00-overview/openai-academy-overview/',
  },
] as const;

test.describe('accessibility smoke checks', () => {
  for (const pageCase of a11yPages) {
    test(`${pageCase.name} has no serious axe violations`, async ({ page }, testInfo) => {
      if ('timeout' in pageCase) {
        testInfo.setTimeout(pageCase.timeout);
      }

      await gotoApp(page, pageCase.path);

      await expect(page.locator('main')).toBeVisible();

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();
      const blockingViolations = results.violations.filter(
        (violation) => violation.impact === 'serious' || violation.impact === 'critical',
      );

      expect(blockingViolations).toEqual([]);
    });
  }
});
