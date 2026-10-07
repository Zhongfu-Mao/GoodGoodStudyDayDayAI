#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import {
  inspectRadarMedia,
  isHeavyRadarPath,
  verifyRemoteMedia,
} from '../lib/radar-media-policy.mjs';

const root = process.cwd();
const args = process.argv.slice(2);
const options = { staged: false, ref: null, remote: false, files: [] };
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--staged') options.staged = true;
  else if (args[i] === '--verify-remote') options.remote = true;
  else if (['--ref', '--file'].includes(args[i]) && args[i + 1] && !args[i + 1].startsWith('--')) {
    if (args[i] === '--ref') options.ref = args[++i];
    else options.files.push(args[++i]);
  } else throw new Error(`Unknown or incomplete option: ${args[i]}`);
}
if (options.staged && options.ref) throw new Error('--staged and --ref are mutually exclusive');
if (options.ref?.startsWith('-')) throw new Error('Invalid Git ref');
const git = (argv) =>
  execFileSync('git', argv, { cwd: root, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
const revision = options.ref
  ? git(['rev-parse', '--verify', `${options.ref}^{commit}`]).trim()
  : null;
const list = (argv) => git(argv).split('\0').filter(Boolean);
const tracked = revision
  ? list(['ls-tree', '-r', '--name-only', '-z', revision])
  : list(['ls-files', '--cached', '-z']);
const failures = tracked
  .filter(isHeavyRadarPath)
  .map(
    (file) =>
      `${file}: heavy radar media must not be tracked; publish through the verified R2 path`,
  );
let files;
if (options.staged) files = list(['diff', '--cached', '--name-only', '--diff-filter=ACMR', '-z']);
else if (revision) files = tracked;
else files = (await readdir('src/content/radar')).map((file) => `src/content/radar/${file}`);
files = files.filter((file) => /^src\/content\/radar\/[^/]+\.md$/.test(file));
if (options.files.length) {
  const selected = options.files.map((file) =>
    path.relative(root, path.resolve(root, file)).replaceAll('\\', '/'),
  );
  for (const file of selected)
    if (!files.includes(file))
      throw new Error(`File is outside the selected radar snapshot: ${file}`);
  files = files.filter((file) => selected.includes(file));
}
const policyPath = 'scripts/radar/media-policy.json';
const policy = JSON.parse(
  options.staged
    ? git(['show', `:${policyPath}`])
    : revision
      ? git(['show', `${revision}:${policyPath}`])
      : await readFile(policyPath, 'utf8'),
);
if (!Array.isArray(policy.publicBases) || policy.publicBases.length === 0)
  throw new Error('Media policy has no approved public bases');
const assets = [];
for (const file of files) {
  const source = options.staged
    ? git(['show', `:${file}`])
    : revision
      ? git(['show', `${revision}:${file}`])
      : await readFile(file, 'utf8');
  const result = inspectRadarMedia(file, source, policy);
  failures.push(...result.failures);
  assets.push(...result.assets);
}
let remote = null;
if (options.remote && failures.length === 0) {
  remote = await verifyRemoteMedia(assets);
  failures.push(...remote.failures);
}
if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log(
    `Checked media policy in ${files.length} radar files; ${assets.length} published references. ${remote ? `Remote metadata checked for ${remote.checkedUrls} URLs.` : 'Remote object availability and byte sizes were not checked (use --verify-remote).'}`,
  );
}
