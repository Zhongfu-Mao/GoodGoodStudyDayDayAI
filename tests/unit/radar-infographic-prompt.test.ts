import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseFrontmatter, stripFrontmatter } from '../../scripts/lib/frontmatter.mjs';
import {
  buildInfographicBrief,
  createVisualCopyTemplate,
  renderInfographicPrompt,
  validateVisualCopy,
} from '../../scripts/lib/radar-infographic-brief.mjs';

function fromReport(filename: string) {
  const raw = readFileSync(`src/content/radar/${filename}.md`, 'utf8');
  return buildInfographicBrief(parseFrontmatter(raw), stripFrontmatter(raw));
}

function copyFor(brief: ReturnType<typeof buildInfographicBrief>) {
  const copy = createVisualCopyTemplate(brief);
  for (const section of copy.sections) {
    for (const item of section.items) {
      item.label = item.sourceTitle.split(/[：:]/)[0].slice(0, 30);
      item.text = brief.language === 'ja' ? '出典に記載された条件に限る' : '仅限来源所述条件';
      item.visual =
        brief.language === 'ja'
          ? 'この項目の仕組みを独立した小図で示す'
          : '用独立小图呈现该条的机制';
    }
  }
  return copy;
}

function promptFacts(prompt: string) {
  return JSON.parse(prompt.split('<FACTS_JSON>\n')[1].split('\n</FACTS_JSON>')[0]);
}

describe('Radar infographic fact coverage', () => {
  it.each(['', '.ja'])(
    'keeps all six sections and twelve items, including the last Newsletter item (%s)',
    (language) => {
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
    },
  );

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

  it.each(['', '.ja'])(
    'rejects explicit empty summaries instead of treating metadata as facts (%s)',
    (language) => {
      const raw = readFileSync(`src/content/radar/daily-ai-radar-2026-09-30${language}.md`, 'utf8');
      const body = stripFrontmatter(raw).replace(/^([-*]\s*(?:摘要|要約)\s*[:：]).+/m, '$1');
      expect(() => buildInfographicBrief(parseFrontmatter(raw), body)).toThrow('no facts');
    },
  );

  it.each(['', '.ja'])('supports weekly headings without section numbers (%s)', (language) => {
    const brief = fromReport(`weekly-ai-radar-2026-09-14-to-2026-09-20${language}`);
    expect(brief.sections).toHaveLength(6);
    expect(brief.itemCount).toBe(12);
  });

  it.each(['', '.ja'])(
    'preserves monthly structure instead of imposing daily columns (%s)',
    (language) => {
      const brief = fromReport(`monthly-ai-radar-2026-08${language}`);
      expect(brief.sections).toHaveLength(5);
      expect(brief.sections[0].items).toHaveLength(5);
      expect(brief.sections[0].items[0].facts).toContain('23%');
      expect(brief.sections.at(-1)?.key).toBe('newsletter');
    },
  );

  it.each(['', '.ja'])(
    'gives both backends the same facts with separate watermark rules (%s)',
    (language) => {
      const brief = fromReport(`daily-ai-radar-2026-09-30${language}`);
      const visualCopy = copyFor(brief);
      const notebook = renderInfographicPrompt(brief, { visualCopy });
      const imagegen = renderInfographicPrompt(brief, { backend: 'imagegen', visualCopy });
      expect(promptFacts(notebook)).toEqual(promptFacts(imagegen));
      expect(promptFacts(notebook).sections).toEqual(brief.sections);
      expect(notebook).not.toContain('sourceSha256');
      expect(notebook).not.toContain('Detailed');
      expect(notebook).not.toContain('no watermark');
      expect(imagegen).toContain('no watermark');
      expect(notebook).toContain(language ? '因果関係を捏造しない' : '不得编造因果关系');
    },
  );
});

describe('Radar infographic display copy', () => {
  it.each(['', '.ja'])(
    'separates complete evidence from approved short display text (%s)',
    (language) => {
      const brief = fromReport(`daily-ai-radar-2026-10-15${language}`);
      const visualCopy = copyFor(brief);
      visualCopy.sections[1].items[0].text = language
        ? '特定の工学的最適化。汎用の高速化ではない'
        : '特定工程优化，非通用加速';
      const prompt = renderInfographicPrompt(brief, { visualCopy });
      expect(promptFacts(prompt).sections).toEqual(brief.sections);
      const display = prompt.split('<DISPLAY_COPY>\n')[1].split('\n</DISPLAY_COPY>')[0];
      expect(display).toContain(visualCopy.sections[1].items[0].text);
      expect(display).not.toContain('2.85');
      expect(promptFacts(prompt).sections[1].items[0].facts).toContain('2.85');
      expect([...display.matchAll(/^\d{2} /gm)]).toHaveLength(brief.itemCount);
      expect(display).toContain('13 Every');
      expect(prompt).toContain(language ? '画面掲載文案」だけ' : '“画面文案”是唯一允许上图的文字');
      expect(prompt).not.toContain(
        language ? '必須項目や限定条件は削らない' : '不删必留条目或限定条件',
      );
    },
  );

  it('requires an explicit copy plan instead of silently printing the full summaries', () => {
    expect(() => renderInfographicPrompt(fromReport('daily-ai-radar-2026-09-30'))).toThrow(
      'visual-copy plan',
    );
  });

  it.each([
    'missing item',
    'reordered items',
    'wrong section',
    'stale source',
    'wrong language',
    'empty text',
    'long text',
    'unsupported number',
    'empty visual',
    'long visual',
  ])('rejects %s before generation', (problem) => {
    const brief = fromReport('daily-ai-radar-2026-10-15');
    const copy = copyFor(brief);
    switch (problem) {
      case 'missing item':
        copy.sections[5].items.pop();
        break;
      case 'reordered items':
        copy.sections[0].items.reverse();
        break;
      case 'wrong section':
        copy.sections.reverse();
        break;
      case 'stale source':
        copy.sourceSha256 = 'old';
        break;
      case 'wrong language':
        copy.language = 'ja';
        break;
      case 'empty text':
        copy.sections[0].items[0].text = '';
        break;
      case 'long text':
        copy.sections[0].items[0].text = '字'.repeat(81);
        break;
      case 'unsupported number':
        copy.sections[0].items[0].text = '性能提升99999倍';
        break;
      case 'empty visual':
        copy.sections[0].items[0].visual = '';
        break;
      case 'long visual':
        copy.sections[0].items[0].visual = '字'.repeat(241);
        break;
    }
    expect(() => validateVisualCopy(brief, copy)).toThrow();
  });

  it('exports an unfilled template while leaving the source facts intact', () => {
    const brief = fromReport('daily-ai-radar-2026-09-30');
    const before = JSON.stringify(brief);
    const template = createVisualCopyTemplate(brief);
    expect(template.sourceSha256).toBe(brief.sourceSha256);
    expect(
      template.sections.flatMap((section) => section.items).every((item) => item.text === ''),
    ).toBe(true);
    expect(() => validateVisualCopy(brief, template)).toThrow('short label');
    expect(JSON.stringify(brief)).toBe(before);
  });

  it.each(['', '.ja'])('uses the no-intro six-panel observation layout (%s)', (language) => {
    const brief = fromReport(`daily-ai-radar-2026-10-15${language}`);
    const visualCopy = copyFor(brief);
    const prompt = renderInfographicPrompt(brief, { visualCopy });
    expect(prompt).toContain(language ? '3列2行' : '三列两行');
    expect(prompt).toContain(
      language ? '導入文・一文要約・副題を追加しない' : '不添加导语、一句话总结或副标题',
    );
    expect(prompt).toContain('2/2/2/2/2/3');
    const drawings = prompt.split('<ILLUSTRATION_PLAN>\n')[1].split('\n</ILLUSTRATION_PLAN>')[0];
    expect([...drawings.matchAll(/^\d{2} /gm)]).toHaveLength(13);
    expect(drawings).toContain(visualCopy.sections[0].items[0].visual);
    expect(promptFacts(prompt).sections).toEqual(brief.sections);
    const display = prompt.split('<DISPLAY_COPY>\n')[1].split('\n</DISPLAY_COPY>')[0];
    expect(display).not.toContain(visualCopy.sections[0].items[0].visual);
    expect(prompt).not.toContain('<INTRO_COPY>');
  });

  it.each(['', '.ja'])(
    'keeps the monthly panel count instead of imposing six daily panels (%s)',
    (language) => {
      const brief = fromReport(`monthly-ai-radar-2026-08${language}`);
      const prompt = renderInfographicPrompt(brief, { visualCopy: copyFor(brief) });
      expect(prompt).toContain(language ? '独立した5個のパネル' : '5个独立面板');
      expect(promptFacts(prompt).sections).toHaveLength(5);
    },
  );
});
