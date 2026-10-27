import path from 'node:path';

// A browser may stop buffering a long MP3 and request its tail separately.
// Unsupported/malformed range syntax falls back to the full response; a valid
// single range outside the file is explicitly unsatisfiable.
export function previewByteRange(header, size) {
  if (typeof header !== 'string') return null;
  const match = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!match || (!match[1] && !match[2])) return null;
  const first = match[1] ? Number(match[1]) : null;
  const last = match[2] ? Number(match[2]) : null;
  if ([first, last].some((n) => n !== null && !Number.isSafeInteger(n))) return null;
  if (size <= 0) return { unsatisfiable: true };
  if (first === null) {
    if (last === 0) return { unsatisfiable: true };
    return { start: Math.max(0, size - last), end: size - 1 };
  }
  if (first >= size || (last !== null && last < first)) return { unsatisfiable: true };
  return { start: first, end: Math.min(last ?? size - 1, size - 1) };
}

// Serve only named local sample MP3s, never an arbitrary file/cache directory.
export function previewMediaPath(
  pathname,
  { enabled = false, root = 'tmp/radar-v2/preview-media' } = {},
) {
  if (!enabled) return null;
  const match = pathname.match(
    /^\/__radar-preview\/audio\/(daily-ai-radar-\d{4}-\d{2}-\d{2}(?:\.ja)?\.mp3)$/,
  );
  return match ? path.resolve(root, 'audio', match[1]) : null;
}
