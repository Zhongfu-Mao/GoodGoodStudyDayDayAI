export function normalizeNewlines(text) {
  return text.replace(/\r\n/g, '\n');
}

export function stripMarkdown(value) {
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

export function extractSectionBlock(markdown, headings) {
  for (const heading of headings) {
    const escapedHeading = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`^##\\s+${escapedHeading}\\s*\\n([\\s\\S]*?)(?=^##\\s+|\\Z)`, 'm');
    const match = markdown.match(pattern)?.[1]?.trim();

    if (match) {
      return match;
    }
  }

  return '';
}

export function extractTopSignals(markdown, limit = 4) {
  const matches = [...markdown.matchAll(/^###\s+(.+)$/gm)];
  return matches.slice(0, limit).map((match) => match[1].trim());
}

export function extractShortParagraphs(markdown, limit = 3, options = {}) {
  const skipPattern = options.skipPattern ?? /^(来源|Source|出典|リンク|链接|发布|日付)：/;

  const chunks = stripMarkdown(markdown)
    .split(/\n\s*\n/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .filter((chunk) => !skipPattern.test(chunk));

  return chunks.slice(0, limit).map((chunk) => chunk.replace(/\s+/g, ' '));
}
