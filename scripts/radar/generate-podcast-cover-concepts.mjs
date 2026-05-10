import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { chromium } from 'playwright';

const WORKSPACE_ROOT = process.cwd();
const OUTPUT_PATH = path.join(
  WORKSPACE_ROOT,
  'public/images/podcast-cover-concepts-qingfeng-seal.jpg',
);
const SIZE = 3600;

const concepts = [
  { id: '01', title: 'Corner Seal', mark: 'corner-red', accent: '#2dd4bf' },
  { id: '02', title: 'Blind Stamp', mark: 'blind-stamp', accent: '#2dd4bf' },
  { id: '03', title: 'Moon Seal', mark: 'moon-seal', accent: '#67e8f9' },
  { id: '04', title: 'Side Chop', mark: 'side-chop', accent: '#2dd4bf' },
  { id: '05', title: 'Quiet Signature', mark: 'quiet-signature', accent: '#38bdf8' },
  { id: '06', title: 'Paper Tag', mark: 'mark-paper-tag', accent: '#34d399' },
  { id: '07', title: 'Red Dot Seal', mark: 'red-dot', accent: '#2dd4bf' },
  { id: '08', title: 'Ghost Seal', mark: 'ghost-seal', accent: '#93c5fd' },
  { id: '09', title: 'Bookplate', mark: 'mark-bookplate', accent: '#2dd4bf' },
];

const bars = [82, 132, 214, 152, 288, 174, 118, 230, 140];

function renderBars(accent) {
  return bars
    .map(
      (height, index) =>
        `<i style="height:${height}px;background:${index % 3 === 1 ? '#dbeafe' : accent}"></i>`,
    )
    .join('');
}

function renderSeal(kind) {
  if (kind === 'corner-red') {
    return `<div class="seal red corner"><span>清風<br />明月</span></div>`;
  }

  if (kind === 'blind-stamp') {
    return `<div class="seal blind"><span>清風<br />明月</span></div>`;
  }

  if (kind === 'moon-seal') {
    return `<div class="seal moon-stamp"><span>清風<br />明月</span></div>`;
  }

  if (kind === 'side-chop') {
    return `<div class="seal side"><span>清風明月</span></div>`;
  }

  if (kind === 'quiet-signature') {
    return `<div class="signature">清風明月</div>`;
  }

  if (kind === 'mark-paper-tag') {
    return `<div class="paper-tag"><span>清風<br />明月</span></div>`;
  }

  if (kind === 'red-dot') {
    return `<div class="seal dot"><span>清<br />月</span></div>`;
  }

  if (kind === 'ghost-seal') {
    return `<div class="seal ghost"><span>清風<br />明月</span></div>`;
  }

  return `<div class="bookplate"><span>清風明月</span></div>`;
}

function renderConcept(concept) {
  return `<section class="tile ${concept.mark}" style="--accent:${concept.accent}">
    <div class="number">${concept.id}</div>
    <div class="moon"></div>
    <div class="orbit one"></div>
    <div class="orbit two"></div>
    <div class="wave">${renderBars(concept.accent)}</div>
    <div class="brand">
      <strong>AI RADAR</strong>
      <span>BRIEFING</span>
    </div>
    ${renderSeal(concept.mark)}
    <div class="caption">${concept.title}</div>
  </section>`;
}

function renderHtml() {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      * { box-sizing: border-box; }
      html, body {
        width: ${SIZE}px;
        height: ${SIZE}px;
        margin: 0;
        overflow: hidden;
        background: #07111f;
        font-family: Arial, "Hiragino Sans", "Hiragino Mincho ProN", "Yu Mincho", "Songti SC", sans-serif;
      }
      body {
        padding: 90px;
        background:
          radial-gradient(circle at 50% 42%, rgba(45, 212, 191, 0.12), transparent 34%),
          linear-gradient(135deg, #07111f 0%, #10233f 52%, #0f172a 100%);
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        grid-template-rows: repeat(3, 1fr);
        gap: 42px;
        width: 100%;
        height: 100%;
      }
      .tile {
        position: relative;
        overflow: hidden;
        border: 4px solid rgba(219, 234, 254, 0.14);
        background:
          radial-gradient(circle at 77% 22%, color-mix(in srgb, var(--accent), transparent 68%), transparent 28%),
          linear-gradient(135deg, #08111f, #112640);
        color: #f8fafc;
      }
      .tile::before {
        content: "";
        position: absolute;
        inset: 120px;
        border: 2px solid rgba(219, 234, 254, 0.1);
      }
      .number {
        position: absolute;
        top: 38px;
        left: 42px;
        color: rgba(219, 234, 254, 0.58);
        font-size: 38px;
        font-weight: 700;
      }
      .moon {
        position: absolute;
        top: 118px;
        right: 124px;
        width: 170px;
        height: 170px;
        border-radius: 50%;
        background: #f8fafc;
        box-shadow: 0 0 70px rgba(248, 250, 252, 0.46);
      }
      .orbit {
        position: absolute;
        border: 3px solid color-mix(in srgb, var(--accent), transparent 64%);
        border-radius: 50%;
      }
      .orbit.one {
        top: 92px;
        right: 48px;
        width: 430px;
        height: 430px;
      }
      .orbit.two {
        top: 200px;
        right: 176px;
        width: 680px;
        height: 220px;
        transform: rotate(-16deg);
        opacity: 0.5;
      }
      .wave {
        position: absolute;
        left: 120px;
        top: 440px;
        display: flex;
        align-items: center;
        gap: 20px;
      }
      .wave i {
        display: block;
        width: 27px;
        border-radius: 999px;
        box-shadow: 0 0 34px color-mix(in srgb, var(--accent), transparent 62%);
      }
      .brand {
        position: absolute;
        left: 72px;
        bottom: 112px;
      }
      .brand strong {
        display: block;
        color: var(--accent);
        font-size: 76px;
        line-height: 1;
        font-weight: 800;
        letter-spacing: 0;
      }
      .brand span {
        display: block;
        margin-top: 18px;
        color: rgba(219, 234, 254, 0.86);
        font-size: 44px;
        font-weight: 500;
        letter-spacing: 0;
      }
      .caption {
        position: absolute;
        right: 42px;
        bottom: 40px;
        color: rgba(219, 234, 254, 0.52);
        font-size: 28px;
        font-weight: 700;
      }
      .seal {
        position: absolute;
        display: grid;
        place-items: center;
        font-family: "Hiragino Mincho ProN", "Yu Mincho", "Songti SC", serif;
        font-weight: 700;
        letter-spacing: 0;
      }
      .seal span { display: block; line-height: 1.08; text-align: center; }
      .seal.red {
        width: 126px;
        height: 126px;
        right: 78px;
        bottom: 88px;
        border: 8px solid rgba(239, 68, 68, 0.72);
        color: rgba(254, 202, 202, 0.82);
        font-size: 38px;
      }
      .seal.blind {
        width: 150px;
        height: 150px;
        right: 80px;
        bottom: 86px;
        border: 5px solid rgba(219, 234, 254, 0.18);
        color: rgba(219, 234, 254, 0.22);
        font-size: 42px;
      }
      .seal.moon-stamp {
        top: 132px;
        right: 135px;
        width: 150px;
        height: 150px;
        color: rgba(15, 23, 42, 0.32);
        font-size: 38px;
      }
      .seal.side {
        right: 72px;
        top: 365px;
        width: 50px;
        height: 210px;
        color: rgba(254, 202, 202, 0.76);
        border-left: 4px solid rgba(239, 68, 68, 0.5);
        border-right: 4px solid rgba(239, 68, 68, 0.5);
        font-size: 34px;
        writing-mode: vertical-rl;
      }
      .signature {
        position: absolute;
        right: 82px;
        bottom: 144px;
        color: rgba(219, 234, 254, 0.36);
        font-family: "Hiragino Mincho ProN", "Yu Mincho", "Songti SC", serif;
        font-size: 42px;
        font-weight: 700;
        letter-spacing: 0;
      }
      .paper-tag {
        position: absolute;
        right: 76px;
        bottom: 82px;
        width: 108px;
        height: 142px;
        display: grid;
        place-items: center;
        background: rgba(253, 230, 138, 0.12);
        border: 3px solid rgba(253, 230, 138, 0.28);
        color: rgba(253, 230, 138, 0.68);
        font-family: "Hiragino Mincho ProN", "Yu Mincho", "Songti SC", serif;
        font-size: 34px;
        font-weight: 700;
      }
      .paper-tag span { line-height: 1.1; text-align: center; }
      .seal.dot {
        width: 76px;
        height: 76px;
        right: 84px;
        bottom: 110px;
        border-radius: 50%;
        background: rgba(239, 68, 68, 0.58);
        color: rgba(255, 255, 255, 0.74);
        font-size: 24px;
      }
      .seal.ghost {
        width: 170px;
        height: 170px;
        left: 90px;
        bottom: 92px;
        border: 5px solid rgba(45, 212, 191, 0.12);
        color: rgba(45, 212, 191, 0.16);
        font-size: 42px;
      }
      .bookplate {
        position: absolute;
        right: 74px;
        bottom: 86px;
        min-width: 180px;
        padding: 18px 22px;
        border: 3px solid rgba(253, 230, 138, 0.3);
        color: rgba(253, 230, 138, 0.7);
        font-family: "Hiragino Mincho ProN", "Yu Mincho", "Songti SC", serif;
        font-size: 38px;
        font-weight: 700;
      }
      .blind-stamp .wave { left: 98px; top: 470px; }
      .moon-seal .brand,
      .red-dot .brand,
      .mark-bookplate .brand { bottom: 128px; }
      .side-chop .wave,
      .ghost-seal .wave { left: 145px; top: 470px; }
      .quiet-signature .orbit.one {
        right: 105px;
        width: 520px;
        height: 520px;
        opacity: 0.76;
      }
      .mark-paper-tag .moon,
      .ghost-seal .moon { right: 94px; }
      .mark-bookplate .moon { top: 96px; right: 96px; }
    </style>
  </head>
  <body>
    <main class="grid">${concepts.map(renderConcept).join('')}</main>
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
    await page.setContent(renderHtml(), { waitUntil: 'load' });
    await page.screenshot({ path: OUTPUT_PATH, type: 'jpeg', quality: 94 });
  } finally {
    await browser.close();
  }

  console.log(`Podcast cover concepts written to ${path.relative(WORKSPACE_ROOT, OUTPUT_PATH)}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
