// A single writer's durable service receipts, not a task scheduler or review gate.
import { mkdir, readFile, writeFile, rename, rmdir } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID, createHash } from 'node:crypto';
import { assertPrivateDirectory } from './radar-review.mjs';

export const generationInputKey = (value) =>
  createHash('sha256').update(JSON.stringify(value)).digest('hex');

export async function openGenerationJob(file, inputKey, { run, inputSnapshot } = {}) {
  file = path.resolve(file);
  assertPrivateDirectory(path.dirname(file));
  await mkdir(path.dirname(file), { recursive: true });
  let state;
  try {
    state = JSON.parse(await readFile(file, 'utf8'));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    state = { version: 1, inputKey, inputSnapshot, steps: {} };
    // Two first invocations must not silently replace each other's receipts.
    await writeFile(file, JSON.stringify(state, null, 2), { flag: 'wx', mode: 0o600 });
  }
  if (state.version !== 1 || state.inputKey !== inputKey)
    throw new Error(
      `Generation input changed; preserve the original job and explicitly select a new --job-file: ${file}`,
    );
  const save = async () => {
    state.updatedAt = new Date().toISOString();
    const temporary = `${file}.${randomUUID()}.tmp`;
    await writeFile(temporary, JSON.stringify(state, null, 2) + '\n', { mode: 0o600 });
    await rename(temporary, file);
  };
  return {
    file,
    async completed(name) {
      state = JSON.parse(await readFile(file, 'utf8'));
      return state.steps[name]?.phase === 'completed' ? state.steps[name].result : null;
    },
    async once(name, action) {
      // These fixed steps never create a remote resource. Old uncertain local
      // receipts can also resume, provided the original per-job claim is free.
      const local = ['directory', 'candidate', 'assets'].includes(name);
      state = JSON.parse(await readFile(file, 'utf8'));
      const step = state.steps[name];
      if (step?.phase === 'completed') return step.result;
      if (step && !local) {
        // An interrupted submit may have succeeded remotely. Read back, never resubmit
        // or choose the latest unrelated item. Exact-ID reconciliation stays explicit.
        const notebook = state.steps.notebook?.result;
        const args = notebook
          ? [
              name.startsWith('source:') ? 'source' : 'artifact',
              'list',
              '--notebook',
              notebook,
              '--json',
            ]
          : ['list', '--json'];
        const observation = { step: name, checkedAt: new Date().toISOString() };
        try {
          observation.result = await run(args);
        } catch (error) {
          observation.error = error.message;
        }
        // Never overwrite an active writer's receipt with this reader's snapshot.
        await writeFile(`${file}.readback.json`, JSON.stringify(observation, null, 2), {
          mode: 0o600,
        });
        throw new Error(
          `Original ${name} outcome uncertain; readback saved in ${file}. Reconcile exact IDs before continuing; no new submission made.`,
        );
      }
      // Serialize local materialization as well as service mutations. A crash
      // can leave a claim: do not clear it or race a potentially live writer.
      const claim = `${file}.submitting`;
      await mkdir(claim).catch((error) => {
        if (error.code === 'EEXIST')
          throw new Error(
            `Generation step already claimed; inspect ${file}, no new submission made.`,
          );
        throw error;
      });
      try {
        state = JSON.parse(await readFile(file, 'utf8'));
        if (state.steps[name]?.phase === 'completed') return state.steps[name].result;
        if (state.steps[name] && !local)
          throw new Error('Service step changed; reload the original job');
        const lastError = state.steps[name]?.error;
        state.steps[name] = {
          phase: local ? 'processing' : 'submitted',
          startedAt: new Date().toISOString(),
          ...(lastError ? { lastError } : {}),
        };
        await save(); // Persist BEFORE work, especially remote mutations.
        const result = await action();
        state.steps[name] = { phase: 'completed', result };
        await save();
        return result;
      } catch (error) {
        if (['submitted', 'processing'].includes(state.steps[name]?.phase)) {
          state.steps[name].phase = local ? 'failed' : 'uncertain';
          state.steps[name].error = error.message;
          await save();
        }
        throw error;
      } finally {
        await rmdir(claim);
      }
    },
  };
}
