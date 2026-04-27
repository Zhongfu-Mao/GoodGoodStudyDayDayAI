import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { compressSpeechMp3 } from './lib/audio-compression.mjs';

const AUDIO_DIR = path.join(process.cwd(), 'public/audio/radar');

async function main() {
  const entries = await readdir(AUDIO_DIR, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.mp3'))
    .map((entry) => path.join(AUDIO_DIR, entry.name))
    .sort();

  let totalBefore = 0;
  let totalAfter = 0;

  for (const filePath of files) {
    const before = (await stat(filePath)).size;
    totalBefore += before;

    const result = await compressSpeechMp3(filePath);

    const after = (await stat(filePath)).size;
    totalAfter += after;
    const suffix = result.skipped ? ' (already mono 64k)' : '';
    console.log(`${path.basename(filePath)}: ${formatMb(before)} MB -> ${formatMb(after)} MB${suffix}`);
  }

  console.log(`Total: ${formatMb(totalBefore)} MB -> ${formatMb(totalAfter)} MB`);
}

function formatMb(bytes) {
  return (bytes / 1024 / 1024).toFixed(1);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
