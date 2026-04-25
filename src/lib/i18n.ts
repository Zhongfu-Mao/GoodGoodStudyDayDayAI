import type { Locale } from './site';

export function localeTag(locale: Locale) {
  return locale === 'ja' ? 'ja-JP' : 'zh-CN';
}

export function formatDate(date: Date, locale: Locale, options?: Intl.DateTimeFormatOptions) {
  return date.toLocaleDateString(localeTag(locale), options);
}

export const baseLayout = {
  zh: {
    taglineLines: ['清风明月，陪你记录 AI 学习的脉络与', '实践的所得，也聆听时代的潮声。'],
  },
  ja: {
    taglineLines: ['清風明月とともに、AI の学びの流れを追い、', '実践の発見と時代の潮目を記録する。'],
  },
} as const;

export const siteNav = {
  zh: { home: '首页', search: '搜索', searchPlaceholder: '搜索内容…', searchSubmit: '提交搜索' },
  ja: { home: 'ホーム', search: '検索', searchPlaceholder: '検索…', searchSubmit: '検索を実行' },
} as const;

export const searchPage = {
  zh: {
    title: '搜索',
    description: '在全站文章中检索关键字。',
    placeholder: '搜索关键字…',
    zeroResults: '没有找到匹配的内容。',
  },
  ja: {
    title: '検索',
    description: 'サイト全体の記事をキーワードで検索できます。',
    placeholder: 'キーワードを入力…',
    zeroResults: '一致するコンテンツが見つかりませんでした。',
  },
} as const;

export const languageSwitcher = {
  zh: { zh: '中文', ja: '日本語' },
  ja: { zh: '中文', ja: '日本語' },
} as const;

export const homePage = {
  zh: {
    eyebrow: 'Good Good Study, Day Day AI',
    title: '记录 AI 学习与实践，追踪变化。',
    description: '以 Markdown 为核心，持续整理双语文章、AI 雷达与课程笔记。',
    featured: '精选文章',
    latest: '最新文章',
    tags: '标签',
    sideNote: '按标签快速浏览全部内容。',
    tagIndexCta: '查看标签总览',
    updates: '最近更新',
    heroCta: '查看最新文章',
    recentVisuals: '最近图报',
    recentVisualsCta: '查看图片墙',
  },
  ja: {
    eyebrow: 'Good Good Study, Day Day AI',
    title: 'AI の学習と実践を記録し、変化を追う。',
    description: 'Markdown をベースに、二言語の記事、AI Radar、講座ノートを継続的に整理します。',
    featured: '注目記事',
    latest: '最新記事',
    tags: 'タグ',
    sideNote: 'タグから全体を横断して読めます。',
    tagIndexCta: 'タグ一覧を見る',
    updates: '最近更新',
    heroCta: '最新記事へ',
    recentVisuals: '最近の図解',
    recentVisualsCta: 'Image Wall へ',
  },
} as const;

export const categoryPage = {
  zh: {
    lead: '按主题浏览文章。',
    browse: '本分区文章列表。',
    empty: '本分区暂无内容。',
    radarLead: '先看图，再进入原文；按 Daily、Weekly、Monthly 浏览全部更新。',
    radarBrowse: '日、周、月都以图卡优先呈现，想深挖再打开原文。',
    radarGallery: '图片墙',
    radarGalleryHint: '当前列表也采用图卡优先；总览页提供筛选和大图预览。',
    radarArchive: '归档',
    radarArchiveNote: (label: string) => `${label} 图卡流`,
    radarEmpty: '该分组暂无内容。',
    defaultListNote: '这里汇总了本分区文章。',
    academyLead: '按课程系列和模块浏览 AI Academy。',
    academyBrowse: '课程系列与模块列表。',
    academySeries: '课程系列',
    academyModule: '模块',
    academyTrack: '学习轨道',
    academyLegacy: '其他 Academy 笔记',
    moduleCount: (count: number) => `${count} 个模块`,
    trackCount: (count: number) => `${count} 个学习轨道`,
    itemCount: (count: number) => `${count} 篇内容`,
  },
  ja: {
    lead: 'テーマごとに記事を一覧できます。',
    browse: 'この区分の一覧です。',
    empty: 'この区分にはまだ記事がありません。',
    radarLead: 'まず図解で眺め、気になるものを原文へ。Daily / Weekly / Monthly ごとに一覧できます。',
    radarBrowse: 'Daily / Weekly / Monthly を、図解カード優先で並べています。',
    radarGallery: 'Image Wall',
    radarGalleryHint: 'この一覧も図解カード優先です。Overview では絞り込みと大きなプレビューを使えます。',
    radarArchive: 'Archive',
    radarArchiveNote: (label: string) => `${label} visual flow`,
    radarEmpty: 'まだ記事がありません。',
    defaultListNote: 'この区分の記事を一覧しています。',
    academyLead: 'AI Academy をシリーズとモジュールごとに一覧できます。',
    academyBrowse: 'シリーズとモジュールの一覧です。',
    academySeries: 'シリーズ',
    academyModule: 'モジュール',
    academyTrack: '学習トラック',
    academyLegacy: 'その他の Academy ノート',
    moduleCount: (count: number) => `${count} モジュール`,
    trackCount: (count: number) => `${count} トラック`,
    itemCount: (count: number) => `${count} 記事`,
  },
} as const;

export const radarGalleryPage = {
  zh: {
    title: 'AI 雷达图片墙',
    description: '像刷图一样浏览每日 AI 主线。先看图，想深挖再进原文。',
    eyebrow: 'Visual Radar',
    countLabel: '张图',
    backToRadar: '返回 AI 雷达',
    openArticle: '打开原文',
    previewImage: '预览大图',
    closePreview: '关闭预览',
    filters: '筛选',
    allCadences: '全部',
    allMonths: '全部月份',
    monthFilter: '月份',
    countHint: '当前筛选下显示的图片数 / 图片墙总数',
    visibleCount: (visible: number, total: number) => `显示 ${visible} / 共 ${total} 张`,
    empty: '还没有可展示的雷达图。',
    noMatches: '没有符合筛选条件的雷达图。',
    coverAlt: (title: string) => `${title} 的信息图`,
  },
  ja: {
    title: 'AI Radar Image Wall',
    description: '画像から AI Radar の流れをざっと眺め、気になったものだけ記事へ進めます。',
    eyebrow: 'Visual Radar',
    countLabel: 'images',
    backToRadar: 'AI Radar へ戻る',
    openArticle: '記事を開く',
    previewImage: '画像をプレビュー',
    closePreview: 'プレビューを閉じる',
    filters: 'Filter',
    allCadences: 'All',
    allMonths: 'すべての月',
    monthFilter: '月',
    countHint: 'Images visible with the current filters / total images',
    visibleCount: (visible: number, total: number) => `Showing ${visible} / ${total} images`,
    empty: '表示できる Radar 画像はまだありません。',
    noMatches: '条件に合う Radar 画像はありません。',
    coverAlt: (title: string) => `${title} のインフォグラフィック`,
  },
} as const;

export const postDetailPage = {
  zh: {
    home: '首页',
    quickJump: '快速导航',
    openCategory: '查看分区',
    openCategoryHintAcademy: '返回 AI Academy 目录',
    openCategoryHintDefault: '返回当前分区',
    openArchiveRadar: '查看完整归档',
    openArchiveDefault: '查看完整列表',
    openArchiveHintRadar: '查看全部历史内容。',
    openArchiveHintDefault: '查看完整列表。',
    timeline: '继续阅读',
    timelineHintAcademy: '同模块前后内容。',
    timelineHintDefault: '上一篇与下一篇。',
    newerEntry: '较新一篇',
    olderEntry: '较早一篇',
    noNewerEntry: '已经是这一组里最新的一篇。',
    noOlderEntry: '已经到这一组里最早的一篇。',
    sameSeriesAcademy: '模块导航',
    sameSeriesHintAcademy: '当前学习轨道文章列表。',
    sameSeriesHintMonth: '当前月份文章列表。',
    currentArticle: '当前',
    tableOfContents: '本文目录',
    tableOfContentsHint: '快速跳到正文中的主要段落。',
    learningTrack: '学习轨道',
    courseContext: '课程信息',
    courseEntry: '课程链接',
    courseEntryCta: '打开课程页面',
    prerequisites: '前置知识',
    noPrerequisites: '没有额外前置要求。',
    audioBriefingEyebrow: 'Audio Briefing',
    audioBriefingTitle: '音频解读',
    audioOpen: '打开音频',
    slideDeckEyebrow: 'Slide Deck',
    slideDeckTitle: '演示文稿',
    slideDeckOpen: '打开文稿',
  },
  ja: {
    home: 'ホーム',
    quickJump: 'クイックナビ',
    openCategory: '区分ページへ',
    openCategoryHintAcademy: 'AI Academy の目次へ戻る',
    openCategoryHintDefault: 'この区分の一覧へ戻る',
    openArchiveRadar: '完全アーカイブを見る',
    openArchiveDefault: '一覧を見る',
    openArchiveHintRadar: '履歴全体を表示します。',
    openArchiveHintDefault: '一覧ページを表示します。',
    timeline: '続けて読む',
    timelineHintAcademy: '同じモジュール内の前後コンテンツです。',
    timelineHintDefault: '前後の記事です。',
    newerEntry: '新しい側',
    olderEntry: '古い側',
    noNewerEntry: 'このグループでは最も新しい記事です。',
    noOlderEntry: 'このグループでは最も古い記事です。',
    sameSeriesAcademy: 'モジュールナビ',
    sameSeriesHintAcademy: '現在の学習トラックの記事一覧です。',
    sameSeriesHintMonth: '今月分の記事一覧です。',
    currentArticle: '現在地',
    tableOfContents: '目次',
    tableOfContentsHint: '本文の主要セクションへ移動します。',
    learningTrack: '学習トラック',
    courseContext: 'Course Info',
    courseEntry: '講座ページ',
    courseEntryCta: '講座ページを開く',
    prerequisites: '前提知識',
    noPrerequisites: '特別な前提条件はありません。',
    audioBriefingEyebrow: 'Audio Briefing',
    audioBriefingTitle: '音声解説',
    audioOpen: '音声を開く',
    slideDeckEyebrow: 'Slide Deck',
    slideDeckTitle: '演示資料',
    slideDeckOpen: '資料を開く',
  },
} as const;

export const tagIndexPage = {
  zh: { title: '标签总览', description: '按标签浏览全部文章。' },
  ja: { title: 'タグ一覧', description: 'タグごとに記事を一覧できます。' },
} as const;

export const tagDetailPage = {
  zh: { title: '标签', back: '返回标签总览', empty: '该标签下暂无文章。' },
  ja: { title: 'タグ', back: 'タグ一覧に戻る', empty: 'このタグの記事はまだありません。' },
} as const;
