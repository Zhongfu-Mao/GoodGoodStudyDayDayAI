import { parse } from 'yaml';

export function isHeavyRadarPath(file) {
  return /^public\/(?:audio|decks)\/radar\//i.test(file.replaceAll('\\', '/'));
}

export function readRadarDocument(source) {
  const normalized = source.replace(/^\uFEFF/, '').replaceAll('\r\n', '\n');
  const match = normalized.match(/^---\n([\s\S]*?)\n---(?:\n|$)/);
  if (!match) throw new Error('missing YAML frontmatter');
  const meta = parse(match[1], { maxAliasCount: 20 });
  if (!meta || typeof meta !== 'object' || Array.isArray(meta)) {
    throw new Error('frontmatter must be a mapping');
  }
  if (meta.draft !== undefined && typeof meta.draft !== 'boolean') {
    throw new Error('draft must be a boolean');
  }
  return { meta, body: normalized.slice(match[0].length) };
}

export function inspectRadarMedia(file, source, policy) {
  const failures = [];
  const assets = [];
  let meta;
  try {
    ({ meta } = readRadarDocument(source));
  } catch (error) {
    return { failures: [`${file}: ${error.message}`], assets };
  }
  // Drafts may retain local generation output; they are never publication-ready.
  if (meta.draft === true) return { failures, assets };
  for (const [field, directory, extension, type] of [
    ['audioUrl', 'audio', '.mp3', 'audio/mpeg'],
    ['deckUrl', 'decks', '.pdf', 'application/pdf'],
  ]) {
    const value = meta[field];
    if (value === undefined || value === null) continue;
    let url;
    try {
      url = new URL(value);
      if (typeof value !== 'string' || url.protocol !== 'https:' || url.username || url.password)
        throw new Error('unsafe URL');
      const approved = policy.publicBases.some((base) => {
        const expected = new URL(base);
        const prefix = `${expected.pathname.replace(/\/$/, '')}/${directory}/radar/`;
        const decoded = decodeURIComponent(url.pathname);
        return (
          url.origin === expected.origin &&
          decoded.startsWith(prefix) &&
          decoded.endsWith(extension) &&
          ![...decoded].some((char) => char.charCodeAt(0) < 32 || char === '\\') &&
          !decoded.split('/').includes('..')
        );
      });
      if (!approved) throw new Error('unapproved host or path');
    } catch {
      failures.push(
        `${file}: ${field} must use an approved HTTPS R2 media host and /${directory}/radar/*${extension} path without URL credentials`,
      );
      continue;
    }
    if (field === 'audioUrl' && (!Number.isSafeInteger(meta.audioSize) || meta.audioSize <= 0)) {
      failures.push(`${file}: audioSize must be a positive integer matching the uploaded MP3`);
      continue;
    }
    assets.push({
      file,
      field,
      url: url.href,
      type,
      expectedSize: field === 'audioUrl' ? meta.audioSize : null,
    });
  }
  return { failures, assets };
}

export async function verifyRemoteMedia(assets, { fetchImpl = fetch, concurrency = 4 } = {}) {
  const failures = [];
  const grouped = new Map();
  for (const asset of assets) grouped.set(asset.url, [...(grouped.get(asset.url) ?? []), asset]);
  const queue = [...grouped.values()];
  let cursor = 0;
  await Promise.all(
    Array.from({ length: Math.min(concurrency, queue.length) }, async () => {
      while (cursor < queue.length) {
        const references = queue[cursor++];
        try {
          const response = await fetchImpl(references[0].url, {
            method: 'HEAD',
            redirect: 'error',
            signal: AbortSignal.timeout(20_000),
          });
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const size = Number(response.headers.get('content-length'));
          const type = response.headers.get('content-type')?.split(';', 1)[0].trim().toLowerCase();
          if (!Number.isSafeInteger(size) || size <= 0)
            throw new Error('missing/invalid Content-Length');
          for (const ref of references) {
            if (type !== ref.type)
              failures.push(
                `${ref.file}: ${ref.field} Content-Type is ${type ?? 'missing'}, expected ${ref.type}`,
              );
            if (ref.expectedSize !== null && size !== ref.expectedSize)
              failures.push(
                `${ref.file}: audioSize is ${ref.expectedSize}, remote Content-Length is ${size}`,
              );
          }
        } catch (error) {
          failures.push(
            `${references[0].file}: remote ${references[0].field} verification failed (${error.message})`,
          );
        }
      }
    }),
  );
  return { failures, checkedUrls: queue.length };
}
