// Calendar-month retention uses report dates, never filesystem modification time.
export function monthCutoff(asOf) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(asOf)) throw new Error('Expected YYYY-MM-DD');
  const date = new Date(`${asOf}T00:00:00Z`);
  if (date.toISOString().slice(0, 10) !== asOf) throw new Error('Invalid date');
  const day = date.getUTCDate();
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() - 1);
  const last = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate();
  date.setUTCDate(Math.min(day, last));
  return date.toISOString().slice(0, 10);
}

export function shouldArchiveMedia(file, latestReferenceDate, cutoff) {
  if (/^public\/(audio|decks)\/radar\//.test(file)) return true;
  if (!file.startsWith('public/images/radar/')) return false;
  // Undated shared artwork stays local; an image reused by a recent report stays local.
  return Boolean(latestReferenceDate && latestReferenceDate < cutoff);
}

export const LOCAL_MEDIA_PATTERN =
  /(?<![\w/:.-])\/(?:audio|decks|images)\/radar\/[\w.-]+\.(?:mp3|pdf|webp|png|jpe?g|svg)(?=[\s"'<>?#)\]]|$)/g;

export function rewriteMediaReferences(source, urls) {
  return source.replace(LOCAL_MEDIA_PATTERN, (url) => urls.get(`public${url}`) ?? url);
}
