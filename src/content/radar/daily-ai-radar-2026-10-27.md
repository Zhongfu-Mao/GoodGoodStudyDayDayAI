---
title: "AI 雷达日报：2026-10-27"
date: 2026-10-27
category: radar
cadence: daily
radarFormat: 2
lang: zh
coverImage: /images/radar/daily-ai-radar-2026-10-27-infographic-imagegen-20261030.webp
audioUrl: /__radar-preview/audio/daily-ai-radar-2026-10-27.mp3
audioDuration: 708
audioSize: 5666879
audioNotice: 待核试听候选，内容验收尚未完成。
draft: true
tags: []
plainSummary: "模型复现、企业权限、真实界面与研究证据，需要不同的检查方法。科学主张公开后仍需检验，使用数据和商业数字也必须看清分母。"
---

*图注：三项科学内容均为发布方主张，仍需理解与独立检验。Salesforce 为职责分工示意，不代表固定执行顺序；Signals 样本来自个人 ChatGPT 订阅，不含企业和 Codex。*

今天的共同问题是：怎样知道一个结果可信？确定性推理要求控制实际计算，企业 Agent 要把规则与推理分开，界面审查要真正运行页面；科学成果和经济数据也需要保留各自的验证条件。

## 三条关键变化

- [Temperature 0 只去掉采样随机性，批次仍会影响输出。](#radar-temperature-zero)
- [Salesforce 把规则、身份、上下文从一个大提示词里拆出来。](#radar-salesforce-harness)
- [OpenAI 三项科学主张采用不同公开与审查路径，不能直接写成学界定论。](#radar-science-community-verification)


## 能力与证据

### Terra 跟进：一次绘图任务的费用与等待时间

<a id="radar-terra-visual-computer"></a>

- 来源：Simon Willison / OpenAI
- 来源渠道：博客、官方
- 证据性质：作者实测
- 原始日期：2026-10-27
- 时间说明：Simon 记录的完整时间为 27 日 08:53（日本时间）；官方发布已列入 26 日日报。
- 链接：https://simonwillison.net/2026/Oct/26/gpt-61-terra/
- 摘要：Simon 用同一个“骑自行车的鹈鹕”SVG 题目试 GPT-6.1 Terra 的不同推理档，并保留输出、用量和耗时。max 档的一个样本花约 11.3 美分、用时 4 分 11 秒。这是可查看的单次绘图记录，不是对官方专业电脑任务榜单的独立复现。

背景是[26 日官方公布的能力与定价](/radar/daily-ai-radar-2026-10-26/#radar-terra-visual-computer)：标准 API 每百万输入 Token 1 美元、缓存输入 0.05 美元、输出 5 美元。较低单价和较少 Token 消耗可能叠加，但也可能被额外推理、重试、工具等待和人工复核抵消。Simon 的样本让这些成本落到具体任务上，不能据一次绘图就推算所有工作的费用或完成率。

实用的比较方法是固定同一个任务和验收标准，同时记录成功所需的总费用、耗时、重试与返工，再决定是否提高推理档。视觉更好也不等于自动获得行动授权，工具和权限仍由执行系统提供。

### 三项科学主张：形式化材料公开之后，还需要解释与独立检验

<a id="radar-science-community-verification"></a>

- 来源：The Rundown AI / OpenAI
- 来源渠道：Newsletter、官方
- 证据性质：官方宣称
- 原始日期：2026-10-26
- 链接：https://openai.com/index/building-scientific-understanding-with-academic-communities/
- 摘要：OpenAI 声称证明所有维度的局部光滑猜想（并推及 Kakeya 与限制猜想）、推翻指数时间假设（ETH），以及给出四维含规范场与费米子的相互作用量子场论存在性证明。公司把模型输出称为研究原始资料。数学材料直接公开；ETH 交外部团队解释并公开自然语言及 Lean 材料；物理材料暂由外部团队组织写作。

重要的是验证范围：ETH 主张不是 P=NP 结论；物理部分称涉及 Yang–Mills 的存在性，不能写成千禧年问题全部解决。本文未独立验证证明；公开形式化材料也不等于学界已形成共识。发布与专家协作机制本身，是本期值得追踪的新变化。

## 构建与运行

### Temperature 0 只去掉采样随机性，批次仍会影响输出

<a id="radar-temperature-zero"></a>

- 来源：Daily Dose of Data Science
- 来源渠道：Newsletter
- 证据性质：观点推演
- 原始日期：2026-10-26
- 链接：https://blog.dailydoseofds.com/p/why-temperature-0-isnt-deterministic
- 摘要：Temperature 0 通常每步选最大 logit，不再随机抽样；但最大值的计算仍可能随服务端执行形状改变。动态批次改变归约拆分和浮点加法顺序，两个接近的 Token 分数可能互换，一次分叉又会改变后续生成的全部前缀。

FP16 的简单例子能说明为什么“同样的数”也不够：在 1024 附近，可表示数之间相隔 1；先后把 0.4 加到 1024，两次都可能舍回 1024，先把两个 0.4 相加再加到 1024，却会舍入到 1025。问题不是把 GPU 线程一概说成随机，而是**同样请求进入不同批次时，计算分块可能不同**。

文中转述[Thinking Machines 于 2025 年 9 月 10 日发布的实验](https://thinkingmachines.ai/blog/defeating-nondeterminism-in-llm-inference/)：Qwen3-235B在non-thinking模式下，同一提示各生成1000 Token，运行 1000 次，产生 80 种结尾；开头 102 个 Token 一致，第 103 个近似平手后开始分叉。批次不变内核固定归约安排，使这组试验 1000 次一致。另一组 Qwen3-8B 的 1000 请求中，vLLM 从默认 26 秒变成初版确定性 55 秒，改进注意力内核后 42 秒。模型和负载不同，不能把这些时间当成统一性能税。

对可复现评测、故障重放及 RL 采样器与训练器概率的一致性，这比单设随机种子更关键。vLLM 的批次不变模式和 SGLang 的确定性模式是实现路径，但应在自己的模型、内核与负载上验证，而不是把一次实验的确定性外推成所有服务环境的保证。

<!-- radar-visual:temperature-zero -->
[![FP16中改变加法次序导致不同舍入结果的示意](/images/radar/daily-ai-radar-2026-10-27-temperature-zero.webp)](/images/radar/daily-ai-radar-2026-10-27-temperature-zero.webp)

*上行把0.4逐次加到1024，每步舍入；下行先合并小数再加，示例得到不同结果。它解释有限精度下加法不满足结合律，不表示所有输入或硬件都会出现同样的数值差。 图片来源：[Daily Dose of Data Science](https://blog.dailydoseofds.com/p/why-temperature-0-isnt-deterministic)。点击图片查看原尺寸。*
<!-- /radar-visual:temperature-zero -->

### Salesforce 把规则、身份、上下文从一个大提示词里拆出来

<a id="radar-salesforce-harness"></a>

- 来源：ByteByteGo / Salesforce engineering
- 来源渠道：Newsletter
- 证据性质：官方宣称
- 原始日期：2026-10-26
- 链接：https://blog.bytebytego.com/p/a-deep-dive-into-salesforces-agent
- 摘要：ByteByteGo 采访 Salesforce 团队后，整理 Agentforce 从“把所有规则写进提示词”转向分层系统的设计。模型仍做推理，但规则执行、客户身份统一、上下文整理和行动授权，分别由外部系统承担。

Agent Script 把确定性代码与需要推理的部分分开，编译成 Agent Graph 交运行时执行。例如问预约时，`before_reasoning`先运行预约查询，模型再读已准备的资料作答，`after_reasoning`做后续处理。这样不必每一轮都赌模型是否记得“先查预约”，但业务代码与路由本身仍需要测试，不能因此宣称系统不再出错。

| 原来塞在提示词里的工作 | 团队拆出的机制 | 具体边界 |
| --- | --- | --- |
| 同一客户在不同系统里是谁 | 映射到共同数据模型，用匹配规则形成统一档案 | 保留回链，不是改写所有原始记录 |
| 当前问题需要哪些资料 | 上下文引擎依次识别、计划、排序、治理、编译及记忆 | 相关不等于有权看，访问和脱敏仍要先处理 |
| Agent 能否执行动作 | 用户、Agent 自身权限和数据策略一起检查 | 任何一层拒绝都不能执行，不复制用户全部权限 |
| 成百上千工具如何进入上下文 | discover 找到候选、describe 取契约、dispatch 执行 | 按需加载定义，不把所有工具说明每次全塞入 |

演示中的保险查询由 124,000 降至 9,000 Token，是**同一个查询的团队示例**。后面比较的一边两问、一边三步，不能直接当作等长会话的统一节省率。另一个细节更重要：用户“可能搬去佛罗里达”先是记忆，直到完成登记才升级为批准的长期事实；用户的意向不应静默变成已经发生的状态。

团队提到早期超过八条指令开始被忽略，那是他们的观察，不是所有模型的硬上限。这里的价值在拆开不同责任，而不是新增一堆提示词或把业务规则全改成机械代码。

<!-- radar-visual:salesforce-harness -->
[![Salesforce智能体技术栈按数据、业务动作、执行及交互分层](/images/radar/daily-ai-radar-2026-10-27-salesforce-harness.webp)](/images/radar/daily-ai-radar-2026-10-27-salesforce-harness.webp)

*从下到上是统一数据、业务动作、智能体执行与用户交互入口；规则执行和身份权限属于执行层，不能只靠聊天提示词约束。图表达团队公布的组织结构，不是对所有连接已经稳定运行的独立认证。 图片来源：[ByteByteGo / Salesforce engineering](https://blog.bytebytego.com/p/a-deep-dive-into-salesforces-agent)。点击图片查看原尺寸。*
<!-- /radar-visual:salesforce-harness -->

### webframe：轻量执行网页，不等于已经得到安全沙箱

<a id="radar-webframe"></a>

- 来源：Simon Willison
- 来源渠道：博客
- 证据性质：作者实测
- 原始日期：2026-10-26
- 链接：https://simonwillison.net/2026/Oct/26/webframe-evaluation/
- 摘要：Jeff Lindsay 的 webframe 用 Go 和 glaze 调用宿主已有的 WebView：macOS 用 WKWebView、Linux 用 WebKitGTK、Windows 用 WebView2。输入 URL 或文件，在隐藏窗口执行网页，把 console.log 输出到标准输出、异常放到标准错误，因此不必另带完整浏览器引擎。

Simon 让 Claude Opus 5.5 跑探索原型、评估抓取与沙箱用途。页面摘要称速度可比 shot-scraper，但同时列出 CSP 失败、0×0 视口、加载挂起、缺 HTTP 元数据及浏览器控制不足。速度说法来自他的模型辅助研究记录。

这类轻量工具适合减少打包与启动负担；若要用于不可信网页执行，还要另外确认可用权限与隔离边界。主页面没有充分证明它可以替代安全沙箱，也不能因“不依赖 Playwright”便假定具备完整浏览器自动化接口。

## 产品与真实采用

### Greptile：审代码之外，还要把页面缩到真实用户的尺寸

<a id="radar-greptile-ui-review"></a>

- 来源：OpenAI / Greptile
- 来源渠道：官方
- 证据性质：官方宣称
- 原始日期：2026-10-26
- 链接：https://openai.com/index/greptile-code-review-codex-astra
- 摘要：Greptile 案例把 PR 审查从阅读代码推进到实际行为：为改动启动开发服务器，把浏览器缩到 iPhone 尺寸，再模拟用户走过流程，检查按钮是否在小屏消失。代码逻辑正确，不保证用户真的能操作到它。

另一条路径是上下文。Greptile 索引代码库并整理工作方式，通过 MCP 把知识库交给 Codex，让生成代码贴近既有模式。团队说会跟踪 AI 代码回滚次数，并认为上下文能减少返工；材料没有提供可复算的对照数据或统一下降百分比。

这与视觉检查相互补充：代码库上下文解释“应该怎样实现”，运行页面显示“这次是否真的实现”。二者都不能只看测试退出码，更不能因为模型看过一次屏幕就宣称所有状态、尺寸和权限都测完。

## 产业与治理

### Signals：用途变分散，不等于岗位被替代

<a id="radar-signals-work"></a>

- 来源：OpenAI
- 来源渠道：官方
- 证据性质：官方宣称
- 原始日期：2026-10-26
- 链接：https://openai.com/index/chatgpt-expanding-world-of-work
- 摘要：Signals 按 O*NET 框架把个人 ChatGPT 计划的工作消息映射到 165 类工作活动，覆盖近 100 国、2025 年第一季度至 2026 年第三季度。它不是企业全部 AI 采用数据，也不含企业消息或 Codex。

在每个季度都被观察的 74 国中，各国最常见十类活动占已分类工作消息的比例，平均从 56.0%降到 51.1%。**分母是被分类的工作消息**，不是从业者、工时或岗位数；这个变化说明用途分布更分散，不能直接换算为就业替代率。

把图表和美国就业结构比较时还要看覆盖：映射职业按就业加权后，约 43%的任务组合落在未单独报告的 Other IWAs，包括搬运、驾驶和部分记录维护。两幅分布不同，既可能反映使用差异，也受报告类别和样本门槛影响。数据经过自动分类、聚合、小样本抑制和统计噪声处理，适合研究趋势，不用于追踪个人。

### Anthropic 估值讨论：把已实现收入、服务毛利与算力承诺分开

<a id="radar-anthropic-compute-economics"></a>

- 来源：Every / The Leverage
- 来源渠道：Newsletter
- 证据性质：观点推演
- 原始日期：2026-10-26
- 链接：https://every.to/napkin-math/is-anthropic-worth-2-trillion
- 摘要：Evan Armstrong 用招股材料讨论一种期限错配：客户按使用付费、可能取消，算力与基础设施却要提前多年承诺。两万亿美元是文章讨论的传闻估值情境，不是已确认的上市价格。

文章最值得保留的不是惊人数字，而是口径。作者转述的 Q2 收入为 116 亿美元；Q3 约 168 亿美元则明确是媒体报道、招股书该季数字待审，并非两个季度都同等证据。约 900%的净收入留存率只计“合格客户”、排除 Pro/Max，不能直接与普通 SaaS 公司的口径排榜。

毛利也有两层：文中 85%按服务客户的成本计算，作者再把训练与基础设施计入，提出 45%的分析口径。后者是对持续研发成本的重分类视角，不是另一份被审计确认的标准毛利。模型更新快可能带来持续训练压力，但“六个月前模型收入较少”本身不证明每个模型都有固定六个月寿命。

反面证据也要看：公司称把提前期长的数据中心承诺与较晚确定的加速器承诺分开，需求曾持续超过供给。它们减轻了部分过早锁定风险，却没有消除需求、竞争和新模型表现的不确定性。阅读估值文章时，先问每个数是已经发生、按当前速度年化，还是未来合同义务，再讨论它说明了什么。

<!-- radar-visual:anthropic-compute-economics -->
[![作者汇总的对Anthropic贡献年收入至少十万美元的企业客户数量](/images/radar/daily-ai-radar-2026-10-27-anthropic-compute-economics.webp)](/images/radar/daily-ai-radar-2026-10-27-anthropic-compute-economics.webp)

*柱高是过去十二个月对Anthropic贡献至少10万美元收入的企业客户数，不是这些客户自身的营业收入。原文依据招股材料给出近似值，最后一柱截至2026年9月而非全年，不能按等间隔柱宽直接外推增长或估值。 图片来源：[The Leverage / Every](https://every.to/napkin-math/is-anthropic-worth-2-trillion)。点击图片查看原尺寸。*
<!-- /radar-visual:anthropic-compute-economics -->

## 延伸阅读

### Hallmark：把质量底线、设计偏好与打磨项分开

<a id="radar-hallmark-observation"></a>

- 主题：构建与运行
- 来源：GitHub / Nutlope
- 来源渠道：GitHub
- 证据性质：项目说明
- 原始日期：未确认
- 观察日期：2026-10-27
- 链接：https://github.com/Nutlope/hallmark
- 摘要：Hallmark 的项目 README 将这套面向编码 Agent 的设计 Skill 要求分成三层：对比度、焦点、减少动画、虚构事实、手机布局等底线不能放行；常见模板化设计可在有理由时例外；纯打磨项不应阻断交付。

它要求先读真实产品材料，先渲染并冷审首屏，再做全页、多宽度检查和独立上下文审阅；旧站重设计还要对照原来的链接、字段和处理逻辑，避免换皮时丢功能。值得借鉴的是区分问题的严重性，而非照抄四十八种主题或让检查清单替代读者体验。

*本期窗口为 10 月 26 日 12:00 至 27 日 12:00（日本时间）。科学成果是 26 日公开主张，具体发现更早；Hallmark 按此前观察列延伸。部分技术细节据后续更新的原文补充。*
