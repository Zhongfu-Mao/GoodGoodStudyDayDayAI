import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { detectImageFormat, optimizeWebpImage } from '../../scripts/lib/image-compression.mjs';

const PNG_BYTES = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
]);

const WEBP_BYTES = Buffer.from([
  0x52, 0x49, 0x46, 0x46, 0x08, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
]);

describe('radar image compression', () => {
  it('detects PNG and WebP signatures from bytes', () => {
    expect(detectImageFormat(PNG_BYTES)).toBe('png');
    expect(detectImageFormat(WEBP_BYTES)).toBe('webp');
  });

  it('rewrites a PNG payload saved as .webp into a real WebP payload', async () => {
    const tempDir = await mkdtemp(path.join(os.tmpdir(), 'radar-image-test-'));
    const imagePath = path.join(tempDir, 'daily-ai-radar-test-infographic.webp');

    try {
      await writeFile(imagePath, PNG_BYTES);
      const result = await optimizeWebpImage(imagePath, {
        runCommand: async (_command, args) => {
          const outputPath = String(args.at(-1));
          await writeFile(outputPath, WEBP_BYTES);
          return { stdout: '', stderr: '' };
        },
      });

      expect(result.skipped).toBe(false);
      expect(result.formatBefore).toBe('png');
      expect(result.formatAfter).toBe('webp');
      expect(detectImageFormat(await readFile(imagePath))).toBe('webp');
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it('leaves an existing WebP payload alone by default', async () => {
    const tempDir = await mkdtemp(path.join(os.tmpdir(), 'radar-image-test-'));
    const imagePath = path.join(tempDir, 'daily-ai-radar-test-infographic.webp');
    let commandCalled = false;

    try {
      await writeFile(imagePath, WEBP_BYTES);
      const result = await optimizeWebpImage(imagePath, {
        runCommand: async () => {
          commandCalled = true;
          return { stdout: '', stderr: '' };
        },
      });

      expect(result).toMatchObject({ skipped: true, reason: 'already-webp' });
      expect(commandCalled).toBe(false);
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });
});
