import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { assertSafeR2PublicBase, isR2DevPublicBase, isR2Enabled, loadDotEnv } from '../lib/r2.mjs';

const WORKSPACE_ROOT = process.cwd();
const TEXT_EXTENSIONS = new Set([
  '.astro',
  '.css',
  '.js',
  '.json',
  '.md',
  '.mdx',
  '.mjs',
  '.rss',
  '.ts',
  '.tsx',
  '.xml',
  '.yaml',
  '.yml',
]);
const DEFAULT_SCAN_DIRS = ['src/content', 'src/pages', 'src/components', 'src/lib'];
const R2_DEV_URL_PATTERN = /https:\/\/[^\s"'<>)]*\.r2\.dev[^\s"'<>)]*/gi;

function parseArgs(argv) {
  const options = {
    envOnly: false,
    scanContent: false,
  };

  for (const arg of argv) {
    if (arg === '--env-only') {
      options.envOnly = true;
    } else if (arg === '--scan-content') {
      options.scanContent = true;
    }
  }

  if (!options.envOnly && !options.scanContent) {
    options.envOnly = true;
  }

  return options;
}

async function listTextFiles(dir) {
  const absoluteDir = path.join(WORKSPACE_ROOT, dir);
  let entries = [];

  try {
    entries = await readdir(absoluteDir, { withFileTypes: true });
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }

    throw error;
  }

  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await listTextFiles(entryPath)));
    } else if (entry.isFile() && TEXT_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(entryPath);
    }
  }

  return files.sort();
}

function lineNumberForIndex(source, index) {
  return source.slice(0, index).split(/\r?\n/).length;
}

async function findR2DevUrls() {
  const files = (await Promise.all(DEFAULT_SCAN_DIRS.map(listTextFiles))).flat();
  const matches = [];

  for (const file of files) {
    const source = await readFile(path.join(WORKSPACE_ROOT, file), 'utf8');

    for (const match of source.matchAll(R2_DEV_URL_PATTERN)) {
      matches.push({
        file,
        line: lineNumberForIndex(source, match.index ?? 0),
        url: match[0],
      });
    }
  }

  return matches;
}

function checkEnvPublicBase() {
  loadDotEnv();

  if (!isR2Enabled()) {
    console.log('R2_ENABLED is not 1; R2 publishing is disabled.');
    return;
  }

  const publicBase = process.env.R2_PUBLIC_BASE;

  if (!publicBase) {
    console.log('R2_PUBLIC_BASE is not set; skipped R2 public base guardrail.');
    return;
  }

  assertSafeR2PublicBase(publicBase);
  console.log(`R2_PUBLIC_BASE is safe: ${publicBase.replace(/\/$/, '')}`);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.envOnly) {
    checkEnvPublicBase();
  }

  if (options.scanContent) {
    const matches = await findR2DevUrls();

    if (matches.length === 0) {
      console.log('No committed r2.dev media URLs found in content/source files.');
      return;
    }

    console.error(`Found ${matches.length} r2.dev URL reference(s).`);

    for (const match of matches.slice(0, 40)) {
      console.error(`${match.file}:${match.line} ${match.url}`);
    }

    if (matches.length > 40) {
      console.error(`...and ${matches.length - 40} more.`);
    }

    if (matches.some((match) => isR2DevPublicBase(match.url))) {
      console.error(
        [
          'Move these media URLs to an R2 custom domain before disabling the public development URL.',
          'This audit intentionally fails while r2.dev URLs are still published.',
        ].join(' '),
      );
    }

    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
