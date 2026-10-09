# 仓库协作规则

本文件供 Codex 与 Claude 共用，保留跨任务约束。只在执行对应任务时读取下表中的手册；已读且未变化的文件不重复加载。路径相对于仓库根目录，手册中的命令也从仓库根目录执行。

| 任务 | 必读入口 |
| --- | --- |
| AI 雷达采编、续跑、审阅、发布 | [雷达工作流](docs/agents/radar.md)，或从 [雷达 skill](skills/ai-radar-low-token/SKILL.md) 进入 |
| 信息图生成、返工、验收 | [共用事实清单与图片验收](docs/agents/radar-infographics.md) |
| 日报正文配图、图注与历史回补 | [条目配图与讲解流程](docs/agents/radar-inline-visuals.md) |
| R2 媒体生成、搬迁、故障处理 | [现有媒体交付与 R2 约束](docs/r2-cost-guardrails.md) |
| 排查既有失败模式 | [历史案例](docs/agents/lessons.md)，按需读取 |

## 1. 通用红线（始终生效）

- **不得** 在未获得当前会话明确授权的情况下推送到远端。本地 commit 不等于授权 push；`git push` 与 PR 发布需单独确认。
- 工作树脏时，只 stage 与当前请求明确相关的文件，commit 前先看 `git diff --cached`。
- 未经用户明确要求，不改写 Git 历史、不 force push、不删除远端资产。
- **唯一 push 例外**：AI 雷达日报/周报/月报的发布任务，在所有自检通过后可直接 commit 并 push，无需再次确认。例外范围严格限定为：
  - `src/content/radar/` 下的本期雷达 Markdown
  - `public/images/radar/` 下的本期图片
  - 本期音频 / Deck 的 R2 上传、上传核验及正文引用更新；音频 / PDF 原件不得加入 Git

  历史图片归档、规则、脚本、依赖与 CI 修改不属于此例外。

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
- 更新前先看 `$CODEX_HOME/automations/<automation-id>/automation.toml`（默认在 `~/.codex/automations/`），**保留原有元数据**。
- `kind` 必须与原值完全一致：`heartbeat` 卡片必须用 `kind="heartbeat"` 更新，写成 `cron` 会被 `automation_update` 拒绝。
- 优先做 **全卡片更新**：保留原 `name` / `status` / `rrule` / `targetThreadId` 等字段，只改 prompt 文本。
- 如果 prompt 过长或校验脆弱，把卡片缩成稳定入口，把详细规则迁到本仓库指南里（雷达操作细节见 docs/agents/radar.md）。

---

## 3. AI 雷达与检查入口

- 雷达执行细节、模型路由与发布门槛见 [雷达工作流](docs/agents/radar.md)。手册保留原 §3.1–3.11 编号，便于旧任务继续定位。
- 来源池与发布数字以 [source-pool.json](scripts/radar/source-pool.json) 为准；栏目名与顺序以 [taxonomy.json](scripts/radar/taxonomy.json) 为准。
- 测试按变更范围运行，最终全套 UI 由现有 pre-push hook 执行；无需在无新变化时先手动全跑再让 hook 重跑。不得跳过 hook，失败修正后重跑相关检查；保留暂存范围检查和线上页面/feed 验证。
- pre-commit 检查暂存快照的媒体边界；pre-push 检查待推送提交的媒体边界、Astro 与全套 UI。CI 另跑单元测试与 `check:radar` 六项发布检查。静态媒体检查不证明远端文件可用，发布仍须完成手册 §3.9 的远端核验。

---

## 4. 内容分类（Taxonomy）

- 结构性导航字段：`category`、`academy.series`、`academy.module`、`cadence`、`date`。
- `tags` 仅用于 **跨条目的持久主题**，应能聚合多条内容。
- `tags` **不得** 用作：单条关键词、新闻实体、产品名、课节名、受众切片、一次性概念。
- 条目可以没有 tag——这是合法状态。
- 公开 tag 通常应至少覆盖 **两条** 条目。一次性概念交给搜索、正文或未来的关键词/实体元数据。
- 中日双语 tag 必须保持同一公共分类语义，标签文案可本地化但角色一致。
