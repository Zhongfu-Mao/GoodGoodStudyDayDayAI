import path from 'node:path';

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
