import { readFile, readdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import process from 'node:process';
import { parseFrontmatter } from '../lib/frontmatter.mjs';
import { normalizeNewlines } from '../lib/markdown.mjs';

const WORKSPACE_ROOT = process.cwd();
const TARGET_DIR = path.join(WORKSPACE_ROOT, 'src/content/radar');

const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

export function hasRepresentativeImage(content) {
  return /^!\[[^\]]*?\]\([^)]+?\)$/m.test(content);
}

function normalizeImageSourceUrl(value) {
  if (!value) return null;
  const trimmed = value.trim().replace(/^["']|["']$/g, '');
  return /^https?:\/\//i.test(trimmed) ? trimmed : null;
}

export function extractCandidateUrls(content) {
  const meta = parseFrontmatter(content, { requireTitle: false });
  const explicitSource = normalizeImageSourceUrl(
    meta.raw.match(/^representativeImageSource:\s*(.*?)$/m)?.[1] ??
      meta.raw.match(/^representativeImageUrl:\s*(.*?)$/m)?.[1],
  );

  return explicitSource ? [explicitSource] : [];
}

function decodeHtmlEntities(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function extractMeta(html, key, attr = 'property') {
  const pattern = new RegExp(`<meta[^>]+${attr}=["']${key}["'][^>]+content=["']([^"']+)["']`, 'i');
  const reversePattern = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]+${attr}=["']${key}["']`,
    'i',
  );
  const match = html.match(pattern) ?? html.match(reversePattern);
  return match ? decodeHtmlEntities(match[1]) : '';
}

function extractTitle(html) {
  return (
    extractMeta(html, 'og:title') ||
    extractMeta(html, 'twitter:title', 'name') ||
    html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() ||
    ''
  );
}

export function isUsefulImage(url) {
  if (!url) return false;
  const lowered = url.toLowerCase();
  if (!/^https?:\/\//.test(lowered)) return false;
  return !/(favicon|apple-touch-icon|logo|avatar|profile)/.test(lowered);
}

export async function fetchMetadata(url) {
  const response = await fetch(url, {
    redirect: 'follow',
    headers: {
      'user-agent': USER_AGENT,
      accept: 'text/html,application/xhtml+xml',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const html = await response.text();
  const image =
    extractMeta(html, 'og:image') ||
    extractMeta(html, 'twitter:image', 'name') ||
    extractMeta(html, 'twitter:image:src', 'name');
  const title = extractTitle(html);

  return {
    title,
    image,
  };
}

function escapeAltText(text) {
  return text.replace(/[\[\]]/g, '').trim();
}

function getLocaleFromFile(file) {
  return file.endsWith('.ja.md') ? 'ja' : 'zh';
}

export function buildImageBlock({ title, image, url, locale }) {
  const safeTitle = escapeAltText(title || 'Representative image');
  const caption =
    locale === 'ja'
      ? `*代表画像は [${title || url}](${url}) から。本文で明示的に指定した代表シグナルとして掲載しています。*`
      : `*代表图来自 [${title || url}](${url})。这是正文明确指定的代表信号。*`;

  return ['---', `![${safeTitle}](${image})`, '', caption, ''].join('\n');
}

function insertAfterScope(content, imageBlock, locale) {
  const normalized = normalizeNewlines(content);
  const scopeHeading = locale === 'ja' ? '(?:本期范围|対象範囲|対象期間)' : '本期范围';
  const match = normalized.match(new RegExp(`(## ${scopeHeading}[\\s\\S]*?)(\\n## )`));
  if (match) {
    return normalized.replace(match[0], `${match[1].trimEnd()}\n\n${imageBlock}${match[2]}`);
  }

  const frontmatterMatch = normalized.match(/^---\n[\s\S]*?\n---\n?/);
  const bodyStart = frontmatterMatch ? frontmatterMatch[0].length : 0;
  const afterFrontmatter = normalized.slice(bodyStart);
  const headingIndex = afterFrontmatter.search(/(^|\n)#{1,3}\s+/);

  if (headingIndex >= 0) {
    const insertAt = bodyStart + headingIndex;
    return `${normalized.slice(0, insertAt).trimEnd()}\n\n${imageBlock}${normalized.slice(insertAt).trimStart()}`;
  }

  return `${normalized.trimEnd()}\n\n${imageBlock}`;
}

export async function main() {
  const requestedFiles = process.argv
    .slice(2)
    .filter((arg) => !arg.startsWith('-'))
    .map((arg) => path.basename(arg));
  const files = requestedFiles.length > 0
    ? requestedFiles
    : (await readdir(TARGET_DIR))
        .filter((file) => /^daily-ai-radar-\d{4}-\d{2}-\d{2}(?:\.ja)?\.md$/.test(file))
        .sort();

  for (const file of files) {
    if (!/^daily-ai-radar-\d{4}-\d{2}-\d{2}(?:\.ja)?\.md$/.test(file)) {
      console.warn(`warn ${file} is not a daily radar markdown file`);
      continue;
    }

    const fullPath = path.join(TARGET_DIR, file);
    const content = await readFile(fullPath, 'utf8');
    const locale = getLocaleFromFile(file);

    if (hasRepresentativeImage(content)) {
      console.log(`skip ${file} (already has image)`);
      continue;
    }

    const urls = extractCandidateUrls(content);
    let chosen = null;

    if (urls.length === 0) {
      console.warn(`warn ${file} no explicit representativeImageSource frontmatter`);
      continue;
    }

    for (const url of urls) {
      try {
        const metadata = await fetchMetadata(url);
        if (!isUsefulImage(metadata.image)) {
          continue;
        }

        chosen = {
          url,
          title: metadata.title || url,
          image: metadata.image,
          locale,
        };
        break;
      } catch (error) {
        console.warn(`warn ${file} ${url} -> ${error.message}`);
      }
    }

    if (!chosen) {
      console.warn(`warn ${file} no representative image found`);
      continue;
    }

    const updated = insertAfterScope(content, buildImageBlock(chosen), locale);
    await writeFile(fullPath, updated, 'utf8');
    console.log(`updated ${file} -> ${chosen.url}`);
  }
}

const isCliEntry = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (isCliEntry) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
