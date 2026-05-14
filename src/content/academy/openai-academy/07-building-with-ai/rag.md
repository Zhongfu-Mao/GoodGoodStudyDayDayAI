---
title: "OpenAI Academy：RAG 从知识库到可追溯回答"
date: 2026-04-25
category: academy
description: "把 RAG 当成知识产品来设计：语料准入、chunking、混合检索、rerank、引用、拒答和评估闭环。"
plainSummary: "RAG 的目标不是把文档塞给模型，而是稳定找到正确证据，让回答可追溯、可拒答、可评估、可维护。"
difficulty: intermediate
coverImage: "/images/academy/openai-academy/07-building-with-ai/rag/rag-grounding-cover.png"
tags:
  - "RAG"
  - "AI Engineering"
lang: zh
academy:
  series: "OpenAI Academy"
  module: "07.4 RAG"
  moduleOrder: 104
  source: "OpenAI Academy"
  sourceUrl: "https://academy.openai.com/home/clubs/builders-etkn1/resources/builder-bootcamp-2026-04-22"
  prerequisites:
    - "建议先阅读：OpenAI Academy 笔记：Research with ChatGPT"
draft: false
---

# OpenAI Academy：RAG 从知识库到可追溯回答

![RAG 证据检索与答案生成流程](/images/academy/openai-academy/07-building-with-ai/rag/rag-grounding-cover.png)

RAG 常被解释为“先检索，再生成”。这个解释方便入门，但容易让人误解：好像只要有向量数据库，把文档切一切，模型就会自动变可靠。

真实项目里，RAG 的核心不是检索技术本身，而是证据治理。

你需要回答这些问题：

- 哪些文档有资格进入知识库？
- 文档如何切分才不丢失语义？
- 用户问题如何被改写为更好的检索查询？
- 向量检索、关键词检索、过滤和 rerank 如何组合？
- 模型回答必须引用哪些证据？
- 证据不足时系统能不能拒答？
- 检索失败和生成失败如何分别评估？

RAG 的目标不是“让模型知道更多”，而是让回答建立在可验证材料上。

## RAG 系统的四条边界

| 边界 | 关键问题 | 失败后果 |
| --- | --- | --- |
| Corpus boundary | 哪些资料进入知识库 | 旧文档、重复文档、低质量文档污染结果 |
| Retrieval boundary | 怎样找到候选证据 | 正确材料找不到，或噪声排在前面 |
| Generation boundary | 模型能否超出材料发挥 | 产生无来源断言或幻觉 |
| Evaluation boundary | 怎么判断系统变好了 | 只凭感觉调 Prompt |

很多 RAG 项目只关注 retrieval boundary。真正上线后，corpus 和 evaluation 往往更影响稳定性。

## 语料准入：不要把所有文档都放进去

知识库不是垃圾桶。进入 RAG 的文档应该有准入标准。

建议记录：

- 来源是否可信。
- 适用产品或版本。
- 更新时间。
- 权限范围。
- 是否有所有者。
- 是否和现有文档冲突。
- 是否已经被更权威文档取代。

一篇过期文档的危害，可能大于十篇缺失文档。缺失时系统可能拒答；过期时系统会自信地答错。

## Chunking：切的是证据单元，不是字数

![Chunking、混合检索与 rerank 流程](/images/academy/openai-academy/07-building-with-ai/rag/chunking-retrieval-quality.png)

chunk 太长，检索命中后证据埋得深；chunk 太短，模型拿不到完整上下文。

切分时不要只按 token 数，还要考虑：

- 标题和正文是否在同一个 chunk。
- 表格、代码块、步骤列表是否被切断。
- 一个 chunk 是否能独立回答一个小问题。
- 是否保留来源、路径、章节、更新时间等 metadata。
- 是否需要 parent-child chunk，让检索命中小片段后扩展上下文。

一个实用规则：

**chunk 应该像证据卡片，而不是随机文本片段。**

## 检索：向量、关键词、过滤、rerank 要分工

单纯向量检索适合语义召回，但不擅长精确匹配错误码、字段名、版本号。生产 RAG 常常需要多路召回。

| 方法 | 擅长 | 不擅长 |
| --- | --- | --- |
| Vector search | 语义相似、同义表达 | 精确字段、版本号、短错误码 |
| Keyword search | 精确字符串、专有名词 | 问法变化、语义近似 |
| Metadata filter | 权限、版本、产品线、时间 | 语义排序 |
| Rerank | 从候选中重新排序 | 弥补完全漏召回 |

如果正确证据没有进入候选集，rerank 也救不回来。先看 recall，再看 ranking。

## 生成：答案必须知道自己的边界

RAG 的生成 prompt 不应该只说“请基于材料回答”。它应该明确三件事：

1. 可以回答什么。
2. 不能回答什么。
3. 如何表达证据不足。

一个更稳的输出约束：

```text
只使用提供的 evidence 回答。
如果 evidence 不足以支持结论，请明确说信息不足。
每个关键结论必须关联至少一个来源。
不要把推测写成事实。
```

很多系统害怕拒答，结果让模型在证据不足时继续编。对 RAG 来说，正确拒答是能力，不是失败。

## 引用与归因：让答案能被追溯

![RAG 引用、归因与 unsupported claim 检查](/images/academy/openai-academy/07-building-with-ai/rag/citation-grounding-check.png)

引用不是装饰。它有三个作用：

- 让用户知道结论来自哪里。
- 让开发者定位错误证据。
- 让 eval 能检查答案是否 grounded。

一个好的 citation 不只是 URL。它最好包含：

- 文档标题。
- 章节或段落。
- 更新时间。
- 权限或可见范围。
- 原始片段 ID。

如果答案引用了 A，但结论实际来自模型推测，这仍然是失败。引用必须支持结论。

## 评估 RAG：拆开看检索和生成

RAG 评估至少拆成两层。

检索层：

- 正确文档是否出现在 top-k？
- 正确 chunk 排名是否足够靠前？
- 是否召回了过期或冲突文档？
- 关键词问题是否被向量检索漏掉？

生成层：

- 回答是否忠实于 evidence？
- 是否有无来源断言？
- 是否在证据不足时拒答？
- 引用是否真的支持结论？
- 输出格式是否符合产品需求？

不要只用“最终答案好不好”评估 RAG。最终答案不好时，你需要知道是 retrieval 失败，还是 generation 失败。

## 案例：内部政策问答

目标：员工询问报销政策，系统回答并给出来源。

风险：

- 政策按地区不同。
- 老政策仍在知识库。
- 用户问题常常省略国家或时间。
- 部分政策只有管理层可见。

设计：

1. corpus 准入时记录地区、版本、有效期、权限。
2. 检索前识别用户所在地区和问题时间。
3. 用 metadata filter 限定地区和可见范围。
4. 用关键词召回政策编号和条款名。
5. 生成时要求引用具体条款。
6. 如果地区或时间不明，先询问，不直接回答。

这比“把所有政策 PDF 向量化”可靠得多。

## 常见反模式

**反模式一：先建向量库，再想数据治理。**

数据准入、版本、权限应该先设计。否则索引会很快变脏。

**反模式二：只调 chunk size。**

chunk size 重要，但 metadata、标题保留、父子上下文、rerank 同样重要。

**反模式三：把 citation 当作格式要求。**

引用必须支撑结论，不是每段末尾贴一个链接。

**反模式四：没有拒答策略。**

证据不足时继续回答，会让 RAG 失去可信度。

## RAG 设计模板

```md
### RAG System Card

用户场景：
回答边界：
拒答条件：

### Corpus

来源：
准入规则：
更新时间：
权限规则：
冲突处理：

### Retrieval

查询改写：
向量检索：
关键词检索：
metadata filter：
rerank：

### Generation

输出格式：
引用格式：
不确定性表达：

### Evaluation

检索指标：
生成指标：
失败分类：
回归样本：
```

## 检查清单

- 知识库是否有准入和过期规则？
- chunk 是否是证据单元，而不是随机切片？
- 是否结合向量、关键词、metadata 和 rerank？
- 正确证据是否能进入 top-k？
- 生成是否被限制在 evidence 内？
- 是否允许并鼓励正确拒答？
- eval 是否区分检索失败和生成失败？

## 继续阅读

- [OpenAI Academy：构建可靠 AI Agents](./agents/)：让 Agent 在检索证据上行动。
- [OpenAI Academy：评估 (Evals)](./evals/)：建立 RAG 的回归评测。
- [Math for AI：向量空间与余弦相似度](../../../foundations/math-for-ai-01/)：理解向量检索的基础。

## 参考

- [OpenAI Academy: Builder Bootcamp](https://academy.openai.com/home/clubs/builders-etkn1/resources/builder-bootcamp-2026-04-22)
- [OpenAI File Search Guide](https://platform.openai.com/docs/guides/tools-file-search)
- [OpenAI Embeddings Guide](https://platform.openai.com/docs/guides/embeddings)
