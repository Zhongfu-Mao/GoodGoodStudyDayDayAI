---
title: "AI Basics for Everyone：Context Engineering とは何か、prompt を書くだけでは足りない理由"
date: 2026-04-27
category: academy
description: "Prompt Engineering の次のステップとして、AI が各ステップで見る情報環境をどう設計するかを解説します。"
coverImage: "/images/academy/ai-basics-for-everyone/context-engineering.svg"
difficulty: beginner
plainSummary: "Context Engineering は良い prompt を書くことだけではなく、AI が各ステップで何を見て、どのツールを使い、どのルールに従うかを設計する実践です。"
tags:
  - "Context Engineering"
  - "Prompting"
lang: ja
academy:
  series: "AI Basics for Everyone"
  module: "基本概念"
  moduleOrder: 11
  source: "サイト内 Academy / Engineering ガイド"
  prerequisites: []
draft: false
---

## まず一言で

Context Engineering は、AI がタスクの各ステップで「何を見るか・どのツールを使うか・どのルールに従うか」を設計する実践です。良い prompt を一本書くだけでなく、AI が安定して働ける情報環境を整えることを指します。

## Prompt Engineering から Context Engineering へ

| Prompt Engineering | Context Engineering |
| --- | --- |
| 一つの指示文を磨く | タスク全体の情報環境を設計する |
| 単発のやりとりが中心 | 複数ステップの workflow が対象 |
| 手動で都度調整 | 検索・ツール呼び出し・ルール注入を含む |
| 「どう聞くか」 | 「AI が何を見れば正しく動けるか」 |

たとえるなら、Prompt Engineering は良い試験問題を書くこと、Context Engineering は試験会場全体——資料、ルール、参考書、採点基準——を準備することです。

## なぜ重要になっているのか

AI が実際の業務フローに入ると、一本の指示だけでは足りなくなります。

- 関連資料を見せる（検索）。
- 現在の進捗を伝える（状態）。
- ルールと境界を守らせる（システム指示）。
- サブタスクにツールを使わせる（ツール呼び出し）。
- 必要な情報がタスクの進行で変わる（動的 context）。

Context Engineering は、これらを適切なタイミングで AI に届ける設計です。

## Context の 4 つの源

| 源 | 例 |
| --- | --- |
| システム指示 | 「プロジェクト管理アシスタントとして、業務外の話題は扱わない」 |
| ユーザー入力 | 会話、アップロードファイル、質問 |
| 検索結果 | RAG がナレッジベースから取得した関連段落 |
| ツール戻り値 | 検索結果、API レスポンス、コード実行出力 |

## 日常で実践できること

- **Projects を使う**：背景、資料、指示を Project にまとめ、毎回の会話に自動で context を持たせる。
- **段階的に情報を渡す**：先にタスクを理解させ、次に詳細を渡す。
- **制約を明示する**：「以下の資料のみに基づいて答えてください」と伝える。
- **会話が長くなったら新規に**：重要情報だけ改めて渡し直す。

## サイト内で次に読むもの

まず [Context Window・Memory・Projects とは](../context-window-memory-projects/) で基礎を押さえ、次に [Context Engineering Playbook](../../../engineering/ai-developer-core/context-engineering-playbook/) で実践的手法を確認してください。

## やってみよう

同じタスクで 2 回試してみてください。

**実験 1**（素の prompt）：`お客様へのメールを書いてください。`

**実験 2**（Context Engineering）：
```text
背景：SaaS 企業のカスタマーサクセス担当。
状況：先月の技術的問題が今週修正済み。
目的：解決を通知し、新機能デモの希望を確認。
トーン：ビジネス寄りだがカジュアル。150 文字以内。
```

2 回目は「prompt が長い」だけでなく、AI が働くのに必要な context が揃っています。

## 実用的な見方

AI の出力が期待と違うとき、まず次を確認してください。

1. 十分な背景情報を渡したか。
2. 目的は具体的か。
3. 制約と評価基準は明確か。
4. 無関係な情報が混ざっていないか。

「AI が使えない」の 80% は「context が足りない」です。
