---
title: "Claude Code in Action"
date: 2026-03-31
category: academy
description: "Claude Code CLI 工具的实战指南"
plainSummary: "这篇笔记把 Claude Code in Action 的核心内容整理成可复习、可实践的 开发者与技术工具 学习路径。"
difficulty: advanced
coverImage: "/images/academy/anthropic-academy/covers/04-developer-tools/claude-code-in-action.svg"
tags:
  - Claude Code
  - 开发者
lang: zh
academy:
  series: "Anthropic Academy"
  module: "开发者与技术工具"
  moduleOrder: 4
  source: "Anthropic Academy"
  sourceUrl: "https://anthropic.skilljar.com/claude-code-in-action"
  prerequisites: []
draft: false
---
## 第一章：Claude Code 是什么

### 1. 简介（Introduction）

Claude Code 是 Anthropic 推出的命令行编程助手，拥有一套内置工具用于处理常见开发任务（读取文件、写入代码、运行命令、管理目录等）。其强大之处在于能够**智能组合**这些工具来解决复杂的多步骤问题。

### 2. 什么是编程助手（What is a coding assistant?）

#### 编程助手的工作原理

当你给编程助手一个任务时（比如根据报错信息修复一个 bug），它会遵循类似人类程序员的流程：

1. 读取相关文件，理解项目结构
2. 识别问题所在
3. 制定修复方案
4. 实施修改
5. 验证修改是否有效

#### 工具使用（Tool Use）机制

语言模型本质上**只能处理文字输入输出**，无法直接与外部系统（文件系统、终端等）交互。工具系统正是为了弥补这一限制而设计的。

完整流程如下：

1. 用户提问："@main.go 文件里写了什么代码？"
2. 编程助手在请求中附加工具使用指令
3. 语言模型回复："ReadFile: main.go"
4. 编程助手读取实际文件，将内容发回给模型
5. 语言模型基于文件内容给出最终回答

这种机制让语言模型能够**有效地**"读文件"、"写代码"、"运行命令"——尽管本质上仍是生成格式化文字响应。

#### 为什么 Claude 的工具使用能力很重要

Claude 系列模型（Opus、Sonnet、Haiku）在工具使用上经过了大量优化，能够精确地知道何时以及如何使用每种工具——这正是 Claude Code 高效运作的核心。

### 3. Claude Code 实战（Claude Code in action）

Claude Code 的内置工具涵盖读文件、写代码、运行命令、管理目录等常见开发任务。真正使其强大的是它能够**智能地组合这些工具**处理复杂的多步骤问题。

## 第二章：上手实操

### 4. 安装 Claude Code（Claude Code setup）

完整安装说明：https://code.claude.com/docs/en/quickstart

**安装方式：**

| 平台 | 命令 |
|------|------|
| macOS（Homebrew） | `brew install --cask claude-code` |
| macOS / Linux / WSL | `curl -fsSL https://claude.ai/install.sh \| bash` |
| Windows CMD | `curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd && del install.cmd` |

**首次运行：**
```
claude
```
首次运行时会引导你完成登录认证。

**云平台用户额外配置：**
- AWS Bedrock：https://code.claude.com/docs/en/amazon-bedrock
- Google Cloud Vertex：https://code.claude.com/docs/en/google-vertex-ai

### 5. 项目设置（Project setup）

课程提供了一个名为 `uigen` 的演示项目（UI 生成应用），用于在实际项目中探索 Claude Code。

**设置步骤：**

1. 确保已安装 Node.js（[安装说明](https://nodejs.org/en/download)）
2. 下载并解压 `uigen.zip`
3. 在项目目录运行 `npm run setup`（安装依赖并初始化本地 SQLite 数据库）
4. 运行 `npm run dev` 启动项目
5. （可选）在 `.env` 文件中填入 Anthropic API Key，以启用真实的 UI 生成功能

### 6. 添加上下文（Adding context）

上下文管理对 AI 辅助编程至关重要。项目中可能有几十上百个文件，但 Claude 只需要**相关信息**即可高效工作。上下文过多反而会降低性能。

#### /init 命令

在新项目中首次启动 Claude 时，运行 `/init` 命令。Claude 会分析整个代码库，了解：

- 项目目的和架构
- 重要命令和关键文件
- 代码模式和结构

分析后，Claude 会生成一个 `CLAUDE.md` 文件，将这些信息持久化。

#### 三种 CLAUDE.md 文件

| 文件 | 说明 |
|------|------|
| `CLAUDE.md` | 项目级，由 `/init` 生成，提交到版本控制，**与团队共享** |
| `CLAUDE.local.md` | 本地级，**不共享**，包含个人定制指令 |
| `~/.claude/CLAUDE.md` | 机器级，用于**所有项目**，存放全局个人偏好 |

#### 自定义指令

通过编辑 `CLAUDE.md` 文件来定制 Claude 行为。使用 `#` 命令进入"记忆模式"，Claude 会自动将指令合并进文件：

```
# 只在复杂代码处添加注释，避免不必要的注释。
```

#### @ 文件引用

使用 `@` 符号后跟文件路径，可以让 Claude 读取特定文件：

```
@src/components/Button.tsx 帮我给这个组件添加 disabled 状态
```

### 7. 进行修改（Making changes）

#### 使用截图精确沟通

截图是与 Claude 沟通 UI 修改的最有效方式之一。

> **注意：** 粘贴截图到 Claude 时，使用 `Ctrl+V`（不是 macOS 上的 `Cmd+V`）

#### 计划模式（Plan Mode）

按 `Shift+Tab` 进入计划模式。Claude 会先列出一份多步骤操作计划，等待确认后再开始执行。

**适用场景：** 大型功能开发、多步骤任务，需要先了解整体方案再执行。

#### 扩展思考模式（Extended Thinking / Think Mode）

在提示词中使用 `think` 关键词触发扩展思考：

- `think`：适度思考
- `think harder`：更深入分析
- `ultrathink`：最大力度推理

**适用场景：** 复杂算法、架构决策、疑难 bug 调试等需要深度推理的任务。

> **Plan Mode vs Think Mode：**
> - Plan Mode 处理**广度**（多步骤任务规划）
> - Think Mode 处理**深度**（复杂逻辑推理）

### 8. 控制上下文（Controlling context）

#### Escape 键中断

当 Claude 朝错误方向发展时，按 `Escape` 键可以立即中止，重新给出指令。

**典型用途：** Claude 试图一次处理太多任务时，先中断，再逐步引导。

#### /clear 清空对话

使用 `/clear` 命令开始全新对话，适用于切换到完全不同的任务。

#### /compact 压缩上下文

当上下文接近上限时，使用 `/compact` 命令：

- Claude 会将整个对话压缩为简洁摘要
- 也支持自动压缩（上下文填满时自动触发）

#### 恢复上一次会话

```
claude --continue    # 继续上次会话
/resume              # 在会话内恢复
```

#### 并行任务策略

对于互不相关的多个任务，可以同时启动多个 Claude 实例并行工作，提高效率。

### 9. 自定义命令（Custom commands）

Claude Code 支持创建自定义 slash 命令，用于自动化频繁执行的任务。

#### 创建命令

```
.claude/
  commands/
    audit.md    →  /audit 命令
    deploy.md   →  /deploy 命令
```

1. 在项目的 `.claude` 文件夹下创建 `commands` 目录
2. 新建 Markdown 文件，文件名即命令名
3. 在文件中写入命令指令

#### 接受运行时参数

在命令文件中使用 `$ARGUMENTS` 占位符接受动态参数：

```markdown
审查 $ARGUMENTS 文件中的依赖项是否存在安全漏洞，
运行 npm audit，汇总结果并给出修复建议。
```

使用方式：`/audit package.json`

#### 全局命令

除项目级命令外，还可以在 `~/.claude/commands/` 创建**全局命令**，适用于所有项目。

### 10. 使用 MCP 服务器（MCP servers with Claude Code）

通过添加 MCP（Model Context Protocol）服务器，可以为 Claude Code 扩展新能力。MCP 服务器可以在本地或远程运行。

#### 安装示例：Playwright MCP 服务器

```bash
claude mcp add playwright npx @playwright/mcp@latest
```

这个命令给 Claude Code 添加了控制浏览器的能力，对 Web 开发工作流非常实用。

#### MCP 服务器的作用

- 提供 Claude Code 原本不具备的工具和能力
- 支持浏览器自动化、数据库访问、外部 API 调用等
- 通过简单命令安装和管理

### 11. GitHub 集成（GitHub integration）

Claude Code 提供官方 GitHub 集成，可在 GitHub Actions 中运行 Claude。

#### 设置

在 Claude 中运行：

```
/install-github-app
```

按引导完成：
1. 在 GitHub 安装 Claude Code 应用
2. 添加 API Key
3. 自动生成含 workflow 文件的 Pull Request

#### 两种默认 GitHub Actions

**Mention Action（提及触发）**

在 Issue 或 PR 的评论中提及 Claude，即可触发 Claude 执行任务。例如：

- "@claude 帮我修一下这个 bug"
- "@claude 给这个 PR 做代码审查"

**Review Action（自动审查）**

每次新建 PR 时，Claude 自动进行代码审查并留下评论。

#### 自定义工作流

workflow 文件支持高度自定义：

- 使用 `allowed_tools` 配置 Claude 可使用的工具
- 使用 `disallowed_tools` 限制某些工具
- MCP 服务器工具需在权限中**逐一列出**

## 第三章：Hooks 与 SDK

### 12. Hooks 简介（Introducing hooks）

Hooks 允许你在 Claude 尝试运行工具**之前或之后**执行自定义命令。

**主要用途：**

- 文件编辑后自动运行代码格式化工具
- 文件变更时自动运行测试
- 阻止对特定文件的访问
- 自动化各类开发工作流

#### Hooks 的工作原理

正常流程：

```
用户提问 → 发送给 Claude 模型（含工具定义）→ 模型决定使用工具 → Claude Code 执行工具 → 返回结果
```

加入 Hooks 后，在工具执行前或后插入自定义逻辑。

#### Hook 的两大类型

| 类型 | 时机 | 能力 |
|------|------|------|
| `PreToolUse` | 工具执行**之前** | 可以**阻止**工具调用 |
| `PostToolUse` | 工具执行**之后** | 在工具完成后运行 |

### 13. 定义 Hooks（Defining hooks）

创建 Hook 的四个步骤：

1. **选择类型**：PreToolUse（可阻止执行）还是 PostToolUse（执行后运行）
2. **指定工具**：确定哪些工具调用触发此 Hook（matcher）
3. **编写命令**：该命令通过标准输入（stdin）接收工具调用的 JSON 数据
4. **提供反馈**（可选）：将反馈信息输出，Claude 会读取并响应

#### Hook 配置结构（settings.json）

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit",
        "command": "/absolute/path/to/my-hook.js"
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write",
        "command": "/absolute/path/to/format-hook.sh"
      }
    ]
  }
}
```

**退出码含义：**

- 退出码 `0`：允许工具调用继续
- 退出码非 `0`：阻止工具调用，并将 stdout/stderr 作为错误信息反馈给 Claude

### 14. 实现一个 Hook（Implementing a hook）

#### 示例：阻止 Claude 读取 .env 文件

**配置（`.claude/settings.local.json`）：**

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Read|Grep",
        "command": "node /absolute/path/hooks/read_hook.js"
      }
    ]
  }
}
```

`|` 符号作为 OR 运算符，同时匹配 Read 和 Grep 工具。

**Hook 接收的数据包含：**

- Session ID 和对话路径
- Hook 事件名称（PreToolUse）
- 工具名称（Read、Grep 等）
- 工具输入参数（包含文件路径）

**优点：**

- **主动防护**：在读取敏感数据前就阻止
- **透明操作**：Claude 能理解为什么操作失败
- **灵活匹配**：支持多种工具（Read、Grep 等）
- **清晰反馈**：提供有意义的错误信息

### 15. Hooks 的注意事项（Gotchas around hooks）

#### 使用绝对路径

Claude Code 官方**推荐**在 Hook 命令中使用**绝对路径**（而非相对路径），以防止路径劫持和二进制植入攻击。

**问题：** 绝对路径与机器相关，导致 `settings.json` 难以在团队间共享。

**解决方案：** 将相对路径存储在代码库中，在 `npm run setup` 时用脚本自动生成包含本机绝对路径的 `settings.local.json`。

#### 两个 settings 文件的分工

| 文件 | 提交到版本控制 | 内容 |
|------|--------------|------|
| `settings.json` | ✅ 是 | 不含绝对路径，供团队共享 |
| `settings.local.json` | ❌ 否 | 含绝对路径，本地自动生成 |

### 16. 实用 Hooks 示例（Useful hooks!）

#### TypeScript 类型检查 Hook（PostToolUse）

**问题：** Claude 修改函数签名时，通常只更新函数定义，忽略调用处，导致类型错误。

**解决方案：** 每次写入文件后自动运行 TypeScript 编译器检查：

```json
{
  "PostToolUse": [
    {
      "matcher": "Write|Edit",
      "command": "npx tsc --noEmit"
    }
  ]
}
```

Claude 会自动读取编译器的错误输出，并在后续操作中修复——无需手动介入。

#### Prettier 代码格式化 Hook（PostToolUse）

每次 Claude 写入文件后自动格式化代码，保持风格一致。

### 17. 更多 Hook 类型（Another useful hook）

除了 PreToolUse 和 PostToolUse，还有以下 Hook 类型：

| Hook 类型 | 触发时机 |
|-----------|----------|
| `Notification` | Claude 发送通知时（需要工具权限，或空闲 60 秒后） |
| `Stop` | Claude Code 完成响应时 |
| `SubagentStop` | 子代理（UI 中显示为 "Task"）完成时 |
| `PreCompact` | 压缩操作（手动或自动）发生前 |
| `UserPromptSubmit` | 用户提交提示词时（Claude 处理前） |
| `SessionStart` | 启动或恢复会话时 |
| `SessionEnd` | 会话结束时 |

> **注意：** 这些 Hook 类型的 stdin 输入格式与 PreToolUse/PostToolUse 不同，使用前请查阅文档。

### 18. Claude Code SDK

Claude Code SDK 允许在你自己的应用程序或脚本中**以编程方式运行 Claude Code**。

#### 核心特性

- 运行与终端中完全相同的 Claude Code
- 拥有同等的工具访问能力
- 继承同一目录下 Claude Code 实例的所有配置
- **默认只有只读权限**
- 最适合作为更大型管道或工具的一部分

#### 基本用法（TypeScript）

```typescript
import { query } from "@anthropic-ai/claude-code";

const prompt = "查找代码中的重复查询并提出优化建议";

for await (const message of query({ prompt })) {
  console.log(message);
}
```

#### 权限配置

默认只读，如需写入权限：

```typescript
for await (const message of query({
  prompt,
  options: {
    allowedTools: ["Edit"]
  }
})) {
  console.log(message);
}
```

#### 实际应用场景

- Git Hooks：自动审查代码变更
- 构建脚本：分析和优化代码
- 代码维护辅助命令
- 自动化文档生成
- CI/CD 流水线中的代码质量检查

## 第四章：总结

### 19. 总结与后续步骤（Summary and next steps）

本课程涵盖了 Claude Code 从安装、日常使用到高级自动化的完整工作流。推荐后续探索：

- Claude Code 官方文档：https://code.claude.com/docs
- 构建自定义 MCP 服务器扩展 Claude Code 能力
- 利用 SDK 将 Claude Code 集成到现有开发流水线

## 相关笔记

> **延伸阅读**
> - [Building with the Claude API](/academy/anthropic-academy/04-developer-tools/building-with-the-claude-api/) — API 开发基础
> - [Introduction to subagents](/academy/anthropic-academy/05-agentic-mcp/introduction-to-subagents/) — 子代理架构
