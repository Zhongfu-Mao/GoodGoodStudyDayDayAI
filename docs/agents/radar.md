# AI 雷达工作流

雷达任务的权威操作细节；通用约束与 Git 权限见 [根目录 AGENTS.md](../../AGENTS.md)。本文件保留原 §3.1–3.11 章节编号。`daily-ai-radar-plus` 自动化和 skill 只引用此入口；来源配置、运行记录、图片验收分别按阶段读取。

配置中的来源名单、发布门槛和栏目标题分别以 `scripts/radar/source-pool.json`、`scripts/radar/taxonomy.json` 为准；本文保留配置尚未表达的编辑规则与例外。账户、标签 ID、实际用量、任务 ID 和恢复状态只写入忽略的本地 runlog / audit，不进入公开文件。

### 3.1 触发与排期

#### 低 token 执行约定

- 日常执行入口为 `skills/ai-radar-low-token/SKILL.md`。本指南的来源、公开内容、权限和发布规则仍有效；已经读过且未改变的手册不按资产重复加载。
- **等待由程序承担**：NotebookLM 状态轮询留在生成脚本内部。主模型不每分钟读取进程、重读上下文、组织“仍在等待”的回复；只在完成、明确失败、超时需处理或用户询问时接手。普通 sleep/API 轮询不是模型推理；反复唤醒主模型才会增加上下文开销。
- 工具调用能返回完成结果时直接接结果；跨回合后台任务保存 `stateFile`、日志路径、日期/语言和 notebook/artifact ID。后台进程完成不等于平台必然会自动唤醒模型，不能承诺未建立的通知。确需自动接手时使用产品支持的后续检查，每轮检查一次；不要让另一个模型只负责轮询。
- **不把生产日报排期当等待器**：默认不为单个生成任务反复修改每日自动化的 rrule。现有“一任务一个 heartbeat”限制下，优先保持原日程并在用户下一次继续时读状态；只有用户明确接受临时复用时，才备份完整卡片、设恢复条件并恢复。不得绕过限制另建 cron/daemon。无后续检查就如实说明需要用户触发继续。
- 超时仅表示等待预算用尽，不等于服务端生成失败。保留原任务，下一次先查准确 ID；网页生成或重试导致 ID 改变时，核实实际完成的资产。限额按实际提示处理，5 小时窗口也受周额度约束，不盲目连续重生。
- **限额必须到网页确认**：遇到 NotebookLM 明确限额后立即停止新增生成，通过 Chrome 打开账号的 usage 页面，确认当前窗口与周额度的已用比例、各自恢复时间，并在私有 runlog 记录检查时间、页面显示的原始时间文本、可确认的时区、notebook/artifact ID 和停止阶段。只有时区与日期明确时才换算绝对恢复时间；网页不可用或数值不可读则记录“未确认”及原因，不能猜测。普通 `GENERATION_FAILED` 不等于额度耗尽，`auth check` 也不检查额度。恢复时间只是页面预计时间，不证明额度已恢复；继续时复核网页实际用量并先检查原任务，避免重复生成。用量记录不得进入公开 Markdown；不默认修改自动化排期或频繁轮询。
- **数据留磁盘，短结果进上下文**：公开抓取用 `node scripts/radar/fetch-url.mjs URL --compact --cache-dir tmp/radar-fetch/DATE`，完整 JSON 留私有缓存并复用。构建/测试/生成/推送用 `run-step.mjs`，完整日志留本地，失败仅读必要尾部。禁止把 HTML、长构建日志、图片 base64 或原始 imagegen 对象当文字回传。摘要不能替代原文核实。
- `run-step` 的普通 success 仅表示进程正常退出；必须产出正文的委派加 `--require-output` 拒绝空/纯空白 stdout。stderr 诊断不算正文；该检查仍不替代 schema、证据和内容验收。
- **批量委派要验收**：按下方路由表选择主审、默认 worker 和失败回退 worker。主审负责选题、证据边界、日期/历史去重、重要事实、视觉验收、审计编排和外部写入。默认 worker 只执行有明确证据的批量摘要/翻译/分析；不可用、空输出、格式失败或内容不合格时，由主审把失败任务包交给回退 worker，复用已通过验收的部分。任务包提供精简输入、输出 schema、证据引用与验收标准，不继承整段对话，不传凭据或原始 Gmail，不默认多模型重复审核。
- 材料不足先由主审补证据，不靠换模型猜测；明确本地输入错误修正后可重试一次，权限失败不得绕过，无诊断空输出不循环重试。回退 worker 仍失败由主审收口并记录，不扩展模型链。脚本承担机械检查和等待，任何模型都不专职轮询。
- 使用当前 `antigravity-delegate` 验证封装：文件任务加 `--require-file-tools`，用 `-o` 保留私有事件/诊断；要求退出码正常、`validation: PASSED`、非空结果并通过内容检查。**退出码 0 不等于有效交付**；空输出、拒绝读取、未终结或格式错误均不算成功。修正明确的本地输入错误后才重试；无诊断的空输出不循环重试，不把短 smoke test 当整批可靠性证明。
- 日报音频默认 `default` 档位和 `brief` 输入，周/月报保留 `long`。保留原始音频，转码前后时长误差不超过 1 秒，检查完整解码和结尾。每个目标文件仅一个写入者；禁止在生成/转码仍运行时复制覆盖同一路径。
- 图片只因实质错误（事实/日期错误、主要文字不可读、重要内容缺失）返工；已获用户认可的熟悉风格不再反复打磨。额外后端实验不默认启动。正文冻结后，元数据/格式小改不重生资产。
- 测试遵守根目录 AGENTS.md §3；发布前仍须完成本手册 §3.9 的全部专项检查。
- 私有记录区分：进程状态、交付验收、模型调用次数/失败、资产尝试次数和可观测用量。字符缩减不冒充计费 token 节省；没有整期对照数据就不宣称总体节省百分比。用户暂停或仅指定一个补稿日期时，不扩展到其他历史缺口。

#### 模型路由（仅此表维护当前选择）

| 角色 | 当前模型 / 档位 | 范围 |
| --- | --- | --- |
| 主审 | Astra | 证据选择、范围、审计编排、最终验收和发布 |
| 默认 worker | Gemini Flash；明确片段提取/翻译用 `gemini-3.8-flash-low`，有边界的综合用 medium | 已有证据的批量任务 |
| 失败回退 worker | `gpt-5.6-sol`，`medium` | 仅接手默认 worker 不可用或未通过验收的任务包 |
| 禁用 | Spark | 不参与本工作流 |

委派前读取当前 `antigravity-delegate` skill，使用其验证封装；旧的裸 `agy --print` 不再适用。文件任务加 `--require-file-tools`，用 `-o 新目录` 保留事件与诊断；它不是 OS 保密沙箱，不传凭据或未经授权的私密材料。模型列表存在或小样本成功只证明可调用，不证明整批可靠性；不得为凑栏目采纳错误候选。

每次触发按以下顺序执行：

1. **总是** 先生成当日日报。
2. 若本地日期为 **周一**，在日报之后再生成上一个 ISO 周的周报。
3. 若本地日期为 **当月 1 号**，在日报之后再生成上一个自然月的月报。

#### 续跑与状态恢复

先看该日期的正文、私有 run record、资产文件及准确 notebook/artifact ID，辨别是采编、生成中、等待超时、待验收还是待发布。只处理用户指定范围；旧缺口不阻断当前已授权日报，暂停不因新的 heartbeat 自动解除。

- `node scripts/radar/run-step.mjs --status STATE_FILE`：恢复时读一次状态；生成中且无独立工作就结束本轮，由脚本轮询。
- 构建/测试/生成入口为 `node scripts/radar/run-step.mjs -- COMMAND ARGS...`；必须有正文输出的委派加 `--require-output`。
- imagegen 只用专用图片展示函数，文字输出限文件路径和必要元数据。
- 正文和资产预览保留 draft；实际发布仍按根目录权限和 §3.9 检查执行。

### 3.2 用户停止指令（最高优先级）

当用户说出 `不用重跑` / `先发布` / `停止生成` 或等价表达时：

- 立即停止新的抓取与资源再生成。
- 保留当前最佳可发布状态。
- 后续动作：先做校验；若用户措辞包含 `发布` / `先发布` 等明确发布意图，且当前状态符合根目录 AGENTS.md §1 的 AI 雷达发布例外（自检通过 + 仅 in-scope 文件），则 commit / push；否则只汇报状态、等待用户决定，**不要** 默认推送。
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

来源角色（具体名单、地址、访问策略读取配置）：

- **activeCoreSources**：每日必须巡检的发现源。
- **officialConfirmationSources**：可主动看重大更新，也用于确认核心水源提到的事实。
- **trendSources**：第五栏目趋势追踪的发现源。
- **canonicalConfirmationSources**：原始论文、项目、repo 等确认入口，不作为无边界的每日主动水源；试行例外以下方 supplemental 配置为准。
- **excludedActiveSources**：不主动日常抓取；大新闻由核心水源或用户指令指向后再确认。
- 2026-09-28 用户批准三个补充发现源试行，见 `scripts/radar/source-pool.json` 的 `supplementalDiscoverySources`；这是原有 HF 仅确认规则的窄例外，不开放社区热门榜泛抓。补充源不替代 active-core 配额、不降低日期/证据/去重门槛。私有记录按源保存新增候选、验收/拒绝原因及重复率，后续据实际收益评估去留。

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

#### 3.4.1 读者口吻与审计口吻分离

公开正文只写给读者看的内容：事件是什么、为什么重要、对工程 / 产品 / 行业意味着什么。采编判断、入选理由、去重理由和执行状态必须进入非公开 audit / runlog，不得进入 Markdown 正文。

禁止在公开正文中出现以下类型措辞：

- `这条适合放在...`、`这个信号适合作为...`、`值得放入观察名单`
- `前两天已经写入`、`不重复收录`、`已采用`、`本期采用`
- `采集到`、`抓取失败`、`低置信`、`复核路径`、`去重`
- `正文里`、`本文中已经`、`本条目适合...栏目`
- 任何面向编辑 / 审计 / 自动化执行者的解释

需要保留判断时，改写成读者向事实归纳：

- 不写：`这个信号适合作为 Newsletter 精选，因为...`
- 改写：`这把 self-improvement 从模型训练扩展到实验室工作流。`
- 不写：`这个条目适合放在行业栏，因为...`
- 改写：`AI 基础设施正在从更多 GPU 扩展成能源、水资源、劳动力、教育和地方政治的组合工程。`

### 3.5 内容密度与 Newsletter

- 日报总条数目标、最低条数、来源族/active-core/Newsletter 下限和占比上限以 `source-pool.json` 的 `publicationGate` 为准。Newsletter 编辑目标仍为 **2–4 条**（前提是有足够高信号邮件）；不为满足数字而降低证据质量。
- 日报使用 `taxonomy.json` 的 `daily.zh` / `daily.ja` 栏目名与顺序，不得按当天候选动态改名；中日栏目顺序必须一致。
- 第五象限不是普通 GitHub 摘要，只收与 AI / agent / data science 相关、具备真实 docs / demo / release 证据、且有明显 star velocity 或主流源提及的 repo / project。
- 第五象限默认、通常上限与主线上限以 `scripts/radar/editorial-policy.json` 为准；只有当天 GitHub 本身是主线时才可扩到主线上限，且必须在 audit 记录理由。GitHub 候选若更像实战资源、教程、抓取框架、RAG 工程范例，应放入 `实战代码 & 工具库`，不要为了填第五象限而挤压模型、工具、行业栏目。
- 冻结正文前必须按 `editorial-policy.json` 做栏目配额复核：趋势超过默认条数、模型或工具不足对应下限时，先重新审视来源池和候选分类；禁止用“最低条数达标”替代栏目均衡。
- 栏目内也要做来源平衡检查，不能只依赖全篇 source diversity 通过：
  - 同一常规栏目内，单一 official confirmation source 默认最多 1 条。
  - 若同一栏目确需保留第 2 条同一 official source，必须满足：该事件由 activeCoreSources 明确触发，且 audit 记录保留理由与替代候选。
  - `行业与商业快讯` 尤其要避免被 OpenAI / Anthropic / Google 任一官方源占据多数；若出现 3 条里 2 条来自同一官方源，优先从 activeCoreSources 中寻找可替代的组织采用、市场、产业链、资本、政策或产品化信号。
  - official source 的公司治理 / 政策声明若没有 active core 触发，优先级低于 active core 的高信号产业 / 组织采用条目。
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

#### 3.5.1 邮件覆盖与时间窗口

- 邮件覆盖：先枚举实际标签，合并 `AI Newsletter` / `AI Newsletter📰` 父标签与所有子标签，并覆盖已知开发者 Newsletter 标签；再按已确认发件地址补查（例如 ByteByteGo 使用 `bytebytego@substack.com`，不能仅查品牌域名）。按明确日期窗口检索，不以 unread 作为发现条件，遍历分页并按 message ID 去重。父标签零命中不能宣称无邮件；正文采用前保持邮件状态不变。记录接收时间与日报截止时间，晚到邮件进入下一期，补刊另行明确覆盖窗口。
- 补查发件地址读取 `source-pool.json` 的 Gmail fallbacks，不再复用猜测的品牌地址。日本时间窗口用显式 `+09:00` 起止时间换算 Unix 秒后检索 `after:秒 before:秒`，并按接收时间复核边界；不要把 Gmail 的日期字符串默认当日本时间。标签未读数字只表示积压，不表示当天候选数量或已审阅状态。

### 3.6 去重规则

针对今天已有草稿 + 前两天日报做去重，依据：

- 规范化 URL
- 同源同主题指纹
- Newsletter 身份（发件人 + 主题）

若同一主题确有新增信息，标注为 **持续追踪**，只总结增量。

- 同主题不等于重复：对照已刊摘要核对新增实验、实现、约束或使用经验；有实质增量时按 §3.6 写为持续追踪并保留原始日期。不能只因模型/产品名称相同而拒绝，也不能用新标题或新 URL 重复旧事实。URL 去重门槛保持不变；被拒候选记录具体重复点。判定不足时分别记录窗口内新内容、晚到内容和未审阅历史候选；扩大补刊窗口仍需用户授权。

### 3.7 内容冻结（关键步骤）

资源生成前 **冻结** Markdown 内容。冻结后：

- frontmatter 资源 URL 回填、格式微调、发布检查 **不触发** 资源再生成。
- 仅当读者可见内容真正变化时才重新生成资源。

### 3.8 资源生成

- **日报正文配图**：按 [条目配图与讲解流程](radar-inline-visuals.md) 选图、写中日图注和验收。每期通常在不同栏目穿插 3–5 张有解释价值的条目配图；顶部信息图与开头代表图不计入。每张图都要有来源和读图讲解，不能只完成封面就视作图文编排完成。已验收清单通过 `npm run check:radar-visuals` 检查，历史回补范围以用户当前指令为准。
- **日报代表图**：冻结 Markdown 后、生成 NotebookLM 信息图前，只有在 frontmatter 显式写入 `representativeImageSource` 时才跑 `npm run radar:images` 补入外链代表图；禁止脚本从普通正文链接里猜测“第一张可用图”。`representativeImageSource` 必须来自本期明确主线或审计记录里的 lead item。若无明确 lead item，宁可不插入外链代表图。NotebookLM 信息图继续写入 `coverImage` 作为顶部封面。
- **日报**：中日双语的信息图与音频分支独立生成。
- **周报 / 月报**：Audio、Slide/Deck、Infographic 必须 **全部生成**，或在报告中明确说明不可用原因。
- **音频压缩**：沿用现有日 / 周 / 月脚本在上传前调用的压缩路径；日报当前为单声道 64 kbps MP3，并检查转换前后时长误差不超过 1 秒。不在生成完成后再重复转码。继续保留原件并核验完整解码与结尾；R2 上传与本地缓存策略见 `docs/r2-cost-guardrails.md`。
- **共用信息图输入**：正文冻结后执行 `node scripts/radar/generate-infographic.mjs --file 正文.md --brief-only`；NotebookLM 与内置 imagegen 复用 `.cache/radar-infographic/<slug>/` 的同一事实清单和各自 prompt。内容与验收契约见 `docs/agents/radar-infographics.md`；默认 standard，不再要求五个分支或补造因果。
- **NotebookLM 信息图**：水印是 NotebookLM 的预期输出，不作为失败标准；真正的失败标准是信息密度不足、明显伪字 / 错字、事实数字漂移、栏目缺失、把正文具体条目改成泛泛图标或口号。
- **日文信息图**：必须人工目视检查。文字严重乱码或不可读时，降低文字密度重生一次，或回退到最近稳定的 NotebookLM 版本。**禁止** 在未说明的情况下提交明显不可读的日文信息图。
- **imagegen 信息图**：遵守 `docs/agents/radar-infographics.md` 中的 imagegen 专用规则；imagegen 产物不得有 NotebookLM 水印、伪水印、签名或 logo mark。不要把 NotebookLM 的水印标准误用于拒绝 NotebookLM 本身。

### 3.9 发布前检查

下列检查均保留；`npm run check:radar` 聚合原四项与新增的媒体、编辑检查。完整 UI 仍由 hook 执行，不无故重复。

1. 跑 `npm run check`。
2. 跑雷达专项检查：
   - `npm run check:radar-newsletter`
   - `npm run check:radar-sources`
   - `npm run check:radar-schema`
   - `npm run check:radar-visuals`：校验已纳入配图清单的日报中日对应、条目位置、图片校验和及图注；不替代目视验收。
   - `npm run check:radar-dedupe`
   - `npm run check:radar-media`：阻止重媒体进入 Git，并校验非草稿音频 / PDF 的批准主机、路径与音频长度字段。
   - `npm run check:radar-editorial`：新一期公开文案泄漏与栏目均衡；精确模式检查不替代人工审稿。合法技术讨论不得因单独出现“去重”或“curl”误拒。需人工认可的栏目 / 文案例外写入 `editorial-policy.json` 的精确文件与规则条目，提供具体公开理由，完整证据仍留私有 audit；隐私泄漏和硬上限不能豁免。
   - 本期媒体另跑 `node scripts/check/radar-media.mjs --file 本期正文.md --file 本期日文正文.md --verify-remote`，验证公开 URL 的状态、MIME、Content-Length 与 `audioSize`；失败时保留草稿并修复，不能把静态检查通过当远端验证成功。重媒体原件只留本地缓存及 R2，不 commit。历史归档不属发布免确认范围。
3. 若 Astro 报 duplicate content IDs（生成 Markdown 替换后常见），跑 `./node_modules/.bin/astro sync --force`，再 `npm run check`。
4. commit 前依次看：
   - `git status --short`
   - `git diff --cached --stat`
   - `git diff --cached --name-status`
5. 任一步骤发现无关文件被带入，**停止并报告**，不要 push。
6. 全部通过后，按根目录 AGENTS.md §1 的发布例外条款 commit + push。

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
资产脚本可在成功路径使用 `--no-keep-notebook` 防止自动化临时本淹没 NotebookLM 工作区；但失败 / 卡住 / artifact 未返回时必须保留 notebook 供追溯，不能因为传了 `--no-keep-notebook` 就在失败路径删除。

| 触发 | 清理对象 | 名称匹配 |
| --- | --- | --- |
| **周报发布成功** | 上一 ISO 周 Mon–Sun 的 daily notebook | 仅限仓库脚本识别的 `ai-radar-daily-*` 或真实生成标题 `AI 雷达日报：YYYY-MM-DD` / `AIレーダー日報：YYYY-MM-DD`，且日期落在该周窗口内 |
| **月报发布成功** | 上一自然月的 weekly notebook | 仅限仓库脚本识别的 `ai-radar-weekly-*` 或真实生成标题 `AI 雷达周报：START 至 END` / `AIレーダー週報：START〜END`，且起止日期完全落在该月窗口内 |

清理红线：

- **绝不** 删除当前 cadence 自身的 notebook（周报跑完不删本周 weekly，月报跑完不删本月 monthly）。
- **绝不** 跨 cadence 误删（不要在周报里删 weekly / monthly，不要在月报里删 daily）。
- **绝不** 触碰仓库清理脚本无法识别为 AI 雷达日 / 周 / 月资产的 notebook。
- **失败 notebook 先保留**：若生成失败、等待超时、download 失败或人工中断，记录 notebook id、artifact id（若有）、失败阶段和 CLI 输出摘要到 audit；等用户验收或下一轮对应 cadence cleanup 再决定是否删除。
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
