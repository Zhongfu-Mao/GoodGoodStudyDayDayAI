---
title: "OpenAI Academy：信頼できる AI Agents を構築する"
date: 2026-04-25
category: academy
description: "Agent を demo から運用可能なシステムへ進めるための、目標境界、ツール権限、状態管理、人間チェックポイント、評価、可観測性。"
plainSummary: "信頼できる Agent は、モデルにループを足しただけではない。目標、ツール、状態、権限、チェックポイント、評価、ロールバックを備えたシステムである。"
difficulty: intermediate
coverImage: "/images/academy/openai-academy/07-building-with-ai/agents/agent-system-cover.png"
tags:
  - Agent
  - Building with AI
lang: ja
academy:
  series: "OpenAI Academy"
  module: "07.2 Building Agents"
  moduleOrder: 102
  source: "OpenAI Academy"
  sourceUrl: "https://academy.openai.com/home/clubs/builders-etkn1/resources/builder-bootcamp-2026-04-22"
  prerequisites:
    - "先に読むとよい：OpenAI Academy ノート：Workspace Agents"
draft: false
---

# OpenAI Academy：信頼できる AI Agents を構築する

![本番 Agent システムの制御面](/images/academy/openai-academy/07-building-with-ai/agents/agent-system-cover.png)

Agent は「モデルが自分で計画し、ツールを呼び、タスクを完了するもの」と説明されがちです。この説明は間違いではありませんが、実務には少し粗すぎます。

実際のプロダクトで重要なのは、モデルが次の一手を思いつけるかだけではありません。

- いつ行動し、いつ止まるべきか。
- どのツールを使ってよく、どのツールは確認が必要か。
- ツールが失敗したとき、再試行、フォールバック、方針変更、人間への引き渡しのどれを選ぶか。
- 各アクションにログ、証拠、再現経路があるか。
- 完了はモデルの自己申告ではなく、評価基準で確認されているか。

信頼できる Agent は次のように定義できます。

**Agent とは、明確な目標、制御されたツール、記録可能な状態、評価ループの中で行動する AI システムである。**

## いつ Agent が必要か

すべての AI 機能を Agent にする必要はありません。一回のモデル呼び出し、固定 workflow、従来のスクリプトのほうが安定するタスクも多くあります。

Agent が向くタスクには次の特徴があります。

| 特徴 | 説明 | 例 |
| --- | --- | --- |
| 複数ステップ | 中間結果によって次の行動が変わる | コード修正、調査レポート、複雑な問い合わせ |
| ツール依存 | 外部システムを読む、または操作する | 検索、DB、ファイル、チケット、カレンダー |
| 状態変化 | 進捗と分岐がある | 長文整理、移行作業、実験分析 |
| 不確実性 | すべての経路を事前に固定できない | 調査、障害対応、横断調整 |
| 受け入れ基準 | 品質確認が必要 | テスト通過、引用完備、承認完了 |

Agent に向かないタスクです。

- 単発の分類、要約、書き換え。
- ルールが明確で経路が固定された batch 処理。
- 高リスクでロールバックできない操作。
- ログ、権限、人間チェックポイントがない自動書き込み。

Agent は複雑性に対する工程コストです。固定 workflow の範囲を超えたときにだけ導入する価値があります。

## Agent の構成要素

運用できる Agent には少なくとも六つの層があります。

| 層 | 役割 | 失敗の兆候 |
| --- | --- | --- |
| Objective | 目標、境界、完了条件を定義する | 忙しそうだが終わりが分からない |
| State | 計画、進捗、証拠、失敗を保存する | 再試行で文脈を失い、再現できない |
| Tools | 外部システムへ接続する | ツール過多、権限過大、引数不安定 |
| Policy | 行動、質問、停止を判断する | 高リスク操作に確認がない |
| Evaluation | 結果が基準を満たすか判断する | 自己評価は通るがユーザーは不満 |
| Observability | trace、コスト、遅延、エラーを記録する | 失敗後に最終回答しか読めない |

prompt と tools だけの Agent は demo では動きます。しかし運用能力は、policy、eval、observability、復旧経路から生まれます。

## ツールは多ければよいわけではない

![Agent ツール境界と権限マトリクス](/images/academy/openai-academy/07-building-with-ai/agents/tool-boundary-matrix.png)

ツールが多いほど、Agent の行動空間は広がります。同時に失敗空間も広がります。

まず権限を分けます。

| ツール種類 | リスク | デフォルト方針 |
| --- | --- | --- |
| Read | ファイル読み取り、検索、知識ベース照会 | 自動実行可。ただし出典を記録 |
| Draft | 草稿作成、ローカル候補変更 | 自動実行可。外部公開はしない |
| Write | ファイル変更、チケット更新、DB 書き込み | ディレクトリ、項目、範囲を限定 |
| External | メール、メッセージ、公開、支払い | 実行前に人間確認 |
| Destructive | 削除、上書き、本番リソースの取り消し | 強い承認がない限り無効 |

ツール説明は API 契約のように明確にします。

- 何をするか。
- 何をしないか。
- 入力 schema。
- 出力 schema。
- エラーコード。
- 副作用の有無。
- 再試行できるか。

曖昧なツールは、曖昧な判断を誘発します。

## 状態管理：Agent の記憶は会話履歴ではない

会話履歴全体を Agent 状態として扱うシステムは多いですが、長くなるほど脆くなります。

状態は構造化したほうが安定します。

```ts
type AgentState = {
  goal: string;
  constraints: string[];
  plan: Array<{ id: string; status: 'pending' | 'running' | 'done' | 'blocked' }>;
  evidence: Array<{ stepId: string; artifact: string; source: string }>;
  failures: Array<{ stepId: string; reason: string; retryCount: number }>;
  approvals: Array<{ action: string; status: 'approved' | 'rejected' }>;
};
```

この形にすると、次が可能になります。

- 全体再実行ではなく局所リトライ。
- 完了状態と証拠の分離。
- ユーザー中断後の復帰。
- 各ステップの監査。
- 失敗サンプルの eval 化。

会話履歴は体験には有用ですが、実行システムの唯一の状態には向きません。

## 人間チェックポイントは行動前に置く

信頼できる Agent は、まったく人に聞かない Agent ではありません。本当に重要な箇所だけで人に聞く Agent です。

確認が必要な場面です。

- 外部に見える動作：メール送信、公開、コメント。
- 実書き込み：DB 更新、注文作成、コード merge。
- コスト動作：大量 API 呼び出し、長時間推論、媒体生成。
- 低信頼：証拠衝突、ツール連続失敗、根拠を説明できない。
- 不可逆：削除、上書き、取消、支払い。

チェックポイントには十分な情報を含めます。

```md
## Action Requiring Approval

実行予定：
影響範囲：
必要な理由：
代替案：
失敗時の戻し方：
```

ユーザーが確認すべきなのは、モデルの内部過程ではなく、業務上の action です。

## Agent を評価する：結果と経路を見る

![Agent trace と評価信号](/images/academy/openai-academy/07-building-with-ai/agents/agent-trace-evaluation.png)

通常の LLM アプリでは最終出力だけを評価することがあります。Agent では実行経路も評価します。

| 観点 | 問い |
| --- | --- |
| Task success | 最終タスクは完了したか |
| Tool correctness | 正しいツールと引数を選んだか |
| Grounding | 重要な結論に証拠があるか |
| Safety | 越権、漏えい、高リスク操作がないか |
| Efficiency | 明らかに冗長な経路を取っていないか |
| Recovery | ツール失敗後に妥当に回復したか |
| Human handoff | 人に聞くべき場面で聞いたか |

成功率だけでは不十分です。失敗分類も記録します。

- 計画エラー。
- ツール選択エラー。
- 引数エラー。
- 文脈不足。
- 権限不足。
- 評価誤判定。
- ユーザー目標の変化。

分類があると、次に直すべきものが prompt、tool、state、permission、eval のどれか分かります。

## ケース：調査アシスタントを Agent にする

目標：ユーザーが与えたテーマについて、出典付きの調査ブリーフを出す。

制御可能な設計です。

1. `clarify`
   - テーマが十分に明確か判断する。
   - 広すぎる場合は先に質問する。
2. `plan`
   - 調査問い、候補ソース、出力構造を作る。
3. `retrieve`
   - 検索、文書読み取り、知識ベースツールを呼ぶ。
   - 出典と時点を保存する。
4. `synthesize`
   - 証拠だけに基づいて草稿を作る。
5. `review`
   - 出典なし断定がないか確認する。
   - 反例や未対応点を確認する。
6. `deliver`
   - ブリーフ、出典、信頼度、未対応問題を出す。

外部公開まで自動化しないほうが安全です。公開は別 action とし、人間確認を挟みます。

## よくあるアンチパターン

**アンチパターン 1：Agent を長い Prompt と考える。**

Agent は文案ではなくシステムです。状態、ツール境界、評価がなければ、長い Prompt は失敗を見えにくくします。

**アンチパターン 2：最初から全権限を渡す。**

read-only と draft-only から始め、trace と eval が安定してから書き込みを開きます。

**アンチパターン 3：最大リトライ回数がない。**

Agent には予算、時間、リトライ上限が必要です。無限ループは知性ではなく障害です。

**アンチパターン 4：最終回答だけを見る。**

回答が合っていても、経路が越権していたりコストが高すぎたりすれば不合格です。

## 設計テンプレート

```md
### Agent Card

目標：
責任範囲外：
ユーザー：
入力：
出力：

### Tools

| Tool | Permission | Side Effect | Approval |
| --- | --- | --- | --- |

### State

保存するもの：
捨ててよいもの：
復旧方法：

### Policy

自動実行条件：
必ず質問する条件：
停止条件：

### Evaluation

成功基準：
経路チェック：
失敗分類：
回帰サンプルの出所：
```

> **記入例（Customer support agent）**
>
> 目標：ticket、order status、policy docs から review 可能な返信 draft を作ります
> 責任範囲外：自動返金、account 変更、最終 email 送信です
> ユーザー：一次 support 担当者と escalation 担当者です
> 入力：ticket_id、ユーザーメッセージ、order status、policy snippets
> 出力：返信 draft、証拠引用、risk label、next step 提案です
> Tools：ticket_read=read/no side effect/no approval；order_lookup=read/no side effect/no approval；refund_request=write/side effect/approval required
> State：保存するもの=ticket_id、draft_version、evidence_ids；捨ててよいもの=中間 reasoning；復旧方法=ticket_id で context を再構築します
> Policy：自動実行条件=read-only query と draft generation；必ず質問する条件=compensation、refund、account restriction；停止条件=policy conflict または evidence 不足です
> Evaluation：成功基準=事実が正確で tone が compliant；経路チェック=evidence は policy/order tools 由来にします；失敗分類=hallucination、policy_violation、tone_issue；回帰サンプルの出所=人間 escalation ticket です

## チェックリスト

- そのタスクが本当に Agent を必要とすることを確認したか？
- ツールは read、draft、write、external に分けたか？
- 状態は構造化され、会話履歴だけに依存していないか？
- 最大リトライ、予算、時間上限があるか？
- 高リスク action は実行前に確認されるか？
- eval は最終結果と実行経路の両方を見ているか？
- trace は失敗を再現できる粒度か？

## さらに読む

- [OpenAI Academy：評価 (Evals)](./evals/)：Agent の行動を比較可能な品質信号に変える。
- [OpenAI Academy：RAG 技術パス](./rag/)：Agent の回答を追跡可能な証拠に基づかせる。
- [Agentic Workflows：状態機械で AI タスクを分解する](../../agentic-workflows-02/)：復旧可能な workflow を状態機械として設計する。

## 参考

- [OpenAI Academy: Builder Bootcamp](https://academy.openai.com/home/clubs/builders-etkn1/resources/builder-bootcamp-2026-04-22)
- [OpenAI Agents Guide](https://platform.openai.com/docs/guides/agents)
- [OpenAI Function Calling Guide](https://platform.openai.com/docs/guides/function-calling)
