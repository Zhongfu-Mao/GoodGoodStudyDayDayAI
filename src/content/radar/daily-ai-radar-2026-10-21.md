---
title: "AI 雷达日报：2026-10-21"
date: 2026-10-21
category: radar
cadence: daily
radarFormat: 2
lang: zh
coverImage: /images/radar/daily-ai-radar-2026-10-21-infographic-imagegen-20261028.webp
audioUrl: /__radar-preview/audio/daily-ai-radar-2026-10-21.mp3
audioDuration: 1182
audioSize: 9460340
audioNotice: 本地剪辑试听版，原件保留；已做解码和转写辅助检查，未作原音听辨。
draft: true
tags: []
description: "从评估、任务续跑和共享智能体，到硬件与经营案例：理解系统怎样可靠地完成工作，以及成果在什么条件下成立。"
plainSummary: "阈值、重复成功率与业务目标分别检验不同错误。恢复执行要保留证据与幂等键；共享智能体还需要稳定连接和服务端权限。硬件与经营成果须拆开实际测量和未来估算。"
---

本期窗口为 2026-10-20 12:00 至 10-21 12:00（日本时间）。从判定模型的阈值、审批后的任务恢复，到共享智能体和算力交付，关注同一个问题：**怎样用可检查的证据，判断工作合用、完成且能够稳定重复。**


*图注：FairStress 交换身份并施加配对的说服话术。TorchTPU 对照为 Qwen-Image-2.1、v6e-4／TP4／bf16／batch1、1024×1024／40步；3.5秒为复用编译后的热调用。*
## 三条关键变化

- [自动评估先决定错报与漏报的代价，再调阈值；高 F1 不等于概率可信。](#radar-decision-model-evals)
- [审批后续跑必须恢复同一份证据和操作，重复审批还要由幂等机制挡住。](#radar-next-step-after)
- [共享智能体要同时重做多人线程、账号替换和权限校验，换一个模型不够。](#radar-replaced-personal-agents)


## 能力与证据

### 决策模型做评估：阈值、成本、概率校准是三道不同问题

<a id="radar-decision-model-evals"></a>

- 来源：Hamel Husain / Antaripa Saha
- 来源渠道：博客
- 证据性质：作者实测
- 原始日期：2026-10-20
- 链接：https://hamel.dev/blog/posts/decision-model-evals/
- 摘要：Hamel Husain 与 Antaripa Saha 用公寓租赁客服智能体的真实轨迹比较六种判定模型，任务是找出漏预约、漏转人工、与工具结果矛盾等实质失败。扣除两条内部 QA 样本后，性能评估有 98 条轨迹，其中 61 条已确认失败、37 条未标为失败。

阈值应由错误代价决定。作者用一组假设分数说明：失败样本都是 0.40、正常样本都是 0.10 时，默认 0.50 会漏掉全部失败，改成 0.30 则能区分。实际实验采用分层五折交叉验证，在训练部分选阈值，在未参与选择的部分验证。

在调阈值后的比较中，Perplexity 的 F1 为 0.79，每 100 次评估 API 成本 0.82 美分；OpenAI Decisions 为 0.87、3.72 美分，约为前者 4.5 倍。**性能的分母是 98 条轨迹，成本的分母是 100 次调用，单位为美分。**作者尝试要求 precision、recall 均至少 80%；但 Perplexity 的 100 个训练划分有 36 个无法满足、Liquid d1-ultra 有 29 个无法满足，报告均值保留了这些划分退回无约束 F1 的预测。这组均值因此并非全部满足双 80% 条件的成绩。

将分数解释为失败概率，还要做校准检验。Platt 校准改善了一些模型，也让 OpenAI 的 Brier 分数由 0.159 变成 0.164（越低越好）；直接对概率拟合的另一项探索得到 0.154，说明结果对拟合方法敏感。可操作的顺序是：按具体失败模式标注，保存模型分数，再分开检查阈值、概率和成本。复用分数调阈值不必再付一轮调用；换任务后仍要重新验证。

### FairStress：同一组强弱履历，换了身份后会更容易被游说吗？

<a id="radar-allenai-fairstress"></a>

- 来源：Hugging Face / Ai2
- 来源渠道：博客
- 证据性质：作者研究
- 原始日期：2026-10-20
- 链接：https://huggingface.co/blog/allenai/fairstress
- 摘要：只看模型最后选了谁，会漏掉“正确选择有多容易被推翻”。Ai2 的 FairStress 从 300 个双候选情境、29 个领域出发，交换姓名或明确身份标签，再加成对的说服前缀，例如声称高层已审过材料并支持另一候选。履历和支持理由成镜像，才能比较身份变化是否影响模型对相同证据的坚持程度。

情境、身份表达和挑战方式组合扩展出逾 1300 万测试例。在 15 个模型共同的 19 个领域里，隐含身份和显式标签条件下，“放弃正确选择”的群体平均差距分别为 6.9、9.3 个百分点。这两个数是**身份版本之间的撤回率之差**。在研究的身份编码与对称公平定义下，平均更容易被游说转向少数群体身份编码的候选；它描述的是模型对同等证据的反应，不是候选人的能力。

对评测设计的启发很具体：同时保存初始选择、匹配挑战后的选择和理由，按场景与身份条件分别统计。这里采用“对称平等”的定义；考虑历史不平等的其他公平观，可能会赋予背景不同的权重。

<!-- radar-visual:fairstress -->
[![FairStress比较15个模型在不同身份表达和压力条件下的平均差距](/images/radar/daily-ai-radar-2026-10-21-fairstress.webp)](/images/radar/daily-ai-radar-2026-10-21-fairstress.webp)

*横轴从无身份线索到姓名、隐含和显式身份；纵轴为作者定义的对称公平差距（百分点）。显式身份端的23.9对应同等资格候选受压力时的切换，9.3对应强弱资格场景中撤回较优候选，2.9对应无压力选择；三条线测不同问题，不能混为同一指标或族群能力差。 图片来源：[Ai2 / FairStress](https://huggingface.co/blog/allenai/fairstress)。点击图片查看原尺寸。*
<!-- /radar-visual:fairstress -->

## 构建与运行

### ALTK-Evolve：从运行轨迹提炼准则，还要测“多加多少”

<a id="radar-altk-evolve-bc"></a>

- 来源：Hugging Face / IBM Research
- 来源渠道：博客
- 证据性质：作者研究
- 原始日期：2026-10-20
- 链接：https://huggingface.co/blog/ibm-research/altk-evolve-bc
- 摘要：ALTK-Evolve 从训练任务的成功与失败轨迹提取行为准则，合并后追加到领域政策之后，**不更新模型权重**。准则具体到查订单前验证身份、修改或退换前展示结构化确认并取得同意、等待工具结果后再答复。support 表示多少个不同训练任务产生过该准则；sup3 是保留 support 至少为 3 的准则，不是只留三条。

主实验让 GPT-4.1 智能体在 τ²-bench 的模拟客户、工具和政策环境里完成任务，每任务跑四次。零售 40 个 held-out 任务（未参与准则提取的保留测试）上，无准则时平均成功率 78.1%、Pass^4 为 57.5%；保留全部 292 条准则后分别为 82.5%、67.5%。Pass^4 是四次全部成功的任务比例，不是四次中至少一次成功。

航空 20 个 held-out 任务揭示了更有用的取舍：无准则为 57.5% / 35%；14 条 sup3 准则为 60% / 45%；101 条全部准则为 65% / 40%。此次观察中，后者平均成绩更高，四次全成功占比却更低；在 20 个任务上，45% 与 40% 只差一个任务，尚不能断言少准则总更可靠。部署时要分别检查平均成绩与重复稳定性，并按失败代价选择剂量。

长准则也有费用：另一个完整 base split 的成本表里，零售每会话总 LLM 成本从 $0.084 到 $0.139，航空从 $0.081 到 $0.107。这张表包含智能体和客户模拟器，**不是上面 held-out 样本的同一条成本收益曲线**。新增费用主要来自更长输入；原文未报告缓存后的净成本结果。

<!-- radar-visual:altk-cost -->
[![ALTK-Evolve按零售和航空比较不同准则配置的每次对话成本](/images/radar/daily-ai-radar-2026-10-21-altk-cost.webp)](/images/radar/daily-ai-radar-2026-10-21-altk-cost.webp)

*左右面板分别是零售与航空，灰柱为不附加准则的基线；蓝柱的Lossless表示保留全部学习准则，成本随更长输入上升。这里是GPT-4.1、完整base split和四次试验的作者配置，不是生产成本保证，也不是压缩算法的“无损”。 图片来源：[IBM Research / ALTK-Evolve](https://huggingface.co/blog/ibm-research/altk-evolve-bc)。点击图片查看原尺寸。*
<!-- /radar-visual:altk-cost -->

### ADK 审批续跑：聊天记录不是未完成操作的恢复点

<a id="radar-next-step-after"></a>

- 来源：Daily Dose of Data Science
- 来源渠道：Newsletter、博客
- 证据性质：作者实测
- 原始日期：2026-10-20
- 链接：https://blog.dailydoseofds.com/p/the-next-step-after-karpathys-agentic
- 摘要：这篇教程的具体任务是：从五份产品政策文件检索四段证据，写一份有引用的客户答复，再等待人工批准发布。教程设想审批要等待数小时，原 Python 进程或容器可能已经消失；若把整个请求重跑，检索可能换一批证据，外部发布也可能重复。要恢复的是**同一次 invocation（持续执行的操作）、原证据、草稿、待确认请求及已完成副作用**，不能只把对话摘要喂给一个新智能体。

示例用 SQLite session store 保存状态，以模拟 outbox 记录发布。首次运行检索、起草，到发布工具请求确认时停下，记录 session、invocation 和 confirmation ID 后进程完全退出。另一个进程载入同一 session 继续工具调用，复用原证据和草稿。

恢复机制本身不等于只执行一次。教程明确把工具视为可能至少执行一次：它从答案与引用 ID 导出幂等键，发布前检查完成记录，重复审批返回 already_published；演示中检索和发布计数都仍为一。**本地 outbox 是模拟**；真正发邮件、支付或调用外部发布 API，还需要由数据库事务或接收方 API 对同一键去重，不能只在进程内记一个布尔值。

另一个测试是缺证据时如何停止：知识库没有 FedRAMP High 认证信息，检索返回不支持，系统既不写稿也不请求审批。这是作者 10 月 20 日的合作演示，由 Google Cloud 支持。

### TorchTPU：共同模型代码、eager 调试和专用内核各解决一层问题

<a id="radar-torchtpu"></a>

- 来源：Hugging Face / PyTorch TPU
- 来源渠道：博客、GitHub
- 证据性质：作者实测
- 原始日期：2026-10-20
- 链接：https://huggingface.co/blog/hf-torchtpu
- 摘要：TorchTPU 将 TPU 接为 PyTorch 设备，默认 eager 执行、可选 torch.compile，让 Transformers、Diffusers 尽量复用共同模型定义。它改善迁移时的执行与调试；模型兼容性仍要逐项测试。原先 PyTorch/XLA 的 lazy 执行和重新编译，常让工程师难以看清代码何时真正运行。

项目团队给出的 Qwen-Image-2.1 对照，在 TPU v6e-4、TP=4、bf16、batch1、1024×1024、40 steps 下，eager 为 8.0 秒，编译后为 3.5 秒。第一次调用负责构图和编译，同尺寸后续调用复用；文章没有给首编译耗时。因此它解释的是热路径收益，不是首次请求的总延迟。另一个 MoE 专用内核在 v6e-8、batch64 下相对 default grouped_mm 达到 21.5 倍，属于不同实验，不能合成“TPU 比 GPU 快 21.5 倍”。

同一模型定义与硬件专用 Pallas 内核可以共存：前者减少维护分叉，后者处理专家分组等硬件热点。团队报告实际跑到 TPU 的测试中 96.5% 通过，34 个问题中 19 个已修，nightly 仪表板仍在建设。测试范围和发布条件可查[当时文章版本](https://github.com/huggingface/blog/blob/cab0e22b682925b758308ea1f51456491f9fff34/hf-torchtpu.md)。

### MPS 2.15 RC：270→8 GiB 缩掉的是哪一种内存？

<a id="radar-mps-215"></a>

- 来源：Hugging Face / PyTorch
- 来源渠道：博客、GitHub
- 证据性质：作者实测
- 原始日期：2026-10-20
- 链接：https://huggingface.co/blog/mps-pytorch-2-15
- 摘要：Apple silicon 上的 MPS 改进有一个比倍率更重要的例子：Wan2.2 完整 28-tile VAE 解码进行 8,764 次 padding 时，把 MPSGraph padding 换成 Metal 路径，总驱动内存峰值从 270.135 GiB 降到 8.108 GiB；但分配器预留峰值两边都是 8.070 GiB，tensor allocation 峰值也只是 4.422→4.095 GiB。问题出在通用路径的隐藏驱动开销，**不是模型权重从 270 GiB 压缩成 8 GiB**。

相同思路也出现在推理热点：让 F.linear 的单 token decode 走适合矩阵—向量运算的 Metal 内核；MoE grouped matmul 在 GPU 上读取分组 offsets，省掉拷回 CPU 再循环的同步。多个局部优化不能相乘成端到端的统一提速。尤其是 FP8 让每值储存变成 BF16 的一半，不代表推理自动快两倍。

这是 **2.15 release candidate**，要求 Apple silicon、macOS 15+、Python 3.11+；文末关于 2.16 的展望不能当成 RC 已交付功能。内存表没有在旁给出测试机器型号和物理 RAM，也不能据驱动记账数推断任意小内存 Mac 都能跑完整模型。详见[固定发布版本](https://github.com/huggingface/blog/blob/87536b9e1a5161545811d1fb83509c3067047aaf/mps-pytorch-2-15.md)。

### Battle Drones：让游戏能回放，还要让反馈真的改变玩法

<a id="radar-battle-drones"></a>

- 来源：Simon Willison
- 来源渠道：博客、GitHub
- 证据性质：作者实测
- 原始日期：2026-10-20
- 链接：https://simonwillison.net/2026/Oct/20/battledrones/
- 摘要：这个手机 RTS 实验把 TypeScript 仿真与画面分离，以固定 tick 和指令队列驱动同一局游戏，结束后可导出 replay JSON。AI commander 只能得到己方可见世界，仍受战争迷雾约束；自动对局因此可以检查游戏规则、对局长度或平衡，而不是只数生成了多少代码。但模拟胜负只是玩法的代理指标，不证明人类觉得好玩。

一个具体规则是 Archipelago 地图：资源点在岛上，只有运兵机送去的步兵能占领，飞机和坦克不算；运输机损失后会补发。这样把原本容易被忽略的单位放进资源获取闭环，设计问题从“再造一种兵”变成“这个单位为什么值得用”。截止版 README 标明主要由 Claude 撰写；以下据项目文档，本刊未独立试玩。

截止版本的在线双人模式让两端各跑完整 lockstep 仿真，只经小型 WebSocket relay 交换命令，以 room code 配对；因此客户端可静态托管，但仍有中继服务责任。同版还保留声学联机并警告高频声可能令人不适。上述能力可查[截止前 README](https://github.com/simonw/battledrones/blob/39d6f587f98a82f5c0426e8bd476cef49fd19ef0/README.md)。


## 产品与真实采用

### Every 共享智能体：让账号可替换，让权限不能靠劝说放宽

<a id="radar-replaced-personal-agents"></a>

- 来源：Every
- 来源渠道：Newsletter、博客
- 证据性质：官方宣称
- 原始日期：2026-10-20
- 链接：https://every.to/source-code/why-we-replaced-personal-agents-with-one-for-the-whole-company
- 摘要：Every 从每人一台云端个人智能体，转向全公司共享的 Slack 智能体。原因不只是机器维护：产品团队发现最有用的往往是借用同事已经接好分析工具的智能体。共享以后，“只对一个人说话、只用此人账号、此人要求什么就能做”的三个假设全部失效。

线程层保留 Slack 为对话的正式记录，用翻译层把消息交给模型；如果模型侧上下文丢失，可以从原线程重建。最初智能体追问后会漏掉没再次 @ 它的答复，后来改为读取已加入线程里的每条消息，用小模型判断是对它说还是同事互聊；不相关请求还要隔开，避免答错线程或同一任务执行两遍。

连接层则把定时任务指向稳定的“插槽”，而不是某个员工的一次登录。登录过期或负责人离职时，替换插槽里的连接，任务不必全部重绑；替代连接仍须匹配目标 workspace 和访问规则。权限层把技能、任务所有权及同意校验放在服务端代码里，模型请求别人技能的修改也会被拒绝；同意不能只凭模型说“用户已同意”，还要对照用户在 Slack 的真实要求。

代码约束也会错：迁移时 24 项技能全变成私有，团队约一周后手动扩大其中九项的访问，并调整公开频道创建技能的默认值。权限迁移因此还要测试实际协作，主动发言的边界也仍待解决。

<!-- radar-visual:every-slots -->
[![Every连接槽示意图把排期任务、稳定槽位和可更换登录分开](/images/radar/daily-ai-radar-2026-10-21-every-slots.webp)](/images/radar/daily-ai-radar-2026-10-21-every-slots.webp)

*排期任务指向稳定连接槽，替换登录只有匹配同一工作区和访问规则时才能接入；右侧错误工作区被拒绝。图是原文简化的连接槽设计，登录可更换不等于权限可任意继承。 图片来源：[Every / connection-slot design](https://every.to/source-code/why-we-replaced-personal-agents-with-one-for-the-whole-company)。点击图片查看原尺寸。*
<!-- /radar-visual:every-slots -->

### Terminal X：把资深投资人的取舍理由变成可回归检查的规则

<a id="radar-terminal-x"></a>

- 来源：OpenAI / Terminal X
- 来源渠道：官方
- 证据性质：官方宣称
- 原始日期：2026-10-20
- 链接：https://openai.com/index/terminal-x
- 摘要：Terminal X 所说的 memory debt，是机构留下了文件，却没有留下资深人员为何取舍的理由。其工程师通过访谈把机构偏好、信用筛选与投委会流程变成版本化 Memory，再让 Eval Agent 按 54 项 pass/fail 标准检查输出；失败时附理由、修正或更好的来源，并回流为指令或测试用例。

案例中，一家收购基金要寻找低于净资产价值的私有化标的，模型却因市场转向改荐困境债或救援融资。金融推演看似合理，仍偏离该基金受托目标。审核因此要先对照基金获准的投资目标，再看近期交易和证据，不只是核数字有没有出处。

公司称在 500 项已评分判断中，GPT-6.1 Sol 版评估智能体与资深人工评审一致率 88.6%，次佳模型 86.4%，差 2.2 个百分点；衡量的是判断对齐，不是投资收益。文中“多发现约 25% 偏离授权建议”“每查询费用低约 30%”另有各自口径。供应商刊载的这个客户案例未充分披露抽样与置信区间，更值得复用的是把机构目标、失败理由和回归测试连成闭环。

### 三家餐厅的 AI 后台：已省的作业时间，与尚待实现的经营估算分开

<a id="radar-ted-taylor-restaurant"></a>

- 来源：OpenAI / Ted Taylor
- 来源渠道：官方
- 证据性质：官方宣称
- 原始日期：2026-10-20
- 链接：https://openai.com/index/ted-taylor-restaurant
- 摘要：经营三家餐厅的 Ted Taylor 在菜单定价时输入本地竞争、份量品质、店内与外卖现价，并说明哪些品类应多涨或少涨；首次仍手工做一遍对照，再以模型建议为起点。排班时输入员工技能、可用时段、薪酬和客流需求，由经理与自己原本会拟的排班方案比较，补上繁忙时段增员等漏掉的规则，再检查修改后的方案。

已报告成效包括月度现金对账：把三店现金交易与银行记录逐项匹配，从约 3 小时缩到 5–10 分钟；工资周期汇总另省约 4 小时。菜单重定价从约 5 天缩到 1–2 小时，但原文未披露每日工时。

排班可能使小时劳动力成本下降相当于销售额的 1–2 个百分点、每年增加 $5 万–10 万自由现金流，仍是店主预测，不是到账或审计结果。更可复用的是“提供经营数据和约束→模型提案→经理比较发现缺规则→补规则再核查”的工作流。

## 产业与治理

### SF Compute：GPU 小时交易，要把中断与恢复条件写进交付

<a id="radar-sfcompute2"></a>

- 来源：Latent.Space / SF Compute
- 来源渠道：Newsletter、播客
- 证据性质：观点推演
- 原始日期：2026-10-20
- 链接：https://www.latent.space/p/sfcompute2
- 摘要：SF Compute CEO Evan Conrad 用“卖酒店房间，最后不得不经营整间酒店”解释算力市场：买家拿到的不能只是一个价格指数，而必须是能运行的 GPU、存储、网络、软件配置与恢复条件。这叫物理交割。公司不自有硬件或自建数据中心，但描述了自己协调站点、机架、网络及 backplane 的运营工作；交易界面背后仍有整套云的责任。

具体差异是中断：批量推理可能提前一两分钟通知就能停，在线推理背后却有持续服务和 SLA，可能需要提前一至三个月收到中断通知，以便调整容量。若恢复检查点（checkpoint）存储慢、跨集群没有足够带宽，“可抢占”并不意味着可以低成本迁走。因此订单要匹配 GPU 代际、时间段、配置和中断条件，而不是把所有算力折成一个 FLOPs 数字。约束越多能容纳越多真实供给，也会把流动性分散到更多规格。

访谈把现有约束匹配、正在新增的 named query 和主权集群的预期公告分开。客户动态划分 InfiniBand fabric，则是受访者自述已发布的能力。

这与本期任务续跑有同一个工程问题：**“还原状态要花多少代价”会改变系统设计。** 稳定 invocation、连接插槽、checkpoint 和网络不是同一种技术，但都在把恢复所需的真实约束显式化。判断算力合约时，除了 GPU 单价，还要问中断后从哪里恢复、数据如何搬走、谁保证实际可用。

## 延伸阅读

### Shopify 原生迁移：AI 改变双端实现成本，验收要追到状态与事件

<a id="radar-shopify-native-agents"></a>

- 主题：构建与运行
- 来源：ByteByteGo / Shopify Engineering
- 来源渠道：Newsletter、官方
- 证据性质：官方宣称
- 原始日期：2026-10-20
- 链接：https://blog.bytebytego.com/p/why-shopify-migrated-from-react-native
- 摘要：10 月 20 日 ByteByteGo 的技术解读，回看的是 Shopify 9 月 10 日、9 月 21 日公开的迁移与 Helix 案例，并非当天刚完成迁移。此前 React Native 减少了 Swift/Kotlin 双份实现及跨平台协作负担；现在，编码智能体能借已有源码和运行中的 App，逐步翻译明确的状态、导航和错误路径，让团队重新权衡原生平台能力、依赖维护与实现成本。两份原生实现仍需维护，公司没有给可普遍外推的总成本下降比例。

Shop 项目先用一名工程师一周做 SwiftUI 概念验证；它不是生产版。之后六名核心工程师建立基础与主要旅程，功能团队加入补边角，从概念验证到上架约 12 周。成熟参照产品、屏幕简化和原生专家也参与了结果，AI 的独立贡献未被量化。9 月官方稿当时还把更大的、300 多屏商家主 App 写成迁移中，不能沿用二手文章的强表述说所有 App 都迁完。

更值得借鉴的是 **小切片验收**。Helix 从既有 App 和源码提议可审的小检查点，先骨架、导航，再扩展内容。行为检查通过与 App 相同状态和动作接口的 CLI 运行；视觉检查必须比较新旧 App 的同一业务状态，若状态不同，比较应判无效并重截；两个上下文隔离的审阅智能体再检查架构、代码与约束。默认最后由工程师看实际代码和运行结果收口；可选自动模式也不免除前三类检查。每轮修改因此都有具体反馈。

另一个迁移工作流把计划批准绑定内容哈希，计划改动便失效；Tardis 采集运行 App 的事件、日志、状态和命令，在具名检查点比较 analytics 事件名、数量、payload 及业务上下文。时间戳、页面 UUID 会自然变化，验收重点是事件关系与行为含义，不是强求所有字节相等。编译通过、画面看起来相近和用户流程相同，是三种不同证据。

官方 Shop 案例把冷启动定义为点击图标至首页初始内容可见：iOS 由 3200→2466 ms，Android 由 4433→2233 ms；Android 安装包由 293→184 MB，而 iOS 由 67→68 MB。这些是团队报告的迁移结果，未分离平台重实现与 AI 的贡献。可对照 [Shop 迁移](https://shopify.engineering/shop-app-migration)与 [Helix](https://shopify.engineering/helix)原文。

*修订说明（2026-10-27）：本期为历史补写。ALTK 细节据截止后更新的现存原文；Shopify 为 9 月案例的延伸阅读，工程细节据本次补读，历史改版未完全核对。*
