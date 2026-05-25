---
title: "AI 雷达日报：2026-05-25"
date: 2026-05-25
category: radar
cadence: daily
plainSummary: "今天的信号集中在 agent 工程从演示走向生产的底层细节：工具调用开始被代码编排，语音 agent 需要会话切分和低延迟链路，记忆、评测、文档解析、遥感模型和 agent harness 都在补齐可运营系统的基础层。"
difficulty: intermediate
tags:
  - AI Engineering
  - Agent
  - Evaluation
  - Infrastructure
lang: zh
coverImage: /images/radar/daily-ai-radar-2026-05-25-infographic.webp
audioUrl: /audio/radar/daily-ai-radar-2026-05-25.mp3
audioDuration: 934
audioSize: 7472464
draft: false
---

## 本期范围

- 覆盖时间：2026-05-24 至 2026-05-25，并补充 2026-05-18 至 2026-05-23 未入选的高信号工程发布。

---
![Agent harness workflow](https://substackcdn.com/image/fetch/$s_!jJ4Z!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2ac4f24e-259e-4837-a547-a696f9eed8a0_680x367.png)

*代表图来自 [The Anatomy of an Agent Harness](https://www.dailydoseofds.com/p/the-anatomy-of-an-agent-harness/)。它对应本期日报里最能概括当天主线的一条原始信号：生产级 agent 的关键已经从提示词扩展到 harness、工具、记忆、状态和验证闭环。*

## 1. Agent 执行、记忆与评测

### AWS 展示 Programmatic Tool Calling，用模型生成代码来编排工具调用

- 来源：AWS
- 日期：2026-05-19
- 链接：https://aws.amazon.com/blogs/machine-learning/implementing-programmatic-tool-calling-on-amazon-bedrock/
- 摘要：AWS 把 programmatic tool calling 定义为让模型生成 Python 代码，在沙箱里编排多个工具调用，只把最终结果送回模型上下文。文章给出三种实现：自托管 Docker 沙箱、Bedrock AgentCore Code Interpreter，以及兼容 Anthropic SDK 的代理层。实验中，PTC 模式把 token 用量降低 87% 到 92%，并让测试中的八个模型全部给出正确答案，而非 PTC 模式只有 Claude 系列成功。这个方向的关键不是更换模型，而是把可确定的循环、过滤、聚合和错误处理移出上下文窗口。

### Amazon Nova Sonic 的语音 agent 设计把工具、子 agent 和会话切分作为延迟控制面

- 来源：AWS
- 日期：2026-05-19
- 链接：https://aws.amazon.com/blogs/machine-learning/scalable-voice-agent-design-with-amazon-nova-sonic-multi-agent-tools-and-session-segmentation/
- 摘要：AWS 讨论如何用 Amazon Nova Sonic、AgentCore Runtime、AgentCore Gateway、Strands BidiAgent 和 WebSocket streaming 构建可扩展语音 agent。文章把架构拆成三种模式：直接用 Gateway 工具追求低延迟，用 sub-agent 或 agent-as-tool 处理更深推理，用 session segmentation 缩小每一阶段的 prompt 和工具面。实践建议包括小模型 sub-agent、缓存、认证后预取、并行化独立调用、填充语句和减少工具数量。语音 agent 的生产难点不是能不能说话，而是每轮延迟、工具面大小、状态交接和错误恢复。

### Kiro CLI 接入 AgentCore Memory，把项目与用户偏好变成可检索长期记忆

- 来源：AWS
- 日期：2026-05-19
- 链接：https://aws.amazon.com/blogs/machine-learning/extending-conversational-memory-in-kiro-cli-using-amazon-bedrock-agentcore-memory/
- 摘要：AWS 展示了一个自定义 MCP server，把 Kiro CLI 与 Amazon Bedrock AgentCore Memory 相连。它提供 conversation search、store、retrieve、list、stats、config、delete 等工具，并采用两阶段检索：先语义检索 memory records，必要时再直接扫描 event-level 内容。命名空间可以按 user、project 或 session 组织，CLI hooks 负责在会话前加载偏好、会话后写回记忆。对 coding agent 来说，这类记忆层的价值在于把偏好、项目约定和长期上下文从聊天记录里拆出来。

### AgentCore 的自定义代码评测器让 agent 质量检查进入 Lambda 与 CloudWatch

- 来源：AWS
- 日期：2026-05-18
- 链接：https://aws.amazon.com/blogs/machine-learning/build-custom-code-based-evaluators-in-amazon-bedrock-agentcore/
- 摘要：AWS 为 Bedrock AgentCore 展示 custom code-based evaluators，用 Lambda 在 trace、tool call 或 session 级别做确定性检查。示例包括工具响应 schema、股票价格漂移、工作流合规和 PII 泄漏。评测既可在开发、回归和 CI 中按需运行，也可在生产流量中采样并输出 CloudWatch metrics。它代表的趋势是，agent evaluation 不应只依赖 LLM-as-judge，还需要可版本化、可报警、可嵌入部署流水线的代码评测器。

## 2. 开放模型、文档解析与科学场景

### PaddleOCR 3.5 支持 Transformers backend，降低文档 AI 接入 Hugging Face 生态的摩擦

- 来源：Hugging Face / PaddlePaddle
- 日期：2026-05-18
- 链接：https://huggingface.co/blog/PaddlePaddle/paddleocr-transformers
- 摘要：PaddleOCR 3.5 新增更灵活的 inference-engine interface，开发者可以通过 `engine="transformers"` 运行支持的 OCR 与文档解析模型，例如 PP-OCRv5 和 PaddleOCR-VL 1.5，并用 `engine_config` 配置 dtype、设备与 attention implementation。PaddleOCR 继续管理 OCR 和 document parsing pipeline，而 Transformers 作为后端进入模型加载、实验和部署链路。对 RAG、文档 agent、搜索和自动化来说，这一步把 PDF、扫描件、截图、表格和复杂版面解析更自然地接入 PyTorch / Transformers 工作栈。

### OlmoEarth v1.1 用 token 设计把遥感模型计算成本降到原来的三分之一

- 来源：Hugging Face / Ai2
- 日期：2026-05-19
- 链接：https://huggingface.co/blog/allenai/olmoearth-v1-1
- 摘要：Ai2 发布 OlmoEarth v1.1，一组更高效的地球观测模型。核心改动是减少 Sentinel-2 遥感输入的 token 序列长度：原先按时间步和分辨率生成 token，新版本通过预训练方法调整，在维持任务表现的同时把 token 数量和计算需求显著压缩。文章称 v1.1 在每个规模上运行成本最高可比 v1 低 3 倍，并公开 Base、Tiny、Nano 等权重和训练代码。这个案例说明，AI for science 的进展不只是更大模型，也来自面向物理数据结构的 tokenization 与效率设计。

## 3. Agent harness 与优化闭环

### Daily Dose of DS 把 agent harness 定义为模型外的完整生产系统

- 来源：Daily Dose of Data Science
- 日期：2026-05-24
- 链接：https://www.dailydoseofds.com/p/the-anatomy-of-an-agent-harness/
- 摘要：Daily Dose of DS 用 harness 解释为什么同一个模型在不同 agent 产品里表现差异很大。文章把 harness 拆成 orchestration loop、tools、memory、context management、prompt construction、output parsing、state management、error handling、guardrails、verification loops 和 subagent orchestration。它强调 prompt engineering 只是最内层，context engineering 管理模型看见什么，harness engineering 则覆盖工具、状态、权限、恢复、验证和生命周期。生产 agent 的难点越来越像操作系统工程，而不是单次提示词调参。

### Comet Opik 把 agent optimization 做成 trace、dataset、prompt 与实验的自动闭环

- 来源：Comet Opik
- 日期：2026-05-24
- 链接：https://www.comet.com/docs/opik/v1/agent_optimization/overview
- 摘要：Daily Dose of DS 推荐的 Opik agent optimization workflow 指向一个更普遍的方向：把 agent 的 prompt、workflow step、trace、dataset 和 evaluation results 放到同一个优化系统里。Opik 文档强调它支持 tracing、LLM-as-judge、heuristic eval metrics、prompt versioning、experiments 和 automated optimization algorithms。对团队来说，这类工具的价值不是单次“调好 prompt”，而是让失败样本进入数据集，让新 prompt 与旧版本可比较，让 agent 改进变成可回放的工程过程。

### RL function approximation 的基础课提醒，后训练和 agent 控制仍依赖价值泛化能力

- 来源：Daily Dose of Data Science
- 日期：2026-05-24
- 链接：https://www.dailydoseofds.com/rl-course-part-5
- 摘要：Daily Dose of DS 的强化学习课程新章讲 function approximation：从表格型 value function 走向参数化函数、MSVE、linear function approximation、gradient Monte Carlo、semi-gradient TD 和 Mountain Car tile coding。它不是当天的产品发布，但对 AI 工程有现实意义。RLHF、GRPO、tool-use policy、agent reward shaping 和自动优化都需要理解“状态太多时如何泛化价值”和“函数逼近、bootstrapping、off-policy 学习为什么会形成 deadly triad”。Agent 越多进入长链路控制，基础 RL 直觉越重要。

## 4. 组织、职业与多 Agent 工厂

### Every 的 Cheap Competence 讨论认为，廉价能力会扩大人类给模型设定框架的工作

- 来源：Every
- 日期：2026-05-24
- 链接：https://every.to/context-window/cheap-competence-new-frontier
- 摘要：Every 在周日通讯中把 Dan Shipper 的 “After Automation” 作为主线：当 agent 已经能写代码、起草邮件、整理通讯后，人类工作并没有消失，而是转向给模型设定新的 frame。文章把这个观点和 Stainless、公开内部 Slack agent workflow、Google I/O 以及职业入门变化放在一起看。对组织采用 AI 来说，真正稀缺的不是“能否完成任务”的最低能力，而是判断什么问题值得交给模型、怎样定义边界、怎样让输出进入组织流程。

### Gas City 的 100-agent 软件工厂把多 agent 协作的好想法和成本问题同时暴露出来

- 来源：Every
- 日期：2026-05-19
- 链接：https://every.to/context-window/inside-the-100-agent-software-factory
- 摘要：Every 评测 Gas City，这是一套继承 Gas Town 思路的多 coding agent orchestration toolkit。它用一个持续存在的 “mayor” agent 协调大量一次性 worker，让它们并行处理任务、互相审查并交付 pull request。文章提到该系统用约 100 个 agent、每天合并约 50 个 PR、消耗约 10 亿 token。值得吸收的思想包括 light factory / dark factory、一个可对话 supervisor 配多个 disposable workers，以及多模型 code review。但它也暴露成本、上下文重复读取、任务追踪界面和工具复杂度问题。

### Every 的医疗观察指出，模型让知识更便宜后，医生的处境判断更值钱

- 来源：Every
- 日期：2026-05-24
- 链接：https://every.to/context-window/cheap-competence-new-frontier
- 摘要：Every 的 “Alignment” 栏目从 GLP-1 与 AI 同时进入医疗场景谈起：越来越多患者会把可穿戴数据、血检、病史和症状交给 ChatGPT 或 Claude，带着更具体的问题见医生。文章判断，部分低信息量就诊会被自助 triage、实验室检测和远程医疗替代，但真正优秀医生的价值会提升，因为稀缺能力变成“在这个人的具体处境里下一步该做什么”。这个观察可以迁移到很多专业服务：当知识分发成本下降，情境判断、责任和行动选择反而更重要。

## 📬 Newsletter 精选

- Daily Dose of Data Science：本期采用 2 条，覆盖 agent harness 工程与强化学习 function approximation。
- Every：本期采用 3 条，覆盖 cheap competence、100-agent 软件工厂与 AI 医疗判断。
- Comet Opik：通过公开文档补充 agent optimization workflow，作为 Daily Dose 文章里的实践入口。
