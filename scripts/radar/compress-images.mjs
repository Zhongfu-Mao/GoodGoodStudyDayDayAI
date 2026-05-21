import { readdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { formatImageCompressionResult, optimizeWebpImage } from '../lib/image-compression.mjs';

const WORKSPACE_ROOT = process.cwd();
const IMAGE_DIR = path.join(WORKSPACE_ROOT, 'public/images/radar');

function parseArgs(argv) {
  const options = {
    files: [],
    dryRun: false,
    quality: 82,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--file') {
      options.files.push(argv[index + 1]);
      index += 1;
      continue;
    }

    if (arg === '--dry-run') {
      options.dryRun = true;
      continue;
    }

    if (arg === '--quality') {
      options.quality = Number(argv[index + 1] ?? options.quality);
      index += 1;
    }
  }

  return options;
}

async function listTargets(files) {
  if (files.length > 0) {
    return files.map((file) => (path.isAbsolute(file) ? file : path.join(WORKSPACE_ROOT, file)));
  }

  const entries = await readdir(IMAGE_DIR, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isFile() && /-infographic\.webp$/i.test(entry.name))
    .map((entry) => path.join(IMAGE_DIR, entry.name))
    .sort();
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const targets = await listTargets(options.files);
  let converted = 0;
  let skipped = 0;
  let savedBytes = 0;

  for (const target of targets) {
    if (options.dryRun) {
      console.log(`[dry-run] ${path.relative(WORKSPACE_ROOT, target)}`);
      continue;
    }

    const result = await optimizeWebpImage(target, { quality: options.quality });

    if (result.skipped) {
      skipped += 1;
    } else {
      converted += 1;
      savedBytes += result.savedBytes;
    }

    console.log(
      `${path.relative(WORKSPACE_ROOT, target)}: ${formatImageCompressionResult(result)}`,
    );
  }

  if (!options.dryRun) {
    console.log(
      `Converted ${converted} file(s), skipped ${skipped}, saved ${(savedBytes / 1024 / 1024).toFixed(1)} MB.`,
    );
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
