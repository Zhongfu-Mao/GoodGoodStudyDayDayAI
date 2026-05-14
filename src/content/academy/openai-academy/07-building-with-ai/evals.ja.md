---
title: "OpenAI Academy：Evals で AI 品質を工程資産にする"
date: 2026-04-25
category: academy
description: "タスク定義、サンプルセット、rubric、自動評価、人間レビュー、回帰ゲートを通じて、継続的に改善できる AI アプリ品質体系を作る。"
plainSummary: "Evals の価値はモデルに点数を付けることではない。主観的な「良さ」を、再現可能なサンプル、rubric、失敗分類、公開ゲートに変えることだ。"
difficulty: intermediate
coverImage: "/images/academy/openai-academy/07-building-with-ai/evals/evals-lab-cover.png"
tags:
  - Evaluation
  - AI Engineering
lang: ja
academy:
  series: "OpenAI Academy"
  module: "07.3 Evals"
  moduleOrder: 103
  source: "OpenAI Academy"
  sourceUrl: "https://academy.openai.com/home/clubs/builders-etkn1/resources/builder-bootcamp-2026-04-22"
  prerequisites:
    - "先に読むとよい：OpenAI Academy ノート：Building with AI"
draft: false
---

# OpenAI Academy：Evals で AI 品質を工程資産にする

![AI Evals ラボと品質ゲート](/images/academy/openai-academy/07-building-with-ai/evals/evals-lab-cover.png)

AI アプリで危険なのは、「少し試したら良さそうだった」という判断です。

もちろん手触りや直感、手動試用は出発点として重要です。しかしプロダクトを継続改善し、モデルを更新し、prompt を変え、RAG 知識ベースを更新し、Agent tools を増やすなら、次を答えられる必要があります。

- 新バージョンは本当に良くなったか。
- どの場面が良くなり、どの場面が悪くなったか。
- 失敗は特定の入力に集中しているか。
- 自動採点は信頼できるか。
- どの問題は人間レビューが必要か。
- 公開前に品質ゲートがあるか。

Evals の価値は「モデルの賢さを測る」ことではありません。品質を再現可能、比較可能、回帰可能な工程資産に変えることです。

## Eval はタスク定義から始まる

いきなり採点 prompt を書かないことです。先にタスクを定義します。

良いタスク定義には次が含まれます。

| 項目 | 問い |
| --- | --- |
| ユーザー場面 | 誰がどんな状況で使うか |
| 成功基準 | どんな出力なら完了か |
| 失敗コスト | 間違うと何が起きるか |
| 入力範囲 | 正常入力と異常入力は何か |
| 出力制約 | 形式、語調、引用、長さ、権限境界 |
| 人間境界 | どの判断は自動化しないか |

タスク定義が曖昧なら、eval スコアが高くても意味は薄いです。

## サンプルセットは理想入力だけにしない

![実例、境界、失敗、対抗サンプルから作る eval dataset](/images/academy/openai-academy/07-building-with-ai/evals/eval-dataset-design.png)

最小の eval set は 30 から 100 件で始められます。重要なのは数より構成です。

| サンプル種類 | 目的 |
| --- | --- |
| Happy path | 中心機能が動くか |
| Edge case | 境界入力で安定するか |
| Known failure | 過去失敗が直ったか |
| Ambiguous input | 確認・明確化または拒否ができるか |
| Adversarial input | 越権や誘導に弱くないか |
| Real user sample | 実利用に近いか |

happy path だけでは偽の安心感を作ります。価値ある eval set は、失敗ログから増えていきます。

## Rubric：「良い」を判断可能な軸へ分ける

Rubric は採点基準です。「品質が良い」を分解します。

RAG 回答なら次のように分けられます。

| 観点 | 合格基準 |
| --- | --- |
| Correctness | 結論が証拠と一致する |
| Grounding | 重要な結論に出典がある |
| Completeness | 問いの中心部分を網羅している |
| Refusal | 証拠不足で拒否できる |
| Format | プロダクトの出力形式に合う |
| Safety | 漏えい、越権、危険助言がない |

採点は pass/fail でも 1 から 5 点でも構いません。初期は pass/fail のほうが判断が揃いやすいです。

## 自動評価と人間評価を組み合わせる

自動評価が向くものです。

- 形式チェック。
- JSON schema。
- 引用の有無。
- 拒否応答の有無。
- キーワードまたは事実一致。
- 大規模回帰スキャン。

人間評価が向くものです。

- 複雑な判断。
- 語調と読みやすさ。
- 高リスク領域。
- 業務ポリシー。
- ユーザー体験。

モデルを grader にするのも有用です。ただし無条件に信じません。サンプルを人間が確認し、複数 grader を比較し、一致性を見ます。

## 失敗分類は総合点より重要

![継続評価、失敗回流、回帰ゲート](/images/academy/openai-academy/07-building-with-ai/evals/regression-gates.png)

総合点はバージョンの良し悪しを示します。失敗分類はどこを直すべきかを示します。

よくある分類です。

- 指示未遵守。
- 形式エラー。
- 事実エラー。
- 引用エラー。
- 検索漏れ。
- ツール選択エラー。
- 拒否不足。
- 拒否しすぎ。
- 安全境界失敗。
- コストまたは遅延超過。

失敗は次回 eval の候補サンプルにします。そうしないと同じ問題が繰り返されます。

## Evals は公開プロセスに入れる

モデルや prompt の変更を公開する前に、少なくとも三種類の確認をします。

1. **Smoke eval**
   - 小さなサンプルで数分以内に走る。
   - 明らかな破壊を見つける。
2. **Regression eval**
   - 既知失敗と中心場面を網羅する。
   - 公開可否を判断する。
3. **Deep eval**
   - 大きなサンプル、人間レビュー、コスト分析。
   - モデル選定やプロダクト判断に使う。

毎回すべてを走らせる必要はありません。重要なのは、公開判断に証拠を持たせることです。

## ケース：カスタマーサポート返信生成

目標：ユーザーの質問とポリシー文書からサポート返信を生成する。

タスク定義：

- ポリシー外の補償を約束しない。
- 関連ポリシーを引用する。
- 語調は明確、尊重、実行可能。
- ポリシー不足なら人間へ渡す。

eval set：

- 20 件の通常質問。
- 10 件の境界質問。
- 10 件の過去失敗。
- 5 件の越権誘導。

rubric：

- ポリシー遵守。
- 引用の有無。
- 過度な約束がない。
- 人間への引き渡しが正しい。
- 言語が自然。

公開ゲート：

- ポリシー遵守は 100%。
- 引用エラーは 0。
- 言語自然度が低い場合は人間レビュー。

これは「何人かが試す」より保守できます。

## よくあるアンチパターン

**アンチパターン 1：平均点だけを見る。**

平均点は高リスク失敗を隠します。医療、金融、法律、公開操作では critical failure を別に見ます。

**アンチパターン 2：eval set が固定されたまま。**

プロダクト、ユーザー、失敗が変われば eval set も変わります。

**アンチパターン 3：モデル採点だけに頼る。**

モデル grader は有用ですが、人間によるキャリブレーションとサンプルレビューが必要です。

**アンチパターン 4：失敗が回帰しない。**

失敗が回帰サンプルに入らなければ、同じ失敗が戻ります。

## Eval 設計テンプレート

```md
## Task

ユーザー：
入力：
出力：
成功基準：
失敗コスト：

## Dataset

Happy path：
Edge cases：
Known failures：
Adversarial：
Real samples：

## Rubric

| Dimension | Pass Criteria | Critical |
| --- | --- | --- |

## Grading

自動チェック：
モデル採点：
人間レビュー：

## Release Gate

必須通過：
許容する変動：
公開阻止条件：

## Feedback Loop

失敗分類：
回帰集への追加：
更新責任者：
```

## チェックリスト

- タスクに明確な成功基準があるか？
- eval set に実際の失敗サンプルがあるか？
- rubric は複数の評価者が同じように理解できるか？
- 自動採点は人間のサンプル確認でキャリブレーションしているか？
- 総合点だけでなく失敗分類を記録しているか？
- モデル、prompt、RAG、tool の変更で回帰 eval が走るか？
- 公開ゲートは critical failure と通常の品質変動を分けているか？

## さらに読む

- [OpenAI Academy：信頼できる AI Agents を構築する](./agents/)：Agent の結果と実行経路を評価する。
- [OpenAI Academy：RAG を知識ベースから追跡可能な回答へ](./rag/)：検索と生成の失敗を分けて評価する。
- [Eval、Benchmark、プロダクト品質](../../../foundations/ai-developer-core/evals-benchmarks-product-quality/)：評価をプロダクト品質体系へ広げる。

## 参考

- [OpenAI Academy: Builder Bootcamp](https://academy.openai.com/home/clubs/builders-etkn1/resources/builder-bootcamp-2026-04-22)
- [OpenAI Evals Guide](https://platform.openai.com/docs/guides/evals)
- [OpenAI Graders Guide](https://platform.openai.com/docs/guides/graders)
