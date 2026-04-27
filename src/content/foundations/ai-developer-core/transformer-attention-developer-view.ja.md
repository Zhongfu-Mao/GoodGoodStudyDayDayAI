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

## 参考

- [Stanford CS224N](https://web.stanford.edu/class/cs224n/)
- [Stanford CS336](https://cs336.stanford.edu/)
- [Karpathy Neural Networks: Zero to Hero](https://karpathy.ai/zero-to-hero.html)
- [Anthropic Prompt Engineering Interactive Tutorial](https://github.com/anthropics/prompt-eng-interactive-tutorial)

