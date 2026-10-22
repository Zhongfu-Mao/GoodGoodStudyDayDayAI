import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { parseFrontmatter, updateFrontmatterValue } from '../../scripts/lib/frontmatter.mjs';
import {
  buildInfographicBrief,
  createVisualCopyTemplate,
  migrateVisualCopy,
  validateVisualCopy,
} from '../../scripts/lib/radar-infographic-brief.mjs';
import {
  newCandidateDirectory,
  prepareCandidate,
  loadCandidate,
  evaluateReview,
  checkReview,
  promoteCandidate,
  audioCache,
  inspectAudio,
  AUDIO_REVIEW_RULES_VERSION,
} from '../../scripts/lib/radar-review.mjs';

let root: string, file: string, raw: string;
let generatedPublic: string[];
beforeEach(async () => {
  root = await mkdtemp(path.join(os.tmpdir(), 'radar-review-'));
  file = path.join(root, path.basename(root) + '.md');
  raw = await readFile('src/content/radar/daily-ai-radar-2026-10-16.md', 'utf8');
  await writeFile(file, raw);
  generatedPublic = [];
});
afterEach(async () => {
  await rm(root, { recursive: true, force: true });
  for (const p of generatedPublic) await rm(p, { force: true });
});
const briefFor = (source: string) => {
  const m = parseFrontmatter(source);
  return buildInfographicBrief(m, m.body);
};

async function packet(kind = 'infographic', bytes = 'audio-bytes') {
  const brief = briefFor(raw);
  const directory = await newCandidateDirectory(path.basename(file, '.md'), kind, root);
  const rawPath = path.join(directory, kind === 'audio' ? 'raw.m4a' : 'raw.png');
  const assetPath = path.join(directory, kind === 'audio' ? 'asset.mp3' : 'asset.webp');
  if (kind === 'infographic') {
    const image = sharp({ create: { width: 600, height: 400, channels: 3, background: '#fff' } });
    await image.png().toFile(rawPath);
    await image.webp().toFile(assetPath);
  } else {
    await writeFile(rawPath, bytes);
    await writeFile(assetPath, bytes);
  }
  const output = await prepareCandidate({
    directory,
    reportFile: file,
    brief,
    rawPath,
    assetPath,
    kind,
    backend: 'offline-fixture',
    provenance: { artifactId: 'fixture-no-network' },
    technical:
      kind === 'audio'
        ? { fullDecode: 'passed', tailDecode: 'passed', duration: 100, size: 100, durationDelta: 0 }
        : null,
  });
  return {
    directory,
    rawPath,
    assetPath,
    ...output,
    candidate: JSON.parse(await readFile(output.candidateFile, 'utf8')),
    review: JSON.parse(await readFile(output.reviewFile, 'utf8')),
  };
}
function accept(p: Awaited<ReturnType<typeof packet>>) {
  const r = p.review;
  r.reviewer = 'offline-test-not-a-visual-verdict';
  if (p.candidate.kind === 'audio')
    r.semantic = { status: 'pass', evidence: 'fixture critical attribution checked' };
  else {
    for (const i of r.coverage) {
      i.status = 'pass';
      i.visibleText = `Fixture observation for item${i.id}`;
    }
    r.viewedSections = p.candidate.sections;
    r.legibility = { status: 'pass', evidence: 'fixture native crops inspected' };
    r.facts = { status: 'pass', evidence: 'fixture displayed numbers and conditions checked' };
  }
  return r;
}

describe('editorial fingerprint and safe v1 migration', () => {
  it.each(['audioUrl', 'audioDuration', 'audioSize', 'coverImage', 'draft'])(
    'does not invalidate copy when only %s changes',
    (field) => {
      expect(briefFor(updateFrontmatterValue(raw, field, 'synthetic-value')).sourceSha256).toBe(
        briefFor(raw).sourceSha256,
      );
    },
  );
  it.each(['title', 'date', 'lang', 'cadence'])(
    'invalidates copy when editorial %s changes',
    (field) => {
      const value = field === 'cadence' ? 'weekly' : field === 'lang' ? 'ja' : 'synthetic-change';
      expect(briefFor(updateFrontmatterValue(raw, field, value)).sourceSha256).not.toBe(
        briefFor(raw).sourceSha256,
      );
    },
  );
  it('invalidates body edits but ignores inline visual presentation blocks', () => {
    expect(briefFor(raw + '\nA new editorial caveat.').sourceSha256).not.toBe(
      briefFor(raw).sourceSha256,
    );
    expect(
      briefFor(
        raw + '\n<!-- radar-visual:test -->\nimage caption only\n<!-- /radar-visual:test -->\n',
      ).sourceSha256,
    ).toBe(briefFor(raw).sourceSha256);
  });
  it('migrates only a matching cached v1 brief with unchanged full facts', () => {
    const b = briefFor(raw),
      c = createVisualCopyTemplate(b);
    for (const s of c.sections)
      for (const i of s.items) {
        i.label = 'Short label';
        i.text = 'Source conditions apply';
        i.visual = 'Mechanism illustration';
      }
    const old = { ...c, version: 1, sourceSha256: 'legacy-metadata-hash' };
    expect(() => validateVisualCopy(b, old)).toThrow('version 2');
    const previous = { ...b, version: 1, sourceSha256: old.sourceSha256 };
    expect(migrateVisualCopy(b, old, previous).sourceSha256).toBe(b.sourceSha256);
    expect(() => migrateVisualCopy(b, old, { ...previous, title: 'Changed' })).toThrow(
      'unchanged facts',
    );
    expect(() => migrateVisualCopy(b, old, { ...previous, sourceSha256: 'wrong' })).toThrow();
  });
});

describe('immutable image candidates and layered attestations', () => {
  it('retains raw bytes, six native crops, exact identity and pending rather than automatic acceptance', async () => {
    const p = await packet();
    expect(p.candidate.items).toHaveLength(12);
    expect(p.candidate.files.raw.sha256).not.toBe(p.candidate.files.asset.sha256);
    const regions = JSON.parse(await readFile(path.join(p.directory, 'regions.json'), 'utf8'));
    expect(regions.crops).toHaveLength(6);
    expect((await sharp(path.join(p.directory, regions.crops[0])).metadata()).width).toBe(200);
    expect((await checkReview(p.candidateFile)).result.status).toBe('needs_review');
    const q = await packet();
    expect(p.candidate.id).not.toBe(q.candidate.id);
  });
  it('replays the six-of-twelve omission without counting panels as items', async () => {
    const p = await packet(),
      r = accept(p);
    const observed = new Set(['01', '02', '03', '11', '05', '12']);
    r.coverage = r.coverage.filter((i: { id: string }) => observed.has(i.id));
    expect(evaluateReview(p.candidate, r).status).toBe('rejected');
  });
  it('treats uncertain glyphs as needing review, not permission to regenerate', async () => {
    const p = await packet(),
      r = accept(p);
    r.legibility = { status: 'uncertain', evidence: '18 or10 needs original-region inspection' };
    expect(evaluateReview(p.candidate, r)).toMatchObject({
      status: 'needs_review',
      regenerationAuthorized: false,
    });
    r.legibility.status = 'pass';
    r.facts = { status: 'fail', evidence: 'S3 negation reversed' };
    expect(evaluateReview(p.candidate, r).status).toBe('rejected');
  });
  it('rejects wrong versions/languages, tampered bytes and stale report content', async () => {
    const p = await packet(),
      q = await packet();
    expect(() => evaluateReview(p.candidate, accept(q))).toThrow('identity/hash');
    const r = accept(p);
    r.language = 'ja';
    expect(() => evaluateReview(p.candidate, r)).toThrow();
    await writeFile(file, updateFrontmatterValue(raw, 'lang', 'ja'));
    await expect(loadCandidate(p.candidateFile)).rejects.toThrow('different report');
    await writeFile(file, raw);
    await writeFile(p.assetPath, 'tampered');
    await expect(loadCandidate(p.candidateFile)).rejects.toThrow('bytes changed');
  });
  it('promotes only accepted bytes with explicit replacement, preserves draft and supports idempotence', async () => {
    const p = await packet(),
      publisher = vi.fn(async ({ publicUrl }) => publicUrl);
    const destination = path.resolve(
      `public/images/radar/${path.basename(file, '.md')}-infographic.webp`,
    );
    generatedPublic.push(destination);
    await expect(promoteCandidate(p.candidateFile, { publisher, replace: true })).rejects.toThrow(
      'needs_review',
    );
    await writeFile(p.reviewFile, JSON.stringify(accept(p)));
    await expect(promoteCandidate(p.candidateFile, { publisher })).rejects.toThrow('--replace');
    await writeFile(file, updateFrontmatterValue(raw, 'draft', true));
    await promoteCandidate(p.candidateFile, { publisher, replace: true });
    expect(parseFrontmatter(await readFile(file, 'utf8')).raw).toContain('draft: true');
    expect(await readFile(destination)).toEqual(await readFile(p.assetPath));
    await promoteCandidate(p.candidateFile, { publisher });
    expect(publisher).toHaveBeenCalledTimes(1);
    await expect(readFile(path.join(p.directory, 'raw.png'))).resolves.toBeDefined();
  });
  it('does not create review packets under public or src', async () => {
    await expect(newCandidateDirectory('test', 'audio', 'public')).rejects.toThrow('outside');
  });
  it('preserves concurrent report edits made while media is being uploaded', async () => {
    const p = await packet();
    await writeFile(p.reviewFile, JSON.stringify(accept(p)));
    generatedPublic.push(
      path.resolve(`public/images/radar/${path.basename(file, '.md')}-infographic.webp`),
    );
    const changed = raw + '\nConcurrent editorial change.\n';
    const publisher = async ({ publicUrl }: { publicUrl: string }) => {
      await writeFile(file, changed);
      return publicUrl;
    };
    await expect(promoteCandidate(p.candidateFile, { publisher, replace: true })).rejects.toThrow(
      'Report changed during upload',
    );
    expect(await readFile(file, 'utf8')).toBe(changed);
  });
});

describe('proportionate audio review and content-addressed reuse', () => {
  it('allows targeted source/context review without requiring a transcript, while retaining integrity gates', async () => {
    const p = await packet('audio'),
      r = accept(p);
    r.semantic = {
      status: 'pass',
      evidence: 'Targeted source/context check; no original listening claimed',
    };
    expect(
      (await audioCache(p.candidateFile, { root })).transcriptAvailable,
    ).toBe(false);
    expect(evaluateReview(p.candidate, r).status).toBe('accepted');
    for (const field of ['fullDecode', 'tailDecode']) {
      const technical = { ...p.candidate.technical, [field]: 'failed' };
      expect(evaluateReview({ ...p.candidate, technical }, r).status).toBe(
        'needs_review',
      );
    }
    expect(
      evaluateReview(
        {
          ...p.candidate,
          technical: { ...p.candidate.technical, durationDelta: 2 },
        },
        r,
      ).status,
    ).toBe('needs_review');
  });
  it('records a nonmaterial reassessment with context rather than requiring native listening for every prior suspicion', async () => {
    const p = await packet('audio'),
      r = accept(p);
    r.issues = [
      {
        classification: 'factual_error',
        basis: 'asr_only',
        resolution: 'not_material',
        proposition: 'Earlier suspected Pass4 definition',
      },
    ];
    expect(evaluateReview(p.candidate, r).status).toBe('needs_review');
    r.issues[0].resolutionEvidence =
      'Prior sentence correctly defines four successful attempts; later multi-step example is explanatory, not a replacement definition';
    expect(evaluateReview(p.candidate, r).status).toBe('accepted');
    r.issues[0].resolution = 'unconfirmed';
    expect(evaluateReview(p.candidate, r)).toMatchObject({
      status: 'needs_review',
      regenerationAuthorized: false,
    });
  });
  it('invalidates old semantic verdicts without losing reusable transcripts or regenerating bytes', async () => {
    const p = await packet('audio'),
      r = accept(p);
    const transcript = path.join(root, 'existing-transcript.txt');
    await writeFile(transcript, 'Existing cached words');
    await audioCache(p.candidateFile, {
      root,
      transcriptFile: transcript,
      engine: 'fixture',
    });
    const old = { ...r, audioRulesVersion: AUDIO_REVIEW_RULES_VERSION - 1 };
    expect(evaluateReview(p.candidate, old).status).toBe('needs_review');
    const base = path.dirname(
      (await audioCache(p.candidateFile, { root })).transcriptPath!,
    );
    await writeFile(
      path.join(base, `${p.candidate.sourceSha256}-review-v1.json`),
      JSON.stringify(old),
    );
    const cached = await audioCache(p.candidateFile, { root });
    expect(cached.transcriptAvailable).toBe(true);
    expect(cached.review).toBeNull();
    expect(await readFile(p.assetPath, 'utf8')).toBe('audio-bytes');
  });
  it('keeps ASR uncertainty and exaggeration nonblocking, but does not certify material errors from ASR alone', async () => {
    const p = await packet('audio'),
      r = accept(p);
    r.issues = [
      { classification: 'transcription_uncertain', proposition: 'SO/Sol;31.0% count punctuation' },
      { classification: 'rhetorical_exaggeration', proposition: 'strong wording' },
    ];
    expect(evaluateReview(p.candidate, r).status).toBe('accepted');
    r.issues = [
      {
        classification: 'factual_error',
        basis: 'asr_only',
        resolution: 'confirmed_error',
        proposition: 'Sol/Luna swapped',
      },
    ];
    expect(evaluateReview(p.candidate, r).status).toBe('needs_review');
    Object.assign(r.issues[0], {
      basis: 'native_audio_model',
      timeRange: [420, 450],
      sourceEvidence: 'Frozen original attribution',
    });
    expect(evaluateReview(p.candidate, r)).toMatchObject({
      status: 'rejected',
      regenerationAuthorized: false,
    });
    Object.assign(r.issues[0], {
      resolution: 'user_accepted',
      resolutionEvidence: 'Explicit user acceptance recorded',
    });
    expect(evaluateReview(p.candidate, r).status).toBe('accepted');
  });
  it('reuses transcripts and accepted reviews only for exact bytes/language/content/engine', async () => {
    const p = await packet('audio'),
      q = await packet('audio'),
      different = await packet('audio', 'different-bytes');
    const transcript = path.join(root, 'asr.txt');
    await writeFile(transcript, 'Nonempty transcript');
    expect((await audioCache(p.candidateFile, { root })).transcriptAvailable).toBe(false);
    await writeFile(p.reviewFile, JSON.stringify(accept(p)));
    await audioCache(p.candidateFile, {
      root,
      transcriptFile: transcript,
      engine: 'test-asr-v1/default',
      review: true,
    });
    const cached = await audioCache(q.candidateFile, { root, engine: 'test-asr-v1/default' });
    expect(cached.transcriptAvailable).toBe(true);
    expect(cached.review.candidateId).toBe(q.candidate.id);
    expect(
      (await audioCache(q.candidateFile, { root, engine: 'test-asr-v2' })).transcriptAvailable,
    ).toBe(false);
    expect((await audioCache(different.candidateFile, { root })).transcriptAvailable).toBe(false);
    // A new content fingerprint must not reuse an old semantic verdict.
    const originalRaw = raw;
    raw += '\nNew editorial caveat.';
    await writeFile(file, raw);
    const changed = await packet('audio');
    const freshContext = await audioCache(changed.candidateFile, { root });
    expect(freshContext.transcriptAvailable).toBe(true);
    expect(freshContext.review).toBeNull();
    raw = originalRaw;
    await writeFile(file, raw);
    await writeFile(transcript, '  ');
    await expect(
      audioCache(p.candidateFile, { root, transcriptFile: transcript, engine: 'test' }),
    ).rejects.toThrow('Empty');
  });
  it('caches full/tail decode by bytes but rechecks conversion duration on every original', async () => {
    const rawPath = path.join(root, 'raw'),
      asset = path.join(root, 'asset');
    await writeFile(rawPath, 'raw');
    await writeFile(asset, 'encoded');
    let duration = 100;
    const runner = vi.fn(async (cmd: string, args: string[]) => ({
      stdout:
        cmd === 'ffprobe'
          ? JSON.stringify({
              format: { duration: args.at(-1) === rawPath ? duration : 100, size: 100 },
              streams: [{ codec_name: 'mp3', channels: 1, sample_rate: '44100' }],
            })
          : '',
    }));
    await inspectAudio(rawPath, asset, { root, runCommand: runner });
    await inspectAudio(rawPath, asset, { root, runCommand: runner });
    expect(runner.mock.calls.filter(([cmd]) => cmd === 'ffmpeg')).toHaveLength(2);
    duration = 110;
    await expect(inspectAudio(rawPath, asset, { root, runCommand: runner })).rejects.toThrow(
      'duration changed',
    );
  });
});
