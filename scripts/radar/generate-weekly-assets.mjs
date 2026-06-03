import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { getAudioFileMetadata } from '../lib/audio-metadata.mjs';
import { parseFrontmatter, updateFrontmatterValue } from '../lib/frontmatter.mjs';
import { publishRadarAsset } from '../lib/radar-assets.mjs';
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
const DECK_DIR = path.join(WORKSPACE_ROOT, 'public/decks/radar');

function parseArgs(argv) {
  const options = {
    file: null,
    lang: null,
    keepNotebook: true,
    includeWeeklyBrief: true,
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

    if (arg === '--no-keep-notebook') {
      options.keepNotebook = false;
      continue;
    }

    if (arg === '--no-weekly-brief') {
      options.includeWeeklyBrief = false;
    }
  }

  return options;
}

async function resolveTargetFile(explicitFile, requestedLang) {
  if (explicitFile) {
    return path.isAbsolute(explicitFile) ? explicitFile : path.join(WORKSPACE_ROOT, explicitFile);
  }

  const lang = requestedLang === 'ja' ? 'ja' : 'zh';
  const files = (await readdir(RADAR_DIR))
    .filter((file) =>
      lang === 'ja'
        ? /^weekly-ai-radar-\d{4}-\d{2}-\d{2}-to-\d{4}-\d{2}-\d{2}\.ja\.md$/.test(file)
        : /^weekly-ai-radar-\d{4}-\d{2}-\d{2}-to-\d{4}-\d{2}-\d{2}\.md$/.test(file),
    )
    .sort();

  const latest = files.at(-1);

  if (!latest) {
    throw new Error('No weekly radar markdown file found.');
  }

  return path.join(RADAR_DIR, latest);
}

function parseWeeklyDateRange(filePath) {
  const match = path
    .basename(filePath)
    .match(/^weekly-ai-radar-(\d{4}-\d{2}-\d{2})-to-(\d{4}-\d{2}-\d{2})(?:\.ja)?\.md$/);

  if (!match) {
    throw new Error('Weekly radar filename does not contain a valid date range.');
  }

  return {
    start: new Date(`${match[1]}T00:00:00Z`),
    end: new Date(`${match[2]}T00:00:00Z`),
  };
}

function dateFromDailyFilename(fileName) {
  const match = fileName.match(/^daily-ai-radar-(\d{4}-\d{2}-\d{2})(?:\.ja)?\.md$/);
  return match ? new Date(`${match[1]}T00:00:00Z`) : null;
}

async function resolveDailySourceFiles({ start, end, lang }) {
  const files = await readdir(RADAR_DIR);

  return files
    .filter((file) => {
      if (!file.startsWith('daily-ai-radar-')) {
        return false;
      }

      if (lang === 'ja') {
        return file.endsWith('.ja.md');
      }

      return file.endsWith('.md') && !file.endsWith('.ja.md');
    })
    .filter((file) => {
      const fileDate = dateFromDailyFilename(file);
      return fileDate && fileDate >= start && fileDate <= end;
    })
    .sort()
    .map((file) => path.join(RADAR_DIR, file));
}

function inferWeeklyAudioPrompt(title, lang) {
  if (lang === 'ja') {
    return `${title} をもとに、日本語で 2 人のホストが対話する 15 分前後の週次音声解説を作ってください。冒頭で今週の結論を 1 つに絞って示し、その後に 3〜4 本の主線、シグナル同士のつながり、何が前週から変わったのか、来週も追うべき論点を深掘りしてください。ホスト A は週全体の地図を描き、ホスト B は「それは現場にどう効くのか」「まだ不確かな点は何か」を問い返してください。日別の出来事を羅列せず、ソースにない断定や過度な未来予測は避けてください。`;
  }

  return `请基于《${title}》生成一段约 15 分钟的中文双主持人周报音频。开头先把本周结论压缩成一句话，然后围绕 3 到 4 条主线，讲清关键趋势之间的关系、相比前一周真正发生的变化、以及下周值得继续跟踪的点。主持人 A 负责搭建本周地图，主持人 B 负责追问“这对从业者意味着什么”“哪些判断还不确定”。不要按日期流水账罗列，不要逐条念稿，不要做没有来源支撑的断言或过度预测。`;
}

function inferWeeklyDeckPrompt(title, lang) {
  if (lang === 'ja') {
    return `${title} の内容を、7〜10 枚程度の週次レビュー用 slide deck にしてください。1 枚目は今週の結論、続いて 3〜4 本の主線、シグナル同士の関係、実務への示唆、最後に来週の注目点を入れてください。各スライドは短い見出し、少ない本文、構造図または箇条書き中心にし、ソースにない断定は避けてください。`;
  }

  return `请基于《${title}》生成一份适合周报回顾的 slide deck。控制在 7 到 10 页：第一页给出本周结论，接着讲 3 到 4 条主线、信号之间的关系、对从业者的启发，最后总结下周值得继续跟踪的点。每页使用短标题、少量正文、结构图或要点列表；不要堆长段文字，也不要做没有来源支撑的断言。`;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const targetFile = await resolveTargetFile(options.file, options.lang);
  const raw = await readFile(targetFile, 'utf8');
  const meta = parseFrontmatter(raw);
  const slug = path.basename(targetFile, '.md');
  const notebookTitle = `${meta.title} · Weekly Assets`;
  const audioPath = path.join(AUDIO_DIR, `${slug}.mp3`);
  const deckPath = path.join(DECK_DIR, `${slug}.pdf`);
  const publicAudioUrl = `/audio/radar/${slug}.mp3?v=weekly`;
  const publicDeckUrl = `/decks/radar/${slug}.pdf`;
  const range = parseWeeklyDateRange(targetFile);
  const dailyFiles = await resolveDailySourceFiles({ ...range, lang: meta.lang });

  if (dailyFiles.length === 0) {
    throw new Error('No daily radar files found in the weekly date range.');
  }

  await mkdir(AUDIO_DIR, { recursive: true });
  await mkdir(DECK_DIR, { recursive: true });

  console.log(`Creating notebook for ${path.relative(WORKSPACE_ROOT, targetFile)}...`);
  const notebookId = await createNotebook(notebookTitle);
  let completed = false;

  try {
    for (const dailyFile of dailyFiles) {
      console.log(`Adding daily source ${path.basename(dailyFile)}...`);
      await addSourceFile(notebookId, dailyFile);
    }

    if (options.includeWeeklyBrief) {
      console.log(`Adding weekly brief ${path.basename(targetFile)}...`);
      await addSourceFile(notebookId, targetFile);
    }

    console.log('Generating weekly audio...');
    await runNotebooklm([
      'generate',
      'audio',
      '--notebook',
      notebookId,
      '--format',
      'deep-dive',
      '--length',
      'long',
      '--language',
      languageArg(meta.lang),
      inferWeeklyAudioPrompt(meta.title, meta.lang),
      '--json',
    ]);

    await waitForLatestArtifact(notebookId, 'audio');
    await runNotebooklm([
      'download',
      'audio',
      '--notebook',
      notebookId,
      '--force',
      audioPath,
      '--json',
    ]);

    console.log('Generating weekly slide deck...');
    await runNotebooklm([
      'generate',
      'slide-deck',
      '--notebook',
      notebookId,
      '--format',
      'presenter',
      '--length',
      'default',
      '--language',
      languageArg(meta.lang),
      inferWeeklyDeckPrompt(meta.title, meta.lang),
      '--json',
    ]);

    await waitForLatestArtifact(notebookId, 'slide-deck');
    await runNotebooklm([
      'download',
      'slide-deck',
      '--notebook',
      notebookId,
      '--format',
      'pdf',
      '--force',
      deckPath,
      '--json',
    ]);

    const audio = await getAudioFileMetadata(audioPath);
    const publishedAudioUrl = await publishRadarAsset({
      localPath: audioPath,
      publicUrl: publicAudioUrl,
      label: 'weekly audio',
    });
    const publishedDeckUrl = await publishRadarAsset({
      localPath: deckPath,
      publicUrl: publicDeckUrl,
      label: 'weekly deck',
    });
    let updated = raw;

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

    if (meta.deckUrl !== publishedDeckUrl) {
      updated = updateFrontmatterValue(updated, 'deckUrl', publishedDeckUrl);
    }

    if (updated !== raw) {
      await writeFile(targetFile, updated, 'utf8');
      console.log(`Updated weekly frontmatter with audioUrl and deckUrl.`);
    }

    console.log(`Done. Weekly assets ready: ${publishedAudioUrl} and ${publishedDeckUrl}`);
    completed = true;
  } finally {
    if (!completed && !options.keepNotebook) {
      console.warn(`Keeping failed weekly assets notebook for traceability: ${notebookId}`);
    }

    await maybeDeleteNotebook(notebookId, options.keepNotebook || !completed);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
