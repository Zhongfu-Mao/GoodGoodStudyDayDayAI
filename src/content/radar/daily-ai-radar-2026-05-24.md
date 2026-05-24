---
title: "AI 雷达日报：2026-05-24"
date: 2026-05-24
category: radar
cadence: daily
plainSummary: "今天关注 AI 产品竞争从模型本体继续上移到 agent、harness、评测、商业协议和托管基础设施：Latent.Space 把模型实验室变成 Agent 实验室作为主线，Google I/O 的信息代理、Universal Cart、Workspace 语音工作流和 Running Guide 把 agent 推向消费与无障碍场景，AWS 则用 OpenAI-compatible SageMaker endpoint、多模态评测和双向语音流补齐生产系统底座。"
difficulty: intermediate
tags:
  - AI Engineering
  - Agent
  - Infrastructure
  - Multimodal
lang: zh
coverImage: /images/radar/daily-ai-radar-2026-05-24-infographic.webp
audioUrl: /audio/radar/daily-ai-radar-2026-05-24.mp3
audioDuration: 959
audioSize: 7676637
draft: false
---

## 本期范围

- 覆盖时间：2026-05-23 至 2026-05-24，并补充 2026-05-20 至 2026-05-22 未入选的高信号官方发布。

---
![AINews All Model Labs are now Agent Labs](https://substackcdn.com/image/fetch/$s_!TLyU!,w_1200,h_675,c_fill,f_jpg,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F348d0573-16b0-46d0-a852-ccaae2b6ff4f_1122x534.png)

*代表图来自 [[AINews] All Model Labs are now Agent Labs](https://www.latent.space/p/ainews-all-model-labs-are-now-agent)。它对应这期日报里最能概括当天主线的一条原始信号。*

## 1. Agent 产品、模型经济与运行时协议

### Latent.Space 认为模型实验室正在变成 Agent 实验室，竞争焦点从“模型即产品”转向 model + harness + workflow

- 来源：Latent.Space
- 日期：2026-05-23
- 链接：https://www.latent.space/p/ainews-all-model-labs-are-now-agent
- 摘要：Latent.Space 在 AINews 中把最近一批信号归纳为“模型实验室正在变成 Agent 实验室”。文章从 OpenAI 高管关于模型本身不再是完整产品的表述、AI21 转向 agents、DeepSeek 开始组建 harness 团队等线索出发，强调竞争面正在从单个模型能力扩展到 model、harness、workflow、UI、memory 和 economics 的组合。它也提醒一个新的封闭风险：如果模型与专有 harness 共同后训练，模型供应商可能把更多价值导向自家 agent 产品，而不是开放 API 或可替换模型接口。

### DeepSeek-V4-Pro 的 75% 永久降价把推理经济学重新推到 agent 产品设计中心

- 来源：Latent.Space
- 日期：2026-05-23
- 链接：https://www.latent.space/p/ainews-all-model-labs-are-now-agent
- 摘要：AINews 把 DeepSeek-V4-Pro 的 75% 永久降价列为当天最强市场信号。文中引用社区测算称，V4-Pro 首方价格约为每百万 input token 0.435 美元、每百万 output token 0.87 美元、cached input 0.0036 美元，混合成本约 0.18 美元，并在 intelligence / runtime cost 上进入 Pareto frontier。对 agent 产品来说，这不是单纯价格新闻。长任务、反复试错、tool call、browser loop 和多 agent 协作都会放大 token 成本，模型价格曲线会直接改变哪些工作流可以常态化运行。

### MCP release candidate、托管沙箱和 agent memory 层显示运行时协议正在快速标准化

- 来源：Latent.Space
- 日期：2026-05-23
- 链接：https://www.latent.space/p/ainews-all-model-labs-are-now-agent
- 摘要：AINews 汇总了 agent runtime 的若干基础设施信号：MCP 2026-07-28 release candidate 把协议改成 stateless，去掉 handshake 和 session ID，让请求可以落到任意 server instance；Gemini Managed Agents、CoreWeave Sandboxes 和 Cloudsail 分别从托管 Linux 环境、RL / eval sandbox、Cloudflare per-task sandbox 方向补齐执行层；Hermes、AI-Q 和 gBrain 等项目则把 skills、key management、shared memory 变成可组合层。趋势很明确：agent 系统正在从一次性聊天和脚本调用，走向可扩缩、可审计、可复用的运行时协议。

## 2. Google I/O 后的消费级 Agent 与商业协议

### Google I/O 2026 把 Gemini 3.5 Flash、Gemini Omni、Antigravity 和 Managed Agents 放进同一个 agent-first 平台叙事

- 来源：Google
- 日期：2026-05-20
- 链接：https://blog.google/innovation-and-ai/technology/ai/google-io-2026-all-our-announcements/
- 摘要：Google 的 I/O 2026 汇总列出 100 项发布，其中最重要的主线是 Gemini 3.5 Flash、Gemini Omni、Google Antigravity、AI Studio、Managed Agents 和 WebMCP 被放进同一个平台故事。Gemini 3.5 Flash 被定位为适合长周期 agentic tasks 的快速模型；Antigravity 2.0 加入桌面应用、CLI、SDK、subagents、hooks 和 async task management；Managed Agents 则通过一次 API call 为 agent 配置远程 Linux 环境、代码执行、文件管理和网页浏览。Google 正在把模型、IDE、API、托管执行环境和开放工具协议打成一套 agent-first developer surface。

### Universal Cart、AP2 与 UCP 把 agentic commerce 从搜索推荐推进到支付和商户系统

- 来源：Google
- 日期：2026-05-20
- 链接：https://blog.google/products-and-platforms/products/shopping/shopping-updates-google-marketing-live/
- 摘要：Google 介绍 Universal Cart、Agent Payments Protocol 和 Universal Commerce Protocol 的最新进展。Universal Cart 会跨 Search、Gemini 等入口工作，UCP 让用户可以通过 Google Pay 在 Google 内完成结账，或把商品转回商户网站购买，Nike、Sephora、Target、Ulta Beauty、Walmart、Wayfair 以及部分 Shopify 商户会参与早期功能。Google 还计划把 UCP-powered checkout 扩展到 YouTube Shopping ads、Direct Offers、酒店预订和本地外卖。这个方向说明 agentic commerce 的难点不只是“帮我找商品”，而是支付、责任归属、商户记录、促销、品牌可见性和跨平台结账协议。

### Ask Advisor 把 Google Ads、Analytics 和 Merchant Center 里的多个营销 Agent 统一成连续协作界面

- 来源：Google
- 日期：2026-05-20
- 链接：https://blog.google/products/ads-commerce/ask-advisor/
- 摘要：Google 发布 Ask Advisor，这是一个跨 Google Ads、Google Analytics、Google Marketing Platform 和 Merchant Center 的统一 AI collaborator。用户可以用自然语言提出目标，例如“为我的护发产品寻找新客户”，系统会从 Merchant Center 拉取商品信息，帮助在 Google Ads 中发起 campaign；它也能结合 Ads 与 Analytics 数据解释效果、推荐下一步。Ask Advisor 目前面向英文账户 beta。它代表的不是一个单点助手，而是把多个产品内 agent 串成持续上下文，让营销团队不用在多个控制台之间手动搬运目标、数据和行动。

### Google AI Mode 超过 10 亿月活，搜索行为正在从关键词检索转向长问题、规划和决策

- 来源：Google
- 日期：2026-05-19
- 链接：https://blog.google/products-and-platforms/products/search/ai-mode-us-insights/
- 摘要：Google 称 AI Mode 在全球已超过 10 亿月活，查询量自上线以来每季度翻倍，并且推动 Search queries 达到历史高点。美国使用数据中，超过六分之一搜索已经使用语音或图像，图像搜索月环比增长超过 40%；AI Mode 平均查询长度是传统 Search 的三倍；与 planning 相关的 AI Mode 查询在过去 6 个月增速比整体快 80%；brainstorming queries 也比整体快 30%。这组数据的信号在于，AI Search 不是把搜索结果页换成摘要，而是把搜索入口扩展到多模态输入、长问题、规划任务和决策支持。

### Google Workspace 把 Gmail Live、Docs Live、Keep、Pics、AI Inbox 和 Gemini Spark 连成语音优先的工作流

- 来源：Google
- 日期：2026-05-19
- 链接：https://blog.google/products-and-platforms/products/workspace/workspace-updates/
- 摘要：Google Workspace 发布一组面向 Google AI 订阅者和 Workspace 商业客户的新功能：Gmail Live 支持用语音询问收件箱信息，Docs Live 把语音 brainstorm 组织成文档草稿，Keep 可以把口述内容整理成 notes 和 lists，Google Pics 提供对象分割、文字编辑、翻译和 Workspace 集成，AI Inbox 扩展到 Plus / Pro 用户并加入个性化回复、文件直达和任务管理，Gemini Spark 则作为 24/7 personal AI agent 接入 Workspace。这里的重点是输入方式和工作流边界变化：AI 不只帮写正文，而是在 inbox、docs、notes、images 和 daily planning 之间形成连续操作层。

### Running Guide agent 展示端侧多模态 Agent 在无障碍场景里需要低延迟安全链路

- 来源：Google / Google DeepMind
- 日期：2026-05-20
- 链接：https://blog.google/innovation-and-ai/models-and-research/google-deepmind/running-guide-agent/
- 摘要：Google 展示 Running Guide agent，用胸前佩戴的 Pixel 10 Pro 和音频反馈帮助盲人及低视力跑者更独立地跑步。系统采用双路径架构：端侧 segmentation 在 Pixel 10 自研芯片上离线运行，提供低延迟 STOP 警告和方向提示；Gemma 4 E4B 负责更复杂的多模态场景理解，并通过 Smarter Frame Selection 只分析高信息量帧。它还拆成 Planner、Coach 和 Break 三个 agent，分别处理天气 / 地图 / 起点校准、跑步中风险分级提示和休息恢复。这个案例说明，无障碍 agent 的关键不是更长回答，而是低延迟、端侧可靠性、严格风险等级和硬件形态。

## 3. AWS 生产基础设施：兼容 API、评测与语音流

### SageMaker AI 支持 OpenAI-compatible endpoints，让自有模型可直接接入 OpenAI SDK、LangChain 与 Strands Agents

- 来源：AWS
- 日期：2026-05-20
- 链接：https://aws.amazon.com/blogs/machine-learning/announcing-openai-compatible-api-support-for-amazon-sagemaker-ai-endpoints/
- 摘要：AWS 宣布 SageMaker AI real-time inference endpoints 支持 OpenAI-compatible API。已有 OpenAI SDK、LangChain 或 Strands Agents 的应用可以把 base URL 指向 SageMaker endpoint 的 `/openai/v1` 路径，用 time-limited bearer token 调用自有模型，而不必写自定义 SigV4 client 或重写流式逻辑。SageMaker 还支持 inference components，让多个模型共享一个 endpoint 但拥有独立资源配置。对企业 agent stack 来说，这降低了“从公有 API 迁移到自有 GPU / 数据驻留 / 私有模型”的摩擦，同时保留常见 OpenAI-compatible interface。

### Strands Evals 新增四类多模态 judge，把 image-to-text 评测从文本代理推进到图像 grounding

- 来源：AWS
- 日期：2026-05-20
- 链接：https://aws.amazon.com/blogs/machine-learning/multimodal-evaluators-mllm-as-a-judge-for-image-to-text-tasks-in-strands-evals/
- 摘要：AWS 为 Strands Evals SDK 发布四类 multimodal LLM-as-a-judge evaluator：Overall Quality、Correctness、Faithfulness 和 Instruction Following。它们直接把图像、query、model response 和可选 reference answer 交给多模态 judge，返回图像 grounded 的评分与原因，可用于 captioning、visual QA、chart interpretation、document extraction、OCR 和 screenshot summarization。文章强调 text-only judge 无法发现图中不存在的按钮、错误图表趋势或发票字段幻觉，并建议在有参考答案时用于 content-grounded metrics，在 instruction following 这类结构性指标中避免 reference 干扰。多模态 agent 进入生产后，评测必须能看见原始视觉输入。

### SageMaker AI 与 vLLM Realtime API 组合出托管实时语音转写架构

- 来源：AWS
- 日期：2026-05-20
- 链接：https://aws.amazon.com/blogs/machine-learning/build-real-time-voice-applications-with-amazon-sagemaker-ai-and-vllm/
- 摘要：AWS 展示如何把 SageMaker AI bidirectional streaming 与 vLLM Realtime API 结合，部署 Mistral 的 Voxtral-Mini-4B-Realtime-2602 做实时语音转写。架构用 HTTP/2 event stream 连接 client 与 SageMaker runtime，再由 SageMaker 自动桥接到容器内 WebSocket；容器中 FastAPI bridge 把 `/invocations-bidirectional-stream` 转发到 vLLM 的 `/v1/realtime`。客户端以 16 kHz mono PCM16、base64 chunk 流式发送音频，服务端实时返回 `transcription.delta`。这个模式适合 voice agents、live captioning、contact center analytics 和 accessibility tools，因为它避免了上传整段音频后再处理的请求-响应延迟。

## 4. 开放检索、Agent 评测与可复现系统

### Hugging Face 发布 Ettin Reranker 系列，把检索重排的速度、质量和训练 recipe 一起开源

- 来源：Hugging Face
- 日期：2026-05-19
- 链接：https://huggingface.co/blog/ettin-reranker
- 摘要：Hugging Face 发布六个 Sentence Transformers CrossEncoder rerankers，参数规模从 17M、32M、68M、150M、400M 到 1B，基于 Johns Hopkins Ettin ModernBERT encoders，支持 8K context，并采用从 mixedbread-ai/mxbai-rerank-large-v2 蒸馏的训练 recipe。文章公开模型、约 143M 条 `(query, document, score)` 训练数据和训练脚本。结果显示 17M 模型在 MTEB 与 NanoBEIR 上超过 33M MiniLM reranker，32M 模型超过 568M bge-reranker-v2-m3，1B 模型几乎追平 1.54B teacher。对 RAG 和 agent memory 系统来说，reranker 不只是检索排序组件，而是决定上下文质量、延迟和成本的核心控制点。

### IBM Research 与 Hugging Face 推出 Open Agent Leaderboard，评测完整 agent 系统而非单独模型

- 来源：Hugging Face / IBM Research
- 日期：2026-05-18
- 链接：https://huggingface.co/blog/ibm-research/open-agent-leaderboard
- 摘要：IBM Research 在 Hugging Face 发布 Open Agent Leaderboard，用于比较完整 agent systems，而不是只比较内部模型。Leaderboard 通过 Exgentic framework 把 SWE-Bench Verified、BrowseComp+、AppWorld、tau2-Bench Airline & Retail、tau2-Bench Telecom 等任务统一到 task、context、actions 的协议里，并同时报告 success rate 和 average cost per task。初步结果显示，同一个模型配上不同 agent wrapper 会产生不同质量和成本；失败运行往往比成功运行贵 20% 到 54%；tool shortlisting 能在多个模型上改善效果。这个方向把 agent 评测从“模型榜单”推进到 planning、memory、tool use、context management 和 failure recovery 的系统比较。

## 📬 Newsletter 精选

- Latent.Space AINews：本期贡献 3 条主题信号，覆盖模型实验室上移为 Agent 实验室、DeepSeek 推理价格曲线、MCP / sandbox / memory 等 agent runtime 基础设施。
