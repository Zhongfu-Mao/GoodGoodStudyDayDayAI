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
import { appendFile, readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
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
    backfillRequest: null,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--backfill-request') {
      options.backfillRequest = argv[++index];
      if (!options.backfillRequest || options.backfillRequest.startsWith('--'))
        throw new Error('--backfill-request requires a private request JSON path');
      continue;
    }

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

  if (!['weekly', 'monthly', 'daily-reset'].includes(options.cadence)) {
    throw new Error('Pass --cadence weekly, monthly, or explicitly authorized daily-reset.');
  }
  if (options.cadence === 'daily-reset' && !options.backfillRequest) {
    throw new Error('Daily reset requires --backfill-request with completed content and a created goal.');
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
  let backfill = null;
  let auditDirectory = null;
  if (options.cadence === 'daily-reset') {
    backfill = JSON.parse(await readFile(options.backfillRequest, 'utf8'));
    const policy = JSON.parse(await readFile('scripts/radar/publication-policy.json', 'utf8'));
    if (policy.dailyAssetBackfill?.requestFile !== options.backfillRequest || !backfill.goalCreated)
      throw new Error('Daily reset is outside the authorized backfill request/goal.');
    const completion = JSON.parse(await readFile(backfill.contentScope.completionEvidence, 'utf8'));
    if (completion.status !== 'all_content_repaired_reviewed_and_frozen' || completion.remainingContentBlockers.length)
      throw new Error('Finish and freeze all content before deleting daily notebooks.');
    auditDirectory = path.join(path.dirname(options.backfillRequest), 'notebook-cleanup');
    await mkdir(auditDirectory, { recursive: true });
  }
  const window = getCleanupWindow(options);
  const { stdout } = await runNotebooklm(['list', '--json']);
  const notebooks = parseJsonOutput(stdout)?.notebooks ?? [];
  const candidates = selectCleanupCandidates(notebooks, window);
  const records = candidates.map((candidate) => cleanupRecord(candidate, window));
  if (backfill) {
    if (candidates.some(n => !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(n.id)))
      throw new Error('Daily reset requires complete notebook UUIDs.');
    await writeFile(path.join(auditDirectory, 'candidates.json'), JSON.stringify(candidates, null, 2));
  }

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

  if (backfill) {
    // Read every exact remote target before the first deletion. Do not delete an
    // artifact while it is still generating, even if its local client has exited.
    const active = [];
    for (const candidate of candidates) {
      const state = parseJsonOutput((await runNotebooklm(['artifact', 'list', '-n', candidate.id, '--json'])).stdout);
      await writeFile(path.join(auditDirectory, `${candidate.id}-artifacts.json`), JSON.stringify(state, null, 2));
      for (const artifact of state.artifacts ?? [])
        if (['pending', 'in_progress', 'processing', 'generating'].includes(artifact.status))
          active.push({ notebookId: candidate.id, artifactId: artifact.id, status: artifact.status });
    }
    if (active.length) {
      await writeFile(path.join(auditDirectory, 'active-artifacts.json'), JSON.stringify(active, null, 2));
      throw new Error(`Daily reset stopped: ${active.length} artifact(s) still active; no notebooks deleted.`);
    }
  }

  for (let index = 0; index < candidates.length; index += 1) {
    // Order matters: delete first, then log. If the log were appended before deletion
    // and the delete call failed, the audit log would falsely claim the notebook was
    // removed. With this order, the log only records confirmed deletions.
    if (backfill) await appendFile(path.join(auditDirectory, 'intents.jsonl'), `${JSON.stringify({ ...records[index], status: 'deleting' })}\n`);
    await runNotebooklm(['delete', '--notebook', candidates[index].id, '--yes', '--json']);
    await appendFile(options.logFile, `${JSON.stringify(records[index])}\n`, 'utf8');
    if (backfill) await appendFile(path.join(auditDirectory, 'deleted.jsonl'), `${JSON.stringify({ ...records[index], deleted_at: new Date().toISOString(), status: 'deleted' })}\n`);
  }
  if (backfill) {
    const after = parseJsonOutput((await runNotebooklm(['list', '--json'])).stdout)?.notebooks ?? [];
    const remaining = selectCleanupCandidates(after, window);
    const preserved = notebooks.filter(n => !candidates.some(c => c.id === n.id));
    if (remaining.length || preserved.some(n => !after.some(a => a.id === n.id)))
      throw new Error('Daily cleanup verification failed: remaining target or missing unrelated notebook.');
    const verification = { checkedAt: new Date().toISOString(), deleted: candidates.length, remainingDaily: 0, unrelatedPreserved: preserved.length };
    await writeFile(path.join(auditDirectory, 'verification.json'), JSON.stringify(verification, null, 2));
    backfill.notebookCleanup.status = 'verified';
    backfill.notebookCleanup.deleteInventory = path.join(auditDirectory, 'candidates.json');
    backfill.notebookCleanup.verification = path.join(auditDirectory, 'verification.json');
    backfill.actionsSoFar.notebooksDeleted = candidates.length;
    backfill.state = 'notebooks_cleaned_ready_for_audio';
    await writeFile(options.backfillRequest, JSON.stringify(backfill, null, 2) + '\n');
    console.log(JSON.stringify(verification));
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
