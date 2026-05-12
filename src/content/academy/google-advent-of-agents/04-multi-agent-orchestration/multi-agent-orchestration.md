---
title: "Google Advent of Agents：多 Agent 编排模式"
date: 2026-05-06
category: academy
description: "把 Sequential、Coordinator、Parallel Fanout、Hierarchical、Generator-Critic 与 Human in the Loop 重组为一张多 Agent 模式选择图。"
plainSummary: "这篇图文笔记解释为什么不要一开始就做复杂多 Agent，而应该按任务结构选择最小可审查的编排模式。"
difficulty: advanced
coverImage: "/images/academy/google-advent-of-agents/covers/04-multi-agent-orchestration.svg"
tags:
  - Agent
  - AI Engineering
lang: zh
academy:
  series: "Google Advent of Agents"
  module: "04 多 Agent 编排"
  moduleOrder: 124
  source: "Google Cloud Advent of Agents"
  sourceUrl: "https://adventofagents.com/2026/03/08"
  prerequisites:
    - "建议先阅读：Google Advent of Agents：工具与协议边界"
draft: false
---

![多 Agent 编排封面](/images/academy/google-advent-of-agents/covers/04-multi-agent-orchestration.svg)

**说明：** 本文基于 Advent of Agents Season 2 中关于 Sequential Agents、Coordinator / Dispatcher、Parallel Fanout、Hierarchical Decomposition、Generator-Critic、Iterative Refinement 与 Human in the Loop 的公开主题重组。它不复述每一天，而是把这些模式整理成一个选择问题：什么时候需要多个 Agent，什么时候只是需要一个更清晰的 workflow？

## 这篇解决什么问题

多 Agent 很容易被误解成“Agent 越多越聪明”。

现实通常相反。每增加一个 Agent，就会增加几类成本：

- 状态同步成本：每个 Agent 看见的信息不完全一样。
- 责任归属成本：失败时不知道是规划、检索、执行还是综合出错。
- 延迟与费用成本：并行和循环会放大调用次数。
- 评估成本：不只要评估最终答案，还要评估中间轨迹。
- 产品成本：用户很难理解系统到底在做什么。

所以，多 Agent 编排的第一原则不是“拆得越细越好”，而是：**用最少的 Agent 表达真实的任务结构。**

## 模式选择图

![多 Agent 模式选择图](/images/academy/google-advent-of-agents/diagrams/multi-agent-decision-tree.svg)

这张图的意思是：不要从模式名出发，而要从任务难点出发。

| 任务难点 | 推荐模式 | 典型例子 |
| --- | --- | --- |
| 步骤顺序明确 | Sequential | 提取资料、生成草稿、格式化输出。 |
| 需要多个专家，但一次只走一条路径 | Coordinator / Dispatcher | 根据用户问题分派给财务、法律、技术 Agent。 |
| 需要并行收集独立证据 | Parallel Fanout | 多来源研究、竞品比较、日志聚合。 |
| 任务天然可分解成子任务树 | Hierarchical | 大型迁移、复杂调研、项目计划。 |
| 输出质量需要反复批评和修订 | Generator-Critic | 写作、代码审查、方案打磨。 |
| 高风险动作需要人类确认 | Human in the Loop | 发邮件、下单、删除、部署、修改权限。 |

模式不是互斥的。一个生产系统可能先用 coordinator 分派，再用 fanout 收集证据，最后用 human-in-loop 审批。但学习和实现时，最好先把每个模式单独跑通。

## Sequential：明确流水线

Sequential 是最容易被低估的模式。

如果任务天然有固定顺序，就不需要一个“总控智能体”每次重新发明流程。直接把步骤写清楚，通常更稳：

1. 解析输入。
2. 检索材料。
3. 生成候选答案。
4. 校验格式和事实。
5. 输出结果。

适合 Sequential 的任务有一个特点：后一步依赖前一步的产物，而且顺序变化不大。

它的优势是可测试。每一步都有输入输出，可以单独记录、回放和断言。很多所谓多 Agent 项目，其实先用 sequential workflow 就能解决 80% 的问题。

## Coordinator / Dispatcher：路由到专家

Coordinator 模式适合“问题类型不同，需要不同专家处理”的场景。

它不是让一个总控 Agent 指挥所有细节，而是负责：

- 判断任务属于哪一类。
- 选择合适的专家 Agent。
- 给专家足够上下文，但不泄露无关信息。
- 汇总专家结果并返回用户。

关键风险在路由错误。例如用户问的是“合同里的云服务 SLA 风险”，如果 coordinator 只按关键词路由给技术 Agent，就可能漏掉法律风险。

因此 coordinator 需要被评估的不只是最终答案，还包括“它为什么选这个专家”。

## Parallel Fanout：并行证据，而不是并行噪音

Parallel Fanout 适合需要从多个独立来源收集证据的任务。

例如做一份 AI 产品调研，可以同时让几个 Agent 分别处理：

- 官方文档。
- 价格和限制。
- 社区反馈。
- 竞品对比。
- 本地代码库影响。

然后由 synthesizer 把结果合并。

这个模式的风险是重复和冲突。并行 Agent 如果都拿到同一份模糊任务，很可能产出相似内容，最后只是更贵的重复劳动。

更稳的 fanout 设计应该给每个分支明确的证据范围、输出 schema 和冲突处理规则。

## Hierarchical：复杂任务的任务树

Hierarchical 模式适合大型任务，例如“把一个旧系统迁移到新的云架构”。

顶层 manager 不应该亲自做所有工作，而应该把任务拆成子目标：

- 现状盘点。
- 数据迁移。
- 权限模型。
- 网络和部署。
- 监控和回滚。
- 用户培训。

每个子任务可以继续拆分。最终汇总时，manager 要负责检查依赖、冲突和遗漏。

这个模式很强，但也最容易失控。必须配合：

- 明确的任务边界。
- 子任务完成定义。
- 中间 artifact。
- 预算限制。
- 人类审查点。

没有这些控制，hierarchy 会变成“模型自己开会”。

## Generator-Critic：质量循环

Generator-Critic 模式适合输出质量本身很重要的任务，例如文章、方案、代码、测试、PR 描述。

基本结构是：

1. Generator 产出草稿。
2. Critic 按 rubric 找问题。
3. Generator 根据具体问题修订。
4. 达到门槛或预算后停止。

关键不是“让一个 Agent 批评另一个 Agent”这个形式，而是 critic 必须有明确标准。

一个好的 critic 不说“再完善一点”，而是说：

- 这个结论没有证据。
- 这个步骤不可执行。
- 这个权限风险没有覆盖。
- 这个 UI 文案在移动端会溢出。
- 这个测试没有覆盖失败路径。

也就是说，critic 应该像工程 reviewer，而不是情绪化读者。

## Human in the Loop：人类审批是系统能力

Human in the Loop 不是“模型不够聪明时找人帮忙”。它是高风险系统的基本控制面。

需要人类确认的动作包括：

- 发邮件、发通知、发布内容。
- 删除、覆盖、迁移数据。
- 购买、支付、下单。
- 修改权限、密钥、网络。
- 对外代表公司或个人做承诺。

好的 HITL 设计不只是问一句“可以吗”。它应该展示：

- Agent 想做什么。
- 为什么要做。
- 会影响哪些对象。
- 是否可撤销。
- 有哪些替代方案。
- 用户批准后具体执行什么命令或 API。

这让审批变成可审查的 workflow，而不是对话里的模糊同意。

## 最小编排骨架

下面是一个“研究报告 Agent”的概念结构：

```python
def research_report(question: str) -> dict:
    plan = planner.run(question)

    evidence = parallel_fanout.run([
        {"agent": "official_docs", "scope": plan["official_sources"]},
        {"agent": "pricing", "scope": plan["pricing_questions"]},
        {"agent": "community", "scope": plan["community_risks"]},
    ])

    draft = writer.run(question=question, evidence=evidence)
    review = critic.run(draft=draft, rubric="evidence, usefulness, risk")

    if review["risk_level"] == "high":
        approval = human_approval.request(review["required_action"])
        if not approval["approved"]:
            return {"status": "stopped", "reason": approval["reason"]}

    return writer.revise(draft=draft, review=review)
```

这个骨架包含 fanout、critic 和 human approval，但每个模式都有明确边界。如果任务只是简单摘要，就不该用这么重的结构。

## 观测和评估要看中间轨迹

多 Agent 系统不能只看最终答案。

你需要记录：

- coordinator 为什么选择某个专家。
- fanout 每个分支查了什么来源。
- critic 提出了哪些可执行问题。
- human approval 展示了哪些信息。
- 最终答案引用了哪些中间产物。

评估也要覆盖这些轨迹。例如：

| 检查点 | 失败例子 |
| --- | --- |
| 路由 | 法务问题被错误路由给技术 Agent。 |
| 并行 | 三个分支重复查同一来源，没有互补证据。 |
| 批评 | critic 只给笼统建议，没有可执行发现。 |
| 审批 | 用户没有看到即将调用的高风险 API。 |
| 汇总 | 最终答案忽略了某个分支的反证。 |

这也是为什么生产 Agent 需要 trace、span、artifact 和 replay。

## 和协议边界的关系

多 Agent 模式解决的是“内部或跨系统如何协作”。协议边界解决的是“协作如何被承载”。

| 问题 | 更像编排模式 | 更像协议边界 |
| --- | --- | --- |
| 先检索再写作再审校 | Sequential | 可在同一 runtime 内完成。 |
| 把任务交给另一个服务型 Agent | Coordinator / Delegation | A2A。 |
| 并行调用多个数据工具 | Parallel Fanout | MCP / Registry-backed tools。 |
| 让用户批准执行计划 | Human in the Loop | A2UI + Policy。 |

两层不要混淆：A2A 不是多 Agent 策略本身，MCP 也不是 workflow engine。

## 最小实践任务

拿一个你已经在做的复杂任务，先不要写代码，只做模式选择：

1. 写出任务目标和失败代价。
2. 判断是否真的需要多个 Agent。
3. 选择一个主模式，不要一开始混用所有模式。
4. 为每个 Agent 写出输入、输出、不可做的事。
5. 设计一条 trace：人类能看懂每一步为什么发生。
6. 设计一个最小 eval：能抓住最可能的路由或汇总错误。

实践记录表：

| 子 Agent | 输入 | 输出 | 不可做 | 评估点 |
| --- | --- | --- | --- | --- |
| Research | 问题和来源范围 | 证据摘要 | 不写最终建议 | 来源覆盖和引用质量 |
| Critic | 草稿和 rubric | 可执行问题 | 不重写全文 | 是否指出具体风险 |
| Approver | 执行计划 | 批准或拒绝 | 不自动执行 | 是否展示影响范围 |

## 复核清单

- 我知道多 Agent 会增加状态、延迟、费用和评估成本。
- 我能用任务难点选择 sequential、coordinator、fanout、hierarchy、critic 或 HITL。
- 我不会把普通工具包装成没有必要的子 Agent。
- 我能为每个 Agent 写清输入、输出和禁止事项。
- 我知道多 Agent eval 必须覆盖中间轨迹。
- 我能设计人类审批点，而不是只在最终答案问一句“是否继续”。
- 我能解释编排模式和协议边界的区别。

## 参考资源

- [Advent of Agents](https://adventofagents.com/)
- [Season 2: Multi-Agent Patterns: Sequential Agents](https://adventofagents.com/2026/03/08)
- [Season 2: Multi-Agent Patterns: Coordinator/Dispatcher Agents](https://adventofagents.com/2026/03/09)
- [Season 2: Multi-Agent Patterns: Parallel Fanout and State Interpolation](https://adventofagents.com/2026/03/10)
- [Season 2: Multi-Agent Patterns: Hierarchical Decomposition](https://adventofagents.com/2026/03/11)
- [Season 2: Multi-Agent Patterns: Generator-Critic Agent Loop](https://adventofagents.com/2026/03/12)
- [Google ADK Documentation](https://google.github.io/adk-docs/)
