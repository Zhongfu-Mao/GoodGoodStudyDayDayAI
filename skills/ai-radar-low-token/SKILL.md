---
name: ai-radar-low-token
description: Produce, resume, review or publish GoodGoodStudyDayDayAI bilingual radar using cached evidence, bounded delegation and script-owned waiting.
---

# 雷达精简入口

仓库：/Users/maozhongfu/Self Learning Projects/GoodGoodStudyDayDayAI。

权威规则位于 `.codex/AGENTS.md`：§3.1「低 token 执行约定」统一规定等待、委派、缓存、验收和排期；§3.3–3.11 规定来源、正文、资产和发布。已读且未变化的部分不重复加载。这里仅保留命令入口，不复制整套规则。

## 继续一个已授权任务

先看该日期的正文、私有 run record、资产文件及准确 notebook/artifact ID，辨别是采编、生成中、等待超时、待验收还是待发布。只处理用户指定范围；旧缺口不阻断当前已授权日报，暂停不因新的 heartbeat 自动解除。

## 资料与命令

- 邮件覆盖：先枚举实际标签，合并 `AI Newsletter` / `AI Newsletter📰` 父标签与所有子标签，并覆盖已知开发者 Newsletter 标签；再按已确认发件地址补查（例如 ByteByteGo 使用 `bytebytego@substack.com`，不能仅查品牌域名）。按明确日期窗口检索，不以 unread 作为发现条件，遍历分页并按 message ID 去重。父标签零命中不能宣称无邮件；正文采用前保持邮件状态不变。记录接收时间与日报截止时间，晚到邮件进入下一期，补刊另行明确覆盖窗口。
- 2026-09-28 用户批准三个补充发现源试行，见 `scripts/radar/source-pool.json` 的 `supplementalDiscoverySources`；这是原有 HF 仅确认规则的窄例外，不开放社区热门榜泛抓。补充源不替代 active-core 配额、不降低日期/证据/去重门槛。私有记录按源保存新增候选、验收/拒绝原因及重复率，后续据实际收益评估去留。

- `node scripts/radar/fetch-url.mjs URL --compact --cache-dir tmp/radar-fetch/DATE`：短输出，完整结果缓存。选中事实回到原文确认；不要只凭截断摘要起草。
- `node scripts/radar/run-step.mjs -- COMMAND ARGS...`：日志留磁盘，返回状态路径和简短完成信息。
- `node scripts/radar/run-step.mjs --require-output -- COMMAND ARGS...`：适合必须有正文输出的委派，拒绝退出码为零的空输出。此检查不替代内容验收。
- `node scripts/radar/run-step.mjs --status STATE_FILE`：恢复时读一次状态。生成中且无独立工作就结束本轮；由脚本轮询，不让主模型按分钟陪跑。不要默认挪用日报定时器，自动唤醒的边界见 AGENTS.md。
- imagegen 只用专用图片展示函数，文字输出限文件路径和必要元数据。

## 委派

先读当前 `antigravity-delegate` skill；其封装已升级，旧的裸 `agy --print`/退出码零验收方式不再适用。

Flash：`gemini-3.8-flash-low` 适合明确片段的提取/翻译，medium 用于有边界的综合。文件任务加 `--require-file-tools`，并用 `-o 新目录` 保留事件/校验记录。要求 `validation: PASSED` 和主模型核验通过。不是 OS 保密沙箱，不传凭据或未经授权的私密材料。

默认仅委派 Gemini Flash；不使用 Spark。Astra 负责证据选择、任务边界、审计编排和最终发布。Gemini 不可用或交付未通过验收时，由 Astra 委派 `gpt-5.6-sol`、`medium` 子智能体，仅接手失败任务包；使用精简上下文，不继承整段历史，不重复已验收部分。任务包应包括输入文件、输出 schema、证据引用和验收条件。

材料不足由 Astra 补证据，不通过换模型猜测。明确本地输入错误可修正后重试一次；权限失败不得绕过；无诊断空输出不循环重试。Sol 仍不合格则返回 Astra 收口并记录原因，不再扩展模型链。机械检查、下载与等待交给脚本，不安排模型陪跑，也不默认追加重复审核。

2026-08-30 实测中，旧 Flash 封装两次空输出；Spark 候选出现历史重复、错误日期和无依据引文。因此模型列表存在/小样本成功只证明可调用，不证明整批采编可靠。选题、日期、原文证据和历史去重由主审收口；机械检查用脚本。不要为凑栏目采纳错误候选。

## 资产与交付

沿用仓库生成脚本和规范文件名。日报音频 default + brief，周/月 long。原始音频保留，转换前后时长及结尾验证，单文件单写入者。图片按事实与可读性验收，用户已认可的风格不反复重生。超时保留任务，先查原 ID，不直接重生。

正文/资产预览保留 draft；发布按 AGENTS.md 的授权与检查执行。详细运行数据留私有记录；只报告实际状态、链接和重要异常。未测量完整一期之前，不宣称整体 token 节省百分比。
