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

async function expectSectionCardsMatchCadence(
  section: Locator,
  cadence: 'daily' | 'weekly' | 'monthly',
) {
  const cards = section.locator('[data-gallery-card]');
  const cardCount = await cards.count();
  expect(cardCount).toBeGreaterThan(0);

  const cadences = await cards.evaluateAll((items) =>
    items.map((item) => item.getAttribute('data-cadence')),
  );
  expect(cadences, `Expected all visible radar cards to use ${cadence} cadence.`).toEqual(
    Array(cardCount).fill(cadence),
  );
}

async function expectSectionHasLocaleInfographic(section: Locator, locale: 'zh' | 'ja') {
  const image = section.locator('[data-gallery-card] img[src*="/images/radar/"]').first();
  await expect(image).toHaveCount(1);
  const src = await image.getAttribute('src');
  expect(src).toBeTruthy();

  if (locale === 'ja') {
    expect(src).toMatch(/\/images\/radar\/.+\.ja-infographic\.webp/);
    return;
  }

  await expect(image).toHaveAttribute('src', /\/images\/radar\/.+-infographic\.webp/);
  expect(src).not.toContain('.ja-infographic');
}

async function expectCardsToFitViewport(page: Page, sectionSelector: string) {
  const viewport = page.viewportSize();
  if (!viewport) {
    throw new Error('Expected a viewport size before checking radar card layout.');
  }

  const cards = page.locator(`${sectionSelector} [data-gallery-card]`);
  const boxes = await cards.evaluateAll((items) =>
    items.map((item, index) => {
      const box = item.getBoundingClientRect();
      return {
        index,
        width: box.width,
        x: box.x,
      };
    }),
  );
  expect(boxes.length).toBeGreaterThan(0);

  for (const box of boxes) {
    expect(box.x, `Expected radar card ${box.index + 1} in ${sectionSelector} to stay in view.`)
      .toBeGreaterThanOrEqual(-1);
    expect(box.width).toBeLessThanOrEqual(viewport.width + 2);
    expect(box.x + box.width).toBeLessThanOrEqual(viewport.width + 1);
  }
}

async function expectArticleBodyContrast(page: Page, minimumRatio: number) {
  const result = await page.locator('.theme-prose').evaluate((prose) => {
    type Rgba = { r: number; g: number; b: number; a: number };

    function parseColor(value: string): Rgba | null {
      const hex = value.trim().match(/^#([0-9a-f]{6})$/i);
      if (hex) {
        return {
          r: Number.parseInt(hex[1].slice(0, 2), 16),
          g: Number.parseInt(hex[1].slice(2, 4), 16),
          b: Number.parseInt(hex[1].slice(4, 6), 16),
          a: 1,
        };
      }

      const match = value.match(/rgba?\(([^)]+)\)/);
      if (!match) return null;

      const parts = match[1]
        .trim()
        .split(/\s*,\s*|\s+\/\s+|\s+/)
        .map((part) => Number.parseFloat(part));
      if (parts.length < 3 || parts.some((part) => Number.isNaN(part))) return null;

      return {
        r: parts[0],
        g: parts[1],
        b: parts[2],
        a: parts[3] ?? 1,
      };
    }

    function luminance(color: Rgba) {
      const channels = [color.r, color.g, color.b].map((channel) => {
        const normalized = channel / 255;
        return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
      });

      return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
    }

    function contrastRatio(foreground: Rgba, background: Rgba) {
      const foregroundLum = luminance(foreground);
      const backgroundLum = luminance(background);
      const lighter = Math.max(foregroundLum, backgroundLum);
      const darker = Math.min(foregroundLum, backgroundLum);
      return (lighter + 0.05) / (darker + 0.05);
    }

    const rootStyle = getComputedStyle(document.documentElement);
    const themeBackground = parseColor(rootStyle.getPropertyValue('--theme-page-bg').trim()) ??
      parseColor(rootStyle.backgroundColor) ?? { r: 2, g: 6, b: 23, a: 1 };

    const proseStyle = getComputedStyle(prose);

    function proseColorPropertyFor(element: Element) {
      const property = element.matches('h1, h2, h3, h4, th')
        ? '--tw-prose-headings'
        : element.matches('a')
          ? '--tw-prose-links'
          : element.matches('strong')
            ? '--tw-prose-bold'
            : '--tw-prose-body';

      return property;
    }

    const candidates = [...prose.querySelectorAll('p, li, h2, h3, strong, a')]
      .filter((element) => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return (
          rect.width > 0 &&
          rect.height > 0 &&
          style.visibility !== 'hidden' &&
          style.display !== 'none' &&
          (element.textContent ?? '').trim().length >= 8
        );
      })
      .slice(0, 24);

    const samples = candidates.map((element) => {
      const style = getComputedStyle(element);
      const property = proseColorPropertyFor(element);
      const fallbackValue = proseStyle.getPropertyValue(property).trim();
      const color = parseColor(style.color) ?? parseColor(fallbackValue);
      if (!color) {
        return {
          text: (element.textContent ?? '').trim().slice(0, 80),
          contrast: 0,
          color: style.color,
          fallback: `${property}: ${fallbackValue}`,
        };
      }

      return {
        text: (element.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 80),
        contrast: contrastRatio(color, themeBackground),
        color: style.color,
        fallback: `${property}: ${fallbackValue}`,
      };
    });

    return {
      count: samples.length,
      minimum: Math.min(...samples.map((sample) => sample.contrast)),
      weakest: samples.sort((a, b) => a.contrast - b.contrast).at(0),
    };
  });

  expect(result.count).toBeGreaterThan(0);
  expect(
    result.minimum,
    `Weakest article contrast ${result.minimum.toFixed(2)} for "${result.weakest?.text ?? ''}" (${result.weakest?.color ?? 'no color'}; ${result.weakest?.fallback ?? 'no fallback'})`,
  ).toBeGreaterThanOrEqual(minimumRatio);
}

async function gotoFirstRadarArticle(
  page: Page,
  locale: 'zh' | 'ja' = 'zh',
  cadence: 'daily' | 'weekly' | 'monthly' = 'daily',
) {
  await gotoApp(page, `${locale === 'ja' ? '/ja' : ''}/radar/#${cadence}`);

  const section = page.locator(`[data-radar-section]#${cadence}`);
  await expect(section).toBeVisible();
  const firstArticleLink = section.locator('[data-gallery-card] a[href]').first();
  await expect(firstArticleLink).toBeVisible();
  const href = await firstArticleLink.getAttribute('href');
  expect(href).toBeTruthy();
  await page.goto(href!, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('article[data-pagefind-body]')).toBeVisible({ timeout: 20_000 });
}

test.describe('published site UI', () => {
  test('home page renders core navigation, theme toggle, and Japanese switch', async ({ page }) => {
    await gotoApp(page, '/');

    await expect(page.locator('html')).toHaveAttribute('lang', 'zh');
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: /^(学 AI 不迷路，用 AI 有方法|看懂 AI 变化，把 AI 用起来|AI 变化，读懂就能用)$/,
      }),
    ).toBeVisible();

    const header = page.locator('header');
    for (const label of ['首页', '新手起步', 'AI 雷达', 'AI 学院', '工程实践', '底层原理']) {
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
    await expect(page.getByRole('link', { name: '进入 AI 雷达入口' })).toHaveAttribute(
      'href',
      appPath('/radar/'),
    );
    await expect(page.locator('a').filter({ hasText: '看 AI 雷达' }).first()).toHaveAttribute(
      'href',
      appPath('/radar/'),
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
      page.getByRole('heading', {
        level: 1,
        name: /^(迷わず学び、使える形へ|AI の変化を読み解き、日常で使える形にする|AI の変化を、使える形へ)$/,
      }),
    ).toBeVisible();
    await expect(page.locator('[data-aquarium-toggle]')).toHaveAttribute(
      'data-tooltip',
      /アクアリウムは/,
    );
  });

  test('academy article keeps localized sibling links and article chrome', async ({ page }) => {
    await gotoApp(page, '/academy/openai-academy/00-overview/openai-academy-overview/');

    await expect(
      page.getByRole('heading', { level: 1, name: 'OpenAI Academy 笔记：学习路线总览' }),
    ).toBeVisible();
    await expect(page.locator('article[data-pagefind-body]')).toContainText('本路线解决的核心问题');

    const languageSwitcher = page.locator('nav[aria-label="Language switcher"]');
    const japaneseLink = languageSwitcher.getByRole('link', { name: '日本語' });

    await expect(japaneseLink).toHaveAttribute('data-tooltip', '用日语阅读当前页面');
    await expect(japaneseLink).toHaveAttribute(
      'href',
      appPath('/ja/academy/openai-academy/00-overview/openai-academy-overview/'),
    );

    await japaneseLink.click();

    await expect(page).toHaveURL(
      appUrlPattern('/ja/academy/openai-academy/00-overview/openai-academy-overview/'),
    );
    await expect(
      page.getByRole('heading', { level: 1, name: 'OpenAI Academyノート：学習ロードマップ全体像' }),
    ).toBeVisible();
    await expect(page.locator('article[data-pagefind-body]')).toContainText(
      '本ロードマップが解決する課題',
    );
  });

  test('article body stays readable in dark mode', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('ggsdda-theme', 'dark');
    });

    await gotoFirstRadarArticle(page);

    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(page.locator('.theme-prose')).toBeVisible();
    await expectArticleBodyContrast(page, 4.5);
  });

  test('start basics article stays out of AI Academy and offers next lesson navigation', async ({
    page,
  }) => {
    await gotoApp(page, '/start/ai-basics-for-everyone/what-is-ai-model-llm/');

    const courseNavigation = page.locator('[data-course-navigation]');
    const learningTrack = page
      .locator('aside section')
      .filter({ hasText: '当前学习轨道文章列表。' });

    await expect(page.locator('article[data-pagefind-body]')).toContainText('新手起步');
    await expect(
      page.locator('article[data-pagefind-body]').locator('nav').first(),
    ).not.toContainText('AI Academy');
    await expect(learningTrack).toContainText(/\d+/);
    expect(await learningTrack.getByRole('link').count()).toBeGreaterThan(0);
    await expect(courseNavigation).toBeVisible();
    await expect(courseNavigation.getByRole('heading', { name: '接着读下一节' })).toBeVisible();
    await expect(courseNavigation.getByRole('link', { name: /下一节: 提示词/ })).toHaveAttribute(
      'href',
      appPath('/start/ai-basics-for-everyone/what-is-prompt/'),
    );
    await expect(courseNavigation).not.toContainText('AI Basics for Everyone：提示词');

    await gotoApp(page, '/ja/start/ai-basics-for-everyone/what-is-ai-model-llm/');

    const japaneseCourseNavigation = page.locator('[data-course-navigation]');
    const japaneseLearningTrack = page
      .locator('aside section')
      .filter({ hasText: '現在の学習トラックの記事一覧です。' });

    await expect(page.locator('article[data-pagefind-body]')).toContainText('はじめに');
    await expect(
      page.locator('article[data-pagefind-body]').locator('nav').first(),
    ).not.toContainText('AI Academy');
    await expect(japaneseLearningTrack).toContainText(/\d+/);
    expect(await japaneseLearningTrack.getByRole('link').count()).toBeGreaterThan(0);
    await expect(japaneseCourseNavigation).toBeVisible();
    await expect(
      japaneseCourseNavigation.getByRole('heading', { name: '次のレッスンへ進む' }),
    ).toBeVisible();
    await expect(
      japaneseCourseNavigation.getByRole('link', { name: /次のレッスン: プロンプト/ }),
    ).toHaveAttribute('href', appPath('/ja/start/ai-basics-for-everyone/what-is-prompt/'));
  });

  test('start guide keeps in-page anchors and localized subpage links', async ({ page }) => {
    await gotoApp(page, '/start/');

    const basicsLink = page.getByRole('link', { name: '从基础系列开始' });
    const routeLink = page.getByRole('link', { name: '查看学习路线' });
    const basicsSection = page.locator('[data-start-panel="basics"]#ai-basics-for-everyone');
    const routeSection = page.locator('[data-start-panel="route"]#first-step');

    const startSubnavItems = page.locator('[data-start-subnav]');
    await expect(startSubnavItems).toHaveCount(9);
    await expect(
      startSubnavItems.evaluateAll((items) =>
        items.map((item) => item.getAttribute('data-start-subnav')),
      ),
    ).resolves.toEqual([
      '#start-route',
      '#first-step',
      '#start-first-day',
      '#start-plan',
      '#ai-basics-for-everyone',
      '#start-layers',
      '#start-landscape',
      '#start-safety',
      '#start-faq',
    ]);
    await expect(startSubnavItems.first()).toHaveAttribute(
      'data-tooltip',
      '先判断当前位置，安排 30/60/90 天学习节奏',
    );
    await expect(page.locator('[data-start-subnav="#start-safety"]')).toHaveText('安全');
    await expect(page.locator('[data-start-subnav="#start-first-day"]')).toHaveAttribute(
      'role',
      'tab',
    );
    await expect(page.locator('[data-start-panel="route"]#start-first-day')).toBeVisible();
    await expect(page.locator('[data-start-panel="route"]#start-plan')).toBeVisible();
    await expect(basicsLink).toHaveAttribute('href', '#ai-basics-for-everyone');
    await expect(routeLink).toHaveAttribute('href', '#first-step');
    await expect(routeSection).toBeVisible();
    await expect(basicsSection).toBeHidden();

    await basicsLink.click();
    await expect(page).toHaveURL(appUrlPattern('/start/#ai-basics-for-everyone'));
    await expect(routeSection).toBeHidden();
    await expect(basicsSection).toBeVisible();
    await expect(
      basicsSection.getByRole('heading', { name: /AI Basics for Everyone/ }),
    ).toHaveCount(0);
    await expect(basicsSection.getByText('AI Basics for Everyone').first()).toBeVisible();

    await page.locator('[data-start-subnav="#start-layers"]').click();
    await expect(page).toHaveURL(appUrlPattern('/start/#start-layers'));
    await expect(page.locator('[data-start-panel="map"]#start-layers')).toBeVisible();
    await expect(page.locator('[data-start-subnav="#start-layers"]')).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await expect(page.getByRole('link', { name: '阅读完整指南 →' }).first()).toHaveAttribute(
      'href',
      appPath('/start/layers/'),
    );

    await gotoApp(page, '/start/layers/');
    await expect(
      page.getByRole('heading', { level: 1, name: '看懂 AI 的 6 个能力层' }),
    ).toBeVisible();

    const languageSwitcher = page.locator('nav[aria-label="Language switcher"]');
    await expect(languageSwitcher.getByRole('link', { name: '日本語' })).toHaveAttribute(
      'href',
      appPath('/ja/start/layers/'),
    );

    await gotoApp(page, '/ja/start/layers/');
    await expect(
      page.getByRole('heading', { level: 1, name: 'AI の 6 つの能力レイヤー' }),
    ).toBeVisible();
    await expect(page.getByRole('link', { name: '← スタートガイドに戻る' })).toHaveAttribute(
      'href',
      appPath('/ja/start/'),
    );
  });

  test('home page gives one recommendation and compact quick links instead of duplicate use cases', async ({
    page,
  }) => {
    await gotoApp(page, '/ja/');

    await expect(page.getByRole('heading', { level: 2, name: '今日のおすすめ' })).toBeVisible();
    await expect(page.locator('[data-home-recommendation]')).toHaveCount(1);
    await expect(page.locator('[data-home-quick-link]')).toHaveCount(4);
    await expect(page.getByText('USE CASES', { exact: true })).toHaveCount(0);
    await expect(page.getByRole('link', { name: /RSS/ }).first()).toHaveAttribute(
      'href',
      appPath('/ja/rss.xml'),
    );
  });

  test('mobile home hero keeps the first screen compact', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'mobile density check only runs on the mobile project');

    await gotoApp(page, '/ja/');

    const hero = page.locator('.home-hero');
    const heroBox = await hero.boundingBox();
    expect(heroBox?.height ?? 0).toBeLessThanOrEqual(500);
    await expect(
      page.getByRole('heading', {
        level: 2,
        name: '3 つの入口から、今の状態に合わせて入る',
      }),
    ).toBeInViewport({ ratio: 0.2 });
  });

  test('post cards collapse dense tag lists into one primary tag', async ({ page }) => {
    await gotoApp(page, '/ja/engineering/');

    const firstCard = page.locator('[data-post-card]').first();
    await expect(firstCard).toBeVisible();
    await expect(firstCard.locator('[data-card-primary-tag]')).toHaveCount(1);
    await expect(firstCard.locator('[data-card-tag-overflow]')).toHaveText('+2');
  });

  test('reduced motion removes shared UI transitions', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await gotoApp(page, '/ja/');

    const transitionDuration = await page.locator('.theme-panel-link').first().evaluate((element) =>
      getComputedStyle(element).transitionDuration,
    );
    expect(transitionDuration).toMatch(/^(0s,\s*)*0s$/);
  });

  test('Japanese radar header stays compact and localized on desktop', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'desktop header layout only');

    await page.setViewportSize({ width: 1366, height: 768 });
    await gotoApp(page, '/ja/radar/');

    const header = page.locator('header');
    const siteNav = header.locator('[data-site-nav]:visible');
    const headerSearch = header.locator('form[role="search"] input[name="q"]:visible').first();

    await expect(siteNav.getByRole('link', { name: 'ホーム', exact: true })).toBeVisible();
    await expect(siteNav.getByRole('link', { name: 'はじめに', exact: true })).toBeVisible();
    await expect(siteNav.getByRole('link', { name: 'AI レーダー', exact: true })).toBeVisible();
    await expect(siteNav.getByRole('link', { name: 'AIアカデミー', exact: true })).toBeVisible();
    await expect(siteNav.getByRole('link', { name: '実践', exact: true })).toBeVisible();
    await expect(siteNav.getByRole('link', { name: '基礎', exact: true })).toBeVisible();
    await expect(headerSearch).toHaveAttribute('placeholder', '検索…');
    await expect(page.locator('[data-radar-subnav="#weekly"]')).toHaveText('週報');
    await expect(page.locator('header a[href$="/ja/radar/gallery/"]')).toHaveCount(0);

    const navBox = await siteNav.boundingBox();
    expect(navBox?.height).toBeLessThan(58);
  });

  test('radar archive switches cadence sections in the browser', async ({ page }) => {
    await gotoApp(page, '/radar/');

    await expect(page.getByRole('heading', { level: 1, name: 'AI 雷达入口' })).toBeVisible();
    await expect(page.locator('[data-radar-hub]')).toContainText(
      '日报看最新，周报看脉络，月报看趋势，图片墙适合快速浏览',
    );
    await expect(page.locator('[data-radar-hub-card]')).toHaveCount(4);
    await expect(page.locator('[data-radar-hub-card]').nth(0)).toHaveAttribute(
      'data-radar-hub-card',
      'daily',
    );
    await expect(page.locator('[data-radar-hub-card]').nth(3)).toHaveAttribute(
      'data-radar-hub-card',
      'gallery',
    );
    await expect(page.locator('[data-radar-hub-card="gallery"]')).toHaveAttribute(
      'href',
      appPath('/radar/gallery/'),
    );
    await expect(page.locator('[data-radar-hub-card="daily"]')).toContainText('日报');
    await expect(page.getByRole('heading', { level: 2, name: '按周期浏览' })).toHaveCount(0);
    await expect(page.locator('header a[href$="/radar/gallery/"]')).toHaveCount(0);

    const dailySection = page.locator('[data-radar-section]#daily');
    const weeklySection = page.locator('[data-radar-section]#weekly');
    const weeklyNav = page.locator('[data-radar-subnav="#weekly"]');
    const monthlySection = page.locator('[data-radar-section]#monthly');
    const monthlyNav = page.locator('[data-radar-subnav="#monthly"]');

    await expect(dailySection).toBeHidden();
    await expect(weeklySection).toBeHidden();
    await expect(weeklyNav).toHaveAttribute('data-tooltip', /按周复盘/);

    await page.locator('[data-radar-hub-card="daily"]').click();
    await expect(page).toHaveURL(/#daily$/);
    await expect(page.locator('[data-radar-hub]')).toBeHidden();
    await expect(dailySection).toBeVisible();

    await weeklyNav.click();

    await expect(page).toHaveURL(/#weekly$/);
    await expect(page.locator('[data-radar-hub]')).toBeHidden();
    await expect(dailySection).toBeHidden();
    await expect(weeklySection).toBeVisible();
    await expect(weeklyNav).toHaveAttribute('role', 'tab');
    await expect(weeklyNav).toHaveAttribute('aria-selected', 'true');
    await expect(weeklyNav).not.toHaveAttribute('aria-current', /./);
    await expectSectionHasContentCount(weeklySection, /\d+ 篇内容/);
    await expectSectionCardsMatchCadence(weeklySection, 'weekly');

    await monthlyNav.click();
    await expect(page).toHaveURL(/#monthly$/);
    await expect(page.locator('[data-radar-hub]')).toBeHidden();
    await expect(weeklySection).toBeHidden();
    await expect(monthlySection).toBeVisible();
    await expectSectionHasContentCount(monthlySection, /\d+ 篇内容/);
    await expectSectionCardsMatchCadence(monthlySection, 'monthly');

    await gotoApp(page, '/ja/radar/#weekly');
    await expect(page.locator('[data-radar-hub]')).toBeHidden();
    await expect(page.getByRole('heading', { level: 2, name: '周期で見る' })).toHaveCount(0);
    const japaneseWeeklySection = page.locator('[data-radar-section]#weekly');
    await expect(japaneseWeeklySection).toBeVisible();
    await expectSectionHasContentCount(japaneseWeeklySection, /\d+ 記事/);
    await expectSectionCardsMatchCadence(japaneseWeeklySection, 'weekly');

    await gotoApp(page, '/ja/radar/#monthly');
    const japaneseMonthlySection = page.locator('[data-radar-section]#monthly');
    await expect(japaneseMonthlySection).toBeVisible();
    await expectSectionHasContentCount(japaneseMonthlySection, /\d+ 記事/);
    await expectSectionCardsMatchCadence(japaneseMonthlySection, 'monthly');
    await expectSectionHasLocaleInfographic(japaneseMonthlySection, 'ja');
  });

  test('topic and category pages expose cross-cut distribution and lightweight filters', async ({
    page,
  }) => {
    await gotoApp(page, '/ja/topics/agents/');

    const distribution = page.locator('[data-topic-distribution]');
    await expect(distribution).toBeVisible();
    await expect(distribution.locator('[data-topic-distribution-item]')).toHaveCount(5);
    await expect(distribution).toContainText(/AI レーダー\s+\d+ 件/);
    await expect(distribution).toContainText(/AI Academy\s+\d+ 件/);
    await expect(distribution).toContainText(/実践\s+\d+ 件/);
    await expect(distribution).toContainText(/基礎\s+\d+ 件/);

    await gotoApp(page, '/ja/engineering/');

    await expect(page.getByRole('heading', { level: 2, name: /実践 \(\d+ 記事\)/ })).toBeVisible();
    const filters = page.locator('[data-category-filter]');
    await expect(filters.first()).toBeVisible();
    await expect(filters.first()).toHaveAttribute('aria-pressed', 'true');

    const filteredCards = page.locator('[data-category-card]:not([hidden])');
    const totalCards = await filteredCards.count();
    expect(totalCards).toBeGreaterThan(1);

    const specificFilter = filters.nth(1);
    const filterTag = await specificFilter.getAttribute('data-category-filter');
    expect(filterTag).toBeTruthy();
    await specificFilter.click();
    await expect(specificFilter).toHaveAttribute('aria-pressed', 'true');
    await expect.poll(() => filteredCards.count()).toBeGreaterThan(0);
    expect(await filteredCards.count()).toBeLessThanOrEqual(totalCards);
    await expect(
      page.locator(`[data-category-card]:not([hidden])[data-card-tags*="|${filterTag}|"]`).first(),
    ).toBeVisible();

    await gotoApp(page, '/ja/foundations/');
    expect(await page.locator('[data-category-filter]').count()).toBeGreaterThan(1);
    await expect(page.getByRole('heading', { level: 3, name: /^Transformer/ }).first()).toBeVisible();
    await expect(page.getByRole('heading', { level: 3, name: /AI Developer Core：/ })).toHaveCount(0);
  });

  test('radar podcast guide is linked from the radar navigation', async ({ page }) => {
    await gotoApp(page, '/radar/#daily');

    const podcastGuideLink = page.locator('[data-podcast-guide-link]:visible');
    await expect(podcastGuideLink).toHaveAttribute('href', appPath('/radar/podcast/'));
    await expect(podcastGuideLink).toHaveText(/RSS/);

    await podcastGuideLink.click();
    await expect(page).toHaveURL(appUrlPattern('/radar/podcast/'));
    await expect(
      page.getByRole('heading', { level: 1, name: '在 Apple Podcasts 订阅 AI 雷达' }),
    ).toBeVisible();
    await expect(page.locator('[data-feed-url="zh"]')).toContainText(
      'https://zhongfu-mao.github.io/GoodGoodStudyDayDayAI/feed.xml',
    );
    await expect(page.getByRole('heading', { level: 2, name: 'iPhone 上的添加路径' })).toBeVisible();

    await gotoApp(page, '/ja/radar/#daily');
    const japanesePodcastGuideLink = page.locator('[data-podcast-guide-link]:visible');
    await expect(japanesePodcastGuideLink).toHaveAttribute('href', appPath('/ja/radar/podcast/'));

    await japanesePodcastGuideLink.click();
    await expect(page).toHaveURL(appUrlPattern('/ja/radar/podcast/'));
    await expect(
      page.getByRole('heading', { level: 1, name: 'Apple Podcasts で AI レーダーを購読する' }),
    ).toBeVisible();
    await expect(page.locator('[data-feed-url="ja"]')).toContainText(
      'https://zhongfu-mao.github.io/GoodGoodStudyDayDayAI/ja/feed.xml',
    );
  });

  test('mobile radar header leaves room for content', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'mobile header layout only');

    await gotoApp(page, '/radar/');

    const headerBox = await page.locator('header').boundingBox();
    expect(headerBox?.height).toBeLessThan(260);
    await expect(page.locator('header form[role="search"]:visible')).toHaveCount(0);
    await expect(page.locator('[data-mobile-search-link]')).toHaveAttribute(
      'href',
      appPath('/search/'),
    );
    await expect(page.getByRole('heading', { level: 1, name: 'AI 雷达入口' })).toBeVisible();
  });

  test('radar archive cards stay inside the viewport across locales and cadences', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 721, height: 963 });

    for (const layoutCase of radarArchiveLayoutCases) {
      await gotoApp(page, layoutCase.path);

      const section = page.locator(`[data-radar-section]#${layoutCase.section}`);
      await expect(section).toBeVisible();
      await expect(section).toContainText(layoutCase.countText);
      await expectCardsToFitViewport(page, `[data-radar-section]#${layoutCase.section}`);
    }

    await gotoApp(page, '/ja/radar/#weekly');
    const japaneseWeeklySection = page.locator('[data-radar-section]#weekly');
    await expectSectionHasLocaleInfographic(japaneseWeeklySection, 'ja');
    await expect(japaneseWeeklySection.locator('.radar-visual-placeholder')).toHaveCount(0);
  });

  test('radar image wall filters cards and opens the preview dialog', async ({ page }) => {
    await gotoApp(page, '/radar/gallery/');

    const cards = page.locator('[data-gallery-card]');
    await expect(cards.first()).toBeVisible();
    await expect(page.locator('[data-gallery-grid]')).toHaveClass(/radar-wall/);
    await expect(page.locator('[data-topic-filter]').first()).toBeVisible();
    await expect(page.getByText('快速筛选')).toBeVisible();

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

    const topicAllFilter = page.locator('[data-topic-filter="all"]');
    const topicFilters = page.locator('[data-topic-filter]:not([data-topic-filter="all"])');
    const topicFilterCount = await topicFilters.count();
    if (topicFilterCount > 0) {
      await page.locator('[data-cadence-filter="all"]').click();
      const firstTopicFilter = topicFilters.first();
      await expect(firstTopicFilter).not.toHaveClass(/ui-tooltip/);
      await expect(firstTopicFilter).not.toHaveAttribute('data-tooltip', /./);
      await firstTopicFilter.click();
      await expect(firstTopicFilter).toHaveAttribute('aria-pressed', 'true');
      await expect(firstTopicFilter).toHaveClass(/radar-topic-chip-active/);
      await expect(topicAllFilter).toHaveAttribute('aria-pressed', 'false');
      await expect(topicAllFilter).not.toHaveClass(/radar-topic-chip-active/);
      await expect.poll(() => visibleCards.count()).toBeGreaterThan(0);

      if (topicFilterCount > 1) {
        const secondTopicFilter = topicFilters.nth(1);
        await secondTopicFilter.click();
        await expect(firstTopicFilter).toHaveAttribute('aria-pressed', 'true');
        await expect(secondTopicFilter).toHaveAttribute('aria-pressed', 'true');
        await expect(secondTopicFilter).toHaveClass(/radar-topic-chip-active/);

        await firstTopicFilter.click();
        await expect(firstTopicFilter).toHaveAttribute('aria-pressed', 'false');
        await expect(firstTopicFilter).not.toHaveClass(/radar-topic-chip-active/);
        await expect(secondTopicFilter).toHaveAttribute('aria-pressed', 'true');
      }

      await topicAllFilter.click();
      await expect(topicAllFilter).toHaveAttribute('aria-pressed', 'true');
      await expect(topicAllFilter).toHaveClass(/radar-topic-chip-active/);
    }

    const previewTrigger = visibleCards.locator('[data-preview-trigger]').first();
    await expect(previewTrigger).not.toHaveClass(/ui-tooltip/);
    await expect(previewTrigger).not.toHaveAttribute('data-tooltip', /./);
    await expect(previewTrigger).not.toHaveAttribute('title', /./);
    await expect(previewTrigger.locator('span')).toHaveCount(0);

    await previewTrigger.click();

    const dialog = page.locator('[data-gallery-dialog]');
    await expect(dialog).toHaveAttribute('open', '');
    await expect(dialog).toHaveClass(/radar-gallery-dialog/);
    await expect(dialog.locator('[data-dialog-title]')).toHaveCount(0);
    await expect(dialog.locator('[data-dialog-image]')).toHaveAttribute('src', /\/images\/radar\//);
    await expect(dialog.locator('[data-dialog-close]')).not.toHaveAttribute('data-tooltip', /./);
    const dialogBox = await dialog.boundingBox();
    const viewport = page.viewportSize();
    expect(dialogBox?.x).toBeLessThanOrEqual(1);
    expect(dialogBox?.y).toBeLessThanOrEqual(1);
    expect(dialogBox?.width ?? 0).toBeGreaterThanOrEqual((viewport?.width ?? 0) - 2);
    expect(dialogBox?.height ?? 0).toBeGreaterThanOrEqual((viewport?.height ?? 0) - 2);
    await expect(page.locator('.ui-tooltip[title]')).toHaveCount(0);

    await dialog.locator('[data-dialog-close]').click();
    await expect(dialog).not.toHaveAttribute('open', '');
  });

  test('radar detail media stays in-page for image and deck previews', async ({ page }) => {
    await gotoFirstRadarArticle(page, 'zh', 'daily');

    await expect(page.getByText('打开音频', { exact: true })).toHaveCount(0);
    await expect(page.getByRole('button', { name: '在全站播放器中播放音频' })).toBeVisible();

    const coverPreviewTrigger = page.locator('[data-cover-preview-trigger]');
    await expect(coverPreviewTrigger).toHaveCount(1);
    await coverPreviewTrigger.click();

    const coverDialog = page.locator('[data-cover-preview-dialog]');
    await expect(coverDialog).toHaveAttribute('open', '');
    await expect(coverDialog.locator('[data-cover-preview-image]')).toHaveAttribute(
      'src',
      /\/images\/radar\/.+-infographic\.webp/,
    );
    await coverDialog.getByRole('button', { name: '关闭全屏' }).click();
    await expect(coverDialog).not.toHaveAttribute('open', '');

    await gotoFirstRadarArticle(page, 'zh', 'weekly');
    const weeklyUrl = page.url();

    const deckPreviewTrigger = page.getByRole('button', { name: '预览文稿' });
    await expect(deckPreviewTrigger).toBeVisible();
    await expect(page.locator('article[data-pagefind-body] a[href$=".pdf"]')).toHaveCount(0);
    await deckPreviewTrigger.click();

    const deckDialog = page.locator('[data-deck-preview-dialog]');
    await expect(deckDialog).toHaveAttribute('open', '');
    await expect(deckDialog.locator('[data-deck-preview-canvas]')).toBeVisible();
    await expect
      .poll(async () =>
        deckDialog.locator('[data-deck-preview-canvas]').evaluate((canvas) => {
          const element = canvas as HTMLCanvasElement;
          return element.width > 300 && element.height > 150;
        }),
      )
      .toBe(true);
    const canvasBox = await deckDialog.locator('[data-deck-preview-canvas]').boundingBox();
    expect(canvasBox?.width ?? 0).toBeGreaterThan(300);
    expect(canvasBox?.height ?? 0).toBeGreaterThan(150);
    await expect(deckDialog.locator('[data-deck-page-status]')).toHaveText(/\d+ \/ \d+/);
    await expect(page).toHaveURL(weeklyUrl);
  });

  test('radar detail secondary navigation opens archive cadences', async ({ page }) => {
    await gotoFirstRadarArticle(page, 'zh', 'daily');

    const weeklySubnav = page.locator('[data-radar-subnav="#weekly"]');
    await expect(weeklySubnav).toHaveAttribute('href', appPath('/radar/#weekly'));
    await weeklySubnav.click();

    await expect(page).toHaveURL(appUrlPattern('/radar/#weekly'));
    await expect(page.locator('[data-radar-section]#weekly')).toBeVisible();
    await expect(page.locator('[data-radar-section]#daily')).toBeHidden();

    const monthlySubnav = page.locator('[data-radar-subnav="#monthly"]');
    await monthlySubnav.click();

    await expect(page).toHaveURL(appUrlPattern('/radar/#monthly'));
    await expect(page.locator('[data-radar-section]#monthly')).toBeVisible();
    await expect(page.locator('[data-radar-section]#weekly')).toBeHidden();
  });

  test('site search form submits and Pagefind applies the query', async ({ page }) => {
    await gotoApp(page, '/');

    const headerSearchForm = page.locator('form[role="search"]:visible');
    const hasHeaderSearchForm = (await headerSearchForm.count()) > 0;
    if (hasHeaderSearchForm) {
      const form = headerSearchForm.first();
      await form.locator('input[name="q"]').fill('OpenAI');
      await Promise.all([
        page.waitForURL(appUrlPattern('/search/')),
        form.evaluate((element) => (element as HTMLFormElement).requestSubmit()),
      ]);

      await expect(page).toHaveURL(appUrlPattern('/search/'));
      expect(new URL(page.url()).searchParams.get('q')).toBe('OpenAI');
    } else {
      const mobileSearchLink = page.locator('[data-mobile-search-link]:visible');
      await expect(mobileSearchLink).toHaveAttribute('href', appPath('/search/'));
      await mobileSearchLink.click();
      await expect(page).toHaveURL(appUrlPattern('/search/'));
    }

    const searchRoot = page.locator('[data-pagefind-ui-root]');

    await expect(searchRoot).toHaveAttribute('data-pagefind-ready', 'true', { timeout: 15_000 });
    const pagefindInput = searchRoot.getByRole('textbox');
    if (!hasHeaderSearchForm) {
      await pagefindInput.fill('OpenAI');
    }
    await expect(pagefindInput).toHaveValue('OpenAI');
    await expect(searchRoot.locator('.pagefind-ui__search-clear')).toHaveAttribute(
      'data-tooltip',
      '清除搜索关键词',
    );
    await expect(searchRoot.locator('.pagefind-ui__result').first()).toBeVisible({
      timeout: 15_000,
    });
  });

  test('radar audio mini-player button opens and closes the persistent player', async ({
    page,
  }) => {
    await gotoFirstRadarArticle(page);

    const player = page.locator('[data-global-audio-player]');
    await expect(player).toBeHidden();
    const articleTitle = await page.locator('article[data-pagefind-body] h1').innerText();

    const miniPlayerButton = page.getByRole('button', { name: '在全站播放器中播放音频' });
    await expect(miniPlayerButton).toHaveAttribute('data-tooltip', '在全站播放器中播放音频');

    await miniPlayerButton.click();

    await expect(player).toBeVisible();
    await expect(player.locator('[data-audio-title]')).toContainText(articleTitle);
    await expect(player).toHaveAttribute('data-playback-state', /^(playing|paused)$/);
    await expect(player.locator('[data-audio-toggle]')).toHaveAttribute(
      'data-tooltip',
      /^(播放|暂停)$/,
    );
    await expect(player.locator('[data-audio-close]')).toHaveAttribute(
      'data-tooltip',
      '关闭播放器',
    );

    await player.getByRole('button', { name: '关闭播放器' }).click();
    await expect(player).toBeHidden();
  });
});
