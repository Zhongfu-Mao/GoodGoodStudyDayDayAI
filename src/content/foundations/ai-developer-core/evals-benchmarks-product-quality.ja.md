---
title: "AI Developer Core：Eval、Benchmark、プロダクト品質"
date: 2026-04-26
category: foundations
description: "モデル benchmark、タスク eval、プロダクト eval を分け、AI アプリの評価優先の考え方を整理する。"
difficulty: intermediate
plainSummary: "Benchmark は標準タスク上のモデル能力を示します。Eval は、自分たちのプロダクトが現実の入力、データ、ツール、制約の中でどれだけ信頼できるかを測ります。"
tags:
  - "AI Developer Core"
  - "Benchmark"
  - "Quality"
lang: ja
draft: false
---

# モデル榜だけでは足りない

モデル benchmark は有用だが、答えている問いは「標準化された問題群でどのモデルが強いか」である。プロダクト eval が答える問いは「自分たちのユーザー、データ、ツール、制約、失敗コストのもとで、このシステムは信頼できるか」である。

AI アプリはモデル単体ではない。prompt、文脈、検索、ツール、権限、キャッシュ、UI、ユーザーフィードバックを含むシステムである。汎用榜で強いモデルが、自分の業務で最良とは限らない。

## 最小の Eval

最小構成の eval は、複雑な基盤なしで始められる。表計算でもよい。

- input：ユーザー入力やタスク。
- context：システムが見られる材料。
- expected：期待される振る舞い。
- rubric：合格と失敗の基準。
- actual：モデル出力。
- label：人間または judge の判定。
- notes：失敗理由。

この表の価値は、感覚で prompt を調整しないことにある。変更のたびに同じ例を走らせ、改善と退化を見えるようにする。

## 失敗モードを集める

良い eval は平均的なサンプルだけではない。答えのない質問、矛盾文書、悪意ある入力、形式異常、長文脈、低品質 OCR、ツール timeout、権限不足、曖昧な依頼を含める。

AI システムで危険なのは、簡単な質問を間違えることだけではない。高リスクな境界条件で、自信を持って間違えることだ。Eval はその境界を開発環境へ先に持ち込むための仕組みである。

## LLM-as-a-Judge の使い方

モデルを評価者として使うと規模を広げられる。ただし、無条件に信じてはいけない。まず人間が小さなセットを評価し、その基準を judge に模倣させる。さらに judge と人間の一致を継続的に確認する。

LLM-as-a-Judge は評価システムの部品であり、判断責任を別モデルへ丸投げするものではない。

## 試すこと

RAG または構造化出力のタスクに 30 件の eval を作る。人間が先にラベル付けし、その後 judge prompt を書く。judge と人間の一致率を見てから、prompt や retrieval を変更し、通過率と新しい失敗種類を見る。

## 実務判断：Eval を開発リズムに入れる

Eval はリリース前に一度だけ走らせるものではない。prompt、retrieval、model、tool が変わるたびに使う開発上の feedback loop である。小さな変更では smoke eval、大きな変更では full eval、production incident の例は regression set に戻す。

評価セット自体も version 管理する。sample の出所、risk level、expected behavior を残す。rubric を変えたら理由を書く。model を上げるときは前後比較を残す。こうして初めて、「良くなった」の原因が model、prompt、data、rubric のどれかを追える。

## 手を動かして試す：三層の eval set

まず三層でよい。

| 層 | 件数 | 用途 |
| --- | ---: | --- |
| smoke | 10 | 毎回走らせ、明らかな regression を見つける |
| regression | 50 | 過去の失敗と高頻度 task を覆う |
| release | 150+ | 公開前に、境界条件と高 risk task を見る |

平台がなくても始められる。Markdown、CSV、Vitest fixture、notebook のどれでもよい。大切なのは、sample が安定し、結果を再現できることだ。

## 関連して読む

- [Eval とは何か](../../../academy/ai-basics-for-everyone/what-is-eval/)：team で評価語彙をそろえる。
- [Evals](../../../academy/openai-academy/07-building-with-ai/evals/)：AI product development に eval を入れる。
- [Production Optimization](../../../academy/openai-academy/07-building-with-ai/production-optimization/)：quality、cost、latency を一緒に見る。

## 参考

- [OpenAI Agent Evals](https://platform.openai.com/docs/guides/agent-evals)
- [OpenAI evaluation flywheel cookbook](https://cookbook.openai.com/examples/evaluation/building_resilient_prompts_using_an_evaluation_flywheel)
- [Hamel Husain: LLM Evals FAQ](https://hamel.dev/blog/posts/evals-faq/)
- [Eugene Yan: An LLM-as-Judge Won't Save The Product](https://eugeneyan.com/writing/eval-process/)
- [Chip Huyen: AI Engineering](https://www.oreilly.com/library/view/ai-engineering/9781098166298/)
