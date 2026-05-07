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
      })[series] ?? '这一分区收纳同一课程系列下的模块与文章，可以按模块顺序逐步阅读，也可以直接跳到当前需要的能力点。',
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
    radarLead:
      'まず図解で眺め、気になるものを原文へ。Daily / Weekly / Monthly ごとに一覧できます。',
    radarBrowse: 'Daily / Weekly / Monthly を、図解カード優先で並べています。',
    radarGallery: 'Image Wall',
    radarGalleryHint:
      'この一覧も図解カード優先です。Overview では絞り込みと大きなプレビューを使えます。',
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
      })[series] ?? 'この分区では同じ course series の module と記事をまとめています。順番に読むことも、必要な capability へ直接進むこともできます。',
    academySeries: 'シリーズ',
    academyModule: 'モジュール',
    academyTrack: '学習トラック',
    academyLegacy: 'その他の Academy ノート',
    moduleCount: (count: number) => `${count} モジュール`,
    trackCount: (count: number) => `${count} トラック`,
    itemCount: (count: number) => `${count} 記事`,
  },
} as const;
