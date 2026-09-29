import { HeadObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { createHash } from 'node:crypto';
import { createReadStream, readFileSync } from 'node:fs';
import { stat } from 'node:fs/promises';
import path from 'node:path';

const REQUIRED_R2_STORAGE_ENV = [
  'R2_ACCOUNT_ID',
  'R2_ACCESS_KEY_ID',
  'R2_SECRET_ACCESS_KEY',
  'R2_BUCKET',
];
const REQUIRED_R2_ENV = [...REQUIRED_R2_STORAGE_ENV, 'R2_PUBLIC_BASE'];
const R2_ENABLED = 'R2_ENABLED';
const ALLOW_R2_DEV_PUBLIC_BASE = 'ALLOW_R2_DEV_PUBLIC_BASE';

const CONTENT_TYPES = {
  '.aac': 'audio/aac',
  '.m4a': 'audio/mp4',
  '.mp3': 'audio/mpeg',
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
};

let envLoaded = false;

export function loadDotEnv(filePath = path.join(process.cwd(), '.env')) {
  if (envLoaded) {
    return;
  }

  envLoaded = true;

  try {
    const raw = readFileSync(filePath, 'utf8');

    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }

      const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);

      if (!match || process.env[match[1]] !== undefined) {
        continue;
      }

      process.env[match[1]] = unquoteEnvValue(match[2].trim());
    }
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
}

export function isR2Configured() {
  loadDotEnv();
  return isR2Enabled() && REQUIRED_R2_ENV.every((name) => Boolean(process.env[name]));
}

export function missingR2Env() {
  loadDotEnv();
  const missing = REQUIRED_R2_ENV.filter((name) => !process.env[name]);
  return isR2Enabled() ? missing : [R2_ENABLED, ...missing];
}

export function missingR2StorageEnv() {
  loadDotEnv();
  return REQUIRED_R2_STORAGE_ENV.filter((name) => !process.env[name]);
}

export function isR2Enabled() {
  loadDotEnv();
  return process.env[R2_ENABLED] === '1';
}

export function requireR2Env(name) {
  loadDotEnv();
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing env ${name}`);
  }

  return value;
}

export function isR2DevPublicBase(value) {
  if (!value) {
    return false;
  }

  try {
    const url = new URL(value);
    return url.hostname === 'r2.dev' || url.hostname.endsWith('.r2.dev');
  } catch {
    return false;
  }
}

export function assertSafeR2PublicBase(
  value = requireR2Env('R2_PUBLIC_BASE'),
  { allowR2Dev = process.env[ALLOW_R2_DEV_PUBLIC_BASE] === '1' } = {},
) {
  let url;

  try {
    url = new URL(value);
  } catch {
    throw new Error('R2_PUBLIC_BASE must be an absolute https:// URL.');
  }

  if (url.protocol !== 'https:') {
    throw new Error('R2_PUBLIC_BASE must use https://.');
  }

  if (isR2DevPublicBase(value) && !allowR2Dev) {
    throw new Error(
      [
        'R2_PUBLIC_BASE points to an r2.dev development URL.',
        'Use an R2 custom domain behind Cloudflare Cache/WAF before publishing new media.',
        `Set ${ALLOW_R2_DEV_PUBLIC_BASE}=1 only for a deliberate emergency migration run.`,
      ].join(' '),
    );
  }

  return value.replace(/\/$/, '');
}

export function createR2Client() {
  return new S3Client({
    region: 'auto',
    endpoint: `https://${requireR2Env('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com`,
    forcePathStyle: true,
    requestChecksumCalculation: 'WHEN_REQUIRED',
    responseChecksumValidation: 'WHEN_REQUIRED',
    credentials: {
      accessKeyId: requireR2Env('R2_ACCESS_KEY_ID'),
      secretAccessKey: requireR2Env('R2_SECRET_ACCESS_KEY'),
    },
  });
}

export async function headR2Object(client, key) {
  try {
    return await client.send(
      new HeadObjectCommand({
        Bucket: requireR2Env('R2_BUCKET'),
        Key: key,
      }),
    );
  } catch (error) {
    const statusCode = error?.$metadata?.httpStatusCode;
    const name = error?.name;

    if (statusCode === 404 || name === 'NotFound' || name === 'NoSuchKey') {
      return null;
    }

    throw error;
  }
}

export async function objectExists(client, key) {
  return Boolean(await headR2Object(client, key));
}

export async function hashR2File(localPath) {
  const sha = createHash('sha256');
  const md5 = createHash('md5');
  let size = 0;
  for await (const chunk of createReadStream(localPath)) {
    sha.update(chunk);
    md5.update(chunk);
    size += chunk.length;
  }
  return { size, sha256: sha.digest('hex'), md5: md5.digest('hex') };
}

export function matchesR2Object(remote, digest) {
  if (!remote || remote.ContentLength !== digest.size) return false;
  const etag = remote.ETag?.replaceAll('"', '');
  // Old single-part objects have no custom checksum metadata, but do have an MD5 ETag.
  return remote.Metadata?.sha256 === digest.sha256 || etag === digest.md5;
}

export async function uploadToR2(
  client,
  {
    localPath = '',
    key = '',
    skipExisting = true,
    includePublicUrl = true,
    preserveExisting = false,
  } = {},
) {
  if (!localPath || !key) {
    throw new Error('uploadToR2 requires localPath and key.');
  }

  // Validate the public target before writing, except for explicitly private staging.
  if (includePublicUrl) assertSafeR2PublicBase();
  const file = await stat(localPath);
  const digest = await hashR2File(localPath);
  if (file.size !== digest.size) throw new Error(`Asset changed while hashing: ${localPath}`);
  let remote = await headR2Object(client, key);

  if (preserveExisting && remote && !matchesR2Object(remote, digest)) {
    const extension = path.posix.extname(key);
    key = `${key.slice(0, -extension.length)}-${digest.sha256}${extension}`;
    remote = await headR2Object(client, key);
    if (remote && !matchesR2Object(remote, digest)) {
      throw new Error(`Checksum conflict at versioned R2 key: ${key}`);
    }
  }

  if (skipExisting && matchesR2Object(remote, digest)) {
    return {
      publicUrl: includePublicUrl ? getPublicUrl(key) : null,
      key,
      ...digest,
      uploaded: false,
    };
  }

  const contentType =
    CONTENT_TYPES[path.extname(localPath).toLowerCase()] ?? 'application/octet-stream';

  await client.send(
    new PutObjectCommand({
      Bucket: requireR2Env('R2_BUCKET'),
      Key: key,
      Body: createReadStream(localPath),
      ContentLength: file.size,
      ContentType: contentType,
      ContentMD5: Buffer.from(digest.md5, 'hex').toString('base64'),
      Metadata: { sha256: digest.sha256 },
      StorageClass: 'STANDARD',
      ...(preserveExisting ? { IfNoneMatch: '*' } : {}),
    }),
  );

  const verified = await headR2Object(client, key);
  if (!matchesR2Object(verified, digest)) throw new Error(`R2 upload verification failed: ${key}`);
  return { publicUrl: includePublicUrl ? getPublicUrl(key) : null, key, ...digest, uploaded: true };
}

export function getPublicUrl(key) {
  const base = assertSafeR2PublicBase();
  return `${base}/${key.replace(/^\/+/, '')}`;
}

function unquoteEnvValue(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}
