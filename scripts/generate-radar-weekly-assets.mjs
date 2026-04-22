import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { spawn } from 'node:child_process';

const WORKSPACE_ROOT = process.cwd();
const RADAR_DIR = path.join(WORKSPACE_ROOT, 'src/content/radar');
const AUDIO_DIR = path.join(WORKSPACE_ROOT, 'public/audio/radar');
const DECK_DIR = path.join(WORKSPACE_ROOT, 'public/decks/radar');
const NOTEBOOKLM_BIN = path.join(WORKSPACE_ROOT, '.venv/bin/notebooklm');

function parseArgs(argv) {
  const options = {
    file: null,
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

function normalizeNewlines(text) {
  return text.replace(/\r\n/g, '\n');
}

function parseFrontmatter(source) {
  const normalized = normalizeNewlines(source);
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n?/);

  if (!match) {
    throw new Error('Target markdown is missing frontmatter.');
  }

  const frontmatter = match[1];
  const title = frontmatter.match(/^title:\s*"?(.*?)"?$/m)?.[1]?.trim();
  const lang = frontmatter.match(/^lang:\s*"?(.*?)"?$/m)?.[1]?.trim() ?? 'zh';
  const audioUrl = frontmatter.match(/^audioUrl:\s*"?(.*?)"?$/m)?.[1]?.trim() ?? null;
  const deckUrl = frontmatter.match(/^deckUrl:\s*"?(.*?)"?$/m)?.[1]?.trim() ?? null;

  if (!title) {
    throw new Error('Frontmatter title is required.');
  }

  return { title, lang, audioUrl, deckUrl };
}

function updateFrontmatterValue(source, field, value, anchorField = 'draft') {
  const normalized = normalizeNewlines(source);
  const frontmatterMatch = normalized.match(/^---\n([\s\S]*?)\n---\n?/);

  if (!frontmatterMatch) {
    throw new Error('Target markdown is missing frontmatter.');
  }

  const frontmatter = frontmatterMatch[1];
  const updatedFrontmatter = frontmatter.match(new RegExp(`^${field}:`, 'm'))
    ? frontmatter.replace(new RegExp(`^${field}:\\s*.*$`, 'm'), `${field}: ${value}`)
    : frontmatter.match(new RegExp(`^${anchorField}:\\s*.*$`, 'm'))
      ? frontmatter.replace(new RegExp(`^${anchorField}:\\s*.*$`, 'm'), `${field}: ${value}\n$&`)
      : `${frontmatter}\n${field}: ${value}`;

  return normalized.replace(frontmatterMatch[0], `---\n${updatedFrontmatter}\n---\n`);
}

async function resolveTargetFile(explicitFile) {
  if (explicitFile) {
    return path.isAbsolute(explicitFile) ? explicitFile : path.join(WORKSPACE_ROOT, explicitFile);
  }

  const files = (await readdir(RADAR_DIR))
    .filter((file) => /^weekly-ai-radar-\d{4}-\d{2}-\d{2}-to-\d{4}-\d{2}-\d{2}\.md$/.test(file))
    .sort();

  const latest = files.at(-1);

  if (!latest) {
    throw new Error('No weekly radar markdown file found.');
  }

  return path.join(RADAR_DIR, latest);
}

function parseWeeklyDateRange(filePath) {
  const match = path.basename(filePath).match(/^weekly-ai-radar-(\d{4}-\d{2}-\d{2})-to-(\d{4}-\d{2}-\d{2})(?:\.ja)?\.md$/);

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

function runNotebooklm(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(NOTEBOOKLM_BIN, args, {
      cwd: WORKSPACE_ROOT,
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
        return;
      }

      reject(new Error(stderr.trim() || stdout.trim() || `notebooklm exited with code ${code}`));
    });
  });
}

function parseJsonOutput(stdout) {
  const trimmed = stdout.trim();

  if (!trimmed) {
    return null;
  }

  try {
    return JSON.parse(trimmed);
  } catch {
    const jsonLine = trimmed
      .split('\n')
      .map((line) => line.trim())
      .reverse()
      .find((line) => line.startsWith('{') || line.startsWith('['));

    if (!jsonLine) {
      throw new Error(`Unable to parse JSON output: ${trimmed}`);
    }

    return JSON.parse(jsonLine);
  }
}

function pickNotebookId(payload) {
  return payload?.id ?? payload?.notebook_id ?? payload?.notebook?.id ?? payload?.data?.id ?? null;
}

function pickLatestItem(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }

  return [...items].sort((left, right) => {
    const leftTime = new Date(left.created_at ?? 0).getTime();
    const rightTime = new Date(right.created_at ?? 0).getTime();

    if (leftTime !== rightTime) {
      return rightTime - leftTime;
    }

    return (right.index ?? 0) - (left.index ?? 0);
  })[0];
}

async function addSourceFile(notebookId, sourcePath) {
  await runNotebooklm(['source', 'add', '--notebook', notebookId, sourcePath, '--json']);

  const sourcesPayload = parseJsonOutput((await runNotebooklm(['source', 'list', '--notebook', notebookId, '--json'])).stdout);
  const source = pickLatestItem(sourcesPayload?.sources);

  if (!source?.id) {
    throw new Error(`Failed to determine source ID for ${sourcePath}`);
  }

  await runNotebooklm(['source', 'wait', '--notebook', notebookId, source.id, '--timeout', '300', '--json']);
}

async function maybeDeleteNotebook(notebookId, keepNotebook) {
  if (keepNotebook || !notebookId) {
    return;
  }

  await runNotebooklm(['delete', notebookId]);
}

function inferWeeklyAudioPrompt(title, lang) {
  if (lang === 'ja') {
    return `${title} をもとに、2 人のホストが対話する 15 分前後の週次音声解説を作ってください。今週の主線を先に示し、その後に重要シグナルのつながり、何が変わったのか、来週も追うべき論点を自然に掘り下げてください。`;
  }

  return `请基于《${title}》生成一段约 15 分钟的中文双主持人周报音频。先明确本周最重要的主线，再讲清几个关键趋势之间的关系、这一周真正发生了什么变化、以及下周值得继续跟踪的点。保持自然对谈感，但不要空转。`;
}

function inferWeeklyDeckPrompt(title, lang) {
  if (lang === 'ja') {
    return `${title} の内容を、7 到 10 枚程度の周次回顾 deck にしてください。1 枚目は総括、続いて 3〜4 本の主線、最後に来週の注目点と示唆を入れてください。`;
  }

  return `请基于《${title}》生成一份适合周报回顾的 slide deck。控制在 7 到 10 页：第一页讲本周结论，接着用 3 到 4 页讲主线，再用最后几页总结值得继续跟踪的趋势和对从业者的启发。`;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const targetFile = await resolveTargetFile(options.file);
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
  const created = parseJsonOutput((await runNotebooklm(['create', notebookTitle, '--json'])).stdout);
  const notebookId = pickNotebookId(created);

  if (!notebookId) {
    throw new Error('Failed to determine notebook ID from create response.');
  }

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
      meta.lang === 'ja' ? 'ja' : 'zh_Hans',
      inferWeeklyAudioPrompt(meta.title, meta.lang),
      '--json',
    ]);

    let artifactsPayload = parseJsonOutput((await runNotebooklm(['artifact', 'list', '--notebook', notebookId, '--type', 'audio', '--json'])).stdout);
    const audioArtifact = pickLatestItem(artifactsPayload?.artifacts);

    if (!audioArtifact?.id) {
      throw new Error('Failed to determine weekly audio artifact ID.');
    }

    await runNotebooklm(['artifact', 'wait', '--notebook', notebookId, audioArtifact.id, '--timeout', '900', '--json']);
    await runNotebooklm(['download', 'audio', '--notebook', notebookId, '--force', audioPath, '--json']);

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
      meta.lang === 'ja' ? 'ja' : 'zh_Hans',
      inferWeeklyDeckPrompt(meta.title, meta.lang),
      '--json',
    ]);

    artifactsPayload = parseJsonOutput((await runNotebooklm(['artifact', 'list', '--notebook', notebookId, '--type', 'slide-deck', '--json'])).stdout);
    const deckArtifact = pickLatestItem(artifactsPayload?.artifacts);

    if (!deckArtifact?.id) {
      throw new Error('Failed to determine weekly slide deck artifact ID.');
    }

    await runNotebooklm(['artifact', 'wait', '--notebook', notebookId, deckArtifact.id, '--timeout', '900', '--json']);
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
      console.log(`Updated weekly frontmatter with audioUrl and deckUrl.`);
    }

    console.log(`Done. Weekly assets ready: ${publicAudioUrl} and ${publicDeckUrl}`);
  } finally {
    await maybeDeleteNotebook(notebookId, options.keepNotebook);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
