---
title: "AIレーダー日報：2026-11-14"
date: 2026-11-14
category: radar
cadence: daily
radarFormat: 2
lang: ja
coverImage: /images/radar/daily-ai-radar-2026-11-14.ja-infographic.webp
audioUrl: https://pub-6a0341e7aa914973bd3bf62652a20025.r2.dev/audio/radar/daily-ai-radar-2026-11-14.ja.mp3
audioDuration: 716
audioSize: 5731401
audioNotice: AI生成の音声です。内容へのフィードバックをお寄せください。
draft: false
tags: []
description: "モデル評価、ローカル推論、エージェントの実行と承認を分けて考える。"
---

対象期間は2026年11月13日12:00から11月14日12:00まで（日本時間）。

## 今日の重要な変化

- [XYBench：よい回答を選べても、自力で書けるとは限らない](#radar-xybench)
- [llama.cppとggml：互換性が壊れる変更をメジャー番号で示す](#radar-llama-cpp-v1)
- [ChatGPT Wallet：購入ごとに確認し、決済ネットワークのトークンで支払う](#radar-wallet-per-purchase)

## 能力とエビデンス

### XYBench：よい回答を選べても、自力で書けるとは限らない

<a id="radar-xybench"></a>

- 出典：Ai2／XYBench
- 情報経路：ブログ
- エビデンス区分：著者の研究
- 初出日：2026-11-13
- リンク：https://huggingface.co/blog/allenai/xybench
- 要約：Ai2と共同研究者は8,115問を公開した。実際の目的を達成する方法が含まれるか、それを回答の中心に置くか、誤った前提に気づくかを別々に測る。Stack Overflowの部分集合では、6モデルが二択で目的に沿った回答を選んだ割合は71〜84%。そのうち5モデルが自由回答で実際の目的を中心に据えた割合は35〜41%だった。二つの出題形式の比較であり、実利用での成功率ではない。主に一往復の評価で、生成された設問も含む。

<!-- radar-visual:xybench-format-comparison -->
[![XYBenchで二択と自由回答を比較した棒グラフ](<https://www.datocms-assets.com/64837/1794336134-xybench-picking-vs-writing.png>)](<https://www.datocms-assets.com/64837/1794336134-xybench-picking-vs-writing.png>)

*対象はStack Overflowの部分集合。左は二つから目的に沿った回答を選ぶ課題で、右は自由回答で実際の目的を中心に置く課題。出題条件が異なる。 画像出典：[Ai2／XYBench](https://huggingface.co/blog/allenai/xybench)。画像をクリックすると原寸で表示します。*
<!-- /radar-visual:xybench-format-comparison -->

## 構築と運用

### llama.cppとggml：互換性が壊れる変更をメジャー番号で示す

<a id="radar-llama-cpp-v1"></a>

- 出典：ggml-org
- 情報経路：ブログ
- エビデンス区分：プロジェクト説明
- 初出日：2026-11-13
- リンク：https://huggingface.co/blog/ggml-org/llama-cpp-v1
- 要約：プロジェクトは推論ライブラリlibllamaとテンソルライブラリlibggmlをv1.0.0にした。公開Cインターフェースを壊す変更ではメジャー番号、後方互換の機能・バックエンド・モデル対応やAPI追加ではマイナー番号、インターフェースに変更のない修正ではパッチ番号を上げる。APIとABIの非互換を明示する方針だ。下流の統合先が更新を判断するための約束で、互換性が永久に維持されることや高速化を意味しない。

### SimReady：アセット検証と把持・配置タスクの成否は別

<a id="radar-simready-assembly"></a>

- 出典：NVIDIA
- 情報経路：ブログ
- エビデンス区分：プロジェクト説明
- 初出日：2026-11-13
- リンク：https://huggingface.co/blog/nvidia/simready-assets-robot-pick-and-place
- 要約：NVIDIAはアーム、グリッパー、飲料缶を使ってIsaac Simで把持・配置シーンを組み立てた。アセットには用途に応じて衝突、質量、関節や駆動の設定と、プロファイルに沿った検証証拠が付く。一方、作業台、配置、制御はシーン側で補う。見た目だけではなく関節設定、小さな動き、接触を順に確認してから全体を動かす。シミュレーションの手順であり、実機での実証ではない。

<!-- radar-visual:simready-asset-scene-boundary -->
[![SimReadyのアセットに含まれる物理設定とシーン側で追加する要素の比較](<https://cdn-uploads.huggingface.co/production/uploads/6abfe9e7d7cf09a9b38ef308/J7YL_C3mUh7MWUNJ_pVtN.png>)](<https://cdn-uploads.huggingface.co/production/uploads/6abfe9e7d7cf09a9b38ef308/J7YL_C3mUh7MWUNJ_pVtN.png>)

*左はこの例のアーム、グリッパー、缶と物理設定。右は作業台、配置、制御など、シーン側で加えるもの。アセット検証とタスク全体の試験は別だ。 画像出典：[NVIDIA](https://huggingface.co/blog/nvidia/simready-assets-robot-pick-and-place)。画像をクリックすると原寸で表示します。*
<!-- /radar-visual:simready-asset-scene-boundary -->

### OpenWorker Harness：ファイル整理でもツールの能力と承認を分ける

<a id="radar-openworker-harness"></a>

- 出典：The Batch／Andrew Ng
- 情報経路：Newsletter、GitHub
- エビデンス区分：著者の説明
- 初出日：2026-11-13
- リンク：https://www.deeplearning.ai/the-batch/issue-379
- 要約：Andrew NgはThe BatchでオープンソースのHarness SDKを紹介した。デモのファイル整理では一覧と中身をモデルに見せ、操作先をデモ用ディレクトリに絞り、ディレクトリ作成とファイル移動はそれぞれ確認を求める。文脈管理、入出力のチェック、権限、承認、サンドボックスは実行層の役割として挙げる。これはサンプルが要求する境界で、SDKを使う任意のアプリに同じ隔離が自動で付くわけではない。

プロジェクト：[OpenWorker Harness SDK](https://github.com/andrewyng/openworker/tree/main/harness)

### Datasetteの地図プラグイン：地図タイルの参照元ヘッダーを個別設定

<a id="radar-datasette-map-referrer"></a>

- 出典：Simon Willison
- 情報経路：ブログ
- エビデンス区分：著者の説明
- 初出日：2026-11-13
- リンク：https://simonwillison.net/2026/Nov/13/datasette-cluster-map
- 要約：cluster-map 0.19はDatasette 1.0a42に対応し、新版datasette-leafletに依存する。開発者によると、テーブルページの既定値はno-referrerだが、OpenStreetMapのホストするタイルでは参照元が求められる。新版はタイル要求にstrict-origin-when-cross-originを個別指定し、クロスオリジンでページのパス全体ではなくサイトのオリジンを渡せる。ページ全体の既定値を緩める変更ではない。

補足：[datasette-leaflet 0.3](https://simonwillison.net/2026/Nov/13/datasette-leaflet)

<!-- radar-visual:datasette-faceted-map -->
[![国、所有者、燃料を絞り込み、地図に発電所をまとめて表示するDatasette](<https://static.simonwillison.net/static/2026/power-plants-pge.webp>)](<https://static.simonwillison.net/static/2026/power-plants-pge.webp>)

*上の絞り込み項目でデータを選び、地図の数字付きの丸が地点のまとまりを示す。表示例であり、タイル要求のヘッダー自体は写っていない。 画像出典：[Simon Willison](https://simonwillison.net/2026/Nov/13/datasette-cluster-map)。画像をクリックすると原寸で表示します。*
<!-- /radar-visual:datasette-faceted-map -->

## プロダクトと実際の導入

### Shield：APIのない旧ポータルでも一部の操作をエージェントへ

<a id="radar-shield-browser-work"></a>

- 出典：OpenAI／Shield
- 情報経路：公式
- エビデンス区分：公式発表
- 初出日：2026-11-13
- リンク：https://openai.com/business/customer-stories/shield
- 要約：OpenAIの顧客事例によると、ShieldのForgeはチケット、端末、ソフトウェアライセンス用の旧ポータルで、対応済みの手順をブラウザーエージェントに渡す。技術者が自動実行できる操作と承認が要る操作を決める。ShieldはITサービス提供者全体で月に数千回動くとするが、電話、現地対応、リモートデスクトップは引き続き人が関わる。稼働中の限定された手順の事例で、任意の管理画面や高権限操作の安全性を示すものではない。

### PhotoCraft：試作の速さと既存ワークフローを置き換えられるかは別

<a id="radar-artcraft-photocraft"></a>

- 出典：Latent.Space／ArtCraft
- 情報経路：ブログ
- エビデンス区分：著者の説明
- 初出日：2026-11-13
- リンク：https://latent.space/p/artcraft
- 要約：Latent.SpaceはAI Engineer Code SummitでのArtCraftの講演を報じた。チームはAIを使ってRust製のPhotoCraftを開発し、CLIとMCPにも対応させた。似た画面や操作の試作は短期間でできたが、講演でもプロジェクトの評価でも完全互換とはしていない。試作が速くても、実務ではファイルの読み込み、レイヤー、普段の編集手順を個別に確かめる必要がある。

## 産業とガバナンス

### ChatGPT Wallet：購入ごとに確認し、決済ネットワークのトークンで支払う

<a id="radar-wallet-per-purchase"></a>

- 出典：OpenAI
- 情報経路：公式
- エビデンス区分：公式発表
- 初出日：2026-11-13
- リンク：https://openai.com/index/introducing-chatgpt-wallet
- 要約：OpenAIはChatGPT Walletを発表し、米国の18歳以上のChatGPT Pro利用者で、対象となる米国発行カードを持つ人にdotsを通じて提供するとした。現行の手順では商品、総額、選んだカードを購入ごとに確認し、セキュリティ認証で承認する。その後に決済ネットワークが元のカード情報の代わりになるトークンを提供し、エージェントと加盟店には元のカードの詳細を渡さない。上限やカテゴリによる事前承認は構想段階で、今回の提供機能ではない。実際に使えるかはアカウントや加盟店にもよる。
