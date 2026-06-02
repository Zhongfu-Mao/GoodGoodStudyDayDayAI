import process from 'node:process';

export function extractDailyRadarDate(file) {
  return file.match(/^daily-ai-radar-(\d{4}-\d{2}-\d{2})/)?.[1] ?? '';
}

export function parseDateRangeArgs(argv = process.argv, defaults = {}) {
  return {
    from: parseDateArg(argv, '--from') ?? defaults.from ?? null,
    to: parseDateArg(argv, '--to') ?? defaults.to ?? null,
  };
}

export function isDailyRadarFileInRange(file, range = {}) {
  const from = range.from ?? null;
  const to = range.to ?? null;
  const date = extractDailyRadarDate(file);
  if (!date) return false;
  if (from && date < from) return false;
  if (to && date > to) return false;
  return true;
}

function parseDateArg(argv, name) {
  const index = argv.indexOf(name);
  const value = index === -1 ? '' : argv[index + 1];
  if (!value) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    console.error(`Invalid ${name} date: ${value}`);
    process.exit(1);
  }
  return value;
}
