---
title: "AIレーダー日報：2026-11-16"
date: 2026-11-16
category: radar
cadence: daily
radarFormat: 2
lang: ja
coverImage: /images/radar/daily-ai-radar-2026-11-16.ja-infographic.webp
audioUrl: https://pub-6a0341e7aa914973bd3bf62652a20025.r2.dev/audio/radar/daily-ai-radar-2026-11-16.ja.mp3
audioDuration: 1188
audioSize: 9502438
audioNotice: AI生成の音声です。内容へのフィードバックをお寄せください。
draft: false
tags: []
description: "格子の位相補正、回転位置エンコーディング、RAGの切り分け、地図表示と重み編集の限界。"
---

対象期間は2026年11月15日12:00から11月16日12:00まで（日本時間）。

## 今日の重要な変化

- [標準模型の格子構成：格子を細かくして位相補正を求める](#radar-lattice-phase-construction)
- [位置エンコーディング：RoPEが内積に相対位置を反映する仕組み](#radar-rope-relative-shift)
- [RAGの切り分け：検索・文脈・同期・インデックスのどこが原因か](#radar-rag-four-layers)

## 能力とエビデンス

### 標準模型の格子構成：格子を細かくして位相補正を求める

<a id="radar-lattice-phase-construction"></a>

- 出典：Nathaniel Craig／OpenAI
- 情報経路：公式
- エビデンス区分：著者の研究
- 初出日：2026-11-15
- リンク：https://openai.com/index/step-toward-defining-the-standard-model/
- 要約：Nathaniel CraigはGPT‑6 Astraと協力し、格子スケールで場の強さに上限を置いたとき、有限格子間隔で標準模型のフェルミオン測度を与える構成案を提示した。同じ場を段階的に細かい格子で表し、隣り合う格子の比較を積み上げて位相を補正する。著者はAstraが構成と証明を進め、専門家も検討に加わったと述べる。有限格子間隔での反射正値性、現実的な規模のシミュレーション、相互作用を含む完全な理論の連続極限は、この研究で解決していない。

<!-- radar-visual:lattice-phase-arcs -->
[![細分化した格子上で位相のずれを橙の弧、補正を青緑の矢印で表した図](<https://images.ctfassets.net/kftzwdyauwt9/4G0ZXdAgtYGRHIUayuw7AH/1ef11f2013114c08e706289c24b9897d/step-toward-defining-the-standard-model-diagram.png>)](<https://images.ctfassets.net/kftzwdyauwt9/4G0ZXdAgtYGRHIUayuw7AH/1ef11f2013114c08e706289c24b9897d/step-toward-defining-the-standard-model-diagram.png>)

*場が元に戻る一周で生じる位相のずれを橙の弧で示す。隣り合う格子を比較して元の格子の補正量を求め、青緑の矢印でそのずれを打ち消す。数値計算の結果ではない。 画像出典：[Nathaniel Craig／GPT‑6 Astra](https://openai.com/index/step-toward-defining-the-standard-model/)。画像をクリックすると原寸で表示します。*
<!-- /radar-visual:lattice-phase-arcs -->

### 位置エンコーディング：RoPEが内積に相対位置を反映する仕組み

<a id="radar-rope-relative-shift"></a>

- 出典：Sebastian Raschka
- 情報経路：ブログ
- エビデンス区分：著者の説明
- 初出日：2026-11-15
- リンク：https://magazine.sebastianraschka.com/p/understanding-positional-embeddings
- 要約：Raschkaはトークン表現に位置ベクトルを足す方式と、注意機構のクエリとキー（Q・K）を回転させるRoPEを比較した。Q・Kの特徴を固定し、双方の位置を同じだけずらすと、各特徴ペアの回転後の相対角は変わらず、内積も保たれる。これは注意機構に相対位置を伝える原理の説明で、入力全体をずらしても出力が同じという保証でも、長文性能の実測でもない。

<!-- radar-visual:rope-shared-shift -->
[![RoPEで位置2と5を、同じだけずらした位置5と8と比較](<https://substack-post-media.s3.amazonaws.com/public/images/88495cb6-f380-43db-aeab-0f50afbd41b0_2610x888.png>)](<https://substack-post-media.s3.amazonaws.com/public/images/88495cb6-f380-43db-aeab-0f50afbd41b0_2610x888.png>)

*左右とも位置差は3。クエリとキーの特徴を固定すると、同じだけ回した二本のベクトルの相対角は変わらない。 画像出典：[Sebastian Raschka](https://magazine.sebastianraschka.com/p/understanding-positional-embeddings)。画像をクリックすると原寸で表示します。*
<!-- /radar-visual:rope-shared-shift -->

## 構築と運用

### RAGの切り分け：検索・文脈・同期・インデックスのどこが原因か

<a id="radar-rag-four-layers"></a>

- 出典：Daily Dose of Data Science
- 情報経路：Newsletter
- エビデンス区分：著者の説明
- 初出日：2026-11-16
- リンク：https://blog.dailydoseofds.com/p/moving-from-rag-apps-to-rag-systems
- 要約：Daily Doseの講座更新は本番検索のトラブルを四つに分ける。検索の繰り返しはクエリ方針、見つかった証拠が回答に出ないなら文脈の保持、古い文書や権限のずれなら同期と検索時の絞り込み、規模拡大後の再現率や遅延の悪化ならインデックスとキャッシュを確認する。製品比較や処理速度の実測ではなく、問題の切り分け方だ。

### datasette-maplibre：静的な形状を先に見せ、地図は表示時に読み込む

<a id="radar-maplibre-lazy-preview"></a>

- 出典：Simon Willison
- 情報経路：ブログ
- エビデンス区分：著者の説明
- 初出日：2026-11-15
- リンク：https://simonwillison.net/2026/Nov/15/datasette-maplibre/
- 要約：datasette-maplibre 0.1a0はMapLibre GLとOpenFreeMapをDatasetteにつなぐ。著者の例ではGeoJSONの形状をまずSVGで見せ、画面内に入ったときにWebGLのプレビューを読み込む。デモの地図はGeoJSONの形状と緯度・経度の点を同時に表示し、最新のDatasette Liteでも動く。読み込み性能や大規模データの比較は示されていない。

<!-- radar-visual:maplibre-shapes-points -->
[![Datasetteの地図に地域の輪郭、集約した点、選択したレコードの詳細が表示されている](<https://static.simonwillison.net/static/cors-allow/2026/datasette-maplibre.webp>)](<https://static.simonwillison.net/static/cors-allow/2026/datasette-maplibre.webp>)

*色分けされた輪郭と点が同じ地図に重なり、点を選ぶとレコードの詳細が出る。この画面は表示の例であり、遅延読み込みによる性能改善を測ったものではない。 画像出典：[Simon Willison](https://simonwillison.net/2026/Nov/15/datasette-maplibre/)。画像をクリックすると原寸で表示します。*
<!-- /radar-visual:maplibre-shapes-points -->

### Datasette Apps：検索画面から別アプリのレコード詳細へ移動

<a id="radar-datasette-app-links"></a>

- 出典：Simon Willison
- 情報経路：ブログ
- エビデンス区分：著者の説明
- 初出日：2026-11-15
- リンク：https://simonwillison.net/2026/Nov/15/datasette-apps/
- 要約：datasette-apps 0.4a0では、サンドボックス内のアプリがURLのフラグメント（#以降）を読み取れる。利用可能なURLスキームはDatasette Agentにも伝わり、アプリ間のリンクを作る手掛かりになる。著者の例では、一方でレコードを検索し、リンク先の別アプリで詳細を表示する。追加されたのは画面の行き来であり、モデルのデータベース権限を広げるものではない。

### Every：モデル内部を説明できても、好みに合わせて改変できるとは限らない

<a id="radar-model-editing-evidence"></a>

- 出典：Every
- 情報経路：Newsletter
- エビデンス区分：見解・推論
- 初出日：2026-11-15
- リンク：https://every.to/context-window/the-age-of-artisanal-ai-is-coming
- 要約：Everyは二つの研究を取り上げ、モデルを個別に調整しやすくなるかを論じた。Goodfireの11月10日の研究は、公開モデル一種で一部のニューロンの計算パターンを調べた。Cmpndの11月13日の試作は、より強いモデルで小型の意思決定モデル五つの重みを直接編集し、編集に使わなかった選択課題で評価した。前者は内部の働きの説明、後者は特定課題での編集後の評価であり、個人の美意識や一般的な好みを重みに確実に反映できると示したわけではない。

補足資料：[Goodfire](https://www.goodfire.com/research/neurons-as-an-interpretable-basis)；[Cmpnd](https://www.cmpnd.ai/blog/weight-space-programming-dspy.html)
