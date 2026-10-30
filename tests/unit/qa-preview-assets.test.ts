import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('UI asset resolution for local radar previews', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('GITHUB_REPOSITORY', 'Zhongfu-Mao/GoodGoodStudyDayDayAI');
    vi.stubEnv('RADAR_PREVIEW_DRAFTS', '1');
    vi.stubEnv('CI', '');
  });
  afterEach(() => vi.unstubAllEnvs());

  it('resolves a base-prefixed Japanese audio URL with query/hash to the server sample', async () => {
    const { resolveDistAsset } = await import('../ui/qa-utils');
    expect(
      resolveDistAsset(
        '/GoodGoodStudyDayDayAI/__radar-preview/audio/daily-ai-radar-2026-10-26.ja.mp3?v=2#time',
      ),
    ).toBe(path.resolve('tmp/radar-v2/preview-media/audio/daily-ai-radar-2026-10-26.ja.mp3'));
  });

  it.each([
    { preview: '', ci: '' },
    { preview: '1', ci: 'true' },
  ])('keeps production and CI resolution in dist ($preview / $ci)', async ({ preview, ci }) => {
    vi.stubEnv('RADAR_PREVIEW_DRAFTS', preview);
    vi.stubEnv('CI', ci);
    const { resolveDistAsset } = await import('../ui/qa-utils');
    expect(
      resolveDistAsset(
        '/GoodGoodStudyDayDayAI/__radar-preview/audio/daily-ai-radar-2026-10-26.mp3',
      ),
    ).toBe(path.resolve('dist/__radar-preview/audio/daily-ai-radar-2026-10-26.mp3'));
  });

  it('continues to check ordinary images and rejects unnamed preview files', async () => {
    const { resolveDistAsset } = await import('../ui/qa-utils');
    expect(resolveDistAsset('/GoodGoodStudyDayDayAI/images/radar/cover.webp?q=1#preview')).toBe(
      path.resolve('dist/images/radar/cover.webp'),
    );
    expect(resolveDistAsset('/GoodGoodStudyDayDayAI/__radar-preview/audio/private.mp3')).toBe(
      path.resolve('dist/__radar-preview/audio/private.mp3'),
    );
  });
});
