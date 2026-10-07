import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseFrontmatter, stripFrontmatter } from '../../scripts/lib/frontmatter.mjs';
import {
  buildInfographicBrief,
  renderInfographicPrompt,
} from '../../scripts/lib/radar-infographic-brief.mjs';

function fromReport(filename: string) {
  const raw = readFileSync(`src/content/radar/${filename}.md`, 'utf8');
  return buildInfographicBrief(parseFrontmatter(raw), stripFrontmatter(raw));
}

describe('Radar infographic fact coverage', () => {
  it.each([
    '',
    '.ja',
  ])('keeps all six sections and twelve items, including the last Newsletter item (%s)', (language) => {
    const brief = fromReport(`daily-ai-radar-2026-09-30${language}`);
    expect(brief.date).toBe('2026-09-30');
    expect(brief.sections.map((section) => section.key)).toEqual([
      'engineering',
      'models',
      'tools',
      'market',
      'trends',
      'newsletter',
    ]);
    expect(brief.itemCount).toBe(12);
    expect(brief.sections.at(-1)?.items.at(-1)?.title).toContain('ByteByteGo');
    expect(brief.sections.at(-1)?.items.at(-1)?.facts).toBeTruthy();
  });

  it('retains number qualifiers, uncertainty and the final sentence of summaries', () => {
    const brief = fromReport('daily-ai-radar-2026-09-30');
    const model = brief.sections[1].items[0].facts;
    expect(model).toContain('11.4%降至7.7%');
    expect(model).toContain('专门收集的易错问题');
    expect(model).toContain('不是普通用户请求的总体错误率');
    expect(model).toContain('Ultrafast版本仍属后续安排');
    expect(brief.sections[4].items[0].facts).toContain('当日趋势页显示新增232颗star');
    expect(brief.sections[3].items[1].facts).toContain('不是精确时间预测');
  });

  it('keeps multi-line summaries without truncating their caveats', () => {
    const raw = readFileSync('src/content/radar/daily-ai-radar-2026-09-30.md', 'utf8');
    const body = stripFrontmatter(raw).replace('这不是普通用户请求', '\n这不是普通用户请求');
    expect(buildInfographicBrief(parseFrontmatter(raw), body).sections[1].items[0].facts).toContain(
      '这不是普通用户请求的总体错误率',
    );
  });

  it('rejects missing sections before any external generation can start', () => {
    const raw = readFileSync('src/content/radar/daily-ai-radar-2026-09-30.md', 'utf8');
    const body = stripFrontmatter(raw).split('## 📬 Newsletter')[0];
    expect(() => buildInfographicBrief(parseFrontmatter(raw), body)).toThrow('newsletter section');
  });

  it.each(['', '.ja'])('supports weekly headings without section numbers (%s)', (language) => {
    const brief = fromReport(`weekly-ai-radar-2026-09-14-to-2026-09-20${language}`);
    expect(brief.sections).toHaveLength(6);
    expect(brief.itemCount).toBe(12);
  });

  it.each([
    '',
    '.ja',
  ])('preserves monthly structure instead of imposing daily columns (%s)', (language) => {
    const brief = fromReport(`monthly-ai-radar-2026-08${language}`);
    expect(brief.sections).toHaveLength(5);
    expect(brief.sections[0].items).toHaveLength(5);
    expect(brief.sections[0].items[0].facts).toContain('23%');
    expect(brief.sections.at(-1)?.key).toBe('newsletter');
  });

  it.each([
    '',
    '.ja',
  ])('gives both backends the same facts with separate watermark rules (%s)', (language) => {
    const brief = fromReport(`daily-ai-radar-2026-09-30${language}`);
    const notebook = renderInfographicPrompt(brief);
    const imagegen = renderInfographicPrompt(brief, { backend: 'imagegen' });
    expect(notebook.slice(notebook.indexOf('{'))).toBe(imagegen.slice(imagegen.indexOf('{')));
    expect(notebook).not.toContain('sourceSha256');
    expect(notebook).not.toContain('Detailed');
    expect(notebook).not.toContain('no watermark');
    expect(imagegen).toContain('no watermark');
    expect(notebook).toContain(language ? '因果関係を捏造しない' : '不得编造因果关系');
  });
});
