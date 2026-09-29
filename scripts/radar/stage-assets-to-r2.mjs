import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { listMigrationAssets, summarizeMigration } from '../lib/r2-migration.mjs';
import {
  createR2Client,
  hashR2File,
  headR2Object,
  matchesR2Object,
  missingR2StorageEnv,
  requireR2Env,
  uploadToR2,
} from '../lib/r2.mjs';

export async function stageAssets(argv = process.argv.slice(2)) {
  const options = { dryRun: false, verifyOnly: false, manifest: null };
  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index];
    if (arg === '--upload-only') continue;
    if (arg === '--dry-run') options.dryRun = true;
    else if (arg === '--verify-only') options.verifyOnly = true;
    else if (arg === '--manifest' && argv[index + 1] && !argv[index + 1].startsWith('--')) {
      options.manifest = path.resolve(argv[++index]);
    } else throw new Error(`Unknown or incomplete staging option: ${arg}`);
  }
  if (options.verifyOnly && (!options.manifest || options.dryRun)) {
    throw new Error('--verify-only requires --manifest and cannot be combined with --dry-run');
  }
  const missing = missingR2StorageEnv();
  if (!options.dryRun && missing.length)
    throw new Error(`Missing R2 storage config: ${missing.join(', ')}`);
  const bucket = missing.includes('R2_BUCKET') ? null : requireR2Env('R2_BUCKET');
  const manifestPath =
    options.manifest ?? path.resolve(`tmp/r2-migration/${Date.now()}/manifest.json`);
  const assets = await listMigrationAssets();
  const summary = summarizeMigration(assets);
  let record = {
    version: 1,
    bucket,
    createdAt: new Date().toISOString(),
    mode: options.dryRun ? 'plan' : 'private-staging',
    status: 'running',
    summary,
    assets: [],
  };
  if (options.verifyOnly) {
    record = JSON.parse(await readFile(manifestPath, 'utf8'));
    if (
      record.version !== 1 ||
      record.bucket !== bucket ||
      record.status !== 'complete' ||
      record.mode !== 'private-staging'
    ) {
      throw new Error('Manifest is not a completed staging record for the configured bucket');
    }
    const files = new Set(assets.map((asset) => asset.file));
    if (
      record.assets.length !== files.size ||
      new Set(record.assets.map((asset) => asset.file)).size !== files.size ||
      record.assets.some((asset) => !files.has(asset.file))
    ) {
      throw new Error('Tracked asset inventory changed since staging; stage again first');
    }
  }
  await mkdir(path.dirname(manifestPath), { recursive: true });
  let saveQueue = Promise.resolve();
  function save() {
    const json = `${JSON.stringify(record, null, 2)}\n`;
    saveQueue = saveQueue.then(async () => {
      await writeFile(`${manifestPath}.tmp`, json);
      await rename(`${manifestPath}.tmp`, manifestPath);
    });
    return saveQueue;
  }
  if (!options.verifyOnly) await save();
  console.log(
    JSON.stringify({
      phase: options.verifyOnly ? 'verify' : 'stage',
      dryRun: options.dryRun,
      bucket,
      manifestPath,
      ...summary,
    }),
  );
  const client = options.dryRun ? null : createR2Client();
  let next = 0;
  let completed = 0;
  let uploaded = 0;
  let reused = 0;
  let failure;
  const saved = new Map(record.assets.map((asset) => [asset.file, asset]));
  try {
    await Promise.all(
      Array.from({ length: 4 }, async () => {
        while (!failure && next < assets.length) {
          const asset = assets[next++];
          try {
            if (options.verifyOnly) {
              const previous = saved.get(asset.file);
              const digest = await hashR2File(asset.localPath);
              if (digest.sha256 !== previous.sha256 || digest.size !== previous.size)
                throw new Error(`Local asset changed: ${asset.file}`);
              if (!matchesR2Object(await headR2Object(client, previous.key), digest))
                throw new Error(`Remote verification failed: ${previous.key}`);
            } else if (options.dryRun) {
              const digest = await hashR2File(asset.localPath);
              record.assets.push({
                file: asset.file,
                key: asset.key,
                ...digest,
                status: 'planned',
              });
            } else {
              const result = await uploadToR2(client, {
                localPath: asset.localPath,
                key: asset.key,
                includePublicUrl: false,
                preserveExisting: true,
              });
              if (result.uploaded) uploaded++;
              else reused++;
              record.assets.push({
                file: asset.file,
                key: result.key,
                size: result.size,
                sha256: result.sha256,
                md5: result.md5,
                status: result.uploaded ? 'uploaded-verified' : 'reused-verified',
              });
              await save();
            }
            completed++;
            if (completed % 50 === 0 || completed === assets.length)
              console.log(JSON.stringify({ completed, total: assets.length, uploaded, reused }));
          } catch (error) {
            failure ??= error;
          }
        }
      }),
    );
    if (failure) throw failure;
    if (options.verifyOnly) record.verifiedAt = new Date().toISOString();
    else {
      record.assets.sort((a, b) => a.file.localeCompare(b.file));
      record.status = 'complete';
      record.completedAt = new Date().toISOString();
      record.uploaded = uploaded;
      record.reused = reused;
    }
    await save();
    console.log(
      JSON.stringify({
        status: 'complete',
        verifiedOnly: options.verifyOnly,
        dryRun: options.dryRun,
        files: completed,
        uploaded,
        reused,
        sourceFilesChanged: 0,
        manifestPath,
      }),
    );
  } catch (error) {
    if (!options.verifyOnly) record.status = 'failed';
    record.lastError = error.message;
    await save();
    throw error;
  } finally {
    client?.destroy();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  stageAssets().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
