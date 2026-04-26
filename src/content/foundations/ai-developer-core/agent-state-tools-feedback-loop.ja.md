---
title: "AI Developer Core：Agent = 状態、ツール、フィードバックループ"
date: 2026-04-26
category: foundations
description: "Agent を状態、ツール、環境フィードバック、制御ループ、停止条件に分解して理解する。"
difficulty: intermediate
plainSummary: "Agent は単に会話が上手いモデルではありません。観察、行動、記録、修正、停止ができる実行環境にモデルを置いたシステムです。"
tags:
  - AI Developer Core
  - Agent
  - Tool Use
  - Feedback Loop
lang: ja
draft: false
---

# Agent を神秘化しない

Agent という言葉は大きく聞こえるが、実務ではもっと素朴に見られる。Agent は、環境の中で観察し、行動し、結果を受け取り、次の行動を決めるシステムである。モデルは次の一手を選び、ツールは世界から情報を取るか世界を変え、状態は進捗を記録し、停止条件が暴走を防ぐ。

Agent を「モデル + prompt」と見ると、すぐ信頼性の壁にぶつかる。「モデル + 状態機械 + ツールインターフェース + eval + 権限」と見れば、ソフトウェア工学の対象になる。

## 五つの構成要素

第一は**目標**。Agent にはタスク説明だけでなく、完了条件が必要だ。曖昧な目標ほど、人間の確認点が必要になる。

第二は**状態**。状態にはユーザー要求、完了済みステップ、ツール結果、次の予定、仮説、エラー、次の計画が含まれる。長い会話履歴だけに状態を持たせるべきではない。

第三は**ツール**。ツールは関数一覧ではない。名前、入力 schema、出力 schema、失敗時の挙動、権限、例が必要である。曖昧なツールは誤用される。

第四は**フィードバック**。ツール結果、テスト、ビルド、検索ヒット、ユーザー確認、ログ、eval がフィードバックになる。フィードバックがなければ、Agent は連続して推測しているだけだ。

第五は**停止条件**。完了、失敗、ユーザー待ち、予算超過、回数超過、リスク上昇は明示的な状態であるべきだ。信頼できる Agent は止まり方を知っている。

## Workflow と Agent

Workflow は、あらかじめ決めた経路の中でモデルを使う。Agent は、経路を完全には固定せず、モデルがフィードバックから次の行動を選ぶ。前者は安定し、安く、テストしやすい。後者は柔軟だが高価で、guardrail が必要になる。

多くのプロダクトは完全自律 Agent を必要としない。まず workflow で予測可能な処理を固め、手順を事前に列挙できない場面だけ Agent loop を使う。

## 実務上の意味

Agent の中心能力は「何歩も考える」ことではなく、「各ステップで環境から事実を得られる」ことだ。コード Agent はファイルを読み、変更し、テストを走らせる。研究 Agent は検索し、引用し、検証する。データ Agent はクエリし、可視化し、異常を確認する。

つまり Agent 設計の中心は prompt だけではない。どんなツール、権限、フィードバックを与えるかで、Agent の性格が決まる。

## 試すこと

三段階の小さな Agent を作る。タスクを読み、読み取り専用ツールを呼び、構造化された状態を返す。第二版では、失敗時に再試行し、二回失敗したら人間確認へ進む。ログを比較し、状態、フィードバック、停止条件がデバッグ性をどう変えるかを見る。

## 参考

- [Anthropic: Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents)
- [Lilian Weng: LLM Powered Autonomous Agents](https://lilianweng.github.io/posts/2023-06-23-agent/)
- [Berkeley RDI: LLM Agents](https://rdi.berkeley.edu/llm-agents/f24)
- [DeepLearning.AI: Agentic AI](https://www.deeplearning.ai/courses/agentic-ai/)
- [Google Agent Development Kit](https://adk.dev/)
