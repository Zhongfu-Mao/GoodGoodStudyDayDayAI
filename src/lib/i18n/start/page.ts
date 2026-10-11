export const startPage = {
  zh: {
    title: 'AI 起步路线',
    metaDescription:
      '按角色选择 AI 起步路线，从小实验开始，再按可调整的 30 / 60 / 90 天计划把 AI 用进工作与产品。',
    eyebrow: 'Start Here',
    heroTitle: '从会用 AI，到会构建 AI。',
    heroDescription:
      '无论你是否写代码，都可以从一件真实任务开始。这里提供概念短文、按角色划分的路线和小实验，帮助你把已有工作经验用起来，再按需要补齐工程能力。',
    primaryCta: '选择我的路线',
    secondaryCta: '先看最新 AI 雷达',
    audienceEyebrow: 'Pick a Track',
    audienceTitle: '先选一条路线，走通再换',
    audienceDescription:
      '四条路线对应不同目标。先选最贴近手头任务的一条，用 30 天参考目标检查进展；所需时间可按经验与任务难度调整。',
    audienceMilestoneLabel: '30 天参考目标',
    audiences: [
      {
        label: '把 AI 用进日常工作',
        role: '产品 / 运营 / 职能 / 学生',
        description:
          '你不一定写代码，但每天都在写文档、整理资料、分析数据、准备汇报。先让 AI 接手这些重复的工作：给足背景再提问、上传资料让它基于资料回答、把好用的做法沉淀成 Project 或 Skill。这条路线的关键能力是把任务讲清楚，并且知道哪些结果必须自己核对。',
        milestone:
          '选 1–3 件低风险重复工作，沉淀成可复用模板或操作清单，比较复核后的总耗时与质量；Project 或 Skill 可按需采用。',
        links: [
          {
            label: '日常工作者路线',
            href: '/academy/learning-routes/non-engineering-route/',
          },
          {
            label: '提示词到底是什么',
            href: '/start/ai-basics-for-everyone/what-is-prompt/',
          },
          {
            label: 'Claude 101',
            href: '/academy/anthropic-academy/03-claude-product/claude-101/',
          },
        ],
      },
      {
        label: '用 AI 提升自己的开发效率',
        role: '个人开发者',
        description:
          '你每天写代码、查问题、读别人的代码。先把 coding agent 变成日常搭档：让它解释陌生代码库、补测试、做小重构，而你专注在拆任务和审 diff。这条路线的关键能力不是写 Prompt，而是把任务切小、给足上下文、守住审查。',
        milestone:
          '把一个真实 issue 交给 coding agent 完成，并能说清楚你为什么接受或拒绝它的每一处改动。',
        links: [
          {
            label: 'Coding agent 工作流对比',
            href: '/engineering/practice/agent-cli-workflow-comparison/',
          },
          {
            label: 'Claude Code in Action',
            href: '/academy/anthropic-academy/04-developer-tools/claude-code-in-action/',
          },
          {
            label: 'Codex 快速上手',
            href: '/academy/openai-academy/05-codex/quickstart/',
          },
        ],
      },
      {
        label: '把 AI 做进产品',
        role: '应用 / 后端开发者',
        description:
          '你要交付的是一个带 AI 能力的功能：问答、分类、抽取、生成或 Agent。它和普通功能最大的不同是输出不确定——所以要先学会可靠调用、结构化输出、检索上下文，再用评测集把“感觉不错”变成可重复的质量门槛。',
        milestone:
          '交付一个带结构化输出、重试降级和至少 20 条评测用例的 AI 功能，并知道它每次调用大概花多少钱。',
        links: [
          {
            label: '可靠 LLM 调用的最小骨架',
            href: '/engineering/ai-developer-core/reliable-llm-call-skeleton/',
          },
          {
            label: '结构化输出与错误恢复',
            href: '/engineering/ai-developer-core/structured-output-retry-recovery/',
          },
          {
            label: 'RAG 最小系统',
            href: '/engineering/ai-developer-core/rag-minimum-system/',
          },
        ],
      },
      {
        label: '带团队落地 AI',
        role: '技术负责人 / 架构师',
        description:
          '你要回答的不是“哪个模型最强”，而是：团队用哪些工具、哪些数据能发给模型、Agent 能动哪些系统、质量和成本怎么度量。这条路线先建立全局地图，再落到权限、可观测性和评测这些你本来就熟悉的工程治理上。',
        milestone:
          '为团队写出一页 AI 使用规范：工具清单、数据分级、Agent 权限边界、评测与成本的最低要求。',
        links: [
          {
            label: 'AI 工程实践地图',
            href: '/engineering/practice/ai-engineering-practice-map/',
          },
          {
            label: '长任务 Agent 的边界',
            href: '/engineering/practice/long-running-agent-boundaries/',
          },
          {
            label: '工程师进阶路线',
            href: '/academy/learning-routes/engineering-route/',
          },
        ],
      },
    ],
    basicsHint:
      '对 Token、上下文、RAG、Eval 这些词还不熟？先挑一篇和手头任务有关的概念短文，读完就试；其余用到再查。',
    basicsHintCta: '先补概念',
    promiseEyebrow: 'What Transfers',
    promiseTitle: '你已有的经验，哪些还管用',
    promises: [
      {
        title: '还管用：把事做对的老方法',
        description:
          '拆解任务、写清需求、复核结果、留下记录——无论你写代码还是写方案，这些在用 AI 时一样是地基。对开发者来说，接口契约、超时重试、日志、最小权限也都继续有效，而且更重要。',
      },
      {
        title: '要重学：结果是概率性的',
        description:
          '同样的问题不保证同样的回答，看起来流畅也不代表正确。质量要靠对照样本和复核来判断；给 AI 看什么资料、看多少，本身就是需要设计的事情。',
      },
      {
        title: '要放下：追新和收藏',
        description:
          '追模型排行榜、收藏 Prompt 模板、等“学完再动手”。型号几个月就换一轮，能沉淀下来的是把任务讲清楚、判断结果质量、设计工作流的能力。',
      },
    ],
    basicsTitle: '12 个高频概念，先打底',
    basicsDescription:
      'AI Basics for Everyone 是本站的概念层：每篇用一页讲清一个词，再指向对应的工程实践或底层原理。已经熟悉的可以直接跳过；拿不准的，读完再回到路线。',
    stepsEyebrow: 'Reading Order',
    stepsTitle: '开发者的推荐阅读顺序',
    steps: [
      {
        title: '概念打底',
        description:
          '先把上下文、评测、结构化输出这几个最影响工程设计的词弄清楚，其他概念用到再查。',
        links: [
          {
            label: 'Context Engineering 是什么',
            href: '/start/ai-basics-for-everyone/what-is-context-engineering/',
          },
          {
            label: 'Eval 是什么',
            href: '/start/ai-basics-for-everyone/what-is-eval/',
          },
          {
            label: '结构化输出是什么',
            href: '/start/ai-basics-for-everyone/what-is-structured-output/',
          },
        ],
      },
      {
        title: '学会可靠地调用模型',
        description:
          '把一次模型调用当成一次不可靠的远程调用：超时、重试、降级、结构化校验，一个都不能少。',
        links: [
          {
            label: '可靠 LLM 调用骨架',
            href: '/engineering/ai-developer-core/reliable-llm-call-skeleton/',
          },
          {
            label: 'Token 与上下文窗口',
            href: '/foundations/ai-developer-core/token-context-window/',
          },
        ],
      },
      {
        title: '接上数据和工具',
        description: '先判断真的需要 RAG、MCP 还是一个脚本就够——多数第一版只需要最简单的那个。',
        links: [
          {
            label: 'RAG 最小系统',
            href: '/engineering/ai-developer-core/rag-minimum-system/',
          },
          {
            label: '什么时候需要 MCP',
            href: '/engineering/practice/when-to-use-mcp-vs-scripts/',
          },
          {
            label: 'MCP Tool 契约设计',
            href: '/engineering/practice/mcp-tool-contract-design/',
          },
        ],
      },
      {
        title: '再做 Agent，并给它边界',
        description:
          'Agent 的难点不在“让它自主”，而在日志、审批、停止条件和回放——也就是你能不能管住它。',
        links: [
          {
            label: 'Agent Harness：日志、审批与回放',
            href: '/engineering/ai-developer-core/agent-harness-logging-approval-replay/',
          },
          {
            label: 'Google Advent of Agents',
            href: '/academy/google-advent-of-agents/00-overview/google-advent-of-agents-overview/',
          },
        ],
      },
      {
        title: '用雷达跟上变化',
        description: '每天花 5 分钟扫一眼日报标题，每周读一次周报；只深读和你手上项目相关的条目。',
        links: [
          {
            label: 'AI 雷达',
            href: '/radar/',
          },
          {
            label: '雷达图片墙',
            href: '/radar/gallery/',
          },
        ],
      },
    ],
    glossaryTitle: '工程视角的术语表',
    glossary: [
      {
        term: '上下文（Context）',
        description: '模型这一次调用能看到的全部信息：系统指令、对话、文件、检索结果、工具返回。',
      },
      {
        term: 'Context Engineering',
        description: '设计每一步给模型看什么、看多少、按什么顺序看的工程实践。',
      },
      {
        term: 'Token',
        description:
          '模型切分和处理文本的单位；数量影响上下文占用与部分计费，延迟和总成本还取决于模型、缓存及工具调用。',
      },
      {
        term: '结构化输出',
        description: '用 JSON Schema 等约束让模型返回可被程序校验的结果，而不是自由文本。',
      },
      {
        term: 'Tool Use / Function Calling',
        description: '模型在回答过程中请求调用你定义的函数或 API，由你的代码真正执行。',
      },
      {
        term: 'RAG',
        description: '先检索相关资料再让模型基于资料回答，用来引入私有和最新信息。',
      },
      {
        term: 'MCP',
        description: '连接 AI 客户端与外部工具、数据的开放协议，写一次工具，多个客户端复用。',
      },
      {
        term: 'Skill',
        description: '把指令、脚本和资源打包成可复用的工作流单元，按需加载进上下文。',
      },
      {
        term: 'Agent',
        description: '在目标和边界内循环“规划—调用工具—观察结果”的系统，而不是一次问答。',
      },
      {
        term: 'Agent Harness',
        description: '包在 Agent 外面的运行框架：日志、审批、停止条件、重放和权限控制。',
      },
      {
        term: 'Eval（评测）',
        description: '用固定样本和评分规则衡量 AI 功能的质量，是改 Prompt 或换模型前的安全网。',
      },
      {
        term: '回归门禁',
        description: '把评测集接进 CI，质量分低于阈值就阻止发布，和单元测试同一个思路。',
      },
      {
        term: 'LLM-as-a-judge',
        description: '用模型给另一个模型的输出打分；评委本身需要用人工标注样本校准。',
      },
      {
        term: '幻觉',
        description: '模型生成看似可信、但错误或缺乏依据的内容；有参考资料时也可能发生。',
      },
      {
        term: 'Guardrails',
        description: '在输入和输出两侧做的检查与拦截，例如敏感信息过滤、格式校验、越权拦截。',
      },
      {
        term: 'Prompt Injection',
        description:
          '不可信输入中的指令影响模型行为的攻击方式，可来自用户输入，也可藏在网页、文档或工具返回中。',
      },
      {
        term: 'Prompt Caching',
        description:
          '在满足提供方的缓存规则时复用部分计算，可减少重复上下文的费用或延迟；命中条件和写入费用需另查。',
      },
      {
        term: 'Trace',
        description:
          '记录一次请求中每次模型调用、工具调用、输入输出和耗时的调用链，用于排错和评测。',
      },
      {
        term: '推理模型',
        description:
          '在生成最终回答前投入额外推理计算的模型或模式。复杂任务可能受益，质量、延迟与费用仍要实测。',
      },
      {
        term: 'Computer Use',
        description: '让模型通过截图、可访问性树或浏览器自动化来操作图形界面。',
      },
      {
        term: '开放权重模型',
        description: '可下载权重自行部署的模型，适合数据驻留、私有化和微调需求。',
      },
      {
        term: '微调（Fine-tuning）',
        description: '用自有数据对模型再训练，通常在提示、检索和评测都做过之后才考虑。',
      },
    ],
    layersEyebrow: 'Capability Layers',
    layersTitle: 'AI 应用的 6 个能力层',
    layersDescription:
      '下面六个维度是本站的学习地图，不是行业标准或必须逐层搭建的架构。MCP、Skills、A2A 和 Agent 都按需采用；评测、安全、权限与成本管理则从第一次实验开始，贯穿整个系统。',
    layers: [
      {
        level: 'L1',
        name: '模型调用（Model API）',
        description:
          '调用模型服务时，要处理超时、限流、有限重试、降级与用量记录。服务是否保存会话状态、如何计费，取决于具体接口和渠道。',
      },
      {
        level: 'L2',
        name: '上下文（Prompt & Context）',
        description:
          '系统指令、示例、文件与检索结果构成模型当前可见的信息。RAG 与上下文工程帮助选择资料，但检索到资料不等于答案已经核实。',
      },
      {
        level: 'L3',
        name: '结构化输出与工具（Structured Output & Tools）',
        description:
          '让模型返回可校验的数据、请求调用你的函数。从“会说话”到“会做事”的分界线，核心是契约设计：输入、输出、错误和权限。',
      },
      {
        level: 'L4',
        name: '协议与复用（MCP / Skills / A2A）',
        description:
          'MCP 连接工具与数据，Skills 封装可复用指令和可选脚本，A2A 用于 Agent 间通信。按需求选择，并核对客户端能力、认证和权限；不必三者全用。',
      },
      {
        level: 'L5',
        name: 'Agent 循环（Agent Loop & Harness）',
        description:
          '模型在目标和边界内循环规划、调用工具、观察结果。Coding agent 就在这一层。真正的工程量在 harness：日志、审批、停止条件和回放。',
      },
      {
        level: 'L6',
        name: '评测与治理（Evals & Governance）',
        description:
          '评测集、回归门禁、trace、权限、成本预算——决定一个 AI 功能能不能上生产、出了问题能不能定位。这一层是技术负责人的主场。',
      },
    ],
    safetyEyebrow: 'Safety Baselines',
    safetyTitle: '构建 AI 系统的六条安全底线',
    safetyDescription:
      '权限过大、数据外泄、错误执行和无上限循环都需要系统层面的防护。下面六条是起点，应在第一次实验时采用，并随实际风险补充测试。',
    safetyItems: [
      {
        title: 'Prompt Injection：不信任模型读到的内容',
        description:
          '网页、文档、邮件、工单、检索结果里都可能藏着指令。原则是：模型输出不能直接驱动高权限操作；工具调用的参数要在你的代码里重新校验，而不是相信模型“理解了”。',
      },
      {
        title: '凭据与最小权限',
        description:
          '不要让 Agent 使用你的个人凭据。给它独立身份、短期令牌和只够完成任务的权限；工具访问集中经过网关或代理层授权和审计，和你管理服务账号的思路一样。',
      },
      {
        title: '数据边界',
        description:
          '先给数据分级，再决定每一级能走哪个模型渠道。消费级产品、企业版、云平台托管的模型，数据条款和驻留区域都不同。别忘了 trace 和日志里同样有用户数据。',
      },
      {
        title: '供应链：检查指令、代码与权限',
        description:
          'Skill 可以只有指令，也可以附带脚本；MCP server 可在本地或远端运行。它们影响行为与数据访问的方式不同，都要核对来源、执行环境、实际权限和更新内容。',
      },
      {
        title: '不可逆操作必须有人确认',
        description:
          '删除数据、付款、对外发送、部署生产——这类操作默认需要人工审批，并提供 dry-run 和可回放的记录。Agent 能力越强，这条越不能省。',
      },
      {
        title: '成本与失控循环',
        description:
          'Agent 会重试、会循环、会把长文档一遍遍塞进上下文。给每个任务设最大步数、超时和预算上限，并对异常调用量告警，就像给任何外部依赖设熔断。',
      },
    ],
    pitfallsEyebrow: 'Common Pitfalls',
    pitfallsTitle: '用 AI 时最常见的八个误区',
    pitfallsDescription:
      '把概率性输出当成确定事实，或省略原有的审查步骤，都容易出问题。下面的例子帮助你检查自己的工作流。',
    pitfalls: [
      {
        title: 'Demo 跑通，不等于能上线',
        description:
          'Demo 只说明少数样本可以跑通。上线前还要检查边界输入、失败降级、评测、成本和权限，所需工作量取决于场景与风险。',
      },
      {
        title: '用断言思维测试 AI',
        description:
          '格式、字段、分类标签和确定性的工具契约适合用断言；开放式回答不宜只做字符串全等比较。语义质量结合评分规则与人工校准，并观察重复运行的波动。',
      },
      {
        title: 'Prompt 写死在代码里，没有版本',
        description:
          'Prompt 是影响行为最大的“配置”，却经常散落在代码里随手改。把它版本化，每次修改都跑一遍评测集，和改数据库迁移一样认真。',
      },
      {
        title: '把所有东西都塞进上下文',
        description:
          '无关或冲突的资料会干扰回答；更长输入也可能增加费用与延迟。按任务比较全文、检索和摘要方案，检查遗漏，别把“越短越好”当成另一条绝对规则。',
      },
      {
        title: '让 Agent 用你的账号干活',
        description:
          '图省事给 Agent 配上个人 token 或管理员权限，等于把一个会被网页内容影响的程序放进了生产环境。独立身份和最小权限从第一天就做。',
      },
      {
        title: '只看单价，不算任务总成本',
        description:
          '任务费用要汇总每次调用的输入、输出和缓存用量乘对应单价，再加工具与运行费用；重试和 Agent 循环都计入。比较完整任务的成功率、费用和人工复核时间。',
      },
      {
        title: '一有新模型就换',
        description:
          '没有评测集时换模型，只能凭感觉判断好坏。先建 20–50 条代表性样本，再用它对比新模型——这样换模型是一次可度量的升级，而不是一次赌博。',
      },
      {
        title: '把流畅当成正确',
        description:
          'AI 的回答读起来越流畅，越容易让人放下戒心。数字、引用、链接、人名、法规这类可以核对的事实，一律回到原始资料确认；要署你名字发出去的内容，永远走“AI 起草、自己核对、再发出”。',
      },
    ],
    landscapeEyebrow: 'Choosing Models',
    landscapeTitle: '不背型号，也能选对模型',
    landscapeDescription:
      '这里侧重可重复使用的选型步骤。模型能力、价格和渠道会变化，具体选择要回到官方文档和自己的测试；最近的生态变化可参考月报。',
    landscapeRules: [
      {
        title: '先分档，再选家',
        hint: '旗舰 / 均衡 / 轻量',
        description:
          '先根据质量、速度和预算筛选候选，用较轻量的方案建立基线；只有实测收益值得时才增加推理或采用更强模型。档位名称不是统一标准。',
      },
      {
        title: '用你的评测集说话',
        hint: '20–50 条真实样本',
        description:
          '先用 20–50 条代表性样本比较候选，把它当作起步诊断。另留未参与调优的测试集，补充失败和边界案例；小样本通过不代表已达到生产可靠性。',
      },
      {
        title: '算任务成本，而不是单价',
        hint: '完整任务的费用与延迟',
        description:
          '便宜的模型如果需要更多重试、更长提示或更多 Agent 轮数，总成本可能更高。同时看延迟：交互场景对首 token 时间很敏感。',
      },
      {
        title: 'API 还是开放权重',
        hint: '数据驻留 / 私有化',
        description:
          '托管 API 通常便于试验；开放权重也可能适合离线、数据驻留、定制或大规模推理。比较许可、硬件、运维、安全与实际用量，再决定部署方式。',
      },
      {
        title: '企业场景看渠道',
        hint: '云平台托管模型',
        description:
          '同一个模型通过官方 API、Azure、AWS、Google Cloud 等渠道提供时，数据条款、可用区域、配额和计费方式都可能不同。企业落地常常先选渠道，再选模型。',
      },
      {
        title: '保留可替换性',
        hint: '抽象调用层',
        description:
          '封装模型调用层，并把模型名和参数放进配置，可减少迁移成本。切换时仍需适配工具调用、Schema 支持、错误语义等差异，并重新评测。',
      },
    ],
    landscapeLatestLabel: '最近一期月度回顾',
    landscapeLatestCta: '读最新的雷达月报',
    landscapeNote:
      'MCP 与 Skills 有助于复用，但不保证任意客户端即插即用。接入前核对协议版本、支持的功能、运行环境、认证与权限；模型与渠道的能力以对应官方文档为准。',
    firstDayEyebrow: 'First Hour',
    firstDayTitle: '用第一个小时开始六个小实验',
    firstDayDescription:
      '先完成前三个通用实验；开发者再按需做后三个。每项可先投入约 10 分钟，环境配置和 API 开通另计，不必一次做完。先选已获准使用的工具和公开或脱敏资料；API 实验先设用量上限。',
    firstDaySteps: [
      {
        who: '所有人',
        title: '用一件真实任务问一次，再追问两轮',
        description:
          '挑一件你今天本来就要做的事：一封不好开口的邮件、一份要整理的会议记录、一段要读的英文资料。按“目标 / 背景 / 约束 / 输出格式”写清楚再问，然后至少追问两轮，感受第一稿和第三稿的差距。',
      },
      {
        who: '所有人',
        title: '上传一份你熟悉的资料，逐条核对',
        description:
          '选一份允许上传的公开或脱敏资料，先要求 AI 给出要点及对应原文位置，再逐条核对。另问一个资料中没有答案的问题，观察它是否承认不知道。',
      },
      {
        who: '所有人',
        title: '写下自己或团队的三条红线',
        description:
          '哪些数据不能发给 AI？哪些事情不能交给 AI 直接完成？哪些结果必须有人确认才能发出去？先写三条就够——这是之后所有安全习惯的起点。',
      },
      {
        who: '开发者',
        title: '让 coding agent 读懂并改动你的仓库',
        description:
          '在熟悉的项目里，先只让它解释架构、找出某个功能的入口和测试位置；再交给它一个小任务（补测试、修 lint、改小 bug），重点审它的 diff：有没有改了不该改的地方、有没有跑测试。',
      },
      {
        who: '开发者',
        title: '用 API 拿一次结构化输出',
        description:
          '用支持结构化输出的 API 提取一条虚构记录，检查 Schema 和字段内容。再测试空输入、无关输入及输出截断；拒答与校验失败走明确的失败分支，不无限重试。',
      },
      {
        who: '开发者',
        title: '写 10 条评测用例，并算清成本',
        description:
          '先写几组“输入 + 期望行为”，逐步扩到 10 条，包含资料缺失和边界情况。改一次 Prompt 后重跑，并记录每次调用的用量、单价、工具费与延迟；这是初步诊断，不是上线证明。',
      },
    ],
    planEyebrow: '30 / 60 / 90 Days',
    planTitle: '90 天转型节奏',
    planDescription:
      '目标不是 90 天成为专家，而是 90 天内把 AI 真正用进一件具体的事，并建立之后能持续跟进的习惯。每个阶段都写了两种读者的产出：所有人都适用的，和开发者额外要做的。',
    planPhases: [
      {
        phase: 'Week 1',
        name: '习惯：每天用 AI 做一件真事',
        description:
          '所有人：每天至少把一件真实工作交给 AI，完成“第一个小时”里的前三个实验，读完概念层里不熟的几篇。开发者：再把 coding agent 用进日常开发，并认真审它的每一次改动。',
      },
      {
        phase: 'Day 30',
        name: '沉淀：第一个可复用的成果',
        description:
          '所有人：把最常用的 2–3 个工作流沉淀成 Project、Skill 或自定义助手，记下哪些输出必须人工核对。开发者：交付第一个内部 AI 功能，带结构化输出、重试降级、20 条以上评测用例，并算清单次成本。',
      },
      {
        phase: 'Day 60',
        name: '扩展：接入资料与工具',
        description:
          '所有人：让 AI 基于团队的文档和数据工作，开始尝试能调用工具、操作浏览器的 Agent 类产品。开发者：按需接入检索和工具调用，给请求加 trace，把 Prompt 版本化、评测集接进 CI。',
      },
      {
        phase: 'Day 90',
        name: '带动：从个人到团队',
        description:
          '所有人：为团队写一页 AI 使用规范（工具、数据、必须人工确认的事项），做一次内部分享。开发者：如果要做 Agent，先设计好身份、权限、审批、停止条件和回放。到这里，你已经能带别人走这条路。',
      },
    ],
    faqEyebrow: 'FAQ',
    faqTitle: '最常被问到的问题',
    faqDescription: '读和你当下困惑相关的那几条就够。更完整的回答在 FAQ 全文里。',
    faqItems: [
      {
        question: '我不写代码，这条路线对我有用吗？',
        answer:
          '有用。选“把 AI 用进日常工作”那条路线，做“第一个小时”里标着“所有人”的三个实验，再按 90 天节奏里“所有人”的部分走。能力层、选型和安全这几部分不需要写代码也能读懂，而且越早建立这些判断越好。',
      },
      {
        question: '要先学机器学习或深度学习吗？',
        answer:
          '做 AI 应用不需要先学。前 90 天的重点是调用、上下文、评测和工程治理。等你需要做微调、优化推理成本或读论文时，再到“底层原理”栏目补对应的部分。',
      },
      {
        question: 'Python 还是 TypeScript？',
        answer:
          '用你团队现有的技术栈。Python 在数据处理、评测和训练生态上更全；TypeScript 适合直接做进 Web 产品。主流模型 SDK 两边都有，语言不是瓶颈。',
      },
      {
        question: '选哪个 coding agent？',
        answer:
          '先检查工具是否满足数据、权限、环境和预算要求，再用同一组仓库任务比较完成率、改动范围、测试与总耗时。任务拆分和人工审查也影响结果，不能只看演示。',
      },
      {
        question: '第一个项目做什么？',
        answer:
          '选内部、低风险、有现成数据、结果可度量的场景：工单分类、内部文档问答、PR 或会议摘要、日志归类。避免第一个项目就直接面向客户或涉及不可逆操作。',
      },
      {
        question: '公司数据能发给模型吗？',
        answer:
          '取决于渠道和合同。先给数据分级，再确认每个渠道（消费级产品、企业版、云平台托管）的数据使用条款和驻留区域。不确定的数据先不发，并让法务或安全团队尽早参与。',
      },
      {
        question: '模型更新这么快，学的东西会过时吗？',
        answer:
          '型号和价格会过时，工程能力不会：怎么设计上下文、怎么做评测、怎么定义工具契约、怎么管权限和成本——这些能力在每一代模型上都通用。这也是本站入门内容刻意不写具体型号的原因。',
      },
    ],
    readMoreLabel: '阅读完整指南 →',
    nextTitle: '下一步去哪',
    nextDescription: '选好路线后，按需要进入更深的栏目。',
    nextLinks: [
      {
        label: '每日 AI 雷达',
        href: '/radar/',
      },
      {
        label: '工程实践',
        href: '/engineering/',
      },
      {
        label: '官方课程导读',
        href: '/academy/',
      },
      {
        label: '底层原理',
        href: '/foundations/',
      },
    ],
    referencesTitle: '参考资料',
    references: [
      {
        label: 'MCP · Architecture',
        href: 'https://modelcontextprotocol.io/docs/learn/architecture',
      },
      {
        label: 'Agent Skills · Overview',
        href: 'https://agentskills.io/home',
      },
    ],
  },
  ja: {
    title: 'AI スタートガイド',
    metaDescription:
      '役割別に AI のスタートルートを選び、小さな実験から始め、調整可能な 30 / 60 / 90 日の計画で仕事やプロダクトに取り入れます。',
    eyebrow: 'Start Here',
    heroTitle: 'AI を使う側から、AI で作る側へ。',
    heroDescription:
      'コードを書く方も書かない方も、実際のタスクを 1 つ選ぶところから始められます。概念の短い解説、役割別のルート、小さな実験を通じて、これまでの経験を生かし、必要に応じてエンジニアリングの力を補いましょう。',
    primaryCta: '自分のルートを選ぶ',
    secondaryCta: '最新の AI Radar を見る',
    audienceEyebrow: 'Pick a Track',
    audienceTitle: 'まず 1 本選び、走り切ってから次へ',
    audienceDescription:
      '4 つのルートは異なる目標に対応します。手元のタスクに近い 1 本を選び、30 日の目安で進捗を確認しましょう。期間は経験と難易度に合わせて調整できます。',
    audienceMilestoneLabel: '30 日の目安',
    audiences: [
      {
        label: 'AI を日々の仕事に取り入れる',
        role: '企画 / 運用 / 職能 / 学生',
        description:
          'コードは書かなくても、毎日文書を書き、資料を整理し、データを分析し、報告を準備しているはずです。まずはこうした繰り返しの仕事を AI に任せましょう。背景を十分に伝えてから質問する、資料をアップロードしてそれに基づいて答えさせる、うまくいったやり方を Project や Skill にまとめる。このルートの鍵は、タスクを明確に伝えること、そしてどの結果を自分で確認すべきかを知ることです。',
        milestone:
          'リスクの低い反復作業を 1〜3 件選び、テンプレートや手順書にまとめ、確認を含む総時間と品質を比較できる。Project や Skill は必要に応じて使う。',
        links: [
          {
            label: '日常業務向けルート',
            href: '/ja/academy/learning-routes/non-engineering-route/',
          },
          {
            label: 'プロンプトとは何か',
            href: '/ja/start/ai-basics-for-everyone/what-is-prompt/',
          },
          {
            label: 'Claude 101',
            href: '/ja/academy/anthropic-academy/03-claude-product/claude-101/',
          },
        ],
      },
      {
        label: 'AI で自分の開発を速くする',
        role: '個人の開発者',
        description:
          '毎日コードを書き、調査し、他人のコードを読んでいるなら、まず coding agent を日常の相棒にしましょう。見慣れないコードベースの説明、テストの追加、小さなリファクタリングを任せ、自分はタスクの切り出しと diff のレビューに集中します。鍵になるのはプロンプトの書き方ではなく、タスクを小さく切り、十分な文脈を渡し、レビューを守ることです。',
        milestone:
          '実際の issue を 1 件 coding agent に任せて完了させ、各変更を採用・却下した理由を説明できる。',
        links: [
          {
            label: 'Coding agent のワークフロー比較',
            href: '/ja/engineering/practice/agent-cli-workflow-comparison/',
          },
          {
            label: 'Claude Code in Action',
            href: '/ja/academy/anthropic-academy/04-developer-tools/claude-code-in-action/',
          },
          {
            label: 'Codex クイックスタート',
            href: '/ja/academy/openai-academy/05-codex/quickstart/',
          },
        ],
      },
      {
        label: 'AI をプロダクトに組み込む',
        role: 'アプリ / バックエンド開発者',
        description:
          '届けるのは AI 機能を持つプロダクトです。Q&A、分類、抽出、生成、あるいはエージェント。通常の機能との最大の違いは出力が確定しないことです。まず信頼できる呼び出し、構造化出力、検索による文脈付与を身につけ、評価セットで「なんとなく良い」を再現可能な品質基準に変えます。',
        milestone:
          '構造化出力・リトライとフォールバック・20 件以上の評価ケースを備えた AI 機能を届け、1 回の呼び出しのおおよそのコストを把握している。',
        links: [
          {
            label: '信頼できる LLM 呼び出しの最小骨格',
            href: '/ja/engineering/ai-developer-core/reliable-llm-call-skeleton/',
          },
          {
            label: '構造化出力とエラー回復',
            href: '/ja/engineering/ai-developer-core/structured-output-retry-recovery/',
          },
          {
            label: 'RAG の最小構成',
            href: '/ja/engineering/ai-developer-core/rag-minimum-system/',
          },
        ],
      },
      {
        label: 'チームで AI を導入する',
        role: 'テックリード / アーキテクト',
        description:
          '答えるべき問いは「どのモデルが最強か」ではありません。チームはどのツールを使うか、どのデータをモデルに送ってよいか、エージェントはどのシステムに触れてよいか、品質とコストをどう測るか。全体像をつかんだうえで、権限・可観測性・評価という、すでに馴染みのあるエンジニアリングガバナンスに落とし込みます。',
        milestone:
          'チーム向けの AI 利用規程を 1 枚にまとめる。ツール一覧、データ分類、エージェントの権限境界、評価とコストの最低要件。',
        links: [
          {
            label: 'AI エンジニアリング実践マップ',
            href: '/ja/engineering/practice/ai-engineering-practice-map/',
          },
          {
            label: '長時間タスク型エージェントの境界',
            href: '/ja/engineering/practice/long-running-agent-boundaries/',
          },
          {
            label: 'エンジニア向けルート',
            href: '/ja/academy/learning-routes/engineering-route/',
          },
        ],
      },
    ],
    basicsHint:
      'Token、コンテキスト、RAG、Eval にまだ馴染みがなければ、手元のタスクに関係する解説を 1 本読み、すぐ試しましょう。残りは必要になったときに参照できます。',
    basicsHintCta: '先に概念を押さえる',
    promiseEyebrow: 'What Transfers',
    promiseTitle: 'これまでの経験で、何が通用するか',
    promises: [
      {
        title: '通用する：物事を正しく進める基本',
        description:
          'タスクの分解、要件の明確化、結果の確認、記録を残すこと。コードを書く人も企画書を書く人も、AI を使うときの土台は同じです。開発者にとっては、インターフェース契約、タイムアウトとリトライ、ログ、最小権限もそのまま有効で、むしろ重要度が増します。',
      },
      {
        title: '学び直す：結果は確率的',
        description:
          '同じ質問でも同じ答えが返るとは限らず、流暢に見えても正しいとは限りません。品質は照合用のサンプルと確認で判断します。AI にどの資料をどれだけ見せるかも、それ自体が設計すべきことです。',
      },
      {
        title: '手放す：新しさの追跡と収集',
        description:
          'モデルのランキングを追う、プロンプトテンプレートを集める、「学び終えてから手を動かす」。型番は数か月で入れ替わります。残るのは、タスクを明確に伝える力、結果の質を判断する力、ワークフローを設計する力です。',
      },
    ],
    basicsTitle: '頻出 12 概念で土台を作る',
    basicsDescription:
      'AI Basics for Everyone はこのサイトの概念レイヤーです。1 本 1 ページで 1 つの言葉を説明し、対応する実践記事や基礎記事へつなぎます。すでに知っているものは飛ばして構いません。迷うものだけ読み、ルートに戻ってください。',
    stepsEyebrow: 'Reading Order',
    stepsTitle: '開発者向けの読む順番',
    steps: [
      {
        title: '概念の土台',
        description:
          'コンテキスト、評価、構造化出力など、設計に最も影響する言葉を先に押さえ、他は必要になったときに調べます。',
        links: [
          {
            label: 'Context Engineering とは',
            href: '/ja/start/ai-basics-for-everyone/what-is-context-engineering/',
          },
          {
            label: 'Eval とは',
            href: '/ja/start/ai-basics-for-everyone/what-is-eval/',
          },
          {
            label: '構造化出力とは',
            href: '/ja/start/ai-basics-for-everyone/what-is-structured-output/',
          },
        ],
      },
      {
        title: 'モデルを信頼性高く呼び出す',
        description:
          '1 回のモデル呼び出しを、信頼できないリモート呼び出しとして扱います。タイムアウト、リトライ、フォールバック、構造化検証のどれも省けません。',
        links: [
          {
            label: '信頼できる LLM 呼び出しの骨格',
            href: '/ja/engineering/ai-developer-core/reliable-llm-call-skeleton/',
          },
          {
            label: 'Token とコンテキストウィンドウ',
            href: '/ja/foundations/ai-developer-core/token-context-window/',
          },
        ],
      },
      {
        title: 'データとツールをつなぐ',
        description:
          'RAG が必要か、MCP が必要か、スクリプト 1 本で足りるかを先に判断します。最初の版は、たいてい一番シンプルなもので十分です。',
        links: [
          {
            label: 'RAG の最小構成',
            href: '/ja/engineering/ai-developer-core/rag-minimum-system/',
          },
          {
            label: 'MCP が必要になるとき',
            href: '/ja/engineering/practice/when-to-use-mcp-vs-scripts/',
          },
          {
            label: 'MCP ツール契約の設計',
            href: '/ja/engineering/practice/mcp-tool-contract-design/',
          },
        ],
      },
      {
        title: 'エージェントに境界を与える',
        description:
          'エージェントの難しさは「自律させること」ではなく、ログ、承認、停止条件、リプレイ、つまり制御できるかどうかにあります。',
        links: [
          {
            label: 'Agent Harness：ログ・承認・リプレイ',
            href: '/ja/engineering/ai-developer-core/agent-harness-logging-approval-replay/',
          },
          {
            label: 'Google Advent of Agents',
            href: '/ja/academy/google-advent-of-agents/00-overview/google-advent-of-agents-overview/',
          },
        ],
      },
      {
        title: 'Radar で変化を追う',
        description:
          '日報の見出しを毎日 5 分眺め、週報を週 1 回読みます。深く読むのは手元のプロジェクトに関係する項目だけで十分です。',
        links: [
          {
            label: 'AI Radar',
            href: '/ja/radar/',
          },
          {
            label: 'Radar 画像ウォール',
            href: '/ja/radar/gallery/',
          },
        ],
      },
    ],
    glossaryTitle: 'エンジニア視点の用語集',
    glossary: [
      {
        term: 'コンテキスト',
        description:
          'その 1 回の呼び出しでモデルが見る情報のすべて。システム指示、会話、ファイル、検索結果、ツールの戻り値。',
      },
      {
        term: 'Context Engineering',
        description: '各ステップでモデルに何を、どれだけ、どの順番で見せるかを設計する実践。',
      },
      {
        term: 'Token',
        description:
          'モデルがテキストを分割して扱う単位です。文脈の使用量や課金に関係しますが、遅延と総費用はモデル、キャッシュ、ツール呼び出しにも左右されます。',
      },
      {
        term: '構造化出力',
        description: 'JSON Schema などの制約で、プログラムが検証できる形の結果を返させること。',
      },
      {
        term: 'Tool Use / Function Calling',
        description:
          'モデルが回答の途中で定義済みの関数や API の呼び出しを要求し、実行はあなたのコードが行う仕組み。',
      },
      {
        term: 'RAG',
        description:
          '関連資料を検索してから、その資料に基づいて回答させる方法。非公開情報や最新情報を取り込む。',
      },
      {
        term: 'MCP',
        description:
          'AI クライアントと外部ツール・データをつなぐオープンプロトコル。一度書いたツールを複数のクライアントで再利用できる。',
      },
      {
        term: 'Skill',
        description:
          '指示、スクリプト、リソースを再利用可能なワークフロー単位にまとめ、必要なときにコンテキストへ読み込むもの。',
      },
      {
        term: 'エージェント',
        description:
          '目標と境界の中で「計画 → ツール呼び出し → 結果の観察」を繰り返すシステム。一問一答ではない。',
      },
      {
        term: 'Agent Harness',
        description: 'エージェントを包む実行基盤。ログ、承認、停止条件、リプレイ、権限制御を担う。',
      },
      {
        term: 'Eval（評価）',
        description:
          '固定サンプルと採点ルールで AI 機能の品質を測ること。プロンプト変更やモデル切り替えの安全網。',
      },
      {
        term: '回帰ゲート',
        description:
          '評価セットを CI に組み込み、スコアが閾値を下回ったらリリースを止める仕組み。単体テストと同じ発想。',
      },
      {
        term: 'LLM-as-a-judge',
        description:
          'モデルに別のモデルの出力を採点させる方法。採点役も人手のラベル付きサンプルで校正が必要。',
      },
      {
        term: 'ハルシネーション',
        description:
          'もっともらしくても、誤っていたり根拠がなかったりする出力です。参考資料があっても起こり得ます。',
      },
      {
        term: 'Guardrails',
        description:
          '入力と出力の両側で行うチェックと遮断。機密情報のフィルタ、形式検証、権限外操作のブロックなど。',
      },
      {
        term: 'Prompt Injection',
        description:
          '信頼できない入力中の指示でモデルの動作を変える攻撃です。ユーザー入力だけでなく、Web ページ、文書、ツールの戻り値にも潜みます。',
      },
      {
        term: 'Prompt Caching',
        description:
          '提供元の条件を満たす場合に計算の一部を再利用し、繰り返す文脈の費用や遅延を減らします。ヒット条件と書き込み料金は別途確認します。',
      },
      {
        term: 'Trace',
        description:
          '1 リクエスト内のモデル呼び出し、ツール呼び出し、入出力、所要時間を記録した呼び出しチェーン。デバッグと評価に使う。',
      },
      {
        term: '推論モデル',
        description:
          '最終回答の前に追加の推論計算を使うモデルやモードです。複雑なタスクに役立つ場合がありますが、品質・遅延・費用は実測します。',
      },
      {
        term: 'Computer Use',
        description:
          'スクリーンショット、アクセシビリティツリー、ブラウザ自動化を通じて、モデルに GUI を操作させること。',
      },
      {
        term: 'オープンウェイトモデル',
        description:
          '重みをダウンロードして自前で運用できるモデル。データ所在地、プライベート運用、ファインチューニングの要件に向く。',
      },
      {
        term: 'ファインチューニング',
        description:
          '自社データでモデルを追加学習すること。通常はプロンプト、検索、評価をやり尽くした後に検討する。',
      },
    ],
    layersEyebrow: 'Capability Layers',
    layersTitle: 'AI アプリの 6 つの能力レイヤー',
    layersDescription:
      '以下の 6 つは、このサイトの学習用の地図です。業界標準でも、順に積み上げる必須の構成でもありません。MCP、Skills、A2A、エージェントは必要な場合に採用し、評価・安全・権限・コスト管理は最初の実験から全体に適用します。',
    layers: [
      {
        level: 'L1',
        name: 'モデル呼び出し（Model API）',
        description:
          'モデルサービスを呼ぶ際は、タイムアウト、レート制限、回数を限定したリトライ、フォールバック、使用量の記録が必要です。会話の状態保存や課金方法は API と利用経路によって異なります。',
      },
      {
        level: 'L2',
        name: 'コンテキスト（Prompt & Context）',
        description:
          'システム指示、例示、ファイル、検索結果がモデルに見える情報になります。RAG とコンテキスト設計で資料を選べますが、検索しただけでは回答を検証したことにはなりません。',
      },
      {
        level: 'L3',
        name: '構造化出力とツール（Structured Output & Tools）',
        description:
          '検証可能なデータを返させ、あなたの関数の呼び出しを要求させる層。「話す」から「実行する」への境界で、核心は入力・出力・エラー・権限の契約設計です。',
      },
      {
        level: 'L4',
        name: 'プロトコルと再利用（MCP / Skills / A2A）',
        description:
          'MCP はツールとデータ、Skills は再利用可能な指示と任意のスクリプト、A2A はエージェント間通信を扱います。必要なものを選び、クライアントの対応機能・認証・権限を確認します。すべてを使う必要はありません。',
      },
      {
        level: 'L5',
        name: 'エージェントループ（Agent Loop & Harness）',
        description:
          '目標と境界の中で、計画・ツール呼び出し・観察を繰り返します。Coding agent はこの層です。本当の工数は harness、つまりログ、承認、停止条件、リプレイにあります。',
      },
      {
        level: 'L6',
        name: '評価とガバナンス（Evals & Governance）',
        description:
          '評価セット、回帰ゲート、trace、権限、コスト予算。AI 機能を本番に出せるか、問題が起きたときに原因を特定できるかを決めます。テックリードの主戦場です。',
      },
    ],
    safetyEyebrow: 'Safety Baselines',
    safetyTitle: 'AI システムを作るときの 6 つの安全ライン',
    safetyDescription:
      '過大な権限、データ漏えい、誤った実行、無制限のループにはシステム側の対策が必要です。以下を最初の実験から取り入れ、実際のリスクに応じてテストを追加しましょう。',
    safetyItems: [
      {
        title: 'Prompt Injection：モデルが読む内容を信用しない',
        description:
          'Web ページ、文書、メール、チケット、検索結果のどこにでも指示は潜み得ます。原則は、モデルの出力で権限の高い操作を直接動かさないこと。ツール呼び出しの引数は、モデルが「理解した」と信じるのではなく、あなたのコードで再検証します。',
      },
      {
        title: '認証情報と最小権限',
        description:
          'エージェントに個人の認証情報を使わせないこと。独立した ID、短期トークン、タスクに必要なだけの権限を与え、ツールへのアクセスはゲートウェイやプロキシ層で集中的に認可・監査します。サービスアカウントの管理と同じ考え方です。',
      },
      {
        title: 'データの境界',
        description:
          'まずデータを分類し、各分類がどのモデル経路を通れるかを決めます。コンシューマー向け製品、エンタープライズ版、クラウド基盤上のモデルでは、データ利用条件も保存リージョンも異なります。trace やログにもユーザーデータが含まれることを忘れずに。',
      },
      {
        title: 'サプライチェーン：指示・コード・権限を確認',
        description:
          'Skill は指示だけの場合も、スクリプトを含む場合もあります。MCP server はローカルでもリモートでも動きます。出所、実行環境、実際の権限、更新内容をそれぞれ確認します。',
      },
      {
        title: '不可逆な操作には人の確認を',
        description:
          'データ削除、支払い、外部への送信、本番デプロイ。こうした操作はデフォルトで人の承認を必須とし、dry-run とリプレイ可能な記録を用意します。エージェントが強力になるほど、この線は外せません。',
      },
      {
        title: 'コストと暴走ループ',
        description:
          'エージェントはリトライし、ループし、長い文書を何度もコンテキストに詰め込みます。タスクごとに最大ステップ数、タイムアウト、予算上限を設け、異常な呼び出し量にはアラートを。外部依存にサーキットブレーカーを置くのと同じです。',
      },
    ],
    pitfallsEyebrow: 'Common Pitfalls',
    pitfallsTitle: 'AI を使うときに陥りやすい 8 つの誤解',
    pitfallsDescription:
      '確率的な出力を確定した事実として扱ったり、従来の確認を省いたりすると問題につながります。以下の例で自分のワークフローを点検しましょう。',
    pitfalls: [
      {
        title: 'デモが動いても、本番に出せるとは限らない',
        description:
          'デモで分かるのは、一部の例が動いたことです。本番前には境界入力、失敗時の対応、評価、費用、権限も確認します。必要な工数は用途とリスクによって異なります。',
      },
      {
        title: 'アサーションの発想で AI をテストする',
        description:
          '形式、フィールド、分類ラベル、決定的なツール契約はアサーションで確認できます。自由回答は文字列の完全一致だけで判定せず、評価基準と人の校正を使い、反復時のばらつきも見ます。',
      },
      {
        title: 'プロンプトをコードに直書きし、版管理しない',
        description:
          'プロンプトは振る舞いに最も影響する「設定」なのに、コードのあちこちで気軽に書き換えられがちです。バージョン管理し、変更のたびに評価セットを回す。DB マイグレーションと同じ慎重さで扱いましょう。',
      },
      {
        title: '何でもコンテキストに詰め込む',
        description:
          '無関係・矛盾する資料は回答を妨げ、長い入力は費用や遅延を増やす場合があります。全文、検索、要約をタスクごとに比べ、情報の欠落も確認します。短ければよいとも限りません。',
      },
      {
        title: 'エージェントに自分のアカウントで作業させる',
        description:
          '手軽さから個人トークンや管理者権限を渡すのは、Web の内容に影響され得るプログラムを本番環境に置くのと同じです。独立した ID と最小権限は初日から。',
      },
      {
        title: '単価だけを見て、タスク全体のコストを計算しない',
        description:
          'タスク費用は、各呼び出しの入力・出力・キャッシュ使用量に各単価を掛け、ツールと実行環境の費用を加えて集計します。リトライやループも含め、成功率と人の確認時間も比較します。',
      },
      {
        title: '新しいモデルが出るたびに乗り換える',
        description:
          '評価セットがないまま乗り換えても、良し悪しは感覚でしか判断できません。代表的なサンプルを 20〜50 件用意し、それで新モデルを比較すれば、乗り換えは賭けではなく測定可能なアップグレードになります。',
      },
      {
        title: '流暢さを正しさと取り違える',
        description:
          'AI の回答が流暢であるほど、人は警戒を解きがちです。数字、引用、リンク、人名、法令など確認できる事実は、必ず元の資料に戻って確かめましょう。自分の名前で外に出す内容は、常に「AI が下書き、自分が確認、それから送る」の順で。',
      },
    ],
    landscapeEyebrow: 'Choosing Models',
    landscapeTitle: '型番を覚えなくても、モデルは選べる',
    landscapeDescription:
      'ここでは繰り返し使える選定の手順を扱います。機能・料金・利用経路は変わるため、選択時は公式資料と自分のテストで確認します。最近の動向は月報で振り返れます。',
    landscapeRules: [
      {
        title: 'まず階層、次にベンダー',
        hint: 'フラッグシップ / バランス / 軽量',
        description:
          '品質・速度・予算で候補を絞り、軽量な方法で基準を作ります。実測した効果に見合う場合に推論量やモデル能力を上げます。階層の名称は統一規格ではありません。',
      },
      {
        title: '自分の評価セットで判断する',
        hint: '実データ 20〜50 件',
        description:
          'まず代表例 20〜50 件で候補を比較し、初期の診断に使います。調整に使わないテストセットも残し、失敗例や境界例を追加します。少数の例で合格しても、本番の信頼性を保証するものではありません。',
      },
      {
        title: '単価ではなくタスクのコストを計算する',
        hint: 'タスク全体の費用と遅延',
        description:
          '安いモデルでも、リトライや長いプロンプト、多くのエージェントターンが必要なら総コストは高くなり得ます。レイテンシも見ましょう。対話型の用途は最初の token までの時間に敏感です。',
      },
      {
        title: 'API か、オープンウェイトか',
        hint: 'データ所在地 / プライベート運用',
        description:
          'ホスト型 API は試作に便利です。オープンウェイトはオフライン、データの保管要件、カスタマイズ、大規模推論にも候補になります。ライセンス、ハードウェア、運用、安全、実際の使用量を比較して選びます。',
      },
      {
        title: 'エンタープライズでは提供経路を見る',
        hint: 'クラウド基盤上のモデル',
        description:
          '同じモデルでも、公式 API、Azure、AWS、Google Cloud など提供経路によって、データ条件、利用可能リージョン、クォータ、課金方式が異なることがあります。企業導入では、モデルより先に経路を選ぶことも多い。',
      },
      {
        title: '差し替え可能性を残す',
        hint: '呼び出し層を抽象化',
        description:
          '呼び出し層を分離し、モデル名とパラメータを設定に出すと移行を楽にできます。ただし、ツール呼び出し、Schema 対応、エラーの意味などの差異には対応し、再評価が必要です。',
      },
    ],
    landscapeLatestLabel: '直近の月次レビュー',
    landscapeLatestCta: '最新の Radar 月報を読む',
    landscapeNote:
      'MCP と Skills は再利用を助けますが、任意のクライアントでそのまま動く保証はありません。対応バージョン・機能・実行環境・認証・権限を確認し、モデルと利用経路の機能は公式資料で確かめましょう。',
    firstDayEyebrow: 'First Hour',
    firstDayTitle: '最初の 1 時間から始める 6 つの実験',
    firstDayDescription:
      'まず全員向けの 3 つを行い、開発者は必要に応じて残りへ進みます。各 10 分ほどから始め、環境設定や API の準備は別に時間を取りましょう。一度に終える必要はありません。承認済みのツールと公開・匿名化資料を使い、API には先に使用量上限を設けます。',
    firstDaySteps: [
      {
        who: '全員',
        title: '実際のタスクで 1 回聞き、さらに 2 回深掘りする',
        description:
          '今日もともとやるべきことを 1 つ選びます。切り出しにくいメール、整理すべき議事録、読むべき英語の資料。「目的 / 背景 / 制約 / 出力形式」を明確にしてから聞き、少なくとも 2 回は追加で質問して、最初の案と 3 回目の案の差を感じてください。',
      },
      {
        who: '全員',
        title: 'よく知っている資料をアップロードし、1 項目ずつ照合する',
        description:
          'アップロード可能な公開・匿名化資料を選び、要点と原文の該当箇所を示させて照合します。資料に答えのない質問も加え、不明と答えるかを確認しましょう。',
      },
      {
        who: '全員',
        title: '自分やチームのレッドラインを 3 つ書く',
        description:
          'どのデータを AI に送ってはいけないか。どの仕事を AI に直接完結させてはいけないか。どの結果は人の確認なしに外へ出してはいけないか。まず 3 つで十分です。これが以降のすべての安全な習慣の出発点になります。',
      },
      {
        who: '開発者',
        title: 'coding agent にリポジトリを読ませ、変更させる',
        description:
          'よく知っているプロジェクトで、まずはアーキテクチャの説明や、ある機能の入口とテストの場所を探させるだけにします。次に小さなタスク（テスト追加、lint 修正、小さなバグ修正）を任せ、diff を重点的にレビューします。変えるべきでない箇所を変えていないか、テストを実行したか。',
      },
      {
        who: '開発者',
        title: 'API で構造化出力を 1 回受け取る',
        description:
          '構造化出力対応の API で架空の記録を 1 件抽出し、Schema と値を確認します。空入力、無関係な入力、出力の打ち切りも試し、拒否や検証失敗を別の分岐で扱います。無制限にリトライしません。',
      },
      {
        who: '開発者',
        title: '評価ケースを 10 件書き、コストを把握する',
        description:
          '「入力 + 期待する振る舞い」を数件から 10 件へ増やし、情報不足や境界例も含めます。プロンプト変更後に再実行し、使用量・単価・ツール費用・遅延を記録します。これは初期診断であり、本番品質の証明ではありません。',
      },
    ],
    planEyebrow: '30 / 60 / 90 Days',
    planTitle: '90 日の転換リズム',
    planDescription:
      '目標は 90 日で専門家になることではなく、90 日以内に AI を具体的な 1 つの仕事に本当に組み込み、その後も追い続けられる習慣を作ることです。各段階には、全員に共通する成果と、開発者が追加で取り組む成果の 2 種類を書いています。',
    planPhases: [
      {
        phase: 'Week 1',
        name: '習慣：毎日 AI で本物の仕事を 1 つ',
        description:
          '全員：毎日少なくとも 1 つの実際の仕事を AI に任せ、「最初の 1 時間」の前半 3 つの実験を終え、概念レイヤーのうち馴染みの薄い記事を読む。開発者：さらに coding agent を日々の開発に取り入れ、すべての変更をしっかりレビューする。',
      },
      {
        phase: 'Day 30',
        name: '蓄積：最初の再利用可能な成果',
        description:
          '全員：よく使うワークフローを 2〜3 個、Project や Skill、カスタムアシスタントにまとめ、人が確認すべき出力を書き出す。開発者：最初の社内向け AI 機能を届ける。構造化出力、リトライとフォールバック、20 件以上の評価ケースを備え、1 回あたりのコストを把握する。',
      },
      {
        phase: 'Day 60',
        name: '拡張：資料とツールをつなぐ',
        description:
          '全員：チームの文書やデータに基づいて AI を働かせ、ツールを呼び出したりブラウザを操作したりするエージェント型の製品を試し始める。開発者：必要に応じて検索とツール呼び出しをつなぎ、リクエストに trace を付け、プロンプトをバージョン管理し、評価セットを CI に組み込む。',
      },
      {
        phase: 'Day 90',
        name: '波及：個人からチームへ',
        description:
          '全員：チーム向けの AI 利用規程を 1 枚にまとめ（ツール、データ、人の確認が必須な事項）、社内で一度共有する。開発者：エージェントを作るなら、まず ID、権限、承認、停止条件、リプレイを設計する。ここまで来れば、この道をチームの他の人と一緒に歩けます。',
      },
    ],
    faqEyebrow: 'FAQ',
    faqTitle: 'よく聞かれる質問',
    faqDescription:
      '今の疑問に関係する項目だけ読めば十分です。より詳しい回答は FAQ 全文にあります。',
    faqItems: [
      {
        question: 'コードを書かなくても、このルートは役に立つ？',
        answer:
          '役に立ちます。「AI を日々の仕事に取り入れる」ルートを選び、「最初の 1 時間」のうち「全員」と書かれた 3 つの実験を行い、90 日のリズムの「全員」の部分に沿って進めてください。能力レイヤー、モデルの選び方、安全の各パートはコードを書かなくても理解でき、早めに判断軸を持つほど役立ちます。',
      },
      {
        question: '機械学習やディープラーニングを先に学ぶべき？',
        answer:
          'AI アプリを作るなら、先に学ぶ必要はありません。最初の 90 日の重点は、呼び出し、コンテキスト、評価、エンジニアリングガバナンスです。ファインチューニング、推論コストの最適化、論文の読解が必要になったら、「基礎」カテゴリで該当部分を補えば十分です。',
      },
      {
        question: 'Python と TypeScript、どちら？',
        answer:
          'チームの既存スタックを使ってください。Python はデータ処理、評価、学習のエコシステムが充実し、TypeScript は Web プロダクトへの組み込みに向きます。主要なモデル SDK は両方にあり、言語はボトルネックになりません。',
      },
      {
        question: 'どの coding agent を選ぶべき？',
        answer:
          'まずデータ、権限、環境、予算の条件を確認し、同じリポジトリのタスクで完了率、変更範囲、テスト、総所要時間を比較します。タスクの分割と人のレビューも結果に影響します。',
      },
      {
        question: '最初のプロジェクトは何がいい？',
        answer:
          '社内向けで、リスクが低く、既存データがあり、結果を測定できるもの。チケット分類、社内文書 Q&A、PR や会議の要約、ログの分類など。最初から顧客向けや不可逆な操作を伴うものは避けましょう。',
      },
      {
        question: '社内データをモデルに送ってもいい？',
        answer:
          '経路と契約次第です。まずデータを分類し、各経路（コンシューマー製品、エンタープライズ版、クラウド基盤）のデータ利用条件と保存リージョンを確認します。不確かなデータは送らず、法務やセキュリティ部門に早めに関わってもらいましょう。',
      },
      {
        question: 'モデルの更新が速すぎて、学んだことがすぐ古くならない？',
        answer:
          '型番と価格は古くなりますが、エンジニアリングの力は古くなりません。コンテキストの設計、評価の作り方、ツール契約の定義、権限とコストの管理は、どの世代のモデルでも通用します。このサイトの入門コンテンツが意図的に具体的な型番を書かないのも、そのためです。',
      },
    ],
    readMoreLabel: '完全ガイドを読む →',
    nextTitle: '次はどこへ',
    nextDescription: 'ルートを決めたら、必要に応じてより深いカテゴリへ進みましょう。',
    nextLinks: [
      {
        label: '毎日の AI Radar',
        href: '/ja/radar/',
      },
      {
        label: 'エンジニアリング実践',
        href: '/ja/engineering/',
      },
      {
        label: '公式講座ガイド',
        href: '/ja/academy/',
      },
      {
        label: '基礎',
        href: '/ja/foundations/',
      },
    ],
    referencesTitle: '参考資料',
    references: [
      {
        label: 'MCP · Architecture',
        href: 'https://modelcontextprotocol.io/docs/learn/architecture',
      },
      {
        label: 'Agent Skills · Overview',
        href: 'https://agentskills.io/home',
      },
    ],
  },
} as const;
