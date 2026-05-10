import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { getAudioFileMetadata } from '../lib/audio-metadata.mjs';
import { parseFrontmatter, updateFrontmatterValue } from '../lib/frontmatter.mjs';
import { loadDotEnv } from '../lib/r2.mjs';

const WORKSPACE_ROOT = process.cwd();
const RADAR_DIR = path.join(WORKSPACE_ROOT, 'src/content/radar');

function parseArgs(argv) {
  return {
    write: argv.includes('--write'),
  };
}

function localAudioPath(audioUrl) {
  if (!audioUrl?.startsWith('/')) {
    const key = publicR2Key(audioUrl);
    return key ? path.join(WORKSPACE_ROOT, 'public', key) : null;
  }

  const pathname = audioUrl.split(/[?#]/, 1)[0];
  return path.join(WORKSPACE_ROOT, 'public', pathname.replace(/^\/+/, ''));
}

function publicR2Key(audioUrl) {
  const publicBase = process.env.R2_PUBLIC_BASE?.replace(/\/$/, '');

  if (!publicBase) {
    return null;
  }

  try {
    const base = new URL(publicBase);
    const url = new URL(audioUrl);
    const basePath = base.pathname.replace(/\/$/, '');

    if (url.origin !== base.origin || !url.pathname.startsWith(`${basePath}/`)) {
      return null;
    }

    return decodeURIComponent(url.pathname.slice(basePath.length + 1));
  } catch {
    return null;
  }
}

async function main() {
  loadDotEnv();
  const options = parseArgs(process.argv.slice(2));
  const markdownFiles = (await readdir(RADAR_DIR)).filter((file) => file.endsWith('.md')).sort();
  const updates = [];

  for (const file of markdownFiles) {
    const filePath = path.join(RADAR_DIR, file);
    const raw = await readFile(filePath, 'utf8');
    const meta = parseFrontmatter(raw);
    const audioPath = localAudioPath(meta.audioUrl);

    if (!audioPath) {
      continue;
    }

    const audio = await getAudioFileMetadata(audioPath);
    let updated = raw;

    if (audio.duration) {
      updated = updateFrontmatterValue(updated, 'audioDuration', audio.duration, {
        anchor: 'audioUrl',
        position: 'after',
      });
    }

    updated = updateFrontmatterValue(updated, 'audioSize', audio.size, {
      anchor: 'audioDuration',
      position: 'after',
    });

    if (updated !== raw) {
      updates.push({ file, duration: audio.duration, size: audio.size });

      if (options.write) {
        await writeFile(filePath, updated, 'utf8');
      }
    }
  }

  for (const update of updates) {
    console.log(`${update.file}\tduration=${update.duration ?? 'unknown'}\tsize=${update.size}`);
  }

  console.log(`${options.write ? 'Updated' : 'Would update'} ${updates.length} radar entries.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
