import { categoryPath, startPath, type Locale } from './site';

export type SectionNavItem = {
  href: string;
  hash: string;
  label: string;
  tooltip: string;
};

const radarSubnavTooltips = {
  zh: {
    daily: '每天快速扫一遍模型、产品与实践动态',
    weekly: '按周复盘主题脉络和关键变化',
    monthly: '看月度趋势、结构变化和长期信号',
  },
  ja: {
    daily: '日々のモデル、プロダクト、実践動向を素早く確認',
    weekly: '週ごとのテーマ、流れ、重要変化を振り返る',
    monthly: '月次のトレンド、構造変化、長期シグナルを見る',
  },
} as const;

const radarSubnavLabels = {
  zh: {
    daily: '日报',
    weekly: '周报',
    monthly: '月报',
  },
  ja: {
    daily: '日報',
    weekly: '週報',
    monthly: '月報',
  },
} as const;

const startSubnavItems = {
  zh: [
    {
      hash: '#start-route',
      label: '路线',
      tooltip: '按角色选一条路线，看清 30 天后的检验标准',
    },
    { hash: '#first-step', label: '读序', tooltip: '本站内容的推荐阅读顺序' },
    { hash: '#start-first-day', label: '1 小时', tooltip: '从第一个小时开始，按需完成六个小实验' },
    { hash: '#start-plan', label: '节奏', tooltip: '按目标调整的 90 天学习与实践计划' },
    { hash: '#ai-basics-for-everyone', label: '概念', tooltip: '用 12 篇短文打底高频概念' },
    { hash: '#start-layers', label: '能力层', tooltip: 'AI 应用从模型调用到治理的 6 层' },
    { hash: '#start-landscape', label: '选型', tooltip: '不背型号也能选对模型的方法' },
    { hash: '#start-safety', label: '安全', tooltip: '常见误区与构建 AI 系统的安全底线' },
    { hash: '#start-faq', label: 'FAQ', tooltip: '最常被问到的问题' },
  ],
  ja: [
    {
      hash: '#start-route',
      label: '道筋',
      tooltip: '役割別にルートを選び、30 日後の到達点を確認する',
    },
    { hash: '#first-step', label: '読む順', tooltip: 'このサイトの推奨する読む順番' },
    {
      hash: '#start-first-day',
      label: '1 時間',
      tooltip: '最初の 1 時間から、必要に応じて試す 6 つの実験',
    },
    {
      hash: '#start-plan',
      label: 'リズム',
      tooltip: '目標に合わせて調整する 90 日の学習・実践計画',
    },
    { hash: '#ai-basics-for-everyone', label: '概念', tooltip: '12 本の短文で頻出概念を押さえる' },
    {
      hash: '#start-layers',
      label: 'レイヤー',
      tooltip: 'モデル呼び出しからガバナンスまで、AI アプリの 6 層',
    },
    {
      hash: '#start-landscape',
      label: '選び方',
      tooltip: '型番を覚えなくてもモデルを選べる方法',
    },
    {
      hash: '#start-safety',
      label: '安全',
      tooltip: 'よくある誤解と、AI システムを作るときの安全ライン',
    },
    { hash: '#start-faq', label: 'FAQ', tooltip: 'よく聞かれる質問' },
  ],
} as const;

const academySubnavItems = {
  zh: [
    { hash: '#routes', label: '路线', tooltip: '先按角色选择 AI Academy 的阅读路径' },
    {
      hash: '#openai-academy',
      label: 'OpenAI',
      tooltip: 'ChatGPT、Codex、Building with AI 等官方课程笔记',
    },
    {
      hash: '#anthropic-academy',
      label: 'Anthropic',
      tooltip: 'Claude、MCP、Skills 与 Subagents 相关课程',
    },
    {
      hash: '#google-advent-of-agents',
      label: 'Google Advent',
      tooltip: '以 Season 2 三十一天为主线的 Agent 工程课程',
    },
    { hash: '#other-academy', label: '其他', tooltip: '没有归入课程系列的 Academy 笔记' },
  ],
  ja: [
    { hash: '#routes', label: 'ルート', tooltip: '役割別に AI Academy の読み順を選ぶ' },
    {
      hash: '#openai-academy',
      label: 'OpenAI',
      tooltip: 'ChatGPT、Codex、Building with AI などの講義ノート',
    },
    {
      hash: '#anthropic-academy',
      label: 'Anthropic',
      tooltip: 'Claude、MCP、Skills、Subagents の関連講義',
    },
    {
      hash: '#google-advent-of-agents',
      label: 'Google Advent',
      tooltip: 'Season 2 の 31 日を主線にした Agent engineering course',
    },
    { hash: '#other-academy', label: 'その他', tooltip: 'シリーズ未分類の Academy ノート' },
  ],
} as const;

export function getRadarSubnavItems(locale: Locale): SectionNavItem[] {
  return [
    {
      href: `${categoryPath('radar', locale)}#daily`,
      hash: '#daily',
      label: radarSubnavLabels[locale].daily,
      tooltip: radarSubnavTooltips[locale].daily,
    },
    {
      href: `${categoryPath('radar', locale)}#weekly`,
      hash: '#weekly',
      label: radarSubnavLabels[locale].weekly,
      tooltip: radarSubnavTooltips[locale].weekly,
    },
    {
      href: `${categoryPath('radar', locale)}#monthly`,
      hash: '#monthly',
      label: radarSubnavLabels[locale].monthly,
      tooltip: radarSubnavTooltips[locale].monthly,
    },
  ];
}

export function getStartSubnavItems(locale: Locale): SectionNavItem[] {
  return startSubnavItems[locale].map((item) => ({
    ...item,
    href: `${startPath(locale)}${item.hash}`,
  }));
}

export function getAcademySubnavItems(locale: Locale): SectionNavItem[] {
  return academySubnavItems[locale].map((item) => ({
    ...item,
    href: `${categoryPath('academy', locale)}${item.hash}`,
  }));
}
