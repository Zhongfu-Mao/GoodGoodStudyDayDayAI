import { copyFile, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseFrontmatter } from '../lib/frontmatter.mjs';
import { buildInfographicBrief } from '../lib/radar-infographic-brief.mjs';
import { optimizeWebpImage } from '../lib/image-compression.mjs';
import { compressSpeechMp3 } from '../lib/audio-compression.mjs';
import {
  newCandidateDirectory,
  prepareCandidate,
  checkReview,
  promoteCandidate,
  audioCache,
  inspectAudio,
} from '../lib/radar-review.mjs';

export async function main(argv = process.argv.slice(2)) {
  const [command, ...args] = argv,
    options = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--replace') options.replace = true;
    else if (args[i] === '--save-review') options['save-review'] = true;
    else if (args[i].startsWith('--') && args[i + 1]) options[args[i].slice(2)] = args[++i];
    else throw new Error(`Unknown/incomplete argument: ${args[i]}`);
  }
  if (command === 'prepare') {
    if (!options.file || !options.asset)
      throw new Error('prepare requires --file REPORT --asset FILE [--kind infographic|audio]');
    const kind = options.kind ?? 'infographic',
      file = path.resolve(options.file);
    if (kind === 'audio' && !options.raw)
      throw new Error('Audio import requires --raw ORIGINAL for conversion-duration verification');
    const meta = parseFrontmatter(await readFile(file, 'utf8')),
      brief = buildInfographicBrief(meta, meta.body);
    const directory = await newCandidateDirectory(path.basename(file, '.md'), kind, options.root);
    const rawPath = path.join(directory, `raw${path.extname(options.raw ?? options.asset)}`);
    const assetPath = path.join(directory, kind === 'audio' ? 'asset.mp3' : 'asset.webp');
    await copyFile(options.raw ?? options.asset, rawPath);
    await copyFile(options.asset, assetPath);
    if (kind === 'infographic') await optimizeWebpImage(assetPath);
    else await compressSpeechMp3(assetPath);
    const technical = kind === 'audio' ? await inspectAudio(rawPath, assetPath) : null;
    return prepareCandidate({
      directory,
      reportFile: file,
      brief,
      rawPath,
      assetPath,
      kind,
      backend: options.backend ?? 'imported',
      technical,
      provenance: {
        artifactId: options['artifact-id'] ?? null,
        notebookId: options['notebook-id'] ?? null,
      },
    });
  }
  if (!options.candidate) throw new Error('Expected --candidate .cache/.../candidate.json');
  if (command === 'check') {
    const { result } = await checkReview(options.candidate, options.file);
    if (result.status !== 'accepted') process.exitCode = 2;
    return result;
  }
  if (command === 'promote')
    return promoteCandidate(options.candidate, {
      reportFile: options.file,
      replace: options.replace,
    });
  if (command === 'audio-cache' || command === 'reuse-audio-review') {
    const cache = await audioCache(options.candidate, {
      root: options.root,
      transcriptFile: options.transcript,
      engine: options.engine,
      review: options['save-review'] === true,
    });
    if (command === 'reuse-audio-review') {
      if (!cache.review)
        throw new Error('No matching accepted audio review for these bytes/content/language/rules');
      await writeFile(
        path.join(path.dirname(options.candidate), 'review.json'),
        `${JSON.stringify(cache.review, null, 2)}\n`,
      );
    }
    return cache;
  }
  throw new Error('Commands: prepare, check, promote, audio-cache, reuse-audio-review');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
    .then((result) => console.log(JSON.stringify(result)))
    .catch((e) => {
      console.error(e.message);
      process.exitCode = 1;
    });
}
