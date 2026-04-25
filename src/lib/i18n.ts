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
    eyebrow: 'AI Learning Atlas',
    title: 'Good Good Study, Day Day AI',
    description: '把每日 AI 变化、系统课程、工程实践和底层原理整理成一张可持续学习的地图。没时间先看图，想深挖再读原文。',
    featured: '精选文章',
    latest: '最新文章',
    tags: '标签',
    sideNote: '按标签快速浏览全部内容。',
    tagIndexCta: '查看标签总览',
    updates: '最近更新',
    heroCta: '从 AI 雷达开始',
    heroSecondaryCta: '看图片墙',
    contentUnit: '篇内容',
    visualUnit: '张图报',
    tagUnit: '个标签',
    routesTitle: '四条入口，覆盖从速览到深学',
    routesDescription: '你可以把这里当作 AI 学习雷达、课程笔记库、工程实践手册和基础知识索引。',
    routeCta: '进入分区',
    routes: {
      radar: {
        title: 'AI 雷达',
        description: 'Daily / Weekly / Monthly 跟踪 AI 主线，图卡优先，适合快速建立当天或本周的全局感。',
      },
      academy: {
        title: 'AI Academy',
        description: '系统整理 OpenAI、Anthropic 等课程内容，把零散材料沉淀成可复习的学习笔记。',
      },
      engineering: {
        title: '工程实践',
        description: '记录工具链、自动化、云基础设施与真实落地问题，让 AI 能进入日常工作流。',
      },
      foundations: {
        title: '底层原理',
        description: '补齐数学、数据、模型和系统基础，避免只追热点却看不懂结构变化。',
      },
    },
    useTitle: '按你的时间和目标来用',
    useDescription: '这个站不是只给一种读法。可以碎片速览，也可以沿着主题一路深挖。',
    useCases: [
      { label: '没时间', description: '先刷 AI 雷达图片墙，用几分钟抓住最近主线。' },
      { label: '想系统学', description: '从 AI Academy 进入，按课程与模块慢慢补齐知识。' },
      { label: '想落地', description: '看工程实践，把工具、脚本和工作流变成可复用方法。' },
      { label: '想补基础', description: '回到底层原理，理解模型、数据和系统为什么这样演进。' },
    ],
    visualTitle: '先看图，再读文',
    visualDescription: 'AI 雷达已经积累了一批信息图。它们适合做第一层入口：先建立画面和结构，再决定要不要进入原文。',
    recentVisuals: '最近图报',
    recentVisualsCta: '查看图片墙',
  },
  ja: {
    eyebrow: 'AI Learning Atlas',
    title: 'Good Good Study, Day Day AI',
    description: 'AI の日々の変化、体系的な講座ノート、実践の記録、基礎原理を、継続して学べる地図として整理しています。時間がないときは図解から、深掘りしたいときは本文へ。',
    featured: '注目記事',
    latest: '最新記事',
    tags: 'タグ',
    sideNote: 'タグから全体を横断して読めます。',
    tagIndexCta: 'タグ一覧を見る',
    updates: '最近更新',
    heroCta: 'AI Radar から始める',
    heroSecondaryCta: 'Image Wall を見る',
    contentUnit: '記事',
    visualUnit: '図解',
    tagUnit: 'タグ',
    routesTitle: '速く眺めるところから、深く学ぶところまで',
    routesDescription: 'AI Radar、Academy、Engineering、Foundations を入口に、AI の変化と学びを横断できます。',
    routeCta: 'セクションへ',
    routes: {
      radar: {
        title: 'AI Radar',
        description: 'Daily / Weekly / Monthly で AI の主要な流れを追います。図解カードから全体像をつかめます。',
      },
      academy: {
        title: 'AI Academy',
        description: 'OpenAI や Anthropic などの講座内容を、復習しやすい学習ノートとして整理します。',
      },
      engineering: {
        title: 'エンジニアリング実践',
        description: 'ツール、オートメーション、クラウド、実運用の知見を、日々のワークフローにつなげます。',
      },
      foundations: {
        title: '基礎原理',
        description: '数学、データ、モデル、システムの基礎を補い、変化の背景を理解します。',
      },
    },
    useTitle: '目的に合わせて使う',
    useDescription: '短時間で流れを見ることも、テーマごとに深く読むこともできます。',
    useCases: [
      { label: '時間がない', description: 'まず AI Radar の Image Wall で、最近の流れを数分で把握します。' },
      { label: '体系的に学びたい', description: 'AI Academy から入り、講座とモジュールに沿って学びます。' },
      { label: '実践したい', description: 'Engineering の記録から、ツールやワークフローを自分の作業へ移します。' },
      { label: '基礎を固めたい', description: 'Foundations で、モデルやデータ、システムの前提を確認します。' },
    ],
    visualTitle: 'まず図解、そこから本文へ',
    visualDescription: 'AI Radar には図解が増えています。全体像を先につかみ、気になったテーマだけ本文で深掘りできます。',
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
