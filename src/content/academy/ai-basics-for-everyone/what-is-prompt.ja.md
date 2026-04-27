---
title: "AI Basics for Everyone：Prompt とは何か"
date: 2026-04-27
category: academy
description: "prompt を魔法の言葉ではなく、目的、背景、制約、出力形式をそろえる依頼文として整理します。"
coverImage: "/images/academy/ai-basics-for-everyone/prompt.svg"
difficulty: beginner
plainSummary: "Prompt は AI への依頼文です。よい prompt は、目的、背景、材料、制約、期待する出力をそろえます。"
tags:
  - "Prompting"
  - "ChatGPT"
lang: ja
academy:
  series: "AI Basics for Everyone"
  module: "基本概念"
  moduleOrder: 2
  source: "サイト内 Academy ガイド"
  prerequisites: []
draft: false
---

## まず一言で

Prompt は AI への依頼文です。質問だけでなく、役割、目的、背景、材料、制約、判断基準、出力形式も含められます。

最初は prompt を「すごい呪文」のように考えがちですが、その理解だと学びが不安定になります。より実用的には、prompt は AI との共同作業を始めるための brief です。

## よい prompt に含まれるもの

| 要素 | 役割 | 例 |
| --- | --- | --- |
| 役割 | どの視点で考えるか | あなたはプロダクトマネージャーです |
| 目的 | 何を完成させたいか | 共有文の構成を作りたい |
| 背景 | 状況や読者を伝える | 読者は AI 経験がばらばらな身近な人たち |
| 材料 | 使ってよい情報 | 以下がサイト紹介と記事一覧 |
| 制約 | してほしくないこと | 大げさにしない、営業っぽくしない |
| 形式 | 返ってくる形を決める | 5 つの見出しで出す |

毎回すべてを書く必要はありません。ただ、複雑なタスクほど prompt は「依頼仕様」に近づきます。

## そのまま使える型

```text
やりたいこと：[目的]
背景：[状況、相手、すでにある材料]
お願いしたいこと：[具体的な作業]
制約：[トーン、長さ、避けたいこと]
出力形式：[箇条書き、表、草稿、手順]
情報が足りなければ、先に確認すべき質問を出してください。
```

派手ではありませんが、安定します。prompt が上手い人は、魔法の文を知っている人ではなく、タスクをうまく分解できる人です。

## Prompt が失敗する理由

よくある失敗は、モデルが弱いというより依頼が曖昧なことです。

- 「いい感じにして」のように目的が広すぎる。
- 読者や利用場面が書かれていない。
- 出力形式が指定されていない。
- 何を良いと判断するかがない。
- 一度に複数の目的を詰め込みすぎている。

## サイト内で次に読むもの

最初は [Getting Started with ChatGPT](../../openai-academy/02-using-chatgpt/core-skills/getting-started/) からで十分です。

次に [Prompting Fundamentals](../../openai-academy/02-using-chatgpt/core-skills/prompting-fundamentals/) を読むと、prompt をテクニックではなく再利用できる構造として見られます。

コードやプロジェクト作業に進むなら、[Codex Better Prompts](../../openai-academy/05-codex/better-prompts/) も役立ちます。

## やってみよう

記事のテンプレートを使って、今週の実際の仕事で使える prompt を 1 つ書いてみてください。

```text
達成したいこと：クライアントへの返信メールを書く
背景：価格について問い合わせがあり、割引案を提示したい
お願い：200 文字以内のメール本文を下書き
制約：ビジネスライクだが固すぎない。製品を誇張しない
出力形式：メール本文のみ。冒頭は「お世話になっております」
情報が足りなければ、先に補足が必要な点を列挙してください。
```

テンプレートの括弧を自分の内容に置き換え、ChatGPT か Claude に送ってみてください。

## 実用的な見方

Prompt がうまくいかなかった時は、すぐにモデルを変える前に次を確認します。

1. 目的は明確か。
2. 十分な context を渡したか。
3. どんな出力なら使えるのかを伝えたか。

入門段階のつまずきは、この 3 つだけでかなり減らせます。
