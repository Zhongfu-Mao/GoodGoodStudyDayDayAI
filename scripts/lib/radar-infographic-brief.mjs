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
  // An explicit but empty summary must fail validation, not fall back to source metadata.
  if (summary !== undefined) return stripMarkdown(summary);
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

/** @param {ReturnType<typeof buildInfographicBrief>} brief */
export function createVisualCopyTemplate(brief) {
  return {
    version: 1,
    sourceSha256: brief.sourceSha256,
    language: brief.language,
    sections: brief.sections.map((section) => ({
      key: section.key,
      title: section.title,
      items: section.items.map((item) => ({
        sourceTitle: item.title,
        label: '',
        text: '',
        visual: '',
      })),
    })),
  };
}

export function validateVisualCopy(brief, copy) {
  if (copy?.version !== 1) throw new Error('A version 1 visual-copy plan is required.');
  if (copy.sourceSha256 !== brief.sourceSha256 || copy.language !== brief.language) {
    throw new Error('Visual copy is stale or belongs to a different source/language.');
  }
  if (copy.sections?.length !== brief.sections.length) {
    throw new Error('Visual copy must cover every section in source order.');
  }
  for (const [index, section] of brief.sections.entries()) {
    const display = copy.sections[index];
    if (
      display.key !== section.key ||
      display.title !== section.title ||
      display.items?.length !== section.items.length
    ) {
      throw new Error(`Visual copy section/order mismatch: ${section.title}`);
    }
    for (const [itemIndex, item] of section.items.entries()) {
      const entry = display.items[itemIndex];
      if (entry.sourceTitle !== item.title) {
        throw new Error(`Visual copy item/order mismatch: ${item.title}`);
      }
      for (const [field, limit] of [
        ['label', 40],
        ['text', 80],
        ['visual', 240],
      ]) {
        const value = entry[field];
        if (
          typeof value !== 'string' ||
          !value.trim() ||
          [...value].length > limit ||
          /[\r\n]|https?:\/\/|<!--/.test(value)
        ) {
          throw new Error(
            `Visual copy needs a short ${field} (max ${limit} characters): ${item.title}`,
          );
        }
      }
      // Only a mechanical guard: reviewers must still check attribution and qualifiers.
      const sourceNumbers = new Set(`${item.title} ${item.facts}`.match(/\d+(?:\.\d+)?/g) ?? []);
      for (const number of `${entry.label} ${entry.text}`.match(/\d+(?:\.\d+)?/g) ?? []) {
        if (!sourceNumbers.has(number)) {
          throw new Error(`Visual copy contains an unsupported number ${number}: ${item.title}`);
        }
      }
    }
  }
  return copy;
}

/**
 * @param {ReturnType<typeof buildInfographicBrief>} brief
 * @param {ReturnType<typeof createVisualCopyTemplate>} visualCopy
 */
function renderInfographicDesign(brief, visualCopy) {
  const japanese = brief.language === 'ja';
  const count = brief.sections.length;
  const grid =
    count === 6
      ? japanese
        ? '3列2行、独立した6個の角丸パネル'
        : '三列两行，六个独立圆角面板'
      : japanese
        ? `${Math.min(3, count)}列のグリッド、独立した${count}個のパネル`
        : `${Math.min(3, count)}列网格，${count}个独立面板`;
  let number = 0;
  const bindings = visualCopy.sections
    .map((section, index) => {
      const ids = section.items.map(() => String(++number).padStart(2, '0'));
      return `${index + 1}. ${section.title}: ${ids.join('/')}`;
    })
    .join('\n');
  number = 0;
  const drawings = visualCopy.sections
    .flatMap((section) =>
      section.items.map(
        (item) => `${String(++number).padStart(2, '0')} ${item.label}: ${item.visual}`,
      ),
    )
    .join('\n');
  return [
    japanese
      ? '画面制作仕様（配置と作図の指示・画像には転記しない）'
      : '画面制作规格（图形排版说明，不是上图文字）',
    japanese
      ? `横長16:9。${grid}。左から右、上から下へ元の順に配置。各欄の項目数は${brief.sections.map((section) => section.items.length).join('/')}。Newsletterも全項目を独立して配置する。`
      : `横向16:9。固定${grid}。从左到右、从上到下按原顺序排列，各栏条目数为${brief.sections.map((section) => section.items.length).join('/')}。Newsletter内每条独立成格。`,
    japanese
      ? '暖かい米色の紙、柔らかな橙・青緑・水色・珊瑚色・薄紫・薄黄の欄見出し帯。統一した二次元のインク線と淡い水彩。文字は大きく明瞭な活字体、余白を十分にとる。'
      : '暖米色纸张背景；栏目标题色带依次为柔橙、青绿、淡蓝、珊瑚红、淡紫、淡黄。统一二维手绘墨线和淡水彩，中文使用大而清楚的印刷体，留白充足。',
    japanese
      ? '上部はタイトルと日付の一行だけ。導入文・一文要約・副題を追加しない。各項目は独立した仕組みの小図、指定の短い名前と説明で構成。小図を約3分の2、文字を約3分の1の面積目安とし、正確な文字を優先する。'
      : '顶部只放一行报告标题与日期，不添加导语、一句话总结或副标题。每条由独立机制小图、短名称和指定说明组成。插图约占三分之二、文字约占三分之一，以准确容纳指定文字为先。',
    japanese
      ? '作図指示は文字を追加する許可ではない。画面掲載文案だけを印字し、図内の別ラベル・英語の副題・Supporting Detail・長い段落を追加しない。写真、写実的3D、ネオンのポスター、項目をまたぐ矢印は使わない。'
      : '插图说明不是新增图内文字的授权。只印画面文案，不增加其他图内标签、英文副标题、Supporting Detail或长段说明。无照片、写实3D、霓虹海报或跨条目连线。',
    `<PANEL_BINDINGS>\n${bindings}\n</PANEL_BINDINGS>`,
    `<ILLUSTRATION_PLAN>\n${drawings}\n</ILLUSTRATION_PLAN>`,
  ].join('\n');
}

/**
 * @param {ReturnType<typeof buildInfographicBrief>} brief
 * @param {{ backend?: string, visualCopy?: ReturnType<typeof createVisualCopyTemplate> }} [options]
 */
export function renderInfographicPrompt(brief, { backend = 'notebooklm', visualCopy } = {}) {
  validateVisualCopy(brief, visualCopy);
  const japanese = brief.language === 'ja';
  const instructions = japanese
    ? [
        '公開記事用の横長 editorial infographic を作成してください。入力は二層です。「完全な事実資料」は照合専用で、画像に転記しない。「画面掲載文案」だけを表示テキストとして使ってください。',
        `タイトルと日付を正確に表示。${brief.sections.length} セクションと ${brief.itemCount} 項目を元の順序・分類のまま全て掲載し、勝手に統合・省略・移動しない。Newsletter も具体的な記事と事実を掲載。`,
        '各項目は仕組みの小図、指定された短い名前と説明で表現する。短文を大きく読みやすく配置し、説明は二行以内を目安とする。事実資料から追加の数字・長い見出し・注釈を拾わない。文案にない数字は省き、採用した数字と必要な限定条件はセットで維持する。',
        '予測を実績に、提案を導入済みに、特定ベンチマークを一般的保証に変えない。元のリストにない事実・ロゴ・帰属を追加しない。因果関係を捏造しない。矢印は明示された手順や関係だけに使う。',
        '温かい紙色、手描きのインク線、控えめな水彩。各項目の小図と大きな文字を優先し、長い導入文や中央の巨大な装飾は省く。欄の数と項目配分を維持し、隣の項目の数値や図を混ぜない。文案を書き換えて短くせず、余白と配置で収める。',
        '出力文字は日本語。固有名詞は原表記を維持。画像の出典欄にURLや内部作業記録を載せない。',
      ]
    : [
        '生成用于公开文章的横向 editorial infographic。输入分两层：“完整事实依据”仅供核对，不印到图上；“画面文案”是唯一允许上图的文字。',
        `准确显示标题与日期；按原顺序、原分类完整呈现 ${brief.sections.length} 个栏目、${brief.itemCount} 个条目，不自行合并、遗漏或移动。Newsletter 必须呈现具体文章与事实。`,
        '每条用机制小图、指定的短名称与说明呈现。文字要大且清晰，说明以两行以内为排版目标。不从事实依据另取数字、长标题或注释上图；省略画面文案未选用的数字，选用的数字及其必要限定条件一起保留。',
        '不得把预测改为已发生、建议改为已部署、特定基准改为普遍保证；不得新增清单以外的事实、Logo 或机构归属。不得编造因果关系；箭头只表示正文明确的流程或关系。',
        '暖纸色、手绘墨线、克制水彩，优先每条机制小图与大字，省去长导语和巨大中心装饰。保持栏目数及各栏条目分配，不串用相邻条目的数字或插图。不改写指定文案，通过留白与布局容纳内容。',
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
  let number = 0;
  const display = visualCopy.sections
    .map((section) =>
      [
        `## ${section.title}`,
        ...section.items.map(
          (item) => `${String(++number).padStart(2, '0')} ${item.label}\n${item.text}`,
        ),
      ].join('\n\n'),
    )
    .join('\n\n');
  return [
    instructions.join('\n'),
    `${japanese ? '完全な事実資料（照合専用・画像には転記しない）' : '完整事实依据（仅供核对，不上图）'}：\n<FACTS_JSON>\n${JSON.stringify(facts, null, 2)}\n</FACTS_JSON>`,
    `${japanese ? '画面掲載文案（タイトル・日付・以下の欄名と項目だけを表示）' : '画面文案（仅显示标题、日期及以下栏目和条目）'}：\n${brief.title}\n${brief.date}\n<DISPLAY_COPY>\n${display}\n</DISPLAY_COPY>`,
    renderInfographicDesign(brief, visualCopy),
  ].join('\n\n');
}
