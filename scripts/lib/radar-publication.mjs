import { readFile } from 'node:fs/promises';
import path from 'node:path';

export function isRadarPublicationPath(file) {
  return /^(?:src\/content\/radar\/|public\/(?:images|audio|decks)\/radar\/|scripts\/radar\/visuals\/\d{4}-\d{2}-\d{2}\.json$)/.test(file);
}

export function isRadarMediaKey(key) {
  return /^(?:images|audio|decks)\/radar\//.test(key.replace(/^\/+/, ''));
}

// Publication policy is durable; local worker/owner records are not required.
export async function assertRadarPublicationAllowed(root = process.cwd()) {
  let policy;
  try {
    policy = JSON.parse(await readFile(path.join(root, 'scripts/radar/publication-policy.json'), 'utf8'));
  } catch (error) {
    throw new Error(`Radar publication policy unavailable: ${error.code ?? error.message}`);
  }
  if (policy.version !== 1 || typeof policy.hold?.active !== 'boolean')
    throw new Error('Invalid radar publication policy.');
  if (policy.hold.active)
    throw new Error(`Radar publication is on hold: ${policy.hold.reason}`);
}
