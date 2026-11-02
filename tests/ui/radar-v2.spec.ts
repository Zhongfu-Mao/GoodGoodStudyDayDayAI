import fs from 'node:fs';
import { test, expect } from '@playwright/test';
import { appPath, gotoApp } from './site-test-utils';
import { parseRadarV2 } from '../../scripts/lib/radar-format.mjs';

const preview = process.env.RADAR_PREVIEW_DRAFTS === '1' && !process.env.CI;

test.describe('radar V2 local draft preview', () => {
  test.skip(!preview, 'Run only against the explicit local draft build');
  for (const lang of ['zh', 'ja']) {
    test(`${lang} keeps stories, anchors and images within the Pages base path`, async ({
      page,
    }, testInfo) => {
      const slug = 'daily-ai-radar-2026-10-20';
      const source = fs.readFileSync(
        `src/content/radar/${slug}${lang === 'ja' ? '.ja' : ''}.md`,
        'utf8',
      );
      const doc = parseRadarV2(source);
      await gotoApp(page, `${lang === 'ja' ? '/ja' : ''}/radar/${slug}/`);
      const article = page.locator('.theme-prose');
      await expect(article.locator('h3')).toHaveCount(doc.items.length);
      for (const item of doc.items)
        await expect(article.locator(`#radar-${item.id}`)).toHaveCount(1);
      const links = article.locator('a[href^="#radar-"]');
      await expect(links).toHaveCount([...doc.highlights.matchAll(/\(#radar-/g)].length);
      await links.first().scrollIntoViewIfNeeded();
      await page.screenshot({ path: testInfo.outputPath(`radar-v2-${lang}-viewport.png`) });
      await links.first().click();
      await expect(page).toHaveURL(/#radar-multilang$/);
      const images = article.locator('img');
      expect(await images.count()).toBeGreaterThanOrEqual(3);
      for (const image of await images.all()) {
        await image.scrollIntoViewIfNeeded();
        await expect
          .poll(() => image.evaluate((img) => (img as HTMLImageElement).naturalWidth))
          .toBeGreaterThan(0);
      }
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
      ).toBe(true);
      await page.screenshot({ path: testInfo.outputPath(`radar-v2-${lang}.png`), fullPage: true });
    });
    test(`${lang} shows a short edition without padding highlights`, async ({ page }) => {
      const slug = 'daily-ai-radar-2026-10-26';
      const doc = parseRadarV2(fs.readFileSync(
        `src/content/radar/${slug}${lang === 'ja' ? '.ja' : ''}.md`, 'utf8',
      ));
      await gotoApp(page, `${lang === 'ja' ? '/ja' : ''}/radar/${slug}/`);
      const article = page.locator('.theme-prose');
      await expect(article.locator('h2').first()).toHaveText(
        lang === 'ja' ? '今日の重要な変化' : '本期重点',
      );
      const targets = [...doc.highlights.matchAll(/\(#(radar-[a-z0-9-]+)\)/g)].map(m => m[1]);
      const links = article.locator('a[href^="#radar-"]');
      await expect(links).toHaveCount(targets.length);
      for (const target of targets) await expect(article.locator(`#${target}`)).toHaveCount(1);
      await expect(article).toContainText(lang === 'ja' ? '著者の説明' : '作者说明');
      await links.first().click();
      expect(new URL(page.url()).hash).toBe(`#${targets[0]}`);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
    });
    test(`${lang} local audio uses the same base path`, async ({ page, request }) => {
      const suffix = lang === 'ja' ? '.ja.md' : '.md';
      const sample = fs.readdirSync('src/content/radar').sort().find((file) => {
        if (!/^daily-ai-radar-\d{4}-\d{2}-\d{2}(?:\.ja)?\.md$/.test(file)) return false;
        if (file.endsWith('.ja.md') !== (lang === 'ja')) return false;
        const source = fs.readFileSync(`src/content/radar/${file}`, 'utf8');
        const meta = parseRadarV2(source).meta;
        return meta.radarFormat === 2 && meta.draft === true &&
          meta.audioUrl === `/__radar-preview/audio/${file.replace(/\.md$/, '.mp3')}` &&
          fs.existsSync(`tmp/radar-v2/preview-media/audio/${file.replace(/\.md$/, '.mp3')}`);
      });
      test.skip(
        !sample,
        'No local draft audio sample is available; published remote audio is tested separately',
      );
      const source = fs.readFileSync(`src/content/radar/${sample!}`, 'utf8');
      const slug = sample!.slice(0, -suffix.length);
      await gotoApp(page, `${lang === 'ja' ? '/ja' : ''}/radar/${slug}/`);
      const briefing = page.locator('[data-audio-briefing]');
      await expect(briefing).toHaveCount(1);
      const url = await briefing.getAttribute('data-audio-src');
      expect(url).toContain(appPath('/__radar-preview/audio/'));
      const response = await request.get(url!, { headers: { Range: 'bytes=0-1023' } });
      expect(response.ok()).toBe(true);
      expect(response.headers()['content-type']).toContain('audio/mpeg');
      await briefing.locator('[data-audio-play-trigger]').click();
      const player = page.locator('[data-global-audio-player]');
      const audio = player.locator('[data-global-audio]');
      await expect(player).toBeVisible();
      await expect(audio).toHaveJSProperty('src', new URL(url!, page.url()).href);
      await expect
        .poll(() => audio.evaluate((el) => (el as HTMLAudioElement).currentTime))
        .toBeGreaterThan(0);
      const expectedDuration = Number(parseRadarV2(source).meta.audioDuration);
      expect(
        await audio.evaluate(
          (el, duration) => Math.abs((el as HTMLAudioElement).duration - duration),
          expectedDuration,
        ),
      ).toBeLessThan(1);
      expect(await audio.evaluate((el) => (el as HTMLAudioElement).error)).toBeNull();
      await player.locator('[data-audio-toggle]').click();
      await expect.poll(() => audio.evaluate((el) => (el as HTMLAudioElement).paused)).toBe(true);
      await player.locator('[data-audio-close]').click();
      await expect(player).toBeHidden();
    });
  }
});
