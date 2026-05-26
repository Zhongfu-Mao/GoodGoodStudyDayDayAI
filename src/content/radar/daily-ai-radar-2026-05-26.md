---
title: "AI 雷达日报：2026-05-26"
date: 2026-05-26
category: radar
cadence: daily
plainSummary: "今天的主线是 agent 工程继续从单点演示走向可审计、可隔离、可运营的生产系统：术语层开始澄清 harness、scaffold、policy 与 memory，长上下文处理转向代码执行和子模型递归，SaaS、BI、医疗和浏览器自动化场景则把多租户、合规、观测和人类监督放到架构中心。"
difficulty: intermediate
tags:
  - AI Engineering
  - Agent
  - Infrastructure
  - Evaluation
lang: zh
coverImage: /images/radar/daily-ai-radar-2026-05-26-infographic.webp
audioUrl: /audio/radar/daily-ai-radar-2026-05-26.mp3
audioDuration: 925
audioSize: 7400575
draft: false
---

## 本期范围

- 覆盖时间：2026-05-25 至 2026-05-26，并补充 2026-05-21 未入选的高信号 AgentCore 与企业 agent 案例。

---
![Agent harness, scaffold and model diagram](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/agent-glossary/agent-diagram.png)

*代表图来自 [Hugging Face Agent Glossary](https://huggingface.co/blog/agent-glossary)。它对应本期最核心的信号：agent 的差异越来越来自模型外部的 harness、scaffold、工具、记忆、运行时和验证闭环。*

## 1. Agent 术语、深度研究与形式化证明

### Hugging Face 用一篇 Agent Glossary 澄清 model、scaffold、harness、policy 与 reward 的边界

- 来源：Hugging Face
- 日期：2026-05-25
- 链接：https://huggingface.co/blog/agent-glossary
- 摘要：Hugging Face 认为 agent 领域的术语正在快速膨胀，很多团队把 harness、scaffold、context engineering、policy、skills、sub-agents、rollout 和 reward 混用。文章给出一个实用切分：model 是一次输入输出的 LLM；scaffold 是系统提示词、工具描述、解析格式和上下文管理；harness 是真正执行循环、处理工具调用和决定停止条件的层；agent 则是 model 加上这些外部执行结构。它还把训练侧的 environment、trainer、rollout、reward 与部署侧的工具、记忆和子 agent 放在同一张概念地图里。对工程团队来说，这类词汇统一会直接影响架构评审、评测设计和岗位沟通。

### Onyx 的 Deep Research 架构把“无搜索权限的 orchestrator”作为研究质量控制手段

- 来源：Daily Dose of Data Science / Onyx
- 日期：2026-05-25
- 链接：https://github.com/onyx-dot-app/onyx
- 摘要：Daily Dose of DS 介绍了 Onyx deep research 的一个反直觉设计：负责制定研究策略的 orchestrator agent 没有 web search 或 URL 打开权限，只能把问题拆成自洽的研究任务并分派给研究 agent。Onyx 的公开仓库显示它是一个开源 LLM 应用层，支持 RAG、web search、code execution、deep research、50 多个连接器和 MCP。这个设计的价值在于防止协调者自己抢先搜索、用最先找到的材料写浅层报告，而是迫使它先做任务分解。对企业 deep research 来说，关键不只是“能搜索”，而是把策略、检索、阅读、引用归并和权限控制拆成可验证的阶段。

### AlphaProof Nexus 用 Lean 形式化证明搜索解决 9 个 Erdős 开放问题和 44 个 OEIS 猜想

- 来源：arXiv
- 日期：2026-05-21
- 链接：https://arxiv.org/abs/2605.22763
- 摘要：Google DeepMind、MIT CSAIL 等作者提交的论文展示了 AI-driven formal proof search 在真实数学开放问题上的进展。最强 agent 自主解决 353 个已形式化 Erdős 问题中的 9 个，并证明 492 个 OEIS 猜想中的 44 个；论文称每个问题的推理成本为数百美元量级。系统思路是让 LLM 生成 Lean 证明，由形式化验证器检查每一步，基础 agent 也能复现这些 Erdős 成果但在最难问题上成本更高。这个结果的意义不在于替代数学家，而在于把“会推理”变成可编译、可复核、可规模化搜索的证明流程。

## 2. 长上下文、租户隔离与 MCP 运行时

### AWS 用 Recursive Language Models 把超长文档变成可编程环境，而不是塞进上下文窗口

- 来源：AWS
- 日期：2026-05-21
- 链接：https://aws.amazon.com/blogs/machine-learning/break-the-context-window-barrier-with-amazon-bedrock-agentcore/
- 摘要：AWS 展示如何用 Bedrock AgentCore Code Interpreter 和 Strands Agents SDK 实现 Recursive Language Models。根模型不再接收完整文档，而是在沙箱里写 Python 代码搜索、切片和分析文档；需要语义判断时，沙箱内部调用 sub-LLM，把结果留在 Python 变量里作为工作记忆。评测中，RLM 在 LongBench v2 金融多文档 QA 与代码仓库理解任务上达到 100% success rate，并显著提升多个模型的准确率。它代表一个重要架构方向：面对百万级字符输入，agent 不应只依赖更长上下文，而应把上下文作为可查询、可执行、可累积状态的环境。

### AWS 把多租户 agent 架构拆成 runtime、模型、workflow、RAG、identity、memory、policy 与 observability 十个控制面

- 来源：AWS
- 日期：2026-05-21
- 链接：https://aws.amazon.com/blogs/machine-learning/building-multi-tenant-agents-with-amazon-bedrock-agentcore/
- 摘要：AWS 讨论 SaaS 场景下的多租户 agent，不再只谈模型效果，而是系统性处理 tenant isolation、identity、data isolation、cost attribution、noisy neighbor mitigation、memory namespace、tool access control 和 guardrails。文章把设计模式分成 silo、pool、bridge：高合规客户可用独立 runtime、gateway、memory 和数据层；中小租户可共享资源但用 JWT、命名空间和 ABAC 做隔离；混合模式则按租户等级选择隔离层级。这个框架说明，生产 agent 的核心风险已经从“回答错”扩展到“跨租户越权、成本不可归因、记忆串线和工具权限失控”。

### AWS API MCP Server 接入 Amazon Quick，把云运维查询变成受 IAM 和 Cognito 约束的自然语言接口

- 来源：AWS
- 日期：2026-05-21
- 链接：https://aws.amazon.com/blogs/machine-learning/integrating-aws-api-mcp-server-with-amazon-quick-suite-using-amazon-bedrock-agentcore-runtime/
- 摘要：AWS 展示如何通过 Bedrock AgentCore Runtime 的 MCP 支持，把 Amazon Quick 连接到 AWS API MCP Server。用户可以在 Quick 里问“列出 us-east-1 正在运行的 EC2 实例”，custom agent 通过 Cognito 获取 JWT，AgentCore Runtime 验证令牌并调用容器化 MCP server，再按 IAM execution role 执行 AWS CLI/API 操作。文章还强调 CloudWatch audit trail、least privilege、生产环境不要裸用 no-auth MCP server、以及 origin/host 白名单收紧。这个模式把 MCP 从本地开发协议推进到企业运维接口：自然语言只是入口，真正关键是认证、授权、审计和权限边界。

## 3. 企业与行业 Agent：BI、仪表盘、医疗、招聘

### AWS 的 dashboard automation agent 把 Quick 仪表盘修改从工单流程压缩到自然语言多 agent 编排

- 来源：AWS
- 日期：2026-05-21
- 链接：https://aws.amazon.com/blogs/machine-learning/build-ai-powered-dashboard-automation-agents-with-nlp-on-amazon-bedrock-agentcore/
- 摘要：AWS 构建了一个 Quick dashboard self-service 方案，由 Find Dashboard Agent、Modify Dashboard Agent 和 Orchestrator Agent 组成。用户用自然语言要求添加或删除列时，系统先搜索 dashboard 与 dataset schema，再验证字段是否存在、是否已在可视化里，最后创建新 dashboard 版本而不是覆盖原件。架构使用 Bedrock AgentCore、Strands、Amazon Nova、AgentCore Memory 与 Observability。它的信号不只是 BI 自动化，而是“业务用户自助修改生产对象”需要验证优先、可回滚、可审计和明确的 agent-as-tool 分工。

### OPLOG 用三个 AgentCore BI agent 改善销售周期、CRM 完整度和销售研究时间

- 来源：AWS
- 日期：2026-05-21
- 链接：https://aws.amazon.com/blogs/machine-learning/build-ai-agents-for-business-intelligence-with-amazon-bedrock-agentcore/
- 摘要：AWS 介绍 OPLOG 的生产级 BI agent 系统：Deal Analyzer Agent 定时检查 HubSpot deal 是否符合销售方法论；Sales Coach Agent 在 deal stage 变化时实时验证字段并创建任务；Lead Insight Agent 在新增 lead 后并行研究社交与网页信号，生成 ICP fit 和外联建议。系统基于 Strands、AgentCore、Bedrock Knowledge Bases、Claude Sonnet、Lambda、EventBridge 和 Teams webhook。文章报告销售周期降低 35%、CRM 数据完整度提升 91%、人工研究时间降低 98%。它说明企业 agent 的高价值入口往往不是聊天，而是把“每天重复但依赖上下文判断”的业务检查嵌入事件流。

### AWS 的放射科 worklist agent 把病例分配从规则队列升级为多 agent 临床编排

- 来源：AWS
- 日期：2026-05-21
- 链接：https://aws.amazon.com/blogs/machine-learning/intelligent-radiology-workflow-optimization-with-ai-agents-2/
- 摘要：AWS 展示了一个智能放射科 worklist 优化方案，用 orchestrator agent 协调 exam metadata、patient history、radiologist assignment、availability、dynamic rules 和 exam prioritization 等子 agent。系统考虑放射科医生专长、当前负载、疲劳、病例复杂度、SLA 和紧急程度，并用 AgentCore Memory 记录短期会话与长期经验；Guardrails 在输入输出两端拦截 PII 和越界主题；MCP Gateway 连接临床数据、日程和 PACS/Imaging API。它的现实意义是，医疗 agent 的可靠性不只来自模型能力，还来自分工、记忆、合规、优先级和人类可接受的解释。

### Amazon Nova Act 获得 HIPAA eligible，浏览器自动化 agent 开始进入受监管医疗工作流

- 来源：AWS
- 日期：2026-05-21
- 链接：https://aws.amazon.com/blogs/machine-learning/amazon-nova-act-is-now-hipaa-eligible/
- 摘要：AWS 宣布 Amazon Nova Act 成为 HIPAA eligible service，可在签署 AWS BAA 的账户中用于涉及 ePHI 的 agentic workflow。Nova Act 面向浏览器里的生产 UI 工作流，可以导航网站、填写表单、提取信息、执行多步骤任务，并在必要时升级给人类 supervisor；它还可通过 API、remote MCP 或 Strands Agents 集成外部工具。面向医疗场景，AWS 提到预约、保险核验、prior authorization、claims status、appeals、referrals 和 compliance reporting。这个信号说明，浏览器 agent 真正进入企业流程时，合规资格、IAM、KMS、CloudTrail 和人工监督会和模型能力同等重要。

### AWS 的招聘助手参考架构把简历筛选做成有证据引用、PII 匿名化和 prompt attack 防护的高风险 AI 流程

- 来源：AWS
- 日期：2026-05-21
- 链接：https://aws.amazon.com/blogs/machine-learning/build-an-ai-powered-recruitment-assistant-using-amazon-bedrock/
- 摘要：AWS 发布一个基于 Bedrock 的招聘助手参考架构，覆盖简历解析、候选人匹配、技能评估和个性化面试问题生成。系统使用 Amplify、Cognito、API Gateway、Lambda、DynamoDB、S3、Bedrock Converse API、Nova Pro 和 Bedrock Guardrails；提示词要求所有判断引用简历证据，并避免基于姓名、联系方式、人口属性或个人特征做推断。Guardrails 负责 PII 匿名化、简历中的 prompt injection 检测和偏见相关内容过滤。文章明确提醒这属于高风险 AI 应用，最终招聘决定必须由人类负责。它是一个有价值的模式：越接近人事、金融、医疗，AI 输出越需要证据链、审计和强制人工检查点。

## 4. 内容生态、部署基础与模型可移植性

### OpenAI 与 Grupo Folha、Grupo UOL 达成巴西内容合作，ChatGPT 的新闻接入继续走向本地可信来源

- 来源：OpenAI
- 日期：2026-05-25
- 链接：https://openai.com/index/grupo-folha-grupo-uol-partnership
- 摘要：OpenAI 宣布与 Grupo Folha 和 Grupo UOL 建立战略内容合作，这是 OpenAI 在巴西的首个媒体合作。OpenAI 表示，超过 9 亿周活 ChatGPT 用户将能访问基于 Folha de S.Paulo 和 UOL 报道的摘要，并通过 attribution、transparency 和 original source links 回到新闻源。OpenAI 还披露巴西是 ChatGPT 最大市场之一，月活超过 5000 万，每日约 1.4 亿条消息。对 AI 产品生态来说，这类合作体现了一个持续趋势：AI answer layer 要处理的不只是生成能力，还包括授权内容、来源归因、本地语言市场和新闻机构的分发关系。

### Daily Dose of DS 的 ONNX 章节提醒，模型上线的瓶颈常在格式、运行时和硬件后端

- 来源：Daily Dose of Data Science
- 日期：2026-05-25
- 链接：https://www.dailydoseofds.com/mlops-crash-course-part-10/
- 摘要：Daily Dose of DS 在 MLOps 课程中继续讨论模型压缩与可移植性，覆盖 knowledge distillation、low-rank factorization、quantization，以及 ONNX / ONNX Runtime 在训练框架和生产运行时之间的桥接作用。文章强调，PyTorch 或 TensorFlow 训练出的模型最终可能要跑在 C++ 服务、移动端、GPU 优化 runtime 或 CPU-only 环境里；没有共同格式时，每次 framework-to-runtime 迁移都会变成定制工程。ONNX 把计算图、标准算子、tensor shape、metadata 和权重打包成中间表示，ONNX Runtime 再做图优化和硬件后端分派。对 agent 产品来说，这仍是基础设施问题：模型越多进入边缘、实时和高吞吐链路，可移植运行时越重要。

## 📬 Newsletter 精选

- Daily Dose of Data Science：本期采用 2 条，覆盖 Onyx deep research 的 orchestrator 约束设计，以及 ONNX / ONNX Runtime 的模型可移植性。
- AI Valley 与 The Rundown AI：共同提示了 AlphaProof Nexus 的数学进展，本期以 arXiv 论文作为主链接复核并入选。
- 其他入选条目主要来自 OpenAI、Hugging Face 与 AWS 官方发布。
