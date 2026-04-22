import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { spawn } from 'node:child_process';

const WORKSPACE_ROOT = process.cwd();
const RADAR_DIR = path.join(WORKSPACE_ROOT, 'src/content/radar');
const AUDIO_DIR = path.join(WORKSPACE_ROOT, 'public/audio/radar');
const NOTEBOOKLM_BIN = path.join(WORKSPACE_ROOT, '.venv/bin/notebooklm');

function parseArgs(argv) {
  const options = {
    file: null,
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

  if (!title) {
    throw new Error('Frontmatter title is required.');
  }

  return {
    title,
    lang,
    audioUrl,
  };
}

function stripMarkdown(value) {
  return value
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[[^\]]*?\]\([^)]+?\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^>\s?/gm, '')
    .replace(/^[-*+]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/_{1,2}([^_]+)_{1,2}/g, '$1')
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function extractSectionBlock(markdown, heading) {
  const escapedHeading = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`^##\\s+${escapedHeading}\\s*\\n([\\s\\S]*?)(?=^##\\s+|\\Z)`, 'm');
  return markdown.match(pattern)?.[1]?.trim() ?? '';
}

function extractTopSignals(markdown) {
  const matches = [...markdown.matchAll(/^###\s+(.+)$/gm)];
  return matches.slice(0, 4).map((match) => match[1].trim());
}

function extractShortParagraphs(markdown, limit = 3) {
  const chunks = stripMarkdown(markdown)
    .split(/\n\s*\n/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .filter((chunk) => !chunk.startsWith('来源：') && !chunk.startsWith('链接：'));

  return chunks.slice(0, limit).map((chunk) => chunk.replace(/\s+/g, ' '));
}

function buildBriefMemo(markdown, meta) {
  const scopeBlock = extractSectionBlock(markdown, '本期范围');
  const engineeringBlock = extractSectionBlock(markdown, '1. 🛠️ AI Engineering & 架构');
  const modelsBlock = extractSectionBlock(markdown, '2. 🧠 模型前沿 & 算法探索');
  const toolsBlock = extractSectionBlock(markdown, '3. 💻 实战代码 & 工具库');
  const marketBlock = extractSectionBlock(markdown, '4. 📰 行业与商业快讯');
  const mailBlock = extractSectionBlock(markdown, '📬 邮件补遗');
  const signals = extractTopSignals(markdown);

  const memoSections = [
    `标题：${meta.title}`,
    `语言：${meta.lang === 'ja' ? '日本語' : '中文'}`,
    signals.length > 0 ? `关键主题：${signals.join('；')}` : '',
    scopeBlock ? `范围与来源：\n${stripMarkdown(scopeBlock)}` : '',
    engineeringBlock ? `工程与架构：\n${extractShortParagraphs(engineeringBlock).join('\n')}` : '',
    modelsBlock ? `模型与研究：\n${extractShortParagraphs(modelsBlock).join('\n')}` : '',
    toolsBlock ? `工具与实践：\n${extractShortParagraphs(toolsBlock, 2).join('\n')}` : '',
    marketBlock ? `行业与商业：\n${extractShortParagraphs(marketBlock, 2).join('\n')}` : '',
    mailBlock ? `补遗：\n${extractShortParagraphs(mailBlock, 2).join('\n')}` : '',
    meta.lang === 'ja'
      ? '要求：把上面内容整理成适合 5 分钟内听完的简明音频，不展开无关背景。'
      : '要求：把上面内容整理成适合 3-6 分钟内听完的简明音频，只保留最重要主线与信号关系。',
  ].filter(Boolean);

  return `${memoSections.join('\n\n')}\n`;
}

function updateAudioUrl(source, audioUrl) {
  const normalized = normalizeNewlines(source);
  const frontmatterMatch = normalized.match(/^---\n([\s\S]*?)\n---\n?/);

  if (!frontmatterMatch) {
    throw new Error('Target markdown is missing frontmatter.');
  }

  const frontmatter = frontmatterMatch[1];
  const updatedFrontmatter = frontmatter.match(/^audioUrl:/m)
    ? frontmatter.replace(/^audioUrl:\s*.*$/m, `audioUrl: ${audioUrl}`)
    : frontmatter.match(/^draft:\s*.*$/m)
      ? frontmatter.replace(/^draft:\s*.*$/m, `audioUrl: ${audioUrl}\n$&`)
      : `${frontmatter}\naudioUrl: ${audioUrl}`;

  return normalized.replace(frontmatterMatch[0], `---\n${updatedFrontmatter}\n---\n`);
}

async function resolveTargetFile(explicitFile) {
  if (explicitFile) {
    return path.isAbsolute(explicitFile) ? explicitFile : path.join(WORKSPACE_ROOT, explicitFile);
  }

  const files = (await readdir(RADAR_DIR))
    .filter((file) => /^daily-ai-radar-\d{4}-\d{2}-\d{2}\.md$/.test(file))
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

async function maybeDeleteNotebook(notebookId, keepNotebook) {
  if (keepNotebook || !notebookId) {
    return;
  }

  await runNotebooklm(['delete', notebookId]);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const targetFile = await resolveTargetFile(options.file);
  const raw = await readFile(targetFile, 'utf8');
  const meta = parseFrontmatter(raw);
  const body = normalizeNewlines(raw).replace(/^---\n[\s\S]*?\n---\n?/, '');
  const slug = path.basename(targetFile, '.md');
  const audioPath = path.join(AUDIO_DIR, `${slug}.mp3`);
  const publicAudioUrl = `/audio/radar/${slug}.mp3`;
  const notebookTitle = `${meta.title} · Audio`;
  const briefMemoPath = path.join('/tmp', `${slug}.brief.txt`);

  await mkdir(AUDIO_DIR, { recursive: true });

  console.log(`Creating notebook for ${path.relative(WORKSPACE_ROOT, targetFile)}...`);
  const created = parseJsonOutput((await runNotebooklm(['create', notebookTitle, '--json'])).stdout);
  const notebookId = pickNotebookId(created);

  if (!notebookId) {
    throw new Error('Failed to determine notebook ID from create response.');
  }

  try {
    const sourcePath = options.sourceMode === 'brief' ? briefMemoPath : targetFile;

    if (options.sourceMode === 'brief') {
      const briefMemo = buildBriefMemo(body, meta);
      await writeFile(briefMemoPath, briefMemo, 'utf8');
      console.log(`Adding brief memo source to notebook ${notebookId}...`);
    } else {
      console.log(`Adding markdown source to notebook ${notebookId}...`);
    }

    await runNotebooklm(['source', 'add', '--notebook', notebookId, sourcePath, '--json']);

    const sourcesPayload = parseJsonOutput((await runNotebooklm(['source', 'list', '--notebook', notebookId, '--json'])).stdout);
    const source = pickLatestItem(sourcesPayload?.sources);

    if (!source?.id) {
      throw new Error('Failed to determine source ID after upload.');
    }

    console.log(`Waiting for source ${source.id} to be ready...`);
    await runNotebooklm(['source', 'wait', '--notebook', notebookId, source.id, '--timeout', '300', '--json']);

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
      meta.lang === 'ja' ? 'ja' : 'zh_Hans',
      inferAudioPrompt(meta.title, meta.lang),
      '--json',
    ]);

    const artifactsPayload = parseJsonOutput((await runNotebooklm(['artifact', 'list', '--notebook', notebookId, '--type', 'audio', '--json'])).stdout);
    const artifact = pickLatestItem(artifactsPayload?.artifacts);

    if (!artifact?.id) {
      throw new Error('Failed to determine audio artifact ID after generation.');
    }

    console.log(`Waiting for audio artifact ${artifact.id}...`);
    await runNotebooklm(['artifact', 'wait', '--notebook', notebookId, artifact.id, '--timeout', '600', '--json']);

    console.log(`Downloading audio to ${path.relative(WORKSPACE_ROOT, audioPath)}...`);
    await runNotebooklm(['download', 'audio', '--notebook', notebookId, '--force', audioPath, '--json']);

    if (meta.audioUrl !== publicAudioUrl) {
      const updated = updateAudioUrl(raw, publicAudioUrl);
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
