---
title: "Claude with Amazon Bedrock"
date: 2026-03-31
category: academy
description: "通过 Amazon Bedrock 使用 Claude 的指南"
plainSummary: "这篇笔记把 Claude with Amazon Bedrock 的核心内容整理成可复习、可实践的 开发者与技术工具 学习路径。"
difficulty: advanced
coverImage: "/images/academy/anthropic-academy/covers/04-developer-tools/claude-with-amazon-bedrock.svg"
tags:
  - "开发者"
lang: zh
academy:
  series: "Anthropic Academy"
  module: "开发者与技术工具"
  moduleOrder: 4
  source: "Anthropic Academy"
  sourceUrl: "https://anthropic.skilljar.com/claude-with-amazon-bedrock"
  prerequisites: []
draft: false
---
**适用对象：** AWS 开发者，希望通过 Amazon Bedrock 使用 Claude

> 本课程内容与「Building with the Claude API」高度重合，但将 **Anthropic Python SDK** 替换为 **boto3 + Amazon Bedrock**。笔记重点标注两者差异。

## 目录

1. [核心差异对比：Bedrock vs Anthropic SDK](#核心差异对比)
2. [第一章：使用 API](#第一章使用-api)
3. [第二章：提示工程](#第二章提示工程)
4. [第三章：工具使用](#第三章工具使用)
5. [第四章：RAG 检索增强生成](#第四章rag-检索增强生成)
6. [第五章：Claude 特性功能](#第五章claude-特性功能)
7. [第六章：模型上下文协议 MCP](#第六章模型上下文协议-mcp)
8. [第七章：智能体（Agents）](#第七章智能体agents)

## 核心差异对比

| 功能 | Anthropic SDK | Amazon Bedrock (boto3) |
|------|--------------|----------------------|
| 客户端创建 | `anthropic.Anthropic()` | `boto3.client("bedrock-runtime", region_name="us-west-2")` |
| 发送请求 | `client.messages.create()` | `client.converse()` |
| 流式输出 | `client.messages.stream()` | `client.converse_stream()` |
| 消息内容格式 | `"content": "文字"` | `"content": [{"text": "文字"}]` |
| 提取回复文本 | `response.content[0].text` | `response["output"]["message"]["content"][0]["text"]` |
| 系统提示 | `system="..."` | `system=[{"text": "..."}]` |
| 温度设置 | `temperature=0.5` | `inferenceConfig={"temperature": 0.5}` |
| 停止序列 | `stop_sequences=["5"]` | `inferenceConfig={"stopSequences": ["5"]}` |
| 嵌入模型 | VoyageAI `voyage-3-large` | Amazon Titan `amazon.titan-embed-text-v2:0` |
| 提示缓存标记 | `cache_control: {"type": "ephemeral"}` | `{"cachePoint": {"type": "default"}}` |
| 工具结果格式 | `tool_result` block | `{"toolResult": {"toolUseId": ..., "content": [...], "status": "success"}}` |

## 第一章：使用 API

### 1.1 访问 API — 请求流程

```
用户输入 → 服务器 → Bedrock 客户端 → AWS Bedrock → 模型处理 → 返回响应
```

Bedrock 不存储任何消息，每次 API 调用完全独立。

### 1.2 创建客户端

```python
import boto3
import json

client = boto3.client("bedrock-runtime", region_name="us-west-2")
```

### 1.3 模型 ID 与推理配置文件

**问题：** 不是每个模型在每个 AWS 区域都可用，指定不可用区域会报错。

**解决方案：推理配置文件（Inference Profiles）**
- 自动路由到有该模型的区域
- 在 AWS Bedrock 控制台 → "Cross-region inference" 中找到配置文件 ID
- 示例 ID：`us.anthropic.claude-3-5-sonnet-20241022-v2:0`（注意 `us.` 前缀）

### 1.4 发起请求

```python
model_id = "us.anthropic.claude-3-5-sonnet-20241022-v2:0"

user_message = {
    "role": "user",
    "content": [{"text": "What's 1+1?"}]   # ← 注意：content 是列表
}

response = client.converse(
    modelId=model_id,
    messages=[user_message]
)

# 提取文本（层级较深）
text = response["output"]["message"]["content"][0]["text"]
```

> ⚠️ Bedrock 消息结构：`content` 是字典列表（支持多模态），不是简单字符串。

### 1.5 多轮对话

Bedrock 无状态，需手动维护对话历史：

```python
def add_user_message(messages, text):
    user_message = {"role": "user", "content": [{"text": text}]}
    messages.append(user_message)

def add_assistant_message(messages, text):
    assistant_message = {"role": "assistant", "content": [{"text": text}]}
    messages.append(assistant_message)

def chat(messages):
    response = client.converse(modelId=model_id, messages=messages)
    return response["output"]["message"]["content"][0]["text"]

# 使用示例
messages = []
add_user_message(messages, "What's 1+1?")
answer = chat(messages)
add_assistant_message(messages, answer)
add_user_message(messages, "And 3 more?")
answer = chat(messages)
```

**规则：** 消息角色必须交替（user → assistant → user ...），不能连续两条同角色。

### 1.6 系统提示

```python
system_prompt = "You are an AWS cloud support specialist. Only answer AWS-related questions."

response = client.converse(
    modelId=model_id,
    messages=messages,
    system=[{"text": system_prompt}]   # ← 列表包字典，注意格式
)
```

```python
# 灵活版：可选系统提示
def chat(messages, system=None):
    params = {"modelId": model_id, "messages": messages}
    if system:
        params["system"] = [{"text": system}]
    response = client.converse(**params)
    return response["output"]["message"]["content"][0]["text"]
```

**注意：** 系统提示不能为空字符串。

### 1.7 温度（Temperature）

```python
def chat(messages, system=None, temperature=1.0):
    params = {
        "modelId": model_id,
        "messages": messages,
        "inferenceConfig": {"temperature": temperature}   # ← 嵌套在 inferenceConfig
    }
    if system:
        params["system"] = [{"text": system}]
    response = client.converse(**params)
    return response["output"]["message"]["content"][0]["text"]
```

| 温度范围 | 适用场景 |
|---------|---------|
| 0.0–0.3 | 事实问答、代码、数据提取 |
| 0.4–0.7 | 摘要、教育、问题解决 |
| 0.8–1.0 | 创意写作、头脑风暴 |

默认温度 **1.0**（最大创意）。

### 1.8 流式输出（Streaming）

```python
response = client.converse_stream(messages=messages, modelId=model_id)

text = ""
for event in response["stream"]:
    if "contentBlockDelta" in event:
        chunk = event["contentBlockDelta"]["delta"]["text"]
        print(chunk, end="", flush=True)
        text += chunk
```

事件类型按顺序：`messageStart` → 多个 `contentBlockDelta` → `contentBlockStop` → `messageStop` → `metadata`

### 1.9 控制模型输出

**助手消息预填充：**
```python
messages = []
add_user_message(messages, "Is coffee or tea better?")
add_assistant_message(messages, "Coffee is better because")   # ← 预填充开头
answer = chat(messages)
# Claude 会从预填充处继续："it has more caffeine."
```

**停止序列：**
```python
def chat(messages, system=None, temperature=1.0, stop_sequences=[]):
    params = {
        "modelId": model_id,
        "messages": messages,
        "inferenceConfig": {
            "temperature": temperature,
            "stopSequences": stop_sequences   # ← 注意是 stopSequences（驼峰命名）
        }
    }
    ...
```

### 1.10 结构化数据输出

组合预填充 + 停止序列来提取纯 JSON：

```python
messages = []
add_user_message(messages, "Generate a short EventBridge rule as JSON")
add_assistant_message(messages, "```json")   # ← 预填充 markdown 开头
text = chat(messages, stop_sequences=["```"])  # ← 遇到结束标记就停

import json
clean_data = json.loads(text.strip())
```

## 第二章：提示工程

（内容与 Building with the Claude API 课程相同，以下为要点提醒）

核心技巧：
- **清晰直接**：使用动作动词，明确说明任务
- **具体详细**：提供上下文、格式要求、边界条件
- **XML 标签**：用 `<document>`, `<examples>`, `<task>` 等结构化输入
- **提供示例**：一次/多次样本学习（one-shot / multi-shot）
- **逐步推理**：要求 Claude 先思考再回答

## 第三章：工具使用

### 3.1 工具使用流程

```
用户提问 → 发送请求+工具定义 → Claude 请求工具 → 执行工具 → 发回结果 → Claude 生成最终回复
```

### 3.2 工具 JSON Schema 格式（Bedrock 专有结构）

```python
get_current_datetime_schema = {
    "name": "get_current_datetime",
    "description": "Returns the current date and time...",
    "inputSchema": {
        "json": {
            "type": "object",
            "properties": {
                "date_format": {
                    "type": "string",
                    "description": "Format string, defaults to '%Y-%m-%d %H:%M:%S'"
                }
            },
            "required": []
        }
    }
}
```

> ⚠️ Bedrock 工具定义包裹在 `toolSpec` 中，调用时格式为：`tools=[{"toolSpec": schema}]`

### 3.3 发送含工具的请求

```python
def chat(messages, system=None, temperature=1.0, stop_sequences=[], tools=None):
    params = {
        "modelId": model_id,
        "messages": messages,
        "inferenceConfig": {"temperature": temperature, "stopSequences": stop_sequences}
    }
    if system:
        params["system"] = [{"text": system}]
    if tools:
        params["toolConfig"] = {"tools": tools}
    response = client.converse(**params)
    text = response["output"]["message"]["content"][0].get("text", "")
    parts = response["output"]["message"]["content"]
    return text, parts
```

### 3.4 toolChoice 选项

| 选项 | 含义 |
|------|------|
| `auto`（默认） | Claude 自行决定是否使用工具 |
| `any` | Claude 必须使用某个工具 |
| 指定工具名 | 强制使用特定工具（适合测试） |

### 3.5 处理工具调用响应

当 `stopReason == "tool_use"` 时，Claude 请求工具：

```python
text, parts = chat(messages, tools=[{"toolSpec": get_current_datetime_schema}])

# 检查响应类型
stop_reason = response["stopReason"]

# 响应 parts 示例：
# [{"text": "Let me get the time..."}, {"toolUse": {"toolUseId": "abc", "name": "get_current_datetime", "input": {}}}]
```

### 3.6 执行工具并发回结果

```python
def run_tools(parts):
    tool_requests = [part for part in parts if "toolUse" in part]
    tool_result_parts = []

    for tool_request in tool_requests:
        tool_use_id = tool_request["toolUse"]["toolUseId"]
        tool_name = tool_request["toolUse"]["name"]
        tool_input = tool_request["toolUse"]["input"]

        try:
            tool_output = run_tool(tool_name, tool_input)
            tool_result_part = {
                "toolResult": {
                    "toolUseId": tool_use_id,
                    "content": [{"text": json.dumps(tool_output)}],
                    "status": "success"
                }
            }
        except Exception as e:
            tool_result_part = {
                "toolResult": {
                    "toolUseId": tool_use_id,
                    "content": [{"text": f"Error: {e}"}],
                    "status": "error"
                }
            }
        tool_result_parts.append(tool_result_part)

    return tool_result_parts
```

### 3.7 完整工具调用循环

```python
messages = []
add_user_message(messages, "What time is it right now?")

# 第一次请求
text, parts = chat(messages, tools=[{"toolSpec": get_current_datetime_schema}])
add_assistant_message(messages, parts)   # 存入 assistant 的工具请求消息

# 执行工具
tool_result_parts = run_tools(parts)
add_user_message(messages, tool_result_parts)   # 存入工具结果

# 第二次请求（带工具结果）
text, parts = chat(messages, tools=[{"toolSpec": get_current_datetime_schema}])
print(text)  # → "The current time is 2025-04-03, 12:54:00."
```

## 第四章：RAG 检索增强生成

### 4.1 流程

```
文档 → 分块 → 嵌入 → 相似度搜索 → 注入 Prompt → Claude 回答
```

### 4.2 文本嵌入（Bedrock 专用：Amazon Titan）

```python
def generate_embedding(
    text,
    embedding_model_id="amazon.titan-embed-text-v2:0",  # ← Bedrock 使用 Titan，非 VoyageAI
    dimensions=1024,
    normalize=True,
):
    request_body = {
        "inputText": text,
        "dimensions": dimensions,
        "normalize": normalize,
    }
    request_json = json.dumps(request_body)

    response = client.invoke_model(   # ← 注意：用 invoke_model，不是 converse
        modelId=embedding_model_id,
        body=request_json,
        accept="application/json",
        contentType="application/json",
    )

    response_body = json.loads(response.get("body").read())
    return response_body["embedding"]  # → 1024 个浮点数的列表
```

> ⚠️ 使用前需在 AWS Bedrock 控制台申请访问 Titan 嵌入模型。

### 4.3 语义相似度搜索

使用余弦相似度：将用户问题的嵌入与所有文档块的嵌入比较，返回最相似的 top-k 块。

## 第五章：Claude 特性功能

### 5.1 Extended Thinking（扩展思考）

```python
# 在 inferenceConfig 中通过 additional_model_fields 传入
additional_model_fields = {
    "thinking": {
        "type": "enabled",
        "budget_tokens": 1024  # 最小 1024，复杂任务可以更大
    }
}

response = client.converse(
    modelId=model_id,
    messages=messages,
    additionalModelRequestFields=additional_model_fields
)
```

响应包含两部分：
- **推理内容块**：Claude 内部思考过程（含加密签名，防止篡改）
- **文本内容块**：最终回答

**注意：**
- 思考内容有加密签名，不能修改后再发回
- 有时会返回 `redactedContent`（被安全系统过滤）
- 权衡：更高准确度 vs 更高成本 + 更长延迟
- 建议：先优化 prompt，仍不满意再开启

### 5.2 图片支持

```python
import base64

with open("image.jpg", "rb") as f:
    image_data = base64.standard_b64encode(f.read()).decode("utf-8")

user_message = {
    "role": "user",
    "content": [
        {"image": {"format": "jpeg", "source": {"bytes": image_data}}},
        {"text": "What's in this image?"}
    ]
}
```

### 5.3 PDF 支持

```python
with open("document.pdf", "rb") as f:
    pdf_data = base64.standard_b64encode(f.read()).decode("utf-8")

user_message = {
    "role": "user",
    "content": [
        {"document": {"format": "pdf", "name": "doc", "source": {"bytes": pdf_data}}},
        {"text": "Summarize this document."}
    ]
}
```

### 5.4 Citations（引用）

在 document block 中启用引用，Claude 会在回答中标注来源：

```python
document_block = {
    "document": {
        "format": "txt",
        "name": "research_paper",
        "source": {"bytes": text_data},
    }
}
```

### 5.5 Prompt Caching（提示缓存）

**工作原理：**
1. 初始请求：处理内容 → 存入缓存（**写缓存**）
2. 后续请求：缓存命中 → 直接复用（**读缓存**，更快更便宜）
3. 缓存有效期：**5 分钟**
4. 最小缓存长度：**1024 tokens**（缓存点前的内容总和）

**Bedrock 中使用 cachePoint（与 Anthropic SDK 的 `cache_control` 对应）：**

```python
# 在用户消息中加缓存点
user_message = {
    "role": "user",
    "content": [
        {"text": "这里放大段文本..."},
        {"cachePoint": {"type": "default"}}   # ← Bedrock 专有语法
    ]
}

# 在系统提示中加缓存点
system = [
    {"text": "You are a senior software engineer...（长系统提示）"},
    {"cachePoint": {"type": "default"}}
]

# 在工具定义中加缓存点（最常见用法）
tools = [
    {"toolSpec": schema_1},
    {"toolSpec": schema_2},
    {"cachePoint": {"type": "default"}}   # ← 放在工具列表末尾
]
```

**规则：**
- 缓存点前的内容完全一致才会命中缓存
- 缓存点可加在：用户消息、系统提示、工具定义
- 系统提示和工具定义是最佳缓存位置（很少变化）

## 第六章：模型上下文协议 MCP

（MCP 使用标准 Python MCP SDK，与 AWS 账户无关，内容同 Building with the Claude API 课程）

主要内容：
- MCP Server 定义 Tools / Resources / Prompts
- MCP Client 连接 Claude
- 使用 MCP Inspector 测试

## 第七章：智能体（Agents）

### 7.1 Computer Use（计算机使用）

Claude 可以控制计算机：截图、识别 UI、执行操作。

Bedrock 中启用 Computer Use：
```python
tools = [
    {"toolSpec": computer_use_schema},
    {"toolSpec": text_editor_schema},
    {"toolSpec": bash_schema},
]
```

### 7.2 Claude Code 与 Bedrock

Claude Code 默认使用 Anthropic API，但也可以配置为使用 Amazon Bedrock。功能与常规 Claude Code 相同，只是 API 调用路由到 Bedrock。

## 课程笔记总结

**最核心的 Bedrock 特有知识点：**

1. **boto3 客户端**：`boto3.client("bedrock-runtime", region_name="us-west-2")`
2. **推理配置文件**：解决跨区域模型可用性问题
3. **`converse()` 方法**：Bedrock 的统一对话 API
4. **消息格式**：`content` 必须是字典列表 `[{"text": "..."}]`
5. **工具结果格式**：`{"toolResult": {...}}` 嵌套结构
6. **Titan 嵌入**：`amazon.titan-embed-text-v2:0`，用 `invoke_model()` 调用
7. **`cachePoint`**：Bedrock 版的提示缓存标记语法

## 相关笔记

> **延伸阅读**
> - [Building with the Claude API](/academy/anthropic-academy/04-developer-tools/building-with-the-claude-api/) — 直接 API 调用对比
> - [Claude with Google Cloud's Vertex AI](/academy/anthropic-academy/04-developer-tools/claude-with-google-cloud-s-vertex-ai/) — GCP 平台对比
