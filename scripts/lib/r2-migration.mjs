import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import { lstat } from 'node:fs/promises';

const exec = promisify(execFile);

export function isMigrationAsset(file) {
  return (
    /^public\/audio\/radar\/.+\.mp3$/i.test(file) ||
    /^public\/decks\/radar\/.+\.pdf$/i.test(file) ||
    /^public\/images\/radar\/.+\.(png|jpe?g|webp|svg)$/i.test(file) ||
    /^public\/images\/podcast-cover(?:-ai-radar-20260510)?\.jpg$/.test(file)
  );
}

export async function listMigrationAssets(root = process.cwd()) {
  // Untracked corrected images and backup audio have not been accepted for publication.
  const { stdout } = await exec('git', ['ls-files', '-z', '--', 'public'], { cwd: root });
  const assets = [];
  for (const file of stdout.split('\0').filter(isMigrationAsset).sort()) {
    const localPath = path.join(root, file);
    const info = await lstat(localPath);
    if (!info.isFile()) throw new Error(`Expected a regular asset file: ${file}`);
    assets.push({ file, localPath, key: file.slice('public/'.length), size: info.size });
  }
  return assets;
}

export function summarizeMigration(assets) {
  const groups = {};
  for (const asset of assets) {
    const group = asset.key.split('/').slice(0, 2).join('/');
    groups[group] ??= { files: 0, bytes: 0 };
    groups[group].files++;
    groups[group].bytes += asset.size;
  }
  return {
    files: assets.length,
    bytes: assets.reduce((total, asset) => total + asset.size, 0),
    groups,
  };
}
