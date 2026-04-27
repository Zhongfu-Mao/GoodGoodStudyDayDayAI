---
title: "AI Developer Core：Agent Harness のログ、承認、リプレイ"
date: 2026-04-26
category: engineering
description: "Agent 実行環境を、観測、承認、停止、リプレイができる harness として設計する。"
difficulty: advanced
plainSummary: "Agent Harness はモデル外側の実行環境です。ツール公開、権限制御、ログ、失敗復旧、回放、評価を決めます。"
tags:
  - "AI Developer Core"
  - "Observability"
lang: ja
draft: false
---

# Harness はモデル外側の工程層

Agent の信頼性はモデルだけで決まらない。モデルが置かれる実行環境で決まる。この環境を harness と呼ぶことができる。Harness は、ツール、状態、文脈、権限、ログ、評価、停止条件をモデルへ与える。

Harness の目的は Agent を自由にすることではない。その自由を観測し、制限し、復旧できるようにすることだ。

## ログは意思決定経路を記録する

通常のアプリログは request と response を記録する。Agent ログでは各ステップを見る必要がある。

- 現在の目標。
- 状態要約。
- モデルが選んだ action。
- ツール入力。
- ツール出力の要約。
- 検証結果。
- 人間の承認。
- 次の状態。

これは思考の展示ではなく、システム挙動のデバッグである。なぜ同じ検索を繰り返したか、なぜテストを呼ばなかったか、なぜ次の手順へ進んだかを trace から追えるようにする。

## 承認はポップアップではない

承認はリスクレベルに基づくべきだ。読み取り検索は自動許可でよい。機密ファイルの読み取りは確認が必要かもしれない。ファイル書き込み、メール送信、注文、削除は承認が必要だ。高リスク action では diff、目的、理由、戻し方を表示する。

良い承認ノードは、人間に判断材料を渡す。何をするのか、なぜするのか、影響範囲は何か、しない場合どうなるのかを示す。

## Replay で再現可能にする

Agent bug の難しさは再現性にある。Replay は、入力、ツール結果、モデル設定、prompt version、状態遷移を保存する。あとから実外部システムを再度呼ばずに実行を再現し、どの段階で悪くなったかを調べられる。

Replay は eval にもなる。過去の成功 trace と失敗 trace を regression set にし、prompt、tool、model を変えた後に再実行する。

## 停止条件は安全機構

長時間 Agent には停止条件が必要だ。最大ステップ、最大コスト、連続失敗、情報増分なし、ユーザー待ち、リスク上昇、目標完了。停止条件のない Agent は自動化ではなく、制御されていない loop である。

## 実験目標

この実験では、賢い Agent を急いで作らない。まず Agent の外側にある実行 shell を設計する。残すものは次の五つ。

- trace schema。
- tool 権限表。
- approval matrix。
- replay fixture。
- 失敗注入サンプル。

これがないと、Agent の成功は魔法に見え、失敗も魔法に見える。Harness の価値は、その魔法を検査可能な工程へ戻すことにある。

## Trace Schema

まずは JSONL で、一 step 一行にする。

```json
{
  "run_id": "run_001",
  "step": 3,
  "goal": "記事 frontmatter を修復する",
  "state_summary": "2 つの欠損フィールドを発見",
  "action": "read_file",
  "tool_input": {"path": "src/content.config.ts"},
  "tool_output_summary": "schema 読み取り成功",
  "approval": "auto_readonly",
  "status": "ok",
  "next": "patch を生成する"
}
```

最終回答だけを記録しない。Agent の品質は中間ステップに現れる。特に tool 選択、tool 入力、state 更新は debug の中心である。

## Approval Matrix

承認は四段階に分けられる。

| 等級 | 動作 | 方針 |
| --- | --- | --- |
| L0 | 公開 index の読み取り、一覧取得 | 自動許可 |
| L1 | 通常ファイル読み取り、読み取り専用 check | 自動または軽い確認 |
| L2 | ファイル書き込み、patch 生成、高コスト command | 人間確認 |
| L3 | 削除、commit、push、メール送信、外部有料 API | 強い承認と影響表示 |

Matrix は tool と結びつける。モデルは action を要求できるだけで、harness が許可を決める。

## Replay Fixture

Replay には、ユーザー依頼、prompt version、model config、各 step の tool output、approval decision、最終結果を保存する。これにより、外部システムを再度呼ばずに一回の実行を再現できる。

Replay は eval にもなる。手書き benchmark より、実際の失敗 trace のほうが価値がある。ローカルでも本番でも、失敗を replay 可能なサンプルに変える。

## 失敗注入

最低でも次を試す。

1. Tool が空結果を返す。
2. Tool が timeout する。
3. モデルが越権 tool を要求する。
4. 連続二 step で新情報がない。
5. 書き込み前の diff が目標と合っていない。

各失敗は、retry、ask_user、stop、escalate、rollback のいずれかに進むべきだ。失敗後に Agent が自由に続ける状態を避ける。

## チェックリスト

- 各 step に run_id と step 番号があるか。
- tool 呼び出し前に権限判断があるか。
- 承認画面は action、理由、影響範囲を示すか。
- trace から state を再構築できるか。
- 外部副作用なしで replay できるか。
- 最大 step、最大 cost、連続失敗制限があるか。

## 試すこと

ファイル編集 Agent harness の紙面設計を作る。モデル実装は後でよい。ツール、権限、ログ schema、承認戦略、replay 形式を定義する。実タスクを一つ選び、各ステップを手で trace に書く。足りない状態がすぐ見える。

完成したら、trace schema と approval matrix を project document として保存する。OpenAI Agents SDK、Claude Code、ADK、自作 loop のどれを使っても、この harness 設計は再利用できる。

## 参考

- [Anthropic Engineering](https://www.anthropic.com/engineering)
- [Anthropic Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents)
- [OpenAI Agent Evals](https://platform.openai.com/docs/guides/agent-evals)
- [Google Agent Development Kit](https://adk.dev/)
- [Berkeley RDI: Advanced LLM Agents](https://rdi.berkeley.edu/adv-llm-agents/sp25)
