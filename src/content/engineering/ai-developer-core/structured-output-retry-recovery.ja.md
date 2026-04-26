---
title: "AI Developer Core：構造化出力、Retry、Recovery"
date: 2026-04-26
category: engineering
description: "JSON/schema 出力を中心に、解析、検証、再試行、降格経路を設計する。"
difficulty: intermediate
plainSummary: "構造化出力は、モデルに JSON をお願いすることではありません。schema、validator、修復戦略、失敗分岐を含めた出力契約です。"
tags:
  - AI Developer Core
  - Structured Output
  - Reliability
  - JSON
lang: ja
draft: false
---

# 構造化出力が解く問題

LLM の出力がコード、DB、workflow、UI に入るなら、自然文だけでは足りない。システムはフィールド、型、enum、配列、nullable、エラー状態を必要とする。構造化出力の目的は、見た目が JSON であることではなく、プログラムが安全に消費できることだ。

よくある失敗は、完全な破綻ではなく小さなズレである。説明文が混じる、フィールドが欠ける、enum が微妙に違う、数値が文字列になる、分からないのに答えを作る。人間は見逃せても、プログラムは壊れるか、静かに汚れたデータを書き込む。

## 先に出力契約を書く

Prompt より先に schema を書く。Schema は業務の境界を表す。

- 必須フィールドは何か。
- null を許すか。
- enum は何か。
- 配列上限はあるか。
- 文字列の最大長はあるか。
- 完了できない場合をどう表すか。

`status` や `confidence` のような失敗表現が schema にないと、モデルはすべてを成功結果として包みがちになる。

## Retry は同じ依頼の繰り返しではない

Retry にはエラー情報を渡す。たとえば `source_url` が欠けたなら、「前回の JSON は schema 検証に失敗した。`source_url` がない。修正後の JSON だけ返して」と伝える。同じ依頼を繰り返すだけでは、乱数を増やすだけになる。

Retry には上限も必要だ。上限を超えたら、人間レビュー、保守的出力、追加情報の要求、失敗サンプル保存へ進む。

## Recovery は階層化する

復旧は三層に分けられる。

第一層は**解析前の清掃**。markdown fence、前後説明、不可視文字を取り除く。

第二層は**決定的検証**。JSON parser と schema validator で、型や enum を確認する。

第三層は**モデル修復**。エラー情報と元出力だけをモデルへ渡し、形式を修正させる。完全なタスクを再実行しない。

## 実験目標

この実験で作るのは、「JSON を返してもらう prompt」ではなく、構造化出力の通路である。最終的には次のものが残る。

- JSON schema。
- 決定的 validator。
- retry prompt。
- 失敗サンプル集。
- 構造化出力の通過率レポート。

題材は、Markdown から公開メタデータを抽出するタスクがよい。入力は実記事、出力はサイトの build に使える object。Schema エラーは build や validator で露出し、業務境界も明確だ。

## Schema 設計

成功、確認要、処理不能を表せる schema にする。

```json
{
  "status": "ok",
  "title": "AI Developer Core：構造化出力、Retry、Recovery",
  "category": "engineering",
  "difficulty": "intermediate",
  "tags": ["AI Developer Core", "Structured Output"],
  "summary": "公開可能な一文要約",
  "risks": []
}
```

すべてを自由記述にしない。`category`、`difficulty`、`status` は enum にする。`tags` には数の上限を置く。`summary` には長さ上限を置く。`risks` は空配列を許すが、省略は許さない。Schema が明確なほど、モデルの形式ミスと業務判断ミスを分けやすい。

## Retry 設計

Retry は同じ依頼を繰り返さない。エラーを渡して修復だけをさせる。

```text
前回の出力は JSON schema 検証に失敗しました。
エラー：difficulty の値 "medium" は beginner/intermediate/advanced に含まれません。
修正後の JSON だけを返してください。説明は不要です。
```

再修復にも失敗したら、人間確認へ進む。無限 retry は避ける。形式修復が新しい生成タスクに化けると、出力はどんどん不安定になる。

## 失敗点

見るべき失敗は四種類ある。

- **構文失敗**：JSON として parse できない。
- **schema 失敗**：型、必須項目、enum が不正。
- **業務失敗**：JSON は合法だが、要約やタグが不適切。
- **安全失敗**：本文中の不可信指示に影響される。

前二者は自動処理しやすい。後二者は eval や人工確認が必要になる。ここを混ぜると、形式上の成功率だけ高く、実品質が低いシステムになる。

## チェックリスト

- Schema に失敗状態があるか。
- Validator はモデルから独立しているか。
- Retry は最大 1-2 回か。
- 修復 prompt は形式だけを直すか。
- 失敗サンプルに元出力とエラーを残しているか。
- 業務フローへ入る object はすべて決定的検証を通過しているか。

## 試すこと

記事メタデータ抽出器を作る。入力は Markdown、出力は `{title, category, tags, difficulty, summary, risks}`。20 本の通常記事と、frontmatter を壊した 5 本を用意し、初回成功率、修復後成功率、人間確認数を見る。

レポートには成功率だけでなく、最も壊れやすいフィールド、誤判定しやすいタグ、形式は正しいが意味が違う例も入れる。構造化出力の難しさは JSON ではなく、合法 object が正しい業務意味を持つかどうかにある。

## 参考

- [OpenAI Prompting](https://platform.openai.com/docs/guides/prompting)
- [OpenAI evaluation flywheel cookbook](https://cookbook.openai.com/examples/evaluation/building_resilient_prompts_using_an_evaluation_flywheel)
- [Anthropic Prompt Engineering Overview](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview)
- [Eugene Yan: LLM Patterns](https://eugeneyan.com/writing/llm-patterns/)
