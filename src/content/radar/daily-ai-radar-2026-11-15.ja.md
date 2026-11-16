---
title: "AIレーダー日報：2026-11-15"
date: 2026-11-15
category: radar
cadence: daily
radarFormat: 2
lang: ja
coverImage: /images/radar/daily-ai-radar-2026-11-15.ja-infographic.webp
audioUrl: https://pub-6a0341e7aa914973bd3bf62652a20025.r2.dev/audio/radar/daily-ai-radar-2026-11-15.ja.mp3
audioDuration: 843
audioSize: 6741190
audioNotice: AI生成の音声です。内容へのフィードバックをお寄せください。
draft: false
tags: []
description: "ローカル推論の互換API、表データの可視化、エージェントに届く前の返信取り消し。"
---

対象期間は2026年11月14日12:00から11月15日12:00まで（日本時間）。

## 今日の重要な変化

- [TensorFold：二つのクライアント向けAPIが同じ推論エンジンを使う](#radar-tensorfold-ollama)
- [Datasette：ローカルモデルへの接続と、モデルを使わない描画](#radar-datasette-local-llm)
- [Plannotator：返信を取り消せるのは配信前まで](#radar-plannotator-undelivered)

## 構築と運用

### TensorFold：同じ推論エンジンにOllama互換APIを追加

<a id="radar-tensorfold-ollama"></a>

- 出典：TensorFold
- 情報経路：GitHub
- エビデンス区分：プロジェクト説明
- 初出日：2026-11-15
- リンク：https://github.com/ashhart/TensorFold/releases/tag/v1.2.9
- 要約：TensorFold v1.2.9はチャット、生成、埋め込み、一部のモデル照会に対応するOllama互換APIを追加した。従来のOpenAI形式のAPIと同じ推論エンジンを使う。APIが互換でも挙動まで同じとは限らず、移行時にはストリーミング、ツール呼び出し、エラー応答を確かめたい。起動オプションをTOMLファイルに記録し、再利用する機能も加わった。

### Datasette：互換エンドポイントでデータエージェントにローカルモデルを接続

<a id="radar-datasette-local-llm"></a>

- 出典：Simon Willison
- 情報経路：ブログ
- エビデンス区分：著者の説明
- 初出日：2026-11-14
- リンク：https://simonwillison.net/2026/Nov/14/datasette-llm/
- 要約：他のDatasetteプラグインが使うモデルを設定するdatasette-llmが、OpenAI互換エンドポイントに対応した。著者はLM Studioで動かしたQwenを、手元のサーバーで動くDatasette Agentにつなぎ、データへの問い合わせに使った。Datasette Liteのブラウザー内で同じモデルが動くという意味ではなく、回答の正確さも測っていない。

<!-- radar-visual:datasette-lm-studio -->
[![lmstudio-qwen、質問、SQLツールが表示されたDatasette Agent](<https://static.simonwillison.net/static/2026/lmstudio-datasette-agent.webp>)](<https://static.simonwillison.net/static/2026/lmstudio-datasette-agent.webp>)

*上部に選択中のモデル名があり、下に質問とSQLツールの実行過程が見える。この接続例を示す画面で、回答精度の試験ではない。 画像出典：[Simon Willison](https://simonwillison.net/2026/Nov/14/datasette-llm/)。画像をクリックすると原寸で表示します。*
<!-- /radar-visual:datasette-lm-studio -->

### datasette-vega：表やクエリ結果をブラウザー内でグラフにする

<a id="radar-datasette-vega"></a>

- 出典：Simon Willison
- 情報経路：ブログ
- エビデンス区分：著者の説明
- 初出日：2026-11-14
- リンク：https://simonwillison.net/2026/Nov/14/datasette-vega/
- 要約：新しいDatasetteのアルファ版に対応するようプラグインが更新された。Datasette Liteでこの種のJavaScriptプラグインを動かせるようになり、デモもLiteに移った。表やクエリ結果から列を選び、Vega-Liteで描画する。言語モデルとは独立した可視化の仕組みで、グラフの生成をエージェントに頼む必要はない。

<!-- radar-visual:datasette-vega-browser -->
[![Datasette Liteで列を選択し、棒グラフを描く画面](<https://static.simonwillison.net/static/2026/datasette-vega.webp>)](<https://static.simonwillison.net/static/2026/datasette-vega.webp>)

*グラフの種類と、航空会社名・死亡者数に関する列を選ぶ例。列を軸に割り当てる操作の実演で、航空会社の安全性ランキングではない。 画像出典：[Simon Willison](https://simonwillison.net/2026/Nov/14/datasette-vega/)。画像をクリックすると原寸で表示します。*
<!-- /radar-visual:datasette-vega-browser -->

### ByteByteGo：並列処理や独立確認が必要なら複数エージェントに分ける

<a id="radar-agent-control-loops"></a>

- 出典：ByteByteGo
- 情報経路：Newsletter
- エビデンス区分：見解・推論
- 初出日：2026-11-14
- リンク：https://blog.bytebytego.com/p/ep233-kubernetes-explained-for-busy
- 要約：直線的な作業なら、単一エージェントが計画、ツール選択、結果確認を繰り返せる。並列化できる作業や、書き手と切り離した確認が必要な場合は、調整役が担当を振り分ける構成が候補になる。分担には調整コストが加わる。複数構成の精度や費用面の優位を実測で示した記事ではない。

<!-- radar-visual:agent-control-loops -->
[![上は単一エージェントのループ、下は調整役と複数の担当](<https://substack-post-media.s3.amazonaws.com/public/images/5233378c-3c59-40b1-9de2-6515b9d3e928_2484x3002.png>)](<https://substack-post-media.s3.amazonaws.com/public/images/5233378c-3c59-40b1-9de2-6515b9d3e928_2484x3002.png>)

*上は同じエージェントがツール呼び出しを繰り返す構成。下は調査や執筆を別々の担当に分ける構成。実際の費用や精度を比較する図ではない。 画像出典：[ByteByteGo](https://blog.bytebytego.com/p/ep233-kubernetes-explained-for-busy)。画像をクリックすると原寸で表示します。*
<!-- /radar-visual:agent-control-loops -->

## プロダクトと実際の導入

### Plannotator：エージェントに届く前なら返信を取り消して編集できる

<a id="radar-plannotator-undelivered"></a>

- 出典：Plannotator
- 情報経路：GitHub
- エビデンス区分：プロジェクト説明
- 初出日：2026-11-15
- リンク：https://github.com/backnotprop/plannotator/releases/tag/v0.28.65
- 要約：v0.28.65ではエージェントに未配信の返信を取り消し、本文と添付を入力欄に戻せる。修正して送り直すと新しいメッセージになる。待機中の指示を直すための機能で、実行中のタスクや、すでに届いた指示を取り消すものではない。

## 産業とガバナンス

### Grok Imagine：チーム縮小報道から計算資源の配分を考える

<a id="radar-grok-imagine-compute"></a>

- 出典：老范讲故事
- 情報経路：ブログ
- エビデンス区分：見解・推論
- 初出日：2026-11-15
- リンク：https://lukefan.com/2026/11/15/elon-musk-cuts-grok-imagine-team-compute/
- 要約：著者はGrok Imagineのチーム縮小報道を引き、画像・動画生成が他事業と計算資源を取り合っている可能性を指摘した。人員の報道と、計算資源の振り向け先についての推測は別だ。記事には社内での実際の配分を確かめられる資料がなく、サービスが運営を終えたとも判断できない。
