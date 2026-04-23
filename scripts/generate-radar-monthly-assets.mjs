import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { parseFrontmatter, updateFrontmatterValue } from './lib/frontmatter.mjs';
import {
  addSourceFile,
  createNotebook,
  languageArg,
  maybeDeleteNotebook,
  runNotebooklm,
  waitForLatestArtifact,
} from './lib/notebooklm.mjs';

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
    .filter((file) => (lang === 'ja'
      ? /^monthly-ai-radar-\d{4}-\d{2}\.ja\.md$/.test(file)
      : /^monthly-ai-radar-\d{4}-\d{2}\.md$/.test(file)))
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
  const match = fileName.match(/^weekly-ai-radar-(\d{4}-\d{2}-\d{2})-to-(\d{4}-\d{2}-\d{2})(?:\.ja)?\.md$/);

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
    return `${title} をもとに、2 人のホストが対話する長尺の月次音声解説を作ってください。今月の中心トレンド、各週をつなぐ変化、来月に持ち越される論点までを自然な会話で深掘りしてください。`;
  }

  return `请基于《${title}》生成一段长篇中文双主持人月报音频。围绕本月最重要的趋势主线展开，把各周之间的变化、真正形成的行业共识，以及下个月值得继续观察的点串起来讲清楚。`;
}

function inferMonthlyDeckPrompt(title, lang) {
  if (lang === 'ja') {
    return `${title} の内容を、月次回顾用の slide deck にしてください。8〜12 枚程度で、总括、核心趋势、各周之间的演化、下月关注点を入れてください。`;
  }

  return `请基于《${title}》生成一份月报回顾用的 slide deck。控制在 8 到 12 页，包含：本月结论、核心趋势、各周之间的演化，以及下月值得关注的重点。`;
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
    await runNotebooklm(['download', 'audio', '--notebook', notebookId, '--force', audioPath, '--json']);

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

    let updated = raw;

    if (meta.audioUrl !== publicAudioUrl) {
      updated = updateFrontmatterValue(updated, 'audioUrl', publicAudioUrl);
    }

    if (meta.deckUrl !== publicDeckUrl) {
      updated = updateFrontmatterValue(updated, 'deckUrl', publicDeckUrl);
    }

    if (updated !== raw) {
      await writeFile(targetFile, updated, 'utf8');
      console.log('Updated monthly frontmatter with audioUrl and deckUrl.');
    }

    console.log(`Done. Monthly assets ready: ${publicAudioUrl} and ${publicDeckUrl}`);
  } finally {
    await maybeDeleteNotebook(notebookId, options.keepNotebook);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
