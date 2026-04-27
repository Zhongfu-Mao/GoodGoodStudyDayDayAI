---
title: "Model Context Protocol 応用編"
date: 2026-03-31
category: academy
description: "MCP を実運用へ広げるときに出てくる設計論点や、安全性・拡張性の観点を整理した応用ノートです。"
plainSummary: "MCP の Sampling、Resources、Prompts、動的ツール、権限境界などの進んだ設計論点を実務向けに整理します。"
difficulty: "advanced"
coverImage: "/images/academy/anthropic-academy/covers/05-agentic-mcp/model-context-protocol-advanced-topics.svg"
tags:
  - "Agents"
lang: ja
academy:
  series: "Anthropic Academy"
  module: "Agents と MCP"
  moduleOrder: 5
  source: "Anthropic Academy"
  sourceUrl: "https://anthropic.skilljar.com/model-context-protocol-advanced-topics"
  prerequisites: []
draft: false
---
MCP の基本を理解したあとに難しくなるのは、ツールを増やすことではなく、どこまで動的にし、どこで人間の承認を挟み、どの情報を安全に公開するかです。このノートでは MCP の進んだ機能を、実装と運用の観点で整理します。

## このノートで押さえること

- Sampling、Resources、Prompts は、単純な tool call 以外の文脈共有や生成を支える。
- 動的 tools は便利だが、発見可能性、権限、監査が難しくなる。
- MCP server は小さく始め、権限境界とログを先に設計する。
- 本番運用では、ユーザー承認、入力検証、出力検証、失敗回復が不可欠である。

## Core features の見取り図

**Tools** は外部アクション、**Resources** は参照可能な情報、**Prompts** は再利用可能な文脈テンプレートです。基本の MCP server は Tools から始めがちですが、Resources と Prompts を使うと、AI に渡す文脈を整理できます。

**Sampling** は、server 側からモデル生成を依頼するような高度なパターンで、単純な client → server の tool call より設計が難しくなります。

進んだ機能を使うほど、権限境界が曖昧になりやすいので、どの主体が何を実行しているのかをログで追えるようにします。

## 動的ツールと発見可能性

動的に tool を増減できる設計は、ユーザーやプロジェクトごとに能力を変えられるため便利です。一方で、AI がどの tool をいつ使えるのか、ユーザーが理解しにくくなる場合があります。

tool の説明文は、AI にとっての UI です。入力パラメータ、制約、失敗時の挙動、使うべきでない場面を明確に書きます。

大量の tool を一度に公開すると選択ミスが増えます。用途ごとに server を分ける、読み取り専用と書き込みありを分ける、といった整理が有効です。

## 本番運用の論点

本番 MCP では、入力検証、権限チェック、監査ログ、レート制限、タイムアウト、エラー分類を実装します。AI から来た引数を信頼してそのまま外部 API に渡してはいけません。

ユーザー承認は、危険度に応じて変えます。読み取りは自動、書き込みは確認、削除や送信は明示承認のように段階を分けます。

失敗回復も重要です。途中まで実行された処理をどう戻すか、再試行してよいか、ユーザーに何を伝えるかを決めます。

## 実務で試すワークフロー

1. 既存 MCP server の tools を、読み取り・書き込み・外部送信に分類する。
2. 各 tool に入力検証、権限、ログ、承認要否を付ける。
3. Resources と Prompts を使い、tool に渡す文脈を最小化する。

## Prompt pack

- この MCP server の tool 一覧をレビューし、権限境界、説明文、承認要否の改善案を出してください。
- Resources と Prompts を使って、次の MCP workflow の文脈設計を整理してください。
- MCP server を本番運用するための監査ログスキーマを提案してください。

## 自分で確認する

- tool ごとに危険度と承認要否を分類している。
- AI からの引数を検証している。
- 失敗時にユーザーへ説明できるログが残る。

## 関連して読む

- [MCP とは何か](../../../ai-basics-for-everyone/what-is-mcp/)
- [Introduction to Model Context Protocol](../introduction-to-model-context-protocol/)
- [Minimal MCP Server](../../../../engineering/ai-developer-core/minimal-mcp-server/)
