---
title: "AI Developer Core：Token とコンテキストウィンドウ"
date: 2026-04-26
category: foundations
description: "token、コンテキストウィンドウ、切り詰め、コスト、記憶設計を開発者目線で整理する。"
difficulty: beginner
plainSummary: "Token は文字数ではなく、モデルが実際に処理する離散的な記号です。コンテキストウィンドウは一度に見える情報量を決め、コスト、遅延、記憶設計にも直結します。"
tags:
  - AI Developer Core
  - LLM
  - Token
  - Context
lang: ja
draft: false
---

# なぜ Token から始めるのか

LLM アプリの不具合は、prompt の問題に見えて、実は token の問題であることが多い。入力が長すぎる、履歴を入れすぎる、検索結果が細切れすぎる、出力が途中で切れる、コストが急に上がる。こうした現象は、モデルが文字ではなく token 列を処理していることから始まる。

Tokenizer はテキストを token に分割し、語彙表上の整数へ変換する。同じ 1000 文字でも、中国語、英語、Markdown、JSON、コードでは token 数が大きく変わる。人間にとっての読みやすさと、モデルにとっての長さは同じではない。

## コンテキストウィンドウとは

コンテキストウィンドウは、モデルが一度の計算で受け取れる token 数である。長期記憶でもデータベースでもない。ウィンドウ内の情報は現在の回答に影響するが、外に落ちた情報は直接参照されない。

ここから三つの実務上の制約が出る。

第一に、**ウィンドウは希少資源**である。system prompt、ユーザー入力、会話履歴、ツール結果、RAG の断片、出力形式の制約は、すべて同じウィンドウを奪い合う。

第二に、**長ければ安定するわけではない**。長いコンテキストは材料を増やす一方で、ノイズ、重複、指示衝突、情報の希釈も増やす。多くの場面では、広げるより削るほうが効く。

第三に、**コストと遅延に直結する**。入力 token が多ければ読む時間が増え、出力 token が多ければ生成時間が伸びる。token budget は、API 制限や DB インデックスと同じく設計対象にすべきものだ。

## 調査時に見るべきこと

モデルが失敗したとき、まず次を確認する。

1. 必要な情報は本当にウィンドウ内にあるか。
2. 重要情報が不要な文脈に埋もれていないか。
3. 指示、データ、出力形式が矛盾していないか。
4. 出力上限や stop 条件で途中終了していないか。

この確認は、ただ大きなモデルに替えるより安く、再利用しやすい。

## 試すこと

`token-lab` という小さなスクリプトを作る。同じ意味を持つ中国語、英語、Markdown、JSON、コード、ログを token 数で比較する。さらに同じタスクを、全文、要約、構造化メモの三種類で実行し、品質、token 数、遅延、コストを見る。

目的は唯一の正解を探すことではない。何をウィンドウに入れ、何を圧縮し、何を検索に逃がすかの感覚を作ることだ。

## 参考

- [Stanford CS336: Language Modeling from Scratch](https://cs336.stanford.edu/)
- [OpenAI Prompting](https://platform.openai.com/docs/guides/prompting)
- [Anthropic Prompt Engineering Overview](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview)
