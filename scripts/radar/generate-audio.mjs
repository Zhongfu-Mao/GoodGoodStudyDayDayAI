import { copyFile, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';
import { getAudioFileMetadata } from '../lib/audio-metadata.mjs';
import { parseFrontmatter, updateFrontmatterValue } from '../lib/frontmatter.mjs';
import { publishRadarAsset } from '../lib/radar-assets.mjs';
import { buildInfographicBrief } from '../lib/radar-infographic-brief.mjs';
import { compressSpeechMp3 } from '../lib/audio-compression.mjs';
import {
  addSourceFile,
  createNotebook,
  languageArg,
  maybeDeleteNotebook,
  runNotebooklm,
  waitForArtifact,
  generationArtifact,
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

export function buildBriefMemo(body, meta) {
  // Reuse the shared fact parser; image captions are presentation, not audio sources.
  const brief = buildInfographicBrief(
    meta,
    body.replace(/<!-- radar-visual:[\s\S]*?<!-- \/radar-visual:[^>]*-->/g, ''),
  );
  return [
    meta.lang === 'ja' ? `タイトル：${meta.title}` : `标题：${meta.title}`,
    meta.lang === 'ja' ? '言語：日本語' : '语言：中文',
    ...brief.sections.map((section) =>
      [
        `## ${section.title}`,
        ...section.items.map((item) => `### ${item.title}\n\n${item.facts}`),
      ].join('\n\n'),
    ),
    meta.lang === 'ja'
      ? '制作方針：上の内容だけを根拠に、今日の主線、重要シグナル、その実務的な意味を会話で整理してください。見出しの読み上げや根拠のない推測は避けてください。'
      : '制作方针：只以上面内容为依据，用对谈方式讲清今天的主线、关键信号和实务含义。不要逐条念标题，不要补充没有来源支撑的推测。',
    '',
  ].join('\n\n');
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
    return `${title} をもとに、日本語で 2 人のホストが対話する 8〜12 分程度の音声解説を作ってください。冒頭 30 秒で今日の結論を示し、その後は最重要の主線、3〜4 個のシグナル、それらが実務に与える意味を順に深掘りしてください。ホスト A は全体像を整理し、ホスト B は「なぜ重要か」「どこに注意すべきか」を問い返す役にしてください。見出しを読み上げるだけの構成、根拠のない予測、同じ内容の反復は避けてください。固有名詞・日付・数値は出典内容に忠実に扱い、不確かな点は断定しないでください。`;
  }

  return `请基于《${title}》生成一段 8 到 12 分钟左右的中文双主持人音频解读。开头 30 秒先给出今天的核心结论，然后围绕最重要的主线、3 到 4 个关键信号、以及它们对从业者的实务含义展开。主持人 A 负责搭建全局脉络，主持人 B 负责追问“为什么重要”“风险和不确定性在哪里”。不要逐条念稿，不要把 Markdown 标题当成播报提纲，不要做没有来源支撑的预测，也不要重复空转。固有名词、日期、数字必须忠于来源；不确定的地方要用谨慎语气。`;
}

export async function main(argv = process.argv.slice(2)) {
  const options = parseArgs(argv);
  const targetFile = await resolveTargetFile(options.file, options.lang);
  const raw = await readFile(targetFile, 'utf8');
  const meta = parseFrontmatter(raw);
  const slug = path.basename(targetFile, '.md');
  const audioPath = path.join(AUDIO_DIR, `${slug}.mp3`);
  const publicAudioUrl = `/audio/radar/${slug}.mp3`;
  const notebookTitle = `${meta.title} · Audio`;
  const briefMemoPath = path.join(os.tmpdir(), `${slug}.brief.txt`);
  // Validate all sections and facts before creating any remote notebook.
  const briefMemo = options.sourceMode === 'brief' ? buildBriefMemo(meta.body, meta) : null;

  await mkdir(AUDIO_DIR, { recursive: true });

  console.log(`Creating notebook for ${path.relative(WORKSPACE_ROOT, targetFile)}...`);
  const notebookId = await createNotebook(notebookTitle);
  let completed = false;

  try {
    const sourcePath = options.sourceMode === 'brief' ? briefMemoPath : targetFile;

    if (options.sourceMode === 'brief') {
      await writeFile(briefMemoPath, briefMemo, 'utf8');
      console.log(`Adding brief memo source to notebook ${notebookId}...`);
    } else {
      console.log(`Adding markdown source to notebook ${notebookId}...`);
    }

    const source = await addSourceFile(notebookId, sourcePath);

    console.log(`Generating audio (${options.format}, ${options.length})...`);
    const generation = await runNotebooklm([
      'generate',
      'audio',
      '--notebook',
      notebookId,
      '--source',
      source.id,
      '--format',
      options.format,
      '--length',
      options.length,
      '--language',
      languageArg(meta.lang),
      inferAudioPrompt(meta.title, meta.lang),
      '--json',
    ]);

    const artifact = await waitForArtifact(notebookId, generationArtifact(generation.stdout), {
      timeout: 1800,
    });
    console.log(`Audio artifact ${artifact.id} ready.`);

    const rawAudioPath = path.join(
      WORKSPACE_ROOT,
      'tmp/radar-audio-raw',
      `${slug}-${artifact.id}.m4a`,
    );
    await mkdir(path.dirname(rawAudioPath), { recursive: true });

    console.log(`Downloading audio to ${path.relative(WORKSPACE_ROOT, audioPath)}...`);
    await runNotebooklm([
      'download',
      'audio',
      '--artifact',
      artifact.id,
      '--notebook',
      notebookId,
      '--force',
      rawAudioPath,
      '--json',
    ]);
    const originalAudio = await getAudioFileMetadata(rawAudioPath);
    await copyFile(rawAudioPath, audioPath);
    console.log('Compressing audio to MP3 mono 64k...');
    await compressSpeechMp3(audioPath);
    const audio = await getAudioFileMetadata(audioPath);
    if (
      !originalAudio.duration ||
      !audio.duration ||
      Math.abs(originalAudio.duration - audio.duration) > 1
    ) {
      throw new Error(
        `Audio duration changed during conversion; raw file retained at ${rawAudioPath}`,
      );
    }
    const publishedAudioUrl = await publishRadarAsset({
      localPath: audioPath,
      publicUrl: publicAudioUrl,
      label: 'daily audio',
    });

    const latestRaw = await readFile(targetFile, 'utf8');
    let updated = latestRaw;

    if (meta.audioUrl !== publishedAudioUrl) {
      updated = updateFrontmatterValue(updated, 'audioUrl', publishedAudioUrl);
    }

    if (audio.duration) {
      updated = updateFrontmatterValue(updated, 'audioDuration', audio.duration, {
        anchor: 'audioUrl',
        position: 'after',
      });
    }

    updated = updateFrontmatterValue(updated, 'audioSize', audio.size, {
      anchor: 'audioDuration',
      position: 'after',
    });

    if (updated !== latestRaw) {
      await writeFile(targetFile, updated, 'utf8');
      console.log(`Updated frontmatter audio metadata for ${publishedAudioUrl}`);
    } else {
      console.log(`audio metadata already set for ${publishedAudioUrl}`);
    }

    console.log(`Done. Audio ready at ${publishedAudioUrl}`);
    completed = true;
  } finally {
    if (options.sourceMode === 'brief') {
      await rm(briefMemoPath, { force: true });
    }

    if (!completed && !options.keepNotebook) {
      console.warn(`Keeping failed audio notebook for traceability: ${notebookId}`);
    }

    await maybeDeleteNotebook(notebookId, options.keepNotebook || !completed);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
