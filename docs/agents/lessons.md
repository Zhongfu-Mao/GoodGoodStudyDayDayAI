# 雷达历史案例

仅供定位既有失败模式，按需读取。下列日期、模型表现和具体条目是当时的记录，不代表当前能力或本期候选。现行约束以 [雷达工作流](radar.md) 和 [信息图规则](radar-infographics.md) 为准。

## 2026-06-02 Lessons

The 2026-06-02 daily report exposed two imagegen failure modes:

- A visually polished map can still be a bad infographic if it only shows
  section names and decorative icons.
- After text changes, especially source replacement, imagegen assets must be
  regenerated or explicitly rechecked against the final Markdown.

For 2026-06-02, the correct imagegen standard was reached only after the prompt
explicitly listed required facts such as `Every enterprise AI implementation`,
`OpenAI Michigan Stargate`, `Cosmos 3`, `MiniMax M3`, `TradingAgents`,
`Inherent Labs`, and `Higgsfield + Claude`.

## 2026-06-03 Lessons

The 2026-06-03 daily report exposed two additional review traps:

- Do not transfer NotebookLM-specific expectations onto imagegen or vice versa.
  A NotebookLM watermark is expected and is not a rejection reason for
  NotebookLM output. An imagegen candidate must still have no watermark,
  signature, fake NotebookLM mark, or logo mark.
- Section balance must be reflected visually. If the final Markdown has only
  two GitHub trend items, the imagegen brief must not ask the GitHub quadrant
  to dominate the layout. Reclassified GitHub-origin items such as RAG courses
  or scraping frameworks should appear under practical tools when the Markdown
  does so.

For 2026-06-03, the acceptable imagegen direction was reached only after the
brief explicitly listed concrete facts for each section: `GitHub agent-native
platform`, `Surya OCR 2`, `Claude Mythos`, `Sim`, `production-agentic-rag-course`,
`Scrapling`, `Travelers voice claims assistant`, `headroom`, `ECC`, and the
three Newsletter items.

## 2026-08-30 委派实测

2026-08-30 实测中，旧 Flash 封装两次空输出；Spark 候选出现历史重复、错误日期和无依据引文。因此模型列表存在/小样本成功只证明可调用，不证明整批采编可靠。选题、日期、原文证据和历史去重由主审收口；机械检查用脚本。不要为凑栏目采纳错误候选。
