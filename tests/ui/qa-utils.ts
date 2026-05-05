import * as fs from 'node:fs';
import * as path from 'node:path';

import { resolveAppBasePath } from '../../scripts/lib/base-path.mjs';

export const repoRoot = process.cwd();
export const contentRoot = path.join(repoRoot, 'src', 'content');
export const publicRoot = path.join(repoRoot, 'public');
export const distRoot = path.join(repoRoot, 'dist');
const appBasePath = resolveAppBasePath();

export const contentCollections = ['radar', 'academy', 'engineering', 'foundations'] as const;

export type ContentCollection = (typeof contentCollections)[number];
export type Locale = 'zh' | 'ja';

export type Frontmatter = {
  title?: string;
  date?: string;
  category?: string;
  cadence?: string;
  lang?: Locale;
  draft?: boolean;
  includeInRadarArchive?: boolean;
  coverImage?: string;
  audioUrl?: string;
  deckUrl?: string;
};

export type ContentEntryMeta = {
  filePath: string;
  collection: ContentCollection;
  relativePath: string;
  baseSlug: string;
  locale: Locale;
  frontmatter: Frontmatter;
};

export function toPosixPath(value: string) {
  return value.split(path.sep).join('/');
}

function walkFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) {
    return [];
  }

  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return walkFiles(fullPath);
      }
      return entry.isFile() ? [fullPath] : [];
    })
    .sort();
}

function parseScalar(rawValue: string) {
  const value = rawValue.trim();
  if (value === 'true') return true;
  if (value === 'false') return false;

  const quoted =
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"));

  if (quoted) {
    return value.slice(1, -1).replace(/\\"/g, '"').replace(/\\'/g, "'");
  }

  return value;
}

export function parseFrontmatter(markdown: string): Frontmatter {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) {
    return {};
  }

  return match[1].split(/\r?\n/).reduce<Frontmatter>((frontmatter, rawLine) => {
    const line = rawLine.trim();
    if (!line || line.startsWith('#') || line.startsWith('- ')) {
      return frontmatter;
    }

    const keyMatch = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/);
    if (!keyMatch) {
      return frontmatter;
    }

    const [, key, rawValue] = keyMatch;
    if (
      key === 'title' ||
      key === 'date' ||
      key === 'category' ||
      key === 'cadence' ||
      key === 'lang' ||
      key === 'coverImage' ||
      key === 'audioUrl' ||
      key === 'deckUrl'
    ) {
      frontmatter[key] = String(parseScalar(rawValue)) as never;
    }

    if (key === 'draft' || key === 'includeInRadarArchive') {
      frontmatter[key] = parseScalar(rawValue) === true;
    }

    return frontmatter;
  }, {});
}

export function collectContentEntries() {
  return contentCollections.flatMap((collection): ContentEntryMeta[] => {
    const collectionRoot = path.join(contentRoot, collection);
    return walkFiles(collectionRoot)
      .filter((filePath) => filePath.endsWith('.md'))
      .map((filePath) => {
        const relativePath = toPosixPath(path.relative(collectionRoot, filePath));
        const slug = relativePath.replace(/\.md$/, '');
        const frontmatter = parseFrontmatter(fs.readFileSync(filePath, 'utf8'));
        const locale: Locale = frontmatter.lang === 'ja' || slug.endsWith('.ja') ? 'ja' : 'zh';

        return {
          filePath,
          collection,
          relativePath,
          baseSlug: slug.replace(/\.ja$/, ''),
          locale,
          frontmatter,
        };
      });
  });
}

export function listDistHtmlPages() {
  return walkFiles(distRoot).filter((filePath) => filePath.endsWith('.html'));
}

export function stripUrlDecorations(value: string) {
  return value.trim().split('#')[0].split('?')[0];
}

export function isExternalUrl(value: string) {
  return /^(?:https?:)?\/\//i.test(value) || /^[a-z][a-z0-9+.-]*:/i.test(value);
}

export function resolvePublicAsset(value: string) {
  const localPath = stripAppBasePath(stripUrlDecorations(value)).replace(/^\/+/, '');
  return path.join(publicRoot, decodeURIComponent(localPath));
}

export function resolveDistAsset(value: string) {
  const localPath = stripAppBasePath(stripUrlDecorations(value)).replace(/^\/+/, '');
  return path.join(distRoot, decodeURIComponent(localPath));
}

export function fileExistsWithContent(filePath: string) {
  try {
    return fs.statSync(filePath).size > 0;
  } catch {
    return false;
  }
}

function stripAppBasePath(value: string) {
  if (!value.startsWith('/') || appBasePath === '/') {
    return value;
  }

  const basePrefix = appBasePath.slice(0, -1);
  if (value === basePrefix || value === appBasePath) {
    return '/';
  }

  return value.startsWith(`${basePrefix}/`) ? value.slice(basePrefix.length) : value;
}
