---
title: "LLM 应用入门：从 Prompt 到 Tool Calling 的工程骨架"
date: 2026-04-02
category: academy
description: "把 LLM 应用看成一个可观测、可验证、可回放的工程系统：从 Prompt 分层、结构化输出、工具调用、安全边界到上线检查清单。"
difficulty: intermediate
plainSummary: "LLM 应用不是把聊天框接到模型，而是把上下文、模型、结构化输出、工具、状态、安全和观测性组织成一条可维护的运行时链路。"
coverImage: "/images/academy/llm-apps-notes-01/llm-app-architecture-cover.png"
tags:
  - "LLM"
  - "Agent"
  - "AI Engineering"
lang: zh
draft: false
---

## 先把 LLM 应用看成一个运行时系统

很多人第一次做 LLM 应用，会从一个聊天框开始：用户输入一句话，服务端把它拼进 Prompt，调用模型，然后把回答显示出来。

这个原型当然有价值。它能证明模型能否理解任务，能让团队快速感受到产品形态，也能帮助你发现最早的一批用户问题。

但真正进入工程阶段后，LLM 应用不能只被理解成“一个 Prompt + 一个模型调用”。它更像一条运行时链路：

1. 用户请求进入系统。
2. 应用组装任务说明、上下文、状态和约束。
3. 模型基于这些输入生成文本、结构化数据或工具调用。
4. 应用验证输出、执行工具、记录过程。
5. 系统把结果返回给用户，并为下一轮、排障、成本控制和安全审计留下证据。

![LLM 应用运行时架构：上下文、模型、结构化输出、工具、安全和观测性汇入一个应用核心](/images/academy/llm-apps-notes-01/llm-app-architecture-cover.png)

这篇文章的目标不是教你背 API 参数，而是建立一个稳定的工程心智：**LLM 应用的核心不是“让模型说话”，而是让模型在一个可验证、可控、可回放的系统里参与工作。**

如果你已经会写普通 Web API，这篇文章可以帮你把后端经验迁移到 LLM 应用。如果你正在学习 Agent、MCP、RAG、FastAPI 或云端部署，这篇文章就是那些内容之前的一块地基。

## 一个最小但完整的心智模型

一个可维护的 LLM 应用，至少有七层。

| 层级 | 负责什么 | 常见问题 |
| --- | --- | --- |
| 交互层 | 接收用户请求，展示结果，管理等待与确认 | 用户看不到系统正在做什么，长任务体验差 |
| 上下文层 | 组装系统指令、用户输入、检索资料、会话状态 | 上下文太长、太脏、顺序混乱 |
| 模型层 | 选择模型、推理强度、输出长度、流式响应 | 模型选择只看“最强”，忽略成本和延迟 |
| 输出契约层 | 把模型输出约束成 JSON、枚举、表单字段或动作计划 | 自由文本难以被程序稳定消费 |
| 工具边界层 | 暴露搜索、数据库、业务系统、文件、代码执行等能力 | 工具描述含糊，参数不校验，副作用失控 |
| 状态层 | 保存对话、任务、工具结果、审批状态和重试记录 | 历史重复注入，状态和日志对不上 |
| 观测层 | 记录 trace、成本、延迟、错误、输入输出摘要 | 出问题时只能猜 Prompt 哪里坏了 |

这七层不一定对应七个独立服务。小项目可以把它们放在一个后端模块里。关键是你在设计时能分清楚：这段逻辑是在改 Prompt，还是在改输出契约？是在加工具，还是在改工具的安全边界？是在优化模型调用，还是在优化状态管理？

一旦这些边界混在一起，应用会很快变成一团“Prompt 泥球”：每次失败都往系统提示里补一句话，每次上线都不知道会不会影响别的能力。

## 最小运行时循环

可以把 LLM 应用的主循环想成下面这条路径。

![LLM 应用从用户请求、上下文组装、模型调用、结构化结果、工具执行到观测记录的循环](/images/academy/llm-apps-notes-01/llm-app-runtime-loop.png)

用伪代码表达，大概是这样：

```ts
type AppRequest = {
  userId: string;
  message: string;
  conversationId?: string;
};

type AppResult = {
  answer: string;
  actions: Array<{ type: string; status: "done" | "pending_approval" | "failed" }>;
  traceId: string;
};

async function runLlmApp(request: AppRequest): Promise<AppResult> {
  const trace = startTrace("llm_app.request", {
    userId: request.userId,
    conversationId: request.conversationId,
  });

  const context = await buildContext({
    userId: request.userId,
    message: request.message,
    conversationId: request.conversationId,
  });

  const modelResult = await callModel({
    instructions: context.instructions,
    input: context.messages,
    tools: context.availableTools,
    outputContract: context.outputContract,
    traceId: trace.id,
  });

  const validated = validateModelResult(modelResult);

  const toolResults = await executeApprovedTools({
    toolCalls: validated.toolCalls,
    policy: context.toolPolicy,
    traceId: trace.id,
  });

  const finalAnswer = await synthesizeFinalAnswer({
    originalRequest: request.message,
    modelResult: validated,
    toolResults,
    traceId: trace.id,
  });

  await trace.finish({
    model: modelResult.model,
    tokenUsage: modelResult.usage,
    toolCallCount: toolResults.length,
  });

  return {
    answer: finalAnswer.text,
    actions: toolResults.map(toActionSummary),
    traceId: trace.id,
  };
}
```

真实项目会比这复杂，但主干不会差太多：上下文进入模型，模型返回结构化输出或工具调用，应用验证并执行，最后把过程记录下来。

注意这里有两个设计重点。

第一，模型调用不是整个应用。它只是运行时循环里的一个节点。上下文、验证、工具执行、状态保存和观测同样是产品质量的一部分。

第二，工具执行不应该直接等于“模型说了就做”。模型可以提出工具调用请求，但你的应用必须决定这个工具是否存在、参数是否有效、权限是否允许、是否需要人工确认、失败后是否可以重试。

## Prompt 分层：不要把所有东西塞进一段系统提示

Prompt 不是一段神秘咒语，而是运行时输入的一部分。更准确地说，它是应用把任务、约束和上下文传给模型的接口。

一个可维护的 Prompt 通常分为四层：

```text
[身份与边界] 这个助手负责什么，不负责什么
[任务规则] 怎样判断完成，怎样处理不确定性
[输出契约] 必须返回什么结构，哪些字段必填
[动态上下文] 用户输入、检索内容、会话状态、工具结果
```

你不需要每一层都写成一段巨长文本。很多时候，最好的做法是把稳定规则放在代码模板里，把动态上下文通过数据结构传入，把输出契约交给 API 的结构化输出能力或函数 schema。

一个常见反例是：

```text
你是一个客服助手。请礼貌回答用户。用户历史如下：
...
你还可以查询订单。订单工具参数是 order_id。
如果用户想退款要谨慎。请输出 JSON。
如果 JSON 错了请不要错。
```

这类 Prompt 的问题不是短，而是职责混乱。角色、任务、工具说明、安全策略、输出格式、历史数据都挤在一起。模型可能还能回答，但工程团队很难判断哪一处改动导致了行为变化。

更好的做法是把边界拆开：

```ts
const instructions = [
  rolePolicy,
  uncertaintyPolicy,
  safetyPolicy,
].join("\n\n");

const input = [
  { role: "user", content: userMessage },
  { role: "system", content: renderRetrievedContext(docs) },
  { role: "system", content: renderConversationState(state) },
];

const tools = [lookupOrderTool, createRefundRequestTool];
const outputContract = customerSupportResponseSchema;
```

这样做的好处是：你可以单独测试工具描述，单独调整安全策略，单独评估检索上下文质量，也可以在日志中明确看到每一层的版本。

## 结构化输出：让模型回答变成程序能消费的合同

LLM 的自由文本很适合阅读，但不适合作为程序边界。只要后端需要根据模型结果更新 UI、写数据库、触发工作流，就应该尽早引入结构化输出。

![自然语言输出经过验证边界后变成结构化对象、UI 状态和存储记录](/images/academy/llm-apps-notes-01/structured-output-contract.png)

结构化输出解决的是“模型最终回答应该长什么样”的问题。例如：

```json
{
  "intent": "schedule_meeting",
  "confidence": 0.86,
  "missing_fields": ["timezone"],
  "reply_to_user": "我可以帮你安排会议。请告诉我时区。",
  "next_step": "ask_clarifying_question"
}
```

这类结构让应用可以稳定地做几件事：

- 根据 `intent` 选择 UI。
- 根据 `confidence` 决定是否需要人工复核。
- 根据 `missing_fields` 追问。
- 根据 `next_step` 进入下一段工作流。

更重要的是，结构化输出让失败变得可见。自由文本回答“看起来还行”，但字段缺失、枚举不合法、日期格式错误、置信度缺失都可以被验证器抓出来。

一个实用的设计方式是先写 TypeScript 或 Python 的业务类型，再把它映射为模型输出 schema。

```ts
type MeetingIntent = {
  intent: "schedule_meeting" | "cancel_meeting" | "unknown";
  confidence: number;
  participants: string[];
  timeRange?: {
    start: string;
    end: string;
    timezone: string;
  };
  missingFields: string[];
  replyToUser: string;
};
```

然后设计验证规则：

```ts
function validateMeetingIntent(value: unknown): MeetingIntent {
  const parsed = MeetingIntentSchema.parse(value);

  if (parsed.confidence < 0 || parsed.confidence > 1) {
    throw new Error("confidence must be between 0 and 1");
  }

  if (parsed.intent === "schedule_meeting" && parsed.participants.length === 0) {
    throw new Error("schedule_meeting requires participants or a missing field");
  }

  return parsed;
}
```

官方文档里有一个很重要的区分：**如果你想约束模型回复给用户的结构，用结构化输出；如果你想让模型连接你的系统能力，用函数/工具调用。** 这两个能力经常一起出现，但不要混为一谈。

## Tool Calling：让模型请求能力，但不要让模型绕过边界

Tool Calling 解决的是另一类问题：模型知道自己需要外部能力。

例如，用户问“我这个订单能退吗？”模型本身不知道订单状态。你可以给它一个 `lookup_order` 工具。模型判断需要查询订单，于是返回一个工具调用请求。你的应用执行查询，把结果返回给模型，模型再组织最终回答。

这条链路听起来像“模型在调用函数”，但工程上更准确的说法是：**模型提出函数调用意图，宿主应用执行并承担责任。**

这点非常关键。模型不应该直接拿到数据库连接、支付权限、邮件发送权限或云资源写权限。它应该只看到你定义好的工具 schema，而你的应用负责真正的权限检查和副作用控制。

一个工具定义应该至少回答五个问题：

| 问题 | 示例 |
| --- | --- |
| 工具做什么 | 查询订单状态，不修改订单 |
| 何时使用 | 用户询问订单状态、配送、退款资格时 |
| 需要什么参数 | `order_id`，必须属于当前用户 |
| 返回什么 | 状态、金额、配送状态、可退款标记 |
| 有什么副作用 | 无副作用，只读 |

对于写操作，还要补上：

| 写操作边界 | 设计要求 |
| --- | --- |
| 人工确认 | 发送邮件、退款、删除数据、发布内容前必须确认 |
| 幂等性 | 每次写操作都要有 idempotency key |
| 审计日志 | 记录谁发起、模型建议、用户确认、工具结果 |
| 回滚路径 | 能撤销的操作要有补偿动作，不能撤销的操作要更严格 |
| 最小权限 | 工具只拿完成任务需要的权限 |

![工具安全控制面：只读工具、写操作、审批、审计和回滚被放在明确边界内](/images/academy/llm-apps-notes-01/tool-safety-control-plane.png)

可以把工具分成三类。

| 类型 | 例子 | 默认策略 |
| --- | --- | --- |
| 只读工具 | 搜索、读取文档、查询订单、读取日历空闲时间 | 可自动执行，但要记录输入输出摘要 |
| 可逆写工具 | 创建草稿、添加标签、生成临时文件、创建待审批工单 | 可自动执行或半自动执行，保留回滚路径 |
| 高风险写工具 | 付款、退款、发邮件、删库、发布、修改权限 | 必须人工确认，必要时双人审批 |

很多 Agent 事故不是模型“不会推理”，而是系统把高风险工具暴露得太随意。把权限设计好，模型能力才会变成生产力，而不是生产事故。

## 结构化输出和工具调用怎么选

一个简单判断方法：

| 你要做什么 | 应该优先用什么 |
| --- | --- |
| 让模型给 UI 返回固定字段 | 结构化输出 |
| 让模型判断意图、分类、抽取信息 | 结构化输出 |
| 让模型请求查数据库、搜文档、跑代码 | 工具调用 |
| 让模型执行可能有副作用的业务动作 | 工具调用 + 权限策略 + 人工确认 |
| 让模型先查资料再给结构化结果 | 工具调用 + 结构化输出 |

举个例子，会议助手里“用户想做什么”可以是结构化输出：

```json
{
  "intent": "schedule_meeting",
  "missing_fields": ["timezone"],
  "confidence": 0.82
}
```

但“查询日历空闲时间”就是工具调用：

```json
{
  "tool": "find_calendar_slots",
  "arguments": {
    "participants": ["alice@example.com", "bob@example.com"],
    "duration_minutes": 30,
    "date_range": "next_week"
  }
}
```

最后“给用户展示三个可选时间”又可以回到结构化输出：

```json
{
  "reply_to_user": "我找到了三个可选时间。",
  "options": [
    { "start": "2026-05-18T10:00:00+09:00", "end": "2026-05-18T10:30:00+09:00" },
    { "start": "2026-05-19T14:00:00+09:00", "end": "2026-05-19T14:30:00+09:00" }
  ]
}
```

真实应用经常是两者交替：结构化输出负责“模型说清楚自己的判断”，工具调用负责“模型请求系统能力”。

## 状态管理：不要把全部历史原样塞回去

状态管理是早期 LLM 应用最容易被低估的地方。

最简单的做法是把全部历史消息每轮都传给模型。这在演示里很好用，但进入真实使用后会遇到几个问题：

- 成本越来越高。
- 延迟越来越长。
- 旧指令和新目标互相干扰。
- 工具结果重复出现，模型误以为需要再次执行。
- 日志里很难判断某次回答依赖了哪段历史。

更稳的做法是把状态拆成几类：

| 状态类型 | 保存内容 | 进入模型的方式 |
| --- | --- | --- |
| 对话摘要 | 用户目标、偏好、已确认事实 | 压缩后放入上下文 |
| 任务状态 | 当前步骤、待补字段、审批状态 | 结构化字段 |
| 工具结果 | 最近一次查询、文件、订单、搜索结果 | 只传必要摘要和引用 |
| 审计记录 | 谁确认了什么，系统执行了什么 | 进日志，不一定进模型 |
| 调试 trace | Prompt 版本、模型、token、错误 | 进观测系统，不进用户上下文 |

OpenAI 的 Responses API 提供了响应到响应的延续能力，例如通过上一轮响应 ID 继续上下文。Agents SDK 又在更高层提供会话、状态、handoff、tracing 等模式。无论用哪种框架，原则都一样：**每个会话选择一种状态策略，不要既手动拼全部历史，又同时依赖服务端状态，除非你明确知道如何去重。**

状态不是越多越好。好状态应该回答三个问题：

1. 当前用户目标是什么？
2. 已经完成了哪些不可重复的动作？
3. 下一步最小可执行动作是什么？

如果状态回答不了这三个问题，它可能只是日志，不应该每轮都塞给模型。

## 失败模式：提前写进设计，而不是上线后补救

LLM 应用失败时，症状通常不是单一错误，而是一串连锁反应。结构化输出失败导致工具参数缺失，工具重试导致重复写入，重复写入又让模型基于错误状态继续推理。

上线前至少要设计下面这些失败处理。

| 失败模式 | 典型症状 | 工程处理 |
| --- | --- | --- |
| 上下文缺失 | 模型回答很自信但事实不完整 | 明确缺失字段，让模型追问或触发检索 |
| 输出结构错误 | JSON 解析失败，字段类型不对 | schema 校验、一次修复重试、失败降级 |
| 工具参数错误 | 工具收到不存在的 ID 或越权资源 | 参数校验、权限检查、返回可恢复错误 |
| 工具执行超时 | 用户等待过久，模型继续猜测 | 超时边界、后台任务、可见进度 |
| 重复写操作 | 重试导致重复发邮件或重复扣款 | idempotency key、写前检查、审批状态 |
| 上下文污染 | 旧目标覆盖新目标 | 会话摘要、状态压缩、任务边界 |
| 成本失控 | 长上下文和多轮工具调用叠加 | token budget、模型分层、缓存策略 |
| 难以排障 | 只看到最终回答，看不到过程 | trace、工具输入输出摘要、Prompt 版本 |

一个很实用的原则是：**把模型错误当作普通分布式系统错误处理，而不是当作神秘事件处理。**

模型会返回格式错误，工具会超时，网络会失败，用户会中途改需求，权限会不够。你越早把这些情况写进系统设计，后期越少靠 Prompt 补丁救火。

## 一个可复制的设计模板

以后设计任何 LLM 应用，可以先填下面这份模板。

```md
# LLM App Design Brief

### 1. 用户任务
- 用户是谁？
- 他们要完成什么具体工作？
- 完成标准是什么？

### 2. 模型职责
- 模型负责理解、生成、判断、规划中的哪几项？
- 哪些决定不能交给模型自动完成？

### 3. 上下文来源
- 用户输入：
- 检索资料：
- 会话状态：
- 业务数据：
- 不允许进入模型的敏感信息：

### 4. 输出契约
- 最终输出是自然语言、JSON、UI 状态还是动作计划？
- 必填字段：
- 枚举值：
- 校验规则：
- 失败降级：

### 5. 工具列表
- 只读工具：
- 可逆写工具：
- 高风险写工具：
- 每个工具的参数 schema：
- 每个工具的权限边界：

### 6. 状态策略
- 会话如何延续？
- 哪些历史进入模型？
- 哪些记录只进日志？
- 如何避免重复执行？

### 7. 观测与评估
- trace id 如何贯穿一次请求？
- 记录哪些指标？
- 哪些样本进入人工评审？
- 哪些失败会触发告警？
```

这份模板的价值不在于形式，而在于逼迫你把“模型能不能回答”升级成“系统能不能可靠完成任务”。

## 上线前检查清单

第一版 LLM 应用上线前，可以按这份清单检查。

**Prompt 与上下文**

- 系统指令、任务规则、动态上下文是否分层？
- 是否能记录 Prompt 模板版本？
- 检索内容是否有来源、时间和置信边界？
- 长对话是否有摘要或压缩策略？

**结构化输出**

- 是否有 schema？
- 是否有运行时校验？
- 是否定义了解析失败后的重试和降级？
- 是否避免只靠 Prompt 文字描述字段格式？

**工具调用**

- 工具描述是否说明用途、参数、返回值、错误模式？
- 工具参数是否由应用校验？
- 写操作是否有人类确认或审批？
- 是否有 idempotency key 和审计日志？

**状态与观测**

- 是否有 trace id？
- 是否记录模型、token、延迟、工具调用次数？
- 是否能复现一次失败请求？
- 是否有成本预算和超时边界？

**安全与产品体验**

- 用户是否知道系统正在查资料、调用工具或等待审批？
- 高风险动作是否明确展示给用户确认？
- 模型不确定时是否会追问，而不是编造？
- 是否有人工接管路径？

如果这份清单里有一半以上答不上来，说明应用还处在 Demo 阶段。Demo 可以展示能力，但不要把它误认为生产系统。

## 继续阅读

这篇文章只是入口。

如果你要把模型调用写得更可靠，可以继续看 [Reliable LLM Call Skeleton](../../engineering/ai-developer-core/reliable-llm-call-skeleton/)。

如果你关心结构化输出失败后的恢复路径，可以看 [Structured Output、Retry 与 Recovery](../../engineering/ai-developer-core/structured-output-retry-recovery/)。

如果你想理解工具调用如何延伸到标准化工具协议，可以看 [Introduction to MCP](../anthropic-academy/05-agentic-mcp/introduction-to-model-context-protocol/)。

如果你正在做 Python/FastAPI 后端，可以把本文的运行时循环和 [FastAPI 工程实践专题](../../engineering/practice/python-fastapi-developer-foundations/) 接起来：FastAPI 负责 HTTP、依赖注入、验证和观测；LLM 运行时负责上下文、模型、工具和状态。

## 参考

- [OpenAI Function Calling guide](https://developers.openai.com/api/docs/guides/function-calling)：工具调用的基本术语、函数 schema、工具输出回传方式。
- [OpenAI Structured Outputs guide](https://developers.openai.com/api/docs/guides/structured-outputs)：结构化输出和函数调用的适用边界。
- [OpenAI Migrate to Responses API guide](https://developers.openai.com/api/docs/guides/migrate-to-responses)：Responses API、工具循环、状态和 hosted tools 的当前方向。
- [OpenAI Agents guide: Running agents](https://developers.openai.com/api/docs/guides/agents/running-agents)：会话延续、`previousResponseId`、session 和 conversation 策略。

## 小结

LLM 应用的工程化，本质是把“不稳定的语言生成”放进“稳定的软件边界”里。

Prompt 很重要，模型很重要，但真正决定系统质量的，是输出合同、工具边界、状态策略、安全控制和观测能力。把这些层次搭起来之后，模型才不只是一个会聊天的组件，而是一个能参与真实业务流程的运行时节点。
