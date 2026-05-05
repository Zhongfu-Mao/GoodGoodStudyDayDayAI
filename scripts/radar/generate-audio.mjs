import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { parseFrontmatter, updateFrontmatterValue } from '../lib/frontmatter.mjs';
import {
  extractSectionBlock,
  extractShortParagraphs,
  extractTopSignals,
} from '../lib/markdown.mjs';
import { compressSpeechMp3 } from '../lib/audio-compression.mjs';
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
const AUDIO_DIR = path.join(WORKSPACE_ROOT, 'public/audio/radar');

function parseArgs(argv) {
  const options = {
    file: null,
    lang: null,
    format: 'deep-dive',
    length: 'default',
    keepNotebook: true,
    sourceMode: 'brief',
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--file') {
      options.file = argv[index + 1] ?? null;
      index += 1;
      continue;
    }

    if (arg === '--lang') {
      options.lang = argv[index + 1] ?? null;
      index += 1;
      continue;
    }

    if (arg === '--format') {
      options.format = argv[index + 1] ?? options.format;
      index += 1;
      continue;
    }

    if (arg === '--length') {
      options.length = argv[index + 1] ?? options.length;
      index += 1;
      continue;
    }

    if (arg === '--no-keep-notebook') {
      options.keepNotebook = false;
      continue;
    }

    if (arg === '--source-mode') {
      options.sourceMode = argv[index + 1] ?? options.sourceMode;
      index += 1;
    }
  }

  return options;
}

function buildBriefMemo(body, meta) {
  const headings =
    meta.lang === 'ja'
      ? {
          scope: ['対象範囲'],
          engineering: [
            '1. 🛠️ AI Engineering & アーキテクチャ',
            '1. 🛠️ AI Engineering & Architecture',
          ],
          models: ['2. 🧠 モデル最前線 & アルゴリズム探索', '2. 🧠 Model Frontier & Research'],
          tools: ['3. 💻 実装コード & ツール', '3. 💻 Tools & Code'],
          market: ['4. 📰 業界・ビジネス速報', '4. 📰 Industry & Business'],
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

  const scopeBlock = extractSectionBlock(body, headings.scope);
  const engineeringBlock = extractSectionBlock(body, headings.engineering);
  const modelsBlock = extractSectionBlock(body, headings.models);
  const toolsBlock = extractSectionBlock(body, headings.tools);
  const marketBlock = extractSectionBlock(body, headings.market);
  const mailBlock = extractSectionBlock(body, headings.mail);
  const signals = extractTopSignals(body, 4);

  const memoSections = [
    meta.lang === 'ja' ? `タイトル：${meta.title}` : `标题：${meta.title}`,
    meta.lang === 'ja' ? '言語：日本語' : '语言：中文',
    signals.length > 0
      ? meta.lang === 'ja'
        ? `主要トピック：${signals.join('；')}`
        : `关键主题：${signals.join('；')}`
      : '',
    scopeBlock ? `${meta.lang === 'ja' ? '範囲とソース' : '范围与来源'}：\n${scopeBlock}` : '',
    engineeringBlock
      ? `${meta.lang === 'ja' ? 'エンジニアリングとアーキテクチャ' : '工程与架构'}：\n${extractShortParagraphs(engineeringBlock).join('\n')}`
      : '',
    modelsBlock
      ? `${meta.lang === 'ja' ? 'モデルと研究' : '模型与研究'}：\n${extractShortParagraphs(modelsBlock).join('\n')}`
      : '',
    toolsBlock
      ? `${meta.lang === 'ja' ? 'ツールと実装' : '工具与实践'}：\n${extractShortParagraphs(toolsBlock, 2).join('\n')}`
      : '',
    marketBlock
      ? `${meta.lang === 'ja' ? '業界とビジネス' : '行业与商业'}：\n${extractShortParagraphs(marketBlock, 2).join('\n')}`
      : '',
    mailBlock
      ? `${meta.lang === 'ja' ? 'Newsletter 精选' : 'Newsletter 精选'}：\n${extractShortParagraphs(mailBlock, 2).join('\n')}`
      : '',
    meta.lang === 'ja'
      ? '要求：把上面内容整理成适合 5 分钟内听完的简明音频，不展开无关背景。'
      : '要求：把上面内容整理成适合 3-6 分钟内听完的简明音频，只保留最重要主线与信号关系。',
  ].filter(Boolean);

  return `${memoSections.join('\n\n')}\n`;
}

async function resolveTargetFile(explicitFile, requestedLang) {
  if (explicitFile) {
    return path.isAbsolute(explicitFile) ? explicitFile : path.join(WORKSPACE_ROOT, explicitFile);
  }

  const lang = requestedLang === 'ja' ? 'ja' : 'zh';
  const files = (await readdir(RADAR_DIR))
    .filter((file) =>
      lang === 'ja'
        ? /^daily-ai-radar-\d{4}-\d{2}-\d{2}\.ja\.md$/.test(file)
        : /^daily-ai-radar-\d{4}-\d{2}-\d{2}\.md$/.test(file),
    )
    .sort();

  const latest = files.at(-1);

  if (!latest) {
    throw new Error('No daily radar markdown file found.');
  }

  return path.join(RADAR_DIR, latest);
}

function inferAudioPrompt(title, lang) {
  if (lang === 'ja') {
    return `${title} をもとに、日本語で 2 人のホストが対話する 3〜6 分程度の音声解説を作ってください。最重要の主線と 3 つ前後のシグナルに絞り、導入は短く、繰り返しは避け、自然な会話感は保ちつつも通勤中に一気に聞ける密度にしてください。`;
  }

  return `请基于《${title}》生成一段 3 到 6 分钟左右的中文双主持人音频解读。只讲最重要的主线和 3 个左右关键信号，不要逐条念稿，不要展开成长播客，保留自然对谈感，但整体要紧凑、克制、信息密度高。`;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const targetFile = await resolveTargetFile(options.file, options.lang);
  const raw = await readFile(targetFile, 'utf8');
  const meta = parseFrontmatter(raw);
  const slug = path.basename(targetFile, '.md');
  const audioPath = path.join(AUDIO_DIR, `${slug}.mp3`);
  const publicAudioUrl = `/audio/radar/${slug}.mp3`;
  const notebookTitle = `${meta.title} · Audio`;
  const briefMemoPath = path.join(os.tmpdir(), `${slug}.brief.txt`);

  await mkdir(AUDIO_DIR, { recursive: true });

  console.log(`Creating notebook for ${path.relative(WORKSPACE_ROOT, targetFile)}...`);
  const notebookId = await createNotebook(notebookTitle);

  try {
    const sourcePath = options.sourceMode === 'brief' ? briefMemoPath : targetFile;

    if (options.sourceMode === 'brief') {
      const briefMemo = buildBriefMemo(meta.body, meta);
      await writeFile(briefMemoPath, briefMemo, 'utf8');
      console.log(`Adding brief memo source to notebook ${notebookId}...`);
    } else {
      console.log(`Adding markdown source to notebook ${notebookId}...`);
    }

    await addSourceFile(notebookId, sourcePath);

    console.log(`Generating audio (${options.format}, ${options.length})...`);
    await runNotebooklm([
      'generate',
      'audio',
      '--notebook',
      notebookId,
      '--format',
      options.format,
      '--length',
      options.length,
      '--language',
      languageArg(meta.lang),
      inferAudioPrompt(meta.title, meta.lang),
      '--json',
    ]);

    const artifact = await waitForLatestArtifact(notebookId, 'audio', { timeout: 1200 });
    console.log(`Audio artifact ${artifact.id} ready.`);

    console.log(`Downloading audio to ${path.relative(WORKSPACE_ROOT, audioPath)}...`);
    await runNotebooklm([
      'download',
      'audio',
      '--notebook',
      notebookId,
      '--force',
      audioPath,
      '--json',
    ]);
    console.log('Compressing audio to MP3 mono 64k...');
    await compressSpeechMp3(audioPath);

    if (meta.audioUrl !== publicAudioUrl) {
      const latestRaw = await readFile(targetFile, 'utf8');
      const updated = updateFrontmatterValue(latestRaw, 'audioUrl', publicAudioUrl);
      await writeFile(targetFile, updated, 'utf8');
      console.log(`Updated frontmatter audioUrl -> ${publicAudioUrl}`);
    } else {
      console.log(`audioUrl already set to ${publicAudioUrl}`);
    }

    console.log(`Done. Audio ready at ${publicAudioUrl}`);
  } finally {
    if (options.sourceMode === 'brief') {
      await rm(briefMemoPath, { force: true });
    }

    await maybeDeleteNotebook(notebookId, options.keepNotebook);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
