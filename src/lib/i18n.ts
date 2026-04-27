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
  zh: { home: '首页', start: '新手起步', search: '搜索', searchPlaceholder: '搜索内容…', searchSubmit: '提交搜索' },
  ja: { home: 'ホーム', start: 'はじめに', search: '検索', searchPlaceholder: '検索…', searchSubmit: '検索を実行' },
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
    title: '一份 AI 学习与实践笔记',
    description: '这里把 AI 动态、课程笔记、工程实践和底层原理整理成一条可以慢慢走的路。你可以先看图报抓住重点，也可以从新手路线开始，把零散信息变成自己的理解和方法。',
    featured: '精选文章',
    latest: '最新文章',
    tags: '标签',
    sideNote: '按标签快速浏览全部内容。',
    tagIndexCta: '查看标签总览',
    updates: '最近更新',
    heroCta: '我该从哪里开始',
    heroSecondaryCta: '进入 AI 雷达日报',
    contentUnit: '篇内容',
    visualUnit: '张图报',
    tagUnit: '个标签',
    intentTitle: '先从最顺手的入口开始',
    intentDescription: '不用先搞懂所有术语。你现在只是好奇、想补基础，还是想把 AI 用到工作里，都有对应入口。',
    intentItems: {
      beginner: {
        label: '我刚开始学 AI',
        title: '从几个核心词开始',
        description: '用一条轻量路线理解模型、Prompt、上下文、Agent、RAG 这些高频概念。',
        cta: '进入新手路线',
      },
      radar: {
        label: '我想知道今天发生了什么',
        title: '先抓住今日主线',
        description: '用 AI 雷达和图片墙快速看懂最近发生了什么，再决定是否深挖原文。',
        cta: '看 AI 雷达',
      },
      system: {
        label: '我想系统提升',
        title: '把零散学习串成路线',
        description: '从 Academy、工程实践和底层原理进入，把看过的材料慢慢沉淀成自己的体系。',
        cta: '看学习地图',
      },
    },
    routesTitle: '四个内容分区，各司其职',
    routesDescription: 'AI 雷达负责跟踪变化，Academy 负责系统学习，工程实践负责落地，底层原理负责补齐理解框架。',
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
    useTitle: '今天你想怎么开始？',
    useDescription: '不用一次读完，也不用先成为专家。只是路过，就先看今日图报；想认真补课，就从新手路线开始；已经在做项目，就去工程实践找可以借鉴的方法。',
    useCases: [
      { label: '没时间', description: '看 AI 雷达图片墙，用三五分钟抓住最近的 AI 主线。' },
      { label: '想补课', description: '从新手起步或 AI Academy 开始，一篇一篇补，不需要先成为专家。' },
      { label: '想落地', description: '去工程实践看工具、脚本和流程怎么跑起来，把经验带回自己的工作。' },
      { label: '想补基础', description: '看底层原理，把模型、数据和系统这些关键词真正串起来。' },
    ],
    visualTitle: '先看图，再读文',
    visualDescription: 'AI 雷达已经积累了一批信息图。它们适合做第一层入口：先建立画面和结构，再决定要不要进入原文。',
    recentVisuals: '最近图报',
    recentVisualsCta: '查看图片墙',
  },
  ja: {
    eyebrow: 'Good Good Study, Day Day AI',
    title: 'AI 学習と実践のノート',
    description: 'AI の動き、講座ノート、実践記録、基礎原理を、少しずつ進める学習ルートとして整理しています。まず図解で要点をつかんでも、Start からゆっくり学んでも大丈夫です。',
    featured: '注目記事',
    latest: '最新記事',
    tags: 'タグ',
    sideNote: 'タグから全体を横断して読めます。',
    tagIndexCta: 'タグ一覧を見る',
    updates: '最近更新',
    heroCta: 'どこから始める？',
    heroSecondaryCta: 'AI Radar 日報へ',
    contentUnit: '記事',
    visualUnit: '図解',
    tagUnit: 'タグ',
    intentTitle: 'いちばん入りやすい場所から',
    intentDescription: '用語を全部知っている必要はありません。少し気になるだけでも、基礎を補いたい時でも、仕事に使いたい時でも、入口を選べます。',
    intentItems: {
      beginner: {
        label: 'AI を学び始めたばかり',
        title: 'まず大事な言葉から',
        description: 'model、prompt、context、Agent、RAG など、頻出語を軽い導線で整理します。',
        cta: 'Start へ',
      },
      radar: {
        label: '今日の変化を知りたい',
        title: '今日の変化をつかむ',
        description: 'AI Radar と Image Wall で最近の流れを見て、気になったものだけ本文へ進みます。',
        cta: 'AI Radar へ',
      },
      system: {
        label: '体系的に伸ばしたい',
        title: 'ばらばらの学びをつなぐ',
        description: 'Academy、Engineering、Foundations から、読んだものを少しずつ自分の体系にしていきます。',
        cta: '学習地図へ',
      },
    },
    routesTitle: '4 つの入口',
    routesDescription: 'AI Radar は変化を追い、Academy は体系化し、Engineering は実践へつなげ、Foundations は理解の土台を補います。',
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
    useTitle: '今日はどこから始める？',
    useDescription: '全部を一度に読む必要も、最初から詳しい必要もありません。少し見るだけなら今日の図解、腰を据えて学ぶなら Start、実務に近づけたいなら Engineering から入れます。',
    useCases: [
      { label: '時間がない', description: 'AI Radar の Image Wall で、最近の AI の主線を数分でつかみます。' },
      { label: '学び直したい', description: 'Start や AI Academy から、一つずつ補っていけます。専門家である必要はありません。' },
      { label: '実践したい', description: 'Engineering で、ツールやスクリプト、ワークフローがどう動くかを見ます。' },
      { label: '基礎を固めたい', description: 'Foundations で、モデル、データ、システムの見取り図をつなげます。' },
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
    academyRoutesEyebrow: 'Learning Routes',
    academyRoutesTitle: '先按角色选择路线',
    academyRoutesDescription:
      '如果不知道从哪篇 Academy 笔记开始，可以先选一条路线。三条路线分别面向非工程朋友、工程朋友、教育与业务推广，把已有课程内容串成可执行的阅读顺序。',
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
    academyRoutesEyebrow: 'Learning Routes',
    academyRoutesTitle: 'まず役割から選ぶ',
    academyRoutesDescription:
      'どの記事から読めばよいか迷う場合は、先にルートを選べます。非エンジニア、エンジニア、教育・業務展開の 3 つの視点で、既存の Academy コンテンツを読み順に整理しています。',
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
    difficulty: '难度',
    readingTime: '阅读时间',
    plainSummaryEyebrow: '人话摘要',
    plainSummaryTitle: '先看这句',
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
    difficulty: '難易度',
    readingTime: '読む目安',
    plainSummaryEyebrow: 'Plain Summary',
    plainSummaryTitle: 'まず一言で',
  },
} as const;

export const startPage = {
  zh: {
    title: 'AI 新手起步路线',
    metaDescription: '从零开始理解 AI 的核心概念、使用方式和本站阅读路径。',
    eyebrow: 'Start Here',
    heroTitle: '如果你刚开始接触 AI，先从这里进入。',
    heroDescription:
      '这不是一门大而全课程，而是一条帮你看懂本站内容的缓冲路线。先理解几个高频概念，再知道该看雷达、课程、实践还是底层原理。',
    primaryCta: '开始第一步',
    secondaryCta: '先看 AI 雷达',
    promiseTitle: '这条路线解决什么',
    promises: [
      { title: '听懂术语', description: '把模型、Prompt、上下文、Agent、RAG、评测这些词先变成日常语言。' },
      { title: '知道怎么用', description: '不追求一步到位，先学会把 AI 放进搜索、写作、整理、学习和工作流。' },
      { title: '能继续读下去', description: '读 AI 雷达和 Academy 时不再被术语劝退，知道哪些内容先略过也没关系。' },
    ],
    basicsTitle: '先把 12 个高频概念打底',
    basicsDescription:
      '这组 AI Basics for Everyone 是本站的新手入口层：每篇先用人话解释一个核心概念，再接到已有 Academy、工程实践或底层原理内容，帮助你从“听过这个词”走到“知道下一篇该读什么”。',
    stepsTitle: '从 0 到能看懂本站',
    steps: [
      {
        title: '先知道 AI 能做什么',
        description: '把 AI 当成可以读、写、整理、推理和操作工具的协作者，而不是神秘按钮。',
        links: [
          { label: 'AI Fundamentals', href: '/academy/openai-academy/01-ai-fundamentals/ai-fundamentals/' },
          { label: 'Claude 101', href: '/academy/anthropic-academy/03-claude-product/claude-101/' },
        ],
      },
      {
        title: '学会提出更好的问题',
        description: 'Prompt 不是咒语，而是把目标、上下文、约束和输出格式讲清楚。',
        links: [
          { label: 'Getting Started with ChatGPT', href: '/academy/openai-academy/02-using-chatgpt/core-skills/getting-started/' },
          { label: 'Prompting Fundamentals', href: '/academy/openai-academy/02-using-chatgpt/core-skills/prompting-fundamentals/' },
        ],
      },
      {
        title: '理解上下文和文件',
        description: '很多 AI 能力不是模型单独完成的，而是模型、上下文、工具和资料共同组成的系统。',
        links: [
          { label: 'Working with Files', href: '/academy/openai-academy/02-using-chatgpt/tools/working-with-files/' },
          { label: 'RAG', href: '/academy/openai-academy/07-building-with-ai/rag/' },
        ],
      },
      {
        title: '再看 Agent 和工作流',
        description: 'Agent 不是“机器人很聪明”，而是模型能在边界内调用工具、执行步骤、接受检查。',
        links: [
          { label: 'Agents', href: '/academy/openai-academy/07-building-with-ai/agents/' },
          { label: 'AI 雷达图片墙', href: '/radar/gallery/' },
        ],
      },
    ],
    glossaryTitle: '先记住这几个词',
    glossary: [
      { term: '模型', description: '负责理解和生成内容的能力核心。' },
      { term: 'Prompt', description: '你给 AI 的任务说明，不只是问题，也包含背景、限制和输出要求。' },
      { term: '上下文', description: 'AI 当前能看到的信息，包括对话、文件、工具返回结果和系统规则。' },
      { term: 'Agent', description: '能围绕目标调用工具、分步骤执行并接受验证的 AI 工作流。' },
      { term: 'RAG', description: '让 AI 先检索资料再回答，降低胡编和过时信息的风险。' },
      { term: '评测', description: '把"感觉好用"变成可重复检查的质量标准。' },
      { term: '幻觉', description: 'AI 在缺少依据时生成看起来合理但不正确的内容。' },
      { term: 'Token', description: 'AI 处理文本的基本单位，也是计费和上下文限制的基础。' },
      { term: 'MCP', description: '让 AI 标准化连接外部工具和数据的开放协议。' },
      { term: 'Context Engineering', description: '设计 AI 在每一步能看到什么信息的工程实践。' },
      { term: '结构化输出', description: '让 AI 按指定格式（表格、JSON、清单）输出可直接使用的结果。' },
    ],
    nextTitle: '下一步怎么走',
    nextDescription: '完成这条路线后，你就可以按兴趣选择更深的入口。',
    nextLinks: [
      { label: '看每日变化', href: '/radar/' },
      { label: '系统学课程', href: '/academy/' },
      { label: '看工程实践', href: '/engineering/' },
      { label: '补底层原理', href: '/foundations/' },
    ],
  },
  ja: {
    title: 'AI Start Guide',
    metaDescription: 'AI の基本概念、使い方、このサイトの読み方を最初に整理するガイド。',
    eyebrow: 'Start Here',
    heroTitle: 'AI を学び始めたばかりなら、まずここから。',
    heroDescription:
      'これは大きな講座ではなく、このサイトを読みやすくするための緩衝材です。頻出語を先に整理し、Radar、Academy、実践、基礎のどこへ進むかを決めます。',
    primaryCta: '最初のステップへ',
    secondaryCta: 'AI Radar を見る',
    promiseTitle: 'このガイドでできること',
    promises: [
      { title: '用語がわかる', description: 'model、prompt、context、Agent、RAG、eval を日常語に置き換えます。' },
      { title: '使い方が見える', description: '検索、文章、整理、学習、仕事の流れに AI を入れる入口をつかみます。' },
      { title: '読み続けられる', description: 'AI Radar や Academy を読んでも、どこを深く読みどこを流すか判断できます。' },
    ],
    basicsTitle: 'まず 12 の頻出概念を押さえる',
    basicsDescription:
      'AI Basics for Everyone は、このサイトの入口となる小さなシリーズです。各記事で core concept をやさしく説明し、Academy、Engineering、Foundations の次に読む記事へつなげます。',
    stepsTitle: '0 からサイトを読める状態へ',
    steps: [
      {
        title: 'AI が何をできるかを見る',
        description: 'AI を、読む、書く、整理する、推論する、ツールを扱う協働相手として理解します。',
        links: [
          { label: 'AI Fundamentals', href: '/ja/academy/openai-academy/01-ai-fundamentals/ai-fundamentals/' },
          { label: 'Claude 101', href: '/ja/academy/anthropic-academy/03-claude-product/claude-101/' },
        ],
      },
      {
        title: 'よい依頼の出し方を学ぶ',
        description: 'Prompt は魔法の言葉ではなく、目的、背景、制約、出力形式をそろえる作業です。',
        links: [
          { label: 'Getting Started with ChatGPT', href: '/ja/academy/openai-academy/02-using-chatgpt/core-skills/getting-started/' },
          { label: 'Prompting Fundamentals', href: '/ja/academy/openai-academy/02-using-chatgpt/core-skills/prompting-fundamentals/' },
        ],
      },
      {
        title: 'context と files を理解する',
        description: 'AI の力は model だけでなく、見えている情報、tool、資料の組み合わせで決まります。',
        links: [
          { label: 'Working with Files', href: '/ja/academy/openai-academy/02-using-chatgpt/tools/working-with-files/' },
          { label: 'RAG', href: '/ja/academy/openai-academy/07-building-with-ai/rag/' },
        ],
      },
      {
        title: 'Agent と workflow へ進む',
        description: 'Agent は、目標に向けて tool を使い、手順を進め、検証を受ける AI workflow です。',
        links: [
          { label: 'Agents', href: '/ja/academy/openai-academy/07-building-with-ai/agents/' },
          { label: 'Image Wall', href: '/ja/radar/gallery/' },
        ],
      },
    ],
    glossaryTitle: '最初に覚える言葉',
    glossary: [
      { term: 'Model', description: '内容を理解し、生成する能力の中心。' },
      { term: 'Prompt', description: 'AI への依頼文。質問だけでなく、背景、制約、出力形式も含みます。' },
      { term: 'Context', description: 'AI が今見えている会話、ファイル、tool 結果、ルール。' },
      { term: 'Agent', description: '目標に向けて tool を使い、複数ステップで進む AI workflow。' },
      { term: 'RAG', description: '先に資料を検索してから答えることで、古い情報や作り話を減らす方法。' },
      { term: 'Eval', description: '「なんとなく良い」を、再確認できる品質基準に変える仕組み。' },
      { term: 'Hallucination', description: '根拠が不足しているときに AI がもっともらしい内容を作り出す現象。' },
      { term: 'Token', description: 'AI がテキストを処理する基本単位。課金と context 制限の基礎。' },
      { term: 'MCP', description: 'AI と外部ツールを標準インターフェースでつなぐオープンプロトコル。' },
      { term: 'Context Engineering', description: 'AI が各ステップで見る情報環境を設計する実践。' },
      { term: 'Structured Output', description: '表・JSON・リストなど、指定した形式で AI に出力させること。' },
    ],
    nextTitle: '次に進む場所',
    nextDescription: 'このガイドを読んだら、興味に合わせて深い入口へ進めます。',
    nextLinks: [
      { label: 'Daily を見る', href: '/ja/radar/' },
      { label: 'Academy へ', href: '/ja/academy/' },
      { label: 'Engineering へ', href: '/ja/engineering/' },
      { label: 'Foundations へ', href: '/ja/foundations/' },
    ],
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
