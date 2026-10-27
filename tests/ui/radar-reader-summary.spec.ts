import fs from 'node:fs';
import { test, expect } from '@playwright/test';
import { gotoApp } from './site-test-utils';
import { parseRadarV2 } from '../../scripts/lib/radar-format.mjs';

for (const lang of ['zh', 'ja']) {
  test(`${lang} radar opening describes the edition rather than a figure`, async ({ page }) => {
    const slug = 'daily-ai-radar-2026-10-26';
    const source = fs.readFileSync(`src/content/radar/${slug}${lang === 'ja' ? '.ja' : ''}.md`, 'utf8');
    const report = parseRadarV2(source);
    const firstLead = report.highlights.match(/^- \[([^\n]+)\]/m)![1];
    await gotoApp(page, `${lang === 'ja' ? '/ja' : ''}/radar/${slug}/`);
    const card = page.getByRole('heading', { name: lang === 'ja' ? 'まず一言で' : '先看这句', exact: true }).locator('..');
    await expect(card).toContainText(firstLead.slice(0, 60));
    await expect(card).not.toContainText(lang === 'ja' ? '左の長い画像' : '左为完整长图');
  });
}
