import path from 'node:path';
import { createR2Client, getPublicUrl, isR2Configured, missingR2Env, uploadToR2 } from './r2.mjs';

let sharedR2Client;

export function publicAssetUrlToKey(publicUrl) {
  if (!publicUrl?.startsWith('/')) {
    return null;
  }

  return publicUrl.split(/[?#]/, 1)[0].replace(/^\/+/, '');
}

export function publicAssetUrlToLocalPath(publicUrl, root = process.cwd()) {
  const key = publicAssetUrlToKey(publicUrl);
  return key ? path.join(root, 'public', key) : null;
}

export function remoteUrlForPublicAsset(publicUrl) {
  const key = publicAssetUrlToKey(publicUrl);
  return key ? getPublicUrl(key) : publicUrl;
}

export function assetUrlMatchesPublicAsset(assetUrl, publicUrl) {
  if (!assetUrl || !publicUrl) {
    return false;
  }

  const normalizedPublicUrl = publicUrl.split(/[?#]/, 1)[0];

  if (assetUrl.split(/[?#]/, 1)[0] === normalizedPublicUrl) {
    return true;
  }

  if (!isR2Configured()) {
    return false;
  }

  return assetUrl.split(/[?#]/, 1)[0] === remoteUrlForPublicAsset(publicUrl);
}

export async function publishRadarAsset({ localPath, publicUrl, label = 'asset' }) {
  if (!isR2Configured()) {
    const missing = missingR2Env();
    console.log(`R2 not configured; keeping local ${label} URL (${missing.join(', ')} missing).`);
    return publicUrl;
  }

  const key = publicAssetUrlToKey(publicUrl);

  if (!key) {
    throw new Error(`Cannot map public URL to R2 key: ${publicUrl}`);
  }

  sharedR2Client ??= createR2Client();
  const result = await uploadToR2(sharedR2Client, { localPath, key });

  console.log(`${result.uploaded ? 'Uploaded' : 'Reused'} ${label} at ${result.publicUrl}`);

  return result.publicUrl;
}
