---
title: "Claude Code in Action：コーディング Agent を開発プロセスに入れる"
date: 2026-03-31
category: academy
description: "端末協働、コードベース文脈、ツール権限、テスト検証、review ループ、安全境界から Claude Code 型コーディング Agent を理解する。"
plainSummary: "Claude Code の価値はタイピング代行ではない。コードを読み、計画し、編集し、検証し、リスクを説明する開発ループを端末へ持ち込む点にある。"
difficulty: advanced
coverImage: "/images/academy/anthropic-academy/04-developer-tools/claude-code-in-action/terminal-agent-cover.png"
tags:
  - Claude Code
  - 開発者
lang: ja
academy:
  series: "Anthropic Academy"
  module: "開発者と技術ツール"
  moduleOrder: 4
  source: "Anthropic Academy"
  sourceUrl: "https://anthropic.skilljar.com/claude-code-in-action"
  prerequisites: []
draft: false
---

# Claude Code in Action：コーディング Agent を開発プロセスに入れる

![端末内のコーディング Agent workflow](/images/academy/anthropic-academy/04-developer-tools/claude-code-in-action/terminal-agent-cover.png)

コーディング Agent の変化は、「AI がコードを書ける」ことだけではありません。コード補完も以前から多くのコードを書けました。大きな変化は、Agent が実プロジェクトでファイルを読み、構造を理解し、コードを変更し、コマンドを実行し、失敗を観察して、再び修正できる点です。

開発協働は一つの prompt ではなく、次のループになります。

1. 目標を理解する。
2. コードベースを探索する。
3. 局所計画を作る。
4. ファイルを編集する。
5. 検証を実行する。
6. 結果に応じて修正する。
7. 変更とリスクをまとめる。

Claude Code 型ツールの価値は、コード生成を開発プロセス協働へ押し上げることにあります。

## コーディング Agent は IDE 補完の単純な上位版ではない

従来の補完は、現在ファイルや近傍文脈で働きます。コーディング Agent の単位は、よりタスクに近いです。

| 能力 | 補完ツール | コーディング Agent |
| --- | --- | --- |
| 文脈 | 現在ファイルと近傍コード | リポジトリ、コマンド、エラー、文書 |
| 出力 | コード片 | ファイル変更、コマンド結果、説明、リスク |
| 交互作用 | ユーザーが逐次駆動 | Agent が探索、計画、実行できる |
| 検証 | 主にユーザーが行う | テストや build を実行できる |
| リスク | 局所エラー | 複数ファイル誤変更、コマンド副作用、権限問題 |

したがって重要なのは、Agent に速く書かせることではなく、正しい境界で動かすことです。

## 文脈：タスクの前にプロジェクト地図を渡す

コーディング Agent は二種類の文脈問題に弱いです。

- 情報が少なすぎる：構成、コマンド、約束事が分からない。
- 情報が多すぎる：古い計画、無関係ログ、誤った方針が混ざる。

良いプロジェクト文脈には次を含めます。

- プロジェクトの目的。
- 主要ディレクトリ。
- build、check、test コマンド。
- コードスタイルとアーキテクチャ約束。
- 触ってはいけないディレクトリやファイル。
- よくある失敗と調査方法。
- 公開や commit のルール。

これらは毎回口頭で渡すより、プロジェクト説明や skill に沈めるほうが安定します。

## ツール権限：端末能力には境界が必要

![コーディング Agent の review と検証ループ](/images/academy/anthropic-academy/04-developer-tools/claude-code-in-action/review-loop.png)

コーディング Agent がコマンドを実行できることは強みであり、同時にリスクです。

コマンドを層に分けます。

| 層 | 例 | 方針 |
| --- | --- | --- |
| Read | `rg`、`ls`、`git diff` | 原則許可 |
| Verify | `npm run check`、`pytest`、`cargo test` | 許可し、結果を記録 |
| Generate | 静的生成物、画像、index 生成 | 許可。ただし出力先を見る |
| Mutate | ファイル変更、依存追加、DB migration | 明確な範囲が必要 |
| External | push、公開、メッセージ、本番サービス | 実行前に確認 |
| Destructive | 削除、reset、履歴上書き | 原則禁止 |

Agent が賢く見えても、無制限の端末権限を渡さないことです。実工程に近づくほど境界が重要になります。

## 作業方法：草稿ではなく閉ループを求める

高品質なコーディング Agent タスクには、検証まで含めます。

```md
この変更を完了してください：

目標：
範囲：
変更禁止：
検証コマンド：
完了時に説明：
- 変更ファイル
- 検証結果
- 未検証項目
- 残リスク
```

検証コマンドがないと、Agent は「変更しました」で止まりがちです。完了には証拠が必要です。

## Review ループ：判断責任は人間に残る

Agent は自己確認できますが、review の代替ではありません。

人間 review では次を見ます。

- 範囲外ファイルを変更していないか。
- 不要な抽象化を追加していないか。
- 検証は通ったが意味が変わっていないか。
- 表面だけ直し、根本原因が残っていないか。
- テストを見落としていないか。
- ローカル前提を公開コードや文書に書いていないか。

Agent の強みは実行ループの速さです。人間の強みは、何をする価値があり、何をしてはいけないかの判断です。

## 安全境界：実行可能を監査可能にする

![安全な端末操作と承認境界](/images/academy/anthropic-academy/04-developer-tools/claude-code-in-action/safe-terminal-operations.png)

安全に使うには、主要 action を監査可能にします。

最低限の要件です。

- 変更前にタスク範囲が分かる。
- 変更後に diff を見られる。
- 検証コマンドに出力がある。
- 外部 action は確認する。
- 失敗と未検証項目を明示する。
- destructive git command で問題を消さない。

チーム開発ではさらに次を入れます。

- feature branch で作業する。
- batch ごとに小さく commit する。
- CI 失敗は Agent が調査しても、修正後は review する。
- 高リスクディレクトリは人間確認を必要にする。

## ケース：build 失敗を修正する

弱い依頼です。

> このプロジェクトを直して。

より良い依頼です。

```md
現在 `npm run build` が失敗しています。
まず失敗情報を読み、最小原因を特定してください。
build 失敗に直接関係するファイルだけ変更してください。
修正後に `npm run build` と `npm run check` を実行してください。
最後に根本原因、変更、検証、残リスクを説明してください。
```

この依頼は、目標、範囲、検証、提出物を明確にしています。Agent は「直った」の意味を推測しなくて済みます。

## よくあるアンチパターン

**アンチパターン 1：一度に広すぎる範囲を変えさせる。**

範囲が広いほど review コストは上がります。大きなタスクは検証可能な batch に分けます。

**アンチパターン 2：Agent の要約だけを見て diff を見ない。**

要約は細部を落とすことがあります。真実は diff にあります。

**アンチパターン 3：検証失敗のまま提出する。**

Agent は失敗を説明できますが、失敗を成功に変えることはできません。

**アンチパターン 4：本番認証情報や機密データを扱わせる。**

コーディングタスクはローカル、テスト、脱識別データで行うべきです。

## タスクテンプレート

```md
### Coding Agent Task

目標：
背景：
変更を許可：
変更禁止：
検証コマンド：

### Guardrails

依存追加を許可するか：
外部コマンドを許可するか：
commit を許可するか：
push または公開を許可するか：

### Done Means

- diff を review できる
- 検証コマンドが通る
- 失敗項目が説明されている
- 残リスクが列挙されている
```

## チェックリスト

- Agent に実エラーと関連ファイルを先に読ませたか？
- 変更可能範囲を限定したか？
- 検証コマンドを提供したか？
- 要約だけでなく diff を見たか？
- 外部可視または不可逆 action の自動実行を禁止したか？
- 未検証内容を記録したか？

## さらに読む

- [Agentic Workflows：状態機械で AI タスクを分解する](../../agentic-workflows-02/)：コーディングタスクを復旧可能な workflow に入れる。
- [OpenAI Academy：信頼できる AI Agents を構築する](../../openai-academy/07-building-with-ai/agents/)：ツール、状態、評価の観点から Agent を理解する。
- [Agent Skills 入門](../05-agentic-mcp/introduction-to-agent-skills/)：繰り返す workflow を再利用可能な skill にする。

## 参考

- [Claude Code overview](https://code.claude.com/docs/en/overview)
- [Claude Code common workflows](https://docs.anthropic.com/en/docs/claude-code/tutorials)
- [Claude Code best practices](https://www.anthropic.com/engineering/claude-code-best-practices)
