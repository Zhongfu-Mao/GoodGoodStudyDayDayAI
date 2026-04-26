import type { CollectionEntry } from 'astro:content';
import type { CollectionName, Locale } from './site';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

type BlogEntry = CollectionEntry<CollectionName>;

export const difficultyLabels: Record<Locale, Record<Difficulty, string>> = {
  zh: {
    beginner: '入门',
    intermediate: '进阶',
    advanced: '硬核',
  },
  ja: {
    beginner: '入門',
    intermediate: '中級',
    advanced: '深掘り',
  },
};

export const readingTimeText = {
  zh: (minutes: number) => `约 ${minutes} 分钟`,
  ja: (minutes: number) => `約 ${minutes} 分`,
} as const;

export function getEntryDifficulty(entry: BlogEntry): Difficulty {
  if (entry.data.difficulty) {
    return entry.data.difficulty;
  }

  const haystack = [
    entry.id,
    entry.data.title,
    entry.data.description ?? '',
    entry.data.tags.join(' '),
  ]
    .join(' ')
    .toLowerCase();

  if (entry.data.category === 'engineering') {
    return 'advanced';
  }

  if (entry.data.category === 'foundations') {
    return 'beginner';
  }

  if (entry.data.category === 'radar') {
    return 'intermediate';
  }

  if (
    /getting-started|getting started|fundamentals|101|ai-fluency|using-chatgpt|personalizing|prompting-fundamentals|students|teachers|educators|foundations|入门|入門|基礎|基礎|学生|教育者/.test(
      haystack,
    )
  ) {
    return 'beginner';
  }

  if (
    /advanced|api|rag|evals?|production|bedrock|vertex|mcp|subagents?|claude-code|codex|software-engineers|builder-bootcamp|engineering|安全|治理/.test(
      haystack,
    )
  ) {
    return 'advanced';
  }

  return 'intermediate';
}

export function estimateReadingMinutes(body: string | undefined, locale: Locale) {
  if (!body) {
    return 1;
  }

  const cleaned = cleanMarkdownText(body);
  const cjkCount = (cleaned.match(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/gu) ?? []).length;
  const wordCount = (cleaned.match(/[A-Za-z0-9]+(?:[-'][A-Za-z0-9]+)*/g) ?? []).length;
  const divisor = locale === 'ja' ? 520 : 460;
  const estimated = Math.ceil((cjkCount + wordCount * 1.5) / divisor);

  return Math.max(1, estimated);
}

export function getPlainSummary(entry: BlogEntry, locale: Locale) {
  const directSummary = entry.data.plainSummary ?? entry.data.description;

  if (directSummary) {
    return trimSummary(directSummary, locale);
  }

  if (!entry.body) {
    return '';
  }

  const representativeLead = getRepresentativeLead(entry.body, locale);
  if (representativeLead) {
    return trimSummary(representativeLead, locale);
  }

  const narrative = getNarrativeParagraphs(entry.body)[0] ?? '';
  return trimSummary(narrative, locale);
}

function cleanMarkdownText(text: string) {
  return text
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[`*_>#]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function getRepresentativeLead(body: string, locale: Locale) {
  const italicBlocks = [...body.matchAll(/(?:^|\n)\*([^*\n][^\n]{34,})\*/g)].map((match) => cleanMarkdownText(match[1]));

  for (const block of italicBlocks) {
    const firstSentenceBreak = Math.max(block.indexOf('。'), block.indexOf('.'));
    const sourceLead =
      firstSentenceBreak >= 0 &&
      (block.startsWith('代表图来自') || block.startsWith('代表画像は'));
    const cleaned = sourceLead ? block.slice(firstSentenceBreak + 1).trim() : block;

    if (cleaned.length >= (locale === 'ja' ? 28 : 24)) {
      return cleaned;
    }
  }

  return '';
}

function getNarrativeParagraphs(body: string) {
  return body
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .filter((block) => !block.startsWith('#'))
    .filter((block) => !block.startsWith('!['))
    .filter((block) => !block.startsWith('---'))
    .filter((block) => !block.startsWith('*'))
    .filter((block) => !/^([-*]\s)/.test(block))
    .filter((block) => !block.startsWith('**来源：**'))
    .filter((block) => !block.startsWith('**出典：**'))
    .map(cleanMarkdownText)
    .filter((block) => block.length >= 36);
}

function trimSummary(text: string, locale: Locale) {
  const maxLength = locale === 'ja' ? 118 : 108;

  if (text.length <= maxLength) {
    return text.trim();
  }

  const sliced = text.slice(0, maxLength);
  const sentenceBoundary = Math.max(
    sliced.lastIndexOf('。'),
    sliced.lastIndexOf('！'),
    sliced.lastIndexOf('？'),
    sliced.lastIndexOf('.'),
  );

  if (sentenceBoundary >= Math.floor(maxLength * 0.56)) {
    return sliced.slice(0, sentenceBoundary + 1).trim();
  }

  const phraseBoundary = Math.max(sliced.lastIndexOf('；'), sliced.lastIndexOf('，'), sliced.lastIndexOf('、'));

  if (phraseBoundary >= Math.floor(maxLength * 0.62)) {
    return sliced.slice(0, phraseBoundary + 1).trim();
  }

  return `${sliced.trim()}…`;
}
