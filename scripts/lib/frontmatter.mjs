import { normalizeNewlines } from './markdown.mjs';

const FRONTMATTER_RE = /^---\n([\s\S]*?)\n---\n?/;

function readScalar(frontmatter, field) {
  const match = frontmatter.match(new RegExp(`^${field}:\\s*"?(.*?)"?$`, 'm'));
  return match?.[1]?.trim() ?? null;
}

function readList(frontmatter, field) {
  const match = frontmatter.match(new RegExp(`^${field}:\\s*\\n((?:\\s*-\\s+.*\\n?)*)`, 'm'));

  if (!match) {
    return [];
  }

  return match[1]
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('- '))
    .map((line) => line.slice(2).trim())
    .filter(Boolean);
}

export function parseFrontmatter(source, { requireTitle = true } = {}) {
  const normalized = normalizeNewlines(source);
  const match = normalized.match(FRONTMATTER_RE);

  if (!match) {
    throw new Error('Target markdown is missing frontmatter.');
  }

  const frontmatter = match[1];
  const title = readScalar(frontmatter, 'title');

  if (requireTitle && !title) {
    throw new Error('Frontmatter title is required.');
  }

  return {
    raw: frontmatter,
    body: normalized.slice(match[0].length),
    title,
    lang: readScalar(frontmatter, 'lang') ?? 'zh',
    cadence: readScalar(frontmatter, 'cadence'),
    audioUrl: readScalar(frontmatter, 'audioUrl'),
    deckUrl: readScalar(frontmatter, 'deckUrl'),
    coverImage: readScalar(frontmatter, 'coverImage'),
    tags: readList(frontmatter, 'tags'),
  };
}

export function updateFrontmatterValue(source, field, value, options = {}) {
  const anchorField = typeof options === 'string' ? options : (options.anchor ?? 'draft');
  const position = typeof options === 'string' ? 'before' : (options.position ?? 'before');
  const normalized = normalizeNewlines(source);
  const frontmatterMatch = normalized.match(FRONTMATTER_RE);

  if (!frontmatterMatch) {
    throw new Error('Target markdown is missing frontmatter.');
  }

  const frontmatter = frontmatterMatch[1];
  const fieldPattern = new RegExp(`^${field}:\\s*.*$`, 'm');
  const anchorPattern = new RegExp(`^${anchorField}:\\s*.*$`, 'm');

  let updatedFrontmatter;

  if (fieldPattern.test(frontmatter)) {
    updatedFrontmatter = frontmatter.replace(fieldPattern, `${field}: ${value}`);
  } else if (anchorPattern.test(frontmatter)) {
    const replacement = position === 'after'
      ? `$&\n${field}: ${value}`
      : `${field}: ${value}\n$&`;
    updatedFrontmatter = frontmatter.replace(anchorPattern, replacement);
  } else {
    updatedFrontmatter = `${frontmatter}\n${field}: ${value}`;
  }

  return normalized.replace(frontmatterMatch[0], `---\n${updatedFrontmatter}\n---\n`);
}

export function stripFrontmatter(source) {
  return normalizeNewlines(source).replace(FRONTMATTER_RE, '');
}
