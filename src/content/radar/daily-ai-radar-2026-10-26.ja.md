---
title: "AIレーダー日報：2026-10-26"
date: 2026-10-26
category: radar
cadence: daily
radarFormat: 2
lang: ja
coverImage: /images/radar/daily-ai-radar-2026-10-26.ja-infographic.webp
audioUrl: https://pub-6a0341e7aa914973bd3bf62652a20025.r2.dev/audio/radar/daily-ai-radar-2026-10-26.ja.mp3
audioDuration: 1086
audioSize: 8692277
draft: false
tags: []
---

2026-10-25 12:00から2026-10-26 12:00（日本時間）までの公開資料を整理した2件。初出日と確認日を区別し、発表者の主張・実測・見解の範囲を明記する。

## 今日の重要な変化

- [GPT-6.1 Terra、視覚理解・コンピューター操作・費用を主軸に](#radar-terra-visual-computer)
- [Seam Cutter、長いスクリーンショットの途中を切り取る小道具](#radar-seam-cutter-tool)
- [トークン単価と作業費用を分けて比較する](#radar-terra-visual-computer)

## 能力とエビデンス

### GPT-6.1 Terra、視覚理解・コンピューター操作・費用を主軸に

<a id="radar-terra-visual-computer"></a>

- 出典：OpenAI
- 情報経路：ブログ
- エビデンス区分：公式発表
- 初出日：2026-10-26
- リンク：https://openai.com/index/introducing-gpt-6-1-terra
- 要約：OpenAIはGPT-6.1 Terraを公開し、視覚推論、コンピューター操作、文章作成を強調した。標準API料金はGPT-5.6 TerraおよびGPT-6.1 Solより50%低いと説明する。専門的なPC作業、視覚推論、デスクトップアプリの評価で、推論設定ごとの性能・速度・費用を示した。トークン単価とタスク当たり費用は別で、単価の低下を全作業に同率の節約として当てはめられない。個々のツール、権限、画面での信頼性検証も引き続き必要だ。

## プロダクトと実際の導入

### Seam Cutter、長いスクリーンショットの途中を切り取る小道具

<a id="radar-seam-cutter-tool"></a>

- 出典：Simon Willison
- 情報経路：ブログ
- エビデンス区分：著者の実測
- 初出日：2026-10-25
- リンク：https://simonwillison.net/2026/Oct/25/seam-cutter/
- 要約：Simon Willisonは、画像を横または縦に分け、両側を動かして途中の不要部分を取り除く小道具を公開した。スマートフォンでつないだ長いスクリーンショットを整理し、例えば会話記録から無関係なプロンプト部分を除く用途を挙げる。限定的な作業フローの実例で、画像生成モデルや一般的な画像理解能力の提示ではない。つなぎ直しや削除を行った画像は、未編集の完全な対話記録として扱うこともできない。

<!-- radar-visual:seam-cutter-tool -->
[![長い画像の途中を除き上下をつなぐ仕組みの模式図](/images/radar/daily-ai-radar-2026-10-26-seam-cutter-tool.webp)](/images/radar/daily-ai-radar-2026-10-26-seam-cutter-tool.webp)

*左の長い画像から中央の灰色部分を除き、上下を動かして右の短い画像にする。仕組みの説明で実際の画面ではない。切り取った後の画像は完全な原記録ではない。 画像出典：[AI Radar illustration / Simon Willison](https://simonwillison.net/2026/Oct/25/seam-cutter/)。画像をクリックすると原寸で表示します。*
<!-- /radar-visual:seam-cutter-tool -->
