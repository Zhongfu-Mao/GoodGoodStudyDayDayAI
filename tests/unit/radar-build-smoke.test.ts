import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { afterEach, expect, it } from 'vitest';

const script = fileURLToPath(new URL('../../scripts/check/radar-build-smoke.mjs', import.meta.url));
const roots: string[] = [];
const date = '2026-10-11';
const slug = `daily-ai-radar-${date}`;
const base = 'https://example.org/GoodGoodStudyDayDayAI/';
const escapeXml = (s: string) => s.replaceAll('&', '&amp;').replaceAll('"', '&quot;');

function fixture(legacy = false) {
  const root = mkdtempSync(path.join(os.tmpdir(), 'radar-build-smoke-'));
  roots.push(root);
  function put(name: string, value: string) {
    const file = path.join(root, name);
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, value);
  }
  function report(day: string, locale: string, draft: boolean) {
    const suffix = locale === 'ja' ? '.ja' : '';
    const audio = legacy
      ? `/audio/radar/daily-ai-radar-${day}${suffix}.mp3`
      : `https://media.example.org/audio/radar/daily-ai-radar-${day}${suffix}-${'a'.repeat(64)}.mp3?v=2&lang=${locale}`;
    put(
      `src/content/radar/daily-ai-radar-${day}${suffix}.md`,
      `---\ntitle: "Radar ${day}"\nlang: ${locale}\ndraft: ${draft}\naudioUrl: "${audio}"\naudioSize: 1234\naudioDuration: 600\n---\nBody\n`,
    );
    return audio;
  }
  const urls: Record<string, string> = {};
  for (const locale of ['zh', 'ja']) {
    const prefix = locale === 'ja' ? 'ja/' : '';
    const audio = report(date, locale, false);
    urls[locale] = legacy ? base.slice(0, -1) + audio : audio;
    const player = legacy ? '/GoodGoodStudyDayDayAI' + audio : audio;
    put(
      `dist/${prefix}radar/${slug}/index.html`,
      `<main data-audio-src="${escapeXml(player)}"></main>`,
    );
  }
  function feed(
    locale = 'zh',
    changes: {
      url?: string;
      size?: number;
      duration?: number;
      type?: string;
      duplicate?: boolean;
    } = {},
  ) {
    const prefix = locale === 'ja' ? 'ja/' : '';
    const episode = `<item><link>${base}${prefix}radar/${slug}/</link><enclosure url="${escapeXml(changes.url ?? urls[locale])}" length="${changes.size ?? 1234}" type="${changes.type ?? 'audio/mpeg'}"/><itunes:duration>${changes.duration ?? 600}</itunes:duration></item>`;
    put(
      `dist/${prefix}feed.xml`,
      `<rss xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"><channel><link>${base}</link>${episode}${changes.duplicate ? episode : ''}</channel></rss>`,
    );
  }
  feed('zh');
  feed('ja');
  put(
    'dist/sitemap-0.xml',
    `<urlset><url><loc>${base}radar/${slug}/</loc></url><url><loc>${base}ja/radar/${slug}/</loc></url></urlset>`,
  );
  function run(args: string[] = []) {
    return spawnSync(process.execPath, [script, ...args], {
      cwd: root,
      encoding: 'utf8',
      env: {
        ...process.env,
        BASE_PATH: '/GoodGoodStudyDayDayAI/',
        GITHUB_REPOSITORY: 'Zhongfu-Mao/GoodGoodStudyDayDayAI',
      },
    });
  }
  return { root, put, report, feed, run, urls };
}

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

it('accepts exact hashed R2 enclosures including XML-escaped query parameters for both languages', () => {
  const r = fixture().run();
  expect(r.status, r.stderr).toBe(0);
  expect(r.stdout).toContain(date);
});
it('accepts legacy local audio URLs under the GitHub Pages project base', () => {
  const r = fixture(true).run(['--date=' + date]);
  expect(r.status, r.stderr).toBe(0);
});
it('ignores newer drafts when selecting the latest published daily', () => {
  const f = fixture();
  f.report('2026-10-12', 'zh', true);
  f.report('2026-10-12', 'ja', true);
  const r = f.run();
  expect(r.status, r.stderr).toBe(0);
  expect(r.stdout).toContain(date);
  expect(f.run(['--date', '2026-10-12']).stderr).toContain('still a draft');
});
it('does not silently skip a missing or draft Japanese sibling of the latest published daily', () => {
  const f = fixture();
  rmSync(path.join(f.root, `src/content/radar/${slug}.ja.md`));
  expect(f.run().status).not.toBe(0);
  f.report(date, 'ja', true);
  expect(f.run().stderr).toContain('still a draft');
});
it('rejects a wrong enclosure even if the expected URL occurs elsewhere in the XML', () => {
  const f = fixture();
  f.feed('zh', { url: 'https://media.example.org/wrong.mp3' });
  const file = 'dist/feed.xml';
  f.put(
    file,
    `<rss><channel><link>${base}</link><description>${escapeXml(f.urls.zh)}</description><item><link>${base}radar/${slug}/</link><enclosure url="https://media.example.org/wrong.mp3" length="1234" type="audio/mpeg"/><itunes:duration>600</itunes:duration></item></channel></rss>`,
  );
  expect(f.run().stderr).toContain('Feed audio URL mismatch');
});
it.each([
  [{ size: 1235 }, 'audioSize'],
  [{ duration: 601 }, 'audioDuration'],
  [{ type: 'text/html' }, 'MIME'],
] as const)('rejects incorrect enclosure metadata %j', (changes, reason) => {
  const f = fixture();
  f.feed('ja', changes);
  expect(f.run().stderr).toContain(reason);
});
it('rejects duplicate or missing episode identities', () => {
  const f = fixture();
  f.feed('zh', { duplicate: true });
  expect(f.run().stderr).toContain('exactly one feed episode');
  f.put('dist/feed.xml', `<rss><channel><link>${base}</link></channel></rss>`);
  expect(f.run().stderr).toContain('exactly one feed episode');
});
it('retains route, player and bilingual sitemap checks', () => {
  const f = fixture();
  const page = `dist/ja/radar/${slug}/index.html`;
  f.put(page, '<main>No audio player</main>');
  expect(f.run().stderr).toContain('missing expected content');
  f.put(page, `<main data-audio-src="${escapeXml(f.urls.ja)}"></main>`);
  f.put('dist/sitemap-0.xml', `<urlset><url><loc>${base}radar/${slug}/</loc></url></urlset>`);
  expect(f.run().stderr).toContain('Sitemap is missing');
  rmSync(path.join(f.root, page));
  expect(f.run().stderr).toContain('Missing expected build output');
});
it('fails instead of declaring success when all dailies are drafts', () => {
  const f = fixture();
  f.report(date, 'zh', true);
  expect(f.run().stderr).toContain('No published daily radar');
});
