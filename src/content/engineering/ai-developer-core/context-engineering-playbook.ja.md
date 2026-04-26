---
title: "AI Developer Core：Context Engineering 実践チェックリスト"
date: 2026-04-26
category: engineering
description: "Context Engineering を、選択、圧縮、整理、キャッシュ、隔離、評価の六つに分解する。"
difficulty: intermediate
plainSummary: "Context Engineering は長い prompt を書くことではありません。各ステップでモデルに何を、どんな構造で見せ、いつ捨てるかを設計することです。"
tags:
  - AI Developer Core
  - Context Engineering
  - Prompting
  - Agent
lang: ja
draft: false
---

# Context Engineering とは

Prompt engineering はタスクの伝え方に注目する。Context engineering は、モデルがタスク実行時に何を見るべきかに注目する。RAG、Agent、コード支援、長文処理では、一文の prompt よりも文脈の選択、整理、更新戦略が品質を決める。

強いモデルでも、古い状態、重複資料、無関係ログ、矛盾指示、出典のない検索結果を渡されれば不安定になる。

## 六つの動作

第一に、**選択**。すべてをウィンドウへ入れない。現在の判断に必要な情報だけを入れ、古い履歴は状態要約へ変える。

第二に、**圧縮**。長文書、ツール結果、会話履歴は圧縮する。ただし、事実、決定、次の予定、リスク、出典を残す。単なる自然文要約だけにしない。

第三に、**整理**。目標、制約、入力、証拠、ツール結果、出力形式を分ける。異なる役割の情報を同じ段落に混ぜない。

第四に、**キャッシュ**。安定した長い文脈は cache し、繰り返しタスクでは prompt version や検索結果を再利用する。cache はコストだけでなく、変動も減らす。

第五に、**隔離**。外部文書、Web、メール、ツール結果には不可信な指示が含まれる可能性がある。これらはデータとして扱い、system 指示と混ぜない。

第六に、**評価**。文脈戦略は比較可能でなければならない。top-k、要約方式、履歴保持を変えるたびに、同じタスクで回帰を見る。

## Agent の文脈

Agent の文脈は動的に増える。ツール呼び出しは新しいテキストを生み、失敗はログを増やす。状態管理がなければ、Agent は自分の履歴に埋もれる。

よりよい方法は、構造化 state を維持することだ。

```json
{
  "goal": "記事メタデータを修復する",
  "done": ["schema を読んだ", "3 件の欠損を見つけた"],
  "next": "frontmatter を修復する",
  "risks": ["本文は変更しない"],
  "evidence": ["src/content.config.ts"]
}
```

モデルには、すべての過程ではなく、次の判断に必要な状態を見せればよい。

## 実験目標

この実験では、二つの文脈戦略を比較する。全履歴を積む戦略と、構造化 state を更新する戦略である。目的は、どちらかが常に正しいと示すことではない。どの場面で原文を残し、どの場面で state に圧縮し、どの場面で再検索するかの判断を作る。

残すものは次の四つ。

- 二つの prompt/context template。
- 構造化 state schema。
- 多段タスクのサンプル。
- token、失敗率、人工修正回数の比較。

## Context Packet

各ステップでモデルに渡す情報を context packet として整理する。

```yaml
goal: 10 本の記事から拡張可能なテーマを抽出する
constraints:
  - 原文を変更しない
  - 公開可能なテーマだけを出す
state:
  done:
    - 記事一覧を読んだ
  open_questions:
    - どのテーマを工程実験にできるか
evidence:
  - title: AI Radar Daily 2026-04-20
    path: src/content/radar/daily-ai-radar-2026-04-20.md
    note: LLM 最適化スタックを含む
output_contract:
  format: markdown_table
```

重要なのは、文脈の役割を分けることだ。モデルは、目標、制約、状態、証拠、出力契約を見る。長い会話履歴をそのまま読むわけではない。

## 対照実験

対照 A：過去の全 message と全 tool result を毎回戻す。  
対照 B：構造化 state、必要証拠、直近の tool result だけを渡す。

同じタスクを 5 回走らせ、入力 token、重複出力、制約漏れ、人工修正の回数を見る。全履歴は設計が楽だが、高価でノイズが溜まりやすい。構造化 state は設計コストがあるが、replay と eval に向く。

## 失敗点

Context engineering の失敗は、モデルが弱いというより、文脈 packet に役割が欠けていることが多い。

- goal がないと、モデルは続きを書くだけになる。
- constraint がないと、過剰に広げる。
- evidence がないと、記憶で答える。
- state がないと、同じ作業を繰り返す。
- output contract がないと、次工程へ渡せない。

この五項目に戻って確認するほうが、prompt を長くするより効く。

## チェックリスト

- このステップに原文が必要か、state だけで足りるか。
- tool result は不可信データとして扱われているか。
- done / next / risks はあるか。
- 同じ state で現在ステップを replay できるか。
- 圧縮前後の token 差を記録しているか。
- 文脈戦略の変更を比較する eval があるか。

## 試すこと

「10 本の記事からテーマを抽出し、要約を作る」という多段タスクを選ぶ。全履歴を会話に積む版と、各ステップで構造化 state を更新する版を作り、token、失敗率、一貫性を比較する。

最後に `context_state.json` と `context_packet.md` を保存する。この二つは、後で Agent harness を作るときの出発点になる。

## 参考

- [Anthropic Engineering](https://www.anthropic.com/engineering)
- [Anthropic Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents)
- [Hung-yi Lee Machine Learning 2026 Spring](https://speech.ee.ntu.edu.tw/~hylee/ml/2026-spring.php)
- [Google Agent Development Kit](https://adk.dev/)
