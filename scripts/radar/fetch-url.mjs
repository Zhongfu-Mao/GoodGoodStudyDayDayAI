#!/usr/bin/env node
// AI 雷达统一抓取入口。Codex 沙箱中一次性允许
// `node scripts/radar/fetch-url.mjs *`，避免每次抓取重复提权。
//
// 用法：
//   node scripts/radar/fetch-url.mjs <url> [--mode auto|html|rss|readability|raw]
//                                          [--timeout 20] [--retries 2]
//                                          [--ua chrome|safari|firefox|<custom>]
//   node scripts/radar/fetch-url.mjs --help
//
// --mode 默认为 auto：根据 content-type / 文件头自动判定 RSS 或 Readability 抽正文。
//   - rss:         强制按 RSS / Atom 解析，输出 feed.items[]
//   - readability: 强制 jsdom + Readability 抽正文，输出 article{}
//   - html / raw:  返回原始 HTML，输出 body
// --ua 默认 chrome（伪装成桌面 Chrome）。可选 safari / firefox / 自定义字符串。
//
// 输出：单行 JSON 到 stdout。失败时 exit code != 0，错误信息在 JSON.error。
// Exit codes: 0 成功 / 1 参数或运行时错误 / 2 HTTP 4xx-5xx / 3 RSS 解析失败。

import { setTimeout as delay } from 'node:timers/promises';
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import { XMLParser } from 'fast-xml-parser';

const UA_PRESETS = {
  chrome:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  safari:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Safari/605.1.15',
  firefox: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:131.0) Gecko/20100101 Firefox/131.0',
};

const HELP_TEXT = `用法:
  node scripts/radar/fetch-url.mjs <url> [选项]
  node scripts/radar/fetch-url.mjs --help

选项:
  --mode <auto|html|rss|readability|raw>   抓取后处理方式（默认 auto）
                                           auto: 按 content-type 自动判定
                                           rss:  强制 RSS/Atom 解析
                                           readability: jsdom + Readability 抽正文
                                           html/raw: 返回原始 HTML
  --timeout <秒>                            单次请求超时，默认 20
  --retries <次数>                          失败重试次数（指数退避），默认 2
  --ua <chrome|safari|firefox|自定义字符串>  User-Agent，默认 chrome
  -h, --help                                显示本帮助

输出:
  单行 JSON 到 stdout。字段: ok / status / finalUrl / contentType / mode
                          + (article | feed | body | error)

Exit codes:
  0 成功 / 1 参数或运行时错误 / 2 HTTP 4xx-5xx / 3 RSS 解析失败
`;

function parseArgs(argv) {
  const args = { mode: 'auto', timeout: 20, retries: 2, ua: 'chrome', help: false };
  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--help' || a === '-h') args.help = true;
    else if (a === '--mode') args.mode = argv[++i];
    else if (a === '--timeout') args.timeout = Number(argv[++i]);
    else if (a === '--retries') args.retries = Number(argv[++i]);
    else if (a === '--ua') args.ua = argv[++i];
    else if (a.startsWith('--')) throw new Error(`未知参数: ${a}（用 --help 查看用法）`);
    else positional.push(a);
  }
  if (args.help) return args;
  if (positional.length !== 1) {
    throw new Error('必须提供且仅提供一个 URL 参数（用 --help 查看用法）');
  }
  args.url = positional[0];
  return args;
}

function resolveUA(ua) {
  return UA_PRESETS[ua] ?? ua;
}

async function fetchWithRetry(url, { timeoutSec, retries, ua }) {
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), timeoutSec * 1000);
    try {
      const res = await fetch(url, {
        redirect: 'follow',
        signal: ac.signal,
        headers: {
          'user-agent': resolveUA(ua),
          accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,application/rss+xml;q=0.9,*/*;q=0.8',
          'accept-language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7,ja;q=0.6',
        },
      });
      const buf = Buffer.from(await res.arrayBuffer());
      const contentType = res.headers.get('content-type') || '';
      const finalUrl = res.url || url;
      clearTimeout(timer);
      if (!res.ok) {
        lastErr = new Error(`HTTP ${res.status}`);
        if (res.status >= 400 && res.status < 500 && res.status !== 429) {
          return {
            ok: false,
            status: res.status,
            finalUrl,
            contentType,
            body: buf.toString('utf8'),
            error: `HTTP ${res.status}`,
          };
        }
      } else {
        return {
          ok: true,
          status: res.status,
          finalUrl,
          contentType,
          body: buf.toString('utf8'),
        };
      }
    } catch (err) {
      clearTimeout(timer);
      lastErr = err;
    }
    if (attempt < retries) await delay(500 * Math.pow(2, attempt));
  }
  throw lastErr ?? new Error('fetch 失败');
}

function looksLikeRSS(contentType, body) {
  if (/(application|text)\/(rss|atom|xml)/i.test(contentType)) return true;
  const head = body.slice(0, 512).toLowerCase();
  return head.includes('<rss') || head.includes('<feed') || head.includes('<?xml');
}

function parseRSS(body) {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    trimValues: true,
  });
  const doc = parser.parse(body);
  const items = [];
  const channelItems = doc?.rss?.channel?.item;
  const atomEntries = doc?.feed?.entry;
  const list = Array.isArray(channelItems)
    ? channelItems
    : channelItems
      ? [channelItems]
      : Array.isArray(atomEntries)
        ? atomEntries
        : atomEntries
          ? [atomEntries]
          : [];
  for (const it of list) {
    const link =
      typeof it.link === 'string'
        ? it.link
        : Array.isArray(it.link)
          ? it.link.find((l) => l?.['@_rel'] !== 'self')?.['@_href'] ||
            it.link[0]?.['@_href'] ||
            it.link[0]
          : it.link?.['@_href'] || it.link;
    items.push({
      title: typeof it.title === 'string' ? it.title : it.title?.['#text'] || '',
      link: link || '',
      published: it.pubDate || it.published || it.updated || '',
      summary:
        (typeof it.description === 'string' ? it.description : '') ||
        (typeof it.summary === 'string' ? it.summary : it.summary?.['#text']) ||
        '',
      author:
        (typeof it.author === 'string' ? it.author : it.author?.name) || it['dc:creator'] || '',
    });
  }
  return {
    feedTitle: doc?.rss?.channel?.title || doc?.feed?.title?.['#text'] || doc?.feed?.title || '',
    items,
  };
}

function extractReadable(body, finalUrl) {
  const dom = new JSDOM(body, { url: finalUrl });
  const reader = new Readability(dom.window.document);
  const article = reader.parse();
  if (!article) return null;
  return {
    title: article.title,
    byline: article.byline,
    excerpt: article.excerpt,
    siteName: article.siteName,
    publishedTime: article.publishedTime,
    lang: article.lang,
    length: article.length,
    textContent: article.textContent,
    content: article.content,
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    process.stdout.write(HELP_TEXT);
    return;
  }
  const fetched = await fetchWithRetry(args.url, {
    timeoutSec: args.timeout,
    retries: args.retries,
    ua: args.ua,
  });

  const out = {
    requestedUrl: args.url,
    finalUrl: fetched.finalUrl,
    status: fetched.status,
    contentType: fetched.contentType,
    ok: fetched.ok,
  };

  if (!fetched.ok) {
    out.error = fetched.error;
    out.body = fetched.body?.slice(0, 2000);
    process.stdout.write(JSON.stringify(out) + '\n');
    process.exit(2);
  }

  let mode = args.mode;
  if (mode === 'auto') {
    mode = looksLikeRSS(fetched.contentType, fetched.body) ? 'rss' : 'readability';
  }

  out.mode = mode;
  if (mode === 'raw' || mode === 'html') {
    out.body = fetched.body;
  } else if (mode === 'rss') {
    try {
      out.feed = parseRSS(fetched.body);
    } catch (err) {
      out.error = `RSS 解析失败: ${err.message}`;
      out.body = fetched.body;
      process.stdout.write(JSON.stringify(out) + '\n');
      process.exit(3);
    }
  } else if (mode === 'readability') {
    const article = extractReadable(fetched.body, fetched.finalUrl);
    if (!article) {
      out.error = 'Readability 抽取失败，回退原始 HTML';
      out.body = fetched.body;
    } else {
      out.article = article;
    }
  } else {
    throw new Error(`未知 mode: ${mode}`);
  }

  process.stdout.write(JSON.stringify(out) + '\n');
}

main().catch((err) => {
  process.stdout.write(JSON.stringify({ ok: false, error: err?.message || String(err) }) + '\n');
  process.exit(1);
});
