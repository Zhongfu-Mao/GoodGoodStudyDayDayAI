import { describe, expect, it } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
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
  const externalManifest = () => ({
    ...structuredClone(manifest),
    visuals: manifest.visuals.map(({ sha256, ...visual }, index) => ({
      ...visual,
      originalImageUrl: `https://example.com/figure(${index}).png`,
      asset: `https://example.com/figure(${index}).png`,
    })),
  });
  it('embeds reviewed HTTPS originals without requiring local files or checksums', () => {
    const external = externalManifest();
    expect(validateVisualManifest(external)).toEqual([]);
    for (const locale of ['zh', 'ja']) {
      const output = insertVisuals(source, external, locale);
      expect(output).toContain('](<https://example.com/figure(0).png>)');
      expect(insertVisuals(output, external, locale)).toBe(output);
    }
  });
  it.each([
    'http://example.com/image.png', '//example.com/image.png',
    'javascript:alert(1)', 'data:image/png;base64,abc',
    'https://user:password@example.com/image.png', 'https://',
    'https://example.com/image.png\nextra', 'https://example.com/<image>.png',
  ])('rejects unsafe external image references: %s', (url) => {
    const external = externalManifest();
    external.visuals[0].asset = url;
    external.visuals[0].originalImageUrl = url;
    expect(validateVisualManifest(external)).toContain(
      'one: invalid local image path or public HTTPS image URL',
    );
  });
  it('keeps local checksum protection and binds external images to reviewed URLs', () => {
    const external = externalManifest();
    external.visuals[0].asset = 'https://example.com/different.png';
    expect(validateVisualManifest(external)).toContain(
      'one: external asset must match the reviewed original image URL',
    );
    const staleHash = structuredClone(manifest);
    staleHash.visuals[0].asset = staleHash.visuals[0].originalImageUrl;
    expect(validateVisualManifest(staleHash)).toContain(
      'one: external asset must not carry a local file checksum',
    );
    const missingHash = structuredClone(manifest);
    missingHash.visuals[0].sha256 = '';
    expect(validateVisualManifest(missingHash)).toContain('one: asset checksum required');
  });
  it('checks external-image manifests offline without looking for files in public', () => {
    const root = mkdtempSync(path.join(os.tmpdir(), 'radar-external-visuals-'));
    try {
      mkdirSync(path.join(root, 'scripts/radar/visuals'), { recursive: true });
      mkdirSync(path.join(root, 'src/content/radar'), { recursive: true });
      const external = externalManifest();
      writeFileSync(path.join(root, 'scripts/radar/visuals/2026-10-09.json'), JSON.stringify(external));
      for (const locale of ['zh', 'ja']) {
        writeFileSync(path.join(root, 'src/content/radar',
          `daily-ai-radar-2026-10-09${locale === 'ja' ? '.ja' : ''}.md`),
        insertVisuals(source, external, locale));
      }
      const result = spawnSync(process.execPath, [
        path.resolve('scripts/radar/inline-visuals.mjs'), '--check', '--date', '2026-10-09',
      ], { cwd: root, encoding: 'utf8' });
      expect(result.stderr).toBe('');
      expect(result.status).toBe(0);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
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
