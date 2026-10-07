import { readRadarDocument } from './radar-media-policy.mjs';

// Match editorial leakage precisely; technical discussions of dedupe/curl remain valid.
const privatePatterns = [
  ['private-mail-link', /https?:\/\/mail\.google\.com\//i],
  ['local-path', /(?:file:\/\/|\/Users\/|\/home\/)[^\s)]+/i],
  [
    'editorial-note',
    /本期(?:采用|採用|入选|入選|检索到)|前两天已经写入|去重备注|去重備註|复核路径|復核路徑|已读区间|來源採集清單|来源采集清单|Newsletter 内引用/,
  ],
  [
    'editorial-placement',
    /(?:这条|這條|这个条目|本条目|这个信号).{0,20}(?:适合放在|适合作为|适合.*栏目)/,
  ],
  ['internal-id', /(?:gmail[_ -]?message[_ -]?id|notebook[_ -]?id|artifact[_ -]?id)\s*[:=]\s*\S+/i],
];

export function inspectRadarEditorial(file, source, policy, taxonomy) {
  const { meta, body } = readRadarDocument(source);
  if (meta.draft === true) return [];
  const date = file.match(/radar-(\d{4}-\d{2}-\d{2})/)?.[1];
  if (!date || date < policy.enforceFrom) return [];
  const findings = [];
  // Scan frontmatter too: descriptions/titles are public even when the body is clean.
  for (const [rule, pattern] of privatePatterns) {
    if (pattern.test(source))
      findings.push({ rule, message: 'public text contains private/editorial material' });
  }
  if (file.includes('/daily-ai-radar-')) {
    const headings = taxonomy.daily[file.endsWith('.ja.md') ? 'ja' : 'zh'];
    const text = body.replace(/```[^\n]*\n[\s\S]*?```/g, '');
    const sections = [...text.matchAll(/^##\s+(.+)$/gm)];
    const counts = headings.map((heading) => {
      const index = sections.findIndex((match) => match[1].trim() === heading);
      if (index < 0) return 0; // Missing/renamed sections are also enforced by radar-schema.
      const section = text.slice(sections[index].index, sections[index + 1]?.index ?? text.length);
      return [...section.matchAll(/^###\s+\S/gm)].length;
    });
    if (counts[4] > policy.trendLeadMaximum) {
      findings.push({
        rule: 'trend-hard-limit',
        message: `trend section has ${counts[4]} entries; maximum ${policy.trendLeadMaximum}`,
      });
    } else if (counts[4] > policy.trendMaximum) {
      findings.push({
        rule: 'trend-lead',
        message: 'expanded trend section requires an explicit lead-topic exception',
      });
    }
    if (
      counts[4] > policy.trendDefaultMaximum &&
      [counts[1], counts[2]].some((n) => n < policy.minimumModelAndToolEntriesWhenTrendExpanded)
    ) {
      findings.push({
        rule: 'section-balance',
        message: `review section allocation (model=${counts[1]}, tools=${counts[2]}, trend=${counts[4]})`,
      });
    }
  }
  return findings
    .filter(({ rule }) => {
      // Only editorial placement/balance may be waived. Privacy and the hard limit cannot.
      if (
        !['editorial-note', 'editorial-placement', 'trend-lead', 'section-balance'].includes(rule)
      )
        return true;
      return !policy.exceptions.some(
        (item) =>
          item.file === file &&
          item.rule === rule &&
          typeof item.reason === 'string' &&
          item.reason.trim().length >= 20,
      );
    })
    .map(({ rule, message }) => `${file}: [${rule}] ${message}`);
}
