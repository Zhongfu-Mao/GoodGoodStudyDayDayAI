import { createHash } from 'node:crypto';
import { parseFrontmatter } from './frontmatter.mjs';

export const visualFingerprint = (value) => createHash('sha256').update(value).digest('hex');

export function reportEntries(source) {
  const { body } = parseFrontmatter(source);
  const headings = [...body.matchAll(/^### (.+)$/gm)];
  return headings.map((heading, index) => {
    const following = body.slice(heading.index + heading[0].length);
    const next = following.search(/^#{1,3} /m);
    const end = next < 0 ? body.length : heading.index + heading[0].length + next;
    const block = body.slice(heading.index, end).trimEnd();
    const linkLine =
      block.split('\n').find((line) => /链接|リンク|URL/.test(line) && /https?:/.test(line)) ?? '';
    const urls = [...linkLine.matchAll(/https?:\/\/[^\s<>"\])]+/g)].map((match) => match[0]);
    return {
      index,
      heading: heading[1],
      block,
      urls,
      start: source.length - body.length + heading.index,
      end: source.length - body.length + end,
    };
  });
}

function safeText(text) {
  return typeof text === 'string' && text.trim().length > 0 && !/[\r\n<>]/.test(text);
}

export function validateVisualManifest(manifest) {
  const errors = [];
  if (manifest.version !== 1 || !/^\d{4}-\d{2}-\d{2}$/.test(manifest.date ?? ''))
    errors.push('Invalid manifest version/date');
  if (!Array.isArray(manifest.visuals)) return [...errors, 'Missing visuals array'];
  if (manifest.visuals.length === 0) errors.push('At least one reviewed inline visual is required');
  if (manifest.visuals.length < 3 && !safeText(manifest.exception))
    errors.push('Fewer than three inline visuals requires a reviewed exception');
  if (manifest.visuals.length > 5)
    errors.push('More than five inline visuals requires a separate editorial decision');
  const ids = new Set();
  for (const visual of manifest.visuals) {
    const id = visual.id;
    if (!/^[a-z0-9-]+$/.test(id ?? '') || ids.has(id))
      errors.push(`Invalid or duplicate visual id: ${id}`);
    ids.add(id);
    if (visual.review !== 'accepted') errors.push(`${id}: visual QA not accepted`);
    if (!/^https:\/\//.test(visual.sourceUrl ?? '')) errors.push(`${id}: source URL required`);
    if (
      !/^https:\/\//.test(visual.originalImageUrl ?? '') &&
      visual.kind !== 'original-explanation'
    )
      errors.push(`${id}: original image URL required`);
    if (
      !/^\/images\/radar\/[a-zA-Z0-9/_.-]+\.(webp|png|jpe?g)$/.test(visual.asset ?? '') ||
      visual.asset?.includes('..')
    )
      errors.push(`${id}: invalid local image path`);
    if (!/^[a-f0-9]{64}$/.test(visual.sha256 ?? '')) errors.push(`${id}: asset checksum required`);
    if (!safeText(visual.credit)) errors.push(`${id}: credit required`);
    for (const locale of ['zh', 'ja']) {
      const entry = visual[locale];
      if (!entry || !safeText(entry.heading) || !safeText(entry.alt) || !safeText(entry.caption))
        errors.push(`${id}: missing ${locale} heading/alt/caption`);
    }
  }
  return errors;
}

export function visualBlock(visual, locale) {
  const { alt, caption } = visual[locale];
  const cleanAlt = alt.replace(/[[\]]/g, '');
  const attribution = locale === 'ja' ? '画像出典' : '图片来源';
  const expand =
    locale === 'ja' ? '画像をクリックすると原寸で表示します。' : '点击图片查看原尺寸。';
  return `<!-- radar-visual:${visual.id} -->\n[![${cleanAlt}](${visual.asset})](${visual.asset})\n\n*${caption} ${attribution}：[${visual.credit}](${visual.sourceUrl})。${expand}*\n<!-- /radar-visual:${visual.id} -->`;
}

export function insertVisuals(source, manifest, locale) {
  const errors = validateVisualManifest(manifest);
  if (errors.length) throw new Error(errors.join('\n'));
  let updated = source;
  for (const visual of manifest.visuals) {
    const matches = reportEntries(updated).filter(
      (entry) => entry.heading === visual[locale].heading && entry.urls.includes(visual.sourceUrl),
    );
    if (matches.length !== 1)
      throw new Error(
        `${manifest.date} ${locale} ${visual.id}: heading/source must match exactly one entry`,
      );
    const entry = matches[0];
    const block = visualBlock(visual, locale);
    const marker = `<!-- radar-visual:${visual.id} -->`;
    const closing = `<!-- /radar-visual:${visual.id} -->`;
    if (updated.includes(marker)) {
      if (!entry.block.includes(marker))
        throw new Error(`${visual.id}: managed image is in the wrong entry`);
      const start = updated.indexOf(marker),
        end = updated.indexOf(closing, start);
      if (end < 0 || updated.indexOf(marker, start + marker.length) >= 0)
        throw new Error(`Corrupt markers for ${visual.id}`);
      updated = updated.slice(0, start) + block + updated.slice(end + closing.length);
      continue;
    }
    if (/!\[/.test(entry.block))
      throw new Error(`${visual.id}: entry already has an unmanaged image; review before applying`);
    updated =
      updated.slice(0, entry.end).trimEnd() +
      '\n\n' +
      block +
      '\n\n' +
      updated.slice(entry.end).trimStart();
  }
  return `${updated.trimEnd()}\n`;
}
