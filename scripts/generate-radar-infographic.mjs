import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { spawn } from 'node:child_process';

const WORKSPACE_ROOT = process.cwd();
const RADAR_DIR = path.join(WORKSPACE_ROOT, 'src/content/radar');
const IMAGE_DIR = path.join(WORKSPACE_ROOT, 'public/images/radar');
const NOTEBOOKLM_BIN = path.join(WORKSPACE_ROOT, '.venv/bin/notebooklm');

function parseArgs(argv) {
  const options = {
    file: null,
    orientation: 'landscape',
    detail: 'detailed',
    style: 'editorial',
    keepNotebook: true,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--file') {
      options.file = argv[index + 1] ?? null;
      index += 1;
      continue;
    }

    if (arg === '--orientation') {
      options.orientation = argv[index + 1] ?? options.orientation;
      index += 1;
      continue;
    }

    if (arg === '--detail') {
      options.detail = argv[index + 1] ?? options.detail;
      index += 1;
      continue;
    }

    if (arg === '--style') {
      options.style = argv[index + 1] ?? options.style;
      index += 1;
      continue;
    }

    if (arg === '--no-keep-notebook') {
      options.keepNotebook = false;
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
  const coverImage = frontmatter.match(/^coverImage:\s*"?(.*?)"?$/m)?.[1]?.trim() ?? null;

  if (!title) {
    throw new Error('Frontmatter title is required.');
  }

  return { title, lang, coverImage };
}

function updateCoverImage(source, coverImage) {
  const normalized = normalizeNewlines(source);
  const frontmatterMatch = normalized.match(/^---\n([\s\S]*?)\n---\n?/);

  if (!frontmatterMatch) {
    throw new Error('Target markdown is missing frontmatter.');
  }

  const frontmatter = frontmatterMatch[1];
  const updatedFrontmatter = frontmatter.match(/^coverImage:/m)
    ? frontmatter.replace(/^coverImage:\s*.*$/m, `coverImage: ${coverImage}`)
    : frontmatter.match(/^lang:\s*.*$/m)
      ? frontmatter.replace(/^lang:\s*.*$/m, `$&\ncoverImage: ${coverImage}`)
      : `${frontmatter}\ncoverImage: ${coverImage}`;

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

function inferInfographicPrompt(title, lang) {
  if (lang === 'ja') {
    return `${title} をもとに、今日の主線をひと目で掴める情報図解を作ってください。3〜5 個の重要シグナルを束ね、見出し・短い注釈・因果のつながりが分かる構成にしてください。`;
  }

  return `请基于《${title}》生成一张适合博客文章顶部展示的中文信息图。不要做成海报，而是做成“主线 + 3 到 5 个关键分支”的结构：一眼能看懂今天的核心主题、关键趋势之间的关系，以及对从业者的启发。文字要短，层次要清楚，适合横向阅读。`;
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
  const slug = path.basename(targetFile, '.md');
  const imagePath = path.join(IMAGE_DIR, `${slug}-infographic.png`);
  const publicImageUrl = `/images/radar/${slug}-infographic.png`;
  const notebookTitle = `${meta.title} · Infographic`;

  await mkdir(IMAGE_DIR, { recursive: true });

  console.log(`Creating notebook for ${path.relative(WORKSPACE_ROOT, targetFile)}...`);
  const created = parseJsonOutput((await runNotebooklm(['create', notebookTitle, '--json'])).stdout);
  const notebookId = pickNotebookId(created);

  if (!notebookId) {
    throw new Error('Failed to determine notebook ID from create response.');
  }

  try {
    console.log(`Adding markdown source to notebook ${notebookId}...`);
    await runNotebooklm(['source', 'add', '--notebook', notebookId, targetFile, '--json']);

    const sourcesPayload = parseJsonOutput((await runNotebooklm(['source', 'list', '--notebook', notebookId, '--json'])).stdout);
    const source = pickLatestItem(sourcesPayload?.sources);

    if (!source?.id) {
      throw new Error('Failed to determine source ID after upload.');
    }

    console.log(`Waiting for source ${source.id} to be ready...`);
    await runNotebooklm(['source', 'wait', '--notebook', notebookId, source.id, '--timeout', '300', '--json']);

    console.log(`Generating infographic (${options.style}, ${options.orientation})...`);
    await runNotebooklm([
      'generate',
      'infographic',
      '--notebook',
      notebookId,
      '--orientation',
      options.orientation,
      '--detail',
      options.detail,
      '--style',
      options.style,
      '--language',
      meta.lang === 'ja' ? 'ja' : 'zh_Hans',
      inferInfographicPrompt(meta.title, meta.lang),
      '--json',
    ]);

    const artifactsPayload = parseJsonOutput((await runNotebooklm(['artifact', 'list', '--notebook', notebookId, '--type', 'infographic', '--json'])).stdout);
    const artifact = pickLatestItem(artifactsPayload?.artifacts);

    if (!artifact?.id) {
      throw new Error('Failed to determine infographic artifact ID after generation.');
    }

    console.log(`Waiting for infographic artifact ${artifact.id}...`);
    await runNotebooklm(['artifact', 'wait', '--notebook', notebookId, artifact.id, '--timeout', '600', '--json']);

    console.log(`Downloading infographic to ${path.relative(WORKSPACE_ROOT, imagePath)}...`);
    await runNotebooklm(['download', 'infographic', '--notebook', notebookId, '--force', imagePath, '--json']);

    if (meta.coverImage !== publicImageUrl) {
      const updated = updateCoverImage(raw, publicImageUrl);
      await writeFile(targetFile, updated, 'utf8');
      console.log(`Updated frontmatter coverImage -> ${publicImageUrl}`);
    } else {
      console.log(`coverImage already set to ${publicImageUrl}`);
    }

    console.log(`Done. Infographic ready at ${publicImageUrl}`);
  } finally {
    await maybeDeleteNotebook(notebookId, options.keepNotebook);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
