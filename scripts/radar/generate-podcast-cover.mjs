import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { chromium } from 'playwright';

const WORKSPACE_ROOT = process.cwd();
const OUTPUT_PATH = path.join(WORKSPACE_ROOT, 'public/images/podcast-cover.jpg');
const SIZE = 3000;
const COVER_SCALE = 1.2;

const bars = [
  [460, 1460, 54, 230],
  [548, 1405, 54, 340],
  [636, 1345, 54, 460],
  [724, 1415, 54, 325],
  [812, 1275, 54, 560],
  [900, 1380, 54, 405],
  [988, 1445, 54, 285],
  [1076, 1360, 54, 445],
  [1164, 1430, 54, 335],
];

function renderCoverHtml() {
  const barHtml = bars
    .map(
      ([x, y, width, height], index) =>
        `<span class="bar ${index % 3 === 1 ? 'bar-light' : ''}" style="left:${x}px;top:${y}px;width:${width}px;height:${height}px"></span>`,
    )
    .join('');
  const signalHtml = [
    [55, 24, 'lg', ''],
    [67, 39, 'sm', ''],
    [42, 47, 'md', 'warm'],
    [72, 60, 'md', ''],
    [34, 66, 'sm', ''],
    [58, 73, 'lg', ''],
    [25, 42, 'xs', ''],
  ]
    .map(
      ([x, y, size, tone]) =>
        `<span class="signal signal-${size} ${tone ? `signal-${tone}` : ''}" style="left:${x}%;top:${y}%"></span>`,
    )
    .join('');
  const telemetryHtml = [0, 1, 2, 3, 4, 5]
    .map((index) => `<span class="telemetry telemetry-${index + 1}"></span>`)
    .join('');
  const tickHtml = Array.from({ length: 72 }, (_, index) => {
    const isMajor = index % 6 === 0;
    return `<span class="radar-tick ${isMajor ? 'radar-tick-major' : ''}" style="transform:rotate(${index * 5}deg) translateY(-870px)"></span>`;
  }).join('');
  const bearingHtml = [
    [50, 6, '000'],
    [78, 19, '045'],
    [91, 49, '090'],
    [75, 78, '135'],
    [48, 91, '180'],
    [19, 74, '225'],
    [6, 49, '270'],
    [20, 18, '315'],
  ]
    .map(([x, y, label]) => `<span class="bearing" style="left:${x}%;top:${y}%">${label}</span>`)
    .join('');
  const vectorHtml = [
    [50, 50, 470, -47, 'primary'],
    [43, 48, 310, 14, 'soft'],
    [55, 24, 260, 116, 'soft'],
    [58, 73, 320, -28, 'soft'],
  ]
    .map(
      ([x, y, width, angle, tone]) =>
        `<span class="vector vector-${tone}" style="left:${x}%;top:${y}%;width:${width}px;transform:rotate(${angle}deg)"></span>`,
    )
    .join('');
  const sourceHtml = [
    [50, 12, 'RESEARCH', 'source-cool source-outer'],
    [34, 31, 'MODEL RELEASE', 'source-muted source-small source-outer'],
    [75, 25, 'OPEN MODELS', 'source-cool source-small source-outer'],
    [84, 49, 'PRODUCT', 'source-muted source-small source-outer'],
    [73, 76, 'OPEN SOURCE', 'source-cyan source-small source-outer'],
    [27, 53, 'POLICY', 'source-muted source-small source-outer'],
    [40, 62, 'AI ENGINEERING', 'source-cool source-small source-mid'],
    [64, 34, 'MCP', 'source-cyan source-small source-mid'],
    [75, 60, 'TOOLS', 'source-cyan source-mid'],
    [66, 69, 'RAG', 'source-cyan source-small source-mid'],
    [61, 75, 'CODING AGENTS', 'source-muted source-small source-mid'],
    [79, 72, 'STRUCTURED OUTPUT', 'source-muted source-small source-wide source-mid'],
    [57, 54, 'EVALS', 'source-cyan source-inner'],
    [62, 40, 'OBSERVABILITY', 'source-muted source-wide source-inner'],
    [45, 39, 'CONTEXT', 'source-muted source-small source-inner'],
    [43, 52, 'HARNESS', 'source-cyan source-small source-inner'],
    [50, 45, 'AGENTS', 'source-warm source-inner'],
  ]
    .map(
      ([x, y, label, tone]) =>
        `<span class="source-tag ${tone}" style="left:${x}%;top:${y}%"><i></i>${label}</span>`,
    )
    .join('');
  const arcHtml = [
    ['arc-wide', 11, 11, 78],
    ['arc-mid', 25, 25, 52],
    ['arc-inner', 38, 38, 26],
  ]
    .map(
      ([className, left, top, size]) =>
        `<span class="ghost-arc ${className}" style="left:${left}%;top:${top}%;width:${size}%;height:${size}%"></span>`,
    )
    .join('');

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      * { box-sizing: border-box; }
      html, body { margin: 0; width: ${SIZE}px; height: ${SIZE}px; overflow: hidden; }
      body {
        display: grid;
        place-items: center;
        background:
          radial-gradient(circle at 67% 36%, rgba(45, 212, 191, 0.24), transparent 28%),
          radial-gradient(circle at 30% 74%, rgba(56, 189, 248, 0.30), transparent 32%),
          radial-gradient(circle at 87% 69%, rgba(250, 204, 21, 0.08), transparent 18%),
          linear-gradient(135deg, #07111f 0%, #0c2135 43%, #111827 100%);
        font-family: Arial, "Hiragino Sans", "Hiragino Mincho ProN", "Yu Mincho", "Songti SC", sans-serif;
        color: #f8fafc;
      }
      .frame {
        position: relative;
        width: 2730px;
        height: 2730px;
        border: 7px solid rgba(219, 234, 254, 0.14);
        outline: 2px solid rgba(255, 255, 255, 0.07);
        outline-offset: -120px;
        transform: scale(${COVER_SCALE});
      }
      .frame::before {
        content: "";
        position: absolute;
        inset: 135px;
        background:
          linear-gradient(rgba(148, 163, 184, 0.055) 2px, transparent 2px),
          linear-gradient(90deg, rgba(148, 163, 184, 0.055) 2px, transparent 2px);
        background-size: 150px 150px;
        mask-image: radial-gradient(circle at 62% 42%, #000 0 54%, transparent 75%);
      }
      .inner-line {
        position: absolute;
        left: 270px;
        top: 270px;
        right: 230px;
        bottom: 235px;
        border: 2px solid rgba(219, 234, 254, 0.1);
      }
      .corner {
        position: absolute;
        width: 170px;
        height: 170px;
        border-color: rgba(125, 211, 252, 0.28);
        border-style: solid;
      }
      .corner-tl {
        left: 270px;
        top: 270px;
        border-width: 8px 0 0 8px;
      }
      .corner-tr {
        right: 230px;
        top: 270px;
        border-width: 8px 8px 0 0;
      }
      .corner-bl {
        left: 270px;
        bottom: 235px;
        border-width: 0 0 8px 8px;
      }
      .corner-br {
        right: 230px;
        bottom: 235px;
        border-width: 0 8px 8px 0;
      }
      .radar-screen {
        position: absolute;
        top: 175px;
        right: 175px;
        width: 1780px;
        height: 1780px;
        border-radius: 50%;
        overflow: hidden;
        background:
          radial-gradient(circle, transparent 0 18%, rgba(56, 189, 248, 0.12) 18.2% 18.8%, transparent 19% 34%, rgba(56, 189, 248, 0.11) 34.2% 34.8%, transparent 35% 50%, rgba(56, 189, 248, 0.10) 50.2% 50.8%, transparent 51% 66%, rgba(56, 189, 248, 0.09) 66.2% 66.8%, transparent 67%),
          radial-gradient(circle at center, rgba(34, 211, 238, 0.14), rgba(15, 23, 42, 0.10) 56%, transparent 70%);
        border: 6px solid rgba(125, 211, 252, 0.28);
        box-shadow:
          0 0 95px rgba(56, 189, 248, 0.22),
          inset 0 0 120px rgba(14, 165, 233, 0.18);
      }
      .radar-screen::before,
      .radar-screen::after {
        content: "";
        position: absolute;
        left: 50%;
        top: 0;
        width: 3px;
        height: 100%;
        background: rgba(125, 211, 252, 0.20);
        transform: translateX(-50%);
      }
      .radar-screen::after {
        transform: translateX(-50%) rotate(90deg);
      }
      .bearing {
        position: absolute;
        transform: translate(-50%, -50%);
        color: rgba(191, 219, 254, 0.28);
        font-size: 34px;
        font-weight: 700;
        line-height: 1;
      }
      .radar-tick {
        position: absolute;
        left: 50%;
        top: 50%;
        width: 3px;
        height: 28px;
        transform-origin: 50% 900px;
        background: rgba(191, 219, 254, 0.18);
      }
      .radar-tick-major {
        width: 5px;
        height: 54px;
        background: rgba(191, 219, 254, 0.35);
        box-shadow: 0 0 18px rgba(56, 189, 248, 0.26);
      }
      .ghost-arc {
        position: absolute;
        border-radius: 50%;
        border: 4px solid transparent;
        border-top-color: rgba(125, 211, 252, 0.34);
        border-right-color: rgba(125, 211, 252, 0.16);
        transform: rotate(-18deg);
        filter: drop-shadow(0 0 18px rgba(56, 189, 248, 0.16));
      }
      .arc-mid {
        opacity: 0.70;
        transform: rotate(22deg);
      }
      .arc-inner {
        opacity: 0.56;
        transform: rotate(54deg);
      }
      .scan {
        position: absolute;
        inset: -1px;
        border-radius: 50%;
        background: conic-gradient(from 295deg, rgba(34, 211, 238, 0.44) 0deg, rgba(34, 211, 238, 0.15) 24deg, transparent 62deg 360deg);
        mix-blend-mode: screen;
      }
      .sweep-line {
        position: absolute;
        left: 50%;
        top: 50%;
        width: 48%;
        height: 7px;
        transform-origin: left center;
        transform: rotate(-47deg);
        background: linear-gradient(90deg, rgba(240, 249, 255, 0.94), rgba(34, 211, 238, 0.58), transparent);
        box-shadow: 0 0 40px rgba(34, 211, 238, 0.60);
      }
      .vector {
        position: absolute;
        height: 3px;
        transform-origin: left center;
        background: linear-gradient(90deg, rgba(240, 249, 255, 0.58), rgba(125, 211, 252, 0.18), transparent);
        box-shadow: 0 0 24px rgba(56, 189, 248, 0.22);
      }
      .vector-primary {
        height: 5px;
        background: linear-gradient(90deg, rgba(240, 249, 255, 0.84), rgba(125, 211, 252, 0.44), transparent);
        box-shadow: 0 0 34px rgba(56, 189, 248, 0.32);
      }
      .vector-soft {
        opacity: 0.55;
      }
      .center-lock {
        position: absolute;
        left: 50%;
        top: 50%;
        width: 34px;
        height: 34px;
        border-radius: 50%;
        transform: translate(-50%, -50%);
        background: rgba(224, 242, 254, 0.92);
        box-shadow:
          0 0 34px rgba(125, 211, 252, 0.64),
          0 0 120px rgba(34, 211, 238, 0.38);
      }
      .signal {
        position: absolute;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: #e0f2fe;
        box-shadow: 0 0 34px rgba(125, 211, 252, 0.72);
      }
      .signal-warm {
        background: #fde68a;
        box-shadow: 0 0 40px rgba(250, 204, 21, 0.42);
      }
      .signal::after {
        content: "";
        position: absolute;
        inset: -22px;
        border: 3px solid rgba(125, 211, 252, 0.20);
        border-radius: 50%;
      }
      .signal-xs { width: 16px; height: 16px; opacity: 0.70; }
      .signal-sm { width: 22px; height: 22px; opacity: 0.78; }
      .signal-md { width: 28px; height: 28px; opacity: 0.86; }
      .signal-lg { width: 36px; height: 36px; }
      .source-tag {
        position: absolute;
        display: flex;
        align-items: center;
        gap: 11px;
        transform: translate(-50%, -50%);
        padding: 13px 18px;
        border: 2px solid rgba(191, 219, 254, 0.22);
        border-radius: 999px;
        background: rgba(8, 21, 37, 0.40);
        color: rgba(219, 234, 254, 0.56);
        font-size: 27px;
        font-weight: 800;
        line-height: 1;
        white-space: nowrap;
        box-shadow:
          0 0 24px rgba(56, 189, 248, 0.12),
          inset 0 0 22px rgba(14, 165, 233, 0.09);
      }
      .source-small {
        gap: 8px;
        padding: 10px 14px;
        font-size: 23px;
        opacity: 0.78;
      }
      .source-wide {
        font-size: 21px;
        opacity: 0.68;
      }
      .source-outer {
        opacity: 0.68;
      }
      .source-mid {
        opacity: 0.74;
      }
      .source-inner {
        opacity: 0.88;
      }
      .source-tag i {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: #bae6fd;
        box-shadow: 0 0 18px rgba(125, 211, 252, 0.72);
      }
      .source-small i {
        width: 9px;
        height: 9px;
      }
      .source-cyan {
        border-color: rgba(34, 211, 238, 0.28);
        color: rgba(224, 242, 254, 0.66);
      }
      .source-warm {
        border-color: rgba(250, 204, 21, 0.28);
        color: rgba(253, 230, 138, 0.62);
      }
      .source-warm i {
        background: #fde68a;
        box-shadow: 0 0 18px rgba(250, 204, 21, 0.52);
      }
      .source-muted {
        opacity: 0.74;
      }
      .radar-label {
        position: absolute;
        right: 380px;
        top: 405px;
        color: rgba(191, 219, 254, 0.58);
        font-size: 42px;
        font-weight: 700;
        letter-spacing: 0;
      }
      .telemetry {
        position: absolute;
        left: 430px;
        height: 3px;
        background: linear-gradient(90deg, rgba(125, 211, 252, 0.44), rgba(125, 211, 252, 0.10), transparent);
        box-shadow: 0 0 20px rgba(56, 189, 248, 0.20);
      }
      .telemetry-1 { top: 470px; width: 560px; }
      .telemetry-2 { top: 550px; width: 390px; opacity: 0.76; }
      .telemetry-3 { top: 630px; width: 690px; opacity: 0.64; }
      .telemetry-4 { top: 780px; width: 480px; opacity: 0.50; }
      .telemetry-5 { top: 860px; width: 315px; opacity: 0.42; }
      .telemetry-6 { top: 940px; width: 610px; opacity: 0.36; }
      .tick {
        position: absolute;
        right: 450px;
        top: 1720px;
        width: 760px;
        height: 4px;
        background: linear-gradient(90deg, transparent, rgba(125, 211, 252, 0.66), transparent);
        box-shadow: 0 0 32px rgba(56, 189, 248, 0.34);
      }
      .bar {
        position: absolute;
        border-radius: 999px;
        background: rgba(56, 189, 248, 0.92);
        box-shadow: 0 0 58px rgba(56, 189, 248, 0.34);
      }
      .bar-light { background: rgba(248, 250, 252, 0.88); }
      .series {
        position: absolute;
        left: 305px;
        bottom: 720px;
        color: rgba(191, 219, 254, 0.62);
        font-size: 42px;
        line-height: 1;
        font-weight: 700;
        letter-spacing: 0;
      }
      .title-rule {
        position: absolute;
        left: 305px;
        bottom: 688px;
        width: 440px;
        height: 6px;
        background: linear-gradient(90deg, #38bdf8, rgba(56, 189, 248, 0));
        box-shadow: 0 0 24px rgba(56, 189, 248, 0.34);
      }
      .radar {
        position: absolute;
        left: 295px;
        bottom: 445px;
        color: #38bdf8;
        font-size: 238px;
        line-height: 1;
        font-weight: 800;
        letter-spacing: 0;
        text-shadow: 0 0 60px rgba(56, 189, 248, 0.28);
      }
      .briefing {
        position: absolute;
        left: 300px;
        bottom: 285px;
        color: #dbeafe;
        font-size: 112px;
        line-height: 1;
        font-weight: 500;
        letter-spacing: 0;
      }
      .brand {
        position: absolute;
        left: 305px;
        bottom: 170px;
        color: rgba(159, 183, 214, 0.74);
        font-size: 58px;
        line-height: 1;
        font-weight: 600;
        letter-spacing: 0;
      }
      .signature {
        position: absolute;
        right: 250px;
        bottom: 275px;
        color: rgba(219, 234, 254, 0.34);
        font-family: "Hiragino Mincho ProN", "Yu Mincho", "Songti SC", serif;
        font-size: 88px;
        font-weight: 700;
        letter-spacing: 0;
        text-shadow: 0 0 28px rgba(125, 211, 252, 0.16);
      }
    </style>
  </head>
  <body>
    <main class="frame" aria-label="Good Good Study, Day Day AI podcast cover">
      <section class="inner-line"></section>
      <span class="corner corner-tl"></span>
      <span class="corner corner-tr"></span>
      <span class="corner corner-bl"></span>
      <span class="corner corner-br"></span>
      <div class="radar-screen">
        ${tickHtml}
        ${bearingHtml}
        ${arcHtml}
        <div class="scan"></div>
        <div class="sweep-line"></div>
        ${vectorHtml}
        <div class="center-lock"></div>
        ${signalHtml}
        ${sourceHtml}
      </div>
      ${telemetryHtml}
      <div class="radar-label">SIGNAL SCAN</div>
      <div class="tick"></div>
      ${barHtml}
      <div class="series">DAILY · WEEKLY · MONTHLY</div>
      <div class="title-rule"></div>
      <div class="radar">AI RADAR</div>
      <div class="briefing">BRIEFING</div>
      <div class="brand">Good Good Study, Day Day AI</div>
      <div class="signature">清風明月</div>
    </main>
  </body>
</html>`;
}

async function main() {
  await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  const browser = await chromium.launch();

  try {
    const page = await browser.newPage({
      viewport: { width: SIZE, height: SIZE },
      deviceScaleFactor: 1,
    });
    await page.setContent(renderCoverHtml(), { waitUntil: 'load' });
    await page.screenshot({ path: OUTPUT_PATH, type: 'jpeg', quality: 94 });
  } finally {
    await browser.close();
  }

  console.log(`Podcast cover written to ${path.relative(WORKSPACE_ROOT, OUTPUT_PATH)}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
