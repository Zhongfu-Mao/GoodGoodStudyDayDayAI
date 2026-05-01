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

# なぜ推論は遅く感じるのか

LLM の推論は、大きく **Prefill（プリフィル）** と **Decode（デコード）** の 2 つのフェーズに分けられます。Prefill は入力全体を読み込み、コンテキストを内部状態に変換する段階です。Decode は新しいトークンを一つずつ生成する段階です。ユーザーが体感する「初回応答の遅さ（TTFT）」と「出力の流れる速さ（TPS）」は、それぞれこの 2 つのフェーズに依存しています。

入力が長ければ Prefill が重くなり、出力が長ければ Decode が重くなります。プロダクション環境では、総トークン数だけでなく、入力長、出力長、同時実行数、バッチ（Batch）サイズ、キャッシュ（Cache）のヒット率を切り分けて分析する必要があります。

## KV Cache（KV キャッシュ）とは

Transformer の各層では、Attention（アテンション）計算のためにトークンごとの Key と Value が生成されます。1000 個目のトークンを生成する際、モデルは前にある 999 個の情報を参照する必要があります。毎回すべてを再計算すると重複計算が積み重なり、推論コストが大きく増えるため、過去のトークンの Key/Value を保存しておき、新しいトークンの計算時に再利用します。これが **KV Cache** です。

利点は、重複計算を避けられることです。一方で、その代償はメモリ（VRAM）の消費です。文脈が長く、バッチサイズが大きく、層が深いほど、KV Cache は膨大になります。長文脈推論のボトルネックは、多くの場合、計算能力ではなくメモリ容量と帯域（メモリ帯域幅）にあります。

## FlashAttention が改善すること

Attention 計算は、Query、Key、Value の間での膨大な行列演算を伴います。素朴な実装では中間行列の読み書きが発生し、メモリ帯域のコストが非常に高くなります。FlashAttention 系の最適化の核心は、メモリの読み書きを最小限に抑え、ハードウェア（GPU の SRAM など）の特性に最適化した形で計算を構成することにあります。

アプリケーション開発者が直接カーネル（Kernel）を書く必要はありませんが、こうした低レイヤーの最適化が推論エンジンのパフォーマンスを左右し、それがモデルのデプロイ戦略に直結することは理解しておくべきです。

## 実務上の意味

推論の最適化は、開発の最後に行う微調整ではなく、プロダクト設計そのものの一部です。

- **短い Q&A プロダクト**：初回トークンレイテンシ（TTFT）、キャッシュ戦略、モデルルーティングが重要です。
- **長文分析プロダクト**：文脈圧縮、RAG の粒度、Prefill コストの削減、長文脈下での安定性が重要です。
- **Agent（エージェント）プロダクト**：ツールの実行結果や履歴を適切に要約・圧縮しないと、価値の低いテキストで KV Cache が埋め尽くされ、レスポンスの低下とコスト増を招きます。

## 検証のステップ：ベンチマークを録る

同じモデルで、1k、8k、32k の入力長を用意し、出力上限を 128、512、2048 と変えながらテストを実施します。TTFT、総実行時間、Tokens/s (TPS)、コストを記録しましょう。また、「要約後の入力」を使用した場合の品質と速度の差も比較してください。

この実験により、推論速度は抽象的な数値から、具体的な設計上の制約へと変わります。コンテキストは無料のリソースではなく、メモリと時間をリアルタイムで消費する「実行状態」そのものであることが理解できるはずです。

## 実務判断：性能最適化はプロダクトの問いから始まる

推論の最適化において、最初にすべきことは「どのエンジンが最速か」を問うことではありません。まず、プロダクトとしてどのような体験が必要かを明確にします。

ユーザーは最初の 1 文字（First Token）を待っているのか？ ストリーミング出力は許容されるか？ 全文を一度に読み込む必要があるのか？ 高並列処理が求められるのか？ 事前計算やキャッシュが活用できるか？

これらの問いへの答えによって、最適化の方向性は全く異なります。
- **対話プロダクト**：TTFT の短縮を最優先。
- **長文分析**：Prefill フェーズの負荷軽減を重視。
- **Agent**：ツール結果と履歴コンテキストの制御が鍵。
- **オフラインバッチ**：スループット（Throughput）とコスト効率を重視。

## 手を動かして試す：レイテンシを 4 つに分解する

各呼び出しにおいて、以下の 4 つの時間を計測・記録します。

1. **入力準備（Input Prep）**：RAG 検索、ツール呼び出し、コンテキストのフォーマット。
2. **Prefill**：入力を読み込み、最初のトークンが出るまで。
3. **Decode**：最初のトークンから出力終了まで。
4. **後処理（Post-processing）**：JSON の修復、バリデーション、DB への書き込み。

このように分解することで、ボトルネックが「検索」にあるのか、「出力長」にあるのか、それとも「モデルやインフラ」にあるのかが明確になります。


## 関連して読む

- [Token とコンテキストウィンドウ](../token-context-window/)：長い入力が prefill と cost に効く理由。
- [Token、cost、model choice](../../../academy/ai-basics-for-everyone/what-is-token-cost-model-choice/)：性能と予算を同じ表で見る。
- [Reliable LLM Call Skeleton](../../../engineering/ai-developer-core/reliable-llm-call-skeleton/)：timeout、retry、error recovery を同時に設計する。

## 参考

- [Stanford CS336](https://cs336.stanford.edu/)
- [Hung-yi Lee Machine Learning 2026 Spring](https://speech.ee.ntu.edu.tw/~hylee/ml/2026-spring.php)
- [Karpathy build nanoGPT](https://github.com/karpathy/build-nanogpt)
- [Chip Huyen: AI Engineering](https://www.oreilly.com/library/view/ai-engineering/9781098166298/)
