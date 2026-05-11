---
title: "高质量 Skill 怎么写：触发、步骤、边界和验证"
date: 2026-05-11
category: engineering
description: "把 Skill 当成可维护的工作流资产来设计：描述负责触发，步骤负责执行，脚本负责确定性，参考资料负责深度，验证负责收尾。"
difficulty: intermediate
plainSummary: "Skill 的质量不取决于 prompt 长度，而取决于它能否被正确触发、能否限制任务边界、能否用脚本处理机械动作、能否按需加载资料，并在最后给出可验证结果。"
tags:
  - "AI Engineering"
  - "AI Developer Core"
lang: zh
coverImage: "/images/engineering/practice/high-quality-skill-design-cover.png"
draft: false
---

# 高质量 Skill 怎么写：触发、步骤、边界和验证

> 时效边界：本文核验于 2026-05-11。OpenAI Codex Agent Skills 文档说明，Skill 通常由 `SKILL.md` 加可选的 `scripts/`、`references/`、`assets/` 组成，并通过 progressive disclosure 控制上下文加载。不同客户端的实现细节可能变化，本文重点放在可迁移的设计方法。

很多人第一次写 Skill，会把它写成一篇很长的 prompt。这样短期有效，但长期会变成另一种技术债：触发条件模糊、步骤混杂、例外太多、验证缺失，模型每次都要在一大段文字里重新理解工作流。

高质量 Skill 更像一份可执行操作规程。它不替代模型思考，而是把重复劳动、边界红线、参考资料和验收方法固定下来，让模型把注意力放在当前任务的判断上。

![高质量 Skill 的五个检查点](/images/engineering/practice/skill-quality-checklist.svg)

## 第一要素：触发描述要短而准

Skill 的 `description` 不是宣传语，而是路由规则。Codex 文档强调，Skills 可以显式调用，也可以由系统根据描述隐式选择；描述写得清楚，触发才可靠。

一个差的描述是：“帮助处理内容工作流”。这太宽，几乎什么都能触发。一个更好的描述是：“当需要把官方文档整理成可发布的中日双语长文，并保留来源清单、图片资产和构建验证时使用。”

好的触发描述应该包含三类信息：适用任务、不适用边界、核心产物。它要让模型知道什么时候该用，也要让模型知道什么时候不该用。

## 第二要素：步骤要写成动作，不是理念

Skill 里最常见的弱点，是把原则写得很多，把步骤写得很少。比如“保证准确性”“注意用户体验”“保持高质量”都对，但它们不能直接执行。

更好的写法是：

1. 先读取 repo-local instructions。
2. 用 `rg --files` 找到目标内容目录和现有同类文章。
3. 对时间敏感事实只使用官方来源核验。
4. 新增中日文件时保持 frontmatter 字段一致。
5. 每篇至少包含一张生成封面和一张可读流程图。
6. 跑 `npm run check` 和带 GitHub Pages base path 的 build。

动作越具体，Agent 越少猜。步骤不需要事无巨细，但必须覆盖会反复出错的地方。

## 第三要素：把机械动作交给脚本

Skill 不应该用自然语言描述所有机械细节。凡是可以确定性完成的事情，都应该放进 `scripts/`。例如批量检查 frontmatter、生成目录、压缩图片、检测断链、统计文章长度、比对中日标题，这些都比模型手工判断更适合脚本。

这也是 progressive disclosure 的价值。Skill 的元数据先进入上下文，只有选中后才加载 `SKILL.md`，脚本和参考资料又只在需要时读取。这样，复杂能力不会一开始就挤满上下文。

脚本不一定多。一个小脚本如果能把每次都容易漏的检查自动化，就值得存在。反过来，如果脚本只是包装一行命令，还没有减少错误，就不必急着加。

## 第四要素：参考资料要分层

`references/` 不是资料仓库。它应该放稳定、低变化、对执行有帮助的材料，比如术语表、格式示例、常见失败案例、产品线边界、内部风格约定。变化很快的价格、API 参数、模型列表，最好让 Skill 指示 Agent 当场查官方文档，而不是把旧资料藏在 Skill 里。

一个实用做法是把资料分成三类：

| 类型 | 放哪里 | 原因 |
| --- | --- | --- |
| 稳定流程 | `SKILL.md` | 每次都要遵守 |
| 大型示例 | `references/` | 按需读取，避免上下文膨胀 |
| 时间敏感事实 | 官方文档或源清单 | 使用当天重新核验 |

这能避免 Skill 变成“越写越厚、越厚越没人敢改”的黑箱。

## 第五要素：验证和退出要写清楚

Skill 最后一段应该回答两个问题：怎样证明完成？什么时候停止？

完成证据可以是测试命令、构建结果、截图、diff 范围、发布检查、人工 QA。停止条件则包括：权限不够、资料无法核验、出现破坏性操作、发现无关脏文件、用户指令冲突、构建失败且原因不明。

没有停止条件的 Skill，会鼓励 Agent 无限尝试。没有完成证据的 Skill，会让“看起来差不多”变成交付标准。

## 一个简化模板

```md
---
name: publishable-engineering-article
description: Use when creating or updating long-form engineering articles with source verification, bilingual parity, visual assets, and build checks. Do not use for one-line copy edits.
---

1. Read repo instructions and existing nearby content.
2. Identify source freshness requirements.
3. Draft or edit Chinese content first, then Japanese parity.
4. Generate or update visual assets when the article benefits from diagrams.
5. Run content validation and build checks.
6. Report changed files, verification, and remaining risks.
```

真正的 Skill 会比这个更具体，但骨架就是这些：触发、边界、步骤、验证。

## 常见反模式

第一种是“万能 Skill”。它试图处理所有任务，最后没有任何任务能稳定处理。Skill 应该小而清楚，一个 Skill 做一类工作流。

第二种是“资料倾倒”。把十几篇文档复制进 Skill，看似信息充分，实际上会拖慢触发和理解。大资料放引用，重要步骤放正文。

第三种是“只写原则”。原则要有，但每条原则最好能落成动作或检查。

第四种是“无验证”。Skill 如果不告诉 Agent 最后怎么检查，就会把质量留给感觉。

## 分层模型：触发、执行、证据、维护

可以把一个高质量 Skill 拆成四层。

触发层解决“什么时候用”。这一层靠 `name` 和 `description`，尤其是 description。它要足够短，能进入初始技能列表；又要足够具体，能区分适用和不适用场景。OpenAI 文档提到初始技能列表有上下文预算，描述太长可能被缩短，所以关键词要前置。

执行层解决“怎么做”。它包含步骤、顺序、输入、输出、禁区和分支。执行层不要写成愿景，而要写成动作。比如“保证质量”不是动作，“跑 `npm run check` 并读取结果”才是动作。

证据层解决“怎样证明”。它包括命令输出、截图、diff、来源清单、生成资产路径、审稿结论。Agent 的完成汇报应该引用证据，而不是只说“已完成”。

维护层解决“怎样不过期”。Skill 里的产品事实、命令、路径、工具名称都可能变化。维护层要写出复核路径和更新触发条件：什么时候需要查官方文档，什么时候需要改脚本，什么时候应该废弃这个 Skill。

这四层让 Skill 从一次性提示词变成可维护资产。

## 实战路径：设计一个内容扩写 Skill

以本专题的质量补强为例，一个内容扩写 Skill 可以这样设计。

触发描述：

```md
Use when upgrading existing bilingual engineering articles to a publishable quality standard with official source verification, target length, visual assets, Japanese localization, and Astro build checks. Do not use for short copy edits or unrelated blog drafts.
```

执行步骤：

1. 读取仓库指南和目标文章。
2. 统计中日文件长度，列出低于标准的文件。
3. 对涉及产品能力、价格、限制、API、CLI 行为的段落重新查官方资料。
4. 中文母稿先补问题背景、分层模型、实战路径、反例陷阱、检查清单、延伸阅读。
5. 日文版基于扩写后的内容本地化改写，不逐句机械翻译。
6. 检查每篇是否有图片和正文图解。
7. 跑 `npm run check`、build 和必要截图 QA。
8. 汇报哪些文件达标、哪些仍未达标。

停止条件：

- 官方资料无法核验。
- 文章需要产品价格但价格页不可访问。
- 发现无关 dirty file 会被误带入。
- 构建失败且原因不属于本轮修改。
- 用户要求改变专题范围。

这个 Skill 的价值不是“写得更好”，而是把质量标准变成 Agent 可执行的流程。

## 当前可观察状态与复核路径

截至 2026-05-11，Codex Agent Skills 文档说明：Skill 是一个目录，`SKILL.md` 必须包含 name 和 description，可选 `scripts/`、`references/`、`assets/`，还可以通过 `agents/openai.yaml` 配 UI metadata、调用策略和工具依赖。Skill 可以显式调用，也可以根据 description 隐式调用。Codex 使用 progressive disclosure 管理上下文，只有选择 Skill 后才读取完整说明。

复核路径：

1. 打开 Codex Agent Skills 文档，确认当前目录结构和字段。
2. 检查你使用的 Codex CLI、IDE 或 app 是否已经能看到该 Skill。
3. 用三个 prompt 测试：一个应触发、一个不应触发、一个边界模糊。
4. 观察 Agent 是否读取了 `SKILL.md`，是否按步骤执行，是否只在需要时读取 references。
5. 如果 Skill 有脚本，故意制造失败样本，看它是否能停下来并解释原因。

只有触发、执行、证据和维护都经过测试，Skill 才算高质量。

## 反例陷阱：写得越长不等于越可靠

第一种反例是把所有细节写进 `SKILL.md`。这会让 Skill 难读、难更新，也破坏 progressive disclosure 的意义。稳定步骤放主文件，大型示例放 references，机械检查放 scripts。

第二种反例是 description 过宽。过宽会误触发，过窄会漏触发。description 要写任务类型、产物和不适用场景。

第三种反例是没有输入输出。Agent 不知道要读哪些文件、产出什么、最终汇报什么，就会自由发挥。

第四种反例是把高风险操作藏在普通步骤里。删除、发送、push、调用付费 API、修改生产数据都应该写成审批点。

第五种反例是没有测试触发。Skill 写完不测试，就不知道它会不会在真实任务里被选中。

## 质量评审：一个 Skill 上线前怎么验收

Skill 上线前至少做三类评审。

第一类是触发评审。准备三条 prompt：一条应该触发，一条不应该触发，一条边界模糊。观察 Agent 是否选对 Skill。如果边界模糊任务总是误触发，就要改 description，而不是责怪 Agent。

第二类是执行评审。让 Agent 按 Skill 做一个小任务，观察它是否按步骤读取资料、是否跳过验证、是否碰了禁区、是否在失败时停止。执行评审要看真实行为，不只看文档写得是否漂亮。

第三类是维护评审。检查 Skill 是否把变化快的信息写死，比如模型价格、API 参数、目录结构、外部服务限制。如果写死了，就要改成“使用时查官方资料”或放进可更新 reference。

这三类评审通过后，Skill 才适合进入团队或项目。否则它只是另一段未经测试的长 prompt。

## 查缺补漏清单

- `description` 是否能让 Agent 正确判断什么时候使用？
- 是否明确了不适用场景？
- 步骤是否是可执行动作，而不只是价值观？
- 是否把确定性检查放进脚本？
- 参考资料是否按需加载，而不是一开始塞满上下文？
- 是否处理时间敏感事实的重新核验？
- 是否写清完成证据和停止条件？

## 延伸阅读

- [Skills 不是提示词，而是可复用工作流资产](./skills-as-workflow-assets/)
- [什么时候需要 MCP，什么时候只要脚本](./when-to-use-mcp-vs-scripts/)
- [Codex、Claude Code、Gemini CLI：不要比谁聪明，要比工作流](./agent-cli-workflow-comparison/)
