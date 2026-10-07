---
name: ai-radar-low-token
description: Produce, resume, review or publish GoodGoodStudyDayDayAI bilingual radar using cached evidence, bounded delegation and script-owned waiting.
---

# 雷达任务入口

本 skill 属于 GoodGoodStudyDayDayAI。先解析本文件的真实路径（全局安装可能是符号链接），本文件所在真实目录的上两级为仓库根目录；以下相对链接按该真实目录解析，命令从仓库根目录执行。

1. 读取 [通用约束](../../AGENTS.md) 和 [雷达工作流](../../docs/agents/radar.md)。已读且未变化的部分不重复加载。模型路由只维护在工作流 §3.1，来源与门槛读取它指向的配置。
2. 按用户指定日期、范围和当前记录判断阶段：采编、生成中、等待超时、待验收或待发布。续跑先查原 notebook/artifact ID；暂停不会被新的自动化触发解除，旧缺口不阻断已授权当日日报。
3. 采编读取工作流 §3.3–3.6，保留邮件覆盖、时间窗口和持续追踪规则；生成前冻结正文。信息图另读 [共用事实清单与验收](../../docs/agents/radar-infographics.md)，两种后端复用 `--brief-only` 输出。
4. 发布执行工作流 §3.9–3.11；预览保持 draft。模型退出码、文件生成或 push 本身不等于内容验收和线上成功。

生成、等待、缓存、委派、检查与清理的命令和边界以工作流为准。排查既有失败模式时才读 [历史案例](../../docs/agents/lessons.md)。
