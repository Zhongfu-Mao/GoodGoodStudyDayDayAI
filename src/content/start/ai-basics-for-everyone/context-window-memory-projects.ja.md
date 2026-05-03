---
title: "AI Basics for Everyone：Context Window、Memory、Projects とは何か"
date: 2026-04-27
category: start
description: "AI が現在認識している情報、長期的に記憶する情報、そして Project 機能による情報整理の違いを解説します。"
coverImage: "/images/start/ai-basics-for-everyone/context-memory-projects.svg"
difficulty: beginner
plainSummary: "Context Window は AI が「今この瞬間」見えている範囲、Memory は長期的な好みや事実の記憶、Projects は関連するファイルや指示を一つの作業空間に集約する仕組みです。"
tags:
  - "Context"
lang: ja
academy:
  series: "AI Basics for Everyone"
  module: "基本概念"
  moduleOrder: 3
  source: "サイト内 Start / Foundations ガイド"
  prerequisites: []
draft: false
---

## まず一言で

AI の回答品質は、「AI が今何を見ているか（コンテキスト）」に大きく左右されます。Context Window（コンテキストウィンドウ）は現在認識できる情報の範囲を指し、Memory（メモリ）は長期的に保存される好みや事実、Projects（プロジェクト）はファイル・指示・会話を一つの作業空間にまとめる仕組みを指します。

同じ AI モデルを使っていても、ある時は的確に理解してくれるのに、別の時には急に忘れたように見えることがあります。多くの場合、これは AI の能力が変わったのではなく、与えられた「コンテキスト」の状態が異なることが原因です。

## 3 つの概念の違い

| 概念 | 解決する課題 | よくある誤解 |
| --- | --- | --- |
| **Context Window** | 「今この瞬間」に見える情報量 | すべての会話が永久に記憶されるという誤解 |
| **Memory** | 長期的な好みや背景情報の保持 | 完全無欠なデータベースであるという誤解 |
| **Projects** | 関連する材料を集約した作業空間 | 単なるファイル置き場であるという誤解 |

直感的なイメージとして、Context Window は「机の上に広げられた資料」、Memory は「本人が長期的に知っている好み」、Projects は「特定の仕事のために道具や資料を揃えた専用の作業台」に例えられます。

## なぜ「コンテキスト」が重要なのか

大規模言語モデル（LLM）は、あなたの会社の独自ルール、プロジェクトの真の目的、個人のこだわり、あるいは直近で更新されたファイルの内容を、自動的に知ることはできません。そのため、プロンプト、ファイル添付、Project 機能、RAG（検索拡張生成）、ツール実行などを通じて、必要な情報を「AI の見える範囲」に意図的に入れる必要があります。

コンテキストが明確であればあるほど、AI の回答は現実に即したものになります。逆にコンテキストが不足したり混乱したりしていると、文章としては美しくても、実務では使い物にならない回答になりがちです。

## Projects 機能を活用する場面

単発の会話で完結しない、継続的なタスクには Project 機能が最適です。

- 特定のテーマに関する長期的な学習やリサーチ。
- Web サイト制作やソフトウェア開発プロジェクト。
- 頻繁に参照する固定のガイドラインや資料。
- トーンや方針を一定に保ちたい継続的なライティング業務。
- チーム内で共有したいナレッジベースの構築。

Project の本質的な価値は、単にファイルを保存することではなく、対話を重ねるごとに安定した「背景知識」を AI に持たせ、共同作業の質を向上させることにあります。

## サイト内で次に読むもの

[Working with Files（ファイルの活用）](/academy/openai-academy/02-using-chatgpt/tools/working-with-files/) を読むことで、ファイルが AI のワークフローにどのように組み込まれるかを具体的にイメージできます。

[Projects（プロジェクト管理）](/academy/openai-academy/02-using-chatgpt/workflows/projects/) では、単発のチャットを継続的な作業空間へと進化させる考え方を学べます。

さらに技術的な理解を深めるなら、[Token と Context Window](/foundations/ai-developer-core/token-context-window/) や [Context Engineering Playbook](/engineering/ai-developer-core/context-engineering-playbook/) が次のステップとして最適です。

## やってみよう

ChatGPT や Claude の Project 機能を使って、簡単な実験をしてみましょう。

1. Project のシステム指示（カスタム指示）に、自分の役割と業務背景を記入する（例：「私は B2B SaaS のプロダクトマネージャーです」）。
2. 業務でよく参照するドキュメントを 1 つアップロードする。
3. その業務に関する具体的な質問を投げ、背景知識やドキュメントを踏まえた回答が返ってくるか確認する。

次に、全く新しいチャット（Project 外）で同じ質問をし、回答の精度やニュアンスがどう変わるかを比較してみてください。

## 実務に活かす視点

AI の出力が期待外れだったときは、まず以下の 4 点をチェックしてください。

1. AI が回答に必要な「材料」を認識できていたか？
2. 背景事情や判断基準を事前に伝えていたか？
3. 古い情報が、現在の事実として混ざっていないか？
4. その作業は、Project 機能で管理した方が効率的ではないか？

多くの「AI モデルの限界」と思われる問題は、実は「コンテキスト管理」を工夫することで解決可能です。
