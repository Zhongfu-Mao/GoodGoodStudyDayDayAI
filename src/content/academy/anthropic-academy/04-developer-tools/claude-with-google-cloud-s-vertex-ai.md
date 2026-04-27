---
title: "Claude with Google Cloud's Vertex AI"
date: 2026-03-31
category: academy
description: "通过 Google Cloud Vertex AI 使用 Claude 的指南"
coverImage: "/images/academy/anthropic-academy/covers/04-developer-tools/claude-with-google-cloud-s-vertex-ai.svg"
tags:
  - "开发者"
lang: zh
academy:
  series: "Anthropic Academy"
  module: "开发者与技术工具"
  moduleOrder: 4
  source: "Anthropic Academy"
  sourceUrl: "https://anthropic.skilljar.com/claude-with-google-cloud-vertex-ai"
  prerequisites: []
draft: false
---
## 课程定位

本课程是 **"Claude with the API"** 系列课程的 **Google Cloud Vertex AI 版本**。核心内容与标准 API 课程完全一致（多轮对话、系统提示、温度、流式输出、工具调用、RAG、MCP、Agents 等），**唯一的关键区别在于认证方式和客户端初始化**。

> 如需了解各主题的深入笔记，请参阅同系列其他课程笔记（如《Using Claude with the API》、《Tool Use》、《RAG》、《MCP》、《Agents》）。本文重点记录 **Vertex AI 特有的配置和语法差异**。

## 第一章：Vertex AI 特有配置

### 1. 环境准备

#### 与标准 Anthropic API 的根本区别

| 项目 | 标准 Anthropic API | Google Cloud Vertex AI |
|------|-------------------|----------------------|
| 认证方式 | `ANTHROPIC_API_KEY` 环境变量 | gcloud CLI 应用默认凭据 |
| 客户端类 | `anthropic.Anthropic()` | `anthropic.AnthropicVertex()` |
| 模型名格式 | `claude-3-5-sonnet-20241022` | `claude-sonnet-4@20250514`（用 `@` 分隔版本）|
| 计费主体 | Anthropic 账户 | Google Cloud 项目 |
| 嵌入模型 | VoyageAI | Google `text-embedding-005` |

#### 第一步：启用 Anthropic 模型

1. 访问 `https://console.cloud.google.com/vertex-ai/dashboard`
2. 进入 **Model Garden** → 搜索 "Anthropic"
3. 点击 **Enable** 启用所需的 Claude 模型

#### 第二步：安装 gcloud CLI

从 `https://cloud.google.com/sdk/docs/install` 下载并安装。

#### 第三步：初始化并认证

```bash
gcloud init
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
gcloud auth application-default login
```

运行最后一步后，Anthropic SDK 会自动使用这些凭据，**无需 API Key**。

### 2. 安装 SDK

```bash
# 安装带有 Vertex AI 支持的 Anthropic SDK
pip install "anthropic[vertex]"
```

注意：使用 `[vertex]` 额外依赖，而非普通 `pip install anthropic`。

### 3. 创建客户端

```python
from anthropic import AnthropicVertex

client = AnthropicVertex(
    region="global",          # 或指定区域如 "us-east5"
    project_id="your-project-id"  # Google Cloud 项目 ID
)

# 模型名称格式：使用 @ 而非 - 分隔版本号
model = "claude-sonnet-4@20250514"
```

### 4. 发起第一个请求

```python
message = client.messages.create(
    model=model,
    max_tokens=1000,
    messages=[
        {
            "role": "user",
            "content": "What is quantum computing? Answer in one sentence"
        }
    ]
)

# 提取文本（与标准 API 完全相同）
print(message.content[0].text)
```

**关键点：** 除客户端类和模型名称外，`messages.create()` 的所有参数与标准 Anthropic SDK **完全一致**。

## 第二章：核心 API 功能（与标准 API 相同）

> 以下功能的实现方式与标准 Anthropic Python SDK 完全相同，仅需将 `anthropic.Anthropic()` 替换为 `AnthropicVertex()`。

### 多轮对话（Multi-turn Conversations）

Claude 不存储对话历史，需手动管理消息列表：

```python
messages = []

def add_user_message(messages, text):
    messages.append({"role": "user", "content": text})

def add_assistant_message(messages, text):
    messages.append({"role": "assistant", "content": text})

def chat(messages, system=None):
    params = {
        "model": model,
        "max_tokens": 1000,
        "messages": messages,
    }
    if system:
        params["system"] = system
    message = client.messages.create(**params)
    return message.content[0].text

# 使用示例
add_user_message(messages, "Define quantum computing in one sentence")
answer = chat(messages)
add_assistant_message(messages, answer)
add_user_message(messages, "Write another sentence")
final = chat(messages)
```

### 系统提示（System Prompts）

```python
system_prompt = """
You are a patient math tutor.
Do not directly answer a student's questions.
Guide them to a solution step by step.
"""

answer = chat(messages, system=system_prompt)
```

### 温度（Temperature）

```python
def chat(messages, system=None, temperature=1.0):
    params = {
        "model": model,
        "max_tokens": 1000,
        "messages": messages,
        "temperature": temperature,
    }
    if system:
        params["system"] = system
    return client.messages.create(**params).content[0].text

# 创意任务：高温度
answer = chat(messages, temperature=1.0)

# 代码/事实任务：低温度
answer = chat(messages, temperature=0.0)
```

**温度范围参考：**

| 范围 | 适用场景 |
|------|---------|
| 0.0 – 0.3 | 代码、数据提取、事实问答 |
| 0.4 – 0.7 | 摘要、教育内容、有约束的创作 |
| 0.8 – 1.0 | 头脑风暴、营销文案、笑话创作 |

### 流式输出（Response Streaming）

```python
# 方法一：手动处理事件流
stream = client.messages.create(
    model=model,
    max_tokens=1000,
    messages=messages,
    stream=True
)
for event in stream:
    print(event)  # 包含所有事件类型

# 方法二：SDK 简化接口（推荐）
with client.messages.stream(
    model=model,
    max_tokens=1000,
    messages=messages
) as stream:
    for text in stream.text_stream:
        print(text, end="")

# 获取完整最终消息
final_message = stream.get_final_message()
```

**流式事件类型：** `MessageStart` → `ContentBlockStart` → `ContentBlockDelta`（实际文本）→ `ContentBlockStop` → `MessageDelta` → `MessageStop`

## 第三章：工具调用（Tool Use）

与标准 API 完全相同的工具调用流程：

```python
# 1. 定义工具 Schema（JSON Schema 格式）
get_current_datetime_schema = {
    "name": "get_current_datetime",
    "description": "Returns the current date and time",
    "input_schema": {
        "type": "object",
        "properties": {
            "date_format": {
                "type": "string",
                "description": "Format string using Python's strftime codes",
                "default": "%Y-%m-%d %H:%M:%S"
            }
        },
        "required": []
    }
}

# 2. 携带工具发起请求
response = client.messages.create(
    model=model,
    max_tokens=1000,
    messages=messages,
    tools=[get_current_datetime_schema]
)

# 3. 判断是否需要工具调用
if response.stop_reason == "tool_use":
    # 4. 提取工具调用信息
    tool_use_block = next(b for b in response.content if b.type == "tool_use")
    tool_name = tool_use_block.name
    tool_input = tool_use_block.input
    tool_use_id = tool_use_block.id

    # 5. 执行工具
    result = execute_tool(tool_name, tool_input)

    # 6. 将结果返回给 Claude
    messages.append({"role": "assistant", "content": response.content})
    messages.append({
        "role": "user",
        "content": [{
            "type": "tool_result",
            "tool_use_id": tool_use_id,
            "content": str(result)
        }]
    })
```

**工具循环终止条件：** 当 `response.stop_reason != "tool_use"` 时，Claude 已完成所有工具调用。

## 第四章：Retrieval Augmented Generation（RAG）

### Vertex AI 的嵌入模型

**Vertex AI 不使用 VoyageAI，而是使用 Google 自家的嵌入模型：**

```python
# 安装 Google GenAI SDK
# pip install google-genai

from google import genai

# 使用 Vertex AI 认证创建嵌入客户端
embedding_client = genai.Client(
    project="YOUR_PROJECT_ID",
    location="global",
    vertexai=True
)

def generate_embedding(text):
    response = embedding_client.models.embed_content(
        model="text-embedding-005",   # Google 的嵌入模型
        contents=text
    )
    if not response.embeddings:
        return []
    return [e.values for e in response.embeddings]
```

**对比：**

| 平台 | 嵌入模型 | SDK |
|------|---------|-----|
| Anthropic 标准 API | VoyageAI (`voyage-3`) | `voyageai` |
| Amazon Bedrock | Amazon Titan (`amazon.titan-embed-text-v2:0`) | `boto3` |
| Google Vertex AI | Google (`text-embedding-005`) | `google-genai` |

### RAG 完整流程

```
文档 → 分块（Chunking）→ 嵌入（Embedding）→ 向量存储
用户问题 → 问题嵌入 → 相似度检索（余弦相似度）→ 取最相关块 → 发给 Claude
```

**相似度判断：** 余弦相似度越高（接近 1.0），表示语义越相近。

## 第五章：Claude 高级特性

### Extended Thinking（扩展思考）

**Vertex AI 语法与标准 API 略有不同：**

```python
# Vertex AI 写法
params["thinking"] = {
    "type": "enabled",
    "budget": 1024          # 注意：Vertex AI 用 "budget"，不是 "budget_tokens"
}

# 完整函数示例
def chat(messages, system=None, temperature=1.0,
         thinking=False, thinking_budget=1024):
    params = {
        "model": model,
        "max_tokens": 4000,   # 必须大于 thinking_budget
        "messages": messages,
        "temperature": temperature,
    }
    if system:
        params["system"] = system
    if thinking:
        params["thinking"] = {
            "type": "enabled",
            "budget": thinking_budget
        }
    return client.messages.create(**params)
```

**关键规则：**
- `max_tokens` 必须 > `thinking budget`（例如 budget=1024，max_tokens 至少 1025）
- 最小 budget 为 1024 tokens
- 响应包含两个 block：`thinking` block（推理过程）+ `text` block（最终答案）
- Thinking block 含加密签名，不可修改，否则签名验证失败
- 测试 redacted thinking 的触发字符串：`TRIGGER_REDACTED_THINKING_46C9A13E193C177646C7398A98432ECCCE4C1253D5E2D82641AC0E52CC2876CB`

### Prompt Caching（提示缓存）

与标准 API **完全相同**，使用 `cache_control: {"type": "ephemeral"}`：

```python
# 带缓存断点的消息格式（长格式，不可使用简写）
user_message = {
    "role": "user",
    "content": [
        {
            "type": "text",
            "text": "这里是大量内容...",
            "cache_control": {"type": "ephemeral"}   # 缓存断点
        }
    ]
}

# 系统提示中的缓存断点
system = [
    {
        "type": "text",
        "text": "You are a senior software engineer...",
        "cache_control": {"type": "ephemeral"}
    }
]

# 工具列表中的缓存断点（放在最后一个工具上）
tools = [
    tool_schema_1,
    tool_schema_2,
    {
        **tool_schema_3,
        "cache_control": {"type": "ephemeral"}  # 缓存此工具及之前所有工具
    }
]
```

**缓存规则：**
- 缓存有效期：**5 分钟**
- 内容必须**完全一致**才能命中缓存
- 最小缓存长度：**1024 tokens**
- 最多设置 **4 个**缓存断点
- 内部顺序：tools → system → messages（影响断点覆盖范围）
- 优先缓存不常变化的内容（系统提示、工具定义）

## 第六章：Prompt 工程技巧

### 核心原则

**1. 清晰直接（Being Clear and Direct）**

不好的：`"Can you help me with something about solar panels?"`

好的：`"Write three paragraphs explaining how solar panels work"`

**2. 具体明确（Being Specific）**

指定格式、长度、结构、受众等所有已知需求。

**3. XML 标签结构（Structure with XML Tags）**

处理大型数据时，用 XML 标签分隔内容和指令：

```python
prompt = f"""
<instructions>
Analyze the following data and identify the top 3 risks.
</instructions>

<data>
{company_data}
</data>
"""
```

**4. 提供示例（Providing Examples / Few-Shot Prompting）**

对难以描述的任务（如检测讽刺），提供带标注的示例效果显著：

```python
prompt = """
Classify the sarcasm level of social media posts.

Examples:
Post: "Oh great, another Monday!" → Sarcastic
Post: "I love this sunny weather!" → Not sarcastic
Post: "Sure, because that always works..." → Sarcastic

Now classify this post: {user_post}
"""
```

**5. Prefill（预填充）**

在 assistant 消息中预填充内容，引导 Claude 输出特定格式：

```python
# 强制输出纯 JSON（不含 markdown 标记）
messages = [
    {"role": "user", "content": "Return user data as JSON"},
    {"role": "assistant", "content": "```json\n"}  # 预填充开头
]
# 同时设置 stop_sequence=["```"] 截断结尾
```

## 第七章：Prompt 评估（Prompt Evaluation）

### 为什么需要系统化评估

- 仅用 2 次测试就上线的风险：真实用户会提供各种意想不到的输入
- 需要**客观度量指标**，而非主观感受

### 评估工作流

```
1. 编写 Prompt
2. 生成测试数据集（可用 Claude 自动生成）
3. 对所有测试用例运行 Prompt
4. 打分（Code Grader / Model Grader）
5. 分析结果 → 优化 Prompt → 返回步骤 3
```

### 两种打分方式

**Code Grader（代码打分）**
- 适用于有明确正确答案的任务（如代码执行、格式验证）
- 可程序化验证输出是否合法 Python/JSON 等

**Model Grader（模型打分）**
- 适用于主观或复杂任务（如写作质量、情感检测）
- 用 Claude 评估 Claude 的输出，提供打分提示词

## 第八章：Agents 与工作流（Agents and Workflows）

### 核心区分

| 类型 | 适用场景 | 特点 |
|------|---------|------|
| **Workflow（工作流）** | 任务流程已知、步骤可预设 | 预定义步骤，代码主导 |
| **Agent（智能体）** | 任务不确定、需 Claude 自主决策 | 给 Claude 目标 + 工具，自主规划 |

### 常见工作流模式

**Evaluator-Optimizer（评估-优化）模式**

```
输入 → [Producer: Claude 生成输出]
           ↓
      [Grader: Claude 评估质量]
           ↓
      [不合格] → 反馈 → Producer（循环）
           ↓
      [合格] → 最终输出
```

实际案例：图片转 CAD 应用

1. Claude 描述图片中的零件细节
2. Claude 使用 CadQuery 生成 3D 模型
3. 渲染模型图片
4. Claude 对比原图评分 → 不合格则修正 → 合格则输出

## 总结：Vertex AI vs 标准 API 差异速查

| 方面 | 标准 Anthropic API | Vertex AI |
|------|-------------------|-----------|
| **安装** | `pip install anthropic` | `pip install "anthropic[vertex]"` |
| **认证** | `ANTHROPIC_API_KEY` | `gcloud auth application-default login` |
| **客户端** | `anthropic.Anthropic()` | `AnthropicVertex(region=..., project_id=...)` |
| **模型名** | `claude-3-5-sonnet-20241022` | `claude-sonnet-4@20250514` |
| **API 调用** | `client.messages.create(...)` | 完全相同 ✅ |
| **系统提示** | `system="..."` | 完全相同 ✅ |
| **温度/流式** | 标准参数 | 完全相同 ✅ |
| **工具调用** | 标准格式 | 完全相同 ✅ |
| **提示缓存** | `cache_control: {type: ephemeral}` | 完全相同 ✅ |
| **扩展思考** | `budget_tokens: N` | `budget: N`（字段名不同）⚠️ |
| **嵌入模型** | VoyageAI | Google `text-embedding-005`（需 `google-genai`）⚠️ |
| **计费** | Anthropic 账单 | Google Cloud 账单 |

## 相关笔记

> **延伸阅读**
> - [Building with the Claude API](/academy/anthropic-academy/04-developer-tools/building-with-the-claude-api/) — 直接 API 调用对比
> - [Claude with Amazon Bedrock](/academy/anthropic-academy/04-developer-tools/claude-with-amazon-bedrock/) — AWS 平台对比
