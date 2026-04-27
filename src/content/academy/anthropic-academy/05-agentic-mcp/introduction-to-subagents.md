---
title: "Introduction to subagents"
date: 2026-03-31
category: academy
description: "子代理（Subagents）架构介绍，多代理系统协调模式"
plainSummary: "这篇笔记把 Introduction to subagents 的核心内容整理成可复习、可实践的 代理与 MCP 学习路径。"
difficulty: advanced
coverImage: "/images/academy/anthropic-academy/covers/05-agentic-mcp/introduction-to-subagents.svg"
tags:
  - "MCP"
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
**适用对象：** Claude Code 用户

## 第一课：什么是 Subagents？

### 核心概念

**Subagent（子代理）** 是 Claude Code 可以将任务委托给它的**专属助手**。每个 Subagent 拥有独立的上下文窗口，完成任务后仅将摘要返回主线程，所有中间步骤（文件读取、搜索、工具调用）都留在子代理的上下文中，**不会污染主对话**。

### 为什么需要 Subagents？

Claude Code 的主上下文窗口容量有限。每次工具调用、文件读取、搜索结果都会占用主上下文空间。**一旦主上下文填满，Claude 会开始遗忘对话的早期内容**。

Subagent 的解决方案：
```
主线程发送任务
    ↓
Subagent 在独立上下文中工作
（读文件、搜索、调用工具……）
    ↓
仅返回摘要给主线程
（子代理的完整对话被丢弃）
    ↓
主线程上下文保持干净
```

**权衡：** 获得简洁摘要，但失去了 Subagent 推理过程的可见性。

### 实际示例

**不用 Subagent：** 询问"哪个服务处理退款？" → Claude 读取 15 个文件，所有内容都进入主上下文。

**使用 Subagent：** Explore Subagent 独立挖掘信息，主上下文只记录"问题 + 摘要"。

### 内置 Subagents

Claude Code 自带三个内置 Subagent：

| Subagent | 用途 |
|----------|------|
| **General purpose** | 多步骤任务（需要探索 + 执行） |
| **Explore** | 快速搜索和浏览代码库 |
| **Plan** | Plan 模式下的代码库研究与分析 |

除内置 Subagent 外，还可以创建**自定义 Subagent**。

## 第二课：创建 Subagent

### 创建步骤

1. 使用 `/agents` 斜杠命令打开 Subagent 管理界面
2. 选择 **Create new agent**
3. 选择作用范围：
   - **Project-level**：仅在当前项目可用
   - **User-level**：在本机所有项目中共享
4. 描述你想要的 Subagent 功能，**让 Claude 自动生成**名称、描述和系统提示词（推荐）
5. 自定义**工具权限**：
   - Read-only 工具
   - Edit 工具
   - Execution 工具
   - MCP 工具
   - 其他工具
6. 选择**模型**：Haiku（轻量快速）/ Sonnet（平衡）/ Opus（复杂分析）/ Inherit（继承主线程）
7. 选择**颜色**（UI 标识，便于区分多个 Subagent）

### 配置文件结构

创建完成后，配置文件保存在 `.claude/agents/your-agent-name.md`：

```markdown
---
name: code-quality-reviewer
description: Use this agent when you need to review recently written or modified code for quality, security, and best practice compliance.
tools: Bash, Glob, Grep, Read, WebFetch, WebSearch
model: sonnet
color: purple
---

You are an expert code reviewer specializing in quality assurance, security best practices, and adherence to project standards. Your role is to thoroughly examine recently written or modified code and identify issues that could impact reliability, security, maintainability, or performance.
```

**各字段说明：**

| 字段 | 说明 |
|------|------|
| `name` | Subagent 的唯一标识符，用 `@agent name` 引用 |
| `description` | 控制主 Agent 何时调用此 Subagent（必须单行） |
| `tools` | 此 Subagent 可访问的工具列表 |
| `model` | 使用的 Claude 模型 |
| `color` | UI 颜色标识 |

正文（YAML frontmatter 之后）是**系统提示词**。

### 让 Claude 自动触发 Subagent

在 `description` 字段中加入 **"proactively"** 关键词，Claude 会在适当场景主动委托任务：

```
description: Proactively suggest running this agent after major code changes...
```

也可以在 description 中加入**示例对话**，帮助 Claude 理解触发场景。

## 第三课：设计高效的 Subagents

### 四大核心原则

#### 1. 精准的 Description

`description` 有两个作用：
- 控制**何时**触发 Subagent
- 为主 Agent 提供写**输入提示词**的指引

**对比示例（代码审查 Subagent）：**
- ❌ 模糊 description → 主 Agent 写"用 git diff 找当前变更"（太模糊）
- ✅ 加入"精确告知需要审查哪些文件" → 主 Agent 会列出具体文件名

**技巧：** 在 description 中加入"返回可引用的来源"，主 Agent 委托时会包含此要求。

#### 2. 定义输出格式（最重要！）

在系统提示词中定义**结构化输出格式**，带来两大好处：
- 创造自然的终止点——Subagent 填完所有部分就知道完成了
- 防止 Subagent 运行过长

**代码审查输出格式示例：**
```
请以结构化格式提供审查结果：
1. 摘要：审查内容概述和总体评估
2. 严重问题：安全漏洞、数据完整性风险或必须立即修复的逻辑错误
3. 主要问题：质量问题、架构偏差或显著的性能问题
4. 次要问题：风格不一致、文档缺失或小优化
5. 建议：改进建议、重构机会或最佳实践
6. 审批状态：明确说明代码是否可以合并/部署或需要修改
7. 遇到的障碍：报告审查中遇到的任何问题（环境问题、绕过方案、需要特殊标志的命令等）
```

#### 3. 报告障碍（Obstacle Reporting）

当 Subagent 发现解决方法（如依赖问题的绕过方案、需要特殊标志的命令）时，**必须在摘要中汇报**，否则主线程需要重新发现这些信息，浪费 token。

在输出格式中明确加入"遇到的障碍"章节，自动捕获：
- 环境问题或环境怪癖
- 任务中发现的绕过方案
- 需要特殊标志或配置的命令
- 导致问题的依赖或导入

#### 4. 限制工具访问

只给 Subagent 它**实际需要**的工具：

| Subagent 类型 | 推荐工具 |
|---------------|----------|
| **研究/只读** | Glob, Grep, Read（不能修改文件） |
| **代码审查** | Bash（运行 git diff），但不需要 Edit/Write |
| **代码修改** | Edit, Write（明确需要修改文件时才给） |

## 第四课：有效使用 Subagents

### 决策核心原则

**关键问题：中间过程重要吗？**

- 如果**不重要**（只需最终结果）→ **委托给 Subagent**
- 如果**重要**（需要看到并响应每一步）→ **留在主线程**

### Subagents 的最佳场景

**1. 研究任务**

经典用例。主线程需要结论（如"JWT 在哪里验证？"），不需要看每个搜索过程。Subagent 读取数十个文件后返回：

> "JWT 验证在 middleware/auth.js 第 42 行，从 route/api.js 中的 Express 路由调用"

**2. 代码审查**

Claude 以**旁观者视角**审查代码效果更好。如果主线程全程参与了代码编写，让它自己审查往往产生"护短"效应——它难以客观看待自己参与创建的代码。

Reviewer Subagent 在独立上下文中运行 `git diff`，用新鲜视角审查，还可以在系统提示词中编码**团队的审查标准**，确保一致性。

**3. 需要自定义系统提示词的任务**

Claude Code 默认系统提示词强调简洁、代码导向——不适合所有场景：

- **文案 Subagent**：定义语调、受众、风格（不同于技术写作）
- **样式 Subagent**：预加载设计系统文件（颜色变量、间距规范、组件模式），确保写 CSS 前就知道项目规范

### 常见反模式（不要这样做）

**❌ 1. "专家"声明**

"你是 Python 专家" / "你是 Kubernetes 专家" → 没有意义，Claude 本来就有这些知识，专家 Subagent 做不到主线程做不到的事。

**❌ 2. 顺序管道（Sequential Pipelines）**

将 Bug 修复拆成"复现 → 调试 → 修复"三个 Subagent 串联——看似合理，实则有问题：Bug 修复的每一步都依赖上一步的**发现**，信息在 Agent 间传递时会丢失。

顺序管道只在任务**真正独立**时有效；当每步依赖前步发现时，用主线程效果更好。

**❌ 3. 测试运行器**

测试失败时，你需要**完整输出**来诊断问题。"测试运行器" Subagent 只返回"测试失败"，迫使你再创建调试脚本才能获取本可直接看到的信息。实测表明测试运行器模式在所有配置中表现最差。

### 决策速查表

| 场景 | 建议 |
|------|------|
| 研究和探索 | ✅ 用 Subagent |
| 代码审查 | ✅ 用 Subagent |
| 需要自定义系统提示词 | ✅ 用 Subagent |
| "专家"角色扮演 | ❌ 不用 |
| 多步骤依赖管道 | ❌ 不用 |
| 运行测试（需要完整输出） | ❌ 不用 |

## 相关笔记

> **延伸阅读**
> - [Introduction to Agent Skills](/academy/anthropic-academy/05-agentic-mcp/introduction-to-agent-skills/) — Skills 框架
> - [Introduction to Model Context Protocol](/academy/anthropic-academy/05-agentic-mcp/introduction-to-model-context-protocol/) — MCP 协议基础
> - [Model Context Protocol: Advanced Topics](/academy/anthropic-academy/05-agentic-mcp/model-context-protocol-advanced-topics/) — 进阶集成
