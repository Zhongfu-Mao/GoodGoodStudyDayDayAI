import { expect, test, type Locator, type Page } from '@playwright/test';
import { appPath, appUrlPattern, gotoApp } from './site-test-utils';

const radarArchiveLayoutCases = [
  { path: '/radar/#daily', section: 'daily', countText: /\d+ 篇内容/ },
  { path: '/radar/#weekly', section: 'weekly', countText: /\d+ 篇内容/ },
  { path: '/radar/#monthly', section: 'monthly', countText: /\d+ 篇内容/ },
  { path: '/ja/radar/#daily', section: 'daily', countText: /\d+ 記事/ },
  { path: '/ja/radar/#weekly', section: 'weekly', countText: /\d+ 記事/ },
  { path: '/ja/radar/#monthly', section: 'monthly', countText: /\d+ 記事/ },
] as const;

async function expectSectionHasContentCount(section: Locator, countText: RegExp) {
  await expect(section).toContainText(countText);
  await expect(section.locator('[data-gallery-card]').first()).toBeVisible();
}

async function expectCardsToFitViewport(page: Page, sectionSelector: string) {
  const viewport = page.viewportSize();
  if (!viewport) {
    throw new Error('Expected a viewport size before checking radar card layout.');
  }

  const cards = page.locator(`${sectionSelector} [data-gallery-card]`);
  const cardCount = await cards.count();
  expect(cardCount).toBeGreaterThan(0);

  for (let index = 0; index < cardCount; index += 1) {
    const card = cards.nth(index);
    const box = await card.boundingBox();
    if (!box) {
      throw new Error(`Expected radar card ${index + 1} in ${sectionSelector} to have a layout box.`);
    }

    expect(box.x).toBeGreaterThanOrEqual(-1);
    expect(box.width).toBeLessThanOrEqual(viewport.width + 2);
    expect(box.x + box.width).toBeLessThanOrEqual(viewport.width + 1);
  }
}

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
    await expect(header.getByRole('link', { name: '首页' }).first()).toHaveAttribute(
      'data-tooltip',
      '回到总览：从最新内容和学习入口开始',
    );
    await expect(header.getByRole('link', { name: '新手起步' }).first()).toHaveAttribute(
      'data-tooltip',
      '从零起步：先选路线，再补概念',
    );

    await expect(page.locator('html')).toHaveAttribute('data-theme', /^(dark|light)$/);
    const initialTheme = await page.locator('html').getAttribute('data-theme');
    const nextTheme = initialTheme === 'light' ? 'dark' : 'light';

    const themeToggle = page.locator('[data-theme-toggle]');
    await expect(themeToggle).toHaveAttribute('data-tooltip', /切换到(深色|浅色)模式/);

    await themeToggle.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', nextTheme);
    await expect(themeToggle).toHaveAttribute('data-tooltip', /切换到(深色|浅色)模式/);

    const japaneseHomeLink = page.getByRole('link', { name: '日本語' });
    await expect(japaneseHomeLink).toHaveAttribute('data-tooltip', '用日语阅读当前页面');
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
    await expect(page.locator('article[data-pagefind-body]')).toContainText('本路线解决的核心问题');

    const languageSwitcher = page.locator('nav[aria-label="Language switcher"]');
    const japaneseLink = languageSwitcher.getByRole('link', { name: '日本語' });

    await expect(japaneseLink).toHaveAttribute('data-tooltip', '用日语阅读当前页面');
    await expect(japaneseLink).toHaveAttribute(
      'href',
      appPath('/ja/academy/openai-academy/00-overview/openai-academy-overview/'),
    );

    await japaneseLink.click();

    await expect(page).toHaveURL(appUrlPattern('/ja/academy/openai-academy/00-overview/openai-academy-overview/'));
    await expect(page.getByRole('heading', { level: 1, name: 'OpenAI Academyノート：学習ロードマップ全体像' })).toBeVisible();
    await expect(page.locator('article[data-pagefind-body]')).toContainText('本ロードマップが解決する課題');
  });

  test('start basics article stays out of AI Academy and offers next lesson navigation', async ({ page }) => {
    await gotoApp(page, '/start/ai-basics-for-everyone/what-is-ai-model-llm/');

    const courseNavigation = page.locator('[data-course-navigation]');
    const learningTrack = page.locator('aside section').filter({ hasText: '当前学习轨道文章列表。' });

    await expect(page.locator('article[data-pagefind-body]')).toContainText('新手起步');
    await expect(page.locator('article[data-pagefind-body]').locator('nav').first()).not.toContainText('AI Academy');
    await expect(learningTrack).toContainText('12');
    await expect(learningTrack.getByRole('link')).toHaveCount(12);
    await expect(courseNavigation).toBeVisible();
    await expect(courseNavigation.getByRole('heading', { name: '接着读下一节' })).toBeVisible();
    await expect(courseNavigation.getByRole('link', { name: /下一节: 提示词/ })).toHaveAttribute(
      'href',
      appPath('/start/ai-basics-for-everyone/what-is-prompt/'),
    );
    await expect(courseNavigation).not.toContainText('AI Basics for Everyone：提示词');

    await gotoApp(page, '/ja/start/ai-basics-for-everyone/what-is-ai-model-llm/');

    const japaneseCourseNavigation = page.locator('[data-course-navigation]');
    const japaneseLearningTrack = page.locator('aside section').filter({ hasText: '現在の学習トラックの記事一覧です。' });

    await expect(page.locator('article[data-pagefind-body]')).toContainText('はじめに');
    await expect(page.locator('article[data-pagefind-body]').locator('nav').first()).not.toContainText('AI Academy');
    await expect(japaneseLearningTrack).toContainText('12');
    await expect(japaneseLearningTrack.getByRole('link')).toHaveCount(12);
    await expect(japaneseCourseNavigation).toBeVisible();
    await expect(japaneseCourseNavigation.getByRole('heading', { name: '次のレッスンへ進む' })).toBeVisible();
    await expect(japaneseCourseNavigation.getByRole('link', { name: /次のレッスン: プロンプト/ })).toHaveAttribute(
      'href',
      appPath('/ja/start/ai-basics-for-everyone/what-is-prompt/'),
    );
  });

  test('start guide keeps in-page anchors and localized subpage links', async ({ page }) => {
    await gotoApp(page, '/start/');

    const basicsLink = page.getByRole('link', { name: '从基础系列开始' });
    const routeLink = page.getByRole('link', { name: '查看学习路线' });
    const basicsSection = page.locator('[data-start-panel="basics"]#ai-basics-for-everyone');
    const routeSection = page.locator('[data-start-panel="route"]#first-step');

    const startSubnavItems = page.locator('[data-start-subnav]');
    await expect(startSubnavItems).toHaveCount(5);
    await expect(
      startSubnavItems.evaluateAll((items) => items.map((item) => item.getAttribute('data-start-subnav'))),
    ).resolves.toEqual([
      '#start-route',
      '#ai-basics-for-everyone',
      '#start-layers',
      '#start-safety',
      '#start-faq',
    ]);
    await expect(startSubnavItems.first()).toHaveAttribute('data-tooltip', '先判断当前位置，安排 30/60/90 天学习节奏');
    await expect(page.locator('[data-start-subnav="#start-safety"]')).toHaveText('安全');
    await expect(page.locator('[data-start-panel="route"]#start-plan')).toBeVisible();
    await expect(basicsLink).toHaveAttribute('href', '#ai-basics-for-everyone');
    await expect(routeLink).toHaveAttribute('href', '#first-step');
    await expect(routeSection).toBeVisible();
    await expect(basicsSection).toBeHidden();

    await basicsLink.click();
    await expect(page).toHaveURL(appUrlPattern('/start/#ai-basics-for-everyone'));
    await expect(routeSection).toBeHidden();
    await expect(basicsSection).toBeVisible();
    await expect(basicsSection.getByRole('heading', { name: /AI Basics for Everyone/ })).toHaveCount(0);
    await expect(basicsSection.getByText('AI Basics for Everyone').first()).toBeVisible();

    await page.locator('[data-start-subnav="#start-layers"]').click();
    await expect(page).toHaveURL(appUrlPattern('/start/#start-layers'));
    await expect(page.locator('[data-start-panel="map"]#start-layers')).toBeVisible();
    await expect(page.getByRole('link', { name: '阅读完整指南 →' }).first()).toHaveAttribute(
      'href',
      appPath('/start/layers/'),
    );

    await gotoApp(page, '/start/layers/');
    await expect(page.getByRole('heading', { level: 1, name: '看懂 AI 的 6 个能力层' })).toBeVisible();

    const languageSwitcher = page.locator('nav[aria-label="Language switcher"]');
    await expect(languageSwitcher.getByRole('link', { name: '日本語' })).toHaveAttribute(
      'href',
      appPath('/ja/start/layers/'),
    );

    await gotoApp(page, '/ja/start/layers/');
    await expect(page.getByRole('heading', { level: 1, name: 'AI の 6 つの能力レイヤー' })).toBeVisible();
    await expect(page.getByRole('link', { name: '← スタートガイドに戻る' })).toHaveAttribute(
      'href',
      appPath('/ja/start/'),
    );
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
    const monthlySection = page.locator('[data-radar-section]#monthly');
    const monthlyNav = page.locator('[data-radar-subnav="#monthly"]');

    await expect(dailySection).toBeVisible();
    await expect(weeklySection).toBeHidden();
    await expect(weeklyNav).toHaveAttribute('data-tooltip', /按周复盘/);

    await weeklyNav.click();

    await expect(page).toHaveURL(/#weekly$/);
    await expect(dailySection).toBeHidden();
    await expect(weeklySection).toBeVisible();
    await expect(weeklyNav).toHaveAttribute('aria-current', 'page');
    await expectSectionHasContentCount(weeklySection, /\d+ 篇内容/);
    await expect(weeklySection).toContainText('AI 雷达周报：2026-04-07 至 2026-04-13');
    await expect(weeklySection).toContainText('AI 雷达周报：2026-04-01 至 2026-04-07');
    await expect(weeklySection).not.toContainText('AI 周报：RAG 检索质量新基准与 Agent 观测性演进');
    await expect(weeklySection).not.toContainText('AI 雷达周报：Agent 运行时架构与门控模型时代的到来');

    await monthlyNav.click();
    await expect(page).toHaveURL(/#monthly$/);
    await expect(weeklySection).toBeHidden();
    await expect(monthlySection).toBeVisible();
    await expectSectionHasContentCount(monthlySection, /\d+ 篇内容/);
    await expect(monthlySection).not.toContainText('月度趋势研判：AI 工具链与部署生态的深层演进');

    await gotoApp(page, '/ja/radar/#weekly');
    const japaneseWeeklySection = page.locator('[data-radar-section]#weekly');
    await expect(japaneseWeeklySection).toBeVisible();
    await expectSectionHasContentCount(japaneseWeeklySection, /\d+ 記事/);
    await expect(japaneseWeeklySection).toContainText('AI レーダー週報：2026-04-07 〜 2026-04-13');
    await expect(japaneseWeeklySection).toContainText('AI レーダー週報：2026-04-01 〜 2026-04-07');
    await expect(japaneseWeeklySection).not.toContainText('週刊 AI 動向：RAG 検索精度の新基準と Agent オブザーバビリティの進化');

    await gotoApp(page, '/ja/radar/#monthly');
    const japaneseMonthlySection = page.locator('[data-radar-section]#monthly');
    await expect(japaneseMonthlySection).toBeVisible();
    await expectSectionHasContentCount(japaneseMonthlySection, /\d+ 記事/);
    await expect(japaneseMonthlySection).not.toContainText('月次トレンド分析：AI ツールチェーンとデプロイエコシステムの変遷');
    await expect(
      japaneseMonthlySection.locator(
        `img[src="${appPath('/images/radar/monthly-ai-radar-2026-04.ja-infographic.png')}"]`,
      ),
    ).toBeVisible();
  });

  test('radar archive cards stay inside the viewport across locales and cadences', async ({ page }) => {
    await page.setViewportSize({ width: 721, height: 963 });

    for (const layoutCase of radarArchiveLayoutCases) {
      await gotoApp(page, layoutCase.path);

      const section = page.locator(`[data-radar-section]#${layoutCase.section}`);
      await expect(section).toBeVisible();
      await expect(section).toContainText(layoutCase.countText);
      await expectCardsToFitViewport(page, `[data-radar-section]#${layoutCase.section}`);
    }

    await gotoApp(page, '/ja/radar/#weekly');
    const japaneseWeeklyHref = appPath('/ja/radar/weekly-ai-radar-2026-04-01-to-2026-04-07/');
    const japaneseWeeklyImageSrc = appPath('/images/radar/weekly-ai-radar-2026-04-01-to-2026-04-07.ja-infographic.png');
    const japaneseWeeklyImage = page.locator(
      `[data-radar-section]#weekly a[href="${japaneseWeeklyHref}"] img[src="${japaneseWeeklyImageSrc}"]`,
    );
    await expect(japaneseWeeklyImage).toBeVisible();
    await expect(
      page.locator(
        `[data-radar-section]#weekly a[href="${japaneseWeeklyHref}"].radar-visual-placeholder`,
      ),
    ).toHaveCount(0);
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
