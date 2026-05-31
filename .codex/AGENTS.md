# 仓库执行指南（Codex）

> 本文件是 Codex 执行时的稳定参考。自动化卡片应保持短小，把可变细节落在这里。
> 阅读顺序按 Codex 实际执行流程组织：通用红线 → 自动化卡片 → AI 雷达全流程 → 内容分类。

---

## 1. 通用红线（始终生效）

- **不得** 在未获得当前会话明确授权的情况下推送到远端。本地 commit 不等于授权 push；`git push` 与 PR 发布需单独确认。
- 工作树脏时，只 stage 与当前请求明确相关的文件，commit 前先看 `git diff --cached`。
- **唯一 push 例外**：AI 雷达日报/周报/月报的发布任务，在所有自检通过后可直接 commit 并 push，无需再次确认。例外范围严格限定为：
  - `src/content/radar/` 下的雷达 Markdown
  - `public/images/radar/`、`public/audio/radar/` 下的对应资源
  - 雷达 Slide / Deck 输出
  即使在例外内，仍需：只 stage in-scope 文件、检查 cached diff、若检查失败或会带入无关改动则 **停止而非 push**。

### 1.1 GitHub Pages / UI QA

- 本站部署在 GitHub Pages 项目路径下，CI 中的 base path 通常是 `/GoodGoodStudyDayDayAI/`；本地默认 `/` 不能代表真实部署环境。
- 浏览器可见 URL、Playwright selector 里的 `href` / `src`、静态资源解析都不要硬编码根路径。优先使用现有 helper：测试里用 `appPath(...)`，路径解析工具里用 `resolveAppBasePath()`。
- 静态资源 QA 要先把部署 URL 规范化成本地文件路径：去掉 query / hash，剥离 app base path，再映射到 `dist/` 或 `public/`。不要把带 `/GoodGoodStudyDayDayAI/` 的 pathname 直接 `path.join(distRoot, ...)`。
- 涉及 UI、链接、图片、音频、构建产物引用的改动，至少用 GitHub Pages base path 环境跑一次相关验证：
  - `GITHUB_REPOSITORY=Zhongfu-Mao/GoodGoodStudyDayDayAI npm run build`
  - `GITHUB_REPOSITORY=Zhongfu-Mao/GoodGoodStudyDayDayAI npx playwright test <相关 spec> --workers=1 --reporter=list`
- `npm run test:ui`、`npm run test:ui:headed`、`npm run test:ui:update-snapshots` 应默认模拟 GitHub Pages 项目路径；只有明确需要根路径调试时才使用 `npm run test:ui:root`。
- 使用 `astro:assets` 的 `<Image>` / `<Picture>` 指向 `public/` 下的绝对路径时，仍要先通过 `resolveSiteUrl(...)` / `withBase(...)` 补 base path；不要假设组件会自动给 public asset 加 `/GoodGoodStudyDayDayAI/`。
- 内容会持续增长的页面不要在测试里硬编码实时数量（例如 `26 篇内容`）。优先验证结构、可见性、筛选/切换行为、链接和资源存在；数量只在稳定业务规则需要时断言。
- 若远端 Actions 在本地通过后失败，先抓取 CI 日志并判断是否属于同一类环境假设（base path、Linux/macOS 差异、超时、截图基线、CI-only env）。修复时优先补系统性 helper 或测试工具，而不是只改眼前一个 selector。

---

## 2. 自动化卡片（Automation Cards）

- 卡片是 app 级状态，**不会** 出现在 `git diff` 中。
- 更新前先看 `/Users/maozhongfu/.codex/automations/<automation-id>/automation.toml`，**保留原有元数据**。
- `kind` 必须与原值完全一致：`heartbeat` 卡片必须用 `kind="heartbeat"` 更新，写成 `cron` 会被 `automation_update` 拒绝。
- 优先做 **全卡片更新**：保留原 `name` / `status` / `rrule` / `targetThreadId` 等字段，只改 prompt 文本。
- 如果 prompt 过长或校验脆弱，把卡片缩成稳定入口，把详细规则迁到本仓库指南里（即本文件）。

---

## 3. AI 雷达工作流

`daily-ai-radar-plus` 卡片应保持短小并指回本节。以下为权威操作细节。

### 3.1 触发与排期

每次触发按以下顺序执行：

1. **总是** 先生成当日日报。
2. 若本地日期为 **周一**，在日报之后再生成上一个 ISO 周的周报。
3. 若本地日期为 **当月 1 号**，在日报之后再生成上一个自然月的月报。

### 3.2 用户停止指令（最高优先级）

当用户说出 `不用重跑` / `先发布` / `停止生成` 或等价表达时：

- 立即停止新的抓取与资源再生成。
- 保留当前最佳可发布状态。
- 后续动作：先做校验；若用户措辞包含 `发布` / `先发布` 等明确发布意图，且当前状态符合 §1 的 AI 雷达发布例外（自检通过 + 仅 in-scope 文件），则 commit / push；否则只汇报状态、等待用户决定，**不要** 默认推送。
- "停止生成" / "不用重跑" 单独出现时默认理解为 **暂停重跑**，不等于授权发布。

### 3.3 抓取来源与优先级

**主路径必须统一调用 `scripts/radar/fetch-url.mjs`，禁止现写 `node -e ...` / 临时 fetch 脚本 / curl 直连**——这是为了让 Codex 沙箱一次性放行 `node scripts/radar/fetch-url.mjs *`，避免每次抓取重复提权。

调用约定：

```
node scripts/radar/fetch-url.mjs <url> [--mode auto|html|rss|readability|raw]
                                       [--timeout 20] [--retries 2]
                                       [--ua chrome|safari|firefox|<custom>]
```

- 默认 `--mode auto`：按 content-type / 文件头自动判定 RSS 还是 Readability 抽正文。
- `--ua` 默认 `chrome`，伪装成主流桌面浏览器。需要其他 UA 时显式传入。
- 输出单行 JSON 到 stdout，失败 exit code 非 0；解析 `ok` / `error` / `article` / `feed` / `body` 字段。

| 优先级 | 路径 | 使用场景 |
| --- | --- | --- |
| 默认 | `node scripts/radar/fetch-url.mjs <url>` | RSS、公开 HTML、静态文章页、批量候选列表的快速抓取主路径 |
| 主要工具 | Chrome 插件（`chrome:Chrome`） | 真实浏览器环境下的信息获取与质检：重 JS 渲染、Readability 抽取为空、日期或直链不确定、聚合页需确认原文、challenge / 登录墙 / 订阅墙、需要登录态或用户 Chrome 扩展环境的页面、最终采样 QA |
| 可用补充 | Browser Use / in-app browser | Chrome 插件不可用、或只需无登录态的本地页面 / 轻量浏览器验证时使用 |
| **不得作为主路径** | Web 搜索 / WebFetch / 搜索引擎结果页 | 仅在已知具体 URL 在主路径与 Chrome / Browser Use 都失败后，作为最后的定位手段。原因写进最终报告或 runlog，**绝不写进公开 Markdown** |

如果发现 `fetch-url.mjs` 行为不满足需求（例如需要新的 mode、UA 池、cookie 支持），改脚本本身，**不要** 绕过它另起命令——绕过会再次破坏免提权自动化。

#### 3.3.1 来源池角色

`scripts/radar/source-pool.json` 是日报来源池的版本化权威配置。每次日报都必须按其中角色执行，并在非公开 runlog / audit 中记录巡检结果。

来源角色：

- **activeCoreSources**：每日必须巡检的发现源，包括 The Rundown AI、Latent.Space / AINews、Daily Dose、Every、ByteByteGo、老范讲故事、The Batch / DeepLearning.AI、Ahead of AI、AI Valley、Programmer Weekly。
- **officialConfirmationSources**：只保留 OpenAI、Anthropic、Google / Gemini / DeepMind 三家，可主动看重大更新，也用于确认核心水源提到的事实。
- **trendSources**：GitHub Trending / repo 趋势，用于第五象限 `GitHub 热门 repo & 趋势追踪`。
- **canonicalConfirmationSources**：Hugging Face、arXiv、paper、project、repo 等只作为 canonical 确认入口；不要把它们当每日主动水源撒网。
- **excludedActiveSources**：AWS、Meta、Microsoft、NVIDIA 不做主动日常抓取。若确有大新闻，通常应由核心水源或用户指令先指向，再追官方原文确认。

公开 Markdown 只呈现读者内容；来源巡检清单、失败原因、丢弃候选、去重过程写入审计记录，不写进正文。

Chrome 插件使用规则：

- 当某个来源近期反复被 HTTP / Readability 判定为空、challenge 或低质量时，优先用 Chrome 插件复核，不要直接判定抓取失败。
- Chrome 插件拿到聚合页正文后，优先继续打开文内官方链接 / 项目链接 / GitHub / 文档，最终日报条目尽量引用 canonical 原始来源；聚合站作为摘要来源或发现入口。
- Chrome 插件支持多标签并行抓取，尤其适合 `The Rundown AI` 这类“主页候选 + 多篇文章页 + 官方原文链接确认”的流程。可以同时打开多个临时 tab 抽取正文、日期与链接，不必退回到串行浏览。
- 但 Chrome 并行必须有 **单一 browser owner**：由主智能体或一个明确指定的浏览器 worker 统一创建、命名、复用和清理 Chrome 标签页。不要让多个子智能体各自 claim 用户 tab、各自 `finalize`、或在同一浏览器会话里无协调地抢状态。
- Chrome 侧失败才记录为该来源失败；不得把 HTTP 抓取失败直接等同于站点失败。
- 使用 Chrome 插件时，结束前按插件规则清理临时标签；除非用户需要接手页面，否则不保留研究标签。

The Rundown AI 站点级规则：

- `The Rundown AI` 默认使用 Chrome 插件抓主页与文章页。HTTP 只做快速探测，不作为失败判定。
- 从主页读取 `Latest Articles` 的可见标题、摘要与文章相对链接，再用 Chrome 多标签并行打开候选文章页确认日期、正文与文内原始链接。
- 日报中优先引用文内官方链接（例如 OpenAI、Google、Anthropic、GitHub、产品官网）；若官方链接不足以承载 The Rundown 的聚合摘要，再引用 The Rundown 文章页。
- 只有 Chrome 文章页也遇到登录墙、订阅墙、challenge 或正文不可读时，才把该条写入最终汇报的失败原因；不要把失败记录写入公开 Markdown。

子智能体 / 并行拆分边界：

- 可以使用子智能体提速无副作用任务：候选文章阅读摘要、条目评分、栏目配额检查、前两天去重审稿、中日一致性检查、禁词扫描结果复核。
- Chrome 抓取可以并行，但只通过一个 browser owner 管理标签页；其他子智能体可以消费已抽取的正文 / JSON / 候选清单，不直接争用同一 Chrome 会话。
- Gmail 读取后可让子智能体辅助判断内容价值，但 **标记已读** 只能由主智能体在中日 Markdown 成功落盘并自检后统一执行。
- Git stage / commit / push、NotebookLM asset 生成与下载、Chrome tab cleanup 这类有副作用步骤必须由主智能体收口，不分散给多个 worker。

### 3.4 公开 Markdown 红线

`src/content/radar/` 下的 Markdown 是面向读者的产物。**禁止出现**：

- 本地路径
- 质检备注、Gmail 内部信息、`mail.google.com`、message ID
- Chrome 插件 / Browser Use / curl / WebFetch / 回退日志
- 去重备注、失败记录、已读区间
- 来源采集清单
- 编辑视角措辞，如 `Newsletter 内引用`

### 3.5 内容密度与 Newsletter

- 日报目标密度：**12–16 条**，其中 **2–4 条 Newsletter**（前提是有足够高信号邮件）。
- 日报栏目固定为六段，不得按当天候选动态改名：
  1. `AI Engineering & 架构`
  2. `模型前沿 & 算法探索`
  3. `实战代码 & 工具库`
  4. `行业与商业快讯`
  5. `GitHub 热门 repo & 趋势追踪`
  6. `📬 Newsletter 精选`
- 日文版使用 `scripts/radar/taxonomy.json` 中对应日文栏目名，栏目顺序必须和中文一致。
- 第五象限不是普通 GitHub 摘要，只收与 AI / agent / data science 相关、具备真实 docs / demo / release 证据、且有明显 star velocity 或主流源提及的 repo / project。
- Newsletter 来源在 Daily Dose of Data Science / AI Valley / Every 等高信号源之间 **保持平衡**，不要反复倚赖单一发件人。
- Newsletter 是一等信号，不是杂项附录：
  - 模糊匹配 Gmail 标签 `AI Newsletter` 与 `AI Newsletter📰`。
  - 尽量找到公开文章 / 项目 / GitHub / 文档链接。
  - 只把 **真正写入雷达** 的未读邮件标记为已读。
- `📬 Newsletter 精选 / 精選` 必须保持读者向条目格式，不能写成来源分布、采用数量或后台采编摘要：
  - 每条使用 `### 标题`，并包含来源/出典、日期/日付、链接/リンク、摘要/要約。
  - 只有 Gmail 原件或公开 newsletter 原文明确确认过的条目才能进入该段；若来自公开 newsletter 页面而非 Gmail，最终汇报要说明确认路径。
  - 同一个 newsletter 主题只能出现一次；若已经放入 `📬 Newsletter 精选 / 精選`，不要再在正文其他栏目重复同一条完整条目；同一公开链接不要在该段重复成多条。
  - 发布前运行 `npm run check:radar-newsletter`，防止 `本期采用`、`homepage update`、来源分布摘要等格式漂移进入公开 Markdown。
- 若某条 Newsletter 没有公开链接：
  - 中文写 `链接：暂无公开直链`
  - 日文写 `リンク：公開版リンクなし`
  - **绝不** 暴露 Gmail 链接或 message ID。

### 3.6 去重规则

针对今天已有草稿 + 前两天日报做去重，依据：

- 规范化 URL
- 同源同主题指纹
- Newsletter 身份（发件人 + 主题）

若同一主题确有新增信息，标注为 **持续追踪**，只总结增量。

### 3.7 内容冻结（关键步骤）

资源生成前 **冻结** Markdown 内容。冻结后：

- frontmatter 资源 URL 回填、格式微调、发布检查 **不触发** 资源再生成。
- 仅当读者可见内容真正变化时才重新生成资源。

### 3.8 资源生成

- **日报代表图**：冻结 Markdown 后、生成 NotebookLM 信息图前，先跑 `npm run radar:images`，从日报里的原始链接补入外链代表图；NotebookLM 信息图继续写入 `coverImage` 作为顶部封面。
- **日报**：中日双语的信息图与音频分支独立生成。
- **周报 / 月报**：Audio、Slide/Deck、Infographic 必须 **全部生成**，或在报告中明确说明不可用原因。
- **周报 / 月报音频**：commit 前必须跑仓库的音频压缩路径，避免发布原始 NotebookLM MP3。
- **日文信息图**：必须人工目视检查。文字严重乱码或不可读时，降低文字密度重生一次，或回退到最近稳定的 NotebookLM 版本。**禁止** 在未说明的情况下提交明显不可读的日文信息图。

### 3.9 发布前检查

1. 跑 `npm run check`。
2. 跑雷达专项检查：
   - `npm run check:radar-newsletter`
   - `npm run check:radar-sources`
   - `npm run check:radar-schema`
   - `npm run check:radar-dedupe`
3. 若 Astro 报 duplicate content IDs（生成 Markdown 替换后常见），跑 `./node_modules/.bin/astro sync --force`，再 `npm run check`。
4. commit 前依次看：
   - `git status --short`
   - `git diff --cached --stat`
   - `git diff --cached --name-status`
5. 任一步骤发现无关文件被带入，**停止并报告**，不要 push。
6. 全部通过后，按 §1 的发布例外条款 commit + push。

### 3.10 RSS / Podcast Feed 验证（发布后）

RSS 与 Podcast XML 是构建产物，**不要** 直接手改或提交 `dist/*.xml`。日报 / 周报 / 月报发布后，只验证 feed 是否随内容自动更新。

发布后检查：

1. 在本地构建产物中确认：
   - `dist/feed.xml`
   - `dist/ja/feed.xml`
2. 新增音频条目必须出现在中日 podcast feed 中，且 `<itunes:image>` / `<image><url>` 继续指向当前播客封面。
3. 推送并等待 GitHub Pages deploy success 后，抓取线上：
   - `https://zhongfu-mao.github.io/GoodGoodStudyDayDayAI/feed.xml`
   - `https://zhongfu-mao.github.io/GoodGoodStudyDayDayAI/ja/feed.xml`
4. 线上 feed 必须能看到本次新增 episode；若 GitHub Pages 缓存尚未刷新，在最终汇报中说明“远端部署已成功但 feed CDN 缓存待刷新”，不要因此重跑内容或资产。
5. CI 发布构建必须先刷新 Astro content layer，再上传 Pages artifact；当前 workflow 通过 `astro sync --force`、`npm run build` 和 `npm run check:radar-build` 保证最新日报页面、sitemap 与中日 feed 已进入 `dist`。

### 3.11 NotebookLM 笔记本清理（防止配额爆掉）

NotebookLM 有 notebook 数量上限。日 / 周 / 月每次都会新建中日两个 notebook，**不清理必爆**。
清理时机为 **对应 cadence 发布（commit + push）成功之后**，发布失败时不删。

| 触发 | 清理对象 | 名称匹配 |
| --- | --- | --- |
| **周报发布成功** | 上一 ISO 周 Mon–Sun 的 daily notebook | 仅限仓库脚本识别的 `ai-radar-daily-*` 或真实生成标题 `AI 雷达日报：YYYY-MM-DD` / `AIレーダー日報：YYYY-MM-DD`，且日期落在该周窗口内 |
| **月报发布成功** | 上一自然月的 weekly notebook | 仅限仓库脚本识别的 `ai-radar-weekly-*` 或真实生成标题 `AI 雷达周报：START 至 END` / `AIレーダー週報：START〜END`，且起止日期完全落在该月窗口内 |

清理红线：

- **绝不** 删除当前 cadence 自身的 notebook（周报跑完不删本周 weekly，月报跑完不删本月 monthly）。
- **绝不** 跨 cadence 误删（不要在周报里删 weekly / monthly，不要在月报里删 daily）。
- **绝不** 触碰仓库清理脚本无法识别为 AI 雷达日 / 周 / 月资产的 notebook。
- 跨月窗口的 weekly notebook（起止日期不完全落在目标月内）**保留**。
- 删除前先把 `{notebook_id, name, deleted_at, cadence_trigger}` append 到仓库根的 `.ai-radar-cleanup-log.jsonl`。
- 清理失败 **不阻塞** 发布结果；在最终汇报中单独列出未删除项与原因，下次触发时重试。

统一调用仓库脚本，不要手写 `notebooklm delete` 循环：

```
# 周报发布成功后：清理刚发布周窗口内的日报 notebook
npm run radar:notebook-cleanup -- --cadence weekly --execute

# 月报发布成功后：清理刚发布月窗口内、完全落在该月的周报 notebook
npm run radar:notebook-cleanup -- --cadence monthly --execute
```

需要补清历史窗口时显式传参，例如：

```
npm run radar:notebook-cleanup -- --cadence weekly --week-start 2026-05-04 --execute
```

---

## 4. 内容分类（Taxonomy）

- 结构性导航字段：`category`、`academy.series`、`academy.module`、`cadence`、`date`。
- `tags` 仅用于 **跨条目的持久主题**，应能聚合多条内容。
- `tags` **不得** 用作：单条关键词、新闻实体、产品名、课节名、受众切片、一次性概念。
- 条目可以没有 tag——这是合法状态。
- 公开 tag 通常应至少覆盖 **两条** 条目。一次性概念交给搜索、正文或未来的关键词/实体元数据。
- 中日双语 tag 必须保持同一公共分类语义，标签文案可本地化但角色一致。
