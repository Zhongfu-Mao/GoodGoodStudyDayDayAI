export const categoryPage = {
  zh: {
    lead: '按主题浏览文章。',
    browse: '本分区文章列表。',
    collectionLead: {
      engineering:
        '把工具链、脚本、Agent 边界和上线细节拆开看。这里不是灵感清单，而是能带回真实项目里的实践笔记。',
      foundations:
        '不逃避原理，也不把原理讲成纯数学课。这里用开发者能用的语言解释 AI 为什么这样工作。',
    },
    collectionBrowseTitle: (label: string, count: number) => `${label}（${count} 篇内容）`,
    filterEyebrow: '筛选',
    filterAll: '全部',
    filterCount: (count: number) => `${count} 篇`,
    empty: '本分区暂无内容。',
    radarHubTitle: 'AI 雷达入口',
    radarHubDescription:
      'AI 雷达按时间节奏整理 AI 领域动态：日报看最新，周报看脉络，月报看趋势，图片墙适合快速浏览。',
    radarHubCards: {
      gallery: {
        title: '图片墙',
        description: '先看封面图，快速扫主题',
      },
      daily: {
        title: '日报',
        description: '每天更新，适合追最新',
      },
      weekly: {
        title: '周报',
        description: '一周汇总，适合补课',
      },
      monthly: {
        title: '月报',
        description: '趋势复盘，适合看方向',
      },
    },
    radarSectionTitle: {
      daily: '最近日报',
      weekly: '周报归档',
      monthly: '月报归档',
    },
    radarGallery: '图片墙',
    radarArchive: '归档',
    radarArchiveNote: (label: string) => `${label} 图卡流`,
    radarEmpty: '该分组暂无内容。',
    defaultListNote: '这里汇总了本分区文章。',
    academyLead: '按课程系列和模块浏览 AI Academy。',
    academyBrowse: '课程系列与模块列表。',
    academyRoutesEyebrow: 'Learning Routes',
    academyRoutesTitle: '先选入口路线',
    academyRoutesDescription:
      '这一区不是完整课程目录，而是三条上手路径：非技术日常应用、工程系统化、教育与业务推广。先选一张路线卡建立阅读顺序，再进入 OpenAI、Anthropic 或 Google Advent 分区深读。',
    academyLegacyDescription:
      '这里保留早期 AI Academy 笔记和独立主题文章，适合在完成主课程后作为补充阅读。',
    academySeriesDescription: (series: string) =>
      ({
        'OpenAI Academy':
          'OpenAI Academy 适合作为 AI 使用与构建的产品化主线：从 ChatGPT 基础、工作场景、教育场景，到 Codex、RAG、Evals 和生产优化。它更像“如何把 AI 变成日常能力和可交付系统”的课程目录。',
        'Anthropic Academy':
          'Anthropic Academy 更适合补齐 AI Fluency、Claude 使用方式和 Agentic engineering 的协作范式，尤其是 MCP、Skills、Subagents 与 Claude Code 相关内容。它强调边界清晰的人机协作和可复用的工作流。',
        'Google Advent of Agents':
          'Google Advent of Agents 以 Season 2 三十一天为主线，把 ADK、模型分层、MCP、Skills、多 Agent 编排、RAG、评估、安全、部署、身份、观测、A2A 和 A2UI 串成一条工程化学习路径。Season 1 作为背景补课使用。',
      })[series] ??
      '这一分区收纳同一课程系列下的模块与文章，可以按模块顺序逐步阅读，也可以直接跳到当前需要的能力点。',
    academySeries: '课程系列',
    academyModule: '模块',
    academyTrack: '学习轨道',
    academyLegacy: '其他 Academy 笔记',
    academyStartReading: '开始按顺序读',
    academyStartReadingHint: '从第一节开始读完整个系列',
    moduleCount: (count: number) => `${count} 个模块`,
    trackCount: (count: number) => `${count} 个学习轨道`,
    itemCount: (count: number) => `${count} 篇内容`,
  },
  ja: {
    lead: 'テーマごとに記事を一覧できます。',
    browse: 'この区分の一覧です。',
    collectionLead: {
      engineering:
        'ツールチェーン、スクリプト、Agent の境界、運用の細部を分けて読む実践ノートです。抽象論ではなく、手元の project に持ち帰れる形を重視します。',
      foundations:
        '数学から逃げず、しかし数学だけにも閉じない。AI がなぜそう動くのかを、開発者が判断に使える言葉で整理します。',
    },
    collectionBrowseTitle: (label: string, count: number) => `${label} (${count} 記事)`,
    filterEyebrow: 'Filter',
    filterAll: 'すべて',
    filterCount: (count: number) => `${count} 件`,
    empty: 'この区分にはまだ記事がありません。',
    radarHubTitle: 'AI レーダー入口',
    radarHubDescription:
      'AI レーダーは時間軸で AI 動向を整理します。Daily は最新、Weekly は流れ、Monthly は傾向、Image Wall はざっと眺める入口です。',
    radarHubCards: {
      gallery: {
        title: 'Image Wall',
        description: 'まず図解を眺めてテーマをつかむ',
      },
      daily: {
        title: 'Daily',
        description: '日々の更新で最新を追う',
      },
      weekly: {
        title: 'Weekly',
        description: '一週間の流れをまとめて補う',
      },
      monthly: {
        title: 'Monthly',
        description: '月単位の傾向と方向性を見る',
      },
    },
    radarSectionTitle: {
      daily: '最新 Daily',
      weekly: 'Weekly Archive',
      monthly: 'Monthly Archive',
    },
    radarGallery: 'Image Wall',
    radarArchive: 'Archive',
    radarArchiveNote: (label: string) => `${label} visual flow`,
    radarEmpty: 'まだ記事がありません。',
    defaultListNote: 'この区分の記事を一覧しています。',
    academyLead: 'AI Academy をシリーズとモジュールごとに一覧できます。',
    academyBrowse: 'シリーズとモジュールの一覧です。',
    academyRoutesEyebrow: 'Learning Routes',
    academyRoutesTitle: '入口ルートから選ぶ',
    academyRoutesDescription:
      'ここは完全な course catalog ではなく、最初に選ぶ三つの入口です。日常業務で使う人、engineering として組み込む人、教育・業務展開を進める人の読み順を整理し、その後 OpenAI、Anthropic、Google Advent の各分区へ進みます。',
    academyLegacyDescription:
      '初期の AI Academy ノートや独立テーマの記事を置く補助エリアです。主な course を読んだ後の補足として使えます。',
    academySeriesDescription: (series: string) =>
      ({
        'OpenAI Academy':
          'OpenAI Academy は、AI の利用と構築を product workflow として捉える主線です。ChatGPT の基礎、仕事や教育での使い方、Codex、RAG、Evals、production optimization まで、AI を日常能力と納品可能な system にする流れを整理します。',
        'Anthropic Academy':
          'Anthropic Academy は AI Fluency、Claude の使い方、Agentic engineering の協働パターンを補う分区です。特に MCP、Skills、Subagents、Claude Code に関する内容から、人間と Agent の境界を明確にする設計を学べます。',
        'Google Advent of Agents':
          'Google Advent of Agents は Season 2 の 31 日を主線に、ADK、model routing、MCP、Skills、multi-agent orchestration、RAG、eval、安全、deploy、identity、observability、A2A、A2UI を一つの engineering path として読む分区です。Season 1 は背景補足として使います。',
      })[series] ??
      'この分区では同じ course series の module と記事をまとめています。順番に読むことも、必要な capability へ直接進むこともできます。',
    academySeries: 'シリーズ',
    academyModule: 'モジュール',
    academyTrack: '学習トラック',
    academyLegacy: 'その他の Academy ノート',
    academyStartReading: '順番に読み始める',
    academyStartReadingHint: '最初のレッスンからシリーズを順番に読み進めます。',
    moduleCount: (count: number) => `${count} モジュール`,
    trackCount: (count: number) => `${count} トラック`,
    itemCount: (count: number) => `${count} 記事`,
  },
} as const;
