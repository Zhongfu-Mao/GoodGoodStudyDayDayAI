import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { normalizeNewlines } from '../lib/markdown.mjs';

const WORKSPACE_ROOT = process.cwd();
const TARGET_DIR = path.join(WORKSPACE_ROOT, 'src/content/radar');

const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

function hasRepresentativeImage(content) {
  return /^!\[[^\]]*?\]\([^)]+?\)$/m.test(content);
}

function extractCandidateUrls(content) {
  const urls = [];

  for (const line of normalizeNewlines(content).split('\n')) {
    if (!/(链接|Direct Link|Source)/i.test(line)) {
      continue;
    }

    for (const match of line.matchAll(/\[[^\]]+\]\((https?:\/\/[^)]+)\)/g)) {
      urls.push(match[1]);
    }

    for (const match of line.matchAll(/<?(https?:\/\/[^>\s)]+)>?/g)) {
      urls.push(match[1]);
    }
  }

  return [...new Set(urls)];
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

function isUsefulImage(url) {
  if (!url) return false;
  const lowered = url.toLowerCase();
  if (!/^https?:\/\//.test(lowered)) return false;
  return !/(favicon|apple-touch-icon|logo|avatar|profile)/.test(lowered);
}

async function fetchMetadata(url) {
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

function buildImageBlock({ title, image, url }) {
  const safeTitle = escapeAltText(title || 'Representative image');
  return [
    '---',
    `![${safeTitle}](${image})`,
    '',
    `*代表图来自 [${title || url}](${url})。它对应这期日报里最能概括当天主线的一条原始信号。*`,
    '',
  ].join('\n');
}

function insertAfterScope(content, imageBlock) {
  const normalized = normalizeNewlines(content);
  const match = normalized.match(/(## 本期范围[\s\S]*?)(\n## )/);
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

async function main() {
  const files = (await readdir(TARGET_DIR))
    .filter((file) => /^daily-ai-radar-\d{4}-\d{2}-\d{2}\.md$/.test(file))
    .sort();

  for (const file of files) {
    const fullPath = path.join(TARGET_DIR, file);
    const content = await readFile(fullPath, 'utf8');

    if (hasRepresentativeImage(content)) {
      console.log(`skip ${file} (already has image)`);
      continue;
    }

    const urls = extractCandidateUrls(content);
    let chosen = null;

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

    const updated = insertAfterScope(content, buildImageBlock(chosen));
    await writeFile(fullPath, updated, 'utf8');
    console.log(`updated ${file} -> ${chosen.url}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
