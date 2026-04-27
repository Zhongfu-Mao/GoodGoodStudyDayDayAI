---
title: "AI Developer Core：KV Cache、FlashAttention、推論速度"
date: 2026-04-26
category: foundations
description: "LLM 推論における prefill、decode、KV cache、attention 最適化を整理する。"
difficulty: intermediate
plainSummary: "LLM の推論速度はモデルサイズだけで決まりません。prefill、逐次 decode、KV cache、メモリ帯域、attention kernel が体感速度を左右します。"
tags:
  - "AI Developer Core"
lang: ja
draft: false
---

# なぜ推論は遅く見えるのか

LLM の推論は、大きく prefill と decode に分けられる。Prefill は入力全体を読み込み、内部状態を作る段階。Decode は新しい token を一つずつ生成する段階である。ユーザーが感じる初回応答の遅さと、出力の流れる速さは、それぞれ別の要因に影響される。

入力が長ければ prefill が重くなる。出力が長ければ decode が重くなる。総 token 数だけでなく、入力長、出力長、同時実行数、batch、キャッシュの使い方を分けて見る必要がある。

## KV Cache とは

Transformer の各層は、attention のために token ごとの key と value を作る。1000 個目の token を生成するとき、前の 999 個の情報を参照する。毎回すべてを再計算すると無駄が大きいため、過去 token の key/value を保存する。これが KV cache である。

利点は、重複計算を避けられること。代償は、メモリを消費すること。文脈が長く、batch が大きく、層が多いほど KV cache は大きくなる。長文脈推論では、計算能力よりメモリ容量と帯域が先に効いてくる。

## FlashAttention が改善すること

Attention は query、key、value の大きな行列計算を含む。素朴な実装では中間行列の読み書きが重くなる。FlashAttention 系の最適化は、メモリ読み書きを減らし、ハードウェアに合った形で計算を並べる。

アプリ開発者が毎回 kernel を書く必要はない。ただし、推論エンジン、GPU、batch、文脈長によって速度が変わることは理解しておくべきだ。

## 実務上の意味

推論最適化は最後の微調整ではなく、プロダクト設計の一部である。短い Q&A なら初回 token 遅延、キャッシュ、モデルルーティングが重要になる。長文分析なら文脈圧縮、RAG 粒度、prefill コストが重要になる。Agent ならツール結果や履歴を圧縮しないと、低価値な文字列が cache を占有する。

## 試すこと

同じモデルで、1k、8k、32k の入力を用意し、出力上限を 128、512、2048 に変える。初回 token 遅延、総時間、tokens/s、コストを記録する。さらに要約後入力を比較し、品質と速度の差を見る。

## 実務判断：性能最適化は product question から始める

推論最適化で最初に聞くべきことは「どの engine が一番速いか」ではない。ユーザーは first token を待っているのか、streaming を受け入れられるのか、全文を一度に読む必要があるのか、高並列なのか、事前計算や cache が使えるのか。答えによって、最適化の方向は大きく変わる。

短い対話では first token latency が重要になる。長文分析では prefill の圧縮が効く。Agent では tool result と history の制御が効く。offline batch では throughput と cost が重要になる。これらを混ぜて議論すると、立派だが合わない architecture になりやすい。

## 手を動かして試す：latency を四つに分ける

各呼び出しで次の時間を記録する。

- input preparation：RAG、tool call、context formatting。
- prefill：入力を読み、first token が出るまで。
- decode：first token から出力終了まで。
- post-processing：JSON repair、validation、DB write。

分けて測ると、どこを直すべきかが見える。検索を直すべき問題、出力長を直すべき問題、model や推論基盤を変えるべき問題は同じではない。

## 関連して読む

- [Token とコンテキストウィンドウ](../token-context-window/)：長い入力が prefill と cost に効く理由。
- [Token、cost、model choice](../../../academy/ai-basics-for-everyone/what-is-token-cost-model-choice/)：性能と予算を同じ表で見る。
- [Reliable LLM Call](../../../engineering/ai-developer-core/reliable-llm-call-timeout-retry-json-repair/)：timeout、retry、error recovery を同時に設計する。

## 参考

- [Stanford CS336](https://cs336.stanford.edu/)
- [Hung-yi Lee Machine Learning 2026 Spring](https://speech.ee.ntu.edu.tw/~hylee/ml/2026-spring.php)
- [Karpathy build nanoGPT](https://github.com/karpathy/build-nanogpt)
- [Chip Huyen: AI Engineering](https://www.oreilly.com/library/view/ai-engineering/9781098166298/)
