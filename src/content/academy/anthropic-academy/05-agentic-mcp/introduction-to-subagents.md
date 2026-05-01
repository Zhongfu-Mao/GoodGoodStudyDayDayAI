---
title: "Introduction to Subagents"
date: 2026-03-31
category: academy
description: "子代理（Subagents）架构详解：多代理系统的协同模式与上下文管理优化。"
plainSummary: "本笔记深入解析了 Subagents 的核心机制，探讨如何通过任务委托与上下文分离来优化 Claude Code 的执行效率。"
difficulty: advanced
coverImage: "/images/academy/anthropic-academy/covers/05-agentic-mcp/introduction-to-subagents.svg"
tags:
  - "MCP"
  - "Agents"
lang: zh
academy:
  series: "Anthropic Academy"
  module: "代理与 MCP"
  moduleOrder: 5
  source: "Anthropic Academy"
  sourceUrl: "https://anthropic.skilljar.com/introduction-to-subagents"
  prerequisites: []
draft: false
---
**适用对象：** Claude Code 用户及代理系统开发者

## 第一课：理解 Subagents（子代理）

### 核心概念

**Subagent（子代理）** 是 Claude Code 的一个强大特性，它允许主代理将特定任务委托给一个**专属的临时助手**。每个 Subagent 运行在完全独立的上下文窗口中。任务完成后，它仅将关键摘要返回给主线程，而所有中间步骤（如繁琐的文件读取、大规模搜索及工具调用过程）均保留在子代理的上下文中，**从而避免污染主对话的有效信息空间**。

### 为什么 Subagents 至关重要？

Claude Code 的主上下文窗口虽然庞大，但并非无限。频繁的工具调用、长文件的读取以及复杂的搜索结果会迅速填满上下文。**一旦主上下文过载，Claude 可能会丢失对话早期的关键指令或背景信息。**

Subagent 的工作机制如下：
```
主线程发出具体任务指令
    ↓
Subagent 在完全独立的上下文中执行
（执行读取、搜索、多步工具调用……）
    ↓
Subagent 仅将任务摘要与结论返回主线程
（子代理的冗余执行细节被自动清理）
    ↓
主线程上下文保持精简、聚焦且高效
```

**权衡：** 优势在于显著提升上下文效率；代价是主线程失去了对 Subagent 具体推理过程的实时可见性。

### 场景对比

- **普通模式：** 询问“哪个服务处理退款逻辑？” → Claude 主动读取 15 个相关文件，所有文件内容瞬间挤占主上下文。
- **Subagent 模式：** 专门的 `Explore` 子代理独立完成文件挖掘，主上下文仅记录“问题描述”与“精准的结论摘要”。

### 系统内置 Subagents

Claude Code 预置了三个核心 Subagent：

| Subagent 名称 | 主要用途 |
|---------------|----------|
| **General purpose** | 处理需要“先探索、后执行”的多步骤复杂任务 |
| **Explore** | 针对代码库的快速搜索、导航与信息检索 |
| **Plan** | 在 Plan 模式下进行深入的代码架构研究与变更影响分析 |

除内置代理外，开发者还可以根据特定工作流创建**自定义 Subagent**。

## 第二课：如何创建自定义 Subagent

### 快速上手步骤

1. 在终端使用 `/agents` 命令进入 Subagent 管理界面。
2. 选择 **Create new agent**。
3. 定义作用域：
   - **Project-level**：配置存储在当前仓库中，适合团队共享。
   - **User-level**：存储在本地全局路径，跨项目可用。
4. 描述功能：输入你对该代理的期望，**建议让 Claude 自动生成**名称、描述及系统提示词。
5. 配置**工具权限**（按需授权）：
   - Read-only（只读型）
   - Edit（编辑型）
   - Execution（执行型，如 Bash）
   - MCP（第三方协议集成）
6. 选择**推理模型**：Haiku（极致速度）/ Sonnet（综合平衡）/ Opus（深度分析）/ Inherit（随主线程）。
7. 指定**UI 颜色**：用于在多代理交互界面中快速识别身份。

### 配置文件深度解析

自定义代理的配置将以 Markdown 形式存储（路径：`.claude/agents/<name>.md`）：

```markdown
---
name: code-quality-reviewer
description: 使用此代理对最近修改的代码进行质量、安全及最佳实践合规性审查。
tools: Bash, Glob, Grep, Read, WebFetch, WebSearch
model: sonnet
color: purple
---

你是一位资深的后端架构师，擅长代码质量评估、安全漏洞扫描及项目规范审查。你的任务是严谨地分析变更，识别可能影响系统可靠性、可维护性或性能的潜在风险。
```

**关键字段说明：**
- `name`：唯一标识符，可在对话中通过 `@name` 手动引用。
- `description`：**至关重要**。主代理会根据此描述自动判断何时应触发该子代理。
- `tools`：明确该子代理可以动用的“军火库”边界。

### 实现主动触发

若希望 Claude 在检测到特定变更时自动调用子代理，请在 `description` 中包含 **"proactively"** 关键词，并提供具体的触发逻辑或对话示例。

## 第三课：Subagent 的高效设计原则

### 四大黄金准则

#### 1. 精准的 Description（触发描述）
Description 不仅决定了**何时**调用，还指导了主代理如何为子代理编写**任务输入**。
- ❌ 模糊：执行代码审查。
- ✅ 精确：审查 `git diff` 涉及的具体文件，并结合 `lint` 规则输出结构化报告。

#### 2. 强推结构化输出（最重要的环节）
在系统提示词中明确要求输出格式。这能让子代理知道何时该结束任务，防止其在独立上下文中无限循环。
**示例要求：**
- 1. 摘要：总体风险评估。
- 2. 严重问题：安全及逻辑漏洞（必须修复）。
- 3. 改进建议：性能及可读性优化。
- 4. 审批结论：批准/拒绝/需修改。

#### 3. 障碍汇报机制（Obstacle Reporting）
当子代理在执行过程中发现环境怪癖、特殊的命令标志或依赖绕过方案时，**必须强制要求其在摘要中体现**。否则主线程在后续执行相同操作时将面临重复的困难，浪费 token 和时间。

#### 4. 最小化工具授权
只给它完成任务**必需**的工具。
- 研究型子代理：仅给予 `Read`、`Grep`、`Glob`。
- 审查型子代理：给予 `Bash`（用于 diff），但通常不需要 `Edit` 权限。

## 第四课：最佳实践与决策指引

### 核心决策逻辑：中间过程是否关键？

- **委托给 Subagent**：如果你只需要一个准确的最终结论（例如：“帮我分析这个报错的根因”）。
- **保留在主线程**：如果你需要实时观察每一步推理，并根据中间结果动态调整策略。

### 最佳应用场景

1. **深度调研与探索**：主线程只需要答案，不需要看子代理翻遍了哪些文件夹。
2. **客观代码审查**：Claude 编写代码后再进行自我审查往往会有盲点。调用一个独立的 Reviewer Subagent，利用新鲜的上下文和特定的审查标准，效果显著更好。
3. **风格化/特定领域任务**：例如一个专门负责文案润色的子代理，预置了品牌语调规范，而主线程则继续专注于技术逻辑。

### 避坑指南（反模式）

- **❌ "专家"角色设定**：不要指望通过提示词声明“你是 Python 专家”来提升智力，模型本身的能力边界是固定的，子代理无法超越其底层模型。
- **❌ 深度依赖的顺序管道**：将一个 Bug 修复拆解为“复现代理 → 调试代理 → 修复代理”通常会失败，因为上下文碎片的流失会导致后期代理无法理解前期的细微发现。
- **❌ 哑铃式测试运行器**：如果子代理仅返回“测试失败”而不带详细日志，主线程将不得不重新运行测试以获取调试信息，效率极低。

## 决策速查表

| 任务类型 | 推荐方式 |
|----------|----------|
| 文档调研与代码检索 | ✅ Subagent |
| 独立的第三方审查 | ✅ Subagent |
| 预加载特定领域知识（如 CSS 规范） | ✅ Subagent |
| 扮演“专家”身份 | ❌ 主线程 |
| 运行测试（需实时日志） | ❌ 主线程 |
| 强依赖的多步逻辑链路 | ❌ 主线程 |

## 相关笔记

> **延伸阅读**
> - [Introduction to Agent Skills](/academy/anthropic-academy/05-agentic-mcp/introduction-to-agent-skills/) — 掌握技能扩展框架
> - [Introduction to Model Context Protocol](/academy/anthropic-academy/05-agentic-mcp/introduction-to-model-context-protocol/) — 理解 MCP 核心协议
> - [Model Context Protocol: Advanced Topics](/academy/anthropic-academy/05-agentic-mcp/model-context-protocol-advanced-topics/) — 进阶集成实践
