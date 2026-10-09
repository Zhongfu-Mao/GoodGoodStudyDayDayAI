import { describe, expect, it } from 'vitest';
import {
  insertVisuals,
  reportEntries,
  validateVisualManifest,
} from '../../scripts/lib/radar-inline-visuals.mjs';

const source = `---\ntitle: Example\nlang: zh\n---\n\n## Engineering\n\n### One\n- 链接：https://example.com/one\n- 摘要：One.\n\n### Two\n- 链接：https://example.com/two\n- 摘要：Two.\n\n## Research\n\n### Three\n- 链接：https://example.com/three\n- 摘要：Three.\n`;
const manifest = {
  version: 1,
  date: '2026-10-09',
  visuals: ['One', 'Two', 'Three'].map((heading) => ({
    id: heading.toLowerCase(),
    sourceUrl: `https://example.com/${heading.toLowerCase()}`,
    originalImageUrl: 'https://example.com/image.png',
    asset: `/images/radar/${heading}.webp`,
    sha256: 'a'.repeat(64),
    credit: 'Example',
    review: 'accepted',
    zh: { heading, alt: '关系图', caption: '从上到下阅读各步骤。' },
    ja: { heading, alt: '関係図', caption: '上から下へ手順を示します。' },
  })),
};

describe('reviewed inline radar visuals', () => {
  it('places images in the matching entry, before the next section, and is idempotent', () => {
    const output = insertVisuals(source, manifest, 'zh');
    expect(output.indexOf('radar-visual:two')).toBeLessThan(output.indexOf('## Research'));
    expect(reportEntries(output)[1].block).toContain('radar-visual:two');
    expect(insertVisuals(output, manifest, 'zh')).toBe(output);
  });
  it('refuses stale headings, wrong source URLs, and unreviewed assets', () => {
    expect(() => insertVisuals(source.replace('### Two', '### Changed'), manifest, 'zh')).toThrow(
      'exactly one entry',
    );
    expect(() =>
      insertVisuals(
        source.replace('https://example.com/two', 'https://example.org/two'),
        manifest,
        'zh',
      ),
    ).toThrow('exactly one entry');
    const draft = structuredClone(manifest);
    draft.visuals[0].review = 'candidate';
    expect(validateVisualManifest(draft)).toContain('one: visual QA not accepted');
  });
  it('does not overwrite an existing unmanaged image or accept a missing Japanese caption', () => {
    expect(() =>
      insertVisuals(
        source.replace('- 摘要：One.', '![Existing](/images/original.png)'),
        manifest,
        'zh',
      ),
    ).toThrow('unmanaged image');
    const incomplete = structuredClone(manifest);
    incomplete.visuals[0].ja.caption = '';
    expect(validateVisualManifest(incomplete)).toContain('one: missing ja heading/alt/caption');
  });
  it('rejects an empty exception and managed blocks moved into another entry', () => {
    expect(
      validateVisualManifest({ ...manifest, visuals: [], exception: 'No candidates' }),
    ).toContain('At least one reviewed inline visual is required');
    const output = insertVisuals(source, manifest, 'zh');
    const block = output.match(/<!-- radar-visual:one -->[\s\S]*?<!-- \/radar-visual:one -->/)![0];
    const misplaced = output.replace(block, '').replace('### Two', `### Two\n\n${block}`);
    expect(() => insertVisuals(misplaced, manifest, 'zh')).toThrow('wrong entry');
  });
});
