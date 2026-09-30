#!/usr/bin/env node
// Full logs stay on disk. Only one small completion envelope enters model context.
import { spawn } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import { finished } from 'node:stream/promises';
import { randomUUID } from 'node:crypto';
import path from 'node:path';

const args = process.argv.slice(2);
const requireOutput = args[0] === '--require-output';
if (requireOutput) args.shift();
if (args[0] === '--status') {
  const { args: commandArgs, ...summary } = JSON.parse(await readFile(args[1], 'utf8'));
  console.log(JSON.stringify(summary));
} else {
  if (args[0] !== '--' || args.length < 2)
    throw new Error(
      'Usage: run-step.mjs [--require-output] -- COMMAND ARGS... | --status STATE_FILE',
    );
  const [command, ...commandArgs] = args.slice(1);
  const dir = path.resolve('tmp/radar-runs', `${Date.now()}-${randomUUID().slice(0, 8)}`);
  await mkdir(dir, { recursive: true });
  const logFile = path.join(dir, 'output.log');
  const stateFile = path.join(dir, 'state.json');
  const startedAt = new Date().toISOString();
  const state = { status: 'running', startedAt, command, args: commandArgs, logFile, stateFile };
  await writeFile(stateFile, JSON.stringify(state), { mode: 0o600 });
  const log = createWriteStream(logFile, { mode: 0o600 });
  let tail = '';
  let hasOutput = false;
  const child = spawn(command, commandArgs, { shell: false, stdio: ['inherit', 'pipe', 'pipe'] });
  console.log(JSON.stringify({ status: 'running', stateFile, logFile }));
  const capture = (chunk) => {
    tail = (tail + chunk.toString()).slice(-2000);
    if (!log.write(chunk)) {
      child.stdout.pause();
      child.stderr.pause();
    }
  };
  log.on('drain', () => {
    child.stdout.resume();
    child.stderr.resume();
  });
  child.stdout.on('data', (chunk) => {
    if (/\S/.test(chunk.toString())) hasOutput = true;
    capture(chunk);
  });
  child.stderr.on('data', capture);
  child.on('error', (error) => {
    tail = error.message;
  });
  for (const signal of ['SIGTERM', 'SIGINT']) process.on(signal, () => child.kill(signal));
  const result = await new Promise((resolve) =>
    child.on('close', (code, signal) => resolve({ code, signal })),
  );
  log.end();
  await finished(log);
  const emptyResult = requireOutput && result.code === 0 && !hasOutput;
  const code = emptyResult ? 2 : result.code;
  if (emptyResult) tail = `Command exited 0 but returned no nonempty stdout.\n${tail}`;
  const status = code === 0 ? 'success' : 'failed';
  const final = {
    ...state,
    status,
    ...result,
    processExitCode: result.code,
    code,
    requireOutput,
    finishedAt: new Date().toISOString(),
    ...(status === 'failed' ? { errorTail: tail } : {}),
  };
  await writeFile(stateFile, JSON.stringify(final), { mode: 0o600 });
  const { args: omitted, ...summary } = final;
  console.log(JSON.stringify(summary));
  process.exitCode = code ?? 1;
}
