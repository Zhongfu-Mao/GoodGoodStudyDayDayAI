import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { isMigrationAsset, listMigrationAssets } from '../../scripts/lib/r2-migration.mjs';
import { hashR2File, matchesR2Object, uploadToR2 } from '../../scripts/lib/r2.mjs';

const temporary: string[] = [];
afterEach(async () => {
  vi.unstubAllEnvs();
  await Promise.all(temporary.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

async function fixture() {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'r2-migration-'));
  temporary.push(dir);
  const file = path.join(dir, 'audio.mp3');
  await writeFile(file, 'new audio');
  vi.stubEnv('R2_BUCKET', 'test-media');
  vi.stubEnv('ALLOW_R2_DEV_PUBLIC_BASE', '0');
  vi.stubEnv('R2_PUBLIC_BASE', 'https://media.example.com');
  return { dir, file, digest: await hashR2File(file) };
}

describe('R2 content verification', () => {
  it('does not reuse different content just because the byte length matches', async () => {
    const { digest } = await fixture();
    expect(matchesR2Object({ ContentLength: digest.size, ETag: 'different' }, digest)).toBe(false);
    expect(matchesR2Object({ ContentLength: digest.size, ETag: `"${digest.md5}"` }, digest)).toBe(
      true,
    );
    expect(
      matchesR2Object({ ContentLength: digest.size, Metadata: { sha256: digest.sha256 } }, digest),
    ).toBe(true);
  });

  it('reuses a checksummed legacy object without enabling its public URL', async () => {
    const { file, digest } = await fixture();
    vi.stubEnv('R2_PUBLIC_BASE', 'https://disabled.r2.dev');
    const send = vi.fn().mockResolvedValue({ ContentLength: digest.size, ETag: `"${digest.md5}"` });
    const result = await uploadToR2(
      { send },
      {
        localPath: file,
        key: 'audio/radar/test.mp3',
        includePublicUrl: false,
        preserveExisting: true,
      },
    );
    expect(result).toMatchObject({ uploaded: false, publicUrl: null, sha256: digest.sha256 });
    expect(send).toHaveBeenCalledTimes(1);
  });

  it('preserves conflicting old content under its original key', async () => {
    const { file, digest } = await fixture();
    const send = vi
      .fn()
      .mockResolvedValueOnce({ ContentLength: digest.size, ETag: 'old' })
      .mockRejectedValueOnce({ name: 'NotFound', $metadata: { httpStatusCode: 404 } })
      .mockImplementationOnce(async (command) => {
        for await (const _chunk of command.input.Body) {
          /* consume the mock upload */
        }
        expect(command.input.IfNoneMatch).toBe('*');
        expect(command.input.ContentMD5).toBe(
          createHash('md5').update('new audio').digest('base64'),
        );
        expect(command.input.StorageClass).toBe('STANDARD');
        return {};
      })
      .mockResolvedValueOnce({ ContentLength: digest.size, Metadata: { sha256: digest.sha256 } });
    const result = await uploadToR2(
      { send },
      {
        localPath: file,
        key: 'audio/radar/test.mp3',
        includePublicUrl: false,
        preserveExisting: true,
      },
    );
    expect(result.key).toBe(`audio/radar/test-${digest.sha256}.mp3`);
    expect(result.uploaded).toBe(true);
  });

  it('does not treat an access error as an absent object', async () => {
    const { file } = await fixture();
    const send = vi.fn().mockRejectedValue(new Error('AccessDenied'));
    await expect(
      uploadToR2({ send }, { localPath: file, key: 'audio/test.mp3', includePublicUrl: false }),
    ).rejects.toThrow('AccessDenied');
    expect(send).toHaveBeenCalledTimes(1);
  });

  it('rejects a public development URL before issuing any storage request', async () => {
    const { file } = await fixture();
    vi.stubEnv('R2_PUBLIC_BASE', 'https://disabled.r2.dev');
    const send = vi.fn();
    await expect(uploadToR2({ send }, { localPath: file, key: 'audio/test.mp3' })).rejects.toThrow(
      'development URL',
    );
    expect(send).not.toHaveBeenCalled();
  });

  it('does not report an upload successful when the read-back checksum differs', async () => {
    const { file } = await fixture();
    const send = vi
      .fn()
      .mockResolvedValueOnce(null)
      .mockImplementationOnce(async (command) => {
        for await (const _chunk of command.input.Body) {
          /* consume the mock upload */
        }
        return {};
      })
      .mockResolvedValueOnce({ ContentLength: 9, ETag: 'wrong' });
    await expect(
      uploadToR2({ send }, { localPath: file, key: 'audio/test.mp3', includePublicUrl: false }),
    ).rejects.toThrow('verification failed');
  });
});

it('plans tracked audio, decks and images while preserving source files and ignoring untracked backups', async () => {
  const { dir } = await fixture();
  execFileSync('git', ['init', '-q', dir]);
  const files = [
    'public/audio/radar/test.mp3',
    'public/decks/radar/test.pdf',
    'public/images/radar/test-corrected.webp',
  ];
  for (const file of [...files, 'public/audio/radar/untracked.mp3']) {
    await mkdir(path.dirname(path.join(dir, file)), { recursive: true });
    await writeFile(path.join(dir, file), file);
  }
  execFileSync('git', ['add', ...files], { cwd: dir });
  expect((await listMigrationAssets(dir)).map((a) => a.file)).toEqual(files.sort());
  expect(isMigrationAsset('public/images/unrelated.jpg')).toBe(false);
  const manifest = path.join(dir, 'plan.json');
  const command = path.resolve('scripts/radar/stage-assets-to-r2.mjs');
  execFileSync(process.execPath, [command, '--upload-only', '--dry-run', '--manifest', manifest], {
    cwd: dir,
  });
  const plan = JSON.parse(await readFile(manifest, 'utf8'));
  expect(plan).toMatchObject({ mode: 'plan', status: 'complete', summary: { files: 3 } });
  expect(plan.assets.every((asset: { sha256: string }) => asset.sha256.length === 64)).toBe(true);
  for (const file of files) expect(await readFile(path.join(dir, file), 'utf8')).toBe(file);
});
