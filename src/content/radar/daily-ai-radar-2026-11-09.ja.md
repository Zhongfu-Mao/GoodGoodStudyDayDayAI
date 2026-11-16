---
title: "AIレーダー日報：2026-11-09"
date: 2026-11-09
category: radar
cadence: daily
radarFormat: 2
lang: ja
coverImage: /images/radar/daily-ai-radar-2026-11-09.ja-infographic.webp
audioUrl: https://pub-6a0341e7aa914973bd3bf62652a20025.r2.dev/audio/radar/daily-ai-radar-2026-11-09.ja.mp3
audioDuration: 768
audioSize: 6144606
audioNotice: AI生成の音声です。内容へのフィードバックをお寄せください。
draft: false
tags: []
description: "AIが作るSQLite実験から、Agent授業の検証責任とチームの共有看板まで。"
plainSummary: "実装の高速経路、リポジトリーの検証可能性、人が共有する理解を具体的な作業で確かめる。"
---

対象期間は2026年11月8日12:00から11月9日12:00まで（日本時間）。新しい対談と会議報告も過去の背景を保ち、著者の実験を独立再現とは扱わない。

## 今日の重要な変化

- [SQLiteの小実験：言語名より、変わった解析経路を見る](#radar-sqlite-parse-number)
- [CS146Sの対談：Harnessの内部から、検証できるコードベースとレビューへ](#radar-cs146s-engineering)
- [Notionの共有看板：複数Agentの仕事を人が理解し続ける](#radar-thesis-shared-understanding)

## 能力とエビデンス

### SQLiteの解析実験：四つの実装の比較で、C対Rustの一般順位ではない

<a id="radar-sqlite-parse-number"></a>

- 出典：Simon Willison
- 情報経路：ブログ、GitHub
- エビデンス区分：著者の実測
- 初出日：2026-11-08
- リンク：https://simonwillison.net/2026/Nov/8/sqlite-parse-number-c-vs-rust/
- 要約：WillisonはClaude Opus 5.5に、同じ`parse_number()` SQLite拡張の四つの実装と実験報告を作らせた。関数は取り決めに従いカンマ、ドル・ポンド記号、百分率記号を除く。例えば`12.5%`は0.125ではなく12.5になり、汎用の金融データ正規化器ではない。素朴なC版は小数を`strtod()`に渡し、混合データの正味時間は約67ナノ秒/行、二つのRustラッパーは約41〜46ナノ秒だった。C版に条件付きの十進数高速経路を加えると、同じデータで約19ナノ秒になった。報告は2 vCPUのLinux仮想マシンで200万行を処理し、15回中の最速値から基準スキャンを差し引く。累計800万回のファズ比較で不一致なしとも報告する。コード、実験、結論は著者が進めたAI支援作業で、独立再現ではない。特定の解析器・ラッパー・メモリー確保の比較であり、Cには手作業のバッファー、オーバーフロー、`strtod()`のロケール処理なども残る。言語全体の優劣には一般化できない。

<!-- radar-visual:sqlite-parser-paths -->
[![同じ解析規則を四つの実装に渡し、test.pyとfuzz.pyで確認する独自の説明図](/images/radar/2026-11-09-sqlite-parser-paths.webp)](/images/radar/2026-11-09-sqlite-parser-paths.webp)

*独自の説明図。上の二例がparse_numberの規則を定め、四つのディレクトリーは交換可能な実装、下部はテストとファズ比較を示す。百分率記号は除くだけで12.5%は12.5のまま。性能順位や独立再現の結果を示す図ではない。 画像出典：[GoodGoodStudyDayDayAI（基于Simon Willison公开实验 / 公開実験に基づく）](https://simonwillison.net/2026/Nov/8/sqlite-parse-number-c-vs-rust/)。画像をクリックすると原寸で表示します。*
<!-- /radar-visual:sqlite-parser-paths -->

## 構築と運用

### CS146Sの対談：Agentの内部を理解し、コードベースを検証可能にする

<a id="radar-cs146s-engineering"></a>

- 出典：Latent.Space
- 情報経路：ブログ、ポッドキャスト
- エビデンス区分：見解・推論
- 初出日：2026-11-08
- リンク：https://latent.space/p/cs146s/
- 要約：新しい対談でMihail EricがCS146Sの二回目の授業を紹介した。初回は2025年秋で、この期間に初めて始まった授業ではない。15分15秒から18分31秒では、自作コーディングAgentのHarness内部から、コンテキスト設計、ツール設計、スキルと設定、Agentが扱えるコードベース、レビュー、安全性へ進む。Agent-readyとは指示ファイルを置くことだけではなく、明確なサービス境界、文書、結果の検証可能性も含む。生成が速くなるとレビューが新たなボトルネックになり得るため、検証可能性をレビューにも取り込む。その後はCI/CDやイベントで動くバックグラウンドAgent、チーム基盤へ広げる。講者自身、一部はまだ探索中だと述べている。シラバスは検証済みの業界標準ではなく、学習成果や一般的な生産性を示す対照結果もない。

## プロダクトと実際の導入

### Thesisの会議報告：Agentの仕事を共有し、人の理解を保つ

<a id="radar-thesis-shared-understanding"></a>

- 出典：Every
- 情報経路：Newsletter
- エビデンス区分：見解・推論
- 初出日：2026-11-08
- リンク：https://every.to/context-window/what-you-may-have-missed-at-thesis-2027
- 要約：Everyによる11月5日のThesis: 2027会議報告は、NotionのIvan Zhaoの「理解を手放さない」という注意を伝える。各エンジニアが別々のコーディングAgentで変更すると、担当者がコード全体を把握できなくなるおそれがある。NotionのチームはAgentの作業を共有看板に載せ、人が互いの動きを見られるようにしている。これはチームの可視性の話で、単一Botだけがタスク表を更新する状態管理とは異なる層にある。Mike Taylorが人の修正を、新モデルで再実行できる是非判定のチェックへ変える実演も紹介する。前者は作業と責任を見えるようにし、後者は判断を回帰確認の材料として残す。どちらもコードや実際の結果のレビューを代替しない。主催者が書いた講者の経験と実演の報告であり、看板や評価手法による効率向上を示す独立実験ではない。
