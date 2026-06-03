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
    includeMonthlyBrief: true,
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

    if (arg === '--no-monthly-brief') {
      options.includeMonthlyBrief = false;
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
        ? /^monthly-ai-radar-\d{4}-\d{2}\.ja\.md$/.test(file)
        : /^monthly-ai-radar-\d{4}-\d{2}\.md$/.test(file),
    )
    .sort();

  const latest = files.at(-1);

  if (!latest) {
    throw new Error('No monthly radar markdown file found.');
  }

  return path.join(RADAR_DIR, latest);
}

function parseMonthlyPeriod(filePath) {
  const match = path.basename(filePath).match(/^monthly-ai-radar-(\d{4})-(\d{2})(?:\.ja)?\.md$/);

  if (!match) {
    throw new Error('Monthly radar filename does not contain a valid year-month period.');
  }

  return { year: Number(match[1]), month: Number(match[2]) };
}

function parseWeeklyRangeFromFilename(fileName) {
  const match = fileName.match(
    /^weekly-ai-radar-(\d{4}-\d{2}-\d{2})-to-(\d{4}-\d{2}-\d{2})(?:\.ja)?\.md$/,
  );

  if (!match) {
    return null;
  }

  return {
    start: new Date(`${match[1]}T00:00:00Z`),
    end: new Date(`${match[2]}T00:00:00Z`),
  };
}

function overlapsTargetMonth(range, year, month) {
  const targetStart = new Date(Date.UTC(year, month - 1, 1));
  const targetEnd = new Date(Date.UTC(year, month, 0, 23, 59, 59));
  return range.start <= targetEnd && range.end >= targetStart;
}

async function resolveWeeklySourceFiles({ year, month, lang }) {
  const files = await readdir(RADAR_DIR);

  return files
    .filter((file) => {
      if (!file.startsWith('weekly-ai-radar-')) {
        return false;
      }

      if (lang === 'ja') {
        return file.endsWith('.ja.md');
      }

      return file.endsWith('.md') && !file.endsWith('.ja.md');
    })
    .filter((file) => {
      const range = parseWeeklyRangeFromFilename(file);
      return range && overlapsTargetMonth(range, year, month);
    })
    .sort()
    .map((file) => path.join(RADAR_DIR, file));
}

function inferMonthlyAudioPrompt(title, lang) {
  if (lang === 'ja') {
    return `${title} をもとに、日本語で 2 人のホストが対話する長尺の月次音声解説を作ってください。冒頭で今月の結論を示し、その後に中心トレンド、各週をつなぐ変化、形成された合意とまだ割れている論点、来月に持ち越される問いを自然な会話で深掘りしてください。ホスト A は月全体の構造を整理し、ホスト B は「なぜ今月それが重要になったのか」「次に何を見ればよいのか」を問い返してください。週ごとの要約を並べるだけにせず、ソースにない断定や過度な未来予測は避けてください。`;
  }

  return `请基于《${title}》生成一段长篇中文双主持人月报音频。开头先给出本月结论，然后围绕本月最重要的趋势主线展开，把各周之间的演化、真正形成的行业共识、仍然分歧的判断，以及下个月值得继续观察的问题串起来讲清楚。主持人 A 负责整理月度结构，主持人 B 负责追问“为什么这个月变得重要”“下一步应该看什么证据”。不要只是复述每周摘要，不要做没有来源支撑的断言或过度预测。`;
}

function inferMonthlyDeckPrompt(title, lang) {
  if (lang === 'ja') {
    return `${title} の内容を、月次レビュー用 slide deck にしてください。8〜12 枚程度で、月次結論、中心トレンド、各週の変化、構造的な意味、来月の注目点を入れてください。各スライドは短い見出し、少ない本文、構造図または箇条書き中心にし、ソースにない断定は避けてください。`;
  }

  return `请基于《${title}》生成一份月报回顾用的 slide deck。控制在 8 到 12 页，包含：本月结论、核心趋势、各周之间的演化、结构性含义，以及下月值得关注的重点。每页使用短标题、少量正文、结构图或要点列表；不要堆长段文字，也不要做没有来源支撑的断言。`;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const targetFile = await resolveTargetFile(options.file, options.lang);
  const raw = await readFile(targetFile, 'utf8');
  const meta = parseFrontmatter(raw);
  const slug = path.basename(targetFile, '.md');
  const notebookTitle = `${meta.title} · Monthly Assets`;
  const audioPath = path.join(AUDIO_DIR, `${slug}.mp3`);
  const deckPath = path.join(DECK_DIR, `${slug}.pdf`);
  const publicAudioUrl = `/audio/radar/${slug}.mp3?v=monthly`;
  const publicDeckUrl = `/decks/radar/${slug}.pdf`;
  const period = parseMonthlyPeriod(targetFile);
  const weeklyFiles = await resolveWeeklySourceFiles({ ...period, lang: meta.lang });

  if (weeklyFiles.length === 0) {
    throw new Error('No weekly radar files found in the monthly period.');
  }

  await mkdir(AUDIO_DIR, { recursive: true });
  await mkdir(DECK_DIR, { recursive: true });

  console.log(`Creating notebook for ${path.relative(WORKSPACE_ROOT, targetFile)}...`);
  const notebookId = await createNotebook(notebookTitle);
  let completed = false;

  try {
    for (const weeklyFile of weeklyFiles) {
      console.log(`Adding weekly source ${path.basename(weeklyFile)}...`);
      await addSourceFile(notebookId, weeklyFile);
    }

    if (options.includeMonthlyBrief) {
      console.log(`Adding monthly brief ${path.basename(targetFile)}...`);
      await addSourceFile(notebookId, targetFile);
    }

    console.log('Generating monthly audio...');
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
      inferMonthlyAudioPrompt(meta.title, meta.lang),
      '--json',
    ]);

    await waitForLatestArtifact(notebookId, 'audio', { timeout: 1200 });
    await runNotebooklm([
      'download',
      'audio',
      '--notebook',
      notebookId,
      '--force',
      audioPath,
      '--json',
    ]);

    console.log('Generating monthly slide deck...');
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
      inferMonthlyDeckPrompt(meta.title, meta.lang),
      '--json',
    ]);

    await waitForLatestArtifact(notebookId, 'slide-deck', { timeout: 1200 });
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
      label: 'monthly audio',
    });
    const publishedDeckUrl = await publishRadarAsset({
      localPath: deckPath,
      publicUrl: publicDeckUrl,
      label: 'monthly deck',
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
      console.log('Updated monthly frontmatter with audioUrl and deckUrl.');
    }

    console.log(`Done. Monthly assets ready: ${publishedAudioUrl} and ${publishedDeckUrl}`);
    completed = true;
  } finally {
    if (!completed && !options.keepNotebook) {
      console.warn(`Keeping failed monthly assets notebook for traceability: ${notebookId}`);
    }

    await maybeDeleteNotebook(notebookId, options.keepNotebook || !completed);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
