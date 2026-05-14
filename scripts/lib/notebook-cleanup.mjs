const DAY_MS = 24 * 60 * 60 * 1000;

function parseDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    throw new Error(`Invalid date: ${value}`);
  }

  return new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
}

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function addDays(value, days) {
  return new Date(parseDate(value).getTime() + days * DAY_MS);
}

function lastDayOfMonth(year, monthIndex) {
  return new Date(Date.UTC(year, monthIndex + 1, 0));
}

export function parseRadarNotebookTitle(title) {
  const prefixDaily = /^ai-radar-daily-(\d{4}-\d{2}-\d{2})-(?:zh|ja)\b/.exec(title);
  if (prefixDaily) {
    return { cadence: 'daily', date: prefixDaily[1] };
  }

  const generatedDaily = /^AI\s*(?:雷达日报|レーダー日報)：(\d{4}-\d{2}-\d{2})(?:\s*·\s*(.+))?$/.exec(
    title,
  );
  if (generatedDaily) {
    return { cadence: 'daily', date: generatedDaily[1], assetType: generatedDaily[2] ?? null };
  }

  const prefixWeekly = /^ai-radar-weekly-(\d{4}-\d{2}-\d{2}).*?(\d{4}-\d{2}-\d{2})-(?:zh|ja)\b/.exec(
    title,
  );
  if (prefixWeekly) {
    return { cadence: 'weekly', start: prefixWeekly[1], end: prefixWeekly[2] };
  }

  const generatedWeekly =
    /^AI\s*(?:雷达周报|レーダー週報)：(\d{4}-\d{2}-\d{2})\s*(?:至|〜|~|to)\s*(\d{4}-\d{2}-\d{2})(?:\s*·\s*(.+))?$/.exec(
      title,
    );
  if (generatedWeekly) {
    return {
      cadence: 'weekly',
      start: generatedWeekly[1],
      end: generatedWeekly[2],
      assetType: generatedWeekly[3] ?? null,
    };
  }

  return null;
}

/**
 * @param {{ cadence: 'weekly' | 'monthly', triggerDate?: string | null, weekStart?: string | null, month?: string | null }} options
 */
export function getCleanupWindow({ cadence, triggerDate = null, weekStart = null, month = null }) {
  if (cadence === 'weekly') {
    const start = weekStart ?? getPreviousIsoWeekStart(triggerDate ?? formatDate(new Date()));
    return { cadence, start, end: formatDate(addDays(start, 6)) };
  }

  if (cadence === 'monthly') {
    const targetMonth = month ?? getPreviousMonth(triggerDate ?? formatDate(new Date()));
    const match = /^(\d{4})-(\d{2})$/.exec(targetMonth);
    if (!match) {
      throw new Error(`Invalid month: ${targetMonth}`);
    }

    const year = Number(match[1]);
    const monthIndex = Number(match[2]) - 1;
    return {
      cadence,
      start: `${targetMonth}-01`,
      end: formatDate(lastDayOfMonth(year, monthIndex)),
    };
  }

  throw new Error(`Unsupported cleanup cadence: ${cadence}`);
}

export function getPreviousIsoWeekStart(triggerDate) {
  const date = parseDate(triggerDate);
  const utcDay = date.getUTCDay();
  const isoDay = utcDay === 0 ? 7 : utcDay;
  const currentMonday = new Date(date.getTime() - (isoDay - 1) * DAY_MS);
  return formatDate(new Date(currentMonday.getTime() - 7 * DAY_MS));
}

export function getPreviousMonth(triggerDate) {
  const date = parseDate(triggerDate);
  const previousMonth = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() - 1, 1));
  return previousMonth.toISOString().slice(0, 7);
}

/**
 * @param {Array<{ id?: string, title?: string, name?: string }>} notebooks
 * @param {{ cadence: 'weekly' | 'monthly', start: string, end: string }} window
 */
export function selectCleanupCandidates(notebooks, window) {
  return notebooks.filter((notebook) => {
    const parsed = parseRadarNotebookTitle(notebook.title ?? notebook.name ?? '');
    if (!parsed) {
      return false;
    }

    if (window.cadence === 'weekly') {
      return (
        parsed.cadence === 'daily' && parsed.date >= window.start && parsed.date <= window.end
      );
    }

    if (window.cadence === 'monthly') {
      return (
        parsed.cadence === 'weekly' && parsed.start >= window.start && parsed.end <= window.end
      );
    }

    return false;
  });
}
