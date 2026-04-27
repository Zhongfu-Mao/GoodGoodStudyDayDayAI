---
title: "教育者のための AI Fluency"
date: 2026-03-31
category: academy
description: "授業準備、教材作成、学習支援など、教育現場で AI を使う際の考え方を整理した実践向けノートです。"
plainSummary: "教育者が授業設計、教材作成、学習支援で AI を安全に使うための文脈文書と改善ループを整理します。"
difficulty: "beginner"
coverImage: "/images/academy/anthropic-academy/covers/02-ai-fluency-audiences/ai-fluency-for-educators.svg"
tags:
  - "Education"
lang: ja
academy:
  series: "Anthropic Academy"
  module: "対象別 AI Fluency"
  moduleOrder: 2
  source: "Anthropic Academy"
  sourceUrl: "https://anthropic.skilljar.com/ai-fluency-for-educators"
  prerequisites: []
draft: false
---
教育者にとって AI Fluency は、授業準備を速くするだけの技術ではありません。学習者、科目、評価、学校の方針という文脈を AI に伝え、教育判断を人間が保つための実践です。

## このノートで押さえること

- Teaching Context Document を作ると、AI への依頼が毎回ぶれにくくなる。
- 教材作成、フィードバック案、ルーブリック改善は AI と相性がよいが、最終判断は教育者が担う。
- 個人情報、成績評価、学習者のセンシティブな事情は入力しない、または匿名化する。
- AI の提案は授業の目的に合わせて編集し、学習者の理解を深める形に整える。

## Teaching Context Document

Teaching Context Document は、AI に毎回伝えるべき教育文脈をまとめた短い文書です。担当科目、学習者の前提知識、授業の目的、評価方針、禁止事項、望ましいトーンを含めます。

この文書があると、AI に教材案や活動案を依頼するときに、一般論ではなく自分の授業に近い提案が返ってきます。毎回ゼロから説明しなくてよくなる点も実務上の利点です。

ただし文脈文書には個人を特定できる情報を入れないことが重要です。学年、履修状況、課題傾向は抽象化し、個別の学生名や成績は扱わないようにします。

## 授業設計での使いどころ

AI は、導入活動、ディスカッション質問、理解度確認、小テスト、例題のバリエーション作成に向いています。教育者は、返ってきた案を学習目標に照らして削り、順序を整えます。

フィードバック案を作るときは、採点そのものを AI に任せるのではなく、コメントの観点や改善提案の候補を出させる程度にとどめると安全です。

授業後は、うまくいった活動、時間が足りなかった箇所、学生がつまずいた概念をメモし、次回の Teaching Context Document に反映します。

## 教育者の Diligence

教育現場では、正確性だけでなく公平性と説明責任が重要です。AI の提案が特定の学習者を不利に扱っていないか、文化的前提が偏っていないか、評価基準と合っているかを確認します。

また、AI が作った教材は出典や事実関係を確認してから使います。とくに歴史、科学、法律、医療、社会問題を扱う教材では、Grounding を明示することが欠かせません。

## 実務で試すワークフロー

1. 自分の授業について、目的・対象・評価・制約を 1 ページにまとめる。
2. その文脈文書を使って、次回授業の導入活動を 3 案作らせる。
3. 採用しない案も含め、なぜ選んだかを短く記録する。

## Prompt pack

- 次の Teaching Context Document をもとに、50 分授業の導入活動を 3 案作ってください。各案に目的、手順、注意点を付けてください。
- この教材案を、学習者の前提知識が浅いクラス向けに調整してください。専門用語を減らし、確認質問を追加してください。
- このルーブリックが AI 利用を過度に罰したり過度に許したりしていないか、改善点を出してください。

## 自分で確認する

- AI に渡す文脈から個人情報を除いている。
- 教材案を学習目標に合わせて人間が編集している。
- AI 利用ルールを学生に説明できる。

## 関連して読む

- [Teaching AI Fluency](../../01-ai-fluency-foundations/teaching-ai-fluency/)
- [幻覚と Grounding](../../../ai-basics-for-everyone/what-is-hallucination-grounding/)
