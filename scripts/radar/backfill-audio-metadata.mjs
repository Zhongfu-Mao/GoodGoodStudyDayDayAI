import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { getAudioFileMetadata } from '../lib/audio-metadata.mjs';
import { parseFrontmatter, updateFrontmatterValue } from '../lib/frontmatter.mjs';

const WORKSPACE_ROOT = process.cwd();
const RADAR_DIR = path.join(WORKSPACE_ROOT, 'src/content/radar');

function parseArgs(argv) {
  return {
    write: argv.includes('--write'),
  };
}

function localAudioPath(audioUrl) {
  if (!audioUrl?.startsWith('/')) {
    return null;
  }

  const pathname = audioUrl.split(/[?#]/, 1)[0];
  return path.join(WORKSPACE_ROOT, 'public', pathname.replace(/^\/+/, ''));
}

async function main() {
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
