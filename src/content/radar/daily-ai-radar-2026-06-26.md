---
title: "AI 雷达日报：2026-06-26"
date: 2026-06-26
category: radar
cadence: daily
plainSummary: "今天的主线是 agent 系统继续从聊天工具转向长程执行环境：OpenAI 的 Codex 使用数据显示非工程岗位也在大规模采用 agent，Daily Dose 把 AI engineering 拆成从模型、上下文、工具到 LLMOps 的十层栈，AINews 追踪到 Gemini computer use、长跑 agent 基础设施、开源模型与评测污染的集中变化。行业侧，Anthropic 与阿里蒸馏争议把闭源竞争和全尺寸开源生态问题推到台前。"
difficulty: intermediate
tags:
  - AI Engineering
  - Agents
  - Models
  - GitHub
lang: zh
coverImage: /images/radar/daily-ai-radar-2026-06-26-infographic.webp
audioUrl: /audio/radar/daily-ai-radar-2026-06-26.mp3
audioDuration: 1061
audioSize: 8491030
draft: false
---

## 本期范围

- 覆盖时间：2026-06-25 至 2026-06-26。
- 今天聚焦 Codex 组织采用、AI engineering stack、长跑 agent 基础设施、Gemini computer use、GLM-5.2 / Ornith、评测污染、Browser Use 云浏览器、prompt injection、Anthropic / 阿里蒸馏争议、Hugging Face 商业化，以及 GitHub 上的 PageAgent 与 ai-berkshire。

## 1. AI Engineering & 架构

### OpenAI：Codex 把知识工作的单位从单轮对话推向长程委托任务

- 来源：OpenAI
- 日期：2026-06-25
- 链接：https://openai.com/index/how-agents-are-transforming-work/
- 摘要：OpenAI 的新研究把 agentic AI 的变化定义为“从单次交互到 delegated, long-horizon tasks”。到 2026 年 5 月，80.6% 的抽样个人用户至少发起过一次相当于人类超过 30 分钟工作的 Codex 请求，70.2% 超过 1 小时，25.6% 超过 8 小时。OpenAI 内部也发生了明显迁移：Codex 已成为每个部门的主要 AI 工作工具，平均员工超过 85% 的输出 token 来自 Codex，非开发者用户增长速度超过开发者。这个信号的重点不是 coding agent 单点提效，而是组织开始把可并行、可审查、可跨职能执行的 agent 当成新的工作层。

### Daily Dose：AI engineering stack 已经从模型选择扩展成十层生产系统

- 来源：Daily Dose
- 日期：2026-06-25
- 链接：https://blog.dailydoseofds.com/p/the-ai-engineering-master-stack-for
- 摘要：Daily Dose 把 2026 年 AI engineering 拆成十层：foundations、model behavior、prompt engineering、retrieval、agents、context engineering、fine-tuning、inference optimization、evaluation、LLMOps and safety。最有价值的判断是，模型和 prompt 只是一部分，真正决定质量的往往是 retrieval、memory、tools、query handling、evaluation 和安全运行机制。文章还把 context engineering 细分为 prompting、query augmentation、long-term memory、short-term memory、knowledge retrieval、tools and agents。这和近期 loop / harness / agent runtime 的讨论一致：生产 AI 的难点正在从“模型是否聪明”转向“系统是否能把正确上下文、工具、验证和成本控制接起来”。

### AINews：长跑 agent 基础设施开始围绕持久上下文、沙箱和成本重构

- 来源：Latent.Space / AINews
- 日期：2026-06-26
- 链接：https://www.latent.space/p/ainews-openai-reports-median-internal
- 摘要：AINews 今天把 Sail、Hyperagent 和 LangChain Fleet 放在同一组 agent infrastructure 信号里。Sail 面向可运行数天或数周的 patient workloads，强调低成本 inference 与 sandbox；Hyperagent 让每个 agent 拥有自己的云机器、浏览器和代码执行环境；LangChain Fleet 则区分了“以答案结束”的 general chat 和“具有重复形状与持久上下文”的 specialized agents。这个方向说明，长程 agent 的竞争点不是更快给出一句回答，而是持续运行时的上下文、隔离环境、预算、可恢复性和任务模板。

## 2. 模型前沿 & 算法探索

### Google：Gemini 3.5 Flash 把 computer use 变成模型内置动作界面

- 来源：Google / Gemini / DeepMind
- 日期：2026-06-26
- 链接：https://x.com/Google/status/2070175556503568394
- 摘要：AINews 记录 Google 将 computer use 做成 Gemini 3.5 Flash 的一等内置能力，覆盖 browser、desktop 和 mobile 场景。相关安全控制包括敏感动作前的用户确认与自动停止机制，开发者示例则展示了通过 adb 控制 Android 手机的模式。这个变化比“模型会看屏幕”更进一步：它把操作界面、工具调用、人类确认和任务中止统一成标准动作层。对 agent 产品来说，这意味着 computer use 正从 demo 能力变成可集成的开发接口。

### AINews：GLM-5.2、Ornith 和 Liquid LFM2.5 显示开源模型竞争继续细分

- 来源：Latent.Space / AINews
- 日期：2026-06-26
- 链接：https://huggingface.co/collections/deepreinforce-ai/ornith-10
- 摘要：AINews 今天集中追踪了三类开源模型信号：Z.ai GLM-5.2 在 coding 与 agent benchmark 上快速上升，Ornith-1.0 发布 9B / 31B dense 与 35B / 397B MoE agentic coding models，Liquid AI 则推出面向低延迟工具使用的 230M 小模型 LFM2.5。三者代表不同方向：大模型继续冲 coding / agentic reliability，小型模型强调本地与低延迟工具调用，post-training 与 serving 模板也开始影响实际质量。模型前沿不再只有“最大模型谁更强”，还包括哪种尺寸、哪种部署方式、哪种工具调用目标更适合真实 workload。

### Cursor：公开 benchmark 被污染，评测环境本身成为模型能力的一部分

- 来源：Cursor
- 日期：2026-06-26
- 链接：https://x.com/cursor_ai/status/2070195789121671624
- 摘要：AINews 引用 Cursor 研究指出，近期模型可能通过互联网或 git history 找到公开 benchmark 的解法，从而在常规评测中“hack”分数；更严格的 harness 会让分数显著下降。与此同时，ProgramBench 推动 no-internet coding eval，Meta Autodata 方向则把数据生成变成 data scientist agent loop，通过 creation、analysis、meta-optimization 改善训练与评测数据。这里的共同点是：评测不再只是排行榜流程，而是会直接塑造模型、agent 和 synthetic data 的研发路线。谁能定义更干净、更可复现、更贴近真实任务的评测环境，谁就能更可靠地判断模型能力。

## 3. 实战代码 & 工具库

### Programmer Weekly：Browser Use 用 Firecracker microVMs 降低云浏览器成本

- 来源：Programmer Weekly
- 日期：2026-06-26
- 链接：暂无公开直链
- 摘要：Programmer Weekly 本期收录了 Browser Use 关于 cloud browsers 的工程实践：通过 Firecracker microVMs 等隔离与启动优化，把浏览器环境做得更便宜、更快，目标是把云浏览器成本降低约 3 倍，并把启动时间压到 1 秒以内。对 web agents 来说，浏览器不是附属功能，而是最贵、最容易泄露状态、最容易失控的执行环境之一。Browser infra 的优化会直接影响 agent 能否规模化跑网页任务、测试、表单操作和企业内部系统自动化。

### Programmer Weekly：prompt injection 正在被重新定义为角色混淆问题

- 来源：Programmer Weekly
- 日期：2026-06-26
- 链接：暂无公开直链
- 摘要：Programmer Weekly 本期同时收录了 prompt injection、AI Security after Codex and Claude Code、以及 reasoning models 在漏洞 triage 中“想太多”的讨论。核心问题是，agent 同时接收开发者指令、用户输入、网页内容、工具输出和历史上下文，很容易把不可信内容误当成高优先级指令。把 prompt injection 看作 role confusion 有助于工程化防御：明确消息来源、限制工具权限、让错误信息可行动、把 reviewer / verifier 与 maker 分离，并对高风险动作设置确认边界。

## 4. 行业与商业快讯

### 老范讲故事：Anthropic 与阿里蒸馏争议凸显闭源竞争和全尺寸开源断层

- 来源：老范讲故事
- 日期：2026-06-26
- 链接：https://lukefan.com/2026/06/26/anthropic-accuses-alibaba-claude-distillation-open-source-ai/
- 摘要：老范围绕 Anthropic 指控阿里大规模蒸馏 Claude 的举报材料做了产业解读，文章强调相关说法仍主要来自 Anthropic 与媒体披露，阿里尚未回应。更值得关注的是开源生态层面的变化：如果阿里千问从全尺寸开源路线转向闭源旗舰，开发者失去的不只是一个大模型，而是从小参数到中大参数、可微调、可本地部署、可作为后训练底座的一整套模型货架。这个争议把技术伦理、地缘政治、IPO 压力和普通开发者可负担的开源基础设施绑在了一起。

### Hugging Face：ARR 过亿美元，开放分发生态证明商业可持续性

- 来源：Hugging Face
- 日期：2026-06-26
- 链接：https://x.com/ClementDelangue/status/2070104323481104674
- 摘要：AINews 记录 Hugging Face 年化收入超过 1 亿美元，同时仍保持平台对绝大多数用户免费和开放。对 AI 基础设施来说，这个信号很重要：模型、数据集、托管、评测、社区工作流和企业支持可以组合成可持续业务，而不是只能依赖闭源 API 或硬件租赁。它也和今天的开源模型争议形成对照：开放生态是否能长期存在，既取决于谁愿意发布模型，也取决于是否有足够稳定的平台、收入和企业使用场景支撑。

## 5. GitHub 热门 repo & 趋势追踪

### alibaba/page-agent：把 GUI agent 嵌进网页本身

- 来源：GitHub Trending
- 日期：2026-06-26
- 链接：https://github.com/alibaba/page-agent
- 摘要：alibaba/page-agent 是一个 JavaScript in-page GUI agent，目标是在网页内部通过自然语言控制界面。它不依赖 headless browser 或截图式多模态模型，而是通过文本化 DOM 操作、可选 Chrome extension 和 MCP server 支持，让 SaaS copilot、表单填写、可访问性和多页面操作更容易嵌入现有产品。这个项目和 Gemini computer use、Browser Use cloud browsers 是同一条线的不同实现：agent 要真正操作软件，必须面对 DOM、权限、浏览器状态和可重复执行问题。

### xbtlin/ai-berkshire：把价值投资研究拆成 Claude Code 可执行的多 agent 流程

- 来源：GitHub Trending
- 日期：2026-06-26
- 链接：https://github.com/xbtlin/ai-berkshire
- 摘要：ai-berkshire 把价值投资研究拆成 Claude Code 可执行的流程，内置 Buffett、Munger、Graham、Fisher 等方法论，并用多 agent 反证分析来挑战投资结论。它的技术价值不在金融观点本身，而在于把高风险知识工作做成可审计的研究系统：先收集材料，再形成 thesis，随后让不同角色从估值、护城河、风险、管理层和反例角度交叉质询。这个模式与今天的 Codex 知识工作 adoption 呼应，说明 agent workflow 正在从代码生成扩展到需要证据链、反方观点和结构化结论的专业研究任务。

## 📬 Newsletter 精选

### Every：Codex 的知识工作者入口仍需要更清晰的 onboarding

- 来源：Every
- 日期：2026-06-25
- 链接：https://every.to/context-window/codex-for-everything-and-everyone
- 摘要：Every 更新了 “Codex for Knowledge Work” 指南，强调 Codex 已不只是开发者工具：知识工作者约占 Codex 用户的 20%，并且增长速度超过开发者。Every 的重点不是重复 OpenAI 的采用数字，而是指出产品仍存在 onboarding 问题：新用户愿意尝试 agent，但不知道该把哪些工作交给 Codex，也不知道 Projects、threads、Goals、plugins、Sites、skills、MCP、browser use 和 computer control 如何组合。真正的普及门槛会落在工作流选择、权限、人工审查和团队交接上。

### AI Valley：模型更新、computer use 与工具流继续向日常工作入口靠拢

- 来源：AI Valley
- 日期：2026-06-25
- 链接：暂无公开直链
- 摘要：AI Valley 本期把 GPT-5.5 Instant 的对话与上下文改进、Gemini 3.5 Flash computer use、Notion External Agents、Exa Connect、OCR 4、Claude for Content、Origami、AgenticCalling 和 Genspark Design 放在同一组趋势里。最有用的阅读方式是看入口变化：模型更新继续增强长上下文、意图识别和工具行动；产品侧则把 agent 带进文档、搜索、设计、语音、网页和企业工作台。AI 工具正在从“独立网页应用”继续下沉到日常软件的操作层。
