import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const WORKSPACE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const RADAR_CONTENT_ROOT = path.join(WORKSPACE_ROOT, 'src', 'content', 'radar');
const PUBLIC_ROOT = path.join(WORKSPACE_ROOT, 'public');
const SIZE = 2000;
const FORCE = process.argv.includes('--force');

function frontmatterValue(markdown, key) {
  const match = markdown.match(new RegExp(`^${key}:\\s*["']?([^\\n"']+)["']?`, 'm'));
  return match?.[1]?.trim() ?? '';
}

function toPublicFilePath(assetUrl) {
  if (!assetUrl.startsWith('/')) return null;
  return path.join(PUBLIC_ROOT, assetUrl.replace(/^\/+/, '').split(/[?#]/, 1)[0]);
}

function podcastArtworkPath(sourcePath) {
  const parsed = path.parse(sourcePath);
  return path.join(parsed.dir, `${parsed.name}-podcast.jpg`);
}

async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function listMarkdownFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const current = path.join(dir, entry.name);
      if (entry.isDirectory()) return listMarkdownFiles(current);
      return entry.name.endsWith('.md') ? [current] : [];
    }),
  );
  return files.flat();
}

function imagePage(imageDataUrl) {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      html, body {
        margin: 0;
        width: ${SIZE}px;
        height: ${SIZE}px;
        background: #061321;
      }

      .frame {
        position: relative;
        width: ${SIZE}px;
        height: ${SIZE}px;
        overflow: hidden;
        background:
          radial-gradient(circle at 28% 32%, rgba(56, 189, 248, 0.32), transparent 34%),
          radial-gradient(circle at 74% 68%, rgba(250, 204, 21, 0.12), transparent 32%),
          linear-gradient(135deg, #061321 0%, #0b2235 52%, #101820 100%);
      }

      .blur {
        position: absolute;
        inset: -4%;
        width: 108%;
        height: 108%;
        object-fit: cover;
        filter: blur(46px) saturate(1.18) brightness(0.72);
        opacity: 0.82;
      }

      .cover {
        position: absolute;
        left: 5%;
        top: 17.5%;
        width: 90%;
        height: 50.4%;
        object-fit: cover;
        border-radius: 2.8%;
        box-shadow: 0 72px 180px rgba(0, 0, 0, 0.48);
      }

      .vignette {
        position: absolute;
        inset: 0;
        box-shadow: inset 0 0 0 24px rgba(148, 163, 184, 0.12), inset 0 0 180px rgba(0, 0, 0, 0.72);
      }
    </style>
  </head>
  <body>
    <main class="frame">
      <img class="blur" src="${imageDataUrl}" alt="" />
      <img class="cover" src="${imageDataUrl}" alt="" />
      <div class="vignette"></div>
    </main>
  </body>
</html>`;
}

function detectMime(buffer, sourcePath) {
  if (buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return 'image/png';
  }
  if (buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) {
    return 'image/jpeg';
  }
  if (buffer.subarray(0, 4).toString('ascii') === 'RIFF' && buffer.subarray(8, 12).toString('ascii') === 'WEBP') {
    return 'image/webp';
  }

  const extension = path.extname(sourcePath).toLowerCase();
  if (extension === '.png') return 'image/png';
  if (extension === '.jpg' || extension === '.jpeg') return 'image/jpeg';
  if (extension === '.webp') return 'image/webp';
  return 'application/octet-stream';
}

async function renderArtwork(browser, sourcePath, outputPath) {
  const page = await browser.newPage({ viewport: { width: SIZE, height: SIZE }, deviceScaleFactor: 1 });
  const sourceBuffer = await fs.readFile(sourcePath);
  const sourceUrl = `data:${detectMime(sourceBuffer, sourcePath)};base64,${sourceBuffer.toString('base64')}`;
  await page.setContent(imagePage(sourceUrl), { waitUntil: 'networkidle' });
  await page.locator('.cover').waitFor({ state: 'visible' });
  const buffer = await page.screenshot({ type: 'jpeg', quality: 88, fullPage: false });
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, buffer);
  await page.close();
}

async function main() {
  const markdownFiles = await listMarkdownFiles(RADAR_CONTENT_ROOT);
  const coverPaths = new Set();

  for (const filePath of markdownFiles) {
    const markdown = await fs.readFile(filePath, 'utf8');
    const audioUrl = frontmatterValue(markdown, 'audioUrl');
    if (!audioUrl) continue;

    const coverImage = frontmatterValue(markdown, 'coverImage');
    const publicFilePath = coverImage ? toPublicFilePath(coverImage) : null;
    if (!publicFilePath || !(await pathExists(publicFilePath))) continue;
    coverPaths.add(publicFilePath);
  }

  if (coverPaths.size === 0) {
    console.log('No radar cover images found.');
    return;
  }

  const browser = await chromium.launch();
  let generated = 0;
  let skipped = 0;

  try {
    for (const sourcePath of [...coverPaths].sort()) {
      const outputPath = podcastArtworkPath(sourcePath);
      if (!FORCE && (await pathExists(outputPath))) {
        skipped += 1;
        continue;
      }
      await renderArtwork(browser, sourcePath, outputPath);
      generated += 1;
      console.log(`generated ${path.relative(WORKSPACE_ROOT, outputPath)}`);
    }
  } finally {
    await browser.close();
  }

  console.log(`Podcast artwork complete. Generated ${generated}, skipped ${skipped}.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
