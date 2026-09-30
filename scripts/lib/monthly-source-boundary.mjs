import path from 'node:path';

// Explicit backfills must cover the month without importing adjacent months.
export function validateMonthlySourceNames(files, { year, month, lang }) {
  const start = Date.UTC(year, month - 1, 1);
  const end = Date.UTC(year, month, 0);
  const covered = new Set();
  if (!files.length || new Set(files).size !== files.length) {
    throw new Error('Monthly sources must be nonempty and unique.');
  }
  for (const file of files) {
    const name = path.basename(file);
    const daily = name.match(/^daily-ai-radar-(\d{4}-\d{2}-\d{2})(\.ja)?\.md$/);
    const weekly = name.match(
      /^weekly-ai-radar-(\d{4}-\d{2}-\d{2})-to-(\d{4}-\d{2}-\d{2})(\.ja)?\.md$/,
    );
    if (!daily && !weekly) throw new Error(`Unsupported monthly source: ${name}`);
    const ja = Boolean(daily ? daily[2] : weekly[3]);
    if (ja !== (lang === 'ja')) throw new Error(`Monthly source language mismatch: ${name}`);
    const a = Date.parse(`${daily ? daily[1] : weekly[1]}T00:00:00Z`);
    const b = Date.parse(`${daily ? daily[1] : weekly[2]}T00:00:00Z`);
    if (!Number.isFinite(a) || !Number.isFinite(b) || a < start || b > end || b < a) {
      throw new Error(`Monthly source crosses target month: ${name}`);
    }
    for (let day = a; day <= b; day += 86400000) covered.add(day);
  }
  for (let day = start; day <= end; day += 86400000) {
    if (!covered.has(day))
      throw new Error(`Monthly source gap: ${new Date(day).toISOString().slice(0, 10)}`);
  }
  return files;
}
