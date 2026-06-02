import { describe, expect, it } from 'vitest';

import { isDailyRadarFileInRange } from '../../scripts/check/radar-date-range.mjs';

describe('radar date range filtering', () => {
  it('honors both from and to dates for daily radar markdown files', () => {
    const options = { from: '2026-05-22', to: '2026-05-23' };

    expect(isDailyRadarFileInRange('daily-ai-radar-2026-05-21.md', options)).toBe(false);
    expect(isDailyRadarFileInRange('daily-ai-radar-2026-05-22.md', options)).toBe(true);
    expect(isDailyRadarFileInRange('daily-ai-radar-2026-05-23.ja.md', options)).toBe(true);
    expect(isDailyRadarFileInRange('daily-ai-radar-2026-05-24.md', options)).toBe(false);
  });
});
