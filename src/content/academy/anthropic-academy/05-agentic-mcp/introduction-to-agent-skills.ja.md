---
title: "Agent Skills 入門"
date: 2026-03-31
category: academy
description: "Skills の役割、エージェントに知識や手順を与える考え方、設計の基本を整理したノートです。"
plainSummary: "Claude Code の Skills を、再利用可能な作業手順、判断基準、ツール呼び出しのパッケージとして設計する方法を整理します。"
difficulty: "advanced"
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
Agent Skills は、Claude に「この種類の仕事では、こういう手順で、こういう基準で進めてほしい」と教えるための再利用可能な作業単位です。単なるプロンプト集ではなく、文脈、手順、制約、検証をまとめた小さな運用パッケージとして考えると使いやすくなります。

## このノートで押さえること

- Skill は、特定タスクの手順、判断基準、ファイル、スクリプトをまとめて Claude に提供する仕組みである。
- 良い Skill は、いつ使うか、何を読むか、どの順序で進めるか、どう検証するかが明確である。
- CLAUDE.md、Slash Commands、普通のプロンプトとは役割が違う。
- 作りっぱなしではなく、失敗した作業から Skill を更新することで価値が増える。

## Skill の本質

Skill は、Claude の能力を新しく作るというより、特定の仕事で迷わないための作業文脈を渡すものです。たとえば PR レビュー、ドキュメント生成、音声処理、データ分析など、繰り返し発生する作業に向いています。

中身には、説明文、手順、注意点、参照ファイル、補助スクリプト、テンプレートを含められます。Claude はタスクに合う Skill を見つけると、その中の指示を使って進めます。

良い Skill は短く始め、実際の失敗や手戻りを見ながら育てます。最初から巨大なルールブックにすると、使われにくくなります。

## どんな作業を Skill 化するか

Skill に向いているのは、毎回似た判断が必要で、手順がある程度決まっており、品質基準を明文化できる作業です。

逆に、一回限りの探索、まだ形が決まっていない企画、会話しながら方向を探る作業は、すぐ Skill 化しない方がよい場合があります。

判断基準は「何をしてはいけないか」も含めます。秘密情報を出さない、破壊的コマンドを使わない、引用元を残すなど、事故防止のルールを入れます。

## Skill の構成

最小構成は、Skill の目的、使うべき場面、入力として必要な情報、実行手順、検証方法です。スクリプトやテンプレートは必要になってから足します。

名前と説明は特に重要です。Claude がいつ使うべきか判断できるよう、対象タスクを具体的に書きます。

運用では、Skill を使った結果を見て、足りなかった手順や曖昧だった制約を更新します。

## 実務で試すワークフロー

1. 繰り返し発生している作業を一つ選び、失敗しやすい点を 5 つ書く。
2. 目的、トリガー、手順、検証、禁止事項だけで最小 Skill を作る。
3. 次回その作業で使い、手戻りがあった箇所を Skill に反映する。

## Prompt pack

- この繰り返し作業を Skill 化したいです。Skill に入れるべき目的、トリガー、手順、検証、禁止事項を整理してください。
- 次の Skill.md をレビューしてください。曖昧なトリガー、過剰な手順、足りない安全ルールを指摘してください。
- この作業ログから、Skill に追加すべき再発防止ルールを抽出してください。

## 自分で確認する

- Skill を使うべき場面が一文で説明できる。
- 検証方法が Skill 内に含まれている。
- 失敗から Skill を更新する運用がある。

## 関連して読む

- [Claude Code in Action](../../04-developer-tools/claude-code-in-action/)
- [Agent Harness](../../../../engineering/ai-developer-core/agent-harness-logging-approval-replay/)
