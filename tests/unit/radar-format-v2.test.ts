import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  CHANNELS,
  EVIDENCE,
  TOPICS,
  inspectRadarV2,
  compareRadarV2,
  isRadarV2,
} from '../../scripts/lib/radar-format.mjs';
import {
  buildInfographicBrief,
  createVisualCopyTemplate,
  renderInfographicPrompt,
} from '../../scripts/lib/radar-infographic-brief.mjs';
import { parseFrontmatter } from '../../scripts/lib/frontmatter.mjs';
import { buildBriefMemo } from '../../scripts/radar/generate-audio.mjs';
import { evaluateRadarSourceDiversity } from '../../scripts/check/radar-source-diversity.mjs';

function report(lang: 'zh' | 'ja' = 'zh', deep = false) {
  const ja = lang === 'ja';
  return `---\ntitle: Sample\ndate: 2026-10-20\nlang: ${lang}\ncadence: daily\nradarFormat: 2\ndraft: true\n---\n## ${ja ? '今日の重要な変化' : '三条关键变化'}\n\n${[1, 2, 3].map((i) => `- [Change ${i}](#radar-story-${i})`).join('\n')}\n\n## ${TOPICS.building[lang]}\n\n${[1, 2, 3].map((i) => `${deep && i === 3 ? `## ${ja ? '深掘り' : '延伸阅读'}\n\n- note\n\n` : ''}### Story ${i}\n\n<a id="radar-story-${i}"></a>\n\n${deep && i === 3 ? `- ${ja ? 'テーマ' : '主题'}：${TOPICS.building[lang]}\n` : ''}- ${ja ? '出典' : '来源'}：Publisher ${i}\n- ${ja ? '情報経路' : '来源渠道'}：${CHANNELS.podcast[ja ? 1 : 0]}、Newsletter\n- ${ja ? 'エビデンス区分' : '证据性质'}：${EVIDENCE.author_test[ja ? 1 : 0]}\n- ${ja ? '初出日' : '原始日期'}：2026-10-19\n- ${ja ? 'リンク' : '链接'}：https://example.com/episode-${i}\n- ${ja ? '要約' : '摘要'}：Observed result ${i}. Limited sample; no production guarantee.\n`).join('\n')}`;
}

describe('daily V2 content contract', () => {
  it('requires a real frontmatter format declaration and valid calendar dates', () => {
    expect(isRadarV2(report().replace('radarFormat: 2', '') + '\nradarFormat: 2\n')).toBe(false);
    expect(
      inspectRadarV2(report().replace('2026-10-19', '2026-02-30')).some((f) =>
        f.includes('original date'),
      ),
    ).toBe(true);
  });
  it('allows omitted topics and fewer than eight entries without a Newsletter section', () => {
    expect(inspectRadarV2(report())).toEqual([]);
    const pool = JSON.parse(readFileSync('scripts/radar/source-pool.json', 'utf8'));
    expect(
      evaluateRadarSourceDiversity({
        file: 'daily-ai-radar-2026-10-20.md',
        body: report(),
        sourcePool: pool,
      }),
    ).toEqual([]);
  });
  it('keeps one topic and channels/evidence identical across languages, including deep reading', () => {
    expect(inspectRadarV2(report('ja', true))).toEqual([]);
    expect(compareRadarV2(report('zh', true), report('ja', true))).toBe(true);
    expect(
      compareRadarV2(
        report(),
        report('ja').replace('https://example.com/episode-2', 'https://example.com/other'),
      ),
    ).toBe(false);
    expect(compareRadarV2(report(), report('ja').replace('著者の実測', '独立再現'))).toBe(false);
  });
  it('rejects duplicate channel versions, invented evidence, empty topics and dangling leads', () => {
    expect(inspectRadarV2(report().replace('episode-2', 'episode-1'))).toContain(
      'same event/link appears twice: Story 2',
    );
    expect(inspectRadarV2(report().replace('作者实测', 'unverified'))).toContain(
      'source, evidence and summary required: Story 1',
    );
    expect(inspectRadarV2(report() + '\n## 能力与证据\n')).toContain(
      'omit empty topic: 能力与证据',
    );
    expect(inspectRadarV2(report().replace('#radar-story-1', '#radar-missing'))).toContain(
      'key change target missing: missing',
    );
  });
  it('requires original date, and keeps an unknown date distinct from observation', () => {
    expect(
      inspectRadarV2(report().replace('原始日期：2026-10-19', '原始日期：未确认')).some((f) =>
        f.includes('original date'),
      ),
    ).toBe(true);
    expect(
      inspectRadarV2(
        report().replace('原始日期：2026-10-19', '原始日期：未确认\n- 观察日期：2026-10-20'),
      ),
    ).toEqual([]);
    expect(inspectRadarV2(report().replace('2026-10-19', '2026-10-21'))).toContain(
      'future original/observation date: Story 1',
    );
  });
  it('preserves all stories/caveats once in variable-topic infographic and audio input', () => {
    const source = report('zh', true),
      meta = parseFrontmatter(source);
    const brief = buildInfographicBrief(meta, meta.body);
    expect(brief.sections.map((s) => s.key)).toEqual(['building', 'reading']);
    expect(brief.itemCount).toBe(3);
    const copy = createVisualCopyTemplate(brief);
    for (const section of copy.sections)
      for (const item of section.items) {
        item.label = item.sourceTitle;
        item.text = 'Limited sample';
        item.visual = 'Separate measured results from production usage';
      }
    const prompt = renderInfographicPrompt(brief, { visualCopy: copy });
    expect(prompt).not.toContain('六个独立');
    expect(prompt).not.toContain('Newsletter内每条');
    const memo = buildBriefMemo(meta.body, meta);
    expect(memo.match(/^### /gm)).toHaveLength(3);
    expect(memo.match(/no production guarantee/g)).toHaveLength(3);
    expect(memo).toContain('作者实测');
  });
  it.each(['', '.ja'])('preserves legacy six-section media input (%s)', (locale) => {
    const source = readFileSync(`src/content/radar/daily-ai-radar-2026-10-19${locale}.md`, 'utf8');
    const meta = parseFrontmatter(source),
      brief = buildInfographicBrief(meta, meta.body);
    expect(brief.sections).toHaveLength(6);
    expect(brief.itemCount).toBe(12);
  });
});
