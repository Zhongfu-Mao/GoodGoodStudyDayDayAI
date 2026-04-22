---
title: "AI Radar Daily: 2026-04-15"
date: 2026-04-15
category: radar
cadence: daily
tags:
  - Memory
  - Design to Code
  - Local Models
  - Claude Code
lang: ja
draft: false
---

## 対象範囲

- 対象期間: 2026-04-12 ～ 2026-04-15（過去 72 時間）
- 参照ソース: Daily Dose of Data Science · Latent Space · ByteByteGo · Ahead of AI · Hugging Face Blog · The Rundown AI · 老范讲故事

# 今日の見立て

- 記憶システム、Design-to-Code ループ、本地モデル一覧が今日の主軸。
- Agent 製品は「答える」だけではなく、専門ワークフローを最後まで完了する方向へ進んでいる。
- 中国語圏でも OpenClaw や Hermes の実測比較が増えてきた。

![Figma の design-to-code フロー図](https://substackcdn.com/image/fetch/$s_!Us9U!,w_1200,h_675,c_fill,f_jpg,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ff53dd546-d966-4485-bfe9-5d410d319a3c_1712x2048.png)

*代表画像は [Figma: Design to Code, Code to Design](https://blog.bytebytego.com/p/figma-design-to-code-code-to-design) のビジュアルから選定。この日は design-to-code、記憶、製品 workflow を同時に見ていたので、「設計と実行のループ」を最も感じやすい図を置いた。*

## 注目記事

- **[Build Agents That Never Forget](https://blog.dailydoseofds.com/p/build-agents-that-never-forget-98a)**: memory system を会話履歴ではなく、long-running workflow の基盤として捉え直すのに役立つ。
- **[Figma Design to Code, Code to Design: Clearly Explained](https://blog.bytebytego.com/p/figma-design-to-code-code-to-design)**: 仕様と実装の往復が AI によってどこまで短縮されるかを、プロダクト設計の視点で捉えられる。
- **[10 Must-use Slash Commands in Claude Code](https://blog.dailydoseofds.com/p/10-must-use-slash-commands-in-claude)**: coding agent の実効性が、モデル性能だけでなく command surface の設計に依存していることがよく分かる。

## Engineering & Architecture

- **Build Agents That Never Forget**：記憶は UX ではなくシステム能力として設計する必要がある。
- **Notion Token Town**：多段ツール構成と software factory の中間層が見えてきた。
- **Design to Code / Code to Design**：設計と実装の往復が AI によって短縮されている。
- **LinkedIn の LLM 運用**：大規模配信サービスの知見がそのまま参考になる。

## Models & Open Source

- **Diffusion LLM**：Transformer 一辺倒ではない次の方向性。
- **Top Local Models List**：本地モデル選定がかなり現実的な作業になってきた。
- **Muse Spark / Mythos**：閉源フロンティアの差別化競争が続く。

## Tools & Applications

- **Claude Code Slash Commands**：コマンド化された workflow が coding agent の実効性を上げている。
- **Hermes Agent vs OpenClaw**：個人で制御できる harness の需要が見えてきた。

## Industry

- **Perplexity、Retail、XChat**：会話インターフェースから実行入口へ移る流れが明確。

## Follow-up

- Claude Code、Hermes、OpenClaw の三者関係を継続観察する。

## 参照記事

### Engineering & Architecture
- [Build Agents That Never Forget](https://blog.dailydoseofds.com/p/build-agents-that-never-forget-98a)
- [Notion's Token Town: 5 Rebuilds, 100+ Tools, MCP vs CLIs and the Software Factory Future](https://www.latent.space/p/notion)
- [Figma Design to Code, Code to Design: Clearly Explained](https://blog.bytebytego.com/p/figma-design-to-code-code-to-design)
- [How LinkedIn Feed Uses LLMs to Serve 1.3 Billion Users](https://blog.bytebytego.com/p/how-linkedin-feed-uses-llms-to-serve)
- [AINews Humanity's Last Gasp](https://www.latent.space/p/ainews-humanitys-last-gasp)

### Models & Research
- [The Anatomy of Diffusion LLMs](https://blog.dailydoseofds.com/p/the-anatomy-of-diffusion-llms)
- [AINews Top Local Models List — April 2026](https://www.latent.space/p/ainews-top-local-models-list-april)
- [Meta Superintelligence Labs Ships Its First Model](https://www.therundown.ai/p/meta-superintelligence-labs-ships-its-first-model)
- [Anthropic's New AI Is Too Powerful for the World](https://www.therundown.ai/p/anthropic-new-ai-is-too-powerful-for-the-world)

### Tools & Libraries
- [10 Must-use Slash Commands in Claude Code](https://blog.dailydoseofds.com/p/10-must-use-slash-commands-in-claude)
- [Hermes Agent 能替代 OpenClaw 吗？老范实测后震惊了](https://lukefan.com/2026/04/12/hermes-agent-vs-openclaw-lightweight-self-evolving-ai-comparison/)

### Industry & Business
- [中国 AI 末日论与追赶美国真相](https://lukefan.com/2026/04/13/china-ai-doomism-us-gap-chip-talent-catchup/)
- [XChat 上线在即：马斯克真能做出美国版微信？](https://lukefan.com/2026/04/14/xchat-american-wechat-dm-to-im-social-network-effects/)
- [What Happens When AI Runs a Retail Store](https://www.therundown.ai/p/what-happens-when-ai-runs-a-retail-store)
- [Perplexity's Agent Pivot Is on the Money](https://www.therundown.ai/p/perplexity-agent-pivot-is-on-the-money)
- [夸克网盘美剧链接一夜失效：国家整治网盘传播美剧](https://lukefan.com/2026/04/15/quark-cloud-drive-overseas-tv-link-crackdown-2026/)
