// Local evidence and human/primary-review attestations, NOT an OCR or truth oracle.
import { createHash } from 'node:crypto';
import { copyFile, mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { parseFrontmatter, updateFrontmatterValue } from './frontmatter.mjs';
import { buildInfographicBrief } from './radar-infographic-brief.mjs';
import { publishRadarAsset } from './radar-assets.mjs';

const run = promisify(execFile);
const REVIEW_VERSION = 1;
// Audio policy versions do not invalidate raw files, transcripts or image reviews.
export const AUDIO_REVIEW_RULES_VERSION = 2;
export const REVIEW_ROOT = path.resolve('.cache/radar-review');
const json = async (file) => JSON.parse(await readFile(file, 'utf8'));
const save = (file, value) => writeFile(file, `${JSON.stringify(value, null, 2)}\n`);
export const fileSha256 = async (file) =>
  createHash('sha256')
    .update(await readFile(file))
    .digest('hex');

export function assertPrivateDirectory(directory) {
  const resolved = path.resolve(directory);
  for (const name of ['src', 'public']) {
    const relative = path.relative(path.resolve(name), resolved);
    if (
      !relative ||
      (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative))
    ) {
      throw new Error('Review output must be outside public/ and src/.');
    }
  }
  return resolved;
}

export async function newCandidateDirectory(slug, kind, root = REVIEW_ROOT) {
  if (!['infographic', 'audio'].includes(kind) || !/^[\w.-]+$/.test(slug))
    throw new Error('Invalid candidate identity');
  const directory = assertPrivateDirectory(path.join(root, 'candidates'));
  await mkdir(directory, { recursive: true });
  return mkdtemp(path.join(directory, `${slug}-${kind}-`));
}

/**
 * @typedef {{duration:number, size:number, durationDelta:number, fullDecode:string, tailDecode:string}} AudioTechnical
 * @param {{directory:string, reportFile:string, brief:ReturnType<typeof buildInfographicBrief>, rawPath:string, assetPath:string, kind:string, backend:string, provenance?:object, technical?:AudioTechnical|null}} options
 */
export async function prepareCandidate({
  directory,
  reportFile,
  brief,
  rawPath,
  assetPath,
  kind,
  backend,
  provenance = {},
  technical = null,
}) {
  assertPrivateDirectory(directory);
  const id = path.basename(directory);
  const files = {};
  for (const [key, file] of Object.entries({ raw: rawPath, asset: assetPath })) {
    const relative = path.relative(directory, path.resolve(file));
    if (!relative || relative.startsWith('..') || path.isAbsolute(relative))
      throw new Error('Candidate files must be inside their immutable directory');
    files[key] = { path: relative, sha256: await fileSha256(file) };
  }
  let number = 0;
  const items = brief.sections.flatMap((section) =>
    section.items.map((item) => ({
      id: String(++number).padStart(2, '0'),
      section: section.key,
      title: item.title,
      facts: item.facts,
    })),
  );
  const candidate = {
    version: REVIEW_VERSION,
    id,
    attemptId: id,
    createdAt: new Date().toISOString(),
    reportFile: path.resolve(reportFile),
    slug: path.basename(reportFile, '.md'),
    language: brief.language,
    date: brief.date,
    cadence: brief.cadence,
    sourceSha256: brief.sourceSha256,
    kind,
    backend,
    provenance,
    files,
    technical,
    sections: brief.sections.map((s) => s.key),
    items,
  };
  const review = {
    version: REVIEW_VERSION,
    candidateId: id,
    assetSha256: files.asset.sha256,
    sourceSha256: brief.sourceSha256,
    language: brief.language,
    reviewer: '',
    ...(kind === 'infographic'
      ? {
          coverage: items.map((i) => ({
            id: i.id,
            section: i.section,
            status: 'pending',
            visibleText: '',
          })),
          viewedSections: [],
          legibility: { status: 'pending', evidence: '' },
          facts: { status: 'pending', evidence: '' },
        }
      : {
          audioRulesVersion: AUDIO_REVIEW_RULES_VERSION,
          semantic: { status: 'pending', evidence: '' },
          issues: [],
        }),
  };
  await save(path.join(directory, 'candidate.json'), candidate);
  await save(path.join(directory, 'review.json'), review);
  await save(path.join(directory, 'expected.json'), { items, sections: candidate.sections });
  if (kind === 'infographic') await makeCrops(directory, assetPath, candidate.sections.length);
  return {
    candidateFile: path.join(directory, 'candidate.json'),
    reviewFile: path.join(directory, 'review.json'),
  };
}

async function makeCrops(directory, assetPath, count) {
  // Already installed with Astro; declared directly so this helper does not rely on hoisting.
  const { default: sharp } = await import('sharp');
  const { width, height } = await sharp(assetPath).metadata();
  const columns = Math.min(3, count),
    rows = Math.ceil(count / columns);
  const crops = [];
  for (let i = 0; i < count; i++) {
    const x = i % columns,
      y = Math.floor(i / columns);
    const left = Math.floor((x * width) / columns),
      top = Math.floor((y * height) / rows);
    const file = `region-${i + 1}.png`;
    await sharp(assetPath)
      .extract({
        left,
        top,
        width: Math.floor(((x + 1) * width) / columns) - left,
        height: Math.floor(((y + 1) * height) / rows) - top,
      })
      .png()
      .toFile(path.join(directory, file));
    crops.push(file);
  }
  await save(path.join(directory, 'regions.json'), {
    automaticGridIsApproximate: true,
    crops,
    instruction:
      'Inspect full image AND native-size crops; crops are geometry only, not proof of section coverage. Use a targeted crop when a boundary or glyph is unclear. Read actual pixels before comparing expected facts.',
  });
}

export async function loadCandidate(candidateFile, reportFile) {
  const candidate = await json(candidateFile),
    directory = path.dirname(path.resolve(candidateFile));
  assertPrivateDirectory(directory);
  if (candidate.version !== REVIEW_VERSION || candidate.id !== path.basename(directory))
    throw new Error('Wrong candidate directory/version');
  for (const item of Object.values(candidate.files)) {
    const file = path.resolve(directory, item.path);
    if (!file.startsWith(`${directory}${path.sep}`) || (await fileSha256(file)) !== item.sha256)
      throw new Error('Candidate bytes changed');
  }
  const target = path.resolve(reportFile ?? candidate.reportFile),
    raw = await readFile(target, 'utf8');
  const meta = parseFrontmatter(raw),
    brief = buildInfographicBrief(meta, meta.body);
  if (
    path.basename(target, '.md') !== candidate.slug ||
    brief.language !== candidate.language ||
    brief.sourceSha256 !== candidate.sourceSha256
  ) {
    throw new Error('Candidate belongs to a different report/language/content');
  }
  return { candidate, directory, target, raw, meta };
}

export function evaluateReview(candidate, review) {
  const pending = [],
    failed = [];
  if (
    review.version !== REVIEW_VERSION ||
    review.candidateId !== candidate.id ||
    review.assetSha256 !== candidate.files.asset.sha256 ||
    review.language !== candidate.language ||
    review.sourceSha256 !== candidate.sourceSha256
  )
    throw new Error('Review identity/hash mismatch');
  if (!review.reviewer?.trim()) pending.push('Named primary reviewer required');
  const gate = (value, label) => {
    if (value?.status === 'fail') failed.push(label);
    else if (value?.status !== 'pass' || !value.evidence?.trim()) pending.push(label);
  };
  if (candidate.kind === 'infographic') {
    const coverage = review.coverage ?? [];
    if (coverage.length !== candidate.items.length) failed.push('Missing item coverage');
    for (const [index, item] of candidate.items.entries()) {
      const seen = coverage[index];
      if (seen?.id !== item.id || seen?.section !== item.section)
        failed.push(`Wrong/missing item ${item.id}`);
      else
        gate(
          { status: seen.status, evidence: seen.visibleText },
          `Item ${item.id}: literal visible text`,
        );
    }
    if (JSON.stringify(review.viewedSections) !== JSON.stringify(candidate.sections))
      pending.push('Inspect all native-size section regions');
    gate(review.legibility, 'Legibility');
    gate(review.facts, 'Critical facts/conditions/diagram direction');
  } else {
    if (review.audioRulesVersion !== AUDIO_REVIEW_RULES_VERSION)
      pending.push('Reassess existing audio under current editorial rules; do not regenerate');
    if (
      candidate.technical?.fullDecode !== 'passed' ||
      candidate.technical?.tailDecode !== 'passed' ||
      !Number.isFinite(candidate.technical?.durationDelta) ||
      candidate.technical.durationDelta < 0 ||
      candidate.technical.durationDelta > 1 ||
      !(candidate.technical.duration > 0) ||
      !(candidate.technical.size > 0)
    )
      pending.push('Audio decode/duration verification');
    gate(review.semantic, 'Proportionate semantic review');
    for (const issue of review.issues ?? []) {
      if (
        !['factual_error', 'transcription_uncertain', 'rhetorical_exaggeration'].includes(
          issue.classification,
        )
      )
        throw new Error('Unknown audio issue classification');
      if (issue.classification !== 'factual_error') continue;
      if (['resolved', 'user_accepted', 'not_material'].includes(issue.resolution)) {
        if (!issue.resolutionEvidence?.trim())
          pending.push('Record source/context evidence or user decision for nonblocking factual issue');
        continue;
      }
      const [start, end] = issue.timeRange ?? [];
      const corroborated =
        ['native_audio_model', 'human_listening'].includes(issue.basis) &&
        Number.isFinite(start) &&
        Number.isFinite(end) &&
        start >= 0 &&
        end > start &&
        issue.sourceEvidence?.trim() &&
        issue.proposition?.trim();
      if (issue.resolution === 'confirmed_error' && corroborated) failed.push(issue.proposition);
      else
        pending.push(
          'Unconfirmed material factual claim: inspect original audio, do not regenerate from ASR alone',
        );
    }
  }
  return {
    status: failed.length ? 'rejected' : pending.length ? 'needs_review' : 'accepted',
    failed,
    pending,
    regenerationAuthorized: false,
  };
}

export async function checkReview(candidateFile, reportFile) {
  const data = await loadCandidate(candidateFile, reportFile);
  const review = await json(path.join(data.directory, 'review.json'));
  return { ...data, review, result: evaluateReview(data.candidate, review) };
}

export async function promoteCandidate(
  candidateFile,
  { reportFile, replace = false, publisher = publishRadarAsset } = {},
) {
  const {
    candidate: c,
    directory,
    target,
    raw,
    meta,
    review,
    result,
  } = await checkReview(candidateFile, reportFile);
  if (result.status !== 'accepted')
    throw new Error(
      `Candidate ${result.status}: ${[...result.failed, ...result.pending].join('; ')}`,
    );
  const field = c.kind === 'audio' ? 'audioUrl' : 'coverImage';
  let previous = null;
  try {
    previous = await json(path.join(directory, 'promotion.json'));
  } catch (e) {
    if (e.code !== 'ENOENT') throw e;
  }
  if (previous?.assetSha256 === c.files.asset.sha256 && meta[field] === previous.url)
    return previous;
  const asset = path.join(directory, c.files.asset.path),
    extension = path.extname(asset);
  const publicUrl =
    c.kind === 'audio'
      ? `/audio/radar/${c.slug}.mp3`
      : `/images/radar/${c.slug}-infographic${extension}`;
  const destination = path.resolve(`public${publicUrl}`);
  let existing = false;
  try {
    existing = (await fileSha256(destination)) !== c.files.asset.sha256;
  } catch (e) {
    if (e.code !== 'ENOENT') throw e;
  }
  if (!replace && (meta[field] || existing))
    throw new Error('Existing media preserved; explicit --replace required');
  await mkdir(path.dirname(destination), { recursive: true });
  // Do not promote or upload a mutable candidate or a changed report after the review.
  await loadCandidate(candidateFile, target);
  if ((await readFile(target, 'utf8')) !== raw) throw new Error('Report changed during promotion');
  await copyFile(asset, destination);
  const url = await publisher({ localPath: destination, publicUrl, label: `reviewed ${c.kind}` });
  if ((await readFile(target, 'utf8')) !== raw)
    throw new Error(
      'Report changed during upload; uploaded asset retained, report not overwritten',
    );
  let updated = updateFrontmatterValue(raw, field, url, { anchor: 'lang', position: 'after' });
  if (c.kind === 'audio') {
    updated = updateFrontmatterValue(updated, 'audioDuration', c.technical.duration, {
      anchor: 'audioUrl',
      position: 'after',
    });
    updated = updateFrontmatterValue(updated, 'audioSize', c.technical.size, {
      anchor: 'audioDuration',
      position: 'after',
    });
  }
  // Promotion never publishes a draft, stages Git or changes generation scheduling.
  await writeFile(target, updated);
  const record = {
    candidateId: c.id,
    assetSha256: c.files.asset.sha256,
    reviewer: review.reviewer,
    url,
    promotedAt: new Date().toISOString(),
  };
  await save(path.join(directory, 'promotion.json'), record);
  return record;
}

const audioKey = (c) => `${c.files.asset.sha256}-${c.language}`;
/**
 * @param {string} candidateFile
 * @param {{root?:string, transcriptFile?:string, engine?:string, review?:boolean}} options
 */
export async function audioCache(
  candidateFile,
  { root = REVIEW_ROOT, transcriptFile, engine, review = false } = {},
) {
  const { candidate: c, directory } = await loadCandidate(candidateFile);
  if (c.kind !== 'audio') throw new Error('Audio candidate required');
  const base = path.join(assertPrivateDirectory(root), 'audio-cache', audioKey(c));
  await mkdir(base, { recursive: true });
  const transcriptPath = path.join(base, 'transcript.json');
  if (transcriptFile) {
    if (!engine?.trim()) throw new Error('Transcript engine/version/config required');
    const text = await readFile(transcriptFile, 'utf8');
    if (!text.trim()) throw new Error('Empty transcript is not a result');
    await save(transcriptPath, {
      version: REVIEW_VERSION,
      audioSha256: c.files.asset.sha256,
      language: c.language,
      engine,
      text,
    });
  }
  const reviewPath = path.join(base, `${c.sourceSha256}-review-v${AUDIO_REVIEW_RULES_VERSION}.json`);
  if (review) {
    const r = await json(path.join(directory, 'review.json'));
    if (evaluateReview(c, r).status !== 'accepted')
      throw new Error('Only accepted reviews may be cached');
    await save(reviewPath, r);
  }
  let transcript = null,
    cachedReview = null;
  try {
    transcript = await json(transcriptPath);
  } catch (e) {
    if (e.code !== 'ENOENT') throw e;
  }
  try {
    cachedReview = await json(reviewPath);
  } catch (e) {
    if (e.code !== 'ENOENT') throw e;
  }
  if (
    transcript &&
    (transcript.audioSha256 !== c.files.asset.sha256 ||
      transcript.language !== c.language ||
      (engine && transcript.engine !== engine))
  )
    transcript = null;
  // Rebind only identity when bytes, language, content and rules version are unchanged.
  if (cachedReview) cachedReview = { ...cachedReview, candidateId: c.id };
  if (cachedReview && evaluateReview(c, cachedReview).status !== 'accepted') cachedReview = null;
  return {
    transcriptPath: transcript ? transcriptPath : null,
    review: cachedReview,
    // Cache absence does not prescribe ASR or block proportionate review.
    transcriptAvailable: Boolean(transcript),
  };
}

/**
 * @param {string} rawPath
 * @param {string} assetPath
 * @param {{root?:string, runCommand?:(command:string, args:string[])=>Promise<{stdout:string}>}} options
 */
export async function inspectAudio(
  rawPath,
  assetPath,
  { root = REVIEW_ROOT, runCommand = run } = {},
) {
  const probe = async (file) =>
    JSON.parse(
      (
        await runCommand('ffprobe', [
          '-v',
          'error',
          '-show_entries',
          'format=duration,size:stream=codec_name,channels,sample_rate',
          '-of',
          'json',
          file,
        ])
      ).stdout,
    );
  const original = await probe(rawPath),
    encoded = await probe(assetPath);
  const durationDelta = Math.abs(
    Number(original.format.duration) - Number(encoded.format.duration),
  );
  if (!(Number(encoded.format.duration) > 0) || !(durationDelta <= 1))
    throw new Error('Audio duration changed');
  const stream = encoded.streams?.[0];
  if (
    stream?.codec_name !== 'mp3' ||
    Number(stream.channels) !== 1 ||
    Number(stream.sample_rate) !== 44100
  )
    throw new Error('Expected mono44100Hz MP3');
  const sha256 = await fileSha256(assetPath),
    directory = path.join(assertPrivateDirectory(root), 'technical-cache');
  await mkdir(directory, { recursive: true });
  const cachedFile = path.join(directory, `${sha256}.json`);
  let cached;
  try {
    cached = await json(cachedFile);
  } catch (e) {
    if (e.code !== 'ENOENT') throw e;
  }
  if (
    cached?.version !== REVIEW_VERSION ||
    cached?.sha256 !== sha256 ||
    cached?.fullDecode !== 'passed' ||
    cached?.tailDecode !== 'passed'
  ) {
    await runCommand('ffmpeg', ['-v', 'error', '-i', assetPath, '-f', 'null', '-']);
    await runCommand('ffmpeg', [
      '-v',
      'error',
      '-sseof',
      '-30',
      '-i',
      assetPath,
      '-f',
      'null',
      '-',
    ]);
    await save(cachedFile, {
      version: REVIEW_VERSION,
      sha256,
      fullDecode: 'passed',
      tailDecode: 'passed',
    });
  }
  return {
    duration: Math.round(Number(encoded.format.duration)),
    size: Number(encoded.format.size),
    durationDelta,
    fullDecode: 'passed',
    tailDecode: 'passed',
  };
}
