---
title: "Skills 不是提示词，而是可复用工作流资产"
date: 2026-05-11
category: engineering
description: "把 Skill 看作触发条件、操作步骤、边界、参考资料、脚本和验证方式的组合，而不是一段更长的提示词。"
difficulty: intermediate
plainSummary: "高质量 Skill 的价值在于把重复工作流从一次性聊天中抽离出来，让 Agent 在正确时机加载必要步骤、引用材料和脚本验证。"
tags:
  - "AI Engineering"
  - "Agent"
lang: zh
coverImage: "/images/engineering/practice/skills-workflow-assets-cover.png"
draft: false
---

# Skills 不是提示词，而是可复用工作流资产

> 时效边界：本文核验于 2026-05-11。Codex Skills、Claude Skills 和 Gemini CLI 相关机制仍在变化，本文重点放在可迁移的工程原则。

很多人第一次看到 Skills，会把它理解成“更高级的 prompt”。这会低估它的价值。Prompt 是一次对话里的指令，Skill 是跨任务复用的工作流资产。它不仅告诉 Agent 做什么，还告诉它什么时候加载、参考哪些资料、调用哪些脚本、遇到失败怎样停下来。

好的 Skill 不追求神秘感。它应该像一份短小的操作手册：触发条件明确，步骤稳定，边界清楚，验证可运行。

![Skill 工作流生命周期](/images/engineering/practice/skills-workflow-lifecycle.svg)

## Skill 解决的是重复性，而不是创造性

如果一件事只做一次，用普通提示词就够了。如果一件事会反复出现，而且每次都容易遗漏步骤，就值得沉淀为 Skill。

典型例子包括：

- 发布前检查：构建、UI QA、GitHub Pages base path、资源路径。
- 内容迁移：来源清单、正文改写、frontmatter、双语配对。
- AI 雷达：抓取、去重、双语生成、图片音频资产、发布守门。
- 邮件清理：查询范围、标签、归档、不删除、不误标已读。
- 图像生成：brief、尺寸、成本、prompt、验收、压缩。

这些任务都有共同点：不是模型不会做，而是人类不想每次都重新解释边界。

## 一个 Skill 至少包含六个部分

第一是触发条件。描述必须具体到 Agent 能判断何时使用它。`Use for content tasks` 太宽，`Use when generating AI radar daily posts with bilingual Markdown and NotebookLM assets` 才能触发稳定。

第二是操作步骤。步骤不应写成哲学原则，而要可执行。例如先检查工作树，再生成中文，再生成日文，再补资源，再跑验证。

第三是边界。哪些文件不能碰，哪些操作需要确认，哪些失败必须停止。边界越清楚，越能保护长期项目。

第四是参考资料。长文档不应该全部塞进 Skill 主体，而应放进 `references/`，让 Agent 需要时再读。

第五是脚本。凡是可以机械验证的事情，尽量交给脚本，不要交给模型记忆。比如检查 frontmatter、计算图片大小、扫描禁用词。

第六是验收。Skill 不只是“怎样做”，还要写“怎样证明做完了”。

## Progressive Disclosure 是关键

OpenAI 的 Codex Skills 文档强调 progressive disclosure：先暴露 metadata，让 Agent 知道有这个能力；只有匹配任务时才加载 `SKILL.md`；只有需要时才读取 references 或运行 scripts。

这很重要。大型工作流如果全部写进全局指令，会污染每个任务的上下文。Skill 的好处是把复杂性封装起来，在需要时展开，不需要时保持安静。

因此 Skill 主文件应该短而稳定，references 可以长，scripts 可以具体。不要把十几页细则都塞进 `SKILL.md`，否则每次加载都会变成上下文负担。

## 从失败沉淀 Skill

最值得写进 Skill 的内容，往往来自失败。比如某次 UI 测试因为 GitHub Pages base path 失败，就不应该只修一个 selector，而要把“涉及资源路径必须用 base path 验证”写进仓库指南或 Skill。某次雷达内容把 Gmail 内部链接写进公开 Markdown，就要把“公开 Markdown 禁止出现 Gmail URL、message id、本地路径”变成发布守门。

这就是 Skill 的真正价值：把一次失败转化成下一次不会忘的制度。

## Skill、AGENTS.md 和 MCP 的分工

AGENTS.md 适合放项目级长期红线：不要未确认 push、不要 stage 无关文件、标签策略、发布流程。Skill 适合放可触发的具体工作流：生成雷达、迁移课程、做图片资产。MCP 适合接外部系统或数据源：GitHub、Gmail、文档服务器、内部搜索。

三者不是竞争关系。一个成熟工作流可能同时使用三者：AGENTS.md 规定红线，Skill 规定步骤，MCP 提供工具能力。

## 分层模型：一个 Skill 从轻到重的四种形态

Skill 不一定一开始就很复杂。它可以按成熟度分成四种形态。

第一种是 instruction-only Skill。它只有 `SKILL.md`，适合流程还在探索但已经有稳定边界的任务。比如“发布前必须读 AGENTS.md、检查 dirty worktree、跑 check、汇报未验证项”。这种 Skill 的价值是统一动作顺序。

第二种是 reference-backed Skill。它除了 `SKILL.md`，还有 `references/`。适合需要示例、模板、术语表、风格规范的工作。比如写双语技术文章时，references 可以放标题风格、frontmatter 示例、常见术语译法。

第三种是 script-backed Skill。它加入 `scripts/`，把确定性动作自动化。比如检查 Markdown 字数、验证 frontmatter、扫描禁用词、生成 manifest、压缩图片。只要一个检查会重复发生，并且模型容易忘，就适合脚本化。

第四种是 integration-backed Skill。它需要 MCP、插件或外部 API 支持，比如 GitHub PR review、Gmail triage、设计工具同步、NotebookLM 资产生成。这个阶段要特别重视权限、审批和失败恢复。

这四种形态不是等级竞赛。能用 instruction-only 解决，就不要急着加脚本；能用脚本解决，就不要急着接外部系统。Skill 的目标是降低重复出错率，不是展示复杂度。

## 实战路径：把一次失败变成 Skill

把失败沉淀为 Skill，可以按五步走。

第一步，记录失败事实。不要急着总结大道理。写清楚：哪个任务、哪个文件、哪个命令、哪个页面、哪里失败、如何发现。

第二步，判断失败属于哪一类。是任务描述不清、来源过期、工具权限太宽、测试缺失、人工审批遗漏，还是发布路径不一致？

第三步，把失败改成可执行步骤。比如“注意 base path”不够，要写成“涉及 UI、链接、图片、音频时，使用 `GITHUB_REPOSITORY=... npm run build` 验证 GitHub Pages base path”。

第四步，把可机械验证的部分做成脚本。比如检查每篇文章是否有 `时效边界`、是否有 `查缺补漏清单`、中文长度是否达标、日文文件是否存在。

第五步，给 Skill 加退出条件。比如官方资料打不开、用户有无关 dirty file、构建失败原因不明、需要 push 但没有授权，都应该停下来汇报。

Skill 的质量，取决于它是否让下一次同类任务少踩坑。

## 当前可观察状态与复核路径

截至 2026-05-11，OpenAI Codex Agent Skills 文档明确说明：Skill 是可复用工作流的 authoring format；plugin 是可安装分发单元；Skill 可以包含 `SKILL.md`、可选 `scripts/`、`references/`、`assets/`；Codex 使用 progressive disclosure，先暴露 name、description、file path，只有选中后才读取完整说明；`description` 会影响隐式触发；最佳实践包括保持 Skill 聚焦、优先 instruction、需要确定性或外部工具时再用脚本、用明确输入输出写步骤，并测试触发行为。

复核路径是：

1. 打开 Codex Agent Skills 官方文档，确认当前目录结构、触发方式和 progressive disclosure 描述。
2. 检查目标客户端是否支持同样的 Skill 概念或等价机制。
3. 在一个真实任务上测试 description 是否会正确触发。
4. 故意给一个不适用任务，看 Skill 是否不会误触发。
5. 跑 Skill 中定义的验证脚本或检查项，确认它不是只写在文档里的愿望。

这样写出来的 Skill 才能进入工程体系，而不是另一段会过期的 prompt。

## 反例陷阱：Skill 也会变成负担

第一种陷阱是 Skill 泛化过度。一个 Skill 想处理所有内容、代码、发布、研究和图片任务，最后触发频率很高，实际约束很弱。

第二种陷阱是描述写得像标题党。`Make Codex smarter for content` 这类描述不利于隐式触发。description 应该包含具体任务、边界和关键词。

第三种陷阱是脚本过早。流程还没稳定就写脚本，会把错误流程固化。先用 instruction 跑几次，确认重复性，再脚本化。

第四种陷阱是 references 变垃圾桶。把所有资料都丢进去，Agent 需要时反而不知道读哪一个。references 应按任务拆分，并在 `SKILL.md` 中说明什么时候读。

第五种陷阱是没有生命周期。Skill 也需要维护。产品能力、命令、价格、目录结构变化时，要有人更新 Skill；否则它会从护栏变成误导源。

## 案例：工程实践专题的 Skill 化

把这次工程实践专题质量补强抽成 Skill，可以看到 Skill 的边界。

触发条件不是“写文章”，而是“把已有工程文章升级到可发布的质量标准，并要求中日同步、官方资料复核、图片资产和构建验证”。这能避免它在普通短文润色时误触发。

步骤应该包括：读取目标目录，统计中文和日文长度，列出未达标文件；检查每篇是否有问题背景、分层模型、实战路径、反例陷阱、检查清单、延伸阅读；重新核验产品事实；先扩写中文母稿，再做日文本地化；最后跑 check、build 和页面 QA。

references 可以放质量标准、frontmatter 示例、日文术语风格、常见反例。scripts 可以做长度统计、章节存在性检查、图片引用检查。assets 可以放封面 prompt 模板或 SVG 模板。

停止条件也必须写进去：官方资料不可访问、目标长度和信息密度冲突、日文无法同步、构建失败原因不明、工作树里有无关改动可能被误带入。

这样一来，Skill 不只是“帮助写得更好”，而是把质量标准变成一套可复用执行流程。

## 维护策略：Skill 什么时候该更新

Skill 不是写完就不动。下面几种情况应该触发更新：

- 同类任务又出现了新的失败模式。
- 官方文档改变了命令、参数、路径或权限模型。
- 项目目录结构变化，旧路径不再适用。
- 新增脚本可以替代原来的人工检查。
- 用户明确改变了质量标准或发布流程。
- Skill 误触发或漏触发，说明 description 需要调整。

每次更新 Skill，都应该问：这次更新是让任务更稳定，还是只把一次偏好写成永久规则？前者值得沉淀，后者可能让 Skill 越来越难用。

## 与自动化的关系

Skill 和 automation 也不是同一件事。Skill 描述如何做，automation 决定什么时候自动做。一个日报生成流程可以有 Skill，也可以有 cron automation。Skill 负责步骤和边界，automation 负责触发时机和运行环境。

如果没有 Skill，automation 只是定时运行一段模糊 prompt；如果没有 automation，Skill 仍然可以被人手动调用。两者结合时，要特别注意失败报告和停止条件。无人值守任务不能在事实无法核验时继续发布，也不能在权限不足时硬绕过去。

换句话说，Skill 是流程资产，automation 是调度资产。把两者分开，团队才能在不改调度的情况下改进步骤，也能在不改步骤的情况下调整运行频率。

## 查缺补漏清单

- 这个流程是否会重复发生？
- 每次重复时是否容易遗漏同一类步骤？
- 是否有明确触发条件？
- 是否有必须停止的失败状态？
- 是否能把机械检查交给脚本？
- 是否把长参考资料放进 references，而不是主指令？
- 是否把项目红线放进 AGENTS.md，而不是散落在聊天里？

## 延伸阅读

- [AI 工程实践地图](./ai-engineering-practice-map/)
- [AI Developer Core：Agent Harness 的日志、审批与回放](../ai-developer-core/agent-harness-logging-approval-replay/)
- [Codex for Work：Automations、Plugins 与 Settings](../../academy/openai-academy/06-codex-for-work/automations-plugins-settings/)
