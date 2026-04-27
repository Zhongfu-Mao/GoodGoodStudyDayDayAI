---
title: "Agent Skills 入門"
date: 2026-03-31
category: academy
description: "Skills の役割、エージェントに知識や手順を与える考え方、設計の基本を整理したノートです。"
coverImage: "/images/academy/anthropic-academy/covers/05-agentic-mcp/introduction-to-agent-skills.svg"
lang: ja
academy:
  series: "Anthropic Academy"
  module: "Agents と MCP"
  moduleOrder: 5
  source: "Anthropic Academy"
  sourceUrl: "https://anthropic.skilljar.com/introduction-to-agent-skills"
  prerequisites: []
draft: false
---
# 要点まとめ

Skills は、毎回同じ説明を繰り返さなくても、エージェントに特定の仕事のやり方を覚えさせるための部品です。

## この講義で押さえたいこと

- Skills には、判断基準、手順、入出力の期待値を明文化しておくと効果が高い。
- 汎用的すぎる Skill よりも、仕事の単位に合った小さな Skill の方が再利用しやすい。
- 実務では、Skill 単体の精度よりも、どのタイミングで呼び出されるかの設計が重要になる。

## 実務へのつなげ方

まずはチームで頻出する定型作業を一つ選び、その手順を Skill 化して試すと価値が見えやすいです。
