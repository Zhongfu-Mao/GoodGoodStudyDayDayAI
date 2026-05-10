---
title: "OpenAI Academy 学習ノート：ChatGPT のパーソナライズ"
date: 2026-04-25
category: academy
description: "Custom Instructions（カスタム指示）、Memory（記憶機能）、および安定したワークスタイルの構築に向けた活用法を整理する。"
plainSummary: "OpenAI Academy の「Personalization」をベースに、ユーザーの役割、トーン、出力形式の好みを AI に学習させ、毎回同じ説明を繰り返す手間を省くための設定術をまとめました。"
difficulty: beginner
coverImage: "/images/academy/openai-academy/covers/02-using-chatgpt/core-skills/personalizing-chatgpt.ja.svg"
tags:
  - "ChatGPT"
  - "Personalization"
lang: ja
academy:
  series: "OpenAI Academy"
  module: "02.3 Personalizing ChatGPT"
  moduleOrder: 23
  source: "OpenAI Academy"
  sourceUrl: "https://openai.com/academy/personalization/"
  prerequisites:
    - "事前学習の推奨：OpenAI Academy 学習ノート：プロンプトの基礎"
draft: false
---

**注記：** 本ページは OpenAI Academy の公開情報に基づき構成された学習ノートです。パーソナライズ機能を「使い勝手の向上」だけでなく、AI を自身の「思考のパートナー」へと最適化するための戦略として解説します。

## 概要：毎回「初対面」で接するのをやめる

ChatGPT はデフォルトの状態では汎用的な回答を生成しますが、パーソナライズ機能（Custom Instructions や Memory）を活用することで、あなたの専門領域、仕事のスタイル、好みのフォーマットをあらかじめ理解した「自分専用の AI」へと進化します。

## カスタム指示 (Custom Instructions) の活用

カスタム指示は、すべての新しいチャットに適用される「恒久的なプロンプト」です。以下の 2 つの問いに答えることで、回答の質が劇的に安定します。

1. **どのような役割・背景を考慮してほしいか？**（例：AI 教育メディアの編集者、簡潔な指示を好む経営者）
2. **回答をどのように提示してほしいか？**（例：箇条書きを多用する、専門用語の解説を入れる、常にネクストアクションを添える）

## 記憶機能 (Memory) の役割と管理

Memory は、これまでの対話を通じて得られたあなたの好みやコンテキストを AI が動的に記憶する機能です。

- **メリット**：プロジェクトの名前、特定のツールの使用法、文章の癖などを AI が自律的に学習する。
- **注意点**：古い情報や不要になった設定が残る可能性があるため、定期的に「何を覚えているか」を確認し、必要に応じて削除や修正を行うことが重要です。

## スタイルを安定させるための「3 つの分離」

1. **恒久的な設定**：カスタム指示に記述する（言語、出力トーン、基本フォーマット）。
2. **流動的な背景**：Memory に委ねる（進行中のプロジェクト名、好みのスタイル）。
3. **一時的なタスク**：個別のプロンプトや Project 機能で指定する（特定の資料に基づく分析）。

## 実務ワークフロー：パーソナライズの最適化

1. **繰り返しの特定**：毎回プロンプトに書いている共通の制約をリストアップする。
2. **カスタム指示への反映**：優先順位の高いものをカスタム指示の「How would you like ChatGPT to respond?」に統合する。
3. **Memory のメンテナンス**：新しいプロジェクトが始まるときやスタイルを変えたいときに、記憶のリセットや更新を指示する。

---
参照：https://openai.com/academy/personalization/
