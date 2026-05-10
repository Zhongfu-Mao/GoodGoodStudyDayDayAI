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
    { hash: '#start-route', label: '路线', tooltip: '先判断当前位置，安排 30/60/90 天学习节奏' },
    { hash: '#ai-basics-for-everyone', label: '概念', tooltip: '用 12 篇短文打底高频概念' },
    { hash: '#start-layers', label: '能力层', tooltip: '看清从日常使用到 Agent 的能力层' },
    { hash: '#start-safety', label: '安全', tooltip: '避开常见误区，建立安全使用边界' },
    { hash: '#start-faq', label: 'FAQ', tooltip: '快速回答新手最容易卡住的问题' },
  ],
  ja: [
    { hash: '#start-route', label: '道筋', tooltip: '現在地を確認し、30/60/90 日の進め方を決める' },
    { hash: '#ai-basics-for-everyone', label: '概念', tooltip: '12 本の短文で頻出概念を押さえる' },
    {
      hash: '#start-layers',
      label: 'レイヤー',
      tooltip: '日常利用から Agent までの能力層を整理する',
    },
    {
      hash: '#start-safety',
      label: '安全',
      tooltip: 'よくある誤解を避け、安全な使い方の境界を作る',
    },
    { hash: '#start-faq', label: 'FAQ', tooltip: '初心者がつまずきやすい疑問を先に解く' },
  ],
} as const;

const academySubnavItems = {
  zh: [
    { hash: '#routes', label: '路线', tooltip: '先按角色选择 AI Academy 的阅读路径' },
    { hash: '#openai-academy', label: 'OpenAI', tooltip: 'ChatGPT、Codex、Building with AI 等官方课程笔记' },
    { hash: '#anthropic-academy', label: 'Anthropic', tooltip: 'Claude、MCP、Skills 与 Subagents 相关课程' },
    {
      hash: '#google-advent-of-agents',
      label: 'Google Advent',
      tooltip: '以 Season 2 三十一天为主线的 Agent 工程课程',
    },
    { hash: '#other-academy', label: '其他', tooltip: '没有归入课程系列的 Academy 笔记' },
  ],
  ja: [
    { hash: '#routes', label: 'ルート', tooltip: '役割別に AI Academy の読み順を選ぶ' },
    { hash: '#openai-academy', label: 'OpenAI', tooltip: 'ChatGPT、Codex、Building with AI などの講義ノート' },
    { hash: '#anthropic-academy', label: 'Anthropic', tooltip: 'Claude、MCP、Skills、Subagents の関連講義' },
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
