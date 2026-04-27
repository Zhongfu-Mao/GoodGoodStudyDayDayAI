---
title: "AI Basics for Everyone：Codex / Claude Code のような AI Coding ツールは何を変えたのか"
date: 2026-04-27
category: academy
description: "AI coding tool を、コード補完ではなく、探索、編集、検証、説明まで含む共同作業として整理します。"
coverImage: "/images/academy/ai-basics-for-everyone/ai-coding-tools.svg"
difficulty: beginner
plainSummary: "AI coding tool の変化は、コードを書く速度だけではありません。要件、探索、変更、検証、説明をつなぐ共同作業の形が変わっています。"
tags:
  - "Codex"
  - "Claude Code"
lang: ja
academy:
  series: "AI Basics for Everyone"
  module: "基本概念"
  moduleOrder: 7
  source: "サイト内 Academy / Engineering ガイド"
  prerequisites: []
draft: false
---

## まず一言で

Codex や Claude Code のような tool が変えたのは、「AI がコードを書ける」ことだけではありません。プロジェクトを読み、探索し、ファイルを変更し、check を走らせ、結果を説明する共同作業の形を変えています。

エンジニアでない人にとっては、以前の AI が文章アシスタントだったとすると、今は実際の project 内で作業できる partner に近づいている、と見るとわかりやすいです。

## 普通の chat でコードを書く場合との違い

| 普通の chat | AI coding tool |
| --- | --- |
| コード片を生成する | project 内の file を直接読み書きできる |
| copy & paste が必要 | command を実行し、error を見て修正できる |
| 全体構造を把握しにくい | repository、依存関係、呼び出しを探索できる |
| 検証は人が手で行う | test や build を走らせ、結果を説明できる |

本質的な変化は、AI が chat box だけで答えるのではなく、実際の作業環境に入ることです。

## なぜ重要なのか

開発で時間がかかるのは、コードを書くことだけではありません。要件理解、既存コードの調査、問題の特定、試行錯誤、検証、説明、commit まで含まれます。

AI coding tool は、これらを一つの流れにします。

- Project を探索する。
- 変更案を出す。
- 関連 file を編集する。
- Check を実行する。
- Error を見て直す。
- 最後に変更内容とリスクを説明する。

だから vibe coding が現実味を持ちます。人は意図、product 判断、受け入れ基準に集中し、AI が実行の大きな部分を担えるようになります。

## ただし review は消えない

AI coding が強くなるほど、境界は重要になります。実際に file を変更し、command を実行し、project 状態に影響するからです。

少なくとも次は残すべきです。

- 要件と受け入れ基準を明確にする。
- 重要な diff を見る。
- test や build を走らせる。

Review なしの vibe coding は探索には強いですが、team や production では engineering discipline が必要です。

## サイト内で次に読むもの

[Codex Quickstart](../../openai-academy/05-codex/quickstart/) と [Codex App](../../openai-academy/05-codex/codex-app/) で、Codex の基本的な流れをつかめます。

[Claude Code in Action](../../anthropic-academy/04-developer-tools/claude-code-in-action/) では、別の coding agent workflow と比較できます。

より信頼できる実践にするなら、[Reliable LLM Call Skeleton](../../../engineering/ai-developer-core/reliable-llm-call-skeleton/) と [Agent Harness](../../../engineering/ai-developer-core/agent-harness-logging-approval-replay/) が次の入口です。

## やってみよう

ChatGPT Plus をお持ちなら、Code Interpreter で小さなタスクを試してください。

```text
Python スクリプトを書いて、ランダムな数値を 10 個生成し、
棒グラフを描いてください。コードを実行して結果を見せてください。
```

AI が「コードを書く → 実行する → 結果を確認する → 説明する」の流れで動くかを観察してください。エラーが出た場合、自動で修正するかも注目ポイントです。

コードを書かない方は、ネットで見かけたコード片を AI に貼って「何をしているか説明して」と聞くだけでも、「プロジェクトを理解する力」を体感できます。

## 実用的な見方

AI coding が本当に役立っているかは、次で見ます。

1. 既存コードを読んでから変更しているか。
2. 変更範囲を説明できるか。
3. 検証を実行したか。
4. review 可能な diff が残っているか。
5. 人が product 判断と release 責任を持っているか。

AI は実行速度を上げますが、責任の境界まで消してはいけません。
