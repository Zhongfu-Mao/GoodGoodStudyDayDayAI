import { execFileSync } from 'node:child_process';
import { assertRadarPublicationAllowed, isRadarPublicationPath } from '../lib/radar-publication.mjs';

const args = process.argv.slice(2);
const option = (name, fallback) => args.includes(name) ? args[args.indexOf(name) + 1] : fallback;
try {
  const ref = option('--ref', 'HEAD');
  const base = option('--base', '');
  const remote = option('--remote', 'origin');
  if (!/^(?:HEAD|[a-f0-9]{40,64})$/i.test(ref) || (base && !/^[a-f0-9]{40,64}$/i.test(base)))
    throw new Error('Use HEAD or an exact commit SHA for publication checks.');
  // Inspect all pending commits, including files added and removed between them.
  const revisions = base && !/^0+$/.test(base) ? [`${base}..${ref}`] : [ref, '--not', `--remotes=${remote}`];
  const files = execFileSync('git', ['log', '--format=', '--name-only', '-z', '--diff-merges=first-parent', ...revisions, '--'], { encoding: 'utf8' })
    .split(/[\0\n]/).filter(Boolean);
  if (files.some(isRadarPublicationPath)) await assertRadarPublicationAllowed();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
