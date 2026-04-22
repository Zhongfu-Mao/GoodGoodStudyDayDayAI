import fs from 'node:fs/promises';
import path from 'node:path';

const repoRoot = '/Users/maozhongfu/Self Learning Projects/GoodGoodStudyDayDayAI';
const sourceRoot =
  '/Users/maozhongfu/Library/Mobile Documents/iCloud~md~obsidian/Documents/KnowledgeBase/课程笔记/Anthropic Academy';
const targetRoot = path.join(repoRoot, 'src/content/academy/anthropic-academy');
const publicImageRoot = path.join(repoRoot, 'public/images/academy/anthropic-academy');

const moduleSlugMap = {
  '01 AI Fluency 框架与基础': '01-ai-fluency-foundations',
  '02 AI Fluency 特定受众': '02-ai-fluency-audiences',
  '03 Claude 入门与产品': '03-claude-product',
  '04 开发者与技术工具': '04-developer-tools',
  '05 代理与 MCP': '05-agentic-mcp',
};

const coverPalette = {
  1: { start: '#1d4ed8', end: '#38bdf8', accent: '#fef08a' },
  2: { start: '#0f766e', end: '#22c55e', accent: '#fde68a' },
  3: { start: '#7c3aed', end: '#ec4899', accent: '#fde68a' },
  4: { start: '#b45309', end: '#f97316', accent: '#fef3c7' },
  5: { start: '#334155', end: '#06b6d4', accent: '#c4b5fd' },
  default: { start: '#1f2937', end: '#4f46e5', accent: '#f8fafc' },
};

const moduleJaNameMap = {
  '01-ai-fluency-foundations': 'AI Fluency の枠組みと基礎',
  '02-ai-fluency-audiences': '対象別 AI Fluency',
  '03-claude-product': 'Claude 入門とプロダクト',
  '04-developer-tools': '開発者向けツールと実装',
  '05-agentic-mcp': 'Agents と MCP',
};

const sourceFiles = [
  '01 AI Fluency 框架与基础/AI Fluency: Framework & Foundations.md',
  '01 AI Fluency 框架与基础/Teaching AI Fluency.md',
  '02 AI Fluency 特定受众/AI Fluency for Educators.md',
  '02 AI Fluency 特定受众/AI Fluency for Nonprofits.md',
  '02 AI Fluency 特定受众/AI Fluency for Students.md',
  '03 Claude 入门与产品/Claude 101.md',
  '03 Claude 入门与产品/Introduction to Claude Cowork.md',
  '04 开发者与技术工具/Building with the Claude API.md',
  '04 开发者与技术工具/Claude Code in Action.md',
  '04 开发者与技术工具/Claude with Amazon Bedrock.md',
  "04 开发者与技术工具/Claude with Google Cloud's Vertex AI.md",
  '05 代理与 MCP/Introduction to Agent Skills.md',
  '05 代理与 MCP/Introduction to Model Context Protocol.md',
  '05 代理与 MCP/Introduction to subagents.md',
  '05 代理与 MCP/Model Context Protocol: Advanced Topics.md',
];

const japaneseCompanionMap = {
  'ai-fluency-framework-and-foundations': {
    title: 'AI Fluency の枠組みと基礎',
    description:
      'AI と協働するための 4D フレームワークを軸に、説明力・判断力・委任力の基本を整理した導入ノートです。',
    tags: ['Anthropic Academy', 'AI Fluency', 'Foundations'],
    intro:
      'この講義は、AI を「答えを返す道具」ではなく「仕事を分担する相手」として扱うための基本設計をまとめています。',
    takeaways: [
      'AI Fluency は操作テクニックではなく、課題設定・指示・検証を含む実務能力として捉える。',
      '4D フレームワークでは Delegation、Description、Discernment、Diligence が相互に支え合う。',
      '良いアウトプットは、曖昧さを減らす文脈共有と、結果を見抜く人間側の判断で決まる。',
    ],
    practice:
      '実務では「何を任せるか」「どこを自分で検証するか」をセットで考えると、AI 活用が一段安定します。',
  },
  'teaching-ai-fluency': {
    title: 'AI Fluency を教える',
    description:
      'AI を教室や研修で扱うときに、ツール紹介で終わらず思考プロセスまで教えるための整理です。',
    tags: ['Anthropic Academy', 'AI Fluency', 'Teaching'],
    intro:
      'このノートは、AI リテラシー教育を単発のデモではなく、継続的な学習設計として捉え直すための視点をまとめています。',
    takeaways: [
      '学習者には「正解を得る方法」だけでなく、AI との対話を改善する観察力を育てる必要がある。',
      '課題設計では、生成結果の比較・批評・再試行を入れることで学びが深まる。',
      '評価の中心は、AI を使ったかどうかではなく、目的に合う形で使いこなせたかに置く。',
    ],
    practice:
      '授業や研修では、完成形のプロンプトを配るだけでなく、改善の理由を言語化させる設計が効きます。',
  },
  'ai-fluency-for-educators': {
    title: '教育者のための AI Fluency',
    description:
      '授業準備、教材作成、学習支援など、教育現場で AI を使う際の考え方を整理した実践向けノートです。',
    tags: ['Anthropic Academy', 'AI Fluency', 'Education'],
    intro:
      '教育者向けの文脈では、効率化だけでなく、学習の質や公平性をどう守るかが重要なテーマになります。',
    takeaways: [
      'AI は授業案、ルーブリック、教材の叩き台づくりで特に効果を発揮する。',
      'その一方で、出力の正確性確認や年齢に応じた表現調整は教員側の責任として残る。',
      '学習者支援では、回答生成よりも説明の段階づけや対話の足場づくりに使うと価値が出やすい。',
    ],
    practice:
      '授業で使う場合は、「どこまで AI に任せ、どこで教師が最終判断するか」を先に決めておくと運用しやすくなります。',
  },
  'ai-fluency-for-nonprofits': {
    title: '非営利組織のための AI Fluency',
    description:
      '限られた人員や予算の中で、非営利組織が AI を実務支援に活かすための観点をまとめています。',
    tags: ['Anthropic Academy', 'AI Fluency', 'Nonprofits'],
    intro:
      '非営利組織では、限られたリソースを補う形で AI を使う場面が多く、優先順位づけが特に重要です。',
    takeaways: [
      '助成金申請、広報文面、寄付者向けコミュニケーションの下書きは AI と相性が良い。',
      'ただし、受益者に関わる繊細な情報や組織の価値判断は人間が主導すべき領域として残る。',
      '小さな反復業務から始めると、導入コストを抑えつつ効果を確認しやすい。',
    ],
    practice:
      'チームで使うなら、頻出業務ごとのテンプレートを整え、レビュー基準を簡単に共有しておくと再現性が上がります。',
  },
  'ai-fluency-for-students': {
    title: '学生のための AI Fluency',
    description:
      '学習補助に AI を使うときに、丸投げではなく理解を深める方向へ使うための基礎を整理しています。',
    tags: ['Anthropic Academy', 'AI Fluency', 'Students'],
    intro:
      '学生向けの AI 活用では、速度よりも理解の質をどう高めるかが中心課題になります。',
    takeaways: [
      'AI は要約、復習問題の作成、概念の言い換えなど、理解を補助する使い方に向いている。',
      '一方で、レポートや課題の完成品をそのまま作らせると学習機会を失いやすい。',
      '学習者は「なぜその答えになるか」を AI に説明させ、自分でも説明できる状態を目指すべきである。',
    ],
    practice:
      'おすすめの使い方は、AI に答えを出してもらう前に自分の仮説を書くことです。比較対象があると理解が深まります。',
  },
  'claude-101': {
    title: 'Claude 101',
    description:
      'Claude の基本的な使い方、対話の進め方、プロジェクト機能や各種プロダクトの位置づけをまとめた入門ノートです。',
    tags: ['Anthropic Academy', 'Claude', 'Getting Started'],
    intro:
      'このページは複数レッスンをまとめた導入編で、Claude を思考パートナーとして使うための全体像を短く掴めます。',
    takeaways: [
      'Claude は単なるチャットではなく、文章作成、分析、推論、コーディングを横断して支援する汎用アシスタントである。',
      '良い対話は、背景・目的・制約を具体的に伝え、往復しながら精度を上げる前提で設計する。',
      'Projects、Artifacts、Memory、各種モデルの違いを理解すると、用途に応じた使い分けがしやすくなる。',
    ],
    practice:
      '最初は日常業務の小さなタスクから始め、毎回「どの情報を足すと改善したか」を振り返ると上達が早くなります。',
  },
  'introduction-to-claude-cowork': {
    title: 'Claude Cowork 入門',
    description:
      'Claude Cowork の基本概念、Chat との違い、ファイルやツールをまたぐ委任型ワークフローを整理したノートです。',
    tags: ['Anthropic Academy', 'Claude', 'Cowork'],
    intro:
      'Cowork は、会話中心の Chat から一歩進み、成果物の作成や外部ツール連携まで任せる体験を提供します。',
    takeaways: [
      'Cowork では、タスクの計画確認、実行、成果物の保存までを一つの流れとして扱う。',
      'Connectors やブラウザ連携により、メールやクラウドドライブなど既存の仕事場に AI を接続できる。',
      'Projects、Plugins、Scheduled tasks を組み合わせると、繰り返し業務をかなり自動化できる。',
    ],
    practice:
      '導入時は「このフォルダを要約して提案資料の草稿を作る」のように、入力と出力が明確な仕事から試すのが安全です。',
  },
  'building-with-the-claude-api': {
    title: 'Claude API で構築する',
    description:
      'Claude API の基本概念、プロンプト設計、メッセージ構造、実装時の注意点を俯瞰する開発者向けノートです。',
    tags: ['Anthropic Academy', 'Claude API', 'Developers'],
    intro:
      'API 編では、Claude をアプリケーションに組み込むときに必要な土台を、概念から実装の流れまで整理しています。',
    takeaways: [
      'メッセージの設計では、役割、入力文脈、期待する出力形式を明示することが品質に直結する。',
      '単発の回答生成だけでなく、構造化出力やツール利用を見越した API 設計が重要になる。',
      'レート制限、コスト、評価、ガードレールを早い段階で考慮すると、本番移行がスムーズになる。',
    ],
    practice:
      'まずは最小限の API 呼び出しを作り、そこに評価ケースと失敗時のフォールバックを少しずつ足していくのが堅実です。',
  },
  'claude-code-in-action': {
    title: 'Claude Code 実践',
    description:
      'Claude Code を使った開発フロー、タスク分解、編集・実行・レビューの進め方を整理した実践ノートです。',
    tags: ['Anthropic Academy', 'Claude Code', 'Coding'],
    intro:
      'Claude Code は、コード生成だけでなく、リポジトリ理解・修正・検証までを一連の作業として扱える点が特徴です。',
    takeaways: [
      '良い結果を得るには、課題の背景、変更範囲、検証方法を最初に共有することが重要である。',
      'AI に任せる部分と人間が確認すべき部分を分けると、速度と品質の両立がしやすい。',
      '大きな仕事は段階的に分け、途中でレビューやテストを挟むことで手戻りを減らせる。',
    ],
    practice:
      '新機能実装よりも、まずはリファクタリングやテスト追加のような境界の明確な作業から慣れるのが効果的です。',
  },
  'claude-with-amazon-bedrock': {
    title: 'Amazon Bedrock で Claude を使う',
    description:
      'AWS 上で Claude を利用するときの位置づけ、接続方法、運用上の観点を整理したメモです。',
    tags: ['Anthropic Academy', 'Claude', 'AWS'],
    intro:
      'Bedrock 経由の利用は、既存の AWS 基盤やセキュリティ要件に Claude を合わせたいチームに向いています。',
    takeaways: [
      'Bedrock を使うことで、IAM や既存のクラウド運用ルールに沿ってモデル利用を管理しやすくなる。',
      'アプリ実装では、モデル選択、リージョン、認証、ログ設計をまとめて考える必要がある。',
      '組織導入では、モデル性能だけでなく、監査性やガバナンスの観点も重要になる。',
    ],
    practice:
      'すでに AWS に乗っているプロダクトなら、PoC 段階から権限設計とログ方針を簡単に決めておくと後で困りません。',
  },
  'claude-with-google-cloud-s-vertex-ai': {
    title: 'Google Cloud Vertex AI で Claude を使う',
    description:
      'Vertex AI から Claude を使う際の導入イメージと、GCP ワークロードとの組み合わせ方を整理したノートです。',
    tags: ['Anthropic Academy', 'Claude', 'Google Cloud'],
    intro:
      'Vertex AI 経由の利用は、既存の GCP データ基盤や ML ワークフローと自然につなげたいケースで有効です。',
    takeaways: [
      'Google Cloud の認証・権限管理に乗せることで、既存の運用プロセスへ統合しやすくなる。',
      '生成 AI 活用では、データの置き場、推論の呼び出し元、結果の保存先を一体で設計する必要がある。',
      '他のクラウドと同様に、品質評価と安全性の確認はアプリ側で継続的に行うべきである。',
    ],
    practice:
      'BigQuery や社内データ基盤と近い場所で PoC を作ると、実運用に必要なデータ導線を早めに確認できます。',
  },
  'introduction-to-agent-skills': {
    title: 'Agent Skills 入門',
    description:
      'Skills の役割、エージェントに知識や手順を与える考え方、設計の基本を整理したノートです。',
    tags: ['Anthropic Academy', 'Agents', 'Skills'],
    intro:
      'Skills は、毎回同じ説明を繰り返さなくても、エージェントに特定の仕事のやり方を覚えさせるための部品です。',
    takeaways: [
      'Skills には、判断基準、手順、入出力の期待値を明文化しておくと効果が高い。',
      '汎用的すぎる Skill よりも、仕事の単位に合った小さな Skill の方が再利用しやすい。',
      '実務では、Skill 単体の精度よりも、どのタイミングで呼び出されるかの設計が重要になる。',
    ],
    practice:
      'まずはチームで頻出する定型作業を一つ選び、その手順を Skill 化して試すと価値が見えやすいです。',
  },
  'introduction-to-model-context-protocol': {
    title: 'Model Context Protocol 入門',
    description:
      'MCP の基本発想、モデルとツールを接続する枠組み、実務上のメリットを把握するための入門ノートです。',
    tags: ['Anthropic Academy', 'MCP', 'Agents'],
    intro:
      'MCP は、モデルが外部ツールやデータソースと安定してやり取りするための共通インターフェースとして理解すると掴みやすいです。',
    takeaways: [
      'MCP により、モデル側の能力とツール側の機能を疎結合に保ちやすくなる。',
      '接続先ごとに個別実装を増やす代わりに、共通のやり取り方式で統合しやすくなる。',
      '導入では、何をモデルに見せ、どこまで操作を許可するかという境界設計が重要である。',
    ],
    practice:
      '最初は読み取り中心のツールから MCP 化し、権限や操作範囲を小さく始めると安全に学べます。',
  },
  'introduction-to-subagents': {
    title: 'Subagents 入門',
    description:
      'タスク分割、並列実行、文脈分離といった subagents の考え方を理解するための基礎ノートです。',
    tags: ['Anthropic Academy', 'Agents', 'Subagents'],
    intro:
      'Subagents は、大きな仕事を複数の小さな担当に分けて進めるための考え方で、人間のチーム編成に近い発想です。',
    takeaways: [
      '独立性の高いサブタスクは、分離して並列化すると速度も整理性も上がる。',
      '各 subagent に役割と責任範囲を明確に与えると、文脈の混線が減る。',
      '統合作業をどこで行うかを決めておかないと、部分最適な結果が集まるだけになりやすい。',
    ],
    practice:
      '市場調査、比較検討、コード改修のような場面では、分担単位を先に定義してから subagents を使うと効果が出ます。',
  },
  'model-context-protocol-advanced-topics': {
    title: 'Model Context Protocol 応用編',
    description:
      'MCP を実運用へ広げるときに出てくる設計論点や、安全性・拡張性の観点を整理した応用ノートです。',
    tags: ['Anthropic Academy', 'MCP', 'Advanced'],
    intro:
      '応用編では、MCP を単なる接続規格としてではなく、実際のプロダクト運用に耐える設計として捉え直します。',
    takeaways: [
      'サーバー設計では、提供するリソースやツールを粒度よく整理し、意図しない権限拡大を防ぐ必要がある。',
      '可観測性、失敗時の挙動、監査性まで考慮して初めて、本番環境で安心して使える。',
      'MCP の価値は接続数の多さではなく、モデルが使える文脈を一貫した形で増やせる点にある。',
    ],
    practice:
      '本番導入を考えるなら、まずは単一用途のサーバーを作り、ログ・権限・エラー処理を一通り確認するのがおすすめです。',
  },
};

await fs.mkdir(targetRoot, { recursive: true });
await fs.mkdir(publicImageRoot, { recursive: true });

const manifest = await Promise.all(
  sourceFiles.map(async (relativeFile) => {
    const sourcePath = path.join(sourceRoot, relativeFile);
    const raw = await fs.readFile(sourcePath, 'utf8');
    const sourceStats = await fs.stat(sourcePath);
    const { data, body } = parseFrontmatter(raw);
    const moduleDir = path.dirname(relativeFile);
    const moduleSlug = moduleSlugMap[moduleDir] ?? slugifyAscii(moduleDir);
    const moduleOrder = Number.parseInt(moduleDir, 10);
    const moduleName = moduleDir.replace(/^\d+\s*/, '').trim();
    const articleSlug = slugifyAscii(path.basename(relativeFile, '.md'));

    return {
      relativeFile,
      sourcePath,
      sourceDir: path.dirname(sourcePath),
      sourceStats,
      data,
      body,
      moduleDir,
      moduleSlug,
      moduleOrder: Number.isFinite(moduleOrder) ? moduleOrder : undefined,
      moduleName,
      articleSlug,
      title: data.title ?? path.basename(relativeFile, '.md'),
      outputPath: path.join(targetRoot, moduleSlug, `${articleSlug}.md`),
      routePath: `/academy/anthropic-academy/${moduleSlug}/${articleSlug}/`,
    };
  }),
);

const noteLookup = buildNoteLookup(manifest);
const importedFiles = [];

for (const entry of manifest) {
  await fs.mkdir(path.dirname(entry.outputPath), { recursive: true });

  const coverImagePath = await generateCoverImage(entry);
  const rewrittenBody = await rewriteBody({
    body: entry.body,
    title: entry.title,
    articleSlug: entry.articleSlug,
    moduleSlug: entry.moduleSlug,
    sourceDir: entry.sourceDir,
    noteLookup,
  });

  const frontmatter = formatFrontmatter({
    title: entry.title,
    date: entry.data.date ?? formatDate(entry.sourceStats.mtime),
    category: 'academy',
    description: entry.data.description,
    tags: normalizeTags(entry.data.tags),
    lang: 'zh',
    coverImage: coverImagePath,
    academy: {
      series: 'Anthropic Academy',
      module: entry.moduleName,
      moduleOrder: entry.moduleOrder,
      source: entry.data.platform ?? 'Anthropic Academy',
      sourceUrl: entry.data.course_url,
      prerequisites: extractPrerequisites(entry.body),
    },
    draft: false,
  });

  await fs.writeFile(entry.outputPath, `${frontmatter}\n${rewrittenBody.trim()}\n`, 'utf8');
  importedFiles.push(path.relative(repoRoot, entry.outputPath));

  const jaCompanion = japaneseCompanionMap[entry.articleSlug];

  if (jaCompanion) {
    const jaOutputPath = entry.outputPath.replace(/\.md$/, '.ja.md');
    const jaFrontmatter = formatFrontmatter({
      title: jaCompanion.title,
      date: entry.data.date ?? formatDate(entry.sourceStats.mtime),
      category: 'academy',
      description: jaCompanion.description,
      tags: jaCompanion.tags,
      lang: 'ja',
      coverImage: coverImagePath,
      academy: {
        series: 'Anthropic Academy',
        module: moduleJaNameMap[entry.moduleSlug] ?? entry.moduleName,
        moduleOrder: entry.moduleOrder,
        source: 'Anthropic Academy',
        sourceUrl: entry.data.course_url,
        prerequisites: [],
      },
      draft: false,
    });

    const jaBody = buildJapaneseCompanionBody(jaCompanion);
    await fs.writeFile(jaOutputPath, `${jaFrontmatter}\n${jaBody}\n`, 'utf8');
    importedFiles.push(path.relative(repoRoot, jaOutputPath));
  }
}

console.log(`Imported ${importedFiles.length} Anthropic Academy files.`);
for (const file of importedFiles) {
  console.log(`- ${file}`);
}

function parseFrontmatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);

  if (!match) {
    throw new Error('Missing frontmatter block');
  }

  const [, rawFrontmatter, body] = match;
  const data = {};
  let currentKey = null;

  for (const line of rawFrontmatter.split(/\r?\n/)) {
    if (!line.trim()) continue;

    const keyMatch = line.match(/^([A-Za-z_][A-Za-z0-9_]*):\s*(.*)$/);

    if (keyMatch) {
      const [, key, rawValue] = keyMatch;
      currentKey = key;

      if (rawValue.trim() === '') {
        data[key] = [];
      } else {
        data[key] = parseScalar(rawValue.trim());
      }

      continue;
    }

    const listMatch = line.match(/^\s*-\s+(.*)$/);

    if (listMatch && currentKey) {
      if (!Array.isArray(data[currentKey])) {
        data[currentKey] = [];
      }

      data[currentKey].push(parseScalar(listMatch[1].trim()));
    }
  }

  return { data, body };
}

function parseScalar(value) {
  if (value === '~') return undefined;
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }

  return value;
}

function normalizeTags(tags) {
  if (!Array.isArray(tags) || tags.length === 0) {
    return ['Anthropic Academy', '课程笔记'];
  }

  return [...new Set(tags.filter(Boolean).map((tag) => String(tag).trim()))];
}

function buildNoteLookup(entries) {
  const exactLookup = new Map();
  const looseLookup = new Map();

  for (const entry of entries) {
    const aliases = Array.isArray(entry.data.aliases) ? entry.data.aliases : [];
    const candidates = new Set([
      entry.title,
      path.basename(entry.relativeFile, '.md'),
      ...aliases,
    ]);

    for (const candidate of candidates) {
      const payload = {
        href: entry.routePath,
        title: entry.title,
      };

      exactLookup.set(normalizeNoteKey(candidate), payload);
      looseLookup.set(normalizeLooseNoteKey(candidate), payload);
    }
  }

  return { exactLookup, looseLookup };
}

function extractPrerequisites(body) {
  const lines = body.split(/\r?\n/);
  const results = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();
    const inlineMatch = line.match(/^\*\*先决条件(?:\/资源)?：\*\*\s*(.*)$/);

    if (inlineMatch) {
      const inlineValue = inlineMatch[1].trim();

      if (inlineValue) {
        results.push(...splitPrerequisites(inlineValue));
      }

      let cursor = index + 1;
      while (cursor < lines.length) {
        const bulletMatch = lines[cursor].match(/^\s*-\s+(.*)$/);
        if (!bulletMatch) break;
        results.push(bulletMatch[1].trim());
        cursor += 1;
      }

      break;
    }
  }

  return [...new Set(results.filter(Boolean))];
}

function splitPrerequisites(value) {
  return value
    .split(/[、，,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

async function rewriteBody({ body, title, articleSlug, moduleSlug, sourceDir, noteLookup }) {
  let output = body.replace(/\r\n/g, '\n');

  output = sanitizeQuizMentions(output);
  output = stripQuizSections(output);
  output = stripEditorialArtifacts(output);
  output = stripScaffoldingSections(output);
  output = stripHorizontalRules(output);
  output = normalizeMetadataLines(output);
  output = renumberLessonHeadings(output);
  output = output.replace(/```embed\n([\s\S]*?)\n```/g, (_, block) => renderEmbedBlock(block));
  output = await rewriteObsidianEmbeds(output, { articleSlug, moduleSlug, sourceDir });
  output = rewriteObsidianLinks(output, noteLookup);
  output = rewriteCallouts(output);
  output = normalizeHeadings(output, title);

  return output.replace(/\n{3,}/g, '\n\n').trim();
}

function sanitizeQuizMentions(markdown) {
  return markdown
    .replace(/^\*\*测验：\*\*.*\n/gm, '')
    .replace(/^\*\*证书测验\*\*：.*\n/gm, '')
    .replace(/^\*\*成绩：.*\n/gm, '')
    .replace(/（含[^）\n]*测验[^）\n]*）/g, '')
    .replace(/，含\s*\d+\s*个课程测验：/g, '：')
    .replace(/，含\s*\d+\s*个测验/g, '')
    .replace(/含结业测验与附加活动/g, '含附加活动');
}

function stripQuizSections(markdown) {
  const lines = markdown.split('\n');
  const output = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const headingMatch = line.match(/^(#{2,6})\s+(.*)$/);

    if (!headingMatch) {
      output.push(line);
      continue;
    }

    const depth = headingMatch[1].length;
    const title = headingMatch[2].trim();

    if (!isQuizHeading(title)) {
      output.push(line);
      continue;
    }

    index += 1;
    while (index < lines.length) {
      const nextHeadingMatch = lines[index].match(/^(#{2,6})\s+(.*)$/);

      if (nextHeadingMatch && nextHeadingMatch[1].length <= depth) {
        index -= 1;
        break;
      }

      index += 1;
    }
  }

  return output.join('\n');
}

function stripScaffoldingSections(markdown) {
  return stripSectionsByHeading(markdown, [
    /^课程基本信息$/i,
    /^学习目标$/i,
    /^视频内容$/i,
    /^课后反思$/i,
    /^下一步$/i,
    /^反馈$/i,
  ]);
}

function isQuizHeading(title) {
  return /(结业测验|final assessment|certificate of completion|quiz 知识点回顾|quiz on claude code)/i.test(title);
}

function stripSectionsByHeading(markdown, patterns) {
  const lines = markdown.split('\n');
  const output = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const headingMatch = line.match(/^(#{2,6})\s+(.*)$/);

    if (!headingMatch) {
      output.push(line);
      continue;
    }

    const depth = headingMatch[1].length;
    const title = headingMatch[2].trim();
    const shouldStrip = patterns.some((pattern) => pattern.test(title));

    if (!shouldStrip) {
      output.push(line);
      continue;
    }

    index += 1;
    while (index < lines.length) {
      const nextHeadingMatch = lines[index].match(/^(#{1,6})\s+(.*)$/);

      if (nextHeadingMatch && nextHeadingMatch[1].length <= depth) {
        index -= 1;
        break;
      }

      index += 1;
    }
  }

  return output.join('\n');
}

function stripEditorialArtifacts(markdown) {
  return markdown
    .replace(/^完美！.*\n?/gm, '')
    .replace(/^现在为您整理成markdown笔记：\n?/gim, '')
    .replace(/^现在是课程的第.+\n?/gm, '')
    .replace(/^\d+\s+steps\s*\n?/gim, '')
    .replace(/^\*\*平台\*\*：.*\n?/gm, '')
    .replace(/^\*\*完成时间\*\*：.*\n?/gm, '')
    .replace(/^\*\*课程链接\*\*：.*\n?/gm, '')
    .replace(/^\*\*版权\*\*：.*\n?/gm, '')
    .replace(/^\*\*版权声明\*\*：.*\n?/gm, '')
    .replace(/^Copyright \d{4} Anthropic\..*\n?/gim, '')
    .replace(/^All rights reserved\.\n?/gim, '');
}

function stripHorizontalRules(markdown) {
  return markdown.replace(/^\s*---\s*$/gm, '');
}

function normalizeMetadataLines(markdown) {
  return markdown
    .replace(/^\s*-\s+\*\*预计(?:时间|时长)\*\*[：:]\s*(.+)$/gm, '> 预计时长：$1')
    .replace(/^\*\*预计(?:时间|时长)\*\*[：:]\s*(.+)$/gm, '> 预计时长：$1')
    .replace(/^\s*-\s+\*\*课程来源\*\*[：:]\s*.+$/gm, '')
    .replace(/^\s*-\s+\*\*预计时间\*\*[：:]\s*.+$/gm, '')
    .replace(/^\s*-\s+\*\*课程来源\*\*[：:]\s*.+$/gm, '');
}

function renderEmbedBlock(block) {
  const data = {};

  for (const line of block.split('\n')) {
    const match = line.match(/^([A-Za-z]+):\s*"?(.*?)"?$/);
    if (!match) continue;
    data[match[1].toLowerCase()] = match[2];
  }

  const label = data.title ? `[${data.title}](${data.url ?? '#'})` : data.url ?? '外部资源';
  const description = data.description ? `\n> ${data.description}` : '';

  return `> **相关资源**：${label}${description}`;
}

async function rewriteObsidianEmbeds(markdown, { articleSlug, moduleSlug, sourceDir }) {
  const matches = [...markdown.matchAll(/!\[\[(.+?)\]\]/g)];

  if (matches.length === 0) {
    return markdown;
  }

  let output = markdown;

  for (const match of matches) {
    const reference = match[1].split('|')[0].trim();
    const assetPath = await resolveAssetPath(reference, sourceDir);

    if (!assetPath) {
      output = output.replace(match[0], `> **图片缺失**：${reference}`);
      continue;
    }

    const assetName = path.basename(assetPath);
    const targetDir = path.join(publicImageRoot, moduleSlug, articleSlug);
    const targetPath = path.join(targetDir, assetName);

    await fs.mkdir(targetDir, { recursive: true });
    await fs.copyFile(assetPath, targetPath);

    const publicPath = encodeURI(`/images/academy/anthropic-academy/${moduleSlug}/${articleSlug}/${assetName}`);
    const alt = assetName.replace(/\.[^.]+$/, '');
    output = output.replace(match[0], `![${alt}](${publicPath})`);
  }

  return output;
}

function rewriteObsidianLinks(markdown, noteLookup) {
  return markdown.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, rawTarget, rawLabel) => {
    const target = rawTarget.trim();
    const label = (rawLabel ?? target).trim();
    const lookup =
      noteLookup.exactLookup.get(normalizeNoteKey(target)) ??
      noteLookup.looseLookup.get(normalizeLooseNoteKey(target));

    if (!lookup) {
      return label;
    }

    return `[${label}](${lookup.href})`;
  });
}

function renumberLessonHeadings(markdown) {
  const lines = markdown.split('\n');
  let previousNumber = null;
  let expectedNumber = null;

  for (let index = 0; index < lines.length; index += 1) {
    const match = lines[index].match(/^(###)\s+(\d+)\.\s+(.*)$/);

    if (!match) {
      continue;
    }

    const currentNumber = Number.parseInt(match[2], 10);

    if (previousNumber === null || currentNumber <= previousNumber) {
      expectedNumber = currentNumber;
    } else {
      expectedNumber += 1;
    }

    if (currentNumber !== expectedNumber) {
      lines[index] = `${match[1]} ${expectedNumber}. ${match[3]}`;
    }

    previousNumber = expectedNumber;
  }

  return lines.join('\n');
}

async function resolveAssetPath(reference, sourceDir) {
  const candidates = [
    path.join(sourceDir, reference),
    path.join(sourceDir, 'assets', reference),
    path.join(sourceRoot, 'assets', reference),
  ];

  for (const candidate of candidates) {
    try {
      const stats = await fs.stat(candidate);
      if (stats.isFile()) {
        return candidate;
      }
    } catch {}
  }

  return null;
}

function rewriteCallouts(markdown) {
  const lines = markdown.split('\n');
  const output = [];

  for (const line of lines) {
    const match = line.match(/^> \[!([a-zA-Z-]+)\]\s*(.*)$/);

    if (!match) {
      output.push(line);
      continue;
    }

    const [, calloutType, title] = match;
    const label = title.trim() || calloutType.toUpperCase();
    output.push(`> **${label}**`);
  }

  return output.join('\n');
}

function normalizeHeadings(markdown, title) {
  const lines = markdown.split('\n');
  const normalizedTitle = normalizeLooseNoteKey(title);
  let firstHeadingRemoved = false;

  for (let index = 0; index < lines.length; index += 1) {
    const match = lines[index].match(/^(#)\s+(.*)$/);

    if (!match) {
      if (lines[index].trim()) {
        break;
      }

      continue;
    }

    const headingTitle = match[2].trim();

    if (normalizeLooseNoteKey(headingTitle) === normalizedTitle) {
      lines.splice(index, 1);
      firstHeadingRemoved = true;
    }

    break;
  }

  const remainingH1Count = lines.filter((line) => /^#\s+/.test(line)).length;

  if (!firstHeadingRemoved && remainingH1Count === 0) {
    return lines.join('\n');
  }

  if (remainingH1Count === 0) {
    return lines.join('\n');
  }

  return lines
    .map((line) => {
      const match = line.match(/^(#{1,5})\s+(.*)$/);
      if (!match) return line;
      return `${match[1]}# ${match[2]}`;
    })
    .join('\n');
}

async function generateCoverImage(entry) {
  const coverDir = path.join(publicImageRoot, 'covers', entry.moduleSlug);
  const coverPath = path.join(coverDir, `${entry.articleSlug}.svg`);
  const palette = coverPalette[entry.moduleOrder] ?? coverPalette.default;
  const tags = normalizeTags(entry.data.tags).slice(0, 3).join(' · ');
  const svg = buildCoverSvg({
    title: entry.title,
    module: entry.moduleName,
    series: 'Anthropic Academy',
    tags,
    palette,
  });

  await fs.mkdir(coverDir, { recursive: true });
  await fs.writeFile(coverPath, svg, 'utf8');

  return `/images/academy/anthropic-academy/covers/${entry.moduleSlug}/${entry.articleSlug}.svg`;
}

function buildCoverSvg({ title, module, series, tags, palette }) {
  const titleLines = wrapText(title, 24, 3);
  const moduleLines = wrapText(module, 20, 2);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1600" height="900" viewBox="0 0 1600 900" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="title desc">
  <title id="title">${escapeXml(title)}</title>
  <desc id="desc">${escapeXml(`${series} · ${module}`)}</desc>
  <defs>
    <linearGradient id="bg" x1="180" y1="120" x2="1420" y2="780" gradientUnits="userSpaceOnUse">
      <stop stop-color="${palette.start}"/>
      <stop offset="1" stop-color="${palette.end}"/>
    </linearGradient>
    <radialGradient id="glow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(1320 180) rotate(135) scale(500 500)">
      <stop stop-color="${palette.accent}" stop-opacity="0.95"/>
      <stop offset="1" stop-color="${palette.accent}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1600" height="900" rx="52" fill="url(#bg)"/>
  <rect x="48" y="48" width="1504" height="804" rx="40" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.18)"/>
  <circle cx="1320" cy="180" r="420" fill="url(#glow)"/>
  <circle cx="1430" cy="730" r="220" fill="rgba(255,255,255,0.08)"/>
  <path d="M1120 90C1278 220 1368 402 1410 620" stroke="rgba(255,255,255,0.18)" stroke-width="2" stroke-dasharray="10 18"/>
  <path d="M1158 138C1284 256 1356 418 1392 590" stroke="rgba(255,255,255,0.12)" stroke-width="2" stroke-dasharray="10 18"/>
  <rect x="118" y="118" width="250" height="44" rx="22" fill="rgba(255,255,255,0.12)"/>
  <text x="144" y="147" fill="white" font-size="22" font-family="Avenir Next, Segoe UI, sans-serif" letter-spacing="4">${escapeXml(series.toUpperCase())}</text>
  <text x="118" y="232" fill="rgba(255,255,255,0.78)" font-size="34" font-family="Avenir Next, Segoe UI, sans-serif">${escapeXml(moduleLines[0] ?? module)}</text>
  ${moduleLines[1] ? `<text x="118" y="276" fill="rgba(255,255,255,0.78)" font-size="34" font-family="Avenir Next, Segoe UI, sans-serif">${escapeXml(moduleLines[1])}</text>` : ''}
  ${titleLines
    .map(
      (line, index) =>
        `<text x="118" y="${360 + index * 92}" fill="white" font-size="72" font-weight="700" font-family="Avenir Next, Segoe UI, sans-serif">${escapeXml(line)}</text>`,
    )
    .join('\n  ')}
  <rect x="118" y="712" width="620" height="82" rx="24" fill="rgba(5,10,28,0.22)" stroke="rgba(255,255,255,0.16)"/>
  <text x="152" y="762" fill="rgba(255,255,255,0.86)" font-size="28" font-family="Avenir Next, Segoe UI, sans-serif">${escapeXml(tags)}</text>
</svg>`;
}

function wrapText(text, maxChars, maxLines) {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [text];

  const lines = [];
  let current = '';

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;

    if (next.length <= maxChars || current.length === 0) {
      current = next;
    } else {
      lines.push(current);
      current = word;
    }

    if (lines.length === maxLines - 1) {
      break;
    }
  }

  const usedWords = lines.join(' ').split(/\s+/).filter(Boolean).length;
  const remainingWords = words.slice(usedWords);
  const finalLine = [current, ...remainingWords].filter(Boolean).join(' ');

  if (finalLine) {
    lines.push(finalLine);
  }

  return lines.slice(0, maxLines).map((line, index, array) => {
    if (index === array.length - 1 && array.length === maxLines && line.length > maxChars + 8) {
      return `${line.slice(0, maxChars + 5).trimEnd()}…`;
    }

    return line;
  });
}

function normalizeNoteKey(value) {
  return String(value)
    .normalize('NFKC')
    .replace(/[：]/g, ':')
    .replace(/[’‘]/g, "'")
    .replace(/&/g, 'and')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function normalizeLooseNoteKey(value) {
  return normalizeNoteKey(value).replace(/[^a-z0-9\u4e00-\u9fff]+/g, '');
}

function formatFrontmatter(data) {
  const lines = ['---'];

  lines.push(`title: ${quoteYaml(data.title)}`);
  lines.push(`date: ${data.date}`);
  lines.push('category: academy');

  if (data.description) {
    lines.push(`description: ${quoteYaml(data.description)}`);
  }

  if (data.coverImage) {
    lines.push(`coverImage: ${quoteYaml(data.coverImage)}`);
  }

  lines.push('tags:');
  for (const tag of data.tags) {
    lines.push(`  - ${quoteYaml(tag)}`);
  }

  lines.push(`lang: ${data.lang}`);
  lines.push('academy:');
  lines.push(`  series: ${quoteYaml(data.academy.series)}`);
  lines.push(`  module: ${quoteYaml(data.academy.module)}`);

  if (typeof data.academy.moduleOrder === 'number') {
    lines.push(`  moduleOrder: ${data.academy.moduleOrder}`);
  }

  if (data.academy.source) {
    lines.push(`  source: ${quoteYaml(data.academy.source)}`);
  }

  if (data.academy.sourceUrl) {
    lines.push(`  sourceUrl: ${quoteYaml(data.academy.sourceUrl)}`);
  }

  if (data.academy.prerequisites.length > 0) {
    lines.push('  prerequisites:');
    for (const prerequisite of data.academy.prerequisites) {
      lines.push(`    - ${quoteYaml(prerequisite)}`);
    }
  } else {
    lines.push('  prerequisites: []');
  }

  lines.push(`draft: ${String(data.draft)}`);
  lines.push('---');

  return lines.join('\n');
}

function buildJapaneseCompanionBody(companion) {
  return `# 要点まとめ

${companion.intro}

## この講義で押さえたいこと

${companion.takeaways.map((item) => `- ${item}`).join('\n')}

## 実務へのつなげ方

${companion.practice}`;
}

function quoteYaml(value) {
  return JSON.stringify(String(value));
}

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function slugifyAscii(value) {
  const slug = value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug || 'untitled';
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
