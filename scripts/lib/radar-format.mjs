import { readRadarDocument } from './radar-media-policy.mjs';
import taxonomy from '../radar/taxonomy.json' with { type: 'json' };

export const V2_FROM = '2026-10-20';
export const TOPICS = taxonomy.dailyV2.topics;
export const CHANNELS = {
  blog: ['博客', 'ブログ'],
  official: ['官方', '公式'],
  paper: ['论文', '論文'],
  github: ['GitHub', 'GitHub'],
  newsletter: ['Newsletter', 'Newsletter'],
  podcast: ['播客', 'ポッドキャスト'],
  x: ['X', 'X'],
};
export const EVIDENCE = {
  official_claim: ['官方宣称', '公式発表'],
  author_test: ['作者实测', '著者の実測'],
  independent: ['独立复现', '独立再現'],
  opinion: ['观点推演', '見解・推論'],
  research: ['作者研究', '著者の研究'],
};
export const topicKey = (title) =>
  Object.keys(TOPICS).find((key) => Object.values(TOPICS[key]).includes(title));
export const isRadarV2 = (source) => {
  try {
    return readRadarDocument(source).meta.radarFormat === 2;
  } catch {
    return false;
  }
};

function field(content, labels) {
  return content.match(new RegExp(`^- (?:${labels.join('|')})：\\s*(.+)$`, 'm'))?.[1]?.trim() ?? '';
}
function enumKey(value, values) {
  return Object.keys(values).find((key) => values[key].includes(value));
}
function validDate(value) {
  const time = Date.parse(`${value}T00:00:00Z`);
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(time) &&
    new Date(time).toISOString().slice(0, 10) === value
  );
}
function sections(body) {
  const headings = [...body.matchAll(/^## (.+)$/gm)];
  return headings.map((h, i) => ({
    title: h[1].trim(),
    content: body.slice(h.index + h[0].length, headings[i + 1]?.index),
  }));
}

// Shared by validation, bilingual comparison, audio and visual briefs. Channel and
// evidence describe the item; neither creates a second editorial section/story.
export function parseRadarV2(source) {
  const { meta, body } = readRadarDocument(source);
  const lang = meta.lang === 'ja' ? 'ja' : 'zh';
  const blocks = sections(
    body.replace(/<!-- radar-visual:[\s\S]*?<!-- \/radar-visual:[^>]*-->/g, ''),
  );
  const items = [];
  for (const block of blocks) {
    const deepRead = ['延伸阅读', '深掘り'].includes(block.title);
    const topic = topicKey(block.title);
    if (!topic && !deepRead) continue;
    const headings = [...block.content.matchAll(/^### (.+)$/gm)];
    for (const [i, h] of headings.entries()) {
      const content = block.content.slice(h.index + h[0].length, headings[i + 1]?.index);
      const channelText = field(content, ['来源渠道', '情報経路']);
      items.push({
        id: content.match(/<a id="radar-([a-z0-9-]+)"><\/a>/)?.[1] ?? '',
        title: h[1].trim(),
        section: block.title,
        deepRead,
        topic: topic ?? topicKey(field(content, ['主题', 'テーマ'])),
        explicitTopic: field(content, ['主题', 'テーマ']),
        source: field(content, ['来源', '出典']),
        channels: channelText
          .split(/\s*[、,]\s*/)
          .filter(Boolean)
          .map((v) => enumKey(v, CHANNELS) ?? v),
        evidence: enumKey(field(content, ['证据性质', 'エビデンス区分']), EVIDENCE),
        published: field(content, ['原始日期', '初出日']),
        observed: field(content, ['观察日期', '確認日']),
        link: field(content, ['链接', 'リンク']),
        facts: content.match(/^- (?:摘要|要約)：[ \t]*([\s\S]*)/m)?.[1]?.trim() ?? '',
      });
    }
  }
  const highlights = blocks.find((b) => ['三条关键变化', '今日の重要な変化'].includes(b.title));
  return { meta, lang, blocks, items, highlights: highlights?.content ?? '' };
}

export function inspectRadarV2(source) {
  const doc = parseRadarV2(source);
  const failures = [];
  const allowed = [
    ...Object.values(TOPICS).map((v) => v[doc.lang]),
    doc.lang === 'ja' ? '深掘り' : '延伸阅读',
  ];
  const highlightTitle = doc.lang === 'ja' ? '今日の重要な変化' : '三条关键变化';
  if (doc.blocks[0]?.title !== highlightTitle) failures.push('begin with the three key changes');
  const leads = [...doc.highlights.matchAll(/^- \[([^\n]+)\]\(#radar-([a-z0-9-]+)\)\s*$/gm)];
  if (leads.length !== 3 || (doc.items.length >= 3 && new Set(leads.map((m) => m[2])).size !== 3))
    failures.push('three linked key changes required (distinct stories when available)');
  for (const block of doc.blocks.slice(1)) {
    if (!allowed.includes(block.title)) failures.push(`unknown topic/section: ${block.title}`);
    if (!/^### /m.test(block.content)) failures.push(`omit empty topic: ${block.title}`);
  }
  if (new Set(doc.blocks.map((b) => b.title)).size !== doc.blocks.length)
    failures.push('duplicate section');
  if (doc.blocks.slice(0, -1).some((b) => ['延伸阅读', '深掘り'].includes(b.title)))
    failures.push('deep reading belongs after recent signals');
  if (!doc.items.length) failures.push('no evidence-backed entries');
  const ids = new Set();
  const links = new Set();
  for (const item of doc.items) {
    if (!item.id || ids.has(item.id))
      failures.push(`missing/duplicate story identity: ${item.title}`);
    ids.add(item.id);
    if (!item.topic) failures.push(`one main topic required: ${item.title}`);
    if (item.explicitTopic && topicKey(item.explicitTopic) !== item.topic)
      failures.push(`conflicting main topic: ${item.title}`);
    if (!item.source || !item.facts || !item.evidence)
      failures.push(`source, evidence and summary required: ${item.title}`);
    if (!item.channels.length || item.channels.some((c) => !CHANNELS[c]))
      failures.push(`invalid channel: ${item.title}`);
    if (new Set(item.channels).size !== item.channels.length)
      failures.push(`duplicate channel: ${item.title}`);
    const unknownDate = ['未确认', '未確認'].includes(item.published);
    if (unknownDate ? !validDate(item.observed) : !validDate(item.published))
      failures.push(
        `original date or explicit unknown plus observation date required: ${item.title}`,
      );
    try {
      const url = new URL(item.link);
      if (
        url.protocol !== 'https:' ||
        url.username ||
        url.password ||
        url.hostname === 'mail.google.com'
      )
        throw new Error();
      url.search = '';
      url.hash = '';
      const normalized = url.href.replace(/\/$/, '');
      if (links.has(normalized)) failures.push(`same event/link appears twice: ${item.title}`);
      links.add(normalized);
    } catch {
      failures.push(`public original evidence URL required: ${item.title}`);
    }
    if (
      (!unknownDate && item.published > String(doc.meta.date).slice(0, 10)) ||
      (item.observed && item.observed > String(doc.meta.date).slice(0, 10))
    )
      failures.push(`future original/observation date: ${item.title}`);
  }
  for (const lead of leads)
    if (!ids.has(lead[2])) failures.push(`key change target missing: ${lead[2]}`);
  return failures;
}

export function compareRadarV2(zh, ja) {
  const signature = (source) => {
    const doc = parseRadarV2(source);
    return JSON.stringify({
      leads: [...doc.highlights.matchAll(/\(#radar-([a-z0-9-]+)\)/g)].map((m) => m[1]),
      items: doc.items.map(
        ({ id, topic, deepRead, source, link, published, observed, channels, evidence }) => ({
          id,
          topic,
          deepRead,
          source,
          link,
          published: ['未确认', '未確認'].includes(published) ? 'unknown' : published,
          observed,
          channels,
          evidence,
        }),
      ),
    });
  };
  return signature(zh) === signature(ja);
}
