# 雷达信息图输入与验收

正文冻结后，从同一份 Markdown 导出事实清单，供 NotebookLM 和内置 imagegen 使用：

```sh
node scripts/radar/generate-infographic.mjs --file src/content/radar/daily-ai-radar-YYYY-MM-DD.md --brief-only
```

日文使用对应的 `.ja.md`。周报、月报也可通过 `--file` 指定。该命令不调用生成服务、不改正文或现有图片；输出位于 `.cache/radar-infographic/<文章文件名>/`：

- `brief.json`：原栏目顺序、全部条目标题和完整事实摘要，附正文指纹供追溯。
- `notebooklm-prompt.txt`：NotebookLM 的内容与设计指令。
- `imagegen-prompt.txt`：同一事实清单，附 imagegen 的画幅与无水印规则。

内置 imagegen 直接读取对应提示词，不需要 OpenAI API key。`--backend openai` 是独立的 API 入口，需要 API key；它也使用同一事实清单，不再经过会丢条目的二次 LLM 提炼。原 `--brief-model` / `--brief-mode` 已移除，使用时会明确报错。

正常 NotebookLM 生成也会先导出这些文件，然后按准确 source ID 和 `--prompt-file` 调用服务。默认 `--detail standard`，可显式覆盖；提示词不再写死 Detailed。正文改变后须重新导出，不沿用旧清单。

日报和周报保留原六栏目，包括具体 Newsletter 条目，条目数来自正文，不强行凑到 12。缺栏目或事实为空时，在创建笔记本之前报错。月报保留自己的主线、演进、待讨论问题、下月观察和 Newsletter 结构，不套日报模板。

完整摘要是事实边界，**不是要求逐字把长段落印到图上**。图上应压缩为短标题、事实或机制和必要限定条件；不得截掉数字的样本、单位、期间、增量口径、版本、开放范围或不确定性。禁止补造因果关系。空间不足先减装饰和重复措辞。

生成完成后仍需人工目视验收：标题日期正确、栏目与条目齐全、数字与限定条件一致、主要文字可读、无新增事实或机构误归属。NotebookLM 正常水印允许；imagegen 不允许水印。脚本和测试通过只证明输入契约及调用兼容，不能证明输出图片质量。

## 后端差异与选择

| 项目 | 内置 imagegen | NotebookLM |
| --- | --- | --- |
| 事实输入 | 共用事实清单及 imagegen prompt | 同一清单及 NotebookLM prompt |
| 水印 | 不允许水印、伪 NotebookLM 标记、签名或 logo mark | 正常 NotebookLM 水印允许 |
| 调用 | 内置工具，无需 API key；独立 OpenAI API 入口另需 key | 仓库生成脚本，准确 source ID 和 prompt 文件 |

本次迁移不改变后端选择：用户指定优先，仓库脚本默认仍为 NotebookLM；imagegen 遵循下方专用规则。已选后端和用户认可的风格不会因迁移而切换。

日文必须人工目视检查；严重乱码时降低文字密度重生一次，或回退到最近稳定的 NotebookLM 版本，不得未经说明提交明显不可读的日文图片。返工遵守 [雷达工作流](radar.md) §3.1 的实质错误门槛。

以下为从旧文件迁入的 imagegen 专用约束。先应用上方共用事实契约；任何版式或每栏事实数量提示都不能删掉完整条目、限定条件，或将月报套入日报模板。历史案例移至 [lessons.md](lessons.md)，不作为本期选题清单。

## imagegen 专用规则

### Scope

- Applies to AI radar daily / weekly / monthly infographics generated with
  built-in imagegen.
- Backend-specific visual and watermark rules here apply only to imagegen.
  Both backends use the shared content contract in `docs/agents/radar-infographics.md`.
- Do not switch to HTML / SVG / deterministic layout for radar infographics
  unless the user explicitly asks for that mode in the current conversation.
- Use built-in imagegen directly. Do not assume an OpenAI API key is required.

### Required Flow

1. Freeze the reader-facing Markdown first.
2. Export the shared fact brief with `node scripts/radar/generate-infographic.mjs --file REPORT.md --brief-only`; read `docs/agents/radar-infographics.md` and use `.cache/radar-infographic/<slug>/imagegen-prompt.txt`. Preserve the same facts used by NotebookLM; only backend-specific visual and watermark rules differ.
3. Generate imagegen candidates from that brief.
4. Visually review candidates against the checklist in this file.
5. Only copy a passing candidate into `public/images/radar/`.
6. Record the selected backend and any rejection reason in the non-public audit.

Never save a decorative candidate into the public asset path just because it
looks polished.

### Imagegen Brief Contract

The prompt must be based on a structured brief, not on a vague request such as
"make a daily radar infographic".

Each brief must include:

- Report title and exact date.
- Central thesis in one sentence.
- Fixed section names in the same order as the Markdown.
- Preserve every item from the shared fact brief. The earlier 2-5 facts per section design cue must not truncate items or qualifiers; visual density follows the frozen report.
- Newsletter entries as concrete item titles and short facts, not a source
  distribution summary.
- Explicit forbidden items, especially removed or stale topics.
- Output language: Chinese for zh, Japanese for ja.
- Required aspect ratio: wide horizontal 16:9.
- Required style: early-May hand-drawn editorial systems map, warm paper, ink
  outlines, watercolor accents, arrows, flow diagrams, readable callouts.

### Prompt Requirements

Every imagegen prompt for radar infographics must include these constraints:

- `wide 16:9 horizontal high-information editorial infographic`
- `early-May hand-drawn editorial systems map`
- `high information density`
- `each quadrant must contain concrete facts, numbers, mechanisms`
- `not decorative cards`
- `not just category names`
- `no watermark`
- `no NotebookLM mark`
- `no logo mark`
- `no signature`
- `raster hand-drawn infographic only`

The prompt must require concrete content for every section. For a daily report,
the default shape is:

- Title or small thesis ribbon: keep it subordinate to item facts; a central metaphor must not crowd out content.
- Five numbered quadrants:
  1. AI Engineering & architecture.
  2. Model frontier & algorithms.
  3. Practical code & tools.
  4. Industry & business.
  5. GitHub trend tracking.
- Bottom strip: Newsletter selected items.

### Minimum Information Density

A passing imagegen infographic must carry enough information that a reader can
understand the day's radar without opening the Markdown immediately.

Minimum standard:

- Every quadrant has at least two concrete facts or mechanisms.
- At least three sections include specific names, numbers, or process steps.
- The industry/business quadrant includes the actual selected sources and does
  not collapse into a generic "policy" or "company news" illustration.
- The GitHub quadrant lists actual repo names and why they matter.
- The Newsletter strip lists concrete newsletter items.
- The image communicates transitions or relationships with arrows, loops, or
  comparisons, not only isolated cards.

### Visual QA Checklist

Before copying a candidate into `public/images/radar/`, inspect it visually and
answer all items:

- Is it close to 16:9 wide landscape?
- Does the title date match the Markdown date?
- Are all required sections present?
- Does every section contain concrete information, not only labels?
- Do the visible source names match the final Markdown?
- Are removed topics absent?
- Are stale topics absent?
- Is the Newsletter strip reader-facing and item-level?
- Is there no NotebookLM watermark or other watermark?
- Is the image not merely color blocks, empty cards, or decorative icons?
- Are core numbers and names not obviously hallucinated?
- Are text errors tolerable enough that the core meaning remains clear?

If any answer is no, reject the candidate and regenerate.

### Automatic Rejection Examples

Reject imagegen output immediately if it has any of the following:

- NotebookLM watermark or generated signature.
- HTML / SVG / UI mockup look.
- Section cards with only titles and no facts.
- Generic slogans replacing concrete content.
- A removed article, stale source, or stale section label.
- A previous version's topic after Markdown has been changed.
- Same-source imbalance that contradicts the final Markdown.
- Newsletter shown as "source distribution" or "used N newsletters" rather than
  concrete item entries.
- Public-inappropriate backstage language such as audit notes, source checks,
  crawl failures, Gmail IDs, local paths, or dedupe notes.
