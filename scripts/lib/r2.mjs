import { HeadObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { createReadStream, readFileSync } from 'node:fs';
import { stat } from 'node:fs/promises';
import path from 'node:path';

const REQUIRED_R2_ENV = [
  'R2_ACCOUNT_ID',
  'R2_ACCESS_KEY_ID',
  'R2_SECRET_ACCESS_KEY',
  'R2_BUCKET',
  'R2_PUBLIC_BASE',
];

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
  return REQUIRED_R2_ENV.every((name) => Boolean(process.env[name]));
}

export function missingR2Env() {
  loadDotEnv();
  return REQUIRED_R2_ENV.filter((name) => !process.env[name]);
}

export function requireR2Env(name) {
  loadDotEnv();
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing env ${name}`);
  }

  return value;
}

export function createR2Client() {
  return new S3Client({
    region: 'auto',
    endpoint: `https://${requireR2Env('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com`,
    forcePathStyle: true,
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

export async function uploadToR2(client, { localPath, key, skipExisting = true } = {}) {
  if (!localPath || !key) {
    throw new Error('uploadToR2 requires localPath and key.');
  }

  const file = await stat(localPath);

  if (skipExisting) {
    const remote = await headR2Object(client, key);

    if (remote?.ContentLength === file.size) {
      return { publicUrl: getPublicUrl(key), uploaded: false };
    }
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
    }),
  );

  return { publicUrl: getPublicUrl(key), uploaded: true };
}

export function getPublicUrl(key) {
  const base = requireR2Env('R2_PUBLIC_BASE').replace(/\/$/, '');
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
