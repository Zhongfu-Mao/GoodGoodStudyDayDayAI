import type { Locale, RadarCadence } from './site';
import { formatDate } from './i18n';

type RadarItemLike = {
  slug: string;
  entry: { id: string; data: { cadence?: string } };
};

export function resolveRadarCadence(item: RadarItemLike): RadarCadence | undefined {
  const explicit = item.entry.data.cadence?.toLowerCase();

  if (explicit === 'daily' || explicit === 'weekly' || explicit === 'monthly') {
    return explicit as RadarCadence;
  }

  const fallback = `${item.slug} ${item.entry.id}`.toLowerCase();

  if (fallback.includes('daily')) return 'daily';
  if (fallback.includes('weekly')) return 'weekly';
  if (fallback.includes('monthly')) return 'monthly';

  return undefined;
}

export function getMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function formatMonthLabel(date: Date, locale: Locale) {
  return formatDate(date, locale, { year: 'numeric', month: 'long' });
}

export function groupByMonth<T extends { entry: { data: { date: Date } } }>(
  items: T[],
  locale: Locale,
) {
  const groups = new Map<string, T[]>();

  for (const item of items) {
    const key = getMonthKey(item.entry.data.date);
    const existing = groups.get(key);

    if (existing) {
      existing.push(item);
    } else {
      groups.set(key, [item]);
    }
  }

  return [...groups.entries()].map(([key, groupItems], index) => ({
    id: key,
    label: formatMonthLabel(groupItems[0].entry.data.date, locale),
    items: groupItems,
    open: index === 0,
  }));
}
