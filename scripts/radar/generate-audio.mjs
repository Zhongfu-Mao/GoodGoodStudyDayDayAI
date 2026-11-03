import { copyFile, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';
import { parseFrontmatter } from '../lib/frontmatter.mjs';
import {
  newCandidateDirectory,
  prepareCandidate,
  inspectAudio,
  audioCache,
  loadCandidate,
  recoverCandidate,
} from '../lib/radar-review.mjs';
import { buildInfographicBrief } from '../lib/radar-infographic-brief.mjs';
import { openGenerationJob, generationInputKey } from '../lib/radar-generation-job.mjs';
import { compressSpeechMp3 } from '../lib/audio-compression.mjs';
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

function parseArgs(argv) {
  const options = {
    file: null,
    lang: null,
    format: 'deep-dive',
    length: 'default',
    keepNotebook: true,
    sourceMode: 'markdown',
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--job-file') {
      const file = argv[++index];
      if (!file || file.startsWith('--'))
        throw new Error('--job-file requires a private JSON path');
      options.jobFile = file;
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
    if (arg === '--submit-only') options.submitOnly = true;
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
    ...(brief.highlights?.length ? [brief.highlights.join('\n')] : []),
    ...brief.sections.map((section) =>
      [
        `## ${section.title}`,
        ...section.items.map(
          (item) =>
            `### ${item.title}\n\n${item.context ? item.context + '\n\n' : ''}${item.facts}`,
        ),
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
    return `${title} の十分な本文を根拠に、日本語の二人の対話で具体的な仕組み、比較条件、事例と実務的な意味を説明してください。長さと話題数は資料に合わせ、固定時間を埋めないでください。同じ論点は一度だけ扱い、資料にない逸話、数値、動機や因果説明を加えないでください。固有名詞・日付・数値は忠実に扱い、実験条件、予測と実績、過去の事例を区別してください。末尾で自然に締め、見出しの羅列や相づちで引き延ばさないでください。`;
  }

  return `请以《${title}》充分的正文为依据，用中文双主持人对谈讲清具体机制、比较条件、案例与实务意义。长度与话题数服从实际素材，不填固定分钟数。每一论点只讲一次，不新增来源未说明的故事、数值、动机或因果解释。专名、日期和数字忠于材料，分清实验条件、预测与实绩、旧案例与当日新消息。内容讲完自然收束，不以重复标题、附和或泛泛提醒拖长节目。`;
}

export async function main(argv = process.argv.slice(2)) {
  const options = parseArgs(argv);
  const targetFile = await resolveTargetFile(options.file, options.lang);
  const raw = await readFile(targetFile, 'utf8');
  const meta = parseFrontmatter(raw);
  const slug = path.basename(targetFile, '.md');
  const notebookTitle = `${meta.title} · Audio`;
  // Validate all sections and facts before creating any remote notebook.
  const briefMemo = options.sourceMode === 'brief' ? buildBriefMemo(meta.body, meta) : null;

  const brief = buildInfographicBrief(meta, meta.body);
  const job = await openGenerationJob(
    options.jobFile ?? `.cache/radar-generation/${slug}-audio.json`,
    generationInputKey([
      brief.sourceSha256,
      options.sourceMode,
      options.format,
      options.length,
      inferAudioPrompt(meta.title, meta.lang),
    ]),
    {
      run: runNotebooklm,
      inputSnapshot: { source: briefMemo ?? raw, prompt: inferAudioPrompt(meta.title, meta.lang) },
    },
  );
  const existingCandidate = await job.completed('candidate');
  if (existingCandidate) {
    await loadCandidate(existingCandidate.candidateFile, targetFile);
    console.log(
      JSON.stringify({
        status: 'needs_review',
        ...existingCandidate,
        reused: true,
        publicAssetsUnchanged: true,
      }),
    );
    return existingCandidate;
  }
  const directory = await job.once('directory', () => newCandidateDirectory(slug, 'audio'));
  const audioPath = path.join(directory, 'asset.mp3');

  console.log(`Creating notebook for ${path.relative(WORKSPACE_ROOT, targetFile)}...`);
  const notebookId = await job.once('notebook', () => createNotebook(notebookTitle));
  let completed = false;

  try {
    console.log(`Using frozen ${options.sourceMode} source for notebook ${notebookId}...`);
    const source = await job.once('source:report', async () => {
      const snapshot = path.join(
        directory,
        options.sourceMode === 'brief' ? 'source-brief.txt' : 'source.md',
      );
      await writeFile(snapshot, briefMemo ?? raw);
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

    console.log(`Generating audio (${options.format}, ${options.length})...`);
    const submitted = await job.once('generate:audio', async () =>
      generationArtifact(
        (
          await runNotebooklm([
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
          ])
        ).stdout,
      ),
    );

    if (options.submitOnly) {
      completed = true;
      const receipt = { status: 'submitted', notebookId, sourceId: source.id, artifactId: submitted.id, jobFile: job.file };
      console.log(JSON.stringify(receipt));
      return receipt;
    }

    const artifact = await waitForArtifact(notebookId, submitted, {
      timeout: 1800,
    });
    console.log(`Audio artifact ${artifact.id} ready.`);

    const rawAudioPath = path.join(directory, 'raw.m4a');

    const packet = await job.once('candidate', async () => {
      const recovered = await recoverCandidate(directory, targetFile);
      if (recovered) return recovered;
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
      await copyFile(rawAudioPath, audioPath);
      console.log('Compressing audio to MP3 mono 64k...');
      await compressSpeechMp3(audioPath);
      const technical = await inspectAudio(rawAudioPath, audioPath);
      return prepareCandidate({
        directory,
        reportFile: targetFile,
        brief,
        rawPath: rawAudioPath,
        assetPath: audioPath,
        kind: 'audio',
        backend: 'notebooklm',
        provenance: { notebookId, sourceId: source.id, artifactId: artifact.id },
        technical,
      });
    });
    await loadCandidate(packet.candidateFile, targetFile);
    const cache = await audioCache(packet.candidateFile);
    console.log(
      JSON.stringify({ status: 'needs_review', ...packet, cache, publicAssetsUnchanged: true }),
    );
    completed = true;
  } finally {
    if (!completed && !options.keepNotebook) {
      console.warn(`Keeping failed audio notebook for traceability: ${notebookId}`);
    }

    // A resumable job must retain its exact notebook until explicit cleanup.
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
