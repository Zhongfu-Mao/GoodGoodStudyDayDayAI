import { spawn } from 'node:child_process';
import { mkdtemp, readFile, rename, rm, stat } from 'node:fs/promises';
import path from 'node:path';

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const WEBP_RIFF = 'RIFF';
const WEBP_MARKER = 'WEBP';

export function detectImageFormat(buffer) {
  if (PNG_SIGNATURE.every((byte, index) => buffer[index] === byte)) {
    return 'png';
  }

  if (
    buffer.subarray(0, 4).toString('ascii') === WEBP_RIFF &&
    buffer.subarray(8, 12).toString('ascii') === WEBP_MARKER
  ) {
    return 'webp';
  }

  return 'unknown';
}

export async function optimizeWebpImage(
  filePath,
  { quality = 82, force = false, runCommand = defaultRunCommand } = {},
) {
  if (path.extname(filePath).toLowerCase() !== '.webp') {
    return { skipped: true, reason: 'not-webp-target' };
  }

  const beforeBuffer = await readFile(filePath);
  const formatBefore = detectImageFormat(beforeBuffer);
  const sizeBefore = (await stat(filePath)).size;

  if (formatBefore === 'webp' && !force) {
    return {
      skipped: true,
      reason: 'already-webp',
      formatBefore,
      sizeBefore,
      sizeAfter: sizeBefore,
    };
  }

  const tempDir = await mkdtemp(path.join(path.dirname(filePath), '.radar-image-'));
  const tempPath = path.join(tempDir, path.basename(filePath));

  try {
    await runCommand('cwebp', ['-quiet', '-q', String(quality), filePath, '-o', tempPath]);

    const afterBuffer = await readFile(tempPath);
    const formatAfter = detectImageFormat(afterBuffer);

    if (formatAfter !== 'webp') {
      throw new Error(`cwebp did not produce a WebP file for ${path.basename(filePath)}.`);
    }

    await rename(tempPath, filePath);
    const sizeAfter = (await stat(filePath)).size;

    return {
      skipped: false,
      formatBefore,
      formatAfter,
      sizeBefore,
      sizeAfter,
      savedBytes: sizeBefore - sizeAfter,
    };
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

export function formatImageCompressionResult(result) {
  if (result.skipped) {
    return `skipped (${result.reason})`;
  }

  const beforeMb = formatMb(result.sizeBefore);
  const afterMb = formatMb(result.sizeAfter);
  const savedPct =
    result.sizeBefore > 0 ? Math.round((result.savedBytes / result.sizeBefore) * 100) : 0;

  return `${result.formatBefore} -> ${result.formatAfter}, ${beforeMb} MB -> ${afterMb} MB (-${savedPct}%)`;
}

function formatMb(bytes) {
  return (bytes / 1024 / 1024).toFixed(1);
}

function defaultRunCommand(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', (error) => {
      if (error.code === 'ENOENT') {
        reject(new Error(`Missing required command \`${command}\`. Install webp and try again.`));
        return;
      }

      reject(error);
    });
    child.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
        return;
      }

      reject(new Error(stderr.trim() || `${command} exited with code ${code}`));
    });
  });
}
