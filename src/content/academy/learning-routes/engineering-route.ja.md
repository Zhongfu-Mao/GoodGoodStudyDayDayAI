---
title: "AI Academy ルート：エンジニア向け AI 活用"
date: 2026-04-27
category: academy
description: "Codex / Claude Code から MCP、Agents、RAG、Evals、Production、Context Engineering へ進むエンジニア向けルートです。"
coverImage: "/images/academy/learning-routes/engineering-route.svg"
difficulty: intermediate
plainSummary: "このルートはエンジニア向けです。AI coding、MCP、Agent、RAG、Evals、production optimization、Context Engineering を一つの実践ルートにします。"
tags:
  - "AI Engineering"
lang: ja
academy:
  series: "AI Academy Learning Routes"
  module: "ロール別ルート"
  moduleOrder: 2
  source: "サイト内 AI Academy / Engineering ルート"
  prerequisites:
    - "先に読むとよいもの：AI Basics for Everyone"
draft: false
---

## このルートが向いている人

すでに engineering background があるなら、「AI にコードを書かせる」で止まらない方が面白いです。AI を新しい開発の共同作業者であり、system component でもあるものとして理解します。

このルートを読んだ後、次に答えられる状態を目指します。

1. AI coding tool は実際の repo にどう入るのか。
2. Tool、権限、log、approval、replay はどう設計するのか。
3. RAG、Agent、Eval はそれぞれどんな engineering problem を解くのか。
4. どこからが product feature で、どこまでが prompt demo なのか。

## 第一段階：AI Coding を実プロジェクトへ

まず Codex から始めます。

- [Codex Quickstart](../../openai-academy/05-codex/quickstart/)：基本の流れをつかむ。
- [Codex App](../../openai-academy/05-codex/codex-app/)：local workspace、task execution、verification を見る。
- [Better Prompts](../../openai-academy/05-codex/better-prompts/)：prompt を engineering task として書く。

次に [Claude Code in Action](../../anthropic-academy/04-developer-tools/claude-code-in-action/) を読み、別の coding agent の workflow と比較します。

ここでのポイントは、AI がコードを書けるかではなく、context を読み、変更範囲を制御し、検証を走らせ、review 可能な diff を残せるかです。

## 第二段階：Tool protocol と制御境界

次は MCP です。

- [MCP とは何か](../../ai-basics-for-everyone/what-is-mcp/)：protocol 実装へ進む前に、MCP が何を標準化するのかをつかむ。
- [Introduction to Model Context Protocol](../../anthropic-academy/05-agentic-mcp/introduction-to-model-context-protocol/)：model が tool や資料へ標準的に接続する考え方。
- [MCP Advanced Topics](../../anthropic-academy/05-agentic-mcp/model-context-protocol-advanced-topics/)：権限、capability description、複雑な integration。
- [Minimal MCP Server](../../../engineering/ai-developer-core/minimal-mcp-server/)：最小実装で境界を理解する。

MCP の本質は、tool をたくさんつなぐことではなく、tool use を記述可能、承認可能、監査可能にすることです。

## 第三段階：Agent、RAG、Evals を一組で見る

次は順番に読みます。

| テーマ | 推奨コンテンツ | Engineering problem |
| --- | --- | --- |
| Agent | [Building Agents](../../openai-academy/07-building-with-ai/agents/) + [Agent State / Tools / Feedback Loop](../../../foundations/ai-developer-core/agent-state-tools-feedback-loop/) | 複数ステップをどう進め、止め、検証するか |
| RAG | [RAG](../../openai-academy/07-building-with-ai/rag/) + [RAG Minimum System](../../../engineering/ai-developer-core/rag-minimum-system/) | 外部資料に基づいて回答するには |
| Evals | [Evals](../../openai-academy/07-building-with-ai/evals/) + [Evals / Benchmarks / Product Quality](../../../foundations/ai-developer-core/evals-benchmarks-product-quality/) | システムが本当に良くなったかをどう測るか |

この 3 つを別々の buzzword として見ない方がよいです。実際の product では、RAG には eval が必要で、Agent には tool 境界が必要で、その境界には log と approval が必要です。

## 第四段階：Demo から production へ

最後に読みます。

- [Production Optimization](../../openai-academy/07-building-with-ai/production-optimization/)：latency、cost、reliability、monitoring。
- [Context Engineering とは何か](../../ai-basics-for-everyone/what-is-context-engineering/)：context を product resource として扱う視点を持つ。
- [Context Engineering Playbook](../../../engineering/ai-developer-core/context-engineering-playbook/)：context を prompt trick ではなく engineering design として扱う。
- [Agent Harness](../../../engineering/ai-developer-core/agent-harness-logging-approval-replay/)：agent behavior を trace、review、replay できるようにする。

ここが、AI feature を demo で終わらせるか、長期的に維持できる system にするかを分けます。

## 残すべき成果物

読み終えたら、次のような成果物があると実践につながります。

- AI coding workflow template：要件、探索、変更、検証、review。
- 最小 MCP または tool-use demo：権限と log を明確にする。
- RAG / Agent の eval checklist：正確性、引用、失敗モード、人の確認点を含む。

エンジニア向けルートの中心は、新しい言葉を追うことではなく、AI を維持可能、検証可能、rollback 可能な system に入れることです。
