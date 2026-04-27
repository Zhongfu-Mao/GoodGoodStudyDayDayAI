import { expect, test } from '@playwright/test';
import { appPath, appUrlPattern, gotoApp } from './site-test-utils';

test.describe('published site UI', () => {
  test('home page renders core navigation, theme toggle, and Japanese switch', async ({ page }) => {
    await gotoApp(page, '/');

    await expect(page.locator('html')).toHaveAttribute('lang', 'zh');
    await expect(
      page.getByRole('heading', { level: 1, name: /^(学 AI 不迷路，用 AI 有方法|一份 AI 学习与实践笔记)$/ }),
    ).toBeVisible();

    const header = page.locator('header');
    for (const label of ['首页', '新手起步', 'AI 雷达', 'AI Academy', '工程实践', '底层原理']) {
      await expect(header.getByRole('link', { name: label }).first()).toBeVisible();
    }

    await expect(page.locator('html')).toHaveAttribute('data-theme', /^(dark|light)$/);
    const initialTheme = await page.locator('html').getAttribute('data-theme');
    const nextTheme = initialTheme === 'light' ? 'dark' : 'light';

    const themeToggle = page.locator('[data-theme-toggle]');
    await expect(themeToggle).toHaveAttribute('data-tooltip', /切换到(深色|浅色)模式/);

    await themeToggle.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', nextTheme);
    await expect(themeToggle).toHaveAttribute('data-tooltip', /切换到(深色|浅色)模式/);

    const japaneseHomeLink = page.getByRole('link', { name: '日本語' });
    await expect(japaneseHomeLink).toHaveAttribute('data-tooltip', '切换到日本語');
    await japaneseHomeLink.click();

    await expect(page).toHaveURL(appUrlPattern('/ja/'));
    await expect(page.locator('html')).toHaveAttribute('lang', 'ja');
    await expect(
      page.getByRole('heading', { level: 1, name: /^(迷わず学び、使える形へ|AI 学習と実践のノート)$/ }),
    ).toBeVisible();
    await expect(page.locator('[data-aquarium-toggle]')).toHaveAttribute('data-tooltip', /アクアリウムは/);
  });

  test('academy article keeps localized sibling links and article chrome', async ({ page }) => {
    await gotoApp(page, '/academy/openai-academy/00-overview/openai-academy-overview/');

    await expect(page.getByRole('heading', { level: 1, name: 'OpenAI Academy 笔记：学习路线总览' })).toBeVisible();
    await expect(page.locator('article[data-pagefind-body]')).toContainText('这条路线解决什么问题');

    const languageSwitcher = page.locator('nav[aria-label="Language switcher"]');
    const japaneseLink = languageSwitcher.getByRole('link', { name: '日本語' });

    await expect(japaneseLink).toHaveAttribute('data-tooltip', '切换到日本語');
    await expect(japaneseLink).toHaveAttribute(
      'href',
      appPath('/ja/academy/openai-academy/00-overview/openai-academy-overview/'),
    );

    await japaneseLink.click();

    await expect(page).toHaveURL(appUrlPattern('/ja/academy/openai-academy/00-overview/openai-academy-overview/'));
    await expect(page.getByRole('heading', { level: 1, name: 'OpenAI Academyノート：学習ルート全体' })).toBeVisible();
    await expect(page.locator('article[data-pagefind-body]')).toContainText('学習の要点');
  });

  test('Japanese radar header stays compact and localized on desktop', async ({ page, isMobile }) => {
    test.skip(isMobile, 'desktop header layout only');

    await page.setViewportSize({ width: 1366, height: 768 });
    await gotoApp(page, '/ja/radar/');

    const header = page.locator('header');
    const siteNav = header.locator('[data-site-nav]:visible');
    const headerSearch = header.locator('form[role="search"] input[name="q"]:visible').first();

    await expect(siteNav.getByRole('link', { name: 'ホーム', exact: true })).toBeVisible();
    await expect(siteNav.getByRole('link', { name: 'はじめに', exact: true })).toBeVisible();
    await expect(siteNav.getByRole('link', { name: 'AI レーダー', exact: true })).toBeVisible();
    await expect(siteNav.getByRole('link', { name: '実践', exact: true })).toBeVisible();
    await expect(siteNav.getByRole('link', { name: '基礎', exact: true })).toBeVisible();
    await expect(headerSearch).toHaveAttribute('placeholder', '検索…');
    await expect(page.locator('[data-radar-subnav="#weekly"]')).toHaveText('週次');

    const navBox = await siteNav.boundingBox();
    expect(navBox?.height).toBeLessThan(58);
  });

  test('radar archive switches cadence sections in the browser', async ({ page }) => {
    await gotoApp(page, '/radar/');

    const dailySection = page.locator('[data-radar-section]#daily');
    const weeklySection = page.locator('[data-radar-section]#weekly');
    const weeklyNav = page.locator('[data-radar-subnav="#weekly"]');

    await expect(dailySection).toBeVisible();
    await expect(weeklySection).toBeHidden();
    await expect(weeklyNav).toHaveAttribute('data-tooltip', /切换到.+视图/);

    await weeklyNav.click();

    await expect(page).toHaveURL(/#weekly$/);
    await expect(dailySection).toBeHidden();
    await expect(weeklySection).toBeVisible();
    await expect(weeklyNav).toHaveAttribute('aria-current', 'page');
  });

  test('radar image wall filters cards and opens the preview dialog', async ({ page }) => {
    await gotoApp(page, '/radar/gallery/');

    const cards = page.locator('[data-gallery-card]');
    await expect(cards.first()).toBeVisible();

    const totalCards = await cards.count();
    expect(totalCards).toBeGreaterThan(0);

    const weeklyFilter = page.locator('[data-cadence-filter="weekly"]');
    await expect(weeklyFilter).toHaveAttribute('data-tooltip', /只看.+图报/);
    await weeklyFilter.click();
    await expect(weeklyFilter).toHaveAttribute('aria-pressed', 'true');

    const monthFilterTooltip = page.locator('[data-month-filter-tooltip]');
    await expect(monthFilterTooltip).toHaveClass(/ui-tooltip-bottom/);
    await expect(monthFilterTooltip).toHaveAttribute('data-tooltip', '按月份筛选图报');
    await expect(page.locator('[data-month-filter]')).not.toHaveAttribute('title', /./);

    const visibleCards = page.locator('[data-gallery-card]:not([hidden])');
    await expect.poll(() => visibleCards.count()).toBeGreaterThan(0);
    expect(await visibleCards.count()).toBeLessThanOrEqual(totalCards);

    const previewTrigger = visibleCards.locator('[data-preview-trigger]').first();
    await expect(previewTrigger).toHaveClass(/ui-tooltip-inset-top/);
    await expect(previewTrigger).toHaveAttribute('data-tooltip', /预览大图：/);
    await expect(previewTrigger).not.toHaveAttribute('title', /./);

    await previewTrigger.click();

    const dialog = page.locator('[data-gallery-dialog]');
    await expect(dialog).toHaveAttribute('open', '');
    await expect(dialog.locator('[data-dialog-title]')).not.toHaveText('');
    await expect(dialog.locator('[data-dialog-image]')).toHaveAttribute('src', /\/images\/radar\//);
    await expect(dialog.locator('[data-dialog-close]')).toHaveAttribute('data-tooltip', '关闭预览');
    await expect(page.locator('.ui-tooltip[title]')).toHaveCount(0);

    await dialog.locator('[data-dialog-close]').click();
    await expect(dialog).not.toHaveAttribute('open', '');
  });

  test('site search form submits and Pagefind applies the query', async ({ page }) => {
    await gotoApp(page, '/');

    const searchBox = page.locator('form[role="search"] input[name="q"]:visible').first();
    await searchBox.fill('OpenAI');
    await searchBox.press('Enter');

    await expect(page).toHaveURL(appUrlPattern('/search/'));
    expect(new URL(page.url()).searchParams.get('q')).toBe('OpenAI');

    const searchRoot = page.locator('[data-pagefind-ui-root]');

    await expect(searchRoot).toHaveAttribute('data-pagefind-ready', 'true', { timeout: 15_000 });
    await expect(searchRoot.getByRole('textbox')).toHaveValue('OpenAI');
    await expect(searchRoot.locator('.pagefind-ui__search-clear')).toHaveAttribute('data-tooltip', '清除搜索关键词');
    await expect(searchRoot.locator('.pagefind-ui__result').first()).toBeVisible({ timeout: 15_000 });
  });

  test('radar audio mini-player button opens and closes the persistent player', async ({ page }) => {
    await gotoApp(page, '/radar/daily-ai-radar-2026-04-26/');

    const player = page.locator('[data-global-audio-player]');
    await expect(player).toBeHidden();

    const miniPlayerButton = page.getByRole('button', { name: '在全站播放器中播放音频' });
    await expect(miniPlayerButton).toHaveAttribute('data-tooltip', '在全站播放器中播放音频');

    await miniPlayerButton.click();

    await expect(player).toBeVisible();
    await expect(player.locator('[data-audio-title]')).toContainText('AI 雷达日报：2026-04-26');
    await expect(player).toHaveAttribute('data-playback-state', /^(playing|paused)$/);
    await expect(player.locator('[data-audio-toggle]')).toHaveAttribute('data-tooltip', /^(播放|暂停)$/);
    await expect(player.locator('[data-audio-close]')).toHaveAttribute('data-tooltip', '关闭播放器');

    await player.getByRole('button', { name: '关闭播放器' }).click();
    await expect(player).toBeHidden();
  });
});
