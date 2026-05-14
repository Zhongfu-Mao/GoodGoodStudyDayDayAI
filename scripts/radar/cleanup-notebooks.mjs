/**
 * Delete superseded NotebookLM radar notebooks (weekly absorbs daily, monthly absorbs weekly).
 *
 * Time zone note: `--trigger-date` is parsed as a UTC calendar date. `getCleanupWindow`
 * derives the previous ISO week / previous month in UTC. If you run from a cron in JST
 * around midnight, pass `--trigger-date $(date +%F)` so the local calendar date is used
 * instead of the implicit UTC "now".
 *
 * Defaults: dry-run (no deletion) unless `--execute` is passed.
 */
import { appendFile } from 'node:fs/promises';
import process from 'node:process';
import { getCleanupWindow, selectCleanupCandidates } from '../lib/notebook-cleanup.mjs';
import { parseJsonOutput, runNotebooklm } from '../lib/notebooklm.mjs';

function parseArgs(argv) {
  const options = {
    cadence: null,
    triggerDate: null,
    weekStart: null,
    month: null,
    execute: false,
    logFile: '.ai-radar-cleanup-log.jsonl',
    json: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--cadence') {
      options.cadence = argv[index + 1] ?? null;
      index += 1;
      continue;
    }

    if (arg === '--trigger-date') {
      options.triggerDate = argv[index + 1] ?? null;
      index += 1;
      continue;
    }

    if (arg === '--week-start') {
      options.weekStart = argv[index + 1] ?? null;
      index += 1;
      continue;
    }

    if (arg === '--month') {
      options.month = argv[index + 1] ?? null;
      index += 1;
      continue;
    }

    if (arg === '--execute') {
      options.execute = true;
      continue;
    }

    if (arg === '--log-file') {
      options.logFile = argv[index + 1] ?? options.logFile;
      index += 1;
      continue;
    }

    if (arg === '--json') {
      options.json = true;
    }
  }

  if (!['weekly', 'monthly'].includes(options.cadence)) {
    throw new Error('Pass --cadence weekly or --cadence monthly.');
  }

  return options;
}

function cleanupRecord(candidate, window) {
  return {
    notebook_id: candidate.id,
    name: candidate.title ?? candidate.name,
    deleted_at: new Date().toISOString(),
    cadence_trigger: `${window.cadence}:${window.start}..${window.end}`,
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const window = getCleanupWindow(options);
  const { stdout } = await runNotebooklm(['list', '--json']);
  const notebooks = parseJsonOutput(stdout)?.notebooks ?? [];
  const candidates = selectCleanupCandidates(notebooks, window);
  const records = candidates.map((candidate) => cleanupRecord(candidate, window));

  if (options.json) {
    console.log(JSON.stringify({ window, execute: options.execute, candidates }, null, 2));
  } else {
    console.log(
      `${options.execute ? 'Deleting' : 'Dry run:'} ${candidates.length} NotebookLM radar notebook(s) for ${window.cadence} ${window.start}..${window.end}.`,
    );
    for (const candidate of candidates) {
      console.log(`- ${candidate.id} ${candidate.title ?? candidate.name}`);
    }
  }

  if (!options.execute || candidates.length === 0) {
    return;
  }

  for (let index = 0; index < candidates.length; index += 1) {
    // Order matters: delete first, then log. If the log were appended before deletion
    // and the delete call failed, the audit log would falsely claim the notebook was
    // removed. With this order, the log only records confirmed deletions.
    await runNotebooklm(['delete', '--notebook', candidates[index].id, '--yes']);
    await appendFile(options.logFile, `${JSON.stringify(records[index])}\n`, 'utf8');
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
