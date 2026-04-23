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

  const year = Number(match[1]);
  const month = Number(match[2]);

  return { year, month };
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
  const created = parseJsonOutput((await runNotebooklm(['create', notebookTitle, '--json'])).stdout);
  const notebookId = pickNotebookId(created);

  if (!notebookId) {
    throw new Error('Failed to determine notebook ID from create response.');
  }

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
      meta.lang === 'ja' ? 'ja' : 'zh_Hans',
      inferMonthlyAudioPrompt(meta.title, meta.lang),
      '--json',
    ]);

    let artifactsPayload = parseJsonOutput((await runNotebooklm(['artifact', 'list', '--notebook', notebookId, '--type', 'audio', '--json'])).stdout);
    const audioArtifact = pickLatestItem(artifactsPayload?.artifacts);

    if (!audioArtifact?.id) {
      throw new Error('Failed to determine monthly audio artifact ID.');
    }

    await runNotebooklm(['artifact', 'wait', '--notebook', notebookId, audioArtifact.id, '--timeout', '1200', '--json']);
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
      meta.lang === 'ja' ? 'ja' : 'zh_Hans',
      inferMonthlyDeckPrompt(meta.title, meta.lang),
      '--json',
    ]);

    artifactsPayload = parseJsonOutput((await runNotebooklm(['artifact', 'list', '--notebook', notebookId, '--type', 'slide-deck', '--json'])).stdout);
    const deckArtifact = pickLatestItem(artifactsPayload?.artifacts);

    if (!deckArtifact?.id) {
      throw new Error('Failed to determine monthly slide deck artifact ID.');
    }

    await runNotebooklm(['artifact', 'wait', '--notebook', notebookId, deckArtifact.id, '--timeout', '1200', '--json']);
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
