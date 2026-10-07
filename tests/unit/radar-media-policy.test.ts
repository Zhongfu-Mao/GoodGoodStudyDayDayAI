import { execFileSync } from 'node:child_process';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  inspectRadarMedia,
  isHeavyRadarPath,
  verifyRemoteMedia,
} from '../../scripts/lib/radar-media-policy.mjs';

const policy = { publicBases: ['https://media.example.com'] };
const url = 'https://media.example.com/audio/radar/report.mp3';
const document = (fields = '', draft = false) =>
  `---\ntitle: Report\ndraft: ${draft}\n${fields}\n---\nArticle\n`;
const inspect = (fields: string, draft = false) =>
  inspectRadarMedia('report.md', document(fields, draft), policy);
const dirs: string[] = [];
afterEach(async () => {
  await Promise.all(dirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

describe('radar media publication boundary', () => {
  it('accepts the published cache-busting query and quoted YAML values', () => {
    const result = inspect(`audioUrl: '${url}?v=weekly'\naudioSize: 1234 # uploaded bytes`);
    expect(result.failures).toEqual([]);
    expect(result.assets[0]).toMatchObject({ expectedSize: 1234, url: `${url}?v=weekly` });
  });

  it.each([
    '/audio/radar/report.mp3',
    'http://media.example.com/audio/radar/report.mp3',
    'https://media.example.com.evil.test/audio/radar/report.mp3',
    'https://another.r2.dev/audio/radar/report.mp3',
    'https://user:password@media.example.com/audio/radar/report.mp3',
    'https://media.example.com/images/report.mp3',
    'https://media.example.com/audio/radar/%2e%2e/elsewhere.mp3',
  ])('rejects unapproved publication reference %s', (value) => {
    expect(inspect(`audioUrl: ${value}\naudioSize: 1234`).failures).toHaveLength(1);
  });

  it('allows local draft outputs while blocking their accidental publication', () => {
    expect(inspect('audioUrl: /audio/radar/pending.mp3', true).failures).toEqual([]);
    expect(inspect('audioUrl: /audio/radar/pending.mp3').failures).toHaveLength(1);
    expect(isHeavyRadarPath('public/audio/radar/pending.mp3')).toBe(true);
    expect(isHeavyRadarPath('public/decks/radar/pending.pdf')).toBe(true);
    expect(isHeavyRadarPath('public/downloads/example.pdf')).toBe(false);
  });

  it('requires actual integer audio metadata and rejects ambiguous YAML', () => {
    expect(inspect(`audioUrl: ${url}`).failures[0]).toContain('audioSize');
    expect(inspect(`audioUrl: ${url}\naudioSize: "1234"`).failures[0]).toContain('audioSize');
    expect(inspect(`audioUrl: ${url}\naudioSize: 0`).failures[0]).toContain('audioSize');
    expect(
      inspectRadarMedia('report.md', '---\ndraft: "true"\n---\n', policy).failures[0],
    ).toContain('boolean');
    expect(inspect(`audioUrl: ${url}\naudioUrl: /audio/radar/local.mp3`).failures).toHaveLength(1);
  });

  it('verifies shared remote objects once and catches byte and MIME mismatches', async () => {
    const assets = inspect(`audioUrl: ${url}\naudioSize: 1234`).assets;
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(
        new Response(null, { headers: { 'content-length': '1235', 'content-type': 'text/html' } }),
      );
    const result = await verifyRemoteMedia([...assets, { ...assets[0], file: 'report.ja.md' }], {
      fetchImpl,
    });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(fetchImpl.mock.calls[0][1]).toMatchObject({ method: 'HEAD', redirect: 'error' });
    expect(result.failures).toHaveLength(4);
    expect(result.failures.join('\n')).toContain('remote Content-Length is 1235');
  });

  it('does not report missing remote content as verified', async () => {
    const assets = inspect(`audioUrl: ${url}\naudioSize: 1234`).assets;
    const result = await verifyRemoteMedia(assets, {
      fetchImpl: vi.fn().mockResolvedValue(new Response(null, { status: 404 })),
    });
    expect(result.failures[0]).toContain('HTTP 404');
  });

  it('checks the staged snapshot even when the worktree is fixed, and rejects force-added media', async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), 'radar-policy-'));
    dirs.push(dir);
    const git = (...args: string[]) => execFileSync('git', args, { cwd: dir, stdio: 'pipe' });
    await mkdir(path.join(dir, 'scripts/radar'), { recursive: true });
    await mkdir(path.join(dir, 'src/content/radar'), { recursive: true });
    await mkdir(path.join(dir, 'public/audio/radar'), { recursive: true });
    await writeFile(path.join(dir, 'scripts/radar/media-policy.json'), JSON.stringify(policy));
    const file = path.join(dir, 'src/content/radar/report.md');
    await writeFile(file, document('audioUrl: /audio/radar/local.mp3\naudioSize: 1234'));
    git('init', '--quiet');
    git('add', '.');
    await writeFile(file, document(`audioUrl: ${url}\naudioSize: 1234`));
    const script = path.resolve('scripts/check/radar-media.mjs');
    expect(() =>
      execFileSync(process.execPath, [script, '--staged'], { cwd: dir, stdio: 'pipe' }),
    ).toThrow();
    git('add', 'src/content/radar/report.md');
    expect(
      execFileSync(process.execPath, [script, '--staged'], { cwd: dir, encoding: 'utf8' }),
    ).toContain('1 published references');
    // A different policy in the worktree must not silently change the staged check.
    await writeFile(
      path.join(dir, 'scripts/radar/media-policy.json'),
      JSON.stringify({ publicBases: ['https://different.example.com'] }),
    );
    expect(
      execFileSync(process.execPath, [script, '--staged'], { cwd: dir, encoding: 'utf8' }),
    ).toContain('1 published references');
    git(
      '-c',
      'user.name=Test',
      '-c',
      'user.email=test@example.invalid',
      'commit',
      '--quiet',
      '-m',
      'fixture',
    );
    await writeFile(path.join(dir, '.gitignore'), '/public/audio/radar/\n');
    await writeFile(path.join(dir, 'public/audio/radar/local.mp3'), 'test fixture');
    git('add', '-f', 'public/audio/radar/local.mp3');
    expect(() =>
      execFileSync(process.execPath, [script, '--staged'], { cwd: dir, stdio: 'pipe' }),
    ).toThrow();
    // The clean commit still passes even when the index/worktree are now unsafe.
    expect(
      execFileSync(process.execPath, [script, '--ref', 'HEAD'], { cwd: dir, encoding: 'utf8' }),
    ).toContain('1 published references');
  });
});
