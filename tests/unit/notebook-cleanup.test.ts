import { describe, expect, it } from 'vitest';
import {
  getCleanupWindow,
  parseRadarNotebookTitle,
  selectCleanupCandidates,
} from '../../scripts/lib/notebook-cleanup.mjs';

const notebook = (id: string, title: string) => ({ id, title });
const ids = (candidates: Array<{ id?: string }>) => candidates.map((candidate) => candidate.id);

describe('NotebookLM radar cleanup helpers', () => {
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
