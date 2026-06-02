import { describe, expect, it } from 'vitest';

import { findDuplicateLinkFailures } from '../../scripts/check/radar-dedupe.mjs';

describe('radar dedupe gate', () => {
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
});
