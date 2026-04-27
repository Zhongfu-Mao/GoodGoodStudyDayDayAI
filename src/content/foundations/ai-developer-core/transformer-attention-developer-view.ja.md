---
title: "AI Developer Core：Transformer と Attention の開発者向け理解"
date: 2026-04-26
category: foundations
description: "Transformer と attention を、コンテキスト設計や構造化出力の調整に使える心的モデルとして整理する。"
difficulty: beginner
plainSummary: "Attention は、生成中の token が文脈内の他の token から手がかりを探す仕組みとして理解できます。これを知ると、例示や出力形式がなぜ効くのかが見えやすくなります。"
tags:
  - "AI Developer Core"
  - "LLM"
lang: ja
draft: false
---

# Attention は何を解くのか

言語モデルが次の token を生成するとき、現在の位置が文脈中のどこを参照すべきかを判断する必要がある。Transformer の大きな転換は、各位置が他の位置へ直接アクセスできるようにしたことだ。

開発者向けには、attention を動的な問い合わせとして見るとよい。現在の token は query を持ち、文脈内の token は key と value を持つ。query と key の近さが「どこを見るか」を決め、value が「何を取り出すか」を決める。

## なぜ例示が効くのか

Few-shot の例は、入力、出力、形式、文体、境界条件をコンテキスト内に置く。生成時、モデルは現在のタスクを似た例へ合わせ、そのパターンを再利用できる。

逆に、悪い例も強く効く。曖昧な JSON、余計な説明、最終指示と矛盾するサンプルは、すべてモデルが見えるパターンになる。モデルは最後の一文だけを読んでいるわけではない。

## 言い回しより構造が効く理由

良い prompt には、タスク、入力、制約、出力形式、例、チェック基準が分かれていることが多い。構造が見えれば、モデルは情報の役割を分けやすくなる。

見出し、箇条書き、XML タグ、JSON schema、区切り線は、すべて「これはデータ」「これはルール」「これは例」「これは期待出力」といった役割を明示するための道具である。

## 実務上の意味

Attention が教えてくれるのは、コンテキストは多ければよいのではなく、探しやすい形で置くべきだということだ。RAG の断片にはタイトルと出典が必要で、ツール結果にはフィールド名が必要で、長い履歴は構造化された状態へ圧縮すべきだ。

モデルが条件を落としたときは、能力だけを疑う前に、条件の位置、形式、矛盾、重複を確認する。多くの「指示を聞いていない」は、実は文脈設計の問題である。

## 試すこと

同じ抽出タスクを三つの形式で実行する。自然文だけの説明、見出し付きの説明、JSON schema 付きの説明。フィールド欠落率と形式エラー率を見る。さらに矛盾する例を一つ加え、出力がどれだけ引っ張られるかを確認する。

## 実務判断：重要情報を探しやすくする

開発者が attention の数式を暗記する必要はないが、「探しやすい context」を作る意識は必要だ。title、field name、source、順序がある情報は使われやすい。逆に、長い段落に埋もれた制約、例の中に混ざった反例、互いに矛盾する自然文の指示は、出力を不安定にする。

複雑な task では、context を task goal、input data、守るべき rules、examples、output schema、checklist に分ける。区画名を安定させ、内容を混ぜすぎない。これは見た目の整理ではなく、生成時に model が見るべき場所を間違えにくくする工夫である。

## 手を動かして試す：三つの構造を比べる

同じ抽出タスクで、次の三つを試す。

1. 一つの長い段落で説明する。
2. Markdown heading と bullet list で分ける。
3. XML または JSON 風の明確な区画にする。

20 件ほどのサンプルで、field の欠落、format error、人間の修正時間を見る。構造化した prompt は必ず短いわけではないが、安定しやすく、eval もしやすい。

## 関連して読む

- [Prompt とは何か](../../../academy/ai-basics-for-everyone/what-is-prompt/)：prompt を context organization として理解する。
- [Structured Output](../../../academy/ai-basics-for-everyone/what-is-structured-output/)：出力 schema も model が参照する pattern にする。
- [Reliable LLM Call](../../../engineering/ai-developer-core/reliable-llm-call-timeout-retry-json-repair/)：構造と retry、repair を接続する。

## 参考

- [Stanford CS224N](https://web.stanford.edu/class/cs224n/)
- [Stanford CS336](https://cs336.stanford.edu/)
- [Karpathy Neural Networks: Zero to Hero](https://karpathy.ai/zero-to-hero.html)
- [Anthropic Prompt Engineering Interactive Tutorial](https://github.com/anthropics/prompt-eng-interactive-tutorial)
