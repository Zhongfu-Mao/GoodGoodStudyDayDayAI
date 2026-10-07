import { createHash } from 'node:crypto';
import { normalizeNewlines, stripMarkdown } from './markdown.mjs';

const SECTION_TYPES = [
  ['engineering', /AI\s*Engineering|AIエンジニアリング|架构|アーキテクチャ|Architecture/i],
  ['models', /模型|モデル|アルゴリズム/],
  ['tools', /实战代码|実践コード|実装コード|ツール|Tools\s*&\s*Code/i],
  ['market', /行业|業界|ビジネス/],
  ['trends', /GitHub/i],
  ['newsletter', /Newsletter|ニュースレター|邮件补遗|メール補遺|補遺/i],
];

function blocksAt(markdown, level) {
  const headings = [...markdown.matchAll(new RegExp(`^${'#'.repeat(level)}\\s+(.+)$`, 'gm'))];
  return headings.map((match, index) => ({
    title: stripMarkdown(match[1]),
    content: markdown.slice(match.index + match[0].length, headings[index + 1]?.index).trim(),
  }));
}

function itemFacts(content) {
  const summary = content.match(
    /^[-*]\s*(?:摘要|要約|Summary)\s*[:：]\s*([\s\S]*?)(?=^[-*]\s*(?:来源|出典|Source|日期|日付|リンク|链接)\s*[:：]|(?![\s\S]))/m,
  )?.[1];
  // Preserve the entire summary, including caveats. Do not truncate by characters
  // or sentences: the qualifying sentence often follows the headline number.
  if (summary) return stripMarkdown(summary);
  return stripMarkdown(
    content
      .split(/\n\s*\n/)
      .filter(
        (paragraph) =>
          !/^(?:关键佐证|主な根拠|参考|出典|来源|Source|参考链接)\s*[:：]?/.test(paragraph.trim()),
      )
      .filter((paragraph) => !/^\s*[-*]\s*\[/.test(paragraph))
      .join('\n\n'),
  );
}

export function buildInfographicBrief(meta, body) {
  const normalized = normalizeNewlines(body);
  const cadence = meta.cadence ?? 'daily';
  const sections = blocksAt(normalized, 2)
    .map((block) => ({
      ...block,
      key: SECTION_TYPES.find(([, pattern]) => pattern.test(block.title))?.[0],
    }))
    .filter((block) =>
      cadence === 'monthly'
        ? !/范围|対象期間|対象範囲|综述|概観|来源|出典|参考|Sources/i.test(block.title)
        : Boolean(block.key),
    )
    .map((block) => {
      const items = blocksAt(block.content, 3);
      return {
        key: block.key ?? block.title,
        title: block.title,
        items: (items.length ? items : [{ title: block.title, content: block.content }]).map(
          (item) => ({ title: item.title, facts: itemFacts(item.content) }),
        ),
      };
    });

  if (!sections.length) throw new Error('Infographic brief has no content sections.');
  if (cadence !== 'monthly') {
    for (const [key] of SECTION_TYPES) {
      const matches = sections.filter((section) => section.key === key);
      if (matches.length !== 1)
        throw new Error(`Infographic brief requires exactly one ${key} section.`);
    }
  }
  for (const section of sections) {
    for (const item of section.items) {
      if (!item.facts) throw new Error(`Infographic brief has no facts for: ${item.title}`);
    }
  }

  const date = meta.raw?.match(/^date:\s*["']?([^\n"']+)/m)?.[1]?.trim();
  return {
    version: 1,
    sourceSha256: createHash('sha256')
      .update(`${meta.raw ?? meta.title}\n${normalized}`)
      .digest('hex'),
    title: meta.title,
    date: date ?? meta.title,
    language: meta.lang,
    cadence,
    sections,
    itemCount: sections.reduce((sum, section) => sum + section.items.length, 0),
  };
}

export function renderInfographicPrompt(brief, { backend = 'notebooklm' } = {}) {
  const japanese = brief.language === 'ja';
  const instructions = japanese
    ? [
        '公開記事用の横長 editorial infographic を作成してください。本文全体を自由に再要約せず、以下の確定した事実リストを内容の契約として使ってください。',
        `タイトルと日付を正確に表示。${brief.sections.length} セクションと ${brief.itemCount} 項目を元の順序・分類のまま全て掲載し、勝手に統合・省略・移動しない。Newsletter も具体的な記事と事実を掲載。`,
        '各項目は名前と具体的な事実・仕組みを短い見出しと読みやすい説明に圧縮する。原文の全段落を画像に貼り付けない。数値・小数点・単位・バージョン・比較対象・対象集団・期間・当日増分・提供範囲・不確実性・制約は変えない。必要な限定条件は数値の隣に表示。',
        '予測を実績に、提案を導入済みに、特定ベンチマークを一般的保証に変えない。元のリストにない事実・ロゴ・帰属を追加しない。因果関係を捏造しない。矢印は明示された手順や関係だけに使う。',
        '温かい紙色、手描きのインク線、控えめな水彩。大きく読みやすい文字を優先し、中央の装飾・人物・風景より各項目の説明に面積を使う。見出しだけのカード、スローガン、ロゴ一覧、読めない疑似文字は避ける。情報が多ければ装飾と繰り返しを減らし、必須項目や限定条件は削らない。',
        '出力文字は日本語。固有名詞は原表記を維持。画像の出典欄にURLや内部作業記録を載せない。',
      ]
    : [
        '生成用于公开文章的横向 editorial infographic。不要自由重选整篇文章的重点；以下冻结事实清单是内容契约。',
        `准确显示标题与日期；按原顺序、原分类完整呈现 ${brief.sections.length} 个栏目、${brief.itemCount} 个条目，不自行合并、遗漏或移动。Newsletter 必须呈现具体文章与事实。`,
        '每条用名称、短标题与可读说明呈现具体事实或机制，不把全文段落塞进图片。保留数字、小数点、单位、版本、比较对象、样本范围、时间、当日增量、开放范围、不确定性与限制；数字的必要限定条件必须显示在旁边。',
        '不得把预测改为已发生、建议改为已部署、特定基准改为普遍保证；不得新增清单以外的事实、Logo 或机构归属。不得编造因果关系；箭头只表示正文明确的流程或关系。',
        '暖纸色、手绘墨线、克制水彩，优先大字与可读性。面积优先给每条事实及机制图，避免巨大中心装饰、人物或风景；禁止只有栏目名的卡片、口号、Logo 列表与伪字。空间不足先删装饰和重复措辞，不删必留条目或限定条件。',
        '输出文字为简体中文，专有名称保留原写法；不在图片中放URL、内部工作记录或审核措辞。',
      ];
  instructions.push(
    backend === 'notebooklm'
      ? japanese
        ? 'NotebookLM の通常の透かしは許容する。'
        : '允许 NotebookLM 正常水印。'
      : 'wide 16:9 horizontal high-information editorial infographic; raster hand-drawn infographic only; no watermark, no NotebookLM mark, no logo mark, no signature.',
  );
  const facts = { title: brief.title, date: brief.date, sections: brief.sections };
  return `${instructions.join('\n')}\n\n${japanese ? '確定した事実リスト' : '冻结事实清单'}：\n${JSON.stringify(facts, null, 2)}`;
}
