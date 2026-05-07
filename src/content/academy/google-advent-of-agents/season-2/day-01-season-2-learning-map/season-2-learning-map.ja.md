---
title: "Google Advent of Agents S2 Day 1：学習マップと工学の主線"
date: 2026-05-07
category: academy
description: "Season 2 を、ADK から本番治理まで進む 31 日間の学習ルートとして読む。"
plainSummary: "Season 2 Day 1 を、設計境界、実践タスク、本番リスク、チェックリストに整理したオリジナル講義ノート。"
difficulty: advanced
coverImage: "/images/academy/google-advent-of-agents/season-2/day-01-season-2-learning-map/cover.svg"
tags:
  - "AI/Agents"
  - "AI/Engineering"
lang: ja
academy:
  series: "Google Advent of Agents"
  module: "Season 2 Day 01：Season 2 Kick Off"
  moduleOrder: 201
  source: "Google Cloud Advent of Agents Season 2"
  sourceUrl: "https://adventofagents.com/2026/03/01"
  prerequisites:
    - "先に読むとよいもの：Google Advent of Agents：エージェント工学の実践マップ"
draft: false
---

![Google Advent of Agents S2 Day 1：学習マップと工学の主線 カバー](/images/academy/google-advent-of-agents/season-2/day-01-season-2-learning-map/cover.svg)

**注記：** このページは Google Advent of Agents Season 2 Day 1 の公開テーマを主線にし、Season 1 の関連トピックを補助線として使った学習ノートです。公式翻訳ではなく、本站向けのエージェント工学講義として再構成しています。

## この日の問い

Season 2 を、ADK から本番治理まで進む 31 日間の学習ルートとして読む。

単なるチュートリアルとして読むと、読んだだけで終わります。ここでは「今日、エージェントシステムにどんな検査可能な能力を増やすのか」と考えます。

今日の成果物は、各日を具体的な成果物に対応させた学習ロードマップです。

## 学習フロー

![Day 01 学習フロー図](/images/academy/google-advent-of-agents/season-2/day-01-season-2-learning-map/diagram.svg)

この図は、問題、設計、artifact、eval、本番リスクの五段階で読むためのものです。エージェント工学で大切なのは、概念を知ることだけではなく、システムに検証可能な変化を残すことです。

## 三つの要点

- ルートは目次ではなく成果物の列である。
- Day 2-21 は構築と協調、Day 22-31 は本番治理に寄る。
- 各記事は再利用できる artifact を残す。

この三点を、自分の実装を読むときの観点にします。どれか一つでも説明できないなら、まだ demo の域を出ていない可能性があります。

## 設計の型

Day 1 を実プロジェクトに入れるなら、次の表を先に埋めます。

| 設計項目 | 書くべきこと |
| --- | --- |
| 入力 | ユーザー、システム、上流 Agent から何を受け取るか。 |
| 出力 | 下流が依存できる構造化結果は何か。 |
| 状態 | 今回だけの状態と長期保存する情報をどう分けるか。 |
| 権限 | どのツールに読み取り専用、承認、ユーザー ID が必要か。 |
| 失敗 | 呼び出し失敗、不確実、権限不足のときどう止まるか。 |
| 観測 | どの span、artifact、ログを残すか。 |

この表は地味ですが、実務では効きます。「賢い Agent」を「レビューできるシステム境界」に変えるための道具です。

## 公開レベルのケース

Season 2 を 31 日間の社内トレーニングとして扱います。各日の終わりに「学んだ」ではなく、必ず artifact を残す運用です。第一週は Agent 骨格、tool 境界、memory policy、Skills、第二週は multi-agent 編成、第三週は enterprise entry、RAG、Harness、最後の十日は eval、安全、deploy、identity、observability に集中します。

## 実装スケッチ

これは完全なコードではありません。公開前に設計メモや README に残す構造化スケッチです。reviewer が境界、状態、受入条件を確認できるようにします。

```yaml
artifact_log:
  day: 1
  output: learning-roadmap.md
  owner: learner
  review_question: 各日の終わりに、システムへどの検査可能な能力が増えたか。
```

## ケース分解

- **業務トリガー：** 新メンバーやチームが Agent 工学を体系的に学びたいが、材料が記事や動画に散らばっている。
- **Agent 境界：** コース自体も Agent project として扱い、毎日一つだけ検査可能な能力を増やす。
- **受入証拠：** 31 個の artifact が学習マップとしてつながり、翌日の材料として再利用できる。

## 最小 Lab

`agent-labs` ディレクトリを作り、各日のコード、図、eval、振り返りを分けて保存する。

進め方：

1. 先にタスク境界を書く。
2. 5 ノード以内のフロー図を描く。
3. 最小の入力と出力 schema を書く。
4. happy path だけを実装する。
5. すぐに失敗経路のテストを一つ足す。
6. 実行ログを残し、後から各ステップを説明できるか確認する。

最後に `README.md` を残し、学び、不安定な点、次に補う点を書きます。

## Season 1 で補う背景

Season 1 Day 1 / Day 25：開始と総復習として背景を補う。

Season 1 は「ゼロから本番へ」の基礎線、Season 2 はその実践を厚くする線です。Day 1 を読むときは、Season 1 のどの層を参照しているのかだけ押さえれば十分です。

## 本番化リスク

| リスク | 確認する問い |
| --- | --- |
| 境界が曖昧 | これは prompt、tool、skill、memory、Agent、UI のどれか。 |
| 権限が広すぎる | このタスクに不要なデータや操作に触れていないか。 |
| 再現できない | 入力、ツール呼び出し、出力、中間 artifact を追えるか。 |
| eval がない | 次回品質が落ちたとき、CI やレビューで見つけられるか。 |
| コストが膨らむ | 低リスクで検証可能な処理まで高コスト経路にしていないか。 |

これらは本番前の文書ではなく、最初の lab から設計に入れるものです。

## チェックリスト

- Day 1 の工学的問いを一文で説明できる。
- 読むだけでなく、検査できる artifact を残した。
- 関連する Season 1 の補助テーマを把握した。
- 最小 lab の入力、出力、失敗経路を書いた。
- 本番化前の権限、観測、eval リスクを少なくとも一つ言える。

## 参考リソース

- [Advent of Agents Season 2 Day 1](https://adventofagents.com/2026/03/01)
- [Advent of Agents Season 2 Archive](https://adventofagents.com/2026/03/)
- [Advent of Agents Season 1 Archive](https://adventofagents.com/2025/12/)
- [Google ADK Documentation](https://google.github.io/adk-docs/)
