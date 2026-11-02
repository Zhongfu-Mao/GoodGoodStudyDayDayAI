// Preserve article identity (e.g. OpenReview ?id=); remove only known tracking.
export function normalizeRadarUrl(value) {
  if (/\s/.test(value)) throw new Error('Expected one URL without whitespace');
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.username || url.password)
    throw new Error('Expected a public HTTPS URL');
  for (const key of [...url.searchParams.keys()]) {
    if (/^utm_/i.test(key) || /^(?:fbclid|gclid|mc_cid|mc_eid)$/i.test(key))
      url.searchParams.delete(key);
  }
  url.searchParams.sort();
  url.hash = '';
  url.hostname = url.hostname.replace(/^www\./, '');
  return url.href.replace(/\/$/, '');
}
