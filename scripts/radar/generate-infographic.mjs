import { copyFile, mkdir, readFile, readdir, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';
import { parseFrontmatter, stripFrontmatter } from '../lib/frontmatter.mjs';
import { formatImageCompressionResult, optimizeWebpImage } from '../lib/image-compression.mjs';
import { assetUrlMatchesPublicAsset } from '../lib/radar-assets.mjs';
import { newCandidateDirectory, prepareCandidate, loadCandidate, recoverCandidate } from '../lib/radar-review.mjs';
import { openGenerationJob, generationInputKey } from '../lib/radar-generation-job.mjs';
import {
  buildInfographicBrief,
  createVisualCopyTemplate,
  renderInfographicPrompt,
  validateVisualCopy,
  migrateVisualCopy,
} from '../lib/radar-infographic-brief.mjs';
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
const IMAGE_DIR = path.join(WORKSPACE_ROOT, 'public/images/radar');

function parseArgs(argv) {
  const options = {
    file: null,
    orientation: 'landscape',
    detail: 'standard',
    style: 'bento-grid',
    keepNotebook: true,
    backend: 'notebooklm',
    model: 'gpt-image-2',
    briefOnly: false,
    visualCopy: null,
    previewDir: null,
    size: '1536x1024',
    quality: 'medium',
    outputFormat: 'webp',
    allMissing: false,
    overwrite: false,
    migrateVisualCopy: false,
  };

  const withValue = new Set([
    '--file',
    '--job-file',
    '--orientation',
    '--detail',
    '--style',
    '--backend',
    '--model',
    '--visual-copy',
    '--preview-dir',

    '--size',
    '--quality',
    '--output-format',
  ]);

  const keyMap = {
    '--file': 'file',
    '--job-file': 'jobFile',
    '--orientation': 'orientation',
    '--detail': 'detail',
    '--style': 'style',
    '--backend': 'backend',
    '--model': 'model',
    '--visual-copy': 'visualCopy',
    '--preview-dir': 'previewDir',

    '--size': 'size',
    '--quality': 'quality',
    '--output-format': 'outputFormat',
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

    if (withValue.has(arg)) {
      const key = keyMap[arg];
      options[key] = argv[index + 1] ?? options[key];
      index += 1;
      continue;
    }

    if (arg === '--brief-only') {
      options.briefOnly = true;
      continue;
    }

    if (arg === '--migrate-visual-copy') {
      options.migrateVisualCopy = true;
      continue;
    }

    if (arg === '--brief-model' || arg === '--brief-mode') {
      throw new Error(
        'LLM brief refinement was replaced by a complete shared fact brief; remove --brief-model/--brief-mode.',
      );
    }

    if (arg === '--all-missing') {
      options.allMissing = true;
      continue;
    }

    if (arg === '--overwrite') {
      options.overwrite = true;
      continue;
    }

    if (arg === '--no-keep-notebook') {
      options.keepNotebook = false;
    }
  }

  return options;
}

function slugFromPath(filePath) {
  return path.basename(filePath, '.md');
}

async function callOpenAIJson({ url, apiKey, payload }) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenAI request failed (${response.status}): ${text}`);
  }

  return response.json();
}

function resolveOpenAIBaseUrl() {
  return process.env.OPENAI_BASE_URL?.replace(/\/$/, '') ?? 'https://api.openai.com';
}

async function generateWithOpenAI(brief, visualCopy, targetFile, imagePath, options) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is required for the OpenAI infographic backend.');
  }

  const prompt = renderInfographicPrompt(brief, { backend: 'imagegen', visualCopy });
  const baseUrl = resolveOpenAIBaseUrl();

  const payload = {
    model: options.model,
    prompt,
    size: options.size,
    quality: options.quality,
    output_format: options.outputFormat,
    background: 'opaque',
  };

  console.log(
    `Generating infographic with ${options.model} for ${path.relative(WORKSPACE_ROOT, targetFile)}...`,
  );
  const json = await callOpenAIJson({
    url: `${baseUrl}/v1/images/generations`,
    apiKey,
    payload,
  });
  const base64Image = json.data?.[0]?.b64_json;

  if (!base64Image) {
    throw new Error(`OpenAI image response did not contain b64_json: ${JSON.stringify(json)}`);
  }

  await writeFile(imagePath, Buffer.from(base64Image, 'base64'));
}

export { buildInfographicBrief } from '../lib/radar-infographic-brief.mjs';

export function inferInfographicPrompt(brief, visualCopy) {
  return renderInfographicPrompt(brief, { visualCopy });
}

async function generateWithNotebooklm(meta, prompt, raw, targetFile, directory, options, job) {
  const notebookTitle = `${meta.title} · Infographic`;

  console.log(`Creating notebook for ${path.relative(WORKSPACE_ROOT, targetFile)}...`);
  const notebookId = await job.once('notebook', () => createNotebook(notebookTitle));
  let completed = false;

  try {
    console.log(`Adding markdown source to notebook ${notebookId}...`);
    const source = await job.once('source:report', async () => {
      const snapshot = path.join(directory, 'source.md');
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

    console.log(`Generating infographic (${options.style}, ${options.orientation})...`);
    const submitted = await job.once('generate:infographic', async () => {
      const promptPath = path.join(directory, 'generation-prompt.txt');
      await writeFile(promptPath, prompt);
      return generationArtifact(
        (
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
            languageArg(meta.lang),
            '--source',
            source.id,
            '--prompt-file',
            promptPath,
            '--json',
          ])
        ).stdout,
      );
    });

    const artifact = await waitForArtifact(notebookId, submitted, {
      timeout: 600,
    });

    completed = true;
    return { notebookId, sourceId: source.id, artifactId: artifact.id };
  } finally {
    if (!completed && !options.keepNotebook) {
      console.warn(`Keeping failed infographic notebook for traceability: ${notebookId}`);
    }

    if (!options.keepNotebook)
      console.log(
        `Notebook ${notebookId} retained for exact-ID recovery; use explicit cleanup after delivery.`,
      );
  }
}

async function listTargetFiles(options) {
  if (options.file) {
    const resolved = path.isAbsolute(options.file)
      ? options.file
      : path.join(WORKSPACE_ROOT, options.file);
    return [resolved];
  }

  const files = (await readdir(RADAR_DIR))
    .filter((file) => /^daily-ai-radar-\d{4}-\d{2}-\d{2}\.md$/.test(file))
    .sort();

  if (!options.allMissing) {
    const latest = files.at(-1);

    if (!latest) {
      throw new Error('No daily radar markdown file found.');
    }

    return [path.join(RADAR_DIR, latest)];
  }

  const targets = [];

  for (const file of files) {
    const fullPath = path.join(RADAR_DIR, file);
    const source = await readFile(fullPath, 'utf8');
    const meta = parseFrontmatter(source);

    if (!options.overwrite && !options.previewDir && meta.coverImage) {
      continue;
    }

    targets.push(fullPath);
  }

  return targets;
}

async function processFile(targetFile, options) {
  const raw = await readFile(targetFile, 'utf8');
  const meta = parseFrontmatter(raw);
  const body = stripFrontmatter(raw);
  const slug = slugFromPath(targetFile);
  const imageExtension = options.outputFormat === 'jpeg' ? 'jpg' : options.outputFormat;
  const imageDir = options.previewDir ? path.resolve(options.previewDir) : IMAGE_DIR;
  if (options.previewDir) {
    for (const protectedDir of ['public', 'src']) {
      const relative = path.relative(path.join(WORKSPACE_ROOT, protectedDir), imageDir);
      if (
        !relative ||
        (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative))
      ) {
        throw new Error('--preview-dir must be outside public/ and src/.');
      }
    }
  }
  const publicImageUrl = `/images/radar/${slug}-infographic.${imageExtension}`;

  if (
    !options.briefOnly &&
    !options.previewDir &&
    !options.overwrite &&
    assetUrlMatchesPublicAsset(meta.coverImage, publicImageUrl)
  ) {
    console.log(`skip ${path.basename(targetFile)} (coverImage already set)`);
    return { status: 'skipped', targetFile, publicImageUrl };
  }

  const brief = buildInfographicBrief(meta, body);
  const briefDir = path.join(WORKSPACE_ROOT, '.cache/radar-infographic', slug);
  await mkdir(briefDir, { recursive: true });
  const briefFile = path.join(briefDir, 'brief.json');
  const promptPath = path.join(briefDir, 'notebooklm-prompt.txt');
  const copyPath = options.visualCopy
    ? path.resolve(options.visualCopy)
    : path.join(briefDir, 'visual-copy.json');
  let visualCopy;
  try {
    visualCopy = JSON.parse(await readFile(copyPath, 'utf8'));
  } catch (error) {
    if (error.code !== 'ENOENT' || options.visualCopy) throw error;
    const templatePath = path.join(briefDir, 'visual-copy.template.json');
    await writeFile(briefFile, `${JSON.stringify(brief, null, 2)}\n`);
    await writeFile(templatePath, `${JSON.stringify(createVisualCopyTemplate(brief), null, 2)}\n`);
    // Do not leave legacy prompts looking current when the new copy plan is absent.
    await rm(promptPath, { force: true });
    await rm(path.join(briefDir, 'imagegen-prompt.txt'), { force: true });
    const message = `Fill the short label/text for every item in ${templatePath}; save as ${copyPath} or pass --visual-copy FILE. Facts remain in brief.json.`;
    if (!options.briefOnly) throw new Error(message);
    console.log(message);
    return { status: 'needs_visual_copy', targetFile, briefDir, templatePath };
  }
  if (options.migrateVisualCopy) {
    if (!options.briefOnly)
      throw new Error(
        '--migrate-visual-copy requires --brief-only; no generation during migration.',
      );
    const previousBrief = JSON.parse(await readFile(briefFile, 'utf8'));
    const migrated = migrateVisualCopy(brief, visualCopy, previousBrief);
    await copyFile(copyPath, `${copyPath}.legacy-v1.bak`);
    await writeFile(copyPath, `${JSON.stringify(migrated, null, 2)}\n`);
    visualCopy = migrated;
  }
  validateVisualCopy(brief, visualCopy);
  await writeFile(briefFile, `${JSON.stringify(brief, null, 2)}\n`);
  await writeFile(promptPath, inferInfographicPrompt(brief, visualCopy));
  await writeFile(
    path.join(briefDir, 'imagegen-prompt.txt'),
    renderInfographicPrompt(brief, { backend: 'imagegen', visualCopy }),
  );

  if (options.briefOnly) {
    console.log(
      `Brief ready: ${path.relative(WORKSPACE_ROOT, briefDir)} (${brief.sections.length} sections, ${brief.itemCount} items)`,
    );
    return { status: 'brief', targetFile, briefDir };
  }

  const job =
    options.backend === 'notebooklm'
      ? await openGenerationJob(
          options.jobFile ?? `.cache/radar-generation/${slug}-infographic.json`,
          generationInputKey([
            brief.sourceSha256,
            visualCopy,
            options.style,
            options.detail,
            options.orientation,
            inferInfographicPrompt(brief, visualCopy),
          ]),
          {
            run: runNotebooklm,
            inputSnapshot: {
              source: raw,
              prompt: inferInfographicPrompt(brief, visualCopy),
              visualCopy,
            },
          },
        )
      : null;
  const existingCandidate = await job?.completed('candidate');
  if (existingCandidate) {
    const loaded = await loadCandidate(existingCandidate.candidateFile, targetFile);
    if (options.previewDir) {
      await mkdir(imageDir, { recursive: true });
      await copyFile(
        path.join(loaded.directory, loaded.candidate.files.asset.path),
        path.join(imageDir, `${slug}-infographic.${imageExtension}`),
      );
    }
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
  const directory = job
    ? await job.once('directory', () => newCandidateDirectory(slug, 'infographic'))
    : await newCandidateDirectory(slug, 'infographic');
  let rawPath = path.join(directory, 'raw.download');
  const imagePath = path.join(directory, `asset.${imageExtension}`);
  let provenance;
  if (options.backend === 'openai') {
    provenance = { model: options.model };
  } else if (options.backend === 'notebooklm') {
    provenance = await generateWithNotebooklm(
      meta,
      inferInfographicPrompt(brief, visualCopy),
      raw,
      targetFile,
      directory,
      options,
      job,
    );
  } else {
    throw new Error(`Unsupported backend: ${options.backend}`);
  }

  const prepare = async () => {
    const recovered = await recoverCandidate(directory, targetFile);
    if (recovered) return recovered;
    if (options.backend === 'notebooklm') {
      await runNotebooklm([
        'download',
        'infographic',
        '--artifact',
        provenance.artifactId,
        '--notebook',
        provenance.notebookId,
        '--force',
        rawPath,
        '--json',
      ]);
    } else await generateWithOpenAI(brief, visualCopy, targetFile, rawPath, options);
    const { default: sharp } = await import('sharp');
    const { format } = await sharp(rawPath).metadata();
    const retainedRaw = path.join(directory, `raw.${format === 'jpeg' ? 'jpg' : format}`);
    await rename(rawPath, retainedRaw);
    rawPath = retainedRaw;
    await copyFile(rawPath, imagePath);
    if (imageExtension === 'webp') {
      const compressionResult = await optimizeWebpImage(imagePath);
      console.log(
        `Optimized infographic image: ${formatImageCompressionResult(compressionResult)}`,
      );
    }

    return prepareCandidate({
      directory,
      reportFile: targetFile,
      brief,
      rawPath,
      assetPath: imagePath,
      kind: 'infographic',
      backend: options.backend,
      provenance,
    });
  };
  const packet = job ? await job.once('candidate', prepare) : await prepare();
  await loadCandidate(packet.candidateFile, targetFile);
  if (options.previewDir) {
    await mkdir(imageDir, { recursive: true });
    await copyFile(imagePath, path.join(imageDir, `${slug}-infographic.${imageExtension}`));
  }
  console.log(JSON.stringify({ status: 'needs_review', ...packet, publicAssetsUnchanged: true }));
  return { status: 'needs_review', targetFile, imagePath, briefDir, ...packet };
}

export async function main(argv = process.argv.slice(2)) {
  const options = parseArgs(argv);

  const targets = await listTargetFiles(options);

  if (targets.length === 0) {
    console.log('No matching daily radar files need infographic generation.');
    return;
  }

  const failures = [];

  for (const targetFile of targets) {
    try {
      await processFile(targetFile, options);
    } catch (error) {
      failures.push({
        file: targetFile,
        error: error instanceof Error ? error.message : String(error),
      });
      console.error(`fail ${path.basename(targetFile)} -> ${failures.at(-1)?.error}`);
    }
  }

  if (failures.length > 0) {
    throw new Error(`Failed to generate ${failures.length} infographic(s).`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
