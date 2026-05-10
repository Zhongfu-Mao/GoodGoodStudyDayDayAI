import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import {
  createR2Client,
  getPublicUrl,
  isR2Configured,
  missingR2Env,
  uploadToR2,
} from '../lib/r2.mjs';

const WORKSPACE_ROOT = process.cwd();
const CONTENT_DIR = path.join(WORKSPACE_ROOT, 'src/content');
const ASSET_GROUPS = [
  {
    dir: path.join(WORKSPACE_ROOT, 'public/audio/radar'),
    match: (file) => file.endsWith('.mp3'),
  },
  {
    dir: path.join(WORKSPACE_ROOT, 'public/images/radar'),
    match: (file) => /-infographic\.(png|jpe?g|webp)$/i.test(file),
  },
];

function parseArgs(argv) {
  const options = {
    dryRun: false,
    publicBase: process.env.R2_PUBLIC_BASE ?? null,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--dry-run') {
      options.dryRun = true;
      continue;
    }

    if (arg === '--public-base') {
      options.publicBase = argv[index + 1] ?? options.publicBase;
      index += 1;
    }
  }

  return options;
}

async function listMarkdownFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await listMarkdownFiles(entryPath)));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(entryPath);
    }
  }

  return files.sort();
}

async function listAssets() {
  const assets = [];

  for (const group of ASSET_GROUPS) {
    let files = [];

    try {
      files = await readdir(group.dir);
    } catch (error) {
      if (error.code === 'ENOENT') {
        continue;
      }

      throw error;
    }

    for (const file of files.filter(group.match).sort()) {
      const localPath = path.join(group.dir, file);
      const key = path
        .relative(path.join(WORKSPACE_ROOT, 'public'), localPath)
        .replaceAll(path.sep, '/');
      const localUrl = `/${key}`;
      assets.push({ localPath, key, localUrl });
    }
  }

  return assets;
}

function buildReplacementMap(assets, publicBase) {
  const replacements = new Map();

  for (const asset of assets) {
    const remoteUrl = publicBase
      ? `${publicBase.replace(/\/$/, '')}/${asset.key}`
      : getPublicUrl(asset.key);

    replacements.set(asset.localUrl, remoteUrl);
  }

  return replacements;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function replaceAssetUrls(source, replacements) {
  let updated = source;
  let count = 0;

  for (const [from, to] of replacements.entries()) {
    const optionalAudioQuery = from.endsWith('.mp3') ? '(?:\\?v=[A-Za-z0-9_-]+)?' : '';
    const pattern = new RegExp(`(?<![A-Za-z0-9])${escapeRegExp(from)}${optionalAudioQuery}`, 'g');
    const matches = updated.match(pattern);

    if (matches) {
      count += matches.length;
      updated = updated.replace(pattern, () => to);
    }
  }

  return { updated, count };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const assets = await listAssets();
  const markdownFiles = await listMarkdownFiles(CONTENT_DIR);

  if (!options.dryRun && !isR2Configured()) {
    throw new Error(`R2 is not configured. Missing: ${missingR2Env().join(', ')}`);
  }

  if (options.dryRun && !options.publicBase && !isR2Configured()) {
    console.log('R2_PUBLIC_BASE is not set; dry-run URLs will use https://media.example.invalid.');
    options.publicBase = 'https://media.example.invalid';
  }

  const replacements = buildReplacementMap(assets, options.publicBase);
  const client = options.dryRun ? null : createR2Client();
  const summary = {
    assets: assets.length,
    uploaded: 0,
    reused: 0,
    markdownFilesChanged: 0,
    markdownReplacements: 0,
  };

  for (const asset of assets) {
    const remoteUrl = replacements.get(asset.localUrl);

    if (options.dryRun) {
      console.log(`[dry-run] ${asset.localUrl} -> ${remoteUrl}`);
      continue;
    }

    const result = await uploadToR2(client, { localPath: asset.localPath, key: asset.key });

    if (result.uploaded) {
      summary.uploaded += 1;
      console.log(`uploaded ${asset.key}`);
    } else {
      summary.reused += 1;
      console.log(`reused ${asset.key}`);
    }
  }

  for (const filePath of markdownFiles) {
    const raw = await readFile(filePath, 'utf8');
    const { updated, count } = replaceAssetUrls(raw, replacements);

    if (count === 0) {
      continue;
    }

    summary.markdownFilesChanged += 1;
    summary.markdownReplacements += count;

    if (options.dryRun) {
      console.log(
        `[dry-run] would update ${path.relative(WORKSPACE_ROOT, filePath)} (${count} URL refs)`,
      );
    } else {
      await writeFile(filePath, updated, 'utf8');
      console.log(`updated ${path.relative(WORKSPACE_ROOT, filePath)} (${count} URL refs)`);
    }
  }

  console.log(
    [
      `${options.dryRun ? 'Would process' : 'Processed'} ${summary.assets} assets`,
      `uploaded=${summary.uploaded}`,
      `reused=${summary.reused}`,
      `markdownFilesChanged=${summary.markdownFilesChanged}`,
      `markdownReplacements=${summary.markdownReplacements}`,
    ].join(' '),
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
