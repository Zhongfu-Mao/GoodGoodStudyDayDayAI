import { mkdtemp, mkdir, writeFile, readFile, rm, chmod } from 'node:fs/promises';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { assertRadarPublicationAllowed, isRadarPublicationPath, isRadarMediaKey } from '../../scripts/lib/radar-publication.mjs';

const project = path.resolve(fileURLToPath(new URL('../..', import.meta.url)));
const temporary: string[] = [];
afterEach(async () => { await Promise.all(temporary.splice(0).map(dir => rm(dir, { recursive: true, force: true }))); });
async function fixture(active = true) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'radar-publication-'));
  temporary.push(root);
  await mkdir(path.join(root, 'scripts/radar'), { recursive: true });
  await writeFile(path.join(root, 'scripts/radar/publication-policy.json'), JSON.stringify({ version: 1, hold: { active, reason: 'sample review' } }));
  return root;
}
function git(root: string, ...args: string[]) { return execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim(); }
async function commit(root: string, file: string, text: string) {
  await mkdir(path.dirname(path.join(root, file)), { recursive: true });
  await writeFile(path.join(root, file), text);
  git(root, 'add', file); git(root, 'commit', '-m', 'fixture'); return git(root, 'rev-parse', 'HEAD');
}
function check(root: string, ref: string, base?: string) {
  return spawnSync(process.execPath, [path.join(project, 'scripts/radar/check-publication-hold.mjs'), '--ref', ref, ...(base ? ['--base', base] : [])], { cwd: root, encoding: 'utf8' });
}

describe('narrow radar publication hold', () => {
  it('uses durable policy without any tmp owner record', async () => {
    const root = await fixture();
    await expect(assertRadarPublicationAllowed(root)).rejects.toThrow('on hold');
    const allowed = await fixture(false);
    await expect(assertRadarPublicationAllowed(allowed)).resolves.toBeUndefined();
    await rm(path.join(allowed, 'scripts/radar/publication-policy.json'));
    await expect(assertRadarPublicationAllowed(allowed)).rejects.toThrow('unavailable');
  });
  it('limits paths and object keys to radar publication', () => {
    for (const f of ['src/content/radar/day.md', 'public/images/radar/day.webp', 'public/audio/radar/day.mp3', 'public/decks/radar/day.pdf', 'scripts/radar/visuals/2026-10-21.json']) expect(isRadarPublicationPath(f)).toBe(true);
    for (const f of ['src/lib/entryMeta.ts', 'scripts/lib/radar-review.mjs', 'docs/agents/radar.md', 'scripts/radar/publication-policy.json', 'public/images/academy/a.webp']) expect(isRadarPublicationPath(f)).toBe(false);
    expect(isRadarMediaKey('/audio/radar/day.mp3')).toBe(true);
    expect(isRadarMediaKey('images/academy/day.webp')).toBe(false);
  });
  it('allows code pushes, blocks pending radar history, and catches add-then-remove', async () => {
    const root = await fixture();
    git(root, 'init', '-b', 'main'); git(root, 'config', 'user.email', 'fixture@example.invalid'); git(root, 'config', 'user.name', 'Fixture');
    const base = await commit(root, 'src/content/radar/already-published.md', 'old published radar');
    git(root, 'update-ref', 'refs/remotes/origin/main', base);
    const code = await commit(root, 'src/lib/reader.ts', 'reader repair');
    expect(check(root, code, base).status).toBe(0);
    expect(check(root, code, '0'.repeat(40)).status).toBe(0);
    // Missing policy must not block a non-radar code push.
    const policy = path.join(root, 'scripts/radar/publication-policy.json');
    const original = await readFile(policy); await rm(policy);
    expect(check(root, code, base).status).toBe(0); await writeFile(policy, original);
    const unicode = await commit(root, 'src/content/radar/中文.md', 'unreviewed unicode filename');
    expect(check(root, unicode, code).status).toBe(1);
    const added = await commit(root, 'src/content/radar/unreviewed.md', 'unreviewed');
    expect(check(root, added, base).status).toBe(1);
    git(root, 'rm', 'src/content/radar/unreviewed.md'); git(root, 'commit', '-m', 'remove');
    const removed = git(root, 'rev-parse', 'HEAD');
    expect(git(root, 'diff', '--name-only', unicode, removed)).toBe('');
    expect(check(root, removed, unicode).status).toBe(1);
    // Run the actual hook with only unrelated storage/build checks stubbed.
    for (const file of ['scripts/radar/check-publication-hold.mjs', 'scripts/lib/radar-publication.mjs']) {
      await mkdir(path.dirname(path.join(root, file)), { recursive: true });
      await writeFile(path.join(root, file), await readFile(path.join(project, file)));
    }
    await mkdir(path.join(root, 'scripts/check'), { recursive: true });
    await writeFile(path.join(root, 'scripts/check/radar-media.mjs'), '');
    await mkdir(path.join(root, 'bin')); await writeFile(path.join(root, 'bin/npm'), '#!/bin/sh\nexit 0\n'); await chmod(path.join(root, 'bin/npm'), 0o755);
    const hook = (sha: string) => spawnSync('sh', [path.join(project, '.githooks/pre-push'), 'origin'], { cwd: root, encoding: 'utf8', env: { ...process.env, PATH: path.join(root, 'bin') + ':' + process.env.PATH }, input: `refs/heads/main ${sha} refs/heads/main ${base}\n` });
    expect(hook(code).status).toBe(0);
    expect(hook(added).status).toBe(1);
  });
  it('blocks real radar media calls before credentials, local file reads or network sends', async () => {
    const root = await fixture();
    const r2 = pathToFileURL(path.join(project, 'scripts/lib/r2.mjs')).href;
    const assets = pathToFileURL(path.join(project, 'scripts/lib/radar-assets.mjs')).href;
    for (const script of [
      `import {uploadToR2} from ${JSON.stringify(r2)}; await uploadToR2({send(){throw new Error('NETWORK_CALLED')}},{localPath:'missing.mp3',key:'audio/radar/unreviewed.mp3'});`,
      `import {publishRadarAsset} from ${JSON.stringify(assets)}; await publishRadarAsset({localPath:'missing.webp',publicUrl:'/audio/radar/unreviewed.mp3'});`,
    ]) {
      const result = spawnSync(process.execPath, ['--input-type=module', '-e', script], { cwd: root, encoding: 'utf8' });
      expect(result.status).not.toBe(0); expect(result.stderr).toContain('Radar publication is on hold'); expect(result.stderr).not.toContain('NETWORK_CALLED');
    }
    // Images stay local (Pages); their commit is guarded by the pre-push hold check instead.
    for (const url of ['/images/academy/ok.webp', '/images/radar/local-preview.webp']) {
      const allowed = spawnSync(process.execPath, ['--input-type=module', '-e', `import {publishRadarAsset} from ${JSON.stringify(assets)}; console.log(await publishRadarAsset({localPath:'missing.webp',publicUrl:${JSON.stringify(url)}}));`], { cwd: root, encoding: 'utf8' });
      expect(allowed.status).toBe(0); expect(allowed.stdout).toContain(url);
    }
  });
});
