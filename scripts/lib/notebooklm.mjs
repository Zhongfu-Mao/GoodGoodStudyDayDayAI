import path from 'node:path';
import process from 'node:process';
import { spawn } from 'node:child_process';

export const NOTEBOOKLM_BIN = path.join(process.cwd(), '.venv/bin/notebooklm');

export function runNotebooklm(args, { cwd = process.cwd() } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(NOTEBOOKLM_BIN, args, {
      cwd,
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
        return;
      }

      reject(new Error(stderr.trim() || stdout.trim() || `notebooklm exited with code ${code}`));
    });
  });
}

export function parseJsonOutput(stdout) {
  const trimmed = stdout.trim();

  if (!trimmed) {
    return null;
  }

  try {
    return JSON.parse(trimmed);
  } catch {
    const jsonLine = trimmed
      .split('\n')
      .map((line) => line.trim())
      .reverse()
      .find((line) => line.startsWith('{') || line.startsWith('['));

    if (!jsonLine) {
      throw new Error(`Unable to parse JSON output: ${trimmed}`);
    }

    return JSON.parse(jsonLine);
  }
}

export function pickNotebookId(payload) {
  return payload?.id ?? payload?.notebook_id ?? payload?.notebook?.id ?? payload?.data?.id ?? null;
}

export function pickLatestItem(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }

  return [...items].sort((left, right) => {
    const leftTime = new Date(left.created_at ?? 0).getTime();
    const rightTime = new Date(right.created_at ?? 0).getTime();

    if (leftTime !== rightTime) {
      return rightTime - leftTime;
    }

    return (right.index ?? 0) - (left.index ?? 0);
  })[0];
}

export async function createNotebook(title) {
  const { stdout } = await runNotebooklm(['create', title, '--json']);
  const payload = parseJsonOutput(stdout);
  const notebookId = pickNotebookId(payload);

  if (!notebookId) {
    throw new Error('Failed to determine notebook ID from create response.');
  }

  return notebookId;
}

export async function addSourceFile(notebookId, sourcePath, { waitTimeout = 300 } = {}) {
  await runNotebooklm(['source', 'add', '--notebook', notebookId, sourcePath, '--json']);

  const { stdout } = await runNotebooklm(['source', 'list', '--notebook', notebookId, '--json']);
  const source = pickLatestItem(parseJsonOutput(stdout)?.sources);

  if (!source?.id) {
    throw new Error(`Failed to determine source ID for ${sourcePath}`);
  }

  await runNotebooklm([
    'source',
    'wait',
    '--notebook',
    notebookId,
    source.id,
    '--timeout',
    String(waitTimeout),
    '--json',
  ]);

  return source;
}

export async function waitForLatestArtifact(notebookId, type, { timeout = 900 } = {}) {
  const { stdout } = await runNotebooklm([
    'artifact',
    'list',
    '--notebook',
    notebookId,
    '--type',
    type,
    '--json',
  ]);

  const artifact = pickLatestItem(parseJsonOutput(stdout)?.artifacts);

  if (!artifact?.id) {
    throw new Error(`Failed to determine latest ${type} artifact ID.`);
  }

  await runNotebooklm([
    'artifact',
    'wait',
    '--notebook',
    notebookId,
    artifact.id,
    '--timeout',
    String(timeout),
    '--json',
  ]);

  return artifact;
}

export async function maybeDeleteNotebook(notebookId, keepNotebook) {
  if (keepNotebook || !notebookId) {
    return;
  }

  await runNotebooklm(['delete', notebookId]);
}

export function languageArg(lang) {
  return lang === 'ja' ? 'ja' : 'zh_Hans';
}
