---
title: "Subagents 入門"
date: 2026-03-31
category: academy
description: "タスク分割、並列実行、文脈分離といった subagents の考え方を理解するための基礎ノートです。"
coverImage: "/images/academy/anthropic-academy/covers/05-agentic-mcp/introduction-to-subagents.svg"
tags:
  - "Anthropic Academy"
  - "Agents"
  - "Subagents"
lang: ja
academy:
  series: "Anthropic Academy"
  module: "Agents と MCP"
  moduleOrder: 5
  source: "Anthropic Academy"
  sourceUrl: "https://anthropic.skilljar.com/introduction-to-subagents"
  prerequisites: []
draft: false
---
# 要点まとめ

Subagents は、大きな仕事を複数の小さな担当に分けて進めるための考え方で、人間のチーム編成に近い発想です。

## この講義で押さえたいこと

- 独立性の高いサブタスクは、分離して並列化すると速度も整理性も上がる。
- 各 subagent に役割と責任範囲を明確に与えると、文脈の混線が減る。
- 統合作業をどこで行うかを決めておかないと、部分最適な結果が集まるだけになりやすい。

## 実務へのつなげ方

市場調査、比較検討、コード改修のような場面では、分担単位を先に定義してから subagents を使うと効果が出ます。
