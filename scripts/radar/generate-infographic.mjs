import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { parseFrontmatter, stripFrontmatter, updateFrontmatterValue } from '../lib/frontmatter.mjs';
import {
  extractSectionBlock,
  extractShortParagraphs,
  extractTopSignals,
} from '../lib/markdown.mjs';
import {
  addSourceFile,
  createNotebook,
  languageArg,
  maybeDeleteNotebook,
  runNotebooklm,
  waitForLatestArtifact,
} from '../lib/notebooklm.mjs';

const WORKSPACE_ROOT = process.cwd();
const RADAR_DIR = path.join(WORKSPACE_ROOT, 'src/content/radar');
const IMAGE_DIR = path.join(WORKSPACE_ROOT, 'public/images/radar');

function parseArgs(argv) {
  const options = {
    file: null,
    orientation: 'landscape',
    detail: 'detailed',
    style: 'editorial',
    keepNotebook: true,
    backend: 'notebooklm',
    model: 'gpt-image-2',
    briefModel: 'gpt-5.4-mini',
    briefMode: 'auto',
    size: '1536x1024',
    quality: 'medium',
    outputFormat: 'png',
    allMissing: false,
    overwrite: false,
  };

  const withValue = new Set([
    '--file',
    '--orientation',
    '--detail',
    '--style',
    '--backend',
    '--model',
    '--brief-model',
    '--brief-mode',
    '--size',
    '--quality',
    '--output-format',
  ]);

  const keyMap = {
    '--file': 'file',
    '--orientation': 'orientation',
    '--detail': 'detail',
    '--style': 'style',
    '--backend': 'backend',
    '--model': 'model',
    '--brief-model': 'briefModel',
    '--brief-mode': 'briefMode',
    '--size': 'size',
    '--quality': 'quality',
    '--output-format': 'outputFormat',
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (withValue.has(arg)) {
      const key = keyMap[arg];
      options[key] = argv[index + 1] ?? options[key];
      index += 1;
      continue;
    }

    if (arg === '--all-missing') {
      options.allMissing = true;
      continue;
    }

    if (arg === '--overwrite') {
      options.overwrite = true;
      continue;
    }

    if (arg === '--no-keep-notebook') {
      options.keepNotebook = false;
    }
  }

  return options;
}

function slugFromPath(filePath) {
  return path.basename(filePath, '.md');
}

function headingsForLang(lang) {
  return lang === 'ja'
    ? {
        scope: ['対象範囲'],
        engineering: ['1. 🛠️ AI Engineering & アーキテクチャ', '1. 🛠️ AI Engineering & Architecture'],
        models: ['2. 🧠 モデル動向 & アルゴリズム', '2. 🧠 モデル最前線 & アルゴリズム探索'],
        tools: ['3. 💻 実装コード & ツール', '3. 💻 Tools & Code'],
        market: ['4. 📰 業界 & ビジネス', '4. 📰 業界・ビジネス速報'],
        mail: ['📬 Newsletter 精选', '📬 メール補遺', '📬 補遺'],
      }
    : {
        scope: ['本期范围'],
        engineering: ['1. 🛠️ AI Engineering & 架构'],
        models: ['2. 🧠 模型前沿 & 算法探索'],
        tools: ['3. 💻 实战代码 & 工具库'],
        market: ['4. 📰 行业与商业快讯'],
        mail: ['📬 Newsletter 精选', '📬 邮件补遗'],
      };
}

function inferMainline(meta, body) {
  const paragraphs = extractShortParagraphs(body, 6);

  if (paragraphs.length === 0) {
    return meta.lang === 'ja'
      ? '今日の AI レーダーを 1 枚で俯瞰できる構図'
      : '把今天 AI 雷达的主线压缩成一眼能读懂的结构图';
  }

  return paragraphs[0];
}

function buildHeuristicBrief(meta, body) {
  const headings = headingsForLang(meta.lang);
  const engineeringBlock = extractSectionBlock(body, headings.engineering);
  const modelsBlock = extractSectionBlock(body, headings.models);
  const toolsBlock = extractSectionBlock(body, headings.tools);
  const marketBlock = extractSectionBlock(body, headings.market);
  const mailBlock = extractSectionBlock(body, headings.mail);
  const topSignals = extractTopSignals(body, 5);
  const summaryCandidates = [
    ...extractShortParagraphs(engineeringBlock, 2),
    ...extractShortParagraphs(modelsBlock, 2),
    ...extractShortParagraphs(toolsBlock, 1),
    ...extractShortParagraphs(marketBlock, 1),
    ...extractShortParagraphs(mailBlock, 1),
  ].filter(Boolean);

  const branches = topSignals.map((signal, index) => ({
    label: signal,
    note:
      summaryCandidates[index] ??
      (meta.lang === 'ja' ? '今日の流れを支える補助シグナル' : '支撑当天主线的辅助信号'),
  }));

  return {
    centralTheme: meta.title,
    mainline: inferMainline(meta, body),
    branches,
    designConstraints:
      meta.lang === 'ja'
        ? [
            'ブログ冒頭のヒーロー画像として使える横長レイアウト',
            'ポスターではなく、編集的な情報図解',
            '文字は少なく、大きく、読みやすく',
            '人物写真コラージュより、関係図・記号・流れを重視',
          ]
        : [
            '适合作为博客文章顶部横向头图',
            '更像编辑型信息图，不要做成营销海报',
            '文字尽量少且大，避免小字堆砌',
            '尽量用结构关系、节点、流向表达，而不是人物拼贴',
          ],
  };
}

function escapeJson(value) {
  return JSON.stringify(value, null, 2);
}

async function callOpenAIJson({ url, apiKey, payload }) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenAI request failed (${response.status}): ${text}`);
  }

  return response.json();
}

function resolveOpenAIBaseUrl() {
  return process.env.OPENAI_BASE_URL?.replace(/\/$/, '') ?? 'https://api.openai.com';
}

function buildBriefSchema() {
  return {
    name: 'radar_infographic_brief',
    strict: true,
    schema: {
      type: 'object',
      additionalProperties: false,
      properties: {
        centralTheme: { type: 'string' },
        mainline: { type: 'string' },
        branches: {
          type: 'array',
          minItems: 3,
          maxItems: 5,
          items: {
            type: 'object',
            additionalProperties: false,
            properties: {
              label: { type: 'string' },
              note: { type: 'string' },
            },
            required: ['label', 'note'],
          },
        },
        designConstraints: {
          type: 'array',
          minItems: 3,
          maxItems: 6,
          items: { type: 'string' },
        },
      },
      required: ['centralTheme', 'mainline', 'branches', 'designConstraints'],
    },
  };
}

async function maybeRefineBriefWithLLM(meta, body, heuristicBrief, options) {
  if (options.briefMode === 'heuristic') {
    return heuristicBrief;
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    if (options.briefMode === 'llm') {
      throw new Error('OPENAI_API_KEY is required for --brief-mode llm.');
    }

    return heuristicBrief;
  }

  const baseUrl = resolveOpenAIBaseUrl();
  const payload = {
    model: options.briefModel,
    messages: [
      {
        role: 'system',
        content:
          meta.lang === 'ja'
            ? 'あなたは編集デザインのブリーフを作るアートディレクターです。ブログ冒頭に載せる横長インフォグラフィック用に、主線・分岐・制約を高密度かつ視覚設計しやすい JSON へ整えてください。小さな文字を大量に置かず、図解として成立する brief にしてください。'
            : '你是一名为技术博客封面服务的编辑型信息图创意总监。请把日报正文整理成适合横向信息图的结构化 brief：只保留一条主线、3 到 5 个分支、以及明确的视觉约束。避免生成需要大量小字排版的 brief。',
      },
      {
        role: 'user',
        content: [
          `标题：${meta.title}`,
          `语言：${meta.lang}`,
          meta.tags.length > 0 ? `标签：${meta.tags.join('、')}` : '',
          '当前的启发式提要：',
          escapeJson(heuristicBrief),
          '原始正文：',
          body,
        ]
          .filter(Boolean)
          .join('\n\n'),
      },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: buildBriefSchema(),
    },
  };

  try {
    const json = await callOpenAIJson({
      url: `${baseUrl}/v1/chat/completions`,
      apiKey,
      payload,
    });
    const content = json.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('Missing brief content in OpenAI response.');
    }

    return JSON.parse(content);
  } catch (error) {
    if (options.briefMode === 'llm') {
      throw error;
    }

    console.warn(
      `warn brief-refine ${meta.title} -> ${error instanceof Error ? error.message : error}`,
    );
    return heuristicBrief;
  }
}

function inferOpenAIPrompt(meta, brief) {
  const branches = brief.branches
    .slice(0, 5)
    .map((branch, index) => `${index + 1}. ${branch.label}: ${branch.note}`)
    .join('\n');
  const constraints = brief.designConstraints
    .map((item, index) => `${index + 1}. ${item}`)
    .join('\n');

  if (meta.lang === 'ja') {
    return [
      `AI レーダー日報「${meta.title}」のブログ冒頭用ヒーロー画像を作成してください。`,
      '形式は横長の editorial infographic。高級感はあるが、広告ポスターではなく情報整理のための図解にしてください。',
      `中央テーマ: ${brief.centralTheme}`,
      `主線: ${brief.mainline}`,
      '主要ブランチ:',
      branches,
      '制約:',
      constraints,
      '見た目の方向性: 砂色の紙、インクブルー、金のアクセント、細い罫線、余白を活かした構成。抽象図形、ノード、接続線、タイムライン、レイヤー感を使って、知的で落ち着いた雰囲気にする。',
      '重要: 小さな文字を大量に並べない。画像内テキストは、タイトル級 1 本 + 短いラベル 3〜5 個まで。長文・UI モック・人物写真コラージュ・ロゴ並べは避ける。',
      '画像単体で主線と分岐が読め、記事のヘッダーとして洗練されて見えること。',
    ].join('\n');
  }

  return [
    `请为 AI 雷达日报《${meta.title}》生成一张博客文章顶部使用的横向 editorial infographic。`,
    '整体要像高质量编辑部信息图，而不是营销海报，也不是产品截图拼贴。',
    `中心主题：${brief.centralTheme}`,
    `主线：${brief.mainline}`,
    '关键分支：',
    branches,
    '设计约束：',
    constraints,
    '视觉方向：沙色纸张质感、墨蓝色结构线、少量金色强调、留白充足、层次清晰。尽量用节点、连接线、时间层、信号簇来表达结构关系，呈现“今日 AI 技术版图”的感觉。',
    '重要：不要塞满小字。图中文字控制在一个主标题和 3 到 5 个短标签以内；不要出现大段正文，不要做 UI mockup，不要做人物/Logo 拼贴。',
    '最终效果要兼具“头图吸引力”和“信息结构感”，让读者一眼知道今天的主线与分支。',
  ].join('\n');
}

async function generateWithOpenAI(meta, body, targetFile, imagePath, options) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is required for the OpenAI infographic backend.');
  }

  const heuristicBrief = buildHeuristicBrief(meta, body);
  const brief = await maybeRefineBriefWithLLM(meta, body, heuristicBrief, options);
  const prompt = inferOpenAIPrompt(meta, brief);
  const baseUrl = resolveOpenAIBaseUrl();

  const payload = {
    model: options.model,
    prompt,
    size: options.size,
    quality: options.quality,
    output_format: options.outputFormat,
    background: 'opaque',
  };

  console.log(
    `Generating infographic with ${options.model} for ${path.relative(WORKSPACE_ROOT, targetFile)}...`,
  );
  const json = await callOpenAIJson({
    url: `${baseUrl}/v1/images/generations`,
    apiKey,
    payload,
  });
  const base64Image = json.data?.[0]?.b64_json;

  if (!base64Image) {
    throw new Error(`OpenAI image response did not contain b64_json: ${JSON.stringify(json)}`);
  }

  await writeFile(imagePath, Buffer.from(base64Image, 'base64'));
}

function inferInfographicPrompt(title, lang, cadence = 'daily') {
  if (lang === 'ja') {
    if (cadence === 'weekly') {
      return `${title} をもとに、今週の主線をひと目で掴める週間情報図解を作ってください。3〜5 個の重要シグナルを束ね、流れ・因果・来週も追うべき論点が分かる構成にしてください。`;
    }

    if (cadence === 'monthly') {
      return `${title} をもとに、今月の大きな流れを俯瞰できる月次情報図解を作ってください。4〜6 個の主要トレンドを束ね、各週の変化、構造的な意味、次月への示唆が分かる構成にしてください。`;
    }

    return `${title} をもとに、今日の主線をひと目で掴める情報図解を作ってください。3〜5 個の重要シグナルを束ね、見出し・短い注釈・因果のつながりが分かる構成にしてください。`;
  }

  if (cadence === 'weekly') {
    return `请基于《${title}》生成一张适合博客文章顶部展示的中文周报信息图。不要做成海报，而是做成“本周主线 + 3 到 5 个关键分支”的结构：一眼能看懂这一周的核心变化、关键趋势之间的关系，以及下周值得继续跟踪的点。文字要短，层次要清楚，适合横向阅读。`;
  }

  if (cadence === 'monthly') {
    return `请基于《${title}》生成一张适合博客文章顶部展示的中文月报信息图。不要做成海报，而是做成“本月主线 + 4 到 6 个核心趋势”的结构：一眼能看懂本月 AI 技术和产业信号如何汇聚、各周之间如何演化，以及下个月值得关注的方向。文字要短，层次要清楚，适合横向阅读。`;
  }

  return `请基于《${title}》生成一张适合博客文章顶部展示的中文信息图。不要做成海报，而是做成“主线 + 3 到 5 个关键分支”的结构：一眼能看懂今天的核心主题、关键趋势之间的关系，以及对从业者的启发。文字要短，层次要清楚，适合横向阅读。`;
}

async function generateWithNotebooklm(meta, targetFile, imagePath, options) {
  const notebookTitle = `${meta.title} · Infographic`;

  console.log(`Creating notebook for ${path.relative(WORKSPACE_ROOT, targetFile)}...`);
  const notebookId = await createNotebook(notebookTitle);

  try {
    console.log(`Adding markdown source to notebook ${notebookId}...`);
    await addSourceFile(notebookId, targetFile);

    console.log(`Generating infographic (${options.style}, ${options.orientation})...`);
    await runNotebooklm([
      'generate',
      'infographic',
      '--notebook',
      notebookId,
      '--orientation',
      options.orientation,
      '--detail',
      options.detail,
      '--style',
      options.style,
      '--language',
      languageArg(meta.lang),
      inferInfographicPrompt(meta.title, meta.lang, meta.cadence),
      '--json',
    ]);

    await waitForLatestArtifact(notebookId, 'infographic', { timeout: 600 });

    console.log(`Downloading infographic to ${path.relative(WORKSPACE_ROOT, imagePath)}...`);
    await runNotebooklm([
      'download',
      'infographic',
      '--notebook',
      notebookId,
      '--force',
      imagePath,
      '--json',
    ]);
  } finally {
    await maybeDeleteNotebook(notebookId, options.keepNotebook);
  }
}

async function listTargetFiles(options) {
  if (options.file) {
    const resolved = path.isAbsolute(options.file)
      ? options.file
      : path.join(WORKSPACE_ROOT, options.file);
    return [resolved];
  }

  const files = (await readdir(RADAR_DIR))
    .filter((file) => /^daily-ai-radar-\d{4}-\d{2}-\d{2}\.md$/.test(file))
    .sort();

  if (!options.allMissing) {
    const latest = files.at(-1);

    if (!latest) {
      throw new Error('No daily radar markdown file found.');
    }

    return [path.join(RADAR_DIR, latest)];
  }

  const targets = [];

  for (const file of files) {
    const fullPath = path.join(RADAR_DIR, file);
    const source = await readFile(fullPath, 'utf8');
    const meta = parseFrontmatter(source);

    if (!options.overwrite && meta.coverImage) {
      continue;
    }

    targets.push(fullPath);
  }

  return targets;
}

async function processFile(targetFile, options) {
  const raw = await readFile(targetFile, 'utf8');
  const meta = parseFrontmatter(raw);
  const body = stripFrontmatter(raw);
  const slug = slugFromPath(targetFile);
  const imageExtension = options.outputFormat === 'jpeg' ? 'jpg' : options.outputFormat;
  const imagePath = path.join(IMAGE_DIR, `${slug}-infographic.${imageExtension}`);
  const publicImageUrl = `/images/radar/${slug}-infographic.${imageExtension}`;

  if (!options.overwrite && meta.coverImage === publicImageUrl) {
    console.log(`skip ${path.basename(targetFile)} (coverImage already set)`);
    return { status: 'skipped', targetFile, publicImageUrl };
  }

  if (options.backend === 'openai') {
    await generateWithOpenAI(meta, body, targetFile, imagePath, options);
  } else if (options.backend === 'notebooklm') {
    await generateWithNotebooklm(meta, targetFile, imagePath, options);
  } else {
    throw new Error(`Unsupported backend: ${options.backend}`);
  }

  if (meta.coverImage !== publicImageUrl) {
    const latestRaw = await readFile(targetFile, 'utf8');
    const updated = updateFrontmatterValue(latestRaw, 'coverImage', publicImageUrl, {
      anchor: 'lang',
      position: 'after',
    });
    await writeFile(targetFile, updated, 'utf8');
    console.log(`Updated frontmatter coverImage -> ${publicImageUrl}`);
  } else {
    console.log(`coverImage already set to ${publicImageUrl}`);
  }

  console.log(`Done. Infographic ready at ${publicImageUrl}`);
  return { status: 'generated', targetFile, publicImageUrl };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  await mkdir(IMAGE_DIR, { recursive: true });

  const targets = await listTargetFiles(options);

  if (targets.length === 0) {
    console.log('No matching daily radar files need infographic generation.');
    return;
  }

  const failures = [];

  for (const targetFile of targets) {
    try {
      await processFile(targetFile, options);
    } catch (error) {
      failures.push({
        file: targetFile,
        error: error instanceof Error ? error.message : String(error),
      });
      console.error(`fail ${path.basename(targetFile)} -> ${failures.at(-1)?.error}`);
    }
  }

  if (failures.length > 0) {
    throw new Error(`Failed to generate ${failures.length} infographic(s).`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
