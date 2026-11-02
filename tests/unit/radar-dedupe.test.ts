import { describe, expect, it } from 'vitest';

import { findDuplicateLinkFailures } from '../../scripts/check/radar-dedupe.mjs';

describe('radar dedupe gate', () => {
  it('keeps distinct query-identified papers while detecting tracking-only duplicates', () => {
    const check = (links: string[]) => findDuplicateLinkFailures(new Map([['2026-10-21', { file: 'daily-ai-radar-2026-10-21.md', links }]]), { from: '2026-10-21', to: '2026-10-21' });
    expect(check(['https://openreview.net/forum?id=a', 'https://openreview.net/forum?id=b'])).toEqual([]);
    expect(check(['https://openreview.net/forum?id=a', 'https://openreview.net/forum?utm_source=mail&id=a'])).toHaveLength(1);
  });
  it('flags duplicate public links inside one daily radar file', () => {
    const failures = findDuplicateLinkFailures(
      new Map([
        [
          '2026-05-23',
          {
            file: 'daily-ai-radar-2026-05-23.md',
            links: ['https://example.com/a', 'https://example.com/b', 'https://example.com/a/'],
          },
        ],
      ]),
      { from: '2026-05-23', to: '2026-05-23' },
    );

    expect(failures).toContain(
      'daily-ai-radar-2026-05-23.md: duplicate link inside same report: https://example.com/a/',
    );
  });

  it('keeps the lookback window available when checking a narrow date range', () => {
    const failures = findDuplicateLinkFailures(
      new Map([
        [
          '2026-05-31',
          {
            file: 'daily-ai-radar-2026-05-31.md',
            links: ['https://github.com/D4Vinci/Scrapling'],
          },
        ],
        [
          '2026-06-03',
          {
            file: 'daily-ai-radar-2026-06-03.md',
            links: ['https://github.com/D4Vinci/Scrapling'],
          },
        ],
      ]),
      { from: '2026-06-03', to: '2026-06-03', historyFrom: '2026-05-15' },
    );

    expect(failures).toContain(
      'daily-ai-radar-2026-06-03.md: duplicate link from previous 7 days: https://github.com/D4Vinci/Scrapling (daily-ai-radar-2026-05-31.md)',
    );
  });
});
