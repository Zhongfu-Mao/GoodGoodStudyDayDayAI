---
title: "AIレーダー日報：2026-10-26"
date: 2026-10-26
category: radar
cadence: daily
radarFormat: 2
lang: ja
coverImage: /images/radar/daily-ai-radar-2026-10-26.ja-infographic-imagegen-20261030.webp
audioUrl: /__radar-preview/audio/daily-ai-radar-2026-10-26.ja.mp3
audioDuration: 1381
audioSize: 11045178
audioNotice: "出典・文脈と書き起こしによる内容確認済み。原音の聴取確認は未実施です。"
draft: true
tags: []
plainSummary: "Terraは視覚・PC操作の標準単価を引き下げる。Kimi公開後の議論では順位・タスク費用・利用枠を分ける。Seam Cutterの画像編集とSAPの深掘りも、理解と実際の作用の境界を問う。"
---

対象は10月25日12:00から26日12:00まで（日本時間）。Terraの公式更新とKimi公開後の論評は、モデルの点数・資源消費・実際の成果をどう結び付けるかを別の角度から問う。Seam Cutterは、日常の画像処理にも同じ境界があることを示す。

## 今日の重要な変化

- [Terraは標準API単価を低減。専門的なPC作業では能力・費用・推論設定を合わせて比較する。](#radar-terra-visual-computer)
- [Kimi公開後の議論は、順位・実際のタスク費用・利用枠を分けて問う。](#radar-kimi-evaluation-cost)
- [Seam Cutterは長い画像の中間を除いて接続できる。共有時は削除を示し、元から連続した記録と誤解させない。](#radar-seam-cutter-tool)


## 能力とエビデンス

### GPT-6.1 Terra：視覚とPC操作を、より低い標準単価で扱う

<a id="radar-terra-visual-computer"></a>

- 出典：OpenAI
- 情報経路：公式
- エビデンス区分：公式発表
- 初出日：2026-10-26
- 時刻の注記：公式RSSの公開時刻は26日09:00（日本時間）。
- リンク：https://openai.com/index/introducing-gpt-6-1-terra
- 要約：GPT-6.1 Terraは視覚理解、PC操作、文章作成を低コストの選択肢にまとめる。標準APIは100万Token当たり入力1ドル、キャッシュ入力0.05ドル、出力5ドル。公式説明ではGPT-5.6 TerraとGPT-6.1 Solより標準単価が50%低い。ただし、単価が下がっても全タスクの総費用が半分になるとは限らず、使用量、ツール待ち、再試行、確認も数える必要がある。

公式は専門的なPC作業を測るAgents’ Last Examで、medium設定がGPT-5.6 Terraより15ポイント高く、タスク費用は約3分の1と報告した。建築図からの3Dモデル作成、映像をショットごとに確認するタイムコード記録などを含み、単独の画像質問応答ではない。OSWorld 2.1も複数段階のデスクトップ作業を評価する。モデルは適切なツールと権限の範囲で動く必要がある。

別の二つの数字は分けて読む。内部の誤りを誘いやすい質問集では、low設定の誤答率が53.6%から16.7%へ低下。Terminal-Bench 4.0ではmax設定でコマンドラインのソフトウェア課題の50.3%を解き、前世代の公表値は21.5%だった。前者は全回答の誤答確率ではなく、後者も全開発作業を代表しない。最も複雑な開発には引き続きSol/Astraを推奨している。いずれも企業の報告であり、自分の用途でも確かめたい。

### Kimi公開後の議論：ベンチマーク、タスク費用、利用枠を分ける

<a id="radar-kimi-evaluation-cost"></a>

- 出典：老范讲故事
- 情報経路：ブログ
- エビデンス区分：見解・推論
- 初出日：2026-10-26
- リンク：https://lukefan.com/2026/10/26/kimi-k31-pr-backlash-ipo-gamble/
- 要約：老范はKimi K3.1 Proの評価結果の示し方、宣伝を巡る議論、利用枠の体験を批判した。24日の製品・重み公開予定に対する新しい問いは、順位、Token単価、実際に一件を完了する費用が、同じ「費用対効果」を示すのかという点だ。

最高推論設定、異なるハードウェア、他の公開ランキングから引用した競合値を、条件を省いて同一試験の比較として扱うべきではない。Token単価が低くても、長い推論、ツール呼出し、再試行で利点が失われる場合がある。残量のパーセント表示だけでは、一件のタスクが何に資源を使ったかも分からない。利用者には、課題・推論設定・検収条件を固定し、完了率、総費用、所要時間、制限に達した状況を記録する方が役立つ。

宣伝の手配、資金面の圧力、会社の動機については著者の論評であり、この文章だけで独立に確認された事実とは扱えない。個人の契約利用も統制された性能試験ではない。公開後の評価方法を考える資料であり、議論があること自体を性能への反証にしない。

## プロダクトと実際の導入

### Seam Cutter：長い画像の中間を切ると、証拠の意味も変わる

<a id="radar-seam-cutter-tool"></a>

- 出典：Simon Willison
- 情報経路：ブログ
- エビデンス区分：著者の説明
- 初出日：2026-10-25
- リンク：https://simonwillison.net/2026/Oct/25/seam-cutter/
- 要約：Simonが自身のプロジェクト紹介で説明するのは、画像を横または縦に切り、両側をずらして途中の部分を除く、用途の狭いツールだ。著者はiPhoneの長い結合スクリーンショットから、書き起こしの無関係なプロンプトを取り除きたかったという。

通常の矩形切り抜きと異なり、元は離れていた二つの部分を接続できる。特定の作業を助ける道具で、画像生成や一般的な視覚能力の実演ではない。編集した会話の画像を共有するときは削除を示し、隣接する段落を元から連続した記録として扱わない。

<!-- radar-visual:seam-cutter-tool -->
[![長い画像の途中を除き上下をつなぐ仕組みの模式図](/images/radar/daily-ai-radar-2026-10-26-seam-cutter-tool.webp)](/images/radar/daily-ai-radar-2026-10-26-seam-cutter-tool.webp)

*左の長い画像から中央の灰色部分を除き、上下を動かして右の短い画像にする。仕組みの説明で実際の画面ではない。切り取った後の画像は完全な原記録ではない。 画像出典：[AI Radar illustration / Simon Willison](https://simonwillison.net/2026/Oct/25/seam-cutter/)。画像をクリックすると原寸で表示します。*
<!-- /radar-visual:seam-cutter-tool -->

## 深掘り

### SAPインタビュー：意味の理解と権限制御を分ける

<a id="radar-business-context-interview"></a>

- テーマ：プロダクトと実際の導入
- 出典：The Rundown AI / SAP
- 情報経路：Newsletter
- エビデンス区分：公式発表
- 初出日：2026-10-25
- リンク：https://www.therundown.ai/articles/sap-s-philipp-herzig-on-ai-built-for-business-data
- 要約：SAPとの提携インタビューであり、独立した製品比較ではない。ただしCTOのPhilipp Herzigは、企業データの意味を理解することと、権限を持って行動することを明確に分けている。

経費のフォームを生成することと、40か国の税制、権限、精算を含めて運用することは違う。Knowledge Graphは業務のオブジェクト、関係、ルールの地図を与え、例えば購買側と財務側の同じ取引先を対応させる。ルールが分かっても執行済みにはならず、行動はユーザー権限と必要な人の承認に従う。

Company Memoryは例外を承認した理由、権限、結果を残す。一度うまくいった例外を自動的に新ルールにせず、業務責任者が条件を見直す。文書を無差別に増やすより、判断の理由と適用範囲を残す設計だ。

費用もTokenだけではない。単純な要約まで最強モデルへ送らず、複雑さ、リスク、文脈で振り分ける。資産集約型の企業では、文章より需要予測、保守、売掛金の回収が重要な場合もある。表形式モデルは請求日、期限、支払日などで遅延を予測し、重要な特徴と類似例を財務担当者に示す。回収期間50日から45日という数字は効果を説明する例で、達成済みの業績ではない。特徴の説明も、支払条件の変更が結果を生む因果関係の証明ではない。

<a id="radar-personal-shared-agent"></a>

関連資料：Everyの25日の[週次まとめ](https://every.to/context-window/anthropic-s-duet-gets-to-work)は、[21日の共有Agentの接続・権限設計](/ja/radar/daily-ai-radar-2026-10-21/#radar-replaced-personal-agents)と[22日のDuetの個人利用](/ja/radar/daily-ai-radar-2026-10-22/#radar-vibe-check-duet)を振り返る。比較の詳細は各記事へ。

[SimonによるTerraの描画とタスク費用の実測は27日の追記へ。](/ja/radar/daily-ai-radar-2026-10-27/#radar-terra-visual-computer)

*時刻の注記：対象は10月25日12:00から26日12:00まで（日本時間）。SAPの協業記事は25日付のみ確認でき、時刻は未確認のため深掘りとする。*
