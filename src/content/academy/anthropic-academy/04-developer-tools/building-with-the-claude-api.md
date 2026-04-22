---
title: "Building with the Claude API"
date: 2026-03-31
category: academy
description: "使用 Claude API 构建应用的开发者课程"
coverImage: "/images/academy/anthropic-academy/covers/04-developer-tools/building-with-the-claude-api.svg"
tags:
  - "Anthropic/Academy"
  - "课程笔记"
  - "Claude/API"
  - "开发者"
lang: zh
academy:
  series: "Anthropic Academy"
  module: "开发者与技术工具"
  moduleOrder: 4
  source: "Anthropic Academy"
  sourceUrl: "https://anthropic.skilljar.com/building-with-the-claude-api"
  prerequisites: []
draft: false
---
**来源：** [Anthropic Academy](https://anthropic.skilljar.com/claude-with-the-anthropic-api)
**语言：** 英文课程，中文笔记
**课节：** 85 节

### 第一章：简介

#### Claude 模型概览

Anthropic 提供三个主要模型系列，各有侧重：

| 模型 | 特点 | 适用场景 |
|------|------|----------|
| **Claude Opus** | 最强能力，最慢最贵 | 复杂分析、高质量写作 |
| **Claude Sonnet** | 能力与速度的平衡 | 大多数生产环境应用 |
| **Claude Haiku** | 最快最便宜 | 实时交互、高频请求 |

**选型原则：** 先从 Sonnet 开始，根据实际需求再上下调整。

### 第二章：通过 API 访问 Claude

#### API 请求生命周期（5 步流）

```
客户端（你的应用）
    ↓ 发送请求（含 API Key）
你的服务器（后端）
    ↓ 转发请求
Anthropic API
    ↓ 路由
Claude 模型
    ↓ 返回响应
客户端
```

**关键安全原则：** API Key **绝对不能**暴露在客户端（浏览器 JavaScript、前端代码）。必须将 API Key 存储在服务器端，由服务器代理所有对 Anthropic API 的请求。

#### 发起 API 请求

**基础调用示例：**

```python
import anthropic

client = anthropic.Anthropic()  # 自动读取 ANTHROPIC_API_KEY 环境变量

response = client.messages.create(
    model="claude-opus-4-5",
    max_tokens=1000,
    messages=[
        {"role": "user", "content": "Hello, Claude!"}
    ]
)

print(response.content[0].text)
```

**`messages.create()` 核心参数：**

| 参数 | 说明 | 备注 |
|------|------|------|
| `model` | 使用的模型名称 | 必填 |
| `max_tokens` | 响应的最大 token 数 | 必填；是安全上限，不是目标长度 |
| `messages` | 对话消息列表 | 必填；`[{"role": "user"/"assistant", "content": "..."}]` |
| `system` | 系统提示词 | 可选；设定 Claude 的行为方式 |
| `temperature` | 随机性/创意度 | 可选；0.0–1.0 |

#### 多轮对话（Multi-turn）

Claude 是**无状态的（Stateless）**：每次 API 调用都是独立的，Claude 不记得之前的对话。

**实现多轮对话的方法：** 每次请求都将完整的对话历史作为 `messages` 数组传入。

```python
messages = []

## 第一轮
messages.append({"role": "user", "content": "What is pizza?"})
response = client.messages.create(model=model, max_tokens=1000, messages=messages)
messages.append({"role": "assistant", "content": response.content[0].text})

## 第二轮（带完整历史）
messages.append({"role": "user", "content": "What toppings are popular?"})
response = client.messages.create(model=model, max_tokens=1000, messages=messages)
```

#### 系统提示词（System Prompt）

系统提示词用于**设定 Claude 的行为方式、角色、约束条件**，在整个对话中持续生效。

```python
response = client.messages.create(
    model=model,
    max_tokens=1000,
    system="You are a math tutor. Always give hints instead of direct answers.",
    messages=[{"role": "user", "content": "What is 2+2?"}]
)
```

**使用场景：** 定义角色（如"你是一位数学辅导老师"）、设置语气、限制回答范围等。

#### Temperature（温度）

控制 Claude 响应的随机性和创意度：

| 值 | 效果 | 适用场景 |
|----|------|----------|
| **0.0** | 极度确定性，几乎相同的输出 | 代码生成、数据提取、分类任务 |
| **0.5** | 中等随机性 | 一般对话、摘要 |
| **1.0** | 高随机性，富有创意 | 创意写作、头脑风暴、诗歌 |

#### 响应流式传输（Streaming）

流式传输让内容**边生成边显示**，提升用户体验。

```python
with client.messages.stream(
    model=model,
    max_tokens=1000,
    messages=[{"role": "user", "content": "Tell me a story"}]
) as stream:
    for text in stream.text_stream:
        print(text, end="", flush=True)
```

#### 结构化数据输出（Assistant Prefill）

通过**预填充 assistant 轮**，强制 Claude 以特定格式（如 JSON）输出：

```python
messages = [
    {"role": "user", "content": "Extract name and age from: John is 30 years old"},
    {"role": "assistant", "content": "{"}  # 预填充，强制 JSON 输出
]
response = client.messages.create(model=model, max_tokens=500, messages=messages)
## 响应将直接是 JSON 内容（不含前缀文字）
```

### 第三章：Prompt 评估（Prompt Evaluation）

#### 为什么需要 Prompt 评估？

仅靠直觉改进 prompt 是不可靠的。**Prompt 评估**通过系统化测试来衡量 prompt 是否真正改善了输出质量。

#### 评估工作流（4 步）

```
1. 定义任务
   ↓
2. 准备测试数据集（多样化的输入示例）
   ↓
3. 运行 → 获取 Claude 的响应
   ↓
4. 评分 → 通过 Grader 评估输出质量
   ↓
分析结果，迭代改进 prompt
```

#### 三种 Grader（评分器）类型

| Grader 类型 | 说明 | 适用场景 |
|-------------|------|----------|
| **Code Grader（代码评分器）** | 用程序逻辑检查输出（如正则匹配、格式验证） | 结构化输出、格式验证 |
| **Model Grader（模型评分器）** | 用另一个 AI 模型（LLM-as-judge）评估质量，给出 1-10 分 | 主观质量、语义相关性 |
| **Human Grader（人工评分器）** | 人工标注，作为金标准 | 建立基准、复杂判断 |

**关键认知：** 应用 prompt 工程技术后，必须通过评估来验证是否真的改进了，而不是直接上线。

### 第四章：Prompt 工程技术

#### 六大核心技术

**1. 清晰直接（Clear and Direct）**
- 使用动词开头（"Write", "Analyze", "List"）
- 第一行最重要，直接说明核心需求
- 避免模糊表达（"maybe", "something about"）

**对比示例：**
- ❌ "I was wondering if you could maybe help me with something about products?"
- ✅ "Write a product description for running shoes."

**2. 提供上下文（Context）**
- 解释你想要什么、为什么要、相关背景
- 说明目标受众、使用场景

**3. 展示示例（Examples）**
- 单样本（One-shot）：提供 1 个示例
- 多样本（Multi-shot）：提供多个示例，用 `<sample_input>` `<ideal_output>` 标签包裹

**4. 明确约束（Constraints）**
- 清晰定义格式、长度、风格等要求
- "用不超过 200 字" / "以 JSON 格式返回" / "只回答技术问题"

**5. XML 标签组织结构**
- 使用 XML 标签分隔不同类型的信息

```xml
<customer_reviews>
{reviews_content}
</customer_reviews>

<sales_data>
{sales_content}
</sales_data>

请分析以上数据，找出关联模式。
```

**6. 引导逐步推理（Step-by-step）**
- 要求 Claude 先思考再回答
- "先列出思考步骤，再给出最终答案"

#### 迭代改进原则

成功的 prompt 工程是**迭代的过程**：写 → 测试 → 评估 → 改进 → 再测试。

### 第五章：工具使用（Tool Use）

#### 工具使用的意义

Tool Use 让 Claude 能够**访问实时信息和外部系统**，突破训练数据的局限。

**工具函数定义：** 一个普通函数，在 Claude 判断需要时由你的代码执行（Claude 本身不直接执行代码）。

#### 工具使用四步流程

```
1. 用户提问 → Claude 判断需要使用工具
   ↓
2. Claude 返回 ToolUseBlock（工具调用请求）
   ↓
3. 你的服务器执行工具函数，获取结果
   ↓
4. 将工具结果作为 tool_result 发回 → Claude 生成最终回答
```

#### 工具 Schema 定义

```python
from anthropic.types import ToolParam

get_weather_schema = ToolParam({
    "name": "get_weather",
    "description": "Get current weather for a location",
    "input_schema": {
        "type": "object",
        "properties": {
            "location": {
                "type": "string",
                "description": "City name, e.g. 'San Francisco'"
            }
        },
        "required": ["location"]
    }
})
```

**命名约定：** `func_name` + `func_name_schema`（函数名与 Schema 名配对）

#### 多块消息结构（Multi-block Messages）

Claude 响应工具调用时，可能同时包含：
- `TextBlock`：解释性文字
- `ToolUseBlock`：工具调用请求

这种结构称为**多块消息（Multi-block Message）**。在维护对话历史时，必须完整保留这个多块结构。

#### 细粒度工具调用（Fine-grained Tool Calling）

```python
## fine_grained=True 禁用 API 端的 JSON 校验，实现更快的流式传输
## 但需要客户端自行处理 JSON 解析错误
params["fine_grained"] = True
```

### 第六章：RAG 与 Agentic 搜索

#### RAG（检索增强生成）的工作原理

RAG 解决了 Claude 无法访问私有/实时知识库的问题。

**流程：**
```
大型文档 → 切块（Chunking）→ 向量化（Embedding）→ 存入向量数据库
                                                           ↓
用户提问 → 语义搜索（找相关块）→ 将相关块注入 Prompt → Claude 回答
```

#### 文本嵌入（Embeddings）

文本嵌入将文字转换为**数值向量**，语义相近的文字在向量空间中距离更近。

**Anthropic 不提供 Embedding API**，推荐使用 **VoyageAI**：

```python
import voyageai

client = voyageai.Client()

## 查询嵌入
result = client.embed(["用户的问题"], model="voyage-3-large", input_type="query")

## 文档嵌入
result = client.embed(["文档内容"], model="voyage-3-large", input_type="document")
```

**相似度计算：** 使用**余弦相似度（Cosine Similarity）**衡量两个向量的语义相似程度。

#### 混合搜索

除语义搜索外，还可结合 **BM25**（基于关键词的传统搜索）进行混合检索，提升准确率。

### 第七章：Claude 的高级特性

#### 1. Extended Thinking（扩展思考）

让 Claude 在回答前进行**深度推理**，适合复杂数学、逻辑、分析问题。

```python
params["thinking"] = {
    "type": "enabled",
    "budget": 5000  # 思考 token 预算，最少 1024
}
```

**响应结构：** `ThinkingBlock`（思考过程，含 signature 防篡改）+ `TextBlock`（最终回答）

**注意限制：**
- 不兼容 assistant 预填充（structured output）
- 不支持自定义 temperature

#### 2. 图片与 PDF 支持

Claude 是多模态模型，可以直接理解图片和 PDF 内容，用于文档分析、表格提取等场景。

#### 3. 引用（Citations）

在文档分析场景中，开启 Citations 功能让 Claude 提供**精确的来源引用**，便于用户核实信息。

```python
## 在 document 内容块中开启
{
    "type": "document",
    "source": {...},
    "citations": {"enabled": True}
}
```

响应中包含 `cited_text`、页码、文档索引等信息。

#### 4. Prompt 缓存（Prompt Caching）

对于重复包含相同长文档或系统提示的请求，Prompt 缓存可以**节省计算成本**，加快响应速度。

```python
## 在内容块中添加 cache_control
{
    "type": "text",
    "text": very_long_document,
    "cache_control": {"type": "ephemeral"}  # 缓存持续 1 小时
}
```

**最佳场景：** 反复对同一长文档提不同问题（如文档问答）。

#### 5. Files API

允许将文件上传到 Anthropic 服务器，通过文件 ID 在多次请求中引用，避免重复传输大文件。

### 第八章：Model Context Protocol（MCP）

#### 什么是 MCP？

MCP（模型上下文协议）是一个**通信层**，让 Claude 能够访问工具、提示和资源，**无需编写繁琐的集成代码**。

#### MCP 的角色分工

| 角色 | 职责 |
|------|------|
| **MCP Server（服务端）** | 包含工具、提示词模板和资源；提供具体功能 |
| **MCP Client（客户端）** | 作为通信桥梁，连接 Claude 与 MCP Server；访问 Server 提供的工具 |

#### Transport Agnostic（传输无关性）

MCP 的重要特性：MCP Client 和 Server 可以使用**不同的传输方式**进行通信：
- **HTTP**（远程服务）
- **stdio（标准输入/输出）**（本地进程）

这使得 MCP 既可以连接本地工具，也可以连接远程服务。

### 第九章：Anthropic 应用

#### Claude Code

Claude Code 是面向开发者的**命令行 AI 编程助手**，可以直接在终端中完成代码编写、调试、重构等任务，支持自主执行多步骤开发工作流。

#### Computer Use（计算机使用）

Computer Use 是一项让 Claude 能够**像人一样直接操作桌面环境**的能力：
- 查看屏幕截图
- 移动鼠标、点击按钮
- 输入文字
- 执行完整的 GUI 操作流程

适用于自动化测试、复杂工作流、RPA（机器人流程自动化）等场景。

### 第十章：Agents 与工作流（Agents and Workflows）

#### 核心区别

| | 工作流（Workflows） | Agent |
|--|-------------------|-------|
| **控制方式** | 预定义步骤，开发者决定流程 | Claude 自主决定下一步 |
| **可预测性** | 高，步骤固定 | 低，行为灵活 |
| **可测试性** | 容易 | 困难 |
| **适用场景** | 流程清晰的任务 | 需要灵活判断的任务 |

**首选原则：** 优先使用工作流；只有在工作流无法满足灵活性需求时，才考虑 Agent。

**判断标准：** 如果你能画出流程图——用工作流；如果无法预判步骤——用 Agent。

#### 三大工作流模式

##### 1. 并行化（Parallelization）

将任务拆分为多个**并行**的子任务，同时处理，最后聚合结果。

```
用户请求
    ↓
任务分解
  ↓   ↓   ↓
子1  子2  子3   ← 并行执行
  ↓   ↓   ↓
    结果聚合
        ↓
    最终输出
```

**实现工具：** `batch tool`（接受多个工具调用并同时执行）

**适用场景：** 大规模数据处理、多维度分析、并发 API 调用。

##### 2. 链式工作流（Chaining Workflows）

将复杂任务拆分为多个**顺序执行**的子任务，每个步骤的输出是下一步的输入。

```
输入 → 步骤1（草稿）→ 步骤2（审核）→ 步骤3（润色）→ 最终输出
```

**解决的痛点：** 当 prompt 过长时，Claude 容易忽略某些约束条件；链式工作流将复杂任务分解，每步聚焦单一目标。

**适用场景：** 文章写作流程、数据 ETL 管道、多阶段分析。

##### 3. 路由工作流（Routing Workflows）

先对输入**分类**，再将其路由到相应的专门处理流程。

```
用户输入
    ↓
分类器（Claude 判断类型）
  ↓         ↓         ↓
技术问题   账单问题   投诉问题
  ↓         ↓         ↓
技术流程  账单流程  投诉流程
```

**适用场景：** 客服系统、多语言处理、不同复杂度任务的分级处理。

#### Evaluator-Optimizer 模式

一种特殊的循环工作流：

```
生产者（Producer）→ 输出草稿
        ↓
评估者（Evaluator）→ 给出评分和反馈
        ↓
反馈回到生产者 → 迭代改进
        ↓
达到质量标准 → 输出最终结果
```

#### Agent 工作原理

Agent 让 Claude 在循环中**自主决定**：
1. 观察当前环境状态（Environment Inspection）
2. 选择下一个行动/工具
3. 执行并观察结果
4. 重复直到任务完成

**Environment Inspection（环境检查）** 是 Agent 的核心能力：让 Agent 能观察和理解自己行动的结果，从而做出下一步判断。

### 📎 相关笔记

> **延伸阅读**
> - [Claude 101](/academy/anthropic-academy/03-claude-product/claude-101/) — Claude 基础入门
> - [Claude Code in Action](/academy/anthropic-academy/04-developer-tools/claude-code-in-action/) — CLI 工具实战
> - [Introduction to Model Context Protocol](/academy/anthropic-academy/05-agentic-mcp/introduction-to-model-context-protocol/) — API 扩展生态 MCP
