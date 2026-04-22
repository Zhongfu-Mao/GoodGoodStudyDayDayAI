---
title: "Introduction to Agent Skills"
date: 2026-03-31
category: academy
description: "Anthropic Agent Skills（技能包）介绍，含技能创建和使用"
coverImage: "/images/academy/anthropic-academy/covers/05-agentic-mcp/introduction-to-agent-skills.svg"
tags:
  - "Anthropic/Academy"
  - "课程笔记"
  - "代理/Skills"
  - "MCP/生态"
lang: zh
academy:
  series: "Anthropic Academy"
  module: "代理与 MCP"
  moduleOrder: 5
  source: "Anthropic Academy"
  sourceUrl: "https://anthropic.skilljar.com/introduction-to-agent-skills"
  prerequisites: []
draft: false
---
> 课程来源：[Anthropic Academy](https://anthropic.skilljar.com/introduction-to-agent-skills)
> 预计学习时间：约 90 分钟（6 节）

## 第一节：什么是 Skills？

### 核心概念

**Skills 是什么？**

Skills 是一组指令文件夹，Claude Code 可以发现并使用它们来更准确地处理任务。每个 skill 都存放在一个包含 `SKILL.md` 文件的目录中，该文件的 frontmatter 中含有名称（name）和描述（description）。

每次你向 Claude 解释团队的编码规范、重复描述 PR 反馈格式、提醒 Claude 偏好的 commit message 格式……其实都是在做重复劳动。Skills 就是用来解决这个问题的：**写一次，Claude 自动应用**。

### Skills 的工作机制

**描述（description）是触发匹配的关键。** 当你向 Claude 提出请求时，Claude 会将你的请求与所有可用 skill 的描述进行语义匹配，并激活匹配的 skill。

Skill 文件的 frontmatter 格式示例：

```yaml
---
name: pr-review
description: Reviews pull requests for code quality. Use when reviewing PRs or checking code changes.
---
```

frontmatter 下方就是具体的指令内容——你的 review checklist、格式偏好等。

### Skills 的存放位置

| 类型 | 路径 | 说明 |
|------|------|------|
| 个人 Skills | `~/.claude/skills` | 跨所有项目生效，随你本人移动 |
| 项目 Skills | `.claude/skills`（仓库根目录） | 随仓库克隆自动共享给所有人 |

> **Windows 用户**：个人 skills 存放在 `C:/Users/<your-user>/.claude/skills`

项目 skills 会随代码一起提交到版本控制，整个团队共享。

### Skills vs. CLAUDE.md vs. Slash Commands

| 特性 | 说明 |
|------|------|
| **CLAUDE.md** | 每次对话都会加载，适合"始终生效"的项目规范 |
| **Skills** | 按需加载，仅在匹配请求时激活，适合特定任务的专项知识 |
| **Slash Commands** | 需要手动输入触发，Skills 不需要——Claude 识别到场景自动应用 |

当 Claude 匹配到某个 skill 时，终端中会看到加载提示。

### 适合使用 Skills 的场景

- 团队代码审查标准
- Commit message 格式规范
- 组织的品牌规范
- 特定类型文档的模板
- 特定框架的调试清单

**经验法则**：如果你发现自己在反复向 Claude 解释同一件事，那这件事就值得被写成一个 skill。

## 第二节：创建你的第一个 Skill

### 关键要点

- Skill 是一个包含 `SKILL.md` 文件的目录，frontmatter 中含有 name 和 description，下方是具体指令
- Claude Code 启动时只加载 name 和 description，**不加载完整内容**（重要细节）
- 匹配到 skill 后，Claude 会先向你确认是否加载该 skill
- **优先级顺序**：Enterprise → Personal → Project → Plugins
- 更新 skill：编辑 `SKILL.md`；删除 skill：删除其目录。**修改后需重启 Claude Code**

### 创建 Skill 的步骤

以创建一个"PR 描述"个人 skill 为例（跨所有项目生效）：

**第一步：在 skills 文件夹中创建目录**

```bash
mkdir -p ~/.claude/skills/pr-description
```

**第二步：创建 SKILL.md 文件**

```markdown
---
name: pr-description
description: Writes pull request descriptions. Use when creating a PR, writing a PR, or when the user asks to summarize changes for a pull request.
---

When writing a PR description:

1. Run `git diff main...HEAD` to see all changes on this branch
2. Write a description following this format:

## What
One sentence explaining what this PR does.

## Why
Brief context on why this change is needed

## Changes
- Bullet points of specific changes made
- Group related changes together
- Mention any files deleted or renamed
```

`name` 是 skill 的标识符，`description` 是 Claude 判断何时使用该 skill 的依据——这是**匹配条件**。第二组 `---` 之后的所有内容都是实际执行指令。

**第三步：重启 Claude Code，验证 skill 可用**

重启后可查看可用 skill 列表确认。测试方式：在分支上做一些修改，说"为我的修改写一个 PR 描述"，Claude 会提示正在使用该 skill。

### Skill 的匹配机制

Claude Code 启动时扫描四个位置获取 skills，但**只加载 name 和 description，不加载完整内容**。

当你发送请求时，Claude 将消息与所有可用 skill 的描述进行语义比较。例如，"解释这个函数的作用"可能匹配描述为"用可视化图表解释代码"的 skill，因为意图有重叠。

匹配成功后，Claude 会请你确认是否加载该 skill，然后再将完整内容纳入上下文。

### Skill 优先级

当多个同名 skill 存在时，优先级从高到低：

1. **Enterprise**（管理员配置，最高优先级）
2. **Personal**（`~/.claude/skills`）
3. **Project**（`.claude/skills`，仓库内）
4. **Plugins**（已安装插件，最低优先级）

这种设计让组织可以通过 enterprise skills 强制推行标准，同时允许个人自定义。

**避免冲突的建议**：使用描述性更强的名称，例如用 `frontend-review` 或 `backend-review` 替代简单的 `review`。

## 第三节：配置与多文件 Skills

### 关键要点

- `name` 和 `description` 是**必填字段**，`allowed-tools` 和 `model` 是可选但强大的扩展
- 好的描述要回答两个问题：这个 skill 做什么？Claude 什么时候应该用它？
- `allowed-tools` 限制 skill 激活时 Claude 可用的工具，适合只读或安全敏感的工作流
- 渐进式披露：将 `SKILL.md` 控制在 500 行以内，把补充材料放在独立文件中，按需读取
- 脚本执行时不会将其内容加载进上下文，只有输出消耗 token，保持上下文高效

### Skill 元数据字段详解

| 字段 | 是否必填 | 说明 |
|------|----------|------|
| `name` | 必填 | Skill 标识符，仅限小写字母、数字、连字符，最多 64 字符，应与目录名一致 |
| `description` | 必填 | 告诉 Claude 何时使用该 skill，最多 1,024 字符，**最重要的字段** |
| `allowed-tools` | 可选 | 限制 skill 激活时 Claude 可用的工具 |
| `model` | 可选 | 指定该 skill 使用的 Claude 模型 |

### 如何写好 description

描述要明确，就像给新员工写岗位说明一样——不能只说"你的工作是帮助处理文档"，那 Claude 也不知道该做什么。

**一个好的 description 要回答两个问题：**
1. 这个 skill 做什么？
2. Claude 什么时候应该用它？

**调试技巧**：如果 skill 没有按预期触发，尝试添加更多关键词，匹配你实际使用的提问方式。

### allowed-tools 的使用

`allowed-tools` 可以限制 skill 激活时 Claude 能使用的工具，适用于只读或对安全有要求的工作流。

带 `allowed-tools` 和 `model` 的完整 frontmatter 示例：

```yaml
---
name: codebase-onboarding
description: Helps new developers understand the system works.
allowed-tools: Read, Grep, Glob, Bash
model: sonnet
---
```

如果**省略** `allowed-tools`，skill 不做任何限制，Claude 使用其正常权限模型。

### 渐进式披露（Progressive Disclosure）

Skills 与对话共享 Claude 的上下文窗口。当 Claude 激活一个 skill，会将 `SKILL.md` 的内容加载进上下文。

**问题**：把所有内容塞进一个 2000 行的文件，既占用大量上下文窗口，又难以维护。

**解决方案：渐进式披露**——将核心指令放在 `SKILL.md`，把详细参考资料放在独立文件中，Claude 只在需要时读取。

推荐的 skill 目录结构：

```
.claude/skills/my-skill/
├── SKILL.md          # 核心指令（保持在 500 行以内）
├── references/       # 详细参考文档
├── scripts/          # 可执行脚本
└── assets/           # 图片、模板或其他数据文件
```

在 `SKILL.md` 中，用明确的指令说明何时读取哪些补充文件。这样 Claude 的上下文窗口里只有"目录"，而不是整本书。

### 高效使用脚本

skill 目录中的脚本可以直接运行而不将其内容加载进上下文——**脚本执行，只有输出消耗 token**。关键是在 `SKILL.md` 中告诉 Claude"运行这个脚本"，而不是"读取这个脚本"。

适合用脚本处理的场景：
- 环境验证
- 需要保持一致性的数据转换
- 用经过测试的代码比生成代码更可靠的操作

## 第四节：Skills vs. Claude Code 其他功能

### 关键要点

- **CLAUDE.md** 每次对话都加载，适合始终生效的项目标准；**Skills** 按需加载，适合特定任务的专项知识
- **Subagents** 在独立执行上下文中运行，适合委托工作；Skills 为当前对话增加知识
- **Hooks** 是事件驱动的（文件保存、工具调用时触发）；Skills 是请求驱动的（根据你的请求激活）
- **MCP servers** 提供外部工具和集成，是完全不同的类别
- 每个功能各司其职——**组合使用**，而不是强行用一个功能包揽所有需求

### 功能对比详解

#### Skills vs. CLAUDE.md

**CLAUDE.md**：每次对话都加载，始终生效。适合放"TypeScript strict mode"这样的项目全局要求。

**Skills**：按需加载。匹配到请求时，该 skill 的指令才会加入上下文。

| 用 CLAUDE.md 存放 | 用 Skills 存放 |
|------------------|---------------|
| 始终生效的全项目标准 | 特定任务的专项知识 |
| "永远不要修改数据库 schema" | 只在某些时候才相关的知识 |
| 框架偏好和编码风格 | 会让每次对话都变得冗余的详细流程 |

#### Skills vs. Subagents

**Skills**：为当前对话增加知识。skill 激活时，其指令加入现有上下文。

**Subagents**：在独立上下文中运行。它们接收任务，独立完成，返回结果，与主对话隔离。

| 用 Subagents | 用 Skills |
|-------------|----------|
| 将任务委托给独立执行上下文 | 为当前任务增强 Claude 的知识 |
| 需要与主对话不同的工具访问权限 | 专项知识在整个对话中都适用 |
| 需要委托工作与主上下文隔离 | — |

#### Skills vs. Hooks

**Hooks**：事件驱动。例如每次 Claude 保存文件时运行 linter，或在特定工具调用前进行验证。

**Skills**：请求驱动。根据你的提问内容激活。

| 用 Hooks | 用 Skills |
|---------|----------|
| 每次文件保存时都应运行的操作 | 指导 Claude 如何处理请求的知识 |
| 特定工具调用前的验证 | 影响 Claude 推理的准则 |
| Claude 操作的自动化副作用 | — |

### 整体组合方案

一个典型的完整配置可能包含：

- **CLAUDE.md** — 始终生效的项目标准
- **Skills** — 按需加载的任务专项知识
- **Hooks** — 事件触发的自动化操作
- **Subagents** — 委托工作的独立执行上下文
- **MCP servers** — 外部工具和集成

每个功能各有专长。不要强行把所有需求塞进 skills，当其他功能更合适时就用其他功能。**Skills 的定位**：当你有某些知识希望 Claude 在话题相关时自动应用，这就是 skills 的用武之地。

## 第五节：分享 Skills

### 关键要点

- `.claude/skills` 中的项目 skills 通过 Git 自动共享——克隆仓库即可获得
- 插件允许通过 marketplace 跨仓库分发 skills，适合更广泛的社区使用
- 企业管理设置以最高优先级全组织部署，适合强制性标准和合规要求
- **Subagents 不会自动继承 skills**——必须在自定义 agent 的 frontmatter `skills` 字段中明确列出
- 内置 agents（Explorer、Plan、Verify）完全无法访问 skills——只有在 `.claude/agents` 中定义的自定义 subagents 才能使用

### 三种分发方式

#### 方式一：提交到仓库

最简单的方式。项目 skills（存放在 `.claude/skills`）会通过正常的 Git 工作流自动共享给整个团队。

`.claude` 目录包含你的 agents、hooks、skills 和 settings——全部版本控制，通过 Git 与团队共享。

**适合场景：**
- 特定项目的工作流
- 引用了你代码库结构的 skills

#### 方式二：通过插件分发

插件是一种用于跨团队和项目共享自定义功能的方式。在插件项目中，创建一个 `skills` 目录，结构与 `.claude` 目录类似——每个 skill 都有自己的文件夹，内含 `SKILL.md` 文件。

将插件发布到 marketplace 后，其他用户可以发现并安装到自己的 Claude Code 中。

**适合场景：** 不太针对特定项目、可以对社区成员广泛有用的 skills。

#### 方式三：企业管理设置

管理员可以通过企业管理设置在全组织范围内部署 skills，享有最高优先级。

**适合场景：** 强制性标准、安全要求、合规工作流、必须在全组织保持一致的编码规范。关键词是"**必须**"。

### Skills 与 Subagents 的配合

**重要注意事项**：Subagents 不会自动继承 skills。当你将任务委托给 subagent 时，它以全新的空白上下文开始。

关键区别：
- **内置 agents**（Explorer、Plan、Verify）完全无法访问 skills
- **自定义 subagents** 可以使用 skills，但必须**明确列出**
- Skills 在 subagent 启动时加载，而非像主对话那样按需加载

**创建带 skills 的自定义 subagent**：

在 `.claude/agents` 中添加 agent markdown 文件（可用 `/agents` 命令交互式创建），在 `skills` 字段中列出要加载的 skills：

```yaml
---
name: frontend-security-accessibility-reviewer
description: "Use this agent when you need to review frontend code for accessibility..."
tools: Bash, Glob, Grep, Read, WebFetch, WebSearch, Skill...
model: sonnet
color: blue
skills: accessibility-audit, performance-check
---
```

委托给这个 subagent 时，它会加载两个 skills 并将其应用于每次 review。

**这种模式适合：**
- 带有特定专项知识的独立任务委托
- 不同 subagents 需要不同 skills（前端 reviewer vs. 后端 reviewer）
- 在委托工作中强制执行标准，无需依赖 prompt 提示

## 第六节：排查 Skills 问题

### 关键要点

- 首先使用 skills validator——它能在你花时间调试其他问题之前发现结构性问题
- Skill 不触发，原因几乎总是 description——添加与你实际提问方式匹配的触发短语
- Skill 不加载，检查 `SKILL.md` 是否在命名目录内（而非 skills 根目录），且文件名必须完全是 `SKILL.md`
- Skill 用错了，说明 descriptions 太相似——让它们更有区分度
- 运行时错误，检查依赖、文件权限（`chmod +x`）和路径分隔符（始终用正斜杠）

### 使用 Skills Validator

**第一步永远是**：运行 agent skills verifier 命令（安装方式因操作系统而异，推荐使用 `uv` 快速安装）。

Validator 会检查：
- YAML 语法错误
- 必填字段缺失
- 文件结构问题

### 常见问题与解决方案

#### 问题一：Skill 不触发

**原因**：description 与你的提问方式语义重叠不足。

**解决方法：**
- 对比你的 description 和实际提问方式
- 添加用户会实际说的触发短语
- 测试各种变体，如"帮我分析性能"、"为什么这么慢？"、"让这段代码更快"
- 任何变体触发失败，就把对应关键词加到 description 中

#### 问题二：Skill 不加载

**检查结构要求：**
- `SKILL.md` 必须在**命名目录内**，而非直接在 skills 根目录
- 文件名必须**完全是 `SKILL.md`**——"SKILL" 全大写，"md" 全小写

运行 `claude --debug` 查看加载错误。

#### 问题三：用了错误的 Skill

**原因**：多个 skill 的 descriptions 过于相似。

**解决方法**：让 descriptions 更有区分度，越具体越好——这不仅帮助 Claude 判断何时使用该 skill，也能防止与其他相似 skill 的冲突。

#### 问题四：Skill 优先级冲突

**场景**：个人 skill 被忽略，可能是同名的 enterprise 或更高优先级 skill 覆盖了它。

**解决方法：**
- 将 skill 重命名为更有区分度的名称（通常这是更简单的路径）
- 与管理员沟通 enterprise skill 的问题

#### 问题五：插件 Skills 不出现

清除缓存、重启 Claude Code、重新安装插件。如果仍不出现，检查插件的目录结构是否正确。

#### 问题六：运行时错误

**常见原因：**
- **缺失依赖**：skill 使用了外部包，必须先安装。在 skill description 中添加依赖说明，让 Claude 知道需要什么
- **权限问题**：脚本需要执行权限，对 skill 引用的所有脚本运行 `chmod +x`
- **路径分隔符**：始终使用正斜杠，即使在 Windows 上也是如此

### 快速排查清单

| 现象 | 解决方向 |
|------|----------|
| 不触发 | 改进 description，添加触发短语 |
| 不加载 | 检查路径、文件名和 YAML 语法 |
| 用错 skill | 让各 skill 的 description 更有区分度 |
| 被更高优先级覆盖 | 检查优先级层次，考虑重命名 |
| 插件 skills 不出现 | 清除缓存并重新安装 |
| 运行时失败 | 检查依赖、权限和路径 |

## 课程总结

恭喜完成《Introduction to Agent Skills》！

**核心收获：**
- Skills 是解决"重复向 Claude 解释同一件事"问题的最佳方案
- 从真实的痛点出发创建 skills——从你最常重复的指令开始
- Description 的质量决定 skill 的匹配效果，是最值得打磨的字段
- 合理选择分发方式（个人/项目/插件/企业），让 skills 发挥最大价值
- Skills 与 CLAUDE.md、Hooks、Subagents、MCP servers 组合使用，构建完整的 Claude Code 工作流定制方案

## 相关笔记

> **延伸阅读**
> - [Introduction to Model Context Protocol](/academy/anthropic-academy/05-agentic-mcp/introduction-to-model-context-protocol/) — MCP 协议基础
> - [Introduction to subagents](/academy/anthropic-academy/05-agentic-mcp/introduction-to-subagents/) — 子代理架构
> - [Introduction to Claude Cowork](/academy/anthropic-academy/03-claude-product/introduction-to-claude-cowork/) — Skills 在 Cowork 中的应用
