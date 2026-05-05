import { cadenceLabels, categoryPath, startPath, type Locale } from './site';

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

export function getRadarSubnavItems(locale: Locale): SectionNavItem[] {
  return [
    {
      href: `${categoryPath('radar', locale)}#daily`,
      hash: '#daily',
      label: cadenceLabels.daily[locale],
      tooltip: radarSubnavTooltips[locale].daily,
    },
    {
      href: `${categoryPath('radar', locale)}#weekly`,
      hash: '#weekly',
      label: cadenceLabels.weekly[locale],
      tooltip: radarSubnavTooltips[locale].weekly,
    },
    {
      href: `${categoryPath('radar', locale)}#monthly`,
      hash: '#monthly',
      label: cadenceLabels.monthly[locale],
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
