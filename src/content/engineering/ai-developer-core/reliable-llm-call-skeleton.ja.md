---
title: "AI Developer Core：信頼できる LLM 呼び出しの最小骨格"
date: 2026-04-26
category: engineering
description: "一回の LLM 呼び出しを、観測、再試行、評価ができる工程単位として設計する。"
difficulty: beginner
plainSummary: "信頼できる LLM 呼び出しには、入力契約、出力契約、timeout、retry、ログ、コスト記録、最小 eval が必要です。"
tags:
  - AI Developer Core
  - LLM App
  - Observability
  - Evaluation
lang: ja
draft: false
---

# Prompt 文字列から始めない

LLM アプリの初版は、一つの prompt と一回の API 呼び出しで作れてしまう。デモには十分だが、保守には弱い。最小の信頼できる骨格は、LLM 呼び出しを一つの工程単位として扱う。入力契約、出力契約、実行設定、エラー処理、ログ、コスト、評価サンプルを持たせる。

目的は大きな基盤を最初から作ることではない。すべての振る舞いを一つの文字列に隠さないことだ。観測できる呼び出しは改善できる。検証できる出力は安定する。繰り返せる eval は進歩を作る。

## 最小構造

信頼できる呼び出しには、少なくとも七つの要素がある。

1. **Task name**：例 `summarize_radar_item`。
2. **Input schema**：入力フィールド、型、必須性、長さ制限。
3. **Prompt template**：業務データと指示を混ぜない安定テンプレート。
4. **Model config**：モデル、temperature、出力上限、tool 設定。
5. **Output schema**：JSON、Markdown、タグ、自然文などの期待形式。
6. **Validation**：解析失敗、欠損、長さ超過、引用不足への対応。
7. **Trace log**：入力要約、出力要約、token、遅延、エラー、version。

この七つがあるだけで、「モデルが不安定」から「どの層が不安定か」へ問題を分解できる。

## エラーは分類する

LLM 呼び出しの失敗は一種類ではない。ネットワークエラー、rate limit、timeout、形式エラー、品質不足、根拠不足、ツール失敗、権限失敗は、それぞれ対応が違う。

ネットワークは retry できる。形式エラーは修正要求や parser で扱える。根拠不足は明示的に無回答へ進むべきだ。権限失敗は停止し、人間へ渡す。分類がなければ、信頼できる retry も alert も作れない。

## ログは後付けにしない

AI アプリに trace がないと、なぜ失敗したか説明できない。最小 trace は全文を保存しなくてもよい。hash、長さ、task、prompt version、model version、token、時間、検証結果、エラー種類を保存する。機密データには脱識別の設計を加える。

重要なのは、出力を当時の入力、テンプレート、モデル設定へ戻せることだ。戻れない失敗は、学習できない失敗になる。

## 実験目標

この実験の目標は、「モデルを一回呼ぶ」処理を安定した関数にすることだ。大きな framework は不要で、毎回の呼び出しが再現でき、検証でき、集計できればよい。完成物は三つに絞る。

- `run_llm_task()` という wrapper。
- `tasks/summarize_article.yml` というタスク設定。
- `traces/llm-calls.jsonl` という実行ログ。

題材はサイト記事の要約がよい。Markdown を入力し、三文要約、候補タグ、人工確認が必要なリスクを返す。単純なタスクだが、入力、出力、検証、失敗、ログのすべてを試せる。

## コード骨格

Prompt を業務コードへ直書きしない。タスク設定は次のように分ける。

```yaml
name: summarize_article
version: 1
model: gpt-5.4-mini
temperature: 0.2
max_output_tokens: 600
input_schema:
  path: string
  title: string
  body: string
output_schema:
  summary: string
  tags: string[]
  risks: string[]
  status: ok | needs_review | insufficient_input
```

Wrapper は、設定を読む、message を組み立てる、モデルを呼ぶ、出力を検証する、の四つだけを担当する。記事要約という業務知識は task config と schema に置く。そうすれば、翻訳、抽出、分類、レビューにも同じ骨格を使える。

## 失敗注入

Happy path だけを通しても信頼性は分からない。最低でも次の五種類を用意する。

1. 通常記事。
2. 空本文。
3. 長すぎる本文。
4. frontmatter に title がない記事。
5. 本文中に「上のルールを無視して」と書かれた記事。

それぞれ別の状態になるべきだ。空本文は `insufficient_input`、長文は圧縮または切り詰め、不可信テキストは記事データとして扱い system 指示にしない。ここまでできて、初めて実験になる。

## チェックリスト

- task name、task version、model を毎回記録しているか。
- 出力は schema を通過しない限り次へ進まないか。
- retry は具体的なエラーを含むか。
- trace から入力要約、出力要約、エラー種類、時間を追えるか。
- 入力不足や無回答を明示状態として扱っているか。
- 機密本文をそのままログに保存していないか。

## 試すこと

`run_llm_task()` という wrapper で、サイト記事の要約タスクを処理する。10 件の入力と期待フィールドを用意し、実行ごとに JSONL trace を出す。フィールド欠損、出力過長、根拠不足を意図的に起こし、分類できるかを見る。

結果は「出たかどうか」ではなく、初回通過率、retry 後通過率、人工確認率で見る。小さな評価セットでもよい。重要なのは、あとで prompt、model、schema を変えたときに同じ例で比較できることだ。

## 参考

- [OpenAI Prompting](https://platform.openai.com/docs/guides/prompting)
- [OpenAI Agent Evals](https://platform.openai.com/docs/guides/agent-evals)
- [Chip Huyen: AI Engineering](https://www.oreilly.com/library/view/ai-engineering/9781098166298/)
- [Full Stack LLM Bootcamp](https://fullstackdeeplearning.com/llm-bootcamp/)
