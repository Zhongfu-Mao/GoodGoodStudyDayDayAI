---
title: "Google Advent of Agents：マルチエージェント編成パターン"
date: 2026-05-06
category: academy
description: "Sequential、Coordinator、Parallel Fanout、Hierarchical、Generator-Critic、Human in the Loop を、パターン選択の視点で整理する。"
plainSummary: "この図解ノートでは、複雑なマルチエージェントを最初から作るのではなく、タスク構造に合う最小の編成を選ぶ考え方をまとめる。"
difficulty: advanced
coverImage: "/images/academy/google-advent-of-agents/covers/04-multi-agent-orchestration.svg"
tags:
  - "AI/Agents"
  - "AI/Engineering"
lang: ja
academy:
  series: "Google Advent of Agents"
  module: "04 マルチエージェント編成"
  moduleOrder: 124
  source: "Google Cloud Advent of Agents"
  sourceUrl: "https://adventofagents.com/2026/03/08"
  prerequisites:
    - "先に読むとよいもの：Google Advent of Agents：ツールとプロトコルの境界"
draft: false
---

![マルチエージェント編成カバー](/images/academy/google-advent-of-agents/covers/04-multi-agent-orchestration.svg)

**注記：** このページは Advent of Agents Season 2 の Sequential Agents、Coordinator / Dispatcher、Parallel Fanout、Hierarchical Decomposition、Generator-Critic、Human in the Loop などを学習用に再構成したものです。日別の翻訳ではなく、「いつ複数エージェントが必要で、いつ単なる workflow でよいのか」を扱います。

## 解きたい問題

マルチエージェントは「数が多いほど賢い」と誤解されがちです。

実際には、エージェントを増やすたびにコストも増えます。

- 状態同期：各エージェントが見ている情報は同じではない。
- 責任境界：失敗が計画、検索、実行、統合のどこで起きたか分かりにくい。
- 遅延と費用：並列やループは呼び出し回数を増やす。
- 評価：最終回答だけでなく中間軌跡も見なければならない。
- 体験：ユーザーにはシステムの動きが見えにくい。

したがって第一原則は、エージェントを細かく増やすことではありません。**実際のタスク構造を表すために必要な最小数にすること**です。

## パターン選択図

![マルチエージェントパターン選択図](/images/academy/google-advent-of-agents/diagrams/multi-agent-decision-tree.svg)

パターン名から始めるのではなく、タスクの難しさから選びます。

| タスクの難しさ | 向いているパターン | 例 |
| --- | --- | --- |
| 手順が固定されている | Sequential | 抽出、草稿、整形。 |
| 複数の専門家から一つを選ぶ | Coordinator / Dispatcher | 法務、財務、技術への振り分け。 |
| 独立した証拠を並列に集める | Parallel Fanout | 複数ソース調査、競合比較、ログ分析。 |
| 大きなタスクを子タスクツリーに分ける | Hierarchical | 移行計画、大規模調査、プロジェクト計画。 |
| 品質を批評しながら上げる | Generator-Critic | 文章、コード、提案書。 |
| 高リスク操作を人間が承認する | Human in the Loop | 送信、削除、デプロイ、権限変更。 |

本番では複数パターンを組み合わせることもあります。ただし学習や初期実装では、一つずつ単独で動かす方が安全です。

## Sequential：明確なパイプライン

順序が決まっているなら、毎回 planner に考えさせる必要はありません。

1. 入力を解析する。
2. 情報を取得する。
3. 候補回答を作る。
4. 事実と形式を確認する。
5. 出力する。

Sequential の強みはテストしやすさです。各ステップに入力と出力があり、ログ、再実行、断言ができます。多くの「マルチエージェントっぽい」タスクは、まず sequential workflow で十分です。

## Coordinator / Dispatcher：専門家へルーティング

Coordinator は、問題の種類ごとに別の専門エージェントへ渡すときに使います。

役割は次の通りです。

- タスク分類を行う。
- 適切な専門エージェントを選ぶ。
- 必要な文脈だけを渡す。
- 結果をまとめてユーザーに返す。

リスクはルーティングミスです。たとえば「クラウド契約の SLA リスク」を技術問題だけと見なすと、法務観点を落とします。Coordinator は最終回答だけでなく、選択理由も評価対象にするべきです。

## Parallel Fanout：並列証拠収集

Parallel Fanout は、独立した証拠を複数方向から集めるときに向いています。

AI 製品調査なら、次のように分けられます。

- 公式ドキュメント。
- 価格と制限。
- コミュニティの評判。
- 競合比較。
- 既存コードベースへの影響。

危険なのは、全分岐に同じ曖昧な依頼を投げることです。結果が重複し、費用だけが増えます。各分岐には証拠範囲、出力 schema、矛盾時の扱いを指定します。

## Hierarchical：大きなタスクの分解

Hierarchical は、システム移行や大型調査のような複雑タスクに向いています。

トップレベルの manager はすべてを自分で実行せず、子目標を作ります。

- 現状調査。
- データ移行。
- 権限モデル。
- ネットワークとデプロイ。
- 監視とロールバック。
- ユーザー教育。

強力ですが、制御がないと暴走します。タスク境界、完了条件、中間 artifact、予算、人間のレビュー点が必要です。

## Generator-Critic：品質ループ

Generator-Critic は、文章、コード、計画、レビューのように品質が重要な出力に向いています。

流れはシンプルです。

1. Generator が草稿を作る。
2. Critic が rubric に沿って問題を出す。
3. Generator が具体的な指摘に基づいて修正する。
4. 品質閾値または予算に達したら止める。

良い critic は「もっと改善して」ではなく、「この結論には証拠がない」「この手順は実行できない」「この権限リスクが未処理」といった具体的な指摘を出します。

## Human in the Loop：承認をシステム能力にする

Human in the Loop は、モデルが賢くないから人を呼ぶものではありません。高リスク操作の制御面です。

人間承認が必要な例：

- メールや通知の送信。
- データ削除、上書き、移行。
- 購入、支払い、注文。
- 権限、鍵、ネットワークの変更。
- 外部への約束や公開。

良い承認 UI は、何をするのか、なぜ必要か、何に影響するか、取り消せるか、代替案は何か、承認後に何が実行されるかを示します。

## 概念コード

```python
def research_report(question: str) -> dict:
    plan = planner.run(question)

    evidence = parallel_fanout.run([
        {"agent": "official_docs", "scope": plan["official_sources"]},
        {"agent": "pricing", "scope": plan["pricing_questions"]},
        {"agent": "community", "scope": plan["community_risks"]},
    ])

    draft = writer.run(question=question, evidence=evidence)
    review = critic.run(draft=draft, rubric="evidence, usefulness, risk")

    if review["risk_level"] == "high":
        approval = human_approval.request(review["required_action"])
        if not approval["approved"]:
            return {"status": "stopped", "reason": approval["reason"]}

    return writer.revise(draft=draft, review=review)
```

fanout、critic、人間承認が入っていますが、それぞれの責任は分かれています。単純な要約なら、この構造は重すぎます。

## 観測と評価

マルチエージェントでは最終回答だけを見ても足りません。

- coordinator がなぜ専門家を選んだか。
- fanout の各分岐が何を調べたか。
- critic が具体的な問題を出したか。
- human approval が十分な情報を示したか。
- 最終回答が中間結果を正しく使ったか。

trace、span、artifact、replay が必要になる理由はここにあります。

## 復習タスク

複雑なタスクをひとつ選び、まずコードを書かずに設計します。

1. 目標と失敗時の代償を書く。
2. 本当に複数エージェントが必要か判断する。
3. 主パターンをひとつ選ぶ。
4. 各エージェントの入力、出力、禁止事項を書く。
5. 人間が読める trace を設計する。
6. もっとも起きやすい routing または synthesis の失敗を捕まえる eval を作る。

## チェックリスト

- マルチエージェントが状態、遅延、費用、評価コストを増やすと理解している。
- sequential、coordinator、fanout、hierarchy、critic、HITL をタスク難度で選べる。
- 普通のツールを不要にサブエージェント化しない。
- 各エージェントの入力、出力、禁止事項を書ける。
- 中間軌跡を評価対象にできる。
- 編成パターンとプロトコル境界を区別できる。

## 参考リソース

- [Advent of Agents](https://adventofagents.com/)
- [Season 2: Multi-Agent Patterns: Sequential Agents](https://adventofagents.com/2026/03/08)
- [Season 2: Multi-Agent Patterns: Coordinator/Dispatcher Agents](https://adventofagents.com/2026/03/09)
- [Season 2: Multi-Agent Patterns: Parallel Fanout and State Interpolation](https://adventofagents.com/2026/03/10)
- [Season 2: Multi-Agent Patterns: Hierarchical Decomposition](https://adventofagents.com/2026/03/11)
- [Season 2: Multi-Agent Patterns: Generator-Critic Agent Loop](https://adventofagents.com/2026/03/12)
- [Google ADK Documentation](https://google.github.io/adk-docs/)
