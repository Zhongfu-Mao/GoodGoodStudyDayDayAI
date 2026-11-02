import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import { expect, it } from 'vitest';

it('runs the collector offline with a fixed historical window and rejects resume drift', () => {
  const root = mkdtempSync(path.join(os.tmpdir(), 'radar-collector-test-'));
  const script = path.resolve('scripts/radar/collect-sources.mjs');
  try {
    mkdirSync(path.join(root, 'scripts/radar'), { recursive: true });
    mkdirSync(path.join(root, 'tmp/radar-fetch/2026-10-21'), { recursive: true });
    writeFileSync(
      path.join(root, 'scripts/radar/source-pool.json'),
      JSON.stringify({
        activeCoreSources: [
          {
            name: 'Offline feed',
            access: { primary: { kind: 'podcast-rss', url: 'https://example.com/feed' } },
          },
        ],
      }),
    );
    const good = {
      title: 'Valid episode',
      link: 'https://example.com/valid',
      published: '2026-10-20T05:00:00Z',
      enclosure: { type: 'audio/mpeg', url: 'https://example.com/valid.mp3' },
    };
    writeFileSync(
      path.join(root, 'tmp/radar-fetch/2026-10-21/cached.json'),
      JSON.stringify({
        ok: true,
        mode: 'rss',
        requestedUrl: 'https://example.com/feed',
        feed: {
          items: [
            good,
            { ...good, title: 'No audio', enclosure: undefined },
            { ...good, title: 'Too late', published: '2026-10-22T01:00:00Z' },
          ],
        },
      }),
    );
    const run = (extra: string[] = []) =>
      spawnSync(process.execPath, [script, '--date', '2026-10-21', ...extra], {
        cwd: root,
        encoding: 'utf8',
      });
    expect(run().status).toBe(0);
    const output = path.join(root, 'tmp/radar-2026-10-21/discovery-index.json');
    const first = JSON.parse(readFileSync(output, 'utf8'));
    expect(first.window).toEqual({
      start: '2026-10-20T03:00:00.000Z',
      end: '2026-10-21T03:00:00.000Z',
    });
    expect(first.stories.map((s: { title: string }) => s.title)).toEqual(['Valid episode']);
    expect(first.results[0].rejectedEntries).toHaveLength(1);
    expect(first.futureCandidates).toHaveLength(1);
    expect(run().status).toBe(0);
    expect(JSON.parse(readFileSync(output, 'utf8')).window).toEqual(first.window);
    const unchanged = readFileSync(output, 'utf8');
    expect(run(['--cutoff', '2026-10-21T02:00:00Z']).status).not.toBe(0);
    expect(readFileSync(output, 'utf8')).toBe(unchanged);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
