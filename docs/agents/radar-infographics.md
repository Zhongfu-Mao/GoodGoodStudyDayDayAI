# 雷达信息图输入与验收

**日报 v2（2026-10-20 起）**：按 [v2 契约](radar-v2.md) 的实际主题和深读条目生成，主题数量与条数可变，不固定六格、不增加渠道横条。共享 brief、日期/证据限定、逐条覆盖及像素验收继续适用。本文下述六栏观察方案和象限/Newsletter 专用要求仅用于旧日报及未迁移周报，不约束 v2。

生成后的版本、原图／压缩图留存、原尺寸分区、逐条覆盖／文字／事实检查及发布提升，统一按 [候选资产与分层验收](radar-asset-review.md)。输入检查不代表位图合格；默认生成仅产出私有候选，验收通过后才提升到公开路径。画面文案当前为 v2 内容指纹，旧 v1 仅能在原缓存与全部事实匹配时显式离线迁移，不触发资产重生。

## 当前观察方案（2026-10-15 起）

接下来几期先固定 **NotebookLM `bento-grid` + `standard` + `landscape`，无导语、无一句话总结、无副标题**。日报／周报使用三列两行、六个柔和彩色分区，逐条指定机制插图和短文案；月报保留自身栏目数量。完整事实依据仍全部保留。暂不继续导语实验或仅为审美比较追加重生；实际事实、可读性和漏项问题仍按原验收门槛处理。

每期在忽略的本地 audit 记录栏目／条目覆盖、中文／日文可读性、数字与限定条件、插图归属及自加文字。先积累接下来几期的实际样本，再由用户决定是否调整；不预设自动恢复导语的日期。2026-10-15 正式图片继续使用已经发布的 imagegen 版本，试验图不替换它。

正文冻结后，从同一份 Markdown 导出事实清单，供 NotebookLM 和内置 imagegen 使用：

```sh
node scripts/radar/generate-infographic.mjs --file src/content/radar/daily-ai-radar-YYYY-MM-DD.md --brief-only
```

日文使用对应的 `.ja.md`。周报、月报也可通过 `--file` 指定。该命令不调用生成服务、不改正文或现有图片；输出位于 `.cache/radar-infographic/<文章文件名>/`：

- `brief.json`：原栏目顺序、全部条目标题和完整事实摘要，附正文指纹供追溯。
- `visual-copy.template.json`：缺少画面文案时导出的待填写模板；逐条填写 `label`（短名称）、`text`（精简事实／机制及必要边界）和 `visual`（仅供绘图的机制说明，不上图），保存为同目录 `visual-copy.json`，或用 `--visual-copy FILE` 指定另一文件。
- `notebooklm-prompt.txt` / `imagegen-prompt.txt`：文案清单齐全且校验通过后才导出，两者共享完整事实依据和指定画面文案，水印等后端要求分别处理。模板未填好时不导出提示词，也不调用生成服务。

画面文案由采编者在冻结事实基础上编写、核对，不能用截断摘要代替。文案清单与 `brief.json` 的 `sourceSha256`、语言、原栏目及条目顺序绑定，全部条目必须覆盖；正文版本改变后重新核对和生成清单。默认脚本缺少清单会先导出模板并停止，不能悄悄退回长摘要上图。`label` 最多 40 字符、`text` 最多 80 字符、`visual` 最多 240 字符是防止误塞整段的上限，实际尽量更短，并以两行说明为排版目标。旧清单缺少 `visual` 时须逐条补齐绘图说明；不得把说明原样印在图中。脚本拒绝空文案／绘图说明、错序、漏项和来源中不存在的画面数字字面量；数字归属、单位、限定条件与语义仍须人工核对。

填写后重新执行 `--brief-only` 可审阅两层提示词，再正常生成。只试验效果、不改已发布图片和正文时使用：

```sh
node scripts/radar/generate-infographic.mjs --file REPORT.md --visual-copy COPY.json --preview-dir tmp/infographic-trial/output
```

预览绕过已有封面的跳过逻辑，候选原件与验收包保存在私有缓存，压缩预览副本保存到指定目录，不发布资产、不更新 frontmatter；输出目录不得放在 `public/` 或 `src/` 中。预览仍消耗 NotebookLM 生成额度，不是离线检查。

内置 imagegen 直接读取对应提示词，不需要 OpenAI API key。`--backend openai` 是独立的 API 入口，需要 API key；它也使用同一事实清单，不再经过会丢条目的二次 LLM 提炼。原 `--brief-model` / `--brief-mode` 已移除，使用时会明确报错。

正常 NotebookLM 生成也会先导出这些文件，然后按准确 source ID 和 `--prompt-file` 调用服务。默认 `--style bento-grid --detail standard --orientation landscape`，可显式覆盖；提示词不写死 Detailed。正文改变后须重新导出，不沿用旧清单。

日报和周报保留原六栏目，包括具体 Newsletter 条目，条目数来自正文，不强行凑到 12。缺栏目或事实为空时，在创建笔记本之前报错。月报保留自己的主线、演进、待讨论问题、下月观察和 Newsletter 结构，不套日报模板。

完整摘要是事实边界，保留在“完整事实依据”层，**不要求每个数字和限制都印到图上**。画面只使用单独指定的短名称与事实／机制文案，完整事实层不再充当待排版正文。可以省略未选用的数字，例如以“特定工程优化，非通用加速”替代复杂倍率；一旦展示数字，就须保留其必要的比较对象、条件及不确定性。写不清时省去整项数值断言，不能只删限定条件。禁止补造因果关系或串用相邻条目的事实。

生成完成后仍需人工目视验收：标题日期正确、栏目与条目齐全、数字与限定条件一致、主要文字可读、无新增事实或机构误归属。NotebookLM 正常水印允许；imagegen 不允许水印。脚本和测试通过只证明输入契约及调用兼容，不能证明输出图片质量。

## 后端差异与选择

| 项目 | 内置 imagegen | NotebookLM |
| --- | --- | --- |
| 事实输入 | 共用事实清单及 imagegen prompt | 同一清单及 NotebookLM prompt |
| 水印 | 不允许水印、伪 NotebookLM 标记、签名或 logo mark | 正常 NotebookLM 水印允许 |
| 调用 | 内置工具，无需 API key；独立 OpenAI API 入口另需 key | 仓库生成脚本，准确 source ID 和 prompt 文件 |

本次迁移不改变后端选择：用户指定优先，仓库脚本默认仍为 NotebookLM；imagegen 遵循下方专用规则。已选后端和用户认可的风格不会因迁移而切换。

日文必须人工目视检查；严重乱码时降低文字密度重生一次，或回退到最近稳定的 NotebookLM 版本，不得未经说明提交明显不可读的日文图片。返工遵守 [雷达工作流](radar.md) §3.1 的实质错误门槛。

以下为从旧文件迁入的 imagegen 专用约束。先应用上方两层契约；完整依据不删事实与限定条件，画面文案可以选择较少的数值断言，但不能删条目或歪曲已展示的断言。不将月报套入日报模板。历史案例移至 [lessons.md](lessons.md)，不作为本期选题清单。

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
2. Export the shared fact brief with `node scripts/radar/generate-infographic.mjs --file REPORT.md --brief-only`; fill and review `visual-copy.json`, then export again and use `.cache/radar-infographic/<slug>/imagegen-prompt.txt`. Both backends receive complete evidence plus the same approved short display copy; only backend-specific visual and watermark rules differ.
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
- Preserve every item from the shared fact brief. Display fewer numerical claims when needed for readability; retain the necessary qualifiers of every claim actually displayed. Never truncate the complete evidence layer.
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
