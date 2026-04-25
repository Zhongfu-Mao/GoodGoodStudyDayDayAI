---
title: "Amazon Bedrock で Claude を使う"
date: 2026-03-31
category: academy
description: "AWS 上で Claude を利用するときの位置づけ、接続方法、運用上の観点を整理したメモです。"
coverImage: "/images/academy/anthropic-academy/covers/04-developer-tools/claude-with-amazon-bedrock.svg"
tags:
  - "Anthropic Academy"
  - "講座ノート"
  - "Claude/Bedrock"
  - "AWS"
  - "開発者"
lang: ja
academy:
  series: "Anthropic Academy"
  module: "開発者向けツールと実装"
  moduleOrder: 4
  source: "Anthropic Academy"
  sourceUrl: "https://anthropic.skilljar.com/claude-with-amazon-bedrock"
  prerequisites: []
draft: false
---
# 要点まとめ

Bedrock 経由の利用は、既存の AWS 基盤やセキュリティ要件に Claude を合わせたいチームに向いています。

## この講義で押さえたいこと

- Bedrock を使うことで、IAM や既存のクラウド運用ルールに沿ってモデル利用を管理しやすくなる。
- アプリ実装では、モデル選択、リージョン、認証、ログ設計をまとめて考える必要がある。
- 組織導入では、モデル性能だけでなく、監査性やガバナンスの観点も重要になる。

## 実務へのつなげ方

すでに AWS に乗っているプロダクトなら、PoC 段階から権限設計とログ方針を簡単に決めておくと後で困りません。
