---
title: "AI Basics for Everyone：Context Window、Memory、Projects とは何か"
date: 2026-04-27
category: academy
description: "AI が今見えている情報、長期的に覚える情報、Project で整理する情報の違いを説明します。"
coverImage: "/images/academy/ai-basics-for-everyone/context-memory-projects.svg"
difficulty: beginner
plainSummary: "Context Window は AI が今見えている範囲、Memory は長期的な好みや事実、Projects はファイルや指示をまとめた作業空間です。"
tags:
  - "Context"
lang: ja
academy:
  series: "AI Basics for Everyone"
  module: "基本概念"
  moduleOrder: 3
  source: "サイト内 Academy / Foundations ガイド"
  prerequisites: []
draft: false
---

## まず一言で

AI の回答品質は、「今何を見えているか」に強く左右されます。Context Window は現在見えている情報の範囲、Memory は長期的に保存される好みや事実、Projects はファイル、指示、会話を同じ作業空間にまとめる仕組みです。

同じモデルでも、ある時はよくわかってくれて、ある時は急に忘れたように見えることがあります。多くの場合、能力が変わったのではなく context が違います。

## 3 つの違い

| 概念 | 解決すること | よくある誤解 |
| --- | --- | --- |
| Context Window | 現在見える情報量 | すべての会話を永久に覚えていると思う |
| Memory | 長期の好みや背景 | 完全なデータベースだと思う |
| Projects | 作業材料をまとめる | ただのフォルダだと思う |

Context Window は机の上に広げた資料、Memory は長期的に知っている好み、Projects は特定の仕事のために整えた作業台に近いです。

## なぜ context が重要なのか

LLM は、あなたの会社のルール、プロジェクトの目的、個人の好み、直近で変更されたファイルを自動では知りません。prompt、ファイル、Project、RAG、tool などで、必要な情報を見える範囲に入れる必要があります。

Context が明確だと、回答は現実に近づきます。Context が乱れていると、文章はきれいでも使えない出力になりがちです。

## Projects の直感

一回の会話で終わらない作業は、Project に向いています。

- 長期的な学習テーマ。
- Web サイトやコードプロジェクト。
- 固定の参考資料。
- トーンや方針をそろえたい文章作業。
- チームで共有したい知識空間。

Project の価値は、単にファイルを置くことではなく、毎回の共同作業に安定した背景を持たせることです。

## サイト内で次に読むもの

[Working with Files](../../openai-academy/02-using-chatgpt/tools/working-with-files/) で、ファイルが AI workflow に入る感覚をつかめます。

[Projects](../../openai-academy/02-using-chatgpt/workflows/projects/) では、単発の会話を継続的な作業空間にする考え方を学べます。

さらに踏み込むなら、[Token と Context Window](../../../foundations/ai-developer-core/token-context-window/) と [Context Engineering Playbook](../../../engineering/ai-developer-core/context-engineering-playbook/) が次の入口です。

## 実用的な見方

AI の出力が期待とずれた時は、まず次を確認します。

1. 必要な材料を見えていたか。
2. 背景と判断基準を伝えていたか。
3. 古い情報を現在の事実として扱っていないか。
4. その作業は Project にまとめた方がよいか。

多くの「モデルの問題」は、実は context 管理の問題です。
