import { copyFile, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';
import { inspectAudio, newCandidateDirectory, fileSha256 } from '../lib/radar-review.mjs';
import { assertRadarPublicationAllowed } from '../lib/radar-publication.mjs';
import { openGenerationJob, generationInputKey } from '../lib/radar-generation-job.mjs';
import { compressSpeechMp3 } from '../lib/audio-compression.mjs';
import { parseFrontmatter, updateFrontmatterValue } from '../lib/frontmatter.mjs';
import { publishRadarAsset } from '../lib/radar-assets.mjs';
import { validateMonthlySourceNames } from '../lib/monthly-source-boundary.mjs';
import {
  addSourceFile,
  createNotebook,
  languageArg,
  runNotebooklm,
  waitForArtifact,
  generationArtifact,
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
    publish: true,
    includeMonthlyBrief: true,
    sourceFiles: [],
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--no-publish') {
      options.publish = false;
      continue;
    }
    if (arg === '--job-file') {
      const file = argv[++index];
      if (!file || file.startsWith('--'))
        throw new Error('--job-file requires a private JSON path');
      options.jobFile = file;
      continue;
    }

    if (arg === '--source-file') {
      const value = argv[index + 1];
      if (!value || value.startsWith('--')) throw new Error('--source-file requires a path');
      options.sourceFiles.push(path.resolve(WORKSPACE_ROOT, value));
      index += 1;
      continue;
    }

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

export async function main(argv = process.argv.slice(2)) {
  const options = parseArgs(argv);
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
  const weeklyFiles = options.sourceFiles.length
    ? validateMonthlySourceNames(options.sourceFiles, { ...period, lang: meta.lang })
    : await resolveWeeklySourceFiles({ ...period, lang: meta.lang });

  for (const sourceFile of weeklyFiles) {
    const sourceMeta = parseFrontmatter(await readFile(sourceFile, 'utf8'));
    if (sourceMeta.lang !== meta.lang || /^draft:\s*true\s*$/m.test(sourceMeta.raw)) {
      throw new Error(`Monthly source must be published and match language: ${sourceFile}`);
    }
  }

  if (weeklyFiles.length === 0) {
    throw new Error('No weekly radar files found in the monthly period.');
  }

  // This command publishes as well as generates. Do not consume generation
  // quota while publication is explicitly held.
  if (options.publish) await assertRadarPublicationAllowed();
  const sourceSnapshots = await Promise.all(weeklyFiles.map((file) => readFile(file, 'utf8')));
  const inputs = sourceSnapshots.map((snapshot, index) => {
    const source = parseFrontmatter(snapshot);
    return [path.basename(weeklyFiles[index]), source.title, source.date, source.lang, source.body];
  });
  const job = await openGenerationJob(
    options.jobFile ?? `.cache/radar-generation/${slug}-monthly.json`,
    generationInputKey([
      meta.title,
      meta.date,
      meta.lang,
      meta.body,
      inputs,
      options.includeMonthlyBrief,
      inferMonthlyAudioPrompt(meta.title, meta.lang),
      inferMonthlyDeckPrompt(meta.title, meta.lang),
    ]),
    {
      run: runNotebooklm,
      inputSnapshot: {
        sources: sourceSnapshots,
        brief: raw,
        audioPrompt: inferMonthlyAudioPrompt(meta.title, meta.lang),
        deckPrompt: inferMonthlyDeckPrompt(meta.title, meta.lang),
      },
    },
  );
  const directory = await job.once('directory', () => newCandidateDirectory(slug, 'audio'));
  const rawAudioPath = path.join(directory, 'raw.m4a');
  const encodedAudioPath = path.join(directory, 'asset.mp3');
  const privateDeckPath = path.join(directory, 'deck.pdf');

  console.log(`Creating notebook for ${path.relative(WORKSPACE_ROOT, targetFile)}...`);
  const notebookId = await job.once('notebook', () => createNotebook(notebookTitle));
  let completed = false;

  try {
    for (const [sourceIndex, weeklyFile] of weeklyFiles.entries()) {
      console.log(`Adding monthly evidence source ${path.basename(weeklyFile)}...`);
      const source = await job.once(`source:${path.basename(weeklyFile)}`, async () => {
        const snapshot = path.join(directory, `source-${sourceIndex}.md`);
        await writeFile(snapshot, sourceSnapshots[sourceIndex]);
        return addSourceFile(notebookId, snapshot, { waitForReady: false });
      });
      await runNotebooklm([
        'source',
        'wait',
        '--notebook',
        notebookId,
        source.id,
        '--timeout',
        '300',
        '--json',
      ]);
    }

    if (options.includeMonthlyBrief) {
      console.log(`Adding monthly brief ${path.basename(targetFile)}...`);
      const source = await job.once('source:brief', async () => {
        const snapshot = path.join(directory, 'brief.md');
        await writeFile(snapshot, raw);
        return addSourceFile(notebookId, snapshot, { waitForReady: false });
      });
      await runNotebooklm([
        'source',
        'wait',
        '--notebook',
        notebookId,
        source.id,
        '--timeout',
        '300',
        '--json',
      ]);
    }

    console.log('Generating monthly audio...');
    const submittedAudio = await job.once('generate:audio', async () =>
      generationArtifact(
        (
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
          ])
        ).stdout,
      ),
    );

    const artifact = await waitForArtifact(notebookId, submittedAudio, {
      timeout: 1200,
    });
    console.log('Generating monthly slide deck...');
    const submittedDeck = await job.once('generate:deck', async () =>
      generationArtifact(
        (
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
          ])
        ).stdout,
      ),
    );

    const deckArtifact = await waitForArtifact(notebookId, submittedDeck, { timeout: 1200 });
    const prepared = await job.once('assets', async () => {
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
      await runNotebooklm([
        'download',
        'slide-deck',
        '--artifact',
        deckArtifact.id,
        '--notebook',
        notebookId,
        '--format',
        'pdf',
        '--force',
        privateDeckPath,
        '--json',
      ]);

      await copyFile(rawAudioPath, encodedAudioPath);
      await compressSpeechMp3(encodedAudioPath);
      const audio = await inspectAudio(rawAudioPath, encodedAudioPath);
      return {
        audio,
        rawSha256: await fileSha256(rawAudioPath),
        assetSha256: await fileSha256(encodedAudioPath),
        deckSha256: await fileSha256(privateDeckPath),
      };
    });
    if (
      (await fileSha256(rawAudioPath)) !== prepared.rawSha256 ||
      (await fileSha256(encodedAudioPath)) !== prepared.assetSha256 ||
      (await fileSha256(privateDeckPath)) !== prepared.deckSha256
    )
      throw new Error(
        'Prepared period asset changed; preserve originals and review, do not regenerate',
      );
    const audio = prepared.audio;
    if (
      (await readFile(targetFile, 'utf8')) !== raw ||
      (await Promise.all(weeklyFiles.map((file) => readFile(file, 'utf8')))).some(
        (text, index) => text !== sourceSnapshots[index],
      )
    )
      throw new Error(
        'Report or evidence changed during generation; private assets retained, nothing published',
      );
    if (!options.publish) {
      console.log(
        JSON.stringify({
          status: 'needs_review',
          audioPath: encodedAudioPath,
          rawAudioPath,
          deckPath: privateDeckPath,
          technical: audio,
          notebookId,
          audioArtifactId: artifact.id,
          deckArtifactId: deckArtifact.id,
          uploaded: false,
          reportUnchanged: true,
        }),
      );
      completed = true;
      return;
    }
    await assertRadarPublicationAllowed();
    await mkdir(AUDIO_DIR, { recursive: true });
    await mkdir(DECK_DIR, { recursive: true });
    await copyFile(encodedAudioPath, audioPath);
    await copyFile(privateDeckPath, deckPath);
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
      if ((await readFile(targetFile, 'utf8')) !== raw)
        throw new Error('Report changed during upload; not overwritten');
      await writeFile(targetFile, updated, 'utf8');
      console.log('Updated monthly frontmatter with audioUrl and deckUrl.');
    }

    console.log(
      `Generated monthly assets; storage: ${publishedAudioUrl.startsWith('https://') && publishedDeckUrl.startsWith('https://') ? 'remote uploaded/reused' : 'local only, upload pending'}; audio technical checks passed. Editorial/audio/deck acceptance is still separate: ${publishedAudioUrl} and ${publishedDeckUrl}. Original retained at ${rawAudioPath}`,
    );
    completed = true;
  } finally {
    if (!completed && !options.keepNotebook) {
      console.warn(`Keeping failed monthly assets notebook for traceability: ${notebookId}`);
    }

    if (!options.keepNotebook)
      console.log(
        `Notebook ${notebookId} retained for exact-ID recovery; use explicit cleanup after delivery.`,
      );
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
