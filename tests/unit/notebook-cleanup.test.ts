import { describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  getCleanupWindow,
  parseRadarNotebookTitle,
  selectCleanupCandidates,
} from '../../scripts/lib/notebook-cleanup.mjs';

const notebook = (id: string, title: string) => ({ id, title });
const ids = (candidates: Array<{ id?: string }>) => candidates.map((candidate) => candidate.id);

describe('NotebookLM radar cleanup helpers', () => {
  it('does not contact NotebookLM or replace evidence when a daily reset was already verified', () => {
    const root = mkdtempSync(path.join(os.tmpdir(), 'radar-reset-'));
    try {
      mkdirSync(path.join(root, 'scripts/radar'), { recursive: true });
      mkdirSync(path.join(root, 'tmp/notebook-cleanup'), { recursive: true });
      writeFileSync(path.join(root, 'scripts/radar/publication-policy.json'), JSON.stringify({ dailyAssetBackfill: { requestFile: 'tmp/request.json' } }));
      writeFileSync(path.join(root, 'tmp/request.json'), JSON.stringify({ goalCreated: true, notebookCleanup: { status: 'verified', verification: 'tmp/notebook-cleanup/verification.json' } }));
      const evidence = path.join(root, 'tmp/notebook-cleanup/candidates.json');
      writeFileSync(evidence, 'original deleted notebook inventory');
      const result = execFileSync(process.execPath, [path.resolve('scripts/radar/cleanup-notebooks.mjs'), '--cadence', 'daily-reset', '--backfill-request', 'tmp/request.json', '--execute'], { cwd: root, encoding: 'utf8' });
      expect(JSON.parse(result).status).toBe('already_verified');
      expect(readFileSync(evidence, 'utf8')).toBe('original deleted notebook inventory');
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
  it('includes only verified daily repair/style title forms in an explicit daily reset', () => {
    const candidates = selectCleanupCandidates([
      notebook('daily', 'AI 雷达日报：2026-10-30 · Audio'),
      notebook('repair', 'AI Radar 2026-10-21 · Private repair v3'),
      notebook('style', 'AI雷达2026-10-15 · 三风格对照试验'),
      notebook('weekly', 'AI 雷达周报：2026-10-05 至 2026-10-11 · Weekly Assets'),
      notebook('monthly', 'AI 雷达月报：2026 年 9 月 · Monthly Assets'),
      notebook('unrelated', 'AI Radar research notes'),
      notebook('wrong-suffix', 'AI Radar 2026-10-21 · Personal notes'),
    ], getCleanupWindow({cadence: 'daily-reset'}));
    expect(ids(candidates)).toEqual(['daily', 'repair', 'style']);
  });
  it('matches daily radar notebooks from Chinese and Japanese generated titles', () => {
    expect(parseRadarNotebookTitle('AI 雷达日报：2026-05-10 · Audio')).toMatchObject({
      cadence: 'daily',
      date: '2026-05-10',
    });

    expect(parseRadarNotebookTitle('AIレーダー日報：2026-05-10 · Infographic')).toMatchObject({
      cadence: 'daily',
      date: '2026-05-10',
    });
  });

  it('selects only daily notebooks inside a completed weekly window', () => {
    const candidates = selectCleanupCandidates(
      [
        notebook('old-zh', 'AI 雷达日报：2026-05-04 · Audio'),
        notebook('old-ja', 'AIレーダー日報：2026-05-10 · Infographic'),
        notebook('next-week', 'AI 雷达日报：2026-05-11 · Audio'),
        notebook('weekly', 'AI 雷达周报：2026-05-04 至 2026-05-10 · Weekly Assets'),
        notebook('personal', 'SHARP HEALSIO AX-LSX3C 使用与菜谱研究'),
      ],
      { cadence: 'weekly', start: '2026-05-04', end: '2026-05-10' },
    );

    expect(ids(candidates)).toEqual(['old-zh', 'old-ja']);
  });

  it('selects only weekly notebooks fully inside a completed monthly window', () => {
    const candidates = selectCleanupCandidates(
      [
        notebook('inside', 'AIレーダー週報：2026-04-06〜2026-04-12 · Weekly Assets'),
        notebook('cross-month', 'AI 雷达周报：2026-04-27 至 2026-05-03 · Weekly Assets'),
        notebook('daily', 'AI 雷达日报：2026-04-08 · Audio'),
      ],
      { cadence: 'monthly', start: '2026-04-01', end: '2026-04-30' },
    );

    expect(ids(candidates)).toEqual(['inside']);
  });

  it('derives previous ISO week and previous month cleanup windows', () => {
    expect(getCleanupWindow({ cadence: 'weekly', triggerDate: '2026-05-11' })).toEqual({
      cadence: 'weekly',
      start: '2026-05-04',
      end: '2026-05-10',
    });

    expect(getCleanupWindow({ cadence: 'monthly', triggerDate: '2026-06-01' })).toEqual({
      cadence: 'monthly',
      start: '2026-05-01',
      end: '2026-05-31',
    });
  });
});
